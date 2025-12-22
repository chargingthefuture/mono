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
import { db } from "../../db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getWeekStart, formatDate } from "../core/utils";

export class DefaultAliveOrDeadStorage {
  // ========================================
  // DEFAULT ALIVE OR DEAD FINANCIAL ENTRY OPERATIONS
  // ========================================

  async createDefaultAliveOrDeadFinancialEntry(entryData: InsertDefaultAliveOrDeadFinancialEntry, userId: string): Promise<DefaultAliveOrDeadFinancialEntry> {
    const [entry] = await db
      .insert(defaultAliveOrDeadFinancialEntries)
      .values({
        ...entryData,
        weekStartDate: entryData.weekStartDate instanceof Date 
          ? formatDate(entryData.weekStartDate)
          : entryData.weekStartDate,
        operatingExpenses: String(entryData.operatingExpenses),
        depreciation: entryData.depreciation !== undefined ? String(entryData.depreciation) : '0',
        amortization: entryData.amortization !== undefined ? String(entryData.amortization) : '0',
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
      const weekStartStr = filters.weekStartDate instanceof Date
        ? formatDate(filters.weekStartDate)
        : filters.weekStartDate;
      conditions.push(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, weekStartStr));
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
    const updateData: any = { ...entryData };
    if (updateData.weekStartDate instanceof Date) {
      updateData.weekStartDate = formatDate(updateData.weekStartDate);
    }
    const [entry] = await db
      .update(defaultAliveOrDeadFinancialEntries)
      .set({
        ...updateData,
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
    const weekStartStr = formatDate(weekStart);
    const [entry] = await db
      .select()
      .from(defaultAliveOrDeadFinancialEntries)
      .where(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, weekStartStr));
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

    // Get revenue from existing snapshot or calculate from payments (for now, use 0 or get from existing)
    const existingSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(weekStart);
    const revenue = existingSnapshot ? Number(existingSnapshot.revenue || 0) : 0;
    const operatingExpenses = Number(financialEntry.operatingExpenses || 0);
    const depreciation = Number(financialEntry.depreciation || 0);
    const amortization = Number(financialEntry.amortization || 0);
    // EBITDA = Revenue - Operating Expenses + Depreciation + Amortization
    const ebitda = revenue - operatingExpenses + depreciation + amortization;

    // Calculate burn rate (negative EBITDA means burning cash)
    const burnRate = ebitda < 0 ? Math.abs(ebitda) : 0;

    // Get current funding or use existing snapshot's funding
    let funding = currentFunding;
    if (funding === undefined && existingSnapshot) {
      funding = Number(existingSnapshot.currentFunding || 0);
    } else if (funding === undefined) {
      funding = 0;
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
          revenue: revenue.toString(),
          operatingExpenses: operatingExpenses.toString(),
          depreciation: depreciation.toString(),
          amortization: amortization.toString(),
          ebitda: ebitda.toString(),
          currentFunding: funding?.toString() || null,
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
          weekStartDate: formatDate(weekStart),
          revenue: revenue.toString(),
          operatingExpenses: operatingExpenses.toString(),
          depreciation: depreciation.toString(),
          amortization: amortization.toString(),
          ebitda: ebitda.toString(),
          currentFunding: funding?.toString() || null,
          isDefaultAlive,
        })
        .returning();
      return snapshot;
    }
  }

