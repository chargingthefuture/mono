/**
 * MechanicMatch Storage Interface
 * 
 * Defines MechanicMatch mini-app storage operations.
 */

import type {
  MechanicmatchProfile,
  InsertMechanicmatchProfile,
  MechanicmatchVehicle,
  InsertMechanicmatchVehicle,
  MechanicmatchServiceRequest,
  InsertMechanicmatchServiceRequest,
  MechanicmatchJob,
  InsertMechanicmatchJob,
  MechanicmatchAvailability,
  InsertMechanicmatchAvailability,
  MechanicmatchReview,
  InsertMechanicmatchReview,
  MechanicmatchMessage,
  InsertMechanicmatchMessage,
  MechanicmatchAnnouncement,
  InsertMechanicmatchAnnouncement,
} from "@shared/schema";

export interface IMechanicMatchStorage {
  // Profile operations
  getMechanicmatchProfile(userId: string): Promise<MechanicmatchProfile | undefined>;
  getMechanicmatchProfileById(profileId: string): Promise<MechanicmatchProfile | undefined>;
  listMechanicmatchProfiles(filters?: {
    search?: string;
    role?: "mechanic" | "owner";
    isClaimed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MechanicmatchProfile[]; total: number }>;
  listPublicMechanicmatchProfiles(): Promise<MechanicmatchProfile[]>;
  createMechanicmatchProfile(profile: InsertMechanicmatchProfile): Promise<MechanicmatchProfile>;
  updateMechanicmatchProfile(userId: string, profile: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile>;
  updateMechanicmatchProfileById(profileId: string, profile: Partial<InsertMechanicmatchProfile>): Promise<MechanicmatchProfile>;
  deleteMechanicmatchProfile(userId: string, reason?: string): Promise<void>;
  deleteMechanicmatchProfileById(profileId: string): Promise<void>;

  // Vehicle operations
  getMechanicmatchVehiclesByOwner(ownerId: string): Promise<MechanicmatchVehicle[]>;
  getMechanicmatchVehicleById(id: string): Promise<MechanicmatchVehicle | undefined>;
  createMechanicmatchVehicle(vehicle: InsertMechanicmatchVehicle & { ownerId?: string }): Promise<MechanicmatchVehicle>;
  updateMechanicmatchVehicle(id: string, vehicle: Partial<InsertMechanicmatchVehicle>): Promise<MechanicmatchVehicle>;
  deleteMechanicmatchVehicle(id: string, ownerId: string): Promise<void>;

  // Service Request operations
  createMechanicmatchServiceRequest(request: InsertMechanicmatchServiceRequest & { ownerId?: string }): Promise<MechanicmatchServiceRequest>;
  getMechanicmatchServiceRequestById(id: string): Promise<MechanicmatchServiceRequest | undefined>;
  getMechanicmatchServiceRequestsByOwner(ownerId: string): Promise<MechanicmatchServiceRequest[]>;
  getMechanicmatchServiceRequestsByOwnerPaginated(
    ownerId: string,
    limit: number,
    offset: number
  ): Promise<{ items: MechanicmatchServiceRequest[]; total: number }>;
  getOpenMechanicmatchServiceRequests(): Promise<MechanicmatchServiceRequest[]>;
  updateMechanicmatchServiceRequest(id: string, request: Partial<InsertMechanicmatchServiceRequest>): Promise<MechanicmatchServiceRequest>;

  // Job operations
  createMechanicmatchJob(job: InsertMechanicmatchJob & { ownerId?: string }): Promise<MechanicmatchJob>;
  getMechanicmatchJobById(id: string): Promise<MechanicmatchJob | undefined>;
  getMechanicmatchJobsByOwner(ownerId: string): Promise<MechanicmatchJob[]>;
  getMechanicmatchJobsByMechanic(mechanicId: string): Promise<MechanicmatchJob[]>;
  updateMechanicmatchJob(id: string, job: Partial<InsertMechanicmatchJob>): Promise<MechanicmatchJob>;
  acceptMechanicmatchJob(jobId: string, mechanicId: string): Promise<MechanicmatchJob>;

  // Availability operations
  getMechanicmatchAvailabilityByMechanic(mechanicId: string): Promise<MechanicmatchAvailability[]>;
  createMechanicmatchAvailability(availability: InsertMechanicmatchAvailability): Promise<MechanicmatchAvailability>;
  updateMechanicmatchAvailability(id: string, availability: Partial<InsertMechanicmatchAvailability>): Promise<MechanicmatchAvailability>;
  deleteMechanicmatchAvailability(id: string, mechanicId: string): Promise<void>;

  // Review operations
  createMechanicmatchReview(review: InsertMechanicmatchReview & { reviewerId?: string }): Promise<MechanicmatchReview>;
  getMechanicmatchReviewById(id: string): Promise<MechanicmatchReview | undefined>;
  getMechanicmatchReviewsByReviewee(revieweeId: string): Promise<MechanicmatchReview[]>;
  getMechanicmatchReviewsByReviewer(reviewerId: string): Promise<MechanicmatchReview[]>;
  getMechanicmatchReviewsByJob(jobId: string): Promise<MechanicmatchReview[]>;

  // Message operations
  createMechanicmatchMessage(message: InsertMechanicmatchMessage & { senderId?: string }): Promise<MechanicmatchMessage>;
  getMechanicmatchMessagesByJob(jobId: string): Promise<MechanicmatchMessage[]>;
  getMechanicmatchMessagesBetweenUsers(userId1: string, userId2: string): Promise<MechanicmatchMessage[]>;
  markMechanicmatchMessageAsRead(messageId: string, userId: string): Promise<MechanicmatchMessage>;
  getUnreadMechanicmatchMessages(userId: string): Promise<MechanicmatchMessage[]>;

  // Search/Matching operations
  searchMechanicmatchMechanics(filters: {
    city?: string;
    state?: string;
    isMobileMechanic?: boolean;
    specialties?: string[];
    maxHourlyRate?: number;
    minRating?: number;
    isAvailable?: boolean;
  }): Promise<MechanicmatchProfile[]>;

  // Announcement operations
  createMechanicmatchAnnouncement(announcement: InsertMechanicmatchAnnouncement): Promise<MechanicmatchAnnouncement>;
  getActiveMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]>;
  getAllMechanicmatchAnnouncements(): Promise<MechanicmatchAnnouncement[]>;
  updateMechanicmatchAnnouncement(id: string, announcement: Partial<InsertMechanicmatchAnnouncement>): Promise<MechanicmatchAnnouncement>;
  deactivateMechanicmatchAnnouncement(id: string): Promise<MechanicmatchAnnouncement>;
}


