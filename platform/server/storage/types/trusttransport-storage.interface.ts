/**
 * TrustTransport Storage Interface
 * 
 * Defines TrustTransport mini-app storage operations.
 */

import type {
  TrusttransportProfile,
  InsertTrusttransportProfile,
  TrusttransportRideRequest,
  InsertTrusttransportRideRequest,
  TrusttransportAnnouncement,
  InsertTrusttransportAnnouncement,
} from "@shared/schema";

export interface ITrustTransportStorage {
  // Profile operations
  getTrusttransportProfile(userId: string): Promise<TrusttransportProfile | undefined>;
  createTrusttransportProfile(profile: InsertTrusttransportProfile): Promise<TrusttransportProfile>;
  updateTrusttransportProfile(userId: string, profile: Partial<InsertTrusttransportProfile>): Promise<TrusttransportProfile>;
  deleteTrusttransportProfile(userId: string, reason?: string): Promise<void>;

  // Ride Request operations
  createTrusttransportRideRequest(request: InsertTrusttransportRideRequest & { riderId?: string }): Promise<TrusttransportRideRequest>;
  getTrusttransportRideRequestById(id: string): Promise<TrusttransportRideRequest | undefined>;
  getTrusttransportRideRequestsByRider(riderId: string): Promise<TrusttransportRideRequest[]>;
  getOpenTrusttransportRideRequests(): Promise<TrusttransportRideRequest[]>; // For drivers to see available requests
  getTrusttransportRideRequestsByDriver(driverId: string): Promise<TrusttransportRideRequest[]>; // Requests claimed by driver
  claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string): Promise<TrusttransportRideRequest>;
  updateTrusttransportRideRequest(id: string, request: Partial<InsertTrusttransportRideRequest>): Promise<TrusttransportRideRequest>;
  cancelTrusttransportRideRequest(id: string, userId: string): Promise<TrusttransportRideRequest>; // Cancel by rider or driver

  // Announcement operations
  createTrusttransportAnnouncement(announcement: InsertTrusttransportAnnouncement): Promise<TrusttransportAnnouncement>;
  getActiveTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]>;
  getAllTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]>;
  updateTrusttransportAnnouncement(id: string, announcement: Partial<InsertTrusttransportAnnouncement>): Promise<TrusttransportAnnouncement>;
  deactivateTrusttransportAnnouncement(id: string): Promise<TrusttransportAnnouncement>;
}

