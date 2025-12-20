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
  directoryProfiles,
  skillsJobTitles,
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
import { eq, and, desc, or, gte, sql, inArray } from "drizzle-orm";
import { NotFoundError, ValidationError } from "../errors";
import { generateAnonymizedUserId } from "../core/utils";

export class WorkforceRecruiterStorage {
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

  async getWorkforceRecruiterSummaryReport(): Promise<{
    totalWorkforceTarget: number;
    totalCurrentRecruited: number;
    percentRecruited: number;
    sectorBreakdown: Array<{ sector: string; target: number; recruited: number; percent: number }>;
    skillLevelBreakdown: Array<{ skillLevel: string; target: number; recruited: number; percent: number }>;
    annualTrainingGap: Array<{ occupationId: string; occupationTitle: string; sector: string; target: number; actual: number; gap: number }>;
  }> {
    // Get all occupations
    const occupations = await db.select().from(workforceRecruiterOccupations);
    
    // Get all directory profiles (this is the source of truth for "recruited")
    const allDirectoryProfiles = await db.select().from(directoryProfiles);

    // Calculate totals
    const totalWorkforceTarget = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);
    // Count directory profiles instead of summing currentRecruited from occupations
    const totalCurrentRecruited = allDirectoryProfiles.length;
    const percentRecruited = totalWorkforceTarget > 0 ? (totalCurrentRecruited / totalWorkforceTarget) * 100 : 0;

    // Sector breakdown - count directory profiles that match each sector
    // Use case-insensitive matching for sectors
    const sectorMap = new Map<string, { target: number; recruited: number; normalizedKey: string }>();
    const sectorNormalizedToOriginal = new Map<string, string>(); // normalized -> original
    
    occupations.forEach(occ => {
      const normalizedSector = occ.sector.toLowerCase();
      if (!sectorNormalizedToOriginal.has(normalizedSector)) {
        sectorNormalizedToOriginal.set(normalizedSector, occ.sector);
      }
      const existing = sectorMap.get(normalizedSector) || { target: 0, recruited: 0, normalizedKey: normalizedSector };
      sectorMap.set(normalizedSector, {
        target: existing.target + occ.headcountTarget,
        recruited: existing.recruited, // Will be updated below
        normalizedKey: normalizedSector,
      });
    });
    
    // Count directory profiles per sector (case-insensitive matching)
    allDirectoryProfiles.forEach(profile => {
      if (profile.sectors && profile.sectors.length > 0) {
        profile.sectors.forEach(sector => {
          const normalizedSector = sector.toLowerCase();
          const existing = sectorMap.get(normalizedSector);
          if (existing) {
            existing.recruited += 1;
          }
        });
      }
    });
    
    const sectorBreakdown = Array.from(sectorMap.entries()).map(([normalizedSector, data]) => ({
      sector: sectorNormalizedToOriginal.get(normalizedSector) || normalizedSector,
      target: data.target,
      recruited: data.recruited,
      percent: data.target > 0 ? (data.recruited / data.target) * 100 : 0,
    })).sort((a, b) => b.target - a.target);

    // Skill level breakdown - count directory profiles that match occupations by skill level
    const skillLevelMap = new Map<string, { target: number; recruited: number }>();
    occupations.forEach(occ => {
      const existing = skillLevelMap.get(occ.skillLevel) || { target: 0, recruited: 0 };
      skillLevelMap.set(occ.skillLevel, {
        target: existing.target + occ.headcountTarget,
        recruited: existing.recruited, // Will be updated below
      });
    });
    
