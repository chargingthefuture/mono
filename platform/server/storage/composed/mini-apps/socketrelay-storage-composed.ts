/**
 * SocketRelay Storage Composed
 * 
 * Handles delegation of SocketRelay storage operations.
 */

import type { ISocketRelayStorage } from '../../types/socketrelay-storage.interface';
import { SocketRelayStorage } from '../../mini-apps';

export class SocketRelayStorageComposed implements ISocketRelayStorage {
  private socketRelayStorage: SocketRelayStorage;

  constructor() {
    this.socketRelayStorage = new SocketRelayStorage();
  }

  // Request operations
  async createSocketrelayRequest(userId: string, description: string, isPublic?: boolean) {
    return this.socketRelayStorage.createSocketrelayRequest(userId, description, isPublic);
  }

  async getActiveSocketrelayRequests() {
    return this.socketRelayStorage.getActiveSocketrelayRequests();
  }

  async getAllSocketrelayRequests() {
    return this.socketRelayStorage.getAllSocketrelayRequests();
  }

  async getSocketrelayRequestById(id: string) {
    return this.socketRelayStorage.getSocketrelayRequestById(id);
  }

  async getSocketrelayRequestsByUser(userId: string) {
    return this.socketRelayStorage.getSocketrelayRequestsByUser(userId);
  }

  async getPublicSocketrelayRequestById(id: string) {
    return this.socketRelayStorage.getPublicSocketrelayRequestById(id);
  }

  async listPublicSocketrelayRequests() {
    return this.socketRelayStorage.listPublicSocketrelayRequests();
  }

  async updateSocketrelayRequest(id: string, userId: string, description: string, isPublic?: boolean) {
    return this.socketRelayStorage.updateSocketrelayRequest(id, userId, description, isPublic);
  }

  async updateSocketrelayRequestStatus(id: string, status: string) {
    return this.socketRelayStorage.updateSocketrelayRequestStatus(id, status);
  }

  async repostSocketrelayRequest(id: string, userId: string) {
    return this.socketRelayStorage.repostSocketrelayRequest(id, userId);
  }

  async deleteSocketrelayRequest(id: string) {
    return this.socketRelayStorage.deleteSocketrelayRequest(id);
  }

  // Fulfillment operations
  async createSocketrelayFulfillment(requestId: string, fulfillerUserId: string) {
    return this.socketRelayStorage.createSocketrelayFulfillment(requestId, fulfillerUserId);
  }

  async getSocketrelayFulfillmentById(id: string) {
    return this.socketRelayStorage.getSocketrelayFulfillmentById(id);
  }

  async getSocketrelayFulfillmentsByRequest(requestId: string) {
    return this.socketRelayStorage.getSocketrelayFulfillmentsByRequest(requestId);
  }

  async getSocketrelayFulfillmentsByUser(userId: string) {
    return this.socketRelayStorage.getSocketrelayFulfillmentsByUser(userId);
  }

  async getAllSocketrelayFulfillments() {
    return this.socketRelayStorage.getAllSocketrelayFulfillments();
  }

  async closeSocketrelayFulfillment(id: string, userId: string, status: string) {
    return this.socketRelayStorage.closeSocketrelayFulfillment(id, userId, status);
  }

  // Message operations
  async createSocketrelayMessage(message: any) {
    return this.socketRelayStorage.createSocketrelayMessage(message);
  }

  async getSocketrelayMessagesByFulfillment(fulfillmentId: string) {
    return this.socketRelayStorage.getSocketrelayMessagesByFulfillment(fulfillmentId);
  }

  // Profile operations
  async getSocketrelayProfile(userId: string) {
    return this.socketRelayStorage.getSocketrelayProfile(userId);
  }

  async createSocketrelayProfile(profile: any) {
    return this.socketRelayStorage.createSocketrelayProfile(profile);
  }

  async updateSocketrelayProfile(userId: string, profile: any) {
    return this.socketRelayStorage.updateSocketrelayProfile(userId, profile);
  }

  // Announcement operations
  async createSocketrelayAnnouncement(announcement: any) {
    return this.socketRelayStorage.createSocketrelayAnnouncement(announcement);
  }

  async getActiveSocketrelayAnnouncements() {
    return this.socketRelayStorage.getActiveSocketrelayAnnouncements();
  }

  async getAllSocketrelayAnnouncements() {
    return this.socketRelayStorage.getAllSocketrelayAnnouncements();
  }

  async updateSocketrelayAnnouncement(id: string, announcement: any) {
    return this.socketRelayStorage.updateSocketrelayAnnouncement(id, announcement);
  }

  async deactivateSocketrelayAnnouncement(id: string) {
    return this.socketRelayStorage.deactivateSocketrelayAnnouncement(id);
  }

  // Profile deletion
  async deleteSocketrelayProfile(userId: string, reason?: string) {
    return this.socketRelayStorage.deleteSocketrelayProfile(userId, reason);
  }
}

