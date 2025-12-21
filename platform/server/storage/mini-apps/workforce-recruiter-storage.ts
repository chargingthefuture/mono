/**
 * Workforce Recruiter Storage Module
 * 
 * Handles all Workforce Recruiter mini-app operations: profiles, config, occupations,
 * meetup events, signups, reports, and announcements.
 */

import {
  workforceRecruiterProfiles,
  workforceRecruiterConfig,
  workforceRecruiterOccupations,
  workforceRecruiterMeetupEvents,
  workforceRecruiterMeetupEventSignups,
  workforceRecruiterAnnouncements,
  users,
  type WorkforceRecruiterProfile,
  type InsertWorkforceRecruiterProfile,
  type WorkforceRecruiterConfig,
  type InsertWorkforceRecruiterConfig,
  type WorkforceRecruiterOccupation,
  type InsertWorkforceRecruiterOccupation,
  type WorkforceRecruiterMeetupEvent,
  type InsertWorkforceRecruiterMeetupEvent,
  type WorkforceRecruiterMeetupEventSignup,
  type InsertWorkforceRecruiterMeetupEventSignup,
  type WorkforceRecruiterAnnouncement,
  type InsertWorkforceRecruiterAnnouncement,
  type User,
  profileDeletionLogs,
  type ProfileDeletionLog,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, or, gte, sql } from "drizzle-orm";
import { NotFoundError, ValidationError } from "../errors";
import { generateAnonymizedUserId } from "../core/utils";
import { WorkforceRecruiterReports } from "./workforce-recruiter/reports";

export class WorkforceRecruiterStorage {
  private reports: WorkforceRecruiterReports;

  constructor() {
    this.reports = new WorkforceRecruiterReports();
  }

