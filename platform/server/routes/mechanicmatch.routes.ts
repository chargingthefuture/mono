/**
 * MechanicMatch routes
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
  insertMechanicmatchProfileSchema,
    insertMechanicmatchVehicleSchema,
    insertMechanicmatchServiceRequestSchema,
    insertMechanicmatchJobSchema,
    insertMechanicmatchAvailabilitySchema,
    insertMechanicmatchReviewSchema,
    insertMechanicmatchMessageSchema,
    insertMechanicmatchAnnouncementSchema,
    type InsertMechanicmatchProfile,
} from "@shared/schema";

export function registerMechanicMatchRoutes(app: Express) {
  // MECHANICMATCH ROUTES

  // MechanicMatch Announcement routes (public)
  app.get('/api/mechanicmatch/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveMechanicmatchAnnouncements(),
      'getActiveMechanicmatchAnnouncements'
    );
    res.json(announcements);
  }));

  // MechanicMatch Profile routes
  app.get('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForMechanicmatchProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchProfileSchema, {
      ...req.body,
        userId,
        isClaimed: true, // User is claiming their own profile
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchProfile(validatedData),
      'createMechanicmatchProfile'
    );
    res.json(profile);
  }));

  app.put('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfile(userId, req.body),
      'updateMechanicmatchProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchProfile(userId, reason),
      'deleteMechanicmatchProfile'
    );
    res.json({ message: "MechanicMatch profile deleted successfully" });
  }));

  // Public routes (with rate limiting to prevent scraping)
  app.get('/api/mechanicmatch/public/:id', publicItemLimiter, asyncHandler(async (req, res) => {
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );
    if (!profile || !profile.isPublic) {
      return res.status(404).json({ message: "Profile not found" });
    }
    // Get verification status and first name:
    // - For claimed profiles: from the user record
    // - For unclaimed profiles: from the profile's own firstName field
    let userIsVerified = false;
    let userFirstName: string | null = null;
    if (profile.userId) {
      const user = await withDatabaseErrorHandling(
        () => storage.getUser(profile.userId!),
        'getUserVerificationForPublicMechanicmatchProfile'
      );
      if (user) {
        userIsVerified = user.isVerified || false;
        userFirstName = (user.firstName && user.firstName.trim()) || null;
      }
    } else {
      userIsVerified = profile.isVerified || false;
      userFirstName = (profile.firstName && profile.firstName.trim()) || null;
    }
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.get('/api/mechanicmatch/public', publicListingLimiter, asyncHandler(async (req, res) => {
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

    const profiles = await withDatabaseErrorHandling(
      () => storage.listPublicMechanicmatchProfiles(),
      'listPublicMechanicmatchProfiles'
    );
    const withVerification = await Promise.all(profiles.map(async (p) => {
      let userIsVerified = false;
      let userFirstName: string | null = null;
      if (p.userId) {
        const userId = p.userId;
        const u = await withDatabaseErrorHandling(
          () => storage.getUser(userId),
          'getUserVerificationForPublicMechanicmatchList'
        );
        if (u) {
          userIsVerified = u.isVerified || false;
          userFirstName = (u.firstName && u.firstName.trim()) || null;
        }
      } else {
        userIsVerified = p.isVerified || false;
        userFirstName = (p.firstName && p.firstName.trim()) || null;
      }
      return { ...p, userIsVerified, firstName: userFirstName };
    }));
    
    // Rotate display order to make scraping harder
    const rotated = rotateDisplayOrder(withVerification);
    
    res.json(rotated);
  }));

  // MechanicMatch Vehicle routes
  app.get('/api/mechanicmatch/vehicles', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const vehicles = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehiclesByOwner(userId),
      'getMechanicmatchVehiclesByOwner'
    );
    res.json(vehicles);
  }));

  app.get('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const vehicle = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehicleById(req.params.id),
      'getMechanicmatchVehicleById'
    );
    if (!vehicle) {
      throw new NotFoundError('Vehicle', req.params.id);
    }
    res.json(vehicle);
  }));

  app.post('/api/mechanicmatch/vehicles', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchVehicleSchema, req.body, 'Invalid vehicle data');
    const vehicle = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchVehicle({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchVehicle'
    );
    res.json(vehicle);
  }));

  app.put('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const vehicle = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehicleById(req.params.id),
      'getMechanicmatchVehicleById'
    );
    if (!vehicle || vehicle.ownerId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchVehicle(req.params.id, req.body),
      'updateMechanicmatchVehicle'
    );
    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchVehicle(req.params.id, userId),
      'deleteMechanicmatchVehicle'
    );
    res.json({ message: "Vehicle deleted successfully" });
  }));

  // MechanicMatch Service Request routes
  app.get('/api/mechanicmatch/service-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const requests = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestsByOwnerPaginated(userId, limit, offset),
      'getMechanicmatchServiceRequestsByOwnerPaginated'
    );
    res.json(requests);
  }));

  app.get('/api/mechanicmatch/service-requests/open', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getOpenMechanicmatchServiceRequests(),
      'getOpenMechanicmatchServiceRequests'
    );
    res.json(requests);
  }));

  app.get('/api/mechanicmatch/service-requests/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestById(req.params.id),
      'getMechanicmatchServiceRequestById'
    );
    if (!request) {
      throw new NotFoundError('Service request', req.params.id);
    }
    res.json(request);
  }));

  app.post('/api/mechanicmatch/service-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isCarOwner) {
      throw new ValidationError("You must be a car owner to create service requests");
    }
    const validatedData = validateWithZod(insertMechanicmatchServiceRequestSchema, req.body, 'Invalid service request data');
    const request = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchServiceRequest({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchServiceRequest'
    );
    res.json(request);
  }));

  app.put('/api/mechanicmatch/service-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestById(req.params.id),
      'getMechanicmatchServiceRequestById'
    );
    if (!request || request.ownerId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchServiceRequest(req.params.id, req.body),
      'updateMechanicmatchServiceRequest'
    );
    res.json(updated);
  }));

  // MechanicMatch Job routes
  app.get('/api/mechanicmatch/jobs', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile) {
      throw new NotFoundError('Profile');
    }
    
    let jobs;
    if (profile.isCarOwner) {
      jobs = await withDatabaseErrorHandling(
        () => storage.getMechanicmatchJobsByOwner(userId),
        'getMechanicmatchJobsByOwner'
      );
    } else if (profile.isMechanic) {
      jobs = await withDatabaseErrorHandling(
        () => storage.getMechanicmatchJobsByMechanic(profile.id),
        'getMechanicmatchJobsByMechanic'
      );
    } else {
      console.warn(`[MechanicMatch] Profile ${profile.id} has no role (isCarOwner: ${profile.isCarOwner}, isMechanic: ${profile.isMechanic}) in /api/mechanicmatch/jobs`);
      return res.status(404).json({ message: "Profile role not set. Please set up your profile as a car owner or mechanic first." });
    }
    
    res.json(jobs);
  }));

  app.get('/api/mechanicmatch/jobs/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const job = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchJobById(req.params.id),
      'getMechanicmatchJobById'
    );
    if (!job) {
      throw new NotFoundError('Job', req.params.id);
    }
    res.json(job);
  }));

  app.post('/api/mechanicmatch/jobs', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchJobSchema, req.body, 'Invalid job data');
    const job = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchJob({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchJob'
    );
    res.json(job);
  }));

  app.put('/api/mechanicmatch/jobs/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const job = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchJobById(req.params.id),
      'getMechanicmatchJobById'
    );
    if (!job) {
      throw new NotFoundError('Job', req.params.id);
    }
    
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile) {
      throw new NotFoundError('Profile');
    }
    
    // Only owner or assigned mechanic can update
    if (job.ownerId !== userId && job.mechanicId !== profile.id) {
      throw new ForbiddenError("Unauthorized");
    }
    
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchJob(req.params.id, req.body),
      'updateMechanicmatchJob'
    );
    res.json(updated);
  }));

  app.post('/api/mechanicmatch/jobs/:id/accept', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to accept jobs");
    }
    const job = await withDatabaseErrorHandling(
      () => storage.acceptMechanicmatchJob(req.params.id, profile.id),
      'acceptMechanicmatchJob'
    );
    res.json(job);
  }));

  // MechanicMatch Availability routes
  app.get('/api/mechanicmatch/availability', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to view availability");
    }
    const availability = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchAvailabilityByMechanic(profile.id),
      'getMechanicmatchAvailabilityByMechanic'
    );
    res.json(availability);
  }));

  app.post('/api/mechanicmatch/availability', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to set availability");
    }
    const validatedData = validateWithZod(insertMechanicmatchAvailabilitySchema, req.body, 'Invalid availability data');
    const availability = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchAvailability({
        ...validatedData,
        mechanicId: profile.id,
      }),
      'createMechanicmatchAvailability'
    );
    res.json(availability);
  }));

  app.put('/api/mechanicmatch/availability/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to update availability");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchAvailability(req.params.id, req.body),
      'updateMechanicmatchAvailability'
    );
    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/availability/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to delete availability");
    }
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchAvailability(req.params.id, profile.id),
      'deleteMechanicmatchAvailability'
    );
    res.json({ message: "Availability deleted successfully" });
  }));

  // MechanicMatch Review routes
  app.get('/api/mechanicmatch/reviews/mechanic/:mechanicId', isAuthenticated, asyncHandler(async (req, res) => {
    const reviews = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchReviewsByReviewee(req.params.mechanicId),
      'getMechanicmatchReviewsByReviewee'
    );
    res.json(reviews);
  }));

  app.get('/api/mechanicmatch/reviews/job/:jobId', isAuthenticated, asyncHandler(async (req, res) => {
    const reviews = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchReviewsByJob(req.params.jobId),
      'getMechanicmatchReviewsByJob'
    );
    res.json(reviews);
  }));

  app.post('/api/mechanicmatch/reviews', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchReviewSchema, req.body, 'Invalid review data');
    const review = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchReview({
        ...validatedData,
        reviewerId: userId,
      }),
      'createMechanicmatchReview'
    );
    res.json(review);
  }));

  // MechanicMatch Message routes
  app.get('/api/mechanicmatch/messages/job/:jobId', isAuthenticated, asyncHandler(async (req, res) => {
    const messages = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchMessagesByJob(req.params.jobId),
      'getMechanicmatchMessagesByJob'
    );
    res.json(messages);
  }));

  app.get('/api/mechanicmatch/messages/unread', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const messages = await withDatabaseErrorHandling(
      () => storage.getUnreadMechanicmatchMessages(userId),
      'getUnreadMechanicmatchMessages'
    );
    res.json(messages);
  }));

  app.post('/api/mechanicmatch/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchMessageSchema, req.body, 'Invalid message data');
    const message = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchMessage({
        ...validatedData,
        senderId: userId,
      }),
      'createMechanicmatchMessage'
    );
    res.json(message);
  }));

  app.put('/api/mechanicmatch/messages/:id/read', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const message = await withDatabaseErrorHandling(
      () => storage.markMechanicmatchMessageAsRead(req.params.id, userId),
      'markMechanicmatchMessageAsRead'
    );
    res.json(message);
  }));

  // MechanicMatch Search routes
  app.get('/api/mechanicmatch/search/mechanics', isAuthenticated, asyncHandler(async (req: any, res) => {
    const filters: any = {};
    if (req.query.city) filters.city = req.query.city;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.isMobileMechanic !== undefined) filters.isMobileMechanic = req.query.isMobileMechanic === 'true';
    if (req.query.maxHourlyRate) filters.maxHourlyRate = parseFloat(req.query.maxHourlyRate);
    if (req.query.minRating) filters.minRating = parseFloat(req.query.minRating);
    if (req.query.specialties) filters.specialties = Array.isArray(req.query.specialties) ? req.query.specialties : [req.query.specialties];
    
    const mechanics = await withDatabaseErrorHandling(
      () => storage.searchMechanicmatchMechanics(filters),
      'searchMechanicmatchMechanics'
    );
    
    // Enrich profiles with firstName from users for claimed profiles
    const enrichedMechanics = await Promise.all(mechanics.map(async (mechanic) => {
      let firstName: string | null = null;
      if (mechanic.userId) {
        // For claimed profiles, get firstName from user record
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(mechanic.userId!),
          'getUserForMechanicmatchSearch'
        );
        if (user) {
          firstName = (user.firstName && user.firstName.trim()) || null;
        }
      } else {
        // For unclaimed profiles, use profile's own firstName field
        firstName = (mechanic.firstName && mechanic.firstName.trim()) || null;
      }
      return { ...mechanic, firstName };
    }));
    
    res.json(enrichedMechanics);
  }));

  // MechanicMatch Admin Profile routes
  app.get('/api/mechanicmatch/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const offsetParam = Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset;
    const searchParam = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;
    const roleParam = Array.isArray(req.query.role) ? req.query.role[0] : req.query.role;
    const claimedParam = Array.isArray(req.query.claimed) ? req.query.claimed[0] : req.query.claimed;

    const limit = Math.min(parseInt(limitParam || '50', 10) || 50, 100);
    const offset = parseInt(offsetParam || '0', 10) || 0;
    const role = roleParam === 'mechanic' || roleParam === 'owner' ? roleParam : undefined;
    const isClaimed =
      claimedParam === 'true' ? true : claimedParam === 'false' ? false : undefined;

    const profiles = await withDatabaseErrorHandling(
      () => storage.listMechanicmatchProfiles({
        limit,
        offset,
        search: searchParam || undefined,
        role,
        isClaimed,
      }),
      'listMechanicmatchProfiles'
    );
    
    // Enrich profiles with user data (firstName, lastName) like the public route does
    const withNames = await Promise.all(profiles.items.map(async (p) => {
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Fetch user data if userId exists
      if (p.userId) {
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(p.userId!),
          'getUserForMechanicmatchAdmin'
        );
        if (user) {
          userFirstName = (user.firstName && user.firstName.trim()) || null;
          userLastName = (user.lastName && user.lastName.trim()) || null;
          userIsVerified = user.isVerified || false;
        }
      } else {
        // For admin-created profiles without userId, use profile's own isVerified field
        // and use profile's firstName field (for unclaimed profiles)
        userIsVerified = p.isVerified || false;
        userFirstName = (p.firstName && p.firstName.trim()) || null;
      }
      
      // Return enriched profile with firstName, lastName, and userIsVerified
      return {
        ...p,
        userIsVerified,
        firstName: userFirstName || null,
        lastName: userLastName || null,
      };
    }));
    
    res.json({ ...profiles, items: withNames });
  }));

  app.post('/api/mechanicmatch/admin/profiles', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    // Follow the same pattern as directory profiles: set userId to null if not provided
    // The storage function will handle omitting it from the insert
    const validated = validateWithZod(insertMechanicmatchProfileSchema, {
      ...req.body,
      userId: req.body.userId || null,
      isClaimed: !!req.body.userId,
      // Explicitly set defaults for fields that have NOT NULL constraints
      isCarOwner: req.body.isCarOwner ?? false,
      isMechanic: req.body.isMechanic ?? false,
      isMobileMechanic: req.body.isMobileMechanic ?? false,
    }, 'Invalid profile data');

    if (!validated.isCarOwner && !validated.isMechanic) {
      return res.status(400).json({ message: "Profile must be at least a car owner or mechanic" });
    }

    const profile = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchProfile(validated),
      'createMechanicmatchProfile'
    );

    await logAdminAction(
      adminId,
      'create_mechanicmatch_profile',
      'mechanicmatch_profile',
      profile.id,
      { isClaimed: profile.isClaimed }
    );

    res.json(profile);
  }));

  app.put('/api/mechanicmatch/admin/profiles/:id/assign', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.isClaimed) {
      return res.status(400).json({ message: "Profile is already claimed" });
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfileById(profile.id, { userId, isClaimed: true }),
      'assignMechanicmatchProfile'
    );

    await logAdminAction(
      adminId,
      'assign_mechanicmatch_profile',
      'mechanicmatch_profile',
      updated.id,
      { userId }
    );

    res.json(updated);
  }));

  app.put('/api/mechanicmatch/admin/profiles/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    
    // Get existing profile to preserve isClaimed and userId for claimed profiles
    const existingProfile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );

    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Exclude isClaimed and userId from update payload to preserve existing values
    // This prevents claimed profiles from becoming unclaimed when edited
    const { isClaimed: _isClaimed, userId: _userId, ...updateData } = req.body;
    const validated = validateWithZod(insertMechanicmatchProfileSchema.partial(), updateData, 'Invalid profile update') as Partial<z.infer<typeof insertMechanicmatchProfileSchema>>;

    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfileById(req.params.id, validated as any),
      'updateMechanicmatchProfileById'
    );

    await logAdminAction(
      adminId,
      'update_mechanicmatch_profile',
      'mechanicmatch_profile',
      updated.id
    );

    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/admin/profiles/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.isClaimed) {
      return res.status(400).json({ message: "Cannot delete claimed profiles. Ask user to delete via profile settings." });
    }

    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchProfileById(profile.id),
      'deleteMechanicmatchProfileById'
    );

    await logAdminAction(
      adminId,
      'delete_mechanicmatch_profile',
      'mechanicmatch_profile',
      profile.id,
      {
        wasUnclaimed: true,
      }
    );

    res.json({ message: "Profile deleted successfully" });
  }));

  // MechanicMatch Admin Announcement routes
  app.get('/api/mechanicmatch/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllMechanicmatchAnnouncements(),
      'getAllMechanicmatchAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/mechanicmatch/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchAnnouncement(validatedData),
      'createMechanicmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_mechanicmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/mechanicmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertMechanicmatchAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchAnnouncement(req.params.id, validatedData),
      'updateMechanicmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_mechanicmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/mechanicmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateMechanicmatchAnnouncement(req.params.id),
      'deactivateMechanicmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_mechanicmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));


}
