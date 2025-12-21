/**
 * LostMail App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the LostMail mini-app.
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

// LostMail Incidents
export const lostmailIncidents = pgTable("lostmail_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reporter information
  reporterName: varchar("reporter_name", { length: 200 }).notNull(),
  reporterEmail: varchar("reporter_email", { length: 255 }).notNull(),
  reporterPhone: varchar("reporter_phone", { length: 50 }),
  
  // Incident details
  incidentType: varchar("incident_type", { length: 50 }).notNull(), // 'lost', 'damaged', 'tampered', 'delayed'
  carrier: varchar("carrier", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date").notNull(),
  noticedDate: timestamp("noticed_date"),
  description: text("description").notNull(),
  
  // Photos (stored as JSON array of file paths)
  photos: text("photos"), // JSON array of photo file paths
  
  // Incident management
  severity: varchar("severity", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high'
  status: varchar("status", { length: 20 }).notNull().default('submitted'), // 'submitted', 'under_review', 'in_progress', 'resolved', 'closed'
  
  // Consent and assignment
  consent: boolean("consent").notNull().default(false),
  assignedTo: varchar("assigned_to", { length: 200 }), // Admin name or user ID
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lostmailIncidentsRelations = relations(lostmailIncidents, ({ many }) => ({
  auditTrail: many(lostmailAuditTrail),
}));

export const insertLostmailIncidentSchema = createInsertSchema(lostmailIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  reporterName: z.string().min(1, "Reporter name is required").max(200, "Name must be 200 characters or less"),
  reporterEmail: z.string().email("Valid email is required").max(255, "Email must be 255 characters or less"),
  reporterPhone: z.string().max(50).optional().nullable(),
  incidentType: z.enum(["lost", "damaged", "tampered", "delayed"]),
  carrier: z.string().max(100).optional().nullable(),
  trackingNumber: z.string().min(1, "Tracking number is required").max(100, "Tracking number must be 100 characters or less"),
  expectedDeliveryDate: z.coerce.date(),
  noticedDate: z.coerce.date().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  photos: z.string().optional().nullable(), // JSON string array
  severity: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["submitted", "under_review", "in_progress", "resolved", "closed"]).default("submitted"),
  consent: z.boolean().default(false),
  assignedTo: z.string().max(200).optional().nullable(),
});

export type InsertLostmailIncident = z.infer<typeof insertLostmailIncidentSchema>;
export type LostmailIncident = typeof lostmailIncidents.$inferSelect;

// LostMail Audit Trail
export const lostmailAuditTrail = pgTable("lostmail_audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => lostmailIncidents.id),
  adminName: varchar("admin_name", { length: 200 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // 'status_change', 'note_added', 'assigned', etc.
  note: text("note"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const lostmailAuditTrailRelations = relations(lostmailAuditTrail, ({ one }) => ({
  incident: one(lostmailIncidents, {
    fields: [lostmailAuditTrail.incidentId],
    references: [lostmailIncidents.id],
  }),
}));

export const insertLostmailAuditTrailSchema = createInsertSchema(lostmailAuditTrail).omit({
  id: true,
  timestamp: true,
}).extend({
  adminName: z.string().min(1, "Admin name is required").max(200),
  action: z.string().min(1, "Action is required").max(50),
  note: z.string().optional().nullable(),
});

export type InsertLostmailAuditTrail = z.infer<typeof insertLostmailAuditTrailSchema>;
export type LostmailAuditTrail = typeof lostmailAuditTrail.$inferSelect;

// LostMail Announcements
export const lostmailAnnouncements = pgTable("lostmail_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLostmailAnnouncementSchema = createInsertSchema(lostmailAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertLostmailAnnouncement = z.infer<typeof insertLostmailAnnouncementSchema>;
export type LostmailAnnouncement = typeof lostmailAnnouncements.$inferSelect;

// ========================================
