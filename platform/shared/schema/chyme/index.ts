/**
 * CHYME App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the CHYME mini-app.
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
  topic: varchar("topic", { length: 100 }),
  roomType: varchar("room_type", { length: 20 }).notNull().default('public'), // 'public' or 'private'
  isActive: boolean("is_active").notNull().default(true),
  maxParticipants: integer("max_participants"),
  pinnedLink: text("pinned_link"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChymeRoomSchema = createInsertSchema(chymeRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true, // Explicitly omit - server will set from authenticated user
}).extend({
  roomType: z.enum(["public", "private"]),
  maxParticipants: z.coerce.number().int().positive().optional().nullable(),
  topic: z.string().max(100).optional().nullable(),
});

export type InsertChymeRoom = z.infer<typeof insertChymeRoomSchema>;
export type ChymeRoom = typeof chymeRooms.$inferSelect;

// Chyme Room Participants
export const chymeRoomParticipants = pgTable("chyme_room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => chymeRooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default('listener'), // 'creator', 'speaker', 'listener'
  isMuted: boolean("is_muted").notNull().default(false),
  isSpeaking: boolean("is_speaking").notNull().default(false),
  hasRaisedHand: boolean("has_raised_hand").notNull().default(false),
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
}).extend({
  role: z.enum(["creator", "speaker", "listener"]).optional(),
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

// Chyme User Follows
export const chymeUserFollows = pgTable("chyme_user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followedUserId: varchar("followed_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("chyme_user_follows_user_id_idx").on(table.userId),
  index("chyme_user_follows_followed_user_id_idx").on(table.followedUserId),
  index("chyme_user_follows_unique_idx").on(table.userId, table.followedUserId),
]);

export const insertChymeUserFollowSchema = createInsertSchema(chymeUserFollows).omit({
  id: true,
  createdAt: true,
});

export type InsertChymeUserFollow = z.infer<typeof insertChymeUserFollowSchema>;
export type ChymeUserFollow = typeof chymeUserFollows.$inferSelect;

// Chyme User Blocks
export const chymeUserBlocks = pgTable("chyme_user_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("chyme_user_blocks_user_id_idx").on(table.userId),
  index("chyme_user_blocks_blocked_user_id_idx").on(table.blockedUserId),
  index("chyme_user_blocks_unique_idx").on(table.userId, table.blockedUserId),
]);

export const insertChymeUserBlockSchema = createInsertSchema(chymeUserBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertChymeUserBlock = z.infer<typeof insertChymeUserBlockSchema>;
export type ChymeUserBlock = typeof chymeUserBlocks.$inferSelect;

