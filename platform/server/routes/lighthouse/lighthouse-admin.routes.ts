/**
 * Lighthouse Admin routes
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
import {
  insertLighthousePropertySchema,
  insertLighthouseMatchSchema,
} from "@shared/schema";

export function registerLighthouseAdminRoutes(app: Express) {
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
}


