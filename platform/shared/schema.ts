import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================================
// Common validation schemas for API endpoints
// ========================================

/**
 * UUID validation schema for route parameters
 * Validates that an ID is a non-empty string (UUID format)
 */
export const uuidParamSchema = z.string().min(1, "ID is required").uuid("ID must be a valid UUID");

/**
 * Generic ID parameter schema (for non-UUID IDs)
 */
export const idParamSchema = z.string().min(1, "ID is required").max(255, "ID is too long");

/**
 * Schema for user verification request body
 */
export const verifyUserSchema = z.object({
  isVerified: z.boolean({
    required_error: "isVerified is required",
    invalid_type_error: "isVerified must be a boolean",
  }),
});

/**
 * Schema for user approval request body
 */
export const approveUserSchema = z.object({
  isApproved: z.boolean({
    required_error: "isApproved is required",
    invalid_type_error: "isApproved must be a boolean",
  }),
});

// ========================================
// CORE SCHEMAS - Re-exported from modules
// ========================================

// Re-export from core modules
export {
  sessions,
  users,
  loginEvents,
  otpCodes,
  authTokens,
  usersRelations,
  type UpsertUser,
  type User,
  type OTPCode,
  type InsertOTPCode,
  type AuthToken,
  type InsertAuthToken,
} from "./core/users";

export {
  pricingTiers,
  payments,
  paymentsRelations,
  insertPricingTierSchema,
  insertPaymentSchema,
  type InsertPricingTier,
  type PricingTier,
  type InsertPayment,
  type Payment,
} from "./core/payments";

export {
  adminActionLogs,
  adminActionLogsRelations,
  npsResponses,
  npsResponsesRelations,
  insertAdminActionLogSchema,
  insertNpsResponseSchema,
  type InsertAdminActionLog,
  type AdminActionLog,
  type InsertNpsResponse,
  type NpsResponse,
} from "./core/admin";


// ========================================
// SUPPORTMATCH APP TABLES - Re-exported from module
// ========================================

export {
  supportMatchProfiles,
  supportMatchProfilesRelations,
  partnerships,
  partnershipsRelations,
  messages,
  messagesRelations,
  exclusions,
  exclusionsRelations,
  reports,
  reportsRelations,
  announcements,
  supportmatchAnnouncements,
  insertSupportMatchProfileSchema,
  insertPartnershipSchema,
  insertMessageSchema,
  insertExclusionSchema,
  insertReportSchema,
  insertAnnouncementSchema,
  insertSupportmatchAnnouncementSchema,
  type InsertSupportMatchProfile,
  type SupportMatchProfile,
  type InsertPartnership,
  type Partnership,
  type InsertMessage,
  type Message,
  type InsertExclusion,
  type Exclusion,
  type InsertReport,
  type Report,
  type InsertAnnouncement,
  type Announcement,
  type InsertSupportmatchAnnouncement,
  type SupportmatchAnnouncement,
} from "./supportmatch";


// ========================================
// LIGHTHOUSE APP TABLES - Re-exported from module
// ========================================

export {
  lighthouseProfiles,
  lighthouseProfilesRelations,
  lighthouseProperties,
  lighthousePropertiesRelations,
  lighthouseMatches,
  lighthouseMatchesRelations,
  lighthouseAnnouncements,
  lighthouseBlocks,
  lighthouseBlocksRelations,
  insertLighthouseProfileSchema,
  insertLighthousePropertySchema,
  insertLighthouseMatchSchema,
  insertLighthouseAnnouncementSchema,
  insertLighthouseBlockSchema,
  type InsertLighthouseProfile,
  type LighthouseProfile,
  type InsertLighthouseProperty,
  type LighthouseProperty,
  type InsertLighthouseMatch,
  type LighthouseMatch,
  type InsertLighthouseAnnouncement,
  type LighthouseAnnouncement,
  type InsertLighthouseBlock,
  type LighthouseBlock,
} from "./lighthouse";

// ========================================
// SOCKETRELAY APP TABLES - Re-exported from module
// ========================================