    // Count directory profiles per skill level by matching them to occupations
    // Use case-insensitive matching for sectors
    const skillLevelProfileCount = new Map<string, Set<string>>();
    allDirectoryProfiles.forEach(profile => {
      // Match profile to occupations based on sector, job title, or skills
      occupations.forEach(occ => {
        let matches = false;
        // Case-insensitive sector matching
        if (profile.sectors && profile.sectors.some(s => s.toLowerCase() === occ.sector.toLowerCase())) {
          matches = true;
        }
        if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
          matches = true;
        }
        if (matches) {
          if (!skillLevelProfileCount.has(occ.skillLevel)) {
            skillLevelProfileCount.set(occ.skillLevel, new Set());
          }
          skillLevelProfileCount.get(occ.skillLevel)!.add(profile.id);
        }
      });
    });
    
    // Update recruited counts for each skill level
    skillLevelProfileCount.forEach((profileIds, skillLevel) => {
      const existing = skillLevelMap.get(skillLevel);
      if (existing) {
        existing.recruited = profileIds.size;
      }
    });
    
    const skillLevelBreakdown = Array.from(skillLevelMap.entries()).map(([skillLevel, data]) => ({
      skillLevel,
      target: data.target,
      recruited: data.recruited,
      percent: data.target > 0 ? (data.recruited / data.target) * 100 : 0,
    })).sort((a, b) => {
      // Sort by skill level order: Foundational, Intermediate, Advanced
      const order = { 'Foundational': 0, 'Intermediate': 1, 'Advanced': 2 };
      return (order[a.skillLevel as keyof typeof order] ?? 99) - (order[b.skillLevel as keyof typeof order] ?? 99);
    });

    // Annual training gap (target vs actual recruited) - use directory profile count per occupation
    // Use case-insensitive matching for sectors
    const occupationProfileCount = new Map<string, number>();
    allDirectoryProfiles.forEach(profile => {
      occupations.forEach(occ => {
        let matches = false;
        // Case-insensitive sector matching
        if (profile.sectors && profile.sectors.some(s => s.toLowerCase() === occ.sector.toLowerCase())) {
          matches = true;
        }
        if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
          matches = true;
        }
        if (matches) {
          occupationProfileCount.set(occ.id, (occupationProfileCount.get(occ.id) || 0) + 1);
        }
      });
    });
    
    const annualTrainingGap = occupations.map(occ => ({
      occupationId: occ.id,
      occupationTitle: occ.occupationTitle,
      sector: occ.sector,
      target: occ.annualTrainingTarget,
      actual: occupationProfileCount.get(occ.id) || 0,
      gap: occ.annualTrainingTarget - (occupationProfileCount.get(occ.id) || 0),
    })).filter(item => item.gap > 0).sort((a, b) => b.gap - a.gap);

    return {
      totalWorkforceTarget,
      totalCurrentRecruited,
      percentRecruited,
      sectorBreakdown,
      skillLevelBreakdown,
      annualTrainingGap,
    };
  }

  async getWorkforceRecruiterSkillLevelDetail(skillLevel: string): Promise<{
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
      matchReason: string;
    }>;
  }> {
    // Get occupations for this skill level
    const occupations = await db
      .select()
      .from(workforceRecruiterOccupations)
      .where(eq(workforceRecruiterOccupations.skillLevel, skillLevel));

    const target = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);

    // Get directory profiles and match them to occupations
    // IMPORTANT: Show ALL directory profiles, not just those matching occupations
    // This ensures all 23 profiles appear in workforce recruiter
    const allProfiles = await db.select().from(directoryProfiles);
    const profiles = allProfiles.map(profile => {
      const matchingOccupations: Array<{ id: string; title: string; sector: string }> = [];
      let matchReason = 'none';

      // Match by sector, job title, or skill
      occupations.forEach(occ => {
        let matches = false;
        if (profile.sectors && profile.sectors.includes(occ.sector)) {
          matches = true;
          if (matchReason === 'none') matchReason = 'sector';
        }
        if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
          matches = true;
          matchReason = 'jobTitle';
        }
        if (profile.skills && occ.jobTitleId) {
          // Check if profile skills match any skills associated with the job title
          // This is a simplified match - in reality you'd need to check skills_job_titles relationships
          matches = true;
          if (matchReason === 'none') matchReason = 'skill';
        }

        if (matches) {
          matchingOccupations.push({
            id: occ.id,
            title: occ.occupationTitle,
            sector: occ.sector,
          });
        }
      });

      return {
        profileId: profile.id,
        displayName: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
        skills: profile.skills || [],
        sectors: profile.sectors || [],
        jobTitles: profile.jobTitles || [],
        matchingOccupations,
        matchReason: matchReason === 'none' && matchingOccupations.length === 0 ? 'general' : matchReason,
      };
    });
    // REMOVED: .filter(p => p.matchingOccupations.length > 0) - show ALL profiles
    // This ensures all 23 profiles appear in workforce recruiter detail views

    // Count only profiles that match this skill level's occupations
    // (But we still show all profiles in the list above)
    const matchingProfiles = profiles.filter(p => p.matchingOccupations.length > 0);
    const recruited = matchingProfiles.length;
    const percent = target > 0 ? (recruited / target) * 100 : 0;

    return {
      skillLevel,
      target,
      recruited,
      percent,
      profiles,
    };
  }

  async getWorkforceRecruiterSectorDetail(sector: string): Promise<{
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
  }> {
    // Get occupations for this sector (case-insensitive)
    const occupations = await db
      .select()
      .from(workforceRecruiterOccupations)
      .where(sql`LOWER(${workforceRecruiterOccupations.sector}) = LOWER(${sector})`);

    const target = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);
    
    // Get directory profiles and count those matching this sector (instead of using currentRecruited)
    // Use case-insensitive matching to match the occupation query
    const allProfiles = await db.select().from(directoryProfiles);
    const sectorLower = sector.toLowerCase();
    const profilesInSector = allProfiles.filter(profile => 
      profile.sectors && profile.sectors.some(s => s.toLowerCase() === sectorLower)
    );
    const recruited = profilesInSector.length;
    const percent = target > 0 ? (recruited / target) * 100 : 0;

    // Get job titles from occupations
    const jobTitleIds = occupations.map(occ => occ.jobTitleId).filter((id): id is string => id !== null);
    const jobTitles = jobTitleIds.length > 0
      ? await db.select().from(skillsJobTitles).where(inArray(skillsJobTitles.id, jobTitleIds))
      : [];

    // Count job titles
    const jobTitleCounts = new Map<string, number>();
    occupations.forEach(occ => {
      if (occ.jobTitleId) {
        jobTitleCounts.set(occ.jobTitleId, (jobTitleCounts.get(occ.jobTitleId) || 0) + 1);
      }
    });
    const jobTitleBreakdown = Array.from(jobTitleCounts.entries()).map(([id, count]) => {
      const jobTitle = jobTitles.find(jt => jt.id === id);
      return {
        id,
        name: jobTitle?.name || 'Unknown',
        count,
      };
    });

    // Count skills from directory profiles (skills are stored as text names, not IDs)
    const skillCounts = new Map<string, number>();
    // Count skills from profiles in this sector (use case-insensitive matching)
    profilesInSector.forEach(profile => {
      if (profile.skills) {
        // Directory profiles store skills as text names, not IDs
        profile.skills.forEach(skillName => {
          if (skillName && skillName.trim()) {
            // Use lowercase for case-insensitive counting
            const normalizedName = skillName.trim().toLowerCase();
            skillCounts.set(normalizedName, (skillCounts.get(normalizedName) || 0) + 1);
          }
        });
      }
    });
    // Convert to array with original case preserved (use first occurrence for display)
    const skillNameMap = new Map<string, string>(); // normalized -> original
    profilesInSector.forEach(profile => {
      if (profile.skills) {
        profile.skills.forEach(skillName => {
          if (skillName && skillName.trim()) {
            const normalizedName = skillName.trim().toLowerCase();
            if (!skillNameMap.has(normalizedName)) {
              skillNameMap.set(normalizedName, skillName.trim());
            }
          }
        });
      }
    });
    const skillBreakdown = Array.from(skillCounts.entries()).map(([normalizedName, count]) => {
      return {
        name: skillNameMap.get(normalizedName) || normalizedName,
        count,
      };
    }).sort((a, b) => b.count - a.count);

    // Get profiles matching this sector (use case-insensitive matching)
    const profiles = profilesInSector
      .map(profile => {
        const matchingOccupations = occupations
          .filter(occ => {
            // Match by sector (already filtered), job title, or skill
            if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
              return true;
            }
            return false;
          })
          .map(occ => ({
            id: occ.id,
            title: occ.occupationTitle,
            sector: occ.sector,
          }));

        return {
          profileId: profile.id,
          displayName: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
          skills: profile.skills || [],
          sectors: profile.sectors || [],
          jobTitles: profile.jobTitles || [],
          matchingOccupations,
          matchReason: matchingOccupations.length > 0 ? 'jobTitle' : 'sector',
        };
      });

    return {
      sector,
      target,
      recruited,
      percent,
      jobTitles: jobTitleBreakdown,
      skills: skillBreakdown,
      occupations: occupations.map(occ => ({
        id: occ.id,
        title: occ.occupationTitle,
        jobTitleId: occ.jobTitleId,
        headcountTarget: occ.headcountTarget,
        skillLevel: occ.skillLevel,
      })),
      profiles,
    };
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

