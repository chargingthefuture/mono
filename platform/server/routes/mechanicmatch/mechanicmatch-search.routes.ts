/**
 * MechanicMatch Search routes
 */

import express, { type Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";
import { asyncHandler } from "../../errorHandler";
import { withDatabaseErrorHandling } from "../../databaseErrorHandler";

export function registerMechanicMatchSearchRoutes(app: Express) {
  app.get('/api/mechanicmatch/search/mechanics', isAuthenticated, asyncHandler(async (req: any, res) => {
    const filters: any = {};
    if (req.query.city) filters.city = req.query.city;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.isMobileMechanic !== undefined) filters.isMobileMechanic = req.query.isMobileMechanic === 'true';
    if (req.query.maxHourlyRate) filters.maxHourlyRate = parseFloat(req.query.maxHourlyRate);
    if (req.query.minRating) filters.minRating = parseFloat(req.query.minRating);
    if (req.query.specialties) filters.specialties = Array.isArray(req.query.specialties) ? req.query.specialties : [req.query.specialties];
    
    const mechanics = await withDatabaseErrorHandling(
      () => storage.searchMechanicmatchMechanics(filters),
      'searchMechanicmatchMechanics'
    );
    
    // Enrich profiles with firstName from users for claimed profiles
    const enrichedMechanics = await Promise.all(mechanics.map(async (mechanic) => {
      let firstName: string | null = null;
      if (mechanic.userId) {
        // For claimed profiles, get firstName from user record
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(mechanic.userId!),
          'getUserForMechanicmatchSearch'
        );
        if (user) {
          firstName = (user.firstName && user.firstName.trim()) || null;
        }
      } else {
        // For unclaimed profiles, use profile's own firstName field
        firstName = (mechanic.firstName && mechanic.firstName.trim()) || null;
      }
      return { ...mechanic, firstName };
    }));
    
    res.json(enrichedMechanics);
  }));
}

