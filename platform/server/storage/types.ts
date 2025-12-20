/**
 * Storage Interface Types
 * 
 * Defines the IStorage interface that all storage implementations must follow.
 * This interface is extracted from the original storage.ts to be shared across modules.
 */

import type {
  type User,
  type UpsertUser,
  type OTPCode,
  type InsertOTPCode,
  type AuthToken,
  type InsertAuthToken,
  type PricingTier,
  type InsertPricingTier,
  type Payment,
  type InsertPayment,
  type AdminActionLog,
  type InsertAdminActionLog,
  type SupportMatchProfile,
  type InsertSupportMatchProfile,
  type Partnership,
  type InsertPartnership,
  type Message,
  type InsertMessage,
  type Exclusion,
  type InsertExclusion,
  type Report,
  type InsertReport,
  type Announcement,
  type InsertAnnouncement,
  type SupportmatchAnnouncement,
  type InsertSupportmatchAnnouncement,
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
  type SocketrelayRequest,
  type InsertSocketrelayRequest,
  type SocketrelayFulfillment,
  type InsertSocketrelayFulfillment,
  type SocketrelayMessage,
  type InsertSocketrelayMessage,
  type SocketrelayProfile,
  type InsertSocketrelayProfile,
  type SocketrelayAnnouncement,
  type InsertSocketrelayAnnouncement,
  type DirectoryProfile,
  type InsertDirectoryProfile,
  type DirectorySkill,
  type InsertDirectorySkill,
  type DirectoryAnnouncement,
  type InsertDirectoryAnnouncement,
  type SkillsSector,
  type InsertSkillsSector,
  type SkillsJobTitle,
  type InsertSkillsJobTitle,
  type SkillsSkill,
  type InsertSkillsSkill,
  type ChatGroup,
  type InsertChatGroup,
  type ChatgroupsAnnouncement,
  type InsertChatgroupsAnnouncement,
  type TrusttransportProfile,
  type InsertTrusttransportProfile,
  type TrusttransportRideRequest,
  type InsertTrusttransportRideRequest,
  type TrusttransportAnnouncement,
  type InsertTrusttransportAnnouncement,
  type MechanicmatchProfile,
  type InsertMechanicmatchProfile,
  type MechanicmatchVehicle,
  type InsertMechanicmatchVehicle,
  type MechanicmatchServiceRequest,
  type InsertMechanicmatchServiceRequest,
  type MechanicmatchJob,
  type InsertMechanicmatchJob,
  type MechanicmatchAvailability,
  type InsertMechanicmatchAvailability,
  type MechanicmatchReview,
  type InsertMechanicmatchReview,
  type MechanicmatchMessage,
  type InsertMechanicmatchMessage,
  type MechanicmatchAnnouncement,
  type InsertMechanicmatchAnnouncement,
  type LostmailIncident,
  type InsertLostmailIncident,
  type LostmailAuditTrail,
  type InsertLostmailAuditTrail,
  type LostmailAnnouncement,
  type InsertLostmailAnnouncement,
  type ResearchItem,
  type InsertResearchItem,
  type ResearchAnswer,
  type InsertResearchAnswer,
  type ResearchComment,
  type InsertResearchComment,
  type ResearchVote,
  type InsertResearchVote,
  type ResearchLinkProvenance,
  type InsertResearchLinkProvenance,
  type ResearchBookmark,
  type InsertResearchBookmark,
  type ResearchFollow,
  type InsertResearchFollow,
  type ResearchReport,
  type InsertResearchReport,
  type ResearchAnnouncement,
  type InsertResearchAnnouncement,
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
  type ChymeAnnouncement,
  type InsertChymeAnnouncement,
  type ChymeRoom,
  type InsertChymeRoom,
  type ChymeRoomParticipant,
  type InsertChymeRoomParticipant,
  type ChymeMessage,
  type InsertChymeMessage,
  type ChymeUserFollow,
  type InsertChymeUserFollow,
  type ChymeUserBlock,
  type InsertChymeUserBlock,
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
  type DefaultAliveOrDeadFinancialEntry,
  type InsertDefaultAliveOrDeadFinancialEntry,
  type DefaultAliveOrDeadEbitdaSnapshot,
  type InsertDefaultAliveOrDeadEbitdaSnapshot,
  type BlogPost,
  type InsertBlogPost,
  type BlogAnnouncement,
  type InsertBlogAnnouncement,
  type BlogComment,
  type ProfileDeletionLog,
  type InsertProfileDeletionLog,
  type NpsResponse,
  type InsertNpsResponse,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // OTP code methods
  createOTPCode(userId: string, code: string, expiresAt: Date): Promise<OTPCode>;
  findOTPCodeByCode(code: string): Promise<OTPCode | undefined>;
  deleteOTPCode(userId: string): Promise<void>;
  deleteExpiredOTPCodes(): Promise<void>;
  
  // Auth token methods
  createAuthToken(token: string, userId: string, expiresAt: Date): Promise<AuthToken>;
  findAuthTokenByToken(token: string): Promise<AuthToken | undefined>;
  deleteAuthToken(token: string): Promise<void>;
  deleteExpiredAuthTokens(): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUserVerification(userId: string, isVerified: boolean): Promise<User>;
  updateUserApproval(userId: string, isApproved: boolean): Promise<User>;
  updateTermsAcceptance(userId: string): Promise<User>;
  updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null): Promise<User>;
  updateUserName(userId: string, firstName: string | null, lastName: string | null): Promise<User>;
  
  // Pricing tier operations
  getCurrentPricingTier(): Promise<PricingTier | undefined>;
  getAllPricingTiers(): Promise<PricingTier[]>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  setCurrentPricingTier(id: string): Promise<PricingTier>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  getUserPaymentStatus(userId: string): Promise<{
    isDelinquent: boolean;
    missingMonths: string[]; // Array of YYYY-MM format months
    nextBillingDate: string | null; // YYYY-MM-DD format
    amountOwed: string; // Decimal as string
    gracePeriodEnds?: string; // YYYY-MM-DD format if grace period applies
  }>;
  getDelinquentUsers(): Promise<Array<{
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    missingMonths: string[];
    amountOwed: string;
    lastPaymentDate: Date | null;
  }>>;
  
  // Admin action log operations
  createAdminActionLog(log: InsertAdminActionLog): Promise<AdminActionLog>;
  getAllAdminActionLogs(): Promise<AdminActionLog[]>;
  
  // Weekly Performance Review
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
  
  // SupportMatch Profile operations
  getSupportMatchProfile(userId: string): Promise<SupportMatchProfile | undefined>;
  createSupportMatchProfile(profile: InsertSupportMatchProfile): Promise<SupportMatchProfile>;
  updateSupportMatchProfile(userId: string, profile: Partial<InsertSupportMatchProfile>): Promise<SupportMatchProfile>;
  getAllActiveSupportMatchProfiles(): Promise<SupportMatchProfile[]>;
  getAllSupportMatchProfiles(): Promise<SupportMatchProfile[]>;
  
  // SupportMatch Partnership operations
  createPartnership(partnership: InsertPartnership): Promise<Partnership>;
  getPartnershipById(id: string): Promise<Partnership | undefined>;
  getActivePartnershipByUser(userId: string): Promise<Partnership | undefined>;
  getAllPartnerships(): Promise<Partnership[]>;
  getPartnershipHistory(userId: string): Promise<(Partnership & { partnerFirstName?: string | null; partnerLastName?: string | null })[]>;
  updatePartnershipStatus(id: string, status: string): Promise<Partnership>;
  createAlgorithmicMatches(): Promise<Partnership[]>;
  
  // SupportMatch Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByPartnership(partnershipId: string): Promise<Message[]>;
  
  // SupportMatch Exclusion operations
  createExclusion(exclusion: InsertExclusion): Promise<Exclusion>;
  getExclusionsByUser(userId: string): Promise<Exclusion[]>;
  checkMutualExclusion(user1Id: string, user2Id: string): Promise<boolean>;
  deleteExclusion(id: string): Promise<void>;
  
  // SupportMatch Report operations
  createReport(report: InsertReport): Promise<Report>;
  getAllReports(): Promise<Report[]>;
  updateReportStatus(id: string, status: string, resolution?: string): Promise<Report>;
  
  // SupportMatch Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAllAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deactivateAnnouncement(id: string): Promise<Announcement>;
  
  // SupportMatch App Announcement operations
  createSupportmatchAnnouncement(announcement: InsertSupportmatchAnnouncement): Promise<SupportmatchAnnouncement>;
  getActiveSupportmatchAnnouncements(): Promise<SupportmatchAnnouncement[]>;
  getAllSupportmatchAnnouncements(): Promise<SupportmatchAnnouncement[]>;
  updateSupportmatchAnnouncement(id: string, announcement: Partial<InsertSupportmatchAnnouncement>): Promise<SupportmatchAnnouncement>;
  deactivateSupportmatchAnnouncement(id: string): Promise<SupportmatchAnnouncement>;
  
  // SupportMatch Stats
  getSupportMatchStats(): Promise<{
    activeUsers: number;
    currentPartnerships: number;
    pendingReports: number;
  }>;

  // LightHouse Profile operations
  createLighthouseProfile(profile: InsertLighthouseProfile): Promise<LighthouseProfile>;
  getLighthouseProfileByUserId(userId: string): Promise<LighthouseProfile | undefined>;
  getLighthouseProfileById(id: string): Promise<LighthouseProfile | undefined>;
  updateLighthouseProfile(id: string, profile: Partial<InsertLighthouseProfile>): Promise<LighthouseProfile>;
  getAllLighthouseProfiles(): Promise<LighthouseProfile[]>;
  getLighthouseProfilesByType(profileType: string): Promise<LighthouseProfile[]>;

  // LightHouse Property operations
  createLighthouseProperty(property: InsertLighthouseProperty): Promise<LighthouseProperty>;
  getLighthousePropertyById(id: string): Promise<LighthouseProperty | undefined>;
  getPropertiesByHost(hostId: string): Promise<LighthouseProperty[]>;
  getAllActiveProperties(): Promise<LighthouseProperty[]>;
  getAllProperties(): Promise<LighthouseProperty[]>;
  updateLighthouseProperty(id: string, property: Partial<InsertLighthouseProperty>): Promise<LighthouseProperty>;
  deleteLighthouseProperty(id: string): Promise<void>;

  // LightHouse Match operations
  createLighthouseMatch(match: InsertLighthouseMatch): Promise<LighthouseMatch>;
  getLighthouseMatchById(id: string): Promise<LighthouseMatch | undefined>;
  getMatchesBySeeker(seekerId: string): Promise<LighthouseMatch[]>;
  getMatchesByProperty(propertyId: string): Promise<LighthouseMatch[]>;
  getAllMatches(): Promise<LighthouseMatch[]>;
  updateLighthouseMatch(id: string, match: Partial<InsertLighthouseMatch>): Promise<LighthouseMatch>;

  // LightHouse Stats
  getLighthouseStats(): Promise<{
    totalSeekers: number;
    totalHosts: number;
    totalProperties: number;
    activeMatches: number;
    completedMatches: number;
  }>;

  // LightHouse Announcement operations
  createLighthouseAnnouncement(announcement: InsertLighthouseAnnouncement): Promise<LighthouseAnnouncement>;
  getActiveLighthouseAnnouncements(): Promise<LighthouseAnnouncement[]>;
  getAllLighthouseAnnouncements(): Promise<LighthouseAnnouncement[]>;
  updateLighthouseAnnouncement(id: string, announcement: Partial<InsertLighthouseAnnouncement>): Promise<LighthouseAnnouncement>;
  deactivateLighthouseAnnouncement(id: string): Promise<LighthouseAnnouncement>;

  // LightHouse Block operations
  createLighthouseBlock(block: InsertLighthouseBlock): Promise<LighthouseBlock>;
  getLighthouseBlocksByUser(userId: string): Promise<LighthouseBlock[]>;
  checkLighthouseBlock(userId: string, blockedUserId: string): Promise<boolean>;
  deleteLighthouseBlock(id: string): Promise<void>;

  // SocketRelay Request operations
  createSocketrelayRequest(userId: string, description: string, isPublic?: boolean): Promise<SocketrelayRequest>;
  getActiveSocketrelayRequests(): Promise<any[]>;
  getAllSocketrelayRequests(): Promise<any[]>;
  getSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined>;
  getSocketrelayRequestsByUser(userId: string): Promise<SocketrelayRequest[]>;
  getPublicSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined>;
  listPublicSocketrelayRequests(): Promise<SocketrelayRequest[]>;
  updateSocketrelayRequest(id: string, userId: string, description: string, isPublic?: boolean): Promise<SocketrelayRequest>;
  updateSocketrelayRequestStatus(id: string, status: string): Promise<SocketrelayRequest>;
  repostSocketrelayRequest(id: string, userId: string): Promise<SocketrelayRequest>;
  deleteSocketrelayRequest(id: string): Promise<void>;

  // SocketRelay Fulfillment operations
  createSocketrelayFulfillment(requestId: string, fulfillerUserId: string): Promise<SocketrelayFulfillment>;
  getSocketrelayFulfillmentById(id: string): Promise<SocketrelayFulfillment | undefined>;
  getSocketrelayFulfillmentsByRequest(requestId: string): Promise<SocketrelayFulfillment[]>;
  getSocketrelayFulfillmentsByUser(userId: string): Promise<any[]>;
  getAllSocketrelayFulfillments(): Promise<any[]>;
  closeSocketrelayFulfillment(id: string, userId: string, status: string): Promise<SocketrelayFulfillment>;

  // SocketRelay Message operations
  createSocketrelayMessage(message: InsertSocketrelayMessage): Promise<SocketrelayMessage>;
  getSocketrelayMessagesByFulfillment(fulfillmentId: string): Promise<SocketrelayMessage[]>;

  // SocketRelay Profile operations
  getSocketrelayProfile(userId: string): Promise<SocketrelayProfile | undefined>;
  createSocketrelayProfile(profile: InsertSocketrelayProfile): Promise<SocketrelayProfile>;
  updateSocketrelayProfile(userId: string, profile: Partial<InsertSocketrelayProfile>): Promise<SocketrelayProfile>;

  // SocketRelay Announcement operations
  createSocketrelayAnnouncement(announcement: InsertSocketrelayAnnouncement): Promise<SocketrelayAnnouncement>;
  getActiveSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]>;
  getAllSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]>;
  updateSocketrelayAnnouncement(id: string, announcement: Partial<InsertSocketrelayAnnouncement>): Promise<SocketrelayAnnouncement>;
  deactivateSocketrelayAnnouncement(id: string): Promise<SocketrelayAnnouncement>;

  // Directory operations
  getDirectoryProfileById(id: string): Promise<DirectoryProfile | undefined>;
  getDirectoryProfileByUserId(userId: string): Promise<DirectoryProfile | undefined>;
  listAllDirectoryProfiles(): Promise<DirectoryProfile[]>;
  listPublicDirectoryProfiles(): Promise<DirectoryProfile[]>;
  createDirectoryProfile(profile: InsertDirectoryProfile): Promise<DirectoryProfile>;
  updateDirectoryProfile(id: string, profile: Partial<InsertDirectoryProfile>): Promise<DirectoryProfile>;
  deleteDirectoryProfile(id: string): Promise<void>;

  // Directory Announcement operations
  createDirectoryAnnouncement(announcement: InsertDirectoryAnnouncement): Promise<DirectoryAnnouncement>;
  getActiveDirectoryAnnouncements(): Promise<DirectoryAnnouncement[]>;
  getAllDirectoryAnnouncements(): Promise<DirectoryAnnouncement[]>;
  updateDirectoryAnnouncement(id: string, announcement: Partial<InsertDirectoryAnnouncement>): Promise<DirectoryAnnouncement>;
  deactivateDirectoryAnnouncement(id: string): Promise<DirectoryAnnouncement>;

  // Directory Skills operations (admin only) - Legacy, kept for backward compatibility
  getAllDirectorySkills(): Promise<DirectorySkill[]>;
  createDirectorySkill(skill: InsertDirectorySkill): Promise<DirectorySkill>;
  deleteDirectorySkill(id: string): Promise<void>;

  // Shared Skills Database operations (Sector → Job Title → Skills)
  // Sectors
  getAllSkillsSectors(): Promise<SkillsSector[]>;
  getSkillsSectorById(id: string): Promise<SkillsSector | undefined>;
  createSkillsSector(sector: InsertSkillsSector): Promise<SkillsSector>;
  updateSkillsSector(id: string, sector: Partial<InsertSkillsSector>): Promise<SkillsSector>;
  deleteSkillsSector(id: string): Promise<void>;
  
  // Job Titles
  getAllSkillsJobTitles(sectorId?: string): Promise<SkillsJobTitle[]>;
  getSkillsJobTitleById(id: string): Promise<SkillsJobTitle | undefined>;
  createSkillsJobTitle(jobTitle: InsertSkillsJobTitle): Promise<SkillsJobTitle>;
  updateSkillsJobTitle(id: string, jobTitle: Partial<InsertSkillsJobTitle>): Promise<SkillsJobTitle>;
  deleteSkillsJobTitle(id: string): Promise<void>;
  
  // Skills
  getAllSkillsSkills(jobTitleId?: string): Promise<SkillsSkill[]>;
  getSkillsSkillById(id: string): Promise<SkillsSkill | undefined>;
  createSkillsSkill(skill: InsertSkillsSkill): Promise<SkillsSkill>;
  updateSkillsSkill(id: string, skill: Partial<InsertSkillsSkill>): Promise<SkillsSkill>;
  deleteSkillsSkill(id: string): Promise<void>;
  
  // Convenience methods for getting full hierarchy
  getSkillsHierarchy(): Promise<Array<{
    sector: SkillsSector;
    jobTitles: Array<{
      jobTitle: SkillsJobTitle;
      skills: SkillsSkill[];
    }>;
  }>>;
  
  // Get flattened list of all skills (for Directory app compatibility)
  getAllSkillsFlattened(): Promise<Array<{ id: string; name: string; sector: string; jobTitle: string }>>;

  // Chat Groups operations
  getAllChatGroups(): Promise<ChatGroup[]>;
  getActiveChatGroups(): Promise<ChatGroup[]>;
  getChatGroupById(id: string): Promise<ChatGroup | undefined>;
  createChatGroup(group: InsertChatGroup): Promise<ChatGroup>;
  updateChatGroup(id: string, group: Partial<InsertChatGroup>): Promise<ChatGroup>;
  deleteChatGroup(id: string): Promise<void>;

  // ChatGroups Announcement operations
  createChatgroupsAnnouncement(announcement: InsertChatgroupsAnnouncement): Promise<ChatgroupsAnnouncement>;
  getActiveChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]>;
  getAllChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]>;
  updateChatgroupsAnnouncement(id: string, announcement: Partial<InsertChatgroupsAnnouncement>): Promise<ChatgroupsAnnouncement>;
  deactivateChatgroupsAnnouncement(id: string): Promise<ChatgroupsAnnouncement>;

  // TrustTransport Profile operations
  getTrusttransportProfile(userId: string): Promise<TrusttransportProfile | undefined>;
  createTrusttransportProfile(profile: InsertTrusttransportProfile): Promise<TrusttransportProfile>;
  updateTrusttransportProfile(userId: string, profile: Partial<InsertTrusttransportProfile>): Promise<TrusttransportProfile>;
  deleteTrusttransportProfile(userId: string, reason?: string): Promise<void>;

  // TrustTransport Ride Request operations (simplified model)
  createTrusttransportRideRequest(request: InsertTrusttransportRideRequest & { riderId?: string }): Promise<TrusttransportRideRequest>;
  getTrusttransportRideRequestById(id: string): Promise<TrusttransportRideRequest | undefined>;
  getTrusttransportRideRequestsByRider(riderId: string): Promise<TrusttransportRideRequest[]>;
  getOpenTrusttransportRideRequests(): Promise<TrusttransportRideRequest[]>; // For drivers to see available requests
  getTrusttransportRideRequestsByDriver(driverId: string): Promise<TrusttransportRideRequest[]>; // Requests claimed by driver
  claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string): Promise<TrusttransportRideRequest>;
  updateTrusttransportRideRequest(id: string, request: Partial<InsertTrusttransportRideRequest>): Promise<TrusttransportRideRequest>;
  cancelTrusttransportRideRequest(id: string, userId: string): Promise<TrusttransportRideRequest>; // Cancel by rider or driver

  // TrustTransport Announcement operations
  createTrusttransportAnnouncement(announcement: InsertTrusttransportAnnouncement): Promise<TrusttransportAnnouncement>;
  getActiveTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]>;
  getAllTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]>;
  updateTrusttransportAnnouncement(id: string, announcement: Partial<InsertTrusttransportAnnouncement>): Promise<TrusttransportAnnouncement>;
  deactivateTrusttransportAnnouncement(id: string): Promise<TrusttransportAnnouncement>;

  // MechanicMatch Profile operations
  getMechanicmatchProfile(userId: string): Promise<MechanicmatchProfile | undefined>;
  getMechanicmatchProfileById(profileId: string): Promise<MechanicmatchProfile | undefined>;
  listMechanicmatchProfiles(filters?: {
    search?: string;
    role?: "mechanic" | "owner";
    isClaimed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MechanicmatchProfile[]; total: number }>;
  listPublicMechanicmatchProfiles(): Promise<MechanicmatchProfile[]>;
  createMechanicmatchProfile(profile: InsertMechanicmatchProfile): Promise<MechanicmatchProfile>;
  updateMechanicmatchProfile(userId: string, profile: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile>;
  updateMechanicmatchProfileById(profileId: string, profile: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile>;
  deleteMechanicmatchProfile(userId: string, reason?: string): Promise<void>;
  deleteMechanicmatchProfileById(profileId: string): Promise<void>;

  // MechanicMatch Vehicle operations
  getMechanicmatchVehiclesByOwner(ownerId: string): Promise<MechanicmatchVehicle[]>;
  getMechanicmatchVehicleById(id: string): Promise<MechanicmatchVehicle | undefined>;
  createMechanicmatchVehicle(vehicle: InsertMechanicmatchVehicle & { ownerId?: string }): Promise<MechanicmatchVehicle>;
  updateMechanicmatchVehicle(id: string, vehicle: Partial<InsertMechanicmatchVehicle>): Promise<MechanicmatchVehicle>;
  deleteMechanicmatchVehicle(id: string, ownerId: string): Promise<void>;

  // MechanicMatch Service Request operations
  createMechanicmatchServiceRequest(request: InsertMechanicmatchServiceRequest & { ownerId?: string }): Promise<MechanicmatchServiceRequest>;
  getMechanicmatchServiceRequestById(id: string): Promise<MechanicmatchServiceRequest | undefined>;
  getMechanicmatchServiceRequestsByOwner(ownerId: string): Promise<MechanicmatchServiceRequest[]>;
  getMechanicmatchServiceRequestsByOwnerPaginated(
    ownerId: string,
    limit: number,
    offset: number
  ): Promise<{ items: MechanicmatchServiceRequest[]; total: number }>;
  getOpenMechanicmatchServiceRequests(): Promise<MechanicmatchServiceRequest[]>;
  updateMechanicmatchServiceRequest(id: string, request: Partial<InsertMechanicmatchServiceRequest>): Promise<MechanicmatchServiceRequest>;

  // MechanicMatch Job operations
  createMechanicmatchJob(job: InsertMechanicmatchJob & { ownerId?: string }): Promise<MechanicmatchJob>;
  getMechanicmatchJobById(id: string): Promise<MechanicmatchJob | undefined>;
  getMechanicmatchJobsByOwner(ownerId: string): Promise<MechanicmatchJob[]>;
  getMechanicmatchJobsByMechanic(mechanicId: string): Promise<MechanicmatchJob[]>;
  updateMechanicmatchJob(id: string, job: Partial<InsertMechanicmatchJob>): Promise<MechanicmatchJob>;
  acceptMechanicmatchJob(jobId: string, mechanicId: string): Promise<MechanicmatchJob>;

  // MechanicMatch Availability operations
  getMechanicmatchAvailabilityByMechanic(mechanicId: string): Promise<MechanicmatchAvailability[]>;
  createMechanicmatchAvailability(availability: InsertMechanicmatchAvailability): Promise<MechanicmatchAvailability>;
  updateMechanicmatchAvailability(id: string, availability: Partial<InsertMechanicmatchAvailability>): Promise<MechanicmatchAvailability>;
  deleteMechanicmatchAvailability(id: string, mechanicId: string): Promise<void>;

  // MechanicMatch Review operations
  createMechanicmatchReview(review: InsertMechanicmatchReview & { reviewerId?: string }): Promise<MechanicmatchReview>;
  getMechanicmatchReviewById(id: string): Promise<MechanicmatchReview | undefined>;
  getMechanicmatchReviewsByReviewee(revieweeId: string): Promise<MechanicmatchReview[]>;
  getMechanicmatchReviewsByReviewer(reviewerId: string): Promise<MechanicmatchReview[]>;
  getMechanicmatchReviewsByJob(jobId: string): Promise<MechanicmatchReview[]>;

  // MechanicMatch Message operations
  createMechanicmatchMessage(message: InsertMechanicmatchMessage & { senderId?: string }): Promise<MechanicmatchMessage>;
  getMechanicmatchMessagesByJob(jobId: string): Promise<MechanicmatchMessage[]>;
  getMechanicmatchMessagesBetweenUsers(userId1: string, userId2: string): Promise<MechanicmatchMessage[]>;
  markMechanicmatchMessageAsRead(messageId: string, userId: string): Promise<MechanicmatchMessage>;
  getUnreadMechanicmatchMessages(userId: string): Promise<MechanicmatchMessage[]>;

  // MechanicMatch Search/Matching operations
  searchMechanicmatchMechanics(filters: {
    city?: string;
    state?: string;
    isMobileMechanic?: boolean;
    specialties?: string[];
    maxHourlyRate?: number;
    minRating?: number;
    isAvailable?: boolean;
  }): Promise<MechanicmatchProfile[]>;

  // MechanicMatch Announcement operations
  createMechanicmatchAnnouncement(announcement: InsertMechanicmatchAnnouncement): Promise<MechanicmatchAnnouncement>;
  getActiveMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]>;
  getAllMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]>;
  updateMechanicmatchAnnouncement(id: string, announcement: Partial<InsertMechanicmatchAnnouncement>): Promise<MechanicmatchAnnouncement>;
  deactivateMechanicmatchAnnouncement(id: string): Promise<MechanicmatchAnnouncement>;

  // LostMail Incident operations
  createLostmailIncident(incident: InsertLostmailIncident): Promise<LostmailIncident>;
  getLostmailIncidentById(id: string): Promise<LostmailIncident | undefined>;
  getLostmailIncidentsByEmail(email: string): Promise<LostmailIncident[]>;
  getLostmailIncidents(filters?: {
    incidentType?: string;
    status?: string;
    severity?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string; // Search by tracking number, ID, or reporter name
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: LostmailIncident[]; total: number }>;
  updateLostmailIncident(id: string, incident: Partial<InsertLostmailIncident>): Promise<LostmailIncident>;
  
  // LostMail Audit Trail operations
  createLostmailAuditTrailEntry(entry: InsertLostmailAuditTrail): Promise<LostmailAuditTrail>;
  getLostmailAuditTrailByIncident(incidentId: string): Promise<LostmailAuditTrail[]>;
  
  // LostMail Announcement operations
  createLostmailAnnouncement(announcement: InsertLostmailAnnouncement): Promise<LostmailAnnouncement>;
  getActiveLostmailAnnouncements(): Promise<LostmailAnnouncement[]>;
  getAllLostmailAnnouncements(): Promise<LostmailAnnouncement[]>;
  updateLostmailAnnouncement(id: string, announcement: Partial<InsertLostmailAnnouncement>): Promise<LostmailAnnouncement>;
  deactivateLostmailAnnouncement(id: string): Promise<LostmailAnnouncement>;

  // ========================================
  // RESEARCH OPERATIONS
  // ========================================

  // Research Items
  createResearchItem(item: InsertResearchItem): Promise<ResearchItem>;
  getResearchItemById(id: string): Promise<ResearchItem | undefined>;
  getResearchItems(filters?: {
    userId?: string;
    tag?: string;
    status?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string; // 'relevance', 'recent', 'popular'
  }): Promise<{ items: ResearchItem[]; total: number }>;
  updateResearchItem(id: string, item: Partial<InsertResearchItem>): Promise<ResearchItem>;
  incrementResearchItemViewCount(id: string): Promise<void>;
  acceptResearchAnswer(itemId: string, answerId: string): Promise<ResearchItem>;

  // Research Answers
  createResearchAnswer(answer: InsertResearchAnswer): Promise<ResearchAnswer>;
  getResearchAnswerById(id: string): Promise<ResearchAnswer | undefined>;
  getResearchAnswersByItemId(itemId: string, sortBy?: string): Promise<ResearchAnswer[]>;
  updateResearchAnswer(id: string, answer: Partial<InsertResearchAnswer>): Promise<ResearchAnswer>;
  calculateAnswerRelevance(answerId: string): Promise<number>;
  updateAnswerScore(answerId: string): Promise<void>;

  // Research Comments
  createResearchComment(comment: InsertResearchComment): Promise<ResearchComment>;
  getResearchComments(filters: { researchItemId?: string; answerId?: string }): Promise<ResearchComment[]>;
  updateResearchComment(id: string, comment: Partial<InsertResearchComment>): Promise<ResearchComment>;
  deleteResearchComment(id: string): Promise<void>;

  // Research Votes
  createOrUpdateResearchVote(vote: InsertResearchVote): Promise<ResearchVote>;
  getResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<ResearchVote | undefined>;
  deleteResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<void>;

  // Research Link Provenances
  createResearchLinkProvenance(provenance: InsertResearchLinkProvenance): Promise<ResearchLinkProvenance>;
  getResearchLinkProvenancesByAnswerId(answerId: string): Promise<ResearchLinkProvenance[]>;
  updateResearchLinkProvenance(id: string, provenance: Partial<InsertResearchLinkProvenance>): Promise<ResearchLinkProvenance>;
  calculateAnswerVerificationScore(answerId: string): Promise<number>;

  // Research Bookmarks & Follows
  createResearchBookmark(bookmark: InsertResearchBookmark): Promise<ResearchBookmark>;
  deleteResearchBookmark(userId: string, researchItemId: string): Promise<void>;
  getResearchBookmarks(userId: string): Promise<ResearchBookmark[]>;
  createResearchFollow(follow: InsertResearchFollow): Promise<ResearchFollow>;
  deleteResearchFollow(userId: string, filters: { followedUserId?: string; researchItemId?: string; tag?: string }): Promise<void>;
  getResearchFollows(userId: string): Promise<ResearchFollow[]>;

  // Research Reports
  createResearchReport(report: InsertResearchReport): Promise<ResearchReport>;
  getResearchReports(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ reports: ResearchReport[]; total: number }>;
  updateResearchReport(id: string, report: Partial<InsertResearchReport>): Promise<ResearchReport>;

  // Research Announcements
  createResearchAnnouncement(announcement: InsertResearchAnnouncement): Promise<ResearchAnnouncement>;
  getActiveResearchAnnouncements(): Promise<ResearchAnnouncement[]>;
  getAllResearchAnnouncements(): Promise<ResearchAnnouncement[]>;
  updateResearchAnnouncement(id: string, announcement: Partial<InsertResearchAnnouncement>): Promise<ResearchAnnouncement>;
  deactivateResearchAnnouncement(id: string): Promise<ResearchAnnouncement>;

  // Research Timeline/Feed
  getResearchTimeline(userId: string, limit?: number, offset?: number): Promise<ResearchItem[]>;

  // User Reputation (calculated)
  getUserReputation(userId: string): Promise<number>;

  // ========================================
  // GENTLEPULSE OPERATIONS
  // ========================================

  // GentlePulse Meditations
  createGentlepulseMeditation(meditation: InsertGentlepulseMeditation): Promise<GentlepulseMeditation>;
  getGentlepulseMeditations(filters?: {
    tag?: string;
    sortBy?: string; // 'newest', 'most-rated', 'highest-rating'
    limit?: number;
    offset?: number;
  }): Promise<{ meditations: GentlepulseMeditation[]; total: number }>;
  getGentlepulseMeditationById(id: string): Promise<GentlepulseMeditation | undefined>;
  updateGentlepulseMeditation(id: string, meditation: Partial<InsertGentlepulseMeditation>): Promise<GentlepulseMeditation>;
  incrementGentlepulsePlayCount(id: string): Promise<void>;

  // GentlePulse Ratings
  createOrUpdateGentlepulseRating(rating: InsertGentlepulseRating): Promise<GentlepulseRating>;
  getGentlepulseRatingsByMeditationId(meditationId: string): Promise<GentlepulseRating[]>;
  getGentlepulseRatingByClientAndMeditation(clientId: string, meditationId: string): Promise<GentlepulseRating | undefined>;
  updateGentlepulseMeditationRating(meditationId: string): Promise<void>;

  // GentlePulse Mood Checks
  createGentlepulseMoodCheck(moodCheck: InsertGentlepulseMoodCheck): Promise<GentlepulseMoodCheck>;
  getGentlepulseMoodChecksByClientId(clientId: string, days?: number): Promise<GentlepulseMoodCheck[]>;
  getGentlepulseMoodChecksByDateRange(startDate: Date, endDate: Date): Promise<GentlepulseMoodCheck[]>;

  // GentlePulse Favorites
  createGentlepulseFavorite(favorite: InsertGentlepulseFavorite): Promise<GentlepulseFavorite>;
  deleteGentlepulseFavorite(clientId: string, meditationId: string): Promise<void>;
  getGentlepulseFavoritesByClientId(clientId: string): Promise<GentlepulseFavorite[]>;
  isGentlepulseFavorite(clientId: string, meditationId: string): Promise<boolean>;

  // GentlePulse Announcements
  createGentlepulseAnnouncement(announcement: InsertGentlepulseAnnouncement): Promise<GentlepulseAnnouncement>;
  getActiveGentlepulseAnnouncements(): Promise<GentlepulseAnnouncement[]>;
  getAllGentlepulseAnnouncements(): Promise<GentlepulseAnnouncement[]>;
  updateGentlepulseAnnouncement(id: string, announcement: Partial<InsertGentlepulseAnnouncement>): Promise<GentlepulseAnnouncement>;
  deactivateGentlepulseAnnouncement(id: string): Promise<GentlepulseAnnouncement>;

  // ========================================
  // CHYME OPERATIONS
  // ========================================

  // Chyme Announcement operations
  createChymeAnnouncement(announcement: InsertChymeAnnouncement): Promise<ChymeAnnouncement>;
  getActiveChymeAnnouncements(): Promise<ChymeAnnouncement[]>;
  getAllChymeAnnouncements(): Promise<ChymeAnnouncement[]>;
  updateChymeAnnouncement(id: string, announcement: Partial<InsertChymeAnnouncement>): Promise<ChymeAnnouncement>;
  deactivateChymeAnnouncement(id: string): Promise<ChymeAnnouncement>;

  // Chyme Room operations
  createChymeRoom(room: InsertChymeRoom): Promise<ChymeRoom>;
  getChymeRoom(id: string): Promise<ChymeRoom | undefined>;
  getChymeRooms(roomType?: "public" | "private"): Promise<ChymeRoom[]>;
  updateChymeRoom(id: string, room: Partial<InsertChymeRoom>): Promise<ChymeRoom>;
  deactivateChymeRoom(id: string): Promise<ChymeRoom>;
  updateChymeRoomPinnedLink(id: string, pinnedLink: string | null): Promise<ChymeRoom>;
  getChymeRoomParticipantCount(roomId: string): Promise<number>;

  // Chyme Room Participant operations
  joinChymeRoom(participant: InsertChymeRoomParticipant): Promise<ChymeRoomParticipant>;
  leaveChymeRoom(roomId: string, userId: string): Promise<void>;
  getChymeRoomParticipants(roomId: string): Promise<ChymeRoomParticipant[]>;
  getChymeRoomParticipant(roomId: string, userId: string): Promise<ChymeRoomParticipant | undefined>;
  updateChymeRoomParticipant(roomId: string, userId: string, updates: Partial<InsertChymeRoomParticipant>): Promise<ChymeRoomParticipant>;
  getActiveRoomsForUser(userId: string): Promise<string[]>; // Returns room IDs where user is an active participant

  // Chyme User Follow operations
  followChymeUser(userId: string, followedUserId: string): Promise<ChymeUserFollow>;
  unfollowChymeUser(userId: string, followedUserId: string): Promise<void>;
  isFollowingChymeUser(userId: string, followedUserId: string): Promise<boolean>;
  getChymeUserFollows(userId: string): Promise<ChymeUserFollow[]>;

  // Chyme User Block operations
  blockChymeUser(userId: string, blockedUserId: string): Promise<ChymeUserBlock>;
  unblockChymeUser(userId: string, blockedUserId: string): Promise<void>;
  isBlockingChymeUser(userId: string, blockedUserId: string): Promise<boolean>;
  getChymeUserBlocks(userId: string): Promise<ChymeUserBlock[]>;

  // Chyme Message operations
  createChymeMessage(message: InsertChymeMessage): Promise<ChymeMessage>;
  getChymeMessages(roomId: string): Promise<ChymeMessage[]>;

  // ========================================
  // WORKFORCE RECRUITER OPERATIONS
  // ========================================

  // Workforce Recruiter Profile operations
  getWorkforceRecruiterProfile(userId: string): Promise<WorkforceRecruiterProfile | undefined>;
  createWorkforceRecruiterProfile(profile: InsertWorkforceRecruiterProfile): Promise<WorkforceRecruiterProfile>;
  updateWorkforceRecruiterProfile(userId: string, profile: Partial<InsertWorkforceRecruiterProfile>): Promise<WorkforceRecruiterProfile>;
  deleteWorkforceRecruiterProfile(userId: string, reason?: string): Promise<void>;

  // Workforce Recruiter Config operations
  getWorkforceRecruiterConfig(): Promise<WorkforceRecruiterConfig | undefined>;
  updateWorkforceRecruiterConfig(config: Partial<InsertWorkforceRecruiterConfig>): Promise<WorkforceRecruiterConfig>;
  createWorkforceRecruiterConfig(config: InsertWorkforceRecruiterConfig): Promise<WorkforceRecruiterConfig>;

  // Workforce Recruiter Occupation operations
  getWorkforceRecruiterOccupation(id: string): Promise<WorkforceRecruiterOccupation | undefined>;
  getAllWorkforceRecruiterOccupations(filters?: {
    sector?: string;
    skillLevel?: 'Foundational' | 'Intermediate' | 'Advanced';
    limit?: number;
    offset?: number;
  }): Promise<{ occupations: WorkforceRecruiterOccupation[]; total: number }>;
  createWorkforceRecruiterOccupation(occupation: InsertWorkforceRecruiterOccupation): Promise<WorkforceRecruiterOccupation>;
  updateWorkforceRecruiterOccupation(id: string, occupation: Partial<InsertWorkforceRecruiterOccupation>): Promise<WorkforceRecruiterOccupation>;
  deleteWorkforceRecruiterOccupation(id: string): Promise<void>;

  // Workforce Recruiter Meetup Event operations
  createWorkforceRecruiterMeetupEvent(event: InsertWorkforceRecruiterMeetupEvent & { createdBy: string }): Promise<WorkforceRecruiterMeetupEvent>;
  getWorkforceRecruiterMeetupEvents(filters?: {
    occupationId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ events: WorkforceRecruiterMeetupEvent[]; total: number }>;
  getWorkforceRecruiterMeetupEventById(id: string): Promise<WorkforceRecruiterMeetupEvent | undefined>;
  updateWorkforceRecruiterMeetupEvent(id: string, event: Partial<InsertWorkforceRecruiterMeetupEvent>): Promise<WorkforceRecruiterMeetupEvent>;
  deleteWorkforceRecruiterMeetupEvent(id: string): Promise<void>;
  
  // Workforce Recruiter Meetup Event Signup operations
  createWorkforceRecruiterMeetupEventSignup(signup: InsertWorkforceRecruiterMeetupEventSignup & { userId: string }): Promise<WorkforceRecruiterMeetupEventSignup>;
  getWorkforceRecruiterMeetupEventSignups(filters?: {
    eventId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ signups: WorkforceRecruiterMeetupEventSignup[]; total: number }>;
  getWorkforceRecruiterMeetupEventSignupCount(eventId: string): Promise<number>;
  getUserMeetupEventSignup(eventId: string, userId: string): Promise<WorkforceRecruiterMeetupEventSignup | undefined>;
  updateWorkforceRecruiterMeetupEventSignup(id: string, signup: Partial<InsertWorkforceRecruiterMeetupEventSignup>): Promise<WorkforceRecruiterMeetupEventSignup>;
  deleteWorkforceRecruiterMeetupEventSignup(id: string): Promise<void>;

  // Workforce Recruiter Reports
  getWorkforceRecruiterSummaryReport(): Promise<{
    totalWorkforceTarget: number;
    totalCurrentRecruited: number;
    percentRecruited: number;
    sectorBreakdown: Array<{ sector: string; target: number; recruited: number; percent: number }>;
    skillLevelBreakdown: Array<{ skillLevel: string; target: number; recruited: number; percent: number }>;
    annualTrainingGap: Array<{ occupationId: string; occupationTitle: string; sector: string; target: number; actual: number; gap: number }>;
  }>;
  getWorkforceRecruiterSkillLevelDetail(skillLevel: string): Promise<{
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
      matchReason: string; // "sector", "jobTitle", "skill", or "none"
    }>;
  }>;
  getWorkforceRecruiterSectorDetail(sector: string): Promise<{
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
  }>;

  // Workforce Recruiter Announcement operations
  createWorkforceRecruiterAnnouncement(announcement: InsertWorkforceRecruiterAnnouncement): Promise<WorkforceRecruiterAnnouncement>;
  getActiveWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]>;
  getAllWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]>;
  updateWorkforceRecruiterAnnouncement(id: string, announcement: Partial<InsertWorkforceRecruiterAnnouncement>): Promise<WorkforceRecruiterAnnouncement>;
  deactivateWorkforceRecruiterAnnouncement(id: string): Promise<WorkforceRecruiterAnnouncement>;

  // Blog (content-only) operations
  getPublishedBlogPosts(limit?: number, offset?: number): Promise<{ items: BlogPost[]; total: number }>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  getBlogCommentsForTopic(
    discourseTopicId: number,
    limit?: number,
    offset?: number
  ): Promise<{ items: BlogComment[]; total: number }>;

  // Blog Announcement operations
  createBlogAnnouncement(announcement: InsertBlogAnnouncement): Promise<BlogAnnouncement>;
  getActiveBlogAnnouncements(): Promise<BlogAnnouncement[]>;
  getAllBlogAnnouncements(): Promise<BlogAnnouncement[]>;
  updateBlogAnnouncement(id: string, announcement: Partial<InsertBlogAnnouncement>): Promise<BlogAnnouncement>;
  deactivateBlogAnnouncement(id: string): Promise<BlogAnnouncement>;

  // ========================================
  // DEFAULT ALIVE OR DEAD OPERATIONS
  // ========================================

  // Default Alive or Dead Financial Entry operations
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

  // Default Alive or Dead EBITDA Snapshot operations
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

  // Profile deletion operations with cascade anonymization
  deleteSupportMatchProfile(userId: string, reason?: string): Promise<void>;
  deleteLighthouseProfile(userId: string, reason?: string): Promise<void>;
  deleteSocketrelayProfile(userId: string, reason?: string): Promise<void>;
  deleteDirectoryProfileWithCascade(userId: string, reason?: string): Promise<void>;
  deleteTrusttransportProfile(userId: string, reason?: string): Promise<void>;
  deleteWorkforceRecruiterProfile(userId: string, reason?: string): Promise<void>;
  logProfileDeletion(userId: string, appName: string, reason?: string): Promise<ProfileDeletionLog>;
  
  // Complete account deletion - deletes user from all mini-apps and anonymizes all data
  deleteUserAccount(userId: string, reason?: string): Promise<void>;
  
  // NPS (Net Promoter Score) operations
  createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse>;
  getUserLastNpsResponse(userId: string): Promise<NpsResponse | undefined>;
  getNpsResponsesForWeek(weekStart: Date, weekEnd: Date): Promise<NpsResponse[]>;
  getAllNpsResponses(): Promise<NpsResponse[]>;
}

