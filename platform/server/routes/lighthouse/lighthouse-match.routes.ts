/**
 * Lighthouse Match routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { z } from "zod";
import { insertLighthouseMatchSchema } from "@shared/schema";

export function registerLighthouseMatchRoutes(app: Express) {
  // Match routes
  app.get('/api/lighthouse/matches', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      console.warn(`[Lighthouse] Profile not found for user ${userId} in /api/lighthouse/matches`);
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    const matches = await withDatabaseErrorHandling(
      () => storage.getMatchesByProfile(profile.id),
      'getMatchesByProfile'
    );
    res.json(matches);
  }));

  app.post('/api/lighthouse/matches', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    if (profile.profileType !== 'seeker') {
      return res.status(403).json({ message: "Only seekers can request matches" });
    }
    
    const { propertyId, message } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    
    // Validate property exists
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(propertyId),
      'getLighthousePropertyById'
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if match already exists to prevent duplicates
    const existingMatches = await withDatabaseErrorHandling(
      () => storage.getMatchesBySeeker(profile.id),
      'getMatchesBySeeker'
    );
    const existingMatch = existingMatches.find(m => m.propertyId === propertyId);
    if (existingMatch && existingMatch.status !== 'cancelled') {
      return res.status(409).json({ 
        message: "You have already requested a match for this property",
        matchId: existingMatch.id 
      });
    }

    // Create match request (note: no hostId field, it's determined via property)
    const validatedData = validateWithZod(insertLighthouseMatchSchema, {
      seekerId: profile.id,
      propertyId,
      seekerMessage: message || null,
      status: 'pending',
    }, 'Invalid match data');
    const match = await withDatabaseErrorHandling(
      () => storage.createLighthouseMatch(validatedData),
      'createLighthouseMatch'
    );
    
    if (!match) {
      return res.status(500).json({ message: "Failed to create match request" });
    }
    
    res.json(match);
  }));

  app.put('/api/lighthouse/matches/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    const match = await withDatabaseErrorHandling(
      () => storage.getLighthouseMatchById(req.params.id),
      'getLighthouseMatchById'
    );
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    if (!profile) {
      return res.status(403).json({ message: "Profile not found" });
    }
    
    // Get property to determine host
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(match.propertyId),
      'getLighthousePropertyById'
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check authorization
    const isHost = property.hostId === profile.id;
    const isSeeker = match.seekerId === profile.id;
    
    if (!isHost && !isSeeker) {
      return res.status(403).json({ message: "You can only update your own matches" });
    }
    
    const { status, hostResponse } = req.body;
    
    // Only hosts can accept/reject matches
    if (status && status !== 'cancelled' && !isHost) {
      return res.status(403).json({ message: "Only the host can accept or reject matches" });
    }
    
    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (hostResponse && isHost) updateData.hostResponse = hostResponse;
    
    const validatedData = validateWithZod(insertLighthouseMatchSchema.partial() as any, updateData, 'Invalid match update') as Partial<z.infer<typeof insertLighthouseMatchSchema>>;
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseMatch(req.params.id, validatedData as any),
      'updateLighthouseMatch'
    );
    
    res.json(updated);
  }));
}


