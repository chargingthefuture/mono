/**
 * MechanicMatch App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the MechanicMatch mini-app.
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

// MechanicMatch Profiles (users can be both car owners and mechanics)
export const mechanicmatchProfiles = pgTable("mechanicmatch_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Optional while unclaimed; admin can create unclaimed entries
  userId: varchar("user_id").unique().references(() => users.id),
  
  // Role flags
  isCarOwner: boolean("is_car_owner").notNull().default(false),
  isMechanic: boolean("is_mechanic").notNull().default(false),
  
  // Common fields
  firstName: varchar("first_name", { length: 100 }), // First name for unclaimed profiles (admin-entered)
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  signalUrl: text("signal_url"), // Link to Signal profile
  
  // Car Owner specific fields
  ownerBio: text("owner_bio"),
  
  // Mechanic specific fields
  mechanicBio: text("mechanic_bio"),
  experience: integer("experience"), // Years of experience
  shopLocation: text("shop_location"), // Physical shop address
  isMobileMechanic: boolean("is_mobile_mechanic").notNull().default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }), // Hourly rate in dollars
  specialties: text("specialties"), // Comma-separated list or JSON array of specialties (e.g., "Engine Repair, Transmission, Brakes")
  certifications: text("certifications"), // JSON array of certifications
  sampleJobs: text("sample_jobs"), // JSON array of sample job descriptions/photos
  portfolioPhotos: text("portfolio_photos"), // JSON array of photo URLs
  responseTimeHours: integer("response_time_hours"), // Average response time in hours
  totalJobsCompleted: integer("total_jobs_completed").notNull().default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Average rating (0-5)
  
  // Verification and visibility
  isVerified: boolean("is_verified").default(false).notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  isClaimed: boolean("is_claimed").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchProfilesRelations = relations(mechanicmatchProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [mechanicmatchProfiles.userId],
    references: [users.id],
  }),
  vehicles: many(mechanicmatchVehicles, { relationName: "owner" }),
  serviceRequests: many(mechanicmatchServiceRequests, { relationName: "owner" }),
  jobsAsOwner: many(mechanicmatchJobs, { relationName: "owner" }),
  jobsAsMechanic: many(mechanicmatchJobs, { relationName: "mechanic" }),
  availability: many(mechanicmatchAvailability),
  reviewsGiven: many(mechanicmatchReviews, { relationName: "reviewer" }),
  reviewsReceived: many(mechanicmatchReviews, { relationName: "reviewee" }),
}));

export const insertMechanicmatchProfileSchema = createInsertSchema(mechanicmatchProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalJobsCompleted: true,
}).extend({
  // userId is optional to allow unclaimed profile creation by admin
  // Follow the same pattern as directory profiles - allow null for unclaimed profiles
  userId: z.string().optional().nullable(),
  isCarOwner: z.boolean().default(false),
  isMechanic: z.boolean().default(false),
  firstName: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  signalUrl: z.string().optional().nullable().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL" }
  ).transform(val => val === "" ? null : val),
  ownerBio: z.string().optional().nullable(),
  mechanicBio: z.string().optional().nullable(),
  experience: z.number().int().min(0).max(100).optional().nullable(),
  shopLocation: z.string().optional().nullable(),
  isMobileMechanic: z.boolean().default(false),
  hourlyRate: z.coerce.number().min(0).max(10000).optional().nullable(),
  specialties: z.string().optional().nullable(), // Will store as JSON string
  certifications: z.string().optional().nullable(), // Will store as JSON string
  sampleJobs: z.string().optional().nullable(), // Will store as JSON string
  portfolioPhotos: z.string().optional().nullable(), // Will store as JSON string
  responseTimeHours: z.number().int().min(0).optional().nullable(),
  averageRating: z.coerce.number().min(0).max(5).optional().nullable(),
  isPublic: z.boolean().default(false),
  isClaimed: z.boolean().default(false),
});

export type InsertMechanicmatchProfile = z.infer<typeof insertMechanicmatchProfileSchema>;
export type MechanicmatchProfile = typeof mechanicmatchProfiles.$inferSelect;

// Vehicles owned by car owners
export const mechanicmatchVehicles = pgTable("mechanicmatch_vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id), // Reference to user, not profile
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchVehiclesRelations = relations(mechanicmatchVehicles, ({ one }) => ({
  owner: one(mechanicmatchProfiles, {
    fields: [mechanicmatchVehicles.ownerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "owner",
  }),
}));

export const insertMechanicmatchVehicleSchema = createInsertSchema(mechanicmatchVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true, // Added by server from authenticated user
}).extend({
  make: z.string().min(1, "Make is required").max(50, "Make must be 50 characters or less"),
  model: z.string().min(1, "Model is required").max(100, "Model must be 100 characters or less"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
});

export type InsertMechanicmatchVehicle = z.infer<typeof insertMechanicmatchVehicleSchema>;
export type MechanicmatchVehicle = typeof mechanicmatchVehicles.$inferSelect;

// Service requests posted by car owners
export const mechanicmatchServiceRequests = pgTable("mechanicmatch_service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id), // Reference to user
  vehicleId: varchar("vehicle_id").references(() => mechanicmatchVehicles.id), // Optional - can be null if vehicle not in system
  
  // Request details
  symptoms: text("symptoms").notNull(),
  photos: text("photos"), // JSON array of photo URLs
  videoUrl: text("video_url"), // URL to short video
  estimatedLocation: text("estimated_location"), // Location for service
  
  // Request type
  requestType: varchar("request_type", { length: 20 }).notNull(), // 'advice_only', 'remote_diagnosis', 'in_person'
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default('open'), // 'open', 'accepted', 'in_progress', 'completed', 'cancelled'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchServiceRequestsRelations = relations(mechanicmatchServiceRequests, ({ one }) => ({
  owner: one(mechanicmatchProfiles, {
    fields: [mechanicmatchServiceRequests.ownerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "owner",
  }),
  vehicle: one(mechanicmatchVehicles, {
    fields: [mechanicmatchServiceRequests.vehicleId],
    references: [mechanicmatchVehicles.id],
  }),
}));

export const insertMechanicmatchServiceRequestSchema = createInsertSchema(mechanicmatchServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true, // Added by server from authenticated user
  status: true,
}).extend({
  vehicleId: z.string().uuid().optional().nullable(),
  symptoms: z.string().min(1, "Symptoms description is required"),
  photos: z.string().optional().nullable(), // JSON string
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  estimatedLocation: z.string().optional().nullable(),
  requestType: z.enum(["advice_only", "remote_diagnosis", "in_person"]),
});

export type InsertMechanicmatchServiceRequest = z.infer<typeof insertMechanicmatchServiceRequestSchema>;
export type MechanicmatchServiceRequest = typeof mechanicmatchServiceRequests.$inferSelect;

// Jobs/Bookings (created when mechanic accepts a service request or when booked directly)
export const mechanicmatchJobs = pgTable("mechanicmatch_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").references(() => mechanicmatchServiceRequests.id), // Nullable if direct booking
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  mechanicId: varchar("mechanic_id").notNull().references(() => mechanicmatchProfiles.id),
  
  // Job details
  vehicleId: varchar("vehicle_id").references(() => mechanicmatchVehicles.id),
  symptoms: text("symptoms").notNull(),
  photos: text("photos"), // JSON array
  videoUrl: text("video_url"),
  location: text("location"),
  
  // Job type
  jobType: varchar("job_type", { length: 20 }).notNull(), // 'advice_only', 'remote_diagnosis', 'in_person'
  
  // Scheduling
  scheduledDateTime: timestamp("scheduled_date_time"), // For in-person bookings
  
  // Pricing (for remote diagnosis - per minute)
  ratePerMinute: decimal("rate_per_minute", { precision: 10, scale: 2 }),
  minutesUsed: integer("minutes_used"), // For remote diagnosis sessions
  
  // Job lifecycle
  status: varchar("status", { length: 20 }).notNull().default('requested'), // 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'
  
  // Completion
  mechanicNotes: text("mechanic_notes"),
  ownerNotes: text("owner_notes"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchJobsRelations = relations(mechanicmatchJobs, ({ one }) => ({
  serviceRequest: one(mechanicmatchServiceRequests, {
    fields: [mechanicmatchJobs.serviceRequestId],
    references: [mechanicmatchServiceRequests.id],
  }),
  owner: one(mechanicmatchProfiles, {
    fields: [mechanicmatchJobs.ownerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "owner",
  }),
  mechanic: one(mechanicmatchProfiles, {
    fields: [mechanicmatchJobs.mechanicId],
    references: [mechanicmatchProfiles.id],
    relationName: "mechanic",
  }),
  vehicle: one(mechanicmatchVehicles, {
    fields: [mechanicmatchJobs.vehicleId],
    references: [mechanicmatchVehicles.id],
  }),
}));

export const insertMechanicmatchJobSchema = createInsertSchema(mechanicmatchJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  completedAt: true,
  ownerId: true, // Added by server from authenticated user
}).extend({
  serviceRequestId: z.string().uuid().optional().nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
  symptoms: z.string().min(1, "Symptoms description is required"),
  photos: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().optional().nullable(),
  jobType: z.enum(["advice_only", "remote_diagnosis", "in_person"]),
  scheduledDateTime: z.coerce.date().optional().nullable(),
  ratePerMinute: z.coerce.number().min(0).max(100).optional().nullable(),
  minutesUsed: z.number().int().min(0).optional().nullable(),
  mechanicNotes: z.string().optional().nullable(),
  ownerNotes: z.string().optional().nullable(),
  mechanicId: z.string().uuid(), // Required - the mechanic creating/accepting the job
});

export type InsertMechanicmatchJob = z.infer<typeof insertMechanicmatchJobSchema>;
export type MechanicmatchJob = typeof mechanicmatchJobs.$inferSelect;

// Mechanic availability schedule
export const mechanicmatchAvailability = pgTable("mechanicmatch_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mechanicId: varchar("mechanic_id").notNull().references(() => mechanicmatchProfiles.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: varchar("start_time", { length: 5 }), // HH:MM format (e.g., "09:00")
  endTime: varchar("end_time", { length: 5 }), // HH:MM format (e.g., "17:00")
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchAvailabilityRelations = relations(mechanicmatchAvailability, ({ one }) => ({
  mechanic: one(mechanicmatchProfiles, {
    fields: [mechanicmatchAvailability.mechanicId],
    references: [mechanicmatchProfiles.id],
  }),
}));

export const insertMechanicmatchAvailabilitySchema = createInsertSchema(mechanicmatchAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(), // HH:MM format
  isAvailable: z.boolean().default(true),
});

export type InsertMechanicmatchAvailability = z.infer<typeof insertMechanicmatchAvailabilitySchema>;
export type MechanicmatchAvailability = typeof mechanicmatchAvailability.$inferSelect;

// Reviews/ratings
export const mechanicmatchReviews = pgTable("mechanicmatch_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => mechanicmatchJobs.id), // Optional - can review without job
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id), // User who wrote the review
  revieweeId: varchar("reviewee_id").notNull().references(() => mechanicmatchProfiles.id), // Profile being reviewed (mechanic or owner)
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mechanicmatchReviewsRelations = relations(mechanicmatchReviews, ({ one }) => ({
  job: one(mechanicmatchJobs, {
    fields: [mechanicmatchReviews.jobId],
    references: [mechanicmatchJobs.id],
  }),
  reviewer: one(mechanicmatchProfiles, {
    fields: [mechanicmatchReviews.reviewerId],
    references: [mechanicmatchProfiles.userId],
    relationName: "reviewer",
  }),
  reviewee: one(mechanicmatchProfiles, {
    fields: [mechanicmatchReviews.revieweeId],
    references: [mechanicmatchProfiles.id],
    relationName: "reviewee",
  }),
}));

export const insertMechanicmatchReviewSchema = createInsertSchema(mechanicmatchReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewerId: true, // Added by server from authenticated user
}).extend({
  jobId: z.string().uuid().optional().nullable(),
  revieweeId: z.string().uuid(), // Required - the profile being reviewed (mechanic or owner)
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export type InsertMechanicmatchReview = z.infer<typeof insertMechanicmatchReviewSchema>;
export type MechanicmatchReview = typeof mechanicmatchReviews.$inferSelect;

// Messages between car owners and mechanics
export const mechanicmatchMessages = pgTable("mechanicmatch_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => mechanicmatchJobs.id), // Optional - can message outside of job context
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mechanicmatchMessagesRelations = relations(mechanicmatchMessages, ({ one }) => ({
  job: one(mechanicmatchJobs, {
    fields: [mechanicmatchMessages.jobId],
    references: [mechanicmatchJobs.id],
  }),
  sender: one(users, {
    fields: [mechanicmatchMessages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [mechanicmatchMessages.recipientId],
    references: [users.id],
  }),
}));

export const insertMechanicmatchMessageSchema = createInsertSchema(mechanicmatchMessages).omit({
  id: true,
  createdAt: true,
  senderId: true, // Added by server from authenticated user
}).extend({
  jobId: z.string().uuid().optional().nullable(),
  content: z.string().min(1, "Message content is required"),
  isRead: z.boolean().default(false),
});

export type InsertMechanicmatchMessage = z.infer<typeof insertMechanicmatchMessageSchema>;
export type MechanicmatchMessage = typeof mechanicmatchMessages.$inferSelect;

// MechanicMatch Announcements
export const mechanicmatchAnnouncements = pgTable("mechanicmatch_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMechanicmatchAnnouncementSchema = createInsertSchema(mechanicmatchAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["info", "warning", "maintenance", "update", "promotion"]),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertMechanicmatchAnnouncement = z.infer<typeof insertMechanicmatchAnnouncementSchema>;
export type MechanicmatchAnnouncement = typeof mechanicmatchAnnouncements.$inferSelect;

// MechanicMatch user blocking system - allows blocking mechanics that appear in feed or have interacted
export const mechanicmatchBlocks = pgTable("mechanicmatch_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockedUserId: varchar("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mechanicmatchBlocksRelations = relations(mechanicmatchBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [mechanicmatchBlocks.userId],
    references: [users.id],
    relationName: "mechanicmatchBlocker",
  }),
  blocked: one(users, {
    fields: [mechanicmatchBlocks.blockedUserId],
    references: [users.id],
    relationName: "mechanicmatchBlocked",
  }),
}));

export const insertMechanicmatchBlockSchema = createInsertSchema(mechanicmatchBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertMechanicmatchBlock = z.infer<typeof insertMechanicmatchBlockSchema>;
export type MechanicmatchBlock = typeof mechanicmatchBlocks.$inferSelect;

// ========================================
