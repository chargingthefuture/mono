/**
 * Centralized Error Handler Middleware
 * 
 * Express middleware for handling errors consistently across the application.
 * Provides user-friendly error messages while logging detailed error information.
 */

import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError, normalizeError, isAppError, ErrorCode } from './errors';
import { logError } from './errorLogger';

/**
 * Error handler middleware
 * Must be added AFTER all routes
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Normalize error to AppError
  const error = normalizeError(err);

  // For client disconnection errors (499), don't log or send to Sentry
  // These are expected when clients abort connections
  if (error.statusCode === 499 && error.code === ErrorCode.CONNECTION_ERROR) {
    // Silently handle client disconnections - don't log as errors
    if (!res.headersSent) {
      res.status(499).end();
    }
    return;
  }

  // Safely extract request properties with defensive checks
  // Additional validation to ensure req is actually a Request object
  let safeReq: Request | null = null;
  try {
    if (req && typeof req === 'object' && typeof req.method === 'string') {
      safeReq = req;
    }
  } catch (err) {
    // If req is in an invalid state, set to null
    safeReq = null;
  }
  const path = safeReq?.path || safeReq?.url || 'unknown';
  const method = safeReq?.method || 'unknown';
  const query = safeReq?.query || {};
  const params = safeReq?.params || {};
  const url = safeReq?.url || safeReq?.originalUrl || 'unknown';
  const headers = safeReq?.headers || {};
  const userId = safeReq ? ((safeReq as any).auth?.userId || (safeReq as any).user?.id) : undefined;
  const userEmail = safeReq ? ((safeReq as any).user?.email) : undefined;

  // Send to Sentry (always if DSN is configured)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        errorCode: error.code,
        isOperational: error.isOperational,
      },
      extra: {
        statusCode: error.statusCode,
        details: error.details,
        path,
        method,
        query,
        params,
      },
      user: {
        id: userId,
        email: userEmail,
      },
      contexts: {
        request: {
          method,
          url,
          headers: {
            'user-agent': headers['user-agent'],
            'referer': headers['referer'],
          },
        },
      },
    });
  }

  // Log error with request context (only if req is valid)
  logError(error, safeReq || undefined);

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Prepare error response
  const errorResponse: any = {
    error: {
      message: error.message,
      code: error.code,
    },
  };

  // Include details in development or for operational errors
  if (process.env.NODE_ENV === 'development' || error.isOperational) {
    if (error.details) {
      errorResponse.error.details = error.details;
    }
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Async route handler wrapper
 * Automatically catches errors and passes them to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 * Must be added AFTER all routes but BEFORE error handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  // Safely extract request properties with defensive checks
  const method = req?.method || 'unknown';
  const path = req?.path || req?.url || 'unknown';
  const error = new AppError(
    `Route ${method} ${path} not found`,
    ErrorCode.NOT_FOUND,
    404,
    true
  );
  next(error);
}

/**
 * Create error response helper
 * For use in route handlers when you want to return errors
 */
export function createErrorResponse(
  error: Error | AppError,
  req?: Request
): { statusCode: number; body: any } {
  const normalized = normalizeError(error);
  
  logError(normalized, req);

  const response: any = {
    error: {
      message: normalized.message,
      code: normalized.code,
    },
  };

  if (process.env.NODE_ENV === 'development' || normalized.isOperational) {
    if (normalized.details) {
      response.error.details = normalized.details;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = normalized.stack;
  }

  return {
    statusCode: normalized.statusCode,
    body: response,
  };
}

