/**
 * TrustTransport routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError, ValidationError, ForbiddenError, UnauthorizedError } from "../errors";
import { logAdminAction } from "./shared";
import { z } from "zod";
import {
  insertTrusttransportProfileSchema,
  insertTrusttransportRideRequestSchema,
  insertTrusttransportAnnouncementSchema,
  insertNpsResponseSchema,
  type InsertTrusttransportRideRequest,
} from "@shared/schema";

export function registerTrustTransportRoutes(app: Express) {
  // TRUSTTRANSPORT ROUTES

  // TrustTransport Announcement routes (public)
  app.get('/api/trusttransport/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveTrusttransportAnnouncements(),
      'getActiveTrusttransportAnnouncements'
    );
    res.json(announcements);
  }));

  // TrustTransport Profile routes
  app.get('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForTrusttransportProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertTrusttransportProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createTrusttransportProfile(validatedData),
      'createTrusttransportProfile'
    );
    res.json(profile);
  }));

  app.put('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateTrusttransportProfile(userId, req.body),
      'updateTrusttransportProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteTrusttransportProfile(userId, reason),
      'deleteTrusttransportProfile'
    );
    res.json({ message: "TrustTransport profile deleted successfully" });
  }));

  // TrustTransport Ride Request routes (simplified model)
  
  // Create new ride request (as a rider) - MUST come before :id routes
  app.post('/api/trusttransport/ride-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) {
      throw new UnauthorizedError("User ID not found in authentication token");
    }
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    if (!profile || !profile.isRider) {
      throw new ValidationError("You must be a rider to create ride requests");
    }
    const validatedData = validateWithZod(insertTrusttransportRideRequestSchema, req.body, 'Invalid ride request data');
    // Add riderId after validation since it's omitted from the schema
    const requestData = {
      ...validatedData,
      riderId: userId,
    } as InsertTrusttransportRideRequest & { riderId: string };
    const request = await withDatabaseErrorHandling(
      () => storage.createTrusttransportRideRequest(requestData),
      'createTrusttransportRideRequest'
    );
    res.json(request);
  }));
  
  // Get open ride requests (for drivers to browse)
  app.get('/api/trusttransport/ride-requests/open', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getOpenTrusttransportRideRequests(),
      'getOpenTrusttransportRideRequests'
    );
    res.json(requests);
  }));

  // Get user's ride requests (as a rider)
  app.get('/api/trusttransport/ride-requests/my-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requests = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestsByRider(userId),
      'getTrusttransportRideRequestsByRider'
    );
    res.json(requests);
  }));

  // Get requests claimed by driver
  app.get('/api/trusttransport/ride-requests/my-claimed', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    if (!profile) {
      console.warn(`[TrustTransport] Profile not found for user ${userId} in /api/trusttransport/ride-requests/my-claimed`);
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    if (!profile.isDriver) {
      console.warn(`[TrustTransport] User ${userId} is not a driver in /api/trusttransport/ride-requests/my-claimed`);
      return res.status(404).json({ message: "Driver profile not found. Please set up your driver profile first." });
    }
    const requests = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestsByDriver(profile.id),
      'getTrusttransportRideRequestsByDriver'
    );
    res.json(requests);
  }));

  // Get single ride request
  app.get('/api/trusttransport/ride-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestById(req.params.id),
      'getTrusttransportRideRequestById'
    );
    if (!request) {
      throw new NotFoundError('Ride request', req.params.id);
    }
    res.json(request);
  }));


  // Claim a ride request (as a driver)
  app.post('/api/trusttransport/ride-requests/:id/claim', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { driverMessage } = req.body;
    const request = await withDatabaseErrorHandling(
      () => storage.claimTrusttransportRideRequest(req.params.id, userId, driverMessage),
      'claimTrusttransportRideRequest'
    );
    res.json(request);
  }));

  // Update ride request (rider can update their request, driver can update claimed request)
  app.put('/api/trusttransport/ride-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestById(req.params.id),
      'getTrusttransportRideRequestById'
    );
    if (!request) {
      throw new NotFoundError('Ride request', req.params.id);
    }
    
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    
    // Check authorization
    const isRider = request.riderId === userId;
    const isDriver = request.driverId === profile?.id && profile?.isDriver;
    
    if (!isRider && !isDriver) {
      throw new ForbiddenError("Unauthorized to update this ride request");
    }
    
    // Riders can only update open requests
    if (isRider && request.status !== 'open') {
      throw new ValidationError("Cannot update a request that has been claimed");
    }
    
    const validatedData = validateWithZod(insertTrusttransportRideRequestSchema.partial(), req.body, 'Invalid ride request data');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateTrusttransportRideRequest(req.params.id, validatedData),
      'updateTrusttransportRideRequest'
    );
    res.json(updated);
  }));

  // Cancel ride request (rider or driver can cancel)
  app.post('/api/trusttransport/ride-requests/:id/cancel', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.cancelTrusttransportRideRequest(req.params.id, userId),
      'cancelTrusttransportRideRequest'
    );
    res.json(request);
  }));

  // TrustTransport Admin Announcement routes
  app.get('/api/trusttransport/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllTrusttransportAnnouncements(),
      'getAllTrusttransportAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/trusttransport/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertTrusttransportAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createTrusttransportAnnouncement(validatedData),
      'createTrusttransportAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_trusttransport_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/trusttransport/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertTrusttransportAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertTrusttransportAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateTrusttransportAnnouncement(req.params.id, validatedData),
      'updateTrusttransportAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_trusttransport_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/trusttransport/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateTrusttransportAnnouncement(req.params.id),
      'deactivateTrusttransportAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_trusttransport_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // NPS (Net Promoter Score) Routes

  // Check if user should see the NPS survey
  app.get('/api/nps/should-show', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const lastResponse = await withDatabaseErrorHandling(
      () => storage.getUserLastNpsResponse(userId),
      'getUserLastNpsResponse'
    );
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if user has already responded this month
    const hasRespondedThisMonth = lastResponse?.responseMonth === currentMonth;
    
    res.json({
      shouldShow: !hasRespondedThisMonth,
      lastResponseMonth: lastResponse?.responseMonth || null,
    });
  }));

  // Submit NPS response
  app.post('/api/nps/response', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const now = new Date();
    const responseMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const validatedData = validateWithZod(insertNpsResponseSchema, {
      ...req.body,
      userId,
      responseMonth,
    }, 'Invalid NPS response data');
    
    const response = await withDatabaseErrorHandling(
      () => storage.createNpsResponse(validatedData),
      'createNpsResponse'
    );
    res.json(response);
  }));

  // Get NPS responses for admin (Weekly Performance dashboard)
  app.get('/api/admin/nps-responses', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const weekStart = req.query.weekStart ? new Date(req.query.weekStart as string) : undefined;
    const weekEnd = req.query.weekEnd ? new Date(req.query.weekEnd as string) : undefined;
    
    let responses;
    if (weekStart && weekEnd) {
      responses = await withDatabaseErrorHandling(
        () => storage.getNpsResponsesForWeek(weekStart, weekEnd),
        'getNpsResponsesForWeek'
      );
    } else {
      responses = await withDatabaseErrorHandling(
        () => storage.getAllNpsResponses(),
        'getAllNpsResponses'
      );
    }
    
    res.json(responses);
  }));


}
