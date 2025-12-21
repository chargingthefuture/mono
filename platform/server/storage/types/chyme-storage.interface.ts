/**
 * Chyme Storage Interface
 * 
 * Defines Chyme mini-app storage operations.
 */

import type {
  ChymeAnnouncement,
  InsertChymeAnnouncement,
  ChymeRoom,
  InsertChymeRoom,
  ChymeRoomParticipant,
  InsertChymeRoomParticipant,
  ChymeMessage,
  InsertChymeMessage,
  ChymeUserFollow,
  InsertChymeUserFollow,
  ChymeUserBlock,
  InsertChymeUserBlock,
} from "@shared/schema";

export interface IChymeStorage {
  // Announcement operations
  createChymeAnnouncement(announcement: InsertChymeAnnouncement): Promise<ChymeAnnouncement>;
  getActiveChymeAnnouncements(): Promise<ChymeAnnouncement[]>;
  getAllChymeAnnouncements(): Promise<ChymeAnnouncement[]>;
  updateChymeAnnouncement(id: string, announcement: Partial<InsertChymeAnnouncement>): Promise<ChymeAnnouncement>;
  deactivateChymeAnnouncement(id: string): Promise<ChymeAnnouncement>;

  // Room operations
  createChymeRoom(room: InsertChymeRoom): Promise<ChymeRoom>;
  getChymeRoom(id: string): Promise<ChymeRoom | undefined>;
  getChymeRooms(roomType?: "public" | "private"): Promise<ChymeRoom[]>;
  updateChymeRoom(id: string, room: Partial<InsertChymeRoom>): Promise<ChymeRoom>;
  deactivateChymeRoom(id: string): Promise<ChymeRoom>;
  updateChymeRoomPinnedLink(id: string, pinnedLink: string | null): Promise<ChymeRoom>;
  getChymeRoomParticipantCount(roomId: string): Promise<number>;

  // Room Participant operations
  joinChymeRoom(participant: InsertChymeRoomParticipant): Promise<ChymeRoomParticipant>;
  leaveChymeRoom(roomId: string, userId: string): Promise<void>;
  getChymeRoomParticipants(roomId: string): Promise<ChymeRoomParticipant[]>;
  getChymeRoomParticipant(roomId: string, userId: string): Promise<ChymeRoomParticipant | undefined>;
  updateChymeRoomParticipant(roomId: string, userId: string, updates: Partial<InsertChymeRoomParticipant>): Promise<ChymeRoomParticipant>;
  getActiveRoomsForUser(userId: string): Promise<string[]>; // Returns room IDs where user is an active participant

  // User Follow operations
  followChymeUser(userId: string, followedUserId: string): Promise<ChymeUserFollow>;
  unfollowChymeUser(userId: string, followedUserId: string): Promise<void>;
  isFollowingChymeUser(userId: string, followedUserId: string): Promise<boolean>;
  getChymeUserFollows(userId: string): Promise<ChymeUserFollow[]>;

  // User Block operations
  blockChymeUser(userId: string, blockedUserId: string): Promise<ChymeUserBlock>;
  unblockChymeUser(userId: string, blockedUserId: string): Promise<void>;
  isBlockingChymeUser(userId: string, blockedUserId: string): Promise<boolean>;
  getChymeUserBlocks(userId: string): Promise<ChymeUserBlock[]>;

  // Message operations
  createChymeMessage(message: InsertChymeMessage): Promise<ChymeMessage>;
  getChymeMessages(roomId: string): Promise<ChymeMessage[]>;
}

