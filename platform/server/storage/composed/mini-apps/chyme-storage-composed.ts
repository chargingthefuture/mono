/**
 * Chyme Storage Composed
 * 
 * Handles delegation of Chyme storage operations.
 */

import type { IChymeStorage } from '../../types/chyme-storage.interface';
import { ChymeStorage } from '../../mini-apps';

export class ChymeStorageComposed implements IChymeStorage {
  private chymeStorage: ChymeStorage;

  constructor() {
    this.chymeStorage = new ChymeStorage();
  }

  // Announcement operations
  async createChymeAnnouncement(announcement: any) {
    return this.chymeStorage.createChymeAnnouncement(announcement);
  }

  async getActiveChymeAnnouncements() {
    return this.chymeStorage.getActiveChymeAnnouncements();
  }

  async getAllChymeAnnouncements() {
    return this.chymeStorage.getAllChymeAnnouncements();
  }

  async updateChymeAnnouncement(id: string, announcement: any) {
    return this.chymeStorage.updateChymeAnnouncement(id, announcement);
  }

  async deactivateChymeAnnouncement(id: string) {
    return this.chymeStorage.deactivateChymeAnnouncement(id);
  }

  // Room operations
  async createChymeRoom(room: any) {
    return this.chymeStorage.createChymeRoom(room);
  }

  async getChymeRoom(id: string) {
    return this.chymeStorage.getChymeRoom(id);
  }

  async getChymeRooms(roomType?: "public" | "private") {
    return this.chymeStorage.getChymeRooms(roomType);
  }

  async updateChymeRoom(id: string, room: any) {
    return this.chymeStorage.updateChymeRoom(id, room);
  }

  async deactivateChymeRoom(id: string) {
    return this.chymeStorage.deactivateChymeRoom(id);
  }

  async updateChymeRoomPinnedLink(id: string, pinnedLink: string | null) {
    return this.chymeStorage.updateChymeRoomPinnedLink(id, pinnedLink);
  }

  async getChymeRoomParticipantCount(roomId: string) {
    return this.chymeStorage.getChymeRoomParticipantCount(roomId);
  }

  // Participant operations
  async joinChymeRoom(participant: any) {
    return this.chymeStorage.joinChymeRoom(participant);
  }

  async leaveChymeRoom(roomId: string, userId: string) {
    return this.chymeStorage.leaveChymeRoom(roomId, userId);
  }

  async getChymeRoomParticipants(roomId: string) {
    return this.chymeStorage.getChymeRoomParticipants(roomId);
  }

  async getChymeRoomParticipant(roomId: string, userId: string) {
    return this.chymeStorage.getChymeRoomParticipant(roomId, userId);
  }

  async updateChymeRoomParticipant(roomId: string, userId: string, updates: any) {
    return this.chymeStorage.updateChymeRoomParticipant(roomId, userId, updates);
  }

  async getActiveRoomsForUser(userId: string) {
    return this.chymeStorage.getActiveRoomsForUser(userId);
  }

  // Follow operations
  async followChymeUser(userId: string, followedUserId: string) {
    return this.chymeStorage.followChymeUser(userId, followedUserId);
  }

  async unfollowChymeUser(userId: string, followedUserId: string) {
    return this.chymeStorage.unfollowChymeUser(userId, followedUserId);
  }

  async isFollowingChymeUser(userId: string, followedUserId: string) {
    return this.chymeStorage.isFollowingChymeUser(userId, followedUserId);
  }

  async getChymeUserFollows(userId: string) {
    return this.chymeStorage.getChymeUserFollows(userId);
  }

  // Block operations
  async blockChymeUser(userId: string, blockedUserId: string) {
    return this.chymeStorage.blockChymeUser(userId, blockedUserId);
  }

  async unblockChymeUser(userId: string, blockedUserId: string) {
    return this.chymeStorage.unblockChymeUser(userId, blockedUserId);
  }

  async isBlockingChymeUser(userId: string, blockedUserId: string) {
    return this.chymeStorage.isBlockingChymeUser(userId, blockedUserId);
  }

  async getChymeUserBlocks(userId: string) {
    return this.chymeStorage.getChymeUserBlocks(userId);
  }

  // Message operations
  async createChymeMessage(message: any) {
    return this.chymeStorage.createChymeMessage(message);
  }

  async getChymeMessages(roomId: string) {
    return this.chymeStorage.getChymeMessages(roomId);
  }
}

