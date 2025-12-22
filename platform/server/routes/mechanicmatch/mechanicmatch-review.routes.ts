/**
 * MechanicMatch Review routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { insertMechanicmatchReviewSchema } from "@shared/schema";

export function registerMechanicMatchReviewRoutes(app: Express) {
  app.get('/api/mechanicmatch/reviews/mechanic/:mechanicId', isAuthenticated, asyncHandler(async (req, res) => {
    const reviews = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchReviewsByReviewee(req.params.mechanicId),
      'getMechanicmatchReviewsByReviewee'
    );
    res.json(reviews);
  }));

  app.get('/api/mechanicmatch/reviews/job/:jobId', isAuthenticated, asyncHandler(async (req, res) => {
    const reviews = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchReviewsByJob(req.params.jobId),
      'getMechanicmatchReviewsByJob'
    );
    res.json(reviews);
  }));

  app.post('/api/mechanicmatch/reviews', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchReviewSchema, req.body, 'Invalid review data');
    const review = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchReview({
        ...validatedData,
        reviewerId: userId,
      }),
      'createMechanicmatchReview'
    );
    res.json(review);
  }));
}

