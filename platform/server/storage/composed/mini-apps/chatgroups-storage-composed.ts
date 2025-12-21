/**
 * ChatGroups Storage Composed
 * 
 * Handles delegation of ChatGroups storage operations.
 */

import type { IChatGroupsStorage } from '../../types/chatgroups-storage.interface';
import { ChatGroupsStorage } from '../../mini-apps';

export class ChatGroupsStorageComposed implements IChatGroupsStorage {
  private chatGroupsStorage: ChatGroupsStorage;

  constructor() {
    this.chatGroupsStorage = new ChatGroupsStorage();
  }

  // Group operations
  async getAllChatGroups() {
    return this.chatGroupsStorage.getAllChatGroups();
  }

  async getActiveChatGroups() {
    return this.chatGroupsStorage.getActiveChatGroups();
  }

  async getChatGroupById(id: string) {
    return this.chatGroupsStorage.getChatGroupById(id);
  }

  async createChatGroup(group: any) {
    return this.chatGroupsStorage.createChatGroup(group);
  }

  async updateChatGroup(id: string, group: any) {
    return this.chatGroupsStorage.updateChatGroup(id, group);
  }

  async deleteChatGroup(id: string) {
    return this.chatGroupsStorage.deleteChatGroup(id);
  }

  // Announcement operations
  async createChatgroupsAnnouncement(announcement: any) {
    return this.chatGroupsStorage.createChatgroupsAnnouncement(announcement);
  }

  async getActiveChatgroupsAnnouncements() {
    return this.chatGroupsStorage.getActiveChatgroupsAnnouncements();
  }

  async getAllChatgroupsAnnouncements() {
    return this.chatGroupsStorage.getAllChatgroupsAnnouncements();
  }

  async updateChatgroupsAnnouncement(id: string, announcement: any) {
    return this.chatGroupsStorage.updateChatgroupsAnnouncement(id, announcement);
  }

  async deactivateChatgroupsAnnouncement(id: string) {
    return this.chatGroupsStorage.deactivateChatgroupsAnnouncement(id);
  }
}

