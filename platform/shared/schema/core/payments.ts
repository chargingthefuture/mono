/**
 * Payments and pricing tiers
 */

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

// Pricing tiers table - tracks historical pricing levels
export const pricingTiers = pgTable("pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull().defaultNow(),
  isCurrentTier: boolean("is_current_tier").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
  id: true,
  createdAt: true,
}).extend({
  effectiveDate: z.coerce.date().optional(),
});

export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
export type PricingTier = typeof pricingTiers.$inferSelect;

// Payments table - manual payment tracking
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(), // Exact date the customer paid
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default('cash'),
  billingPeriod: varchar("billing_period", { length: 20 }).notNull().default('monthly'), // monthly, yearly
  billingMonth: varchar("billing_month", { length: 7 }), // YYYY-MM format for calendar month (monthly payments only)
  yearlyStartMonth: varchar("yearly_start_month", { length: 7 }), // YYYY-MM format for yearly subscription start
  yearlyEndMonth: varchar("yearly_end_month", { length: 7 }), // YYYY-MM format for yearly subscription end
  notes: text("notes"),
  recordedBy: varchar("recorded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  recorder: one(users, {
    fields: [payments.recordedBy],
    references: [users.id],
    relationName: "recordedBy",
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paymentDate: true,
}).extend({
  paymentDate: z.preprocess(
    (val) => {
      if (val instanceof Date) return val;
      if (typeof val === "string") return new Date(val);
      return val;
    },
    z.date()
  ),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
  billingMonth: z.preprocess(
    (val) => {
      // Normalize: convert undefined/empty to null
      if (val === undefined || val === "" || val === null) {
        return null;
      }
      // If it's a string, validate format
      if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
        return val;
      }
      // If it doesn't match, still return it (validation will catch it)
      return val;
    },
    z.union([
      z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
      z.null(),
    ]).optional()
  ),
  yearlyStartMonth: z.preprocess(
    (val) => {
      if (val === undefined || val === "" || val === null) {
        return null;
      }
      if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
        return val;
      }
      return val;
    },
    z.union([
      z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
      z.null(),
    ]).optional()
  ),
  yearlyEndMonth: z.preprocess(
    (val) => {
      if (val === undefined || val === "" || val === null) {
        return null;
      }
      if (typeof val === "string" && /^\d{4}-\d{2}$/.test(val)) {
        return val;
      }
      return val;
    },
    z.union([
      z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"),
      z.null(),
    ]).optional()
  ),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

