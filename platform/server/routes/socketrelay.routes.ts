/**
 * SocketRelay routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError, ValidationError, ForbiddenError } from "../errors";
import { logAdminAction } from "./shared";
import { isLikelyBot, addAntiScrapingDelay, rotateDisplayOrder } from "../dataObfuscation";
import { z } from "zod";
import {
  insertSocketrelayRequestSchema,
  insertSocketrelayFulfillmentSchema,
  insertSocketrelayMessageSchema,
  insertSocketrelayProfileSchema,
  insertSocketrelayAnnouncementSchema,
  insertDirectoryAnnouncementSchema,
} from "@shared/schema";

export function registerSocketRelayRoutes(app: Express) {
  // SocketRelay Routes

  // SocketRelay Profile routes
  app.get('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getSocketrelayProfile(userId),
      'getSocketrelayProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForSocketrelayProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSocketrelayProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');

    const profile = await withDatabaseErrorHandling(
      () => storage.createSocketrelayProfile(validatedData),
      'createSocketrelayProfile'
    );
    res.json(profile);
  }));

  app.put('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateSocketrelayProfile(userId, req.body),
      'updateSocketrelayProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteSocketrelayProfile(userId, reason),
      'deleteSocketrelayProfile'
    );
    res.json({ message: "SocketRelay profile deleted successfully" });
  }));

  // Get all active requests
  app.get('/api/socketrelay/requests', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getActiveSocketrelayRequests(),
      'getActiveSocketrelayRequests'
    );
    res.json(requests);
  }));

  // Get single request by ID
  app.get('/api/socketrelay/requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(req.params.id),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', req.params.id);
    }
    res.json(request);
  }));

  // Get user's own requests
  app.get('/api/socketrelay/my-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requests = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestsByUser(userId),
      'getSocketrelayRequestsByUser'
    );
    res.json(requests);
  }));

  // Create a new request
  app.post('/api/socketrelay/requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validated = validateWithZod(insertSocketrelayRequestSchema, req.body, 'Invalid request data');
    
    const request = await withDatabaseErrorHandling(
      () => storage.createSocketrelayRequest(userId, validated.description, validated.isPublic || false),
      'createSocketrelayRequest'
    );
    res.json(request);
  }));

  // Update an existing request
  app.put('/api/socketrelay/requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requestId = req.params.id;
    const validated = validateWithZod(insertSocketrelayRequestSchema, req.body, 'Invalid request data');
    
    const request = await withDatabaseErrorHandling(
      () => storage.updateSocketrelayRequest(requestId, userId, validated.description, validated.isPublic || false),
      'updateSocketrelayRequest'
    );
    res.json(request);
  }));

  // Public SocketRelay request routes (no auth required, with rate limiting)
  app.get('/api/socketrelay/public', publicListingLimiter, asyncHandler(async (req, res) => {
    // Add delay for suspicious requests
    const isSuspicious = (req as any).isSuspicious || false;
    const userAgent = req.headers['user-agent'];
    const accept = req.headers['accept'];
    const acceptLang = req.headers['accept-language'];
    const likelyBot = isLikelyBot(userAgent, accept, acceptLang);
    
    if (isSuspicious || likelyBot) {
      await addAntiScrapingDelay(true, 200, 800);
    } else {
      await addAntiScrapingDelay(false, 50, 200);
    }

    const requests = await withDatabaseErrorHandling(
      () => storage.listPublicSocketrelayRequests(),
      'listPublicSocketrelayRequests'
    );
    
    // Enrich requests with creator info
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      const creatorProfile = await withDatabaseErrorHandling(
        () => storage.getSocketrelayProfile(request.userId),
        'getSocketrelayProfile'
      );
      const creator = await withDatabaseErrorHandling(
        () => storage.getUser(request.userId),
        'getUser'
      );

      // Build a display name from the creator's first and last name, if available
      let displayName: string | null = null;
      if (creator) {
        const firstName = creator.firstName?.trim();
        const lastName = creator.lastName?.trim();
        if (firstName && lastName) {
          displayName = `${firstName} ${lastName}`;
        } else if (firstName) {
          displayName = firstName;
        }
      }
      
      return {
        ...request,
        creatorProfile: creatorProfile ? {
          city: creatorProfile.city,
          state: creatorProfile.state,
          country: creatorProfile.country,
        } : null,
        creator: creator ? {
          displayName,
          firstName: creator.firstName,
          lastName: creator.lastName,
          isVerified: creator.isVerified,
        } : null,
      };
    }));
    
    // Rotate display order to make scraping harder
    const rotated = rotateDisplayOrder(enrichedRequests);
    
    res.json(rotated);
  }));

  app.get('/api/socketrelay/public/:id', publicItemLimiter, asyncHandler(async (req, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getPublicSocketrelayRequestById(req.params.id),
      'getPublicSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', req.params.id);
    }
    
    // Get creator profile for location info
    const creatorProfile = await withDatabaseErrorHandling(
      () => storage.getSocketrelayProfile(request.userId),
      'getSocketrelayProfile'
    );
    const userId = request.userId;
    const creator = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUser'
    );
    
    // Build display name from firstName and lastName
    let displayName: string | null = null;
    if (creator) {
      if (creator.firstName && creator.lastName) {
        displayName = `${creator.firstName} ${creator.lastName}`;
      } else if (creator.firstName) {
        displayName = creator.firstName;
      }
    }
    
    res.json({
      ...request,
      creatorProfile: creatorProfile ? {
        city: creatorProfile.city,
        state: creatorProfile.state,
        country: creatorProfile.country,
      } : null,
      creator: creator ? {
        displayName,
        firstName: creator.firstName,
        lastName: creator.lastName,
        isVerified: creator.isVerified,
      } : null,
    });
  }));

  // Fulfill a request (create fulfillment)
  app.post('/api/socketrelay/requests/:id/fulfill', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requestId = req.params.id;

    // Check if request exists and is active
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', requestId);
    }

    if (request.status !== 'active') {
      throw new ValidationError("Request is not active");
    }

    // Check if already expired
    if (new Date(request.expiresAt) < new Date()) {
      throw new ValidationError("Request has expired");
    }

    // Don't allow users to fulfill their own requests
    if (request.userId === userId) {
      throw new ValidationError("You cannot fulfill your own request");
    }

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.createSocketrelayFulfillment(requestId, userId),
      'createSocketrelayFulfillment'
    );
    res.json(fulfillment);
  }));

  // Repost an expired request
  app.post('/api/socketrelay/requests/:id/repost', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requestId = req.params.id;

    const request = await withDatabaseErrorHandling(
      () => storage.repostSocketrelayRequest(requestId, userId),
      'repostSocketrelayRequest'
    );
    res.json(request);
  }));

  // Get fulfillment by ID (with request data)
  app.get('/api/socketrelay/fulfillments/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(req.params.id),
      'getSocketrelayFulfillmentById'
    );
    
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', req.params.id);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    res.json({ fulfillment, request });
  }));

  // Get user's fulfillments (where they are the fulfiller)
  app.get('/api/socketrelay/my-fulfillments', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillments = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentsByUser(userId),
      'getSocketrelayFulfillmentsByUser'
    );
    res.json(fulfillments);
  }));

  // Close a fulfillment
  app.post('/api/socketrelay/fulfillments/:id/close', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { status } = req.body; // completed_success or completed_failure

    if (!status || !['completed_success', 'completed_failure', 'cancelled'].includes(status)) {
      throw new ValidationError("Invalid status");
    }

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(req.params.id),
      'getSocketrelayFulfillmentById'
    );
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', req.params.id);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.closeSocketrelayFulfillment(req.params.id, userId, status),
      'closeSocketrelayFulfillment'
    );
    
    // Update request status to closed
    await withDatabaseErrorHandling(
      () => storage.updateSocketrelayRequestStatus(request.id, 'closed'),
      'updateSocketrelayRequestStatus'
    );

    res.json(updated);
  }));

  // Get messages for a fulfillment
  app.get('/api/socketrelay/fulfillments/:id/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillmentId = req.params.id;

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(fulfillmentId),
      'getSocketrelayFulfillmentById'
    );
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', fulfillmentId);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const messages = await withDatabaseErrorHandling(
      () => storage.getSocketrelayMessagesByFulfillment(fulfillmentId),
      'getSocketrelayMessagesByFulfillment'
    );
    res.json(messages);
  }));

  // Send a message in a fulfillment chat
  app.post('/api/socketrelay/fulfillments/:id/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillmentId = req.params.id;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError("Message content is required");
    }

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(fulfillmentId),
      'getSocketrelayFulfillmentById'
    );
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', fulfillmentId);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const message = await withDatabaseErrorHandling(
      () => storage.createSocketrelayMessage({
        fulfillmentId,
        senderId: userId,
        content: content.trim(),
      }),
      'createSocketrelayMessage'
    );

    res.json(message);
  }));

  // SocketRelay Admin Routes
  app.get('/api/socketrelay/admin/requests', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getAllSocketrelayRequests(),
      'getAllSocketrelayRequests'
    );
    res.json(requests);
  }));

  app.get('/api/socketrelay/admin/fulfillments', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const fulfillments = await withDatabaseErrorHandling(
      () => storage.getAllSocketrelayFulfillments(),
      'getAllSocketrelayFulfillments'
    );
    res.json(fulfillments);
  }));

  app.delete('/api/socketrelay/admin/requests/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req, res) => {
    await withDatabaseErrorHandling(
      () => storage.deleteSocketrelayRequest(req.params.id),
      'deleteSocketrelayRequest'
    );
    res.json({ message: "Request deleted successfully" });
  }));

  // SocketRelay Announcement routes
  app.get('/api/socketrelay/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveSocketrelayAnnouncements(),
      'getActiveSocketrelayAnnouncements'
    );
    res.json(announcements);
  }));

  app.get('/api/socketrelay/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllSocketrelayAnnouncements(),
      'getAllSocketrelayAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/socketrelay/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSocketrelayAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createSocketrelayAnnouncement(validatedData),
      'createSocketrelayAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_socketrelay_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/socketrelay/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSocketrelayAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertSocketrelayAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateSocketrelayAnnouncement(req.params.id, validatedData),
      'updateSocketrelayAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_socketrelay_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/socketrelay/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateSocketrelayAnnouncement(req.params.id),
      'deactivateSocketrelayAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_socketrelay_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // Directory Announcement routes
  app.get('/api/directory/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveDirectoryAnnouncements(),
      'getActiveDirectoryAnnouncements'
    );
    res.json(announcements);
  }));

  app.get('/api/directory/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllDirectoryAnnouncements(),
      'getAllDirectoryAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/directory/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertDirectoryAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createDirectoryAnnouncement(validatedData),
      'createDirectoryAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_directory_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/directory/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertDirectoryAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertDirectoryAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateDirectoryAnnouncement(req.params.id, validatedData),
      'updateDirectoryAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_directory_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/directory/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateDirectoryAnnouncement(req.params.id),
      'deactivateDirectoryAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_directory_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));


}
