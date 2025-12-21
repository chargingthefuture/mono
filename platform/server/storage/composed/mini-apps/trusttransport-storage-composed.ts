/**
 * TrustTransport Storage Composed
 * 
 * Handles delegation of TrustTransport storage operations.
 */

import type { ITrustTransportStorage } from '../../types/trusttransport-storage.interface';
import { TrustTransportStorage } from '../../mini-apps';

export class TrustTransportStorageComposed implements ITrustTransportStorage {
  private trustTransportStorage: TrustTransportStorage;

  constructor() {
    this.trustTransportStorage = new TrustTransportStorage();
  }

  // Profile operations
  async getTrusttransportProfile(userId: string) {
    return this.trustTransportStorage.getTrusttransportProfile(userId);
  }

  async createTrusttransportProfile(profile: any) {
    return this.trustTransportStorage.createTrusttransportProfile(profile);
  }

  async updateTrusttransportProfile(userId: string, profile: any) {
    return this.trustTransportStorage.updateTrusttransportProfile(userId, profile);
  }

  async deleteTrusttransportProfile(userId: string, reason?: string) {
    return this.trustTransportStorage.deleteTrusttransportProfile(userId, reason);
  }

  // Ride request operations
  async createTrusttransportRideRequest(request: any) {
    return this.trustTransportStorage.createTrusttransportRideRequest(request);
  }

  async getTrusttransportRideRequestById(id: string) {
    return this.trustTransportStorage.getTrusttransportRideRequestById(id);
  }

  async getTrusttransportRideRequestsByRider(riderId: string) {
    return this.trustTransportStorage.getTrusttransportRideRequestsByRider(riderId);
  }

  async getOpenTrusttransportRideRequests() {
    return this.trustTransportStorage.getOpenTrusttransportRideRequests();
  }

  async getTrusttransportRideRequestsByDriver(driverId: string) {
    return this.trustTransportStorage.getTrusttransportRideRequestsByDriver(driverId);
  }

  async claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string) {
    return this.trustTransportStorage.claimTrusttransportRideRequest(requestId, driverId, driverMessage);
  }

  async updateTrusttransportRideRequest(id: string, request: any) {
    return this.trustTransportStorage.updateTrusttransportRideRequest(id, request);
  }

  async cancelTrusttransportRideRequest(id: string, userId: string) {
    return this.trustTransportStorage.cancelTrusttransportRideRequest(id, userId);
  }

  // Announcement operations
  async createTrusttransportAnnouncement(announcement: any) {
    return this.trustTransportStorage.createTrusttransportAnnouncement(announcement);
  }

  async getActiveTrusttransportAnnouncements() {
    return this.trustTransportStorage.getActiveTrusttransportAnnouncements();
  }

  async getAllTrusttransportAnnouncements() {
    return this.trustTransportStorage.getAllTrusttransportAnnouncements();
  }

  async updateTrusttransportAnnouncement(id: string, announcement: any) {
    return this.trustTransportStorage.updateTrusttransportAnnouncement(id, announcement);
  }

  async deactivateTrusttransportAnnouncement(id: string) {
    return this.trustTransportStorage.deactivateTrusttransportAnnouncement(id);
  }
}

