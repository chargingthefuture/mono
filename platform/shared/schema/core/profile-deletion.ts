/**
 * Profile Deletion Log Schema
 * 
 * Contains the profile deletion log table for auditing and analytics.
 * This is a core table used across all mini-apps.
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

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

