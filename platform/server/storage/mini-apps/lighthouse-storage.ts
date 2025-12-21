/**
 * Lighthouse Storage Module
 * 
 * Handles all Lighthouse mini-app operations: profiles, properties, matches,
 * announcements, and blocks.
 */

import {
  lighthouseProfiles,
  lighthouseProperties,
  lighthouseMatches,
  lighthouseAnnouncements,
  lighthouseBlocks,
  type LighthouseProfile,
  type InsertLighthouseProfile,
  type LighthouseProperty,
  type InsertLighthouseProperty,
  type LighthouseMatch,
  type InsertLighthouseMatch,
  type LighthouseAnnouncement,
  type InsertLighthouseAnnouncement,
  type LighthouseBlock,
  type InsertLighthouseBlock,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, or, gte, sql, inArray } from "drizzle-orm";
import { NotFoundError } from "../../errors";
import { generateAnonymizedUserId, logProfileDeletion } from "../profile-deletion";

export class LighthouseStorage {
  // ========================================
  // LIGHTHOUSE PROFILE OPERATIONS
  // ========================================

  async createLighthouseProfile(profileData: InsertLighthouseProfile): Promise<LighthouseProfile> {
    const [profile] = await db
      .insert(lighthouseProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async getLighthouseProfileByUserId(userId: string): Promise<LighthouseProfile | undefined> {
    const [profile] = await db
      .select()
      .from(lighthouseProfiles)
      .where(eq(lighthouseProfiles.userId, userId));
    return profile;
  }

  async getLighthouseProfileById(id: string): Promise<LighthouseProfile | undefined> {
    const [profile] = await db
      .select()
      .from(lighthouseProfiles)
      .where(eq(lighthouseProfiles.id, id));
    return profile;
  }

  async updateLighthouseProfile(id: string, profileData: Partial<InsertLighthouseProfile>): Promise<LighthouseProfile> {
    const [profile] = await db
      .update(lighthouseProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(lighthouseProfiles.id, id))
      .returning();
    return profile;
  }

  async getAllLighthouseProfiles(): Promise<LighthouseProfile[]> {
    return await db
      .select()
      .from(lighthouseProfiles)
      .orderBy(desc(lighthouseProfiles.createdAt));
  }

  async getLighthouseProfilesByType(profileType: string): Promise<LighthouseProfile[]> {
    return await db
      .select()
      .from(lighthouseProfiles)
      .where(and(
        eq(lighthouseProfiles.profileType, profileType),
        eq(lighthouseProfiles.isActive, true)
      ))
      .orderBy(desc(lighthouseProfiles.createdAt));
  }

  // ========================================
  // LIGHTHOUSE PROPERTY OPERATIONS
  // ========================================

  async createLighthouseProperty(propertyData: InsertLighthouseProperty): Promise<LighthouseProperty> {
    const [property] = await db
      .insert(lighthouseProperties)
      .values(propertyData)
      .returning();
    return property;
  }

  async getLighthousePropertyById(id: string): Promise<LighthouseProperty | undefined> {
    const [property] = await db
      .select()
      .from(lighthouseProperties)
      .where(eq(lighthouseProperties.id, id));
    return property;
  }

  async getPropertiesByHost(hostId: string): Promise<LighthouseProperty[]> {
    return await db
      .select()
      .from(lighthouseProperties)
      .where(eq(lighthouseProperties.hostId, hostId))
      .orderBy(desc(lighthouseProperties.createdAt));
  }

  async getAllActiveProperties(): Promise<LighthouseProperty[]> {
    return await db
      .select()
      .from(lighthouseProperties)
      .where(eq(lighthouseProperties.isActive, true))
      .orderBy(desc(lighthouseProperties.createdAt));
  }

  async getAllProperties(): Promise<LighthouseProperty[]> {
    return await db
      .select()
      .from(lighthouseProperties)
      .orderBy(desc(lighthouseProperties.createdAt));
  }

  async updateLighthouseProperty(id: string, propertyData: Partial<InsertLighthouseProperty>): Promise<LighthouseProperty> {
    const [property] = await db
      .update(lighthouseProperties)
      .set({
        ...propertyData,
        updatedAt: new Date(),
      })
      .where(eq(lighthouseProperties.id, id))
      .returning();
    return property;
  }

  async deleteLighthouseProperty(id: string): Promise<void> {
    await db
      .delete(lighthouseProperties)
      .where(eq(lighthouseProperties.id, id));
  }

  // ========================================
  // LIGHTHOUSE MATCH OPERATIONS
  // ========================================

  async createLighthouseMatch(matchData: InsertLighthouseMatch): Promise<LighthouseMatch> {
    const [match] = await db
      .insert(lighthouseMatches)
      .values(matchData)
      .returning();
    return match;
  }

  async getLighthouseMatchById(id: string): Promise<LighthouseMatch | undefined> {
    const [match] = await db
      .select()
      .from(lighthouseMatches)
      .where(eq(lighthouseMatches.id, id));
    return match;
  }

  async getMatchesBySeeker(seekerId: string): Promise<LighthouseMatch[]> {
    return await db
      .select()
      .from(lighthouseMatches)
      .where(eq(lighthouseMatches.seekerId, seekerId))
      .orderBy(desc(lighthouseMatches.createdAt));
  }

  async getMatchesByProperty(propertyId: string): Promise<LighthouseMatch[]> {
    return await db
      .select()
      .from(lighthouseMatches)
      .where(eq(lighthouseMatches.propertyId, propertyId))
      .orderBy(desc(lighthouseMatches.createdAt));
  }

  async getMatchesByProfile(profileId: string): Promise<LighthouseMatch[]> {
    // Get matches where user is seeker
    const seekerMatches = await db
      .select()
      .from(lighthouseMatches)
      .where(eq(lighthouseMatches.seekerId, profileId));
    
    // Get matches where user is host (via their properties)
    const userProperties = await this.getPropertiesByHost(profileId);
    const propertyIds = userProperties.map(p => p.id);
    
    if (propertyIds.length === 0) {
      return seekerMatches;
    }
    
    const hostMatches = await db
      .select()
      .from(lighthouseMatches)
      .where(inArray(lighthouseMatches.propertyId, propertyIds));
    
    // Combine and deduplicate
    const allMatches = [...seekerMatches, ...hostMatches];
    const uniqueMatches = Array.from(
      new Map(allMatches.map(m => [m.id, m])).values()
    );
    
    return uniqueMatches;
  }

  async getAllMatches(): Promise<LighthouseMatch[]> {
    return await db
      .select()
      .from(lighthouseMatches)
      .orderBy(desc(lighthouseMatches.createdAt));
  }

  async getAllLighthouseMatches(): Promise<LighthouseMatch[]> {
    return await db
      .select()
      .from(lighthouseMatches)
      .orderBy(desc(lighthouseMatches.createdAt));
  }

  async updateLighthouseMatch(id: string, matchData: Partial<InsertLighthouseMatch>): Promise<LighthouseMatch> {
    const [match] = await db
      .update(lighthouseMatches)
      .set({
        ...matchData,
        updatedAt: new Date(),
      })
      .where(eq(lighthouseMatches.id, id))
      .returning();
    return match;
  }

  // ========================================
  // LIGHTHOUSE STATS
  // ========================================

  async getLighthouseStats() {
    const seekers = await db
      .select()
      .from(lighthouseProfiles)
      .where(and(
        eq(lighthouseProfiles.profileType, 'seeker'),
        eq(lighthouseProfiles.isActive, true)
      ));
      
    const hosts = await db
      .select()
      .from(lighthouseProfiles)
      .where(and(
        eq(lighthouseProfiles.profileType, 'host'),
        eq(lighthouseProfiles.isActive, true)
      ));
      
    const properties = await db
      .select()
      .from(lighthouseProperties)
      .where(eq(lighthouseProperties.isActive, true));
      
    const activeMatchesResult = await db
      .select()
      .from(lighthouseMatches)
      .where(or(
        eq(lighthouseMatches.status, 'pending'),
        eq(lighthouseMatches.status, 'accepted')
      ));
      
    const completedMatchesResult = await db
      .select()
      .from(lighthouseMatches)
      .where(eq(lighthouseMatches.status, 'completed'));
    
    return {
      totalSeekers: seekers.length,
      totalHosts: hosts.length,
      totalProperties: properties.length,
      activeMatches: activeMatchesResult.length,
      completedMatches: completedMatchesResult.length,
    };
  }

  // ========================================
  // LIGHTHOUSE ANNOUNCEMENT OPERATIONS
  // ========================================

  async createLighthouseAnnouncement(announcementData: InsertLighthouseAnnouncement): Promise<LighthouseAnnouncement> {
    const [announcement] = await db
      .insert(lighthouseAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveLighthouseAnnouncements(): Promise<LighthouseAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(lighthouseAnnouncements)
      .where(
        and(
          eq(lighthouseAnnouncements.isActive, true),
          or(
            sql`${lighthouseAnnouncements.expiresAt} IS NULL`,
            gte(lighthouseAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(lighthouseAnnouncements.createdAt));
  }
  
  async getAllLighthouseAnnouncements(): Promise<LighthouseAnnouncement[]> {
    return await db
      .select()
      .from(lighthouseAnnouncements)
      .orderBy(desc(lighthouseAnnouncements.createdAt));
  }
  
  async updateLighthouseAnnouncement(id: string, announcementData: Partial<InsertLighthouseAnnouncement>): Promise<LighthouseAnnouncement> {
    const [announcement] = await db
      .update(lighthouseAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(lighthouseAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateLighthouseAnnouncement(id: string): Promise<LighthouseAnnouncement> {
    const [announcement] = await db
      .update(lighthouseAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(lighthouseAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // LIGHTHOUSE BLOCK OPERATIONS
  // ========================================

  async createLighthouseBlock(block: InsertLighthouseBlock): Promise<LighthouseBlock> {
    const [created] = await db
      .insert(lighthouseBlocks)
      .values(block)
      .returning();
    return created;
  }

  async getLighthouseBlocksByUser(userId: string): Promise<LighthouseBlock[]> {
    return await db
      .select()
      .from(lighthouseBlocks)
      .where(eq(lighthouseBlocks.userId, userId));
  }

  async checkLighthouseBlock(userId: string, blockedUserId: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(lighthouseBlocks)
      .where(
        and(
          eq(lighthouseBlocks.userId, userId),
          eq(lighthouseBlocks.blockedUserId, blockedUserId)
        )
      )
      .limit(1);
    return !!block;
  }

  async deleteLighthouseBlock(id: string): Promise<void> {
    await db.delete(lighthouseBlocks).where(eq(lighthouseBlocks.id, id));
  }

  async deleteLighthouseProfile(userId: string, reason?: string): Promise<void> {
    const profile = await this.getLighthouseProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError("Lighthouse profile");
    }

    const anonymizedUserId = generateAnonymizedUserId();

    // Get all properties owned by this profile
    const userProperties = await this.getPropertiesByHost(profile.id);
    const propertyIds = userProperties.map(p => p.id);

    // Anonymize related data
    try {
      // Anonymize matches where user is seeker
      await db
        .update(lighthouseMatches)
        .set({ seekerId: anonymizedUserId })
        .where(eq(lighthouseMatches.seekerId, profile.id));

      // Anonymize matches where user is host (via their properties)
      if (propertyIds.length > 0) {
        await db
          .update(lighthouseMatches)
          .set({ propertyId: anonymizedUserId as any }) // Type workaround for propertyId
          .where(inArray(lighthouseMatches.propertyId, propertyIds));
      }

      // Anonymize blocks where user is userId or blockedUserId
      await db
        .update(lighthouseBlocks)
        .set({ userId: anonymizedUserId })
        .where(eq(lighthouseBlocks.userId, userId));
      await db
        .update(lighthouseBlocks)
        .set({ blockedUserId: anonymizedUserId })
        .where(eq(lighthouseBlocks.blockedUserId, userId));

      // Delete properties owned by this profile
      if (propertyIds.length > 0) {
        await db.delete(lighthouseProperties).where(inArray(lighthouseProperties.id, propertyIds));
      }
    } catch (error: any) {
      console.warn(`Failed to anonymize Lighthouse related data: ${error.message}`);
    }

    // Delete the profile
    await db.delete(lighthouseProfiles).where(eq(lighthouseProfiles.userId, userId));

    // Log the deletion
    await logProfileDeletion(userId, "lighthouse", reason);
  }
}
