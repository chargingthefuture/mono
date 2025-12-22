/**
 * Directory Storage Module
 * 
 * Handles all Directory mini-app operations: profiles and announcements.
 * Also includes legacy Directory Skills operations for backward compatibility.
 */

import {
  directoryProfiles,
  directoryAnnouncements,
  directorySkills,
  type DirectoryProfile,
  type InsertDirectoryProfile,
  type DirectoryAnnouncement,
  type InsertDirectoryAnnouncement,
  type DirectorySkill,
  type InsertDirectorySkill,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, asc, or, gte, sql } from "drizzle-orm";
import { NotFoundError } from "../../errors";
import { generateAnonymizedUserId, logProfileDeletion } from "../profile-deletion";

export class DirectoryStorage {
  // ========================================
  // DIRECTORY PROFILE OPERATIONS
  // ========================================

  async getDirectoryProfileById(id: string): Promise<DirectoryProfile | undefined> {
    const [profile] = await db
      .select()
      .from(directoryProfiles)
      .where(eq(directoryProfiles.id, id));
    return profile;
  }

  async getDirectoryProfileByUserId(userId: string): Promise<DirectoryProfile | undefined> {
    const [profile] = await db
      .select()
      .from(directoryProfiles)
      .where(eq(directoryProfiles.userId, userId));
    return profile;
  }

  async listAllDirectoryProfiles(): Promise<DirectoryProfile[]> {
    return await db
      .select()
      .from(directoryProfiles)
      .orderBy(desc(directoryProfiles.createdAt));
  }

  async listPublicDirectoryProfiles(): Promise<DirectoryProfile[]> {
    return await db
      .select()
      .from(directoryProfiles)
      .where(eq(directoryProfiles.isPublic, true))
      .orderBy(desc(directoryProfiles.createdAt));
  }

