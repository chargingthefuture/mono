/**
 * MechanicMatch Job routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { NotFoundError, ForbiddenError, ValidationError } from "../../errors";
import { insertMechanicmatchJobSchema, type MechanicmatchProfile, type MechanicmatchJob } from "@shared/schema";

export function registerMechanicMatchJobRoutes(app: Express) {
  app.get('/api/mechanicmatch/jobs', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    ) as MechanicmatchProfile | undefined;
    if (!profile) {
      throw new NotFoundError('Profile');
    }
    
    let jobs: MechanicmatchJob[];
    if (profile.isCarOwner) {
      jobs = await withDatabaseErrorHandling(
        () => storage.getMechanicmatchJobsByOwner(userId),
        'getMechanicmatchJobsByOwner'
      ) as MechanicmatchJob[];
    } else if (profile.isMechanic) {
      jobs = await withDatabaseErrorHandling(
        () => storage.getMechanicmatchJobsByMechanic(profile.id),
        'getMechanicmatchJobsByMechanic'
      ) as MechanicmatchJob[];
    } else {
      console.warn(`[MechanicMatch] Profile ${profile.id} has no role (isCarOwner: ${profile.isCarOwner}, isMechanic: ${profile.isMechanic}) in /api/mechanicmatch/jobs`);
      return res.status(404).json({ message: "Profile role not set. Please set up your profile as a car owner or mechanic first." });
    }
    
    res.json(jobs);
  }));

  app.get('/api/mechanicmatch/jobs/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const job = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchJobById(req.params.id),
      'getMechanicmatchJobById'
    ) as MechanicmatchJob | undefined;
    if (!job) {
      throw new NotFoundError('Job', req.params.id);
    }
    res.json(job);
  }));

  app.post('/api/mechanicmatch/jobs', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchJobSchema, req.body, 'Invalid job data');
    const job = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchJob({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchJob'
    ) as MechanicmatchJob;
    res.json(job);
  }));

  app.put('/api/mechanicmatch/jobs/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const job = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchJobById(req.params.id),
      'getMechanicmatchJobById'
    ) as MechanicmatchJob | undefined;
    if (!job) {
      throw new NotFoundError('Job', req.params.id);
    }
    
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    ) as MechanicmatchProfile | undefined;
    if (!profile) {
      throw new NotFoundError('Profile');
    }
    
    // Only owner or assigned mechanic can update
    if (job.ownerId !== userId && job.mechanicId !== profile.id) {
      throw new ForbiddenError("Unauthorized");
    }
    
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchJob(req.params.id, req.body),
      'updateMechanicmatchJob'
    ) as MechanicmatchJob;
    res.json(updated);
  }));

  app.post('/api/mechanicmatch/jobs/:id/accept', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    ) as MechanicmatchProfile | undefined;
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to accept jobs");
    }
    const job = await withDatabaseErrorHandling(
      () => storage.acceptMechanicmatchJob(req.params.id, profile.id),
      'acceptMechanicmatchJob'
    ) as MechanicmatchJob;
    res.json(job);
  }));
}

