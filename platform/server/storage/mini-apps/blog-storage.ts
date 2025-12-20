/**
 * Blog Storage Module
 * 
 * Handles all Blog mini-app operations: posts, comments, and announcements.
 */

import {
  blogPosts,
  blogAnnouncements,
  blogComments,
  type BlogPost,
  type InsertBlogPost,
  type BlogAnnouncement,
  type InsertBlogAnnouncement,
  type BlogComment,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, or, gte, sql } from "drizzle-orm";

export class BlogStorage {
  // ========================================
  // BLOG POST OPERATIONS
  // ========================================

  async getPublishedBlogPosts(limit?: number, offset?: number): Promise<{ items: BlogPost[]; total: number }> {
    const limitValue = limit || 50;
    const offsetValue = offset || 0;

    // Get total count of published posts
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated published posts
    const items = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limitValue)
      .offset(offsetValue);

    return { items, total };
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(postData)
      .returning();
    return post;
  }

  async updateBlogPost(id: string, postData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({
        ...postData,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogCommentsForTopic(
    discourseTopicId: number,
    limit?: number,
    offset?: number
  ): Promise<{ items: BlogComment[]; total: number }> {
    const limitValue = limit || 50;
    const offsetValue = offset || 0;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogComments)
      .where(eq(blogComments.discourseTopicId, discourseTopicId));
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated comments
    const items = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.discourseTopicId, discourseTopicId))
      .orderBy(desc(blogComments.createdAt))
      .limit(limitValue)
      .offset(offsetValue);

    return { items, total };
  }

  // ========================================
  // BLOG ANNOUNCEMENT OPERATIONS
  // ========================================

  async createBlogAnnouncement(announcementData: InsertBlogAnnouncement): Promise<BlogAnnouncement> {
    const [announcement] = await db
      .insert(blogAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveBlogAnnouncements(): Promise<BlogAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(blogAnnouncements)
      .where(
        and(
          eq(blogAnnouncements.isActive, true),
          or(
            sql`${blogAnnouncements.expiresAt} IS NULL`,
            gte(blogAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(blogAnnouncements.createdAt));
  }

  async getAllBlogAnnouncements(): Promise<BlogAnnouncement[]> {
    return await db
      .select()
      .from(blogAnnouncements)
      .orderBy(desc(blogAnnouncements.createdAt));
  }

  async updateBlogAnnouncement(id: string, announcementData: Partial<InsertBlogAnnouncement>): Promise<BlogAnnouncement> {
    const [announcement] = await db
      .update(blogAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(blogAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateBlogAnnouncement(id: string): Promise<BlogAnnouncement> {
    const [announcement] = await db
      .update(blogAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(blogAnnouncements.id, id))
      .returning();
    return announcement;
  }
}

