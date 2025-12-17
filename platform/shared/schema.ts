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

// Session storage table - Required for authentication (OIDC/OAuth2)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for authentication (OIDC/OAuth2) with additional fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  quoraProfileUrl: varchar("quora_profile_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(), // Manual approval for app access
  pricingTier: decimal("pricing_tier", { precision: 10, scale: 2 }).notNull().default('1.00'),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).notNull().default('active'), // active, overdue, inactive
  termsAcceptedAt: timestamp("terms_accepted_at"), // Timestamp of last terms acceptance
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Login events table - tracks successful webapp logins for DAU/MAU analytics
export const loginEvents = pgTable(
  "login_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    source: varchar("source", { length: 50 }).notNull().default("webapp"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_login_events_user_created_at").on(table.userId, table.createdAt),
  ],
);

// OTP codes table - stores OTP codes for Android app authentication
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    code: varchar("code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_otp_codes_user_id").on(table.userId),
    index("IDX_otp_codes_code").on(table.code),
    index("IDX_otp_codes_expires_at").on(table.expiresAt),
  ],
);

// Auth tokens table - stores OTP-based auth tokens for Android app
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    token: varchar("token", { length: 64 }).notNull().unique(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_auth_tokens_token").on(table.token),
    index("IDX_auth_tokens_user_id").on(table.userId),
    index("IDX_auth_tokens_expires_at").on(table.expiresAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  paymentsReceived: many(payments),
  paymentsRecorded: many(payments, { relationName: "recordedBy" }),
  adminActions: many(adminActionLogs),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type OTPCode = typeof otpCodes.$inferSelect;
export type InsertOTPCode = typeof otpCodes.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type InsertAuthToken = typeof authTokens.$inferInsert;

// Pricing tiers table - tracks historical pricing levels
export const pricingTiers = pgTable("pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull().defaultNow(),
  isCurrentTier: boolean("is_current_tier").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
  id: true,
  createdAt: true,
}).extend({
  effectiveDate: z.coerce.date().optional(),
});

export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
export type PricingTier = typeof pricingTiers.$inferSelect;

// Payments table - manual payment tracking
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(), // Exact date the customer paid
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default('cash'),
  billingPeriod: varchar("billing_period", { length: 20 }).notNull().default('monthly'), // monthly, yearly
  billingMonth: varchar("billing_month", { length: 7 }), // YYYY-MM format for calendar month (monthly payments only)
  yearlyStartMonth: varchar("yearly_start_month", { length: 7 }), // YYYY-MM format for yearly subscription start
  yearlyEndMonth: varchar("yearly_end_month", { length: 7 }), // YYYY-MM format for yearly subscription end
  notes: text("notes"),
  recordedBy: varchar("recorded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  recorder: one(users, {
    fields: [payments.recordedBy],
    references: [users.id],
    relationName: "recordedBy",
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paymentDate: true,
}).extend({
  paymentDate: z.preprocess(
    (val) => {
      if (val instanceof Date) return val;
      if (typeof val === "string") return new Date(val);
      return val;
    },
    z.date()
  ),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
  billingMonth: z.preprocess(
    (val) => {
      // Normalize: convert undefined/empty to null
      if (val === undefined || val === "" || val === null) {
        return null;
      }
      // If it's a string, validate format
      if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
        return val;
      }
      // If it doesn't match, still return it (validation will catch it)
      return val;
    },
    z.union([
      z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
      z.null(),
    ]).optional()
  ),
  yearlyStartMonth: z.preprocess(
    (val) => {
      if (val === undefined || val === "" || val === null) {
        return null;
      }
      if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
        return val;
      }
      return val;
    },
    z.union([
      z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
      z.null(),
    ]).optional()
  ),
  yearlyEndMonth: z.preprocess(
    (val) => {
      if (val === undefined || val === "" || val === null) {
        return null;
      }
      if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
        return val;
      }
      return val;
    },
    z.union([
      z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
      z.null(),
    ]).optional()
  ),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Admin action logs table
export const adminActionLogs = pgTable("admin_action_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // user, invite_code, payment
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminActionLogsRelations = relations(adminActionLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminActionLogs.adminId],
    references: [users.id],
  }),
}));

export const insertAdminActionLogSchema = createInsertSchema(adminActionLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAdminActionLog = z.infer<typeof insertAdminActionLogSchema>;
export type AdminActionLog = typeof adminActionLogs.$inferSelect;

// ========================================
// SUPPORTMATCH APP TABLES
// ========================================

// SupportMatch user profiles - extends base user with SupportMatch-specific data
export const supportMatchProfiles = pgTable("support_match_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  gender: varchar("gender", { length: 50 }), // male, female, prefer-not-to-say
  genderPreference: varchar("gender_preference", { length: 50 }), // same_gender, any
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  timezone: varchar("timezone", { length: 100 }),
  timezonePreference: varchar("timezone_preference", { length: 50 }).notNull().default('same_timezone'), // same_timezone, any_timezone
  isVerified: boolean("is_verified").default(false).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportMatchProfilesRelations = relations(supportMatchProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [supportMatchProfiles.userId],
    references: [users.id],
  }),
  partnershipsAsUser1: many(partnerships, { relationName: "user1Partnerships" }),
  partnershipsAsUser2: many(partnerships, { relationName: "user2Partnerships" }),
  messagesSent: many(messages),
  exclusionsCreated: many(exclusions, { relationName: "excluderUser" }),
  exclusionsReceived: many(exclusions, { relationName: "excludedUser" }),
  reportsCreated: many(reports, { relationName: "reporter" }),
  reportsReceived: many(reports, { relationName: "reported" }),
}));

export const insertSupportMatchProfileSchema = createInsertSchema(supportMatchProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupportMatchProfile = z.infer<typeof insertSupportMatchProfileSchema>;
export type SupportMatchProfile = typeof supportMatchProfiles.$inferSelect;

// Partnerships - accountability partner pairings
export const partnerships = pgTable("partnerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => supportMatchProfiles.userId),
  user2Id: varchar("user2_id").notNull().references(() => supportMatchProfiles.userId),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, completed, ended_early, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const partnershipsRelations = relations(partnerships, ({ one, many }) => ({
  user1Profile: one(supportMatchProfiles, {
    fields: [partnerships.user1Id],
    references: [supportMatchProfiles.userId],
    relationName: "user1Partnerships",
  }),
  user2Profile: one(supportMatchProfiles, {
    fields: [partnerships.user2Id],
    references: [supportMatchProfiles.userId],
    relationName: "user2Partnerships",
  }),
  messages: many(messages),
  reports: many(reports),
}));

export const insertPartnershipSchema = createInsertSchema(partnerships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type Partnership = typeof partnerships.$inferSelect;

// Messages - partnership communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnershipId: varchar("partnership_id").notNull().references(() => partnerships.id),
  senderId: varchar("sender_id").notNull().references(() => supportMatchProfiles.userId),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  partnership: one(partnerships, {
    fields: [messages.partnershipId],
    references: [partnerships.id],
  }),
  sender: one(supportMatchProfiles, {
    fields: [messages.senderId],
    references: [supportMatchProfiles.userId],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Exclusions - user blocking system
export const exclusions = pgTable("exclusions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => supportMatchProfiles.userId),
  excludedUserId: varchar("excluded_user_id").notNull().references(() => supportMatchProfiles.userId),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exclusionsRelations = relations(exclusions, ({ one }) => ({
  excluder: one(supportMatchProfiles, {
    fields: [exclusions.userId],
    references: [supportMatchProfiles.userId],
    relationName: "excluderUser",
  }),
  excluded: one(supportMatchProfiles, {
    fields: [exclusions.excludedUserId],
    references: [supportMatchProfiles.userId],
    relationName: "excludedUser",
  }),
}));

export const insertExclusionSchema = createInsertSchema(exclusions).omit({
  id: true,
  createdAt: true,
});

export type InsertExclusion = z.infer<typeof insertExclusionSchema>;
export type Exclusion = typeof exclusions.$inferSelect;

// Reports - safety and moderation system
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => supportMatchProfiles.userId),
  reportedUserId: varchar("reported_user_id").notNull().references(() => supportMatchProfiles.userId),
  partnershipId: varchar("partnership_id").references(() => partnerships.id),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, investigating, resolved, dismissed
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(supportMatchProfiles, {
    fields: [reports.reporterId],
    references: [supportMatchProfiles.userId],
    relationName: "reporter",
  }),
  reportedUser: one(supportMatchProfiles, {
    fields: [reports.reportedUserId],
    references: [supportMatchProfiles.userId],
    relationName: "reported",
  }),
  partnership: one(partnerships, {
    fields: [reports.partnershipId],
    references: [partnerships.id],
  }),
}));

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Announcements - platform communications (platform-wide announcements)
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  showOnLogin: boolean("show_on_login").notNull().default(false),
  showOnSignInPage: boolean("show_on_sign_in_page").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// SupportMatch Announcements
export const supportmatchAnnouncements = pgTable("supportmatch_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportmatchAnnouncementSchema = createInsertSchema(supportmatchAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertSupportmatchAnnouncement = z.infer<typeof insertSupportmatchAnnouncementSchema>;
export type SupportmatchAnnouncement = typeof supportmatchAnnouncements.$inferSelect;


// ========================================
// LIGHTHOUSE APP TABLES
// ========================================

// LightHouse user profiles (seekers and hosts)
export const lighthouseProfiles = pgTable("lighthouse_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  profileType: varchar("profile_type", { length: 20 }).notNull(), // 'seeker' or 'host'
  displayName: varchar("display_name", { length: 100 }), // Auto-populated from user's firstName
  bio: text("bio"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  signalUrl: text("signal_url"),
  
  // For seekers
  housingNeeds: text("housing_needs"), // Description of what they need
  moveInDate: timestamp("move_in_date"),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  desiredCountry: varchar("desired_country", { length: 100 }), // Country where they want housing
  
  // For hosts
  hasProperty: boolean("has_property").default(false),
  
  // Common fields
  isVerified: boolean("is_verified").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lighthouseProfilesRelations = relations(lighthouseProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [lighthouseProfiles.userId],
    references: [users.id],
  }),
  properties: many(lighthouseProperties),
  matchesAsSeeker: many(lighthouseMatches, { relationName: "seeker" }),
}));

export const insertLighthouseProfileSchema = createInsertSchema(lighthouseProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  displayName: z.string().max(100).optional().nullable(), // Auto-populated from user's firstName
  moveInDate: z.coerce.date().optional().nullable(),
  signalUrl: z.string().optional().nullable().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL" }
  ).transform(val => val === "" ? null : val),
});
export type InsertLighthouseProfile = z.infer<typeof insertLighthouseProfileSchema>;
export type LighthouseProfile = typeof lighthouseProfiles.$inferSelect;

