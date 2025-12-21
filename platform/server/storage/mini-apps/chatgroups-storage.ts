/**
 * ChatGroups Storage Module
 * 
 * Handles all ChatGroups mini-app operations: groups and announcements.
 */

import {
  chatGroups,
  chatgroupsAnnouncements,
  type ChatGroup,
  type InsertChatGroup,
  type ChatgroupsAnnouncement,
  type InsertChatgroupsAnnouncement,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, asc, or, gte, sql } from "drizzle-orm";

export class ChatGroupsStorage {
  // ========================================
  // CHAT GROUPS OPERATIONS
  // ========================================

  async getAllChatGroups(): Promise<ChatGroup[]> {
    return await db
      .select()
      .from(chatGroups)
      .orderBy(asc(chatGroups.displayOrder), desc(chatGroups.createdAt));
  }

  async getActiveChatGroups(): Promise<ChatGroup[]> {
    return await db
      .select()
      .from(chatGroups)
      .where(eq(chatGroups.isActive, true))
      .orderBy(asc(chatGroups.displayOrder), desc(chatGroups.createdAt));
  }

  async getChatGroupById(id: string): Promise<ChatGroup | undefined> {
    const [group] = await db
      .select()
      .from(chatGroups)
      .where(eq(chatGroups.id, id));
    return group;
  }

  async createChatGroup(groupData: InsertChatGroup): Promise<ChatGroup> {
    const [group] = await db
      .insert(chatGroups)
      .values(groupData)
      .returning();
    return group;
  }

  async updateChatGroup(id: string, groupData: Partial<InsertChatGroup>): Promise<ChatGroup> {
    const [group] = await db
      .update(chatGroups)
      .set({
        ...groupData,
        updatedAt: new Date(),
      })
      .where(eq(chatGroups.id, id))
      .returning();
    return group;
  }

  async deleteChatGroup(id: string): Promise<void> {
    await db.delete(chatGroups).where(eq(chatGroups.id, id));
  }

  // ========================================
  // CHATGROUPS ANNOUNCEMENT OPERATIONS
  // ========================================

  async createChatgroupsAnnouncement(announcementData: InsertChatgroupsAnnouncement): Promise<ChatgroupsAnnouncement> {
    const [announcement] = await db
      .insert(chatgroupsAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(chatgroupsAnnouncements)
      .where(
        and(
          eq(chatgroupsAnnouncements.isActive, true),
          or(
            sql`${chatgroupsAnnouncements.expiresAt} IS NULL`,
            gte(chatgroupsAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(chatgroupsAnnouncements.createdAt));
  }
  
  async getAllChatgroupsAnnouncements(): Promise<ChatgroupsAnnouncement[]> {
    return await db
      .select()
      .from(chatgroupsAnnouncements)
      .orderBy(desc(chatgroupsAnnouncements.createdAt));
  }
  
  async updateChatgroupsAnnouncement(id: string, announcementData: Partial<InsertChatgroupsAnnouncement>): Promise<ChatgroupsAnnouncement> {
    const [announcement] = await db
      .update(chatgroupsAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(chatgroupsAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateChatgroupsAnnouncement(id: string): Promise<ChatgroupsAnnouncement> {
    const [announcement] = await db
      .update(chatgroupsAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chatgroupsAnnouncements.id, id))
      .returning();
    return announcement;
  }
}

