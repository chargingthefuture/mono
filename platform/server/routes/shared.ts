/**
 * Shared utilities and helpers for route modules
 */

import express from "express";
import { storage } from "../storage";
import { performHealthCheck } from "../healthCheck";
import { logError } from "../errorLogger";

/**
 * Helper function to handle health check responses
 */
export const handleHealthCheck = async (
  req: express.Request,
  res: express.Response,
  serviceName: string
) => {
  try {
    const healthCheck = await performHealthCheck(serviceName, true);
    
    // Map health status to HTTP status code
    // up/degraded = 200, down = 503
    const statusCode = healthCheck.status === 'down' ? 503 : 200;
    
    // Map internal status to external status for backward compatibility
    const externalStatus = healthCheck.status === 'up' ? 'ok' : 
                          healthCheck.status === 'degraded' ? 'degraded' : 'down';
    
    res.status(statusCode).json({
      status: externalStatus,
      service: healthCheck.service,
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
      service: serviceName,
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
};

/**
 * Helper to log admin actions
 */
export const logAdminAction = async (
  adminId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) => {
  try {
    await storage.createAdminActionLog({
      adminId,
      action,
      resourceType,
      resourceId: resourceId || null,
      details: details || null,
    });
  } catch (error) {
    // Note: req is not available in this context, so we log without it
    logError(error as Error, {} as express.Request, 'error');
  }
};

