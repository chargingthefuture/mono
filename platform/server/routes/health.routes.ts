/**
 * Health check routes
 * Public endpoints for monitoring service health
 */

import express, { type Express } from "express";
import { healthCheckLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { performHealthCheck } from "../healthCheck";
import { logError } from "../errorLogger";
import { handleHealthCheck } from "./shared";

export function registerHealthRoutes(app: Express) {
  // Main platform health
  app.get("/api/health", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "main");
  }));

  // ChatGroups health
  app.get("/api/health/chatgroups", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "chatgroups");
  }));

  // Directory health
  app.get("/api/health/directory", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "directory");
  }));

  // GentlePulse health
  app.get("/api/health/gentlepulse", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "gentlepulse");
  }));

  // Chyme health
  app.get("/api/health/chyme", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "chyme");
  }));

  // Default Alive or Dead health
  app.get("/api/health/default-alive-or-dead", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "default-alive-or-dead");
  }));

  // Workforce Recruiter health
  app.get("/api/health/workforce-recruiter", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "workforce-recruiter");
  }));

  // LightHouse health
  app.get("/api/health/lighthouse", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "lighthouse");
  }));

  // LostMail health
  app.get("/api/health/lostmail", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "lostmail");
  }));

  // MechanicMatch health
  app.get("/api/health/mechanicmatch", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "mechanicmatch");
  }));

  // CompareNotes / Research health
  app.get("/api/health/research", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "research");
  }));

  // SocketRelay health
  app.get("/api/health/socketrelay", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "socketrelay");
  }));

  // SupportMatch health
  app.get("/api/health/supportmatch", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "supportmatch");
  }));

  // TrustTransport health
  app.get("/api/health/trusttransport", healthCheckLimiter, asyncHandler(async (req, res) => {
    await handleHealthCheck(req, res, "trusttransport");
  }));

  // Database health check endpoint
  app.get("/api/health/database", healthCheckLimiter, asyncHandler(async (req, res) => {
    try {
      const healthCheck = await performHealthCheck("database", true);
      const statusCode = healthCheck.status === 'down' ? 503 : 200;
      const externalStatus = healthCheck.status === 'up' ? 'ok' : 
                            healthCheck.status === 'degraded' ? 'degraded' : 'down';
      
      res.status(statusCode).json({
        status: externalStatus,
        service: "database",
        timestamp: healthCheck.timestamp,
        responseTime: healthCheck.responseTime,
        ...(healthCheck.database && {
          database: {
            status: healthCheck.database.status === 'up' ? 'ok' : healthCheck.database.status,
            responseTime: healthCheck.database.responseTime,
            ...(healthCheck.database.error && { error: healthCheck.database.error }),
          },
        }),
        ...(healthCheck.error && { error: healthCheck.error }),
      });
    } catch (error: any) {
      logError(error, req, 'error');
      res.status(503).json({
        status: 'down',
        service: "database",
        timestamp: new Date().toISOString(),
        error: 'Database health check failed',
      });
    }
  }));

  // Aggregated health check endpoint - returns status of all services
  app.get("/api/health/all", healthCheckLimiter, asyncHandler(async (req, res) => {
    try {
      const services = [
        { name: "main", endpoint: "/api/health" },
        { name: "chatgroups", endpoint: "/api/health/chatgroups" },
        { name: "directory", endpoint: "/api/health/directory" },
        { name: "gentlepulse", endpoint: "/api/health/gentlepulse" },
        { name: "chyme", endpoint: "/api/health/chyme" },
        { name: "default-alive-or-dead", endpoint: "/api/health/default-alive-or-dead" },
        { name: "workforce-recruiter", endpoint: "/api/health/workforce-recruiter" },
        { name: "lighthouse", endpoint: "/api/health/lighthouse" },
        { name: "lostmail", endpoint: "/api/health/lostmail" },
        { name: "mechanicmatch", endpoint: "/api/health/mechanicmatch" },
        { name: "research", endpoint: "/api/health/research" },
        { name: "socketrelay", endpoint: "/api/health/socketrelay" },
        { name: "supportmatch", endpoint: "/api/health/supportmatch" },
        { name: "trusttransport", endpoint: "/api/health/trusttransport" },
      ];

      // Check all services in parallel
      const healthChecks = await Promise.all(
        services.map(service => performHealthCheck(service.name, true))
      );

      // Calculate overall status
      const allUp = healthChecks.every(h => h.status === 'up');
      const anyDown = healthChecks.some(h => h.status === 'down');
      const overallStatus = anyDown ? 'down' : allUp ? 'up' : 'degraded';
      const statusCode = overallStatus === 'down' ? 503 : 200;

      const summary = {
        status: overallStatus === 'up' ? 'ok' : overallStatus,
        timestamp: new Date().toISOString(),
        services: healthChecks.map(h => ({
          name: h.service,
          status: h.status === 'up' ? 'ok' : h.status,
          responseTime: h.responseTime,
          ...(h.error && { error: h.error }),
        })),
        summary: {
          total: healthChecks.length,
          up: healthChecks.filter(h => h.status === 'up').length,
          degraded: healthChecks.filter(h => h.status === 'degraded').length,
          down: healthChecks.filter(h => h.status === 'down').length,
        },
      };

      res.status(statusCode).json(summary);
    } catch (error: any) {
      logError(error, req, 'error');
      res.status(503).json({
        status: 'down',
        timestamp: new Date().toISOString(),
        error: 'Failed to check all services',
      });
    }
  }));
}