export {
  socketrelayRequests,
  socketrelayRequestsRelations,
  socketrelayFulfillments,
  socketrelayFulfillmentsRelations,
  socketrelayMessages,
  socketrelayMessagesRelations,
  socketrelayProfiles,
  socketrelayProfilesRelations,
  socketrelayAnnouncements,
  insertSocketrelayRequestSchema,
  insertSocketrelayFulfillmentSchema,
  insertSocketrelayMessageSchema,
  insertSocketrelayProfileSchema,
  insertSocketrelayAnnouncementSchema,
  type InsertSocketrelayRequest,
  type SocketrelayRequest,
  type InsertSocketrelayFulfillment,
  type SocketrelayFulfillment,
  type InsertSocketrelayMessage,
  type SocketrelayMessage,
  type InsertSocketrelayProfile,
  type SocketrelayProfile,
  type InsertSocketrelayAnnouncement,
  type SocketrelayAnnouncement,
} from "./socketrelay";

// ========================================
// DIRECTORY APP TABLES - Re-exported from module
// ========================================

export {
  directoryProfiles,
  directoryProfilesRelations,
  directoryAnnouncements,
  directorySkills,
  insertDirectoryProfileSchema,
  insertDirectoryAnnouncementSchema,
  insertDirectorySkillSchema,
  type InsertDirectoryProfile,
  type DirectoryProfile,
  type InsertDirectoryAnnouncement,
  type DirectoryAnnouncement,
  type InsertDirectorySkill,
  type DirectorySkill,
} from "./directory";

// ========================================
// SKILLS MANAGEMENT TABLES - Re-exported from module
// ========================================

export {
  skillsSectors,
  skillsJobTitles,
  skillsSkills,
  insertSkillsSectorSchema,
  insertSkillsJobTitleSchema,
  insertSkillsSkillSchema,
  type InsertSkillsSector,
  type SkillsSector,
  type InsertSkillsJobTitle,
  type SkillsJobTitle,
  type InsertSkillsSkill,
  type SkillsSkill,
} from "./skills";

// ========================================
// CHAT GROUPS APP TABLES - Re-exported from module
// ========================================

export {
  chatGroups,
  chatGroupsRelations,
  chatgroupsAnnouncements,
  insertChatGroupSchema,
  insertChatgroupsAnnouncementSchema,
  type InsertChatGroup,
  type ChatGroup,
  type InsertChatgroupsAnnouncement,
  type ChatgroupsAnnouncement,
} from "./chatgroups";

// ========================================
// TRUSTTRANSPORT APP TABLES - Re-exported from module
// ========================================

export {
  trusttransportProfiles,
  trusttransportProfilesRelations,
  trusttransportRideRequests,
  trusttransportRideRequestsRelations,
  trusttransportAnnouncements,
  trusttransportBlocks,
  trusttransportBlocksRelations,
  insertTrusttransportProfileSchema,
  insertTrusttransportRideRequestSchema,
  insertTrusttransportAnnouncementSchema,
  insertTrusttransportBlockSchema,
  type InsertTrusttransportProfile,
  type TrusttransportProfile,
  type InsertTrusttransportRideRequest,
  type TrusttransportRideRequest,
  type InsertTrusttransportAnnouncement,
  type TrusttransportAnnouncement,
  type InsertTrusttransportBlock,
  type TrusttransportBlock,
} from "./trusttransport";

// ========================================
// PROFILE DELETION LOG TABLE - Re-exported from module
// ========================================

export {
  profileDeletionLogs,
  profileDeletionLogsRelations,
  insertProfileDeletionLogSchema,
  type InsertProfileDeletionLog,
  type ProfileDeletionLog,
} from "./core/profile-deletion";

// ========================================
// MECHANICMATCH APP TABLES - Re-exported from module
// ========================================

export {
  mechanicmatchProfiles,
  mechanicmatchProfilesRelations,
  mechanicmatchVehicles,
  mechanicmatchVehiclesRelations,
  mechanicmatchServiceRequests,
  mechanicmatchServiceRequestsRelations,
  mechanicmatchJobs,
  mechanicmatchJobsRelations,
  mechanicmatchAvailability,
  mechanicmatchAvailabilityRelations,
  mechanicmatchReviews,
  mechanicmatchReviewsRelations,
  mechanicmatchMessages,
  mechanicmatchMessagesRelations,
  mechanicmatchAnnouncements,
  mechanicmatchBlocks,
  mechanicmatchBlocksRelations,
  insertMechanicmatchProfileSchema,
  insertMechanicmatchVehicleSchema,
  insertMechanicmatchServiceRequestSchema,
  insertMechanicmatchJobSchema,
  insertMechanicmatchAvailabilitySchema,
  insertMechanicmatchReviewSchema,
  insertMechanicmatchMessageSchema,
  insertMechanicmatchAnnouncementSchema,
  insertMechanicmatchBlockSchema,
  type InsertMechanicmatchProfile,
  type MechanicmatchProfile,
  type InsertMechanicmatchVehicle,
  type MechanicmatchVehicle,
  type InsertMechanicmatchServiceRequest,
  type MechanicmatchServiceRequest,
  type InsertMechanicmatchJob,
  type MechanicmatchJob,
  type InsertMechanicmatchAvailability,
  type MechanicmatchAvailability,
  type InsertMechanicmatchReview,
  type MechanicmatchReview,
  type InsertMechanicmatchMessage,
  type MechanicmatchMessage,
  type InsertMechanicmatchAnnouncement,
  type MechanicmatchAnnouncement,
  type InsertMechanicmatchBlock,
  type MechanicmatchBlock,
} from "./mechanicmatch";

