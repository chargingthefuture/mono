/**
 * MechanicMatch Vehicle routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { NotFoundError, ForbiddenError } from "../../errors";
import { insertMechanicmatchVehicleSchema } from "@shared/schema";

export function registerMechanicMatchVehicleRoutes(app: Express) {
  app.get('/api/mechanicmatch/vehicles', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const vehicles = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehiclesByOwner(userId),
      'getMechanicmatchVehiclesByOwner'
    );
    res.json(vehicles);
  }));

  app.get('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const vehicle = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehicleById(req.params.id),
      'getMechanicmatchVehicleById'
    );
    if (!vehicle) {
      throw new NotFoundError('Vehicle', req.params.id);
    }
    res.json(vehicle);
  }));

  app.post('/api/mechanicmatch/vehicles', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchVehicleSchema, req.body, 'Invalid vehicle data');
    const vehicle = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchVehicle({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchVehicle'
    );
    res.json(vehicle);
  }));

  app.put('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const vehicle = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehicleById(req.params.id),
      'getMechanicmatchVehicleById'
    );
    if (!vehicle || vehicle.ownerId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchVehicle(req.params.id, req.body),
      'updateMechanicmatchVehicle'
    );
    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchVehicle(req.params.id, userId),
      'deleteMechanicmatchVehicle'
    );
    res.json({ message: "Vehicle deleted successfully" });
  }));
}

