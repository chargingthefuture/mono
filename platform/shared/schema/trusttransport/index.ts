/**
 * TrustTransport App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the TrustTransport mini-app.
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
import { users } from "../core/users";

// TrustTransport driver profiles
export const trusttransportProfiles = pgTable("trusttransport_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  
  isDriver: boolean("is_driver").notNull().default(false),
  isRider: boolean("is_rider").notNull().default(true),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  
  // Vehicle information
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleYear: integer("vehicle_year"),
  vehicleColor: varchar("vehicle_color", { length: 50 }),
  licensePlate: varchar("license_plate", { length: 20 }),
  
  // Driver information
  bio: text("bio"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  signalUrl: text("signal_url"),
  
  // Verification and availability
  isVerified: boolean("is_verified").default(false).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Forward declarations
export const trusttransportRideRequests = pgTable("trusttransport_ride_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Rider who created the request
  riderId: varchar("rider_id").notNull().references(() => users.id),
  
  // Driver who claimed the request (null until claimed)
  driverId: varchar("driver_id").references(() => trusttransportProfiles.id),
  
  // Location
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  pickupCity: varchar("pickup_city", { length: 100 }).notNull(),
  pickupState: varchar("pickup_state", { length: 100 }),
  dropoffCity: varchar("dropoff_city", { length: 100 }).notNull(),
  dropoffState: varchar("dropoff_state", { length: 100 }),
  
  // Scheduling
  departureDateTime: timestamp("departure_date_time").notNull(),
  
  // Request criteria
  requestedSeats: integer("requested_seats").notNull().default(1),
  requestedCarType: varchar("requested_car_type", { length: 50 }), // e.g., "sedan", "suv", "van", "truck", null = any
  requiresHeat: boolean("requires_heat").notNull().default(false),
  requiresAC: boolean("requires_ac").notNull().default(false),
  requiresWheelchairAccess: boolean("requires_wheelchair_access").notNull().default(false),
  requiresChildSeat: boolean("requires_child_seat").notNull().default(false),
  
  // Additional preferences/notes
  riderMessage: text("rider_message"), // Notes from rider
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('open'), // 'open', 'claimed', 'completed', 'cancelled', 'expired'
  
  // Driver response (when claiming)
  driverMessage: text("driver_message"), // Message from driver when claiming
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TrustTransport Announcements
export const trusttransportAnnouncements = pgTable("trusttransport_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TrustTransport user blocking system - allows blocking users they've interacted with
export const trusttransportBlocks = pgTable("trusttransport_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const trusttransportProfilesRelations = relations(trusttransportProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [trusttransportProfiles.userId],
    references: [users.id],
  }),
  rideRequests: many(trusttransportRideRequests, { relationName: "rider" }),
  claimedRequests: many(trusttransportRideRequests, { relationName: "driver" }),
}));

export const trusttransportRideRequestsRelations = relations(trusttransportRideRequests, ({ one }) => ({
  rider: one(users, {
    fields: [trusttransportRideRequests.riderId],
    references: [users.id],
  }),
  driver: one(trusttransportProfiles, {
    fields: [trusttransportRideRequests.driverId],
    references: [trusttransportProfiles.id],
    relationName: "driver",
  }),
}));

export const trusttransportBlocksRelations = relations(trusttransportBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [trusttransportBlocks.userId],
    references: [users.id],
    relationName: "trusttransportBlocker",
  }),
  blocked: one(users, {
    fields: [trusttransportBlocks.blockedUserId],
    references: [users.id],
    relationName: "trusttransportBlocked",
  }),
}));

// Zod Schemas
export const insertTrusttransportProfileSchema = createInsertSchema(trusttransportProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isDriver: z.boolean().default(false),
  isRider: z.boolean().default(true),
  city: z.string().min(1, "City is required").max(100, "City must be 100 characters or less"),
  state: z.string().min(1, "State is required").max(100, "State must be 100 characters or less"),
  country: z.string().min(1, "Country is required").max(100, "Country must be 100 characters or less"),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  signalUrl: z.string().optional().nullable().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL" }
  ).transform(val => val === "" ? null : val),
});

export type InsertTrusttransportProfile = z.infer<typeof insertTrusttransportProfileSchema>;
export type TrusttransportProfile = typeof trusttransportProfiles.$inferSelect;

export const insertTrusttransportRideRequestSchema = createInsertSchema(trusttransportRideRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  riderId: true, // Added by server from authenticated user
  driverId: true,
  status: true,
  driverMessage: true,
}).extend({
  departureDateTime: z.coerce.date(),
  requestedSeats: z.number().int().min(1, "At least 1 seat is required"),
  requestedCarType: z.enum(["sedan", "suv", "van", "truck"]).optional().nullable(),
  requiresHeat: z.boolean().default(false),
  requiresAC: z.boolean().default(false),
  requiresWheelchairAccess: z.boolean().default(false),
  requiresChildSeat: z.boolean().default(false),
  riderMessage: z.string().optional().nullable(),
});

export type InsertTrusttransportRideRequest = z.infer<typeof insertTrusttransportRideRequestSchema>;
export type TrusttransportRideRequest = typeof trusttransportRideRequests.$inferSelect;

export const insertTrusttransportAnnouncementSchema = createInsertSchema(trusttransportAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["info", "warning", "maintenance", "update", "promotion"]),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertTrusttransportAnnouncement = z.infer<typeof insertTrusttransportAnnouncementSchema>;
export type TrusttransportAnnouncement = typeof trusttransportAnnouncements.$inferSelect;

export const insertTrusttransportBlockSchema = createInsertSchema(trusttransportBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertTrusttransportBlock = z.infer<typeof insertTrusttransportBlockSchema>;
export type TrusttransportBlock = typeof trusttransportBlocks.$inferSelect;

