/**
 * Default Alive or Dead Storage Interface
 * 
 * Defines Default Alive or Dead mini-app storage operations.
 */

import type {
  DefaultAliveOrDeadFinancialEntry,
  InsertDefaultAliveOrDeadFinancialEntry,
  DefaultAliveOrDeadEbitdaSnapshot,
  InsertDefaultAliveOrDeadEbitdaSnapshot,
} from "@shared/schema";

export interface IDefaultAliveOrDeadStorage {
  // Financial Entry operations
  createDefaultAliveOrDeadFinancialEntry(entry: InsertDefaultAliveOrDeadFinancialEntry, userId: string): Promise<DefaultAliveOrDeadFinancialEntry>;
  getDefaultAliveOrDeadFinancialEntry(id: string): Promise<DefaultAliveOrDeadFinancialEntry | undefined>;
  getDefaultAliveOrDeadFinancialEntries(filters?: {
    weekStartDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: DefaultAliveOrDeadFinancialEntry[]; total: number }>;
  updateDefaultAliveOrDeadFinancialEntry(id: string, entry: Partial<InsertDefaultAliveOrDeadFinancialEntry>): Promise<DefaultAliveOrDeadFinancialEntry>;
  deleteDefaultAliveOrDeadFinancialEntry(id: string): Promise<void>;
  getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate: Date): Promise<DefaultAliveOrDeadFinancialEntry | undefined>;

  // EBITDA Snapshot operations
  calculateAndStoreEbitdaSnapshot(weekStartDate: Date, currentFunding?: number): Promise<DefaultAliveOrDeadEbitdaSnapshot>;
  getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date): Promise<DefaultAliveOrDeadEbitdaSnapshot | undefined>;
  getDefaultAliveOrDeadEbitdaSnapshots(filters?: {
    limit?: number;
    offset?: number;
  }): Promise<{ snapshots: DefaultAliveOrDeadEbitdaSnapshot[]; total: number }>;
  getDefaultAliveOrDeadCurrentStatus(): Promise<{
    currentSnapshot: DefaultAliveOrDeadEbitdaSnapshot | null;
    isDefaultAlive: boolean;
    projectedProfitabilityDate: Date | null;
    projectedCapitalNeeded: number | null;
    weeksUntilProfitability: number | null;
  }>;
  getDefaultAliveOrDeadWeeklyTrends(weeks?: number): Promise<DefaultAliveOrDeadEbitdaSnapshot[]>;
  getDefaultAliveOrDeadWeekComparison(weekStart: Date): Promise<{
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
  }>;
  
  // Current funding operations
  getDefaultAliveOrDeadCurrentFunding(): Promise<number>;
  updateDefaultAliveOrDeadCurrentFunding(amount: number): Promise<void>;
}

