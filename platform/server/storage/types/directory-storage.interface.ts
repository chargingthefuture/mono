/**
 * Directory Storage Interface
 * 
 * Defines Directory mini-app storage operations.
 */

import type {
  DirectoryProfile,
  InsertDirectoryProfile,
  DirectorySkill,
  InsertDirectorySkill,
  DirectoryAnnouncement,
  InsertDirectoryAnnouncement,
} from "@shared/schema";

export interface IDirectoryStorage {
  // Profile operations
  getDirectoryProfileById(id: string): Promise<DirectoryProfile | undefined>;
  getDirectoryProfileByUserId(userId: string): Promise<DirectoryProfile | undefined>;
  listAllDirectoryProfiles(): Promise<DirectoryProfile[]>;
  listPublicDirectoryProfiles(): Promise<DirectoryProfile[]>;
  listPublicDirectoryProfilesWithUsers(): Promise<Array<DirectoryProfile & {
    userFirstName: string | null;
    userLastName: string | null;
    userIsVerified: boolean;
  }>>;
  createDirectoryProfile(profile: InsertDirectoryProfile): Promise<DirectoryProfile>;
  updateDirectoryProfile(id: string, profile: Partial<InsertDirectoryProfile>): Promise<DirectoryProfile>;
  deleteDirectoryProfile(id: string): Promise<void>;

  // Announcement operations
  createDirectoryAnnouncement(announcement: InsertDirectoryAnnouncement): Promise<DirectoryAnnouncement>;
  getActiveDirectoryAnnouncements(): Promise<DirectoryAnnouncement[]>;
  getAllDirectoryAnnouncements(): Promise<DirectoryAnnouncement[]>;
  updateDirectoryAnnouncement(id: string, announcement: Partial<InsertDirectoryAnnouncement>): Promise<DirectoryAnnouncement>;
  deactivateDirectoryAnnouncement(id: string): Promise<DirectoryAnnouncement>;

  // Skills operations (admin only) - Legacy, kept for backward compatibility
  getAllDirectorySkills(): Promise<DirectorySkill[]>;
  createDirectorySkill(skill: InsertDirectorySkill): Promise<DirectorySkill>;
  deleteDirectorySkill(id: string): Promise<void>;
  
  // Profile deletion
  deleteDirectoryProfileWithCascade(userId: string, reason?: string): Promise<void>;
}


