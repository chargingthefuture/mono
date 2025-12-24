/**
 * Chyme JWT Token Utility
 * 
 * Generates and validates JWT tokens for Chyme mobile app authentication.
 * Uses proper JWT signing with secret key and expiration.
 */

import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { logError } from './errorLogger';
import * as Sentry from '@sentry/node';

// JWT secret key (should be set in environment variables)
const JWT_SECRET = process.env.CHYME_JWT_SECRET || process.env.JWT_SECRET || 'change-me-in-production';

// Token expiration: 30 days
const TOKEN_EXPIRATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface ChymeTokenPayload {
  userId: string;
  type: 'chyme_mobile';
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for Chyme mobile authentication
 */
export function generateChymeToken(userId: string): string {
  try {
    const payload: ChymeTokenPayload = {
      userId,
      type: 'chyme_mobile',
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION_SECONDS,
      issuer: 'chargingthefuture.com',
      audience: 'chyme-mobile-app',
    });

    return token;
  } catch (error: any) {
    Sentry.captureException(error, {
      tags: { component: 'chymeJwt', action: 'generateToken' },
      extra: { userId },
    });
    logError(error, undefined);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid or expired
 */
export function verifyChymeToken(token: string): ChymeTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'chargingthefuture.com',
      audience: 'chyme-mobile-app',
    }) as ChymeTokenPayload;

    // Verify token type
    if (payload.type !== 'chyme_mobile') {
      return null;
    }

    return payload;
  } catch (error: any) {
    // JWT errors are expected for invalid/expired tokens
    // Only log unexpected errors
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      Sentry.captureException(error, {
        tags: { component: 'chymeJwt', action: 'verifyToken' },
        extra: { errorName: error.name },
      });
      logError(error, undefined);
    }
    return null;
  }
}

/**
 * Get token expiration date
 */
export function getTokenExpirationDate(): Date {
  return new Date(Date.now() + TOKEN_EXPIRATION_SECONDS * 1000);
}

/**
 * Hash a JWT token for database storage
 * Uses SHA-256 to produce a fixed 64-character hex string
 * This prevents "value too long" errors and keeps storage size consistent
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