  async createDirectoryProfile(profileData: InsertDirectoryProfile): Promise<DirectoryProfile> {
    // Geocode location if city, state, or country is provided
    let coordinates: { latitude: number | null; longitude: number | null } | undefined;
    if (profileData.city || profileData.state || profileData.country) {
      const { geocodeLocation } = await import("../../geocoding");
      const coords = await geocodeLocation(
        profileData.city ?? null,
        profileData.state ?? null,
        profileData.country ?? null
      );
      if (coords) {
        coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
    }

    const [profile] = await db
      .insert(directoryProfiles)
      .values({
        ...profileData,
        // Description is optional at schema level; store empty string if missing
        description: (profileData as any).description ?? "",
        // Enforce max 3 skills at storage layer as defense-in-depth
        skills: (profileData.skills ?? []).slice(0, 3),
        // Enforce max 3 sectors and job titles at storage layer as defense-in-depth
        sectors: (profileData.sectors ?? []).slice(0, 3),
        jobTitles: (profileData.jobTitles ?? []).slice(0, 3),
        // Add geocoded coordinates
        ...(coordinates && coordinates.latitude !== null && coordinates.longitude !== null && {
          latitude: coordinates.latitude.toString(),
          longitude: coordinates.longitude.toString(),
        }),
      })
      .returning();
    return profile;
  }

  async updateDirectoryProfile(id: string, profileData: Partial<InsertDirectoryProfile>): Promise<DirectoryProfile> {
    // If location data is being updated, geocode it
    const locationChanged = 
      profileData.city !== undefined || 
      profileData.state !== undefined || 
      profileData.country !== undefined;

    let coordinates: { latitude: number | null; longitude: number | null } | undefined;
    if (locationChanged) {
      // Get current profile to merge location data
      const currentProfile = await db
        .select()
        .from(directoryProfiles)
        .where(eq(directoryProfiles.id, id))
        .limit(1);

      const city = profileData.city ?? currentProfile[0]?.city ?? null;
      const state = profileData.state ?? currentProfile[0]?.state ?? null;
      const country = profileData.country ?? currentProfile[0]?.country ?? null;

      if (city || state || country) {
        const { geocodeLocation } = await import("../../geocoding");
        const coords = await geocodeLocation(city, state, country);
        if (coords) {
          coordinates = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        } else {
          // If geocoding fails, clear coordinates
          coordinates = { latitude: null, longitude: null };
        }
      } else {
        // No location data, clear coordinates
        coordinates = { latitude: null, longitude: null };
      }
    }

    const updateData: any = {
      ...profileData,
      skills: profileData.skills ? profileData.skills.slice(0, 3) : undefined,
      sectors: profileData.sectors ? profileData.sectors.slice(0, 3) : undefined,
      jobTitles: profileData.jobTitles ? profileData.jobTitles.slice(0, 3) : undefined,
      updatedAt: new Date(),
      // Add geocoded coordinates if location changed
      ...(coordinates && {
        latitude: coordinates.latitude !== null ? coordinates.latitude.toString() : null,
        longitude: coordinates.longitude !== null ? coordinates.longitude.toString() : null,
      }),
    };
    // Remove null values that shouldn't be set to null in the DB
    if (updateData.description === null) delete updateData.description;
    const [profile] = await db
      .update(directoryProfiles)
      .set(updateData)
      .where(eq(directoryProfiles.id, id))
      .returning();
    return profile;
  }

  /**
   * Deletes a Directory profile by ID.
   * 
   * NOTE: This method is used for unclaimed profiles only and is EXEMPT from data integrity requirements.
   * Unclaimed profiles have no associated user account, so no anonymization, cascade handling, or
   * profile deletion logging is required. This is a simple hard delete.
   */
  async deleteDirectoryProfile(id: string): Promise<void> {
    await db.delete(directoryProfiles).where(eq(directoryProfiles.id, id));
  }

  // ========================================
  // DIRECTORY ANNOUNCEMENT OPERATIONS
  // ========================================

  async createDirectoryAnnouncement(announcementData: InsertDirectoryAnnouncement): Promise<DirectoryAnnouncement> {
    const [announcement] = await db
      .insert(directoryAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveDirectoryAnnouncements(): Promise<DirectoryAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(directoryAnnouncements)
      .where(
        and(
          eq(directoryAnnouncements.isActive, true),
          or(
            sql`${directoryAnnouncements.expiresAt} IS NULL`,
            gte(directoryAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(directoryAnnouncements.createdAt));
  }
  
  async getAllDirectoryAnnouncements(): Promise<DirectoryAnnouncement[]> {
    return await db
      .select()
      .from(directoryAnnouncements)
      .orderBy(desc(directoryAnnouncements.createdAt));
  }
  
  async updateDirectoryAnnouncement(id: string, announcementData: Partial<InsertDirectoryAnnouncement>): Promise<DirectoryAnnouncement> {
    const [announcement] = await db
      .update(directoryAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(directoryAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateDirectoryAnnouncement(id: string): Promise<DirectoryAnnouncement> {
    const [announcement] = await db
      .update(directoryAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(directoryAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // DIRECTORY SKILLS OPERATIONS (Legacy)
  // ========================================
  // These are kept for backward compatibility with the Directory app
  // The shared Skills database (Sector → Job Title → Skills) is the preferred approach

  async getAllDirectorySkills(): Promise<DirectorySkill[]> {
    return await db
      .select()
      .from(directorySkills)
      .orderBy(asc(directorySkills.name));
  }
  
  async createDirectorySkill(skillData: InsertDirectorySkill): Promise<DirectorySkill> {
    const [skill] = await db
      .insert(directorySkills)
      .values(skillData)
      .returning();
    return skill;
  }
  
  async deleteDirectorySkill(id: string): Promise<void> {
    await db
      .delete(directorySkills)
      .where(eq(directorySkills.id, id));
  }

  async deleteDirectoryProfileWithCascade(userId: string, reason?: string): Promise<void> {
    const profile = await this.getDirectoryProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError("Directory profile");
    }

    const anonymizedUserId = generateAnonymizedUserId();

    // Anonymize related data
    try {
      // Anonymize announcements where user is createdBy (if announcements have createdBy field)
      // Note: Check schema to see if directoryAnnouncements has createdBy field
      // For now, we'll just delete the profile as Directory doesn't have much user-specific data
    } catch (error: any) {
      console.warn(`Failed to anonymize Directory related data: ${error.message}`);
    }

    // Delete the profile
    await db.delete(directoryProfiles).where(eq(directoryProfiles.userId, userId));

    // Log the deletion
    await logProfileDeletion(userId, "directory", reason);
  }
}

