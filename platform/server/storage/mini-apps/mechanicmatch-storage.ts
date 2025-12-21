/**
 * MechanicMatch Storage Module
 * 
 * Handles all MechanicMatch mini-app operations: profiles, vehicles, service requests,
 * jobs, availability, reviews, messages, search, and announcements.
 * 
 * Note: deleteMechanicmatchProfile requires profile deletion utilities which are
 * handled at the composed storage level.
 */

import {
  mechanicmatchProfiles,
  mechanicmatchVehicles,
  mechanicmatchServiceRequests,
  mechanicmatchJobs,
  mechanicmatchAvailability,
  mechanicmatchReviews,
  mechanicmatchMessages,
  mechanicmatchAnnouncements,
  type MechanicmatchProfile,
  type InsertMechanicmatchProfile,
  type MechanicmatchVehicle,
  type InsertMechanicmatchVehicle,
  type MechanicmatchServiceRequest,
  type InsertMechanicmatchServiceRequest,
  type MechanicmatchJob,
  type InsertMechanicmatchJob,
  type MechanicmatchAvailability,
  type InsertMechanicmatchAvailability,
  type MechanicmatchReview,
  type InsertMechanicmatchReview,
  type MechanicmatchMessage,
  type InsertMechanicmatchMessage,
  type MechanicmatchAnnouncement,
  type InsertMechanicmatchAnnouncement,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, asc, or, gte, sql } from "drizzle-orm";
import { NotFoundError, ValidationError, ForbiddenError } from "../../errors";
import { generateAnonymizedUserId, logProfileDeletion } from "../profile-deletion";

export class MechanicMatchStorage {
  // ========================================
  // MECHANICMATCH PROFILE OPERATIONS
  // ========================================

