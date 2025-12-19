/**
 * Database Error Handler
 * 
 * Utilities for handling database-specific errors and converting them
 * to user-friendly application errors.
 */

import { DatabaseError, ValidationError, ConflictError, NotFoundError, ExternalServiceError } from './errors';
import { logError } from './errorLogger';

/**
 * PostgreSQL error interface
 * Compatible with both postgres package and Neon serverless errors
 */
interface PostgresError {
  code?: string;
  message?: string;
  detail?: string;
  constraint?: string;
  column?: string;
  table?: string;
  errno?: string | number;
  name?: string;
}

/**
 * Check if error is a connection/timeout error
 * Handles both PostgreSQL errors and Neon serverless connection errors
 */
function isConnectionError(error: any): boolean {
  // Check PostgreSQL error codes
  if (error?.code) {
    const connectionCodes = [
      '08006', // CONNECTION_FAILURE
      '08003', // CONNECTION_DOES_NOT_EXIST
      '08001', // CONNECTION_REFUSED
      '57014', // TIMEOUT
    ];
    if (connectionCodes.includes(error.code)) {
      return true;
    }
  }
  
  // Check error message for connection-related keywords
  const errorMessage = (error?.message || '').toLowerCase();
  const connectionKeywords = [
    'timeout',
    'econnrefused',
    'enotfound',
    'connection',
    'connect',
    'network',
    'socket',
    'closed',
    'refused',
    'unreachable',
  ];
  
  if (connectionKeywords.some(keyword => errorMessage.includes(keyword))) {
    return true;
  }
  
  // Check error name/code for Node.js network errors
  const errorName = (error?.name || '').toLowerCase();
  const errorCode = (error?.code || '').toLowerCase();
  const networkErrorCodes = [
    'etimedout',
    'econnrefused',
    'enotfound',
    'econnreset',
    'ehostunreach',
  ];
  
  if (networkErrorCodes.includes(errorCode) || networkErrorCodes.some(code => errorName.includes(code))) {
    return true;
  }
  
  return false;
}

/**
 * PostgreSQL error codes
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  EXCLUSION_VIOLATION: '23P01',
  INVALID_TEXT_REPRESENTATION: '22P02',
  NUMERIC_VALUE_OUT_OF_RANGE: '22003',
  STRING_DATA_RIGHT_TRUNCATION: '22001',
  INVALID_DATETIME_FORMAT: '22007',
  UNDEFINED_TABLE: '42P01',
  UNDEFINED_COLUMN: '42703',
  UNDEFINED_FUNCTION: '42883',
  DUPLICATE_COLUMN: '42701',
  DUPLICATE_TABLE: '42P07',
  SYNTAX_ERROR: '42601',
  INSUFFICIENT_PRIVILEGE: '42501',
  CONNECTION_FAILURE: '08006',
  CONNECTION_DOES_NOT_EXIST: '08003',
  CONNECTION_REFUSED: '08001',
  TIMEOUT: '57014',
} as const;

/**
 * Check if error is a PostgreSQL error
 */
export function isPostgresError(error: any): error is PostgresError {
  return error && typeof error.code === 'string' && error.code.length === 5;
}

/**
 * Convert database error to application error
 */
export function handleDatabaseError(error: any, context?: string): DatabaseError | ValidationError | ConflictError | NotFoundError | ExternalServiceError {
  // Normalize and log the error using the structured logging system
  const normalized = error instanceof Error ? error : new Error(String(error));
  logError(normalized, { 
    userId: undefined, 
    path: context 
  } as any);
  
  // Check if it's a connection/timeout error first (before checking if it's a PostgreSQL error)
  // This handles Neon serverless connection errors that might not have PostgreSQL error codes
  if (isConnectionError(error)) {
    return new ExternalServiceError(
      'Database',
      'Database temporarily unavailable. Please try again in a moment.',
      503
    );
  }
  
  if (!isPostgresError(error)) {
    // Not a PostgreSQL error, return generic database error
    // (Connection errors are already handled above)
    return new DatabaseError(
      context ? `Database error in ${context}` : 'Database operation failed',
      error
    );
  }

  const { code, message, detail, constraint } = error;

  switch (code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      // Extract field name from constraint name if possible
      const fieldName = constraint 
        ? constraint.replace(/_unique$|_pkey$/, '').replace(/_/g, ' ')
        : 'field';
      return new ConflictError(
        `A record with this ${fieldName} already exists`,
        { constraint, detail }
      );

    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return new ValidationError(
        'Referenced record does not exist or cannot be deleted',
        { constraint, detail }
      );

    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      // Try to extract column name from error detail or use constraint/column field
      let columnName = 'field';
      if (error.column) {
        columnName = error.column;
      } else if (constraint) {
        // Try to extract column from constraint name (e.g., "mechanicmatch_profiles_display_name_not_null" -> "display_name")
        const match = constraint.match(/_([a-z_]+)_not_null$/i) || constraint.match(/_([a-z_]+)$/i);
        if (match) {
          columnName = match[1].replace(/_/g, ' ');
        } else {
          columnName = constraint;
        }
      } else if (detail) {
        // Try to extract column from detail message
        const detailMatch = detail.match(/column "([^"]+)"/i);
        if (detailMatch) {
          columnName = detailMatch[1];
        }
      }
      return new ValidationError(
        `Required field '${columnName}' cannot be empty`,
        { constraint, detail, column: error.column }
      );

    case PG_ERROR_CODES.CHECK_VIOLATION:
      return new ValidationError(
        'Data validation failed',
        { constraint, detail, message }
      );

    case PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION:
      return new ValidationError(
        'Invalid data format provided',
        { detail, message }
      );

    case PG_ERROR_CODES.NUMERIC_VALUE_OUT_OF_RANGE:
      return new ValidationError(
        'Numeric value is out of valid range',
        { detail, message }
      );

    case PG_ERROR_CODES.STRING_DATA_RIGHT_TRUNCATION:
      return new ValidationError(
        'Text value is too long',
        { detail, message }
      );

    case PG_ERROR_CODES.INVALID_DATETIME_FORMAT:
      return new ValidationError(
        'Invalid date or time format',
        { detail, message }
      );

    case PG_ERROR_CODES.UNDEFINED_TABLE:
    case PG_ERROR_CODES.UNDEFINED_COLUMN:
    case PG_ERROR_CODES.UNDEFINED_FUNCTION:
      // These are programming errors, not user errors
      return new DatabaseError(
        'Database schema error. Please contact support.',
        error
      );

    case PG_ERROR_CODES.CONNECTION_FAILURE:
    case PG_ERROR_CODES.CONNECTION_DOES_NOT_EXIST:
    case PG_ERROR_CODES.CONNECTION_REFUSED:
      // Return 503 Service Unavailable for connection errors
      return new ExternalServiceError(
        'Database',
        'Database connection failed. Please try again in a moment.',
        503
      );

    case PG_ERROR_CODES.TIMEOUT:
      // Return 503 Service Unavailable for timeout errors
      return new ExternalServiceError(
        'Database',
        'Database operation timed out. Please try again in a moment.',
        503
      );

    case PG_ERROR_CODES.INSUFFICIENT_PRIVILEGE:
      return new DatabaseError(
        'Database permission error. Please contact support.',
        error
      );

    default:
      // Unknown PostgreSQL error
      return new DatabaseError(
        context ? `Database error in ${context}` : 'Database operation failed',
        error
      );
  }
}

/**
 * Wrap database operation with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // handleDatabaseError will log the error, so we just need to throw the converted error
    throw handleDatabaseError(error, context);
  }
}

