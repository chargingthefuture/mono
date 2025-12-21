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
import { db } from "../../../db";
import { eq, lt } from "drizzle-orm";

export class AuthStorage {
  // ========================================
  // OTP CODE OPERATIONS
  // ========================================

  async createOTPCode(userId: string, code: string, expiresAt: Date): Promise<OTPCode> {
    // Delete any existing OTP for this user first
    await db.delete(otpCodes).where(eq(otpCodes.userId, userId));
    
    // Create new OTP
    const [otp] = await db.insert(otpCodes).values({
      userId,
      code,
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

  async createAuthToken(token: string, userId: string, expiresAt: Date): Promise<AuthToken> {
    const [authToken] = await db.insert(authTokens).values({
      token,
      userId,
      expiresAt,
    }).returning();
    
    return authToken;
  }
  
  async findAuthTokenByToken(token: string): Promise<AuthToken | undefined> {
    const [authToken] = await db
      .select()
      .from(authTokens)
      .where(eq(authTokens.token, token))
      .limit(1);
    return authToken;
  }
  
  async deleteAuthToken(token: string): Promise<void> {
    await db.delete(authTokens).where(eq(authTokens.token, token));
  }
  
  async deleteExpiredAuthTokens(): Promise<void> {
    const now = new Date();
    await db.delete(authTokens).where(lt(authTokens.expiresAt, now));
  }
}

