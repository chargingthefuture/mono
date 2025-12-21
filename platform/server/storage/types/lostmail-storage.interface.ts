/**
 * LostMail Storage Interface
 * 
 * Defines LostMail mini-app storage operations.
 */

import type {
  LostmailIncident,
  InsertLostmailIncident,
  LostmailAuditTrail,
  InsertLostmailAuditTrail,
  LostmailAnnouncement,
  InsertLostmailAnnouncement,
} from "@shared/schema";

export interface ILostMailStorage {
  // Incident operations
  createLostmailIncident(incident: InsertLostmailIncident): Promise<LostmailIncident>;
  getLostmailIncidentById(id: string): Promise<LostmailIncident | undefined>;
  getLostmailIncidentsByEmail(email: string): Promise<LostmailIncident[]>;
  getLostmailIncidents(filters?: {
    incidentType?: string;
    status?: string;
    severity?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string; // Search by tracking number, ID, or reporter name
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: LostmailIncident[]; total: number }>;
  updateLostmailIncident(id: string, incident: Partial<InsertLostmailIncident>): Promise<LostmailIncident>;
  
  // Audit Trail operations
  createLostmailAuditTrailEntry(entry: InsertLostmailAuditTrail): Promise<LostmailAuditTrail>;
  getLostmailAuditTrailByIncident(incidentId: string): Promise<LostmailAuditTrail[]>;
  
  // Announcement operations
  createLostmailAnnouncement(announcement: InsertLostmailAnnouncement): Promise<LostmailAnnouncement>;
  getActiveLostmailAnnouncements(): Promise<LostmailAnnouncement[]>;
  getAllLostmailAnnouncements(): Promise<LostmailAnnouncement[]>;
  updateLostmailAnnouncement(id: string, announcement: Partial<InsertLostmailAnnouncement>): Promise<LostmailAnnouncement>;
  deactivateLostmailAnnouncement(id: string): Promise<LostmailAnnouncement>;
}

