/**
 * Research Storage Module
 * 
 * Handles all Research mini-app operations: items, answers, comments, votes,
 * link provenances, bookmarks, follows, reports, announcements, timeline, and reputation.
 */

import {
  researchItems,
  researchAnswers,
  researchComments,
  researchVotes,
  researchLinkProvenances,
  researchBookmarks,
  researchFollows,
  researchReports,
  researchAnnouncements,
  type ResearchItem,
  type InsertResearchItem,
  type ResearchAnswer,
  type InsertResearchAnswer,
  type ResearchComment,
  type InsertResearchComment,
  type ResearchVote,
  type InsertResearchVote,
  type ResearchLinkProvenance,
  type InsertResearchLinkProvenance,
  type ResearchBookmark,
  type InsertResearchBookmark,
  type ResearchFollow,
  type InsertResearchFollow,
  type ResearchReport,
  type InsertResearchReport,
  type ResearchAnnouncement,
  type InsertResearchAnnouncement,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, asc, or, gte, sql, inArray } from "drizzle-orm";

export class ResearchStorage {
  // ========================================
  // RESEARCH ITEM OPERATIONS
  // ========================================

  async createResearchItem(itemData: InsertResearchItem): Promise<ResearchItem> {
    const [item] = await db
      .insert(researchItems)
      .values({
        ...itemData,
        tags: itemData.tags ? JSON.stringify(itemData.tags) : null,
        attachments: itemData.attachments ? JSON.stringify(itemData.attachments) : null,
      })
      .returning();
    return item;
  }

  async getResearchItemById(id: string): Promise<ResearchItem | undefined> {
    const [item] = await db
      .select()
      .from(researchItems)
      .where(eq(researchItems.id, id));
    return item;
  }

