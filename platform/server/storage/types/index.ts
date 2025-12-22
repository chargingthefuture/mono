/**
 * Storage Interface Types - Main Entry Point
 * 
 * This file composes all domain-specific storage interfaces into a single IStorage interface.
 * This maintains backward compatibility while allowing for modular code organization.
 */

// Import interfaces for use in extends clause and re-exports
import type { ICoreStorage } from './core-storage.interface';
import type { IMiniAppsStorage } from './mini-apps-storage.interface';
import type { IProfileDeletionStorage } from './profile-deletion-storage.interface';
import type { ISupportMatchStorage } from './supportmatch-storage.interface';
import type { ILighthouseStorage } from './lighthouse-storage.interface';
import type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
import type { ISocketRelayStorage } from './socketrelay-storage.interface';
import type { IDirectoryStorage } from './directory-storage.interface';
import type { ISkillsStorage } from './skills-storage.interface';
import type { LighthouseMatch } from '@shared/schema';

// Re-export for external use
export type { ICoreStorage } from './core-storage.interface';
export type { ISupportMatchStorage } from './supportmatch-storage.interface';
export type { ILighthouseStorage } from './lighthouse-storage.interface';
export type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
export type { ISocketRelayStorage } from './socketrelay-storage.interface';
export type { IDirectoryStorage } from './directory-storage.interface';
export type { ISkillsStorage } from './skills-storage.interface';
export type { IProfileDeletionStorage } from './profile-deletion-storage.interface';

// Define IStorage interface directly to avoid circular import issues
// This matches the definition in ../types.ts
export interface IStorage 
  extends ICoreStorage,
          IMiniAppsStorage,
          IProfileDeletionStorage {
  
  /**
   * Weekly Performance Review
   * 
   * Generates a comprehensive performance report comparing the current week
   * with the previous week, including user metrics, revenue, NPS, and more.
   */
  getWeeklyPerformanceReview(weekStart: Date): Promise<{
    currentWeek: {
      startDate: string;
      endDate: string;
      newUsers: number;
      dailyActiveUsers: Array<{ date: string; count: number }>;
      revenue: number;
      dailyRevenue: Array<{ date: string; amount: number }>;
      totalUsers: number;
      verifiedUsers: number;
      approvedUsers: number;
      isDefaultAlive: boolean | null;
    };
    previousWeek: {
      startDate: string;
      endDate: string;
      newUsers: number;
      dailyActiveUsers: Array<{ date: string; count: number }>;
      revenue: number;
      dailyRevenue: Array<{ date: string; amount: number }>;
      totalUsers: number;
      verifiedUsers: number;
      approvedUsers: number;
      isDefaultAlive: boolean | null;
    };
    comparison: {
      newUsersChange: number;
      revenueChange: number;
      totalUsersChange: number;
      verifiedUsersChange: number;
      approvedUsersChange: number;
    };
    metrics: {
      weeklyGrowthRate: number;
      mrr: number;
      arr: number;
      mrrGrowth: number;
      mau: number;
      churnRate: number;
      clv: number;
      retentionRate: number;
      nps: number;
      npsChange: number;
      npsResponses: number;
      verifiedUsersPercentage: number;
      verifiedUsersPercentageChange: number;
      averageMood: number;
      moodChange: number;
      moodResponses: number;
    };
  }>;
  
  /**
   * Complete account deletion - deletes user from all mini-apps and anonymizes all data.
   * 
   * This method orchestrates the deletion of a user's account across all mini-apps,
   * anonymizes related data, and finally removes the user record itself.
   */
  deleteUserAccount(userId: string, reason?: string): Promise<void>;
  
  /**
   * Get matches by profile ID (special case - not in standard interface)
   * 
   * This method is used for Lighthouse matches and uses dynamic import.
   * It's kept here for backward compatibility but may be moved to the
   * Lighthouse interface in the future.
   */
  getMatchesByProfile(profileId: string): Promise<LighthouseMatch[]>;
}

