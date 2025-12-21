/**
 * SupportMatch Storage Interface
 * 
 * Defines SupportMatch mini-app storage operations.
 */

import type {
  SupportMatchProfile,
  InsertSupportMatchProfile,
  Partnership,
  InsertPartnership,
  Message,
  InsertMessage,
  Exclusion,
  InsertExclusion,
  Report,
  InsertReport,
  Announcement,
  InsertAnnouncement,
  SupportmatchAnnouncement,
  InsertSupportmatchAnnouncement,
} from "@shared/schema";

export interface ISupportMatchStorage {
  // Profile operations
  getSupportMatchProfile(userId: string): Promise<SupportMatchProfile | undefined>;
  createSupportMatchProfile(profile: InsertSupportMatchProfile): Promise<SupportMatchProfile>;
  updateSupportMatchProfile(userId: string, profile: Partial<InsertSupportMatchProfile>): Promise<SupportMatchProfile>;
  getAllActiveSupportMatchProfiles(): Promise<SupportMatchProfile[]>;
  getAllSupportMatchProfiles(): Promise<SupportMatchProfile[]>;
  
  // Partnership operations
  createPartnership(partnership: InsertPartnership): Promise<Partnership>;
  getPartnershipById(id: string): Promise<Partnership | undefined>;
  getActivePartnershipByUser(userId: string): Promise<Partnership | undefined>;
  getAllPartnerships(): Promise<Partnership[]>;
  getPartnershipHistory(userId: string): Promise<(Partnership & { partnerFirstName?: string | null; partnerLastName?: string | null })[]>;
  updatePartnershipStatus(id: string, status: string): Promise<Partnership>;
  createAlgorithmicMatches(): Promise<Partnership[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByPartnership(partnershipId: string): Promise<Message[]>;
  
  // Exclusion operations
  createExclusion(exclusion: InsertExclusion): Promise<Exclusion>;
  getExclusionsByUser(userId: string): Promise<Exclusion[]>;
  checkMutualExclusion(user1Id: string, user2Id: string): Promise<boolean>;
  deleteExclusion(id: string): Promise<void>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getAllReports(): Promise<Report[]>;
  updateReportStatus(id: string, status: string, resolution?: string): Promise<Report>;
  
  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAllAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deactivateAnnouncement(id: string): Promise<Announcement>;
  
  // App Announcement operations
  createSupportmatchAnnouncement(announcement: InsertSupportmatchAnnouncement): Promise<SupportmatchAnnouncement>;
  getActiveSupportmatchAnnouncements(): Promise<SupportmatchAnnouncement[]>;
  getAllSupportmatchAnnouncements(): Promise<SupportmatchAnnouncement[]>;
  updateSupportmatchAnnouncement(id: string, announcement: Partial<InsertSupportmatchAnnouncement>): Promise<SupportmatchAnnouncement>;
  deactivateSupportmatchAnnouncement(id: string): Promise<SupportmatchAnnouncement>;
  
  // Stats
  getSupportMatchStats(): Promise<{
    activeUsers: number;
    currentPartnerships: number;
    pendingReports: number;
  }>;
  
  // Profile deletion
  deleteSupportMatchProfile(userId: string, reason?: string): Promise<void>;
}


