/**
 * Blog routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError } from "../errors";
import { logAdminAction } from "./shared";
import { z } from "zod";
import {
  insertBlogPostSchema,
    insertBlogAnnouncementSchema,
} from "@shared/schema";

export function registerBlogRoutes(app: Express) {
  // BLOG (CONTENT-ONLY) ROUTES

  // Public blog announcements
  app.get('/api/blog/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveBlogAnnouncements(),
      'getActiveBlogAnnouncements'
    );
    res.json(announcements);
  }));

  // Public blog post list (no auth, rate-limited, paginated)
  app.get('/api/blog/posts', publicListingLimiter, asyncHandler(async (req, res) => {
    const limit = parseInt((req.query.limit as string) || "50", 10);
    const offset = parseInt((req.query.offset as string) || "0", 10);
    const result = await withDatabaseErrorHandling(
      () => storage.getPublishedBlogPosts(limit, offset),
      'getPublishedBlogPosts'
    );
    // Must return { items, total } for standardized pagination
    res.json(result);
  }));

  // Public single blog post by slug
  app.get('/api/blog/posts/:slug', publicItemLimiter, asyncHandler(async (req, res) => {
    const post = await withDatabaseErrorHandling(
      () => storage.getBlogPostBySlug(req.params.slug),
      'getBlogPostBySlug'
    );
    if (!post) {
      throw new NotFoundError('BlogPost', req.params.slug);
    }
    res.json(post);
  }));

  // Public blog post comments (replies imported from Discourse), paginated
  app.get('/api/blog/posts/:slug/comments', publicListingLimiter, asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const limit = parseInt((req.query.limit as string) || "50", 10);
    const offset = parseInt((req.query.offset as string) || "0", 10);

    const post = await withDatabaseErrorHandling(
      () => storage.getBlogPostBySlug(slug),
      'getBlogPostBySlug'
    );

    if (!post) {
      throw new NotFoundError('BlogPost', slug);
    }

    // If this post was not imported from Discourse or has no topic ID, return empty comments
    if (!post.discourseTopicId) {
      return res.json({ items: [], total: 0 });
    }

    const comments = await withDatabaseErrorHandling(
      () => storage.getBlogCommentsForTopic(post.discourseTopicId!, limit, offset),
      'getBlogCommentsForTopic'
    );

    res.json(comments);
  }));

  // Admin blog post routes
  app.get('/api/blog/admin/posts', isAuthenticated, isAdmin, asyncHandler(async (_req: any, res) => {
    const posts = await withDatabaseErrorHandling(
      () => storage.getAllBlogPosts(),
      'getAllBlogPosts'
    );
    res.json(posts);
  }));

  app.post('/api/blog/admin/posts', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertBlogPostSchema, req.body, 'Invalid blog post data');
    const post = await withDatabaseErrorHandling(
      () => storage.createBlogPost(validatedData),
      'createBlogPost'
    );

    await logAdminAction(
      userId,
      "create_blog_post",
      "blog_post",
      post.id,
      { title: post.title, slug: post.slug }
    );

    res.json(post);
  }));

  app.put('/api/blog/admin/posts/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const post = await withDatabaseErrorHandling(
      () => storage.updateBlogPost(req.params.id, req.body),
      'updateBlogPost'
    );

    await logAdminAction(
      userId,
      "update_blog_post",
      "blog_post",
      post.id,
      { title: post.title, slug: post.slug }
    );

    res.json(post);
  }));

  app.delete('/api/blog/admin/posts/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteBlogPost(req.params.id),
      'deleteBlogPost'
    );

    await logAdminAction(
      userId,
      "delete_blog_post",
      "blog_post",
      req.params.id,
      {}
    );

    res.json({ message: "Blog post deleted" });
  }));

  // Admin blog announcement routes
  app.get('/api/blog/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req: any, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllBlogAnnouncements(),
      'getAllBlogAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/blog/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertBlogAnnouncementSchema, req.body, 'Invalid blog announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.createBlogAnnouncement(validatedData),
      'createBlogAnnouncement'
    );

    await logAdminAction(
      userId,
      "create_blog_announcement",
      "blog_announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/blog/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateBlogAnnouncement(req.params.id, req.body),
      'updateBlogAnnouncement'
    );

    await logAdminAction(
      userId,
      "update_blog_announcement",
      "blog_announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/blog/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateBlogAnnouncement(req.params.id),
      'deactivateBlogAnnouncement'
    );

    await logAdminAction(
      userId,
      "deactivate_blog_announcement",
      "blog_announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // GentlePulse Admin routes
  app.post('/api/gentlepulse/admin/meditations', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }

    const validatedData = validateWithZod(insertGentlepulseMeditationSchema, body, 'Invalid meditation data');
    const meditation = await withDatabaseErrorHandling(
      () => storage.createGentlepulseMeditation(validatedData),
      'createGentlepulseMeditation'
    );
    
    await logAdminAction(
      userId,
      "create_gentlepulse_meditation",
      "meditation",
      meditation.id,
      { title: meditation.title }
    );

    res.json(meditation);
  }));

  app.put('/api/gentlepulse/admin/meditations/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }

    const meditation = await withDatabaseErrorHandling(
      () => storage.updateGentlepulseMeditation(req.params.id, body),
      'updateGentlepulseMeditation'
    );
    
    await logAdminAction(
      userId,
      "update_gentlepulse_meditation",
      "meditation",
      meditation.id,
      { title: meditation.title }
    );

    res.json(meditation);
  }));

  // GentlePulse Admin Announcement routes
  app.get('/api/gentlepulse/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllGentlepulseAnnouncements(),
      'getAllGentlepulseAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/gentlepulse/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertGentlepulseAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createGentlepulseAnnouncement(validatedData),
      'createGentlepulseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_gentlepulse_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/gentlepulse/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertGentlepulseAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertGentlepulseAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateGentlepulseAnnouncement(req.params.id, validatedData),
      'updateGentlepulseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_gentlepulse_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/gentlepulse/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateGentlepulseAnnouncement(req.params.id),
      'deactivateGentlepulseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_gentlepulse_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));


}
