/**
 * MechanicMatch Storage Composed
 * 
 * Handles delegation of MechanicMatch storage operations.
 */

import type { IMechanicMatchStorage } from '../../types/mechanicmatch-storage.interface';
import { MechanicMatchStorage } from '../../mini-apps';

export class MechanicMatchStorageComposed implements IMechanicMatchStorage {
  private mechanicMatchStorage: MechanicMatchStorage;

  constructor() {
    this.mechanicMatchStorage = new MechanicMatchStorage();
  }

  // Profile operations
  async getMechanicmatchProfile(userId: string) {
    return this.mechanicMatchStorage.getMechanicmatchProfile(userId);
  }

  async getMechanicmatchProfileById(profileId: string) {
    return this.mechanicMatchStorage.getMechanicmatchProfileById(profileId);
  }

  async listMechanicmatchProfiles(filters?: any) {
    return this.mechanicMatchStorage.listMechanicmatchProfiles(filters);
  }

  async listPublicMechanicmatchProfiles() {
    return this.mechanicMatchStorage.listPublicMechanicmatchProfiles();
  }

  async createMechanicmatchProfile(profile: any) {
    return this.mechanicMatchStorage.createMechanicmatchProfile(profile);
  }

  async updateMechanicmatchProfile(userId: string, profile: any) {
    return this.mechanicMatchStorage.updateMechanicmatchProfile(userId, profile);
  }

  async updateMechanicmatchProfileById(profileId: string, profile: any) {
    return this.mechanicMatchStorage.updateMechanicmatchProfileById(profileId, profile);
  }

  async deleteMechanicmatchProfile(userId: string, reason?: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchProfile(userId, reason);
  }

  async deleteMechanicmatchProfileById(profileId: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchProfileById(profileId);
  }

  // Vehicle operations
  async getMechanicmatchVehiclesByOwner(ownerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchVehiclesByOwner(ownerId);
  }

  async getMechanicmatchVehicleById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchVehicleById(id);
  }

  async createMechanicmatchVehicle(vehicle: any) {
    return this.mechanicMatchStorage.createMechanicmatchVehicle(vehicle);
  }

  async updateMechanicmatchVehicle(id: string, vehicle: any) {
    return this.mechanicMatchStorage.updateMechanicmatchVehicle(id, vehicle);
  }

  async deleteMechanicmatchVehicle(id: string, ownerId: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchVehicle(id, ownerId);
  }

  // Service request operations
  async createMechanicmatchServiceRequest(request: any) {
    return this.mechanicMatchStorage.createMechanicmatchServiceRequest(request);
  }

  async getMechanicmatchServiceRequestById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchServiceRequestById(id);
  }

  async getMechanicmatchServiceRequestsByOwner(ownerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchServiceRequestsByOwner(ownerId);
  }

  async getMechanicmatchServiceRequestsByOwnerPaginated(ownerId: string, limit: number, offset: number) {
    return this.mechanicMatchStorage.getMechanicmatchServiceRequestsByOwnerPaginated(ownerId, limit, offset);
  }

  async getOpenMechanicmatchServiceRequests() {
    return this.mechanicMatchStorage.getOpenMechanicmatchServiceRequests();
  }

  async updateMechanicmatchServiceRequest(id: string, request: any) {
    return this.mechanicMatchStorage.updateMechanicmatchServiceRequest(id, request);
  }

  // Job operations
  async createMechanicmatchJob(job: any) {
    return this.mechanicMatchStorage.createMechanicmatchJob(job);
  }

  async getMechanicmatchJobById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchJobById(id);
  }

  async getMechanicmatchJobsByOwner(ownerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchJobsByOwner(ownerId);
  }

  async getMechanicmatchJobsByMechanic(mechanicId: string) {
    return this.mechanicMatchStorage.getMechanicmatchJobsByMechanic(mechanicId);
  }

  async updateMechanicmatchJob(id: string, job: any) {
    return this.mechanicMatchStorage.updateMechanicmatchJob(id, job);
  }

  async acceptMechanicmatchJob(jobId: string, mechanicId: string) {
    return this.mechanicMatchStorage.acceptMechanicmatchJob(jobId, mechanicId);
  }

  // Availability operations
  async getMechanicmatchAvailabilityByMechanic(mechanicId: string) {
    return this.mechanicMatchStorage.getMechanicmatchAvailabilityByMechanic(mechanicId);
  }

  async createMechanicmatchAvailability(availability: any) {
    return this.mechanicMatchStorage.createMechanicmatchAvailability(availability);
  }

  async updateMechanicmatchAvailability(id: string, availability: any) {
    return this.mechanicMatchStorage.updateMechanicmatchAvailability(id, availability);
  }

  async deleteMechanicmatchAvailability(id: string, mechanicId: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchAvailability(id, mechanicId);
  }

  // Review operations
  async createMechanicmatchReview(review: any) {
    return this.mechanicMatchStorage.createMechanicmatchReview(review);
  }

  async getMechanicmatchReviewById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewById(id);
  }

  async getMechanicmatchReviewsByReviewee(revieweeId: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewsByReviewee(revieweeId);
  }

  async getMechanicmatchReviewsByReviewer(reviewerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewsByReviewer(reviewerId);
  }

  async getMechanicmatchReviewsByJob(jobId: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewsByJob(jobId);
  }

  // Message operations
  async createMechanicmatchMessage(message: any) {
    return this.mechanicMatchStorage.createMechanicmatchMessage(message);
  }

  async getMechanicmatchMessagesByJob(jobId: string) {
    return this.mechanicMatchStorage.getMechanicmatchMessagesByJob(jobId);
  }

  async getMechanicmatchMessagesBetweenUsers(userId1: string, userId2: string) {
    return this.mechanicMatchStorage.getMechanicmatchMessagesBetweenUsers(userId1, userId2);
  }

  async markMechanicmatchMessageAsRead(messageId: string, userId: string) {
    return this.mechanicMatchStorage.markMechanicmatchMessageAsRead(messageId, userId);
  }

  async getUnreadMechanicmatchMessages(userId: string) {
    return this.mechanicMatchStorage.getUnreadMechanicmatchMessages(userId);
  }

  // Search operations
  async searchMechanicmatchMechanics(filters: any) {
    return this.mechanicMatchStorage.searchMechanicmatchMechanics(filters);
  }

  // Announcement operations
  async createMechanicmatchAnnouncement(announcement: any) {
    return this.mechanicMatchStorage.createMechanicmatchAnnouncement(announcement);
  }

  async getActiveMechanicmatchAnnouncements() {
    return this.mechanicMatchStorage.getActiveMechanicmatchAnnouncements();
  }

  async getAllMechanicmatchAnnouncements() {
    return this.mechanicMatchStorage.getAllMechanicmatchAnnouncements();
  }

  async updateMechanicmatchAnnouncement(id: string, announcement: any) {
    return this.mechanicMatchStorage.updateMechanicmatchAnnouncement(id, announcement);
  }

  async deactivateMechanicmatchAnnouncement(id: string) {
    return this.mechanicMatchStorage.deactivateMechanicmatchAnnouncement(id);
  }
}

