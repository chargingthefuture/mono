/**
 * MechanicMatch routes - Main entry point
 * 
 * This file imports and registers all MechanicMatch route modules.
 */

import express, { type Express } from "express";
import { registerMechanicMatchProfileRoutes } from "./mechanicmatch/mechanicmatch-profile.routes";
import { registerMechanicMatchVehicleRoutes } from "./mechanicmatch/mechanicmatch-vehicle.routes";
import { registerMechanicMatchServiceRequestRoutes } from "./mechanicmatch/mechanicmatch-service-request.routes";
import { registerMechanicMatchJobRoutes } from "./mechanicmatch/mechanicmatch-job.routes";
import { registerMechanicMatchAvailabilityRoutes } from "./mechanicmatch/mechanicmatch-availability.routes";
import { registerMechanicMatchReviewRoutes } from "./mechanicmatch/mechanicmatch-review.routes";
import { registerMechanicMatchMessageRoutes } from "./mechanicmatch/mechanicmatch-message.routes";
import { registerMechanicMatchSearchRoutes } from "./mechanicmatch/mechanicmatch-search.routes";
import { registerMechanicMatchAnnouncementRoutes } from "./mechanicmatch/mechanicmatch-announcement.routes";
import { registerMechanicMatchAdminRoutes } from "./mechanicmatch/mechanicmatch-admin.routes";

export function registerMechanicMatchRoutes(app: Express) {
  // Register all MechanicMatch route modules
  registerMechanicMatchProfileRoutes(app);
  registerMechanicMatchVehicleRoutes(app);
  registerMechanicMatchServiceRequestRoutes(app);
  registerMechanicMatchJobRoutes(app);
  registerMechanicMatchAvailabilityRoutes(app);
  registerMechanicMatchReviewRoutes(app);
  registerMechanicMatchMessageRoutes(app);
  registerMechanicMatchSearchRoutes(app);
  registerMechanicMatchAnnouncementRoutes(app);
  registerMechanicMatchAdminRoutes(app);
}
