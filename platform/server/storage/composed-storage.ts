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
import { SupportMatchStorage } from './mini-apps';
import { LighthouseStorage } from './mini-apps';
import { SocketRelayStorage } from './mini-apps';
import { DirectoryStorage } from './mini-apps';
import { SkillsStorage } from './mini-apps';
import { ChatGroupsStorage } from './mini-apps';
import { TrustTransportStorage } from './mini-apps';
import { MechanicMatchStorage } from './mini-apps';
import { LostMailStorage } from './mini-apps';
import { ResearchStorage } from './mini-apps';
import { GentlePulseStorage } from './mini-apps';
import { ChymeStorage } from './mini-apps';
import { WorkforceRecruiterStorage } from './mini-apps';
import { BlogStorage } from './mini-apps';
import { DefaultAliveOrDeadStorage } from './mini-apps';

export class DatabaseStorage implements IStorage {
  // Composed storage modules (refactored)
  private coreStorageComposed: CoreStorageComposed;
  private miniAppsStorageComposed: MiniAppsStorageComposed;
  
  // Direct storage module references (for methods not yet in composed classes)
  private coreStorage: CoreStorage;
  private lostMailStorage: LostMailStorage;
  private researchStorage: ResearchStorage;
  private gentlePulseStorage: GentlePulseStorage;
  private chymeStorage: ChymeStorage;
  private workforceRecruiterStorage: WorkforceRecruiterStorage;
  private blogStorage: BlogStorage;
  private defaultAliveOrDeadStorage: DefaultAliveOrDeadStorage;
  private trustTransportStorage: TrustTransportStorage;
  private chatGroupsStorage: ChatGroupsStorage;

