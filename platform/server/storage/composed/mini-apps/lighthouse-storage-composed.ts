/**
 * Lighthouse Storage Composed
 * 
 * Handles delegation of Lighthouse storage operations.
 */

import type { ILighthouseStorage } from '../../types/lighthouse-storage.interface';
import { LighthouseStorage } from '../../mini-apps';

export class LighthouseStorageComposed implements ILighthouseStorage {
  private lighthouseStorage: LighthouseStorage;

  constructor() {
    this.lighthouseStorage = new LighthouseStorage();
  }

  // Profile operations
  async createLighthouseProfile(profile: any) {
    return this.lighthouseStorage.createLighthouseProfile(profile);
  }

  async getLighthouseProfileByUserId(userId: string) {
    return this.lighthouseStorage.getLighthouseProfileByUserId(userId);
  }

  async getLighthouseProfileById(id: string) {
    return this.lighthouseStorage.getLighthouseProfileById(id);
  }

  async updateLighthouseProfile(id: string, profile: any) {
    return this.lighthouseStorage.updateLighthouseProfile(id, profile);
  }

  async getAllLighthouseProfiles() {
    return this.lighthouseStorage.getAllLighthouseProfiles();
  }

  async getLighthouseProfilesByType(profileType: string) {
    return this.lighthouseStorage.getLighthouseProfilesByType(profileType);
  }

  // Property operations
  async createLighthouseProperty(property: any) {
    return this.lighthouseStorage.createLighthouseProperty(property);
  }

  async getLighthousePropertyById(id: string) {
    return this.lighthouseStorage.getLighthousePropertyById(id);
  }

  async getPropertiesByHost(hostId: string) {
    return this.lighthouseStorage.getPropertiesByHost(hostId);
  }

  async getAllActiveProperties() {
    return this.lighthouseStorage.getAllActiveProperties();
  }

  async getAllProperties() {
    return this.lighthouseStorage.getAllProperties();
  }

  async updateLighthouseProperty(id: string, property: any) {
    return this.lighthouseStorage.updateLighthouseProperty(id, property);
  }

  async deleteLighthouseProperty(id: string) {
    return this.lighthouseStorage.deleteLighthouseProperty(id);
  }

  // Match operations
  async createLighthouseMatch(match: any) {
    return this.lighthouseStorage.createLighthouseMatch(match);
  }

  async getLighthouseMatchById(id: string) {
    return this.lighthouseStorage.getLighthouseMatchById(id);
  }

  async getMatchesBySeeker(seekerId: string) {
    return this.lighthouseStorage.getMatchesBySeeker(seekerId);
  }

  async getMatchesByProperty(propertyId: string) {
    return this.lighthouseStorage.getMatchesByProperty(propertyId);
  }

  async getAllMatches() {
    return this.lighthouseStorage.getAllMatches();
  }

  async getMatchesByProfile(profileId: string) {
    return this.lighthouseStorage.getMatchesByProfile(profileId);
  }

  async getAllLighthouseMatches() {
    return this.lighthouseStorage.getAllLighthouseMatches();
  }

  async updateLighthouseMatch(id: string, match: any) {
    return this.lighthouseStorage.updateLighthouseMatch(id, match);
  }

  // Stats operations
  async getLighthouseStats() {
    return this.lighthouseStorage.getLighthouseStats();
  }

  // Announcement operations
  async createLighthouseAnnouncement(announcement: any) {
    return this.lighthouseStorage.createLighthouseAnnouncement(announcement);
  }

  async getActiveLighthouseAnnouncements() {
    return this.lighthouseStorage.getActiveLighthouseAnnouncements();
  }

  async getAllLighthouseAnnouncements() {
    return this.lighthouseStorage.getAllLighthouseAnnouncements();
  }

  async updateLighthouseAnnouncement(id: string, announcement: any) {
    return this.lighthouseStorage.updateLighthouseAnnouncement(id, announcement);
  }

  async deactivateLighthouseAnnouncement(id: string) {
    return this.lighthouseStorage.deactivateLighthouseAnnouncement(id);
  }

  // Block operations
  async createLighthouseBlock(block: any) {
    return this.lighthouseStorage.createLighthouseBlock(block);
  }

  async getLighthouseBlocksByUser(userId: string) {
    return this.lighthouseStorage.getLighthouseBlocksByUser(userId);
  }

  async checkLighthouseBlock(userId: string, blockedUserId: string) {
    return this.lighthouseStorage.checkLighthouseBlock(userId, blockedUserId);
  }

  async deleteLighthouseBlock(id: string) {
    return this.lighthouseStorage.deleteLighthouseBlock(id);
  }

  // Profile deletion
  async deleteLighthouseProfile(userId: string, reason?: string) {
    return this.lighthouseStorage.deleteLighthouseProfile(userId, reason);
  }
}