// ========================================
// LOSTMAIL APP TABLES - Re-exported from module
// ========================================

export {
  lostmailIncidents,
  lostmailIncidentsRelations,
  lostmailAuditTrail,
  lostmailAuditTrailRelations,
  insertLostmailIncidentSchema,
  insertLostmailAuditTrailSchema,
  type InsertLostmailIncident,
  type LostmailIncident,
  type InsertLostmailAuditTrail,
  type LostmailAuditTrail,
} from "./lostmail";

// ========================================
// RESEARCH APP TABLES - Re-exported from module
// ========================================

export {
  researchItems,
  researchItemsRelations,
  researchAnswers,
  researchAnswersRelations,
  researchComments,
  researchCommentsRelations,
  researchVotes,
  researchVotesRelations,
  researchLinkProvenances,
  researchLinkProvenancesRelations,
  researchBookmarks,
  researchBookmarksRelations,
  researchFollows,
  researchFollowsRelations,
  researchReports,
  researchReportsRelations,
  researchAnnouncements,
  insertResearchItemSchema,
  insertResearchAnswerSchema,
  insertResearchCommentSchema,
  insertResearchVoteSchema,
  insertResearchLinkProvenanceSchema,
  insertResearchBookmarkSchema,
  insertResearchFollowSchema,
  insertResearchReportSchema,
  insertResearchAnnouncementSchema,
  type InsertResearchItem,
  type ResearchItem,
  type InsertResearchAnswer,
  type ResearchAnswer,
  type InsertResearchComment,
  type ResearchComment,
  type InsertResearchVote,
  type ResearchVote,
  type InsertResearchLinkProvenance,
  type ResearchLinkProvenance,
  type InsertResearchBookmark,
  type ResearchBookmark,
  type InsertResearchFollow,
  type ResearchFollow,
  type InsertResearchReport,
  type ResearchReport,
  type InsertResearchAnnouncement,
  type ResearchAnnouncement,
} from "./research";

// ========================================
// ========================================// GENTLEPULSE APP TABLES - Re-exported from module// ========================================export {  gentlepulseMeditations,  gentlepulseRatings,  gentlepulseMoodChecks,  gentlepulseFavorites,  gentlepulseAnnouncements,  insertGentlepulseMeditationSchema,  insertGentlepulseRatingSchema,  insertGentlepulseMoodCheckSchema,  insertGentlepulseFavoriteSchema,  insertGentlepulseAnnouncementSchema,  type InsertGentlepulseMeditation,  type GentlepulseMeditation,  type InsertGentlepulseRating,  type GentlepulseRating,  type InsertGentlepulseMoodCheck,  type GentlepulseMoodCheck,  type InsertGentlepulseFavorite,  type GentlepulseFavorite,  type InsertGentlepulseAnnouncement,  type GentlepulseAnnouncement,} from "./gentlepulse";// ========================================
// ========================================
// CHYME APP TABLES - Re-exported from module
// ========================================

export {
  chymeAnnouncements,
  chymeRooms,
  chymeRoomParticipants,
  chymeMessages,
  chymeUserFollows,
  chymeUserBlocks,
  insertChymeAnnouncementSchema,
  insertChymeRoomSchema,
  insertChymeRoomParticipantSchema,
  insertChymeMessageSchema,
  insertChymeUserFollowSchema,
  insertChymeUserBlockSchema,
  type InsertChymeAnnouncement,
  type ChymeAnnouncement,
  type InsertChymeRoom,
  type ChymeRoom,
  type InsertChymeRoomParticipant,
  type ChymeRoomParticipant,
  type InsertChymeMessage,
  type ChymeMessage,
  type InsertChymeUserFollow,
  type ChymeUserFollow,
  type InsertChymeUserBlock,
  type ChymeUserBlock,
} from "./chyme";


