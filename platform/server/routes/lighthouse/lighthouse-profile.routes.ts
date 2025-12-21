/**
 * Lighthouse Profile routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { insertLighthouseProfileSchema } from "@shared/schema";

export function registerLighthouseProfileRoutes(app: Express) {
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
}


