/**
 * User Deletion Storage Module
 * 
 * Handles user account deletion and data anonymization operations.
 */

import {
  users,
  loginEvents,
  otpCodes,
  authTokens,
  payments,
  adminActionLogs,
  npsResponses,
  gentlepulseMoodChecks,
} from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { generateAnonymizedUserId } from "./utils";

export class UserDeletionStorage {
  /**
   * Anonymizes all core user data before account deletion
   */
  async anonymizeUserData(userId: string): Promise<void> {
    const anonymizedUserId = generateAnonymizedUserId();

    try {
      // Anonymize login events
      await db
        .update(loginEvents)
        .set({ userId: anonymizedUserId })
        .where(eq(loginEvents.userId, userId));

      // Anonymize OTP codes
      await db
        .update(otpCodes)
        .set({ userId: anonymizedUserId })
        .where(eq(otpCodes.userId, userId));

      // Anonymize auth tokens
      await db
        .update(authTokens)
        .set({ userId: anonymizedUserId })
        .where(eq(authTokens.userId, userId));

      // Anonymize payments
      await db
        .update(payments)
        .set({ userId: anonymizedUserId })
        .where(eq(payments.userId, userId));

      // Anonymize admin action logs (uses adminId field)
      await db
        .update(adminActionLogs)
        .set({ adminId: anonymizedUserId })
        .where(eq(adminActionLogs.adminId, userId));

      // Anonymize NPS responses
      await db
        .update(npsResponses)
        .set({ userId: anonymizedUserId })
        .where(eq(npsResponses.userId, userId));

      // Anonymize GentlePulse mood checks (uses clientId field)
      await db
        .update(gentlepulseMoodChecks)
        .set({ clientId: anonymizedUserId })
        .where(eq(gentlepulseMoodChecks.clientId, userId));
    } catch (error: any) {
      console.warn(`Failed to anonymize core user data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a user account from the users table
   */
  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }
}

