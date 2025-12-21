/**
 * Profile Deletion Utility Module
 * 
 * Shared utilities for profile deletion operations across all mini-apps.
 * Handles anonymization, cascade deletion, and logging.
 */

import { db } from "../db";
import { profileDeletionLogs, type ProfileDeletionLog } from "@shared/schema";
import { generateAnonymizedUserId } from "./core/utils";

/**
 * Logs a profile deletion event
 */
export async function logProfileDeletion(
  userId: string,
  appName: string,
  reason?: string
): Promise<ProfileDeletionLog> {
  const [log] = await db
    .insert(profileDeletionLogs)
    .values({
      userId,
      appName,
      reason: reason || null,
    })
    .returning();
  return log;
}

/**
 * Generates an anonymized user ID for data anonymization
 * (Re-exported from utils for convenience)
 */
export { generateAnonymizedUserId };

