/**
 * Chyme Storage Module
 * 
 * Handles all Chyme mini-app operations: announcements, rooms, participants,
 * user follows, user blocks, and messages.
 */

import {
  chymeAnnouncements,
  chymeRooms,
  chymeRoomParticipants,
  chymeUserFollows,
  chymeUserBlocks,
  chymeMessages,
  type ChymeAnnouncement,
  type InsertChymeAnnouncement,
  type ChymeRoom,
  type InsertChymeRoom,
  type ChymeRoomParticipant,
  type InsertChymeRoomParticipant,
  type ChymeUserFollow,
  type InsertChymeUserFollow,
  type ChymeUserBlock,
  type InsertChymeUserBlock,
  type ChymeMessage,
  type InsertChymeMessage,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, asc, or, gte, sql } from "drizzle-orm";
import { NotFoundError } from "../../errors";

export class ChymeStorage {
  // ========================================
  // CHYME ANNOUNCEMENT OPERATIONS
  // ========================================

  async createChymeAnnouncement(announcementData: InsertChymeAnnouncement): Promise<ChymeAnnouncement> {
    const [announcement] = await db
      .insert(chymeAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveChymeAnnouncements(): Promise<ChymeAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(chymeAnnouncements)
      .where(
        and(
          eq(chymeAnnouncements.isActive, true),
          or(
            sql`${chymeAnnouncements.expiresAt} IS NULL`,
            gte(chymeAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(chymeAnnouncements.createdAt));
  }

  async getAllChymeAnnouncements(): Promise<ChymeAnnouncement[]> {
    return await db
      .select()
      .from(chymeAnnouncements)
      .orderBy(desc(chymeAnnouncements.createdAt));
  }

  async updateChymeAnnouncement(id: string, announcementData: Partial<InsertChymeAnnouncement>): Promise<ChymeAnnouncement> {
    const [announcement] = await db
      .update(chymeAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(chymeAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateChymeAnnouncement(id: string): Promise<ChymeAnnouncement> {
    const [announcement] = await db
      .update(chymeAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chymeAnnouncements.id, id))
      .returning();
    return announcement;
  }

  // ========================================
  // CHYME ROOM OPERATIONS
  // ========================================

  async createChymeRoom(roomData: InsertChymeRoom): Promise<ChymeRoom> {
    const [room] = await db
      .insert(chymeRooms)
      .values(roomData)
      .returning();
    return room;
  }

  async getChymeRoom(id: string): Promise<ChymeRoom | undefined> {
    const [room] = await db
      .select()
      .from(chymeRooms)
      .where(eq(chymeRooms.id, id));
    return room;
  }

  async getChymeRooms(roomType?: "public" | "private"): Promise<ChymeRoom[]> {
    const conditions = [eq(chymeRooms.isActive, true)];
    if (roomType) {
      conditions.push(eq(chymeRooms.roomType, roomType));
    }
    return await db
      .select()
      .from(chymeRooms)
      .where(and(...conditions))
      .orderBy(desc(chymeRooms.createdAt));
  }

  async updateChymeRoom(id: string, roomData: Partial<InsertChymeRoom>): Promise<ChymeRoom> {
    const [room] = await db
      .update(chymeRooms)
      .set({
        ...roomData,
        updatedAt: new Date(),
      })
      .where(eq(chymeRooms.id, id))
      .returning();
    return room;
  }

  async deactivateChymeRoom(id: string): Promise<ChymeRoom> {
    const [room] = await db
      .update(chymeRooms)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(chymeRooms.id, id))
      .returning();
    return room;
  }

  async updateChymeRoomPinnedLink(id: string, pinnedLink: string | null): Promise<ChymeRoom> {
    const [room] = await db
      .update(chymeRooms)
      .set({
        pinnedLink,
        updatedAt: new Date(),
      })
      .where(eq(chymeRooms.id, id))
      .returning();
    return room;
  }

  async getChymeRoomParticipantCount(roomId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(chymeRoomParticipants)
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          sql`${chymeRoomParticipants.leftAt} IS NULL`
        )
      );
    return Number(result[0]?.count || 0);
  }

  // ========================================
  // CHYME ROOM PARTICIPANT OPERATIONS
  // ========================================

  async joinChymeRoom(participantData: InsertChymeRoomParticipant): Promise<ChymeRoomParticipant> {
    // Get room to check if user is creator
    const room = await this.getChymeRoom(participantData.roomId);
    const isCreator = room?.createdBy === participantData.userId;
    
    // Set role based on whether user is creator
    const role = isCreator ? 'creator' : (participantData.role || 'listener');
    
    // Check if participant already exists and has left
    const existing = await this.getChymeRoomParticipant(participantData.roomId, participantData.userId);
    
    if (existing && existing.leftAt) {
      // Re-join by updating leftAt to null
      const [participant] = await db
        .update(chymeRoomParticipants)
        .set({
          leftAt: null,
          role: role as any,
          isMuted: participantData.isMuted ?? false,
          isSpeaking: participantData.isSpeaking ?? false,
          hasRaisedHand: participantData.hasRaisedHand ?? false,
        })
        .where(
          and(
            eq(chymeRoomParticipants.roomId, participantData.roomId),
            eq(chymeRoomParticipants.userId, participantData.userId)
          )
        )
        .returning();
      return participant;
    } else if (existing) {
      // Already in room, just update (but preserve role if creator)
      const [participant] = await db
        .update(chymeRoomParticipants)
        .set({
          role: isCreator ? 'creator' : (participantData.role || existing.role) as any,
          isMuted: participantData.isMuted ?? false,
          isSpeaking: participantData.isSpeaking ?? false,
          hasRaisedHand: participantData.hasRaisedHand ?? existing.hasRaisedHand ?? false,
        })
        .where(
          and(
            eq(chymeRoomParticipants.roomId, participantData.roomId),
            eq(chymeRoomParticipants.userId, participantData.userId)
          )
        )
        .returning();
      return participant;
    } else {
      // New participant
      const [participant] = await db
        .insert(chymeRoomParticipants)
        .values({
          ...participantData,
          role: role as any,
        })
        .returning();
      return participant;
    }
  }

  async leaveChymeRoom(roomId: string, userId: string): Promise<void> {
    await db
      .update(chymeRoomParticipants)
      .set({
        leftAt: new Date(),
      })
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          eq(chymeRoomParticipants.userId, userId)
        )
      );
  }

  async getChymeRoomParticipants(roomId: string): Promise<ChymeRoomParticipant[]> {
    return await db
      .select()
      .from(chymeRoomParticipants)
      .where(eq(chymeRoomParticipants.roomId, roomId))
      .orderBy(desc(chymeRoomParticipants.joinedAt));
  }

  async getChymeRoomParticipant(roomId: string, userId: string): Promise<ChymeRoomParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(chymeRoomParticipants)
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          eq(chymeRoomParticipants.userId, userId)
        )
      )
      .orderBy(desc(chymeRoomParticipants.joinedAt))
      .limit(1);
    return participant;
  }

  async getActiveRoomsForUser(userId: string): Promise<string[]> {
    const participants = await db
      .select({ roomId: chymeRoomParticipants.roomId })
      .from(chymeRoomParticipants)
      .where(
        and(
          eq(chymeRoomParticipants.userId, userId),
          sql`${chymeRoomParticipants.leftAt} IS NULL`
        )
      );
    return participants.map(p => p.roomId);
  }

  async updateChymeRoomParticipant(roomId: string, userId: string, updates: Partial<InsertChymeRoomParticipant>): Promise<ChymeRoomParticipant> {
    const updateData: any = { ...updates };
    // If role is being updated, ensure it's valid
    if (updateData.role) {
      updateData.role = updateData.role as any;
    }
    const [participant] = await db
      .update(chymeRoomParticipants)
      .set(updateData)
      .where(
        and(
          eq(chymeRoomParticipants.roomId, roomId),
          eq(chymeRoomParticipants.userId, userId)
        )
      )
      .returning();
    if (!participant) {
      throw new NotFoundError("Participant");
    }
    return participant;
  }

  // ========================================
  // CHYME USER FOLLOW OPERATIONS
  // ========================================

  async followChymeUser(userId: string, followedUserId: string): Promise<ChymeUserFollow> {
    // Check if already following
    const [existing] = await db
      .select()
      .from(chymeUserFollows)
      .where(
        and(
          eq(chymeUserFollows.userId, userId),
          eq(chymeUserFollows.followedUserId, followedUserId)
        )
      );
    
    if (existing) {
      return existing;
    }

    // Insert new follow
    const [follow] = await db
      .insert(chymeUserFollows)
      .values({
        userId,
        followedUserId,
      })
      .returning();
    return follow!;
  }

  async unfollowChymeUser(userId: string, followedUserId: string): Promise<void> {
    await db
      .delete(chymeUserFollows)
      .where(
        and(
          eq(chymeUserFollows.userId, userId),
          eq(chymeUserFollows.followedUserId, followedUserId)
        )
      );
  }

  async isFollowingChymeUser(userId: string, followedUserId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(chymeUserFollows)
      .where(
        and(
          eq(chymeUserFollows.userId, userId),
          eq(chymeUserFollows.followedUserId, followedUserId)
        )
      );
    return !!follow;
  }

  async getChymeUserFollows(userId: string): Promise<ChymeUserFollow[]> {
    return await db
      .select()
      .from(chymeUserFollows)
      .where(eq(chymeUserFollows.userId, userId));
  }

  // ========================================
  // CHYME USER BLOCK OPERATIONS
  // ========================================

  async blockChymeUser(userId: string, blockedUserId: string): Promise<ChymeUserBlock> {
    // Check if already blocking
    const [existing] = await db
      .select()
      .from(chymeUserBlocks)
      .where(
        and(
          eq(chymeUserBlocks.userId, userId),
          eq(chymeUserBlocks.blockedUserId, blockedUserId)
        )
      );
    
    if (existing) {
      return existing;
    }

    // Insert new block
    const [block] = await db
      .insert(chymeUserBlocks)
      .values({
        userId,
        blockedUserId,
      })
      .returning();
    return block!;
  }

  async unblockChymeUser(userId: string, blockedUserId: string): Promise<void> {
    await db
      .delete(chymeUserBlocks)
      .where(
        and(
          eq(chymeUserBlocks.userId, userId),
          eq(chymeUserBlocks.blockedUserId, blockedUserId)
        )
      );
  }

  async isBlockingChymeUser(userId: string, blockedUserId: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(chymeUserBlocks)
      .where(
        and(
          eq(chymeUserBlocks.userId, userId),
          eq(chymeUserBlocks.blockedUserId, blockedUserId)
        )
      );
    return !!block;
  }

  async getChymeUserBlocks(userId: string): Promise<ChymeUserBlock[]> {
    return await db
      .select()
      .from(chymeUserBlocks)
      .where(eq(chymeUserBlocks.userId, userId));
  }

  // ========================================
  // CHYME MESSAGE OPERATIONS
  // ========================================

  async createChymeMessage(messageData: InsertChymeMessage): Promise<ChymeMessage> {
    const [message] = await db
      .insert(chymeMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getChymeMessages(roomId: string): Promise<ChymeMessage[]> {
    return await db
      .select()
      .from(chymeMessages)
      .where(eq(chymeMessages.roomId, roomId))
      .orderBy(asc(chymeMessages.createdAt));
  }
}

