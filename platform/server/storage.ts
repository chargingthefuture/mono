import { 
  users,
  loginEvents,
  pricingTiers,
  payments,
  adminActionLogs,
  supportMatchProfiles,
  partnerships,
  messages,
  exclusions,
  reports,
  announcements,
  supportmatchAnnouncements,
  lighthouseProfiles,
  lighthouseProperties,
  lighthouseMatches,
  lighthouseAnnouncements,
  lighthouseBlocks,
  type LighthouseBlock,
  type InsertLighthouseBlock,
  mechanicmatchBlocks,
  type MechanicmatchBlock,
  type InsertMechanicmatchBlock,
  trusttransportBlocks,
  type TrusttransportBlock,
  type InsertTrusttransportBlock,
  socketrelayRequests,
  socketrelayFulfillments,
  socketrelayMessages,
  socketrelayProfiles,
  socketrelayAnnouncements,
  directoryProfiles,
  directoryAnnouncements,
  directorySkills,
  type DirectoryProfile,
  type InsertDirectoryProfile,
  type DirectorySkill,
  type InsertDirectorySkill,
  skillsSectors,
  skillsJobTitles,
  skillsSkills,
  type SkillsSector,
  type InsertSkillsSector,
  type SkillsJobTitle,
  type InsertSkillsJobTitle,
  type SkillsSkill,
  type InsertSkillsSkill,
  chatGroups,
  chatgroupsAnnouncements,
  type ChatGroup,
  type InsertChatGroup,
  profileDeletionLogs,
  type ProfileDeletionLog,
  type InsertProfileDeletionLog,
  npsResponses,
  type NpsResponse,
  type InsertNpsResponse,
  type User,
  type UpsertUser,
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
  type DirectoryAnnouncement,
  type InsertDirectoryAnnouncement,
  type ChatgroupsAnnouncement,
  type InsertChatgroupsAnnouncement,
  trusttransportProfiles,
  trusttransportRideRequests,
  trusttransportAnnouncements,
  type TrusttransportProfile,
  type InsertTrusttransportProfile,
  type TrusttransportRideRequest,
  type InsertTrusttransportRideRequest,
  type TrusttransportAnnouncement,
  type InsertTrusttransportAnnouncement,
  mechanicmatchProfiles,
  mechanicmatchVehicles,
  mechanicmatchServiceRequests,
  mechanicmatchJobs,
  mechanicmatchAvailability,
  mechanicmatchReviews,
  mechanicmatchMessages,
  mechanicmatchAnnouncements,
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
  lostmailIncidents,
  lostmailAuditTrail,
  lostmailAnnouncements,
  type LostmailIncident,
  type InsertLostmailIncident,
  type LostmailAuditTrail,
  type InsertLostmailAuditTrail,
  type LostmailAnnouncement,
  type InsertLostmailAnnouncement,
  researchItems,
  researchAnswers,
  researchComments,
  researchVotes,
  researchLinkProvenances,
  researchBookmarks,
  researchFollows,
  researchReports,
  researchAnnouncements,
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
  chymeAnnouncements,
  workforceRecruiterProfiles,
  workforceRecruiterConfig,
  workforceRecruiterOccupations,
  workforceRecruiterMeetupEvents,
  workforceRecruiterMeetupEventSignups,
  workforceRecruiterAnnouncements,
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
  defaultAliveOrDeadFinancialEntries,
  defaultAliveOrDeadEbitdaSnapshots,
  type DefaultAliveOrDeadFinancialEntry,
  type InsertDefaultAliveOrDeadFinancialEntry,
  type DefaultAliveOrDeadEbitdaSnapshot,
  type InsertDefaultAliveOrDeadEbitdaSnapshot,
  type ChymeAnnouncement,
  type InsertChymeAnnouncement,
  chymeRooms,
  type ChymeRoom,
  type InsertChymeRoom,
  chymeRoomParticipants,
  type ChymeRoomParticipant,
  type InsertChymeRoomParticipant,
  chymeMessages,
  type ChymeMessage,
  type InsertChymeMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, or, inArray, gte, lte, lt } from "drizzle-orm";
