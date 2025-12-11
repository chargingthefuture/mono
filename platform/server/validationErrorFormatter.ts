/**
 * Validation Error Formatter
 * 
 * Formats Zod validation errors into user-friendly messages.
 */

import { ZodError, ZodIssue } from 'zod';
import { ValidationError } from './errors';

/**
 * Format a single Zod issue into a user-friendly message
 */
function formatZodIssue(issue: ZodIssue): string {
  const path = issue.path.length > 0 
    ? issue.path.join('.')
    : 'field';

  switch (issue.code) {
    case 'invalid_type':
      return `${path}: Expected ${issue.expected}, received ${issue.received}`;
    
    case 'invalid_string':
      if (issue.validation === 'email') {
        return `${path}: Must be a valid email address`;
      }
      if (issue.validation === 'url') {
        return `${path}: Must be a valid URL`;
      }
      if (issue.validation === 'uuid') {
        return `${path}: Must be a valid UUID`;
      }
      return `${path}: ${issue.message}`;
    
    case 'too_small':
      if (issue.type === 'string') {
        return `${path}: Must be at least ${issue.minimum} characters`;
      }
      if (issue.type === 'number') {
        return `${path}: Must be at least ${issue.minimum}`;
      }
      if (issue.type === 'array') {
        return `${path}: Must have at least ${issue.minimum} items`;
      }
      return `${path}: ${issue.message}`;
    
    case 'too_big':
      if (issue.type === 'string') {
        return `${path}: Must be at most ${issue.maximum} characters`;
      }
      if (issue.type === 'number') {
        return `${path}: Must be at most ${issue.maximum}`;
      }
      if (issue.type === 'array') {
        return `${path}: Must have at most ${issue.maximum} items`;
      }
      return `${path}: ${issue.message}`;
    
    case 'invalid_enum_value':
      return `${path}: Must be one of: ${issue.options.join(', ')}`;
    
    case 'invalid_date':
      return `${path}: Must be a valid date`;
    
    case 'custom':
      return `${path}: ${issue.message}`;
    
    default:
      return `${path}: ${issue.message}`;
  }
}

/**
 * Format Zod error into user-friendly validation error
 */
export function formatZodError(error: ZodError): ValidationError {
  const issues = error.issues.map(formatZodIssue);
  const message = issues.length === 1 
    ? issues[0]
    : `Validation failed: ${issues.join('; ')}`;

  return new ValidationError(message, {
    issues: error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: formatZodIssue(issue),
      code: issue.code,
    })),
  });
}

/**
 * Validate data with Zod schema and throw formatted error on failure
 */
export function validateWithZod<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
  errorMessage?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formatted = formatZodError(error);
      if (errorMessage) {
        formatted.message = errorMessage;
      }
      throw formatted;
    }
    throw error;
  }
}

