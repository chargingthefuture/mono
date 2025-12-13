/**
 * Frontend Error Handling Utilities
 * 
 * Provides utilities for handling errors consistently in the frontend,
 * including network errors, validation errors, and user-friendly error messages.
 */

export enum FrontendErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface FrontendError {
  code: FrontendErrorCode;
  message: string;
  statusCode?: number;
  details?: any;
  originalError?: Error;
}

/**
 * Parse error from API response
 */
export function parseApiError(error: any): FrontendError {
  // Handle network errors (no response)
  const errorMessage = typeof error?.message === 'string' ? error.message : String(error?.message || '');
  if (!error || (errorMessage.includes('fetch') || errorMessage.includes('network'))) {
    return {
      code: FrontendErrorCode.NETWORK_ERROR,
      message: 'Network request failed. Please check your internet connection and try again.',
      originalError: error,
    };
  }

  // Handle timeout errors
  if (error.name === 'TimeoutError' || errorMessage.includes('timeout')) {
    return {
      code: FrontendErrorCode.TIMEOUT,
      message: 'Request timed out. Please try again.',
      originalError: error,
    };
  }

  // Handle error response from API
  if (errorMessage) {
    const message = errorMessage;
    
    // Extract status code from error message (format: "400: Error message")
    const statusMatch = typeof message === 'string' ? message.match(/^(\d+):\s*(.+)$/) : null;
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1], 10);
      const errorMessageText = statusMatch[2];

      // Parse JSON error if possible
      let parsedError: any = null;
      try {
        parsedError = JSON.parse(errorMessageText);
      } catch {
        // Not JSON, use as-is
      }

      const apiError = parsedError?.error || parsedError;
      const code = apiError?.code || getErrorCodeFromStatus(statusCode);
      const details = apiError?.details;

      return {
        code,
        message: apiError?.message || errorMessageText || getDefaultMessage(code),
        statusCode,
        details,
        originalError: error,
      };
    }

    // Try to parse as JSON error object
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        if (parsed.error) {
          return {
            code: parsed.error.code || FrontendErrorCode.UNKNOWN_ERROR,
            message: parsed.error.message || 'An error occurred',
            statusCode: parsed.error.statusCode,
            details: parsed.error.details,
            originalError: error,
          };
        }
      } catch {
        // Not JSON, continue
      }
    }
  }

  // Default error
  return {
    code: FrontendErrorCode.UNKNOWN_ERROR,
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    originalError: error,
  };
}

/**
 * Get error code from HTTP status code
 */
function getErrorCodeFromStatus(statusCode: number): FrontendErrorCode {
  if (statusCode >= 400 && statusCode < 500) {
    if (statusCode === 401) return FrontendErrorCode.UNAUTHORIZED;
    if (statusCode === 403) return FrontendErrorCode.FORBIDDEN;
    if (statusCode === 404) return FrontendErrorCode.NOT_FOUND;
    if (statusCode === 422) return FrontendErrorCode.VALIDATION_ERROR;
    return FrontendErrorCode.VALIDATION_ERROR;
  }
  if (statusCode >= 500) {
    return FrontendErrorCode.SERVER_ERROR;
  }
  return FrontendErrorCode.UNKNOWN_ERROR;
}

/**
 * Get default user-friendly message for error code
 */
function getDefaultMessage(code: FrontendErrorCode): string {
  switch (code) {
    case FrontendErrorCode.NETWORK_ERROR:
      return 'Network request failed. Please check your internet connection.';
    case FrontendErrorCode.TIMEOUT:
      return 'Request timed out. Please try again.';
    case FrontendErrorCode.VALIDATION_ERROR:
      return 'Please check your input and try again.';
    case FrontendErrorCode.UNAUTHORIZED:
      return 'You must be logged in to perform this action.';
    case FrontendErrorCode.FORBIDDEN:
      return 'You do not have permission to perform this action.';
    case FrontendErrorCode.NOT_FOUND:
      return 'The requested resource was not found.';
    case FrontendErrorCode.SERVER_ERROR:
      return 'Server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  const parsed = parseApiError(error);
  return parsed.message;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.code === FrontendErrorCode.NETWORK_ERROR;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.code === FrontendErrorCode.VALIDATION_ERROR;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.code === FrontendErrorCode.UNAUTHORIZED;
}

/**
 * Check if error is a server error
 */
export function isServerError(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.code === FrontendErrorCode.SERVER_ERROR;
}

/**
 * Format validation error details for display
 */
export function formatValidationErrors(details: any): string[] {
  if (!details) return [];

  if (Array.isArray(details.issues)) {
    return details.issues.map((issue: any) => 
      typeof issue === 'string' ? issue : issue.message || JSON.stringify(issue)
    );
  }

  if (typeof details === 'object') {
    return Object.entries(details).map(([key, value]) => 
      `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`
    );
  }

  return [String(details)];
}