// LightHouse property listings
export const lighthouseProperties = pgTable("lighthouse_properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => lighthouseProfiles.id),
  
  propertyType: varchar("property_type", { length: 50 }).notNull(), // 'room', 'apartment', 'house', 'community', 'rv_camper'
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  
  // Location
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  
  // Details
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  amenities: text("amenities").array(), // Array of amenities like ['WiFi', 'Kitchen Access', 'Parking']
  houseRules: text("house_rules"),
  
  // Pricing
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  
  // Availability
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  maxOccupants: integer("max_occupants").default(1),
  
  // Media
  photos: text("photos").array(), // Array of photo URLs
  
  // External links
  airbnbProfileUrl: text("airbnb_profile_url"), // Airbnb host profile URL
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lighthousePropertiesRelations = relations(lighthouseProperties, ({ one, many }) => ({
  host: one(lighthouseProfiles, {
    fields: [lighthouseProperties.hostId],
    references: [lighthouseProfiles.id],
  }),
  matches: many(lighthouseMatches),
}));

export const insertLighthousePropertySchema = createInsertSchema(lighthouseProperties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  availableFrom: z.coerce.date().optional().nullable(),
  availableUntil: z.coerce.date().optional().nullable(),
});
export type InsertLighthouseProperty = z.infer<typeof insertLighthousePropertySchema>;
export type LighthouseProperty = typeof lighthouseProperties.$inferSelect;

// LightHouse matches (connections between seekers and properties)
export const lighthouseMatches = pgTable("lighthouse_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seekerId: varchar("seeker_id").notNull().references(() => lighthouseProfiles.id),
  propertyId: varchar("property_id").notNull().references(() => lighthouseProperties.id),
  
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
  
  // Move dates
  proposedMoveInDate: timestamp("proposed_move_in_date"),
  actualMoveInDate: timestamp("actual_move_in_date"),
  proposedMoveOutDate: timestamp("proposed_move_out_date"),
  actualMoveOutDate: timestamp("actual_move_out_date"),
  
  // Messages/notes
  seekerMessage: text("seeker_message"), // Initial message from seeker
  hostResponse: text("host_response"), // Response from host
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lighthouseMatchesRelations = relations(lighthouseMatches, ({ one }) => ({
  seeker: one(lighthouseProfiles, {
    fields: [lighthouseMatches.seekerId],
    references: [lighthouseProfiles.id],
    relationName: "seeker",
  }),
  property: one(lighthouseProperties, {
    fields: [lighthouseMatches.propertyId],
    references: [lighthouseProperties.id],
  }),
}));

export const insertLighthouseMatchSchema = createInsertSchema(lighthouseMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  proposedMoveInDate: z.coerce.date().optional().nullable(),
  actualMoveInDate: z.coerce.date().optional().nullable(),
  proposedMoveOutDate: z.coerce.date().optional().nullable(),
  actualMoveOutDate: z.coerce.date().optional().nullable(),
});
export type InsertLighthouseMatch = z.infer<typeof insertLighthouseMatchSchema>;
export type LighthouseMatch = typeof lighthouseMatches.$inferSelect;

// LightHouse Announcements
export const lighthouseAnnouncements = pgTable("lighthouse_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLighthouseAnnouncementSchema = createInsertSchema(lighthouseAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertLighthouseAnnouncement = z.infer<typeof insertLighthouseAnnouncementSchema>;
export type LighthouseAnnouncement = typeof lighthouseAnnouncements.$inferSelect;

// LightHouse user blocking system - allows blocking hosts whose properties appear in feed
export const lighthouseBlocks = pgTable("lighthouse_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lighthouseBlocksRelations = relations(lighthouseBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [lighthouseBlocks.userId],
    references: [users.id],
    relationName: "lighthouseBlocker",
  }),
  blocked: one(users, {
    fields: [lighthouseBlocks.blockedUserId],
    references: [users.id],
    relationName: "lighthouseBlocked",
  }),
}));

