/**
 * SocketRelay Storage Module
 * 
 * Handles all SocketRelay mini-app operations: requests, fulfillments, messages,
 * profiles, and announcements.
 */

import {
  socketrelayRequests,
  socketrelayFulfillments,
  socketrelayMessages,
  socketrelayProfiles,
  socketrelayAnnouncements,
  users,
  type SocketrelayRequest,
  type InsertSocketrelayRequest,
  type SocketrelayFulfillment,
  type InsertSocketrelayFulfillment,
  type SocketrelayMessage,
  type InsertSocketrelayMessage,
  type SocketrelayProfile,
  type InsertSocketrelayProfile,
  type SocketrelayAnnouncement,
  type InsertSocketrelayAnnouncement,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, or, gte, sql } from "drizzle-orm";
import { NotFoundError, ForbiddenError, ValidationError } from "../errors";

export class SocketRelayStorage {
  // ========================================
  // SOCKETRELAY REQUEST OPERATIONS
  // ========================================

  async createSocketrelayRequest(userId: string, description: string, isPublic: boolean = false): Promise<SocketrelayRequest> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 days from now

    const [request] = await db
      .insert(socketrelayRequests)
      .values({
        userId,
        description,
        isPublic: !!isPublic,
        expiresAt,
      })
      .returning();
    return request;
  }

  async getActiveSocketrelayRequests(): Promise<any[]> {
    const now = new Date();
    const requests = await db
      .select()
      .from(socketrelayRequests)
      .where(
        and(
          eq(socketrelayRequests.status, 'active'),
          gte(socketrelayRequests.expiresAt, now)
        )
      )
      .orderBy(desc(socketrelayRequests.createdAt));
    
    // Join with creator profiles to get location data
    const results = await Promise.all(
      requests.map(async (request) => {
        const profile = await this.getSocketrelayProfile(request.userId);
        return {
          ...request,
          creatorProfile: profile ? {
            city: profile.city,
            state: profile.state,
            country: profile.country,
          } : null,
        };
      })
    );
    
    return results;
  }

  async getSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined> {
    const [request] = await db
      .select()
      .from(socketrelayRequests)
      .where(eq(socketrelayRequests.id, id));
    return request;
  }

  async getPublicSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined> {
    const now = new Date();
    const [request] = await db
      .select()
      .from(socketrelayRequests)
      .where(
        and(
          eq(socketrelayRequests.id, id),
          eq(socketrelayRequests.isPublic, true),
          eq(socketrelayRequests.status, 'active'),
          gte(socketrelayRequests.expiresAt, now)
        )
      );
    return request;
  }

  async listPublicSocketrelayRequests(): Promise<SocketrelayRequest[]> {
    const now = new Date();
    return await db
      .select()
      .from(socketrelayRequests)
      .where(
        and(
          eq(socketrelayRequests.isPublic, true),
          eq(socketrelayRequests.status, 'active'),
          gte(socketrelayRequests.expiresAt, now)
        )
      )
      .orderBy(desc(socketrelayRequests.createdAt));
  }

  async getAllSocketrelayRequests(): Promise<any[]> {
    const requests = await db
      .select()
      .from(socketrelayRequests)
      .orderBy(desc(socketrelayRequests.createdAt));
    
    // Join with creator profiles and users to get location data and user info
    const results = await Promise.all(
      requests.map(async (request) => {
        const profile = await this.getSocketrelayProfile(request.userId);
        const [user] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, request.userId))
          .limit(1);
        
        return {
          ...request,
          creatorProfile: profile ? {
            city: profile.city,
            state: profile.state,
            country: profile.country,
          } : null,
          user: user || null,
        };
      })
    );
    
    return results;
  }

  async getSocketrelayRequestsByUser(userId: string): Promise<SocketrelayRequest[]> {
    return await db
      .select()
      .from(socketrelayRequests)
      .where(eq(socketrelayRequests.userId, userId))
      .orderBy(desc(socketrelayRequests.createdAt));
  }

  async updateSocketrelayRequestStatus(id: string, status: string): Promise<SocketrelayRequest> {
    const [request] = await db
      .update(socketrelayRequests)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayRequests.id, id))
      .returning();
    return request;
  }

  async updateSocketrelayRequest(id: string, userId: string, description: string, isPublic: boolean = false): Promise<SocketrelayRequest> {
    // Get the request to verify ownership
    const request = await this.getSocketrelayRequestById(id);
    if (!request) {
      throw new NotFoundError("Request");
    }

    // Verify ownership
    if (request.userId !== userId) {
      throw new ForbiddenError("You can only edit your own requests");
    }

    // Only allow editing active requests that haven't expired
    if (request.status !== 'active') {
      throw new ValidationError("You can only edit active requests");
    }

    const now = new Date();
    if (new Date(request.expiresAt) < now) {
      throw new ValidationError("You cannot edit expired requests");
    }

    // Update the request
    const [updated] = await db
      .update(socketrelayRequests)
      .set({
        description,
        isPublic: !!isPublic,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayRequests.id, id))
      .returning();
    
    return updated;
  }

  async repostSocketrelayRequest(id: string, userId: string): Promise<SocketrelayRequest> {
    // Get the request to verify ownership and expiration
    const request = await this.getSocketrelayRequestById(id);
    if (!request) {
      throw new NotFoundError("Request");
    }

    // Verify ownership
    if (request.userId !== userId) {
      throw new ForbiddenError("You can only repost your own requests");
    }

    // Check if request is expired
    const now = new Date();
    if (new Date(request.expiresAt) >= now) {
      throw new ValidationError("Request is not expired yet");
    }

    // Set new expiration date (14 days from now)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 14);

    // Update the request: set new expiration, set status to active, update timestamp
    const [updated] = await db
      .update(socketrelayRequests)
      .set({
        expiresAt: newExpiresAt,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(socketrelayRequests.id, id))
      .returning();
    
    return updated;
  }

  async deleteSocketrelayRequest(id: string): Promise<void> {
    // First, get all fulfillments for this request
    const fulfillments = await this.getSocketrelayFulfillmentsByRequest(id);
    
    // Delete messages for each fulfillment
    for (const fulfillment of fulfillments) {
      await db
        .delete(socketrelayMessages)
        .where(eq(socketrelayMessages.fulfillmentId, fulfillment.id));
    }
    
    // Delete all fulfillments for this request
    await db
      .delete(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.requestId, id));
    
    // Finally, delete the request itself
    await db
      .delete(socketrelayRequests)
      .where(eq(socketrelayRequests.id, id));
  }

  // ========================================
  // SOCKETRELAY FULFILLMENT OPERATIONS
  // ========================================

  async createSocketrelayFulfillment(requestId: string, fulfillerUserId: string): Promise<SocketrelayFulfillment> {
    const [fulfillment] = await db
      .insert(socketrelayFulfillments)
      .values({
        requestId,
        fulfillerUserId,
      })
      .returning();

    // Update request status to fulfilled
    await this.updateSocketrelayRequestStatus(requestId, 'fulfilled');

    return fulfillment;
  }

  async getSocketrelayFulfillmentById(id: string): Promise<SocketrelayFulfillment | undefined> {
    const [fulfillment] = await db
      .select()
      .from(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.id, id));
    return fulfillment;
  }

  async getSocketrelayFulfillmentsByRequest(requestId: string): Promise<SocketrelayFulfillment[]> {
    return await db
      .select()
      .from(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.requestId, requestId))
      .orderBy(desc(socketrelayFulfillments.createdAt));
  }

  async getSocketrelayFulfillmentsByUser(userId: string): Promise<any[]> {
    const fulfillments = await db
      .select()
      .from(socketrelayFulfillments)
      .where(eq(socketrelayFulfillments.fulfillerUserId, userId))
      .orderBy(desc(socketrelayFulfillments.createdAt));
    
    const results = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const request = await this.getSocketrelayRequestById(fulfillment.requestId);
        return { ...fulfillment, request };
      })
    );
    
    return results;
  }

  async getAllSocketrelayFulfillments(): Promise<any[]> {
    const fulfillments = await db
      .select()
      .from(socketrelayFulfillments)
      .orderBy(desc(socketrelayFulfillments.createdAt));
    
    const results = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const request = await this.getSocketrelayRequestById(fulfillment.requestId);
        const [user] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, fulfillment.fulfillerUserId))
          .limit(1);
        
        return { 
          ...fulfillment, 
          request,
          user: user || null,
        };
      })
    );
    
    return results;
  }

  async closeSocketrelayFulfillment(id: string, userId: string, status: string): Promise<SocketrelayFulfillment> {
    const [fulfillment] = await db
      .update(socketrelayFulfillments)
      .set({
        status,
        closedBy: userId,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(socketrelayFulfillments.id, id))
      .returning();
    return fulfillment;
  }

  // ========================================
  // SOCKETRELAY MESSAGE OPERATIONS
  // ========================================

  async createSocketrelayMessage(messageData: InsertSocketrelayMessage): Promise<SocketrelayMessage> {
    const [message] = await db
      .insert(socketrelayMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getSocketrelayMessagesByFulfillment(fulfillmentId: string): Promise<SocketrelayMessage[]> {
    return await db
      .select()
      .from(socketrelayMessages)
      .where(eq(socketrelayMessages.fulfillmentId, fulfillmentId))
      .orderBy(socketrelayMessages.createdAt);
  }

  // ========================================
  // SOCKETRELAY PROFILE OPERATIONS
  // ========================================

  async getSocketrelayProfile(userId: string): Promise<SocketrelayProfile | undefined> {
    const [profile] = await db
      .select()
      .from(socketrelayProfiles)
      .where(eq(socketrelayProfiles.userId, userId));
    return profile;
  }

  async createSocketrelayProfile(profileData: InsertSocketrelayProfile): Promise<SocketrelayProfile> {
    const [profile] = await db
      .insert(socketrelayProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateSocketrelayProfile(userId: string, profileData: Partial<InsertSocketrelayProfile>): Promise<SocketrelayProfile> {
    const [profile] = await db
      .update(socketrelayProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayProfiles.userId, userId))
      .returning();
    return profile;
  }

  // ========================================
  // SOCKETRELAY ANNOUNCEMENT OPERATIONS
  // ========================================

  async createSocketrelayAnnouncement(announcementData: InsertSocketrelayAnnouncement): Promise<SocketrelayAnnouncement> {
    const [announcement] = await db
      .insert(socketrelayAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }
  
  async getActiveSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(socketrelayAnnouncements)
      .where(
        and(
          eq(socketrelayAnnouncements.isActive, true),
          or(
            sql`${socketrelayAnnouncements.expiresAt} IS NULL`,
            gte(socketrelayAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(socketrelayAnnouncements.createdAt));
  }
  
  async getAllSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]> {
    return await db
      .select()
      .from(socketrelayAnnouncements)
      .orderBy(desc(socketrelayAnnouncements.createdAt));
  }
  
  async updateSocketrelayAnnouncement(id: string, announcementData: Partial<InsertSocketrelayAnnouncement>): Promise<SocketrelayAnnouncement> {
    const [announcement] = await db
      .update(socketrelayAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayAnnouncements.id, id))
      .returning();
    return announcement;
  }
  
  async deactivateSocketrelayAnnouncement(id: string): Promise<SocketrelayAnnouncement> {
    const [announcement] = await db
      .update(socketrelayAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(socketrelayAnnouncements.id, id))
      .returning();
    return announcement;
  }
}

