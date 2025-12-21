/**
 * Lighthouse routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError } from "../errors";
import { logAdminAction } from "./shared";
import { z } from "zod";
import {
  insertLighthouseProfileSchema,
    insertLighthousePropertySchema,
    insertLighthouseMatchSchema,
    insertLighthouseAnnouncementSchema,
} from "@shared/schema";

export function registerLighthouseRoutes(app: Express) {
  // LIGHTHOUSE APP ROUTES

  // Profile routes
  app.get('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForLighthouseProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    
    // Check if profile already exists
    const existingProfile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    
    // Get user's firstName to auto-populate displayName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserForLighthouseProfile'
    );
    const userFirstName = (user?.firstName && user.firstName.trim()) || "";
    
    // Validate and create profile - auto-populate displayName from firstName
    // Database requires display_name to be NOT NULL, so use firstName or fallback
    const validatedData = validateWithZod(insertLighthouseProfileSchema, {
      ...req.body,
      userId,
      displayName: userFirstName || "User", // Auto-populate from user's firstName, fallback to "User"
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createLighthouseProfile(validatedData),
      'createLighthouseProfile'
    );
    
    res.json(profile);
  }));

  app.put('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Get user's firstName to auto-populate displayName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserForLighthouseProfileUpdate'
    );
    const userFirstName = (user?.firstName && user.firstName.trim()) || "";
    
    // Validate partial update (exclude userId from being updated)
    // Auto-populate displayName from firstName (always sync with user's firstName)
    const { userId: _, displayName: __, ...updateData } = req.body;
    const validatedData = validateWithZod(insertLighthouseProfileSchema.partial(), {
      ...updateData,
      displayName: userFirstName || "User", // Always sync with user's firstName, fallback to "User"
    }, 'Invalid profile update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProfile(profile.id, validatedData),
      'updateLighthouseProfile'
    );
    
    res.json(updated);
  }));

  app.delete('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteLighthouseProfile(userId, reason),
      'deleteLighthouseProfile'
    );
    res.json({ message: "LightHouse profile deleted successfully" });
  }));

  // Property browsing routes (for seekers)
  app.get('/api/lighthouse/properties', isAuthenticated, asyncHandler(async (_req, res) => {
    const properties = await withDatabaseErrorHandling(
      () => storage.getAllActiveProperties(),
      'getAllActiveProperties'
    );
    res.json(properties);
  }));

  app.get('/api/lighthouse/properties/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  }));

  // Property management routes (for hosts)
  app.get('/api/lighthouse/my-properties', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      console.warn(`[Lighthouse] Profile not found for user ${userId} in /api/lighthouse/my-properties`);
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    const properties = await withDatabaseErrorHandling(
      () => storage.getPropertiesByHost(profile.id),
      'getPropertiesByHost'
    );
    res.json(properties);
  }));

  app.post('/api/lighthouse/properties', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    if (profile.profileType !== 'host') {
      return res.status(403).json({ message: "Only hosts can create properties" });
    }
    
    // Validate and create property
    const validatedData = validateWithZod(insertLighthousePropertySchema, {
      ...req.body,
      hostId: profile.id,
    }, 'Invalid property data');
    const property = await withDatabaseErrorHandling(
      () => storage.createLighthouseProperty(validatedData),
      'createLighthouseProperty'
    );
    
    res.json(property);
  }));

  app.put('/api/lighthouse/properties/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (!profile || property.hostId !== profile.id) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }
    
    // Validate partial update (exclude hostId from being updated)
    const { hostId: _, ...updateData } = req.body;
    const validatedData = validateWithZod(insertLighthousePropertySchema.partial() as any, updateData, 'Invalid property update') as Partial<z.infer<typeof insertLighthousePropertySchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProperty(req.params.id, validatedData),
      'updateLighthouseProperty'
    );
    
    res.json(updated);
  }));

  // Match routes
  app.get('/api/lighthouse/matches', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      console.warn(`[Lighthouse] Profile not found for user ${userId} in /api/lighthouse/matches`);
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    const matches = await withDatabaseErrorHandling(
      () => storage.getMatchesByProfile(profile.id),
      'getMatchesByProfile'
    );
    res.json(matches);
  }));

  app.post('/api/lighthouse/matches', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    if (profile.profileType !== 'seeker') {
      return res.status(403).json({ message: "Only seekers can request matches" });
    }
    
    const { propertyId, message } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    
    // Validate property exists
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(propertyId),
      'getLighthousePropertyById'
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if match already exists to prevent duplicates
    const existingMatches = await withDatabaseErrorHandling(
      () => storage.getMatchesBySeeker(profile.id),
      'getMatchesBySeeker'
    );
    const existingMatch = existingMatches.find(m => m.propertyId === propertyId);
    if (existingMatch && existingMatch.status !== 'cancelled') {
      return res.status(409).json({ 
        message: "You have already requested a match for this property",
        matchId: existingMatch.id 
      });
    }

    // Create match request (note: no hostId field, it's determined via property)
    const validatedData = validateWithZod(insertLighthouseMatchSchema, {
      seekerId: profile.id,
      propertyId,
      seekerMessage: message || null,
      status: 'pending',
    }, 'Invalid match data');
    const match = await withDatabaseErrorHandling(
      () => storage.createLighthouseMatch(validatedData),
      'createLighthouseMatch'
    );
    
    if (!match) {
      return res.status(500).json({ message: "Failed to create match request" });
    }
    
    res.json(match);
  }));

  app.put('/api/lighthouse/matches/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    const match = await withDatabaseErrorHandling(
      () => storage.getLighthouseMatchById(req.params.id),
      'getLighthouseMatchById'
    );
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    if (!profile) {
      return res.status(403).json({ message: "Profile not found" });
    }
    
    // Get property to determine host
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(match.propertyId),
      'getLighthousePropertyById'
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check authorization
    const isHost = property.hostId === profile.id;
    const isSeeker = match.seekerId === profile.id;
    
    if (!isHost && !isSeeker) {
      return res.status(403).json({ message: "You can only update your own matches" });
    }
    
    const { status, hostResponse } = req.body;
    
    // Only hosts can accept/reject matches
    if (status && status !== 'cancelled' && !isHost) {
      return res.status(403).json({ message: "Only the host can accept or reject matches" });
    }
    
    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (hostResponse && isHost) updateData.hostResponse = hostResponse;
    
    const validatedData = validateWithZod(insertLighthouseMatchSchema.partial() as any, updateData, 'Invalid match update') as Partial<z.infer<typeof insertLighthouseMatchSchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseMatch(req.params.id, validatedData as any),
      'updateLighthouseMatch'
    );
    
    res.json(updated);
  }));

  // Admin routes
  app.get('/api/lighthouse/admin/stats', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const stats = await withDatabaseErrorHandling(
      () => storage.getLighthouseStats(),
      'getLighthouseStats'
    );
    res.json(stats);
  }));

  app.get('/api/lighthouse/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const profiles = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseProfiles(),
      'getAllLighthouseProfiles'
    );
    
    // Enrich profiles with firstName from user table or profile's own firstName for unclaimed
    const profilesWithNames = await Promise.all(profiles.map(async (profile) => {
      let userFirstName: string | null = null;
      if (profile.userId) {
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(profile.userId!),
          'getUserForLighthouseAdminProfiles'
        );
        if (user) {
          userFirstName = user.firstName || null;
        }
      } else {
        // For unclaimed profiles, use profile's own firstName field if available
        userFirstName = ((profile as any).firstName && (profile as any).firstName.trim()) || null;
      }
      return { ...profile, firstName: userFirstName };
    }));
    
    res.json(profilesWithNames);
  }));

  app.get('/api/lighthouse/admin/profiles/:id', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileById(req.params.id),
      'getLighthouseProfileById'
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Enrich with user information
    const user = profile.userId ? await withDatabaseErrorHandling(
      () => storage.getUser(profile.userId!),
      'getUserForLighthouseAdminProfile'
    ) : null;
    const profileWithUser = {
      ...profile,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      } : null,
    };
    
    res.json(profileWithUser);
  }));

  app.get('/api/lighthouse/admin/seekers', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    // Get all seekers (both active and inactive) for admin view
    const allProfiles = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseProfiles(),
      'getAllLighthouseProfiles'
    );
    const seekers = allProfiles.filter(p => p.profileType === 'seeker');
    
    // Enrich with user information
    const seekersWithUsers = await Promise.all(seekers.map(async (seeker) => {
      const user = seeker.userId ? await withDatabaseErrorHandling(
        () => storage.getUser(seeker.userId!),
        'getUserForLighthouseAdminSeekers'
      ) : null;
      return {
        ...seeker,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        } : null,
      };
    }));
    res.json(seekersWithUsers);
  }));

  app.get('/api/lighthouse/admin/hosts', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    // Get all hosts (both active and inactive) for admin view
    const allProfiles = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseProfiles(),
      'getAllLighthouseProfiles'
    );
    const hosts = allProfiles.filter(p => p.profileType === 'host');
    
    // Enrich with user information
    const hostsWithUsers = await Promise.all(hosts.map(async (host) => {
      const user = host.userId ? await withDatabaseErrorHandling(
        () => storage.getUser(host.userId!),
        'getUserForLighthouseAdminHosts'
      ) : null;
      return {
        ...host,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        } : null,
      };
    }));
    res.json(hostsWithUsers);
  }));

  app.get('/api/lighthouse/admin/properties', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const properties = await withDatabaseErrorHandling(
      () => storage.getAllProperties(),
      'getAllProperties'
    );
    res.json(properties);
  }));

  app.put('/api/lighthouse/admin/properties/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Validate partial update
    const validatedData = validateWithZod(insertLighthousePropertySchema.partial() as any, req.body, 'Invalid property update') as Partial<z.infer<typeof insertLighthousePropertySchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProperty(req.params.id, validatedData),
      'updateLighthouseProperty'
    );
    
    await logAdminAction(
      userId,
      "update_lighthouse_property",
      "lighthouse_property",
      updated.id,
      { title: updated.title }
    );
    
    res.json(updated);
  }));

  app.get('/api/lighthouse/admin/matches', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const matches = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseMatches(),
      'getAllLighthouseMatches'
    );
    res.json(matches);
  }));

  app.put('/api/lighthouse/admin/matches/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const match = await withDatabaseErrorHandling(
      () => storage.getLighthouseMatchById(req.params.id),
      'getLighthouseMatchById'
    );
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    // Validate partial update
    const validatedData = validateWithZod(insertLighthouseMatchSchema.partial() as any, req.body, 'Invalid match update') as Partial<z.infer<typeof insertLighthouseMatchSchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseMatch(req.params.id, validatedData),
      'updateLighthouseMatch'
    );
    
    await logAdminAction(
      userId,
      "update_lighthouse_match",
      "lighthouse_match",
      updated.id,
      { status: updated.status }
    );
    
    res.json(updated);
  }));

  // LightHouse Announcement routes (public)
  app.get('/api/lighthouse/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveLighthouseAnnouncements(),
      'getActiveLighthouseAnnouncements'
    );
    res.json(announcements);
  }));

  // LightHouse Admin announcement routes
  app.get('/api/lighthouse/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseAnnouncements(),
      'getAllLighthouseAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/lighthouse/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLighthouseAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createLighthouseAnnouncement(validatedData),
      'createLighthouseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_lighthouse_announcement",
      "lighthouse_announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/lighthouse/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLighthouseAnnouncementSchema.partial(), req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertLighthouseAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateLighthouseAnnouncement(req.params.id, validatedData as any),
      'updateLighthouseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_lighthouse_announcement",
      "lighthouse_announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/lighthouse/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateLighthouseAnnouncement(req.params.id),
      'deactivateLighthouseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_lighthouse_announcement",
      "lighthouse_announcement",
      announcement.id
    );

    res.json(announcement);
  }));

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
