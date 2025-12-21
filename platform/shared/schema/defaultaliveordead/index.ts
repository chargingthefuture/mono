/**
 * DEFAULT ALIVE OR DEAD App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the DEFAULT ALIVE OR DEAD mini-app.
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

// Financial Entries - Manual data entry for operating expenses, depreciation, amortization
export const defaultAliveOrDeadFinancialEntries = pgTable("default_alive_or_dead_financial_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: date("week_start_date").notNull(), // Saturday of the week (weekends start on Saturday)
  operatingExpenses: numeric("operating_expenses", { precision: 15, scale: 2 }).notNull(), // User-entered operating expenses
  depreciation: numeric("depreciation", { precision: 15, scale: 2 }).notNull().default('0'), // Calculated or user-entered depreciation
  amortization: numeric("amortization", { precision: 15, scale: 2 }).notNull().default('0'), // Calculated or user-entered amortization
  // For depreciation calculation: user needs to enter asset cost, useful life, method (straight-line, etc.)
  // For amortization calculation: user needs to enter intangible asset cost, useful life
  // These can be stored as JSONB for flexibility, or we can add specific fields
  depreciationData: jsonb("depreciation_data"), // { assetCost, usefulLife, method, etc. }
  amortizationData: jsonb("amortization_data"), // { assetCost, usefulLife, etc. }
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const defaultAliveOrDeadFinancialEntriesRelations = relations(defaultAliveOrDeadFinancialEntries, ({ one }) => ({
  creator: one(users, {
    fields: [defaultAliveOrDeadFinancialEntries.createdBy],
    references: [users.id],
  }),
}));

export const insertDefaultAliveOrDeadFinancialEntrySchema = createInsertSchema(defaultAliveOrDeadFinancialEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  weekStartDate: z.coerce.date(),
  operatingExpenses: z.coerce.number().min(0, "Operating expenses must be non-negative"),
  depreciation: z.coerce.number().min(0, "Depreciation must be non-negative").optional(),
  amortization: z.coerce.number().min(0, "Amortization must be non-negative").optional(),
  depreciationData: z.record(z.any()).optional().nullable(),
  amortizationData: z.record(z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertDefaultAliveOrDeadFinancialEntry = z.infer<typeof insertDefaultAliveOrDeadFinancialEntrySchema>;
export type DefaultAliveOrDeadFinancialEntry = typeof defaultAliveOrDeadFinancialEntries.$inferSelect;

// EBITDA Snapshots - Weekly calculated EBITDA values
export const defaultAliveOrDeadEbitdaSnapshots = pgTable("default_alive_or_dead_ebitda_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: date("week_start_date").notNull().unique(), // Saturday of the week
  revenue: numeric("revenue", { precision: 15, scale: 2 }).notNull(), // Calculated from payments table
  operatingExpenses: numeric("operating_expenses", { precision: 15, scale: 2 }).notNull(),
  depreciation: numeric("depreciation", { precision: 15, scale: 2 }).notNull().default('0'),
  amortization: numeric("amortization", { precision: 15, scale: 2 }).notNull().default('0'),
  ebitda: numeric("ebitda", { precision: 15, scale: 2 }).notNull(), // Revenue - Operating Expenses + Depreciation + Amortization
  isDefaultAlive: boolean("is_default_alive").notNull().default(false), // Calculated based on projection
  projectedProfitabilityDate: date("projected_profitability_date"), // When EBITDA becomes positive based on growth
  projectedCapitalNeeded: numeric("projected_capital_needed", { precision: 15, scale: 2 }), // Capital needed before profitability
  currentFunding: numeric("current_funding", { precision: 15, scale: 2 }), // Current available funding
  growthRate: numeric("growth_rate", { precision: 10, scale: 4 }), // Weekly revenue growth rate (as decimal, e.g., 0.05 for 5%)
  calculationMetadata: jsonb("calculation_metadata"), // Store calculation details, assumptions, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDefaultAliveOrDeadEbitdaSnapshotSchema = createInsertSchema(defaultAliveOrDeadEbitdaSnapshots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  weekStartDate: z.coerce.date(),
  revenue: z.coerce.number(),
  operatingExpenses: z.coerce.number(),
  depreciation: z.coerce.number().optional(),
  amortization: z.coerce.number().optional(),
  ebitda: z.coerce.number(),
  isDefaultAlive: z.boolean().optional(),
  projectedProfitabilityDate: z.coerce.date().optional().nullable(),
  projectedCapitalNeeded: z.coerce.number().optional().nullable(),
  currentFunding: z.coerce.number().optional().nullable(),
  growthRate: z.coerce.number().optional().nullable(),
  calculationMetadata: z.record(z.any()).optional().nullable(),
});

export type InsertDefaultAliveOrDeadEbitdaSnapshot = z.infer<typeof insertDefaultAliveOrDeadEbitdaSnapshotSchema>;
export type DefaultAliveOrDeadEbitdaSnapshot = typeof defaultAliveOrDeadEbitdaSnapshots.$inferSelect;

