/**
 * Composed Storage Class
 * 
 * This class aggregates all storage modules (core and mini-apps) and implements
 * the IStorage interface. It delegates method calls to the appropriate modules.
 * 
 * REFACTORED: Now uses composed storage classes for better organization.
 * This maintains backward compatibility while allowing for modular code organization.
 */

import { IStorage } from './types';
import { CoreStorage } from './core';
import { CoreStorageComposed } from './composed/core-storage-composed';
import { MiniAppsStorageComposed } from './composed/mini-apps-storage-composed';

export class DatabaseStorage implements IStorage {
  // Composed storage modules (refactored)
  private coreStorageComposed: CoreStorageComposed;
  private miniAppsStorageComposed: MiniAppsStorageComposed;
  
  // Direct storage module reference (only for getWeeklyPerformanceReview which needs callbacks)
  private coreStorage: CoreStorage;

  constructor() {
    // Initialize composed storage modules
    this.coreStorageComposed = new CoreStorageComposed();
    this.miniAppsStorageComposed = new MiniAppsStorageComposed();
    
    // Initialize core storage (only needed for getWeeklyPerformanceReview callback)
    this.coreStorage = new CoreStorage();
  }

  // ========================================
  // CORE OPERATIONS (delegated to CoreStorageComposed)
  // ========================================

  // User operations
  async getUser(id: string) {
    return this.coreStorageComposed.getUser(id);
  }

  async upsertUser(user: any) {
    return this.coreStorageComposed.upsertUser(user);
  }

  async getAllUsers() {
    return this.coreStorageComposed.getAllUsers();
  }

  async updateUserVerification(userId: string, isVerified: boolean) {
    return this.coreStorageComposed.updateUserVerification(userId, isVerified);
  }

  async updateUserApproval(userId: string, isApproved: boolean) {
    return this.coreStorageComposed.updateUserApproval(userId, isApproved);
  }

  async updateTermsAcceptance(userId: string) {
    return this.coreStorageComposed.updateTermsAcceptance(userId);
  }

