/**
 * Comprehensive Error Handling System
 * 
 * Custom error classes and utilities for consistent error handling across the application.
 * All errors include user-friendly messages and proper HTTP status codes.
 */

export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  
  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Rate limiting errors (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * Validation error (400)
 * Used for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message || 'Invalid input data provided',
      ErrorCode.VALIDATION_ERROR,
      400,
      true,
      details
    );
  }
}

/**
 * Unauthorized error (401)
 * Used when authentication is required but missing or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCode.UNAUTHORIZED, 401, true);
  }
}

/**
 * Forbidden error (403)
 * Used when user is authenticated but lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, ErrorCode.FORBIDDEN, 403, true);
  }
}

/**
 * Not found error (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, 404, true);
  }
}

/**
 * Conflict error (409)
 * Used when a resource conflict occurs (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict occurred', details?: any) {
    super(message, ErrorCode.CONFLICT, 409, true, details);
  }
}

/**
 * Rate limit error (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.', retryAfter?: number) {
    super(
      message,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      true,
      retryAfter ? { retryAfter } : undefined
    );
  }
}

/**
 * Database error (500)
 * Used for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: any) {
    super(
      message,
      ErrorCode.DATABASE_ERROR,
      500,
      false, // Database errors are not operational (unexpected)
      originalError ? { originalError: originalError.message } : undefined
    );
  }
}

/**
 * External service error (502/503)
 * Used when external service calls fail
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string = 'External service unavailable',
    statusCode: number = 503
  ) {
    super(
      `${service}: ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      statusCode,
      false,
      { service }
    );
  }
}

/**
 * Network error
 * Used for network-related failures
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed. Please check your connection.') {
    super(message, ErrorCode.NETWORK_ERROR, 0, false); // 0 indicates client-side error
  }
}

/**
 * Timeout error
 * Used when operations exceed time limits
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out. Please try again.') {
    super(message, ErrorCode.TIMEOUT, 408, false);
  }
}

/**
 * Check if error is an AppError instance
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if error is operational (expected, handled)
 */
export function isOperationalError(error: any): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert unknown error to AppError
 */
export function normalizeError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }

  // Handle Zod validation errors
  if (error?.name === 'ZodError' && error?.issues) {
    const issues = error.issues.map((issue: any) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return new ValidationError('Validation failed', { issues });
  }

  // Handle database constraint errors
  if (error?.code === '23505') { // PostgreSQL unique violation
    return new ConflictError('A record with this information already exists');
  }

  if (error?.code === '23503') { // PostgreSQL foreign key violation
    return new ValidationError('Referenced record does not exist');
  }

  if (error?.code === '23502') { // PostgreSQL not null violation
    return new ValidationError('Required field is missing');
  }

  // Handle network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return new NetworkError(error.message);
  }

  // Handle client disconnection errors (ECONNABORTED, EPIPE, ECONNRESET)
  // These are not server errors - they occur when clients abort connections
  // We should treat them as operational (expected) errors with appropriate status codes
  const nodeError = error as NodeJS.ErrnoException;
  if (nodeError?.code === 'ECONNABORTED' || 
      nodeError?.code === 'EPIPE' || 
      nodeError?.code === 'ECONNRESET' ||
      error?.message?.includes('Request aborted') ||
      error?.message?.includes('socket hang up')) {
    // Return a non-operational error (false) but with 499 status (client closed request)
    // 499 is a non-standard status code used by nginx for client closed connection
    // We use it here to indicate the client aborted, not a server error
    return new AppError(
      'Client disconnected',
      ErrorCode.CONNECTION_ERROR,
      499, // Client Closed Request
      false, // Not operational - it's a client-side action
      process.env.NODE_ENV === 'development' ? { originalError: error } : undefined
    );
  }

  // Default to internal server error
  return new AppError(
    error?.message || 'An unexpected error occurred',
    ErrorCode.INTERNAL_SERVER_ERROR,
    500,
    false,
    process.env.NODE_ENV === 'development' ? { originalError: error } : undefined
  );
}









