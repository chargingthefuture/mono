/**
 * Blog Storage Composed
 * 
 * Handles delegation of Blog storage operations.
 */

import type { IBlogStorage } from '../../types/blog-storage.interface';
import { BlogStorage } from '../../mini-apps';

export class BlogStorageComposed implements IBlogStorage {
  private blogStorage: BlogStorage;

  constructor() {
    this.blogStorage = new BlogStorage();
  }

  // Post operations
  async getPublishedBlogPosts(limit?: number, offset?: number) {
    return this.blogStorage.getPublishedBlogPosts(limit, offset);
  }

  async getBlogPostBySlug(slug: string) {
    return this.blogStorage.getBlogPostBySlug(slug);
  }

  async getAllBlogPosts() {
    return this.blogStorage.getAllBlogPosts();
  }

  async createBlogPost(post: any) {
    return this.blogStorage.createBlogPost(post);
  }

  async updateBlogPost(id: string, post: any) {
    return this.blogStorage.updateBlogPost(id, post);
  }

  async deleteBlogPost(id: string) {
    return this.blogStorage.deleteBlogPost(id);
  }

  // Comment operations
  async getBlogCommentsForTopic(discourseTopicId: number, limit?: number, offset?: number) {
    return this.blogStorage.getBlogCommentsForTopic(discourseTopicId, limit, offset);
  }

  // Announcement operations
  async createBlogAnnouncement(announcement: any) {
    return this.blogStorage.createBlogAnnouncement(announcement);
  }

  async getActiveBlogAnnouncements() {
    return this.blogStorage.getActiveBlogAnnouncements();
  }

  async getAllBlogAnnouncements() {
    return this.blogStorage.getAllBlogAnnouncements();
  }

  async updateBlogAnnouncement(id: string, announcement: any) {
    return this.blogStorage.updateBlogAnnouncement(id, announcement);
  }

  async deactivateBlogAnnouncement(id: string) {
    return this.blogStorage.deactivateBlogAnnouncement(id);
  }
}

