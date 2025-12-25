/**
 * Directory Storage Composed
 * 
 * Handles delegation of Directory storage operations.
 */

import type { IDirectoryStorage } from '../../types/directory-storage.interface';
import { DirectoryStorage } from '../../mini-apps';

export class DirectoryStorageComposed implements IDirectoryStorage {
  private directoryStorage: DirectoryStorage;

  constructor() {
    this.directoryStorage = new DirectoryStorage();
  }

  // Profile operations
  async getDirectoryProfileById(id: string) {
    return this.directoryStorage.getDirectoryProfileById(id);
  }

  async getDirectoryProfileByUserId(userId: string) {
    return this.directoryStorage.getDirectoryProfileByUserId(userId);
  }

  async listAllDirectoryProfiles() {
    return this.directoryStorage.listAllDirectoryProfiles();
  }

  async listPublicDirectoryProfiles() {
    return this.directoryStorage.listPublicDirectoryProfiles();
  }

  async listPublicDirectoryProfilesWithUsers() {
    return this.directoryStorage.listPublicDirectoryProfilesWithUsers();
  }

  async createDirectoryProfile(profile: any) {
    return this.directoryStorage.createDirectoryProfile(profile);
  }

  async updateDirectoryProfile(id: string, profile: any) {
    return this.directoryStorage.updateDirectoryProfile(id, profile);
  }

  async deleteDirectoryProfile(id: string) {
    return this.directoryStorage.deleteDirectoryProfile(id);
  }

  // Announcement operations
  async createDirectoryAnnouncement(announcement: any) {
    return this.directoryStorage.createDirectoryAnnouncement(announcement);
  }

  async getActiveDirectoryAnnouncements() {
    return this.directoryStorage.getActiveDirectoryAnnouncements();
  }

  async getAllDirectoryAnnouncements() {
    return this.directoryStorage.getAllDirectoryAnnouncements();
  }

  async updateDirectoryAnnouncement(id: string, announcement: any) {
    return this.directoryStorage.updateDirectoryAnnouncement(id, announcement);
  }

  async deactivateDirectoryAnnouncement(id: string) {
    return this.directoryStorage.deactivateDirectoryAnnouncement(id);
  }

  // Skill operations
  async getAllDirectorySkills() {
    return this.directoryStorage.getAllDirectorySkills();
  }

  async createDirectorySkill(skill: any) {
    return this.directoryStorage.createDirectorySkill(skill);
  }

  async deleteDirectorySkill(id: string) {
    return this.directoryStorage.deleteDirectorySkill(id);
  }

  // Profile deletion
  async deleteDirectoryProfileWithCascade(userId: string, reason?: string) {
    return this.directoryStorage.deleteDirectoryProfileWithCascade(userId, reason);
  }
}