  async getResearchItems(filters?: {
    userId?: string;
    tag?: string;
    status?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string; // 'relevance', 'recent', 'popular'
  }): Promise<{ items: ResearchItem[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions: any[] = [];

    if (filters?.userId) {
      conditions.push(eq(researchItems.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(researchItems.status, filters.status));
    }
    if (filters?.isPublic !== undefined) {
      conditions.push(eq(researchItems.isPublic, filters.isPublic));
    }
    if (filters?.tag) {
      conditions.push(sql`${researchItems.tags}::text ILIKE ${`%${filters.tag}%`}`);
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${researchItems.title} ILIKE ${searchTerm}`,
          sql`${researchItems.bodyMd} ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchItems)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Determine sort order
    let orderBy: any = desc(researchItems.createdAt);
    if (filters?.sortBy === "popular") {
      orderBy = desc(researchItems.viewCount);
    } else if (filters?.sortBy === "recent") {
      orderBy = desc(researchItems.updatedAt);
    }

    const items = await db
      .select()
      .from(researchItems)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { items, total };
  }

  async updateResearchItem(id: string, itemData: Partial<InsertResearchItem>): Promise<ResearchItem> {
    const updateData: any = { ...itemData, updatedAt: new Date() };
    if (itemData.tags !== undefined) {
      updateData.tags = itemData.tags ? JSON.stringify(itemData.tags) : null;
    }
    if (itemData.attachments !== undefined) {
      updateData.attachments = itemData.attachments ? JSON.stringify(itemData.attachments) : null;
    }
    
    const [item] = await db
      .update(researchItems)
      .set(updateData)
      .where(eq(researchItems.id, id))
      .returning();
    return item;
  }

  async incrementResearchItemViewCount(id: string): Promise<void> {
    await db
      .update(researchItems)
      .set({ viewCount: sql`${researchItems.viewCount} + 1` })
      .where(eq(researchItems.id, id));
  }

  async acceptResearchAnswer(itemId: string, answerId: string): Promise<ResearchItem> {
    // Unaccept previous answer if any
    await db
      .update(researchAnswers)
      .set({ isAccepted: false })
      .where(eq(researchAnswers.researchItemId, itemId));

    // Accept new answer
    await db
      .update(researchAnswers)
      .set({ isAccepted: true })
      .where(eq(researchAnswers.id, answerId));

    // Update item
    const [item] = await db
      .update(researchItems)
      .set({
        acceptedAnswerId: answerId,
        status: "answered",
        updatedAt: new Date(),
      })
      .where(eq(researchItems.id, itemId))
      .returning();

    return item;
  }

  // ========================================
  // RESEARCH ANSWER OPERATIONS
  // ========================================

  async createResearchAnswer(answerData: InsertResearchAnswer): Promise<ResearchAnswer> {
    const [answer] = await db
      .insert(researchAnswers)
      .values({
        ...answerData,
        links: answerData.links ? JSON.stringify(answerData.links) : null,
        attachments: answerData.attachments ? JSON.stringify(answerData.attachments) : null,
      })
      .returning();
    
    // Calculate initial relevance
    await this.calculateAnswerRelevance(answer.id);
    
    return answer;
  }

  async getResearchAnswerById(id: string): Promise<ResearchAnswer | undefined> {
    const [answer] = await db
      .select()
      .from(researchAnswers)
      .where(eq(researchAnswers.id, id));
    return answer;
  }

  async getResearchAnswersByItemId(itemId: string, sortBy?: string): Promise<ResearchAnswer[]> {
    let orderBy: any = desc(researchAnswers.relevanceScore); // Default: relevance
    
    if (sortBy === "score") {
      orderBy = desc(researchAnswers.score);
    } else if (sortBy === "recent") {
      orderBy = desc(researchAnswers.createdAt);
    } else if (sortBy === "confidence") {
      orderBy = desc(researchAnswers.confidenceScore);
    }

    return await db
      .select()
      .from(researchAnswers)
      .where(eq(researchAnswers.researchItemId, itemId))
      .orderBy(orderBy);
  }

  async updateResearchAnswer(id: string, answerData: Partial<InsertResearchAnswer>): Promise<ResearchAnswer> {
    const updateData: any = { ...answerData, updatedAt: new Date() };
    if (answerData.links !== undefined) {
      updateData.links = answerData.links ? JSON.stringify(answerData.links) : null;
    }
    if (answerData.attachments !== undefined) {
      updateData.attachments = answerData.attachments ? JSON.stringify(answerData.attachments) : null;
    }

    const [answer] = await db
      .update(researchAnswers)
      .set(updateData)
      .where(eq(researchAnswers.id, id))
      .returning();

    // Recalculate relevance if links or content changed
    if (answerData.links || answerData.bodyMd) {
      await this.calculateAnswerRelevance(id);
    }

    return answer;
  }

  async calculateAnswerRelevance(answerId: string): Promise<number> {
    // Get answer with related data
    const answer = await this.getResearchAnswerById(answerId);
    if (!answer) return 0;

    // Get user reputation
    const userRep = await this.getUserReputation(answer.userId);

    // Get link provenances and calculate source trust
    const provenances = await this.getResearchLinkProvenancesByAnswerId(answerId);
    const avgDomainScore = provenances.length > 0
      ? provenances.reduce((sum, p) => sum + (Number(p.domainScore || 0)), 0) / provenances.length
      : 0;

    // Get vote score
    const voteScore = answer.score || 0;

    // Calculate verification score
    const verificationScore = Number(answer.verificationScore || 0);

    // Normalize values (simple normalization - in production, use more sophisticated approach)
    const normalizedUpvotes = Math.min(voteScore / 10, 1); // Cap at 10 upvotes = 1.0
    const normalizedReputation = Math.min(userRep / 100, 1); // Cap at 100 rep = 1.0
    const normalizedSourceTrust = avgDomainScore; // Already 0-1
    const normalizedSimilarity = verificationScore; // Already 0-1

    // Recency boost (decay over 30 days)
    const daysSinceCreation = (Date.now() - new Date(answer.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - (daysSinceCreation / 30));

    // Weighted formula (default weights from requirements)
    const w1 = 0.35; // upvotes
    const w2 = 0.20; // reputation
    const w3 = 0.25; // source trust
    const w4 = 0.15; // similarity
    const w5 = 0.05; // recency

    const relevanceScore = (
      w1 * normalizedUpvotes +
      w2 * normalizedReputation +
      w3 * normalizedSourceTrust +
      w4 * normalizedSimilarity +
      w5 * recencyBoost
    );

    // Update answer with relevance score
    await db
      .update(researchAnswers)
      .set({ relevanceScore: relevanceScore.toString() })
      .where(eq(researchAnswers.id, answerId));

    return relevanceScore;
  }

  async updateAnswerScore(answerId: string): Promise<void> {
    // Calculate score from votes
    const votes = await db
      .select()
      .from(researchVotes)
      .where(eq(researchVotes.answerId, answerId));

    const score = votes.reduce((sum, vote) => sum + vote.value, 0);

    await db
      .update(researchAnswers)
      .set({ score })
      .where(eq(researchAnswers.id, answerId));

    // Recalculate relevance
    await this.calculateAnswerRelevance(answerId);
  }

  // ========================================
  // RESEARCH COMMENT OPERATIONS
  // ========================================

  async createResearchComment(commentData: InsertResearchComment): Promise<ResearchComment> {
    const [comment] = await db
      .insert(researchComments)
      .values(commentData)
      .returning();
    return comment;
  }

  async getResearchComments(filters: { researchItemId?: string; answerId?: string }): Promise<ResearchComment[]> {
    const conditions: any[] = [];
    if (filters.researchItemId) {
      conditions.push(eq(researchComments.researchItemId, filters.researchItemId));
    }
    if (filters.answerId) {
      conditions.push(eq(researchComments.answerId, filters.answerId));
    }

    return await db
      .select()
      .from(researchComments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(researchComments.createdAt));
  }

  async updateResearchComment(id: string, commentData: Partial<InsertResearchComment>): Promise<ResearchComment> {
    const [comment] = await db
      .update(researchComments)
      .set({ ...commentData, updatedAt: new Date() })
      .where(eq(researchComments.id, id))
      .returning();
    return comment;
  }

  async deleteResearchComment(id: string): Promise<void> {
    await db.delete(researchComments).where(eq(researchComments.id, id));
  }

  // ========================================
  // RESEARCH VOTE OPERATIONS
  // ========================================

  async createOrUpdateResearchVote(voteData: InsertResearchVote): Promise<ResearchVote> {
    // Check if vote exists
    const existing = await this.getResearchVote(voteData.userId, voteData.researchItemId || undefined, voteData.answerId || undefined);

    // Convert string value to number for database
    const voteValue = typeof voteData.value === 'string' ? parseInt(voteData.value, 10) : voteData.value;

    if (existing) {
      // Update existing vote
      const [vote] = await db
        .update(researchVotes)
        .set({ value: voteValue })
        .where(eq(researchVotes.id, existing.id))
        .returning();

      // Update answer score if voting on answer
      if (voteData.answerId) {
        await this.updateAnswerScore(voteData.answerId);
      }

      return vote;
    } else {
      // Create new vote
      const [vote] = await db
        .insert(researchVotes)
        .values({ ...voteData, value: voteValue })
        .returning();

      // Update answer score if voting on answer
      if (voteData.answerId) {
        await this.updateAnswerScore(voteData.answerId);
      }

      return vote;
    }
  }

  async getResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<ResearchVote | undefined> {
    const conditions: any[] = [eq(researchVotes.userId, userId)];
    if (researchItemId) {
      conditions.push(eq(researchVotes.researchItemId, researchItemId));
    }
    if (answerId) {
      conditions.push(eq(researchVotes.answerId, answerId));
    }

    const [vote] = await db
      .select()
      .from(researchVotes)
      .where(and(...conditions));
    return vote;
  }

  async deleteResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<void> {
    const conditions: any[] = [eq(researchVotes.userId, userId)];
    if (researchItemId) {
      conditions.push(eq(researchVotes.researchItemId, researchItemId));
    }
    if (answerId) {
      conditions.push(eq(researchVotes.answerId, answerId));
    }

    await db.delete(researchVotes).where(and(...conditions));

    // Update answer score if voting on answer
    if (answerId) {
      await this.updateAnswerScore(answerId);
    }
  }

  // ========================================
  // RESEARCH LINK PROVENANCE OPERATIONS
  // ========================================

  async createResearchLinkProvenance(provenanceData: InsertResearchLinkProvenance): Promise<ResearchLinkProvenance> {
    // Convert number fields to strings for decimal columns
    const dataToInsert: any = { ...provenanceData };
    if (dataToInsert.domainScore !== undefined && dataToInsert.domainScore !== null) {
      dataToInsert.domainScore = dataToInsert.domainScore.toString();
    }
    if (dataToInsert.similarityScore !== undefined && dataToInsert.similarityScore !== null) {
      dataToInsert.similarityScore = dataToInsert.similarityScore.toString();
    }
    const [provenance] = await db
      .insert(researchLinkProvenances)
      .values(dataToInsert)
      .returning();

    // Recalculate verification score for answer
    if (provenanceData.answerId) {
      await this.calculateAnswerVerificationScore(provenanceData.answerId);
    }

    return provenance;
  }

  async getResearchLinkProvenancesByAnswerId(answerId: string): Promise<ResearchLinkProvenance[]> {
    return await db
      .select()
      .from(researchLinkProvenances)
      .where(eq(researchLinkProvenances.answerId, answerId))
      .orderBy(desc(researchLinkProvenances.similarityScore));
  }

  async updateResearchLinkProvenance(id: string, provenanceData: Partial<InsertResearchLinkProvenance>): Promise<ResearchLinkProvenance> {
    // Convert numeric fields to strings for drizzle
    const updateData: any = { ...provenanceData };
    if (updateData.domainScore !== undefined && updateData.domainScore !== null && typeof updateData.domainScore === 'number') {
      updateData.domainScore = updateData.domainScore.toString();
    }
    if (updateData.similarityScore !== undefined && updateData.similarityScore !== null && typeof updateData.similarityScore === 'number') {
      updateData.similarityScore = updateData.similarityScore.toString();
    }
    const [provenance] = await db
      .update(researchLinkProvenances)
      .set(updateData)
      .where(eq(researchLinkProvenances.id, id))
      .returning();

    // Recalculate verification score
    if (provenance.answerId) {
      await this.calculateAnswerVerificationScore(provenance.answerId);
    }

    return provenance;
  }

  async calculateAnswerVerificationScore(answerId: string): Promise<number> {
    const provenances = await this.getResearchLinkProvenancesByAnswerId(answerId);
    
    if (provenances.length === 0) {
      await db
        .update(researchAnswers)
        .set({ verificationScore: "0" })
        .where(eq(researchAnswers.id, answerId));
      return 0;
    }

    // Average similarity score weighted by domain score
    const totalWeight = provenances.reduce((sum, p) => {
      const domainWeight = Number(p.domainScore || 0.5); // Default 0.5 if no domain score
      const similarity = Number(p.similarityScore || 0);
      return sum + (domainWeight * similarity);
    }, 0);

    const avgScore = totalWeight / provenances.length;
    const normalizedScore = Math.min(Math.max(avgScore, 0), 1);

    await db
      .update(researchAnswers)
      .set({ verificationScore: normalizedScore.toString() })
      .where(eq(researchAnswers.id, answerId));

    // Recalculate relevance
    await this.calculateAnswerRelevance(answerId);

    return normalizedScore;
  }

  // ========================================
  // RESEARCH BOOKMARK & FOLLOW OPERATIONS
  // ========================================

  async createResearchBookmark(bookmarkData: InsertResearchBookmark): Promise<ResearchBookmark> {
    const [bookmark] = await db
      .insert(researchBookmarks)
      .values(bookmarkData)
      .returning();
    return bookmark;
  }

  async deleteResearchBookmark(userId: string, researchItemId: string): Promise<void> {
    await db
      .delete(researchBookmarks)
      .where(
        and(
          eq(researchBookmarks.userId, userId),
          eq(researchBookmarks.researchItemId, researchItemId)
        )
      );
  }

  async getResearchBookmarks(userId: string): Promise<ResearchBookmark[]> {
    return await db
      .select()
      .from(researchBookmarks)
      .where(eq(researchBookmarks.userId, userId))
      .orderBy(desc(researchBookmarks.createdAt));
  }

  async createResearchFollow(followData: InsertResearchFollow): Promise<ResearchFollow> {
    const [follow] = await db
      .insert(researchFollows)
      .values(followData)
      .returning();
    return follow;
  }

  async deleteResearchFollow(userId: string, filters: { followedUserId?: string; researchItemId?: string; tag?: string }): Promise<void> {
    const conditions: any[] = [eq(researchFollows.userId, userId)];
    if (filters.followedUserId) {
      conditions.push(eq(researchFollows.followedUserId, filters.followedUserId));
    }
    if (filters.researchItemId) {
      conditions.push(eq(researchFollows.researchItemId, filters.researchItemId));
    }
    if (filters.tag) {
      conditions.push(eq(researchFollows.tag, filters.tag));
    }

    await db.delete(researchFollows).where(and(...conditions));
  }

  async getResearchFollows(userId: string): Promise<ResearchFollow[]> {
    return await db
      .select()
      .from(researchFollows)
      .where(eq(researchFollows.userId, userId));
  }

  // ========================================
  // RESEARCH REPORT OPERATIONS
  // ========================================

  async createResearchReport(reportData: InsertResearchReport): Promise<ResearchReport> {
    const [report] = await db
      .insert(researchReports)
      .values(reportData)
      .returning();
    return report;
  }

  async getResearchReports(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ reports: ResearchReport[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const conditions: any[] = [];

    if (filters?.status) {
      conditions.push(eq(researchReports.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchReports)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const reports = await db
      .select()
      .from(researchReports)
      .where(whereClause)
      .orderBy(desc(researchReports.createdAt))
      .limit(limit)
      .offset(offset);

    return { reports, total };
  }

  async updateResearchReport(id: string, reportData: Partial<InsertResearchReport>): Promise<ResearchReport> {
    const [report] = await db
      .update(researchReports)
      .set(reportData)
      .where(eq(researchReports.id, id))
      .returning();
    return report;
  }

  // ========================================
  // RESEARCH ANNOUNCEMENT OPERATIONS
  // ========================================

  async createResearchAnnouncement(announcementData: InsertResearchAnnouncement): Promise<ResearchAnnouncement> {
    const [announcement] = await db
      .insert(researchAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveResearchAnnouncements(): Promise<ResearchAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(researchAnnouncements)
      .where(
        and(
          eq(researchAnnouncements.isActive, true),
          or(
            sql`${researchAnnouncements.expiresAt} IS NULL`,
            gte(researchAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(researchAnnouncements.createdAt));
  }

  async getAllResearchAnnouncements(): Promise<ResearchAnnouncement[]> {
    return await db
      .select()
      .from(researchAnnouncements)
      .orderBy(desc(researchAnnouncements.createdAt));
  }

  async updateResearchAnnouncement(id: string, announcementData: Partial<InsertResearchAnnouncement>): Promise<ResearchAnnouncement> {
    const [announcement] = await db
      .update(researchAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(researchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateResearchAnnouncement(id: string): Promise<ResearchAnnouncement> {
    const [announcement] = await db
      .update(researchAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(researchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // RESEARCH TIMELINE/FEED OPERATIONS
  // ========================================

  async getResearchTimeline(userId: string, limit: number = 50, offset: number = 0): Promise<ResearchItem[]> {
    // Get followed items, users, and tags
    const follows = await this.getResearchFollows(userId);
    
    const conditions: any[] = [
      or(
        eq(researchItems.isPublic, true),
        eq(researchItems.userId, userId)
      )
    ];

    // Add followed users' items
    const followedUserIds = follows.filter(f => f.followedUserId).map(f => f.followedUserId!);
    if (followedUserIds.length > 0) {
      conditions.push(inArray(researchItems.userId, followedUserIds));
    }

    // Add followed items
    const followedItemIds = follows.filter(f => f.researchItemId).map(f => f.researchItemId!);
    if (followedItemIds.length > 0) {
      conditions.push(inArray(researchItems.id, followedItemIds));
    }

    // For followed tags, we'd need to check JSON array - simplified here
    const followedTags = follows.filter(f => f.tag).map(f => f.tag!);

    return await db
      .select()
      .from(researchItems)
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(researchItems.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  // ========================================
  // USER REPUTATION (CALCULATED)
  // ========================================

  async getUserReputation(userId: string): Promise<number> {
    // Get accepted answers
    const acceptedAnswers = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchAnswers)
      .where(
        and(
          eq(researchAnswers.userId, userId),
          eq(researchAnswers.isAccepted, true)
        )
      );

    const acceptedCount = Number(acceptedAnswers[0]?.count || 0);

    // Get total upvotes on user's answers
    const upvotes = await db
      .select({ count: sql<number>`count(*)` })
      .from(researchVotes)
      .innerJoin(researchAnswers, eq(researchVotes.answerId, researchAnswers.id))
      .where(
        and(
          eq(researchAnswers.userId, userId),
          eq(researchVotes.value, 1)
        )
      );

    const upvoteCount = Number(upvotes[0]?.count || 0);

    // Simple reputation formula: 10 points per accepted answer + 1 point per upvote
    return acceptedCount * 10 + upvoteCount;
  }
}


