/**
 * Mini-Apps Storage Composed
 * 
 * Handles delegation of mini-app storage operations.
 * This is a partial implementation - the main DatabaseStorage class will compose this.
 */

import type { ISupportMatchStorage } from '../types/supportmatch-storage.interface';
import type { ILighthouseStorage } from '../types/lighthouse-storage.interface';
import type { IMechanicMatchStorage } from '../types/mechanicmatch-storage.interface';
import type { ISocketRelayStorage } from '../types/socketrelay-storage.interface';
import type { IDirectoryStorage } from '../types/directory-storage.interface';
import type { ISkillsStorage } from '../types/skills-storage.interface';

import { SupportMatchStorage } from '../mini-apps';
import { LighthouseStorage } from '../mini-apps';
import { MechanicMatchStorage } from '../mini-apps';
import { SocketRelayStorage } from '../mini-apps';
import { DirectoryStorage } from '../mini-apps';
import { SkillsStorage } from '../mini-apps';

export class MiniAppsStorageComposed 
  implements ISupportMatchStorage, ILighthouseStorage, IMechanicMatchStorage, ISocketRelayStorage, IDirectoryStorage, ISkillsStorage {
  
  private supportMatchStorage: SupportMatchStorage;
  private lighthouseStorage: LighthouseStorage;
  private mechanicMatchStorage: MechanicMatchStorage;
  private socketRelayStorage: SocketRelayStorage;
  private directoryStorage: DirectoryStorage;
  private skillsStorage: SkillsStorage;

  constructor() {
    this.supportMatchStorage = new SupportMatchStorage();
    this.lighthouseStorage = new LighthouseStorage();
    this.mechanicMatchStorage = new MechanicMatchStorage();
    this.socketRelayStorage = new SocketRelayStorage();
    this.directoryStorage = new DirectoryStorage();
    this.skillsStorage = new SkillsStorage();
  }

  // ========================================
  // SUPPORTMATCH OPERATIONS
  // ========================================

  async getSupportMatchProfile(userId: string) {
    return this.supportMatchStorage.getSupportMatchProfile(userId);
  }

  async createSupportMatchProfile(profile: any) {
    return this.supportMatchStorage.createSupportMatchProfile(profile);
  }

  async updateSupportMatchProfile(userId: string, profile: any) {
    return this.supportMatchStorage.updateSupportMatchProfile(userId, profile);
  }

  async getAllActiveSupportMatchProfiles() {
    return this.supportMatchStorage.getAllActiveSupportMatchProfiles();
  }

  async getAllSupportMatchProfiles() {
    return this.supportMatchStorage.getAllSupportMatchProfiles();
  }

  async createPartnership(partnership: any) {
    return this.supportMatchStorage.createPartnership(partnership);
  }

  async getPartnershipById(id: string) {
    return this.supportMatchStorage.getPartnershipById(id);
  }

  async getActivePartnershipByUser(userId: string) {
    return this.supportMatchStorage.getActivePartnershipByUser(userId);
  }

  async getAllPartnerships() {
    return this.supportMatchStorage.getAllPartnerships();
  }

  async getPartnershipHistory(userId: string) {
    return this.supportMatchStorage.getPartnershipHistory(userId);
  }

  async updatePartnershipStatus(id: string, status: string) {
    return this.supportMatchStorage.updatePartnershipStatus(id, status);
  }

  async createAlgorithmicMatches() {
    return this.supportMatchStorage.createAlgorithmicMatches();
  }

  async createMessage(message: any) {
    return this.supportMatchStorage.createMessage(message);
  }

  async getMessagesByPartnership(partnershipId: string) {
    return this.supportMatchStorage.getMessagesByPartnership(partnershipId);
  }

  async createExclusion(exclusion: any) {
    return this.supportMatchStorage.createExclusion(exclusion);
  }

  async getExclusionsByUser(userId: string) {
    return this.supportMatchStorage.getExclusionsByUser(userId);
  }

  async checkMutualExclusion(user1Id: string, user2Id: string) {
    return this.supportMatchStorage.checkMutualExclusion(user1Id, user2Id);
  }

  async deleteExclusion(id: string) {
    return this.supportMatchStorage.deleteExclusion(id);
  }

  async createReport(report: any) {
    return this.supportMatchStorage.createReport(report);
  }

  async getAllReports() {
    return this.supportMatchStorage.getAllReports();
  }

  async updateReportStatus(id: string, status: string, resolution?: string) {
    return this.supportMatchStorage.updateReportStatus(id, status, resolution);
  }

  async createAnnouncement(announcement: any) {
    return this.supportMatchStorage.createAnnouncement(announcement);
  }

  async getActiveAnnouncements() {
    return this.supportMatchStorage.getActiveAnnouncements();
  }

  async getAllAnnouncements() {
    return this.supportMatchStorage.getAllAnnouncements();
  }

  async updateAnnouncement(id: string, announcement: any) {
    return this.supportMatchStorage.updateAnnouncement(id, announcement);
  }

  async deactivateAnnouncement(id: string) {
    return this.supportMatchStorage.deactivateAnnouncement(id);
  }

  async createSupportmatchAnnouncement(announcement: any) {
    return this.supportMatchStorage.createSupportmatchAnnouncement(announcement);
  }

  async getActiveSupportmatchAnnouncements() {
    return this.supportMatchStorage.getActiveSupportmatchAnnouncements();
  }

  async getAllSupportmatchAnnouncements() {
    return this.supportMatchStorage.getAllSupportmatchAnnouncements();
  }

  async updateSupportmatchAnnouncement(id: string, announcement: any) {
    return this.supportMatchStorage.updateSupportmatchAnnouncement(id, announcement);
  }

  async deactivateSupportmatchAnnouncement(id: string) {
    return this.supportMatchStorage.deactivateSupportmatchAnnouncement(id);
  }

  async getSupportMatchStats() {
    return this.supportMatchStorage.getSupportMatchStats();
  }

  async deleteSupportMatchProfile(userId: string, reason?: string) {
    return this.supportMatchStorage.deleteSupportMatchProfile(userId, reason);
  }

  // ========================================
  // LIGHTHOUSE OPERATIONS
  // ========================================

  async createLighthouseProfile(profile: any) {
    return this.lighthouseStorage.createLighthouseProfile(profile);
  }

  async getLighthouseProfileByUserId(userId: string) {
    return this.lighthouseStorage.getLighthouseProfileByUserId(userId);
  }

  async getLighthouseProfileById(id: string) {
    return this.lighthouseStorage.getLighthouseProfileById(id);
  }

  async updateLighthouseProfile(id: string, profile: any) {
    return this.lighthouseStorage.updateLighthouseProfile(id, profile);
  }

  async getAllLighthouseProfiles() {
    return this.lighthouseStorage.getAllLighthouseProfiles();
  }

  async getLighthouseProfilesByType(profileType: string) {
    return this.lighthouseStorage.getLighthouseProfilesByType(profileType);
  }

  async createLighthouseProperty(property: any) {
    return this.lighthouseStorage.createLighthouseProperty(property);
  }

  async getLighthousePropertyById(id: string) {
    return this.lighthouseStorage.getLighthousePropertyById(id);
  }

  async getPropertiesByHost(hostId: string) {
    return this.lighthouseStorage.getPropertiesByHost(hostId);
  }

  async getAllActiveProperties() {
    return this.lighthouseStorage.getAllActiveProperties();
  }

  async getAllProperties() {
    return this.lighthouseStorage.getAllProperties();
  }

  async updateLighthouseProperty(id: string, property: any) {
    return this.lighthouseStorage.updateLighthouseProperty(id, property);
  }

  async deleteLighthouseProperty(id: string) {
    return this.lighthouseStorage.deleteLighthouseProperty(id);
  }

  async createLighthouseMatch(match: any) {
    return this.lighthouseStorage.createLighthouseMatch(match);
  }

  async getLighthouseMatchById(id: string) {
    return this.lighthouseStorage.getLighthouseMatchById(id);
  }

  async getMatchesBySeeker(seekerId: string) {
    return this.lighthouseStorage.getMatchesBySeeker(seekerId);
  }

  async getMatchesByProperty(propertyId: string) {
    return this.lighthouseStorage.getMatchesByProperty(propertyId);
  }

  async getAllMatches() {
    return this.lighthouseStorage.getAllMatches();
  }

  async getMatchesByProfile(profileId: string) {
    return this.lighthouseStorage.getMatchesByProfile(profileId);
  }

  async getAllLighthouseMatches() {
    return this.lighthouseStorage.getAllLighthouseMatches();
  }

  async updateLighthouseMatch(id: string, match: any) {
    return this.lighthouseStorage.updateLighthouseMatch(id, match);
  }

  async getLighthouseStats() {
    return this.lighthouseStorage.getLighthouseStats();
  }

  async createLighthouseAnnouncement(announcement: any) {
    return this.lighthouseStorage.createLighthouseAnnouncement(announcement);
  }

  async getActiveLighthouseAnnouncements() {
    return this.lighthouseStorage.getActiveLighthouseAnnouncements();
  }

  async getAllLighthouseAnnouncements() {
    return this.lighthouseStorage.getAllLighthouseAnnouncements();
  }

  async updateLighthouseAnnouncement(id: string, announcement: any) {
    return this.lighthouseStorage.updateLighthouseAnnouncement(id, announcement);
  }

  async deactivateLighthouseAnnouncement(id: string) {
    return this.lighthouseStorage.deactivateLighthouseAnnouncement(id);
  }

  async createLighthouseBlock(block: any) {
    return this.lighthouseStorage.createLighthouseBlock(block);
  }

  async getLighthouseBlocksByUser(userId: string) {
    return this.lighthouseStorage.getLighthouseBlocksByUser(userId);
  }

  async checkLighthouseBlock(userId: string, blockedUserId: string) {
    return this.lighthouseStorage.checkLighthouseBlock(userId, blockedUserId);
  }

  async deleteLighthouseBlock(id: string) {
    return this.lighthouseStorage.deleteLighthouseBlock(id);
  }

  async deleteLighthouseProfile(userId: string, reason?: string) {
    return this.lighthouseStorage.deleteLighthouseProfile(userId, reason);
  }

  // ========================================
  // MECHANICMATCH OPERATIONS
  // ========================================

  async getMechanicmatchProfile(userId: string) {
    return this.mechanicMatchStorage.getMechanicmatchProfile(userId);
  }

  async getMechanicmatchProfileById(profileId: string) {
    return this.mechanicMatchStorage.getMechanicmatchProfileById(profileId);
  }

  async listMechanicmatchProfiles(filters?: any) {
    return this.mechanicMatchStorage.listMechanicmatchProfiles(filters);
  }

  async listPublicMechanicmatchProfiles() {
    return this.mechanicMatchStorage.listPublicMechanicmatchProfiles();
  }

  async createMechanicmatchProfile(profile: any) {
    return this.mechanicMatchStorage.createMechanicmatchProfile(profile);
  }

  async updateMechanicmatchProfile(userId: string, profile: any) {
    return this.mechanicMatchStorage.updateMechanicmatchProfile(userId, profile);
  }

  async updateMechanicmatchProfileById(profileId: string, profile: any) {
    return this.mechanicMatchStorage.updateMechanicmatchProfileById(profileId, profile);
  }

  async deleteMechanicmatchProfile(userId: string, reason?: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchProfile(userId, reason);
  }

  async deleteMechanicmatchProfileById(profileId: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchProfileById(profileId);
  }

  async getMechanicmatchVehiclesByOwner(ownerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchVehiclesByOwner(ownerId);
  }

  async getMechanicmatchVehicleById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchVehicleById(id);
  }

  async createMechanicmatchVehicle(vehicle: any) {
    return this.mechanicMatchStorage.createMechanicmatchVehicle(vehicle);
  }

  async updateMechanicmatchVehicle(id: string, vehicle: any) {
    return this.mechanicMatchStorage.updateMechanicmatchVehicle(id, vehicle);
  }

  async deleteMechanicmatchVehicle(id: string, ownerId: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchVehicle(id, ownerId);
  }

  async createMechanicmatchServiceRequest(request: any) {
    return this.mechanicMatchStorage.createMechanicmatchServiceRequest(request);
  }

  async getMechanicmatchServiceRequestById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchServiceRequestById(id);
  }

  async getMechanicmatchServiceRequestsByOwner(ownerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchServiceRequestsByOwner(ownerId);
  }

  async getMechanicmatchServiceRequestsByOwnerPaginated(ownerId: string, limit: number, offset: number) {
    return this.mechanicMatchStorage.getMechanicmatchServiceRequestsByOwnerPaginated(ownerId, limit, offset);
  }

  async getOpenMechanicmatchServiceRequests() {
    return this.mechanicMatchStorage.getOpenMechanicmatchServiceRequests();
  }

  async updateMechanicmatchServiceRequest(id: string, request: any) {
    return this.mechanicMatchStorage.updateMechanicmatchServiceRequest(id, request);
  }

  async createMechanicmatchJob(job: any) {
    return this.mechanicMatchStorage.createMechanicmatchJob(job);
  }

  async getMechanicmatchJobById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchJobById(id);
  }

  async getMechanicmatchJobsByOwner(ownerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchJobsByOwner(ownerId);
  }

  async getMechanicmatchJobsByMechanic(mechanicId: string) {
    return this.mechanicMatchStorage.getMechanicmatchJobsByMechanic(mechanicId);
  }

  async updateMechanicmatchJob(id: string, job: any) {
    return this.mechanicMatchStorage.updateMechanicmatchJob(id, job);
  }

  async acceptMechanicmatchJob(jobId: string, mechanicId: string) {
    return this.mechanicMatchStorage.acceptMechanicmatchJob(jobId, mechanicId);
  }

  async getMechanicmatchAvailabilityByMechanic(mechanicId: string) {
    return this.mechanicMatchStorage.getMechanicmatchAvailabilityByMechanic(mechanicId);
  }

  async createMechanicmatchAvailability(availability: any) {
    return this.mechanicMatchStorage.createMechanicmatchAvailability(availability);
  }

  async updateMechanicmatchAvailability(id: string, availability: any) {
    return this.mechanicMatchStorage.updateMechanicmatchAvailability(id, availability);
  }

  async deleteMechanicmatchAvailability(id: string, mechanicId: string) {
    return this.mechanicMatchStorage.deleteMechanicmatchAvailability(id, mechanicId);
  }

  async createMechanicmatchReview(review: any) {
    return this.mechanicMatchStorage.createMechanicmatchReview(review);
  }

  async getMechanicmatchReviewById(id: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewById(id);
  }

  async getMechanicmatchReviewsByReviewee(revieweeId: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewsByReviewee(revieweeId);
  }

  async getMechanicmatchReviewsByReviewer(reviewerId: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewsByReviewer(reviewerId);
  }

  async getMechanicmatchReviewsByJob(jobId: string) {
    return this.mechanicMatchStorage.getMechanicmatchReviewsByJob(jobId);
  }

  async createMechanicmatchMessage(message: any) {
    return this.mechanicMatchStorage.createMechanicmatchMessage(message);
  }

  async getMechanicmatchMessagesByJob(jobId: string) {
    return this.mechanicMatchStorage.getMechanicmatchMessagesByJob(jobId);
  }

  async getMechanicmatchMessagesBetweenUsers(userId1: string, userId2: string) {
    return this.mechanicMatchStorage.getMechanicmatchMessagesBetweenUsers(userId1, userId2);
  }

  async markMechanicmatchMessageAsRead(messageId: string, userId: string) {
    return this.mechanicMatchStorage.markMechanicmatchMessageAsRead(messageId, userId);
  }

  async getUnreadMechanicmatchMessages(userId: string) {
    return this.mechanicMatchStorage.getUnreadMechanicmatchMessages(userId);
  }

  async searchMechanicmatchMechanics(filters: any) {
    return this.mechanicMatchStorage.searchMechanicmatchMechanics(filters);
  }

  async createMechanicmatchAnnouncement(announcement: any) {
    return this.mechanicMatchStorage.createMechanicmatchAnnouncement(announcement);
  }

  async getActiveMechanicmatchAnnouncements() {
    return this.mechanicMatchStorage.getActiveMechanicmatchAnnouncements();
  }

  async getAllMechanicmatchAnnouncements() {
    return this.mechanicMatchStorage.getAllMechanicmatchAnnouncements();
  }

  async updateMechanicmatchAnnouncement(id: string, announcement: any) {
    return this.mechanicMatchStorage.updateMechanicmatchAnnouncement(id, announcement);
  }

  async deactivateMechanicmatchAnnouncement(id: string) {
    return this.mechanicMatchStorage.deactivateMechanicmatchAnnouncement(id);
  }

  // ========================================
  // SOCKETRELAY OPERATIONS
  // ========================================

  async createSocketrelayRequest(userId: string, description: string, isPublic?: boolean) {
    return this.socketRelayStorage.createSocketrelayRequest(userId, description, isPublic);
  }

  async getActiveSocketrelayRequests() {
    return this.socketRelayStorage.getActiveSocketrelayRequests();
  }

  async getAllSocketrelayRequests() {
    return this.socketRelayStorage.getAllSocketrelayRequests();
  }

  async getSocketrelayRequestById(id: string) {
    return this.socketRelayStorage.getSocketrelayRequestById(id);
  }

  async getSocketrelayRequestsByUser(userId: string) {
    return this.socketRelayStorage.getSocketrelayRequestsByUser(userId);
  }

  async getPublicSocketrelayRequestById(id: string) {
    return this.socketRelayStorage.getPublicSocketrelayRequestById(id);
  }

  async listPublicSocketrelayRequests() {
    return this.socketRelayStorage.listPublicSocketrelayRequests();
  }

  async updateSocketrelayRequest(id: string, userId: string, description: string, isPublic?: boolean) {
    return this.socketRelayStorage.updateSocketrelayRequest(id, userId, description, isPublic);
  }

  async updateSocketrelayRequestStatus(id: string, status: string) {
    return this.socketRelayStorage.updateSocketrelayRequestStatus(id, status);
  }

  async repostSocketrelayRequest(id: string, userId: string) {
    return this.socketRelayStorage.repostSocketrelayRequest(id, userId);
  }

  async deleteSocketrelayRequest(id: string) {
    return this.socketRelayStorage.deleteSocketrelayRequest(id);
  }

  async createSocketrelayFulfillment(requestId: string, fulfillerUserId: string) {
    return this.socketRelayStorage.createSocketrelayFulfillment(requestId, fulfillerUserId);
  }

  async getSocketrelayFulfillmentById(id: string) {
    return this.socketRelayStorage.getSocketrelayFulfillmentById(id);
  }

  async getSocketrelayFulfillmentsByRequest(requestId: string) {
    return this.socketRelayStorage.getSocketrelayFulfillmentsByRequest(requestId);
  }

  async getSocketrelayFulfillmentsByUser(userId: string) {
    return this.socketRelayStorage.getSocketrelayFulfillmentsByUser(userId);
  }

  async getAllSocketrelayFulfillments() {
    return this.socketRelayStorage.getAllSocketrelayFulfillments();
  }

  async closeSocketrelayFulfillment(id: string, userId: string, status: string) {
    return this.socketRelayStorage.closeSocketrelayFulfillment(id, userId, status);
  }

  async createSocketrelayMessage(message: any) {
    return this.socketRelayStorage.createSocketrelayMessage(message);
  }

  async getSocketrelayMessagesByFulfillment(fulfillmentId: string) {
    return this.socketRelayStorage.getSocketrelayMessagesByFulfillment(fulfillmentId);
  }

  async getSocketrelayProfile(userId: string) {
    return this.socketRelayStorage.getSocketrelayProfile(userId);
  }

  async createSocketrelayProfile(profile: any) {
    return this.socketRelayStorage.createSocketrelayProfile(profile);
  }

  async updateSocketrelayProfile(userId: string, profile: any) {
    return this.socketRelayStorage.updateSocketrelayProfile(userId, profile);
  }

  async createSocketrelayAnnouncement(announcement: any) {
    return this.socketRelayStorage.createSocketrelayAnnouncement(announcement);
  }

  async getActiveSocketrelayAnnouncements() {
    return this.socketRelayStorage.getActiveSocketrelayAnnouncements();
  }

  async getAllSocketrelayAnnouncements() {
    return this.socketRelayStorage.getAllSocketrelayAnnouncements();
  }

  async updateSocketrelayAnnouncement(id: string, announcement: any) {
    return this.socketRelayStorage.updateSocketrelayAnnouncement(id, announcement);
  }

  async deactivateSocketrelayAnnouncement(id: string) {
    return this.socketRelayStorage.deactivateSocketrelayAnnouncement(id);
  }

  async deleteSocketrelayProfile(userId: string, reason?: string) {
    return this.socketRelayStorage.deleteSocketrelayProfile(userId, reason);
  }

  // ========================================
  // DIRECTORY OPERATIONS
  // ========================================

  async getDirectoryProfileById(id: string) {
    return this.directoryStorage.getDirectoryProfileById(id);
  }

  async getDirectoryProfileByUserId(userId: string) {
    return this.directoryStorage.getDirectoryProfileByUserId(userId);
  }

  async listAllDirectoryProfiles() {
    return this.directoryStorage.listAllDirectoryProfiles();
  }

  async listPublicDirectoryProfiles() {
    return this.directoryStorage.listPublicDirectoryProfiles();
  }

  async createDirectoryProfile(profile: any) {
    return this.directoryStorage.createDirectoryProfile(profile);
  }

  async updateDirectoryProfile(id: string, profile: any) {
    return this.directoryStorage.updateDirectoryProfile(id, profile);
  }

  async deleteDirectoryProfile(id: string) {
    return this.directoryStorage.deleteDirectoryProfile(id);
  }

  async createDirectoryAnnouncement(announcement: any) {
    return this.directoryStorage.createDirectoryAnnouncement(announcement);
  }

  async getActiveDirectoryAnnouncements() {
    return this.directoryStorage.getActiveDirectoryAnnouncements();
  }

  async getAllDirectoryAnnouncements() {
    return this.directoryStorage.getAllDirectoryAnnouncements();
  }

  async updateDirectoryAnnouncement(id: string, announcement: any) {
    return this.directoryStorage.updateDirectoryAnnouncement(id, announcement);
  }

  async deactivateDirectoryAnnouncement(id: string) {
    return this.directoryStorage.deactivateDirectoryAnnouncement(id);
  }

  async getAllDirectorySkills() {
    return this.directoryStorage.getAllDirectorySkills();
  }

  async createDirectorySkill(skill: any) {
    return this.directoryStorage.createDirectorySkill(skill);
  }

  async deleteDirectorySkill(id: string) {
    return this.directoryStorage.deleteDirectorySkill(id);
  }

  async deleteDirectoryProfileWithCascade(userId: string, reason?: string) {
    return this.directoryStorage.deleteDirectoryProfileWithCascade(userId, reason);
  }

  // ========================================
  // SKILLS OPERATIONS (Shared)
  // ========================================

  async getAllSkillsSectors() {
    return this.skillsStorage.getAllSkillsSectors();
  }

  async getSkillsSectorById(id: string) {
    return this.skillsStorage.getSkillsSectorById(id);
  }

  async createSkillsSector(sector: any) {
    return this.skillsStorage.createSkillsSector(sector);
  }

  async updateSkillsSector(id: string, sector: any) {
    return this.skillsStorage.updateSkillsSector(id, sector);
  }

  async deleteSkillsSector(id: string) {
    return this.skillsStorage.deleteSkillsSector(id);
  }

  async getAllSkillsJobTitles(sectorId?: string) {
    return this.skillsStorage.getAllSkillsJobTitles(sectorId);
  }

  async getSkillsJobTitleById(id: string) {
    return this.skillsStorage.getSkillsJobTitleById(id);
  }

  async createSkillsJobTitle(jobTitle: any) {
    return this.skillsStorage.createSkillsJobTitle(jobTitle);
  }

  async updateSkillsJobTitle(id: string, jobTitle: any) {
    return this.skillsStorage.updateSkillsJobTitle(id, jobTitle);
  }

  async deleteSkillsJobTitle(id: string) {
    return this.skillsStorage.deleteSkillsJobTitle(id);
  }

  async getAllSkillsSkills(jobTitleId?: string) {
    return this.skillsStorage.getAllSkillsSkills(jobTitleId);
  }

  async getSkillsSkillById(id: string) {
    return this.skillsStorage.getSkillsSkillById(id);
  }

  async createSkillsSkill(skill: any) {
    return this.skillsStorage.createSkillsSkill(skill);
  }

  async updateSkillsSkill(id: string, skill: any) {
    return this.skillsStorage.updateSkillsSkill(id, skill);
  }

  async deleteSkillsSkill(id: string) {
    return this.skillsStorage.deleteSkillsSkill(id);
  }

  async getSkillsHierarchy() {
    return this.skillsStorage.getSkillsHierarchy();
  }

  async getAllSkillsFlattened() {
    return this.skillsStorage.getAllSkillsFlattened();
  }
}

