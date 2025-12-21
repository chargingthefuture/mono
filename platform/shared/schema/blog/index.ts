/**
 * Blog App Schema
 * 
 * Contains all database tables, relations, and Zod schemas for the Blog mini-app.
 */

import { sql } from 'drizzle-orm';
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

// Blog posts imported from Discourse (and future native posts)
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt"),
  contentMd: text("content_md").notNull(),
  contentHtml: text("content_html"),
  authorName: varchar("author_name", { length: 200 }),
  source: varchar("source", { length: 50 }).notNull().default("discourse"), // discourse, native, etc.
  discourseTopicId: integer("discourse_topic_id"),
  discoursePostId: integer("discourse_post_id"),
  tags: text("tags"), // JSON-encoded string[] for now
  category: varchar("category", { length: 100 }),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "Title is required").max(300),
  slug: z.string().min(1, "Slug is required").max(300),
  excerpt: z.string().optional().nullable(),
  contentMd: z.string().min(1, "Content is required"),
  contentHtml: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  source: z.string().optional(),
  discourseTopicId: z.coerce.number().int().optional().nullable(),
  discoursePostId: z.coerce.number().int().optional().nullable(),
  tags: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog comments imported from Discourse (replies to blog posts)
export const blogComments = pgTable("blog_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discourseTopicId: integer("discourse_topic_id").notNull(),
  discoursePostId: integer("discourse_post_id").notNull().unique(),
  postNumber: integer("post_number").notNull(),
  source: varchar("source", { length: 50 }).notNull().default("discourse"), // discourse, native, etc.
  contentMd: text("content_md").notNull(),
  contentHtml: text("content_html"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  discourseTopicId: z.coerce.number().int(),
  discoursePostId: z.coerce.number().int(),
  postNumber: z.coerce.number().int(),
  contentMd: z.string().min(1, "Content is required"),
  contentHtml: z.string().optional().nullable(),
  source: z.string().optional(),
});

export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;
export type BlogComment = typeof blogComments.$inferSelect;

// Blog Announcements (mini-app specific, shown on blog pages)
export const blogAnnouncements = pgTable("blog_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"), // info, warning, maintenance, update, promotion
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogAnnouncementSchema = createInsertSchema(blogAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expiresAt: z.coerce.date().optional().nullable(),
});

export type InsertBlogAnnouncement = z.infer<typeof insertBlogAnnouncementSchema>;
export type BlogAnnouncement = typeof blogAnnouncements.$inferSelect;
