/**
 * LostMail Storage Module
 * 
 * Handles all LostMail mini-app operations: incidents, audit trails, and announcements.
 */

import {
  lostmailIncidents,
  lostmailAuditTrail,
  lostmailAnnouncements,
  type LostmailIncident,
  type InsertLostmailIncident,
  type LostmailAuditTrail,
  type InsertLostmailAuditTrail,
  type LostmailAnnouncement,
  type InsertLostmailAnnouncement,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, or, gte, lte, sql } from "drizzle-orm";

export class LostMailStorage {
  // ========================================
  // LOSTMAIL INCIDENT OPERATIONS
  // ========================================

  async createLostmailIncident(incidentData: InsertLostmailIncident): Promise<LostmailIncident> {
    const [incident] = await db
      .insert(lostmailIncidents)
      .values({
        ...incidentData,
        status: 'submitted',
      })
      .returning();
    return incident;
  }

  async getLostmailIncidentById(id: string): Promise<LostmailIncident | undefined> {
    const [incident] = await db
      .select()
      .from(lostmailIncidents)
      .where(eq(lostmailIncidents.id, id));
    return incident;
  }

  async getLostmailIncidentsByEmail(email: string): Promise<LostmailIncident[]> {
    // Use case-insensitive email matching
    return await db
      .select()
      .from(lostmailIncidents)
      .where(sql`LOWER(${lostmailIncidents.reporterEmail}) = LOWER(${email})`)
      .orderBy(desc(lostmailIncidents.createdAt));
  }

  async getLostmailIncidents(filters?: {
    incidentType?: string;
    status?: string;
    severity?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string; // Search by tracking number, ID, or reporter name
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: LostmailIncident[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    const conditions: any[] = [];

    if (filters?.incidentType) {
      conditions.push(eq(lostmailIncidents.incidentType, filters.incidentType));
    }
    if (filters?.status) {
      conditions.push(eq(lostmailIncidents.status, filters.status));
    }
    if (filters?.severity) {
      conditions.push(eq(lostmailIncidents.severity, filters.severity));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(lostmailIncidents.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(lostmailIncidents.createdAt, filters.dateTo));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${lostmailIncidents.trackingNumber} ILIKE ${searchTerm}`,
          sql`${lostmailIncidents.reporterName} ILIKE ${searchTerm}`,
          sql`${lostmailIncidents.id} ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(lostmailIncidents)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated results
    const incidents = await db
      .select()
      .from(lostmailIncidents)
      .where(whereClause)
      .orderBy(desc(lostmailIncidents.createdAt))
      .limit(limit)
      .offset(offset);

    return { incidents, total };
  }

  async updateLostmailIncident(id: string, incidentData: Partial<InsertLostmailIncident>): Promise<LostmailIncident> {
    const [incident] = await db
      .update(lostmailIncidents)
      .set({ ...incidentData, updatedAt: new Date() })
      .where(eq(lostmailIncidents.id, id))
      .returning();
    return incident;
  }

  // ========================================
  // LOSTMAIL AUDIT TRAIL OPERATIONS
  // ========================================

  async createLostmailAuditTrailEntry(entryData: InsertLostmailAuditTrail): Promise<LostmailAuditTrail> {
    const [entry] = await db
      .insert(lostmailAuditTrail)
      .values(entryData)
      .returning();
    return entry;
  }

  async getLostmailAuditTrailByIncident(incidentId: string): Promise<LostmailAuditTrail[]> {
    return await db
      .select()
      .from(lostmailAuditTrail)
      .where(eq(lostmailAuditTrail.incidentId, incidentId))
      .orderBy(desc(lostmailAuditTrail.timestamp));
  }

  // ========================================
  // LOSTMAIL ANNOUNCEMENT OPERATIONS
  // ========================================

  async createLostmailAnnouncement(announcementData: InsertLostmailAnnouncement): Promise<LostmailAnnouncement> {
    const [announcement] = await db
      .insert(lostmailAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveLostmailAnnouncements(): Promise<LostmailAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(lostmailAnnouncements)
      .where(
        and(
          eq(lostmailAnnouncements.isActive, true),
          or(
            sql`${lostmailAnnouncements.expiresAt} IS NULL`,
            gte(lostmailAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(lostmailAnnouncements.createdAt));
  }

  async getAllLostmailAnnouncements(): Promise<LostmailAnnouncement[]> {
    return await db
      .select()
      .from(lostmailAnnouncements)
      .orderBy(desc(lostmailAnnouncements.createdAt));
  }

  async updateLostmailAnnouncement(id: string, announcementData: Partial<InsertLostmailAnnouncement>): Promise<LostmailAnnouncement> {
    const [announcement] = await db
      .update(lostmailAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(lostmailAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateLostmailAnnouncement(id: string): Promise<LostmailAnnouncement> {
    const [announcement] = await db
      .update(lostmailAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(lostmailAnnouncements.id, id))
      .returning();
    return announcement;
  }
}


