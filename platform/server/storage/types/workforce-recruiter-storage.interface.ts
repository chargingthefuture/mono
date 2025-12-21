/**
 * Workforce Recruiter Storage Interface
 * 
 * Defines Workforce Recruiter mini-app storage operations.
 */

import type {
  WorkforceRecruiterProfile,
  InsertWorkforceRecruiterProfile,
  WorkforceRecruiterConfig,
  InsertWorkforceRecruiterConfig,
  WorkforceRecruiterOccupation,
  InsertWorkforceRecruiterOccupation,
  WorkforceRecruiterMeetupEvent,
  InsertWorkforceRecruiterMeetupEvent,
  WorkforceRecruiterMeetupEventSignup,
  InsertWorkforceRecruiterMeetupEventSignup,
  WorkforceRecruiterAnnouncement,
  InsertWorkforceRecruiterAnnouncement,
} from "@shared/schema";

export interface IWorkforceRecruiterStorage {
  // Profile operations
  getWorkforceRecruiterProfile(userId: string): Promise<WorkforceRecruiterProfile | undefined>;
  createWorkforceRecruiterProfile(profile: InsertWorkforceRecruiterProfile): Promise<WorkforceRecruiterProfile>;
  updateWorkforceRecruiterProfile(userId: string, profile: Partial<InsertWorkforceRecruiterProfile>): Promise<WorkforceRecruiterProfile>;
  deleteWorkforceRecruiterProfile(userId: string, reason?: string): Promise<void>;

  // Config operations
  getWorkforceRecruiterConfig(): Promise<WorkforceRecruiterConfig | undefined>;
  updateWorkforceRecruiterConfig(config: Partial<InsertWorkforceRecruiterConfig>): Promise<WorkforceRecruiterConfig>;
  createWorkforceRecruiterConfig(config: InsertWorkforceRecruiterConfig): Promise<WorkforceRecruiterConfig>;

  // Occupation operations
  getWorkforceRecruiterOccupation(id: string): Promise<WorkforceRecruiterOccupation | undefined>;
  getAllWorkforceRecruiterOccupations(filters?: {
    sector?: string;
    skillLevel?: 'Foundational' | 'Intermediate' | 'Advanced';
    limit?: number;
    offset?: number;
  }): Promise<{ occupations: WorkforceRecruiterOccupation[]; total: number }>;
  createWorkforceRecruiterOccupation(occupation: InsertWorkforceRecruiterOccupation): Promise<WorkforceRecruiterOccupation>;
  updateWorkforceRecruiterOccupation(id: string, occupation: Partial<InsertWorkforceRecruiterOccupation>): Promise<WorkforceRecruiterOccupation>;
  deleteWorkforceRecruiterOccupation(id: string): Promise<void>;

  // Meetup Event operations
  createWorkforceRecruiterMeetupEvent(event: InsertWorkforceRecruiterMeetupEvent & { createdBy: string }): Promise<WorkforceRecruiterMeetupEvent>;
  getWorkforceRecruiterMeetupEvents(filters?: {
    occupationId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ events: WorkforceRecruiterMeetupEvent[]; total: number }>;
  getWorkforceRecruiterMeetupEventById(id: string): Promise<WorkforceRecruiterMeetupEvent | undefined>;
  updateWorkforceRecruiterMeetupEvent(id: string, event: Partial<InsertWorkforceRecruiterMeetupEvent>): Promise<WorkforceRecruiterMeetupEvent>;
  deleteWorkforceRecruiterMeetupEvent(id: string): Promise<void>;
  
  // Meetup Event Signup operations
  createWorkforceRecruiterMeetupEventSignup(signup: InsertWorkforceRecruiterMeetupEventSignup & { userId: string }): Promise<WorkforceRecruiterMeetupEventSignup>;
  getWorkforceRecruiterMeetupEventSignups(filters?: {
    eventId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ signups: WorkforceRecruiterMeetupEventSignup[]; total: number }>;
  getWorkforceRecruiterMeetupEventSignupCount(eventId: string): Promise<number>;
  getUserMeetupEventSignup(eventId: string, userId: string): Promise<WorkforceRecruiterMeetupEventSignup | undefined>;
  updateWorkforceRecruiterMeetupEventSignup(id: string, signup: Partial<InsertWorkforceRecruiterMeetupEventSignup>): Promise<WorkforceRecruiterMeetupEventSignup>;
  deleteWorkforceRecruiterMeetupEventSignup(id: string): Promise<void>;

  // Reports
  getWorkforceRecruiterSummaryReport(): Promise<{
    totalWorkforceTarget: number;
    totalCurrentRecruited: number;
    percentRecruited: number;
    sectorBreakdown: Array<{ sector: string; target: number; recruited: number; percent: number }>;
    skillLevelBreakdown: Array<{ skillLevel: string; target: number; recruited: number; percent: number }>;
    annualTrainingGap: Array<{ occupationId: string; occupationTitle: string; sector: string; target: number; actual: number; gap: number }>;
  }>;
  getWorkforceRecruiterSkillLevelDetail(skillLevel: string): Promise<{
    skillLevel: string;
    target: number;
    recruited: number;
    percent: number;
    profiles: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string; // "sector", "jobTitle", "skill", or "none"
    }>;
  }>;
  getWorkforceRecruiterSectorDetail(sector: string): Promise<{
    sector: string;
    target: number;
    recruited: number;
    percent: number;
    jobTitles: Array<{ id: string; name: string; count: number }>;
    skills: Array<{ name: string; count: number }>;
    occupations: Array<{ id: string; title: string; jobTitleId: string | null; headcountTarget: number; skillLevel: string }>;
    profiles: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string;
    }>;
  }>;

  // Announcement operations
  createWorkforceRecruiterAnnouncement(announcement: InsertWorkforceRecruiterAnnouncement): Promise<WorkforceRecruiterAnnouncement>;
  getActiveWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]>;
  getAllWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]>;
  updateWorkforceRecruiterAnnouncement(id: string, announcement: Partial<InsertWorkforceRecruiterAnnouncement>): Promise<WorkforceRecruiterAnnouncement>;
  deactivateWorkforceRecruiterAnnouncement(id: string): Promise<WorkforceRecruiterAnnouncement>;
}

