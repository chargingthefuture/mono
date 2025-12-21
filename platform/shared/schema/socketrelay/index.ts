/**
 * SocketRelay App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the SocketRelay mini-app.
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

// Forward declarations
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

export const socketrelayMessages = pgTable("socketrelay_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fulfillmentId: varchar("fulfillment_id").notNull().references(() => socketrelayFulfillments.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Relations
export const socketrelayRequestsRelations = relations(socketrelayRequests, ({ one, many }) => ({
  creator: one(users, {
    fields: [socketrelayRequests.userId],
    references: [users.id],
  }),
  fulfillments: many(socketrelayFulfillments),
}));

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

export const socketrelayProfilesRelations = relations(socketrelayProfiles, ({ one }) => ({
  user: one(users, {
    fields: [socketrelayProfiles.userId],
    references: [users.id],
  }),
}));

// Zod Schemas
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

export const insertSocketrelayMessageSchema = createInsertSchema(socketrelayMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertSocketrelayMessage = z.infer<typeof insertSocketrelayMessageSchema>;
export type SocketrelayMessage = typeof socketrelayMessages.$inferSelect;

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

export const insertSocketrelayAnnouncementSchema = createInsertSchema(socketrelayAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertSocketrelayAnnouncement = z.infer<typeof insertSocketrelayAnnouncementSchema>;
export type SocketrelayAnnouncement = typeof socketrelayAnnouncements.$inferSelect;

