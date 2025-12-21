/**
 * Lighthouse Announcement routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, isAdmin, getUserId } from "../../auth";
import { validateCsrfToken } from "../../csrf";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { logAdminAction } from "../shared";
import { z } from "zod";
import { insertLighthouseAnnouncementSchema } from "@shared/schema";

export function registerLighthouseAnnouncementRoutes(app: Express) {
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
}


