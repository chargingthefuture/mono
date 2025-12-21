/**
 * ChatGroups Storage Interface
 * 
 * Defines ChatGroups mini-app storage operations.
 */

import type {
  ChatGroup,
  InsertChatGroup,
  ChatgroupsAnnouncement,
  InsertChatgroupsAnnouncement,
} from "@shared/schema";

export interface IChatGroupsStorage {
  // Chat Group operations
  getAllChatGroups(): Promise<ChatGroup[]>;
  getActiveChatGroups(): Promise<ChatGroup[]>;
  getChatGroupById(id: string): Promise<ChatGroup | undefined>;
  createChatGroup(group: InsertChatGroup): Promise<ChatGroup>;
  updateChatGroup(id: string, group: Partial<InsertChatGroup>): Promise<ChatGroup>;
  deleteChatGroup(id: string): Promise<void>;

  // Announcement operations
  createChatgroupsAnnouncement(announcement: InsertChatgroupsAnnouncement): Promise<ChatgroupsAnnouncement>;
  getActiveChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]>;
  getAllChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]>;
  updateChatgroupsAnnouncement(id: string, announcement: Partial<InsertChatgroupsAnnouncement>): Promise<ChatgroupsAnnouncement>;
  deactivateChatgroupsAnnouncement(id: string): Promise<ChatgroupsAnnouncement>;
}

