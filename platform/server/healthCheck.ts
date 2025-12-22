/**
 * Health Check Utilities
 * 
 * Provides utilities for performing actual health checks including:
 * - Database connectivity validation
 * - Response time tracking
 * - Status determination (up/degraded/down)
 * - Integration with status page services
 */

import { pool } from './db';
import { logStatusChange } from './statusPageIntegration';
import { logError, logInfo } from './errorLogger';

/**
 * Health check status levels
 */
export type HealthStatus = 'up' | 'degraded' | 'down';

/**
 * Health check response interface
 */
export interface HealthCheckResponse {
  status: HealthStatus;
  service: string;
  timestamp: string;
  responseTime: number;
  database?: {
    status: HealthStatus;
    responseTime: number;
    error?: string;
  };
  error?: string;
}

/**
 * Health check thresholds (in milliseconds)
 */
const HEALTH_CHECK_THRESHOLDS = {
  // Response time thresholds
  FAST: 200,      // < 200ms = up
  SLOW: 1000,     // 200-1000ms = degraded
  // > 1000ms = down (or error)
  
  // Database query timeout
  DB_TIMEOUT: 5000, // 5 seconds max for DB check
};

/**
 * Check database connectivity
 * Performs a lightweight query to verify database is accessible
 */
async function checkDatabaseConnectivity(): Promise<{
  status: HealthStatus;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Use pool.query directly for a simple health check
    // This is more reliable than using drizzle for a simple SELECT 1
    const result = await Promise.race([
      pool.query('SELECT 1 as health_check'),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), HEALTH_CHECK_THRESHOLDS.DB_TIMEOUT)
      )
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // Verify we got a result
    if (!result || !result.rows || result.rows.length === 0) {
      return {
        status: 'down',
        responseTime,
        error: 'Database query returned no results',
      };
    }
    
    // Determine status based on response time
    let status: HealthStatus = 'up';
    if (responseTime >= HEALTH_CHECK_THRESHOLDS.SLOW) {
      status = 'down';
    } else if (responseTime >= HEALTH_CHECK_THRESHOLDS.FAST) {
      status = 'degraded';
    }
    
    return {
      status,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error?.message || 'Unknown database error';
    
    logError(error, undefined, 'error');
    
    return {
      status: 'down',
      responseTime,
      error: errorMessage,
    };
  }
}

/**
 * Perform a health check for a service
 * 
 * @param serviceName - Name of the service being checked
 * @param checkDatabase - Whether to check database connectivity (default: true)
 * @returns Health check response
 */
export async function performHealthCheck(
  serviceName: string,
  checkDatabase: boolean = true
): Promise<HealthCheckResponse> {
  const overallStartTime = Date.now();
  let overallStatus: HealthStatus = 'up';
  let overallError: string | undefined;
  let dbCheckResult: { status: HealthStatus; responseTime: number; error?: string } | undefined;
  
  try {
    // Check database if requested
    if (checkDatabase) {
      dbCheckResult = await checkDatabaseConnectivity();
      
      // Overall status is at least as bad as database status
      if (dbCheckResult && dbCheckResult.status === 'down') {
        overallStatus = 'down';
        overallError = dbCheckResult.error;
      } else if (dbCheckResult && dbCheckResult.status === 'degraded' && overallStatus === 'up') {
        overallStatus = 'degraded';
      }
    }
    
    const overallResponseTime = Date.now() - overallStartTime;
    
    // Determine overall status based on response time if not already determined
    if (overallStatus === 'up') {
      if (overallResponseTime >= HEALTH_CHECK_THRESHOLDS.SLOW) {
        overallStatus = 'down';
      } else if (overallResponseTime >= HEALTH_CHECK_THRESHOLDS.FAST) {
        overallStatus = 'degraded';
      }
    }
    
    const response: HealthCheckResponse = {
      status: overallStatus,
      service: serviceName,
      timestamp: new Date().toISOString(),
      responseTime: overallResponseTime,
      ...(dbCheckResult && { database: dbCheckResult }),
      ...(overallError && { error: overallError }),
    };
    
    // Log status change to Sentry
    logStatusChange(
      serviceName,
      overallStatus,
      overallResponseTime,
      overallError ? new Error(overallError) : undefined
    );
    
    // Log health check result
    logInfo(`[Health Check] ${serviceName}: ${overallStatus} (${overallResponseTime}ms)`, undefined, {
      service: serviceName,
      status: overallStatus,
      responseTime: overallResponseTime,
      databaseStatus: dbCheckResult?.status,
      databaseResponseTime: dbCheckResult?.responseTime,
    });
    
    return response;
  } catch (error: any) {
    const overallResponseTime = Date.now() - overallStartTime;
    const errorMessage = error?.message || 'Unknown health check error';
    
    logError(error, undefined, 'error');
    
    const response: HealthCheckResponse = {
      status: 'down',
      service: serviceName,
      timestamp: new Date().toISOString(),
      responseTime: overallResponseTime,
      error: errorMessage,
    };
    
    // Log status change to Sentry
    logStatusChange(serviceName, 'down', overallResponseTime, error);
    
    return response;
  }
}

/**
 * Get database connection pool status
 * Useful for detailed health diagnostics
 */
export async function getDatabasePoolStatus(): Promise<{
  total: number;
  idle: number;
  waiting: number;
}> {
  try {
    // Note: Neon serverless pool may not expose these stats directly
    // This is a best-effort attempt
    return {
      total: pool.totalCount || 0,
      idle: pool.idleCount || 0,
      waiting: pool.waitingCount || 0,
    };
  } catch {
    return {
      total: 0,
      idle: 0,
      waiting: 0,
    };
  }
}