  constructor() {
    // Initialize composed storage modules
    this.coreStorageComposed = new CoreStorageComposed();
    this.miniAppsStorageComposed = new MiniAppsStorageComposed();
    
    // Initialize remaining storage modules (not yet in composed classes)
    this.coreStorage = new CoreStorage();
    this.lostMailStorage = new LostMailStorage();
    this.researchStorage = new ResearchStorage();
    this.gentlePulseStorage = new GentlePulseStorage();
    this.chymeStorage = new ChymeStorage();
    this.workforceRecruiterStorage = new WorkforceRecruiterStorage();
    this.blogStorage = new BlogStorage();
    this.defaultAliveOrDeadStorage = new DefaultAliveOrDeadStorage();
    this.trustTransportStorage = new TrustTransportStorage();
    this.chatGroupsStorage = new ChatGroupsStorage();
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
  // CHATGROUPS OPERATIONS
  // ========================================

  async getAllChatGroups() {
    return this.chatGroupsStorage.getAllChatGroups();
  }

  async getActiveChatGroups() {
    return this.chatGroupsStorage.getActiveChatGroups();
  }

  async getChatGroupById(id: string) {
    return this.chatGroupsStorage.getChatGroupById(id);
  }

  async createChatGroup(group: any) {
    return this.chatGroupsStorage.createChatGroup(group);
  }

  async updateChatGroup(id: string, group: any) {
    return this.chatGroupsStorage.updateChatGroup(id, group);
  }

  async deleteChatGroup(id: string) {
    return this.chatGroupsStorage.deleteChatGroup(id);
  }

  async createChatgroupsAnnouncement(announcement: any) {
    return this.chatGroupsStorage.createChatgroupsAnnouncement(announcement);
  }

  async getActiveChatgroupsAnnouncements() {
    return this.chatGroupsStorage.getActiveChatgroupsAnnouncements();
  }

  async getAllChatgroupsAnnouncements() {
    return this.chatGroupsStorage.getAllChatgroupsAnnouncements();
  }

  async updateChatgroupsAnnouncement(id: string, announcement: any) {
    return this.chatGroupsStorage.updateChatgroupsAnnouncement(id, announcement);
  }

  async deactivateChatgroupsAnnouncement(id: string) {
    return this.chatGroupsStorage.deactivateChatgroupsAnnouncement(id);
  }

  // ========================================
  // TRUSTTRANSPORT OPERATIONS
  // ========================================

  async getTrusttransportProfile(userId: string) {
    return this.trustTransportStorage.getTrusttransportProfile(userId);
  }

  async createTrusttransportProfile(profile: any) {
    return this.trustTransportStorage.createTrusttransportProfile(profile);
  }

  async updateTrusttransportProfile(userId: string, profile: any) {
    return this.trustTransportStorage.updateTrusttransportProfile(userId, profile);
  }

  async createTrusttransportRideRequest(request: any) {
    return this.trustTransportStorage.createTrusttransportRideRequest(request);
  }

  async getTrusttransportRideRequestById(id: string) {
    return this.trustTransportStorage.getTrusttransportRideRequestById(id);
  }

  async getTrusttransportRideRequestsByRider(riderId: string) {
    return this.trustTransportStorage.getTrusttransportRideRequestsByRider(riderId);
  }

  async getOpenTrusttransportRideRequests() {
    return this.trustTransportStorage.getOpenTrusttransportRideRequests();
  }

  async getTrusttransportRideRequestsByDriver(driverId: string) {
    return this.trustTransportStorage.getTrusttransportRideRequestsByDriver(driverId);
  }

  async claimTrusttransportRideRequest(requestId: string, driverId: string, driverMessage?: string) {
    return this.trustTransportStorage.claimTrusttransportRideRequest(requestId, driverId, driverMessage);
  }

  async updateTrusttransportRideRequest(id: string, request: any) {
    return this.trustTransportStorage.updateTrusttransportRideRequest(id, request);
  }

  async cancelTrusttransportRideRequest(id: string, userId: string) {
    return this.trustTransportStorage.cancelTrusttransportRideRequest(id, userId);
  }

  async createTrusttransportAnnouncement(announcement: any) {
    return this.trustTransportStorage.createTrusttransportAnnouncement(announcement);
  }

  async getActiveTrusttransportAnnouncements() {
    return this.trustTransportStorage.getActiveTrusttransportAnnouncements();
  }

  async getAllTrusttransportAnnouncements() {
    return this.trustTransportStorage.getAllTrusttransportAnnouncements();
  }

  async updateTrusttransportAnnouncement(id: string, announcement: any) {
    return this.trustTransportStorage.updateTrusttransportAnnouncement(id, announcement);
  }

  async deactivateTrusttransportAnnouncement(id: string) {
    return this.trustTransportStorage.deactivateTrusttransportAnnouncement(id);
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
  // LOSTMAIL OPERATIONS
  // ========================================

  async createLostmailIncident(incident: any) {
    return this.lostMailStorage.createLostmailIncident(incident);
  }

  async getLostmailIncidentById(id: string) {
    return this.lostMailStorage.getLostmailIncidentById(id);
  }

  async getLostmailIncidentsByEmail(email: string) {
    return this.lostMailStorage.getLostmailIncidentsByEmail(email);
  }

  async getLostmailIncidents(filters?: any) {
    return this.lostMailStorage.getLostmailIncidents(filters);
  }

  async updateLostmailIncident(id: string, incident: any) {
    return this.lostMailStorage.updateLostmailIncident(id, incident);
  }

  async createLostmailAuditTrailEntry(entry: any) {
    return this.lostMailStorage.createLostmailAuditTrailEntry(entry);
  }

  async getLostmailAuditTrailByIncident(incidentId: string) {
    return this.lostMailStorage.getLostmailAuditTrailByIncident(incidentId);
  }

  async createLostmailAnnouncement(announcement: any) {
    return this.lostMailStorage.createLostmailAnnouncement(announcement);
  }

  async getActiveLostmailAnnouncements() {
    return this.lostMailStorage.getActiveLostmailAnnouncements();
  }

  async getAllLostmailAnnouncements() {
    return this.lostMailStorage.getAllLostmailAnnouncements();
  }

  async updateLostmailAnnouncement(id: string, announcement: any) {
    return this.lostMailStorage.updateLostmailAnnouncement(id, announcement);
  }

  async deactivateLostmailAnnouncement(id: string) {
    return this.lostMailStorage.deactivateLostmailAnnouncement(id);
  }

  // ========================================
  // RESEARCH OPERATIONS
  // ========================================

  async createResearchItem(item: any) {
    return this.researchStorage.createResearchItem(item);
  }

  async getResearchItemById(id: string) {
    return this.researchStorage.getResearchItemById(id);
  }

  async getResearchItems(filters?: any) {
    return this.researchStorage.getResearchItems(filters);
  }

  async updateResearchItem(id: string, item: any) {
    return this.researchStorage.updateResearchItem(id, item);
  }

  async incrementResearchItemViewCount(id: string) {
    return this.researchStorage.incrementResearchItemViewCount(id);
  }

  async acceptResearchAnswer(itemId: string, answerId: string) {
    return this.researchStorage.acceptResearchAnswer(itemId, answerId);
  }

  async createResearchAnswer(answer: any) {
    return this.researchStorage.createResearchAnswer(answer);
  }

  async getResearchAnswerById(id: string) {
    return this.researchStorage.getResearchAnswerById(id);
  }

  async getResearchAnswersByItemId(itemId: string, sortBy?: string) {
    return this.researchStorage.getResearchAnswersByItemId(itemId, sortBy);
  }

  async updateResearchAnswer(id: string, answer: any) {
    return this.researchStorage.updateResearchAnswer(id, answer);
  }

  async createResearchComment(comment: any) {
    return this.researchStorage.createResearchComment(comment);
  }

  async getResearchComments(filters: any) {
    return this.researchStorage.getResearchComments(filters);
  }

  async updateResearchComment(id: string, comment: any) {
    return this.researchStorage.updateResearchComment(id, comment);
  }

  async deleteResearchComment(id: string) {
    return this.researchStorage.deleteResearchComment(id);
  }

  async createOrUpdateResearchVote(vote: any) {
    return this.researchStorage.createOrUpdateResearchVote(vote);
  }

  async getResearchVote(userId: string, researchItemId?: string, answerId?: string) {
    return this.researchStorage.getResearchVote(userId, researchItemId, answerId);
  }

  async deleteResearchVote(userId: string, researchItemId?: string, answerId?: string) {
    return this.researchStorage.deleteResearchVote(userId, researchItemId, answerId);
  }

  async createResearchLinkProvenance(provenance: any) {
    return this.researchStorage.createResearchLinkProvenance(provenance);
  }

  async getResearchLinkProvenancesByAnswerId(answerId: string) {
    return this.researchStorage.getResearchLinkProvenancesByAnswerId(answerId);
  }

  async updateResearchLinkProvenance(id: string, provenance: any) {
    return this.researchStorage.updateResearchLinkProvenance(id, provenance);
  }

  async createResearchBookmark(bookmark: any) {
    return this.researchStorage.createResearchBookmark(bookmark);
  }

  async deleteResearchBookmark(userId: string, researchItemId: string) {
    return this.researchStorage.deleteResearchBookmark(userId, researchItemId);
  }

  async getResearchBookmarks(userId: string) {
    return this.researchStorage.getResearchBookmarks(userId);
  }

  async createResearchFollow(follow: any) {
    return this.researchStorage.createResearchFollow(follow);
  }

  async deleteResearchFollow(userId: string, filters: any) {
    return this.researchStorage.deleteResearchFollow(userId, filters);
  }

  async getResearchFollows(userId: string) {
    return this.researchStorage.getResearchFollows(userId);
  }

  async createResearchReport(report: any) {
    return this.researchStorage.createResearchReport(report);
  }

  async getResearchReports(filters?: any) {
    return this.researchStorage.getResearchReports(filters);
  }

  async updateResearchReport(id: string, report: any) {
    return this.researchStorage.updateResearchReport(id, report);
  }

  async createResearchAnnouncement(announcement: any) {
    return this.researchStorage.createResearchAnnouncement(announcement);
  }

  async getActiveResearchAnnouncements() {
    return this.researchStorage.getActiveResearchAnnouncements();
  }

  async getAllResearchAnnouncements() {
    return this.researchStorage.getAllResearchAnnouncements();
  }

  async updateResearchAnnouncement(id: string, announcement: any) {
    return this.researchStorage.updateResearchAnnouncement(id, announcement);
  }

  async deactivateResearchAnnouncement(id: string) {
    return this.researchStorage.deactivateResearchAnnouncement(id);
  }

  async calculateAnswerRelevance(answerId: string) {
    return this.researchStorage.calculateAnswerRelevance(answerId);
  }

  async updateAnswerScore(answerId: string) {
    return this.researchStorage.updateAnswerScore(answerId);
  }

  async calculateAnswerVerificationScore(answerId: string) {
    return this.researchStorage.calculateAnswerVerificationScore(answerId);
  }

  async getResearchTimeline(userId: string, limit?: number, offset?: number) {
    return this.researchStorage.getResearchTimeline(userId, limit, offset);
  }

  async getUserReputation(userId: string) {
    return this.researchStorage.getUserReputation(userId);
  }

  // ========================================
  // GENTLEPULSE OPERATIONS
  // ========================================

  async createGentlepulseMeditation(meditation: any) {
    return this.gentlePulseStorage.createGentlepulseMeditation(meditation);
  }

  async getGentlepulseMeditations(filters?: any) {
    return this.gentlePulseStorage.getGentlepulseMeditations(filters);
  }

  async getGentlepulseMeditationById(id: string) {
    return this.gentlePulseStorage.getGentlepulseMeditationById(id);
  }

  async updateGentlepulseMeditation(id: string, meditation: any) {
    return this.gentlePulseStorage.updateGentlepulseMeditation(id, meditation);
  }

  async incrementGentlepulsePlayCount(id: string) {
    return this.gentlePulseStorage.incrementGentlepulsePlayCount(id);
  }

  async createOrUpdateGentlepulseRating(rating: any) {
    return this.gentlePulseStorage.createOrUpdateGentlepulseRating(rating);
  }

  async getGentlepulseRatingsByMeditationId(meditationId: string) {
    return this.gentlePulseStorage.getGentlepulseRatingsByMeditationId(meditationId);
  }

  async getGentlepulseRatingByClientAndMeditation(clientId: string, meditationId: string) {
    return this.gentlePulseStorage.getGentlepulseRatingByClientAndMeditation(clientId, meditationId);
  }

  async createGentlepulseMoodCheck(moodCheck: any) {
    return this.gentlePulseStorage.createGentlepulseMoodCheck(moodCheck);
  }

  async getGentlepulseMoodChecksByClientId(clientId: string, days?: number) {
    return this.gentlePulseStorage.getGentlepulseMoodChecksByClientId(clientId, days);
  }

  async getGentlepulseMoodChecksByDateRange(startDate: Date, endDate: Date) {
    return this.gentlePulseStorage.getGentlepulseMoodChecksByDateRange(startDate, endDate);
  }

  async createGentlepulseFavorite(favorite: any) {
    return this.gentlePulseStorage.createGentlepulseFavorite(favorite);
  }

  async deleteGentlepulseFavorite(clientId: string, meditationId: string) {
    return this.gentlePulseStorage.deleteGentlepulseFavorite(clientId, meditationId);
  }

  async getGentlepulseFavoritesByClientId(clientId: string) {
    return this.gentlePulseStorage.getGentlepulseFavoritesByClientId(clientId);
  }

  async isGentlepulseFavorite(clientId: string, meditationId: string) {
    return this.gentlePulseStorage.isGentlepulseFavorite(clientId, meditationId);
  }

  async createGentlepulseAnnouncement(announcement: any) {
    return this.gentlePulseStorage.createGentlepulseAnnouncement(announcement);
  }

  async getActiveGentlepulseAnnouncements() {
    return this.gentlePulseStorage.getActiveGentlepulseAnnouncements();
  }

  async getAllGentlepulseAnnouncements() {
    return this.gentlePulseStorage.getAllGentlepulseAnnouncements();
  }

  async updateGentlepulseAnnouncement(id: string, announcement: any) {
    return this.gentlePulseStorage.updateGentlepulseAnnouncement(id, announcement);
  }

  async deactivateGentlepulseAnnouncement(id: string) {
    return this.gentlePulseStorage.deactivateGentlepulseAnnouncement(id);
  }

  async updateGentlepulseMeditationRating(meditationId: string) {
    return this.gentlePulseStorage.updateGentlepulseMeditationRating(meditationId);
  }

  // ========================================
  // CHYME OPERATIONS
  // ========================================

  async createChymeAnnouncement(announcement: any) {
    return this.chymeStorage.createChymeAnnouncement(announcement);
  }

  async getActiveChymeAnnouncements() {
    return this.chymeStorage.getActiveChymeAnnouncements();
  }

  async getAllChymeAnnouncements() {
    return this.chymeStorage.getAllChymeAnnouncements();
  }

  async updateChymeAnnouncement(id: string, announcement: any) {
    return this.chymeStorage.updateChymeAnnouncement(id, announcement);
  }

  async deactivateChymeAnnouncement(id: string) {
    return this.chymeStorage.deactivateChymeAnnouncement(id);
  }

  async createChymeRoom(room: any) {
    return this.chymeStorage.createChymeRoom(room);
  }

  async getChymeRoom(id: string) {
    return this.chymeStorage.getChymeRoom(id);
  }

  async getChymeRooms(roomType?: "public" | "private") {
    return this.chymeStorage.getChymeRooms(roomType);
  }

  async updateChymeRoom(id: string, room: any) {
    return this.chymeStorage.updateChymeRoom(id, room);
  }

  async deactivateChymeRoom(id: string) {
    return this.chymeStorage.deactivateChymeRoom(id);
  }

  async updateChymeRoomPinnedLink(id: string, pinnedLink: string | null) {
    return this.chymeStorage.updateChymeRoomPinnedLink(id, pinnedLink);
  }

  async getChymeRoomParticipantCount(roomId: string) {
    return this.chymeStorage.getChymeRoomParticipantCount(roomId);
  }

  async joinChymeRoom(participant: any) {
    return this.chymeStorage.joinChymeRoom(participant);
  }

  async leaveChymeRoom(roomId: string, userId: string) {
    return this.chymeStorage.leaveChymeRoom(roomId, userId);
  }

  async getChymeRoomParticipants(roomId: string) {
    return this.chymeStorage.getChymeRoomParticipants(roomId);
  }

  async getChymeRoomParticipant(roomId: string, userId: string) {
    return this.chymeStorage.getChymeRoomParticipant(roomId, userId);
  }

  async getActiveRoomsForUser(userId: string) {
    return this.chymeStorage.getActiveRoomsForUser(userId);
  }

  async updateChymeRoomParticipant(roomId: string, userId: string, updates: any) {
    return this.chymeStorage.updateChymeRoomParticipant(roomId, userId, updates);
  }

  async followChymeUser(userId: string, followedUserId: string) {
    return this.chymeStorage.followChymeUser(userId, followedUserId);
  }

  async unfollowChymeUser(userId: string, followedUserId: string) {
    return this.chymeStorage.unfollowChymeUser(userId, followedUserId);
  }

  async isFollowingChymeUser(userId: string, followedUserId: string) {
    return this.chymeStorage.isFollowingChymeUser(userId, followedUserId);
  }

  async getChymeUserFollows(userId: string) {
    return this.chymeStorage.getChymeUserFollows(userId);
  }

  async blockChymeUser(userId: string, blockedUserId: string) {
    return this.chymeStorage.blockChymeUser(userId, blockedUserId);
  }

  async unblockChymeUser(userId: string, blockedUserId: string) {
    return this.chymeStorage.unblockChymeUser(userId, blockedUserId);
  }

  async isBlockingChymeUser(userId: string, blockedUserId: string) {
    return this.chymeStorage.isBlockingChymeUser(userId, blockedUserId);
  }

  async getChymeUserBlocks(userId: string) {
    return this.chymeStorage.getChymeUserBlocks(userId);
  }

  async createChymeMessage(message: any) {
    return this.chymeStorage.createChymeMessage(message);
  }

  async getChymeMessages(roomId: string) {
    return this.chymeStorage.getChymeMessages(roomId);
  }

  // ========================================
  // WORKFORCE RECRUITER OPERATIONS
  // ========================================

  async getWorkforceRecruiterProfile(userId: string) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterProfile(userId);
  }

  async createWorkforceRecruiterProfile(profile: any) {
    return this.workforceRecruiterStorage.createWorkforceRecruiterProfile(profile);
  }

  async updateWorkforceRecruiterProfile(userId: string, profile: any) {
    return this.workforceRecruiterStorage.updateWorkforceRecruiterProfile(userId, profile);
  }

  async deleteWorkforceRecruiterProfile(userId: string, reason?: string) {
    return this.workforceRecruiterStorage.deleteWorkforceRecruiterProfile(userId, reason);
  }

  async getWorkforceRecruiterConfig() {
    return this.workforceRecruiterStorage.getWorkforceRecruiterConfig();
  }

  async updateWorkforceRecruiterConfig(config: any) {
    return this.workforceRecruiterStorage.updateWorkforceRecruiterConfig(config);
  }

  async createWorkforceRecruiterConfig(config: any) {
    return this.workforceRecruiterStorage.createWorkforceRecruiterConfig(config);
  }

  async getWorkforceRecruiterOccupation(id: string) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterOccupation(id);
  }

