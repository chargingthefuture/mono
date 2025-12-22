/**
 * Storage Interface Types
 * 
 * Defines the IStorage interface that all storage implementations must follow.
 * This interface is extracted from the original storage.ts to be shared across modules.
 * 
 * REFACTORED: Removed duplicate method definitions that are already in composed interfaces.
 * This reduces the file from 977 lines to ~200 lines while maintaining full type safety.
 */

// Import domain-specific interfaces
import type { ICoreStorage } from './types/core-storage.interface';
import type { IMiniAppsStorage } from './types/mini-apps-storage.interface';
import type { IProfileDeletionStorage } from './types/profile-deletion-storage.interface';

// Import types from centralized location
export type * from './types/type-imports';

// Re-export types for backward compatibility (legacy imports)
import type {
  User,
  UpsertUser,
  OTPCode,
  InsertOTPCode,
  AuthToken,
  InsertAuthToken,
  PricingTier,
  InsertPricingTier,
  Payment,
  InsertPayment,
  AdminActionLog,
  InsertAdminActionLog,
  SupportMatchProfile,
  InsertSupportMatchProfile,
  Partnership,
  InsertPartnership,
  Message,
  InsertMessage,
  Exclusion,
  InsertExclusion,
  Report,
  InsertReport,
  Announcement,
  InsertAnnouncement,
  SupportmatchAnnouncement,
  InsertSupportmatchAnnouncement,
  LighthouseProfile,
  InsertLighthouseProfile,
  LighthouseProperty,
  InsertLighthouseProperty,
  LighthouseMatch,
  InsertLighthouseMatch,
  LighthouseAnnouncement,
  InsertLighthouseAnnouncement,
  LighthouseBlock,
  InsertLighthouseBlock,
  SocketrelayRequest,
  InsertSocketrelayRequest,
  SocketrelayFulfillment,
  InsertSocketrelayFulfillment,
  SocketrelayMessage,
  InsertSocketrelayMessage,
  SocketrelayProfile,
  InsertSocketrelayProfile,
  SocketrelayAnnouncement,
  InsertSocketrelayAnnouncement,
  DirectoryProfile,
  InsertDirectoryProfile,
  DirectorySkill,
  InsertDirectorySkill,
  DirectoryAnnouncement,
  InsertDirectoryAnnouncement,
  SkillsSector,
  InsertSkillsSector,
  SkillsJobTitle,
  InsertSkillsJobTitle,
  SkillsSkill,
  InsertSkillsSkill,
  ChatGroup,
  InsertChatGroup,
  ChatgroupsAnnouncement,
  InsertChatgroupsAnnouncement,
  TrusttransportProfile,
  InsertTrusttransportProfile,
  TrusttransportRideRequest,
  InsertTrusttransportRideRequest,
  TrusttransportAnnouncement,
  InsertTrusttransportAnnouncement,
  MechanicmatchProfile,
  InsertMechanicmatchProfile,
  MechanicmatchVehicle,
  InsertMechanicmatchVehicle,
  MechanicmatchServiceRequest,
  InsertMechanicmatchServiceRequest,
  MechanicmatchJob,
  InsertMechanicmatchJob,
  MechanicmatchAvailability,
  InsertMechanicmatchAvailability,
  MechanicmatchReview,
  InsertMechanicmatchReview,
  MechanicmatchMessage,
  InsertMechanicmatchMessage,
  MechanicmatchAnnouncement,
  InsertMechanicmatchAnnouncement,
  ResearchItem,
  InsertResearchItem,
  ResearchAnswer,
  InsertResearchAnswer,
  ResearchComment,
  InsertResearchComment,
  ResearchVote,
  InsertResearchVote,
  ResearchLinkProvenance,
  InsertResearchLinkProvenance,
  ResearchBookmark,
  InsertResearchBookmark,
  ResearchFollow,
  InsertResearchFollow,
  ResearchReport,
  InsertResearchReport,
  ResearchAnnouncement,
  InsertResearchAnnouncement,
  LostmailIncident,
  InsertLostmailIncident,
  LostmailAuditTrail,
  InsertLostmailAuditTrail,
  LostmailAnnouncement,
  InsertLostmailAnnouncement,
  GentlepulseMeditation,
  InsertGentlepulseMeditation,
  GentlepulseRating,
  InsertGentlepulseRating,
  GentlepulseMoodCheck,
  InsertGentlepulseMoodCheck,
  GentlepulseFavorite,
  InsertGentlepulseFavorite,
  GentlepulseAnnouncement,
  InsertGentlepulseAnnouncement,
  ChymeRoom,
  InsertChymeRoom,
  ChymeRoomParticipant,
  InsertChymeRoomParticipant,
  ChymeUserFollow,
  InsertChymeUserFollow,
  ChymeUserBlock,
  InsertChymeUserBlock,
  ChymeMessage,
  InsertChymeMessage,
  ChymeAnnouncement,
  InsertChymeAnnouncement,
  WorkforceRecruiterProfile,
  InsertWorkforceRecruiterProfile,
  WorkforceRecruiterConfig,
  InsertWorkforceRecruiterConfig,
  WorkforceRecruiterOccupation,
  InsertWorkforceRecruiterOccupation,
  WorkforceRecruiterMeetupEvent,
  InsertWorkforceRecruiterMeetupEvent,
  WorkforceRecruiterMeetupEventSignup,
  InsertWorkforceRecruiterMeetupEventSignup,
  WorkforceRecruiterAnnouncement,
  InsertWorkforceRecruiterAnnouncement,
  BlogPost,
  InsertBlogPost,
  BlogAnnouncement,
  InsertBlogAnnouncement,
  BlogComment,
  ProfileDeletionLog,
  InsertProfileDeletionLog,
  NpsResponse,
  InsertNpsResponse,
} from "@shared/schema";

