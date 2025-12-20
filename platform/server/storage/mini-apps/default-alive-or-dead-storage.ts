/**
 * Default Alive or Dead Storage Module
 * 
 * Handles all Default Alive or Dead mini-app operations: financial entries
 * and EBITDA snapshots for tracking company financial health.
 */

import {
  defaultAliveOrDeadFinancialEntries,
  defaultAliveOrDeadEbitdaSnapshots,
  type DefaultAliveOrDeadFinancialEntry,
  type InsertDefaultAliveOrDeadFinancialEntry,
  type DefaultAliveOrDeadEbitdaSnapshot,
  type InsertDefaultAliveOrDeadEbitdaSnapshot,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getWeekStart } from "../core/utils";

export class DefaultAliveOrDeadStorage {
  // ========================================
  // DEFAULT ALIVE OR DEAD FINANCIAL ENTRY OPERATIONS
  // ========================================

  async createDefaultAliveOrDeadFinancialEntry(entryData: InsertDefaultAliveOrDeadFinancialEntry, userId: string): Promise<DefaultAliveOrDeadFinancialEntry> {
    const [entry] = await db
      .insert(defaultAliveOrDeadFinancialEntries)
      .values({
        ...entryData,
        createdBy: userId,
      })
      .returning();
    return entry;
  }

  async getDefaultAliveOrDeadFinancialEntry(id: string): Promise<DefaultAliveOrDeadFinancialEntry | undefined> {
    const [entry] = await db
      .select()
      .from(defaultAliveOrDeadFinancialEntries)
      .where(eq(defaultAliveOrDeadFinancialEntries.id, id));
    return entry;
  }