  async getAllWorkforceRecruiterOccupations(filters?: any) {
    return this.workforceRecruiterStorage.getAllWorkforceRecruiterOccupations(filters);
  }

  async createWorkforceRecruiterOccupation(occupation: any) {
    return this.workforceRecruiterStorage.createWorkforceRecruiterOccupation(occupation);
  }

  async updateWorkforceRecruiterOccupation(id: string, occupation: any) {
    return this.workforceRecruiterStorage.updateWorkforceRecruiterOccupation(id, occupation);
  }

  async deleteWorkforceRecruiterOccupation(id: string) {
    return this.workforceRecruiterStorage.deleteWorkforceRecruiterOccupation(id);
  }

  async createWorkforceRecruiterMeetupEvent(event: any) {
    return this.workforceRecruiterStorage.createWorkforceRecruiterMeetupEvent(event);
  }

  async getWorkforceRecruiterMeetupEvents(filters?: any) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterMeetupEvents(filters);
  }

  async getWorkforceRecruiterMeetupEventById(id: string) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterMeetupEventById(id);
  }

  async updateWorkforceRecruiterMeetupEvent(id: string, event: any) {
    return this.workforceRecruiterStorage.updateWorkforceRecruiterMeetupEvent(id, event);
  }

  async deleteWorkforceRecruiterMeetupEvent(id: string) {
    return this.workforceRecruiterStorage.deleteWorkforceRecruiterMeetupEvent(id);
  }

  async createWorkforceRecruiterMeetupEventSignup(signup: any) {
    return this.workforceRecruiterStorage.createWorkforceRecruiterMeetupEventSignup(signup);
  }

  async getWorkforceRecruiterMeetupEventSignups(filters?: any) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterMeetupEventSignups(filters);
  }

  async getWorkforceRecruiterMeetupEventSignupCount(eventId: string) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterMeetupEventSignupCount(eventId);
  }

  async getUserMeetupEventSignup(eventId: string, userId: string) {
    return this.workforceRecruiterStorage.getUserMeetupEventSignup(eventId, userId);
  }

  async updateWorkforceRecruiterMeetupEventSignup(id: string, signup: any) {
    return this.workforceRecruiterStorage.updateWorkforceRecruiterMeetupEventSignup(id, signup);
  }

  async deleteWorkforceRecruiterMeetupEventSignup(id: string) {
    return this.workforceRecruiterStorage.deleteWorkforceRecruiterMeetupEventSignup(id);
  }

  async getWorkforceRecruiterSummaryReport() {
    return this.workforceRecruiterStorage.getWorkforceRecruiterSummaryReport();
  }

  async getWorkforceRecruiterSkillLevelDetail(skillLevel: string) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterSkillLevelDetail(skillLevel);
  }

  async getWorkforceRecruiterSectorDetail(sector: string) {
    return this.workforceRecruiterStorage.getWorkforceRecruiterSectorDetail(sector);
  }

  async createWorkforceRecruiterAnnouncement(announcement: any) {
    return this.workforceRecruiterStorage.createWorkforceRecruiterAnnouncement(announcement);
  }

  async getActiveWorkforceRecruiterAnnouncements() {
    return this.workforceRecruiterStorage.getActiveWorkforceRecruiterAnnouncements();
  }

  async getAllWorkforceRecruiterAnnouncements() {
    return this.workforceRecruiterStorage.getAllWorkforceRecruiterAnnouncements();
  }

  async updateWorkforceRecruiterAnnouncement(id: string, announcement: any) {
    return this.workforceRecruiterStorage.updateWorkforceRecruiterAnnouncement(id, announcement);
  }

  async deactivateWorkforceRecruiterAnnouncement(id: string) {
    return this.workforceRecruiterStorage.deactivateWorkforceRecruiterAnnouncement(id);
  }

  // ========================================
  // BLOG OPERATIONS
  // ========================================

  async getPublishedBlogPosts(limit?: number, offset?: number) {
    return this.blogStorage.getPublishedBlogPosts(limit, offset);
  }

  async getBlogPostBySlug(slug: string) {
    return this.blogStorage.getBlogPostBySlug(slug);
  }

  async getAllBlogPosts() {
    return this.blogStorage.getAllBlogPosts();
  }

  async createBlogPost(post: any) {
    return this.blogStorage.createBlogPost(post);
  }

  async updateBlogPost(id: string, post: any) {
    return this.blogStorage.updateBlogPost(id, post);
  }

  async deleteBlogPost(id: string) {
    return this.blogStorage.deleteBlogPost(id);
  }

  async getBlogCommentsForTopic(discourseTopicId: number, limit?: number, offset?: number) {
    return this.blogStorage.getBlogCommentsForTopic(discourseTopicId, limit, offset);
  }

  async createBlogAnnouncement(announcement: any) {
    return this.blogStorage.createBlogAnnouncement(announcement);
  }

  async getActiveBlogAnnouncements() {
    return this.blogStorage.getActiveBlogAnnouncements();
  }

  async getAllBlogAnnouncements() {
    return this.blogStorage.getAllBlogAnnouncements();
  }

  async updateBlogAnnouncement(id: string, announcement: any) {
    return this.blogStorage.updateBlogAnnouncement(id, announcement);
  }

  async deactivateBlogAnnouncement(id: string) {
    return this.blogStorage.deactivateBlogAnnouncement(id);
  }

  // ========================================
  // DEFAULT ALIVE OR DEAD OPERATIONS
  // ========================================

  async createDefaultAliveOrDeadFinancialEntry(entry: any, userId: string) {
    return this.defaultAliveOrDeadStorage.createDefaultAliveOrDeadFinancialEntry(entry, userId);
  }

  async getDefaultAliveOrDeadFinancialEntry(id: string) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadFinancialEntry(id);
  }

  async getDefaultAliveOrDeadFinancialEntries(filters?: any) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadFinancialEntries(filters);
  }

  async updateDefaultAliveOrDeadFinancialEntry(id: string, entry: any) {
    return this.defaultAliveOrDeadStorage.updateDefaultAliveOrDeadFinancialEntry(id, entry);
  }

  async deleteDefaultAliveOrDeadFinancialEntry(id: string) {
    return this.defaultAliveOrDeadStorage.deleteDefaultAliveOrDeadFinancialEntry(id);
  }

  async getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate: Date) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate);
  }

  async calculateAndStoreEbitdaSnapshot(weekStartDate: Date, currentFunding?: number) {
    return this.defaultAliveOrDeadStorage.calculateAndStoreEbitdaSnapshot(weekStartDate, currentFunding);
  }

  async getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate);
  }

  async getDefaultAliveOrDeadEbitdaSnapshots(filters?: any) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadEbitdaSnapshots(filters);
  }

  async getDefaultAliveOrDeadCurrentStatus() {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadCurrentStatus();
  }

  async getDefaultAliveOrDeadWeeklyTrends(weeks?: number) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadWeeklyTrends(weeks);
  }

  async getDefaultAliveOrDeadWeekComparison(weekStart: Date) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadWeekComparison(weekStart);
  }

  async getDefaultAliveOrDeadCurrentFunding() {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadCurrentFunding();
  }

  async updateDefaultAliveOrDeadCurrentFunding(amount: number) {
    return this.defaultAliveOrDeadStorage.updateDefaultAliveOrDeadCurrentFunding(amount);
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
    return this.trustTransportStorage.deleteTrusttransportProfile(userId, reason);
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
      await this.coreStorage.anonymizeUserData(userId);
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
    await this.coreStorage.deleteUser(userId);
  }
}

// Export singleton instance for backward compatibility
export const storage = new DatabaseStorage();

