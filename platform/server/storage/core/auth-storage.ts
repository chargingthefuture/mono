/**
 * Auth Storage Module
 * 
 * Handles authentication operations: OTP codes and auth tokens.
 */

import {
  otpCodes,
  authTokens,
  type OTPCode,
  type InsertOTPCode,
  type AuthToken,
} from "@shared/schema";
import { db } from "../../db";
import { eq, lt } from "drizzle-orm";
import { hashToken } from "../../chymeJwt";

export class AuthStorage {
  // ========================================
  // OTP CODE OPERATIONS
  // ========================================

  async createOTPCode(userId: string, code: string, expiresAt: Date): Promise<OTPCode> {
    // Delete any existing OTP for this user first
    await db.delete(otpCodes).where(eq(otpCodes.userId, userId));
    
    // 🚨 CRITICAL: Normalize and validate code to prevent "text value too long" database errors
    // Database column is VARCHAR(16) as safety buffer, but we validate and normalize here
    // Supports both 6-digit OTP codes (legacy) and 8-character mobile auth codes (new)
    let normalizedCode = String(code || '').trim();
    
    // Remove any non-alphanumeric characters (safety for URL-encoded or malformed codes)
    // For OTP: digits only. For mobile auth: hex characters (A-F0-9)
    normalizedCode = normalizedCode.replace(/[^0-9A-Fa-f]/g, '');
    
    // Validate and enforce length constraints
    // OTP codes: 6 digits (legacy)
    // Mobile auth codes: 8 hex characters (new)
    const isOTPFormat = /^[0-9]{6}$/.test(normalizedCode);
    const isMobileAuthFormat = /^[A-F0-9]{8}$/.test(normalizedCode.toUpperCase());
    
    if (normalizedCode.length > 16) {
      // Truncate if somehow longer than database limit (should never happen)
      console.error(`[AuthStorage] Code exceeds database limit (${normalizedCode.length} chars), truncating. Original: ${code.substring(0, 30)}...`);
      normalizedCode = normalizedCode.substring(0, 16);
    }
    
    // Validate format: must be either 6-digit OTP or 8-character mobile auth code
    if (!isOTPFormat && !isMobileAuthFormat) {
      // If not valid format, try to fix common issues
      if (normalizedCode.length > 8) {
        // Truncate to 8 if too long (likely mobile auth code)
        normalizedCode = normalizedCode.substring(0, 8).toUpperCase();
        if (!/^[A-F0-9]{8}$/.test(normalizedCode)) {
          throw new Error(`Invalid code format: length=${normalizedCode.length}, code=${normalizedCode.substring(0, 8)}. Expected 6 digits or 8 hex characters.`);
        }
      } else if (normalizedCode.length === 6 && /^[0-9]{6}$/.test(normalizedCode)) {
        // Valid 6-digit OTP
        // Keep as-is
      } else {
        throw new Error(`Invalid code format: length=${normalizedCode.length}, code=${normalizedCode.substring(0, 16)}. Expected 6 digits or 8 hex characters.`);
      }
    } else {
      // Normalize case for mobile auth codes
      if (isMobileAuthFormat) {
        normalizedCode = normalizedCode.toUpperCase();
      }
    }
    
    // Final length check before database insert (safety buffer)
    if (normalizedCode.length > 16) {
      throw new Error(`Code too long after normalization: ${normalizedCode.length} characters (max 16)`);
    }
    
    // Create new OTP
    const [otp] = await db.insert(otpCodes).values({
      userId,
      code: normalizedCode,
      expiresAt,
    }).returning();
    
    return otp;
  }
  
  async findOTPCodeByCode(code: string): Promise<OTPCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.code, code))
      .limit(1);
    return otp;
  }
  
  async deleteOTPCode(userId: string): Promise<void> {
    await db.delete(otpCodes).where(eq(otpCodes.userId, userId));
  }
  
  async deleteExpiredOTPCodes(): Promise<void> {
    const now = new Date();
    await db.delete(otpCodes).where(lt(otpCodes.expiresAt, now));
  }

  // ========================================
  // AUTH TOKEN OPERATIONS
  // ========================================

  /**
   * Create an auth token record
   * Stores a SHA-256 hash of the JWT token (64 hex characters) instead of the full token
   * This prevents "value too long" database errors and keeps storage size consistent
   */
  async createAuthToken(token: string, userId: string, expiresAt: Date): Promise<AuthToken> {
    // Hash the token before storing (SHA-256 produces 64 hex characters)
    const tokenHash = hashToken(token);
    
    const [authToken] = await db.insert(authTokens).values({
      token: tokenHash,
      userId,
      expiresAt,
    }).returning();
    
    return authToken;
  }
  
  /**
   * Find an auth token by hashing the provided token and looking up the hash
   * This allows us to check if a JWT token has been revoked without storing the full token
   */
  async findAuthTokenByToken(token: string): Promise<AuthToken | undefined> {
    // Hash the token to match what's stored in the database
    const tokenHash = hashToken(token);
    
    const [authToken] = await db
      .select()
      .from(authTokens)
      .where(eq(authTokens.token, tokenHash))
      .limit(1);
    return authToken;
  }
  
  /**
   * Delete an auth token by hashing the provided token and deleting the hash
   */
  async deleteAuthToken(token: string): Promise<void> {
    // Hash the token to match what's stored in the database
    const tokenHash = hashToken(token);
    await db.delete(authTokens).where(eq(authTokens.token, tokenHash));
  }
  
  async deleteExpiredAuthTokens(): Promise<void> {
    const now = new Date();
    await db.delete(authTokens).where(lt(authTokens.expiresAt, now));
  }
}