  async updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null) {
    return this.coreStorageComposed.updateUserQuoraProfileUrl(userId, quoraProfileUrl);
  }

  async updateUserName(userId: string, firstName: string | null, lastName: string | null) {
    return this.coreStorageComposed.updateUserName(userId, firstName, lastName);
  }

  // OTP code methods
  async createOTPCode(userId: string, code: string, expiresAt: Date) {
    return this.coreStorageComposed.createOTPCode(userId, code, expiresAt);
  }

  async findOTPCodeByCode(code: string) {
    return this.coreStorageComposed.findOTPCodeByCode(code);
  }

  async deleteOTPCode(userId: string) {
    return this.coreStorageComposed.deleteOTPCode(userId);
  }

  async deleteExpiredOTPCodes() {
    return this.coreStorageComposed.deleteExpiredOTPCodes();
  }

  // Auth token methods
  async createAuthToken(token: string, userId: string, expiresAt: Date) {
    return this.coreStorageComposed.createAuthToken(token, userId, expiresAt);
  }

  async findAuthTokenByToken(token: string) {
    return this.coreStorageComposed.findAuthTokenByToken(token);
  }

  async deleteAuthToken(token: string) {
    return this.coreStorageComposed.deleteAuthToken(token);
  }

  async deleteExpiredAuthTokens() {
    return this.coreStorageComposed.deleteExpiredAuthTokens();
  }

  // Pricing tier operations
  async getCurrentPricingTier() {
    return this.coreStorageComposed.getCurrentPricingTier();
  }

  async getAllPricingTiers() {
    return this.coreStorageComposed.getAllPricingTiers();
  }

  async createPricingTier(tier: any) {
    return this.coreStorageComposed.createPricingTier(tier);
  }

  async setCurrentPricingTier(id: string) {
    return this.coreStorageComposed.setCurrentPricingTier(id);
  }

  // Payment operations
  async createPayment(payment: any) {
    return this.coreStorageComposed.createPayment(payment);
  }

  async getPaymentsByUser(userId: string) {
    return this.coreStorageComposed.getPaymentsByUser(userId);
  }

  async getAllPayments() {
    return this.coreStorageComposed.getAllPayments();
  }

  async getUserPaymentStatus(userId: string) {
    return this.coreStorageComposed.getUserPaymentStatus(userId);
  }

  async getDelinquentUsers() {
    return this.coreStorageComposed.getDelinquentUsers();
  }

  // Admin action log operations
  async createAdminActionLog(log: any) {
    return this.coreStorageComposed.createAdminActionLog(log);
  }

  async getAllAdminActionLogs() {
    return this.coreStorageComposed.getAllAdminActionLogs();
  }

  // Weekly Performance Review
  async getWeeklyPerformanceReview(weekStart: Date) {
    return this.coreStorage.getWeeklyPerformanceReview(
      weekStart,
      (weekStart: Date, weekEnd: Date) => this.getNpsResponsesForWeek(weekStart, weekEnd),
      (weekStart: Date) => this.getDefaultAliveOrDeadEbitdaSnapshot(weekStart)
    );
  }

  // NPS operations
  async createNpsResponse(response: any) {
    return this.coreStorageComposed.createNpsResponse(response);
  }

  async getUserLastNpsResponse(userId: string) {
    return this.coreStorageComposed.getUserLastNpsResponse(userId);
  }

  async getNpsResponsesForWeek(weekStart: Date, weekEnd: Date) {
    return this.coreStorageComposed.getNpsResponsesForWeek(weekStart, weekEnd);
  }

  async getAllNpsResponses() {
    return this.coreStorageComposed.getAllNpsResponses();
  }

  // ========================================
  // SUPPORTMATCH OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async getSupportMatchProfile(userId: string) {
    return this.miniAppsStorageComposed.getSupportMatchProfile(userId);
  }

  async createSupportMatchProfile(profile: any) {
    return this.miniAppsStorageComposed.createSupportMatchProfile(profile);
  }

  async updateSupportMatchProfile(userId: string, profile: any) {
    return this.miniAppsStorageComposed.updateSupportMatchProfile(userId, profile);
  }

  async getAllActiveSupportMatchProfiles() {
    return this.miniAppsStorageComposed.getAllActiveSupportMatchProfiles();
  }

  async getAllSupportMatchProfiles() {
    return this.miniAppsStorageComposed.getAllSupportMatchProfiles();
  }

  async createPartnership(partnership: any) {
    return this.miniAppsStorageComposed.createPartnership(partnership);
  }

  async getPartnershipById(id: string) {
    return this.miniAppsStorageComposed.getPartnershipById(id);
  }

  async getActivePartnershipByUser(userId: string) {
    return this.miniAppsStorageComposed.getActivePartnershipByUser(userId);
  }

  async getAllPartnerships() {
    return this.miniAppsStorageComposed.getAllPartnerships();
  }

  async getPartnershipHistory(userId: string) {
    return this.miniAppsStorageComposed.getPartnershipHistory(userId);
  }

  async updatePartnershipStatus(id: string, status: string) {
    return this.miniAppsStorageComposed.updatePartnershipStatus(id, status);
  }

  async createAlgorithmicMatches() {
    return this.miniAppsStorageComposed.createAlgorithmicMatches();
  }

  async createMessage(message: any) {
    return this.miniAppsStorageComposed.createMessage(message);
  }

  async getMessagesByPartnership(partnershipId: string) {
    return this.miniAppsStorageComposed.getMessagesByPartnership(partnershipId);
  }

  async createExclusion(exclusion: any) {
    return this.miniAppsStorageComposed.createExclusion(exclusion);
  }

  async getExclusionsByUser(userId: string) {
    return this.miniAppsStorageComposed.getExclusionsByUser(userId);
  }

  async checkMutualExclusion(user1Id: string, user2Id: string) {
    return this.miniAppsStorageComposed.checkMutualExclusion(user1Id, user2Id);
  }

  async deleteExclusion(id: string) {
    return this.miniAppsStorageComposed.deleteExclusion(id);
  }

  async createReport(report: any) {
    return this.miniAppsStorageComposed.createReport(report);
  }

  async getAllReports() {
    return this.miniAppsStorageComposed.getAllReports();
  }

  async updateReportStatus(id: string, status: string, resolution?: string) {
    return this.miniAppsStorageComposed.updateReportStatus(id, status, resolution);
  }

  async createAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createAnnouncement(announcement);
  }

  async getActiveAnnouncements() {
    return this.miniAppsStorageComposed.getActiveAnnouncements();
  }

  async getAllAnnouncements() {
    return this.miniAppsStorageComposed.getAllAnnouncements();
  }

  async updateAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateAnnouncement(id, announcement);
  }

  async deactivateAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateAnnouncement(id);
  }

  async createSupportmatchAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createSupportmatchAnnouncement(announcement);
  }

  async getActiveSupportmatchAnnouncements() {
    return this.miniAppsStorageComposed.getActiveSupportmatchAnnouncements();
  }

  async getAllSupportmatchAnnouncements() {
    return this.miniAppsStorageComposed.getAllSupportmatchAnnouncements();
  }

  async updateSupportmatchAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateSupportmatchAnnouncement(id, announcement);
  }

  async deactivateSupportmatchAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateSupportmatchAnnouncement(id);
  }

  async getSupportMatchStats() {
    return this.miniAppsStorageComposed.getSupportMatchStats();
  }

  // ========================================
  // LIGHTHOUSE OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createLighthouseProfile(profile: any) {
    return this.miniAppsStorageComposed.createLighthouseProfile(profile);
  }

  async getLighthouseProfileByUserId(userId: string) {
    return this.miniAppsStorageComposed.getLighthouseProfileByUserId(userId);
  }

  async getLighthouseProfileById(id: string) {
    return this.miniAppsStorageComposed.getLighthouseProfileById(id);
  }

  async updateLighthouseProfile(id: string, profile: any) {
    return this.miniAppsStorageComposed.updateLighthouseProfile(id, profile);
  }

  async getAllLighthouseProfiles() {
    return this.miniAppsStorageComposed.getAllLighthouseProfiles();
  }

  async getLighthouseProfilesByType(profileType: string) {
    return this.miniAppsStorageComposed.getLighthouseProfilesByType(profileType);
  }

  async createLighthouseProperty(property: any) {
    return this.miniAppsStorageComposed.createLighthouseProperty(property);
  }

  async getLighthousePropertyById(id: string) {
    return this.miniAppsStorageComposed.getLighthousePropertyById(id);
  }

  async getPropertiesByHost(hostId: string) {
    return this.miniAppsStorageComposed.getPropertiesByHost(hostId);
  }

  async getAllActiveProperties() {
    return this.miniAppsStorageComposed.getAllActiveProperties();
  }

  async getAllProperties() {
    return this.miniAppsStorageComposed.getAllProperties();
  }

  async updateLighthouseProperty(id: string, property: any) {
    return this.miniAppsStorageComposed.updateLighthouseProperty(id, property);
  }

  async deleteLighthouseProperty(id: string) {
    return this.miniAppsStorageComposed.deleteLighthouseProperty(id);
  }

  async createLighthouseMatch(match: any) {
    return this.miniAppsStorageComposed.createLighthouseMatch(match);
  }

  async getLighthouseMatchById(id: string) {
    return this.miniAppsStorageComposed.getLighthouseMatchById(id);
  }

  async getMatchesBySeeker(seekerId: string) {
    return this.miniAppsStorageComposed.getMatchesBySeeker(seekerId);
  }

  async getMatchesByProperty(propertyId: string) {
    return this.miniAppsStorageComposed.getMatchesByProperty(propertyId);
  }

  async getAllMatches() {
    return this.miniAppsStorageComposed.getAllMatches();
  }

  async getMatchesByProfile(profileId: string) {
    // This method is not in the interface, delegating directly
    const { LighthouseStorage } = await import('./mini-apps');
    const lighthouseStorage = new LighthouseStorage();
    return lighthouseStorage.getMatchesByProfile(profileId);
  }

  async getAllLighthouseMatches() {
    return this.miniAppsStorageComposed.getAllLighthouseMatches();
  }

  async updateLighthouseMatch(id: string, match: any) {
    return this.miniAppsStorageComposed.updateLighthouseMatch(id, match);
  }

  async getLighthouseStats() {
    return this.miniAppsStorageComposed.getLighthouseStats();
  }

  async createLighthouseAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createLighthouseAnnouncement(announcement);
  }

  async getActiveLighthouseAnnouncements() {
    return this.miniAppsStorageComposed.getActiveLighthouseAnnouncements();
  }

  async getAllLighthouseAnnouncements() {
    return this.miniAppsStorageComposed.getAllLighthouseAnnouncements();
  }

  async updateLighthouseAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateLighthouseAnnouncement(id, announcement);
  }

  async deactivateLighthouseAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateLighthouseAnnouncement(id);
  }

  async createLighthouseBlock(block: any) {
    return this.miniAppsStorageComposed.createLighthouseBlock(block);
  }

  async getLighthouseBlocksByUser(userId: string) {
    return this.miniAppsStorageComposed.getLighthouseBlocksByUser(userId);
  }

  async checkLighthouseBlock(userId: string, blockedUserId: string) {
    return this.miniAppsStorageComposed.checkLighthouseBlock(userId, blockedUserId);
  }

  async deleteLighthouseBlock(id: string) {
    return this.miniAppsStorageComposed.deleteLighthouseBlock(id);
  }

  // ========================================
  // SOCKETRELAY OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createSocketrelayRequest(userId: string, description: string, isPublic?: boolean) {
    return this.miniAppsStorageComposed.createSocketrelayRequest(userId, description, isPublic);
  }

  async getActiveSocketrelayRequests() {
    return this.miniAppsStorageComposed.getActiveSocketrelayRequests();
  }

  async getAllSocketrelayRequests() {
    return this.miniAppsStorageComposed.getAllSocketrelayRequests();
  }

  async getSocketrelayRequestById(id: string) {
    return this.miniAppsStorageComposed.getSocketrelayRequestById(id);
  }

  async getSocketrelayRequestsByUser(userId: string) {
    return this.miniAppsStorageComposed.getSocketrelayRequestsByUser(userId);
  }

  async getPublicSocketrelayRequestById(id: string) {
    return this.miniAppsStorageComposed.getPublicSocketrelayRequestById(id);
  }

  async listPublicSocketrelayRequests() {
    return this.miniAppsStorageComposed.listPublicSocketrelayRequests();
  }

  async updateSocketrelayRequest(id: string, userId: string, description: string, isPublic?: boolean) {
    return this.miniAppsStorageComposed.updateSocketrelayRequest(id, userId, description, isPublic);
  }

  async updateSocketrelayRequestStatus(id: string, status: string) {
    return this.miniAppsStorageComposed.updateSocketrelayRequestStatus(id, status);
  }

  async repostSocketrelayRequest(id: string, userId: string) {
    return this.miniAppsStorageComposed.repostSocketrelayRequest(id, userId);
  }

  async deleteSocketrelayRequest(id: string) {
    return this.miniAppsStorageComposed.deleteSocketrelayRequest(id);
  }

  async createSocketrelayFulfillment(requestId: string, fulfillerUserId: string) {
    return this.miniAppsStorageComposed.createSocketrelayFulfillment(requestId, fulfillerUserId);
  }

  async getSocketrelayFulfillmentById(id: string) {
    return this.miniAppsStorageComposed.getSocketrelayFulfillmentById(id);
  }

  async getSocketrelayFulfillmentsByRequest(requestId: string) {
    return this.miniAppsStorageComposed.getSocketrelayFulfillmentsByRequest(requestId);
  }

  async getSocketrelayFulfillmentsByUser(userId: string) {
    return this.miniAppsStorageComposed.getSocketrelayFulfillmentsByUser(userId);
  }

  async getAllSocketrelayFulfillments() {
    return this.miniAppsStorageComposed.getAllSocketrelayFulfillments();
  }

  async closeSocketrelayFulfillment(id: string, userId: string, status: string) {
    return this.miniAppsStorageComposed.closeSocketrelayFulfillment(id, userId, status);
  }

  async createSocketrelayMessage(message: any) {
    return this.miniAppsStorageComposed.createSocketrelayMessage(message);
  }

  async getSocketrelayMessagesByFulfillment(fulfillmentId: string) {
    return this.miniAppsStorageComposed.getSocketrelayMessagesByFulfillment(fulfillmentId);
  }

  async getSocketrelayProfile(userId: string) {
    return this.miniAppsStorageComposed.getSocketrelayProfile(userId);
  }

  async createSocketrelayProfile(profile: any) {
    return this.miniAppsStorageComposed.createSocketrelayProfile(profile);
  }

  async updateSocketrelayProfile(userId: string, profile: any) {
    return this.miniAppsStorageComposed.updateSocketrelayProfile(userId, profile);
  }

  async createSocketrelayAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createSocketrelayAnnouncement(announcement);
  }

  async getActiveSocketrelayAnnouncements() {
    return this.miniAppsStorageComposed.getActiveSocketrelayAnnouncements();
  }

  async getAllSocketrelayAnnouncements() {
    return this.miniAppsStorageComposed.getAllSocketrelayAnnouncements();
  }

  async updateSocketrelayAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateSocketrelayAnnouncement(id, announcement);
  }

  async deactivateSocketrelayAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateSocketrelayAnnouncement(id);
  }

  // ========================================
  // DIRECTORY OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async getDirectoryProfileById(id: string) {
    return this.miniAppsStorageComposed.getDirectoryProfileById(id);
  }

  async getDirectoryProfileByUserId(userId: string) {
    return this.miniAppsStorageComposed.getDirectoryProfileByUserId(userId);
  }

  async listAllDirectoryProfiles() {
    return this.miniAppsStorageComposed.listAllDirectoryProfiles();
  }

  async listPublicDirectoryProfiles() {
    return this.miniAppsStorageComposed.listPublicDirectoryProfiles();
  }

  async createDirectoryProfile(profile: any) {
    return this.miniAppsStorageComposed.createDirectoryProfile(profile);
  }

  async updateDirectoryProfile(id: string, profile: any) {
    return this.miniAppsStorageComposed.updateDirectoryProfile(id, profile);
  }

  async deleteDirectoryProfile(id: string) {
    return this.miniAppsStorageComposed.deleteDirectoryProfile(id);
  }

  async createDirectoryAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createDirectoryAnnouncement(announcement);
  }

  async getActiveDirectoryAnnouncements() {
    return this.miniAppsStorageComposed.getActiveDirectoryAnnouncements();
  }

  async getAllDirectoryAnnouncements() {
    return this.miniAppsStorageComposed.getAllDirectoryAnnouncements();
  }

  async updateDirectoryAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateDirectoryAnnouncement(id, announcement);
  }

  async deactivateDirectoryAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateDirectoryAnnouncement(id);
  }

  async getAllDirectorySkills() {
    return this.miniAppsStorageComposed.getAllDirectorySkills();
  }

  async createDirectorySkill(skill: any) {
    return this.miniAppsStorageComposed.createDirectorySkill(skill);
  }

  async deleteDirectorySkill(id: string) {
    return this.miniAppsStorageComposed.deleteDirectorySkill(id);
  }

  // ========================================
  // SKILLS OPERATIONS (Shared) (delegated to MiniAppsStorageComposed)
  // ========================================

  async getAllSkillsSectors() {
    return this.miniAppsStorageComposed.getAllSkillsSectors();
  }

  async getSkillsSectorById(id: string) {
    return this.miniAppsStorageComposed.getSkillsSectorById(id);
  }

  async createSkillsSector(sector: any) {
    return this.miniAppsStorageComposed.createSkillsSector(sector);
  }

  async updateSkillsSector(id: string, sector: any) {
    return this.miniAppsStorageComposed.updateSkillsSector(id, sector);
  }

  async deleteSkillsSector(id: string) {
    return this.miniAppsStorageComposed.deleteSkillsSector(id);
  }

  async getAllSkillsJobTitles(sectorId?: string) {
    return this.miniAppsStorageComposed.getAllSkillsJobTitles(sectorId);
  }

  async getSkillsJobTitleById(id: string) {
    return this.miniAppsStorageComposed.getSkillsJobTitleById(id);
  }

  async createSkillsJobTitle(jobTitle: any) {
    return this.miniAppsStorageComposed.createSkillsJobTitle(jobTitle);
  }

  async updateSkillsJobTitle(id: string, jobTitle: any) {
    return this.miniAppsStorageComposed.updateSkillsJobTitle(id, jobTitle);
  }

  async deleteSkillsJobTitle(id: string) {
    return this.miniAppsStorageComposed.deleteSkillsJobTitle(id);
  }

  async getAllSkillsSkills(jobTitleId?: string) {
    return this.miniAppsStorageComposed.getAllSkillsSkills(jobTitleId);
  }

  async getSkillsSkillById(id: string) {
    return this.miniAppsStorageComposed.getSkillsSkillById(id);
  }

  async createSkillsSkill(skill: any) {
    return this.miniAppsStorageComposed.createSkillsSkill(skill);
  }

  async updateSkillsSkill(id: string, skill: any) {
    return this.miniAppsStorageComposed.updateSkillsSkill(id, skill);
  }

  async deleteSkillsSkill(id: string) {
    return this.miniAppsStorageComposed.deleteSkillsSkill(id);
  }

  async getSkillsHierarchy() {
    return this.miniAppsStorageComposed.getSkillsHierarchy();
  }

  async getAllSkillsFlattened() {
    return this.miniAppsStorageComposed.getAllSkillsFlattened();
  }

  // ========================================
  // CHATGROUPS OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async getAllChatGroups() {
    return this.miniAppsStorageComposed.getAllChatGroups();
  }

  async getActiveChatGroups() {
    return this.miniAppsStorageComposed.getActiveChatGroups();
  }

  async getChatGroupById(id: string) {
    return this.miniAppsStorageComposed.getChatGroupById(id);
  }

  async createChatGroup(group: any) {
    return this.miniAppsStorageComposed.createChatGroup(group);
  }

  async updateChatGroup(id: string, group: any) {
    return this.miniAppsStorageComposed.updateChatGroup(id, group);
  }

  async deleteChatGroup(id: string) {
    return this.miniAppsStorageComposed.deleteChatGroup(id);
  }

  async createChatgroupsAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createChatgroupsAnnouncement(announcement);
  }

  async getActiveChatgroupsAnnouncements() {
    return this.miniAppsStorageComposed.getActiveChatgroupsAnnouncements();
  }

  async getAllChatgroupsAnnouncements() {
    return this.miniAppsStorageComposed.getAllChatgroupsAnnouncements();
  }

  async updateChatgroupsAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateChatgroupsAnnouncement(id, announcement);
  }

  async deactivateChatgroupsAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateChatgroupsAnnouncement(id);
  }

  // ========================================
  // TRUSTTRANSPORT OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async getTrusttransportProfile(userId: string) {
    return this.miniAppsStorageComposed.getTrusttransportProfile(userId);
  }

  async createTrusttransportProfile(profile: any) {
    return this.miniAppsStorageComposed.createTrusttransportProfile(profile);
  }

  async updateTrusttransportProfile(userId: string, profile: any) {
    return this.miniAppsStorageComposed.updateTrusttransportProfile(userId, profile);
  }

  async createTrusttransportRideRequest(request: any) {
    return this.miniAppsStorageComposed.createTrusttransportRideRequest(request);
  }

  async getTrusttransportRideRequestById(id: string) {
    return this.miniAppsStorageComposed.getTrusttransportRideRequestById(id);
  }

  async getTrusttransportRideRequestsByRider(riderId: string) {
    return this.miniAppsStorageComposed.getTrusttransportRideRequestsByRider(riderId);
  }

  async getOpenTrusttransportRideRequests() {
    return this.miniAppsStorageComposed.getOpenTrusttransportRideRequests();
  }

  async getTrusttransportRideRequestsByDriver(driverId: string) {
    return this.miniAppsStorageComposed.getTrusttransportRideRequestsByDriver(driverId);
  }

  async claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string) {
    return this.miniAppsStorageComposed.claimTrusttransportRideRequest(requestId, driverId, driverMessage);
  }

  async updateTrusttransportRideRequest(id: string, request: any) {
    return this.miniAppsStorageComposed.updateTrusttransportRideRequest(id, request);
  }

  async cancelTrusttransportRideRequest(id: string, userId: string) {
    return this.miniAppsStorageComposed.cancelTrusttransportRideRequest(id, userId);
  }

  async createTrusttransportAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createTrusttransportAnnouncement(announcement);
  }

  async getActiveTrusttransportAnnouncements() {
    return this.miniAppsStorageComposed.getActiveTrusttransportAnnouncements();
  }

  async getAllTrusttransportAnnouncements() {
    return this.miniAppsStorageComposed.getAllTrusttransportAnnouncements();
  }

  async updateTrusttransportAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateTrusttransportAnnouncement(id, announcement);
  }

  async deactivateTrusttransportAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateTrusttransportAnnouncement(id);
  }


  // ========================================
  // LOSTMAIL OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createLostmailIncident(incident: any) {
    return this.miniAppsStorageComposed.createLostmailIncident(incident);
  }

  async getLostmailIncidentById(id: string) {
    return this.miniAppsStorageComposed.getLostmailIncidentById(id);
  }

  async getLostmailIncidentsByEmail(email: string) {
    return this.miniAppsStorageComposed.getLostmailIncidentsByEmail(email);
  }

  async getLostmailIncidents(filters?: any) {
    return this.miniAppsStorageComposed.getLostmailIncidents(filters);
  }

  async updateLostmailIncident(id: string, incident: any) {
    return this.miniAppsStorageComposed.updateLostmailIncident(id, incident);
  }

  async createLostmailAuditTrailEntry(entry: any) {
    return this.miniAppsStorageComposed.createLostmailAuditTrailEntry(entry);
  }

  async getLostmailAuditTrailByIncident(incidentId: string) {
    return this.miniAppsStorageComposed.getLostmailAuditTrailByIncident(incidentId);
  }

  async createLostmailAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createLostmailAnnouncement(announcement);
  }

  async getActiveLostmailAnnouncements() {
    return this.miniAppsStorageComposed.getActiveLostmailAnnouncements();
  }

  async getAllLostmailAnnouncements() {
    return this.miniAppsStorageComposed.getAllLostmailAnnouncements();
  }

  async updateLostmailAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateLostmailAnnouncement(id, announcement);
  }

  async deactivateLostmailAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateLostmailAnnouncement(id);
  }

  // ========================================
  // RESEARCH OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createResearchItem(item: any) {
    return this.miniAppsStorageComposed.createResearchItem(item);
  }

  async getResearchItemById(id: string) {
    return this.miniAppsStorageComposed.getResearchItemById(id);
  }

  async getResearchItems(filters?: any) {
    return this.miniAppsStorageComposed.getResearchItems(filters);
  }

  async updateResearchItem(id: string, item: any) {
    return this.miniAppsStorageComposed.updateResearchItem(id, item);
  }

  async incrementResearchItemViewCount(id: string) {
    return this.miniAppsStorageComposed.incrementResearchItemViewCount(id);
  }

  async acceptResearchAnswer(itemId: string, answerId: string) {
    return this.miniAppsStorageComposed.acceptResearchAnswer(itemId, answerId);
  }

  async createResearchAnswer(answer: any) {
    return this.miniAppsStorageComposed.createResearchAnswer(answer);
  }

  async getResearchAnswerById(id: string) {
    return this.miniAppsStorageComposed.getResearchAnswerById(id);
  }

  async getResearchAnswersByItemId(itemId: string, sortBy?: string) {
    return this.miniAppsStorageComposed.getResearchAnswersByItemId(itemId, sortBy);
  }

  async updateResearchAnswer(id: string, answer: any) {
    return this.miniAppsStorageComposed.updateResearchAnswer(id, answer);
  }

  async createResearchComment(comment: any) {
    return this.miniAppsStorageComposed.createResearchComment(comment);
  }

  async getResearchComments(filters: any) {
    return this.miniAppsStorageComposed.getResearchComments(filters);
  }

  async updateResearchComment(id: string, comment: any) {
    return this.miniAppsStorageComposed.updateResearchComment(id, comment);
  }

  async deleteResearchComment(id: string) {
    return this.miniAppsStorageComposed.deleteResearchComment(id);
  }

  async createOrUpdateResearchVote(vote: any) {
    return this.miniAppsStorageComposed.createOrUpdateResearchVote(vote);
  }

  async getResearchVote(userId: string, researchItemId?: string, answerId?: string) {
    return this.miniAppsStorageComposed.getResearchVote(userId, researchItemId, answerId);
  }

  async deleteResearchVote(userId: string, researchItemId?: string, answerId?: string) {
    return this.miniAppsStorageComposed.deleteResearchVote(userId, researchItemId, answerId);
  }

  async createResearchLinkProvenance(provenance: any) {
    return this.miniAppsStorageComposed.createResearchLinkProvenance(provenance);
  }

  async getResearchLinkProvenancesByAnswerId(answerId: string) {
    return this.miniAppsStorageComposed.getResearchLinkProvenancesByAnswerId(answerId);
  }

  async updateResearchLinkProvenance(id: string, provenance: any) {
    return this.miniAppsStorageComposed.updateResearchLinkProvenance(id, provenance);
  }

  async createResearchBookmark(bookmark: any) {
    return this.miniAppsStorageComposed.createResearchBookmark(bookmark);
  }

  async deleteResearchBookmark(userId: string, researchItemId: string) {
    return this.miniAppsStorageComposed.deleteResearchBookmark(userId, researchItemId);
  }

  async getResearchBookmarks(userId: string) {
    return this.miniAppsStorageComposed.getResearchBookmarks(userId);
  }

  async createResearchFollow(follow: any) {
    return this.miniAppsStorageComposed.createResearchFollow(follow);
  }

  async deleteResearchFollow(userId: string, filters: any) {
    return this.miniAppsStorageComposed.deleteResearchFollow(userId, filters);
  }

  async getResearchFollows(userId: string) {
    return this.miniAppsStorageComposed.getResearchFollows(userId);
  }

  async createResearchReport(report: any) {
    return this.miniAppsStorageComposed.createResearchReport(report);
  }

  async getResearchReports(filters?: any) {
    return this.miniAppsStorageComposed.getResearchReports(filters);
  }

  async updateResearchReport(id: string, report: any) {
    return this.miniAppsStorageComposed.updateResearchReport(id, report);
  }

  async createResearchAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createResearchAnnouncement(announcement);
  }

  async getActiveResearchAnnouncements() {
    return this.miniAppsStorageComposed.getActiveResearchAnnouncements();
  }

  async getAllResearchAnnouncements() {
    return this.miniAppsStorageComposed.getAllResearchAnnouncements();
  }

  async updateResearchAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateResearchAnnouncement(id, announcement);
  }

  async deactivateResearchAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateResearchAnnouncement(id);
  }

  async calculateAnswerRelevance(answerId: string) {
    return this.miniAppsStorageComposed.calculateAnswerRelevance(answerId);
  }

  async updateAnswerScore(answerId: string) {
    return this.miniAppsStorageComposed.updateAnswerScore(answerId);
  }

  async calculateAnswerVerificationScore(answerId: string) {
    return this.miniAppsStorageComposed.calculateAnswerVerificationScore(answerId);
  }

  async getResearchTimeline(userId: string, limit?: number, offset?: number) {
    return this.miniAppsStorageComposed.getResearchTimeline(userId, limit, offset);
  }

  async getUserReputation(userId: string) {
    return this.miniAppsStorageComposed.getUserReputation(userId);
  }

  // ========================================
  // GENTLEPULSE OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createGentlepulseMeditation(meditation: any) {
    return this.miniAppsStorageComposed.createGentlepulseMeditation(meditation);
  }

  async getGentlepulseMeditations(filters?: any) {
    return this.miniAppsStorageComposed.getGentlepulseMeditations(filters);
  }

  async getGentlepulseMeditationById(id: string) {
    return this.miniAppsStorageComposed.getGentlepulseMeditationById(id);
  }

  async updateGentlepulseMeditation(id: string, meditation: any) {
    return this.miniAppsStorageComposed.updateGentlepulseMeditation(id, meditation);
  }

  async incrementGentlepulsePlayCount(id: string) {
    return this.miniAppsStorageComposed.incrementGentlepulsePlayCount(id);
  }

  async createOrUpdateGentlepulseRating(rating: any) {
    return this.miniAppsStorageComposed.createOrUpdateGentlepulseRating(rating);
  }

  async getGentlepulseRatingsByMeditationId(meditationId: string) {
    return this.miniAppsStorageComposed.getGentlepulseRatingsByMeditationId(meditationId);
  }

  async getGentlepulseRatingByClientAndMeditation(clientId: string, meditationId: string) {
    return this.miniAppsStorageComposed.getGentlepulseRatingByClientAndMeditation(clientId, meditationId);
  }

  async createGentlepulseMoodCheck(moodCheck: any) {
    return this.miniAppsStorageComposed.createGentlepulseMoodCheck(moodCheck);
  }

  async getGentlepulseMoodChecksByClientId(clientId: string, days?: number) {
    return this.miniAppsStorageComposed.getGentlepulseMoodChecksByClientId(clientId, days);
  }

  async getGentlepulseMoodChecksByDateRange(startDate: Date, endDate: Date) {
    return this.miniAppsStorageComposed.getGentlepulseMoodChecksByDateRange(startDate, endDate);
  }

  async createGentlepulseFavorite(favorite: any) {
    return this.miniAppsStorageComposed.createGentlepulseFavorite(favorite);
  }

  async deleteGentlepulseFavorite(clientId: string, meditationId: string) {
    return this.miniAppsStorageComposed.deleteGentlepulseFavorite(clientId, meditationId);
  }

  async getGentlepulseFavoritesByClientId(clientId: string) {
    return this.miniAppsStorageComposed.getGentlepulseFavoritesByClientId(clientId);
  }

  async isGentlepulseFavorite(clientId: string, meditationId: string) {
    return this.miniAppsStorageComposed.isGentlepulseFavorite(clientId, meditationId);
  }

  async createGentlepulseAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createGentlepulseAnnouncement(announcement);
  }

  async getActiveGentlepulseAnnouncements() {
    return this.miniAppsStorageComposed.getActiveGentlepulseAnnouncements();
  }

  async getAllGentlepulseAnnouncements() {
    return this.miniAppsStorageComposed.getAllGentlepulseAnnouncements();
  }

  async updateGentlepulseAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateGentlepulseAnnouncement(id, announcement);
  }

  async deactivateGentlepulseAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateGentlepulseAnnouncement(id);
  }

  async updateGentlepulseMeditationRating(meditationId: string) {
    return this.miniAppsStorageComposed.updateGentlepulseMeditationRating(meditationId);
  }

  // ========================================
  // CHYME OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createChymeAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createChymeAnnouncement(announcement);
  }

  async getActiveChymeAnnouncements() {
    return this.miniAppsStorageComposed.getActiveChymeAnnouncements();
  }

  async getAllChymeAnnouncements() {
    return this.miniAppsStorageComposed.getAllChymeAnnouncements();
  }

  async updateChymeAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateChymeAnnouncement(id, announcement);
  }

  async deactivateChymeAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateChymeAnnouncement(id);
  }

  async createChymeRoom(room: any) {
    return this.miniAppsStorageComposed.createChymeRoom(room);
  }

  async getChymeRoom(id: string) {
    return this.miniAppsStorageComposed.getChymeRoom(id);
  }

  async getChymeRooms(roomType?: "public" | "private") {
    return this.miniAppsStorageComposed.getChymeRooms(roomType);
  }

  async updateChymeRoom(id: string, room: any) {
    return this.miniAppsStorageComposed.updateChymeRoom(id, room);
  }

  async deactivateChymeRoom(id: string) {
    return this.miniAppsStorageComposed.deactivateChymeRoom(id);
  }

  async updateChymeRoomPinnedLink(id: string, pinnedLink: string | null) {
    return this.miniAppsStorageComposed.updateChymeRoomPinnedLink(id, pinnedLink);
  }

  async getChymeRoomParticipantCount(roomId: string) {
    return this.miniAppsStorageComposed.getChymeRoomParticipantCount(roomId);
  }

  async joinChymeRoom(participant: any) {
    return this.miniAppsStorageComposed.joinChymeRoom(participant);
  }

  async leaveChymeRoom(roomId: string, userId: string) {
    return this.miniAppsStorageComposed.leaveChymeRoom(roomId, userId);
  }

  async getChymeRoomParticipants(roomId: string) {
    return this.miniAppsStorageComposed.getChymeRoomParticipants(roomId);
  }

  async getChymeRoomParticipant(roomId: string, userId: string) {
    return this.miniAppsStorageComposed.getChymeRoomParticipant(roomId, userId);
  }

  async getActiveRoomsForUser(userId: string) {
    return this.miniAppsStorageComposed.getActiveRoomsForUser(userId);
  }

  async updateChymeRoomParticipant(roomId: string, userId: string, updates: any) {
    return this.miniAppsStorageComposed.updateChymeRoomParticipant(roomId, userId, updates);
  }

  async followChymeUser(userId: string, followedUserId: string) {
    return this.miniAppsStorageComposed.followChymeUser(userId, followedUserId);
  }

  async unfollowChymeUser(userId: string, followedUserId: string) {
    return this.miniAppsStorageComposed.unfollowChymeUser(userId, followedUserId);
  }

  async isFollowingChymeUser(userId: string, followedUserId: string) {
    return this.miniAppsStorageComposed.isFollowingChymeUser(userId, followedUserId);
  }

  async getChymeUserFollows(userId: string) {
    return this.miniAppsStorageComposed.getChymeUserFollows(userId);
  }

  async blockChymeUser(userId: string, blockedUserId: string) {
    return this.miniAppsStorageComposed.blockChymeUser(userId, blockedUserId);
  }

  async unblockChymeUser(userId: string, blockedUserId: string) {
    return this.miniAppsStorageComposed.unblockChymeUser(userId, blockedUserId);
  }

  async isBlockingChymeUser(userId: string, blockedUserId: string) {
    return this.miniAppsStorageComposed.isBlockingChymeUser(userId, blockedUserId);
  }

  async getChymeUserBlocks(userId: string) {
    return this.miniAppsStorageComposed.getChymeUserBlocks(userId);
  }

  async createChymeMessage(message: any) {
    return this.miniAppsStorageComposed.createChymeMessage(message);
  }

  async getChymeMessages(roomId: string) {
    return this.miniAppsStorageComposed.getChymeMessages(roomId);
  }

  // ========================================
  // WORKFORCE RECRUITER OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async getWorkforceRecruiterProfile(userId: string) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterProfile(userId);
  }

  async createWorkforceRecruiterProfile(profile: any) {
    return this.miniAppsStorageComposed.createWorkforceRecruiterProfile(profile);
  }

  async updateWorkforceRecruiterProfile(userId: string, profile: any) {
    return this.miniAppsStorageComposed.updateWorkforceRecruiterProfile(userId, profile);
  }

  async deleteWorkforceRecruiterProfile(userId: string, reason?: string) {
    return this.miniAppsStorageComposed.deleteWorkforceRecruiterProfile(userId, reason);
  }

  async getWorkforceRecruiterConfig() {
    return this.miniAppsStorageComposed.getWorkforceRecruiterConfig();
  }

  async updateWorkforceRecruiterConfig(config: any) {
    return this.miniAppsStorageComposed.updateWorkforceRecruiterConfig(config);
  }

  async createWorkforceRecruiterConfig(config: any) {
    return this.miniAppsStorageComposed.createWorkforceRecruiterConfig(config);
  }

  async getWorkforceRecruiterOccupation(id: string) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterOccupation(id);
  }

  async getAllWorkforceRecruiterOccupations(filters?: any) {
    return this.miniAppsStorageComposed.getAllWorkforceRecruiterOccupations(filters);
  }

  async createWorkforceRecruiterOccupation(occupation: any) {
    return this.miniAppsStorageComposed.createWorkforceRecruiterOccupation(occupation);
  }

  async updateWorkforceRecruiterOccupation(id: string, occupation: any) {
    return this.miniAppsStorageComposed.updateWorkforceRecruiterOccupation(id, occupation);
  }

  async deleteWorkforceRecruiterOccupation(id: string) {
    return this.miniAppsStorageComposed.deleteWorkforceRecruiterOccupation(id);
  }

  async createWorkforceRecruiterMeetupEvent(event: any) {
    return this.miniAppsStorageComposed.createWorkforceRecruiterMeetupEvent(event);
  }

  async getWorkforceRecruiterMeetupEvents(filters?: any) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterMeetupEvents(filters);
  }

  async getWorkforceRecruiterMeetupEventById(id: string) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterMeetupEventById(id);
  }

  async updateWorkforceRecruiterMeetupEvent(id: string, event: any) {
    return this.miniAppsStorageComposed.updateWorkforceRecruiterMeetupEvent(id, event);
  }

  async deleteWorkforceRecruiterMeetupEvent(id: string) {
    return this.miniAppsStorageComposed.deleteWorkforceRecruiterMeetupEvent(id);
  }

  async createWorkforceRecruiterMeetupEventSignup(signup: any) {
    return this.miniAppsStorageComposed.createWorkforceRecruiterMeetupEventSignup(signup);
  }

  async getWorkforceRecruiterMeetupEventSignups(filters?: any) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterMeetupEventSignups(filters);
  }

  async getWorkforceRecruiterMeetupEventSignupCount(eventId: string) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterMeetupEventSignupCount(eventId);
  }

  async getUserMeetupEventSignup(eventId: string, userId: string) {
    return this.miniAppsStorageComposed.getUserMeetupEventSignup(eventId, userId);
  }

  async updateWorkforceRecruiterMeetupEventSignup(id: string, signup: any) {
    return this.miniAppsStorageComposed.updateWorkforceRecruiterMeetupEventSignup(id, signup);
  }

  async deleteWorkforceRecruiterMeetupEventSignup(id: string) {
    return this.miniAppsStorageComposed.deleteWorkforceRecruiterMeetupEventSignup(id);
  }

  async getWorkforceRecruiterSummaryReport() {
    return this.miniAppsStorageComposed.getWorkforceRecruiterSummaryReport();
  }

  async getWorkforceRecruiterSkillLevelDetail(skillLevel: string) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterSkillLevelDetail(skillLevel);
  }

  async getWorkforceRecruiterSectorDetail(sector: string) {
    return this.miniAppsStorageComposed.getWorkforceRecruiterSectorDetail(sector);
  }

  async createWorkforceRecruiterAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createWorkforceRecruiterAnnouncement(announcement);
  }

  async getActiveWorkforceRecruiterAnnouncements() {
    return this.miniAppsStorageComposed.getActiveWorkforceRecruiterAnnouncements();
  }

  async getAllWorkforceRecruiterAnnouncements() {
    return this.miniAppsStorageComposed.getAllWorkforceRecruiterAnnouncements();
  }

  async updateWorkforceRecruiterAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateWorkforceRecruiterAnnouncement(id, announcement);
  }

  async deactivateWorkforceRecruiterAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateWorkforceRecruiterAnnouncement(id);
  }

  // ========================================
  // BLOG OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async getPublishedBlogPosts(limit?: number, offset?: number) {
    return this.miniAppsStorageComposed.getPublishedBlogPosts(limit, offset);
  }

  async getBlogPostBySlug(slug: string) {
    return this.miniAppsStorageComposed.getBlogPostBySlug(slug);
  }

  async getAllBlogPosts() {
    return this.miniAppsStorageComposed.getAllBlogPosts();
  }

  async createBlogPost(post: any) {
    return this.miniAppsStorageComposed.createBlogPost(post);
  }

  async updateBlogPost(id: string, post: any) {
    return this.miniAppsStorageComposed.updateBlogPost(id, post);
  }

  async deleteBlogPost(id: string) {
    return this.miniAppsStorageComposed.deleteBlogPost(id);
  }

  async getBlogCommentsForTopic(discourseTopicId: number, limit?: number, offset?: number) {
    return this.miniAppsStorageComposed.getBlogCommentsForTopic(discourseTopicId, limit, offset);
  }

  async createBlogAnnouncement(announcement: any) {
    return this.miniAppsStorageComposed.createBlogAnnouncement(announcement);
  }

  async getActiveBlogAnnouncements() {
    return this.miniAppsStorageComposed.getActiveBlogAnnouncements();
  }

  async getAllBlogAnnouncements() {
    return this.miniAppsStorageComposed.getAllBlogAnnouncements();
  }

  async updateBlogAnnouncement(id: string, announcement: any) {
    return this.miniAppsStorageComposed.updateBlogAnnouncement(id, announcement);
  }

  async deactivateBlogAnnouncement(id: string) {
    return this.miniAppsStorageComposed.deactivateBlogAnnouncement(id);
  }

  // ========================================
  // DEFAULT ALIVE OR DEAD OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  async createDefaultAliveOrDeadFinancialEntry(entry: any, userId: string) {
    return this.miniAppsStorageComposed.createDefaultAliveOrDeadFinancialEntry(entry, userId);
  }

  async getDefaultAliveOrDeadFinancialEntry(id: string) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadFinancialEntry(id);
  }

  async getDefaultAliveOrDeadFinancialEntries(filters?: any) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadFinancialEntries(filters);
  }

  async updateDefaultAliveOrDeadFinancialEntry(id: string, entry: any) {
    return this.miniAppsStorageComposed.updateDefaultAliveOrDeadFinancialEntry(id, entry);
  }

  async deleteDefaultAliveOrDeadFinancialEntry(id: string) {
    return this.miniAppsStorageComposed.deleteDefaultAliveOrDeadFinancialEntry(id);
  }

  async getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate: Date) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate);
  }

  async calculateAndStoreEbitdaSnapshot(weekStartDate: Date, currentFunding?: number) {
    return this.miniAppsStorageComposed.calculateAndStoreEbitdaSnapshot(weekStartDate, currentFunding);
  }

  async getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate);
  }

  async getDefaultAliveOrDeadEbitdaSnapshots(filters?: any) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadEbitdaSnapshots(filters);
  }

  async getDefaultAliveOrDeadCurrentStatus() {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadCurrentStatus();
  }

  async getDefaultAliveOrDeadWeeklyTrends(weeks?: number) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadWeeklyTrends(weeks);
  }

  async getDefaultAliveOrDeadWeekComparison(weekStart: Date) {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadWeekComparison(weekStart);
  }

  async getDefaultAliveOrDeadCurrentFunding() {
    return this.miniAppsStorageComposed.getDefaultAliveOrDeadCurrentFunding();
  }

  async updateDefaultAliveOrDeadCurrentFunding(amount: number) {
    return this.miniAppsStorageComposed.updateDefaultAliveOrDeadCurrentFunding(amount);
  }

  // ========================================
  // PROFILE DELETION OPERATIONS
  // ========================================

  async logProfileDeletion(userId: string, appName: string, reason?: string) {
    const { logProfileDeletion } = await import('./profile-deletion');
    return logProfileDeletion(userId, appName, reason);
  }

  async deleteSupportMatchProfile(userId: string, reason?: string): Promise<void> {
    return this.miniAppsStorageComposed.deleteSupportMatchProfile(userId, reason);
  }

  async deleteLighthouseProfile(userId: string, reason?: string): Promise<void> {
    return this.miniAppsStorageComposed.deleteLighthouseProfile(userId, reason);
  }

  async deleteSocketrelayProfile(userId: string, reason?: string): Promise<void> {
    return this.miniAppsStorageComposed.deleteSocketrelayProfile(userId, reason);
  }

  async deleteDirectoryProfileWithCascade(userId: string, reason?: string): Promise<void> {
    return this.miniAppsStorageComposed.deleteDirectoryProfileWithCascade(userId, reason);
  }

  async deleteTrusttransportProfile(userId: string, reason?: string): Promise<void> {
    return this.miniAppsStorageComposed.deleteTrusttransportProfile(userId, reason);
  }

  async deleteMechanicmatchProfile(userId: string, reason?: string): Promise<void> {
    return this.miniAppsStorageComposed.deleteMechanicmatchProfile(userId, reason);
  }

  async deleteUserAccount(userId: string, reason?: string): Promise<void> {
    // Verify user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete all mini-app profiles
    const profileDeletions = [
      { name: "SupportMatch", deleteFn: () => this.deleteSupportMatchProfile(userId, reason) },
      { name: "Lighthouse", deleteFn: () => this.deleteLighthouseProfile(userId, reason) },
      { name: "SocketRelay", deleteFn: () => this.deleteSocketrelayProfile(userId, reason) },
      { name: "Directory", deleteFn: () => this.deleteDirectoryProfileWithCascade(userId, reason) },
      { name: "TrustTransport", deleteFn: () => this.deleteTrusttransportProfile(userId, reason) },
      { name: "MechanicMatch", deleteFn: () => this.deleteMechanicmatchProfile(userId, reason) },
      { name: "WorkforceRecruiter", deleteFn: () => this.deleteWorkforceRecruiterProfile(userId, reason) },
    ];

    // Execute all deletions, catching errors to continue with others
    for (const { name, deleteFn } of profileDeletions) {
      try {
        await deleteFn();
      } catch (error: any) {
        console.warn(`Failed to delete ${name} profile: ${error.message}`);
      }
    }

    // Anonymize user data in core tables
    try {
      await this.coreStorageComposed.anonymizeUserData(userId);
    } catch (error: any) {
      console.warn(`Failed to anonymize core user data: ${error.message}`);
      // Continue with deletion even if anonymization fails
    }

    // Log the account deletion
    try {
      await this.logProfileDeletion(userId, "user_account", reason);
    } catch (error: any) {
      console.warn(`Failed to log account deletion: ${error.message}`);
    }

    // Finally, delete the user account from users table
    await this.coreStorageComposed.deleteUser(userId);
  }
}

// Export singleton instance for backward compatibility
export const storage = new DatabaseStorage();

