/**
 * TrustTransport Storage Module
 * 
 * Handles all TrustTransport mini-app operations: profiles, ride requests, and announcements.
 */

import {
  trusttransportProfiles,
  trusttransportRideRequests,
  trusttransportAnnouncements,
  type TrusttransportProfile,
  type InsertTrusttransportProfile,
  type TrusttransportRideRequest,
  type InsertTrusttransportRideRequest,
  type TrusttransportAnnouncement,
  type InsertTrusttransportAnnouncement,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, asc, or, gte, lt, sql } from "drizzle-orm";
import { NotFoundError, ValidationError, ForbiddenError } from "../../errors";
import { generateAnonymizedUserId, logProfileDeletion } from "../profile-deletion";

export class TrustTransportStorage {
  // ========================================
  // TRUSTTRANSPORT PROFILE OPERATIONS
  // ========================================

  async getTrusttransportProfile(userId: string): Promise<TrusttransportProfile | undefined> {
    const [profile] = await db
      .select()
      .from(trusttransportProfiles)
      .where(eq(trusttransportProfiles.userId, userId));
    return profile;
  }

  async createTrusttransportProfile(profileData: InsertTrusttransportProfile): Promise<TrusttransportProfile> {
    const [profile] = await db
      .insert(trusttransportProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateTrusttransportProfile(userId: string, profileData: Partial<InsertTrusttransportProfile>): Promise<TrusttransportProfile> {
    const [profile] = await db
      .update(trusttransportProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportProfiles.userId, userId))
      .returning();
    return profile;
  }

  // ========================================
  // TRUSTTRANSPORT RIDE REQUEST OPERATIONS
  // ========================================

  async createTrusttransportRideRequest(requestData: InsertTrusttransportRideRequest & { riderId?: string }): Promise<TrusttransportRideRequest> {
    if (!requestData.riderId) {
      throw new ValidationError("riderId is required to create a ride request");
    }
    
    // Explicitly build values object to ensure riderId is included
    // TypeScript may strip riderId from spread since it's not in InsertTrusttransportRideRequest type
    const values: any = {
      riderId: requestData.riderId,
      pickupLocation: requestData.pickupLocation,
      dropoffLocation: requestData.dropoffLocation,
      pickupCity: requestData.pickupCity,
      pickupState: requestData.pickupState ?? null,
      dropoffCity: requestData.dropoffCity,
      dropoffState: requestData.dropoffState ?? null,
      departureDateTime: requestData.departureDateTime,
      requestedSeats: requestData.requestedSeats,
      requestedCarType: requestData.requestedCarType ?? null,
      requiresHeat: requestData.requiresHeat ?? false,
      requiresAC: requestData.requiresAC ?? false,
      requiresWheelchairAccess: requestData.requiresWheelchairAccess ?? false,
      requiresChildSeat: requestData.requiresChildSeat ?? false,
      riderMessage: requestData.riderMessage ?? null,
      status: 'open', // New requests start as 'open'
    };
    
    const [request] = await db
      .insert(trusttransportRideRequests)
      .values(values)
      .returning();
    
    return request;
  }

  async getTrusttransportRideRequestById(id: string): Promise<TrusttransportRideRequest | undefined> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    const [request] = await db
      .select()
      .from(trusttransportRideRequests)
      .where(eq(trusttransportRideRequests.id, id));
    return request;
  }

