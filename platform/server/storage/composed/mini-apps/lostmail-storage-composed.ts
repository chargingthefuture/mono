/**
 * LostMail Storage Composed
 * 
 * Handles delegation of LostMail storage operations.
 */

import type { ILostMailStorage } from '../../types/lostmail-storage.interface';
import { LostMailStorage } from '../../mini-apps';

export class LostMailStorageComposed implements ILostMailStorage {
  private lostMailStorage: LostMailStorage;

  constructor() {
    this.lostMailStorage = new LostMailStorage();
  }

  // Incident operations
  async createLostmailIncident(incident: any) {
    return this.lostMailStorage.createLostmailIncident(incident);
  }

  async getLostmailIncidentById(id: string) {
    return this.lostMailStorage.getLostmailIncidentById(id);
  }

  async getLostmailIncidentsByEmail(email: string) {
    return this.lostMailStorage.getLostmailIncidentsByEmail(email);
  }

  async getLostmailIncidents(filters?: any) {
    return this.lostMailStorage.getLostmailIncidents(filters);
  }

  async updateLostmailIncident(id: string, incident: any) {
    return this.lostMailStorage.updateLostmailIncident(id, incident);
  }

  // Audit trail operations
  async createLostmailAuditTrailEntry(entry: any) {
    return this.lostMailStorage.createLostmailAuditTrailEntry(entry);
  }

  async getLostmailAuditTrailByIncident(incidentId: string) {
    return this.lostMailStorage.getLostmailAuditTrailByIncident(incidentId);
  }

  // Announcement operations
  async createLostmailAnnouncement(announcement: any) {
    return this.lostMailStorage.createLostmailAnnouncement(announcement);
  }

  async getActiveLostmailAnnouncements() {
    return this.lostMailStorage.getActiveLostmailAnnouncements();
  }

  async getAllLostmailAnnouncements() {
    return this.lostMailStorage.getAllLostmailAnnouncements();
  }

  async updateLostmailAnnouncement(id: string, announcement: any) {
    return this.lostMailStorage.updateLostmailAnnouncement(id, announcement);
  }

  async deactivateLostmailAnnouncement(id: string) {
    return this.lostMailStorage.deactivateLostmailAnnouncement(id);
  }
}