import { startOfWeek, endOfWeek } from "date-fns";
import { randomBytes } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
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
  getChymeRoomParticipantCount(roomId: string): Promise<number>;

  // Chyme Room Participant operations
  joinChymeRoom(participant: InsertChymeRoomParticipant): Promise<ChymeRoomParticipant>;
  leaveChymeRoom(roomId: string, userId: string): Promise<void>;
  getChymeRoomParticipants(roomId: string): Promise<ChymeRoomParticipant[]>;
  getChymeRoomParticipant(roomId: string, userId: string): Promise<ChymeRoomParticipant | undefined>;
  updateChymeRoomParticipant(roomId: string, userId: string, updates: Partial<InsertChymeRoomParticipant>): Promise<ChymeRoomParticipant>;

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
      matchReason: string; // "sector", "jobTitle", "skill", or "none"
    }>;
  }>;

  // Workforce Recruiter Announcement operations
  createWorkforceRecruiterAnnouncement(announcement: InsertWorkforceRecruiterAnnouncement): Promise<WorkforceRecruiterAnnouncement>;
  getActiveWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]>;
  getAllWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]>;
  updateWorkforceRecruiterAnnouncement(id: string, announcement: Partial<InsertWorkforceRecruiterAnnouncement>): Promise<WorkforceRecruiterAnnouncement>;
  deactivateWorkforceRecruiterAnnouncement(id: string): Promise<WorkforceRecruiterAnnouncement>;

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

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, try to find existing user by ID (primary key)
    let existingUser: User | undefined;
    
    if (userData.id) {
      existingUser = await this.getUser(userData.id);
    }
    
    if (existingUser) {
      // User exists with same ID - update normally
      const [updated] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updated;
    }
    
    // User doesn't exist by ID - try to insert
    // If there's a unique constraint violation on email, handle it
    try {
      const [inserted] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return inserted;
    } catch (error: any) {
      // Handle unique constraint violation on email (PostgreSQL error code 23505)
      if (error?.code === '23505' && error?.constraint?.includes('email')) {
        // User exists with same email but different ID
        // Find the user by email and update them
        if (userData.email) {
          const [userByEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, userData.email));
          
          if (userByEmail) {
            // Update the existing user with the new data
            // Note: We preserve the existing user's ID since we can't change primary keys
            // The email will be updated to match (it's the same, so no change)
            // Other fields (name, profile image, etc.) will be updated
            const [updated] = await db
              .update(users)
              .set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                quoraProfileUrl: userData.quoraProfileUrl,
                updatedAt: new Date(),
                // Preserve existing fields that weren't provided
                pricingTier: userData.pricingTier ?? userByEmail.pricingTier,
                isAdmin: userData.isAdmin ?? userByEmail.isAdmin,
                isVerified: userData.isVerified ?? userByEmail.isVerified,
                isApproved: userData.isApproved ?? userByEmail.isApproved,
                subscriptionStatus: userData.subscriptionStatus ?? userByEmail.subscriptionStatus,
              })
              .where(eq(users.id, userByEmail.id))
              .returning();
            return updated;
          }
        }
      }
      // Re-throw if it's not a unique email constraint violation
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<User> {
    // Update user verification
    const [user] = await db
      .update(users)
      .set({ 
        isVerified: !!isVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    // Update all profiles belonging to this user across all apps
    // Directory profiles
    await db
      .update(directoryProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(directoryProfiles.userId, userId));

    // Lighthouse profiles
    await db
      .update(lighthouseProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(lighthouseProfiles.userId, userId));

    // SupportMatch profiles
    await db
      .update(supportMatchProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(supportMatchProfiles.userId, userId));

    // SocketRelay profiles
    await db
      .update(socketrelayProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(socketrelayProfiles.userId, userId));

    // TrustTransport profiles
    await db
      .update(trusttransportProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(trusttransportProfiles.userId, userId));

    // MechanicMatch profiles
    await db
      .update(mechanicmatchProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(mechanicmatchProfiles.userId, userId));


    // Workforce Recruiter profiles
    await db
      .update(workforceRecruiterProfiles)
      .set({ isVerified: !!isVerified, updatedAt: new Date() })
      .where(eq(workforceRecruiterProfiles.userId, userId));

    return user;
  }

  // User approval operations
  async updateUserApproval(userId: string, isApproved: boolean): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          isApproved: !!isApproved,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new Error("User not found");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  // Terms acceptance operations
  async updateTermsAcceptance(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        termsAcceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  // Update user Quora profile URL
  async updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          quoraProfileUrl: quoraProfileUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new Error("User not found");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  async updateUserName(userId: string, firstName: string | null, lastName: string | null): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          firstName: firstName || null,
          lastName: lastName || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new Error("User not found");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  // Pricing tier operations
  async getCurrentPricingTier(): Promise<PricingTier | undefined> {
    const [tier] = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.isCurrentTier, true))
      .orderBy(desc(pricingTiers.effectiveDate))
      .limit(1);
    return tier;
  }

  async getAllPricingTiers(): Promise<PricingTier[]> {
    return await db
      .select()
      .from(pricingTiers)
      .orderBy(desc(pricingTiers.effectiveDate));
  }

  async createPricingTier(tierData: InsertPricingTier): Promise<PricingTier> {
    // If this is set as the current tier, unset all others
    if (tierData.isCurrentTier) {
      await db
        .update(pricingTiers)
        .set({ isCurrentTier: false })
        .where(eq(pricingTiers.isCurrentTier, true));
    }

    const [tier] = await db
      .insert(pricingTiers)
      .values(tierData)
      .returning();
    return tier;
  }

  async setCurrentPricingTier(id: string): Promise<PricingTier> {
    // Unset all current tiers
    await db
      .update(pricingTiers)
      .set({ isCurrentTier: false })
      .where(eq(pricingTiers.isCurrentTier, true));

    // Set the specified tier as current
    const [tier] = await db
      .update(pricingTiers)
      .set({ isCurrentTier: true })
      .where(eq(pricingTiers.id, id))
      .returning();
    
    return tier;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    console.log("Creating payment with data:", JSON.stringify(paymentData, null, 2));
    
    // Explicitly build the values object to ensure all fields are included
    const values: any = {
      userId: paymentData.userId,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      billingPeriod: paymentData.billingPeriod,
      notes: paymentData.notes ?? null,
      recordedBy: paymentData.recordedBy,
    };
    
    // Include billingMonth for monthly payments
    if ('billingMonth' in paymentData) {
      values.billingMonth = paymentData.billingMonth ?? null;
    } else {
      values.billingMonth = null;
    }
    
    // Include yearly subscription dates for yearly payments
    if ('yearlyStartMonth' in paymentData) {
      values.yearlyStartMonth = paymentData.yearlyStartMonth ?? null;
    } else {
      values.yearlyStartMonth = null;
    }
    
    if ('yearlyEndMonth' in paymentData) {
      values.yearlyEndMonth = paymentData.yearlyEndMonth ?? null;
    } else {
      values.yearlyEndMonth = null;
    }
    
    console.log("Inserting with values:", JSON.stringify(values, null, 2));
    
    const [payment] = await db
      .insert(payments)
      .values(values)
      .returning();
    
    console.log("Created payment:", JSON.stringify(payment, null, 2));
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.paymentDate));
  }

  async getUserPaymentStatus(userId: string): Promise<{
    isDelinquent: boolean;
    missingMonths: string[];
    nextBillingDate: string | null;
    amountOwed: string;
    gracePeriodEnds?: string;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userPayments = await this.getPaymentsByUser(userId);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Check for yearly subscription coverage
    const activeYearlyPayment = userPayments.find(p => {
      if (p.billingPeriod !== 'yearly' || !p.yearlyStartMonth || !p.yearlyEndMonth) {
        return false;
      }
      const start = new Date(p.yearlyStartMonth + '-01');
      const end = new Date(p.yearlyEndMonth + '-01');
      // Set end to last day of the month
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      return now >= start && now <= end;
    });

    // If user has active yearly subscription, they're not delinquent
    if (activeYearlyPayment) {
      const endDate = new Date(activeYearlyPayment.yearlyEndMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      const nextBilling = new Date(endDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      nextBilling.setDate(1);
      
      return {
        isDelinquent: false,
        missingMonths: [],
        nextBillingDate: nextBilling.toISOString().split('T')[0],
        amountOwed: '0.00',
      };
    }

    // For monthly payments, check which months are missing
    const paidMonths = new Set<string>();
    userPayments.forEach(payment => {
      if (payment.billingPeriod === 'monthly' && payment.billingMonth) {
        paidMonths.add(payment.billingMonth);
      }
    });

    // Calculate billing months starting from user's signup date
    const signupDate = user.createdAt;
    const signupMonth = new Date(signupDate.getFullYear(), signupDate.getMonth(), 1);
    const signupMonthStr = `${signupMonth.getFullYear()}-${String(signupMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate all expected billing months from signup to last month (current month not due yet)
    const expectedMonths: string[] = [];
    const checkDate = new Date(signupMonth);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    while (checkDate <= lastMonthDate) {
      const monthStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
      expectedMonths.push(monthStr);
      // Move to next month
      checkDate.setMonth(checkDate.getMonth() + 1);
    }
    
    // Find missing months (expected months that haven't been paid)
    const missingMonths: string[] = expectedMonths.filter(month => !paidMonths.has(month));
    const monthlyRate = parseFloat(user.pricingTier);

    // Grace period: 15 days into current month
    const gracePeriodEnds = new Date(now.getFullYear(), now.getMonth(), 15);
    const isInGracePeriod = now <= gracePeriodEnds;

    // User is delinquent if they have missing months and grace period has passed
    const isDelinquent = missingMonths.length > 0 && !isInGracePeriod;
    
    // Calculate amount owed (only for actually missing months)
    const amountOwed = (missingMonths.length * monthlyRate).toFixed(2);
    
    // Next billing date is first of next month
    const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      isDelinquent,
      missingMonths,
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      amountOwed,
      gracePeriodEnds: isInGracePeriod ? gracePeriodEnds.toISOString().split('T')[0] : undefined,
    };
  }

  async getDelinquentUsers(): Promise<Array<{
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    missingMonths: string[];
    amountOwed: string;
    lastPaymentDate: Date | null;
  }>> {
    const allUsers = await this.getAllUsers();
    const delinquentUsers: Array<{
      userId: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      missingMonths: string[];
      amountOwed: string;
      lastPaymentDate: Date | null;
    }> = [];

    for (const user of allUsers) {
      const status = await this.getUserPaymentStatus(user.id);
      if (status.isDelinquent) {
        const userPayments = await this.getPaymentsByUser(user.id);
        const lastPayment = userPayments.length > 0 
          ? userPayments[0].paymentDate 
          : null;

        delinquentUsers.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          missingMonths: status.missingMonths,
          amountOwed: status.amountOwed,
          lastPaymentDate: lastPayment,
        });
      }
    }

    return delinquentUsers.sort((a, b) => {
      // Sort by number of missing months (most delinquent first)
      if (b.missingMonths.length !== a.missingMonths.length) {
        return b.missingMonths.length - a.missingMonths.length;
      }
      // Then by last payment date (oldest first)
      if (!a.lastPaymentDate && !b.lastPaymentDate) return 0;
      if (!a.lastPaymentDate) return -1;
      if (!b.lastPaymentDate) return 1;
      return a.lastPaymentDate.getTime() - b.lastPaymentDate.getTime();
    });
  }

  // Admin action log operations
  async createAdminActionLog(logData: InsertAdminActionLog): Promise<AdminActionLog> {
    const [log] = await db
      .insert(adminActionLogs)
      .values(logData)
      .returning();
    return log;
  }

  async getAllAdminActionLogs(): Promise<AdminActionLog[]> {
    return await db
      .select()
      .from(adminActionLogs)
      .orderBy(desc(adminActionLogs.createdAt))
      .limit(100);
  }

  // Stats
  async getAdminStats() {
    const allUsers = await db.select().from(users);
    
    // Calculate outstanding revenue based on current active users
    const outstandingRevenue = allUsers.reduce((sum, user) => {
      if (user.subscriptionStatus === 'active') {
        return sum + parseFloat(user.pricingTier);
      }
      return sum;
    }, 0);

    // Calculate collected revenue from payments made this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, startOfMonth),
          lte(payments.paymentDate, endOfMonth)
        )
      );
    
    const collectedMonthlyRevenue = monthlyPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    return {
      totalUsers: allUsers.length,
      collectedMonthlyRevenue: collectedMonthlyRevenue.toFixed(2),
      outstandingRevenue: outstandingRevenue.toFixed(2),
    };
  }

  // Helper to get start of week (Monday) for a given date
  private getWeekStart(date: Date): Date {
    // Weeks start on Saturday and end on Friday
    // Use date-fns startOfWeek with weekStartsOn: 6 (Saturday)
    return startOfWeek(date, { weekStartsOn: 6 });
  }

  // Helper to get end of week (Friday) for a given date
  private getWeekEnd(date: Date): Date {
    // Weeks start on Saturday and end on Friday
    // Use date-fns endOfWeek with weekStartsOn: 6 (Saturday)
    return endOfWeek(date, { weekStartsOn: 6 });
  }

  // Helper to format date as YYYY-MM-DD (using local time, not UTC)
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper to get all days in a week
  private getDaysInWeek(weekStart: Date): Array<{ date: Date; dateString: string }> {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push({
        date: day,
        dateString: this.formatDate(day),
      });
    }
    return days;
  }

  async getWeeklyPerformanceReview(weekStart: Date): Promise<{
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
  }> {
    // Calculate current week boundaries (Saturday to Friday)
    const currentWeekStart = this.getWeekStart(weekStart);
    const currentWeekEnd = this.getWeekEnd(weekStart);
    
    // Calculate previous week boundaries
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(currentWeekEnd);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    // Initialize user statistics variables (must be declared before use)
    let totalUsersCurrentWeek = 0;
    let verifiedUsersCurrentWeek = 0;
    let approvedUsersCurrentWeek = 0;
    let totalUsersPreviousWeek = 0;
    let verifiedUsersPreviousWeek = 0;
    let approvedUsersPreviousWeek = 0;
    let verifiedUsersPercentage = 0;
    let verifiedUsersPercentageChange = 0;

    // Remove unused variables - dates are already correct for DB comparison

    // Log week boundaries for debugging
    console.log("Week boundaries:", {
      inputDate: weekStart.toISOString(),
      currentWeekStart: currentWeekStart.toISOString(),
      currentWeekEnd: currentWeekEnd.toISOString(),
      previousWeekStart: previousWeekStart.toISOString(),
      previousWeekEnd: previousWeekEnd.toISOString(),
      currentWeekStartLocal: currentWeekStart.toLocaleString(),
      currentWeekEndLocal: currentWeekEnd.toLocaleString(),
    });

    // Debug: Get a sample of all users and payments to see date ranges
    const allUsersSample = await db.select().from(users).limit(5);
    const allPaymentsSample = await db.select().from(payments).limit(5);
    console.log("Sample user dates:", allUsersSample.map(u => ({ id: u.id, createdAt: u.createdAt?.toISOString() })));
    console.log("Sample payment dates:", allPaymentsSample.map(p => ({ id: p.id, paymentDate: p.paymentDate?.toISOString() })));

    // Get new users for current week
    const currentWeekNewUsers = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, currentWeekStart),
          lte(users.createdAt, currentWeekEnd)
        )
      );
    
    console.log(`Found ${currentWeekNewUsers.length} new users for current week (range: ${currentWeekStart.toISOString()} to ${currentWeekEnd.toISOString()})`);
    
    // Debug: Show sample user dates if any exist
    if (currentWeekNewUsers.length > 0) {
      console.log("Sample user created dates:", currentWeekNewUsers.slice(0, 3).map(u => u.createdAt?.toISOString()));
    }

    // Get new users for previous week
    const previousWeekNewUsers = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, previousWeekStart),
          lte(users.createdAt, previousWeekEnd)
        )
      );

    // Get payments for current week (used for revenue metrics)
    const currentWeekPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, currentWeekStart),
          lte(payments.paymentDate, currentWeekEnd)
        )
      );

    // Get payments for previous week (used for revenue metrics)
    const previousWeekPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, previousWeekStart),
          lte(payments.paymentDate, previousWeekEnd)
        )
      );

    // Get login events for current week (webapp logins only)
    const currentWeekLoginEvents = await db
      .select()
      .from(loginEvents)
      .where(
        and(
          gte(loginEvents.createdAt, currentWeekStart),
          lte(loginEvents.createdAt, currentWeekEnd),
        )
      );

    // Get login events for previous week (webapp logins only)
    const previousWeekLoginEvents = await db
      .select()
      .from(loginEvents)
      .where(
        and(
          gte(loginEvents.createdAt, previousWeekStart),
          lte(loginEvents.createdAt, previousWeekEnd),
        )
      );

    // Calculate daily active users (users who logged in on that day)
    const currentWeekDays = this.getDaysInWeek(currentWeekStart);
    const currentWeekDAU = currentWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      // Unique users who logged in during this day
      const usersWithLogins = currentWeekLoginEvents
        .filter(e => {
          const loginDate = new Date(e.createdAt);
          return loginDate >= dayStart && loginDate <= dayEnd;
        })
        .map(e => e.userId);

      const uniqueUsers = new Set(usersWithLogins);

      return {
        date: day.dateString,
        count: uniqueUsers.size,
      };
    });

    const previousWeekDays = this.getDaysInWeek(previousWeekStart);
    const previousWeekDAU = previousWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const usersWithLogins = previousWeekLoginEvents
        .filter(e => {
          const loginDate = new Date(e.createdAt);
          loginDate.setHours(0, 0, 0, 0);
          return loginDate.getTime() === dayStart.getTime();
        })
        .map(e => e.userId);

      const uniqueUsers = new Set(usersWithLogins);

      return {
        date: day.dateString,
        count: uniqueUsers.size,
      };
    });

    // Calculate daily revenue
    const currentWeekDailyRevenue = currentWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = currentWeekPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() >= dayStart.getTime() && paymentDate.getTime() <= dayEnd.getTime();
      });

      const amount = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        date: day.dateString,
        amount: parseFloat(amount.toFixed(2)),
      };
    });

    const previousWeekDailyRevenue = previousWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = previousWeekPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() >= dayStart.getTime() && paymentDate.getTime() <= dayEnd.getTime();
      });

      const amount = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        date: day.dateString,
        amount: parseFloat(amount.toFixed(2)),
      };
    });

    // Calculate total revenue
    const currentWeekRevenue = currentWeekPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const previousWeekRevenue = previousWeekPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Calculate percentage changes
    const newUsersChange = previousWeekNewUsers.length === 0
      ? (currentWeekNewUsers.length > 0 ? 100 : 0)
      : ((currentWeekNewUsers.length - previousWeekNewUsers.length) / previousWeekNewUsers.length) * 100;

    const revenueChange = previousWeekRevenue === 0
      ? (currentWeekRevenue > 0 ? 100 : 0)
      : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;

    // Calculate user stats changes
    // Note: totalUsersChange, approvedUsersChange, and verifiedUsersChange are calculated later after values are populated
    let totalUsersChange = 0;
    let approvedUsersChange = 0;
    let verifiedUsersChange = 0;

    // Growth Metrics
    // Calculate weekly growth rate (already calculated as newUsersChange, but expressed as percentage)
    const weeklyGrowthRate = parseFloat(newUsersChange.toFixed(2));

    let mrr = 0;
    let arr = 0;
    let mau = 0;
    let churnRate = 0;
    let clv = 0;
    let retentionRate = 0;
    let mrrGrowth = 0;

    try {
      // Calculate MRR (Monthly Recurring Revenue) - sum of monthly payments for current month
      const currentMonth = new Date(weekStart);
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      console.log("Metrics calculation - month boundaries:", {
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
      });
      
      const monthlyPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, monthStart),
            lte(payments.paymentDate, monthEnd),
            eq(payments.billingPeriod, 'monthly')
          )
        );
      
      mrr = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      console.log("Metrics calculation:", {
        monthlyPaymentsCount: monthlyPayments.length,
        mrr,
        monthlyPaymentsSample: monthlyPayments.slice(0, 3).map(p => ({ userId: p.userId, amount: p.amount, paymentDate: p.paymentDate?.toISOString() }))
      });
      
      // Calculate ARR (Annual Recurring Revenue)
      // For this dashboard, ARR is defined as the total value of active yearly subscriptions
      // during the current month, without multiplying by 12. This keeps a $12 yearly
      // subscription represented as $12 ARR (not $144).
      const yearlyPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, monthStart),
            lte(payments.paymentDate, monthEnd),
            eq(payments.billingPeriod, 'yearly')
          )
        );
      
      const yearlyRevenue = yearlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      // Only include yearly subscription value in ARR to avoid inflating the number
      // and to match how admins expect to reason about yearly contracts.
      arr = yearlyRevenue;

      // Calculate MAU (Monthly Active Users) - unique users who logged into the webapp during the current month
      const monthlyLoginEvents = await db
        .select()
        .from(loginEvents)
        .where(
          and(
            gte(loginEvents.createdAt, monthStart),
            lte(loginEvents.createdAt, monthEnd),
          )
        );

      const activeUserIds = new Set(monthlyLoginEvents.map(e => e.userId));
      mau = activeUserIds.size;

      // Calculate Churn Rate - users who paid in previous month but not in current month
      // Note: Yearly subscribers should only be considered churned if their subscription has expired
      const previousMonth = new Date(monthStart);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
      previousMonthStart.setHours(0, 0, 0, 0);
      const previousMonthEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const previousMonthPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, previousMonthStart),
            lte(payments.paymentDate, previousMonthEnd)
          )
        );
      
      // Separate monthly and yearly payments from previous month
      const previousMonthMonthlyPayments = previousMonthPayments.filter(p => p.billingPeriod === 'monthly');
      const previousMonthYearlyPayments = previousMonthPayments.filter(p => p.billingPeriod === 'yearly');
      
      // Get current month string for comparison (YYYY-MM format)
      const currentMonthStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      
      // For yearly payments, check if subscription is still active
      // A yearly subscription is active if yearlyEndMonth >= currentMonthStr
      const activeYearlySubscribers = new Set<string>();
      previousMonthYearlyPayments.forEach(payment => {
        if (payment.yearlyEndMonth && payment.yearlyEndMonth >= currentMonthStr) {
          // Subscription is still active
          activeYearlySubscribers.add(payment.userId);
        }
      });
      
      // Users who should be considered for churn:
      // 1. Monthly payers from previous month (they need to pay each month)
      // 2. Yearly payers whose subscription has expired (yearlyEndMonth < currentMonthStr)
      const previousMonthMonthlyUserIds = new Set(previousMonthMonthlyPayments.map(p => p.userId));
      const expiredYearlyUserIds = new Set(
        previousMonthYearlyPayments
          .filter(p => !p.yearlyEndMonth || p.yearlyEndMonth < currentMonthStr)
          .map(p => p.userId)
      );
      
      // Combine monthly payers and expired yearly payers
      const previousMonthActiveUsers = new Set([
        ...previousMonthMonthlyUserIds,
        ...expiredYearlyUserIds
      ]);
      
      // Churned users are those who:
      // - Paid monthly in previous month but not in current month, OR
      // - Had expired yearly subscription in previous month but didn't renew in current month
      // Note: Users with active yearly subscriptions are NOT considered churned
      const churnedUsers = Array.from(previousMonthActiveUsers).filter(id => !activeUserIds.has(id)).length;
      const totalPreviousMonthActiveUsers = previousMonthActiveUsers.size;
      churnRate = totalPreviousMonthActiveUsers === 0 ? 0 : (churnedUsers / totalPreviousMonthActiveUsers) * 100;

      // Calculate CLV (Customer Lifetime Value) - average revenue per user over their lifetime
      const allPayments = await db.select().from(payments);
      const userTotalRevenue = new Map<string, number>();
      allPayments.forEach(p => {
        const current = userTotalRevenue.get(p.userId) || 0;
        userTotalRevenue.set(p.userId, current + parseFloat(p.amount));
      });
      const totalUsersWithPayments = userTotalRevenue.size;
      const totalLifetimeRevenue = Array.from(userTotalRevenue.values()).reduce((sum, rev) => sum + rev, 0);
      clv = totalUsersWithPayments === 0 ? 0 : totalLifetimeRevenue / totalUsersWithPayments;

      // Calculate Retention Rate - % of previous month users who are still active
      // A user is retained if:
      // 1. They paid in current month (activeUserIds), OR
      // 2. They have an active yearly subscription (activeYearlySubscribers)
      // Note: For retention, we consider ALL users who paid in previous month (both monthly and yearly)
      const allPreviousMonthUserIds = new Set(previousMonthPayments.map(p => p.userId));
      const retainedUsers = Array.from(allPreviousMonthUserIds).filter(id => 
        activeUserIds.has(id) || activeYearlySubscribers.has(id)
      ).length;
      retentionRate = allPreviousMonthUserIds.size === 0 ? 0 : (retainedUsers / allPreviousMonthUserIds.size) * 100;

      // Calculate previous month MRR for comparison
      // Reuse previousMonthMonthlyPayments that was already calculated above
      const previousMRR = previousMonthMonthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      mrrGrowth = previousMRR === 0 ? (mrr > 0 ? 100 : 0) : ((mrr - previousMRR) / previousMRR) * 100;
    } catch (error) {
      console.error("Error calculating metrics:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      // Metrics will default to 0 values
    }

    // Calculate NPS outside try-catch for safety
    let nps = 0;
    let npsChange = 0;
    let npsResponsesCount = 0;
    
    try {
      const currentWeekNpsResponses = await this.getNpsResponsesForWeek(currentWeekStart, currentWeekEnd);
      const previousWeekNpsResponses = await this.getNpsResponsesForWeek(previousWeekStart, previousWeekEnd);
      
      if (currentWeekNpsResponses.length > 0) {
        // Invert scores because the question is "How would you feel if this app no longer existed?"
        // Score 0 (extremely unhappy about losing app) = promoter (inverted to 10)
        // Score 10 (extremely happy about losing app) = detractor (inverted to 0)
        const promoters = currentWeekNpsResponses.filter(r => (10 - r.score) >= 9).length;
        const detractors = currentWeekNpsResponses.filter(r => (10 - r.score) <= 6).length;
        const total = currentWeekNpsResponses.length;
        const promoterPercent = (promoters / total) * 100;
        const detractorPercent = (detractors / total) * 100;
        nps = Math.round(promoterPercent - detractorPercent);
        npsResponsesCount = total;
      }
      
      if (previousWeekNpsResponses.length > 0 && currentWeekNpsResponses.length > 0) {
        // Invert scores for previous week as well
        const prevPromoters = previousWeekNpsResponses.filter(r => (10 - r.score) >= 9).length;
        const prevDetractors = previousWeekNpsResponses.filter(r => (10 - r.score) <= 6).length;
        const prevTotal = previousWeekNpsResponses.length;
        const prevPromoterPercent = (prevPromoters / prevTotal) * 100;
        const prevDetractorPercent = (prevDetractors / prevTotal) * 100;
        const prevNps = Math.round(prevPromoterPercent - prevDetractorPercent);
        npsChange = nps - prevNps;
      } else if (previousWeekNpsResponses.length === 0 && currentWeekNpsResponses.length > 0) {
        npsChange = nps;
      }
    } catch (error) {
      console.error("Error calculating NPS:", error);
    }

    // Calculate GentlePulse Mood Check statistics
    let averageMood = 0;
    let moodChange = 0;
    let moodResponsesCount = 0;
    
    try {
      // Get mood checks for current week (using date field, not createdAt)
      // Use formatDate to avoid timezone issues (toISOString converts to UTC which can shift dates)
      const currentWeekMoodChecks = await db
        .select()
        .from(gentlepulseMoodChecks)
        .where(
          and(
            gte(gentlepulseMoodChecks.date, this.formatDate(currentWeekStart)),
            lte(gentlepulseMoodChecks.date, this.formatDate(currentWeekEnd))
          )
        );
      
      // Get mood checks for previous week
      const previousWeekMoodChecks = await db
        .select()
        .from(gentlepulseMoodChecks)
        .where(
          and(
            gte(gentlepulseMoodChecks.date, this.formatDate(previousWeekStart)),
            lte(gentlepulseMoodChecks.date, this.formatDate(previousWeekEnd))
          )
        );
      
      if (currentWeekMoodChecks.length > 0) {
        const totalMood = currentWeekMoodChecks.reduce((sum, check) => sum + check.moodValue, 0);
        averageMood = parseFloat((totalMood / currentWeekMoodChecks.length).toFixed(2));
        moodResponsesCount = currentWeekMoodChecks.length;
      }
      
      if (previousWeekMoodChecks.length > 0 && currentWeekMoodChecks.length > 0) {
        const prevTotalMood = previousWeekMoodChecks.reduce((sum, check) => sum + check.moodValue, 0);
        const prevAverageMood = parseFloat((prevTotalMood / previousWeekMoodChecks.length).toFixed(2));
        moodChange = parseFloat((averageMood - prevAverageMood).toFixed(2));
      } else if (previousWeekMoodChecks.length === 0 && currentWeekMoodChecks.length > 0) {
        moodChange = averageMood;
      }
    } catch (error) {
      console.error("Error calculating mood statistics:", error);
    }

    // Calculate User Statistics (Total, Verified, Approved)
    // Variables are already declared above, now we populate them
    try {
      // Get all users created up to the end of current week (excluding deleted users)
      const allUsersCurrentWeek = await db
        .select()
        .from(users)
        .where(lte(users.createdAt, currentWeekEnd));
      
      // Filter out deleted users (those with IDs starting with "deleted_user_")
      const activeUsersCurrentWeek = allUsersCurrentWeek.filter(user => {
        if (!user || !user.id) return false;
        const id = String(user.id);
        return !id.startsWith("deleted_user_");
      });
      
      totalUsersCurrentWeek = activeUsersCurrentWeek.length;
      verifiedUsersCurrentWeek = activeUsersCurrentWeek.filter(user => user.isVerified === true).length;
      approvedUsersCurrentWeek = activeUsersCurrentWeek.filter(user => user.isApproved === true).length;
      
      verifiedUsersPercentage = totalUsersCurrentWeek === 0 
        ? 0 
        : parseFloat(((verifiedUsersCurrentWeek / totalUsersCurrentWeek) * 100).toFixed(2));

      // Get all users created up to the end of previous week (excluding deleted users)
      const allUsersPreviousWeek = await db
        .select()
        .from(users)
        .where(lte(users.createdAt, previousWeekEnd));
      
      const activeUsersPreviousWeek = allUsersPreviousWeek.filter(user => {
        if (!user || !user.id) return false;
        const id = String(user.id);
        return !id.startsWith("deleted_user_");
      });
      
      totalUsersPreviousWeek = activeUsersPreviousWeek.length;
      verifiedUsersPreviousWeek = activeUsersPreviousWeek.filter(user => user.isVerified === true).length;
      approvedUsersPreviousWeek = activeUsersPreviousWeek.filter(user => user.isApproved === true).length;
      
      const verifiedUsersPercentagePreviousWeek = totalUsersPreviousWeek === 0 
        ? 0 
        : parseFloat(((verifiedUsersPreviousWeek / totalUsersPreviousWeek) * 100).toFixed(2));

      // Calculate week-over-week change
      verifiedUsersPercentageChange = verifiedUsersPercentage - verifiedUsersPercentagePreviousWeek;

      // Calculate totalUsersChange, approvedUsersChange, and verifiedUsersChange now that values are populated
      totalUsersChange = totalUsersPreviousWeek === 0
        ? (totalUsersCurrentWeek > 0 ? 100 : 0)
        : ((totalUsersCurrentWeek - totalUsersPreviousWeek) / totalUsersPreviousWeek) * 100;

      approvedUsersChange = approvedUsersPreviousWeek === 0
        ? (approvedUsersCurrentWeek > 0 ? 100 : 0)
        : ((approvedUsersCurrentWeek - approvedUsersPreviousWeek) / approvedUsersPreviousWeek) * 100;

      verifiedUsersChange = verifiedUsersPreviousWeek === 0
        ? (verifiedUsersCurrentWeek > 0 ? 100 : 0)
        : ((verifiedUsersCurrentWeek - verifiedUsersPreviousWeek) / verifiedUsersPreviousWeek) * 100;
    } catch (error) {
      console.error("Error calculating user statistics:", error);
    }

    // Get EBITDA snapshots for both weeks to determine Default Alive/Dead status
    let currentWeekIsDefaultAlive: boolean | null = null;
    let previousWeekIsDefaultAlive: boolean | null = null;
    
    try {
      const currentWeekSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(currentWeekStart);
      const previousWeekSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(previousWeekStart);
      
      currentWeekIsDefaultAlive = currentWeekSnapshot?.isDefaultAlive ?? null;
      previousWeekIsDefaultAlive = previousWeekSnapshot?.isDefaultAlive ?? null;
    } catch (error) {
      console.error("Error fetching EBITDA snapshots for weekly performance:", error);
      // Continue with null values if snapshots don't exist
    }

    const result = {
      currentWeek: {
        startDate: this.formatDate(currentWeekStart),
        endDate: this.formatDate(currentWeekEnd),
        newUsers: currentWeekNewUsers.length,
        dailyActiveUsers: currentWeekDAU,
        revenue: parseFloat(currentWeekRevenue.toFixed(2)),
        dailyRevenue: currentWeekDailyRevenue,
        totalUsers: totalUsersCurrentWeek,
        verifiedUsers: verifiedUsersCurrentWeek,
        approvedUsers: approvedUsersCurrentWeek,
        isDefaultAlive: currentWeekIsDefaultAlive,
      },
      previousWeek: {
        startDate: this.formatDate(previousWeekStart),
        endDate: this.formatDate(previousWeekEnd),
        newUsers: previousWeekNewUsers.length,
        dailyActiveUsers: previousWeekDAU,
        revenue: parseFloat(previousWeekRevenue.toFixed(2)),
        dailyRevenue: previousWeekDailyRevenue,
        totalUsers: totalUsersPreviousWeek,
        verifiedUsers: verifiedUsersPreviousWeek,
        approvedUsers: approvedUsersPreviousWeek,
        isDefaultAlive: previousWeekIsDefaultAlive,
      },
      comparison: {
        newUsersChange: parseFloat(newUsersChange.toFixed(2)),
        revenueChange: parseFloat(revenueChange.toFixed(2)),
        totalUsersChange: parseFloat(totalUsersChange.toFixed(2)),
        verifiedUsersChange: parseFloat(verifiedUsersChange.toFixed(2)),
        approvedUsersChange: parseFloat(approvedUsersChange.toFixed(2)),
      },
      metrics: {
        weeklyGrowthRate: weeklyGrowthRate,
        mrr: parseFloat(mrr.toFixed(2)),
        arr: parseFloat(arr.toFixed(2)),
        mrrGrowth: parseFloat(mrrGrowth.toFixed(2)),
        mau: mau,
        churnRate: parseFloat(churnRate.toFixed(2)),
        clv: parseFloat(clv.toFixed(2)),
        retentionRate: parseFloat(retentionRate.toFixed(2)),
        nps: nps,
        npsChange: npsChange,
        npsResponses: npsResponsesCount,
        verifiedUsersPercentage: verifiedUsersPercentage,
        verifiedUsersPercentageChange: parseFloat(verifiedUsersPercentageChange.toFixed(2)),
        averageMood: averageMood,
        moodChange: moodChange,
        moodResponses: moodResponsesCount,
      },
    };
    
    console.log("Final metrics being returned:", {
      weeklyGrowthRate,
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat(arr.toFixed(2)),
      mau,
      clv: parseFloat(clv.toFixed(2)),
    });
    
    console.log("Return object keys:", Object.keys(result));
    console.log("Return object has metrics:", 'metrics' in result);
    
    return result;
  }
  
  // SupportMatch Profile operations
  async getSupportMatchProfile(userId: string): Promise<SupportMatchProfile | undefined> {
    const [profile] = await db
      .select()
      .from(supportMatchProfiles)
      .where(eq(supportMatchProfiles.userId, userId));
    return profile;
  }
  
  async createSupportMatchProfile(profileData: InsertSupportMatchProfile): Promise<SupportMatchProfile> {
    const [profile] = await db
      .insert(supportMatchProfiles)
      .values(profileData)
      .returning();
    return profile;
  }
  
  async updateSupportMatchProfile(userId: string, profileData: Partial<InsertSupportMatchProfile>): Promise<SupportMatchProfile> {
    const [profile] = await db
      .update(supportMatchProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(supportMatchProfiles.userId, userId))
      .returning();
    return profile;
  }
  
  async getAllActiveSupportMatchProfiles(): Promise<SupportMatchProfile[]> {
    return await db
      .select()
      .from(supportMatchProfiles)
      .where(eq(supportMatchProfiles.isActive, true));
  }
  
  async getAllSupportMatchProfiles(): Promise<SupportMatchProfile[]> {
    return await db
      .select()
      .from(supportMatchProfiles)
      .orderBy(desc(supportMatchProfiles.createdAt));
  }
  
  // SupportMatch Partnership operations
  async createPartnership(partnershipData: InsertPartnership): Promise<Partnership> {
    const [partnership] = await db
      .insert(partnerships)
      .values(partnershipData)
      .returning();
    return partnership;
  }
  
  async getPartnershipById(id: string): Promise<Partnership | undefined> {
    const [partnership] = await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.id, id));
    return partnership;
  }
  
  async getActivePartnershipByUser(userId: string): Promise<any | undefined> {
    // First get the active partnership
    const [partnership] = await db
      .select()
      .from(partnerships)
      .where(
        and(
          or(
            eq(partnerships.user1Id, userId),
            eq(partnerships.user2Id, userId)
          ),
          eq(partnerships.status, 'active')
        )
      );
    
    if (!partnership) return undefined;
    
    // Determine which user is the partner
    const partnerId = partnership.user1Id === userId ? partnership.user2Id : partnership.user1Id;
    
    // Get the partner's profile
    const [partnerProfile] = await db
      .select()
      .from(supportMatchProfiles)
      .where(eq(supportMatchProfiles.userId, partnerId));
    
    return {
      ...partnership,
      partnerNickname: 'Unknown Partner', // SupportMatchProfile doesn't have nickname field
      partnerGender: partnerProfile?.gender,
      partnerTimezone: partnerProfile?.timezone,
    };
  }
  
  async getAllPartnerships(): Promise<Partnership[]> {
    return await db
      .select()
      .from(partnerships)
      .orderBy(desc(partnerships.createdAt));
  }
  
  async getPartnershipHistory(userId: string): Promise<(Partnership & { partnerFirstName?: string | null; partnerLastName?: string | null })[]> {
    // Get all partnerships for this user
    const userPartnerships = await db
      .select()
      .from(partnerships)
      .where(
        or(
          eq(partnerships.user1Id, userId),
          eq(partnerships.user2Id, userId)
        )
      )
      .orderBy(desc(partnerships.startDate));

    // Get all unique partner user IDs
    const partnerIds = userPartnerships
      .map(p => p.user1Id === userId ? p.user2Id : p.user1Id)
      .filter((id): id is string => !!id);

    if (partnerIds.length === 0) {
      return userPartnerships.map(p => ({ ...p, partnerFirstName: null, partnerLastName: null }));
    }

    // Fetch all partner user data in one query
    const partnerUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(inArray(users.id, partnerIds));

    // Create a map of userId -> user data
    const userMap = new Map(partnerUsers.map(u => [u.id, u]));

    // Enrich partnerships with partner user data
    return userPartnerships.map(partnership => {
      const partnerId = partnership.user1Id === userId ? partnership.user2Id : partnership.user1Id;
      const partnerUser = userMap.get(partnerId);
      return {
        ...partnership,
        partnerFirstName: partnerUser?.firstName || null,
        partnerLastName: partnerUser?.lastName || null,
      };
    });
  }
  
  async updatePartnershipStatus(id: string, status: string): Promise<Partnership> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    // If ending the partnership, set the end date to now
    if (status === 'ended') {
      updateData.endDate = new Date();
    }
    
    const [partnership] = await db
      .update(partnerships)
      .set(updateData)
      .where(eq(partnerships.id, id))
      .returning();
    return partnership;
  }
  
  async createAlgorithmicMatches(): Promise<Partnership[]> {
    // Get all active profiles
    const allProfiles = await this.getAllActiveSupportMatchProfiles();
    
    // Get all active partnerships to filter out already matched users
    const activePartnerships = await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.status, 'active'));
    
    const matchedUserIds = new Set<string>();
    activePartnerships.forEach(p => {
      matchedUserIds.add(p.user1Id);
      matchedUserIds.add(p.user2Id);
    });
    
    // Filter to only unmatched users
    const unmatchedProfiles = allProfiles.filter(p => !matchedUserIds.has(p.userId));
    
    // Get all exclusions
    const allExclusions = await db.select().from(exclusions);
    const exclusionMap = new Map<string, Set<string>>();
    allExclusions.forEach(e => {
      if (!exclusionMap.has(e.userId)) {
        exclusionMap.set(e.userId, new Set());
      }
      exclusionMap.get(e.userId)!.add(e.excludedUserId);
    });
    
    // Helper function to check if two users are compatible
    const areCompatible = (user1: typeof unmatchedProfiles[0], user2: typeof unmatchedProfiles[0]): boolean => {
      // Check gender preference compatibility (bidirectional)
      // Options: 'any' (matches any gender) or 'same_gender' (matches only same gender as user)
      const user1GenderMatch = 
        user1.genderPreference === 'any' || 
        (user1.genderPreference === 'same_gender' && user1.gender && user1.gender === user2.gender);
      
      const user2GenderMatch = 
        user2.genderPreference === 'any' || 
        (user2.genderPreference === 'same_gender' && user2.gender && user2.gender === user1.gender);
      
      if (!user1GenderMatch || !user2GenderMatch) {
        return false;
      }
      
      // Check for mutual exclusion
      const user1Excludes = exclusionMap.get(user1.userId);
      const user2Excludes = exclusionMap.get(user2.userId);
      
      if (user1Excludes?.has(user2.userId) || user2Excludes?.has(user1.userId)) {
        return false;
      }
      
      // Timezone compatibility - respect both users' timezone preferences
      const user1WantsSameTimezone = user1.timezonePreference === 'same_timezone';
      const user2WantsSameTimezone = user2.timezonePreference === 'same_timezone';
      
      // If EITHER user requires same timezone matching, enforce timezone constraints
      // This ensures users who want same-timezone partners are never matched across timezones,
      // regardless of their potential partner's preference
      if (user1WantsSameTimezone || user2WantsSameTimezone) {
        // Both users must have a timezone set
        if (!user1.timezone || !user2.timezone) {
          return false;
        }
        // Timezones must match exactly
        if (user1.timezone !== user2.timezone) {
          return false;
        }
      }
      
      return true;
    };
    
    // Create matches using a simple greedy algorithm
    const createdPartnerships: Partnership[] = [];
    const matched = new Set<string>();
    
    for (let i = 0; i < unmatchedProfiles.length; i++) {
      const user1 = unmatchedProfiles[i];
      
      if (matched.has(user1.userId)) {
        continue;
      }
      
      // Find best match for user1
      let bestMatch = null;
      let bestScore = -1;
      
      for (let j = i + 1; j < unmatchedProfiles.length; j++) {
        const user2 = unmatchedProfiles[j];
        
        if (matched.has(user2.userId)) {
          continue;
        }
        
        if (areCompatible(user1, user2)) {
          // Calculate compatibility score
          let score = 0;
          
          // Same timezone is better
          if (user1.timezone && user2.timezone && user1.timezone === user2.timezone) {
            score += 10;
          }
          
          // Specific gender preferences (same_gender) are slightly better than "any"
          if (user1.genderPreference !== 'any' && user2.genderPreference !== 'any') {
            score += 5;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = user2;
          }
        }
      }
      
      // Create partnership if a match was found
      if (bestMatch) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30); // 30 days from start
        
        const partnership = await this.createPartnership({
          user1Id: user1.userId,
          user2Id: bestMatch.userId,
          startDate,
          endDate,
          status: 'active',
        });
        
        createdPartnerships.push(partnership);
        matched.add(user1.userId);
        matched.add(bestMatch.userId);
      }
    }
    
    return createdPartnerships;
  }
  
  // SupportMatch Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }
  
  async getMessagesByPartnership(partnershipId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.partnershipId, partnershipId))
      .orderBy(messages.createdAt);
  }
  
  // SupportMatch Exclusion operations
  async createExclusion(exclusionData: InsertExclusion): Promise<Exclusion> {
    const [exclusion] = await db
      .insert(exclusions)
      .values(exclusionData)
      .returning();
    return exclusion;
  }
  
  async getExclusionsByUser(userId: string): Promise<Exclusion[]> {
    return await db
      .select()
      .from(exclusions)
      .where(eq(exclusions.userId, userId))
      .orderBy(desc(exclusions.createdAt));
  }
  
  async checkMutualExclusion(user1Id: string, user2Id: string): Promise<boolean> {
    const exclusion = await db
      .select()
      .from(exclusions)
      .where(
        or(
          and(
            eq(exclusions.userId, user1Id),
            eq(exclusions.excludedUserId, user2Id)
          ),
          and(
            eq(exclusions.userId, user2Id),
            eq(exclusions.excludedUserId, user1Id)
          )
        )
      )
      .limit(1);
    return exclusion.length > 0;
  }
  
  async deleteExclusion(id: string): Promise<void> {
    await db.delete(exclusions).where(eq(exclusions.id, id));
  }
  
  // SupportMatch Report operations
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(reportData)
      .returning();
    return report;
  }
  
  async getAllReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }
  
  async updateReportStatus(id: string, status: string, resolution?: string): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({
        status,
        resolution,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }
  
  // SupportMatch Announcement operations
  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    return await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            sql`${announcements.expiresAt} IS NULL`,
            gte(announcements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(announcements.createdAt));
  }
  
  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));
  }
  
  async updateAnnouncement(id: string, announcementData: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateAnnouncement(id: string): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  // SupportMatch App Announcement operations
  async createSupportmatchAnnouncement(announcementData: InsertSupportmatchAnnouncement): Promise<SupportmatchAnnouncement> {
    const [announcement] = await db
      .insert(supportmatchAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveSupportmatchAnnouncements(): Promise<SupportmatchAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(supportmatchAnnouncements)
      .where(
        and(
          eq(supportmatchAnnouncements.isActive, true),
          or(
            sql`${supportmatchAnnouncements.expiresAt} IS NULL`,
            gte(supportmatchAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(supportmatchAnnouncements.createdAt));
  }
  
  async getAllSupportmatchAnnouncements(): Promise<SupportmatchAnnouncement[]> {
    return await db
      .select()
      .from(supportmatchAnnouncements)
      .orderBy(desc(supportmatchAnnouncements.createdAt));
  }
  
  async updateSupportmatchAnnouncement(id: string, announcementData: Partial<InsertSupportmatchAnnouncement>): Promise<SupportmatchAnnouncement> {
    const [announcement] = await db
      .update(supportmatchAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(supportmatchAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateSupportmatchAnnouncement(id: string): Promise<SupportmatchAnnouncement> {
    const [announcement] = await db
      .update(supportmatchAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(supportmatchAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  // SupportMatch Stats
  async getSupportMatchStats() {
    const activeProfiles = await db
      .select()
      .from(supportMatchProfiles)
      .where(eq(supportMatchProfiles.isActive, true));
      
    const currentPartnerships = await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.status, 'active'));
      
    const pendingReportsCount = await db
      .select()
      .from(reports)
      .where(eq(reports.status, 'pending'));
    
    return {
      activeUsers: activeProfiles.length,
      currentPartnerships: currentPartnerships.length,
      pendingReports: pendingReportsCount.length,
    };
  }



  // ========================================
  // LIGHTHOUSE APP OPERATIONS
  // ========================================

  // Profile operations
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

  // Property operations
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

  // Match operations
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
      .where(
        sql`${lighthouseMatches.propertyId} IN (${sql.join(propertyIds.map(id => sql`${id}`), sql`, `)})`
      );
    
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

  // Stats
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

  // LightHouse Announcement operations
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

  // LightHouse Block operations
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

  // SocketRelay Request operations
  async createSocketrelayRequest(userId: string, description: string, isPublic: boolean = false): Promise<SocketrelayRequest> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 days from now

    const [request] = await db
      .insert(socketrelayRequests)
      .values({
        userId,
        description,
        isPublic: !!isPublic,
        expiresAt,
      })
      .returning();
    return request;
  }

  async getActiveSocketrelayRequests(): Promise<any[]> {
    const now = new Date();
    const requests = await db
      .select()
      .from(socketrelayRequests)
      .where(
        and(
          eq(socketrelayRequests.status, 'active'),
          gte(socketrelayRequests.expiresAt, now)
        )
      )
      .orderBy(desc(socketrelayRequests.createdAt));
    
    // Join with creator profiles to get location data
    const results = await Promise.all(
      requests.map(async (request) => {
        const profile = await this.getSocketrelayProfile(request.userId);
        return {
          ...request,
          creatorProfile: profile ? {
            city: profile.city,
            state: profile.state,
            country: profile.country,
          } : null,
        };
      })
    );
    
    return results;
  }

  async getSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined> {
    const [request] = await db
      .select()
      .from(socketrelayRequests)
      .where(eq(socketrelayRequests.id, id));
    return request;
  }

  async getPublicSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined> {
    const now = new Date();
    const [request] = await db
      .select()
      .from(socketrelayRequests)
      .where(
        and(
          eq(socketrelayRequests.id, id),
          eq(socketrelayRequests.isPublic, true),
          eq(socketrelayRequests.status, 'active'),
          gte(socketrelayRequests.expiresAt, now)
        )
      );
    return request;
  }

  async listPublicSocketrelayRequests(): Promise<SocketrelayRequest[]> {
    const now = new Date();
    return await db
      .select()
      .from(socketrelayRequests)
      .where(
        and(
          eq(socketrelayRequests.isPublic, true),
          eq(socketrelayRequests.status, 'active'),
          gte(socketrelayRequests.expiresAt, now)
        )
      )
      .orderBy(desc(socketrelayRequests.createdAt));
  }

  async getAllSocketrelayRequests(): Promise<any[]> {
    const requests = await db
      .select()
      .from(socketrelayRequests)
      .orderBy(desc(socketrelayRequests.createdAt));
    
    // Join with creator profiles and users to get location data and user info
    const results = await Promise.all(
      requests.map(async (request) => {
        const profile = await this.getSocketrelayProfile(request.userId);
        const [user] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, request.userId))
          .limit(1);
        
        return {
          ...request,
          creatorProfile: profile ? {
            city: profile.city,
            state: profile.state,
            country: profile.country,
          } : null,
          user: user || null,
        };
      })
    );
    
    return results;
  }

  async getSocketrelayRequestsByUser(userId: string): Promise<SocketrelayRequest[]> {
    return await db
      .select()
      .from(socketrelayRequests)
      .where(eq(socketrelayRequests.userId, userId))
      .orderBy(desc(socketrelayRequests.createdAt));
  }

  async updateSocketrelayRequestStatus(id: string, status: string): Promise<SocketrelayRequest> {
    const [request] = await db
      .update(socketrelayRequests)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayRequests.id, id))
      .returning();
    return request;
  }

  async updateSocketrelayRequest(id: string, userId: string, description: string, isPublic: boolean = false): Promise<SocketrelayRequest> {
    // Get the request to verify ownership
    const request = await this.getSocketrelayRequestById(id);
    if (!request) {
      throw new Error("Request not found");
    }

    // Verify ownership
    if (request.userId !== userId) {
      throw new Error("You can only edit your own requests");
    }

    // Only allow editing active requests that haven't expired
    if (request.status !== 'active') {
      throw new Error("You can only edit active requests");
    }

    const now = new Date();
    if (new Date(request.expiresAt) < now) {
      throw new Error("You cannot edit expired requests");
    }

    // Update the request
    const [updated] = await db
      .update(socketrelayRequests)
      .set({
        description,
        isPublic: !!isPublic,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayRequests.id, id))
      .returning();
    
    return updated;
  }

  async repostSocketrelayRequest(id: string, userId: string): Promise<SocketrelayRequest> {
    // Get the request to verify ownership and expiration
    const request = await this.getSocketrelayRequestById(id);
    if (!request) {
      throw new Error("Request not found");
    }

    // Verify ownership
    if (request.userId !== userId) {
      throw new Error("You can only repost your own requests");
    }

    // Check if request is expired
    const now = new Date();
    if (new Date(request.expiresAt) >= now) {
      throw new Error("Request is not expired yet");
    }

    // Set new expiration date (14 days from now)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 14);

    // Update the request: set new expiration, set status to active, update timestamp
    const [updated] = await db
      .update(socketrelayRequests)
      .set({
        expiresAt: newExpiresAt,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(socketrelayRequests.id, id))
      .returning();
    
    return updated;
  }

  async deleteSocketrelayRequest(id: string): Promise<void> {
    // First, get all fulfillments for this request
    const fulfillments = await this.getSocketrelayFulfillmentsByRequest(id);
    
    // Delete messages for each fulfillment
    for (const fulfillment of fulfillments) {
      await db
        .delete(socketrelayMessages)
        .where(eq(socketrelayMessages.fulfillmentId, fulfillment.id));
    }
    
    // Delete all fulfillments for this request
    await db
      .delete(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.requestId, id));
    
    // Finally, delete the request itself
    await db
      .delete(socketrelayRequests)
      .where(eq(socketrelayRequests.id, id));
  }

  // SocketRelay Fulfillment operations
  async createSocketrelayFulfillment(requestId: string, fulfillerUserId: string): Promise<SocketrelayFulfillment> {
    const [fulfillment] = await db
      .insert(socketrelayFulfillments)
      .values({
        requestId,
        fulfillerUserId,
      })
      .returning();

    // Update request status to fulfilled
    await this.updateSocketrelayRequestStatus(requestId, 'fulfilled');

    return fulfillment;
  }

  async getSocketrelayFulfillmentById(id: string): Promise<SocketrelayFulfillment | undefined> {
    const [fulfillment] = await db
      .select()
      .from(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.id, id));
    return fulfillment;
  }

  async getSocketrelayFulfillmentsByRequest(requestId: string): Promise<SocketrelayFulfillment[]> {
    return await db
      .select()
      .from(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.requestId, requestId))
      .orderBy(desc(socketrelayFulfillments.createdAt));
  }

  async getSocketrelayFulfillmentsByUser(userId: string): Promise<any[]> {
    const fulfillments = await db
      .select()
      .from(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.fulfillerUserId, userId))
      .orderBy(desc(socketrelayFulfillments.createdAt));
    
    const results = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const request = await this.getSocketrelayRequestById(fulfillment.requestId);
        return { ...fulfillment, request };
      })
    );
    
    return results;
  }

  async getAllSocketrelayFulfillments(): Promise<any[]> {
    const fulfillments = await db
      .select()
      .from(socketrelayFulfillments)
      .orderBy(desc(socketrelayFulfillments.createdAt));
    
    const results = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const request = await this.getSocketrelayRequestById(fulfillment.requestId);
        const [user] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, fulfillment.fulfillerUserId))
          .limit(1);
        
        return { 
          ...fulfillment, 
          request,
          user: user || null,
        };
      })
    );
    
    return results;
  }

  async closeSocketrelayFulfillment(id: string, userId: string, status: string): Promise<SocketrelayFulfillment> {
    const [fulfillment] = await db
      .update(socketrelayFulfillments)
      .set({
        status,
        closedBy: userId,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(socketrelayFulfillments.id, id))
      .returning();
    return fulfillment;
  }

  // SocketRelay Message operations
  async createSocketrelayMessage(messageData: InsertSocketrelayMessage): Promise<SocketrelayMessage> {
    const [message] = await db
      .insert(socketrelayMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getSocketrelayMessagesByFulfillment(fulfillmentId: string): Promise<SocketrelayMessage[]> {
    return await db
      .select()
      .from(socketrelayMessages)
      .where(eq(socketrelayMessages.fulfillmentId, fulfillmentId))
      .orderBy(socketrelayMessages.createdAt);
  }

  // SocketRelay Profile operations
  async getSocketrelayProfile(userId: string): Promise<SocketrelayProfile | undefined> {
    const [profile] = await db
      .select()
      .from(socketrelayProfiles)
      .where(eq(socketrelayProfiles.userId, userId));
    return profile;
  }

  async createSocketrelayProfile(profileData: InsertSocketrelayProfile): Promise<SocketrelayProfile> {
    const [profile] = await db
      .insert(socketrelayProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateSocketrelayProfile(userId: string, profileData: Partial<InsertSocketrelayProfile>): Promise<SocketrelayProfile> {
    const [profile] = await db
      .update(socketrelayProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayProfiles.userId, userId))
      .returning();
    return profile;
  }

  // SocketRelay Announcement operations
  async createSocketrelayAnnouncement(announcementData: InsertSocketrelayAnnouncement): Promise<SocketrelayAnnouncement> {
    const [announcement] = await db
      .insert(socketrelayAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(socketrelayAnnouncements)
      .where(
        and(
          eq(socketrelayAnnouncements.isActive, true),
          or(
            sql`${socketrelayAnnouncements.expiresAt} IS NULL`,
            gte(socketrelayAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(socketrelayAnnouncements.createdAt));
  }
  
  async getAllSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]> {
    return await db
      .select()
      .from(socketrelayAnnouncements)
      .orderBy(desc(socketrelayAnnouncements.createdAt));
  }
  
  async updateSocketrelayAnnouncement(id: string, announcementData: Partial<InsertSocketrelayAnnouncement>): Promise<SocketrelayAnnouncement> {
    const [announcement] = await db
      .update(socketrelayAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateSocketrelayAnnouncement(id: string): Promise<SocketrelayAnnouncement> {
    const [announcement] = await db
      .update(socketrelayAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // DIRECTORY APP OPERATIONS
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
      })
      .returning();
    return profile;
  }

  async updateDirectoryProfile(id: string, profileData: Partial<InsertDirectoryProfile>): Promise<DirectoryProfile> {
    const updateData: any = {
      ...profileData,
      skills: profileData.skills ? profileData.skills.slice(0, 3) : undefined,
      sectors: profileData.sectors ? profileData.sectors.slice(0, 3) : undefined,
      jobTitles: profileData.jobTitles ? profileData.jobTitles.slice(0, 3) : undefined,
      updatedAt: new Date(),
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

  // Directory Announcement operations
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

  // Directory Skills operations
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

  // ========================================
  // SHARED SKILLS DATABASE OPERATIONS
  // ========================================

  // Sectors
  async getAllSkillsSectors(): Promise<SkillsSector[]> {
    return await db
      .select()
      .from(skillsSectors)
      .orderBy(asc(skillsSectors.displayOrder), asc(skillsSectors.name));
  }

  async getSkillsSectorById(id: string): Promise<SkillsSector | undefined> {
    const [sector] = await db
      .select()
      .from(skillsSectors)
      .where(eq(skillsSectors.id, id))
      .limit(1);
    return sector;
  }

  async createSkillsSector(sectorData: InsertSkillsSector): Promise<SkillsSector> {
    const [sector] = await db
      .insert(skillsSectors)
      .values(sectorData)
      .returning();
    return sector;
  }

  async updateSkillsSector(id: string, sectorData: Partial<InsertSkillsSector>): Promise<SkillsSector> {
    const [sector] = await db
      .update(skillsSectors)
      .set({ ...sectorData, updatedAt: new Date() })
      .where(eq(skillsSectors.id, id))
      .returning();
    return sector;
  }

  async deleteSkillsSector(id: string): Promise<void> {
    await db
      .delete(skillsSectors)
      .where(eq(skillsSectors.id, id));
  }

  // Job Titles
  async getAllSkillsJobTitles(sectorId?: string): Promise<SkillsJobTitle[]> {
    if (sectorId) {
      return await db
        .select()
        .from(skillsJobTitles)
        .where(eq(skillsJobTitles.sectorId, sectorId))
        .orderBy(asc(skillsJobTitles.displayOrder), asc(skillsJobTitles.name));
    }
    return await db
      .select()
      .from(skillsJobTitles)
      .orderBy(asc(skillsJobTitles.displayOrder), asc(skillsJobTitles.name));
  }

  async getSkillsJobTitleById(id: string): Promise<SkillsJobTitle | undefined> {
    const [jobTitle] = await db
      .select()
      .from(skillsJobTitles)
      .where(eq(skillsJobTitles.id, id))
      .limit(1);
    return jobTitle;
  }

  async createSkillsJobTitle(jobTitleData: InsertSkillsJobTitle): Promise<SkillsJobTitle> {
    const [jobTitle] = await db
      .insert(skillsJobTitles)
      .values(jobTitleData)
      .returning();
    return jobTitle;
  }

  async updateSkillsJobTitle(id: string, jobTitleData: Partial<InsertSkillsJobTitle>): Promise<SkillsJobTitle> {
    const [jobTitle] = await db
      .update(skillsJobTitles)
      .set({ ...jobTitleData, updatedAt: new Date() })
      .where(eq(skillsJobTitles.id, id))
      .returning();
    return jobTitle;
  }

  async deleteSkillsJobTitle(id: string): Promise<void> {
    await db
      .delete(skillsJobTitles)
      .where(eq(skillsJobTitles.id, id));
  }

  // Skills
  async getAllSkillsSkills(jobTitleId?: string): Promise<SkillsSkill[]> {
    if (jobTitleId) {
      return await db
        .select()
        .from(skillsSkills)
        .where(eq(skillsSkills.jobTitleId, jobTitleId))
        .orderBy(asc(skillsSkills.displayOrder), asc(skillsSkills.name));
    }
    return await db
      .select()
      .from(skillsSkills)
      .orderBy(asc(skillsSkills.displayOrder), asc(skillsSkills.name));
  }

  async getSkillsSkillById(id: string): Promise<SkillsSkill | undefined> {
    const [skill] = await db
      .select()
      .from(skillsSkills)
      .where(eq(skillsSkills.id, id))
      .limit(1);
    return skill;
  }

  async createSkillsSkill(skillData: InsertSkillsSkill): Promise<SkillsSkill> {
    const [skill] = await db
      .insert(skillsSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async updateSkillsSkill(id: string, skillData: Partial<InsertSkillsSkill>): Promise<SkillsSkill> {
    const [skill] = await db
      .update(skillsSkills)
      .set({ ...skillData, updatedAt: new Date() })
      .where(eq(skillsSkills.id, id))
      .returning();
    return skill;
  }

  async deleteSkillsSkill(id: string): Promise<void> {
    await db
      .delete(skillsSkills)
      .where(eq(skillsSkills.id, id));
  }

  // Convenience methods
  async getSkillsHierarchy(): Promise<Array<{
    sector: SkillsSector;
    jobTitles: Array<{
      jobTitle: SkillsJobTitle;
      skills: SkillsSkill[];
    }>;
  }>> {
    const sectors = await this.getAllSkillsSectors();
    const jobTitles = await this.getAllSkillsJobTitles();
    const skills = await this.getAllSkillsSkills();

    return sectors.map(sector => ({
      sector,
      jobTitles: jobTitles
        .filter(jt => jt.sectorId === sector.id)
        .map(jobTitle => ({
          jobTitle,
          skills: skills.filter(s => s.jobTitleId === jobTitle.id),
        })),
    }));
  }

  async getAllSkillsFlattened(): Promise<Array<{ id: string; name: string; sector: string; jobTitle: string }>> {
    const sectors = await this.getAllSkillsSectors();
    const jobTitles = await this.getAllSkillsJobTitles();
    const skills = await this.getAllSkillsSkills();

    return skills.map(skill => {
      const jobTitle = jobTitles.find(jt => jt.id === skill.jobTitleId);
      const sector = jobTitle ? sectors.find(s => s.id === jobTitle.sectorId) : null;
      return {
        id: skill.id,
        name: skill.name,
        sector: sector?.name || 'Unknown',
        jobTitle: jobTitle?.name || 'Unknown',
      };
    });
  }

  // ========================================
  // CHAT GROUPS APP OPERATIONS
  // ========================================

  async getAllChatGroups(): Promise<ChatGroup[]> {
    return await db
      .select()
      .from(chatGroups)
      .orderBy(asc(chatGroups.displayOrder), desc(chatGroups.createdAt));
  }

  async getActiveChatGroups(): Promise<ChatGroup[]> {
    return await db
      .select()
      .from(chatGroups)
      .where(eq(chatGroups.isActive, true))
      .orderBy(asc(chatGroups.displayOrder), desc(chatGroups.createdAt));
  }

  async getChatGroupById(id: string): Promise<ChatGroup | undefined> {
    const [group] = await db
      .select()
      .from(chatGroups)
      .where(eq(chatGroups.id, id));
    return group;
  }

  async createChatGroup(groupData: InsertChatGroup): Promise<ChatGroup> {
    const [group] = await db
      .insert(chatGroups)
      .values(groupData)
      .returning();
    return group;
  }

  async updateChatGroup(id: string, groupData: Partial<InsertChatGroup>): Promise<ChatGroup> {
    const [group] = await db
      .update(chatGroups)
      .set({
        ...groupData,
        updatedAt: new Date(),
      })
      .where(eq(chatGroups.id, id))
      .returning();
    return group;
  }

  async deleteChatGroup(id: string): Promise<void> {
    await db.delete(chatGroups).where(eq(chatGroups.id, id));
  }

  // ChatGroups Announcement operations
  async createChatgroupsAnnouncement(announcementData: InsertChatgroupsAnnouncement): Promise<ChatgroupsAnnouncement> {
    const [announcement] = await db
      .insert(chatgroupsAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(chatgroupsAnnouncements)
      .where(
        and(
          eq(chatgroupsAnnouncements.isActive, true),
          or(
            sql`${chatgroupsAnnouncements.expiresAt} IS NULL`,
            gte(chatgroupsAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(chatgroupsAnnouncements.createdAt));
  }
  
  async getAllChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]> {
    return await db
      .select()
      .from(chatgroupsAnnouncements)
      .orderBy(desc(chatgroupsAnnouncements.createdAt));
  }
  
  async updateChatgroupsAnnouncement(id: string, announcementData: Partial<InsertChatgroupsAnnouncement>): Promise<ChatgroupsAnnouncement> {
    const [announcement] = await db
      .update(chatgroupsAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(chatgroupsAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateChatgroupsAnnouncement(id: string): Promise<ChatgroupsAnnouncement> {
    const [announcement] = await db
      .update(chatgroupsAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chatgroupsAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // TRUSTTRANSPORT OPERATIONS
  // ========================================

  // TrustTransport Profile operations
  async getTrusttransportProfile(userId: string): Promise<TrusttransportProfile | undefined> {
    const [profile] = await db
      .select()
      .from(trusttransportProfiles)
      .where(eq(trusttransportProfiles.userId, userId));
    return profile;
  }

  async createTrusttransportProfile(profileData: InsertTrusttransportProfile): Promise<TrusttransportProfile> {
    const [profile] = await db
      .insert(trusttransportProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateTrusttransportProfile(userId: string, profileData: Partial<InsertTrusttransportProfile>): Promise<TrusttransportProfile> {
    const [profile] = await db
      .update(trusttransportProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportProfiles.userId, userId))
      .returning();
    return profile;
  }

  // TrustTransport Ride Request operations (simplified model)
  async createTrusttransportRideRequest(requestData: InsertTrusttransportRideRequest & { riderId?: string }): Promise<TrusttransportRideRequest> {
    if (!requestData.riderId) {
      throw new Error("riderId is required to create a ride request");
    }
    
    // Explicitly build values object to ensure riderId is included
    // TypeScript may strip riderId from spread since it's not in InsertTrusttransportRideRequest type
    const values: any = {
      riderId: requestData.riderId,
      pickupLocation: requestData.pickupLocation,
      dropoffLocation: requestData.dropoffLocation,
      pickupCity: requestData.pickupCity,
      pickupState: requestData.pickupState ?? null,
      dropoffCity: requestData.dropoffCity,
      dropoffState: requestData.dropoffState ?? null,
      departureDateTime: requestData.departureDateTime,
      requestedSeats: requestData.requestedSeats,
      requestedCarType: requestData.requestedCarType ?? null,
      requiresHeat: requestData.requiresHeat ?? false,
      requiresAC: requestData.requiresAC ?? false,
      requiresWheelchairAccess: requestData.requiresWheelchairAccess ?? false,
      requiresChildSeat: requestData.requiresChildSeat ?? false,
      riderMessage: requestData.riderMessage ?? null,
      status: 'open', // New requests start as 'open'
    };
    
    console.log("Creating ride request with values:", JSON.stringify(values, null, 2));
    
    const [request] = await db
      .insert(trusttransportRideRequests)
      .values(values)
      .returning();
    
    console.log("Created ride request:", JSON.stringify(request, null, 2));
    return request;
  }

  async getTrusttransportRideRequestById(id: string): Promise<TrusttransportRideRequest | undefined> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    const [request] = await db
      .select()
      .from(trusttransportRideRequests)
      .where(eq(trusttransportRideRequests.id, id));
    return request;
  }

  async getTrusttransportRideRequestsByRider(riderId: string): Promise<TrusttransportRideRequest[]> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    return await db
      .select()
      .from(trusttransportRideRequests)
      .where(eq(trusttransportRideRequests.riderId, riderId))
      .orderBy(desc(trusttransportRideRequests.createdAt));
  }

  // Expire ride requests where departure date has passed
  async expireTrusttransportRideRequests(): Promise<void> {
    const now = new Date();
    await db
      .update(trusttransportRideRequests)
      .set({
        status: 'expired',
        updatedAt: now,
      })
      .where(
        and(
          eq(trusttransportRideRequests.status, 'open'),
          lt(trusttransportRideRequests.departureDateTime, now)
        )
      );
  }

  async getOpenTrusttransportRideRequests(): Promise<TrusttransportRideRequest[]> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    const now = new Date();
    return await db
      .select()
      .from(trusttransportRideRequests)
      .where(
        and(
          eq(trusttransportRideRequests.status, 'open'),
          gte(trusttransportRideRequests.departureDateTime, now)
        )
      )
      .orderBy(asc(trusttransportRideRequests.departureDateTime));
  }

  async getTrusttransportRideRequestsByDriver(driverId: string): Promise<TrusttransportRideRequest[]> {
    return await db
      .select()
      .from(trusttransportRideRequests)
      .where(eq(trusttransportRideRequests.driverId, driverId))
      .orderBy(desc(trusttransportRideRequests.createdAt));
  }

  async claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string): Promise<TrusttransportRideRequest> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    const request = await this.getTrusttransportRideRequestById(requestId);
    if (!request) {
      throw new Error("Ride request not found");
    }
    if (request.status !== 'open') {
      if (request.status === 'expired') {
        throw new Error("This ride request has expired and can no longer be claimed");
      }
      throw new Error("Ride request is not available to claim");
    }
    if (request.driverId) {
      throw new Error("Ride request has already been claimed");
    }

    // Get driver profile to verify they meet criteria
    // Note: driverId here is userId, need to get profile
    const driverProfile = await db
      .select()
      .from(trusttransportProfiles)
      .where(eq(trusttransportProfiles.userId, driverId))
      .limit(1);
    
    if (driverProfile.length === 0 || !driverProfile[0].isDriver) {
      throw new Error("You must be a driver to claim ride requests");
    }

    const [updated] = await db
      .update(trusttransportRideRequests)
      .set({
        driverId: driverProfile[0].id,
        status: 'claimed',
        driverMessage: driverMessage || null,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportRideRequests.id, requestId))
      .returning();
    
    return updated;
  }

  async updateTrusttransportRideRequest(id: string, requestData: Partial<InsertTrusttransportRideRequest>): Promise<TrusttransportRideRequest> {
    const [request] = await db
      .update(trusttransportRideRequests)
      .set({
        ...requestData,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportRideRequests.id, id))
      .returning();
    return request;
  }

  async cancelTrusttransportRideRequest(id: string, userId: string): Promise<TrusttransportRideRequest> {
    const request = await this.getTrusttransportRideRequestById(id);
    if (!request) {
      throw new Error("Ride request not found");
    }

    // Get user's profile to check if they're the rider or driver
    const profile = await this.getTrusttransportProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Check if user is the rider or the driver who claimed it
    const isRider = request.riderId === userId;
    const isDriver = request.driverId === profile.id && profile.isDriver;

    if (!isRider && !isDriver) {
      throw new Error("You are not authorized to cancel this ride request");
    }

    // If claimed, unclaim it (set driverId to null and status to open)
    // If open, mark as cancelled
    const newStatus = request.status === 'claimed' ? 'open' : 'cancelled';
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'open' && isDriver) {
      // Driver is cancelling their claim - unclaim the request
      updateData.driverId = null;
      updateData.driverMessage = null;
    }

    const [updated] = await db
      .update(trusttransportRideRequests)
      .set(updateData)
      .where(eq(trusttransportRideRequests.id, id))
      .returning();
    
    return updated;
  }

  // TrustTransport Announcement operations
  async createTrusttransportAnnouncement(announcementData: InsertTrusttransportAnnouncement): Promise<TrusttransportAnnouncement> {
    const [announcement] = await db
      .insert(trusttransportAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(trusttransportAnnouncements)
      .where(
        and(
          eq(trusttransportAnnouncements.isActive, true),
          or(
            sql`${trusttransportAnnouncements.expiresAt} IS NULL`,
            gte(trusttransportAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(trusttransportAnnouncements.createdAt));
  }

  async getAllTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]> {
    return await db
      .select()
      .from(trusttransportAnnouncements)
      .orderBy(desc(trusttransportAnnouncements.createdAt));
  }

  async updateTrusttransportAnnouncement(id: string, announcementData: Partial<InsertTrusttransportAnnouncement>): Promise<TrusttransportAnnouncement> {
    const [announcement] = await db
      .update(trusttransportAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateTrusttransportAnnouncement(id: string): Promise<TrusttransportAnnouncement> {
    const [announcement] = await db
      .update(trusttransportAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // PROFILE DELETION OPERATIONS
  // ========================================

  /**
   * Generates an anonymized user ID in the format: deleted_user_[random_string]
   */
  private generateAnonymizedUserId(): string {
    const randomString = randomBytes(16).toString('hex');
    return `deleted_user_${randomString}`;
  }

  /**
   * Logs a profile deletion for auditing purposes
   */
  async logProfileDeletion(userId: string, appName: string, reason?: string): Promise<ProfileDeletionLog> {
    const [log] = await db
      .insert(profileDeletionLogs)
      .values({
        userId,
        appName,
        reason: reason || null,
      })
      .returning();
    return log;
  }

  /**
   * Deletes a SupportMatch profile and anonymizes all related data
   */
  async deleteSupportMatchProfile(userId: string, reason?: string): Promise<void> {
    try {
      // Get profile first
      const profile = await this.getSupportMatchProfile(userId);
      if (!profile) {
        throw new Error("SupportMatch profile not found");
      }

      const anonymizedUserId = this.generateAnonymizedUserId();

      // SupportMatch foreign keys reference supportMatchProfiles.userId, which references users.id
      // So we need to create both a temp user and temp profile
      try {
        await db
          .insert(users)
          .values({
            id: anonymizedUserId,
            email: null,
            firstName: "Deleted",
            lastName: "User",
            isAdmin: false,
            isVerified: false,
          });
      } catch (error: any) {
        // If user already exists (from previous deletion), that's fine
        if (!error.message?.includes("duplicate key") && !error.message?.includes("unique constraint")) {
          throw error;
        }
      }

      // Create a temporary anonymized profile to satisfy foreign key constraints
      try {
        await db
          .insert(supportMatchProfiles)
          .values({
            userId: anonymizedUserId,
            isActive: false,
          });
      } catch (error: any) {
        // If profile already exists (from previous deletion), that's fine
        if (!error.message?.includes("duplicate key") && !error.message?.includes("unique constraint")) {
          throw error;
        }
      }

      // Anonymize partnerships (user1Id and user2Id)
      await db
        .update(partnerships)
        .set({ user1Id: anonymizedUserId })
        .where(eq(partnerships.user1Id, userId));
      
      await db
        .update(partnerships)
        .set({ user2Id: anonymizedUserId })
        .where(eq(partnerships.user2Id, userId));

      // Anonymize messages (senderId)
      await db
        .update(messages)
        .set({ senderId: anonymizedUserId })
        .where(eq(messages.senderId, userId));

      // Anonymize exclusions (userId and excludedUserId)
      await db
        .update(exclusions)
        .set({ userId: anonymizedUserId })
        .where(eq(exclusions.userId, userId));
      
      await db
        .update(exclusions)
        .set({ excludedUserId: anonymizedUserId })
        .where(eq(exclusions.excludedUserId, userId));

      // Anonymize reports (reporterId and reportedUserId)
      await db
        .update(reports)
        .set({ reporterId: anonymizedUserId })
        .where(eq(reports.reporterId, userId));
      
      await db
        .update(reports)
        .set({ reportedUserId: anonymizedUserId })
        .where(eq(reports.reportedUserId, userId));

      // Delete the original profile
      await db.delete(supportMatchProfiles).where(eq(supportMatchProfiles.userId, userId));

      // Log the deletion (don't fail if logging fails)
      try {
        await this.logProfileDeletion(userId, "supportmatch", reason);
      } catch (error) {
        console.error("Failed to log profile deletion:", error);
        // Continue even if logging fails
      }
    } catch (error: any) {
      console.error("Error in deleteSupportMatchProfile:", error);
      // Re-throw with more context
      throw new Error(`Failed to delete SupportMatch profile: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Deletes a LightHouse profile and anonymizes all related data
   */
  async deleteLighthouseProfile(userId: string, reason?: string): Promise<void> {
    try {
      // Get profile first
      console.log(`[deleteLighthouseProfile] Starting deletion for userId: ${userId}`);
      const profile = await this.getLighthouseProfileByUserId(userId);
      if (!profile) {
        console.log(`[deleteLighthouseProfile] Profile not found for userId: ${userId}`);
        throw new Error("LightHouse profile not found");
      }
      console.log(`[deleteLighthouseProfile] Found profile with id: ${profile.id}`);

      // Get all properties owned by this profile
      const properties = await this.getPropertiesByHost(profile.id);
      console.log(`[deleteLighthouseProfile] Found ${properties.length} properties to delete`);

      // Delete matches where this profile is the seeker
      // Note: lighthouseMatches references lighthouseProfiles.id, not userId
      // Since we can't easily anonymize profile.id references, we delete the matches
      const matches = await this.getMatchesBySeeker(profile.id);
      console.log(`[deleteLighthouseProfile] Found ${matches.length} matches as seeker to delete`);
      for (const match of matches) {
        // Delete matches as they become invalid without the profile
        await db.delete(lighthouseMatches).where(eq(lighthouseMatches.id, match.id));
      }

      // Delete all properties owned by this profile
      for (const property of properties) {
        // Delete matches associated with these properties first
        const propertyMatches = await this.getMatchesByProperty(property.id);
        console.log(`[deleteLighthouseProfile] Found ${propertyMatches.length} matches for property ${property.id} to delete`);
        for (const match of propertyMatches) {
          await db.delete(lighthouseMatches).where(eq(lighthouseMatches.id, match.id));
        }
        // Then delete the property
        console.log(`[deleteLighthouseProfile] Deleting property ${property.id}`);
        await db.delete(lighthouseProperties).where(eq(lighthouseProperties.id, property.id));
      }

      // Delete the profile
      console.log(`[deleteLighthouseProfile] Deleting profile with id: ${profile.id}, userId: ${userId}`);
      const deleteResult = await db.delete(lighthouseProfiles).where(eq(lighthouseProfiles.userId, userId));
      console.log(`[deleteLighthouseProfile] Delete result:`, deleteResult);

      // Verify deletion
      const verifyProfile = await this.getLighthouseProfileByUserId(userId);
      if (verifyProfile) {
        console.error(`[deleteLighthouseProfile] ERROR: Profile still exists after deletion! Profile id: ${verifyProfile.id}`);
        throw new Error("Profile deletion failed - profile still exists after delete operation");
      }
      console.log(`[deleteLighthouseProfile] Verified profile deletion successful`);

      // Log the deletion (don't fail if logging fails)
      try {
        await this.logProfileDeletion(userId, "lighthouse", reason);
      } catch (error) {
        console.error("Failed to log profile deletion:", error);
        // Continue even if logging fails
      }
    } catch (error: any) {
      console.error("Error in deleteLighthouseProfile:", error);
      // Re-throw with more context
      throw new Error(`Failed to delete LightHouse profile: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Deletes a SocketRelay profile and anonymizes all related data
   */
  async deleteSocketrelayProfile(userId: string, reason?: string): Promise<void> {
    try {
      // Get profile first
      const profile = await this.getSocketrelayProfile(userId);
      if (!profile) {
        throw new Error("SocketRelay profile not found");
      }

      const anonymizedUserId = this.generateAnonymizedUserId();

      // SocketRelay foreign keys reference users.id, so we need to create a temp user
      // to satisfy foreign key constraints when anonymizing
      try {
        await db
          .insert(users)
          .values({
            id: anonymizedUserId,
            email: null,
            firstName: "Deleted",
            lastName: "User",
            isAdmin: false,
            isVerified: false,
          });
      } catch (error: any) {
        // If user already exists (from previous deletion), that's fine
        if (!error.message?.includes("duplicate key") && !error.message?.includes("unique constraint")) {
          throw error;
        }
      }

      // Anonymize requests (userId references users.id)
      await db
        .update(socketrelayRequests)
        .set({ userId: anonymizedUserId })
        .where(eq(socketrelayRequests.userId, userId));

      // Anonymize fulfillments (fulfillerUserId and closedBy reference users.id)
      await db
        .update(socketrelayFulfillments)
        .set({ fulfillerUserId: anonymizedUserId })
        .where(eq(socketrelayFulfillments.fulfillerUserId, userId));
      
      await db
        .update(socketrelayFulfillments)
        .set({ closedBy: anonymizedUserId })
        .where(eq(socketrelayFulfillments.closedBy, userId));

      // Anonymize messages (senderId references users.id)
      await db
        .update(socketrelayMessages)
        .set({ senderId: anonymizedUserId })
        .where(eq(socketrelayMessages.senderId, userId));

      // Delete the profile
      await db.delete(socketrelayProfiles).where(eq(socketrelayProfiles.userId, userId));

      // Log the deletion (don't fail if logging fails)
      try {
        await this.logProfileDeletion(userId, "socketrelay", reason);
      } catch (error) {
        console.error("Failed to log profile deletion:", error);
        // Continue even if logging fails
      }
    } catch (error: any) {
      console.error("Error in deleteSocketrelayProfile:", error);
      // Re-throw with more context
      throw new Error(`Failed to delete SocketRelay profile: ${error.message || "Unknown error"}`);
    }
  }

  // ========================================
  // MECHANICMATCH OPERATIONS
  // ========================================

  // MechanicMatch Profile operations
  async getMechanicmatchProfile(userId: string): Promise<MechanicmatchProfile | undefined> {
    const [profile] = await db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.userId, userId));
    return profile;
  }

  async getMechanicmatchProfileById(profileId: string): Promise<MechanicmatchProfile | undefined> {
    const [profile] = await db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.id, profileId));
    return profile;
  }

  async listMechanicmatchProfiles(filters?: {
    search?: string;
    role?: "mechanic" | "owner";
    isClaimed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MechanicmatchProfile[]; total: number }> {
    const limit = Math.min(filters?.limit ?? 50, 100);
    const offset = filters?.offset ?? 0;
    const conditions: any[] = [];

    if (filters?.role === "mechanic") {
      conditions.push(eq(mechanicmatchProfiles.isMechanic, true));
    } else if (filters?.role === "owner") {
      conditions.push(eq(mechanicmatchProfiles.isCarOwner, true));
    }

    if (filters?.isClaimed !== undefined) {
      conditions.push(eq(mechanicmatchProfiles.isClaimed, filters.isClaimed));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${mechanicmatchProfiles.city} ILIKE ${searchTerm}`,
          sql`${mechanicmatchProfiles.state} ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mechanicmatchProfiles)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(mechanicmatchProfiles)
      .where(whereClause)
      .orderBy(desc(mechanicmatchProfiles.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total };
  }

  async listPublicMechanicmatchProfiles(): Promise<MechanicmatchProfile[]> {
    return await db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.isPublic, true))
      .orderBy(desc(mechanicmatchProfiles.createdAt));
  }

  async createMechanicmatchProfile(profileData: InsertMechanicmatchProfile): Promise<MechanicmatchProfile> {
    // Convert number fields to strings for decimal columns
    const dataToInsert: any = { ...profileData };
    if (dataToInsert.hourlyRate !== undefined && dataToInsert.hourlyRate !== null) {
      dataToInsert.hourlyRate = dataToInsert.hourlyRate.toString();
    }
    if (dataToInsert.averageRating !== undefined && dataToInsert.averageRating !== null) {
      dataToInsert.averageRating = dataToInsert.averageRating.toString();
    }
    // Follow the same pattern as directory profiles: omit userId from insert if it's null/undefined/empty
    // This ensures unclaimed profiles don't include user_id in the database insert
    // Use object destructuring to completely exclude the field
    const { userId, ...restData } = dataToInsert;
    const finalData: any = { ...restData };
    // Only include userId if it has a valid non-empty string value
    if (userId && typeof userId === 'string' && userId.trim() !== '') {
      finalData.userId = userId.trim();
    }
    // Ensure userId is not in the object at all if it's null/undefined/empty
    if (finalData.userId === null || finalData.userId === undefined || finalData.userId === '') {
      delete finalData.userId;
    }
    const [profile] = await db
      .insert(mechanicmatchProfiles)
      .values(finalData)
      .returning();
    return profile;
  }

  async updateMechanicmatchProfile(userId: string, profileData: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...profileData, updatedAt: new Date() };
    if (dataToUpdate.hourlyRate !== undefined && dataToUpdate.hourlyRate !== null) {
      dataToUpdate.hourlyRate = dataToUpdate.hourlyRate.toString();
    }
    if (dataToUpdate.averageRating !== undefined && dataToUpdate.averageRating !== null) {
      dataToUpdate.averageRating = dataToUpdate.averageRating.toString();
    }
    const [profile] = await db
      .update(mechanicmatchProfiles)
      .set(dataToUpdate)
      .where(eq(mechanicmatchProfiles.userId, userId))
      .returning();
    return profile;
  }

  async updateMechanicmatchProfileById(profileId: string, profileData: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...profileData, updatedAt: new Date() };
    if (dataToUpdate.hourlyRate !== undefined && dataToUpdate.hourlyRate !== null) {
      dataToUpdate.hourlyRate = dataToUpdate.hourlyRate.toString();
    }
    if (dataToUpdate.averageRating !== undefined && dataToUpdate.averageRating !== null) {
      dataToUpdate.averageRating = dataToUpdate.averageRating.toString();
    }
    const [profile] = await db
      .update(mechanicmatchProfiles)
      .set(dataToUpdate)
      .where(eq(mechanicmatchProfiles.id, profileId))
      .returning();
    return profile;
  }

  async deleteMechanicmatchProfile(userId: string, reason?: string): Promise<void> {
    const profile = await this.getMechanicmatchProfile(userId);
    if (!profile) {
      throw new Error("MechanicMatch profile not found");
    }

    const anonymizedUserId = this.generateAnonymizedUserId();

    // Anonymize related data
    await db.update(mechanicmatchVehicles).set({ ownerId: anonymizedUserId }).where(eq(mechanicmatchVehicles.ownerId, userId));
    await db.update(mechanicmatchServiceRequests).set({ ownerId: anonymizedUserId }).where(eq(mechanicmatchServiceRequests.ownerId, userId));
    await db.update(mechanicmatchJobs).set({ ownerId: anonymizedUserId }).where(eq(mechanicmatchJobs.ownerId, userId));
    await db.update(mechanicmatchReviews).set({ reviewerId: anonymizedUserId }).where(eq(mechanicmatchReviews.reviewerId, userId));
    await db.update(mechanicmatchMessages).set({ senderId: anonymizedUserId }).where(eq(mechanicmatchMessages.senderId, userId));
    await db.update(mechanicmatchMessages).set({ recipientId: anonymizedUserId }).where(eq(mechanicmatchMessages.recipientId, userId));

    // Delete the profile
    await db.delete(mechanicmatchProfiles).where(eq(mechanicmatchProfiles.userId, userId));

    // Log the deletion
    await this.logProfileDeletion(userId, "mechanicmatch", reason);
  }

  async deleteMechanicmatchProfileById(profileId: string): Promise<void> {
    await db.delete(mechanicmatchProfiles).where(eq(mechanicmatchProfiles.id, profileId));
  }

  // MechanicMatch Vehicle operations
  async getMechanicmatchVehiclesByOwner(ownerId: string): Promise<MechanicmatchVehicle[]> {
    return await db
      .select()
      .from(mechanicmatchVehicles)
      .where(eq(mechanicmatchVehicles.ownerId, ownerId))
      .orderBy(desc(mechanicmatchVehicles.createdAt));
  }

  async getMechanicmatchVehicleById(id: string): Promise<MechanicmatchVehicle | undefined> {
    const [vehicle] = await db
      .select()
      .from(mechanicmatchVehicles)
      .where(eq(mechanicmatchVehicles.id, id));
    return vehicle;
  }

  async createMechanicmatchVehicle(vehicleData: InsertMechanicmatchVehicle & { ownerId?: string }): Promise<MechanicmatchVehicle> {
    if (!vehicleData.ownerId) {
      throw new Error("ownerId is required to create a vehicle");
    }
    const [vehicle] = await db
      .insert(mechanicmatchVehicles)
      .values({
        ...vehicleData,
        ownerId: vehicleData.ownerId,
      })
      .returning();
    return vehicle;
  }

  async updateMechanicmatchVehicle(id: string, vehicleData: Partial<InsertMechanicmatchVehicle>): Promise<MechanicmatchVehicle> {
    const [vehicle] = await db
      .update(mechanicmatchVehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(mechanicmatchVehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteMechanicmatchVehicle(id: string, ownerId: string): Promise<void> {
    const vehicle = await this.getMechanicmatchVehicleById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    if (vehicle.ownerId !== ownerId) {
      throw new Error("You are not authorized to delete this vehicle");
    }
    await db.delete(mechanicmatchVehicles).where(eq(mechanicmatchVehicles.id, id));
  }

  // MechanicMatch Service Request operations
  async createMechanicmatchServiceRequest(requestData: InsertMechanicmatchServiceRequest & { ownerId?: string }): Promise<MechanicmatchServiceRequest> {
    if (!requestData.ownerId) {
      throw new Error("ownerId is required to create a service request");
    }
    const [request] = await db
      .insert(mechanicmatchServiceRequests)
      .values({
        ...requestData,
        ownerId: requestData.ownerId,
        status: 'open',
      })
      .returning();
    return request;
  }

  async getMechanicmatchServiceRequestById(id: string): Promise<MechanicmatchServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.id, id));
    return request;
  }

  async getMechanicmatchServiceRequestsByOwner(ownerId: string): Promise<MechanicmatchServiceRequest[]> {
    return await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.ownerId, ownerId))
      .orderBy(desc(mechanicmatchServiceRequests.createdAt));
  }

  async getMechanicmatchServiceRequestsByOwnerPaginated(
    ownerId: string,
    limit: number,
    offset: number
  ): Promise<{ items: MechanicmatchServiceRequest[]; total: number }> {
    const safeLimit = Math.min(limit, 100);
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.ownerId, ownerId));
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.ownerId, ownerId))
      .orderBy(desc(mechanicmatchServiceRequests.createdAt))
      .limit(safeLimit)
      .offset(offset);

    return { items, total };
  }

  async getOpenMechanicmatchServiceRequests(): Promise<MechanicmatchServiceRequest[]> {
    return await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.status, 'open'))
      .orderBy(desc(mechanicmatchServiceRequests.createdAt));
  }

  async updateMechanicmatchServiceRequest(id: string, requestData: Partial<InsertMechanicmatchServiceRequest>): Promise<MechanicmatchServiceRequest> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...requestData, updatedAt: new Date() };
    if (dataToUpdate.ratePerMinute !== undefined && dataToUpdate.ratePerMinute !== null) {
      dataToUpdate.ratePerMinute = dataToUpdate.ratePerMinute.toString();
    }
    const [request] = await db
      .update(mechanicmatchServiceRequests)
      .set(dataToUpdate)
      .where(eq(mechanicmatchServiceRequests.id, id))
      .returning();
    return request;
  }

  // MechanicMatch Job operations
  async createMechanicmatchJob(jobData: InsertMechanicmatchJob & { ownerId?: string }): Promise<MechanicmatchJob> {
    if (!jobData.ownerId) {
      throw new Error("ownerId is required to create a job");
    }
    // Convert number fields to strings for decimal columns
    const dataToInsert: any = {
      ...jobData,
      ownerId: jobData.ownerId,
      status: 'requested',
    };
    if (dataToInsert.ratePerMinute !== undefined && dataToInsert.ratePerMinute !== null) {
      dataToInsert.ratePerMinute = dataToInsert.ratePerMinute.toString();
    }
    const [job] = await db
      .insert(mechanicmatchJobs)
      .values(dataToInsert)
      .returning();
    return job;
  }

  async getMechanicmatchJobById(id: string): Promise<MechanicmatchJob | undefined> {
    const [job] = await db
      .select()
      .from(mechanicmatchJobs)
      .where(eq(mechanicmatchJobs.id, id));
    return job;
  }

  async getMechanicmatchJobsByOwner(ownerId: string): Promise<MechanicmatchJob[]> {
    return await db
      .select()
      .from(mechanicmatchJobs)
      .where(eq(mechanicmatchJobs.ownerId, ownerId))
      .orderBy(desc(mechanicmatchJobs.createdAt));
  }

  async getMechanicmatchJobsByMechanic(mechanicId: string): Promise<MechanicmatchJob[]> {
    return await db
      .select()
      .from(mechanicmatchJobs)
      .where(eq(mechanicmatchJobs.mechanicId, mechanicId))
      .orderBy(desc(mechanicmatchJobs.createdAt));
  }

  async updateMechanicmatchJob(id: string, jobData: Partial<InsertMechanicmatchJob>): Promise<MechanicmatchJob> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...jobData, updatedAt: new Date() };
    if (dataToUpdate.ratePerMinute !== undefined && dataToUpdate.ratePerMinute !== null) {
      dataToUpdate.ratePerMinute = dataToUpdate.ratePerMinute.toString();
    }
    const [job] = await db
      .update(mechanicmatchJobs)
      .set(dataToUpdate)
      .where(eq(mechanicmatchJobs.id, id))
      .returning();
    return job;
  }

  async acceptMechanicmatchJob(jobId: string, mechanicId: string): Promise<MechanicmatchJob> {
    const job = await this.getMechanicmatchJobById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    if (job.mechanicId !== mechanicId) {
      throw new Error("You are not authorized to accept this job");
    }
    if (job.status !== 'requested') {
      throw new Error("Job is not in requested status");
    }
    const [updated] = await db
      .update(mechanicmatchJobs)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(mechanicmatchJobs.id, jobId))
      .returning();
    
    // Update service request status if linked
    if (job.serviceRequestId) {
      await db
        .update(mechanicmatchServiceRequests)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(mechanicmatchServiceRequests.id, job.serviceRequestId));
    }
    
    return updated;
  }

  // MechanicMatch Availability operations
  async getMechanicmatchAvailabilityByMechanic(mechanicId: string): Promise<MechanicmatchAvailability[]> {
    return await db
      .select()
      .from(mechanicmatchAvailability)
      .where(eq(mechanicmatchAvailability.mechanicId, mechanicId))
      .orderBy(asc(mechanicmatchAvailability.dayOfWeek));
  }

  async createMechanicmatchAvailability(availabilityData: InsertMechanicmatchAvailability): Promise<MechanicmatchAvailability> {
    const [availability] = await db
      .insert(mechanicmatchAvailability)
      .values(availabilityData)
      .returning();
    return availability;
  }

  async updateMechanicmatchAvailability(id: string, availabilityData: Partial<InsertMechanicmatchAvailability>): Promise<MechanicmatchAvailability> {
    const [availability] = await db
      .update(mechanicmatchAvailability)
      .set({ ...availabilityData, updatedAt: new Date() })
      .where(eq(mechanicmatchAvailability.id, id))
      .returning();
    return availability;
  }

  async deleteMechanicmatchAvailability(id: string, mechanicId: string): Promise<void> {
    const availability = await db
      .select()
      .from(mechanicmatchAvailability)
      .where(and(
        eq(mechanicmatchAvailability.id, id),
        eq(mechanicmatchAvailability.mechanicId, mechanicId)
      ));
    if (!availability.length) {
      throw new Error("Availability not found or unauthorized");
    }
    await db.delete(mechanicmatchAvailability).where(eq(mechanicmatchAvailability.id, id));
  }

  // MechanicMatch Review operations
  async createMechanicmatchReview(reviewData: InsertMechanicmatchReview & { reviewerId?: string }): Promise<MechanicmatchReview> {
    if (!reviewData.reviewerId) {
      throw new Error("reviewerId is required to create a review");
    }
    const [review] = await db
      .insert(mechanicmatchReviews)
      .values({
        ...reviewData,
        reviewerId: reviewData.reviewerId,
      })
      .returning();
    
    // Update average rating for reviewee profile
    const reviews = await this.getMechanicmatchReviewsByReviewee(review.revieweeId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await db
      .update(mechanicmatchProfiles)
      .set({ averageRating: avgRating.toString(), updatedAt: new Date() })
      .where(eq(mechanicmatchProfiles.id, review.revieweeId));
    
    return review;
  }

  async getMechanicmatchReviewById(id: string): Promise<MechanicmatchReview | undefined> {
    const [review] = await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.id, id));
    return review;
  }

  async getMechanicmatchReviewsByReviewee(revieweeId: string): Promise<MechanicmatchReview[]> {
    return await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.revieweeId, revieweeId))
      .orderBy(desc(mechanicmatchReviews.createdAt));
  }

  async getMechanicmatchReviewsByReviewer(reviewerId: string): Promise<MechanicmatchReview[]> {
    return await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.reviewerId, reviewerId))
      .orderBy(desc(mechanicmatchReviews.createdAt));
  }

  async getMechanicmatchReviewsByJob(jobId: string): Promise<MechanicmatchReview[]> {
    return await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.jobId, jobId))
      .orderBy(desc(mechanicmatchReviews.createdAt));
  }

  // MechanicMatch Message operations
  async createMechanicmatchMessage(messageData: InsertMechanicmatchMessage & { senderId?: string }): Promise<MechanicmatchMessage> {
    if (!messageData.senderId) {
      throw new Error("senderId is required to create a message");
    }
    const [message] = await db
      .insert(mechanicmatchMessages)
      .values({
        ...messageData,
        senderId: messageData.senderId,
      })
      .returning();
    return message;
  }

  async getMechanicmatchMessagesByJob(jobId: string): Promise<MechanicmatchMessage[]> {
    return await db
      .select()
      .from(mechanicmatchMessages)
      .where(eq(mechanicmatchMessages.jobId, jobId))
      .orderBy(asc(mechanicmatchMessages.createdAt));
  }

  async getMechanicmatchMessagesBetweenUsers(userId1: string, userId2: string): Promise<MechanicmatchMessage[]> {
    return await db
      .select()
      .from(mechanicmatchMessages)
      .where(
        or(
          and(
            eq(mechanicmatchMessages.senderId, userId1),
            eq(mechanicmatchMessages.recipientId, userId2)
          ),
          and(
            eq(mechanicmatchMessages.senderId, userId2),
            eq(mechanicmatchMessages.recipientId, userId1)
          )
        )
      )
      .orderBy(asc(mechanicmatchMessages.createdAt));
  }

  async markMechanicmatchMessageAsRead(messageId: string, userId: string): Promise<MechanicmatchMessage> {
    const message = await db
      .select()
      .from(mechanicmatchMessages)
      .where(eq(mechanicmatchMessages.id, messageId));
    if (!message.length || message[0].recipientId !== userId) {
      throw new Error("Message not found or unauthorized");
    }
    const [updated] = await db
      .update(mechanicmatchMessages)
      .set({ isRead: true })
      .where(eq(mechanicmatchMessages.id, messageId))
      .returning();
    return updated;
  }

  async getUnreadMechanicmatchMessages(userId: string): Promise<MechanicmatchMessage[]> {
    return await db
      .select()
      .from(mechanicmatchMessages)
      .where(
        and(
          eq(mechanicmatchMessages.recipientId, userId),
          eq(mechanicmatchMessages.isRead, false)
        )
      )
      .orderBy(desc(mechanicmatchMessages.createdAt));
  }

  // MechanicMatch Search/Matching operations
  async searchMechanicmatchMechanics(filters: {
    city?: string;
    state?: string;
    isMobileMechanic?: boolean;
    specialties?: string[];
    maxHourlyRate?: number;
    minRating?: number;
    isAvailable?: boolean;
  }): Promise<MechanicmatchProfile[]> {
    let query = db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.isMechanic, true));

    // This is a simplified version - in production you'd want to build dynamic queries
    // For now, we'll filter in memory after fetching (not ideal for large datasets)
    const mechanics = await query;

    return mechanics.filter(mechanic => {
      if (filters.city && mechanic.city !== filters.city) return false;
      if (filters.state && mechanic.state !== filters.state) return false;
      if (filters.isMobileMechanic !== undefined && mechanic.isMobileMechanic !== filters.isMobileMechanic) return false;
      if (filters.maxHourlyRate && mechanic.hourlyRate && parseFloat(mechanic.hourlyRate) > filters.maxHourlyRate) return false;
      if (filters.minRating && mechanic.averageRating && parseFloat(mechanic.averageRating) < filters.minRating) return false;
      // Specialties and availability would need more complex logic
      return true;
    });
  }

  // MechanicMatch Announcement operations
  async createMechanicmatchAnnouncement(announcementData: InsertMechanicmatchAnnouncement): Promise<MechanicmatchAnnouncement> {
    const [announcement] = await db
      .insert(mechanicmatchAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(mechanicmatchAnnouncements)
      .where(
        and(
          eq(mechanicmatchAnnouncements.isActive, true),
          or(
            sql`${mechanicmatchAnnouncements.expiresAt} IS NULL`,
            gte(mechanicmatchAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(mechanicmatchAnnouncements.createdAt));
  }

  async getAllMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]> {
    return await db
      .select()
      .from(mechanicmatchAnnouncements)
      .orderBy(desc(mechanicmatchAnnouncements.createdAt));
  }

  async updateMechanicmatchAnnouncement(id: string, announcementData: Partial<InsertMechanicmatchAnnouncement>): Promise<MechanicmatchAnnouncement> {
    const [announcement] = await db
      .update(mechanicmatchAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(mechanicmatchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateMechanicmatchAnnouncement(id: string): Promise<MechanicmatchAnnouncement> {
    const [announcement] = await db
      .update(mechanicmatchAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(mechanicmatchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // LOSTMAIL OPERATIONS
  // ========================================

  // LostMail Incident operations
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
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: LostmailIncident[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    let query = db.select().from(lostmailIncidents);
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

  // LostMail Audit Trail operations
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

  // LostMail Announcement operations
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

  // ========================================
  // RESEARCH OPERATIONS IMPLEMENTATION
  // ========================================

  // Research Items
  async createResearchItem(itemData: InsertResearchItem): Promise<ResearchItem> {
    const [item] = await db
      .insert(researchItems)
      .values({
        ...itemData,
        tags: itemData.tags ? JSON.stringify(itemData.tags) : null,
        attachments: itemData.attachments ? JSON.stringify(itemData.attachments) : null,
      })
      .returning();
    return item;
  }

  async getResearchItemById(id: string): Promise<ResearchItem | undefined> {
    const [item] = await db
      .select()
      .from(researchItems)
      .where(eq(researchItems.id, id));
    return item;
  }

  async getResearchItems(filters?: {
    userId?: string;
    tag?: string;
    status?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  }): Promise<{ items: ResearchItem[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions: any[] = [];

    if (filters?.userId) {
      conditions.push(eq(researchItems.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(researchItems.status, filters.status));
    }
    if (filters?.isPublic !== undefined) {
      conditions.push(eq(researchItems.isPublic, filters.isPublic));
    }
    if (filters?.tag) {
      conditions.push(sql`${researchItems.tags}::text ILIKE ${`%${filters.tag}%`}`);
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${researchItems.title} ILIKE ${searchTerm}`,
          sql`${researchItems.bodyMd} ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchItems)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Determine sort order
    let orderBy: any = desc(researchItems.createdAt);
    if (filters?.sortBy === "popular") {
      orderBy = desc(researchItems.viewCount);
    } else if (filters?.sortBy === "recent") {
      orderBy = desc(researchItems.updatedAt);
    }

    const items = await db
      .select()
      .from(researchItems)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { items, total };
  }

  async updateResearchItem(id: string, itemData: Partial<InsertResearchItem>): Promise<ResearchItem> {
    const updateData: any = { ...itemData, updatedAt: new Date() };
    if (itemData.tags !== undefined) {
      updateData.tags = itemData.tags ? JSON.stringify(itemData.tags) : null;
    }
    if (itemData.attachments !== undefined) {
      updateData.attachments = itemData.attachments ? JSON.stringify(itemData.attachments) : null;
    }
    
    const [item] = await db
      .update(researchItems)
      .set(updateData)
      .where(eq(researchItems.id, id))
      .returning();
    return item;
  }

  async incrementResearchItemViewCount(id: string): Promise<void> {
    await db
      .update(researchItems)
      .set({ viewCount: sql`${researchItems.viewCount} + 1` })
      .where(eq(researchItems.id, id));
  }

  async acceptResearchAnswer(itemId: string, answerId: string): Promise<ResearchItem> {
    // Unaccept previous answer if any
    await db
      .update(researchAnswers)
      .set({ isAccepted: false })
      .where(eq(researchAnswers.researchItemId, itemId));

    // Accept new answer
    await db
      .update(researchAnswers)
      .set({ isAccepted: true })
      .where(eq(researchAnswers.id, answerId));

    // Update item
    const [item] = await db
      .update(researchItems)
      .set({
        acceptedAnswerId: answerId,
        status: "answered",
        updatedAt: new Date(),
      })
      .where(eq(researchItems.id, itemId))
      .returning();

    return item;
  }

  // Research Answers
  async createResearchAnswer(answerData: InsertResearchAnswer): Promise<ResearchAnswer> {
    const [answer] = await db
      .insert(researchAnswers)
      .values({
        ...answerData,
        links: answerData.links ? JSON.stringify(answerData.links) : null,
        attachments: answerData.attachments ? JSON.stringify(answerData.attachments) : null,
      })
      .returning();
    
    // Calculate initial relevance
    await this.calculateAnswerRelevance(answer.id);
    
    return answer;
  }

  async getResearchAnswerById(id: string): Promise<ResearchAnswer | undefined> {
    const [answer] = await db
      .select()
      .from(researchAnswers)
      .where(eq(researchAnswers.id, id));
    return answer;
  }

  async getResearchAnswersByItemId(itemId: string, sortBy?: string): Promise<ResearchAnswer[]> {
    let orderBy: any = desc(researchAnswers.relevanceScore); // Default: relevance
    
    if (sortBy === "score") {
      orderBy = desc(researchAnswers.score);
    } else if (sortBy === "recent") {
      orderBy = desc(researchAnswers.createdAt);
    } else if (sortBy === "confidence") {
      orderBy = desc(researchAnswers.confidenceScore);
    }

    return await db
      .select()
      .from(researchAnswers)
      .where(eq(researchAnswers.researchItemId, itemId))
      .orderBy(orderBy);
  }

  async updateResearchAnswer(id: string, answerData: Partial<InsertResearchAnswer>): Promise<ResearchAnswer> {
    const updateData: any = { ...answerData, updatedAt: new Date() };
    if (answerData.links !== undefined) {
      updateData.links = answerData.links ? JSON.stringify(answerData.links) : null;
    }
    if (answerData.attachments !== undefined) {
      updateData.attachments = answerData.attachments ? JSON.stringify(answerData.attachments) : null;
    }

    const [answer] = await db
      .update(researchAnswers)
      .set(updateData)
      .where(eq(researchAnswers.id, id))
      .returning();

    // Recalculate relevance if links or content changed
    if (answerData.links || answerData.bodyMd) {
      await this.calculateAnswerRelevance(id);
    }

    return answer;
  }

  async calculateAnswerRelevance(answerId: string): Promise<number> {
    // Get answer with related data
    const answer = await this.getResearchAnswerById(answerId);
    if (!answer) return 0;

    // Get user reputation
    const userRep = await this.getUserReputation(answer.userId);

    // Get link provenances and calculate source trust
    const provenances = await this.getResearchLinkProvenancesByAnswerId(answerId);
    const avgDomainScore = provenances.length > 0
      ? provenances.reduce((sum, p) => sum + (Number(p.domainScore || 0)), 0) / provenances.length
      : 0;

    // Get vote score
    const voteScore = answer.score || 0;

    // Calculate verification score
    const verificationScore = Number(answer.verificationScore || 0);

    // Normalize values (simple normalization - in production, use more sophisticated approach)
    const normalizedUpvotes = Math.min(voteScore / 10, 1); // Cap at 10 upvotes = 1.0
    const normalizedReputation = Math.min(userRep / 100, 1); // Cap at 100 rep = 1.0
    const normalizedSourceTrust = avgDomainScore; // Already 0-1
    const normalizedSimilarity = verificationScore; // Already 0-1

    // Recency boost (decay over 30 days)
    const daysSinceCreation = (Date.now() - new Date(answer.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - (daysSinceCreation / 30));

    // Weighted formula (default weights from requirements)
    const w1 = 0.35; // upvotes
    const w2 = 0.20; // reputation
    const w3 = 0.25; // source trust
    const w4 = 0.15; // similarity
    const w5 = 0.05; // recency

    const relevanceScore = (
      w1 * normalizedUpvotes +
      w2 * normalizedReputation +
      w3 * normalizedSourceTrust +
      w4 * normalizedSimilarity +
      w5 * recencyBoost
    );

    // Update answer with relevance score
    await db
      .update(researchAnswers)
      .set({ relevanceScore: relevanceScore.toString() })
      .where(eq(researchAnswers.id, answerId));

    return relevanceScore;
  }

  async updateAnswerScore(answerId: string): Promise<void> {
    // Calculate score from votes
    const votes = await db
      .select()
      .from(researchVotes)
      .where(eq(researchVotes.answerId, answerId));

    const score = votes.reduce((sum, vote) => sum + vote.value, 0);

    await db
      .update(researchAnswers)
      .set({ score })
      .where(eq(researchAnswers.id, answerId));

    // Recalculate relevance
    await this.calculateAnswerRelevance(answerId);
  }

  // Research Comments
  async createResearchComment(commentData: InsertResearchComment): Promise<ResearchComment> {
    const [comment] = await db
      .insert(researchComments)
      .values(commentData)
      .returning();
    return comment;
  }

  async getResearchComments(filters: { researchItemId?: string; answerId?: string }): Promise<ResearchComment[]> {
    const conditions: any[] = [];
    if (filters.researchItemId) {
      conditions.push(eq(researchComments.researchItemId, filters.researchItemId));
    }
    if (filters.answerId) {
      conditions.push(eq(researchComments.answerId, filters.answerId));
    }

    return await db
      .select()
      .from(researchComments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(researchComments.createdAt));
  }

  async updateResearchComment(id: string, commentData: Partial<InsertResearchComment>): Promise<ResearchComment> {
    const [comment] = await db
      .update(researchComments)
      .set({ ...commentData, updatedAt: new Date() })
      .where(eq(researchComments.id, id))
      .returning();
    return comment;
  }

  async deleteResearchComment(id: string): Promise<void> {
    await db.delete(researchComments).where(eq(researchComments.id, id));
  }

  // Research Votes
  async createOrUpdateResearchVote(voteData: InsertResearchVote): Promise<ResearchVote> {
    // Check if vote exists
    const existing = await this.getResearchVote(voteData.userId, voteData.researchItemId || undefined, voteData.answerId || undefined);

    // Convert string value to number for database
    const voteValue = typeof voteData.value === 'string' ? parseInt(voteData.value, 10) : voteData.value;

    if (existing) {
      // Update existing vote
      const [vote] = await db
        .update(researchVotes)
        .set({ value: voteValue })
        .where(eq(researchVotes.id, existing.id))
        .returning();

      // Update answer score if voting on answer
      if (voteData.answerId) {
        await this.updateAnswerScore(voteData.answerId);
      }

      return vote;
    } else {
      // Create new vote
      const [vote] = await db
        .insert(researchVotes)
        .values({ ...voteData, value: voteValue })
        .returning();

      // Update answer score if voting on answer
      if (voteData.answerId) {
        await this.updateAnswerScore(voteData.answerId);
      }

      return vote;
    }
  }

  async getResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<ResearchVote | undefined> {
    const conditions: any[] = [eq(researchVotes.userId, userId)];
    if (researchItemId) {
      conditions.push(eq(researchVotes.researchItemId, researchItemId));
    }
    if (answerId) {
      conditions.push(eq(researchVotes.answerId, answerId));
    }

    const [vote] = await db
      .select()
      .from(researchVotes)
      .where(and(...conditions));
    return vote;
  }

  async deleteResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<void> {
    const conditions: any[] = [eq(researchVotes.userId, userId)];
    if (researchItemId) {
      conditions.push(eq(researchVotes.researchItemId, researchItemId));
    }
    if (answerId) {
      conditions.push(eq(researchVotes.answerId, answerId));
    }

    await db.delete(researchVotes).where(and(...conditions));

    // Update answer score if voting on answer
    if (answerId) {
      await this.updateAnswerScore(answerId);
    }
  }

  // Research Link Provenances
  async createResearchLinkProvenance(provenanceData: InsertResearchLinkProvenance): Promise<ResearchLinkProvenance> {
    // Convert number fields to strings for decimal columns
    const dataToInsert: any = { ...provenanceData };
    if (dataToInsert.domainScore !== undefined && dataToInsert.domainScore !== null) {
      dataToInsert.domainScore = dataToInsert.domainScore.toString();
    }
    if (dataToInsert.similarityScore !== undefined && dataToInsert.similarityScore !== null) {
      dataToInsert.similarityScore = dataToInsert.similarityScore.toString();
    }
    const [provenance] = await db
      .insert(researchLinkProvenances)
      .values(dataToInsert)
      .returning();

    // Recalculate verification score for answer
    if (provenanceData.answerId) {
      await this.calculateAnswerVerificationScore(provenanceData.answerId);
    }

    return provenance;
  }

  async getResearchLinkProvenancesByAnswerId(answerId: string): Promise<ResearchLinkProvenance[]> {
    return await db
      .select()
      .from(researchLinkProvenances)
      .where(eq(researchLinkProvenances.answerId, answerId))
      .orderBy(desc(researchLinkProvenances.similarityScore));
  }

  async updateResearchLinkProvenance(id: string, provenanceData: Partial<InsertResearchLinkProvenance>): Promise<ResearchLinkProvenance> {
    // Convert numeric fields to strings for drizzle
    const updateData: any = { ...provenanceData };
    if (updateData.domainScore !== undefined && updateData.domainScore !== null && typeof updateData.domainScore === 'number') {
      updateData.domainScore = updateData.domainScore.toString();
    }
    if (updateData.similarityScore !== undefined && updateData.similarityScore !== null && typeof updateData.similarityScore === 'number') {
      updateData.similarityScore = updateData.similarityScore.toString();
    }
    const [provenance] = await db
      .update(researchLinkProvenances)
      .set(updateData)
      .where(eq(researchLinkProvenances.id, id))
      .returning();

    // Recalculate verification score
    if (provenance.answerId) {
      await this.calculateAnswerVerificationScore(provenance.answerId);
    }

    return provenance;
  }

  async calculateAnswerVerificationScore(answerId: string): Promise<number> {
    const provenances = await this.getResearchLinkProvenancesByAnswerId(answerId);
    
    if (provenances.length === 0) {
      await db
        .update(researchAnswers)
        .set({ verificationScore: "0" })
        .where(eq(researchAnswers.id, answerId));
      return 0;
    }

    // Average similarity score weighted by domain score
    const totalWeight = provenances.reduce((sum, p) => {
      const domainWeight = Number(p.domainScore || 0.5); // Default 0.5 if no domain score
      const similarity = Number(p.similarityScore || 0);
      return sum + (domainWeight * similarity);
    }, 0);

    const avgScore = totalWeight / provenances.length;
    const normalizedScore = Math.min(Math.max(avgScore, 0), 1);

    await db
      .update(researchAnswers)
      .set({ verificationScore: normalizedScore.toString() })
      .where(eq(researchAnswers.id, answerId));

    // Recalculate relevance
    await this.calculateAnswerRelevance(answerId);

    return normalizedScore;
  }

  // Research Bookmarks & Follows
  async createResearchBookmark(bookmarkData: InsertResearchBookmark): Promise<ResearchBookmark> {
    const [bookmark] = await db
      .insert(researchBookmarks)
      .values(bookmarkData)
      .returning();
    return bookmark;
  }

  async deleteResearchBookmark(userId: string, researchItemId: string): Promise<void> {
    await db
      .delete(researchBookmarks)
      .where(
        and(
          eq(researchBookmarks.userId, userId),
          eq(researchBookmarks.researchItemId, researchItemId)
        )
      );
  }

  async getResearchBookmarks(userId: string): Promise<ResearchBookmark[]> {
    return await db
      .select()
      .from(researchBookmarks)
      .where(eq(researchBookmarks.userId, userId))
      .orderBy(desc(researchBookmarks.createdAt));
  }

  async createResearchFollow(followData: InsertResearchFollow): Promise<ResearchFollow> {
    const [follow] = await db
      .insert(researchFollows)
      .values(followData)
      .returning();
    return follow;
  }

  async deleteResearchFollow(userId: string, filters: { followedUserId?: string; researchItemId?: string; tag?: string }): Promise<void> {
    const conditions: any[] = [eq(researchFollows.userId, userId)];
    if (filters.followedUserId) {
      conditions.push(eq(researchFollows.followedUserId, filters.followedUserId));
    }
    if (filters.researchItemId) {
      conditions.push(eq(researchFollows.researchItemId, filters.researchItemId));
    }
    if (filters.tag) {
      conditions.push(eq(researchFollows.tag, filters.tag));
    }

    await db.delete(researchFollows).where(and(...conditions));
  }

  async getResearchFollows(userId: string): Promise<ResearchFollow[]> {
    return await db
      .select()
      .from(researchFollows)
      .where(eq(researchFollows.userId, userId));
  }

  // Research Reports
  async createResearchReport(reportData: InsertResearchReport): Promise<ResearchReport> {
    const [report] = await db
      .insert(researchReports)
      .values(reportData)
      .returning();
    return report;
  }

  async getResearchReports(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ reports: ResearchReport[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions: any[] = [];

    if (filters?.status) {
      conditions.push(eq(researchReports.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchReports)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const reports = await db
      .select()
      .from(researchReports)
      .where(whereClause)
      .orderBy(desc(researchReports.createdAt))
      .limit(limit)
      .offset(offset);

    return { reports, total };
  }

  async updateResearchReport(id: string, reportData: Partial<InsertResearchReport>): Promise<ResearchReport> {
    const [report] = await db
      .update(researchReports)
      .set(reportData)
      .where(eq(researchReports.id, id))
      .returning();
    return report;
  }

  // Research Announcements
  async createResearchAnnouncement(announcementData: InsertResearchAnnouncement): Promise<ResearchAnnouncement> {
    const [announcement] = await db
      .insert(researchAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveResearchAnnouncements(): Promise<ResearchAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(researchAnnouncements)
      .where(
        and(
          eq(researchAnnouncements.isActive, true),
          or(
            sql`${researchAnnouncements.expiresAt} IS NULL`,
            gte(researchAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(researchAnnouncements.createdAt));
  }

  async getAllResearchAnnouncements(): Promise<ResearchAnnouncement[]> {
    return await db
      .select()
      .from(researchAnnouncements)
      .orderBy(desc(researchAnnouncements.createdAt));
  }

  async updateResearchAnnouncement(id: string, announcementData: Partial<InsertResearchAnnouncement>): Promise<ResearchAnnouncement> {
    const [announcement] = await db
      .update(researchAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(researchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateResearchAnnouncement(id: string): Promise<ResearchAnnouncement> {
    const [announcement] = await db
      .update(researchAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(researchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // Research Timeline/Feed
  async getResearchTimeline(userId: string, limit: number = 50, offset: number = 0): Promise<ResearchItem[]> {
    // Get followed items, users, and tags
    const follows = await this.getResearchFollows(userId);
    
    const conditions: any[] = [
      or(
        eq(researchItems.isPublic, true),
        eq(researchItems.userId, userId)
      )
    ];

    // Add followed users' items
    const followedUserIds = follows.filter(f => f.followedUserId).map(f => f.followedUserId!);
    if (followedUserIds.length > 0) {
      conditions.push(inArray(researchItems.userId, followedUserIds));
    }

    // Add followed items
    const followedItemIds = follows.filter(f => f.researchItemId).map(f => f.researchItemId!);
    if (followedItemIds.length > 0) {
      conditions.push(inArray(researchItems.id, followedItemIds));
    }

    // For followed tags, we'd need to check JSON array - simplified here
    const followedTags = follows.filter(f => f.tag).map(f => f.tag!);

    return await db
      .select()
      .from(researchItems)
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(researchItems.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  // User Reputation (calculated)
  async getUserReputation(userId: string): Promise<number> {
    // Get accepted answers
    const acceptedAnswers = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchAnswers)
      .where(
        and(
          eq(researchAnswers.userId, userId),
          eq(researchAnswers.isAccepted, true)
        )
      );

    const acceptedCount = Number(acceptedAnswers[0]?.count || 0);

    // Get total upvotes on user's answers
    const upvotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchVotes)
      .innerJoin(researchAnswers, eq(researchVotes.answerId, researchAnswers.id))
      .where(
        and(
          eq(researchAnswers.userId, userId),
          eq(researchVotes.value, 1)
        )
      );

    const upvoteCount = Number(upvotes[0]?.count || 0);

    // Simple reputation formula: 10 points per accepted answer + 1 point per upvote
    return acceptedCount * 10 + upvoteCount;
  }

  // ========================================
  // GENTLEPULSE OPERATIONS IMPLEMENTATION
  // ========================================

  // GentlePulse Meditations
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

  // GentlePulse Ratings
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

  // GentlePulse Mood Checks
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

  // GentlePulse Favorites
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

  // GentlePulse Announcements
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

  // ========================================
  // CHYME IMPLEMENTATIONS
  // ========================================

  // Chyme Announcement operations
  async createChymeAnnouncement(announcementData: InsertChymeAnnouncement): Promise<ChymeAnnouncement> {
    const [announcement] = await db
      .insert(chymeAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveChymeAnnouncements(): Promise<ChymeAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(chymeAnnouncements)
      .where(
        and(
          eq(chymeAnnouncements.isActive, true),
          or(
            sql`${chymeAnnouncements.expiresAt} IS NULL`,
            gte(chymeAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(chymeAnnouncements.createdAt));
  }

  async getAllChymeAnnouncements(): Promise<ChymeAnnouncement[]> {
    return await db
      .select()
      .from(chymeAnnouncements)
      .orderBy(desc(chymeAnnouncements.createdAt));
  }

  async updateChymeAnnouncement(id: string, announcementData: Partial<InsertChymeAnnouncement>): Promise<ChymeAnnouncement> {
    const [announcement] = await db
      .update(chymeAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(chymeAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateChymeAnnouncement(id: string): Promise<ChymeAnnouncement> {
    const [announcement] = await db
      .update(chymeAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chymeAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // Chyme Room operations
  async createChymeRoom(roomData: InsertChymeRoom): Promise<ChymeRoom> {
    const [room] = await db
      .insert(chymeRooms)
      .values(roomData)
      .returning();
    return room;
  }

  async getChymeRoom(id: string): Promise<ChymeRoom | undefined> {
    const [room] = await db
      .select()
      .from(chymeRooms)
      .where(eq(chymeRooms.id, id));
    return room;
  }

  async getChymeRooms(roomType?: "public" | "private"): Promise<ChymeRoom[]> {
    const conditions = [eq(chymeRooms.isActive, true)];
    if (roomType) {
      conditions.push(eq(chymeRooms.roomType, roomType));
    }
    return await db
      .select()
      .from(chymeRooms)
      .where(and(...conditions))
      .orderBy(desc(chymeRooms.createdAt));
  }

  async updateChymeRoom(id: string, roomData: Partial<InsertChymeRoom>): Promise<ChymeRoom> {
    const [room] = await db
      .update(chymeRooms)
      .set({
        ...roomData,
        updatedAt: new Date(),
      })
      .where(eq(chymeRooms.id, id))
      .returning();
    return room;
  }

  async deactivateChymeRoom(id: string): Promise<ChymeRoom> {
    const [room] = await db
      .update(chymeRooms)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chymeRooms.id, id))
      .returning();
    return room;
  }

  async getChymeRoomParticipantCount(roomId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(chymeRoomParticipants)
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          sql`${chymeRoomParticipants.leftAt} IS NULL`
        )
      );
    return Number(result[0]?.count || 0);
  }

  // Chyme Room Participant operations
  async joinChymeRoom(participantData: InsertChymeRoomParticipant): Promise<ChymeRoomParticipant> {
    // Check if participant already exists and has left
    const existing = await this.getChymeRoomParticipant(participantData.roomId, participantData.userId);
    
    if (existing && existing.leftAt) {
      // Re-join by updating leftAt to null
      const [participant] = await db
        .update(chymeRoomParticipants)
        .set({
          leftAt: null,
          isMuted: participantData.isMuted ?? false,
          isSpeaking: participantData.isSpeaking ?? false,
        })
        .where(
          and(
            eq(chymeRoomParticipants.roomId, participantData.roomId),
            eq(chymeRoomParticipants.userId, participantData.userId)
          )
        )
        .returning();
      return participant;
    } else if (existing) {
      // Already in room, just update
      const [participant] = await db
        .update(chymeRoomParticipants)
        .set({
          isMuted: participantData.isMuted ?? false,
          isSpeaking: participantData.isSpeaking ?? false,
        })
        .where(
          and(
            eq(chymeRoomParticipants.roomId, participantData.roomId),
            eq(chymeRoomParticipants.userId, participantData.userId)
          )
        )
        .returning();
      return participant;
    } else {
      // New participant
      const [participant] = await db
        .insert(chymeRoomParticipants)
        .values(participantData)
        .returning();
      return participant;
    }
  }

  async leaveChymeRoom(roomId: string, userId: string): Promise<void> {
    await db
      .update(chymeRoomParticipants)
      .set({
        leftAt: new Date(),
      })
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          eq(chymeRoomParticipants.userId, userId)
        )
      );
  }

  async getChymeRoomParticipants(roomId: string): Promise<ChymeRoomParticipant[]> {
    return await db
      .select()
      .from(chymeRoomParticipants)
      .where(eq(chymeRoomParticipants.roomId, roomId))
      .orderBy(desc(chymeRoomParticipants.joinedAt));
  }

  async getChymeRoomParticipant(roomId: string, userId: string): Promise<ChymeRoomParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(chymeRoomParticipants)
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          eq(chymeRoomParticipants.userId, userId)
        )
      )
      .orderBy(desc(chymeRoomParticipants.joinedAt))
      .limit(1);
    return participant;
  }

  async updateChymeRoomParticipant(roomId: string, userId: string, updates: Partial<InsertChymeRoomParticipant>): Promise<ChymeRoomParticipant> {
    const [participant] = await db
      .update(chymeRoomParticipants)
      .set(updates)
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          eq(chymeRoomParticipants.userId, userId)
        )
      )
      .returning();
    if (!participant) {
      throw new Error("Participant not found");
    }
    return participant;
  }

  // Chyme Message operations
  async createChymeMessage(messageData: InsertChymeMessage): Promise<ChymeMessage> {
    const [message] = await db
      .insert(chymeMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getChymeMessages(roomId: string): Promise<ChymeMessage[]> {
    return await db
      .select()
      .from(chymeMessages)
      .where(eq(chymeMessages.roomId, roomId))
      .orderBy(asc(chymeMessages.createdAt));
  }

  // ========================================
  // WORKFORCE RECRUITER TRACKER IMPLEMENTATIONS
  // ========================================

  async getWorkforceRecruiterProfile(userId: string): Promise<WorkforceRecruiterProfile | undefined> {
    const [profile] = await db
      .select()
      .from(workforceRecruiterProfiles)
      .where(eq(workforceRecruiterProfiles.userId, userId));
    return profile;
  }

  async createWorkforceRecruiterProfile(profileData: InsertWorkforceRecruiterProfile): Promise<WorkforceRecruiterProfile> {
    if (!profileData.userId) {
      throw new Error('userId is required for WorkforceRecruiterProfile');
    }
    const [profile] = await db
      .insert(workforceRecruiterProfiles)
      .values(profileData as any)
      .returning();
    return profile;
  }

  async updateWorkforceRecruiterProfile(userId: string, profileData: Partial<InsertWorkforceRecruiterProfile>): Promise<WorkforceRecruiterProfile> {
    const [updated] = await db
      .update(workforceRecruiterProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(workforceRecruiterProfiles.userId, userId))
      .returning();
    return updated;
  }

  async deleteWorkforceRecruiterProfile(userId: string, reason?: string): Promise<void> {
    const profile = await this.getWorkforceRecruiterProfile(userId);
    if (!profile) {
      throw new Error("Workforce Recruiter profile not found");
    }

    const anonymizedUserId = this.generateAnonymizedUserId();

    // Anonymize related data (meetup events created by user, meetup event signups)
    try {
      await db
        .update(workforceRecruiterMeetupEvents)
        .set({ createdBy: anonymizedUserId })
        .where(eq(workforceRecruiterMeetupEvents.createdBy, userId));
      await db
        .update(workforceRecruiterMeetupEventSignups)
        .set({ userId: anonymizedUserId })
        .where(eq(workforceRecruiterMeetupEventSignups.userId, userId));
    } catch (error: any) {
      console.warn(`Failed to anonymize Workforce Recruiter related data: ${error.message}`);
    }

    // Delete the profile
    await db.delete(workforceRecruiterProfiles).where(eq(workforceRecruiterProfiles.userId, userId));

    // Log the deletion
    await this.logProfileDeletion(userId, "workforce_recruiter", reason);
  }

  async getWorkforceRecruiterConfig(): Promise<WorkforceRecruiterConfig | undefined> {
    const [config] = await db.select().from(workforceRecruiterConfig).limit(1);
    return config;
  }

  async createWorkforceRecruiterConfig(configData: InsertWorkforceRecruiterConfig): Promise<WorkforceRecruiterConfig> {
    // Convert number to string for decimal column
    const dataToInsert: any = { ...configData };
    if (dataToInsert.workforceParticipationRate !== undefined) {
      dataToInsert.workforceParticipationRate = dataToInsert.workforceParticipationRate.toString();
    }
    const [config] = await db
      .insert(workforceRecruiterConfig)
      .values(dataToInsert)
      .returning();
    return config;
  }

  async updateWorkforceRecruiterConfig(configData: Partial<InsertWorkforceRecruiterConfig>): Promise<WorkforceRecruiterConfig> {
    const existing = await this.getWorkforceRecruiterConfig();
    if (!existing) {
      // Create if doesn't exist
      return await this.createWorkforceRecruiterConfig({
        population: configData.population ?? 5000000,
        workforceParticipationRate: configData.workforceParticipationRate ?? 0.5,
        minRecruitable: configData.minRecruitable ?? 2000000,
        maxRecruitable: configData.maxRecruitable ?? 5000000,
      });
    }
    // Convert numeric fields to strings for drizzle
    const updateData: any = { ...configData };
    if (updateData.workforceParticipationRate !== undefined && updateData.workforceParticipationRate !== null && typeof updateData.workforceParticipationRate === 'number') {
      updateData.workforceParticipationRate = updateData.workforceParticipationRate.toString();
    }
    const [updated] = await db
      .update(workforceRecruiterConfig)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workforceRecruiterConfig.id, existing.id))
      .returning();
    return updated;
  }

  async getWorkforceRecruiterOccupation(id: string): Promise<WorkforceRecruiterOccupation | undefined> {
    const [occupation] = await db
      .select()
      .from(workforceRecruiterOccupations)
      .where(eq(workforceRecruiterOccupations.id, id));
    return occupation;
  }

  async getAllWorkforceRecruiterOccupations(filters?: {
    sector?: string;
    skillLevel?: 'Foundational' | 'Intermediate' | 'Advanced';
    limit?: number;
    offset?: number;
  }): Promise<{ occupations: WorkforceRecruiterOccupation[]; total: number }> {
    let query = db.select().from(workforceRecruiterOccupations);

    const conditions = [];
    if (filters?.sector && filters.sector !== "all") {
      // Use case-insensitive matching for sector
      conditions.push(sql`LOWER(${workforceRecruiterOccupations.sector}) = LOWER(${filters.sector})`);
    }
    if (filters?.skillLevel) {
      conditions.push(eq(workforceRecruiterOccupations.skillLevel, filters.skillLevel));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const allOccupations = await query;
    const total = allOccupations.length;

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const occupations = allOccupations.slice(offset, offset + limit);

    return { occupations, total };
  }

  async createWorkforceRecruiterOccupation(occupationData: InsertWorkforceRecruiterOccupation): Promise<WorkforceRecruiterOccupation> {
    // Validate sector is provided and not empty/whitespace
    if (!occupationData.sector || occupationData.sector.trim().length === 0) {
      throw new Error("Sector is required and cannot be empty");
    }
    
    const [occupation] = await db
      .insert(workforceRecruiterOccupations)
      .values(occupationData)
      .returning();
    return occupation;
  }

  async updateWorkforceRecruiterOccupation(id: string, occupationData: Partial<InsertWorkforceRecruiterOccupation>): Promise<WorkforceRecruiterOccupation> {
    // Prevent clearing or setting empty sector
    if (occupationData.sector !== undefined) {
      if (!occupationData.sector || occupationData.sector.trim().length === 0) {
        throw new Error("Sector cannot be empty. All occupations must have a valid sector.");
      }
    }
    
    // If updating sector, ensure it's not being set to empty
    // Also check existing occupation to ensure we don't lose the sector
    const existing = await this.getWorkforceRecruiterOccupation(id);
    if (!existing) {
      throw new Error("Occupation not found");
    }
    
    // If sector is being updated, validate it
    if (occupationData.sector !== undefined && (!occupationData.sector || occupationData.sector.trim().length === 0)) {
      throw new Error("Sector cannot be empty. All occupations must have a valid sector.");
    }
    
    const [updated] = await db
      .update(workforceRecruiterOccupations)
      .set({ ...occupationData, updatedAt: new Date() })
      .where(eq(workforceRecruiterOccupations.id, id))
      .returning();
    return updated;
  }

  async deleteWorkforceRecruiterOccupation(id: string): Promise<void> {
    await db.delete(workforceRecruiterOccupations).where(eq(workforceRecruiterOccupations.id, id));
  }

  async createWorkforceRecruiterMeetupEvent(eventData: InsertWorkforceRecruiterMeetupEvent & { createdBy: string }): Promise<WorkforceRecruiterMeetupEvent> {
    const [event] = await db
      .insert(workforceRecruiterMeetupEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getWorkforceRecruiterMeetupEvents(filters?: {
    occupationId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ events: WorkforceRecruiterMeetupEvent[]; total: number }> {
    let query = db.select().from(workforceRecruiterMeetupEvents);

    const conditions = [];
    if (filters?.occupationId) {
      conditions.push(eq(workforceRecruiterMeetupEvents.occupationId, filters.occupationId));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(workforceRecruiterMeetupEvents.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(workforceRecruiterMeetupEvents.createdAt)) as any;

    const allEvents = await query;
    const total = allEvents.length;

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const events = allEvents.slice(offset, offset + limit);

    return { events, total };
  }

  async getWorkforceRecruiterMeetupEventById(id: string): Promise<WorkforceRecruiterMeetupEvent | undefined> {
    const [event] = await db
      .select()
      .from(workforceRecruiterMeetupEvents)
      .where(eq(workforceRecruiterMeetupEvents.id, id))
      .limit(1);
    return event;
  }

  async updateWorkforceRecruiterMeetupEvent(id: string, eventData: Partial<InsertWorkforceRecruiterMeetupEvent>): Promise<WorkforceRecruiterMeetupEvent> {
    const [event] = await db
      .update(workforceRecruiterMeetupEvents)
      .set({
        ...eventData,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterMeetupEvents.id, id))
      .returning();
    return event;
  }

  async deleteWorkforceRecruiterMeetupEvent(id: string): Promise<void> {
    await db.delete(workforceRecruiterMeetupEvents).where(eq(workforceRecruiterMeetupEvents.id, id));
  }

  async createWorkforceRecruiterMeetupEventSignup(signupData: InsertWorkforceRecruiterMeetupEventSignup & { userId: string }): Promise<WorkforceRecruiterMeetupEventSignup> {
    const [signup] = await db
      .insert(workforceRecruiterMeetupEventSignups)
      .values(signupData as any)
      .returning();
    return signup;
  }

  async getWorkforceRecruiterMeetupEventSignups(filters?: {
    eventId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ signups: (WorkforceRecruiterMeetupEventSignup & { user?: Pick<User, 'firstName' | 'lastName' | 'email'> | null })[], total: number }> {
    let query = db
      .select({
        id: workforceRecruiterMeetupEventSignups.id,
        eventId: workforceRecruiterMeetupEventSignups.eventId,
        userId: workforceRecruiterMeetupEventSignups.userId,
        location: workforceRecruiterMeetupEventSignups.location,
        preferredMeetupDate: workforceRecruiterMeetupEventSignups.preferredMeetupDate,
        availability: workforceRecruiterMeetupEventSignups.availability,
        whyInterested: workforceRecruiterMeetupEventSignups.whyInterested,
        additionalComments: workforceRecruiterMeetupEventSignups.additionalComments,
        createdAt: workforceRecruiterMeetupEventSignups.createdAt,
        updatedAt: workforceRecruiterMeetupEventSignups.updatedAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(workforceRecruiterMeetupEventSignups)
      .leftJoin(users, eq(workforceRecruiterMeetupEventSignups.userId, users.id));

    const conditions = [];
    if (filters?.eventId) {
      conditions.push(eq(workforceRecruiterMeetupEventSignups.eventId, filters.eventId));
    }
    if (filters?.userId) {
      conditions.push(eq(workforceRecruiterMeetupEventSignups.userId, filters.userId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(workforceRecruiterMeetupEventSignups.createdAt)) as any;

    const allSignups = await query;
    const total = allSignups.length;

    // Apply pagination
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const signups = allSignups.slice(offset, offset + limit);

    // Transform the results to include user data
    const transformedSignups = signups.map((signup) => ({
      id: signup.id,
      eventId: signup.eventId,
      userId: signup.userId,
      location: signup.location,
      preferredMeetupDate: signup.preferredMeetupDate,
      availability: signup.availability,
      whyInterested: signup.whyInterested,
      additionalComments: signup.additionalComments,
      createdAt: signup.createdAt,
      updatedAt: signup.updatedAt,
      user: signup.userFirstName || signup.userLastName || signup.userEmail ? {
        firstName: signup.userFirstName || null,
        lastName: signup.userLastName || null,
        email: signup.userEmail || null,
      } : null,
    }));

    return { signups: transformedSignups as any, total };
  }

  async getWorkforceRecruiterMeetupEventSignupCount(eventId: string): Promise<number> {
    const signups = await db
      .select()
      .from(workforceRecruiterMeetupEventSignups)
      .where(eq(workforceRecruiterMeetupEventSignups.eventId, eventId));
    return signups.length;
  }

  async getUserMeetupEventSignup(eventId: string, userId: string): Promise<WorkforceRecruiterMeetupEventSignup | undefined> {
    const [signup] = await db
      .select()
      .from(workforceRecruiterMeetupEventSignups)
      .where(
        and(
          eq(workforceRecruiterMeetupEventSignups.eventId, eventId),
          eq(workforceRecruiterMeetupEventSignups.userId, userId)
        )
      )
      .limit(1);
    return signup;
  }

  async updateWorkforceRecruiterMeetupEventSignup(id: string, signupData: Partial<InsertWorkforceRecruiterMeetupEventSignup>): Promise<WorkforceRecruiterMeetupEventSignup> {
    // Convert Date to string for date fields
    const updateData: any = { ...signupData };
    if (updateData.preferredMeetupDate !== undefined && updateData.preferredMeetupDate !== null && updateData.preferredMeetupDate instanceof Date) {
      updateData.preferredMeetupDate = updateData.preferredMeetupDate.toISOString().split('T')[0];
    }
    const [signup] = await db
      .update(workforceRecruiterMeetupEventSignups)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterMeetupEventSignups.id, id))
      .returning();
    return signup;
  }

  async deleteWorkforceRecruiterMeetupEventSignup(id: string): Promise<void> {
    await db.delete(workforceRecruiterMeetupEventSignups).where(eq(workforceRecruiterMeetupEventSignups.id, id));
  }

  // Helper function to infer sectors from skills using the skills database
  private inferSectorsFromSkills(
    profileSkills: string[],
    skillNameToSectorsMap: Map<string, Set<string>>
  ): Set<string> {
    const inferredSectors = new Set<string>();
    for (const skill of profileSkills) {
      // Use normalizeSkillName to match how skillNameToSectorsMap keys are built
      // This ensures "React.js", "React JS", and "React" all match correctly
      const normalizedSkillName = this.normalizeSkillName(skill);
      const sectors = skillNameToSectorsMap.get(normalizedSkillName);
      if (sectors) {
        for (const sector of sectors) {
          inferredSectors.add(sector);
        }
      }
    }
    return inferredSectors;
  }

  /**
   * Normalize skill name for matching - handles variations in punctuation, spacing, and case
   * Examples:
   * - "React.js" -> "reactjs"
   * - "React JS" -> "reactjs"
   * - "CPR Certification" -> "cprcertification"
   * - "JavaScript" -> "javascript"
   */
  private normalizeSkillName(skill: string): string {
    return skill
      .toLowerCase()
      .trim()
      // Remove common punctuation
      .replace(/[.,;:!?()[\]{}'"]/g, '')
      // Normalize whitespace to single space
      .replace(/\s+/g, ' ')
      // Remove all spaces for comparison
      .replace(/\s/g, '');
  }

  /**
   * Check if a profile skill matches an occupation skill
   * Handles variations like "React.js" matching "React" or "React JS"
   */
  private skillMatches(profileSkill: string, occupationSkills: Set<string>): boolean {
    const normalizedProfileSkill = this.normalizeSkillName(profileSkill);
    
    // Skip empty or very short skills (less than 2 chars after normalization)
    if (normalizedProfileSkill.length < 2) {
      return false;
    }
    
    // First try exact match after normalization
    for (const occSkill of occupationSkills) {
      const normalizedOccSkill = this.normalizeSkillName(occSkill);
      if (normalizedProfileSkill === normalizedOccSkill) {
        return true;
      }
    }
    
    // Then try partial matches (one contains the other)
    // This handles cases like "React.js" matching "React" or vice versa
    // But we need to be more strict to avoid false positives
    
    // Common words that shouldn't match via partial matching (too generic)
    // These are common English words that could match incorrectly
    const commonWords = new Set(['and', 'or', 'the', 'for', 'with', 'from', 'that', 'this', 'have', 'been', 'are', 'was', 'were', 'has', 'had', 'will', 'can', 'may', 'not', 'but', 'all', 'any', 'one', 'two', 'use', 'get', 'set', 'run', 'end', 'new', 'old', 'big', 'small', 'high', 'low', 'top', 'out', 'off', 'on', 'in', 'at', 'to', 'of', 'is', 'it', 'as', 'be', 'do', 'if', 'up', 'so', 'no', 'go', 'my', 'we', 'he', 'she', 'him', 'her', 'his', 'its', 'our', 'your', 'their', 'they', 'them', 'these', 'those', 'what', 'when', 'where', 'which', 'who', 'why', 'how', 'much', 'many', 'more', 'most', 'some', 'such', 'only', 'just', 'also', 'very', 'well', 'now', 'then', 'here', 'there', 'back', 'down', 'over', 'under', 'again', 'once', 'twice', 'first', 'last', 'next', 'other', 'each', 'every', 'both', 'same', 'different', 'own']);
    
    // Skip partial matching if the skill is a common word
    if (commonWords.has(normalizedProfileSkill)) {
      return false;
    }
    
    for (const occSkill of occupationSkills) {
      const normalizedOccSkill = this.normalizeSkillName(occSkill);
      
      // Skip if either skill is a common word
      if (commonWords.has(normalizedOccSkill)) {
        continue;
      }
      
      // Check if either skill contains the other (after normalization)
      const shorterLength = Math.min(normalizedProfileSkill.length, normalizedOccSkill.length);
      const longerLength = Math.max(normalizedProfileSkill.length, normalizedOccSkill.length);
      
      // For partial matching, we need to be more careful:
      // 1. Require at least 3 characters for the shorter skill (allows "IT" to match "IT Support")
      // 2. But if the shorter skill is very short (3-4 chars), require it to be at least 50% of longer skill
      // 3. If the shorter skill is longer (5+ chars), allow 30% ratio (allows "React" to match "React.js")
      if (shorterLength >= 3 && longerLength > 0) {
        const lengthRatio = shorterLength / longerLength;
        
        // Determine minimum ratio based on shorter skill length
        let minRatio = 0.3; // Default for longer skills (5+ chars)
        if (shorterLength <= 4) {
          minRatio = 0.5; // Stricter for very short skills (3-4 chars)
        }
        
        if (lengthRatio >= minRatio) {
          if (normalizedProfileSkill.includes(normalizedOccSkill) || 
              normalizedOccSkill.includes(normalizedProfileSkill)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  async getWorkforceRecruiterSummaryReport(): Promise<{
    totalWorkforceTarget: number;
    totalCurrentRecruited: number;
    percentRecruited: number;
    sectorBreakdown: Array<{ sector: string; target: number; recruited: number; percent: number }>;
    skillLevelBreakdown: Array<{ skillLevel: string; target: number; recruited: number; percent: number }>;
    annualTrainingGap: Array<{ occupationId: string; occupationTitle: string; sector: string; target: number; actual: number; gap: number }>;
  }> {
    // Get all occupations (these define the targets)
    const occupations = await db.select().from(workforceRecruiterOccupations);
    const totalWorkforceTarget = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);

    // Get all Directory profiles with skills (these are the recruited people)
    // A Directory profile = recruitment into the skills economy
    const allDirectoryProfiles = await db
      .select()
      .from(directoryProfiles)
      .where(sql`array_length(${directoryProfiles.skills}, 1) > 0`);
    
    const totalCurrentRecruited = allDirectoryProfiles.length;
    const percentRecruited = totalWorkforceTarget > 0 ? (totalCurrentRecruited / totalWorkforceTarget) * 100 : 0;

    // Build lookup maps for matching Directory profiles to occupations
    // Get all sectors and job titles in one query
    const allSectors = await db.select().from(skillsSectors);
    const allJobTitles = await db.select().from(skillsJobTitles);
    const sectorIdToNameMap = new Map<string, string>();
    for (const sector of allSectors) {
      sectorIdToNameMap.set(sector.id, sector.name);
    }
    const jobTitleToSectorMap = new Map<string, string>();
    const jobTitleIdToNameMap = new Map<string, string>();
    for (const jobTitle of allJobTitles) {
      jobTitleIdToNameMap.set(jobTitle.id, jobTitle.name);
      const sectorName = sectorIdToNameMap.get(jobTitle.sectorId);
      if (sectorName) {
        jobTitleToSectorMap.set(jobTitle.id, sectorName);
      }
    }

    // Get all skills for all job titles
    const allSkills = await db.select().from(skillsSkills);
    const jobTitleSkillsMap = new Map<string, Set<string>>();
    // Map skill name (normalized) -> Set of sector names (for direct skill->sector lookup)
    const skillNameToSectorsMap = new Map<string, Set<string>>();
    for (const skill of allSkills) {
      if (!jobTitleSkillsMap.has(skill.jobTitleId)) {
        jobTitleSkillsMap.set(skill.jobTitleId, new Set());
      }
      // Normalize skill name for consistent matching (handles punctuation, spacing variations)
      const normalizedSkillName = this.normalizeSkillName(skill.name);
      jobTitleSkillsMap.get(skill.jobTitleId)!.add(normalizedSkillName);
      
      // Build skill -> sector mapping (using normalized skill name)
      const jobTitleSector = jobTitleToSectorMap.get(skill.jobTitleId);
      if (jobTitleSector) {
        if (!skillNameToSectorsMap.has(normalizedSkillName)) {
          skillNameToSectorsMap.set(normalizedSkillName, new Set());
        }
        skillNameToSectorsMap.get(normalizedSkillName)!.add(jobTitleSector);
      }
    }

    // Build occupation matching maps
    const occupationSkillsMap = new Map<string, Set<string>>();
    const occupationSectorMap = new Map<string, string>();
    const occupationJobTitleMap = new Map<string, string>();
    for (const occ of occupations) {
      // Skip occupations without valid sectors
      if (!occ.sector || occ.sector.trim().length === 0) {
        continue;
      }
      occupationSectorMap.set(occ.id, occ.sector);
      if (occ.jobTitleId) {
        const jobTitleName = jobTitleIdToNameMap.get(occ.jobTitleId);
        if (jobTitleName) {
          occupationJobTitleMap.set(occ.id, jobTitleName);
        }
        if (jobTitleSkillsMap.has(occ.jobTitleId)) {
          occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(occ.jobTitleId)!);
        }
      } else {
        // Fallback: Try to match by occupation title name if jobTitleId is missing
        // This helps with backward compatibility for existing occupations
        const normalizedOccTitle = occ.occupationTitle.toLowerCase().trim();
        for (const [jobTitleId, jobTitleName] of jobTitleIdToNameMap.entries()) {
          const normalizedJobTitle = jobTitleName.toLowerCase().trim();
          if (normalizedOccTitle === normalizedJobTitle) {
            // Found matching job title by name - use its skills
            occupationJobTitleMap.set(occ.id, jobTitleName);
            if (jobTitleSkillsMap.has(jobTitleId)) {
              occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(jobTitleId)!);
            }
            break;
          }
        }
      }
    }

    // Match Directory profiles to occupations
    // A profile matches an occupation if:
    // 1. Profile has a sector that matches occupation sector, OR
    // 2. Profile has a job title that matches occupation job title, OR
    // 3. Profile has a skill that matches occupation skills
    const profileToOccupationsMap = new Map<string, Set<string>>(); // profileId -> Set of occupationIds
    const occupationToProfilesMap = new Map<string, Set<string>>(); // occupationId -> Set of profileIds
    
    for (const profile of allDirectoryProfiles) {
      if (!profile.skills || profile.skills.length === 0) continue;
      
      const profileId = profile.id;
      const profileSectors = (profile.sectors || []).map(s => s.toLowerCase().trim());
      const profileJobTitles = (profile.jobTitles || []).map(jt => jt.toLowerCase().trim());
      const profileSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
      
      const matchingOccupations = new Set<string>();
      
      for (const occ of occupations) {
        const occSector = (occ.sector ? occ.sector.toLowerCase() : "").trim();
        const occJobTitle = occupationJobTitleMap.get(occ.id)?.toLowerCase().trim() || "";
        const occSkills = occupationSkillsMap.get(occ.id) || new Set<string>();
        
        // Check if profile matches this occupation
        // Sector matching: case-insensitive, also check if profile sector contains occupation sector or vice versa
        const matchesSector = profileSectors.some(ps => {
          const normalizedPs = ps.trim();
          return normalizedPs === occSector || 
                 normalizedPs.includes(occSector) || 
                 occSector.includes(normalizedPs);
        });
        // Job title matching: exact case-insensitive match
        const matchesJobTitle = profileJobTitles.some(pjt => {
          const normalizedPjt = pjt.trim();
          return normalizedPjt === occJobTitle;
        });
        // Skill matching: improved normalization to handle variations
        const matchesSkill = profileSkills.some(ps => {
          return this.skillMatches(ps, occSkills);
        });
        
        if (matchesSector || matchesJobTitle || matchesSkill) {
          matchingOccupations.add(occ.id);
          if (!occupationToProfilesMap.has(occ.id)) {
            occupationToProfilesMap.set(occ.id, new Set());
          }
          occupationToProfilesMap.get(occ.id)!.add(profileId);
        }
      }
      
      if (matchingOccupations.size > 0) {
        profileToOccupationsMap.set(profileId, matchingOccupations);
      }
    }

    // Sector breakdown - count Directory profiles by sector
    // Use fractional counting: if a profile belongs to multiple sectors, divide the count
    // This ensures the sum of sector counts equals totalCurrentRecruited
    const sectorRecruitedMap = new Map<string, number>();
    for (const profile of allDirectoryProfiles) {
      const sectors = profile.sectors || [];
      const matchingOccs = profileToOccupationsMap.get(profile.id);
      
      if (sectors.length > 0) {
        // Profile has explicit sectors - use them
        // Count fractionally: divide by number of sectors to avoid double-counting
        const countPerSector = 1 / sectors.length;
        for (const sector of sectors) {
          // Normalize sector name (trim, capitalize first letter)
          const normalizedSector = sector.trim();
          sectorRecruitedMap.set(normalizedSector, (sectorRecruitedMap.get(normalizedSector) || 0) + countPerSector);
        }
      } else if (matchingOccs && matchingOccs.size > 0) {
        // Profile has no explicit sectors but matches occupations - infer from occupations
        // Get unique sectors from matching occupations
        const inferredSectors = new Set<string>();
        for (const occId of matchingOccs) {
          const sector = occupationSectorMap.get(occId);
          if (sector) {
            inferredSectors.add(sector);
          }
        }
        
        if (inferredSectors.size > 0) {
          // Count fractionally across inferred sectors
          const countPerSector = 1 / inferredSectors.size;
          for (const sector of inferredSectors) {
            sectorRecruitedMap.set(sector, (sectorRecruitedMap.get(sector) || 0) + countPerSector);
          }
        } else {
          // No valid sectors from matching occupations - try to infer from skills database
          const sectorsFromSkills = this.inferSectorsFromSkills(profile.skills || [], skillNameToSectorsMap);
          if (sectorsFromSkills.size > 0) {
            const countPerSector = 1 / sectorsFromSkills.size;
            for (const sector of sectorsFromSkills) {
              sectorRecruitedMap.set(sector, (sectorRecruitedMap.get(sector) || 0) + countPerSector);
            }
          }
          // If still no sectors found, skip this profile (don't count as Unknown)
        }
      } else {
        // Profile has no sectors and doesn't match any occupations - infer from skills database
        const sectorsFromSkills = this.inferSectorsFromSkills(profile.skills || [], skillNameToSectorsMap);
        if (sectorsFromSkills.size > 0) {
          // Count fractionally across inferred sectors
          const countPerSector = 1 / sectorsFromSkills.size;
          for (const sector of sectorsFromSkills) {
            sectorRecruitedMap.set(sector, (sectorRecruitedMap.get(sector) || 0) + countPerSector);
          }
        }
        // If no sectors found from skills, skip this profile (don't count as Unknown)
      }
    }

    // Sector breakdown - combine targets from occupations with recruited from Directory
    const sectorTargetMap = new Map<string, number>();
    occupations.forEach(occ => {
      // Only count occupations with valid sectors
      if (occ.sector && occ.sector.trim().length > 0) {
        sectorTargetMap.set(occ.sector, (sectorTargetMap.get(occ.sector) || 0) + occ.headcountTarget);
      }
    });

    const sectorBreakdown = Array.from(new Set([
      ...sectorTargetMap.keys(),
      ...sectorRecruitedMap.keys()
    ]))
    .filter(sector => sector !== "Unknown") // Filter out "Unknown" sector
    .map(sector => ({
      sector,
      target: sectorTargetMap.get(sector) || 0,
      recruited: sectorRecruitedMap.get(sector) || 0,
      percent: (sectorTargetMap.get(sector) || 0) > 0 
        ? ((sectorRecruitedMap.get(sector) || 0) / (sectorTargetMap.get(sector) || 0)) * 100 
        : 0,
    })).sort((a, b) => b.recruited - a.recruited);

    // Skill level breakdown - infer skill level from matching occupations
    const skillLevelRecruitedMap = new Map<string, number>();
    const skillLevelTargetMap = new Map<string, number>();
    
    // Count targets by skill level
    occupations.forEach(occ => {
      skillLevelTargetMap.set(
        occ.skillLevel,
        (skillLevelTargetMap.get(occ.skillLevel) || 0) + occ.headcountTarget
      );
    });
    
    // Count recruited by skill level (from Directory profiles matching occupations)
    for (const profile of allDirectoryProfiles) {
      const matchingOccs = profileToOccupationsMap.get(profile.id);
      if (matchingOccs && matchingOccs.size > 0) {
        // Count profile once per unique skill level it matches
        const skillLevels = new Set<string>();
        for (const occId of matchingOccs) {
          const occ = occupations.find(o => o.id === occId);
          if (occ) {
            skillLevels.add(occ.skillLevel);
          }
        }
        for (const skillLevel of skillLevels) {
          skillLevelRecruitedMap.set(
            skillLevel,
            (skillLevelRecruitedMap.get(skillLevel) || 0) + 1
          );
        }
      } else {
        // Profile doesn't match any occupation - count as "Unknown"
        skillLevelRecruitedMap.set(
          "Unknown",
          (skillLevelRecruitedMap.get("Unknown") || 0) + 1
        );
      }
    }

    // Helper function to normalize skill level values (map old to new)
    const normalizeSkillLevel = (skillLevel: string): string => {
      switch (skillLevel) {
        case "Low":
          return "Foundational";
        case "Medium":
          return "Intermediate";
        case "High":
          return "Advanced";
        default:
          return skillLevel; // Keep "Unknown" and new values as-is
      }
    };

    // Normalize skill levels in maps before creating breakdown
    const normalizedTargetMap = new Map<string, number>();
    const normalizedRecruitedMap = new Map<string, number>();
    
    skillLevelTargetMap.forEach((value, key) => {
      const normalized = normalizeSkillLevel(key);
      normalizedTargetMap.set(normalized, (normalizedTargetMap.get(normalized) || 0) + value);
    });
    
    skillLevelRecruitedMap.forEach((value, key) => {
      const normalized = normalizeSkillLevel(key);
      normalizedRecruitedMap.set(normalized, (normalizedRecruitedMap.get(normalized) || 0) + value);
    });

    const skillLevelBreakdown = Array.from(new Set([
      ...normalizedTargetMap.keys(),
      ...normalizedRecruitedMap.keys()
    ])).map(skillLevel => ({
      skillLevel,
      target: normalizedTargetMap.get(skillLevel) || 0,
      recruited: normalizedRecruitedMap.get(skillLevel) || 0,
      percent: (normalizedTargetMap.get(skillLevel) || 0) > 0
        ? ((normalizedRecruitedMap.get(skillLevel) || 0) / (normalizedTargetMap.get(skillLevel) || 0)) * 100
        : 0,
    }))
    // Filter out "Unknown" skill level when target is 0 to avoid division by zero display
    .filter(item => !(item.skillLevel === "Unknown" && item.target === 0))
    .sort((a, b) => b.recruited - a.recruited);

    // Annual training gap - count Directory profiles matching each occupation
    const annualTrainingGap = occupations
      .filter(occ => occ.sector && occ.sector.trim().length > 0) // Only include occupations with valid sectors
      .map(occ => {
        const directoryCount = occupationToProfilesMap.get(occ.id)?.size || 0;
        return {
          occupationId: occ.id,
          occupationTitle: occ.occupationTitle || "Unnamed Occupation",
          sector: occ.sector, // Sector is guaranteed to exist due to filter above
          target: occ.annualTrainingTarget,
          actual: directoryCount,
          gap: occ.annualTrainingTarget - directoryCount,
        };
      })
      .filter(item => item.target > 0) // Show all occupations with training targets
      .sort((a, b) => b.gap - a.gap) // Sort by gap descending (largest gaps first)
      .slice(0, 10); // Top 10

    return {
      totalWorkforceTarget,
      totalCurrentRecruited,
      percentRecruited,
      sectorBreakdown,
      skillLevelBreakdown,
      annualTrainingGap,
    };
  }

  async getWorkforceRecruiterSkillLevelDetail(skillLevel: string): Promise<{
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
  }> {
    // Helper function to normalize skill level values (map old to new)
    const normalizeSkillLevel = (level: string): string => {
      switch (level) {
        case "Low":
          return "Foundational";
        case "Medium":
          return "Intermediate";
        case "High":
          return "Advanced";
        default:
          return level; // Keep "Unknown" and new values as-is
      }
    };

    // Normalize the incoming skill level parameter
    const normalizedSkillLevel = normalizeSkillLevel(skillLevel);
    // Reuse the same matching logic from summary report
    const occupations = await db.select().from(workforceRecruiterOccupations);
    const allDirectoryProfiles = await db
      .select()
      .from(directoryProfiles)
      .where(sql`array_length(${directoryProfiles.skills}, 1) > 0`);
    
    // Fetch user data for profiles that have userId
    const userIds = allDirectoryProfiles.map(p => p.userId).filter((id): id is string => id !== null);
    const userDataMap = new Map<string, { firstName: string | null; lastName: string | null }>();
    if (userIds.length > 0) {
      const userData = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(inArray(users.id, userIds));
      for (const user of userData) {
        userDataMap.set(user.id, { firstName: user.firstName, lastName: user.lastName });
      }
    }

    // Build lookup maps (same as summary report)
    const allSectors = await db.select().from(skillsSectors);
    const allJobTitles = await db.select().from(skillsJobTitles);
    const sectorIdToNameMap = new Map<string, string>();
    for (const sector of allSectors) {
      sectorIdToNameMap.set(sector.id, sector.name);
    }
    const jobTitleToSectorMap = new Map<string, string>();
    const jobTitleIdToNameMap = new Map<string, string>();
    for (const jobTitle of allJobTitles) {
      jobTitleIdToNameMap.set(jobTitle.id, jobTitle.name);
      const sectorName = sectorIdToNameMap.get(jobTitle.sectorId);
      if (sectorName) {
        jobTitleToSectorMap.set(jobTitle.id, sectorName);
      }
    }

    const allSkills = await db.select().from(skillsSkills);
    const jobTitleSkillsMap = new Map<string, Set<string>>();
    const skillNameToSectorsMap = new Map<string, Set<string>>();
    for (const skill of allSkills) {
      if (!jobTitleSkillsMap.has(skill.jobTitleId)) {
        jobTitleSkillsMap.set(skill.jobTitleId, new Set());
      }
      // Normalize skill name for consistent matching (handles punctuation, spacing variations)
      const normalizedSkillName = this.normalizeSkillName(skill.name);
      jobTitleSkillsMap.get(skill.jobTitleId)!.add(normalizedSkillName);
      
      const jobTitleSector = jobTitleToSectorMap.get(skill.jobTitleId);
      if (jobTitleSector) {
        if (!skillNameToSectorsMap.has(normalizedSkillName)) {
          skillNameToSectorsMap.set(normalizedSkillName, new Set());
        }
        skillNameToSectorsMap.get(normalizedSkillName)!.add(jobTitleSector);
      }
    }

    const occupationSkillsMap = new Map<string, Set<string>>();
    const occupationSectorMap = new Map<string, string>();
    const occupationJobTitleMap = new Map<string, string>();
    for (const occ of occupations) {
      // Skip occupations without valid sectors
      if (!occ.sector || occ.sector.trim().length === 0) {
        continue;
      }
      occupationSectorMap.set(occ.id, occ.sector);
      if (occ.jobTitleId) {
        const jobTitleName = jobTitleIdToNameMap.get(occ.jobTitleId);
        if (jobTitleName) {
          occupationJobTitleMap.set(occ.id, jobTitleName);
        }
        if (jobTitleSkillsMap.has(occ.jobTitleId)) {
          occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(occ.jobTitleId)!);
        }
      } else {
        // Fallback: Try to match by occupation title name if jobTitleId is missing
        // This helps with backward compatibility for existing occupations
        const normalizedOccTitle = occ.occupationTitle.toLowerCase().trim();
        for (const [jobTitleId, jobTitleName] of jobTitleIdToNameMap.entries()) {
          const normalizedJobTitle = jobTitleName.toLowerCase().trim();
          if (normalizedOccTitle === normalizedJobTitle) {
            // Found matching job title by name - use its skills
            occupationJobTitleMap.set(occ.id, jobTitleName);
            if (jobTitleSkillsMap.has(jobTitleId)) {
              occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(jobTitleId)!);
            }
            break;
          }
        }
      }
    }

    // Match profiles and track detailed matching information
    const profileToOccupationsMap = new Map<string, Set<string>>();
    const profileMatchReasons = new Map<string, Map<string, string>>(); // profileId -> occupationId -> reason
    
    for (const profile of allDirectoryProfiles) {
      if (!profile.skills || profile.skills.length === 0) continue;
      
      const profileId = profile.id;
      const profileSectors = (profile.sectors || []).map(s => s.toLowerCase().trim());
      const profileJobTitles = (profile.jobTitles || []).map(jt => jt.toLowerCase().trim());
      const profileSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
      
      const matchingOccupations = new Set<string>();
      const matchReasons = new Map<string, string>();
      
      for (const occ of occupations) {
        const occSector = (occ.sector ? occ.sector.toLowerCase() : "").trim();
        const occJobTitle = occupationJobTitleMap.get(occ.id)?.toLowerCase().trim() || "";
        const occSkills = occupationSkillsMap.get(occ.id) || new Set<string>();
        
        let matchReason = "";
        const matchesSector = profileSectors.some(ps => {
          const normalizedPs = ps.trim();
          return normalizedPs === occSector || 
                 normalizedPs.includes(occSector) || 
                 occSector.includes(normalizedPs);
        });
        const matchesJobTitle = profileJobTitles.some(pjt => {
          const normalizedPjt = pjt.trim();
          return normalizedPjt === occJobTitle;
        });
        const matchesSkill = profileSkills.some(ps => {
          return this.skillMatches(ps, occSkills);
        });
        
        if (matchesSector) {
          matchReason = "sector";
        } else if (matchesJobTitle) {
          matchReason = "jobTitle";
        } else if (matchesSkill) {
          matchReason = "skill";
        }
        
        if (matchesSector || matchesJobTitle || matchesSkill) {
          matchingOccupations.add(occ.id);
          matchReasons.set(occ.id, matchReason);
        }
      }
      
      if (matchingOccupations.size > 0) {
        profileToOccupationsMap.set(profileId, matchingOccupations);
        profileMatchReasons.set(profileId, matchReasons);
      }
    }

    // Calculate target for this skill level (normalize both sides for comparison)
    const target = occupations
      .filter(occ => normalizeSkillLevel(occ.skillLevel) === normalizedSkillLevel)
      .reduce((sum, occ) => sum + occ.headcountTarget, 0);

    // Get all profiles in this skill level
    const profilesInSkillLevel: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string;
    }> = [];

    for (const profile of allDirectoryProfiles) {
      const matchingOccs = profileToOccupationsMap.get(profile.id);
      let belongsToSkillLevel = false;
      const relevantOccupations: Array<{ id: string; title: string; sector: string }> = [];
      let primaryMatchReason = "none";

      if (matchingOccs && matchingOccs.size > 0) {
        // Check if profile matches any occupation with this skill level (normalize for comparison)
        for (const occId of matchingOccs) {
          const occ = occupations.find(o => o.id === occId);
          if (occ && normalizeSkillLevel(occ.skillLevel) === normalizedSkillLevel) {
            belongsToSkillLevel = true;
            relevantOccupations.push({
              id: occ.id,
              title: occ.occupationTitle,
              sector: occ.sector,
            });
            const reason = profileMatchReasons.get(profile.id)?.get(occId);
            if (reason && primaryMatchReason === "none") {
              primaryMatchReason = reason;
            }
          }
        }
      } else if (normalizedSkillLevel === "Unknown") {
        // Profile doesn't match any occupation
        belongsToSkillLevel = true;
        primaryMatchReason = "none";
      }

      if (belongsToSkillLevel) {
        // Get display name from firstName/lastName via user lookup
        let displayName = "Unknown";
        if (profile.userId) {
          const userData = userDataMap.get(profile.userId);
          if (userData?.firstName && userData?.lastName) {
            displayName = `${userData.firstName} ${userData.lastName}`;
          } else if (userData?.firstName) {
            displayName = userData.firstName;
          }
        }

        profilesInSkillLevel.push({
          profileId: profile.id,
          displayName,
          skills: profile.skills || [],
          sectors: profile.sectors || [],
          jobTitles: profile.jobTitles || [],
          matchingOccupations: relevantOccupations,
          matchReason: primaryMatchReason,
        });
      }
    }

    const recruited = profilesInSkillLevel.length;
    const percent = target > 0 ? (recruited / target) * 100 : 0;

    return {
      skillLevel: normalizedSkillLevel, // Return normalized skill level
      target,
      recruited,
      percent,
      profiles: profilesInSkillLevel,
    };
  }

  async getWorkforceRecruiterSectorDetail(sector: string): Promise<{
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
      matchReason: string; // "sector", "jobTitle", "skill", or "none"
    }>;
  }> {
    // Reuse the same matching logic from summary report
    const occupations = await db.select().from(workforceRecruiterOccupations);
    const allDirectoryProfiles = await db
      .select()
      .from(directoryProfiles)
      .where(sql`array_length(${directoryProfiles.skills}, 1) > 0`);

    // Build lookup maps (same as summary report)
    const allSectors = await db.select().from(skillsSectors);
    const allJobTitles = await db.select().from(skillsJobTitles);
    const sectorIdToNameMap = new Map<string, string>();
    for (const s of allSectors) {
      sectorIdToNameMap.set(s.id, s.name);
    }
    const jobTitleToSectorMap = new Map<string, string>();
    const jobTitleIdToNameMap = new Map<string, string>();
    for (const jobTitle of allJobTitles) {
      jobTitleIdToNameMap.set(jobTitle.id, jobTitle.name);
      const sectorName = sectorIdToNameMap.get(jobTitle.sectorId);
      if (sectorName) {
        jobTitleToSectorMap.set(jobTitle.id, sectorName);
      }
    }

    const allSkills = await db.select().from(skillsSkills);
    const jobTitleSkillsMap = new Map<string, Set<string>>();
    const skillNameToSectorsMap = new Map<string, Set<string>>();
    for (const skill of allSkills) {
      if (!jobTitleSkillsMap.has(skill.jobTitleId)) {
        jobTitleSkillsMap.set(skill.jobTitleId, new Set());
      }
      // Normalize skill name for consistent matching (handles punctuation, spacing variations)
      const normalizedSkillName = this.normalizeSkillName(skill.name);
      jobTitleSkillsMap.get(skill.jobTitleId)!.add(normalizedSkillName);
      
      const jobTitleSector = jobTitleToSectorMap.get(skill.jobTitleId);
      if (jobTitleSector) {
        if (!skillNameToSectorsMap.has(normalizedSkillName)) {
          skillNameToSectorsMap.set(normalizedSkillName, new Set());
        }
        skillNameToSectorsMap.get(normalizedSkillName)!.add(jobTitleSector);
      }
    }

    const occupationSkillsMap = new Map<string, Set<string>>();
    const occupationSectorMap = new Map<string, string>();
    const occupationJobTitleMap = new Map<string, string>();
    for (const occ of occupations) {
      // Skip occupations without valid sectors
      if (!occ.sector || occ.sector.trim().length === 0) {
        continue;
      }
      occupationSectorMap.set(occ.id, occ.sector);
      if (occ.jobTitleId) {
        const jobTitleName = jobTitleIdToNameMap.get(occ.jobTitleId);
        if (jobTitleName) {
          occupationJobTitleMap.set(occ.id, jobTitleName);
        }
        if (jobTitleSkillsMap.has(occ.jobTitleId)) {
          occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(occ.jobTitleId)!);
        }
      } else {
        // Fallback: Try to match by occupation title name if jobTitleId is missing
        const normalizedOccTitle = occ.occupationTitle.toLowerCase().trim();
        for (const [jobTitleId, jobTitleName] of jobTitleIdToNameMap.entries()) {
          const normalizedJobTitle = jobTitleName.toLowerCase().trim();
          if (normalizedOccTitle === normalizedJobTitle) {
            occupationJobTitleMap.set(occ.id, jobTitleName);
            if (jobTitleSkillsMap.has(jobTitleId)) {
              occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(jobTitleId)!);
            }
            break;
          }
        }
      }
    }

    // Filter occupations by sector (case-insensitive)
    const normalizedSector = sector.toLowerCase().trim();
    const sectorOccupations = occupations.filter(occ => {
      // Skip occupations without valid sectors
      if (!occ.sector || occ.sector.trim().length === 0) {
        return false;
      }
      const occSector = occ.sector.toLowerCase().trim();
      return occSector === normalizedSector;
    });

    // Calculate target for this sector
    const target = sectorOccupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);

    // Match profiles and track detailed matching information
    const profileToOccupationsMap = new Map<string, Set<string>>();
    const profileMatchReasons = new Map<string, Map<string, string>>(); // profileId -> occupationId -> reason
    
    for (const profile of allDirectoryProfiles) {
      if (!profile.skills || profile.skills.length === 0) continue;
      
      const profileId = profile.id;
      const profileSectors = (profile.sectors || []).map(s => s.toLowerCase().trim());
      const profileJobTitles = (profile.jobTitles || []).map(jt => jt.toLowerCase().trim());
      const profileSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
      
      const matchingOccupations = new Set<string>();
      const matchReasons = new Map<string, string>();
      
      for (const occ of sectorOccupations) {
        const occSector = (occ.sector ? occ.sector.toLowerCase() : "").trim();
        const occJobTitle = occupationJobTitleMap.get(occ.id)?.toLowerCase().trim() || "";
        const occSkills = occupationSkillsMap.get(occ.id) || new Set<string>();
        
        let matchReason = "";
        const matchesSector = profileSectors.some(ps => {
          const normalizedPs = ps.trim();
          return normalizedPs === occSector || 
                 normalizedPs.includes(occSector) || 
                 occSector.includes(normalizedPs);
        });
        const matchesJobTitle = profileJobTitles.some(pjt => {
          const normalizedPjt = pjt.trim();
          return normalizedPjt === occJobTitle;
        });
        const matchesSkill = profileSkills.some(ps => {
          return this.skillMatches(ps, occSkills);
        });
        
        if (matchesSector) {
          matchReason = "sector";
        } else if (matchesJobTitle) {
          matchReason = "jobTitle";
        } else if (matchesSkill) {
          matchReason = "skill";
        }
        
        if (matchesSector || matchesJobTitle || matchesSkill) {
          matchingOccupations.add(occ.id);
          matchReasons.set(occ.id, matchReason);
        }
      }
      
      if (matchingOccupations.size > 0) {
        profileToOccupationsMap.set(profileId, matchingOccupations);
        profileMatchReasons.set(profileId, matchReasons);
      }
    }

    // Fetch user data for profiles that have userId
    const userIds = allDirectoryProfiles.map(p => p.userId).filter((id): id is string => id !== null);
    const userDataMap = new Map<string, { firstName: string | null; lastName: string | null }>();
    if (userIds.length > 0) {
      const userData = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(inArray(users.id, userIds));
      for (const user of userData) {
        userDataMap.set(user.id, { firstName: user.firstName, lastName: user.lastName });
      }
    }

    // Get all profiles in this sector
    const profilesInSector: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string;
    }> = [];

    for (const profile of allDirectoryProfiles) {
      const matchingOccs = profileToOccupationsMap.get(profile.id);
      const relevantOccupations: Array<{ id: string; title: string; sector: string }> = [];
      let primaryMatchReason = "none";

      if (matchingOccs && matchingOccs.size > 0) {
        for (const occId of matchingOccs) {
          const occ = sectorOccupations.find(o => o.id === occId);
          if (occ) {
            relevantOccupations.push({
              id: occ.id,
              title: occ.occupationTitle,
              sector: occ.sector,
            });
            const reason = profileMatchReasons.get(profile.id)?.get(occId);
            if (reason && primaryMatchReason === "none") {
              primaryMatchReason = reason;
            }
          }
        }
      }

      if (relevantOccupations.length > 0) {
        // Get display name from firstName/lastName via user lookup
        let displayName = "Unknown";
        if (profile.userId) {
          const userData = userDataMap.get(profile.userId);
          if (userData?.firstName && userData?.lastName) {
            displayName = `${userData.firstName} ${userData.lastName}`;
          } else if (userData?.firstName) {
            displayName = userData.firstName;
          }
        }

        profilesInSector.push({
          profileId: profile.id,
          displayName,
          skills: profile.skills || [],
          sectors: profile.sectors || [],
          jobTitles: profile.jobTitles || [],
          matchingOccupations: relevantOccupations,
          matchReason: primaryMatchReason,
        });
      }
    }

    const recruited = profilesInSector.length;
    const percent = target > 0 ? (recruited / target) * 100 : 0;

    // Count job titles in this sector
    // Approach: Show all job titles from occupations in this sector, and count how many profiles match each
    const jobTitleCounts = new Map<string, { id: string; name: string; count: number }>();
    
    // First, initialize all job titles from occupations in this sector (even if count is 0)
    for (const occ of sectorOccupations) {
      if (occ.jobTitleId) {
        const jobTitleName = jobTitleIdToNameMap.get(occ.jobTitleId);
        if (jobTitleName && !jobTitleCounts.has(occ.jobTitleId)) {
          jobTitleCounts.set(occ.jobTitleId, { id: occ.jobTitleId, name: jobTitleName, count: 0 });
        }
      } else {
        // Fallback: If occupation doesn't have jobTitleId, use occupation title as job title
        // Use occupation ID as a unique identifier for this "job title"
        const fallbackId = `occ_${occ.id}`;
        if (!jobTitleCounts.has(fallbackId)) {
          jobTitleCounts.set(fallbackId, { id: fallbackId, name: occ.occupationTitle, count: 0 });
        }
      }
    }
    
    // Count profiles by the job titles they match through occupations
    // Use a Set per profile to avoid double-counting if a profile matches multiple occupations with same job title
    const profileJobTitles = new Map<string, Set<string>>(); // profileId -> Set of jobTitleIds
    
    for (const profile of profilesInSector) {
      const matchingOccs = profileToOccupationsMap.get(profile.profileId);
      if (matchingOccs) {
        if (!profileJobTitles.has(profile.profileId)) {
          profileJobTitles.set(profile.profileId, new Set());
        }
        const profileJobTitleSet = profileJobTitles.get(profile.profileId)!;
        
        for (const occId of matchingOccs) {
          const occ = sectorOccupations.find(o => o.id === occId);
          if (occ) {
            if (occ.jobTitleId) {
              profileJobTitleSet.add(occ.jobTitleId);
            } else {
              // Use fallback ID for occupations without jobTitleId
              profileJobTitleSet.add(`occ_${occ.id}`);
            }
          }
        }
      }
      
      // Also check explicit job titles from profiles
      for (const jobTitleName of profile.jobTitles) {
        // Find job title ID by name
        for (const [jobTitleId, name] of jobTitleIdToNameMap.entries()) {
          if (name.toLowerCase().trim() === jobTitleName.toLowerCase().trim()) {
            // Check if this job title belongs to this sector
            const jobTitleSector = jobTitleToSectorMap.get(jobTitleId);
            if (jobTitleSector && jobTitleSector.toLowerCase().trim() === normalizedSector) {
              if (!profileJobTitles.has(profile.profileId)) {
                profileJobTitles.set(profile.profileId, new Set());
              }
              profileJobTitles.get(profile.profileId)!.add(jobTitleId);
              // Initialize if not already present
              if (!jobTitleCounts.has(jobTitleId)) {
                jobTitleCounts.set(jobTitleId, { id: jobTitleId, name, count: 0 });
              }
            }
            break;
          }
        }
      }
    }
    
    // Now count: each profile contributes 1 to each job title it matches
    for (const [profileId, jobTitleSet] of Array.from(profileJobTitles.entries())) {
      for (const jobTitleId of Array.from(jobTitleSet)) {
        if (jobTitleCounts.has(jobTitleId)) {
          jobTitleCounts.get(jobTitleId)!.count++;
        }
      }
    }

    // Count skills in this sector
    const skillCounts = new Map<string, number>();
    for (const profile of profilesInSector) {
      for (const skillName of profile.skills) {
        const normalizedSkill = this.normalizeSkillName(skillName);
        const skillSectors = skillNameToSectorsMap.get(normalizedSkill);
        if (skillSectors && skillSectors.has(sector)) {
          skillCounts.set(normalizedSkill, (skillCounts.get(normalizedSkill) || 0) + 1);
        }
      }
    }

    // Return job titles sorted by count (descending), then by name
    // Only show job titles if there are recruited profiles (count > 0)
    let jobTitlesToReturn: Array<{ id: string; name: string; count: number }> = [];
    
    if (recruited > 0) {
      const jobTitlesArray = Array.from(jobTitleCounts.values());
      jobTitlesToReturn = jobTitlesArray
        .filter(jt => jt.count > 0) // Only show job titles that have at least one match
        .sort((a, b) => {
          // Sort by count descending, then by name ascending
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return a.name.localeCompare(b.name);
        });
    }
    
    return {
      sector,
      target,
      recruited,
      percent,
      jobTitles: jobTitlesToReturn,
      skills: Array.from(skillCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      occupations: sectorOccupations.map(occ => ({
        id: occ.id,
        title: occ.occupationTitle,
        jobTitleId: occ.jobTitleId,
        headcountTarget: occ.headcountTarget,
        skillLevel: occ.skillLevel,
      })),
      profiles: profilesInSector,
    };
  }

  async createWorkforceRecruiterAnnouncement(announcementData: InsertWorkforceRecruiterAnnouncement): Promise<WorkforceRecruiterAnnouncement> {
    const [announcement] = await db
      .insert(workforceRecruiterAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(workforceRecruiterAnnouncements)
      .where(
        and(
          eq(workforceRecruiterAnnouncements.isActive, true),
          or(
            sql`${workforceRecruiterAnnouncements.expiresAt} IS NULL`,
            gte(workforceRecruiterAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(workforceRecruiterAnnouncements.createdAt));
  }

  async getAllWorkforceRecruiterAnnouncements(): Promise<WorkforceRecruiterAnnouncement[]> {
    return await db
      .select()
      .from(workforceRecruiterAnnouncements)
      .orderBy(desc(workforceRecruiterAnnouncements.createdAt));
  }

  async updateWorkforceRecruiterAnnouncement(id: string, announcementData: Partial<InsertWorkforceRecruiterAnnouncement>): Promise<WorkforceRecruiterAnnouncement> {
    const [announcement] = await db
      .update(workforceRecruiterAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateWorkforceRecruiterAnnouncement(id: string): Promise<WorkforceRecruiterAnnouncement> {
    const [announcement] = await db
      .update(workforceRecruiterAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(workforceRecruiterAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // DEFAULT ALIVE OR DEAD IMPLEMENTATIONS
  // ========================================

  async createDefaultAliveOrDeadFinancialEntry(entryData: InsertDefaultAliveOrDeadFinancialEntry, userId: string): Promise<DefaultAliveOrDeadFinancialEntry> {
    // Normalize weekStartDate to Saturday (weeks start on Saturday and end on Friday)
    // This ensures consistency when querying by week
    const normalizedWeekStart = this.getWeekStart(entryData.weekStartDate);
    const weekStartDateString = normalizedWeekStart.toISOString().split('T')[0];
    
    const { weekStartDate, operatingExpenses, depreciation, amortization, ...restEntryData } = entryData;
    const [entry] = await db
      .insert(defaultAliveOrDeadFinancialEntries)
      .values({
        ...restEntryData,
        weekStartDate: weekStartDateString,
        operatingExpenses: operatingExpenses.toString(),
        depreciation: (depreciation ?? 0).toString(),
        amortization: (amortization ?? 0).toString(),
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
    let query = db.select().from(defaultAliveOrDeadFinancialEntries);

    if (filters?.weekStartDate) {
      const weekStartDateString = filters.weekStartDate.toISOString().split('T')[0];
      query = query.where(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, weekStartDateString)) as any;
    }

    const allEntries = await query;
    const total = allEntries.length;

    let entries = allEntries;
    if (filters?.offset !== undefined) {
      entries = entries.slice(filters.offset);
    }
    if (filters?.limit !== undefined) {
      entries = entries.slice(0, filters.limit);
    }

    return { entries, total };
  }

  async updateDefaultAliveOrDeadFinancialEntry(id: string, entryData: Partial<InsertDefaultAliveOrDeadFinancialEntry>): Promise<DefaultAliveOrDeadFinancialEntry> {
    const updateData: any = { ...entryData, updatedAt: new Date() };
    if (entryData.weekStartDate) {
      const normalizedWeekStart = this.getWeekStart(entryData.weekStartDate);
      updateData.weekStartDate = normalizedWeekStart.toISOString().split('T')[0];
    }
    const [updated] = await db
      .update(defaultAliveOrDeadFinancialEntries)
      .set(updateData)
      .where(eq(defaultAliveOrDeadFinancialEntries.id, id))
      .returning();
    return updated;
  }

  async deleteDefaultAliveOrDeadFinancialEntry(id: string): Promise<void> {
    await db.delete(defaultAliveOrDeadFinancialEntries).where(eq(defaultAliveOrDeadFinancialEntries.id, id));
  }

  async getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate: Date): Promise<DefaultAliveOrDeadFinancialEntry | undefined> {
    // Normalize to Saturday (weeks start on Saturday and end on Friday)
    // Use the helper method to ensure consistent week boundary calculation
    const normalizedWeekStart = this.getWeekStart(weekStartDate);
    const weekStartDateString = normalizedWeekStart.toISOString().split('T')[0];
    
    const [entry] = await db
      .select()
      .from(defaultAliveOrDeadFinancialEntries)
      .where(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, weekStartDateString));
    return entry;
  }

  /**
   * Calculate EBITDA for a given week and store as snapshot
   * Revenue is calculated from payments table for the week (Saturday to Friday)
   * Operating expenses, depreciation, and amortization come from financial entries
   */
  async calculateAndStoreEbitdaSnapshot(weekStartDate: Date, currentFunding?: number): Promise<DefaultAliveOrDeadEbitdaSnapshot> {
    // Get Saturday of the week (weeks start on Saturday and end on Friday)
    // Use the helper methods to ensure consistent week boundary calculation
    const weekStart = this.getWeekStart(weekStartDate);
    const weekEnd = this.getWeekEnd(weekStartDate);
    
    // If currentFunding not provided, get it from database (default 0)
    if (currentFunding === undefined) {
      currentFunding = await this.getDefaultAliveOrDeadCurrentFunding();
    }

    // Calculate revenue from payments table for this week
    const weekPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, weekStart),
          lte(payments.paymentDate, weekEnd)
        )
      );

    const revenue = weekPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Get financial entry for this week
    let financialEntry = await this.getDefaultAliveOrDeadFinancialEntryByWeek(weekStart);
    
    // If no financial entry for this week, use previous week's expenses
    if (!financialEntry) {
      const previousWeekStart = new Date(weekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      financialEntry = await this.getDefaultAliveOrDeadFinancialEntryByWeek(previousWeekStart);
    }
    
    const operatingExpenses = financialEntry ? parseFloat(financialEntry.operatingExpenses) : 0;
    const depreciation = financialEntry ? parseFloat(financialEntry.depreciation || '0') : 0;
    const amortization = financialEntry ? parseFloat(financialEntry.amortization || '0') : 0;

    // Calculate EBITDA: Revenue - Operating Expenses + Depreciation + Amortization
    const ebitda = revenue - operatingExpenses + depreciation + amortization;

    // Get previous snapshots to calculate growth rate
    const previousSnapshots = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(4); // Get last 4 weeks for growth calculation

    let growthRate: number | null = null;
    if (previousSnapshots.length >= 2) {
      // Calculate average weekly growth rate from last 2 weeks
      const recentRevenue = previousSnapshots[0].revenue ? parseFloat(previousSnapshots[0].revenue) : 0;
      const olderRevenue = previousSnapshots[1].revenue ? parseFloat(previousSnapshots[1].revenue) : 0;
      if (olderRevenue > 0) {
        growthRate = (recentRevenue - olderRevenue) / olderRevenue;
      }
    }

    // Project profitability and determine Default Alive/Dead status
    // Based on growth.tlb.org calculator logic:
    // - If expenses are constant and revenue is growing, calculate when EBITDA becomes positive
    // - Calculate capital needed before profitability
    // - Compare with current funding to determine if Default Alive or Dead
    let isDefaultAlive = false;
    let projectedProfitabilityDate: Date | null = null;
    let projectedCapitalNeeded: number | null = null;
    const weeksUntilProfitability: number | null = null;

    if (ebitda >= 0) {
      // Already profitable - Default Alive
      isDefaultAlive = true;
      projectedProfitabilityDate = weekStart;
      projectedCapitalNeeded = 0;
    } else if (operatingExpenses > 0) {
      // Calculate projection if we have expenses
      let effectiveGrowthRate = growthRate;
      
      // If no growth rate available (not enough historical data), use a conservative default
      // Default to 5% weekly growth as a conservative assumption
      if (effectiveGrowthRate === null || effectiveGrowthRate <= 0) {
        effectiveGrowthRate = 0.05; // 5% weekly growth as conservative default
      }
      
      // Project forward with the growth rate
      // Start with revenue (or 0.01 if revenue is 0 to avoid division issues)
      let projectedRevenue = revenue > 0 ? revenue : 0.01;
      let weeks = 0;
      let cumulativeLoss = 0;
      const maxWeeks = 104; // 2 years max projection

      while (weeks < maxWeeks && projectedRevenue < operatingExpenses) {
        cumulativeLoss += operatingExpenses - projectedRevenue;
        projectedRevenue = projectedRevenue * (1 + effectiveGrowthRate);
        weeks++;
      }

      if (projectedRevenue >= operatingExpenses) {
        projectedProfitabilityDate = new Date(weekStart);
        projectedProfitabilityDate.setDate(projectedProfitabilityDate.getDate() + (weeks * 7));
        projectedCapitalNeeded = cumulativeLoss;

        // Determine Default Alive/Dead: if current funding >= projected capital needed, then Default Alive
        if (currentFunding !== undefined && currentFunding >= projectedCapitalNeeded) {
          isDefaultAlive = true;
        } else if (currentFunding === undefined) {
          // If no funding specified, assume Default Dead if we need capital
          isDefaultAlive = projectedCapitalNeeded <= 0;
        }
      } else {
        // If we couldn't reach profitability within max weeks,
        // set a conservative capital needed estimate (6 months of expenses)
        projectedCapitalNeeded = operatingExpenses * 26;
        // Set a projected date far in the future (max weeks from now)
        projectedProfitabilityDate = new Date(weekStart);
        projectedProfitabilityDate.setDate(projectedProfitabilityDate.getDate() + (maxWeeks * 7));
        isDefaultAlive = currentFunding !== undefined && currentFunding >= projectedCapitalNeeded;
      }
    }

    const weekStartDateString = this.getWeekStart(weekStart).toISOString().split('T')[0];
    const snapshotData = {
      weekStartDate: weekStartDateString,
      revenue: revenue.toString(),
      operatingExpenses: operatingExpenses.toString(),
      depreciation: depreciation.toString(),
      amortization: amortization.toString(),
      ebitda: ebitda.toString(),
      isDefaultAlive,
      projectedProfitabilityDate: projectedProfitabilityDate ? projectedProfitabilityDate.toISOString().split('T')[0] : null,
      projectedCapitalNeeded: projectedCapitalNeeded?.toString() || null,
      currentFunding: currentFunding?.toString() || null,
      growthRate: growthRate?.toString() || null,
      calculationMetadata: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        paymentCount: weekPayments.length,
        hasFinancialEntry: !!financialEntry,
      },
    };

    // Upsert to keep the operation idempotent and avoid unique constraint races
    const [snapshot] = await db
      .insert(defaultAliveOrDeadEbitdaSnapshots)
      .values(snapshotData)
      .onConflictDoUpdate({
        target: defaultAliveOrDeadEbitdaSnapshots.weekStartDate,
        set: {
          weekStartDate: snapshotData.weekStartDate,
          revenue: snapshotData.revenue,
          operatingExpenses: snapshotData.operatingExpenses,
          depreciation: snapshotData.depreciation,
          amortization: snapshotData.amortization,
          ebitda: snapshotData.ebitda,
          isDefaultAlive: snapshotData.isDefaultAlive,
          projectedProfitabilityDate: snapshotData.projectedProfitabilityDate,
          projectedCapitalNeeded: snapshotData.projectedCapitalNeeded,
          currentFunding: snapshotData.currentFunding,
          growthRate: snapshotData.growthRate,
          calculationMetadata: snapshotData.calculationMetadata,
          updatedAt: new Date(),
        },
      })
      .returning();

    return snapshot;
  }

  async getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date): Promise<DefaultAliveOrDeadEbitdaSnapshot | undefined> {
    // Normalize to Saturday (weeks start on Saturday and end on Friday)
    // Use the helper method to ensure consistent week boundary calculation
    const weekStart = this.getWeekStart(weekStartDate);
    const weekStartDateString = weekStart.toISOString().split('T')[0];

    const [snapshot] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, weekStartDateString));
    return snapshot;
  }

  async getDefaultAliveOrDeadEbitdaSnapshots(filters?: {
    limit?: number;
    offset?: number;
  }): Promise<{ snapshots: DefaultAliveOrDeadEbitdaSnapshot[]; total: number }> {
    const allSnapshots = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate));

    const total = allSnapshots.length;

    let snapshots = allSnapshots;
    if (filters?.offset !== undefined) {
      snapshots = snapshots.slice(filters.offset);
    }
    if (filters?.limit !== undefined) {
      snapshots = snapshots.slice(0, filters.limit);
    }

    return { snapshots, total };
  }

  async getDefaultAliveOrDeadCurrentStatus(): Promise<{
    currentSnapshot: DefaultAliveOrDeadEbitdaSnapshot | null;
    isDefaultAlive: boolean;
    projectedProfitabilityDate: Date | null;
    projectedCapitalNeeded: number | null;
    weeksUntilProfitability: number | null;
  }> {
    // Get most recent snapshot
    const [latest] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(1);

    if (!latest) {
      return {
        currentSnapshot: null,
        isDefaultAlive: false,
        projectedProfitabilityDate: null,
        projectedCapitalNeeded: null,
        weeksUntilProfitability: null,
      };
    }

    // Handle date conversion - Drizzle may return date as string or Date object
    let projectedProfitabilityDate: Date | null = null;
    if (latest.projectedProfitabilityDate) {
      if (typeof latest.projectedProfitabilityDate === 'string') {
        projectedProfitabilityDate = new Date(latest.projectedProfitabilityDate);
      } else if (latest.projectedProfitabilityDate && typeof latest.projectedProfitabilityDate === 'object' && 'getTime' in latest.projectedProfitabilityDate) {
        projectedProfitabilityDate = latest.projectedProfitabilityDate as Date;
      }
      // Validate the date
      if (projectedProfitabilityDate && isNaN(projectedProfitabilityDate.getTime())) {
        projectedProfitabilityDate = null;
      }
    }
    
    const projectedCapitalNeeded = latest.projectedCapitalNeeded ? parseFloat(latest.projectedCapitalNeeded) : null;
    
    let weeksUntilProfitability: number | null = null;
    if (projectedProfitabilityDate) {
      const today = new Date();
      const weeks = Math.ceil((projectedProfitabilityDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
      weeksUntilProfitability = Math.max(0, weeks);
    }

    return {
      currentSnapshot: latest,
      isDefaultAlive: latest.isDefaultAlive,
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
    return snapshots.reverse(); // Return in chronological order (oldest first)
  }

  /**
   * Get week-over-week comparison similar to Weekly Performance
   * Returns current week and previous week snapshots with comparison metrics
   */
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
      revenueChange: number; // Percentage change
      ebitdaChange: number; // Percentage change
      operatingExpensesChange: number; // Percentage change
      growthRate: number; // Weekly growth rate
    };
  }> {
    // Get Saturday of the current week (using same helper as getWeeklyPerformanceReview)
    const currentWeekStart = this.getWeekStart(weekStart);
    const currentWeekEnd = this.getWeekEnd(weekStart);

    // Calculate previous week boundaries
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(currentWeekEnd);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    // Get snapshots for both weeks
    const currentSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(currentWeekStart);
    const previousSnapshot = await this.getDefaultAliveOrDeadEbitdaSnapshot(previousWeekStart);

    // Calculate comparisons
    const currentRevenue = currentSnapshot ? parseFloat(currentSnapshot.revenue) : 0;
    const previousRevenue = previousSnapshot ? parseFloat(previousSnapshot.revenue) : 0;
    const currentEbitda = currentSnapshot ? parseFloat(currentSnapshot.ebitda) : 0;
    const previousEbitda = previousSnapshot ? parseFloat(previousSnapshot.ebitda) : 0;
    const currentExpenses = currentSnapshot ? parseFloat(currentSnapshot.operatingExpenses) : 0;
    const previousExpenses = previousSnapshot ? parseFloat(previousSnapshot.operatingExpenses) : 0;

    // Calculate percentage changes
    const revenueChange = previousRevenue === 0
      ? (currentRevenue > 0 ? 100 : 0)
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    const ebitdaChange = previousEbitda === 0
      ? (currentEbitda > 0 ? 100 : (currentEbitda < 0 ? -100 : 0))
      : ((currentEbitda - previousEbitda) / Math.abs(previousEbitda)) * 100;

    const operatingExpensesChange = previousExpenses === 0
      ? (currentExpenses > 0 ? 100 : 0)
      : ((currentExpenses - previousExpenses) / previousExpenses) * 100;

    // Calculate growth rate (weekly)
    const growthRate = previousRevenue === 0
      ? 0
      : ((currentRevenue - previousRevenue) / previousRevenue);

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

  /**
   * Deletes a Directory profile with cascade handling (Directory has no relational data to anonymize)
   */
  async deleteDirectoryProfileWithCascade(userId: string, reason?: string): Promise<void> {
    // Get profile first
    const profile = await this.getDirectoryProfileByUserId(userId);
    if (!profile) {
      throw new Error("Directory profile not found");
    }

    // Delete the profile
    await db.delete(directoryProfiles).where(eq(directoryProfiles.userId, userId));

    // Log the deletion (don't fail if logging fails)
    try {
      await this.logProfileDeletion(userId, "directory", reason);
    } catch (error) {
      console.error("Failed to log profile deletion:", error);
      // Continue even if logging fails
    }
  }

  /**
   * Deletes a TrustTransport profile and anonymizes all related data
   */
  async deleteTrusttransportProfile(userId: string, reason?: string): Promise<void> {
    try {
      // Get profile first
      const profile = await this.getTrusttransportProfile(userId);
      if (!profile) {
        throw new Error("TrustTransport profile not found");
      }

      const anonymizedUserId = this.generateAnonymizedUserId();
      
      // Create anonymized user if needed
      try {
        await db
          .insert(users)
          .values({
            id: anonymizedUserId,
            email: null,
            firstName: "Deleted",
            lastName: "User",
            isAdmin: false,
            isVerified: false,
          });
      } catch (error: any) {
        // If user already exists (from previous deletion), that's fine
        if (!error.message?.includes("duplicate key") && !error.message?.includes("unique constraint")) {
          throw error;
        }
      }

      // Anonymize ride requests by riderId
      await db
        .update(trusttransportRideRequests)
        .set({ riderId: anonymizedUserId })
        .where(eq(trusttransportRideRequests.riderId, userId));
      
      // Anonymize ride requests by driverId (if user was a driver)
      // Note: driverId references profile.id, so we need to null it out when profile is deleted
      await db
        .update(trusttransportRideRequests)
        .set({ driverId: null, status: 'open' }) // Unclaim requests when driver profile is deleted
        .where(eq(trusttransportRideRequests.driverId, profile.id));

      // Delete the profile
      await db.delete(trusttransportProfiles).where(eq(trusttransportProfiles.userId, userId));

      // Log the deletion (don't fail if logging fails)
      try {
        await this.logProfileDeletion(userId, "trusttransport", reason);
      } catch (error) {
        console.error("Failed to log profile deletion:", error);
        // Continue even if logging fails
      }
    } catch (error: any) {
      console.error("Error in deleteTrusttransportProfile:", error);
      // Re-throw with more context
      throw new Error(`Failed to delete TrustTransport profile: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Deletes a user's entire account from all mini-apps and anonymizes all related data.
   * This is different from deleting individual profiles - this deletes the entire account.
   * 
   * Process:
   * 1. Delete all mini-app profiles (which already handle anonymization of related data)
   * 2. Anonymize other user-related data (NPS responses, payments, invite codes, admin actions)
   * 3. Anonymize the user record itself (set email to null, name to "Deleted User", etc.)
   * 
   * Note: Profile deletion logs are kept for audit purposes but the userId is preserved
   * as it represents the original user before deletion.
   */
  async deleteUserAccount(userId: string, reason?: string): Promise<void> {
    try {
      console.log(`[deleteUserAccount] Starting complete account deletion for userId: ${userId}`);

      // Verify user exists
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate anonymized user ID for data anonymization
      const anonymizedUserId = this.generateAnonymizedUserId();

      // Step 1: Delete all mini-app profiles (these methods already handle anonymization)
      // We'll catch errors and continue - some profiles may not exist
      const profileDeletions = [
        { name: "SupportMatch", deleteFn: () => this.deleteSupportMatchProfile(userId, reason).catch(err => console.warn(`Failed to delete SupportMatch profile: ${err.message}`)) },
        { name: "LightHouse", deleteFn: () => this.deleteLighthouseProfile(userId, reason).catch(err => console.warn(`Failed to delete LightHouse profile: ${err.message}`)) },
        { name: "SocketRelay", deleteFn: () => this.deleteSocketrelayProfile(userId, reason).catch(err => console.warn(`Failed to delete SocketRelay profile: ${err.message}`)) },
        { name: "Directory", deleteFn: () => this.deleteDirectoryProfileWithCascade(userId, reason).catch(err => console.warn(`Failed to delete Directory profile: ${err.message}`)) },
        { name: "TrustTransport", deleteFn: () => this.deleteTrusttransportProfile(userId, reason).catch(err => console.warn(`Failed to delete TrustTransport profile: ${err.message}`)) },
        { name: "MechanicMatch", deleteFn: () => this.deleteMechanicmatchProfile(userId, reason).catch(err => console.warn(`Failed to delete MechanicMatch profile: ${err.message}`)) },
        { name: "WorkforceRecruiter", deleteFn: () => this.deleteWorkforceRecruiterProfile(userId, reason).catch(err => console.warn(`Failed to delete WorkforceRecruiter profile: ${err.message}`)) },
      ];

      for (const { name, deleteFn } of profileDeletions) {
        try {
          await deleteFn();
          console.log(`[deleteUserAccount] Successfully deleted ${name} profile`);
        } catch (error: any) {
          // Continue even if one profile deletion fails
          console.warn(`[deleteUserAccount] Warning: Failed to delete ${name} profile: ${error.message}`);
        }
      }

      // Step 2: Create anonymized user if needed (for foreign key constraints)
      try {
        await db
          .insert(users)
          .values({
            id: anonymizedUserId,
            email: null,
            firstName: "Deleted",
            lastName: "User",
            isAdmin: false,
            isVerified: false,
          });
      } catch (error: any) {
        // If user already exists (from previous deletion), that's fine
        if (!error.message?.includes("duplicate key") && !error.message?.includes("unique constraint")) {
          throw error;
        }
      }

      // Step 3: Anonymize NPS responses
      try {
        await db
          .update(npsResponses)
          .set({ userId: anonymizedUserId })
          .where(eq(npsResponses.userId, userId));
        console.log(`[deleteUserAccount] Anonymized NPS responses`);
      } catch (error: any) {
        console.warn(`[deleteUserAccount] Warning: Failed to anonymize NPS responses: ${error.message}`);
      }

      // Step 4: Anonymize payments (both userId and recordedBy)
      try {
        await db
          .update(payments)
          .set({ userId: anonymizedUserId })
          .where(eq(payments.userId, userId));
        await db
          .update(payments)
          .set({ recordedBy: anonymizedUserId })
          .where(eq(payments.recordedBy, userId));
        console.log(`[deleteUserAccount] Anonymized payments`);
      } catch (error: any) {
        console.warn(`[deleteUserAccount] Warning: Failed to anonymize payments: ${error.message}`);
      }


      // Step 6: Anonymize admin action logs (adminId)
      try {
        await db
          .update(adminActionLogs)
          .set({ adminId: anonymizedUserId })
          .where(eq(adminActionLogs.adminId, userId));
        console.log(`[deleteUserAccount] Anonymized admin action logs`);
      } catch (error: any) {
        console.warn(`[deleteUserAccount] Warning: Failed to anonymize admin action logs: ${error.message}`);
      }

      // Step 6b: Anonymize research items (userId)
      try {
        await db
          .update(researchItems)
          .set({ userId: anonymizedUserId })
          .where(eq(researchItems.userId, userId));
        console.log(`[deleteUserAccount] Anonymized research items`);
      } catch (error: any) {
        console.warn(`[deleteUserAccount] Warning: Failed to anonymize research items: ${error.message}`);
      }

      // Step 7: Anonymize the user record itself
      // We keep the user record but anonymize all personal information
      try {
        await db
          .update(users)
          .set({
            email: null,
            firstName: "Deleted",
            lastName: "User",
            profileImageUrl: null,
            isAdmin: false,
            isVerified: false,
            isApproved: false,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
        console.log(`[deleteUserAccount] Anonymized user record`);
      } catch (error: any) {
        console.error(`[deleteUserAccount] Error: Failed to anonymize user record: ${error.message}`);
        throw error;
      }

      // Step 8: Log the account deletion (using a special app name)
      try {
        await this.logProfileDeletion(userId, "complete_account", reason || "User requested complete account deletion");
        console.log(`[deleteUserAccount] Logged account deletion`);
      } catch (error) {
        console.warn(`[deleteUserAccount] Warning: Failed to log account deletion: ${error}`);
        // Continue even if logging fails
      }

      console.log(`[deleteUserAccount] Successfully completed account deletion for userId: ${userId}`);
    } catch (error: any) {
      console.error(`[deleteUserAccount] Error: Failed to delete user account: ${error.message}`);
      throw new Error(`Failed to delete user account: ${error.message || "Unknown error"}`);
    }
  }

  // NPS (Net Promoter Score) operations
  async createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse> {
    const [created] = await db
      .insert(npsResponses)
      .values(response)
      .returning();
    return created;
  }

  async getUserLastNpsResponse(userId: string): Promise<NpsResponse | undefined> {
    const [response] = await db
      .select()
      .from(npsResponses)
      .where(eq(npsResponses.userId, userId))
      .orderBy(desc(npsResponses.createdAt))
      .limit(1);
    return response;
  }

  async getNpsResponsesForWeek(weekStart: Date, weekEnd: Date): Promise<NpsResponse[]> {
    return await db
      .select()
      .from(npsResponses)
      .where(
        and(
          gte(npsResponses.createdAt, weekStart),
          lte(npsResponses.createdAt, weekEnd)
        )
      )
      .orderBy(desc(npsResponses.createdAt));
  }

  async getAllNpsResponses(): Promise<NpsResponse[]> {
    return await db
      .select()
      .from(npsResponses)
      .orderBy(desc(npsResponses.createdAt));
  }

  // Default Alive or Dead Current Funding operations
  async getDefaultAliveOrDeadCurrentFunding(): Promise<number> {
    // Get the most recent snapshot's currentFunding, or default to 0
    const [latest] = await db
      .select()
      .from(defaultAliveOrDeadEbitdaSnapshots)
      .orderBy(desc(defaultAliveOrDeadEbitdaSnapshots.weekStartDate))
      .limit(1);
    
    if (latest && latest.currentFunding) {
      return parseFloat(latest.currentFunding);
    }
    return 0;
  }

  async updateDefaultAliveOrDeadCurrentFunding(amount: number): Promise<void> {
    // Update all snapshots with the new current funding value
    // This ensures consistency across all calculations
    await db
      .update(defaultAliveOrDeadEbitdaSnapshots)
      .set({
        currentFunding: amount.toString(),
        updatedAt: new Date(),
      });
  }
}

export const storage = new DatabaseStorage();
