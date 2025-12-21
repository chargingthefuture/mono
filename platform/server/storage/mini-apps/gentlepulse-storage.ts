/**
 * GentlePulse Storage Module
 * 
 * Handles all GentlePulse mini-app operations: meditations, ratings, mood checks,
 * favorites, and announcements.
 */

import {
  gentlepulseMeditations,
  gentlepulseRatings,
  gentlepulseMoodChecks,
  gentlepulseFavorites,
  gentlepulseAnnouncements,
  type GentlepulseMeditation,
  type InsertGentlepulseMeditation,
  type GentlepulseRating,
  type InsertGentlepulseRating,
  type GentlepulseMoodCheck,
  type InsertGentlepulseMoodCheck,
  type GentlepulseFavorite,
  type InsertGentlepulseFavorite,
  type GentlepulseAnnouncement,
  type InsertGentlepulseAnnouncement,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, or, gte, lte, sql } from "drizzle-orm";

export class GentlePulseStorage {
  // ========================================
  // GENTLEPULSE MEDITATION OPERATIONS
  // ========================================

  async createGentlepulseMeditation(meditationData: InsertGentlepulseMeditation): Promise<GentlepulseMeditation> {
    const [meditation] = await db
      .insert(gentlepulseMeditations)
      .values({
        ...meditationData,
        tags: meditationData.tags ? JSON.stringify(meditationData.tags) : null,
      })
      .returning();
    return meditation;
  }

