/**
 * Lighthouse Storage Interface
 * 
 * Defines Lighthouse mini-app storage operations.
 */

import type {
  LighthouseProfile,
  InsertLighthouseProfile,
  LighthouseProperty,
  InsertLighthouseProperty,
  LighthouseMatch,
  InsertLighthouseMatch,
  LighthouseAnnouncement,
  InsertLighthouseAnnouncement,
  LighthouseBlock,
  InsertLighthouseBlock,
} from "@shared/schema";

export interface ILighthouseStorage {
  // Profile operations
  createLighthouseProfile(profile: InsertLighthouseProfile): Promise<LighthouseProfile>;
  getLighthouseProfileByUserId(userId: string): Promise<LighthouseProfile | undefined>;
  getLighthouseProfileById(id: string): Promise<LighthouseProfile | undefined>;
  updateLighthouseProfile(id: string, profile: Partial<InsertLighthouseProfile>): Promise<LighthouseProfile>;
  getAllLighthouseProfiles(): Promise<LighthouseProfile[]>;
  getLighthouseProfilesByType(profileType: string): Promise<LighthouseProfile[]>;

  // Property operations
  createLighthouseProperty(property: InsertLighthouseProperty): Promise<LighthouseProperty>;
  getLighthousePropertyById(id: string): Promise<LighthouseProperty | undefined>;
  getPropertiesByHost(hostId: string): Promise<LighthouseProperty[]>;
  getAllActiveProperties(): Promise<LighthouseProperty[]>;
  getAllProperties(): Promise<LighthouseProperty[]>;
  updateLighthouseProperty(id: string, property: Partial<InsertLighthouseProperty>): Promise<LighthouseProperty>;
  deleteLighthouseProperty(id: string): Promise<void>;

  // Match operations
  createLighthouseMatch(match: InsertLighthouseMatch): Promise<LighthouseMatch>;
  getLighthouseMatchById(id: string): Promise<LighthouseMatch | undefined>;
  getMatchesBySeeker(seekerId: string): Promise<LighthouseMatch[]>;
  getMatchesByProperty(propertyId: string): Promise<LighthouseMatch[]>;
  getAllMatches(): Promise<LighthouseMatch[]>;
  updateLighthouseMatch(id: string, match: Partial<InsertLighthouseMatch>): Promise<LighthouseMatch>;

  // Stats
  getLighthouseStats(): Promise<{
    totalSeekers: number;
    totalHosts: number;
    totalProperties: number;
    activeMatches: number;
    completedMatches: number;
  }>;

  // Announcement operations
  createLighthouseAnnouncement(announcement: InsertLighthouseAnnouncement): Promise<LighthouseAnnouncement>;
  getActiveLighthouseAnnouncements(): Promise<LighthouseAnnouncement[]>;
  getAllLighthouseAnnouncements(): Promise<LighthouseAnnouncement[]>;
  updateLighthouseAnnouncement(id: string, announcement: Partial<InsertLighthouseAnnouncement>): Promise<LighthouseAnnouncement>;
  deactivateLighthouseAnnouncement(id: string): Promise<LighthouseAnnouncement>;

  // Block operations
  createLighthouseBlock(block: InsertLighthouseBlock): Promise<LighthouseBlock>;
  getLighthouseBlocksByUser(userId: string): Promise<LighthouseBlock[]>;
  checkLighthouseBlock(userId: string, blockedUserId: string): Promise<boolean>;
  deleteLighthouseBlock(id: string): Promise<void>;
  
  // Profile deletion
  deleteLighthouseProfile(userId: string, reason?: string): Promise<void>;
}


