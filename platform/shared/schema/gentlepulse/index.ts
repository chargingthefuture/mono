/**
 * GENTLEPULSE App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the GENTLEPULSE mini-app.
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