  async getTrusttransportRideRequestsByRider(riderId: string): Promise<TrusttransportRideRequest[]> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    return await db
      .select()
      .from(trusttransportRideRequests)
      .where(eq(trusttransportRideRequests.riderId, riderId))
      .orderBy(desc(trusttransportRideRequests.createdAt));
  }

  // Expire ride requests where departure date has passed
  async expireTrusttransportRideRequests(): Promise<void> {
    const now = new Date();
    await db
      .update(trusttransportRideRequests)
      .set({
        status: 'expired',
        updatedAt: now,
      })
      .where(
        and(
          eq(trusttransportRideRequests.status, 'open'),
          lt(trusttransportRideRequests.departureDateTime, now)
        )
      );
  }

  async getOpenTrusttransportRideRequests(): Promise<TrusttransportRideRequest[]> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    const now = new Date();
    return await db
      .select()
      .from(trusttransportRideRequests)
      .where(
        and(
          eq(trusttransportRideRequests.status, 'open'),
          gte(trusttransportRideRequests.departureDateTime, now)
        )
      )
      .orderBy(asc(trusttransportRideRequests.departureDateTime));
  }

  async getTrusttransportRideRequestsByDriver(driverId: string): Promise<TrusttransportRideRequest[]> {
    return await db
      .select()
      .from(trusttransportRideRequests)
      .where(eq(trusttransportRideRequests.driverId, driverId))
      .orderBy(desc(trusttransportRideRequests.createdAt));
  }

  async claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string): Promise<TrusttransportRideRequest> {
    // First, expire any requests that have passed their departure date
    await this.expireTrusttransportRideRequests();
    
    const request = await this.getTrusttransportRideRequestById(requestId);
    if (!request) {
      throw new NotFoundError("Ride request");
    }
    if (request.status !== 'open') {
      if (request.status === 'expired') {
        throw new ValidationError("This ride request has expired and can no longer be claimed");
      }
      throw new ValidationError("Ride request is not available to claim");
    }
    if (request.driverId) {
      throw new ValidationError("Ride request has already been claimed");
    }

    // Get driver profile to verify they meet criteria
    // Note: driverId here is userId, need to get profile
    const driverProfile = await db
      .select()
      .from(trusttransportProfiles)
      .where(eq(trusttransportProfiles.userId, driverId))
      .limit(1);
    
    if (driverProfile.length === 0 || !driverProfile[0].isDriver) {
      throw new ForbiddenError("You must be a driver to claim ride requests");
    }

    const [updated] = await db
      .update(trusttransportRideRequests)
      .set({
        driverId: driverProfile[0].id,
        status: 'claimed',
        driverMessage: driverMessage || null,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportRideRequests.id, requestId))
      .returning();
    
    return updated;
  }

  async updateTrusttransportRideRequest(id: string, requestData: Partial<InsertTrusttransportRideRequest>): Promise<TrusttransportRideRequest> {
    const [request] = await db
      .update(trusttransportRideRequests)
      .set({
        ...requestData,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportRideRequests.id, id))
      .returning();
    return request;
  }

  async cancelTrusttransportRideRequest(id: string, userId: string): Promise<TrusttransportRideRequest> {
    const request = await this.getTrusttransportRideRequestById(id);
    if (!request) {
      throw new NotFoundError("Ride request");
    }

    // Get user's profile to check if they're the rider or driver
    const profile = await this.getTrusttransportProfile(userId);
    if (!profile) {
      throw new NotFoundError("Profile");
    }

    // Check if user is the rider or the driver who claimed it
    const isRider = request.riderId === userId;
    const isDriver = request.driverId === profile.id && profile.isDriver;

    if (!isRider && !isDriver) {
      throw new ForbiddenError("You are not authorized to cancel this ride request");
    }

    // If claimed, unclaim it (set driverId to null and status to open)
    // If open, mark as cancelled
    const newStatus = request.status === 'claimed' ? 'open' : 'cancelled';
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'open' && isDriver) {
      // Driver is cancelling their claim - unclaim the request
      updateData.driverId = null;
      updateData.driverMessage = null;
    }

    const [updated] = await db
      .update(trusttransportRideRequests)
      .set(updateData)
      .where(eq(trusttransportRideRequests.id, id))
      .returning();
    
    return updated;
  }

  // ========================================
  // TRUSTTRANSPORT ANNOUNCEMENT OPERATIONS
  // ========================================

  async createTrusttransportAnnouncement(announcementData: InsertTrusttransportAnnouncement): Promise<TrusttransportAnnouncement> {
    const [announcement] = await db
      .insert(trusttransportAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(trusttransportAnnouncements)
      .where(
        and(
          eq(trusttransportAnnouncements.isActive, true),
          or(
            sql`${trusttransportAnnouncements.expiresAt} IS NULL`,
            gte(trusttransportAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(trusttransportAnnouncements.createdAt));
  }

  async getAllTrusttransportAnnouncements(): Promise<TrusttransportAnnouncement[]> {
    return await db
      .select()
      .from(trusttransportAnnouncements)
      .orderBy(desc(trusttransportAnnouncements.createdAt));
  }

  async updateTrusttransportAnnouncement(id: string, announcementData: Partial<InsertTrusttransportAnnouncement>): Promise<TrusttransportAnnouncement> {
    const [announcement] = await db
      .update(trusttransportAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateTrusttransportAnnouncement(id: string): Promise<TrusttransportAnnouncement> {
    const [announcement] = await db
      .update(trusttransportAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(trusttransportAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deleteTrusttransportProfile(userId: string, reason?: string): Promise<void> {
    const profile = await this.getTrusttransportProfile(userId);
    if (!profile) {
      throw new NotFoundError("TrustTransport profile");
    }

    const anonymizedUserId = generateAnonymizedUserId();

    // Anonymize related data
    try {
      // Anonymize ride requests where user is rider
      await db
        .update(trusttransportRideRequests)
        .set({ riderId: anonymizedUserId })
        .where(eq(trusttransportRideRequests.riderId, userId));

      // Anonymize ride requests where user is driver
      await db
        .update(trusttransportRideRequests)
        .set({ driverId: anonymizedUserId })
        .where(eq(trusttransportRideRequests.driverId, userId));
    } catch (error: any) {
      console.warn(`Failed to anonymize TrustTransport related data: ${error.message}`);
    }

    // Delete the profile
    await db.delete(trusttransportProfiles).where(eq(trusttransportProfiles.userId, userId));

    // Log the deletion
    await logProfileDeletion(userId, "trusttransport", reason);
  }
}

