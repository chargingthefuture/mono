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
        path: req.path,
        method: req.method,
        query: req.query,
        params: req.params,
      },
      user: {
        id: (req as any).auth?.userId || (req as any).user?.id,
        email: (req as any).user?.email,
      },
      contexts: {
        request: {
          method: req.method,
          url: req.url,
          headers: {
            'user-agent': req.headers['user-agent'],
            'referer': req.headers['referer'],
          },
        },
      },
    });
  }

  // Log error with request context
  logError(error, req);

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
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
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

