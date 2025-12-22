/**
 * MechanicMatch Profile routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { publicListingLimiter, publicItemLimiter } from "../../rateLimiter";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { insertMechanicmatchProfileSchema, type MechanicmatchProfile, type User } from "@shared/schema";
import { rotateDisplayOrder, addAntiScrapingDelay, isLikelyBot } from "../../dataObfuscation";

export function registerMechanicMatchProfileRoutes(app: Express) {
  // Profile routes
  app.get('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    ) as MechanicmatchProfile | undefined;
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForMechanicmatchProfile'
    ) as User | undefined;
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
    ) as MechanicmatchProfile;
    res.json(profile);
  }));

  app.put('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfile(userId, req.body),
      'updateMechanicmatchProfile'
    ) as MechanicmatchProfile;
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
    ) as MechanicmatchProfile | undefined;
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
      ) as User | undefined;
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
    ) as MechanicmatchProfile[];
    const withVerification = await Promise.all(profiles.map(async (p: MechanicmatchProfile) => {
      let userIsVerified = false;
      let userFirstName: string | null = null;
      if (p.userId) {
        const userId = p.userId;
        const u = await withDatabaseErrorHandling(
          () => storage.getUser(userId),
          'getUserVerificationForPublicMechanicmatchList'
        ) as User | undefined;
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
}

