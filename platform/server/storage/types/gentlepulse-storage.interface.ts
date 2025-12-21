/**
 * GentlePulse Storage Interface
 * 
 * Defines GentlePulse mini-app storage operations.
 */

import type {
  GentlepulseMeditation,
  InsertGentlepulseMeditation,
  GentlepulseRating,
  InsertGentlepulseRating,
  GentlepulseMoodCheck,
  InsertGentlepulseMoodCheck,
  GentlepulseFavorite,
  InsertGentlepulseFavorite,
  GentlepulseAnnouncement,
  InsertGentlepulseAnnouncement,
} from "@shared/schema";

export interface IGentlePulseStorage {
  // Meditation operations
  createGentlepulseMeditation(meditation: InsertGentlepulseMeditation): Promise<GentlepulseMeditation>;
  getGentlepulseMeditations(filters?: {
    tag?: string;
    sortBy?: string; // 'newest', 'most-rated', 'highest-rating'
    limit?: number;
    offset?: number;
  }): Promise<{ meditations: GentlepulseMeditation[]; total: number }>;
  getGentlepulseMeditationById(id: string): Promise<GentlepulseMeditation | undefined>;
  updateGentlepulseMeditation(id: string, meditation: Partial<InsertGentlepulseMeditation>): Promise<GentlepulseMeditation>;
  incrementGentlepulsePlayCount(id: string): Promise<void>;

  // Rating operations
  createOrUpdateGentlepulseRating(rating: InsertGentlepulseRating): Promise<GentlepulseRating>;
  getGentlepulseRatingsByMeditationId(meditationId: string): Promise<GentlepulseRating[]>;
  getGentlepulseRatingByClientAndMeditation(clientId: string, meditationId: string): Promise<GentlepulseRating | undefined>;
  updateGentlepulseMeditationRating(meditationId: string): Promise<void>;

  // Mood Check operations
  createGentlepulseMoodCheck(moodCheck: InsertGentlepulseMoodCheck): Promise<GentlepulseMoodCheck>;
  getGentlepulseMoodChecksByClientId(clientId: string, days?: number): Promise<GentlepulseMoodCheck[]>;
  getGentlepulseMoodChecksByDateRange(startDate: Date, endDate: Date): Promise<GentlepulseMoodCheck[]>;

  // Favorite operations
  createGentlepulseFavorite(favorite: InsertGentlepulseFavorite): Promise<GentlepulseFavorite>;
  deleteGentlepulseFavorite(clientId: string, meditationId: string): Promise<void>;
  getGentlepulseFavoritesByClientId(clientId: string): Promise<GentlepulseFavorite[]>;
  isGentlepulseFavorite(clientId: string, meditationId: string): Promise<boolean>;

  // Announcement operations
  createGentlepulseAnnouncement(announcement: InsertGentlepulseAnnouncement): Promise<GentlepulseAnnouncement>;
  getActiveGentlepulseAnnouncements(): Promise<GentlepulseAnnouncement[]>;
  getAllGentlepulseAnnouncements(): Promise<GentlepulseAnnouncement[]>;
  updateGentlepulseAnnouncement(id: string, announcement: Partial<InsertGentlepulseAnnouncement>): Promise<GentlepulseAnnouncement>;
  deactivateGentlepulseAnnouncement(id: string): Promise<GentlepulseAnnouncement>;
}