  async getDefaultAliveOrDeadFinancialEntries(filters?: {
    weekStartDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: DefaultAliveOrDeadFinancialEntry[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions: any[] = [];

    if (filters?.weekStartDate) {
      conditions.push(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, filters.weekStartDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(defaultAliveOrDeadFinancialEntries)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated entries
    const entries = await db
      .select()
      .from(defaultAliveOrDeadFinancialEntries)
      .where(whereClause)
      .orderBy(desc(defaultAliveOrDeadFinancialEntries.weekStartDate))
      .limit(limit)
      .offset(offset);

    return { entries, total };
  }

  async updateDefaultAliveOrDeadFinancialEntry(id: string, entryData: Partial<InsertDefaultAliveOrDeadFinancialEntry>): Promise<DefaultAliveOrDeadFinancialEntry> {
    const [entry] = await db
      .update(defaultAliveOrDeadFinancialEntries)
      .set({
        ...entryData,
        updatedAt: new Date(),
      })
      .where(eq(defaultAliveOrDeadFinancialEntries.id, id))
      .returning();
    return entry;
  }

  async deleteDefaultAliveOrDeadFinancialEntry(id: string): Promise<void> {
    await db.delete(defaultAliveOrDeadFinancialEntries).where(eq(defaultAliveOrDeadFinancialEntries.id, id));
  }

  async getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate: Date): Promise<DefaultAliveOrDeadFinancialEntry | undefined> {
    const weekStart = getWeekStart(weekStartDate);
    const [entry] = await db
      .select()
      .from(defaultAliveOrDeadFinancialEntries)
      .where(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, weekStart));
    return entry;
  }

  // ========================================
  // DEFAULT ALIVE OR DEAD EBITDA SNAPSHOT OPERATIONS
  // ========================================

  async calculateAndStoreEbitdaSnapshot(weekStartDate: Date, currentFunding?: number): Promise<DefaultAliveOrDeadEbitdaSnapshot> {
    const weekStart = getWeekStart(weekStartDate);
    
    // Get financial entry for this week
    const financialEntry = await this.getDefaultAliveOrDeadFinancialEntryByWeek(weekStart);
    if (!financialEntry) {
      throw new Error(`No financial entry found for week starting ${weekStart.toISOString()}`);
    }

    // Calculate EBITDA: Revenue - Operating Expenses
    const revenue = Number(financialEntry.revenue || 0);
    const operatingExpenses = Number(financialEntry.operatingExpenses || 0);
    const ebitda = revenue - operatingExpenses;

    // Calculate burn rate (negative EBITDA means burning cash)
    const burnRate = ebitda < 0 ? Math.abs(ebitda) : 0;

    // Get current funding or use existing snapshot's funding
    let funding = currentFunding;
    if (funding === undefined) {
      const existingSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(weekStart);
      funding = existingSnapshot ? Number(existingSnapshot.currentFunding || 0) : 0;
    }

    // Calculate runway (weeks until out of cash)
    const runway = burnRate > 0 && funding > 0 ? Math.floor(funding / burnRate) : null;

    // Determine if default alive (positive EBITDA) or default dead (negative EBITDA)
    const isDefaultAlive = ebitda > 0;

    // Store or update snapshot
    const existing = await this.getDefaultAliveOrDeadEbitdaSnapshot(weekStart);
    if (existing) {
      const [snapshot] = await db
        .update(defaultAliveOrDeadEbitdaSnapshots)
        .set({
          ebitda: ebitda.toString(),
          burnRate: burnRate.toString(),
          currentFunding: funding?.toString() || null,
          runway: runway?.toString() || null,
          isDefaultAlive,
          updatedAt: new Date(),
        })
        .where(eq(defaultAliveOrDeadEbitdaSnapshots.id, existing.id))
        .returning();
      return snapshot;
    } else {
      const [snapshot] = await db
        .insert(defaultAliveOrDeadEbitdaSnapshots)
        .values({
          weekStartDate: weekStart,
          ebitda: ebitda.toString(),
          burnRate: burnRate.toString(),
          currentFunding: funding?.toString() || null,
          runway: runway?.toString() || null,
          isDefaultAlive,
        })
        .returning();
      return snapshot;
    }
  }

  async getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date): Promise<DefaultAliveOrDeadEbitdaSnapshot | undefined> {
    const weekStart = getWeekStart(weekStartDate);
    const [snapshot] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, weekStart));
    return snapshot;
  }

  async getDefaultAliveOrDeadEbitdaSnapshots(filters?: {
    limit?: number;
    offset?: number;
  }): Promise<{ snapshots: DefaultAliveOrDeadEbitdaSnapshot[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(defaultAliveOrDeadEbitdaSnapshots);
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated snapshots
    const snapshots = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(limit)
      .offset(offset);

    return { snapshots, total };
  }

  async getDefaultAliveOrDeadCurrentStatus(): Promise<{
    currentSnapshot: DefaultAliveOrDeadEbitdaSnapshot | null;
    isDefaultAlive: boolean;
    projectedProfitabilityDate: Date | null;
    projectedCapitalNeeded: number | null;
    weeksUntilProfitability: number | null;
  }> {
    // Get the most recent snapshot
    const [currentSnapshot] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(1);

    if (!currentSnapshot) {
      return {
        currentSnapshot: null,
        isDefaultAlive: false,
        projectedProfitabilityDate: null,
        projectedCapitalNeeded: null,
        weeksUntilProfitability: null,
      };
    }

    const isDefaultAlive = currentSnapshot.isDefaultAlive || false;
    const ebitda = Number(currentSnapshot.ebitda || 0);
    const burnRate = Number(currentSnapshot.burnRate || 0);
    const currentFunding = Number(currentSnapshot.currentFunding || 0);
    const runway = currentSnapshot.runway ? Number(currentSnapshot.runway) : null;

    // Calculate projections
    let projectedProfitabilityDate: Date | null = null;
    let projectedCapitalNeeded: number | null = null;
    let weeksUntilProfitability: number | null = null;

    if (!isDefaultAlive && ebitda < 0) {
      // If burning cash, calculate when we'd run out
      if (runway !== null) {
        const weeksUntilOutOfCash = runway;
        const projectedDate = new Date(currentSnapshot.weekStartDate);
        projectedDate.setDate(projectedDate.getDate() + (weeksUntilOutOfCash * 7));
        projectedProfitabilityDate = projectedDate;
        weeksUntilProfitability = weeksUntilOutOfCash;
      }

      // Estimate capital needed (simplified: assume we need to cover burn for 6 months)
      if (burnRate > 0) {
        projectedCapitalNeeded = burnRate * 26; // 26 weeks = ~6 months
      }
    }

    return {
      currentSnapshot,
      isDefaultAlive,
      projectedProfitabilityDate,
      projectedCapitalNeeded,
      weeksUntilProfitability,
    };
  }
}

