/**
 * ChatGroups routes
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
  insertChatGroupSchema,
  insertChatgroupsAnnouncementSchema,
  insertSupportMatchProfileSchema,
  insertMessageSchema,
  insertExclusionSchema,
  insertReportSchema,
  insertSupportmatchAnnouncementSchema,
  type User,
  type Partnership,
} from "@shared/schema";

export function registerChatGroupsRoutes(app: Express) {
  // Public routes - anyone can view active groups
  app.get('/api/chatgroups', asyncHandler(async (_req, res) => {
    const groups = await withDatabaseErrorHandling(
      () => storage.getActiveChatGroups(),
      'getActiveChatGroups'
    );
    res.json(groups);
  }));

  // Admin routes
  app.get('/api/chatgroups/admin', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const groups = await withDatabaseErrorHandling(
      () => storage.getAllChatGroups(),
      'getAllChatGroups'
    );
    res.json(groups);
  }));

  app.post('/api/chatgroups/admin', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertChatGroupSchema, req.body, 'Invalid chat group data');
    const group = await withDatabaseErrorHandling(
      () => storage.createChatGroup(validated),
      'createChatGroup'
    ) as any;
    await logAdminAction(adminId, 'create_chat_group', 'chat_group', (group as any).id);
    res.json(group);
  }));

  app.put('/api/chatgroups/admin/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertChatGroupSchema.partial() as any, req.body, 'Invalid chat group update') as Partial<z.infer<typeof insertChatGroupSchema>>;
    const group = await withDatabaseErrorHandling(
      () => storage.updateChatGroup(req.params.id, validated as any),
      'updateChatGroup'
    ) as any;
    await logAdminAction(adminId, 'update_chat_group', 'chat_group', (group as any).id);
    res.json(group);
  }));

  app.delete('/api/chatgroups/admin/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteChatGroup(req.params.id),
      'deleteChatGroup'
    );
    await logAdminAction(adminId, 'delete_chat_group', 'chat_group', req.params.id);
    res.json({ message: "Chat group deleted" });
  }));

  // ChatGroups Announcement routes
  app.get('/api/chatgroups/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveChatgroupsAnnouncements(),
      'getActiveChatgroupsAnnouncements'
    );
    res.json(announcements);
  }));

  app.get('/api/chatgroups/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllChatgroupsAnnouncements(),
      'getAllChatgroupsAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/chatgroups/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChatgroupsAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createChatgroupsAnnouncement(validatedData),
      'createChatgroupsAnnouncement'
    ) as any;
    
    await logAdminAction(
      userId,
      "create_chatgroups_announcement",
      "announcement",
      (announcement as any).id,
      { title: (announcement as any).title, type: (announcement as any).type }
    );

    res.json(announcement);
  }));

  app.put('/api/chatgroups/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChatgroupsAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertChatgroupsAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateChatgroupsAnnouncement(req.params.id, validatedData),
      'updateChatgroupsAnnouncement'
    ) as any;
    
    await logAdminAction(
      userId,
      "update_chatgroups_announcement",
      "announcement",
      (announcement as any).id,
      { title: (announcement as any).title }
    );

    res.json(announcement);
  }));

  app.delete('/api/chatgroups/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateChatgroupsAnnouncement(req.params.id),
      'deactivateChatgroupsAnnouncement'
    ) as any;
    
    await logAdminAction(
      userId,
      "deactivate_chatgroups_announcement",
      "announcement",
      (announcement as any).id,
      { title: (announcement as any).title }
    );

    res.json(announcement);
  }));

  // SupportMatch Profile routes
  app.get('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getSupportMatchProfile(userId),
      'getSupportMatchProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForSupportMatchProfile'
    ) as any;
    const userIsVerified = (user as any)?.isVerified || false;
    const userFirstName = (user as any)?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSupportMatchProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');

    const profile = await withDatabaseErrorHandling(
      () => storage.createSupportMatchProfile(validatedData),
      'createSupportMatchProfile'
    );
    res.json(profile);
  }));

  app.put('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateSupportMatchProfile(userId, req.body),
      'updateSupportMatchProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteSupportMatchProfile(userId, reason),
      'deleteSupportMatchProfile'
    );
    res.json({ message: "SupportMatch profile deleted successfully" });
  }));

  // SupportMatch Partnership routes
  app.get('/api/supportmatch/partnership/active', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const partnership = await withDatabaseErrorHandling(
      () => storage.getActivePartnershipByUser(userId),
      'getActivePartnershipByUser'
    );
    res.json(partnership || null);
  }));

  app.get('/api/supportmatch/partnership/history', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const partnerships = await withDatabaseErrorHandling(
      () => storage.getPartnershipHistory(userId),
      'getPartnershipHistory'
    );
    res.json(partnerships);
  }));

  app.get('/api/supportmatch/partnership/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const partnership = await withDatabaseErrorHandling(
      () => storage.getPartnershipById(req.params.id),
      'getPartnershipById'
    );
    if (!partnership) {
      throw new NotFoundError('Partnership', req.params.id);
    }
    res.json(partnership);
  }));

  // SupportMatch Messaging routes
  app.get('/api/supportmatch/messages/:partnershipId', isAuthenticated, asyncHandler(async (req, res) => {
    const messages = await withDatabaseErrorHandling(
      () => storage.getMessagesByPartnership(req.params.partnershipId),
      'getMessagesByPartnership'
    );
    res.json(messages);
  }));

  app.post('/api/supportmatch/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMessageSchema, {
      ...req.body,
      senderId: userId,
    }, 'Invalid message data');

    const message = await withDatabaseErrorHandling(
      () => storage.createMessage(validatedData),
      'createMessage'
    );
    res.json(message);
  }));

  // SupportMatch Exclusion routes
  app.get('/api/supportmatch/exclusions', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const exclusions = await withDatabaseErrorHandling(
      () => storage.getExclusionsByUser(userId),
      'getExclusionsByUser'
    );
    res.json(exclusions);
  }));

  app.post('/api/supportmatch/exclusions', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertExclusionSchema, {
      ...req.body,
      userId,
    }, 'Invalid exclusion data');

    const exclusion = await withDatabaseErrorHandling(
      () => storage.createExclusion(validatedData),
      'createExclusion'
    );
    res.json(exclusion);
  }));

  app.delete('/api/supportmatch/exclusions/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    await withDatabaseErrorHandling(
      () => storage.deleteExclusion(req.params.id),
      'deleteExclusion'
    );
    res.json({ message: "Exclusion removed successfully" });
  }));

  // SupportMatch Report routes
  app.post('/api/supportmatch/reports', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertReportSchema, {
      ...req.body,
      reporterId: userId,
    }, 'Invalid report data');

    const report = await withDatabaseErrorHandling(
      () => storage.createReport(validatedData),
      'createReport'
    );
    res.json(report);
  }));

  // SupportMatch Announcement routes (public)
  app.get('/api/supportmatch/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveSupportmatchAnnouncements(),
      'getActiveSupportmatchAnnouncements'
    );
    res.json(announcements);
  }));

  // SupportMatch Admin routes
  app.get('/api/supportmatch/admin/stats', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const stats = await withDatabaseErrorHandling(
      () => storage.getSupportMatchStats(),
      'getSupportMatchStats'
    );
    res.json(stats);
  }));

  app.get('/api/supportmatch/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const profiles = await withDatabaseErrorHandling(
      () => storage.getAllSupportMatchProfiles(),
      'getAllSupportMatchProfiles'
    ) as any[];
    
    // Enrich profiles with firstName from user table or profile's own firstName for unclaimed
    const profilesWithNames = await Promise.all(profiles.map(async (profile: any) => {
      let userFirstName: string | null = null;
      if (profile.userId) {
        const userId = profile.userId;
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(userId),
          'getUserForSupportMatchAdminProfiles'
        ) as User | undefined;
        if (user) {
          userFirstName = user.firstName || null;
        }
      } else {
        // For unclaimed profiles, use profile's own firstName field
        userFirstName = ((profile as any).firstName && (profile as any).firstName.trim()) || null;
      }
      return { ...profile, firstName: userFirstName };
    }));
    
    res.json(profilesWithNames);
  }));

  app.get('/api/supportmatch/admin/partnerships', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const partnerships = await withDatabaseErrorHandling(
      () => storage.getAllPartnerships(),
      'getAllPartnerships'
    ) as any[];
    
    // Get all unique user IDs
    const userIds = new Set<string>();
    partnerships.forEach((p: any) => {
      if (p.user1Id) userIds.add(p.user1Id);
      if (p.user2Id) userIds.add(p.user2Id);
    });
    
    // Fetch all user data in one query
    const allUsers = userIds.size > 0 ? await withDatabaseErrorHandling(
      async () => {
        const userList = Array.from(userIds);
        const users = await Promise.all(
          userList.map(userId => storage.getUser(userId))
        );
        return users.filter((u): u is User => !!u);
      },
      'getAllUsersForSupportMatchAdminPartnerships'
    ) : [];
    
    // Create a map of userId -> user data
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    
    // Enrich partnerships with firstName and lastName for both users
    const partnershipsWithNames = partnerships.map((partnership) => {
      const user1 = partnership.user1Id ? userMap.get(partnership.user1Id) : null;
      const user2 = partnership.user2Id ? userMap.get(partnership.user2Id) : null;
      
      return {
        ...partnership,
        user1FirstName: user1?.firstName || null,
        user1LastName: user1?.lastName || null,
        user2FirstName: user2?.firstName || null,
        user2LastName: user2?.lastName || null,
      };
    });
    
    res.json(partnershipsWithNames);
  }));

  app.put('/api/supportmatch/admin/partnerships/:id/status', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const partnership = await withDatabaseErrorHandling(
      () => storage.updatePartnershipStatus(req.params.id, status),
      'updatePartnershipStatus'
    ) as Partnership;
    await logAdminAction(
      userId,
      "update_partnership_status",
      "partnership",
      partnership.id,
      { status }
    );
    res.json(partnership);
  }));

  app.post('/api/supportmatch/admin/partnerships/run-matching', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const partnerships = await withDatabaseErrorHandling(
      () => storage.createAlgorithmicMatches(),
      'createAlgorithmicMatches'
    ) as any[];
    await logAdminAction(
      userId,
      "run_algorithmic_matching",
      "partnership",
      undefined,
      { matchesCreated: partnerships.length }
    );
    res.json({
      message: `Successfully created ${partnerships.length} partnership(s)`,
      partnerships,
    });
  }));

  app.get('/api/supportmatch/admin/reports', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const reports = await withDatabaseErrorHandling(
      () => storage.getAllReports(),
      'getAllReports'
    );
    res.json(reports);
  }));

  app.put('/api/supportmatch/admin/reports/:id/status', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { status, resolution } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const report = await withDatabaseErrorHandling(
      () => storage.updateReportStatus(req.params.id, status, resolution),
      'updateReportStatus'
    ) as any;
    await logAdminAction(
      userId,
      "update_report_status",
      "report",
      (report as any).id,
      { status, resolution }
    );
    res.json(report);
  }));

  app.get('/api/supportmatch/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllSupportmatchAnnouncements(),
      'getAllSupportmatchAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/supportmatch/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSupportmatchAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createSupportmatchAnnouncement(validatedData),
      'createSupportmatchAnnouncement'
    ) as any;
    
    await logAdminAction(
      userId,
      "create_supportmatch_announcement",
      "announcement",
      (announcement as any).id,
      { title: (announcement as any).title, type: (announcement as any).type }
    );

    res.json(announcement);
  }));

  app.put('/api/supportmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSupportmatchAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertSupportmatchAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateSupportmatchAnnouncement(req.params.id, validatedData),
      'updateSupportmatchAnnouncement'
    ) as any;
    
    await logAdminAction(
      userId,
      "update_supportmatch_announcement",
      "announcement",
      (announcement as any).id,
      { title: (announcement as any).title }
    );

    res.json(announcement);
  }));

  app.delete('/api/supportmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateSupportmatchAnnouncement(req.params.id),
      'deactivateSupportmatchAnnouncement'
    ) as any;
    
    await logAdminAction(
      userId,
      "deactivate_announcement",
      "announcement",
      (announcement as any).id
    );

    res.json(announcement);
  }));


}
