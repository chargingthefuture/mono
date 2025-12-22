/**
 * Core user and authentication tables
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";

// Session storage table - Required for authentication (OIDC/OAuth2)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for authentication (OIDC/OAuth2) with additional fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  quoraProfileUrl: varchar("quora_profile_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(), // Manual approval for app access
  pricingTier: decimal("pricing_tier", { precision: 10, scale: 2 }).notNull().default('1.00'),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).notNull().default('active'), // active, overdue, inactive
  termsAcceptedAt: timestamp("terms_accepted_at"), // Timestamp of last terms acceptance
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Login events table - tracks successful webapp logins for DAU/MAU analytics
export const loginEvents = pgTable(
  "login_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    source: varchar("source", { length: 50 }).notNull().default("webapp"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_login_events_user_created_at").on(table.userId, table.createdAt),
  ],
);

// OTP codes table - stores OTP codes for Android app authentication
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_otp_codes_user_id").on(table.userId),
    index("IDX_otp_codes_code").on(table.code),
    index("IDX_otp_codes_expires_at").on(table.expiresAt),
  ],
);

// Auth tokens table - stores OTP-based auth tokens for Android app
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    token: varchar("token", { length: 64 }).notNull().unique(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_auth_tokens_token").on(table.token),
    index("IDX_auth_tokens_user_id").on(table.userId),
    index("IDX_auth_tokens_expires_at").on(table.expiresAt),
  ],
);

// Import for relations (will be set up after all modules are loaded)
// Note: These are imported as values because Drizzle relations need the actual table objects
import { payments } from "./payments";
import { adminActionLogs } from "./admin";

// Relations - Note: These reference modules that may not be loaded yet
// They will be properly connected in the main schema index file
export const usersRelations = relations(users, ({ many }) => ({
  paymentsReceived: many(payments as any),
  paymentsRecorded: many(payments as any, { relationName: "recordedBy" }),
  adminActions: many(adminActionLogs as any),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type OTPCode = typeof otpCodes.$inferSelect;
export type InsertOTPCode = typeof otpCodes.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type InsertAuthToken = typeof authTokens.$inferInsert;