  async getGentlepulseMeditations(filters?: {
    tag?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ meditations: GentlepulseMeditation[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions: any[] = [eq(gentlepulseMeditations.isActive, true)];

    if (filters?.tag) {
      conditions.push(sql`${gentlepulseMeditations.tags}::text ILIKE ${`%${filters.tag}%`}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(gentlepulseMeditations)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Determine sort order
    let orderBy: any = desc(gentlepulseMeditations.createdAt); // Default: newest
    if (filters?.sortBy === "most-rated") {
      orderBy = desc(gentlepulseMeditations.ratingCount);
    } else if (filters?.sortBy === "highest-rating") {
      orderBy = desc(gentlepulseMeditations.averageRating);
    } else if (filters?.sortBy === "newest") {
      orderBy = desc(gentlepulseMeditations.createdAt);
    }

    const meditations = await db
      .select()
      .from(gentlepulseMeditations)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { meditations, total };
  }

  async getGentlepulseMeditationById(id: string): Promise<GentlepulseMeditation | undefined> {
    const [meditation] = await db
      .select()
      .from(gentlepulseMeditations)
      .where(eq(gentlepulseMeditations.id, id));
    return meditation;
  }

  async updateGentlepulseMeditation(id: string, meditationData: Partial<InsertGentlepulseMeditation>): Promise<GentlepulseMeditation> {
    const updateData: any = { ...meditationData, updatedAt: new Date() };
    if (meditationData.tags !== undefined) {
      updateData.tags = meditationData.tags ? JSON.stringify(meditationData.tags) : null;
    }
    
    const [meditation] = await db
      .update(gentlepulseMeditations)
      .set(updateData)
      .where(eq(gentlepulseMeditations.id, id))
      .returning();
    return meditation;
  }

  async incrementGentlepulsePlayCount(id: string): Promise<void> {
    await db
      .update(gentlepulseMeditations)
      .set({ playCount: sql`${gentlepulseMeditations.playCount} + 1` })
      .where(eq(gentlepulseMeditations.id, id));
  }

  // ========================================
  // GENTLEPULSE RATING OPERATIONS
  // ========================================

  async createOrUpdateGentlepulseRating(ratingData: InsertGentlepulseRating): Promise<GentlepulseRating> {
    // Check if rating exists
    const existing = await this.getGentlepulseRatingByClientAndMeditation(
      ratingData.clientId,
      ratingData.meditationId
    );

    if (existing) {
      // Update existing rating
      const [rating] = await db
        .update(gentlepulseRatings)
        .set({ rating: ratingData.rating })
        .where(eq(gentlepulseRatings.id, existing.id))
        .returning();

      // Update meditation average
      await this.updateGentlepulseMeditationRating(ratingData.meditationId);
      return rating;
    } else {
      // Create new rating
      const [rating] = await db
        .insert(gentlepulseRatings)
        .values(ratingData)
        .returning();

      // Update meditation average
      await this.updateGentlepulseMeditationRating(ratingData.meditationId);
      return rating;
    }
  }

  async getGentlepulseRatingsByMeditationId(meditationId: string): Promise<GentlepulseRating[]> {
    return await db
      .select()
      .from(gentlepulseRatings)
      .where(eq(gentlepulseRatings.meditationId, meditationId));
  }

  async getGentlepulseRatingByClientAndMeditation(clientId: string, meditationId: string): Promise<GentlepulseRating | undefined> {
    const [rating] = await db
      .select()
      .from(gentlepulseRatings)
      .where(
        and(
          eq(gentlepulseRatings.clientId, clientId),
          eq(gentlepulseRatings.meditationId, meditationId)
        )
      );
    return rating;
  }

  async updateGentlepulseMeditationRating(meditationId: string): Promise<void> {
    // Calculate average rating and count
    const ratings = await this.getGentlepulseRatingsByMeditationId(meditationId);
    
    if (ratings.length === 0) {
      await db
        .update(gentlepulseMeditations)
        .set({
          averageRating: null,
          ratingCount: 0,
        })
        .where(eq(gentlepulseMeditations.id, meditationId));
      return;
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;
    const count = ratings.length;

    await db
      .update(gentlepulseMeditations)
      .set({
        averageRating: average.toFixed(2),
        ratingCount: count,
      })
      .where(eq(gentlepulseMeditations.id, meditationId));
  }

  // ========================================
  // GENTLEPULSE MOOD CHECK OPERATIONS
  // ========================================

  async createGentlepulseMoodCheck(moodCheckData: InsertGentlepulseMoodCheck): Promise<GentlepulseMoodCheck> {
    // Convert Date to ISO date string for database
    const dataToInsert = {
      ...moodCheckData,
      date: moodCheckData.date instanceof Date 
        ? moodCheckData.date.toISOString().split('T')[0] 
        : moodCheckData.date,
    };
    const [moodCheck] = await db
      .insert(gentlepulseMoodChecks)
      .values(dataToInsert as any)
      .returning();
    return moodCheck;
  }

  async getGentlepulseMoodChecksByClientId(clientId: string, days: number = 7): Promise<GentlepulseMoodCheck[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(gentlepulseMoodChecks)
      .where(
        and(
          eq(gentlepulseMoodChecks.clientId, clientId),
          gte(gentlepulseMoodChecks.date, startDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(gentlepulseMoodChecks.date));
  }

  async getGentlepulseMoodChecksByDateRange(startDate: Date, endDate: Date): Promise<GentlepulseMoodCheck[]> {
    return await db
      .select()
      .from(gentlepulseMoodChecks)
      .where(
        and(
          gte(gentlepulseMoodChecks.date, startDate.toISOString().split('T')[0]),
          lte(gentlepulseMoodChecks.date, endDate.toISOString().split('T')[0])
        )
      );
  }

  // ========================================
  // GENTLEPULSE FAVORITE OPERATIONS
  // ========================================

  async createGentlepulseFavorite(favoriteData: InsertGentlepulseFavorite): Promise<GentlepulseFavorite> {
    const [favorite] = await db
      .insert(gentlepulseFavorites)
      .values(favoriteData)
      .returning();
    return favorite;
  }

  async deleteGentlepulseFavorite(clientId: string, meditationId: string): Promise<void> {
    await db
      .delete(gentlepulseFavorites)
      .where(
        and(
          eq(gentlepulseFavorites.clientId, clientId),
          eq(gentlepulseFavorites.meditationId, meditationId)
        )
      );
  }

  async getGentlepulseFavoritesByClientId(clientId: string): Promise<GentlepulseFavorite[]> {
    return await db
      .select()
      .from(gentlepulseFavorites)
      .where(eq(gentlepulseFavorites.clientId, clientId))
      .orderBy(desc(gentlepulseFavorites.createdAt));
  }

  async isGentlepulseFavorite(clientId: string, meditationId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(gentlepulseFavorites)
      .where(
        and(
          eq(gentlepulseFavorites.clientId, clientId),
          eq(gentlepulseFavorites.meditationId, meditationId)
        )
      );
    return !!favorite;
  }

  // ========================================
  // GENTLEPULSE ANNOUNCEMENT OPERATIONS
  // ========================================

  async createGentlepulseAnnouncement(announcementData: InsertGentlepulseAnnouncement): Promise<GentlepulseAnnouncement> {
    const [announcement] = await db
      .insert(gentlepulseAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveGentlepulseAnnouncements(): Promise<GentlepulseAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(gentlepulseAnnouncements)
      .where(
        and(
          eq(gentlepulseAnnouncements.isActive, true),
          or(
            sql`${gentlepulseAnnouncements.expiresAt} IS NULL`,
            gte(gentlepulseAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(gentlepulseAnnouncements.createdAt));
  }

  async getAllGentlepulseAnnouncements(): Promise<GentlepulseAnnouncement[]> {
    return await db
      .select()
      .from(gentlepulseAnnouncements)
      .orderBy(desc(gentlepulseAnnouncements.createdAt));
  }

  async updateGentlepulseAnnouncement(id: string, announcementData: Partial<InsertGentlepulseAnnouncement>): Promise<GentlepulseAnnouncement> {
    const [announcement] = await db
      .update(gentlepulseAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(gentlepulseAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateGentlepulseAnnouncement(id: string): Promise<GentlepulseAnnouncement> {
    const [announcement] = await db
      .update(gentlepulseAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(gentlepulseAnnouncements.id, id))
      .returning();
    return announcement;
  }
}

