/**
 * Skills Management Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the Skills Management system.
 * This is an admin-managed hierarchy: Sectors → Job Titles → Skills
 */

import { sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Skills Sectors - Top level of hierarchy (e.g., "Healthcare", "Technology")
export const skillsSectors = pgTable("skills_sectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  estimatedWorkforceShare: varchar("estimated_workforce_share", { length: 50 }),
  estimatedWorkforceCount: integer("estimated_workforce_count"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillsSectorSchema = createInsertSchema(skillsSectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSkillsSector = z.infer<typeof insertSkillsSectorSchema>;
export type SkillsSector = typeof skillsSectors.$inferSelect;

// Skills Job Titles - Second level (e.g., "Nurse", "Software Engineer")
export const skillsJobTitles = pgTable("skills_job_titles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectorId: varchar("sector_id").notNull().references(() => skillsSectors.id),
  name: varchar("name", { length: 200 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillsJobTitleSchema = createInsertSchema(skillsJobTitles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSkillsJobTitle = z.infer<typeof insertSkillsJobTitleSchema>;
export type SkillsJobTitle = typeof skillsJobTitles.$inferSelect;

// Skills - Third level (e.g., "CPR Certification", "React.js")
export const skillsSkills = pgTable("skills_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobTitleId: varchar("job_title_id").notNull().references(() => skillsJobTitles.id),
  name: varchar("name", { length: 200 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillsSkillSchema = createInsertSchema(skillsSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSkillsSkill = z.infer<typeof insertSkillsSkillSchema>;
export type SkillsSkill = typeof skillsSkills.$inferSelect;