  async getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date): Promise<DefaultAliveOrDeadEbitdaSnapshot | undefined> {
    const weekStart = getWeekStart(weekStartDate);
    const weekStartStr = formatDate(weekStart);
    const [snapshot] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, weekStartStr));
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
    // Calculate burnRate from EBITDA (negative EBITDA = burn rate)
    const burnRate = ebitda < 0 ? Math.abs(ebitda) : 0;
    const currentFunding = Number(currentSnapshot.currentFunding || 0);
    // Calculate runway from currentFunding and burnRate (weeks until funding runs out)
    const runway = burnRate > 0 && currentFunding > 0 ? currentFunding / burnRate : null;

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

  async getDefaultAliveOrDeadWeeklyTrends(weeks: number = 12): Promise<DefaultAliveOrDeadEbitdaSnapshot[]> {
    const snapshots = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(weeks);
    return snapshots;
  }

  async getDefaultAliveOrDeadWeekComparison(weekStart: Date): Promise<{
    currentWeek: {
      snapshot: DefaultAliveOrDeadEbitdaSnapshot | null;
      weekStart: Date;
      weekEnd: Date;
    };
    previousWeek: {
      snapshot: DefaultAliveOrDeadEbitdaSnapshot | null;
      weekStart: Date;
      weekEnd: Date;
    };
    comparison: {
      revenueChange: number;
      ebitdaChange: number;
      operatingExpensesChange: number;
      growthRate: number;
    };
  }> {
    const currentWeekStart = getWeekStart(weekStart);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6); // Add 6 days to get Friday

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 6);

    const currentSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(currentWeekStart);
    const previousSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(previousWeekStart);

    // Get financial entries for comparison
    const currentEntry = await this.getDefaultAliveOrDeadFinancialEntryByWeek(currentWeekStart);
    const previousEntry = await this.getDefaultAliveOrDeadFinancialEntryByWeek(previousWeekStart);

    // Revenue comes from EBITDA snapshots, not financial entries
    const currentRevenue = currentSnapshot ? Number(currentSnapshot.revenue || 0) : 0;
    const previousRevenue = previousSnapshot ? Number(previousSnapshot.revenue || 0) : 0;
    const currentOperatingExpenses = currentEntry ? Number(currentEntry.operatingExpenses || 0) : 0;
    const previousOperatingExpenses = previousEntry ? Number(previousEntry.operatingExpenses || 0) : 0;
    const currentEbitda = currentSnapshot ? Number(currentSnapshot.ebitda || 0) : 0;
    const previousEbitda = previousSnapshot ? Number(previousSnapshot.ebitda || 0) : 0;

    const revenueChange = previousRevenue === 0 
      ? (currentRevenue > 0 ? 100 : 0)
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    const operatingExpensesChange = previousOperatingExpenses === 0
      ? (currentOperatingExpenses > 0 ? 100 : 0)
      : ((currentOperatingExpenses - previousOperatingExpenses) / previousOperatingExpenses) * 100;
    
    const ebitdaChange = previousEbitda === 0
      ? (currentEbitda > 0 ? 100 : (currentEbitda < 0 ? -100 : 0))
      : ((currentEbitda - previousEbitda) / Math.abs(previousEbitda)) * 100;

    const growthRate = previousRevenue === 0
      ? (currentRevenue > 0 ? 100 : 0)
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      currentWeek: {
        snapshot: currentSnapshot || null,
        weekStart: currentWeekStart,
        weekEnd: currentWeekEnd,
      },
      previousWeek: {
        snapshot: previousSnapshot || null,
        weekStart: previousWeekStart,
        weekEnd: previousWeekEnd,
      },
      comparison: {
        revenueChange,
        ebitdaChange,
        operatingExpensesChange,
        growthRate,
      },
    };
  }

  async getDefaultAliveOrDeadCurrentFunding(): Promise<number> {
    // Get the most recent snapshot's current funding
    const [snapshot] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(1);
    
    return snapshot ? Number(snapshot.currentFunding || 0) : 0;
  }

  async updateDefaultAliveOrDeadCurrentFunding(amount: number): Promise<void> {
    // Get the most recent snapshot
    const [snapshot] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(1);
    
    if (snapshot) {
      // Update the most recent snapshot with new funding
      await db
        .update(defaultAliveOrDeadEbitdaSnapshots)
        .set({
          currentFunding: amount.toString(),
          updatedAt: new Date(),
        })
        .where(eq(defaultAliveOrDeadEbitdaSnapshots.id, snapshot.id));
    } else {
      // If no snapshot exists, create one for the current week
      const weekStart = getWeekStart(new Date());
      await db
        .insert(defaultAliveOrDeadEbitdaSnapshots)
        .values({
          weekStartDate: formatDate(weekStart),
          revenue: "0",
          operatingExpenses: "0",
          depreciation: "0",
          amortization: "0",
          ebitda: "0",
          currentFunding: amount.toString(),
          isDefaultAlive: false,
        });
    }
  }
}

