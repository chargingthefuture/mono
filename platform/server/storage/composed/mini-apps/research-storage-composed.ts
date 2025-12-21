/**
 * Research Storage Composed
 * 
 * Handles delegation of Research storage operations.
 */

import type { IResearchStorage } from '../../types/research-storage.interface';
import { ResearchStorage } from '../../mini-apps';

export class ResearchStorageComposed implements IResearchStorage {
  private researchStorage: ResearchStorage;

  constructor() {
    this.researchStorage = new ResearchStorage();
  }

  // Item operations
  async createResearchItem(item: any) {
    return this.researchStorage.createResearchItem(item);
  }

  async getResearchItemById(id: string) {
    return this.researchStorage.getResearchItemById(id);
  }

  async getResearchItems(filters?: any) {
    return this.researchStorage.getResearchItems(filters);
  }

  async updateResearchItem(id: string, item: any) {
    return this.researchStorage.updateResearchItem(id, item);
  }

  async incrementResearchItemViewCount(id: string) {
    return this.researchStorage.incrementResearchItemViewCount(id);
  }

  // Answer operations
  async acceptResearchAnswer(itemId: string, answerId: string) {
    return this.researchStorage.acceptResearchAnswer(itemId, answerId);
  }

  async createResearchAnswer(answer: any) {
    return this.researchStorage.createResearchAnswer(answer);
  }

  async getResearchAnswerById(id: string) {
    return this.researchStorage.getResearchAnswerById(id);
  }

  async getResearchAnswersByItemId(itemId: string, sortBy?: string) {
    return this.researchStorage.getResearchAnswersByItemId(itemId, sortBy);
  }

  async updateResearchAnswer(id: string, answer: any) {
    return this.researchStorage.updateResearchAnswer(id, answer);
  }

  async calculateAnswerRelevance(answerId: string) {
    return this.researchStorage.calculateAnswerRelevance(answerId);
  }

  async updateAnswerScore(answerId: string) {
    return this.researchStorage.updateAnswerScore(answerId);
  }

  async calculateAnswerVerificationScore(answerId: string) {
    return this.researchStorage.calculateAnswerVerificationScore(answerId);
  }

  // Comment operations
  async createResearchComment(comment: any) {
    return this.researchStorage.createResearchComment(comment);
  }

  async getResearchComments(filters: any) {
    return this.researchStorage.getResearchComments(filters);
  }

  async updateResearchComment(id: string, comment: any) {
    return this.researchStorage.updateResearchComment(id, comment);
  }

  async deleteResearchComment(id: string) {
    return this.researchStorage.deleteResearchComment(id);
  }

  // Vote operations
  async createOrUpdateResearchVote(vote: any) {
    return this.researchStorage.createOrUpdateResearchVote(vote);
  }

  async getResearchVote(userId: string, researchItemId?: string, answerId?: string) {
    return this.researchStorage.getResearchVote(userId, researchItemId, answerId);
  }

  async deleteResearchVote(userId: string, researchItemId?: string, answerId?: string) {
    return this.researchStorage.deleteResearchVote(userId, researchItemId, answerId);
  }

  // Provenance operations
  async createResearchLinkProvenance(provenance: any) {
    return this.researchStorage.createResearchLinkProvenance(provenance);
  }

  async getResearchLinkProvenancesByAnswerId(answerId: string) {
    return this.researchStorage.getResearchLinkProvenancesByAnswerId(answerId);
  }

  async updateResearchLinkProvenance(id: string, provenance: any) {
    return this.researchStorage.updateResearchLinkProvenance(id, provenance);
  }

  // Bookmark operations
  async createResearchBookmark(bookmark: any) {
    return this.researchStorage.createResearchBookmark(bookmark);
  }

  async deleteResearchBookmark(userId: string, researchItemId: string) {
    return this.researchStorage.deleteResearchBookmark(userId, researchItemId);
  }

  async getResearchBookmarks(userId: string) {
    return this.researchStorage.getResearchBookmarks(userId);
  }

  // Follow operations
  async createResearchFollow(follow: any) {
    return this.researchStorage.createResearchFollow(follow);
  }

  async deleteResearchFollow(userId: string, filters: any) {
    return this.researchStorage.deleteResearchFollow(userId, filters);
  }

  async getResearchFollows(userId: string) {
    return this.researchStorage.getResearchFollows(userId);
  }

  // Report operations
  async createResearchReport(report: any) {
    return this.researchStorage.createResearchReport(report);
  }

  async getResearchReports(filters?: any) {
    return this.researchStorage.getResearchReports(filters);
  }

  async updateResearchReport(id: string, report: any) {
    return this.researchStorage.updateResearchReport(id, report);
  }

  // Announcement operations
  async createResearchAnnouncement(announcement: any) {
    return this.researchStorage.createResearchAnnouncement(announcement);
  }

  async getActiveResearchAnnouncements() {
    return this.researchStorage.getActiveResearchAnnouncements();
  }

  async getAllResearchAnnouncements() {
    return this.researchStorage.getAllResearchAnnouncements();
  }

  async updateResearchAnnouncement(id: string, announcement: any) {
    return this.researchStorage.updateResearchAnnouncement(id, announcement);
  }

  async deactivateResearchAnnouncement(id: string) {
    return this.researchStorage.deactivateResearchAnnouncement(id);
  }

  // Timeline and reputation
  async getResearchTimeline(userId: string, limit?: number, offset?: number) {
    return this.researchStorage.getResearchTimeline(userId, limit, offset);
  }

  async getUserReputation(userId: string) {
    return this.researchStorage.getUserReputation(userId);
  }
}

