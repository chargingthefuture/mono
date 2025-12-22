/**
 * MechanicMatch Availability routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { ValidationError } from "../../errors";
import { insertMechanicmatchAvailabilitySchema } from "@shared/schema";

export function registerMechanicMatchAvailabilityRoutes(app: Express) {
  app.get('/api/mechanicmatch/availability', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to view availability");
    }
    const availability = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchAvailabilityByMechanic(profile.id),
      'getMechanicmatchAvailabilityByMechanic'
    );
    res.json(availability);
  }));

  app.post('/api/mechanicmatch/availability', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to set availability");
    }
    const validatedData = validateWithZod(insertMechanicmatchAvailabilitySchema, req.body, 'Invalid availability data');
    const availability = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchAvailability({
        ...validatedData,
        mechanicId: profile.id,
      }),
      'createMechanicmatchAvailability'
    );
    res.json(availability);
  }));

  app.put('/api/mechanicmatch/availability/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to update availability");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchAvailability(req.params.id, req.body),
      'updateMechanicmatchAvailability'
    );
    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/availability/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to delete availability");
    }
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchAvailability(req.params.id, profile.id),
      'deleteMechanicmatchAvailability'
    );
    res.json({ message: "Availability deleted successfully" });
  }));
}

