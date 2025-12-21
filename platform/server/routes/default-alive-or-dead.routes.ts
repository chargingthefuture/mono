/**
 * DefaultAliveOrDead routes
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
  insertDefaultAliveOrDeadFinancialEntrySchema,
    insertDefaultAliveOrDeadEbitdaSnapshotSchema,
} from "@shared/schema";

export function registerDefaultAliveOrDeadRoutes(app: Express) {
  // DEFAULT ALIVE OR DEAD ROUTES (ADMIN ONLY)

  // Default Alive or Dead Financial Entry routes (admin only)
  app.get('/api/default-alive-or-dead/financial-entries', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const weekStartDate = req.query.weekStartDate ? new Date(req.query.weekStartDate) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      
      const result = await storage.getDefaultAliveOrDeadFinancialEntries({
        weekStartDate,
        limit,
        offset,
      });
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching financial entries:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  app.post('/api/default-alive-or-dead/financial-entries', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = validateWithZod(insertDefaultAliveOrDeadFinancialEntrySchema, req.body, 'Invalid financial entry data');
      const entry = await storage.createDefaultAliveOrDeadFinancialEntry(validatedData, userId);
      
      // Automatically calculate EBITDA for this week
      await storage.calculateAndStoreEbitdaSnapshot(validatedData.weekStartDate);
      
      res.json(entry);
    } catch (error: any) {
      console.error("Error creating financial entry:", error);
      res.status(400).json({ message: error.message || "Failed to create financial entry" });
    }
  }));

  app.put('/api/default-alive-or-dead/financial-entries/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      // Get the existing entry first to know which week to recalculate
      const existingEntry = await storage.getDefaultAliveOrDeadFinancialEntry(req.params.id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Financial entry not found" });
      }

      const validatedData = validateWithZod(insertDefaultAliveOrDeadFinancialEntrySchema.partial(), req.body, 'Invalid financial entry data');
      const entry = await storage.updateDefaultAliveOrDeadFinancialEntry(req.params.id, validatedData);
      
      // Recalculate EBITDA for this week with updated expenses
      // Use weekStartDate from updated entry if provided, otherwise use existing
      const weekStartDate = validatedData.weekStartDate || existingEntry.weekStartDate;
      await storage.calculateAndStoreEbitdaSnapshot(new Date(weekStartDate));
      
      res.json(entry);
    } catch (error: any) {
      console.error("Error updating financial entry:", error);
      res.status(400).json({ message: error.message || "Failed to update financial entry" });
    }
  }));

  app.delete('/api/default-alive-or-dead/financial-entries/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      await storage.deleteDefaultAliveOrDeadFinancialEntry(req.params.id);
      res.json({ message: "Financial entry deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting financial entry:", error);
      res.status(400).json({ message: error.message || "Failed to delete financial entry" });
    }
  }));

  // Default Alive or Dead EBITDA Snapshot routes (admin only)
  app.post('/api/default-alive-or-dead/calculate-ebitda', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const { weekStartDate, currentFunding } = req.body;
      if (!weekStartDate) {
        return res.status(400).json({ message: "weekStartDate is required" });
      }
      const snapshot = await storage.calculateAndStoreEbitdaSnapshot(new Date(weekStartDate), currentFunding);
      res.json(snapshot);
    } catch (error: any) {
      console.error("Error calculating EBITDA snapshot:", error);
      res.status(500).json({ message: error.message || "Failed to calculate EBITDA snapshot" });
    }
  }));

  app.get('/api/default-alive-or-dead/ebitda-snapshots', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
    
    const result = await withDatabaseErrorHandling(
      () => storage.getDefaultAliveOrDeadEbitdaSnapshots({
        limit,
        offset,
      }),
      'getDefaultAliveOrDeadEbitdaSnapshots'
    );
    res.json(result);
  }));

  app.get('/api/default-alive-or-dead/current-status', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const status = await withDatabaseErrorHandling(
      () => storage.getDefaultAliveOrDeadCurrentStatus(),
      'getDefaultAliveOrDeadCurrentStatus'
    );
    res.json(status);
  }));

  app.get('/api/default-alive-or-dead/weekly-trends', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const weeks = req.query.weeks ? parseInt(req.query.weeks, 10) : 12;
    const trends = await withDatabaseErrorHandling(
      () => storage.getDefaultAliveOrDeadWeeklyTrends(weeks),
      'getDefaultAliveOrDeadWeeklyTrends'
    );
    res.json(trends);
  }));

  app.get('/api/default-alive-or-dead/week-comparison', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const weekStartParam = req.query.weekStart;
    let weekStart: Date;
    
    if (weekStartParam) {
      // Parse date string (YYYY-MM-DD) and interpret as local date, not UTC
      const [year, month, day] = weekStartParam.split('-').map(Number);
      weekStart = new Date(year, month - 1, day);
      if (isNaN(weekStart.getTime())) {
        throw new ValidationError("Invalid weekStart date format");
      }
    } else {
      // Default to current week
      weekStart = new Date();
    }
    
    const comparison = await withDatabaseErrorHandling(
      () => storage.getDefaultAliveOrDeadWeekComparison(weekStart),
      'getDefaultAliveOrDeadWeekComparison'
    );
    res.json(comparison);
  }));

  // Current funding routes
  app.get('/api/default-alive-or-dead/current-funding', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const funding = await withDatabaseErrorHandling(
      () => storage.getDefaultAliveOrDeadCurrentFunding(),
      'getDefaultAliveOrDeadCurrentFunding'
    );
    res.json({ currentFunding: funding });
  }));

  app.put('/api/default-alive-or-dead/current-funding', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const { currentFunding } = req.body;
    if (typeof currentFunding !== 'number' || currentFunding < 0) {
      throw new ValidationError("currentFunding must be a non-negative number");
    }
    await withDatabaseErrorHandling(
      () => storage.updateDefaultAliveOrDeadCurrentFunding(currentFunding),
      'updateDefaultAliveOrDeadCurrentFunding'
    );
    res.json({ message: "Current funding updated successfully", currentFunding });
  }));

  const httpServer = createServer(app);
  return httpServer;

}
