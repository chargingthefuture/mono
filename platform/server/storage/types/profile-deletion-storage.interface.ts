/**
 * Profile Deletion Storage Interface
 * 
 * Defines profile deletion operations across all mini-apps.
 */

import type { ProfileDeletionLog, InsertProfileDeletionLog } from "@shared/schema";

export interface IProfileDeletionStorage {
  // Profile deletion operations with cascade anonymization
  deleteSupportMatchProfile(userId: string, reason?: string): Promise<void>;
  deleteLighthouseProfile(userId: string, reason?: string): Promise<void>;
  deleteSocketrelayProfile(userId: string, reason?: string): Promise<void>;
  deleteDirectoryProfileWithCascade(userId: string, reason?: string): Promise<void>;
  deleteTrusttransportProfile(userId: string, reason?: string): Promise<void>;
  deleteWorkforceRecruiterProfile(userId: string, reason?: string): Promise<void>;
  logProfileDeletion(userId: string, appName: string, reason?: string): Promise<ProfileDeletionLog>;
  
  // Complete account deletion - deletes user from all mini-apps and anonymizes all data
  deleteUserAccount(userId: string, reason?: string): Promise<void>;
}

