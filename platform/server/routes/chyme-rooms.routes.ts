/**
 * ChymeRooms routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError } from "../errors";
import { logAdminAction } from "./shared";
import { z } from "zod";
import {
  insertChymeRoomSchema,
  insertChymeMessageSchema,
  type ChymeRoom,
  type ChymeRoomParticipant,
  type ChymeAnnouncement,
  type User,
} from "@shared/schema";

// Map to track scheduled room closures (roomId -> timeout)
const scheduledRoomClosures = new Map<string, NodeJS.Timeout>();

export function registerChymeRoomsRoutes(app: Express) {
  // CHYME ROOMS ROUTES (Database-backed)

  // GET /api/chyme/rooms?roomType=public|private
  app.get('/api/chyme/rooms', isAuthenticated, asyncHandler(async (req: any, res) => {
    const roomType = (req.query.roomType as string | undefined) || undefined;
    const validRoomType = roomType === "public" || roomType === "private" ? roomType : undefined;

    const rooms = await withDatabaseErrorHandling(
      () => storage.getChymeRooms(validRoomType),
      'getChymeRooms'
    ) as ChymeRoom[];

    // Add currentParticipants count to each room
    const roomsWithCounts = await Promise.all(
      (rooms as ChymeRoom[]).map(async (room) => {
        const count = await withDatabaseErrorHandling(
          () => storage.getChymeRoomParticipantCount(room.id),
          'getChymeRoomParticipantCount'
        );
        return {
          ...room,
          currentParticipants: count,
        };
      })
    );

    res.json(roomsWithCounts);
  }));

  // GET /api/chyme/rooms/:id
  app.get('/api/chyme/rooms/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(req.params.id),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    const currentParticipants = await withDatabaseErrorHandling(
      () => storage.getChymeRoomParticipantCount(room.id),
      'getChymeRoomParticipantCount'
    );

    res.json({
      ...room,
      currentParticipants,
    });
  }));

  // PUT /api/chyme/rooms/:roomId/pinned-link
  app.put('/api/chyme/rooms/:roomId/pinned-link', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const roomId = req.params.roomId;
    const { pinnedLink } = req.body as { pinnedLink?: string | null };

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Only the room creator or an admin can change the pinned link
    const isCreator = room.createdBy === currentUserId;
    const currentUser = await withDatabaseErrorHandling(
      () => storage.getUser(currentUserId),
      'getUser'
    ) as User | undefined;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Only room creator or admin can update pinned link" });
    }

    const updatedRoom = await withDatabaseErrorHandling(
      () => storage.updateChymeRoomPinnedLink(roomId, pinnedLink ?? null),
      'updateChymeRoomPinnedLink'
    );

    res.json(updatedRoom);
  }));

  // POST /api/chyme/admin/rooms (admin-only)
  app.post('/api/chyme/admin/rooms', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChymeRoomSchema, req.body, 'Invalid room data');

    const room = await withDatabaseErrorHandling(
      () => storage.createChymeRoom({
        ...validatedData,
        createdBy: userId,
      }),
      'createChymeRoom'
    ) as ChymeRoom;

    res.status(201).json({
      ...room,
      currentParticipants: 0,
    });
  }));

  // POST /api/chyme/rooms (user-created rooms)
  app.post('/api/chyme/rooms', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChymeRoomSchema, req.body, 'Invalid room data');

    const room = await withDatabaseErrorHandling(
      () => storage.createChymeRoom({
        ...validatedData,
        createdBy: userId,
      }),
      'createChymeRoom'
    ) as ChymeRoom;

    res.status(201).json({
      ...room,
      currentParticipants: 0,
    });
  }));

  // DELETE /api/chyme/rooms/:roomId (end/deactivate room)
  app.delete('/api/chyme/rooms/:roomId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const roomId = req.params.roomId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if current user is the room creator or admin
    const isCreator = room.createdBy === currentUserId;
    const currentUser = await withDatabaseErrorHandling(
      () => storage.getUser(currentUserId),
      'getUser'
    ) as User | undefined;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Only room creator or admin can end the room" });
    }

    const deactivatedRoom = await withDatabaseErrorHandling(
      () => storage.deactivateChymeRoom(roomId),
      'deactivateChymeRoom'
    );

    res.json({ message: "Room ended", room: deactivatedRoom });
  }));

  // POST /api/chyme/rooms/:roomId/join
  app.post('/api/chyme/rooms/:roomId/join', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check max participants if set
    if (room.maxParticipants !== null) {
      const currentCount = await withDatabaseErrorHandling(
        () => storage.getChymeRoomParticipantCount(roomId),
        'getChymeRoomParticipantCount'
      ) as number;
      if (currentCount >= room.maxParticipants) {
        return res.status(403).json({ message: "Room is full" });
      }
    }

    // Ensure user can only be in one room at a time
    // Leave all other rooms before joining this one
    const activeRooms = await withDatabaseErrorHandling(
      () => storage.getActiveRoomsForUser(userId),
      'getActiveRoomsForUser'
    ) as string[];

    // Leave all other rooms (excluding the one we're about to join)
    for (const otherRoomId of activeRooms) {
      if (otherRoomId !== roomId) {
        await withDatabaseErrorHandling(
          () => storage.leaveChymeRoom(otherRoomId, userId),
          'leaveChymeRoom'
        );
      }
    }

    await withDatabaseErrorHandling(
      () => storage.joinChymeRoom({
        roomId,
        userId,
        role: 'listener', // Will be set to 'creator' if user is room creator
        isMuted: false,
        isSpeaking: false,
        hasRaisedHand: false,
      }),
      'joinChymeRoom'
    );

    // If the creator is rejoining their room, cancel any scheduled closure
    if (room.createdBy === userId) {
      const existingTimeout = scheduledRoomClosures.get(roomId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        scheduledRoomClosures.delete(roomId);
      }
    }

    res.json({ message: "Joined room" });
  }));

  // POST /api/chyme/rooms/:roomId/leave
  app.post('/api/chyme/rooms/:roomId/leave', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;

    // Get room to check if user is the creator
    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isCreator = room.createdBy === userId;

    // Leave the room
    await withDatabaseErrorHandling(
      () => storage.leaveChymeRoom(roomId, userId),
      'leaveChymeRoom'
    );

    // If the creator left, schedule room closure with a buffer (30 seconds)
    // This buffer helps handle connection issues - if creator rejoins within 30s, closure is cancelled
    if (isCreator && room.isActive) {
      // Cancel any existing scheduled closure for this room
      const existingTimeout = scheduledRoomClosures.get(roomId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Schedule room closure after 30 seconds
      const timeout = setTimeout(async () => {
        try {
          // Double-check that creator is still not in the room before closing
          const currentRoom = await storage.getChymeRoom(roomId);
          if (!currentRoom || !currentRoom.isActive) {
            // Room already closed or doesn't exist
            scheduledRoomClosures.delete(roomId);
            return;
          }

          // Check if creator has rejoined
          const creatorParticipant = await storage.getChymeRoomParticipant(roomId, userId);
          if (creatorParticipant && !creatorParticipant.leftAt) {
            // Creator has rejoined, don't close the room
            scheduledRoomClosures.delete(roomId);
            return;
          }

          // Creator is still gone, close the room
          await storage.deactivateChymeRoom(roomId);
          scheduledRoomClosures.delete(roomId);
        } catch (error) {
          // Log error but don't throw - this is a background operation
          console.error(`Error closing room ${roomId} after creator left:`, error);
          scheduledRoomClosures.delete(roomId);
        }
      }, 30000); // 30 second buffer

      scheduledRoomClosures.set(roomId, timeout);
    }

    res.json({ message: "Left room" });
  }));

  // GET /api/chyme/rooms/:roomId/participants
  app.get('/api/chyme/rooms/:roomId/participants', isAuthenticated, asyncHandler(async (req: any, res) => {
    const roomId = req.params.roomId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    const participants = await withDatabaseErrorHandling(
      () => storage.getChymeRoomParticipants(roomId),
      'getChymeRoomParticipants'
    ) as ChymeRoomParticipant[];

    // Enrich participants with user data
    const participantsWithUsers = await Promise.all(
      (participants as ChymeRoomParticipant[]).map(async (participant) => {
        const user = await withDatabaseErrorHandling(
          () => storage.getUser(participant.userId),
          'getUser'
        ) as User | undefined;
        return {
          ...participant,
          user: user ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            displayName: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.firstName || user.lastName || null,
            username: null,
          } : null,
        };
      })
    );

    res.json(participantsWithUsers);
  }));

  // GET /api/chyme/rooms/:roomId/messages
  app.get('/api/chyme/rooms/:roomId/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const roomId = req.params.roomId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await withDatabaseErrorHandling(
      () => storage.getChymeMessages(roomId),
      'getChymeMessages'
    );

    res.json(messages);
  }));

  // POST /api/chyme/rooms/:roomId/messages
  app.post('/api/chyme/rooms/:roomId/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;
    const validatedData = validateWithZod(insertChymeMessageSchema, {
      ...req.body,
      roomId,
      userId,
    }, 'Invalid message data');

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    const message = await withDatabaseErrorHandling(
      () => storage.createChymeMessage(validatedData),
      'createChymeMessage'
    );

    res.status(201).json(message);
  }));

  // POST /api/chyme/rooms/:roomId/raise-hand
  app.post('/api/chyme/rooms/:roomId/raise-hand', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user is already a participant
    const participant = await withDatabaseErrorHandling(
      () => storage.getChymeRoomParticipant(roomId, userId),
      'getChymeRoomParticipant'
    );

    if (!participant) {
      return res.status(403).json({ message: "You must join the room first" });
    }

    // Update hasRaisedHand flag
    await withDatabaseErrorHandling(
      () => storage.updateChymeRoomParticipant(roomId, userId, { hasRaisedHand: true }),
      'updateChymeRoomParticipant'
    );

    res.json({ message: "Hand raised" });
  }));

  // PUT /api/chyme/rooms/:roomId/participants/:userId
  app.put('/api/chyme/rooms/:roomId/participants/:userId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const roomId = req.params.roomId;
    const targetUserId = req.params.userId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if current user is the room creator or admin
    const isCreator = room.createdBy === currentUserId;
    const currentUser = await withDatabaseErrorHandling(
      () => storage.getUser(currentUserId),
      'getUser'
    ) as User | undefined;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Only room creator or admin can update participants" });
    }

    // Validate update data
    const updates: any = {};
    if (req.body.isMuted !== undefined) {
      updates.isMuted = req.body.isMuted;
    }
    if (req.body.role !== undefined) {
      // Validate role
      if (['creator', 'speaker', 'listener'].includes(req.body.role)) {
        // Only allow changing to speaker/listener, not creator
        if (req.body.role !== 'creator') {
          updates.role = req.body.role;
        }
      }
    }

    const updatedParticipant = await withDatabaseErrorHandling(
      () => storage.updateChymeRoomParticipant(roomId, targetUserId, updates),
      'updateChymeRoomParticipant'
    );

    res.json(updatedParticipant);
  }));

  // DELETE /api/chyme/rooms/:roomId/participants/:userId (kick participant)
  app.delete('/api/chyme/rooms/:roomId/participants/:userId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const roomId = req.params.roomId;
    const targetUserId = req.params.userId;

    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoom(roomId),
      'getChymeRoom'
    ) as ChymeRoom | undefined;

    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if current user is the room creator or admin
    const isCreator = room.createdBy === currentUserId;
    const currentUser = await withDatabaseErrorHandling(
      () => storage.getUser(currentUserId),
      'getUser'
    ) as User | undefined;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Only room creator or admin can kick participants" });
    }

    // Prevent kicking yourself
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot kick yourself" });
    }

    await withDatabaseErrorHandling(
      () => storage.leaveChymeRoom(roomId, targetUserId),
      'leaveChymeRoom'
    );

    res.json({ message: "Participant kicked" });
  }));

  // POST /api/chyme/users/:userId/follow
  app.post('/api/chyme/users/:userId/follow', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if target user exists
    const targetUser = await withDatabaseErrorHandling(
      () => storage.getUser(targetUserId),
      'getUser'
    ) as User | undefined;

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const follow = await withDatabaseErrorHandling(
      () => storage.followChymeUser(currentUserId, targetUserId),
      'followChymeUser'
    );

    res.json({ message: "User followed", follow });
  }));

  // DELETE /api/chyme/users/:userId/follow
  app.delete('/api/chyme/users/:userId/follow', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.userId;

    await withDatabaseErrorHandling(
      () => storage.unfollowChymeUser(currentUserId, targetUserId),
      'unfollowChymeUser'
    );

    res.json({ message: "User unfollowed" });
  }));

  // POST /api/chyme/users/:userId/block
  app.post('/api/chyme/users/:userId/block', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    // Check if target user exists
    const targetUser = await withDatabaseErrorHandling(
      () => storage.getUser(targetUserId),
      'getUser'
    ) as User | undefined;

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const block = await withDatabaseErrorHandling(
      () => storage.blockChymeUser(currentUserId, targetUserId),
      'blockChymeUser'
    );

    res.json({ message: "User blocked", block });
  }));

  // DELETE /api/chyme/users/:userId/block (unblock)
  app.delete('/api/chyme/users/:userId/block', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.userId;

    await withDatabaseErrorHandling(
      () => storage.unblockChymeUser(currentUserId, targetUserId),
      'unblockChymeUser'
    );

    res.json({ message: "User unblocked" });
  }));

  // GET /api/chyme/users/:userId (get user profile)
  app.get('/api/chyme/users/:userId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const targetUserId = req.params.userId;

    const user = await withDatabaseErrorHandling(
      () => storage.getUser(targetUserId),
      'getUser'
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user profile data
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || null,
      profileImageUrl: user.profileImageUrl || null,
      username: null
    });
  }));

  // GET /api/chyme/users/:userId/follow-status (check if following)
  app.get('/api/chyme/users/:userId/follow-status', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.userId;

    const isFollowing = await withDatabaseErrorHandling(
      () => storage.isFollowingChymeUser(currentUserId, targetUserId),
      'isFollowingChymeUser'
    );

    res.json({ isFollowing });
  }));

  // GET /api/chyme/users/:userId/block-status (check if blocked)
  app.get('/api/chyme/users/:userId/block-status', isAuthenticated, asyncHandler(async (req: any, res) => {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.userId;

    const isBlocked = await withDatabaseErrorHandling(
      () => storage.isBlockingChymeUser(currentUserId, targetUserId),
      'isBlockingChymeUser'
    );

    res.json({ isBlocked });
  }));

  app.delete('/api/chyme/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateChymeAnnouncement(req.params.id),
      'deactivateChymeAnnouncement'
    ) as ChymeAnnouncement;
    
    await logAdminAction(
      userId,
      "deactivate_chyme_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));


}
