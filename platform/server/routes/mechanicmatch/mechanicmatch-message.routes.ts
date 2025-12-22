/**
 * MechanicMatch Message routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { insertMechanicmatchMessageSchema } from "@shared/schema";

export function registerMechanicMatchMessageRoutes(app: Express) {
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
}

