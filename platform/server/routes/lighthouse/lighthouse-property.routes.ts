/**
 * Lighthouse Property routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { z } from "zod";
import { insertLighthousePropertySchema } from "@shared/schema";

export function registerLighthousePropertyRoutes(app: Express) {
  // Property browsing routes (for seekers)
  app.get('/api/lighthouse/properties', isAuthenticated, asyncHandler(async (_req, res) => {
    const properties = await withDatabaseErrorHandling(
      () => storage.getAllActiveProperties(),
      'getAllActiveProperties'
    );
    res.json(properties);
  }));

  app.get('/api/lighthouse/properties/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  }));

  // Property management routes (for hosts)
  app.get('/api/lighthouse/my-properties', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      console.warn(`[Lighthouse] Profile not found for user ${userId} in /api/lighthouse/my-properties`);
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    const properties = await withDatabaseErrorHandling(
      () => storage.getPropertiesByHost(profile.id),
      'getPropertiesByHost'
    );
    res.json(properties);
  }));

  app.post('/api/lighthouse/properties', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    if (profile.profileType !== 'host') {
      return res.status(403).json({ message: "Only hosts can create properties" });
    }
    
    // Validate and create property
    const validatedData = validateWithZod(insertLighthousePropertySchema, {
      ...req.body,
      hostId: profile.id,
    }, 'Invalid property data');
    const property = await withDatabaseErrorHandling(
      () => storage.createLighthouseProperty(validatedData),
      'createLighthouseProperty'
    );
    
    res.json(property);
  }));

  app.put('/api/lighthouse/properties/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (!profile || property.hostId !== profile.id) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }
    
    // Validate partial update (exclude hostId from being updated)
    const { hostId: _, ...updateData } = req.body;
    const validatedData = validateWithZod(insertLighthousePropertySchema.partial() as any, updateData, 'Invalid property update') as Partial<z.infer<typeof insertLighthousePropertySchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProperty(req.params.id, validatedData),
      'updateLighthouseProperty'
    );
    
    res.json(updated);
  }));
}


