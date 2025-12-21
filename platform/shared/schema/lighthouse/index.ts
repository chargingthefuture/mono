/**
 * Lighthouse App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the Lighthouse mini-app.
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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

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

// Forward declarations
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

// LightHouse user blocking system - allows blocking hosts whose properties appear in feed
export const lighthouseBlocks = pgTable("lighthouse_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const lighthouseProfilesRelations = relations(lighthouseProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [lighthouseProfiles.userId],
    references: [users.id],
  }),
  properties: many(lighthouseProperties),
  matchesAsSeeker: many(lighthouseMatches, { relationName: "seeker" }),
}));

export const lighthousePropertiesRelations = relations(lighthouseProperties, ({ one, many }) => ({
  host: one(lighthouseProfiles, {
    fields: [lighthouseProperties.hostId],
    references: [lighthouseProfiles.id],
  }),
  matches: many(lighthouseMatches),
}));

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

// Zod Schemas
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

export const insertLighthouseAnnouncementSchema = createInsertSchema(lighthouseAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertLighthouseAnnouncement = z.infer<typeof insertLighthouseAnnouncementSchema>;
export type LighthouseAnnouncement = typeof lighthouseAnnouncements.$inferSelect;

export const insertLighthouseBlockSchema = createInsertSchema(lighthouseBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertLighthouseBlock = z.infer<typeof insertLighthouseBlockSchema>;
export type LighthouseBlock = typeof lighthouseBlocks.$inferSelect;

