/**
 * ChatGroups App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the ChatGroups mini-app.
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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

