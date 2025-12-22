/**
 * MechanicMatch Admin routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, isAdmin, getUserId } from "../../auth";
import { validateCsrfToken } from "../../csrf";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { NotFoundError } from "../../errors";
import { logAdminAction } from "../shared";
import { z } from "zod";
import {
  insertMechanicmatchProfileSchema,
  insertMechanicmatchAnnouncementSchema,
  type MechanicmatchProfile,
  type MechanicmatchAnnouncement,
  type User,
} from "@shared/schema";

export function registerMechanicMatchAdminRoutes(app: Express) {
  // Admin Profile routes
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
    ) as { items: MechanicmatchProfile[]; total: number };
    
    // Enrich profiles with user data (firstName, lastName) like the public route does
    const withNames = await Promise.all(profiles.items.map(async (p: MechanicmatchProfile) => {
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Fetch user data if userId exists
      if (p.userId) {
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(p.userId!),
          'getUserForMechanicmatchAdmin'
        ) as User | undefined;
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
    ) as MechanicmatchProfile;

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
    ) as MechanicmatchProfile | undefined;

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.isClaimed) {
      return res.status(400).json({ message: "Profile is already claimed" });
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfileById(profile.id, { userId, isClaimed: true }),
      'assignMechanicmatchProfile'
    ) as MechanicmatchProfile;

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

  // Admin Announcement routes
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
    ) as MechanicmatchAnnouncement;
    
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
    ) as MechanicmatchAnnouncement;
    
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

