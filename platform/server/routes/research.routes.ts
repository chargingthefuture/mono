/**
 * Research routes
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
  insertResearchItemSchema,
    insertResearchAnswerSchema,
    insertResearchCommentSchema,
    insertResearchVoteSchema,
    insertResearchLinkProvenanceSchema,
    insertResearchBookmarkSchema,
    insertResearchFollowSchema,
    insertResearchReportSchema,
    insertResearchAnnouncementSchema,
} from "@shared/schema";

export function registerResearchRoutes(app: Express) {
  // COMPARENOTES ROUTES

  // CompareNotes Announcement routes (public)
  app.get('/api/comparenotes/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveResearchAnnouncements(),
      'getActiveResearchAnnouncements'
    );
    res.json(announcements);
  }));

  // CompareNotes Item routes
  app.post('/api/comparenotes/items', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    // Parse JSON arrays if strings
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        logWarning(`Failed to parse tags JSON for CompareNotes item by user ${userId}`, req, {
          userId,
          rawTags: body.tags,
          error: e instanceof Error ? e.message : String(e)
        });
        body.tags = [];
      }
    }
    if (typeof body.attachments === 'string') {
      try {
        body.attachments = JSON.parse(body.attachments);
      } catch (e) {
        logWarning(`Failed to parse attachments JSON for CompareNotes item by user ${userId}`, req, {
          userId,
          rawAttachments: body.attachments,
          error: e instanceof Error ? e.message : String(e)
        });
        body.attachments = [];
      }
    }

    const validatedData = validateWithZod(insertResearchItemSchema, { ...body, userId }, 'Invalid question data');
    const item = await withDatabaseErrorHandling(
      () => storage.createResearchItem(validatedData),
      'createResearchItem'
    );
    
    logInfo(`CompareNotes question created: ${item.id} by ${userId}`, req);
    res.json(item);
  }));

  app.get('/api/comparenotes/items', asyncHandler(async (req, res) => {
    const filters: any = {};
    if (req.query.userId) filters.userId = req.query.userId as string;
    if (req.query.tag) filters.tag = req.query.tag as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    filters.limit = parseInt(req.query.limit as string || "50");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getResearchItems(filters),
      'getResearchItems'
    );
    res.json(result);
  }));

  app.get('/api/comparenotes/items/public', publicListingLimiter, asyncHandler(async (req, res) => {
    const filters: any = { isPublic: true };
    if (req.query.tag) filters.tag = req.query.tag as string;
    if (req.query.search) filters.search = req.query.search as string;
    filters.limit = parseInt(req.query.limit as string || "20");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getResearchItems(filters),
      'getResearchItems'
    );
    res.json(result.items);
  }));

  app.get('/api/comparenotes/public/:id', publicListingLimiter, asyncHandler(async (req, res) => {
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.id),
      'getResearchItemById'
    );
    if (!item) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    if (!item.isPublic) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    // Increment view count
    await withDatabaseErrorHandling(
      () => storage.incrementResearchItemViewCount(req.params.id),
      'incrementResearchItemViewCount'
    );
    
    res.json(item);
  }));

  app.get('/api/comparenotes/items/:id', asyncHandler(async (req, res) => {
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.id),
      'getResearchItemById'
    );
    if (!item) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    // Increment view count
    await withDatabaseErrorHandling(
      () => storage.incrementResearchItemViewCount(req.params.id),
      'incrementResearchItemViewCount'
    );
    
    res.json(item);
  }));

  app.put('/api/comparenotes/items/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.id),
      'getResearchItemById'
    );
    
    if (!item) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    if (item.userId !== userId && !(await isUserAdmin(req))) {
      throw new ForbiddenError("Forbidden");
    }

    const body = req.body;
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }
    if (typeof body.attachments === 'string') {
      try {
        body.attachments = JSON.parse(body.attachments);
      } catch (e) {
        body.attachments = [];
      }
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchItem(req.params.id, body),
      'updateResearchItem'
    );
    res.json(updated);
  }));

  // CompareNotes Answer routes
  app.post('/api/comparenotes/answers', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    if (typeof body.links === 'string') {
      try {
        body.links = JSON.parse(body.links);
      } catch (e) {
        body.links = [];
      }
    }
    if (typeof body.attachments === 'string') {
      try {
        body.attachments = JSON.parse(body.attachments);
      } catch (e) {
        body.attachments = [];
      }
    }

    const validatedData = validateWithZod(insertResearchAnswerSchema, { ...body, userId }, 'Invalid answer data');
    const answer = await withDatabaseErrorHandling(
      () => storage.createResearchAnswer(validatedData),
      'createResearchAnswer'
    );
    
    // Trigger link verification for any links provided
    if (validatedData.links && validatedData.links.length > 0) {
      // Queue link verification (async, non-blocking)
      setImmediate(async () => {
        for (const url of validatedData.links || []) {
          try {
            await verifyCompareNotesLink(answer.id, url);
          } catch (error) {
            // Error is already logged in verifyCompareNotesLink
            // Just continue processing other links
          }
        }
      });
    }
    
    res.json(answer);
  }));

  app.get('/api/comparenotes/items/:id/answers', asyncHandler(async (req, res) => {
    const sortBy = req.query.sortBy as string || "relevance";
    const answers = await withDatabaseErrorHandling(
      () => storage.getResearchAnswersByItemId(req.params.id, sortBy),
      'getResearchAnswersByItemId'
    );
    res.json(answers);
  }));

  app.get('/api/comparenotes/answers/:id', asyncHandler(async (req, res) => {
    const answer = await withDatabaseErrorHandling(
      () => storage.getResearchAnswerById(req.params.id),
      'getResearchAnswerById'
    );
    if (!answer) {
      throw new NotFoundError('Answer', req.params.id);
    }
    res.json(answer);
  }));

  app.put('/api/comparenotes/answers/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const answer = await withDatabaseErrorHandling(
      () => storage.getResearchAnswerById(req.params.id),
      'getResearchAnswerById'
    );
    
    if (!answer) {
      throw new NotFoundError('Answer', req.params.id);
    }
    
    if (answer.userId !== userId && !(await isUserAdmin(req))) {
      throw new ForbiddenError("Forbidden");
    }

    const body = req.body;
    if (typeof body.links === 'string') {
      try {
        body.links = JSON.parse(body.links);
      } catch (e) {
        body.links = [];
      }
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchAnswer(req.params.id, body),
      'updateResearchAnswer'
    );
    res.json(updated);
  }));

  // Accept answer endpoint
  app.post('/api/comparenotes/items/:itemId/accept-answer/:answerId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.itemId),
      'getResearchItemById'
    );
    
    if (!item || item.userId !== userId) {
      throw new ForbiddenError("Forbidden");
    }

    const updatedItem = await withDatabaseErrorHandling(
      () => storage.acceptResearchAnswer(req.params.itemId, req.params.answerId),
      'acceptResearchAnswer'
    );
    res.json(updatedItem);
  }));

  // CompareNotes Comment routes
  app.post('/api/comparenotes/comments', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchCommentSchema, { ...req.body, userId }, 'Invalid comment data');
    const comment = await withDatabaseErrorHandling(
      () => storage.createResearchComment(validatedData),
      'createResearchComment'
    );
    res.json(comment);
  }));

  app.get('/api/comparenotes/comments', asyncHandler(async (req, res) => {
    const filters: any = {};
    if (req.query.researchItemId) filters.researchItemId = req.query.researchItemId as string;
    if (req.query.answerId) filters.answerId = req.query.answerId as string;
    
    const comments = await withDatabaseErrorHandling(
      () => storage.getResearchComments(filters),
      'getResearchComments'
    );
    res.json(comments);
  }));

  app.put('/api/comparenotes/comments/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const comment = await withDatabaseErrorHandling(
      () => storage.getResearchComments({ researchItemId: undefined, answerId: undefined }).then(cs => cs.find(c => c.id === req.params.id)),
      'getResearchComments'
    );
    
    if (!comment || comment.userId !== userId) {
      throw new ForbiddenError("Forbidden");
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchComment(req.params.id, req.body),
      'updateResearchComment'
    );
    res.json(updated);
  }));

  app.delete('/api/comparenotes/comments/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    // Note: In production, check ownership or admin status
    await withDatabaseErrorHandling(
      () => storage.deleteResearchComment(req.params.id),
      'deleteResearchComment'
    );
    res.json({ message: "Comment deleted" });
  }));

  // CompareNotes Vote routes
  app.post('/api/comparenotes/votes', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchVoteSchema, { ...req.body, userId }, 'Invalid vote data');
    const vote = await withDatabaseErrorHandling(
      () => storage.createOrUpdateResearchVote(validatedData),
      'createOrUpdateResearchVote'
    );
    res.json(vote);
  }));

  app.get('/api/comparenotes/votes', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const researchItemId = req.query.researchItemId as string;
    const answerId = req.query.answerId as string;
    
    const vote = await withDatabaseErrorHandling(
      () => storage.getResearchVote(userId, researchItemId, answerId),
      'getResearchVote'
    );
    res.json(vote || null);
  }));

  app.delete('/api/comparenotes/votes', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const researchItemId = req.query.researchItemId as string;
    const answerId = req.query.answerId as string;
    
    await storage.deleteResearchVote(userId, researchItemId, answerId);
    res.json({ message: "Vote deleted" });
  }));

  // CompareNotes Bookmark routes
  app.post('/api/comparenotes/bookmarks', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchBookmarkSchema, { ...req.body, userId }, 'Invalid bookmark data');
    const bookmark = await withDatabaseErrorHandling(
      () => storage.createResearchBookmark(validatedData),
      'createResearchBookmark'
    );
    res.json(bookmark);
  }));

  app.delete('/api/comparenotes/bookmarks/:itemId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteResearchBookmark(userId, req.params.itemId),
      'deleteResearchBookmark'
    );
    res.json({ message: "Bookmark deleted" });
  }));

  app.get('/api/comparenotes/bookmarks', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const bookmarks = await withDatabaseErrorHandling(
      () => storage.getResearchBookmarks(userId),
      'getResearchBookmarks'
    );
    
    // Fetch full questions for each bookmark
    const items = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const item = await withDatabaseErrorHandling(
          () => storage.getResearchItemById(bookmark.researchItemId),
          'getResearchItemById'
        );
        return item;
      })
    );
    
    // Filter out any null items (in case a bookmarked item was deleted)
    const validItems = items.filter((item): item is NonNullable<typeof item> => item !== undefined);
    
    res.json({ items: validItems, total: validItems.length });
  }));

  // CompareNotes Follow routes
  app.post('/api/comparenotes/follows', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchFollowSchema, { ...req.body, userId }, 'Invalid follow data');
    const follow = await withDatabaseErrorHandling(
      () => storage.createResearchFollow(validatedData),
      'createResearchFollow'
    );
    res.json(follow);
  }));

  app.delete('/api/comparenotes/follows', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const filters: any = {};
    if (req.query.followedUserId) filters.followedUserId = req.query.followedUserId as string;
    if (req.query.researchItemId) filters.researchItemId = req.query.researchItemId as string;
    if (req.query.tag) filters.tag = req.query.tag as string;
    
    await withDatabaseErrorHandling(
      () => storage.deleteResearchFollow(userId, filters),
      'deleteResearchFollow'
    );
    res.json({ message: "Follow deleted" });
  }));

  app.get('/api/comparenotes/follows', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const follows = await withDatabaseErrorHandling(
      () => storage.getResearchFollows(userId),
      'getResearchFollows'
    );
    res.json(follows);
  }));

  // CompareNotes Timeline/Feed
  app.get('/api/comparenotes/timeline', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const limit = parseInt(req.query.limit as string || "50");
    const offset = parseInt(req.query.offset as string || "0");
    
    const items = await withDatabaseErrorHandling(
      () => storage.getResearchTimeline(userId, limit, offset),
      'getResearchTimeline'
    );
    res.json(items);
  }));

  // CompareNotes Link Provenance routes
  app.get('/api/comparenotes/answers/:answerId/links', asyncHandler(async (req, res) => {
    const provenances = await withDatabaseErrorHandling(
      () => storage.getResearchLinkProvenancesByAnswerId(req.params.answerId),
      'getResearchLinkProvenancesByAnswerId'
    );
    res.json(provenances);
  }));

  // Link verification endpoint (triggers async verification)
  app.post('/api/comparenotes/verify-link', isAuthenticated, asyncHandler(async (req: any, res) => {
    const { answerId, url } = req.body;
    
    if (!answerId || !url) {
      throw new ValidationError("answerId and url are required");
    }

    // Queue verification (non-blocking)
    setImmediate(async () => {
      try {
        await verifyCompareNotesLink(answerId, url);
      } catch (error) {
        // Error is already logged in verifyCompareNotesLink
      }
    });

    res.json({ message: "Link verification queued" });
  }));

  // CompareNotes Report routes
  app.post('/api/comparenotes/reports', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchReportSchema, { ...req.body, userId }, 'Invalid report data');
    const report = await withDatabaseErrorHandling(
      () => storage.createResearchReport(validatedData),
      'createResearchReport'
    );
    res.json(report);
  }));

  app.get('/api/comparenotes/admin/reports', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status as string;
    filters.limit = parseInt(req.query.limit as string || "50");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getResearchReports(filters),
      'getResearchReports'
    );
    res.json(result);
  }));

  app.put('/api/comparenotes/admin/reports/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchReport(req.params.id, {
        ...req.body,
        reviewedBy: userId,
        reviewedAt: new Date(),
      }),
      'updateResearchReport'
    );
    res.json(updated);
  }));

  // CompareNotes User Reputation
  app.get('/api/comparenotes/users/:userId/reputation', asyncHandler(async (req, res) => {
    const reputation = await withDatabaseErrorHandling(
      () => storage.getUserReputation(req.params.userId),
      'getUserReputation'
    );
    res.json({ reputation });
  }));

  // CompareNotes Admin Announcement routes
  app.get('/api/comparenotes/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllResearchAnnouncements(),
      'getAllResearchAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/comparenotes/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createResearchAnnouncement(validatedData),
      'createResearchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_comparenotes_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/comparenotes/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data') as Partial<z.infer<typeof insertResearchAnnouncementSchema>>;
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateResearchAnnouncement(req.params.id, validatedData),
      'updateResearchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_comparenotes_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/comparenotes/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateResearchAnnouncement(req.params.id),
      'deactivateResearchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_comparenotes_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // Link verification helper function - fetches actual content and computes real similarity
  async function verifyCompareNotesLink(answerId: string, url: string): Promise<void> {
    try {
      // Get answer content for similarity comparison
      const answer = await withDatabaseErrorHandling(
        () => storage.getResearchAnswerById(answerId),
        'getResearchAnswerForLinkVerification'
      );

      if (!answer) {
        throw new Error(`Answer ${answerId} not found`);
      }

      // Verify link using the link verification utility
      const verificationResult = await verifyLink(answerId, url, answer.bodyMd);

      // Create provenance entry with real verification data
      await storage.createResearchLinkProvenance({
        answerId,
        url,
        httpStatus: verificationResult.httpStatus,
        title: verificationResult.title,
        snippet: verificationResult.snippet,
        domain: verificationResult.domain,
        domainScore: verificationResult.domainScore,
        similarityScore: verificationResult.similarityScore,
        isSupportive: verificationResult.isSupportive,
      });
    } catch (error: any) {
      // Log error but don't throw - we want to continue processing other links
      logError(error, undefined);
      Sentry.captureException(error, {
        tags: { component: 'linkVerification', answerId, url },
      });
    }
  }

}
