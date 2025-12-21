/**
 * Blog Storage Interface
 * 
 * Defines Blog mini-app storage operations.
 */

import type {
  BlogPost,
  InsertBlogPost,
  BlogAnnouncement,
  InsertBlogAnnouncement,
  BlogComment,
} from "@shared/schema";

export interface IBlogStorage {
  // Blog Post operations
  getPublishedBlogPosts(limit?: number, offset?: number): Promise<{ items: BlogPost[]; total: number }>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  getBlogCommentsForTopic(
    discourseTopicId: number,
    limit?: number,
    offset?: number
  ): Promise<{ items: BlogComment[]; total: number }>;

  // Announcement operations
  createBlogAnnouncement(announcement: InsertBlogAnnouncement): Promise<BlogAnnouncement>;
  getActiveBlogAnnouncements(): Promise<BlogAnnouncement[]>;
  getAllBlogAnnouncements(): Promise<BlogAnnouncement[]>;
  updateBlogAnnouncement(id: string, announcement: Partial<InsertBlogAnnouncement>): Promise<BlogAnnouncement>;
  deactivateBlogAnnouncement(id: string): Promise<BlogAnnouncement>;
}