  // Helper method for logging profile deletions
  private async logProfileDeletion(userId: string, appName: string, reason?: string): Promise<ProfileDeletionLog> {
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

  // ========================================
  // WORKFORCE RECRUITER PROFILE OPERATIONS
  // ========================================

  async getWorkforceRecruiterProfile(userId: string): Promise<WorkforceRecruiterProfile | undefined> {
    const [profile] = await db
      .select()
      .from(workforceRecruiterProfiles)
      .where(eq(workforceRecruiterProfiles.userId, userId));
    return profile;
  }

  async createWorkforceRecruiterProfile(profileData: InsertWorkforceRecruiterProfile): Promise<WorkforceRecruiterProfile> {
    if (!profileData.userId) {
      throw new ValidationError('userId is required for WorkforceRecruiterProfile');
    }
    const [profile] = await db
      .insert(workforceRecruiterProfiles)
      .values(profileData as any)
      .returning();
    return profile;
  }

  async updateWorkforceRecruiterProfile(userId: string, profileData: Partial<InsertWorkforceRecruiterProfile>): Promise<WorkforceRecruiterProfile> {
    const [updated] = await db
      .update(workforceRecruiterProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(workforceRecruiterProfiles.userId, userId))
      .returning();
    return updated;
  }

  async deleteWorkforceRecruiterProfile(userId: string, reason?: string): Promise<void> {
    const profile = await this.getWorkforceRecruiterProfile(userId);
    if (!profile) {
      throw new NotFoundError("Workforce Recruiter profile");
    }

    const anonymizedUserId = generateAnonymizedUserId();

    // Anonymize related data (meetup events created by user, meetup event signups)
    try {
      await db
        .update(workforceRecruiterMeetupEvents)
        .set({ createdBy: anonymizedUserId })
        .where(eq(workforceRecruiterMeetupEvents.createdBy, userId));
      await db
        .update(workforceRecruiterMeetupEventSignups)
        .set({ userId: anonymizedUserId })
        .where(eq(workforceRecruiterMeetupEventSignups.userId, userId));
    } catch (error: any) {
      console.warn(`Failed to anonymize Workforce Recruiter related data: ${error.message}`);
    }

    // Delete the profile
    await db.delete(workforceRecruiterProfiles).where(eq(workforceRecruiterProfiles.userId, userId));

    // Log the deletion
    await this.logProfileDeletion(userId, "workforce_recruiter", reason);
  }

  // ========================================
  // WORKFORCE RECRUITER CONFIG OPERATIONS
  // ========================================

  async getWorkforceRecruiterConfig(): Promise<WorkforceRecruiterConfig | undefined> {
    const [config] = await db.select().from(workforceRecruiterConfig).limit(1);
    return config;
  }

  async createWorkforceRecruiterConfig(configData: InsertWorkforceRecruiterConfig): Promise<WorkforceRecruiterConfig> {
    // Convert number to string for decimal column
    const dataToInsert: any = { ...configData };
    if (dataToInsert.workforceParticipationRate !== undefined) {
      dataToInsert.workforceParticipationRate = dataToInsert.workforceParticipationRate.toString();
    }
    const [config] = await db
      .insert(workforceRecruiterConfig)
      .values(dataToInsert)
      .returning();
    return config;
  }

  async updateWorkforceRecruiterConfig(configData: Partial<InsertWorkforceRecruiterConfig>): Promise<WorkforceRecruiterConfig> {
    const existing = await this.getWorkforceRecruiterConfig();
    if (!existing) {
      // Create if doesn't exist
      return await this.createWorkforceRecruiterConfig({
        population: configData.population ?? 5000000,
        workforceParticipationRate: configData.workforceParticipationRate ?? 0.5,
        minRecruitable: configData.minRecruitable ?? 2000000,
        maxRecruitable: configData.maxRecruitable ?? 5000000,
      });
    }
    // Convert numeric fields to strings for drizzle
    const updateData: any = { ...configData };
    if (updateData.workforceParticipationRate !== undefined && updateData.workforceParticipationRate !== null && typeof updateData.workforceParticipationRate === 'number') {
      updateData.workforceParticipationRate = updateData.workforceParticipationRate.toString();
    }
    const [updated] = await db
      .update(workforceRecruiterConfig)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workforceRecruiterConfig.id, existing.id))
      .returning();
    return updated;
  }

  // ========================================
  // WORKFORCE RECRUITER OCCUPATION OPERATIONS
  // ========================================

  async getWorkforceRecruiterOccupation(id: string): Promise<WorkforceRecruiterOccupation | undefined> {
    const [occupation] = await db
      .select()
      .from(workforceRecruiterOccupations)
      .where(eq(workforceRecruiterOccupations.id, id));
    return occupation;
  }

  async getAllWorkforceRecruiterOccupations(filters?: {
    sector?: string;
    skillLevel?: 'Foundational' | 'Intermediate' | 'Advanced';
    limit?: number;
    offset?: number;
  }): Promise<{ occupations: WorkforceRecruiterOccupation[]; total: number }> {
    let query = db.select().from(workforceRecruiterOccupations);

    const conditions = [];
    if (filters?.sector && filters.sector !== "all") {
      // Use case-insensitive matching for sector
      conditions.push(sql`LOWER(${workforceRecruiterOccupations.sector}) = LOWER(${filters.sector})`);
    }
    if (filters?.skillLevel) {
      conditions.push(eq(workforceRecruiterOccupations.skillLevel, filters.skillLevel));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const allOccupations = await query;
    const total = allOccupations.length;

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const occupations = allOccupations.slice(offset, offset + limit);

    return { occupations, total };
  }

  async createWorkforceRecruiterOccupation(occupationData: InsertWorkforceRecruiterOccupation): Promise<WorkforceRecruiterOccupation> {
    // Validate sector is provided and not empty/whitespace
    if (!occupationData.sector || occupationData.sector.trim().length === 0) {
      throw new ValidationError("Sector is required and cannot be empty");
    }
    
    const [occupation] = await db
      .insert(workforceRecruiterOccupations)
      .values(occupationData)
      .returning();
    return occupation;
  }

  async updateWorkforceRecruiterOccupation(id: string, occupationData: Partial<InsertWorkforceRecruiterOccupation>): Promise<WorkforceRecruiterOccupation> {
    // Prevent clearing or setting empty sector
    if (occupationData.sector !== undefined) {
      if (!occupationData.sector || occupationData.sector.trim().length === 0) {
        throw new ValidationError("Sector cannot be empty. All occupations must have a valid sector.");
      }
    }
    
    // If updating sector, ensure it's not being set to empty
    // Also check existing occupation to ensure we don't lose the sector
    const existing = await this.getWorkforceRecruiterOccupation(id);
    if (!existing) {
      throw new NotFoundError("Occupation");
    }
    
    // If sector is being updated, validate it
    if (occupationData.sector !== undefined && (!occupationData.sector || occupationData.sector.trim().length === 0)) {
      throw new Error("Sector cannot be empty. All occupations must have a valid sector.");
    }
    
    const [updated] = await db
      .update(workforceRecruiterOccupations)
      .set({ ...occupationData, updatedAt: new Date() })
      .where(eq(workforceRecruiterOccupations.id, id))
      .returning();
    return updated;
  }

  async deleteWorkforceRecruiterOccupation(id: string): Promise<void> {
    await db.delete(workforceRecruiterOccupations).where(eq(workforceRecruiterOccupations.id, id));
  }

  // ========================================
  // WORKFORCE RECRUITER MEETUP EVENT OPERATIONS
  // ========================================

  async createWorkforceRecruiterMeetupEvent(eventData: InsertWorkforceRecruiterMeetupEvent & { createdBy: string }): Promise<WorkforceRecruiterMeetupEvent> {
    const [event] = await db
      .insert(workforceRecruiterMeetupEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getWorkforceRecruiterMeetupEvents(filters?: {
    occupationId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ events: WorkforceRecruiterMeetupEvent[]; total: number }> {
    let query = db.select().from(workforceRecruiterMeetupEvents);

    const conditions = [];
    if (filters?.occupationId) {
      conditions.push(eq(workforceRecruiterMeetupEvents.occupationId, filters.occupationId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(workforceRecruiterMeetupEvents.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(workforceRecruiterMeetupEvents.createdAt)) as any;

    const allEvents = await query;
    const total = allEvents.length;

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const events = allEvents.slice(offset, offset + limit);

    return { events, total };
  }

  async getWorkforceRecruiterMeetupEventById(id: string): Promise<WorkforceRecruiterMeetupEvent | undefined> {
    const [event] = await db
      .select()
      .from(workforceRecruiterMeetupEvents)
      .where(eq(workforceRecruiterMeetupEvents.id, id))
      .limit(1);
    return event;
  }

  async updateWorkforceRecruiterMeetupEvent(id: string, eventData: Partial<InsertWorkforceRecruiterMeetupEvent>): Promise<WorkforceRecruiterMeetupEvent> {
    const [event] = await db
      .update(workforceRecruiterMeetupEvents)
      .set({
        ...eventData,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterMeetupEvents.id, id))
      .returning();
    return event;
  }

  async deleteWorkforceRecruiterMeetupEvent(id: string): Promise<void> {
    await db.delete(workforceRecruiterMeetupEvents).where(eq(workforceRecruiterMeetupEvents.id, id));
  }

  // ========================================
  // WORKFORCE RECRUITER MEETUP EVENT SIGNUP OPERATIONS
  // ========================================

  async createWorkforceRecruiterMeetupEventSignup(signupData: InsertWorkforceRecruiterMeetupEventSignup & { userId: string }): Promise<WorkforceRecruiterMeetupEventSignup> {
    const [signup] = await db
      .insert(workforceRecruiterMeetupEventSignups)
      .values(signupData as any)
      .returning();
    return signup;
  }

  async getWorkforceRecruiterMeetupEventSignups(filters?: {
    eventId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ signups: (WorkforceRecruiterMeetupEventSignup & { user?: Pick<User, 'firstName' | 'lastName' | 'email'> | null })[], total: number }> {
    let query = db
      .select({
        id: workforceRecruiterMeetupEventSignups.id,
        eventId: workforceRecruiterMeetupEventSignups.eventId,
        userId: workforceRecruiterMeetupEventSignups.userId,
        location: workforceRecruiterMeetupEventSignups.location,
        preferredMeetupDate: workforceRecruiterMeetupEventSignups.preferredMeetupDate,
        availability: workforceRecruiterMeetupEventSignups.availability,
        whyInterested: workforceRecruiterMeetupEventSignups.whyInterested,
        additionalComments: workforceRecruiterMeetupEventSignups.additionalComments,
        createdAt: workforceRecruiterMeetupEventSignups.createdAt,
        updatedAt: workforceRecruiterMeetupEventSignups.updatedAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(workforceRecruiterMeetupEventSignups)
      .leftJoin(users, eq(workforceRecruiterMeetupEventSignups.userId, users.id));

    const conditions = [];
    if (filters?.eventId) {
      conditions.push(eq(workforceRecruiterMeetupEventSignups.eventId, filters.eventId));
    }
    if (filters?.userId) {
      conditions.push(eq(workforceRecruiterMeetupEventSignups.userId, filters.userId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(workforceRecruiterMeetupEventSignups.createdAt)) as any;

    const allSignups = await query;
    const total = allSignups.length;

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const signups = allSignups.slice(offset, offset + limit);

    // Transform the results to include user data
    const transformedSignups = signups.map((signup) => ({
      id: signup.id,
      eventId: signup.eventId,
      userId: signup.userId,
      location: signup.location,
      preferredMeetupDate: signup.preferredMeetupDate,
      availability: signup.availability,
      whyInterested: signup.whyInterested,
      additionalComments: signup.additionalComments,
      createdAt: signup.createdAt,
      updatedAt: signup.updatedAt,
      user: signup.userFirstName || signup.userLastName || signup.userEmail ? {
        firstName: signup.userFirstName || null,
        lastName: signup.userLastName || null,
        email: signup.userEmail || null,
      } : null,
    }));

    return {
      signups: transformedSignups,
      total,
    };
  }

  async getWorkforceRecruiterMeetupEventSignupCount(eventId: string): Promise<number> {
    const result = await this.getWorkforceRecruiterMeetupEventSignups({ eventId, limit: 10000, offset: 0 });
    return result.total;
  }

  async getUserMeetupEventSignup(eventId: string, userId: string): Promise<WorkforceRecruiterMeetupEventSignup | undefined> {
    const result = await this.getWorkforceRecruiterMeetupEventSignups({ eventId, userId, limit: 1, offset: 0 });
    return result.signups[0] as any;
  }

  async updateWorkforceRecruiterMeetupEventSignup(id: string, signupData: Partial<InsertWorkforceRecruiterMeetupEventSignup>): Promise<WorkforceRecruiterMeetupEventSignup> {
    const [updated] = await db
      .update(workforceRecruiterMeetupEventSignups)
      .set({ ...signupData, updatedAt: new Date() })
      .where(eq(workforceRecruiterMeetupEventSignups.id, id))
      .returning();
    return updated;
  }

  async deleteWorkforceRecruiterMeetupEventSignup(id: string): Promise<void> {
    await db.delete(workforceRecruiterMeetupEventSignups).where(eq(workforceRecruiterMeetupEventSignups.id, id));
  }

  // ========================================
  // WORKFORCE RECRUITER REPORT OPERATIONS
  // ========================================

  async getWorkforceRecruiterSummaryReport() {
    return this.reports.getSummaryReport();
  }

  async getWorkforceRecruiterSkillLevelDetail(skillLevel: string) {
    return this.reports.getSkillLevelDetail(skillLevel);
  }

  async getWorkforceRecruiterSectorDetail(sector: string) {
    return this.reports.getSectorDetail(sector);
  }

  // ========================================
  // WORKFORCE RECRUITER ANNOUNCEMENT OPERATIONS
  // ========================================

  async createWorkforceRecruiterAnnouncement(announcementData: InsertWorkforceRecruiterAnnouncement): Promise<WorkforceRecruiterAnnouncement> {
    const [announcement] = await db
      .insert(workforceRecruiterAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(workforceRecruiterAnnouncements)
      .where(
        and(
          eq(workforceRecruiterAnnouncements.isActive, true),
          or(
            sql`${workforceRecruiterAnnouncements.expiresAt} IS NULL`,
            gte(workforceRecruiterAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(workforceRecruiterAnnouncements.createdAt));
  }

  async getAllWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]> {
    return await db
      .select()
      .from(workforceRecruiterAnnouncements)
      .orderBy(desc(workforceRecruiterAnnouncements.createdAt));
  }

  async updateWorkforceRecruiterAnnouncement(id: string, announcementData: Partial<InsertWorkforceRecruiterAnnouncement>): Promise<WorkforceRecruiterAnnouncement> {
    const [announcement] = await db
      .update(workforceRecruiterAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateWorkforceRecruiterAnnouncement(id: string): Promise<WorkforceRecruiterAnnouncement> {
    const [announcement] = await db
      .update(workforceRecruiterAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterAnnouncements.id, id))
      .returning();
    return announcement;
  }
}