// ========================================
// ========================================
// WORKFORCE RECRUITER TRACKER APP TABLES - Re-exported from module
// ========================================

export {
  workforceRecruiterProfiles,
  workforceRecruiterProfilesRelations,
  workforceRecruiterConfig,
  workforceRecruiterOccupations,
  workforceRecruiterMeetupEvents,
  workforceRecruiterMeetupEventsRelations,
  workforceRecruiterMeetupEventSignups,
  workforceRecruiterMeetupEventSignupsRelations,
  workforceRecruiterAnnouncements,
  insertWorkforceRecruiterProfileSchema,
  insertWorkforceRecruiterConfigSchema,
  insertWorkforceRecruiterOccupationSchema,
  insertWorkforceRecruiterMeetupEventSchema,
  insertWorkforceRecruiterMeetupEventSignupSchema,
  insertWorkforceRecruiterAnnouncementSchema,
  type InsertWorkforceRecruiterProfile,
  type WorkforceRecruiterProfile,
  type InsertWorkforceRecruiterConfig,
  type WorkforceRecruiterConfig,
  type InsertWorkforceRecruiterOccupation,
  type WorkforceRecruiterOccupation,
  type InsertWorkforceRecruiterMeetupEvent,
  type WorkforceRecruiterMeetupEvent,
  type InsertWorkforceRecruiterMeetupEventSignup,
  type WorkforceRecruiterMeetupEventSignup,
  type InsertWorkforceRecruiterAnnouncement,
  type WorkforceRecruiterAnnouncement,
} from "./workforcerecruitertracker";


// ========================================
// ========================================
// DEFAULT ALIVE OR DEAD APP TABLES - Re-exported from module
// ========================================

export {
  defaultAliveOrDeadFinancialEntries,
  defaultAliveOrDeadFinancialEntriesRelations,
  defaultAliveOrDeadEbitdaSnapshots,
  insertDefaultAliveOrDeadFinancialEntrySchema,
  insertDefaultAliveOrDeadEbitdaSnapshotSchema,
  type InsertDefaultAliveOrDeadFinancialEntry,
  type DefaultAliveOrDeadFinancialEntry,
  type InsertDefaultAliveOrDeadEbitdaSnapshot,
  type DefaultAliveOrDeadEbitdaSnapshot,
} from "./defaultaliveordead";


// ========================================
// BLOG (CONTENT-ONLY) APP TABLES
// ========================================

// Blog posts imported from Discourse (and future native posts)
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt"),
  contentMd: text("content_md").notNull(),
  contentHtml: text("content_html"),
  authorName: varchar("author_name", { length: 200 }),
  source: varchar("source", { length: 50 }).notNull().default("discourse"), // discourse, native, etc.
  discourseTopicId: integer("discourse_topic_id"),
  discoursePostId: integer("discourse_post_id"),
  tags: text("tags"), // JSON-encoded string[] for now
  category: varchar("category", { length: 100 }),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Title is required").max(300),
  slug: z.string().min(1, "Slug is required").max(300),
  excerpt: z.string().optional().nullable(),
  contentMd: z.string().min(1, "Content is required"),
  contentHtml: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  source: z.string().optional(),
  discourseTopicId: z.coerce.number().int().optional().nullable(),
  discoursePostId: z.coerce.number().int().optional().nullable(),
  tags: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog comments imported from Discourse (replies to blog posts)
export const blogComments = pgTable("blog_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discourseTopicId: integer("discourse_topic_id").notNull(),
  discoursePostId: integer("discourse_post_id").notNull().unique(),
  postNumber: integer("post_number").notNull(),
  source: varchar("source", { length: 50 }).notNull().default("discourse"), // discourse, native, etc.
  contentMd: text("content_md").notNull(),
  contentHtml: text("content_html"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  discourseTopicId: z.coerce.number().int(),
  discoursePostId: z.coerce.number().int(),
  postNumber: z.coerce.number().int(),
  contentMd: z.string().min(1, "Content is required"),
  contentHtml: z.string().optional().nullable(),
  source: z.string().optional(),
});

export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;
export type BlogComment = typeof blogComments.$inferSelect;

// Blog Announcements (mini-app specific, shown on blog pages)
export const blogAnnouncements = pgTable("blog_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogAnnouncementSchema = createInsertSchema(blogAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertBlogAnnouncement = z.infer<typeof insertBlogAnnouncementSchema>;
export type BlogAnnouncement = typeof blogAnnouncements.$inferSelect;
