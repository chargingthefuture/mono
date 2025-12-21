/**
 * Lighthouse routes - Main entry point
 * 
 * This file imports and registers all Lighthouse route modules.
 */

import express, { type Express } from "express";
import { registerLighthouseProfileRoutes } from "./lighthouse/lighthouse-profile.routes";
import { registerLighthousePropertyRoutes } from "./lighthouse/lighthouse-property.routes";
import { registerLighthouseMatchRoutes } from "./lighthouse/lighthouse-match.routes";
import { registerLighthouseAdminRoutes } from "./lighthouse/lighthouse-admin.routes";
import { registerLighthouseAnnouncementRoutes } from "./lighthouse/lighthouse-announcement.routes";

export function registerLighthouseRoutes(app: Express) {
  // Register all Lighthouse route modules
  registerLighthouseProfileRoutes(app);
  registerLighthousePropertyRoutes(app);
  registerLighthouseMatchRoutes(app);
  registerLighthouseAdminRoutes(app);
  registerLighthouseAnnouncementRoutes(app);
}
