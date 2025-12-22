/**
 * MechanicMatch Announcement routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";

export function registerMechanicMatchAnnouncementRoutes(app: Express) {
  // Announcement routes (public)
  app.get('/api/mechanicmatch/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveMechanicmatchAnnouncements(),
      'getActiveMechanicmatchAnnouncements'
    );
    res.json(announcements);
  }));
}

