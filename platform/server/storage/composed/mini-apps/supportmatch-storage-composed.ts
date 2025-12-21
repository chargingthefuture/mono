/**
 * SupportMatch Storage Composed
 * 
 * Handles delegation of SupportMatch storage operations.
 */

import type { ISupportMatchStorage } from '../../types/supportmatch-storage.interface';
import { SupportMatchStorage } from '../../mini-apps';

export class SupportMatchStorageComposed implements ISupportMatchStorage {
  private supportMatchStorage: SupportMatchStorage;

  constructor() {
    this.supportMatchStorage = new SupportMatchStorage();
  }

  // Profile operations
  async getSupportMatchProfile(userId: string) {
    return this.supportMatchStorage.getSupportMatchProfile(userId);
  }

  async createSupportMatchProfile(profile: any) {
    return this.supportMatchStorage.createSupportMatchProfile(profile);
  }

  async updateSupportMatchProfile(userId: string, profile: any) {
    return this.supportMatchStorage.updateSupportMatchProfile(userId, profile);
  }

  async getAllActiveSupportMatchProfiles() {
    return this.supportMatchStorage.getAllActiveSupportMatchProfiles();
  }

  async getAllSupportMatchProfiles() {
    return this.supportMatchStorage.getAllSupportMatchProfiles();
  }

  // Partnership operations
  async createPartnership(partnership: any) {
    return this.supportMatchStorage.createPartnership(partnership);
  }

  async getPartnershipById(id: string) {
    return this.supportMatchStorage.getPartnershipById(id);
  }

  async getActivePartnershipByUser(userId: string) {
    return this.supportMatchStorage.getActivePartnershipByUser(userId);
  }

  async getAllPartnerships() {
    return this.supportMatchStorage.getAllPartnerships();
  }

  async getPartnershipHistory(userId: string) {
    return this.supportMatchStorage.getPartnershipHistory(userId);
  }

  async updatePartnershipStatus(id: string, status: string) {
    return this.supportMatchStorage.updatePartnershipStatus(id, status);
  }

  async createAlgorithmicMatches() {
    return this.supportMatchStorage.createAlgorithmicMatches();
  }

  // Message operations
  async createMessage(message: any) {
    return this.supportMatchStorage.createMessage(message);
  }

  async getMessagesByPartnership(partnershipId: string) {
    return this.supportMatchStorage.getMessagesByPartnership(partnershipId);
  }

  // Exclusion operations
  async createExclusion(exclusion: any) {
    return this.supportMatchStorage.createExclusion(exclusion);
  }

  async getExclusionsByUser(userId: string) {
    return this.supportMatchStorage.getExclusionsByUser(userId);
  }

  async checkMutualExclusion(user1Id: string, user2Id: string) {
    return this.supportMatchStorage.checkMutualExclusion(user1Id, user2Id);
  }

  async deleteExclusion(id: string) {
    return this.supportMatchStorage.deleteExclusion(id);
  }

  // Report operations
  async createReport(report: any) {
    return this.supportMatchStorage.createReport(report);
  }

  async getAllReports() {
    return this.supportMatchStorage.getAllReports();
  }

  async updateReportStatus(id: string, status: string, resolution?: string) {
    return this.supportMatchStorage.updateReportStatus(id, status, resolution);
  }

  // Announcement operations
  async createAnnouncement(announcement: any) {
    return this.supportMatchStorage.createAnnouncement(announcement);
  }

  async getActiveAnnouncements() {
    return this.supportMatchStorage.getActiveAnnouncements();
  }

  async getAllAnnouncements() {
    return this.supportMatchStorage.getAllAnnouncements();
  }

  async updateAnnouncement(id: string, announcement: any) {
    return this.supportMatchStorage.updateAnnouncement(id, announcement);
  }

  async deactivateAnnouncement(id: string) {
    return this.supportMatchStorage.deactivateAnnouncement(id);
  }

  async createSupportmatchAnnouncement(announcement: any) {
    return this.supportMatchStorage.createSupportmatchAnnouncement(announcement);
  }

  async getActiveSupportmatchAnnouncements() {
    return this.supportMatchStorage.getActiveSupportmatchAnnouncements();
  }

  async getAllSupportmatchAnnouncements() {
    return this.supportMatchStorage.getAllSupportmatchAnnouncements();
  }

  async updateSupportmatchAnnouncement(id: string, announcement: any) {
    return this.supportMatchStorage.updateSupportmatchAnnouncement(id, announcement);
  }

  async deactivateSupportmatchAnnouncement(id: string) {
    return this.supportMatchStorage.deactivateSupportmatchAnnouncement(id);
  }

  // Stats operations
  async getSupportMatchStats() {
    return this.supportMatchStorage.getSupportMatchStats();
  }

  // Profile deletion
  async deleteSupportMatchProfile(userId: string, reason?: string) {
    return this.supportMatchStorage.deleteSupportMatchProfile(userId, reason);
  }
}

