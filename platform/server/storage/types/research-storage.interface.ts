/**
 * Research Storage Interface
 * 
 * Defines Research mini-app storage operations.
 */

import type {
  ResearchItem,
  InsertResearchItem,
  ResearchAnswer,
  InsertResearchAnswer,
  ResearchComment,
  InsertResearchComment,
  ResearchVote,
  InsertResearchVote,
  ResearchLinkProvenance,
  InsertResearchLinkProvenance,
  ResearchBookmark,
  InsertResearchBookmark,
  ResearchFollow,
  InsertResearchFollow,
  ResearchReport,
  InsertResearchReport,
  ResearchAnnouncement,
  InsertResearchAnnouncement,
} from "@shared/schema";

export interface IResearchStorage {
  // Research Items
  createResearchItem(item: InsertResearchItem): Promise<ResearchItem>;
  getResearchItemById(id: string): Promise<ResearchItem | undefined>;
  getResearchItems(filters?: {
    userId?: string;
    tag?: string;
    status?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string; // 'relevance', 'recent', 'popular'
  }): Promise<{ items: ResearchItem[]; total: number }>;
  updateResearchItem(id: string, item: Partial<InsertResearchItem>): Promise<ResearchItem>;
  incrementResearchItemViewCount(id: string): Promise<void>;
  acceptResearchAnswer(itemId: string, answerId: string): Promise<ResearchItem>;

  // Research Answers
  createResearchAnswer(answer: InsertResearchAnswer): Promise<ResearchAnswer>;
  getResearchAnswerById(id: string): Promise<ResearchAnswer | undefined>;
  getResearchAnswersByItemId(itemId: string, sortBy?: string): Promise<ResearchAnswer[]>;
  updateResearchAnswer(id: string, answer: Partial<InsertResearchAnswer>): Promise<ResearchAnswer>;
  calculateAnswerRelevance(answerId: string): Promise<number>;
  updateAnswerScore(answerId: string): Promise<void>;

  // Research Comments
  createResearchComment(comment: InsertResearchComment): Promise<ResearchComment>;
  getResearchComments(filters: { researchItemId?: string; answerId?: string }): Promise<ResearchComment[]>;
  updateResearchComment(id: string, comment: Partial<InsertResearchComment>): Promise<ResearchComment>;
  deleteResearchComment(id: string): Promise<void>;

  // Research Votes
  createOrUpdateResearchVote(vote: InsertResearchVote): Promise<ResearchVote>;
  getResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<ResearchVote | undefined>;
  deleteResearchVote(userId: string, researchItemId?: string, answerId?: string): Promise<void>;

  // Research Link Provenances
  createResearchLinkProvenance(provenance: InsertResearchLinkProvenance): Promise<ResearchLinkProvenance>;
  getResearchLinkProvenancesByAnswerId(answerId: string): Promise<ResearchLinkProvenance[]>;
  updateResearchLinkProvenance(id: string, provenance: Partial<InsertResearchLinkProvenance>): Promise<ResearchLinkProvenance>;
  calculateAnswerVerificationScore(answerId: string): Promise<number>;

  // Research Bookmarks & Follows
  createResearchBookmark(bookmark: InsertResearchBookmark): Promise<ResearchBookmark>;
  deleteResearchBookmark(userId: string, researchItemId: string): Promise<void>;
  getResearchBookmarks(userId: string): Promise<ResearchBookmark[]>;
  createResearchFollow(follow: InsertResearchFollow): Promise<ResearchFollow>;
  deleteResearchFollow(userId: string, filters: { followedUserId?: string; researchItemId?: string; tag?: string }): Promise<void>;
  getResearchFollows(userId: string): Promise<ResearchFollow[]>;

  // Research Reports
  createResearchReport(report: InsertResearchReport): Promise<ResearchReport>;
  getResearchReports(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ reports: ResearchReport[]; total: number }>;
  updateResearchReport(id: string, report: Partial<InsertResearchReport>): Promise<ResearchReport>;

  // Research Announcements
  createResearchAnnouncement(announcement: InsertResearchAnnouncement): Promise<ResearchAnnouncement>;
  getActiveResearchAnnouncements(): Promise<ResearchAnnouncement[]>;
  getAllResearchAnnouncements(): Promise<ResearchAnnouncement[]>;
  updateResearchAnnouncement(id: string, announcement: Partial<InsertResearchAnnouncement>): Promise<ResearchAnnouncement>;
  deactivateResearchAnnouncement(id: string): Promise<ResearchAnnouncement>;

  // Research Timeline/Feed
  getResearchTimeline(userId: string, limit?: number, offset?: number): Promise<ResearchItem[]>;

  // User Reputation (calculated)
  getUserReputation(userId: string): Promise<number>;
}

