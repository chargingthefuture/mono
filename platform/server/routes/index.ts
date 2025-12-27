/**
 * Routes index - Main route registration
 * 
 * This file imports and registers all route modules.
 * Route modules are organized by domain (health, auth, admin, mini-apps, etc.)
 */

import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "../auth";
import { fingerprintRequests } from "../antiScraping";
import { registerHealthRoutes } from "./health.routes";
import { registerAuthRoutes } from "./auth.routes";
import { registerWebhookRoutes } from "./webhooks.routes";
import { registerAdminRoutes } from "./admin.routes";
import { registerDirectoryRoutes } from "./directory.routes";
import { registerSupportMatchRoutes } from "./supportmatch.routes";
import { registerSkillsRoutes } from "./skills.routes";
import { registerChatGroupsRoutes } from "./chatgroups.routes";
import { registerLighthouseRoutes } from "./lighthouse.routes";
import { registerTrustTransportRoutes } from "./trusttransport.routes";
import { registerMechanicMatchRoutes } from "./mechanicmatch.routes";
import { registerResearchRoutes } from "./research.routes";
import { registerGentlePulseRoutes } from "./gentlepulse.routes";
import { registerLostMailRoutes } from "./lostmail.routes";
import { registerChymeRoutes } from "./chyme.routes";
import { registerChymeRoomsRoutes } from "./chyme-rooms.routes";
import { registerWorkforceRecruiterRoutes } from "./workforce-recruiter.routes";
import { registerDefaultAliveOrDeadRoutes } from "./default-alive-or-dead.routes";
import { registerSocketRelayRoutes } from "./socketrelay.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Anti-scraping: Fingerprint requests (must be before rate limiting)
  app.use(fingerprintRequests);

  // Register route modules
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerWebhookRoutes(app);
  registerAdminRoutes(app);
  registerDirectoryRoutes(app);
  registerSupportMatchRoutes(app);
  registerSkillsRoutes(app);
  registerChatGroupsRoutes(app);
  registerLighthouseRoutes(app);
  registerTrustTransportRoutes(app);
  registerMechanicMatchRoutes(app);
  registerResearchRoutes(app);
  registerGentlePulseRoutes(app);
  registerLostMailRoutes(app);
  registerChymeRoutes(app);
  registerChymeRoomsRoutes(app);
  registerWorkforceRecruiterRoutes(app);
  registerDefaultAliveOrDeadRoutes(app);
  registerSocketRelayRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}

