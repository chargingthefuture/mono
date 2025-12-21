/**
 * SupportMatch App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the SupportMatch mini-app.
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

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

// Forward declarations for relations
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

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnershipId: varchar("partnership_id").notNull().references(() => partnerships.id),
  senderId: varchar("sender_id").notNull().references(() => supportMatchProfiles.userId),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exclusions = pgTable("exclusions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => supportMatchProfiles.userId),
  excludedUserId: varchar("excluded_user_id").notNull().references(() => supportMatchProfiles.userId),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Relations
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

// Zod Schemas
export const insertSupportMatchProfileSchema = createInsertSchema(supportMatchProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupportMatchProfile = z.infer<typeof insertSupportMatchProfileSchema>;
export type SupportMatchProfile = typeof supportMatchProfiles.$inferSelect;

export const insertPartnershipSchema = createInsertSchema(partnerships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type Partnership = typeof partnerships.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const insertExclusionSchema = createInsertSchema(exclusions).omit({
  id: true,
  createdAt: true,
});

export type InsertExclusion = z.infer<typeof insertExclusionSchema>;
export type Exclusion = typeof exclusions.$inferSelect;

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const insertSupportmatchAnnouncementSchema = createInsertSchema(supportmatchAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertSupportmatchAnnouncement = z.infer<typeof insertSupportmatchAnnouncementSchema>;
export type SupportmatchAnnouncement = typeof supportmatchAnnouncements.$inferSelect;

