/**
 * Admin logs and NPS responses
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  jsonb,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

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

// NPS Responses table
export const npsResponses = pgTable("nps_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(), // 0-10
  feedback: text("feedback"),
  responseMonth: varchar("response_month", { length: 7 }).notNull(), // YYYY-MM format
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