  async getMechanicmatchProfile(userId: string): Promise<MechanicmatchProfile | undefined> {
    const [profile] = await db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.userId, userId));
    return profile;
  }

  async getMechanicmatchProfileById(profileId: string): Promise<MechanicmatchProfile | undefined> {
    const [profile] = await db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.id, profileId));
    return profile;
  }

  async listMechanicmatchProfiles(filters?: {
    search?: string;
    role?: "mechanic" | "owner";
    isClaimed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MechanicmatchProfile[]; total: number }> {
    const limit = Math.min(filters?.limit ?? 50, 100);
    const offset = filters?.offset ?? 0;
    const conditions: any[] = [];

    if (filters?.role === "mechanic") {
      conditions.push(eq(mechanicmatchProfiles.isMechanic, true));
    } else if (filters?.role === "owner") {
      conditions.push(eq(mechanicmatchProfiles.isCarOwner, true));
    }

    if (filters?.isClaimed !== undefined) {
      conditions.push(eq(mechanicmatchProfiles.isClaimed, filters.isClaimed));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${mechanicmatchProfiles.city} ILIKE ${searchTerm}`,
          sql`${mechanicmatchProfiles.state} ILIKE ${searchTerm}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mechanicmatchProfiles)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(mechanicmatchProfiles)
      .where(whereClause)
      .orderBy(desc(mechanicmatchProfiles.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total };
  }

  async listPublicMechanicmatchProfiles(): Promise<MechanicmatchProfile[]> {
    return await db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.isPublic, true))
      .orderBy(desc(mechanicmatchProfiles.createdAt));
  }

  async createMechanicmatchProfile(profileData: InsertMechanicmatchProfile): Promise<MechanicmatchProfile> {
    // Convert number fields to strings for decimal columns
    const dataToInsert: any = { ...profileData };
    if (dataToInsert.hourlyRate !== undefined && dataToInsert.hourlyRate !== null) {
      dataToInsert.hourlyRate = dataToInsert.hourlyRate.toString();
    }
    if (dataToInsert.averageRating !== undefined && dataToInsert.averageRating !== null) {
      dataToInsert.averageRating = dataToInsert.averageRating.toString();
    }
    // Follow the same pattern as directory profiles: omit userId from insert if it's null/undefined/empty
    const { userId, ...restData } = dataToInsert;
    const finalData: any = { ...restData };
    // Only include userId if it has a valid non-empty string value
    if (userId && typeof userId === 'string' && userId.trim() !== '') {
      finalData.userId = userId.trim();
    }
    // Ensure userId is not in the object at all if it's null/undefined/empty
    if (finalData.userId === null || finalData.userId === undefined || finalData.userId === '') {
      delete finalData.userId;
    }
    const [profile] = await db
      .insert(mechanicmatchProfiles)
      .values(finalData)
      .returning();
    return profile;
  }

  async updateMechanicmatchProfile(userId: string, profileData: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...profileData, updatedAt: new Date() };
    if (dataToUpdate.hourlyRate !== undefined && dataToUpdate.hourlyRate !== null) {
      dataToUpdate.hourlyRate = dataToUpdate.hourlyRate.toString();
    }
    if (dataToUpdate.averageRating !== undefined && dataToUpdate.averageRating !== null) {
      dataToUpdate.averageRating = dataToUpdate.averageRating.toString();
    }
    const [profile] = await db
      .update(mechanicmatchProfiles)
      .set(dataToUpdate)
      .where(eq(mechanicmatchProfiles.userId, userId))
      .returning();
    return profile;
  }

  async updateMechanicmatchProfileById(profileId: string, profileData: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...profileData, updatedAt: new Date() };
    if (dataToUpdate.hourlyRate !== undefined && dataToUpdate.hourlyRate !== null) {
      dataToUpdate.hourlyRate = dataToUpdate.hourlyRate.toString();
    }
    if (dataToUpdate.averageRating !== undefined && dataToUpdate.averageRating !== null) {
      dataToUpdate.averageRating = dataToUpdate.averageRating.toString();
    }
    const [profile] = await db
      .update(mechanicmatchProfiles)
      .set(dataToUpdate)
      .where(eq(mechanicmatchProfiles.id, profileId))
      .returning();
    return profile;
  }

  async deleteMechanicmatchProfileById(profileId: string): Promise<void> {
    await db.delete(mechanicmatchProfiles).where(eq(mechanicmatchProfiles.id, profileId));
  }

  // ========================================
  // MECHANICMATCH VEHICLE OPERATIONS
  // ========================================

  async getMechanicmatchVehiclesByOwner(ownerId: string): Promise<MechanicmatchVehicle[]> {
    return await db
      .select()
      .from(mechanicmatchVehicles)
      .where(eq(mechanicmatchVehicles.ownerId, ownerId))
      .orderBy(desc(mechanicmatchVehicles.createdAt));
  }

  async getMechanicmatchVehicleById(id: string): Promise<MechanicmatchVehicle | undefined> {
    const [vehicle] = await db
      .select()
      .from(mechanicmatchVehicles)
      .where(eq(mechanicmatchVehicles.id, id));
    return vehicle;
  }

  async createMechanicmatchVehicle(vehicleData: InsertMechanicmatchVehicle & { ownerId?: string }): Promise<MechanicmatchVehicle> {
    if (!vehicleData.ownerId) {
      throw new ValidationError("ownerId is required to create a vehicle");
    }
    const [vehicle] = await db
      .insert(mechanicmatchVehicles)
      .values({
        ...vehicleData,
        ownerId: vehicleData.ownerId,
      })
      .returning();
    return vehicle;
  }

  async updateMechanicmatchVehicle(id: string, vehicleData: Partial<InsertMechanicmatchVehicle>): Promise<MechanicmatchVehicle> {
    const [vehicle] = await db
      .update(mechanicmatchVehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(mechanicmatchVehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteMechanicmatchVehicle(id: string, ownerId: string): Promise<void> {
    const vehicle = await this.getMechanicmatchVehicleById(id);
    if (!vehicle) {
      throw new NotFoundError("Vehicle");
    }
    if (vehicle.ownerId !== ownerId) {
      throw new ForbiddenError("You are not authorized to delete this vehicle");
    }
    await db.delete(mechanicmatchVehicles).where(eq(mechanicmatchVehicles.id, id));
  }

  // ========================================
  // MECHANICMATCH SERVICE REQUEST OPERATIONS
  // ========================================

  async createMechanicmatchServiceRequest(requestData: InsertMechanicmatchServiceRequest & { ownerId?: string }): Promise<MechanicmatchServiceRequest> {
    if (!requestData.ownerId) {
      throw new ValidationError("ownerId is required to create a service request");
    }
    const [request] = await db
      .insert(mechanicmatchServiceRequests)
      .values({
        ...requestData,
        ownerId: requestData.ownerId,
        status: 'open',
      })
      .returning();
    return request;
  }

  async getMechanicmatchServiceRequestById(id: string): Promise<MechanicmatchServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.id, id));
    return request;
  }

  async getMechanicmatchServiceRequestsByOwner(ownerId: string): Promise<MechanicmatchServiceRequest[]> {
    return await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.ownerId, ownerId))
      .orderBy(desc(mechanicmatchServiceRequests.createdAt));
  }

  async getMechanicmatchServiceRequestsByOwnerPaginated(
    ownerId: string,
    limit: number,
    offset: number
  ): Promise<{ items: MechanicmatchServiceRequest[]; total: number }> {
    const safeLimit = Math.min(limit, 100);
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.ownerId, ownerId));
    const total = Number(totalResult[0]?.count || 0);

    const items = await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.ownerId, ownerId))
      .orderBy(desc(mechanicmatchServiceRequests.createdAt))
      .limit(safeLimit)
      .offset(offset);

    return { items, total };
  }

  async getOpenMechanicmatchServiceRequests(): Promise<MechanicmatchServiceRequest[]> {
    return await db
      .select()
      .from(mechanicmatchServiceRequests)
      .where(eq(mechanicmatchServiceRequests.status, 'open'))
      .orderBy(desc(mechanicmatchServiceRequests.createdAt));
  }

  async updateMechanicmatchServiceRequest(id: string, requestData: Partial<InsertMechanicmatchServiceRequest>): Promise<MechanicmatchServiceRequest> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...requestData, updatedAt: new Date() };
    if (dataToUpdate.ratePerMinute !== undefined && dataToUpdate.ratePerMinute !== null) {
      dataToUpdate.ratePerMinute = dataToUpdate.ratePerMinute.toString();
    }
    const [request] = await db
      .update(mechanicmatchServiceRequests)
      .set(dataToUpdate)
      .where(eq(mechanicmatchServiceRequests.id, id))
      .returning();
    return request;
  }

  // ========================================
  // MECHANICMATCH JOB OPERATIONS
  // ========================================

  async createMechanicmatchJob(jobData: InsertMechanicmatchJob & { ownerId?: string }): Promise<MechanicmatchJob> {
    if (!jobData.ownerId) {
      throw new ValidationError("ownerId is required to create a job");
    }
    // Convert number fields to strings for decimal columns
    const dataToInsert: any = {
      ...jobData,
      ownerId: jobData.ownerId,
      status: 'requested',
    };
    if (dataToInsert.ratePerMinute !== undefined && dataToInsert.ratePerMinute !== null) {
      dataToInsert.ratePerMinute = dataToInsert.ratePerMinute.toString();
    }
    const [job] = await db
      .insert(mechanicmatchJobs)
      .values(dataToInsert)
      .returning();
    return job;
  }

  async getMechanicmatchJobById(id: string): Promise<MechanicmatchJob | undefined> {
    const [job] = await db
      .select()
      .from(mechanicmatchJobs)
      .where(eq(mechanicmatchJobs.id, id));
    return job;
  }

  async getMechanicmatchJobsByOwner(ownerId: string): Promise<MechanicmatchJob[]> {
    return await db
      .select()
      .from(mechanicmatchJobs)
      .where(eq(mechanicmatchJobs.ownerId, ownerId))
      .orderBy(desc(mechanicmatchJobs.createdAt));
  }

  async getMechanicmatchJobsByMechanic(mechanicId: string): Promise<MechanicmatchJob[]> {
    return await db
      .select()
      .from(mechanicmatchJobs)
      .where(eq(mechanicmatchJobs.mechanicId, mechanicId))
      .orderBy(desc(mechanicmatchJobs.createdAt));
  }

  async updateMechanicmatchJob(id: string, jobData: Partial<InsertMechanicmatchJob>): Promise<MechanicmatchJob> {
    // Convert number fields to strings for decimal columns
    const dataToUpdate: any = { ...jobData, updatedAt: new Date() };
    if (dataToUpdate.ratePerMinute !== undefined && dataToUpdate.ratePerMinute !== null) {
      dataToUpdate.ratePerMinute = dataToUpdate.ratePerMinute.toString();
    }
    const [job] = await db
      .update(mechanicmatchJobs)
      .set(dataToUpdate)
      .where(eq(mechanicmatchJobs.id, id))
      .returning();
    return job;
  }

  async acceptMechanicmatchJob(jobId: string, mechanicId: string): Promise<MechanicmatchJob> {
    const job = await this.getMechanicmatchJobById(jobId);
    if (!job) {
      throw new NotFoundError("Job");
    }
    if (job.mechanicId !== mechanicId) {
      throw new ForbiddenError("You are not authorized to accept this job");
    }
    if (job.status !== 'requested') {
      throw new ValidationError("Job is not in requested status");
    }
    const [updated] = await db
      .update(mechanicmatchJobs)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(mechanicmatchJobs.id, jobId))
      .returning();
    
    // Update service request status if linked
    if (job.serviceRequestId) {
      await db
        .update(mechanicmatchServiceRequests)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(mechanicmatchServiceRequests.id, job.serviceRequestId));
    }
    
    return updated;
  }

  // ========================================
  // MECHANICMATCH AVAILABILITY OPERATIONS
  // ========================================

  async getMechanicmatchAvailabilityByMechanic(mechanicId: string): Promise<MechanicmatchAvailability[]> {
    return await db
      .select()
      .from(mechanicmatchAvailability)
      .where(eq(mechanicmatchAvailability.mechanicId, mechanicId))
      .orderBy(asc(mechanicmatchAvailability.dayOfWeek));
  }

  async createMechanicmatchAvailability(availabilityData: InsertMechanicmatchAvailability): Promise<MechanicmatchAvailability> {
    const [availability] = await db
      .insert(mechanicmatchAvailability)
      .values(availabilityData)
      .returning();
    return availability;
  }

  async updateMechanicmatchAvailability(id: string, availabilityData: Partial<InsertMechanicmatchAvailability>): Promise<MechanicmatchAvailability> {
    const [availability] = await db
      .update(mechanicmatchAvailability)
      .set({ ...availabilityData, updatedAt: new Date() })
      .where(eq(mechanicmatchAvailability.id, id))
      .returning();
    return availability;
  }

  async deleteMechanicmatchAvailability(id: string, mechanicId: string): Promise<void> {
    const availability = await db
      .select()
      .from(mechanicmatchAvailability)
      .where(and(
        eq(mechanicmatchAvailability.id, id),
        eq(mechanicmatchAvailability.mechanicId, mechanicId)
      ));
    if (!availability.length) {
      throw new NotFoundError("Availability");
    }
    await db.delete(mechanicmatchAvailability).where(eq(mechanicmatchAvailability.id, id));
  }

  // ========================================
  // MECHANICMATCH REVIEW OPERATIONS
  // ========================================

  async createMechanicmatchReview(reviewData: InsertMechanicmatchReview & { reviewerId?: string }): Promise<MechanicmatchReview> {
    if (!reviewData.reviewerId) {
      throw new ValidationError("reviewerId is required to create a review");
    }
    const [review] = await db
      .insert(mechanicmatchReviews)
      .values({
        ...reviewData,
        reviewerId: reviewData.reviewerId,
      })
      .returning();
    
    // Update average rating for reviewee profile
    const reviews = await this.getMechanicmatchReviewsByReviewee(review.revieweeId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await db
      .update(mechanicmatchProfiles)
      .set({ averageRating: avgRating.toString(), updatedAt: new Date() })
      .where(eq(mechanicmatchProfiles.id, review.revieweeId));
    
    return review;
  }

  async getMechanicmatchReviewById(id: string): Promise<MechanicmatchReview | undefined> {
    const [review] = await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.id, id));
    return review;
  }

  async getMechanicmatchReviewsByReviewee(revieweeId: string): Promise<MechanicmatchReview[]> {
    return await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.revieweeId, revieweeId))
      .orderBy(desc(mechanicmatchReviews.createdAt));
  }

  async getMechanicmatchReviewsByReviewer(reviewerId: string): Promise<MechanicmatchReview[]> {
    return await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.reviewerId, reviewerId))
      .orderBy(desc(mechanicmatchReviews.createdAt));
  }

  async getMechanicmatchReviewsByJob(jobId: string): Promise<MechanicmatchReview[]> {
    return await db
      .select()
      .from(mechanicmatchReviews)
      .where(eq(mechanicmatchReviews.jobId, jobId))
      .orderBy(desc(mechanicmatchReviews.createdAt));
  }

  // ========================================
  // MECHANICMATCH MESSAGE OPERATIONS
  // ========================================

  async createMechanicmatchMessage(messageData: InsertMechanicmatchMessage & { senderId?: string }): Promise<MechanicmatchMessage> {
    if (!messageData.senderId) {
      throw new ValidationError("senderId is required to create a message");
    }
    const [message] = await db
      .insert(mechanicmatchMessages)
      .values({
        ...messageData,
        senderId: messageData.senderId,
      })
      .returning();
    return message;
  }

  async getMechanicmatchMessagesByJob(jobId: string): Promise<MechanicmatchMessage[]> {
    return await db
      .select()
      .from(mechanicmatchMessages)
      .where(eq(mechanicmatchMessages.jobId, jobId))
      .orderBy(asc(mechanicmatchMessages.createdAt));
  }

  async getMechanicmatchMessagesBetweenUsers(userId1: string, userId2: string): Promise<MechanicmatchMessage[]> {
    return await db
      .select()
      .from(mechanicmatchMessages)
      .where(
        or(
          and(
            eq(mechanicmatchMessages.senderId, userId1),
            eq(mechanicmatchMessages.recipientId, userId2)
          ),
          and(
            eq(mechanicmatchMessages.senderId, userId2),
            eq(mechanicmatchMessages.recipientId, userId1)
          )
        )
      )
      .orderBy(asc(mechanicmatchMessages.createdAt));
  }

  async markMechanicmatchMessageAsRead(messageId: string, userId: string): Promise<MechanicmatchMessage> {
    const message = await db
      .select()
      .from(mechanicmatchMessages)
      .where(eq(mechanicmatchMessages.id, messageId));
    if (!message.length || message[0].recipientId !== userId) {
      throw new NotFoundError("Message");
    }
    const [updated] = await db
      .update(mechanicmatchMessages)
      .set({ isRead: true })
      .where(eq(mechanicmatchMessages.id, messageId))
      .returning();
    return updated;
  }

  async getUnreadMechanicmatchMessages(userId: string): Promise<MechanicmatchMessage[]> {
    return await db
      .select()
      .from(mechanicmatchMessages)
      .where(
        and(
          eq(mechanicmatchMessages.recipientId, userId),
          eq(mechanicmatchMessages.isRead, false)
        )
      )
      .orderBy(desc(mechanicmatchMessages.createdAt));
  }

  // ========================================
  // MECHANICMATCH SEARCH/MATCHING OPERATIONS
  // ========================================

  async searchMechanicmatchMechanics(filters: {
    city?: string;
    state?: string;
    isMobileMechanic?: boolean;
    specialties?: string[];
    maxHourlyRate?: number;
    minRating?: number;
    isAvailable?: boolean;
  }): Promise<MechanicmatchProfile[]> {
    let query = db
      .select()
      .from(mechanicmatchProfiles)
      .where(eq(mechanicmatchProfiles.isMechanic, true));

    // This is a simplified version - in production you'd want to build dynamic queries
    // For now, we'll filter in memory after fetching (not ideal for large datasets)
    const mechanics = await query;

    return mechanics.filter(mechanic => {
      if (filters.city && mechanic.city !== filters.city) return false;
      if (filters.state && mechanic.state !== filters.state) return false;
      if (filters.isMobileMechanic !== undefined && mechanic.isMobileMechanic !== filters.isMobileMechanic) return false;
      if (filters.maxHourlyRate && mechanic.hourlyRate && parseFloat(mechanic.hourlyRate) > filters.maxHourlyRate) return false;
      if (filters.minRating && mechanic.averageRating && parseFloat(mechanic.averageRating) < filters.minRating) return false;
      // Specialties and availability would need more complex logic
      return true;
    });
  }

  // ========================================
  // MECHANICMATCH ANNOUNCEMENT OPERATIONS
  // ========================================

  async createMechanicmatchAnnouncement(announcementData: InsertMechanicmatchAnnouncement): Promise<MechanicmatchAnnouncement> {
    const [announcement] = await db
      .insert(mechanicmatchAnnouncements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getActiveMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]> {
    const now = new Date();
    return await db
      .select()
      .from(mechanicmatchAnnouncements)
      .where(
        and(
          eq(mechanicmatchAnnouncements.isActive, true),
          or(
            sql`${mechanicmatchAnnouncements.expiresAt} IS NULL`,
            gte(mechanicmatchAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(desc(mechanicmatchAnnouncements.createdAt));
  }

  async getAllMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]> {
    return await db
      .select()
      .from(mechanicmatchAnnouncements)
      .orderBy(desc(mechanicmatchAnnouncements.createdAt));
  }

  async updateMechanicmatchAnnouncement(id: string, announcementData: Partial<InsertMechanicmatchAnnouncement>): Promise<MechanicmatchAnnouncement> {
    const [announcement] = await db
      .update(mechanicmatchAnnouncements)
      .set({
        ...announcementData,
        updatedAt: new Date(),
      })
      .where(eq(mechanicmatchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deactivateMechanicmatchAnnouncement(id: string): Promise<MechanicmatchAnnouncement> {
    const [announcement] = await db
      .update(mechanicmatchAnnouncements)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(mechanicmatchAnnouncements.id, id))
      .returning();
    return announcement;
  }

  async deleteMechanicmatchProfile(userId: string, reason?: string): Promise<void> {
    const profile = await this.getMechanicmatchProfile(userId);
    if (!profile) {
      throw new NotFoundError("MechanicMatch profile");
    }

    const anonymizedUserId = generateAnonymizedUserId();

    // Anonymize related data
    try {
      // Anonymize vehicles where user is owner
      await db
        .update(mechanicmatchVehicles)
        .set({ ownerId: anonymizedUserId })
        .where(eq(mechanicmatchVehicles.ownerId, userId));

      // Anonymize service requests where user is owner
      await db
        .update(mechanicmatchServiceRequests)
        .set({ ownerId: anonymizedUserId })
        .where(eq(mechanicmatchServiceRequests.ownerId, userId));

      // Anonymize jobs where user is owner or mechanic
      await db
        .update(mechanicmatchJobs)
        .set({ ownerId: anonymizedUserId })
        .where(eq(mechanicmatchJobs.ownerId, userId));
      await db
        .update(mechanicmatchJobs)
        .set({ mechanicId: anonymizedUserId })
        .where(eq(mechanicmatchJobs.mechanicId, userId));

      // Anonymize availability where user is mechanic
      await db
        .update(mechanicmatchAvailability)
        .set({ mechanicId: anonymizedUserId })
        .where(eq(mechanicmatchAvailability.mechanicId, userId));

      // Anonymize reviews where user is reviewer or reviewed
      await db
        .update(mechanicmatchReviews)
        .set({ reviewerId: anonymizedUserId })
        .where(eq(mechanicmatchReviews.reviewerId, userId));
      await db
        .update(mechanicmatchReviews)
        .set({ reviewedId: anonymizedUserId })
        .where(eq(mechanicmatchReviews.reviewedId, userId));

      // Anonymize messages where user is sender or recipient
      await db
        .update(mechanicmatchMessages)
        .set({ senderId: anonymizedUserId })
        .where(eq(mechanicmatchMessages.senderId, userId));
      await db
        .update(mechanicmatchMessages)
        .set({ recipientId: anonymizedUserId })
        .where(eq(mechanicmatchMessages.recipientId, userId));
    } catch (error: any) {
      console.warn(`Failed to anonymize MechanicMatch related data: ${error.message}`);
    }

    // Delete the profile
    await db.delete(mechanicmatchProfiles).where(eq(mechanicmatchProfiles.userId, userId));

    // Log the deletion
    await logProfileDeletion(userId, "mechanicmatch", reason);
  }
}