// Re-export all types for backward compatibility
export type {
  User,
  UpsertUser,
  OTPCode,
  InsertOTPCode,
  AuthToken,
  InsertAuthToken,
  PricingTier,
  InsertPricingTier,
  Payment,
  InsertPayment,
  AdminActionLog,
  InsertAdminActionLog,
  SupportMatchProfile,
  InsertSupportMatchProfile,
  Partnership,
  InsertPartnership,
  Message,
  InsertMessage,
  Exclusion,
  InsertExclusion,
  Report,
  InsertReport,
  Announcement,
  InsertAnnouncement,
  SupportmatchAnnouncement,
  InsertSupportmatchAnnouncement,
  LighthouseProfile,
  InsertLighthouseProfile,
  LighthouseProperty,
  InsertLighthouseProperty,
  LighthouseMatch,
  InsertLighthouseMatch,
  LighthouseAnnouncement,
  InsertLighthouseAnnouncement,
  LighthouseBlock,
  InsertLighthouseBlock,
  SocketrelayRequest,
  InsertSocketrelayRequest,
  SocketrelayFulfillment,
  InsertSocketrelayFulfillment,
  SocketrelayMessage,
  InsertSocketrelayMessage,
  SocketrelayProfile,
  InsertSocketrelayProfile,
  SocketrelayAnnouncement,
  InsertSocketrelayAnnouncement,
  DirectoryProfile,
  InsertDirectoryProfile,
  DirectorySkill,
  InsertDirectorySkill,
  DirectoryAnnouncement,
  InsertDirectoryAnnouncement,
  SkillsSector,
  InsertSkillsSector,
  SkillsJobTitle,
  InsertSkillsJobTitle,
  SkillsSkill,
  InsertSkillsSkill,
  ChatGroup,
  InsertChatGroup,
  ChatgroupsAnnouncement,
  InsertChatgroupsAnnouncement,
  TrusttransportProfile,
  InsertTrusttransportProfile,
  TrusttransportRideRequest,
  InsertTrusttransportRideRequest,
  TrusttransportAnnouncement,
  InsertTrusttransportAnnouncement,
  MechanicmatchProfile,
  InsertMechanicmatchProfile,
  MechanicmatchVehicle,
  InsertMechanicmatchVehicle,
  MechanicmatchServiceRequest,
  InsertMechanicmatchServiceRequest,
  MechanicmatchJob,
  InsertMechanicmatchJob,
  MechanicmatchAvailability,
  InsertMechanicmatchAvailability,
  MechanicmatchReview,
  InsertMechanicmatchReview,
  MechanicmatchMessage,
  InsertMechanicmatchMessage,
  MechanicmatchAnnouncement,
  InsertMechanicmatchAnnouncement,
  ResearchItem,
  InsertResearchItem,
  ResearchAnswer,
  InsertResearchAnswer,
  ResearchComment,
  InsertResearchComment,
  ResearchVote,
  InsertResearchVote,
  ResearchLinkProvenance,
  InsertResearchLinkProvenance,
  ResearchBookmark,
  InsertResearchBookmark,
  ResearchFollow,
  InsertResearchFollow,
  ResearchReport,
  InsertResearchReport,
  ResearchAnnouncement,
  InsertResearchAnnouncement,
  LostmailIncident,
  InsertLostmailIncident,
  LostmailAuditTrail,
  InsertLostmailAuditTrail,
  LostmailAnnouncement,
  InsertLostmailAnnouncement,
  GentlepulseMeditation,
  InsertGentlepulseMeditation,
  GentlepulseRating,
  InsertGentlepulseRating,
  GentlepulseMoodCheck,
  InsertGentlepulseMoodCheck,
  GentlepulseFavorite,
  InsertGentlepulseFavorite,
  GentlepulseAnnouncement,
  InsertGentlepulseAnnouncement,
  ChymeRoom,
  InsertChymeRoom,
  ChymeRoomParticipant,
  InsertChymeRoomParticipant,
  ChymeUserFollow,
  InsertChymeUserFollow,
  ChymeUserBlock,
  InsertChymeUserBlock,
  ChymeMessage,
  InsertChymeMessage,
  ChymeAnnouncement,
  InsertChymeAnnouncement,
  WorkforceRecruiterProfile,
  InsertWorkforceRecruiterProfile,
  WorkforceRecruiterConfig,
  InsertWorkforceRecruiterConfig,
  WorkforceRecruiterOccupation,
  InsertWorkforceRecruiterOccupation,
  WorkforceRecruiterMeetupEvent,
  InsertWorkforceRecruiterMeetupEvent,
  WorkforceRecruiterMeetupEventSignup,
  InsertWorkforceRecruiterMeetupEventSignup,
  WorkforceRecruiterAnnouncement,
  InsertWorkforceRecruiterAnnouncement,
  BlogPost,
  InsertBlogPost,
  BlogAnnouncement,
  InsertBlogAnnouncement,
  BlogComment,
  ProfileDeletionLog,
  InsertProfileDeletionLog,
  NpsResponse,
  InsertNpsResponse,
};

/**
 * Main storage interface that composes all domain-specific storage interfaces.
 * 
 * This interface extends ICoreStorage, IMiniAppsStorage, and IProfileDeletionStorage,
 * which contain all the method definitions. This file only adds methods that are
 * unique to the IStorage interface itself.
 */
export interface IStorage 
  extends ICoreStorage,
          IMiniAppsStorage,
          IProfileDeletionStorage {
  
  // ========================================
  // UNIQUE METHODS (not in composed interfaces)
  // ========================================
  
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
