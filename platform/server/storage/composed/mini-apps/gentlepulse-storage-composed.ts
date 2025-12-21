/**
 * GentlePulse Storage Composed
 * 
 * Handles delegation of GentlePulse storage operations.
 */

import type { IGentlePulseStorage } from '../../types/gentlepulse-storage.interface';
import { GentlePulseStorage } from '../../mini-apps';

export class GentlePulseStorageComposed implements IGentlePulseStorage {
  private gentlePulseStorage: GentlePulseStorage;

  constructor() {
    this.gentlePulseStorage = new GentlePulseStorage();
  }

  // Meditation operations
  async createGentlepulseMeditation(meditation: any) {
    return this.gentlePulseStorage.createGentlepulseMeditation(meditation);
  }

  async getGentlepulseMeditations(filters?: any) {
    return this.gentlePulseStorage.getGentlepulseMeditations(filters);
  }

  async getGentlepulseMeditationById(id: string) {
    return this.gentlePulseStorage.getGentlepulseMeditationById(id);
  }

  async updateGentlepulseMeditation(id: string, meditation: any) {
    return this.gentlePulseStorage.updateGentlepulseMeditation(id, meditation);
  }

  async incrementGentlepulsePlayCount(id: string) {
    return this.gentlePulseStorage.incrementGentlepulsePlayCount(id);
  }

  // Rating operations
  async createOrUpdateGentlepulseRating(rating: any) {
    return this.gentlePulseStorage.createOrUpdateGentlepulseRating(rating);
  }

  async getGentlepulseRatingsByMeditationId(meditationId: string) {
    return this.gentlePulseStorage.getGentlepulseRatingsByMeditationId(meditationId);
  }

  async getGentlepulseRatingByClientAndMeditation(clientId: string, meditationId: string) {
    return this.gentlePulseStorage.getGentlepulseRatingByClientAndMeditation(clientId, meditationId);
  }

  async updateGentlepulseMeditationRating(meditationId: string) {
    return this.gentlePulseStorage.updateGentlepulseMeditationRating(meditationId);
  }

  // Mood check operations
  async createGentlepulseMoodCheck(moodCheck: any) {
    return this.gentlePulseStorage.createGentlepulseMoodCheck(moodCheck);
  }

  async getGentlepulseMoodChecksByClientId(clientId: string, days?: number) {
    return this.gentlePulseStorage.getGentlepulseMoodChecksByClientId(clientId, days);
  }

  async getGentlepulseMoodChecksByDateRange(startDate: Date, endDate: Date) {
    return this.gentlePulseStorage.getGentlepulseMoodChecksByDateRange(startDate, endDate);
  }

  // Favorite operations
  async createGentlepulseFavorite(favorite: any) {
    return this.gentlePulseStorage.createGentlepulseFavorite(favorite);
  }

  async deleteGentlepulseFavorite(clientId: string, meditationId: string) {
    return this.gentlePulseStorage.deleteGentlepulseFavorite(clientId, meditationId);
  }

  async getGentlepulseFavoritesByClientId(clientId: string) {
    return this.gentlePulseStorage.getGentlepulseFavoritesByClientId(clientId);
  }

  async isGentlepulseFavorite(clientId: string, meditationId: string) {
    return this.gentlePulseStorage.isGentlepulseFavorite(clientId, meditationId);
  }

  // Announcement operations
  async createGentlepulseAnnouncement(announcement: any) {
    return this.gentlePulseStorage.createGentlepulseAnnouncement(announcement);
  }

  async getActiveGentlepulseAnnouncements() {
    return this.gentlePulseStorage.getActiveGentlepulseAnnouncements();
  }

  async getAllGentlepulseAnnouncements() {
    return this.gentlePulseStorage.getAllGentlepulseAnnouncements();
  }

  async updateGentlepulseAnnouncement(id: string, announcement: any) {
    return this.gentlePulseStorage.updateGentlepulseAnnouncement(id, announcement);
  }

  async deactivateGentlepulseAnnouncement(id: string) {
    return this.gentlePulseStorage.deactivateGentlepulseAnnouncement(id);
  }
}