export const insertLighthouseBlockSchema = createInsertSchema(lighthouseBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertLighthouseBlock = z.infer<typeof insertLighthouseBlockSchema>;
export type LighthouseBlock = typeof lighthouseBlocks.$inferSelect;

// SocketRelay Requests - Users post requests for items they need
export const socketrelayRequests = pgTable("socketrelay_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  description: varchar("description", { length: 140 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, fulfilled, closed
  isPublic: boolean("is_public").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socketrelayRequestsRelations = relations(socketrelayRequests, ({ one, many }) => ({
  creator: one(users, {
    fields: [socketrelayRequests.userId],
    references: [users.id],
  }),
  fulfillments: many(socketrelayFulfillments),
}));

export const insertSocketrelayRequestSchema = createInsertSchema(socketrelayRequests).omit({
  id: true,
  userId: true,
  status: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  description: z.string().min(1, "Description is required").max(140, "Request description must be 140 characters or less"),
  isPublic: z.boolean().optional().default(false),
});

export type InsertSocketrelayRequest = z.infer<typeof insertSocketrelayRequestSchema>;
export type SocketrelayRequest = typeof socketrelayRequests.$inferSelect;

// SocketRelay Fulfillments - When someone clicks "Fulfill" on a request
export const socketrelayFulfillments = pgTable("socketrelay_fulfillments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => socketrelayRequests.id),
  fulfillerUserId: varchar("fulfiller_user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default('active'), // active, completed_success, completed_failure, cancelled
  closedBy: varchar("closed_by").references(() => users.id),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socketrelayFulfillmentsRelations = relations(socketrelayFulfillments, ({ one, many }) => ({
  request: one(socketrelayRequests, {
    fields: [socketrelayFulfillments.requestId],
    references: [socketrelayRequests.id],
  }),
  fulfiller: one(users, {
    fields: [socketrelayFulfillments.fulfillerUserId],
    references: [users.id],
  }),
  closer: one(users, {
    fields: [socketrelayFulfillments.closedBy],
    references: [users.id],
  }),
  messages: many(socketrelayMessages),
}));

export const insertSocketrelayFulfillmentSchema = createInsertSchema(socketrelayFulfillments).omit({
  id: true,
  status: true,
  closedBy: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSocketrelayFulfillment = z.infer<typeof insertSocketrelayFulfillmentSchema>;
export type SocketrelayFulfillment = typeof socketrelayFulfillments.$inferSelect;

// SocketRelay Messages - Chat messages between requester and fulfiller
export const socketrelayMessages = pgTable("socketrelay_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fulfillmentId: varchar("fulfillment_id").notNull().references(() => socketrelayFulfillments.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socketrelayMessagesRelations = relations(socketrelayMessages, ({ one }) => ({
  fulfillment: one(socketrelayFulfillments, {
    fields: [socketrelayMessages.fulfillmentId],
    references: [socketrelayFulfillments.id],
  }),
  sender: one(users, {
    fields: [socketrelayMessages.senderId],
    references: [users.id],
  }),
}));

export const insertSocketrelayMessageSchema = createInsertSchema(socketrelayMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertSocketrelayMessage = z.infer<typeof insertSocketrelayMessageSchema>;
export type SocketrelayMessage = typeof socketrelayMessages.$inferSelect;

// SocketRelay Profiles - User profiles for SocketRelay app
export const socketrelayProfiles = pgTable("socketrelay_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socketrelayProfilesRelations = relations(socketrelayProfiles, ({ one }) => ({
  user: one(users, {
    fields: [socketrelayProfiles.userId],
    references: [users.id],
  }),
}));

export const insertSocketrelayProfileSchema = createInsertSchema(socketrelayProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  city: z.string().min(1, "City is required").max(100, "City must be 100 characters or less"),
  state: z.string().min(1, "State is required").max(100, "State must be 100 characters or less"),
  country: z.string().min(1, "Country is required").max(100, "Country must be 100 characters or less"),
});

export type InsertSocketrelayProfile = z.infer<typeof insertSocketrelayProfileSchema>;
export type SocketrelayProfile = typeof socketrelayProfiles.$inferSelect;

// SocketRelay Announcements
export const socketrelayAnnouncements = pgTable("socketrelay_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocketrelayAnnouncementSchema = createInsertSchema(socketrelayAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertSocketrelayAnnouncement = z.infer<typeof insertSocketrelayAnnouncementSchema>;
export type SocketrelayAnnouncement = typeof socketrelayAnnouncements.$inferSelect;

// ========================================
// DIRECTORY APP TABLES
// ========================================

// Directory profiles - public skill-sharing directory
// NOTE: This schema MUST stay in sync with `schema.sql`'s `directory_profiles` table
// so the full SQL schema can be run directly in the Neon console.
// Personally identifying name/email data comes from the core `users` table only,
// with a narrow exception: for *unclaimed* profiles, admins may optionally store
// a first name directly on the profile record so that the public card shows a
// meaningful label before the profile is claimed. Once claimed, the canonical
// name always comes from the core `users` table.
export const directoryProfiles = pgTable("directory_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Optional while unclaimed; admin can create unclaimed entries
  userId: varchar("user_id").references(() => users.id).unique(),

  description: varchar("description", { length: 140 }).notNull(),

  // Up to three skills; stored as text array
  skills: text("skills").array().notNull().default(sql`ARRAY[]::text[]`),
  // Up to three sectors; stored as text array
  sectors: text("sectors").array().notNull().default(sql`ARRAY[]::text[]`),
  // Up to three job titles; stored as text array
  jobTitles: text("job_titles").array().notNull().default(sql`ARRAY[]::text[]`),

  signalUrl: text("signal_url"),
  quoraUrl: text("quora_url"),

  // Optional first name for unclaimed profiles (admin-entered display label)
  firstName: varchar("first_name", { length: 100 }),

  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),

  // Verification and visibility
  isVerified: boolean("is_verified").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  isClaimed: boolean("is_claimed").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const directoryProfilesRelations = relations(directoryProfiles, ({ one }) => ({
  user: one(users, {
    fields: [directoryProfiles.userId],
    references: [users.id],
  }),
}));

export const insertDirectoryProfileSchema = createInsertSchema(directoryProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isClaimed: true,
}).extend({
  // Make description optional (empty allowed) but still capped at 140
  description: z.string().max(140, "Description must be 140 characters or less").optional().nullable(),
  // Require at least one skill, up to 3
  skills: z.array(z.string()).min(1, "Select at least 1 skill").max(3, "Select up to 3 skills"),
  // Optional sectors, up to 3
  sectors: z.array(z.string()).max(3, "Select up to 3 sectors").optional(),
  // Optional job titles, up to 3
  jobTitles: z.array(z.string()).max(3, "Select up to 3 job titles").optional(),
  signalUrl: z.string().url().optional().nullable(),
  quoraUrl: z.string().url().optional().nullable(),
  // Require country selection per shared standard
  country: z.string().min(1, "Country is required").max(100, "Country must be 100 characters or less"),
  // firstName is allowed only for unclaimed/admin-created profiles; once claimed,
  // the name comes from the core users table.
  firstName: z.string().max(100).optional().nullable(),
  // userId remains optional to allow unclaimed creation by admin
});

export type InsertDirectoryProfile = z.infer<typeof insertDirectoryProfileSchema>;
export type DirectoryProfile = typeof directoryProfiles.$inferSelect;

// Directory Announcements
export const directoryAnnouncements = pgTable("directory_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDirectoryAnnouncementSchema = createInsertSchema(directoryAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertDirectoryAnnouncement = z.infer<typeof insertDirectoryAnnouncementSchema>;
export type DirectoryAnnouncement = typeof directoryAnnouncements.$inferSelect;

// Directory Skills - Admin-managed tags/skills for directory profiles
export const directorySkills = pgTable("directory_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDirectorySkillSchema = createInsertSchema(directorySkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDirectorySkill = z.infer<typeof insertDirectorySkillSchema>;
export type DirectorySkill = typeof directorySkills.$inferSelect;

// ========================================
// SKILLS MANAGEMENT TABLES (Admin-managed hierarchy)
// ========================================

// Skills Sectors - Top level of hierarchy (e.g., "Healthcare", "Technology")
export const skillsSectors = pgTable("skills_sectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  estimatedWorkforceShare: varchar("estimated_workforce_share", { length: 50 }),
  estimatedWorkforceCount: integer("estimated_workforce_count"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillsSectorSchema = createInsertSchema(skillsSectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSkillsSector = z.infer<typeof insertSkillsSectorSchema>;
export type SkillsSector = typeof skillsSectors.$inferSelect;

// Skills Job Titles - Second level (e.g., "Nurse", "Software Engineer")
export const skillsJobTitles = pgTable("skills_job_titles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectorId: varchar("sector_id").notNull().references(() => skillsSectors.id),
  name: varchar("name", { length: 200 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillsJobTitleSchema = createInsertSchema(skillsJobTitles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSkillsJobTitle = z.infer<typeof insertSkillsJobTitleSchema>;
export type SkillsJobTitle = typeof skillsJobTitles.$inferSelect;

// Skills - Third level (e.g., "CPR Certification", "React.js")
export const skillsSkills = pgTable("skills_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobTitleId: varchar("job_title_id").notNull().references(() => skillsJobTitles.id),
  name: varchar("name", { length: 200 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillsSkillSchema = createInsertSchema(skillsSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSkillsSkill = z.infer<typeof insertSkillsSkillSchema>;
export type SkillsSkill = typeof skillsSkills.$inferSelect;

// ========================================
// CHAT GROUPS APP TABLES
// ========================================

export const chatGroups = pgTable("chat_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  signalUrl: text("signal_url").notNull(),
  description: text("description").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatGroupsRelations = relations(chatGroups, ({ one }) => ({
  // No relations needed
}));

export const insertChatGroupSchema = createInsertSchema(chatGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Name is required").max(200, "Name must be 200 characters or less"),
  signalUrl: z.string().url("Must be a valid URL"),
  description: z.string().min(1, "Description is required"),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type InsertChatGroup = z.infer<typeof insertChatGroupSchema>;
export type ChatGroup = typeof chatGroups.$inferSelect;

// ChatGroups Announcements
export const chatgroupsAnnouncements = pgTable("chatgroups_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatgroupsAnnouncementSchema = createInsertSchema(chatgroupsAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertChatgroupsAnnouncement = z.infer<typeof insertChatgroupsAnnouncementSchema>;
export type ChatgroupsAnnouncement = typeof chatgroupsAnnouncements.$inferSelect;

// ========================================
// TRUSTTRANSPORT APP TABLES
// ========================================

// TrustTransport driver profiles
export const trusttransportProfiles = pgTable("trusttransport_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  
  isDriver: boolean("is_driver").notNull().default(false),
  isRider: boolean("is_rider").notNull().default(true),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  
  // Vehicle information
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleYear: integer("vehicle_year"),
  vehicleColor: varchar("vehicle_color", { length: 50 }),
  licensePlate: varchar("license_plate", { length: 20 }),
  
  // Driver information
  bio: text("bio"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  signalUrl: text("signal_url"),
  
  // Verification and availability
  isVerified: boolean("is_verified").default(false).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trusttransportProfilesRelations = relations(trusttransportProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [trusttransportProfiles.userId],
    references: [users.id],
  }),
  rideRequests: many(trusttransportRideRequests, { relationName: "rider" }),
  claimedRequests: many(trusttransportRideRequests, { relationName: "driver" }),
}));

export const insertTrusttransportProfileSchema = createInsertSchema(trusttransportProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isDriver: z.boolean().default(false),
  isRider: z.boolean().default(true),
  city: z.string().min(1, "City is required").max(100, "City must be 100 characters or less"),
  state: z.string().min(1, "State is required").max(100, "State must be 100 characters or less"),
  country: z.string().min(1, "Country is required").max(100, "Country must be 100 characters or less"),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  signalUrl: z.string().optional().nullable().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL" }
  ).transform(val => val === "" ? null : val),
});

export type InsertTrusttransportProfile = z.infer<typeof insertTrusttransportProfileSchema>;
export type TrusttransportProfile = typeof trusttransportProfiles.$inferSelect;

// TrustTransport ride requests (standalone requests that drivers can claim)
export const trusttransportRideRequests = pgTable("trusttransport_ride_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Rider who created the request
  riderId: varchar("rider_id").notNull().references(() => users.id),
  
  // Driver who claimed the request (null until claimed)
  driverId: varchar("driver_id").references(() => trusttransportProfiles.id),
  
  // Location
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupCity: varchar("pickup_city", { length: 100 }).notNull(),
  pickupState: varchar("pickup_state", { length: 100 }),
  dropoffCity: varchar("dropoff_city", { length: 100 }).notNull(),
  dropoffState: varchar("dropoff_state", { length: 100 }),
  
  // Scheduling
  departureDateTime: timestamp("departure_date_time").notNull(),
  
  // Request criteria
  requestedSeats: integer("requested_seats").notNull().default(1),
  requestedCarType: varchar("requested_car_type", { length: 50 }), // e.g., "sedan", "suv", "van", "truck", null = any
  requiresHeat: boolean("requires_heat").notNull().default(false),
  requiresAC: boolean("requires_ac").notNull().default(false),
  requiresWheelchairAccess: boolean("requires_wheelchair_access").notNull().default(false),
  requiresChildSeat: boolean("requires_child_seat").notNull().default(false),
  
  // Additional preferences/notes
  riderMessage: text("rider_message"), // Notes from rider
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('open'), // 'open', 'claimed', 'completed', 'cancelled', 'expired'
  
  // Driver response (when claiming)
  driverMessage: text("driver_message"), // Message from driver when claiming
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trusttransportRideRequestsRelations = relations(trusttransportRideRequests, ({ one }) => ({
  rider: one(users, {
    fields: [trusttransportRideRequests.riderId],
    references: [users.id],
  }),
  driver: one(trusttransportProfiles, {
    fields: [trusttransportRideRequests.driverId],
    references: [trusttransportProfiles.id],
    relationName: "driver",
  }),
}));

export const insertTrusttransportRideRequestSchema = createInsertSchema(trusttransportRideRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  riderId: true, // Added by server from authenticated user
  driverId: true,
  status: true,
  driverMessage: true,
}).extend({
  departureDateTime: z.coerce.date(),
  requestedSeats: z.number().int().min(1, "At least 1 seat is required"),
  requestedCarType: z.enum(["sedan", "suv", "van", "truck"]).optional().nullable(),
  requiresHeat: z.boolean().default(false),
  requiresAC: z.boolean().default(false),
  requiresWheelchairAccess: z.boolean().default(false),
  requiresChildSeat: z.boolean().default(false),
  riderMessage: z.string().optional().nullable(),
});

export type InsertTrusttransportRideRequest = z.infer<typeof insertTrusttransportRideRequestSchema>;
export type TrusttransportRideRequest = typeof trusttransportRideRequests.$inferSelect;

// TrustTransport Announcements
export const trusttransportAnnouncements = pgTable("trusttransport_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTrusttransportAnnouncementSchema = createInsertSchema(trusttransportAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["info", "warning", "maintenance", "update", "promotion"]),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertTrusttransportAnnouncement = z.infer<typeof insertTrusttransportAnnouncementSchema>;
export type TrusttransportAnnouncement = typeof trusttransportAnnouncements.$inferSelect;

// TrustTransport user blocking system - allows blocking users they've interacted with
export const trusttransportBlocks = pgTable("trusttransport_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trusttransportBlocksRelations = relations(trusttransportBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [trusttransportBlocks.userId],
    references: [users.id],
    relationName: "trusttransportBlocker",
  }),
  blocked: one(users, {
    fields: [trusttransportBlocks.blockedUserId],
    references: [users.id],
    relationName: "trusttransportBlocked",
  }),
}));

export const insertTrusttransportBlockSchema = createInsertSchema(trusttransportBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertTrusttransportBlock = z.infer<typeof insertTrusttransportBlockSchema>;
export type TrusttransportBlock = typeof trusttransportBlocks.$inferSelect;

// ========================================
// PROFILE DELETION LOG TABLE
// ========================================

// Logs all profile deletions for auditing and analytics
export const profileDeletionLogs = pgTable("profile_deletion_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // Original user ID before deletion
  appName: varchar("app_name", { length: 50 }).notNull(), // supportmatch, lighthouse, socketrelay, directory, trusttransport, mechanicmatch
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  reason: text("reason"), // Optional reason provided by user
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profileDeletionLogsRelations = relations(profileDeletionLogs, ({ one }) => ({
  user: one(users, {
    fields: [profileDeletionLogs.userId],
    references: [users.id],
  }),
}));

export const insertProfileDeletionLogSchema = createInsertSchema(profileDeletionLogs).omit({
  id: true,
  deletedAt: true,
  createdAt: true,
});

export type InsertProfileDeletionLog = z.infer<typeof insertProfileDeletionLogSchema>;
export type ProfileDeletionLog = typeof profileDeletionLogs.$inferSelect;

// ========================================
// NPS (NET PROMOTER SCORE) SURVEY
// ========================================

export const npsResponses = pgTable("nps_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(), // 0-10 scale
  responseMonth: varchar("response_month", { length: 7 }).notNull(), // YYYY-MM format for tracking monthly
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const npsResponsesRelations = relations(npsResponses, ({ one }) => ({
  user: one(users, {
    fields: [npsResponses.userId],
    references: [users.id],
  }),
}));

export const insertNpsResponseSchema = createInsertSchema(npsResponses).omit({
  id: true,
  createdAt: true,
}).extend({
  score: z.number().int().min(0).max(10),
  responseMonth: z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
});

export type InsertNpsResponse = z.infer<typeof insertNpsResponseSchema>;
export type NpsResponse = typeof npsResponses.$inferSelect;

// ========================================
// MECHANICMATCH APP TABLES
// ========================================

// MechanicMatch Profiles (users can be both car owners and mechanics)
export const mechanicmatchProfiles = pgTable("mechanicmatch_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Optional while unclaimed; admin can create unclaimed entries
  userId: varchar("user_id").unique().references(() => users.id),
  
  // Role flags
  isCarOwner: boolean("is_car_owner").notNull().default(false),
  isMechanic: boolean("is_mechanic").notNull().default(false),
  
  // Common fields
  firstName: varchar("first_name", { length: 100 }), // First name for unclaimed profiles (admin-entered)
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  signalUrl: text("signal_url"), // Link to Signal profile
  
  // Car Owner specific fields
  ownerBio: text("owner_bio"),
  
  // Mechanic specific fields
  mechanicBio: text("mechanic_bio"),
  experience: integer("experience"), // Years of experience
  shopLocation: text("shop_location"), // Physical shop address
  isMobileMechanic: boolean("is_mobile_mechanic").notNull().default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }), // Hourly rate in dollars
  specialties: text("specialties"), // Comma-separated list or JSON array of specialties (e.g., "Engine Repair, Transmission, Brakes")
  certifications: text("certifications"), // JSON array of certifications
  sampleJobs: text("sample_jobs"), // JSON array of sample job descriptions/photos
  portfolioPhotos: text("portfolio_photos"), // JSON array of photo URLs
  responseTimeHours: integer("response_time_hours"), // Average response time in hours
  totalJobsCompleted: integer("total_jobs_completed").notNull().default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Average rating (0-5)
  
  // Verification and visibility
  isVerified: boolean("is_verified").default(false).notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  isClaimed: boolean("is_claimed").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchProfilesRelations = relations(mechanicmatchProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [mechanicmatchProfiles.userId],
    references: [users.id],
  }),
  vehicles: many(mechanicmatchVehicles, { relationName: "owner" }),
  serviceRequests: many(mechanicmatchServiceRequests, { relationName: "owner" }),
  jobsAsOwner: many(mechanicmatchJobs, { relationName: "owner" }),
  jobsAsMechanic: many(mechanicmatchJobs, { relationName: "mechanic" }),
  availability: many(mechanicmatchAvailability),
  reviewsGiven: many(mechanicmatchReviews, { relationName: "reviewer" }),
  reviewsReceived: many(mechanicmatchReviews, { relationName: "reviewee" }),
}));

export const insertMechanicmatchProfileSchema = createInsertSchema(mechanicmatchProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalJobsCompleted: true,
}).extend({
  // userId is optional to allow unclaimed profile creation by admin
  // Follow the same pattern as directory profiles - allow null for unclaimed profiles
  userId: z.string().optional().nullable(),
  isCarOwner: z.boolean().default(false),
  isMechanic: z.boolean().default(false),
  firstName: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  signalUrl: z.string().optional().nullable().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL" }
  ).transform(val => val === "" ? null : val),
  ownerBio: z.string().optional().nullable(),
  mechanicBio: z.string().optional().nullable(),
  experience: z.number().int().min(0).max(100).optional().nullable(),
  shopLocation: z.string().optional().nullable(),
  isMobileMechanic: z.boolean().default(false),
  hourlyRate: z.coerce.number().min(0).max(10000).optional().nullable(),
  specialties: z.string().optional().nullable(), // Will store as JSON string
  certifications: z.string().optional().nullable(), // Will store as JSON string
  sampleJobs: z.string().optional().nullable(), // Will store as JSON string
  portfolioPhotos: z.string().optional().nullable(), // Will store as JSON string
  responseTimeHours: z.number().int().min(0).optional().nullable(),
  averageRating: z.coerce.number().min(0).max(5).optional().nullable(),
  isPublic: z.boolean().default(false),
  isClaimed: z.boolean().default(false),
});

export type InsertMechanicmatchProfile = z.infer<typeof insertMechanicmatchProfileSchema>;
export type MechanicmatchProfile = typeof mechanicmatchProfiles.$inferSelect;

// Vehicles owned by car owners
export const mechanicmatchVehicles = pgTable("mechanicmatch_vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id), // Reference to user, not profile
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchVehiclesRelations = relations(mechanicmatchVehicles, ({ one }) => ({
  owner: one(mechanicmatchProfiles, {
    fields: [mechanicmatchVehicles.ownerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "owner",
  }),
}));

export const insertMechanicmatchVehicleSchema = createInsertSchema(mechanicmatchVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true, // Added by server from authenticated user
}).extend({
  make: z.string().min(1, "Make is required").max(50, "Make must be 50 characters or less"),
  model: z.string().min(1, "Model is required").max(100, "Model must be 100 characters or less"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
});

export type InsertMechanicmatchVehicle = z.infer<typeof insertMechanicmatchVehicleSchema>;
export type MechanicmatchVehicle = typeof mechanicmatchVehicles.$inferSelect;

// Service requests posted by car owners
export const mechanicmatchServiceRequests = pgTable("mechanicmatch_service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id), // Reference to user
  vehicleId: varchar("vehicle_id").references(() => mechanicmatchVehicles.id), // Optional - can be null if vehicle not in system
  
  // Request details
  symptoms: text("symptoms").notNull(),
  photos: text("photos"), // JSON array of photo URLs
  videoUrl: text("video_url"), // URL to short video
  estimatedLocation: text("estimated_location"), // Location for service
  
  // Request type
  requestType: varchar("request_type", { length: 20 }).notNull(), // 'advice_only', 'remote_diagnosis', 'in_person'
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('open'), // 'open', 'accepted', 'in_progress', 'completed', 'cancelled'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchServiceRequestsRelations = relations(mechanicmatchServiceRequests, ({ one }) => ({
  owner: one(mechanicmatchProfiles, {
    fields: [mechanicmatchServiceRequests.ownerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "owner",
  }),
  vehicle: one(mechanicmatchVehicles, {
    fields: [mechanicmatchServiceRequests.vehicleId],
    references: [mechanicmatchVehicles.id],
  }),
}));

export const insertMechanicmatchServiceRequestSchema = createInsertSchema(mechanicmatchServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true, // Added by server from authenticated user
  status: true,
}).extend({
  vehicleId: z.string().uuid().optional().nullable(),
  symptoms: z.string().min(1, "Symptoms description is required"),
  photos: z.string().optional().nullable(), // JSON string
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  estimatedLocation: z.string().optional().nullable(),
  requestType: z.enum(["advice_only", "remote_diagnosis", "in_person"]),
});

export type InsertMechanicmatchServiceRequest = z.infer<typeof insertMechanicmatchServiceRequestSchema>;
export type MechanicmatchServiceRequest = typeof mechanicmatchServiceRequests.$inferSelect;

// Jobs/Bookings (created when mechanic accepts a service request or when booked directly)
export const mechanicmatchJobs = pgTable("mechanicmatch_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").references(() => mechanicmatchServiceRequests.id), // Nullable if direct booking
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  mechanicId: varchar("mechanic_id").notNull().references(() => mechanicmatchProfiles.id),
  
  // Job details
  vehicleId: varchar("vehicle_id").references(() => mechanicmatchVehicles.id),
  symptoms: text("symptoms").notNull(),
  photos: text("photos"), // JSON array
  videoUrl: text("video_url"),
  location: text("location"),
  
  // Job type
  jobType: varchar("job_type", { length: 20 }).notNull(), // 'advice_only', 'remote_diagnosis', 'in_person'
  
  // Scheduling
  scheduledDateTime: timestamp("scheduled_date_time"), // For in-person bookings
  
  // Pricing (for remote diagnosis - per minute)
  ratePerMinute: decimal("rate_per_minute", { precision: 10, scale: 2 }),
  minutesUsed: integer("minutes_used"), // For remote diagnosis sessions
  
  // Job lifecycle
  status: varchar("status", { length: 20 }).notNull().default('requested'), // 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'
  
  // Completion
  mechanicNotes: text("mechanic_notes"),
  ownerNotes: text("owner_notes"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchJobsRelations = relations(mechanicmatchJobs, ({ one }) => ({
  serviceRequest: one(mechanicmatchServiceRequests, {
    fields: [mechanicmatchJobs.serviceRequestId],
    references: [mechanicmatchServiceRequests.id],
  }),
  owner: one(mechanicmatchProfiles, {
    fields: [mechanicmatchJobs.ownerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "owner",
  }),
  mechanic: one(mechanicmatchProfiles, {
    fields: [mechanicmatchJobs.mechanicId],
    references: [mechanicmatchProfiles.id],
    relationName: "mechanic",
  }),
  vehicle: one(mechanicmatchVehicles, {
    fields: [mechanicmatchJobs.vehicleId],
    references: [mechanicmatchVehicles.id],
  }),
}));

export const insertMechanicmatchJobSchema = createInsertSchema(mechanicmatchJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  completedAt: true,
  ownerId: true, // Added by server from authenticated user
}).extend({
  serviceRequestId: z.string().uuid().optional().nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
  symptoms: z.string().min(1, "Symptoms description is required"),
  photos: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().optional().nullable(),
  jobType: z.enum(["advice_only", "remote_diagnosis", "in_person"]),
  scheduledDateTime: z.coerce.date().optional().nullable(),
  ratePerMinute: z.coerce.number().min(0).max(100).optional().nullable(),
  minutesUsed: z.number().int().min(0).optional().nullable(),
  mechanicNotes: z.string().optional().nullable(),
  ownerNotes: z.string().optional().nullable(),
  mechanicId: z.string().uuid(), // Required - the mechanic creating/accepting the job
});

export type InsertMechanicmatchJob = z.infer<typeof insertMechanicmatchJobSchema>;
export type MechanicmatchJob = typeof mechanicmatchJobs.$inferSelect;

// Mechanic availability schedule
export const mechanicmatchAvailability = pgTable("mechanicmatch_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mechanicId: varchar("mechanic_id").notNull().references(() => mechanicmatchProfiles.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: varchar("start_time", { length: 5 }), // HH:MM format (e.g., "09:00")
  endTime: varchar("end_time", { length: 5 }), // HH:MM format (e.g., "17:00")
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchAvailabilityRelations = relations(mechanicmatchAvailability, ({ one }) => ({
  mechanic: one(mechanicmatchProfiles, {
    fields: [mechanicmatchAvailability.mechanicId],
    references: [mechanicmatchProfiles.id],
  }),
}));

export const insertMechanicmatchAvailabilitySchema = createInsertSchema(mechanicmatchAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(), // HH:MM format
  isAvailable: z.boolean().default(true),
});

export type InsertMechanicmatchAvailability = z.infer<typeof insertMechanicmatchAvailabilitySchema>;
export type MechanicmatchAvailability = typeof mechanicmatchAvailability.$inferSelect;

// Reviews/ratings
export const mechanicmatchReviews = pgTable("mechanicmatch_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => mechanicmatchJobs.id), // Optional - can review without job
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id), // User who wrote the review
  revieweeId: varchar("reviewee_id").notNull().references(() => mechanicmatchProfiles.id), // Profile being reviewed (mechanic or owner)
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchReviewsRelations = relations(mechanicmatchReviews, ({ one }) => ({
  job: one(mechanicmatchJobs, {
    fields: [mechanicmatchReviews.jobId],
    references: [mechanicmatchJobs.id],
  }),
  reviewer: one(mechanicmatchProfiles, {
    fields: [mechanicmatchReviews.reviewerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "reviewer",
  }),
  reviewee: one(mechanicmatchProfiles, {
    fields: [mechanicmatchReviews.revieweeId],
    references: [mechanicmatchProfiles.id],
    relationName: "reviewee",
  }),
}));

export const insertMechanicmatchReviewSchema = createInsertSchema(mechanicmatchReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewerId: true, // Added by server from authenticated user
}).extend({
  jobId: z.string().uuid().optional().nullable(),
  revieweeId: z.string().uuid(), // Required - the profile being reviewed (mechanic or owner)
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export type InsertMechanicmatchReview = z.infer<typeof insertMechanicmatchReviewSchema>;
export type MechanicmatchReview = typeof mechanicmatchReviews.$inferSelect;

// Messages between car owners and mechanics
export const mechanicmatchMessages = pgTable("mechanicmatch_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => mechanicmatchJobs.id), // Optional - can message outside of job context
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mechanicmatchMessagesRelations = relations(mechanicmatchMessages, ({ one }) => ({
  job: one(mechanicmatchJobs, {
    fields: [mechanicmatchMessages.jobId],
    references: [mechanicmatchJobs.id],
  }),
  sender: one(users, {
    fields: [mechanicmatchMessages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [mechanicmatchMessages.recipientId],
    references: [users.id],
  }),
}));

export const insertMechanicmatchMessageSchema = createInsertSchema(mechanicmatchMessages).omit({
  id: true,
  createdAt: true,
  senderId: true, // Added by server from authenticated user
}).extend({
  jobId: z.string().uuid().optional().nullable(),
  content: z.string().min(1, "Message content is required"),
  isRead: z.boolean().default(false),
});

export type InsertMechanicmatchMessage = z.infer<typeof insertMechanicmatchMessageSchema>;
export type MechanicmatchMessage = typeof mechanicmatchMessages.$inferSelect;

// MechanicMatch Announcements
export const mechanicmatchAnnouncements = pgTable("mechanicmatch_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMechanicmatchAnnouncementSchema = createInsertSchema(mechanicmatchAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["info", "warning", "maintenance", "update", "promotion"]),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertMechanicmatchAnnouncement = z.infer<typeof insertMechanicmatchAnnouncementSchema>;
export type MechanicmatchAnnouncement = typeof mechanicmatchAnnouncements.$inferSelect;

// MechanicMatch user blocking system - allows blocking mechanics that appear in feed or have interacted
export const mechanicmatchBlocks = pgTable("mechanicmatch_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mechanicmatchBlocksRelations = relations(mechanicmatchBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [mechanicmatchBlocks.userId],
    references: [users.id],
    relationName: "mechanicmatchBlocker",
  }),
  blocked: one(users, {
    fields: [mechanicmatchBlocks.blockedUserId],
    references: [users.id],
    relationName: "mechanicmatchBlocked",
  }),
}));

export const insertMechanicmatchBlockSchema = createInsertSchema(mechanicmatchBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertMechanicmatchBlock = z.infer<typeof insertMechanicmatchBlockSchema>;
export type MechanicmatchBlock = typeof mechanicmatchBlocks.$inferSelect;

// ========================================
// LOSTMAIL APP TABLES
// ========================================

// LostMail Incidents
export const lostmailIncidents = pgTable("lostmail_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reporter information
  reporterName: varchar("reporter_name", { length: 200 }).notNull(),
  reporterEmail: varchar("reporter_email", { length: 255 }).notNull(),
  reporterPhone: varchar("reporter_phone", { length: 50 }),
  
  // Incident details
  incidentType: varchar("incident_type", { length: 50 }).notNull(), // 'lost', 'damaged', 'tampered', 'delayed'
  carrier: varchar("carrier", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date").notNull(),
  noticedDate: timestamp("noticed_date"),
  description: text("description").notNull(),
  
  // Photos (stored as JSON array of file paths)
  photos: text("photos"), // JSON array of photo file paths
  
  // Incident management
  severity: varchar("severity", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high'
  status: varchar("status", { length: 20 }).notNull().default('submitted'), // 'submitted', 'under_review', 'in_progress', 'resolved', 'closed'
  
  // Consent and assignment
  consent: boolean("consent").notNull().default(false),
  assignedTo: varchar("assigned_to", { length: 200 }), // Admin name or user ID
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lostmailIncidentsRelations = relations(lostmailIncidents, ({ many }) => ({
  auditTrail: many(lostmailAuditTrail),
}));

export const insertLostmailIncidentSchema = createInsertSchema(lostmailIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  reporterName: z.string().min(1, "Reporter name is required").max(200, "Name must be 200 characters or less"),
  reporterEmail: z.string().email("Valid email is required").max(255, "Email must be 255 characters or less"),
  reporterPhone: z.string().max(50).optional().nullable(),
  incidentType: z.enum(["lost", "damaged", "tampered", "delayed"]),
  carrier: z.string().max(100).optional().nullable(),
  trackingNumber: z.string().min(1, "Tracking number is required").max(100, "Tracking number must be 100 characters or less"),
  expectedDeliveryDate: z.coerce.date(),
  noticedDate: z.coerce.date().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  photos: z.string().optional().nullable(), // JSON string array
  severity: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["submitted", "under_review", "in_progress", "resolved", "closed"]).default("submitted"),
  consent: z.boolean().default(false),
  assignedTo: z.string().max(200).optional().nullable(),
});

export type InsertLostmailIncident = z.infer<typeof insertLostmailIncidentSchema>;
export type LostmailIncident = typeof lostmailIncidents.$inferSelect;

// LostMail Audit Trail
export const lostmailAuditTrail = pgTable("lostmail_audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => lostmailIncidents.id),
  adminName: varchar("admin_name", { length: 200 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // 'status_change', 'note_added', 'assigned', etc.
  note: text("note"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const lostmailAuditTrailRelations = relations(lostmailAuditTrail, ({ one }) => ({
  incident: one(lostmailIncidents, {
    fields: [lostmailAuditTrail.incidentId],
    references: [lostmailIncidents.id],
  }),
}));

export const insertLostmailAuditTrailSchema = createInsertSchema(lostmailAuditTrail).omit({
  id: true,
  timestamp: true,
}).extend({
  adminName: z.string().min(1, "Admin name is required").max(200),
  action: z.string().min(1, "Action is required").max(50),
  note: z.string().optional().nullable(),
});

export type InsertLostmailAuditTrail = z.infer<typeof insertLostmailAuditTrailSchema>;
export type LostmailAuditTrail = typeof lostmailAuditTrail.$inferSelect;

// LostMail Announcements
export const lostmailAnnouncements = pgTable("lostmail_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLostmailAnnouncementSchema = createInsertSchema(lostmailAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertLostmailAnnouncement = z.infer<typeof insertLostmailAnnouncementSchema>;
export type LostmailAnnouncement = typeof lostmailAnnouncements.$inferSelect;

// ========================================
// RESEARCH APP TABLES
// ========================================

// Research Items (questions/posts)
export const researchItems = pgTable("research_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 300 }).notNull(),
  bodyMd: text("body_md").notNull(),
  tags: text("tags"), // JSON array of strings
  attachments: text("attachments"), // JSON array of file paths/URLs
  deadline: timestamp("deadline"),
  isPublic: boolean("is_public").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("open"), // open, in_progress, answered, closed
  acceptedAnswerId: varchar("accepted_answer_id"),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchItemsRelations = relations(researchItems, ({ one, many }) => ({
  user: one(users, {
    fields: [researchItems.userId],
    references: [users.id],
  }),
  acceptedAnswer: one(researchAnswers, {
    fields: [researchItems.acceptedAnswerId],
    references: [researchAnswers.id],
  }),
  answers: many(researchAnswers),
  comments: many(researchComments),
  votes: many(researchVotes),
  bookmarks: many(researchBookmarks),
  reports: many(researchReports),
}));

export const insertResearchItemSchema = createInsertSchema(researchItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  acceptedAnswerId: true,
}).extend({
  title: z.string().min(1, "Title is required").max(300, "Title must be 300 characters or less"),
  bodyMd: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
  isPublic: z.boolean().default(false),
  status: z.enum(["open", "in_progress", "answered", "closed"]).default("open"),
});

export type InsertResearchItem = z.infer<typeof insertResearchItemSchema>;
export type ResearchItem = typeof researchItems.$inferSelect;

// Research Answers
export const researchAnswers = pgTable("research_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  researchItemId: varchar("research_item_id").notNull().references(() => researchItems.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  bodyMd: text("body_md").notNull(),
  links: text("links"), // JSON array of URLs
  attachments: text("attachments"), // JSON array of file paths/URLs
  confidenceScore: integer("confidence_score"), // 0-100
  score: integer("score").default(0).notNull(), // Calculated from votes
  isAccepted: boolean("is_accepted").default(false).notNull(),
  relevanceScore: numeric("relevance_score", { precision: 10, scale: 6 }), // Calculated relevance
  verificationScore: numeric("verification_score", { precision: 10, scale: 6 }), // Link verification score
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchAnswersRelations = relations(researchAnswers, ({ one, many }) => ({
  researchItem: one(researchItems, {
    fields: [researchAnswers.researchItemId],
    references: [researchItems.id],
  }),
  user: one(users, {
    fields: [researchAnswers.userId],
    references: [users.id],
  }),
  comments: many(researchComments),
  votes: many(researchVotes),
  linkProvenances: many(researchLinkProvenances),
}));

export const insertResearchAnswerSchema = createInsertSchema(researchAnswers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  score: true,
  isAccepted: true,
  relevanceScore: true,
  verificationScore: true,
}).extend({
  bodyMd: z.string().min(1, "Answer is required"),
  links: z.array(z.string().url()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  confidenceScore: z.number().int().min(0).max(100).optional().nullable(),
});

export type InsertResearchAnswer = z.infer<typeof insertResearchAnswerSchema>;
export type ResearchAnswer = typeof researchAnswers.$inferSelect;

// Research Comments (nested one level)
export const researchComments = pgTable("research_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  answerId: varchar("answer_id").references(() => researchAnswers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  bodyMd: text("body_md").notNull(),
  parentCommentId: varchar("parent_comment_id"), // For one-level nesting
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchCommentsRelations = relations(researchComments, ({ one, many }) => ({
  researchItem: one(researchItems, {
    fields: [researchComments.researchItemId],
    references: [researchItems.id],
  }),
  answer: one(researchAnswers, {
    fields: [researchComments.answerId],
    references: [researchAnswers.id],
  }),
  user: one(users, {
    fields: [researchComments.userId],
    references: [users.id],
  }),
  parentComment: one(researchComments, {
    fields: [researchComments.parentCommentId],
    references: [researchComments.id],
  }),
  replies: many(researchComments),
}));

export const insertResearchCommentSchema = createInsertSchema(researchComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  bodyMd: z.string().min(1, "Comment is required"),
  researchItemId: z.string().optional().nullable(),
  answerId: z.string().optional().nullable(),
  parentCommentId: z.string().optional().nullable(),
});

export type InsertResearchComment = z.infer<typeof insertResearchCommentSchema>;
export type ResearchComment = typeof researchComments.$inferSelect;

// Research Votes
export const researchVotes = pgTable("research_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  answerId: varchar("answer_id").references(() => researchAnswers.id),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchVotesRelations = relations(researchVotes, ({ one }) => ({
  user: one(users, {
    fields: [researchVotes.userId],
    references: [users.id],
  }),
  researchItem: one(researchItems, {
    fields: [researchVotes.researchItemId],
    references: [researchItems.id],
  }),
  answer: one(researchAnswers, {
    fields: [researchVotes.answerId],
    references: [researchAnswers.id],
  }),
}));

export const insertResearchVoteSchema = createInsertSchema(researchVotes).omit({
  id: true,
  createdAt: true,
}).extend({
  researchItemId: z.string().optional().nullable(),
  answerId: z.string().optional().nullable(),
  value: z.enum(["-1", "1"]),
});

export type InsertResearchVote = z.infer<typeof insertResearchVoteSchema>;
export type ResearchVote = typeof researchVotes.$inferSelect;

// Link Provenance (for link verification)
export const researchLinkProvenances = pgTable("research_link_provenances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  answerId: varchar("answer_id").notNull().references(() => researchAnswers.id),
  url: varchar("url", { length: 2048 }).notNull(),
  httpStatus: integer("http_status"),
  title: text("title"),
  snippet: text("snippet"),
  domain: varchar("domain", { length: 255 }),
  domainScore: numeric("domain_score", { precision: 5, scale: 2 }), // 0-1 trust score
  fetchDate: timestamp("fetch_date").defaultNow(),
  similarityScore: numeric("similarity_score", { precision: 5, scale: 4 }), // 0-1 similarity to claim
  isSupportive: boolean("is_supportive").default(false), // True if similarity > threshold and domain_score > threshold
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchLinkProvenancesRelations = relations(researchLinkProvenances, ({ one }) => ({
  answer: one(researchAnswers, {
    fields: [researchLinkProvenances.answerId],
    references: [researchAnswers.id],
  }),
}));

export const insertResearchLinkProvenanceSchema = createInsertSchema(researchLinkProvenances).omit({
  id: true,
  createdAt: true,
  fetchDate: true,
}).extend({
  url: z.string().url(),
  httpStatus: z.number().int().optional().nullable(),
  domainScore: z.number().min(0).max(1).optional().nullable(),
  similarityScore: z.number().min(0).max(1).optional().nullable(),
});

export type InsertResearchLinkProvenance = z.infer<typeof insertResearchLinkProvenanceSchema>;
export type ResearchLinkProvenance = typeof researchLinkProvenances.$inferSelect;

// Research Bookmarks/Saves
export const researchBookmarks = pgTable("research_bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  researchItemId: varchar("research_item_id").notNull().references(() => researchItems.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchBookmarksRelations = relations(researchBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [researchBookmarks.userId],
    references: [users.id],
  }),
  researchItem: one(researchItems, {
    fields: [researchBookmarks.researchItemId],
    references: [researchItems.id],
  }),
}));

export const insertResearchBookmarkSchema = createInsertSchema(researchBookmarks).omit({
  id: true,
  createdAt: true,
});

export type InsertResearchBookmark = z.infer<typeof insertResearchBookmarkSchema>;
export type ResearchBookmark = typeof researchBookmarks.$inferSelect;

// Research Follows
export const researchFollows = pgTable("research_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  followedUserId: varchar("followed_user_id").references(() => users.id),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  tag: varchar("tag", { length: 100 }), // Follow a tag
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchFollowsRelations = relations(researchFollows, ({ one }) => ({
  user: one(users, {
    fields: [researchFollows.userId],
    references: [users.id],
  }),
  followedUser: one(users, {
    fields: [researchFollows.followedUserId],
    references: [users.id],
  }),
  researchItem: one(researchItems, {
    fields: [researchFollows.researchItemId],
    references: [researchItems.id],
  }),
}));

export const insertResearchFollowSchema = createInsertSchema(researchFollows).omit({
  id: true,
  createdAt: true,
}).extend({
  followedUserId: z.string().optional().nullable(),
  researchItemId: z.string().optional().nullable(),
  tag: z.string().optional().nullable(),
});

export type InsertResearchFollow = z.infer<typeof insertResearchFollowSchema>;
export type ResearchFollow = typeof researchFollows.$inferSelect;

// Research Reports (moderation)
export const researchReports = pgTable("research_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  answerId: varchar("answer_id").references(() => researchAnswers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, reviewed, resolved, dismissed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

export const researchReportsRelations = relations(researchReports, ({ one }) => ({
  researchItem: one(researchItems, {
    fields: [researchReports.researchItemId],
    references: [researchItems.id],
  }),
  answer: one(researchAnswers, {
    fields: [researchReports.answerId],
    references: [researchAnswers.id],
  }),
  user: one(users, {
    fields: [researchReports.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [researchReports.reviewedBy],
    references: [users.id],
  }),
}));

export const insertResearchReportSchema = createInsertSchema(researchReports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
}).extend({
  researchItemId: z.string().optional().nullable(),
  answerId: z.string().optional().nullable(),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).default("pending"),
});

export type InsertResearchReport = z.infer<typeof insertResearchReportSchema>;
export type ResearchReport = typeof researchReports.$inferSelect;

// Research Announcements
export const researchAnnouncements = pgTable("research_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResearchAnnouncementSchema = createInsertSchema(researchAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertResearchAnnouncement = z.infer<typeof insertResearchAnnouncementSchema>;
export type ResearchAnnouncement = typeof researchAnnouncements.$inferSelect;

// ========================================
// GENTLEPULSE APP TABLES
// ========================================

// GentlePulse Meditations
export const gentlepulseMeditations = pgTable("gentlepulse_meditations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  thumbnail: varchar("thumbnail", { length: 500 }),
  wistiaUrl: varchar("wistia_url", { length: 500 }).notNull(),
  tags: text("tags"), // JSON array of strings
  duration: integer("duration"), // Duration in minutes
  playCount: integer("play_count").default(0).notNull(), // Aggregated play count
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Calculated average
  ratingCount: integer("rating_count").default(0).notNull(), // Number of ratings
  position: integer("position").default(0).notNull(), // For sorting
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGentlepulseMeditationSchema = createInsertSchema(gentlepulseMeditations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  playCount: true,
  averageRating: true,
  ratingCount: true,
}).extend({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional().nullable(),
  wistiaUrl: z.string().url("Wistia URL must be a valid URL"),
  duration: z.number().int().positive().optional().nullable(),
});

export type InsertGentlepulseMeditation = z.infer<typeof insertGentlepulseMeditationSchema>;
export type GentlepulseMeditation = typeof gentlepulseMeditations.$inferSelect;

// GentlePulse Ratings (anonymous, using clientId)
export const gentlepulseRatings = pgTable("gentlepulse_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meditationId: varchar("meditation_id").notNull().references(() => gentlepulseMeditations.id),
  clientId: varchar("client_id", { length: 100 }).notNull(), // Random UUID from client
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGentlepulseRatingSchema = createInsertSchema(gentlepulseRatings).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().int().min(1).max(5),
  clientId: z.string().min(1),
});

export type InsertGentlepulseRating = z.infer<typeof insertGentlepulseRatingSchema>;
export type GentlepulseRating = typeof gentlepulseRatings.$inferSelect;

// GentlePulse Mood Checks (anonymous, using clientId)
export const gentlepulseMoodChecks = pgTable("gentlepulse_mood_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id", { length: 100 }).notNull(), // Random UUID from client
  moodValue: integer("mood_value").notNull(), // 1-5 (very sad to very happy)
  date: date("date").notNull(), // Date of mood check (ISO date)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGentlepulseMoodCheckSchema = createInsertSchema(gentlepulseMoodChecks).omit({
  id: true,
  createdAt: true,
}).extend({
  moodValue: z.number().int().min(1).max(5),
  clientId: z.string().min(1),
  date: z.coerce.date(),
});

export type InsertGentlepulseMoodCheck = z.infer<typeof insertGentlepulseMoodCheckSchema>;
export type GentlepulseMoodCheck = typeof gentlepulseMoodChecks.$inferSelect;

// GentlePulse Favorites (clientId-based, no user accounts)
export const gentlepulseFavorites = pgTable("gentlepulse_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meditationId: varchar("meditation_id").notNull().references(() => gentlepulseMeditations.id),
  clientId: varchar("client_id", { length: 100 }).notNull(), // Random UUID from client
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGentlepulseFavoriteSchema = createInsertSchema(gentlepulseFavorites).omit({
  id: true,
  createdAt: true,
}).extend({
  clientId: z.string().min(1),
});

export type InsertGentlepulseFavorite = z.infer<typeof insertGentlepulseFavoriteSchema>;
export type GentlepulseFavorite = typeof gentlepulseFavorites.$inferSelect;

// GentlePulse Announcements
export const gentlepulseAnnouncements = pgTable("gentlepulse_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGentlepulseAnnouncementSchema = createInsertSchema(gentlepulseAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertGentlepulseAnnouncement = z.infer<typeof insertGentlepulseAnnouncementSchema>;
export type GentlepulseAnnouncement = typeof gentlepulseAnnouncements.$inferSelect;

// ========================================
// CHYME APP TABLES
// ========================================

// Chyme Announcements
export const chymeAnnouncements = pgTable("chyme_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChymeAnnouncementSchema = createInsertSchema(chymeAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["info", "warning", "maintenance", "update", "promotion"]),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertChymeAnnouncement = z.infer<typeof insertChymeAnnouncementSchema>;
export type ChymeAnnouncement = typeof chymeAnnouncements.$inferSelect;

// Chyme Rooms
export const chymeRooms = pgTable("chyme_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  roomType: varchar("room_type", { length: 20 }).notNull().default('public'), // 'public' or 'private'
  isActive: boolean("is_active").notNull().default(true),
  maxParticipants: integer("max_participants"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChymeRoomSchema = createInsertSchema(chymeRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  roomType: z.enum(["public", "private"]),
  maxParticipants: z.coerce.number().int().positive().optional().nullable(),
});

export type InsertChymeRoom = z.infer<typeof insertChymeRoomSchema>;
export type ChymeRoom = typeof chymeRooms.$inferSelect;

// Chyme Room Participants
export const chymeRoomParticipants = pgTable("chyme_room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => chymeRooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isMuted: boolean("is_muted").notNull().default(false),
  isSpeaking: boolean("is_speaking").notNull().default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
}, (table) => [
  index("chyme_room_participants_room_id_idx").on(table.roomId),
  index("chyme_room_participants_user_id_idx").on(table.userId),
  index("chyme_room_participants_active_idx").on(table.roomId, table.leftAt),
]);

export const insertChymeRoomParticipantSchema = createInsertSchema(chymeRoomParticipants).omit({
  id: true,
  joinedAt: true,
});

export type InsertChymeRoomParticipant = z.infer<typeof insertChymeRoomParticipantSchema>;
export type ChymeRoomParticipant = typeof chymeRoomParticipants.$inferSelect;

// Chyme Messages
export const chymeMessages = pgTable("chyme_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => chymeRooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("chyme_messages_room_id_idx").on(table.roomId),
  index("chyme_messages_created_at_idx").on(table.createdAt),
]);

export const insertChymeMessageSchema = createInsertSchema(chymeMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChymeMessage = z.infer<typeof insertChymeMessageSchema>;
export type ChymeMessage = typeof chymeMessages.$inferSelect;

// ========================================
// WORKFORCE RECRUITER TRACKER APP TABLES
// ========================================

// Workforce Recruiter Tracker user profiles
export const workforceRecruiterProfiles = pgTable("workforce_recruiter_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  isVerified: boolean("is_verified").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workforceRecruiterProfilesRelations = relations(workforceRecruiterProfiles, ({ one }) => ({
  user: one(users, {
    fields: [workforceRecruiterProfiles.userId],
    references: [users.id],
  }),
}));

export const insertWorkforceRecruiterProfileSchema = createInsertSchema(workforceRecruiterProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true, // Added by server from authenticated user
}).extend({
  // Keep userId optional for validation since the server injects it after auth
  userId: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export type InsertWorkforceRecruiterProfile = z.infer<typeof insertWorkforceRecruiterProfileSchema>;
export type WorkforceRecruiterProfile = typeof workforceRecruiterProfiles.$inferSelect;

// Workforce Recruiter Tracker configuration
export const workforceRecruiterConfig = pgTable("workforce_recruiter_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  population: integer("population").notNull().default(5000000),
  workforceParticipationRate: decimal("workforce_participation_rate", { precision: 5, scale: 4 }).notNull().default('0.5'),
  minRecruitable: integer("min_recruitable").notNull().default(2000000),
  maxRecruitable: integer("max_recruitable").notNull().default(5000000),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkforceRecruiterConfigSchema = createInsertSchema(workforceRecruiterConfig).omit({
  id: true,
  updatedAt: true,
}).extend({
  population: z.number().int().min(1),
  workforceParticipationRate: z.coerce.number().min(0).max(1),
  minRecruitable: z.number().int().min(0),
  maxRecruitable: z.number().int().min(0),
});

export type InsertWorkforceRecruiterConfig = z.infer<typeof insertWorkforceRecruiterConfigSchema>;
export type WorkforceRecruiterConfig = typeof workforceRecruiterConfig.$inferSelect;

// Occupations
export const workforceRecruiterOccupations = pgTable("workforce_recruiter_occupations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sector: varchar("sector", { length: 100 }).notNull(),
  occupationTitle: varchar("occupation_title", { length: 200 }).notNull(),
  jobTitleId: varchar("job_title_id").references(() => skillsJobTitles.id), // Links to skills database for skill matching
  headcountTarget: integer("headcount_target").notNull(),
  skillLevel: varchar("skill_level", { length: 20 }).notNull(), // 'Foundational', 'Intermediate', 'Advanced'
  annualTrainingTarget: integer("annual_training_target").notNull(),
  currentRecruited: integer("current_recruited").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkforceRecruiterOccupationSchema = createInsertSchema(workforceRecruiterOccupations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentRecruited: true,
}).extend({
  sector: z.string().min(1, "Sector is required").max(100),
  occupationTitle: z.string().min(1, "Occupation title is required").max(200),
  headcountTarget: z.number().int().min(0),
  skillLevel: z.enum(["Foundational", "Intermediate", "Advanced"]),
  annualTrainingTarget: z.number().int().min(0),
  notes: z.string().optional().nullable(),
});

export type InsertWorkforceRecruiterOccupation = z.infer<typeof insertWorkforceRecruiterOccupationSchema>;
export type WorkforceRecruiterOccupation = typeof workforceRecruiterOccupations.$inferSelect;

// Meetup Events - Admin creates in-person events for occupations
export const workforceRecruiterMeetupEvents = pgTable("workforce_recruiter_meetup_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  occupationId: varchar("occupation_id").notNull().references(() => workforceRecruiterOccupations.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workforceRecruiterMeetupEventsRelations = relations(workforceRecruiterMeetupEvents, ({ one, many }) => ({
  occupation: one(workforceRecruiterOccupations, {
    fields: [workforceRecruiterMeetupEvents.occupationId],
    references: [workforceRecruiterOccupations.id],
  }),
  creator: one(users, {
    fields: [workforceRecruiterMeetupEvents.createdBy],
    references: [users.id],
  }),
  signups: many(workforceRecruiterMeetupEventSignups),
}));

export const insertWorkforceRecruiterMeetupEventSchema = createInsertSchema(workforceRecruiterMeetupEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  occupationId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type InsertWorkforceRecruiterMeetupEvent = z.infer<typeof insertWorkforceRecruiterMeetupEventSchema>;
export type WorkforceRecruiterMeetupEvent = typeof workforceRecruiterMeetupEvents.$inferSelect;

// Meetup Event Signups - Users sign up to participate in meetup events
export const workforceRecruiterMeetupEventSignups = pgTable("workforce_recruiter_meetup_event_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => workforceRecruiterMeetupEvents.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  location: varchar("location", { length: 200 }).notNull(), // Predefined location from dropdown
  preferredMeetupDate: date("preferred_meetup_date"),
  availability: text("availability").array().notNull().default(sql`ARRAY[]::text[]`), // Multi-select: weekdays, weekends, morning, afternoon, evening
  whyInterested: text("why_interested"),
  additionalComments: text("additional_comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workforceRecruiterMeetupEventSignupsRelations = relations(workforceRecruiterMeetupEventSignups, ({ one }) => ({
  event: one(workforceRecruiterMeetupEvents, {
    fields: [workforceRecruiterMeetupEventSignups.eventId],
    references: [workforceRecruiterMeetupEvents.id],
  }),
  user: one(users, {
    fields: [workforceRecruiterMeetupEventSignups.userId],
    references: [users.id],
  }),
}));

export const insertWorkforceRecruiterMeetupEventSignupSchema = createInsertSchema(workforceRecruiterMeetupEventSignups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true, // Added server-side from authenticated user
}).extend({
  eventId: z.string().uuid(),
  location: z.string().min(1, "Location is required").max(200),
  preferredMeetupDate: z.coerce.date().optional().nullable(),
  availability: z.array(z.enum(["weekdays", "weekends", "morning", "afternoon", "evening"])).min(1, "Select at least one availability option"),
  whyInterested: z.string().optional().nullable(),
  additionalComments: z.string().optional().nullable(),
});

export type InsertWorkforceRecruiterMeetupEventSignup = z.infer<typeof insertWorkforceRecruiterMeetupEventSignupSchema>;
export type WorkforceRecruiterMeetupEventSignup = typeof workforceRecruiterMeetupEventSignups.$inferSelect;

// Workforce Recruiter Tracker Announcements
export const workforceRecruiterAnnouncements = pgTable("workforce_recruiter_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkforceRecruiterAnnouncementSchema = createInsertSchema(workforceRecruiterAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertWorkforceRecruiterAnnouncement = z.infer<typeof insertWorkforceRecruiterAnnouncementSchema>;
export type WorkforceRecruiterAnnouncement = typeof workforceRecruiterAnnouncements.$inferSelect;

// ========================================
// DEFAULT ALIVE OR DEAD APP TABLES
// ========================================

// Financial Entries - Manual data entry for operating expenses, depreciation, amortization
export const defaultAliveOrDeadFinancialEntries = pgTable("default_alive_or_dead_financial_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: date("week_start_date").notNull(), // Saturday of the week (weekends start on Saturday)
  operatingExpenses: numeric("operating_expenses", { precision: 15, scale: 2 }).notNull(), // User-entered operating expenses
  depreciation: numeric("depreciation", { precision: 15, scale: 2 }).notNull().default('0'), // Calculated or user-entered depreciation
  amortization: numeric("amortization", { precision: 15, scale: 2 }).notNull().default('0'), // Calculated or user-entered amortization
  // For depreciation calculation: user needs to enter asset cost, useful life, method (straight-line, etc.)
  // For amortization calculation: user needs to enter intangible asset cost, useful life
  // These can be stored as JSONB for flexibility, or we can add specific fields
  depreciationData: jsonb("depreciation_data"), // { assetCost, usefulLife, method, etc. }
  amortizationData: jsonb("amortization_data"), // { assetCost, usefulLife, etc. }
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const defaultAliveOrDeadFinancialEntriesRelations = relations(defaultAliveOrDeadFinancialEntries, ({ one }) => ({
  creator: one(users, {
    fields: [defaultAliveOrDeadFinancialEntries.createdBy],
    references: [users.id],
  }),
}));

export const insertDefaultAliveOrDeadFinancialEntrySchema = createInsertSchema(defaultAliveOrDeadFinancialEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  weekStartDate: z.coerce.date(),
  operatingExpenses: z.coerce.number().min(0, "Operating expenses must be non-negative"),
  depreciation: z.coerce.number().min(0, "Depreciation must be non-negative").optional(),
  amortization: z.coerce.number().min(0, "Amortization must be non-negative").optional(),
  depreciationData: z.record(z.any()).optional().nullable(),
  amortizationData: z.record(z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertDefaultAliveOrDeadFinancialEntry = z.infer<typeof insertDefaultAliveOrDeadFinancialEntrySchema>;
export type DefaultAliveOrDeadFinancialEntry = typeof defaultAliveOrDeadFinancialEntries.$inferSelect;

// EBITDA Snapshots - Weekly calculated EBITDA values
export const defaultAliveOrDeadEbitdaSnapshots = pgTable("default_alive_or_dead_ebitda_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: date("week_start_date").notNull().unique(), // Saturday of the week
  revenue: numeric("revenue", { precision: 15, scale: 2 }).notNull(), // Calculated from payments table
  operatingExpenses: numeric("operating_expenses", { precision: 15, scale: 2 }).notNull(),
  depreciation: numeric("depreciation", { precision: 15, scale: 2 }).notNull().default('0'),
  amortization: numeric("amortization", { precision: 15, scale: 2 }).notNull().default('0'),
  ebitda: numeric("ebitda", { precision: 15, scale: 2 }).notNull(), // Revenue - Operating Expenses + Depreciation + Amortization
  isDefaultAlive: boolean("is_default_alive").notNull().default(false), // Calculated based on projection
  projectedProfitabilityDate: date("projected_profitability_date"), // When EBITDA becomes positive based on growth
  projectedCapitalNeeded: numeric("projected_capital_needed", { precision: 15, scale: 2 }), // Capital needed before profitability
  currentFunding: numeric("current_funding", { precision: 15, scale: 2 }), // Current available funding
  growthRate: numeric("growth_rate", { precision: 10, scale: 4 }), // Weekly revenue growth rate (as decimal, e.g., 0.05 for 5%)
  calculationMetadata: jsonb("calculation_metadata"), // Store calculation details, assumptions, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDefaultAliveOrDeadEbitdaSnapshotSchema = createInsertSchema(defaultAliveOrDeadEbitdaSnapshots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  weekStartDate: z.coerce.date(),
  revenue: z.coerce.number(),
  operatingExpenses: z.coerce.number(),
  depreciation: z.coerce.number().optional(),
  amortization: z.coerce.number().optional(),
  ebitda: z.coerce.number(),
  isDefaultAlive: z.boolean().optional(),
  projectedProfitabilityDate: z.coerce.date().optional().nullable(),
  projectedCapitalNeeded: z.coerce.number().optional().nullable(),
  currentFunding: z.coerce.number().optional().nullable(),
  growthRate: z.coerce.number().optional().nullable(),
  calculationMetadata: z.record(z.any()).optional().nullable(),
});

export type InsertDefaultAliveOrDeadEbitdaSnapshot = z.infer<typeof insertDefaultAliveOrDeadEbitdaSnapshotSchema>;
export type DefaultAliveOrDeadEbitdaSnapshot = typeof defaultAliveOrDeadEbitdaSnapshots.$inferSelect;
