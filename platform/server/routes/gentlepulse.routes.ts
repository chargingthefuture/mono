/**
 * GentlePulse routes
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
  insertGentlepulseMeditationSchema,
    insertGentlepulseRatingSchema,
    insertGentlepulseMoodCheckSchema,
    insertGentlepulseFavoriteSchema,
    insertGentlepulseAnnouncementSchema,
} from "@shared/schema";

export function registerGentlePulseRoutes(app: Express) {
  // GENTLEPULSE ROUTES

  // Helper to strip IP and metadata from request for privacy
  const stripIPAndMetadata = (req: any) => {
    // Remove IP, user-agent, and other identifying headers before storage
    delete req.ip;
    delete req.connection?.remoteAddress;
    delete req.socket?.remoteAddress;
    delete req.headers["x-forwarded-for"];
    delete req.headers["x-real-ip"];
  };

  // GentlePulse Announcement routes (public)
  app.get('/api/gentlepulse/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveGentlepulseAnnouncements(),
      'getActiveGentlepulseAnnouncements'
    );
    res.json(announcements);
  }));

  // GentlePulse Meditation routes (public)
  app.get('/api/gentlepulse/meditations', publicListingLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const filters: any = {};
    if (req.query.tag) filters.tag = req.query.tag as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    filters.limit = parseInt(req.query.limit as string || "50");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMeditations(filters),
      'getGentlepulseMeditations'
    );
    res.json(result);
  }));

  app.get('/api/gentlepulse/meditations/:id', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const meditation = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMeditationById(req.params.id),
      'getGentlepulseMeditationById'
    );
    if (!meditation) {
      throw new NotFoundError('Meditation', req.params.id);
    }
    res.json(meditation);
  }));

  // Track meditation play (increment play count)
  app.post('/api/gentlepulse/meditations/:id/play', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    await withDatabaseErrorHandling(
      () => storage.incrementGentlepulsePlayCount(req.params.id),
      'incrementGentlepulsePlayCount'
    );
    res.json({ message: "Play count updated" });
  }));

  // GentlePulse Rating routes (public, anonymous)
  app.post('/api/gentlepulse/ratings', publicItemLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const validatedData = validateWithZod(insertGentlepulseRatingSchema, req.body, 'Invalid rating data');
    const rating = await withDatabaseErrorHandling(
      () => storage.createOrUpdateGentlepulseRating(validatedData),
      'createOrUpdateGentlepulseRating'
    );
    
    logInfo(`GentlePulse rating submitted: meditation ${validatedData.meditationId}, rating ${validatedData.rating}`, req);
    
    res.json(rating);
  }));

  app.get('/api/gentlepulse/meditations/:id/ratings', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const ratings = await withDatabaseErrorHandling(
      () => storage.getGentlepulseRatingsByMeditationId(req.params.id),
      'getGentlepulseRatingsByMeditationId'
    );
    // Return only aggregated data, not individual ratings
    const average = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;
    res.json({ average: Number(average.toFixed(2)), count: ratings.length });
  }));

  // GentlePulse Mood Check routes (public, anonymous)
  app.post('/api/gentlepulse/mood', publicItemLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const validatedData = validateWithZod(insertGentlepulseMoodCheckSchema, {
      ...req.body,
      date: new Date().toISOString().split('T')[0], // Today's date
    }, 'Invalid mood check data');
    
    const moodCheck = await withDatabaseErrorHandling(
      () => storage.createGentlepulseMoodCheck(validatedData),
      'createGentlepulseMoodCheck'
    );
    
    // Check for suicide prevention trigger (3+ extremely negative moods in 7 days)
    const recentMoods = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMoodChecksByClientId(validatedData.clientId, 7),
      'getGentlepulseMoodChecksByClientId'
    );
    const extremelyNegative = recentMoods.filter(m => m.moodValue === 1).length;
    
    logInfo(`GentlePulse mood check submitted: client ${validatedData.clientId}, mood ${validatedData.moodValue}`, req);
    
    res.json({
      ...moodCheck,
      showSafetyMessage: extremelyNegative >= 3,
    });
  }));

  // Check if mood check should be shown (once every 7 days)
  app.get('/api/gentlepulse/mood/check-eligible', asyncHandler(async (req, res) => {
    const clientId = req.query.clientId as string;
    if (!clientId) {
      return res.json({ eligible: false });
    }

    const recentMoods = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMoodChecksByClientId(clientId, 7),
      'getGentlepulseMoodChecksByClientId'
    );
    const lastMood = recentMoods[0];
    
    if (!lastMood) {
      return res.json({ eligible: true });
    }

    const daysSinceLastMood = (Date.now() - new Date(lastMood.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    res.json({ eligible: daysSinceLastMood >= 7 });
  }));

  // GentlePulse Favorites routes (public, anonymous)
  app.post('/api/gentlepulse/favorites', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const validatedData = validateWithZod(insertGentlepulseFavoriteSchema, req.body, 'Invalid favorite data');
    const favorite = await withDatabaseErrorHandling(
      () => storage.createGentlepulseFavorite(validatedData),
      'createGentlepulseFavorite'
    );
    res.json(favorite);
  }));

  app.delete('/api/gentlepulse/favorites/:meditationId', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const clientId = req.query.clientId as string;
    if (!clientId) {
      throw new ValidationError("clientId required");
    }
    await withDatabaseErrorHandling(
      () => storage.deleteGentlepulseFavorite(clientId, req.params.meditationId),
      'deleteGentlepulseFavorite'
    );
    res.json({ message: "Favorite removed" });
  }));

  app.get('/api/gentlepulse/favorites', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const clientId = req.query.clientId as string;
    if (!clientId) {
      throw new ValidationError("clientId query parameter is required");
    }
    const favorites = await withDatabaseErrorHandling(
      () => storage.getGentlepulseFavoritesByClientId(clientId),
      'getGentlepulseFavoritesByClientId'
    );
    res.json(favorites.map(f => f.meditationId));
  }));

  app.get('/api/gentlepulse/favorites/check', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const clientId = req.query.clientId as string;
    const meditationId = req.query.meditationId as string;
    if (!clientId || !meditationId) {
      return res.json({ isFavorite: false });
    }
    const isFavorite = await withDatabaseErrorHandling(
      () => storage.isGentlepulseFavorite(clientId, meditationId),
      'isGentlepulseFavorite'
    );
    res.json({ isFavorite });
  }));


}
