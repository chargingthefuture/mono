/**
 * Research App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the Research mini-app.
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
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../core/users";

// Research Items (questions/posts)
export const researchItems = pgTable("research_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 300 }).notNull(),
  bodyMd: text("body_md").notNull(),
  tags: text("tags"), // JSON array of strings
  attachments: text("attachments"), // JSON array of file paths/URLs
  deadline: timestamp("deadline"),
  isPublic: boolean("is_public").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("open"), // open, in_progress, answered, closed
  acceptedAnswerId: varchar("accepted_answer_id"),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchItemsRelations = relations(researchItems, ({ one, many }) => ({
  user: one(users, {
    fields: [researchItems.userId],
    references: [users.id],
  }),
  acceptedAnswer: one(researchAnswers, {
    fields: [researchItems.acceptedAnswerId],
    references: [researchAnswers.id],
  }),
  answers: many(researchAnswers),
  comments: many(researchComments),
  votes: many(researchVotes),
  bookmarks: many(researchBookmarks),
  reports: many(researchReports),
}));

export const insertResearchItemSchema = createInsertSchema(researchItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  acceptedAnswerId: true,
}).extend({
  title: z.string().min(1, "Title is required").max(300, "Title must be 300 characters or less"),
  bodyMd: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
  isPublic: z.boolean().default(false),
  status: z.enum(["open", "in_progress", "answered", "closed"]).default("open"),
});

export type InsertResearchItem = z.infer<typeof insertResearchItemSchema>;
export type ResearchItem = typeof researchItems.$inferSelect;

// Research Answers
export const researchAnswers = pgTable("research_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  researchItemId: varchar("research_item_id").notNull().references(() => researchItems.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  bodyMd: text("body_md").notNull(),
  links: text("links"), // JSON array of URLs
  attachments: text("attachments"), // JSON array of file paths/URLs
  confidenceScore: integer("confidence_score"), // 0-100
  score: integer("score").default(0).notNull(), // Calculated from votes
  isAccepted: boolean("is_accepted").default(false).notNull(),
  relevanceScore: numeric("relevance_score", { precision: 10, scale: 6 }), // Calculated relevance
  verificationScore: numeric("verification_score", { precision: 10, scale: 6 }), // Link verification score
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchAnswersRelations = relations(researchAnswers, ({ one, many }) => ({
  researchItem: one(researchItems, {
    fields: [researchAnswers.researchItemId],
    references: [researchItems.id],
  }),
  user: one(users, {
    fields: [researchAnswers.userId],
    references: [users.id],
  }),
  comments: many(researchComments),
  votes: many(researchVotes),
  linkProvenances: many(researchLinkProvenances),
}));

export const insertResearchAnswerSchema = createInsertSchema(researchAnswers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  score: true,
  isAccepted: true,
  relevanceScore: true,
  verificationScore: true,
}).extend({
  bodyMd: z.string().min(1, "Answer is required"),
  links: z.array(z.string().url()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  confidenceScore: z.number().int().min(0).max(100).optional().nullable(),
});

export type InsertResearchAnswer = z.infer<typeof insertResearchAnswerSchema>;
export type ResearchAnswer = typeof researchAnswers.$inferSelect;

// Research Comments (nested one level)
export const researchComments = pgTable("research_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  answerId: varchar("answer_id").references(() => researchAnswers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  bodyMd: text("body_md").notNull(),
  parentCommentId: varchar("parent_comment_id"), // For one-level nesting
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchCommentsRelations = relations(researchComments, ({ one, many }) => ({
  researchItem: one(researchItems, {
    fields: [researchComments.researchItemId],
    references: [researchItems.id],
  }),
  answer: one(researchAnswers, {
    fields: [researchComments.answerId],
    references: [researchAnswers.id],
  }),
  user: one(users, {
    fields: [researchComments.userId],
    references: [users.id],
  }),
  parentComment: one(researchComments, {
    fields: [researchComments.parentCommentId],
    references: [researchComments.id],
  }),
  replies: many(researchComments),
}));

export const insertResearchCommentSchema = createInsertSchema(researchComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  bodyMd: z.string().min(1, "Comment is required"),
  researchItemId: z.string().optional().nullable(),
  answerId: z.string().optional().nullable(),
  parentCommentId: z.string().optional().nullable(),
});

export type InsertResearchComment = z.infer<typeof insertResearchCommentSchema>;
export type ResearchComment = typeof researchComments.$inferSelect;

// Research Votes
export const researchVotes = pgTable("research_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  answerId: varchar("answer_id").references(() => researchAnswers.id),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchVotesRelations = relations(researchVotes, ({ one }) => ({
  user: one(users, {
    fields: [researchVotes.userId],
    references: [users.id],
  }),
  researchItem: one(researchItems, {
    fields: [researchVotes.researchItemId],
    references: [researchItems.id],
  }),
  answer: one(researchAnswers, {
    fields: [researchVotes.answerId],
    references: [researchAnswers.id],
  }),
}));

export const insertResearchVoteSchema = createInsertSchema(researchVotes).omit({
  id: true,
  createdAt: true,
}).extend({
  researchItemId: z.string().optional().nullable(),
  answerId: z.string().optional().nullable(),
  value: z.enum(["-1", "1"]),
});

export type InsertResearchVote = z.infer<typeof insertResearchVoteSchema>;
export type ResearchVote = typeof researchVotes.$inferSelect;

// Link Provenance (for link verification)
export const researchLinkProvenances = pgTable("research_link_provenances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  answerId: varchar("answer_id").notNull().references(() => researchAnswers.id),
  url: varchar("url", { length: 2048 }).notNull(),
  httpStatus: integer("http_status"),
  title: text("title"),
  snippet: text("snippet"),
  domain: varchar("domain", { length: 255 }),
  domainScore: numeric("domain_score", { precision: 5, scale: 2 }), // 0-1 trust score
  fetchDate: timestamp("fetch_date").defaultNow(),
  similarityScore: numeric("similarity_score", { precision: 5, scale: 4 }), // 0-1 similarity to claim
  isSupportive: boolean("is_supportive").default(false), // True if similarity > threshold and domain_score > threshold
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchLinkProvenancesRelations = relations(researchLinkProvenances, ({ one }) => ({
  answer: one(researchAnswers, {
    fields: [researchLinkProvenances.answerId],
    references: [researchAnswers.id],
  }),
}));

export const insertResearchLinkProvenanceSchema = createInsertSchema(researchLinkProvenances).omit({
  id: true,
  createdAt: true,
  fetchDate: true,
}).extend({
  url: z.string().url(),
  httpStatus: z.number().int().optional().nullable(),
  domainScore: z.number().min(0).max(1).optional().nullable(),
  similarityScore: z.number().min(0).max(1).optional().nullable(),
});

export type InsertResearchLinkProvenance = z.infer<typeof insertResearchLinkProvenanceSchema>;
export type ResearchLinkProvenance = typeof researchLinkProvenances.$inferSelect;

// Research Bookmarks/Saves
export const researchBookmarks = pgTable("research_bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  researchItemId: varchar("research_item_id").notNull().references(() => researchItems.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchBookmarksRelations = relations(researchBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [researchBookmarks.userId],
    references: [users.id],
  }),
  researchItem: one(researchItems, {
    fields: [researchBookmarks.researchItemId],
    references: [researchItems.id],
  }),
}));

export const insertResearchBookmarkSchema = createInsertSchema(researchBookmarks).omit({
  id: true,
  createdAt: true,
});

export type InsertResearchBookmark = z.infer<typeof insertResearchBookmarkSchema>;
export type ResearchBookmark = typeof researchBookmarks.$inferSelect;

// Research Follows
export const researchFollows = pgTable("research_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  followedUserId: varchar("followed_user_id").references(() => users.id),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  tag: varchar("tag", { length: 100 }), // Follow a tag
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchFollowsRelations = relations(researchFollows, ({ one }) => ({
  user: one(users, {
    fields: [researchFollows.userId],
    references: [users.id],
  }),
  followedUser: one(users, {
    fields: [researchFollows.followedUserId],
    references: [users.id],
  }),
  researchItem: one(researchItems, {
    fields: [researchFollows.researchItemId],
    references: [researchItems.id],
  }),
}));

export const insertResearchFollowSchema = createInsertSchema(researchFollows).omit({
  id: true,
  createdAt: true,
}).extend({
  followedUserId: z.string().optional().nullable(),
  researchItemId: z.string().optional().nullable(),
  tag: z.string().optional().nullable(),
});

export type InsertResearchFollow = z.infer<typeof insertResearchFollowSchema>;
export type ResearchFollow = typeof researchFollows.$inferSelect;

// Research Reports (moderation)
export const researchReports = pgTable("research_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  researchItemId: varchar("research_item_id").references(() => researchItems.id),
  answerId: varchar("answer_id").references(() => researchAnswers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, reviewed, resolved, dismissed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

export const researchReportsRelations = relations(researchReports, ({ one }) => ({
  researchItem: one(researchItems, {
    fields: [researchReports.researchItemId],
    references: [researchItems.id],
  }),
  answer: one(researchAnswers, {
    fields: [researchReports.answerId],
    references: [researchAnswers.id],
  }),
  user: one(users, {
    fields: [researchReports.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [researchReports.reviewedBy],
    references: [users.id],
  }),
}));

export const insertResearchReportSchema = createInsertSchema(researchReports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
}).extend({
  researchItemId: z.string().optional().nullable(),
  answerId: z.string().optional().nullable(),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).default("pending"),
});

export type InsertResearchReport = z.infer<typeof insertResearchReportSchema>;
export type ResearchReport = typeof researchReports.$inferSelect;

// Research Announcements
export const researchAnnouncements = pgTable("research_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default('info'),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResearchAnnouncementSchema = createInsertSchema(researchAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertResearchAnnouncement = z.infer<typeof insertResearchAnnouncementSchema>;
export type ResearchAnnouncement = typeof researchAnnouncements.$inferSelect;

// ========================================
