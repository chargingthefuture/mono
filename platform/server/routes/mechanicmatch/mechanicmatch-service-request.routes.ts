/**
 * MechanicMatch Service Request routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated, getUserId } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { validateWithZod } from "../../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";
import { NotFoundError, ForbiddenError, ValidationError } from "../../errors";
import { insertMechanicmatchServiceRequestSchema, type MechanicmatchProfile, type MechanicmatchServiceRequest } from "@shared/schema";

export function registerMechanicMatchServiceRequestRoutes(app: Express) {
  app.get('/api/mechanicmatch/service-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const requests = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestsByOwnerPaginated(userId, limit, offset),
      'getMechanicmatchServiceRequestsByOwnerPaginated'
    ) as { items: MechanicmatchServiceRequest[]; total: number };
    res.json(requests);
  }));

  app.get('/api/mechanicmatch/service-requests/open', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getOpenMechanicmatchServiceRequests(),
      'getOpenMechanicmatchServiceRequests'
    ) as MechanicmatchServiceRequest[];
    res.json(requests);
  }));

  app.get('/api/mechanicmatch/service-requests/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestById(req.params.id),
      'getMechanicmatchServiceRequestById'
    ) as MechanicmatchServiceRequest | undefined;
    if (!request) {
      throw new NotFoundError('Service request', req.params.id);
    }
    res.json(request);
  }));

  app.post('/api/mechanicmatch/service-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    ) as MechanicmatchProfile | undefined;
    if (!profile || !profile.isCarOwner) {
      throw new ValidationError("You must be a car owner to create service requests");
    }
    const validatedData = validateWithZod(insertMechanicmatchServiceRequestSchema, req.body, 'Invalid service request data');
    const request = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchServiceRequest({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchServiceRequest'
    ) as MechanicmatchServiceRequest;
    res.json(request);
  }));

  app.put('/api/mechanicmatch/service-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestById(req.params.id),
      'getMechanicmatchServiceRequestById'
    ) as MechanicmatchServiceRequest | undefined;
    if (!request || request.ownerId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchServiceRequest(req.params.id, req.body),
      'updateMechanicmatchServiceRequest'
    ) as MechanicmatchServiceRequest;
    res.json(updated);
  }));
}

