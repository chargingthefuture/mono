/**
 * WORKFORCE RECRUITER TRACKER App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the WORKFORCE RECRUITER TRACKER mini-app.
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  numeric,
  date,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";
import { skillsJobTitles } from "../skills";

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

