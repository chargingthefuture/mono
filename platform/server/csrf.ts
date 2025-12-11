import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";

/**
 * CSRF Protection for Admin Endpoints
 * 
 * Implements double-submit cookie pattern:
 * 1. Server sets a CSRF token in both:
 *    - A cookie (httpOnly: false, so JS can read it)
 *    - Response body (for client to include in requests)
 * 2. Client must send the token in request header/body
 * 3. Server validates that cookie token matches request token
 * 
 * Also uses SameSite cookie attribute as additional protection.
 */

const CSRF_TOKEN_COOKIE_NAME = 'X-CSRF-Token';
const CSRF_TOKEN_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(req: Request): string | undefined {
  return req.cookies[CSRF_TOKEN_COOKIE_NAME];
}

/**
 * Get CSRF token from request header or body
 */
export function getCsrfTokenFromRequest(req: Request): string | undefined {
  // Check header first (preferred)
  const headerToken = req.headers[CSRF_TOKEN_HEADER_NAME.toLowerCase()];
  if (headerToken && typeof headerToken === 'string') {
    return headerToken;
  }
  
  // Fallback to body
  const bodyToken = (req.body as any)?._csrf;
  if (bodyToken && typeof bodyToken === 'string') {
    return bodyToken;
  }
  
  return undefined;
}

/**
 * Set CSRF token in cookie and return token value
 * Should be called on GET requests to admin pages
 */
export function setCsrfTokenCookie(req: Request, res: Response): string {
  const token = generateCsrfToken();
  
  // Set cookie with SameSite protection
  // httpOnly: false allows JavaScript to read it for double-submit pattern
  // secure: true ensures HTTPS-only
  // sameSite: 'strict' provides CSRF protection
  res.cookie(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: false, // Must be false for double-submit pattern
    secure: true, // HTTPS only
    sameSite: 'strict', // CSRF protection - strict is safest
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
  
  return token;
}

/**
 * Middleware to validate CSRF token for admin endpoints
 * 
 * This should be applied to all state-changing admin operations (POST, PUT, DELETE, PATCH)
 * 
 * GET requests should call setCsrfTokenCookie() to generate a token for the client
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Only validate state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }

  const cookieToken = getCsrfTokenFromCookie(req);
  const requestToken = getCsrfTokenFromRequest(req);

  // Both tokens must exist
  if (!cookieToken || !requestToken) {
    return res.status(403).json({
      message: 'CSRF token missing. Please refresh the page and try again.',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  // Tokens must match (double-submit cookie validation)
  if (cookieToken !== requestToken) {
    return res.status(403).json({
      message: 'CSRF token validation failed. Please refresh the page and try again.',
      code: 'CSRF_TOKEN_MISMATCH',
    });
  }

  // Tokens match - request is valid
  next();
};

/**
 * Middleware to generate and send CSRF token on GET requests to admin pages
 * Use this on admin dashboard/pages that will make subsequent requests
 */
export const generateCsrfTokenForAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Only for GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Generate and set token
  const token = setCsrfTokenCookie(req, res);
  
  // Also attach to response for frontend to use
  // The frontend can also read from cookie, but this makes it explicit
  res.locals.csrfToken = token;
  
  next();
};

/**
 * Helper to get CSRF token from response locals
 * Use this in route handlers that need to send the token to frontend
 */
export function getCsrfTokenFromResponse(res: Response): string | undefined {
  return res.locals.csrfToken;
}
