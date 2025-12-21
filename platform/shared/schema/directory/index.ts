/**
 * Directory App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the Directory mini-app.
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

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

  // Geocoded coordinates (cached for map display)
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),

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

