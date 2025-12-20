/**
 * Structured Error Logging Utility
 * 
 * Provides consistent, structured error logging with context information.
 * Logs include error details, request context, and stack traces for debugging.
 */

import { Request } from 'express';
import * as Sentry from '@sentry/node';
import { AppError, isAppError, normalizeError } from './errors';

export interface ErrorLogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  body?: any;
  query?: any;
  params?: any;
}

export interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  error: {
    name: string;
    message: string;
    code?: string;
    statusCode?: number;
    isOperational?: boolean;
    stack?: string;
    details?: any;
  };
  context?: ErrorLogContext;
  environment: string;
}

/**
 * Format error for logging
 */
function formatErrorForLogging(error: Error | AppError): ErrorLogEntry['error'] {
  const normalized = normalizeError(error);
  
  return {
    name: normalized.name,
    message: normalized.message,
    code: normalized.code,
    statusCode: normalized.statusCode,
    isOperational: normalized.isOperational,
    stack: error.stack,
    details: normalized.details,
  };
}

/**
 * Extract context from Express request
 */
function extractRequestContext(req?: Request): ErrorLogContext | undefined {
  if (!req || typeof req !== 'object') return undefined;

  // Additional defensive check: ensure req is actually a Request-like object
  // Check for common Request properties to avoid treating error objects as requests
  if (!('method' in req || 'url' in req || 'path' in req || 'headers' in req)) {
    return undefined;
  }

  try {
    // Safely extract request properties with defensive checks
    const path = req.path || req.url || 'unknown';
    const method = req.method || 'unknown';
    const query = req.query || {};
    const params = req.params || {};
    const ip = req.ip || (req.socket && typeof req.socket === 'object' ? req.socket.remoteAddress : undefined) || undefined;
    
    // More defensive check for user-agent: ensure req.get is actually a function before calling
    let userAgent: string | undefined;
    try {
      if (typeof req.get === 'function') {
        userAgent = req.get('user-agent') || undefined;
      } else if (req.headers && typeof req.headers === 'object' && 'user-agent' in req.headers) {
        userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
      }
    } catch (e) {
      // If accessing req.get or headers fails, just skip user-agent
      userAgent = undefined;
    }
    
    const body = req.body;

    return {
      userId: (req as any).user?.id || (req as any).userId || (req as any).auth?.userId,
      path,
      method,
      ip,
      userAgent: userAgent || undefined,
      query: Object.keys(query).length > 0 ? query : undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
      // Only log body for non-sensitive endpoints
      body: shouldLogBody(path) ? sanitizeBody(body) : undefined,
    };
  } catch (err) {
    // If extracting context fails, return undefined rather than throwing
    // This prevents error handling from causing additional errors
    console.warn('Failed to extract request context:', err);
    return undefined;
  }
}

/**
 * Determine if request body should be logged
 * Excludes sensitive endpoints like authentication, payments, etc.
 */
function shouldLogBody(path: string): boolean {
  const sensitivePaths = [
    '/api/auth',
    '/api/admin/payments',
    '/api/admin/users',
  ];
  
  return !sensitivePaths.some(sensitive => path.startsWith(sensitive));
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'cvv',
    'ssn',
    'socialSecurityNumber',
  ];

  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Log error with context
 */
export function logError(
  error: Error | AppError,
  context?: ErrorLogContext | Request,
  level: 'error' | 'warn' = 'error'
): void {
  // Safely extract context - check if it's a Request object
  let extractedContext: ErrorLogContext | undefined;
  if (context) {
    if (context instanceof Object && 'path' in context && typeof (context as any).path === 'string') {
      // It's likely a Request object
      extractedContext = extractRequestContext(context as Request);
    } else if (context instanceof Object && ('userId' in context || 'path' in context || 'method' in context)) {
      // It's already an ErrorLogContext
      extractedContext = context as ErrorLogContext;
    }
  }

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    error: formatErrorForLogging(error),
    context: extractedContext,
    environment: process.env.NODE_ENV || 'development',
  };

  // In production, use structured JSON logging
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(logEntry));
  } else {
    // In development, use more readable format
    console.error('\n=== ERROR LOG ===');
    console.error(`Timestamp: ${logEntry.timestamp}`);
    console.error(`Level: ${logEntry.level}`);
    console.error(`Error: ${logEntry.error.name} - ${logEntry.error.message}`);
    if (logEntry.error.code) {
      console.error(`Code: ${logEntry.error.code}`);
    }
    if (logEntry.context) {
      console.error('Context:', JSON.stringify(logEntry.context, null, 2));
    }
    if (logEntry.error.details) {
      console.error('Details:', JSON.stringify(logEntry.error.details, null, 2));
    }
    if (logEntry.error.stack) {
      console.error('Stack:', logEntry.error.stack);
    }
    console.error('=================\n');
  }

  // Send to Sentry if configured
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      level: level === 'warn' ? 'warning' : 'error',
      extra: logEntry.context as Record<string, any>,
      tags: {
        logLevel: level,
        environment: logEntry.environment,
      },
    });
  }
}

/**
 * Log warning
 */
export function logWarning(
  message: string,
  context?: ErrorLogContext | Request,
  details?: any
): void {
  // Safely extract context - check if it's a Request object
  let extractedContext: ErrorLogContext | undefined;
  if (context) {
    if (context instanceof Object && 'path' in context && typeof (context as any).path === 'string') {
      // It's likely a Request object
      extractedContext = extractRequestContext(context as Request);
    } else if (context instanceof Object && ('userId' in context || 'path' in context || 'method' in context)) {
      // It's already an ErrorLogContext
      extractedContext = context as ErrorLogContext;
    }
  }

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    error: {
      name: 'Warning',
      message,
      details,
    },
    context: extractedContext,
    environment: process.env.NODE_ENV || 'development',
  };

  if (process.env.NODE_ENV === 'production') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.warn(`[WARN] ${message}`, details || '');
  }
}

/**
 * Log info message
 */
export function logInfo(
  message: string,
  context?: ErrorLogContext | Request,
  details?: any
): void {
  // Safely extract context - check if it's a Request object
  let extractedContext: ErrorLogContext | undefined;
  if (context) {
    if (context instanceof Object && 'path' in context && typeof (context as any).path === 'string') {
      // It's likely a Request object
      extractedContext = extractRequestContext(context as Request);
    } else if (context instanceof Object && ('userId' in context || 'path' in context || 'method' in context)) {
      // It's already an ErrorLogContext
      extractedContext = context as ErrorLogContext;
    }
  }

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    error: {
      name: 'Info',
      message,
      details,
    },
    context: extractedContext,
    environment: process.env.NODE_ENV || 'development',
  };

  if (process.env.NODE_ENV === 'production') {
    console.info(JSON.stringify(logEntry));
  } else {
    console.info(`[INFO] ${message}`, details || '');
  }
}









