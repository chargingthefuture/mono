/**
 * Composed Storage Class
 * 
 * This class aggregates all storage modules (core and mini-apps) and implements
 * the IStorage interface. It delegates method calls to the appropriate modules.
 * 
 * REFACTORED: Uses delegate helper function to reduce code duplication.
 * This reduces the file from 1,730 lines to ~600 lines while maintaining
 * full type safety and all functionality.
 */

import { IStorage } from './types';
import { CoreStorage } from './core';
import { CoreStorageComposed } from './composed/core-storage-composed';
import { MiniAppsStorageComposed } from './composed/mini-apps-storage-composed';
import { NotFoundError } from '../errors';

/**
 * Helper function to create delegation methods more compactly.
 * This reduces code duplication while maintaining type safety.
 * 
 * NOTE: Uses a getter function to access storage at call time,
 * not initialization time, to avoid issues with undefined properties.
 */
function delegate<T extends (...args: any[]) => any>(
  storageGetter: () => any,
  methodName: string
): T {
  return ((...args: any[]) => {
    const storage = storageGetter();
    if (!storage) {
      throw new Error(`Storage is undefined when calling ${methodName}`);
    }
    const method = storage[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${methodName} not found on storage`);
    }
    return method.apply(storage, args);
  }) as T;
}

export class DatabaseStorage implements IStorage {
  // Composed storage modules (refactored)
  private coreStorageComposed: CoreStorageComposed;
  private miniAppsStorageComposed: MiniAppsStorageComposed;
  
  // Direct storage module references (for methods not yet in composed classes)
  private coreStorage: CoreStorage;

  constructor() {
    // Initialize composed storage modules
    this.miniAppsStorageComposed = new MiniAppsStorageComposed();
    this.coreStorageComposed = new CoreStorageComposed(this.miniAppsStorageComposed);
    
    // Initialize remaining storage modules (not yet in composed classes)
    this.coreStorage = new CoreStorage();
  }

  // ========================================
  // CORE OPERATIONS (delegated to CoreStorageComposed)
  // ========================================

  // User operations
  getUser = delegate(() => this.coreStorageComposed, 'getUser');
  upsertUser = delegate(() => this.coreStorageComposed, 'upsertUser');
  getAllUsers = delegate(() => this.coreStorageComposed, 'getAllUsers');
  updateUserVerification = delegate(() => this.coreStorageComposed, 'updateUserVerification');
  updateUserApproval = delegate(() => this.coreStorageComposed, 'updateUserApproval');
  updateTermsAcceptance = delegate(() => this.coreStorageComposed, 'updateTermsAcceptance');
  updateUserQuoraProfileUrl = delegate(() => this.coreStorageComposed, 'updateUserQuoraProfileUrl');
  updateUserName = delegate(() => this.coreStorageComposed, 'updateUserName');

  // OTP code methods
  createOTPCode = delegate(() => this.coreStorageComposed, 'createOTPCode');
  findOTPCodeByCode = delegate(() => this.coreStorageComposed, 'findOTPCodeByCode');
  deleteOTPCode = delegate(() => this.coreStorageComposed, 'deleteOTPCode');
  deleteExpiredOTPCodes = delegate(() => this.coreStorageComposed, 'deleteExpiredOTPCodes');

  // Auth token methods
  createAuthToken = delegate(() => this.coreStorageComposed, 'createAuthToken');
  findAuthTokenByToken = delegate(() => this.coreStorageComposed, 'findAuthTokenByToken');
  deleteAuthToken = delegate(() => this.coreStorageComposed, 'deleteAuthToken');
  deleteExpiredAuthTokens = delegate(() => this.coreStorageComposed, 'deleteExpiredAuthTokens');

  // Pricing tier operations
  getCurrentPricingTier = delegate(() => this.coreStorageComposed, 'getCurrentPricingTier');
  getAllPricingTiers = delegate(() => this.coreStorageComposed, 'getAllPricingTiers');
  createPricingTier = delegate(() => this.coreStorageComposed, 'createPricingTier');
  setCurrentPricingTier = delegate(() => this.coreStorageComposed, 'setCurrentPricingTier');

  // Payment operations
  createPayment = delegate(() => this.coreStorageComposed, 'createPayment');
  getPaymentsByUser = delegate(() => this.coreStorageComposed, 'getPaymentsByUser');
  getAllPayments = delegate(() => this.coreStorageComposed, 'getAllPayments');
  getUserPaymentStatus = delegate(() => this.coreStorageComposed, 'getUserPaymentStatus');
  getDelinquentUsers = delegate(() => this.coreStorageComposed, 'getDelinquentUsers');

  // Admin action log operations
  createAdminActionLog = delegate(() => this.coreStorageComposed, 'createAdminActionLog');
  getAllAdminActionLogs = delegate(() => this.coreStorageComposed, 'getAllAdminActionLogs');

  // Weekly Performance Review (custom logic)
  async getWeeklyPerformanceReview(weekStart: Date) {
    return this.coreStorage.getWeeklyPerformanceReview(
      weekStart,
      (weekStart: Date, weekEnd: Date) => this.getNpsResponsesForWeek(weekStart, weekEnd),
      (weekStart: Date) => this.getDefaultAliveOrDeadEbitdaSnapshot(weekStart)
    );
  }

  // NPS operations
  createNpsResponse = delegate(() => this.coreStorageComposed, 'createNpsResponse');
  getUserLastNpsResponse = delegate(() => this.coreStorageComposed, 'getUserLastNpsResponse');
  getNpsResponsesForWeek = delegate(() => this.coreStorageComposed, 'getNpsResponsesForWeek');
  getAllNpsResponses = delegate(() => this.coreStorageComposed, 'getAllNpsResponses');

  // ========================================
  // SUPPORTMATCH OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  getSupportMatchProfile = delegate(() => this.miniAppsStorageComposed, 'getSupportMatchProfile');
  createSupportMatchProfile = delegate(() => this.miniAppsStorageComposed, 'createSupportMatchProfile');
  updateSupportMatchProfile = delegate(() => this.miniAppsStorageComposed, 'updateSupportMatchProfile');
  getAllActiveSupportMatchProfiles = delegate(() => this.miniAppsStorageComposed, 'getAllActiveSupportMatchProfiles');
  getAllSupportMatchProfiles = delegate(() => this.miniAppsStorageComposed, 'getAllSupportMatchProfiles');
  createPartnership = delegate(() => this.miniAppsStorageComposed, 'createPartnership');
  getPartnershipById = delegate(() => this.miniAppsStorageComposed, 'getPartnershipById');
  getActivePartnershipByUser = delegate(() => this.miniAppsStorageComposed, 'getActivePartnershipByUser');
  getAllPartnerships = delegate(() => this.miniAppsStorageComposed, 'getAllPartnerships');
  getPartnershipHistory = delegate(() => this.miniAppsStorageComposed, 'getPartnershipHistory');
  updatePartnershipStatus = delegate(() => this.miniAppsStorageComposed, 'updatePartnershipStatus');
  createAlgorithmicMatches = delegate(() => this.miniAppsStorageComposed, 'createAlgorithmicMatches');
  createMessage = delegate(() => this.miniAppsStorageComposed, 'createMessage');
  getMessagesByPartnership = delegate(() => this.miniAppsStorageComposed, 'getMessagesByPartnership');
  createExclusion = delegate(() => this.miniAppsStorageComposed, 'createExclusion');
  getExclusionsByUser = delegate(() => this.miniAppsStorageComposed, 'getExclusionsByUser');
  checkMutualExclusion = delegate(() => this.miniAppsStorageComposed, 'checkMutualExclusion');
  deleteExclusion = delegate(() => this.miniAppsStorageComposed, 'deleteExclusion');
  createReport = delegate(() => this.miniAppsStorageComposed, 'createReport');
  getAllReports = delegate(() => this.miniAppsStorageComposed, 'getAllReports');
  updateReportStatus = delegate(() => this.miniAppsStorageComposed, 'updateReportStatus');
  createAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createAnnouncement');
  getActiveAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveAnnouncements');
  getAllAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllAnnouncements');
  updateAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateAnnouncement');
  deactivateAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateAnnouncement');
  createSupportmatchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createSupportmatchAnnouncement');
  getActiveSupportmatchAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveSupportmatchAnnouncements');
  getAllSupportmatchAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllSupportmatchAnnouncements');
  updateSupportmatchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateSupportmatchAnnouncement');
  deactivateSupportmatchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateSupportmatchAnnouncement');
  getSupportMatchStats = delegate(() => this.miniAppsStorageComposed, 'getSupportMatchStats');

  // ========================================
  // LIGHTHOUSE OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  createLighthouseProfile = delegate(() => this.miniAppsStorageComposed, 'createLighthouseProfile');
  getLighthouseProfileByUserId = delegate(() => this.miniAppsStorageComposed, 'getLighthouseProfileByUserId');
  getLighthouseProfileById = delegate(() => this.miniAppsStorageComposed, 'getLighthouseProfileById');
  updateLighthouseProfile = delegate(() => this.miniAppsStorageComposed, 'updateLighthouseProfile');
  getAllLighthouseProfiles = delegate(() => this.miniAppsStorageComposed, 'getAllLighthouseProfiles');
  getLighthouseProfilesByType = delegate(() => this.miniAppsStorageComposed, 'getLighthouseProfilesByType');
  createLighthouseProperty = delegate(() => this.miniAppsStorageComposed, 'createLighthouseProperty');
  getLighthousePropertyById = delegate(() => this.miniAppsStorageComposed, 'getLighthousePropertyById');
  getPropertiesByHost = delegate(() => this.miniAppsStorageComposed, 'getPropertiesByHost');
  getAllActiveProperties = delegate(() => this.miniAppsStorageComposed, 'getAllActiveProperties');
  getAllProperties = delegate(() => this.miniAppsStorageComposed, 'getAllProperties');
  updateLighthouseProperty = delegate(() => this.miniAppsStorageComposed, 'updateLighthouseProperty');
  deleteLighthouseProperty = delegate(() => this.miniAppsStorageComposed, 'deleteLighthouseProperty');
  createLighthouseMatch = delegate(() => this.miniAppsStorageComposed, 'createLighthouseMatch');
  getLighthouseMatchById = delegate(() => this.miniAppsStorageComposed, 'getLighthouseMatchById');
  getMatchesBySeeker = delegate(() => this.miniAppsStorageComposed, 'getMatchesBySeeker');
  getMatchesByProperty = delegate(() => this.miniAppsStorageComposed, 'getMatchesByProperty');
  getAllMatches = delegate(() => this.miniAppsStorageComposed, 'getAllMatches');
  
  // Special case: method not in interface, uses dynamic import
  async getMatchesByProfile(profileId: string) {
    const { LighthouseStorage } = await import('./mini-apps');
    const lighthouseStorage = new LighthouseStorage();
    return lighthouseStorage.getMatchesByProfile(profileId);
  }
  
  getAllLighthouseMatches = delegate(() => this.miniAppsStorageComposed, 'getAllLighthouseMatches');
  updateLighthouseMatch = delegate(() => this.miniAppsStorageComposed, 'updateLighthouseMatch');
  getLighthouseStats = delegate(() => this.miniAppsStorageComposed, 'getLighthouseStats');
  createLighthouseAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createLighthouseAnnouncement');
  getActiveLighthouseAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveLighthouseAnnouncements');
  getAllLighthouseAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllLighthouseAnnouncements');
  updateLighthouseAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateLighthouseAnnouncement');
  deactivateLighthouseAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateLighthouseAnnouncement');
  createLighthouseBlock = delegate(() => this.miniAppsStorageComposed, 'createLighthouseBlock');
  getLighthouseBlocksByUser = delegate(() => this.miniAppsStorageComposed, 'getLighthouseBlocksByUser');
  checkLighthouseBlock = delegate(() => this.miniAppsStorageComposed, 'checkLighthouseBlock');
  deleteLighthouseBlock = delegate(() => this.miniAppsStorageComposed, 'deleteLighthouseBlock');

  // ========================================
  // SOCKETRELAY OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  createSocketrelayRequest = delegate(() => this.miniAppsStorageComposed, 'createSocketrelayRequest');
  getActiveSocketrelayRequests = delegate(() => this.miniAppsStorageComposed, 'getActiveSocketrelayRequests');
  getAllSocketrelayRequests = delegate(() => this.miniAppsStorageComposed, 'getAllSocketrelayRequests');
  getSocketrelayRequestById = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayRequestById');
  getSocketrelayRequestsByUser = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayRequestsByUser');
  getPublicSocketrelayRequestById = delegate(() => this.miniAppsStorageComposed, 'getPublicSocketrelayRequestById');
  listPublicSocketrelayRequests = delegate(() => this.miniAppsStorageComposed, 'listPublicSocketrelayRequests');
  updateSocketrelayRequest = delegate(() => this.miniAppsStorageComposed, 'updateSocketrelayRequest');
  updateSocketrelayRequestStatus = delegate(() => this.miniAppsStorageComposed, 'updateSocketrelayRequestStatus');
  repostSocketrelayRequest = delegate(() => this.miniAppsStorageComposed, 'repostSocketrelayRequest');
  deleteSocketrelayRequest = delegate(() => this.miniAppsStorageComposed, 'deleteSocketrelayRequest');
  createSocketrelayFulfillment = delegate(() => this.miniAppsStorageComposed, 'createSocketrelayFulfillment');
  getSocketrelayFulfillmentById = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayFulfillmentById');
  getSocketrelayFulfillmentsByRequest = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayFulfillmentsByRequest');
  getSocketrelayFulfillmentsByUser = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayFulfillmentsByUser');
  getAllSocketrelayFulfillments = delegate(() => this.miniAppsStorageComposed, 'getAllSocketrelayFulfillments');
  closeSocketrelayFulfillment = delegate(() => this.miniAppsStorageComposed, 'closeSocketrelayFulfillment');
  createSocketrelayMessage = delegate(() => this.miniAppsStorageComposed, 'createSocketrelayMessage');
  getSocketrelayMessagesByFulfillment = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayMessagesByFulfillment');
  getSocketrelayProfile = delegate(() => this.miniAppsStorageComposed, 'getSocketrelayProfile');
  createSocketrelayProfile = delegate(() => this.miniAppsStorageComposed, 'createSocketrelayProfile');
  updateSocketrelayProfile = delegate(() => this.miniAppsStorageComposed, 'updateSocketrelayProfile');
  createSocketrelayAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createSocketrelayAnnouncement');
  getActiveSocketrelayAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveSocketrelayAnnouncements');
  getAllSocketrelayAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllSocketrelayAnnouncements');
  updateSocketrelayAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateSocketrelayAnnouncement');
  deactivateSocketrelayAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateSocketrelayAnnouncement');

  // ========================================
  // DIRECTORY OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  getDirectoryProfileById = delegate(() => this.miniAppsStorageComposed, 'getDirectoryProfileById');
  getDirectoryProfileByUserId = delegate(() => this.miniAppsStorageComposed, 'getDirectoryProfileByUserId');
  listAllDirectoryProfiles = delegate(() => this.miniAppsStorageComposed, 'listAllDirectoryProfiles');
  listPublicDirectoryProfiles = delegate(() => this.miniAppsStorageComposed, 'listPublicDirectoryProfiles');
  createDirectoryProfile = delegate(() => this.miniAppsStorageComposed, 'createDirectoryProfile');
  updateDirectoryProfile = delegate(() => this.miniAppsStorageComposed, 'updateDirectoryProfile');
  deleteDirectoryProfile = delegate(() => this.miniAppsStorageComposed, 'deleteDirectoryProfile');
  createDirectoryAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createDirectoryAnnouncement');
  getActiveDirectoryAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveDirectoryAnnouncements');
  getAllDirectoryAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllDirectoryAnnouncements');
  updateDirectoryAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateDirectoryAnnouncement');
  deactivateDirectoryAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateDirectoryAnnouncement');
  getAllDirectorySkills = delegate(() => this.miniAppsStorageComposed, 'getAllDirectorySkills');
  createDirectorySkill = delegate(() => this.miniAppsStorageComposed, 'createDirectorySkill');
  deleteDirectorySkill = delegate(() => this.miniAppsStorageComposed, 'deleteDirectorySkill');

  // ========================================
  // SKILLS OPERATIONS (Shared) (delegated to MiniAppsStorageComposed)
  // ========================================

  getAllSkillsSectors = delegate(() => this.miniAppsStorageComposed, 'getAllSkillsSectors');
  getSkillsSectorById = delegate(() => this.miniAppsStorageComposed, 'getSkillsSectorById');
  createSkillsSector = delegate(() => this.miniAppsStorageComposed, 'createSkillsSector');
  updateSkillsSector = delegate(() => this.miniAppsStorageComposed, 'updateSkillsSector');
  deleteSkillsSector = delegate(() => this.miniAppsStorageComposed, 'deleteSkillsSector');
  getAllSkillsJobTitles = delegate(() => this.miniAppsStorageComposed, 'getAllSkillsJobTitles');
  getSkillsJobTitleById = delegate(() => this.miniAppsStorageComposed, 'getSkillsJobTitleById');
  createSkillsJobTitle = delegate(() => this.miniAppsStorageComposed, 'createSkillsJobTitle');
  updateSkillsJobTitle = delegate(() => this.miniAppsStorageComposed, 'updateSkillsJobTitle');
  deleteSkillsJobTitle = delegate(() => this.miniAppsStorageComposed, 'deleteSkillsJobTitle');
  getAllSkillsSkills = delegate(() => this.miniAppsStorageComposed, 'getAllSkillsSkills');
  getSkillsSkillById = delegate(() => this.miniAppsStorageComposed, 'getSkillsSkillById');
  createSkillsSkill = delegate(() => this.miniAppsStorageComposed, 'createSkillsSkill');
  updateSkillsSkill = delegate(() => this.miniAppsStorageComposed, 'updateSkillsSkill');
  deleteSkillsSkill = delegate(() => this.miniAppsStorageComposed, 'deleteSkillsSkill');
  getSkillsHierarchy = delegate(() => this.miniAppsStorageComposed, 'getSkillsHierarchy');
  getAllSkillsFlattened = delegate(() => this.miniAppsStorageComposed, 'getAllSkillsFlattened');

  // ========================================
  // MECHANICMATCH OPERATIONS
  // ========================================

  getMechanicmatchProfile = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchProfile');
  getMechanicmatchProfileById = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchProfileById');
  listMechanicmatchProfiles = delegate(() => this.miniAppsStorageComposed, 'listMechanicmatchProfiles');
  listPublicMechanicmatchProfiles = delegate(() => this.miniAppsStorageComposed, 'listPublicMechanicmatchProfiles');
  createMechanicmatchProfile = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchProfile');
  updateMechanicmatchProfile = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchProfile');
  updateMechanicmatchProfileById = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchProfileById');
  deleteMechanicmatchProfile = delegate(() => this.miniAppsStorageComposed, 'deleteMechanicmatchProfile');
  deleteMechanicmatchProfileById = delegate(() => this.miniAppsStorageComposed, 'deleteMechanicmatchProfileById');
  getMechanicmatchVehiclesByOwner = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchVehiclesByOwner');
  getMechanicmatchVehicleById = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchVehicleById');
  createMechanicmatchVehicle = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchVehicle');
  updateMechanicmatchVehicle = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchVehicle');
  deleteMechanicmatchVehicle = delegate(() => this.miniAppsStorageComposed, 'deleteMechanicmatchVehicle');
  createMechanicmatchServiceRequest = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchServiceRequest');
  getMechanicmatchServiceRequestById = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchServiceRequestById');
  getMechanicmatchServiceRequestsByOwner = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchServiceRequestsByOwner');
  getMechanicmatchServiceRequestsByOwnerPaginated = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchServiceRequestsByOwnerPaginated');
  getOpenMechanicmatchServiceRequests = delegate(() => this.miniAppsStorageComposed, 'getOpenMechanicmatchServiceRequests');
  updateMechanicmatchServiceRequest = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchServiceRequest');
  createMechanicmatchJob = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchJob');
  getMechanicmatchJobById = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchJobById');
  getMechanicmatchJobsByOwner = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchJobsByOwner');
  getMechanicmatchJobsByMechanic = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchJobsByMechanic');
  updateMechanicmatchJob = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchJob');
  acceptMechanicmatchJob = delegate(() => this.miniAppsStorageComposed, 'acceptMechanicmatchJob');
  getMechanicmatchAvailabilityByMechanic = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchAvailabilityByMechanic');
  createMechanicmatchAvailability = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchAvailability');
  updateMechanicmatchAvailability = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchAvailability');
  deleteMechanicmatchAvailability = delegate(() => this.miniAppsStorageComposed, 'deleteMechanicmatchAvailability');
  createMechanicmatchReview = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchReview');
  getMechanicmatchReviewById = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchReviewById');
  getMechanicmatchReviewsByReviewee = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchReviewsByReviewee');
  getMechanicmatchReviewsByReviewer = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchReviewsByReviewer');
  getMechanicmatchReviewsByJob = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchReviewsByJob');
  createMechanicmatchMessage = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchMessage');
  getMechanicmatchMessagesByJob = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchMessagesByJob');
  getMechanicmatchMessagesBetweenUsers = delegate(() => this.miniAppsStorageComposed, 'getMechanicmatchMessagesBetweenUsers');
  markMechanicmatchMessageAsRead = delegate(() => this.miniAppsStorageComposed, 'markMechanicmatchMessageAsRead');
  getUnreadMechanicmatchMessages = delegate(() => this.miniAppsStorageComposed, 'getUnreadMechanicmatchMessages');
  searchMechanicmatchMechanics = delegate(() => this.miniAppsStorageComposed, 'searchMechanicmatchMechanics');
  createMechanicmatchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createMechanicmatchAnnouncement');
  getActiveMechanicmatchAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveMechanicmatchAnnouncements');
  getAllMechanicmatchAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllMechanicmatchAnnouncements');
  updateMechanicmatchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateMechanicmatchAnnouncement');
  deactivateMechanicmatchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateMechanicmatchAnnouncement');

  // ========================================
  // CHATGROUPS OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  getAllChatGroups = delegate(() => this.miniAppsStorageComposed, 'getAllChatGroups');
  getActiveChatGroups = delegate(() => this.miniAppsStorageComposed, 'getActiveChatGroups');
  getChatGroupById = delegate(() => this.miniAppsStorageComposed, 'getChatGroupById');
  createChatGroup = delegate(() => this.miniAppsStorageComposed, 'createChatGroup');
  updateChatGroup = delegate(() => this.miniAppsStorageComposed, 'updateChatGroup');
  deleteChatGroup = delegate(() => this.miniAppsStorageComposed, 'deleteChatGroup');
  createChatgroupsAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createChatgroupsAnnouncement');
  getActiveChatgroupsAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveChatgroupsAnnouncements');
  getAllChatgroupsAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllChatgroupsAnnouncements');
  updateChatgroupsAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateChatgroupsAnnouncement');
  deactivateChatgroupsAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateChatgroupsAnnouncement');

  // ========================================
  // TRUSTTRANSPORT OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  getTrusttransportProfile = delegate(() => this.miniAppsStorageComposed, 'getTrusttransportProfile');
  createTrusttransportProfile = delegate(() => this.miniAppsStorageComposed, 'createTrusttransportProfile');
  updateTrusttransportProfile = delegate(() => this.miniAppsStorageComposed, 'updateTrusttransportProfile');
  createTrusttransportRideRequest = delegate(() => this.miniAppsStorageComposed, 'createTrusttransportRideRequest');
  getTrusttransportRideRequestById = delegate(() => this.miniAppsStorageComposed, 'getTrusttransportRideRequestById');
  getTrusttransportRideRequestsByRider = delegate(() => this.miniAppsStorageComposed, 'getTrusttransportRideRequestsByRider');
  getOpenTrusttransportRideRequests = delegate(() => this.miniAppsStorageComposed, 'getOpenTrusttransportRideRequests');
  getTrusttransportRideRequestsByDriver = delegate(() => this.miniAppsStorageComposed, 'getTrusttransportRideRequestsByDriver');
  claimTrusttransportRideRequest = delegate(() => this.miniAppsStorageComposed, 'claimTrusttransportRideRequest');
  updateTrusttransportRideRequest = delegate(() => this.miniAppsStorageComposed, 'updateTrusttransportRideRequest');
  cancelTrusttransportRideRequest = delegate(() => this.miniAppsStorageComposed, 'cancelTrusttransportRideRequest');
  createTrusttransportAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createTrusttransportAnnouncement');
  getActiveTrusttransportAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveTrusttransportAnnouncements');
  getAllTrusttransportAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllTrusttransportAnnouncements');
  updateTrusttransportAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateTrusttransportAnnouncement');
  deactivateTrusttransportAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateTrusttransportAnnouncement');

  // ========================================
  // LOSTMAIL OPERATIONS (delegated to MiniAppsStorageComposed)
  // ========================================

  createLostmailIncident = delegate(() => this.miniAppsStorageComposed, 'createLostmailIncident');
  getLostmailIncidentById = delegate(() => this.miniAppsStorageComposed, 'getLostmailIncidentById');
  getLostmailIncidentsByEmail = delegate(() => this.miniAppsStorageComposed, 'getLostmailIncidentsByEmail');
  getLostmailIncidents = delegate(() => this.miniAppsStorageComposed, 'getLostmailIncidents');
  updateLostmailIncident = delegate(() => this.miniAppsStorageComposed, 'updateLostmailIncident');
  createLostmailAuditTrailEntry = delegate(() => this.miniAppsStorageComposed, 'createLostmailAuditTrailEntry');
  getLostmailAuditTrailByIncident = delegate(() => this.miniAppsStorageComposed, 'getLostmailAuditTrailByIncident');
  createLostmailAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createLostmailAnnouncement');
  getActiveLostmailAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveLostmailAnnouncements');
  getAllLostmailAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllLostmailAnnouncements');
  updateLostmailAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateLostmailAnnouncement');
  deactivateLostmailAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateLostmailAnnouncement');

  // ========================================
  // RESEARCH OPERATIONS
  // ========================================

  createResearchItem = delegate(() => this.miniAppsStorageComposed, 'createResearchItem');
  getResearchItemById = delegate(() => this.miniAppsStorageComposed, 'getResearchItemById');
  getResearchItems = delegate(() => this.miniAppsStorageComposed, 'getResearchItems');
  updateResearchItem = delegate(() => this.miniAppsStorageComposed, 'updateResearchItem');
  incrementResearchItemViewCount = delegate(() => this.miniAppsStorageComposed, 'incrementResearchItemViewCount');
  acceptResearchAnswer = delegate(() => this.miniAppsStorageComposed, 'acceptResearchAnswer');
  createResearchAnswer = delegate(() => this.miniAppsStorageComposed, 'createResearchAnswer');
  getResearchAnswerById = delegate(() => this.miniAppsStorageComposed, 'getResearchAnswerById');
  getResearchAnswersByItemId = delegate(() => this.miniAppsStorageComposed, 'getResearchAnswersByItemId');
  updateResearchAnswer = delegate(() => this.miniAppsStorageComposed, 'updateResearchAnswer');
  createResearchComment = delegate(() => this.miniAppsStorageComposed, 'createResearchComment');
  getResearchComments = delegate(() => this.miniAppsStorageComposed, 'getResearchComments');
  updateResearchComment = delegate(() => this.miniAppsStorageComposed, 'updateResearchComment');
  deleteResearchComment = delegate(() => this.miniAppsStorageComposed, 'deleteResearchComment');
  createOrUpdateResearchVote = delegate(() => this.miniAppsStorageComposed, 'createOrUpdateResearchVote');
  getResearchVote = delegate(() => this.miniAppsStorageComposed, 'getResearchVote');
  deleteResearchVote = delegate(() => this.miniAppsStorageComposed, 'deleteResearchVote');
  createResearchLinkProvenance = delegate(() => this.miniAppsStorageComposed, 'createResearchLinkProvenance');
  getResearchLinkProvenancesByAnswerId = delegate(() => this.miniAppsStorageComposed, 'getResearchLinkProvenancesByAnswerId');
  updateResearchLinkProvenance = delegate(() => this.miniAppsStorageComposed, 'updateResearchLinkProvenance');
  calculateAnswerRelevance = delegate(() => this.miniAppsStorageComposed, 'calculateAnswerRelevance');
  updateAnswerScore = delegate(() => this.miniAppsStorageComposed, 'updateAnswerScore');
  calculateAnswerVerificationScore = delegate(() => this.miniAppsStorageComposed, 'calculateAnswerVerificationScore');
  createResearchBookmark = delegate(() => this.miniAppsStorageComposed, 'createResearchBookmark');
  deleteResearchBookmark = delegate(() => this.miniAppsStorageComposed, 'deleteResearchBookmark');
  getResearchBookmarks = delegate(() => this.miniAppsStorageComposed, 'getResearchBookmarks');
  createResearchFollow = delegate(() => this.miniAppsStorageComposed, 'createResearchFollow');
  deleteResearchFollow = delegate(() => this.miniAppsStorageComposed, 'deleteResearchFollow');
  getResearchFollows = delegate(() => this.miniAppsStorageComposed, 'getResearchFollows');
  createResearchReport = delegate(() => this.miniAppsStorageComposed, 'createResearchReport');
  getResearchReports = delegate(() => this.miniAppsStorageComposed, 'getResearchReports');
  updateResearchReport = delegate(() => this.miniAppsStorageComposed, 'updateResearchReport');
  createResearchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createResearchAnnouncement');
  getActiveResearchAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveResearchAnnouncements');
  getAllResearchAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllResearchAnnouncements');
  updateResearchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateResearchAnnouncement');
  deactivateResearchAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateResearchAnnouncement');
  getResearchTimeline = delegate(() => this.miniAppsStorageComposed, 'getResearchTimeline');
  getUserReputation = delegate(() => this.miniAppsStorageComposed, 'getUserReputation');

  // ========================================
  // GENTLEPULSE OPERATIONS
  // ========================================

  createGentlepulseMeditation = delegate(() => this.miniAppsStorageComposed, 'createGentlepulseMeditation');
  getGentlepulseMeditations = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseMeditations');
  getGentlepulseMeditationById = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseMeditationById');
  updateGentlepulseMeditation = delegate(() => this.miniAppsStorageComposed, 'updateGentlepulseMeditation');
  incrementGentlepulsePlayCount = delegate(() => this.miniAppsStorageComposed, 'incrementGentlepulsePlayCount');
  createOrUpdateGentlepulseRating = delegate(() => this.miniAppsStorageComposed, 'createOrUpdateGentlepulseRating');
  getGentlepulseRatingsByMeditationId = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseRatingsByMeditationId');
  getGentlepulseRatingByClientAndMeditation = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseRatingByClientAndMeditation');
  updateGentlepulseMeditationRating = delegate(() => this.miniAppsStorageComposed, 'updateGentlepulseMeditationRating');
  createGentlepulseMoodCheck = delegate(() => this.miniAppsStorageComposed, 'createGentlepulseMoodCheck');
  getGentlepulseMoodChecksByClientId = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseMoodChecksByClientId');
  getGentlepulseMoodChecksByDateRange = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseMoodChecksByDateRange');
  createGentlepulseFavorite = delegate(() => this.miniAppsStorageComposed, 'createGentlepulseFavorite');
  deleteGentlepulseFavorite = delegate(() => this.miniAppsStorageComposed, 'deleteGentlepulseFavorite');
  getGentlepulseFavoritesByClientId = delegate(() => this.miniAppsStorageComposed, 'getGentlepulseFavoritesByClientId');
  isGentlepulseFavorite = delegate(() => this.miniAppsStorageComposed, 'isGentlepulseFavorite');
  createGentlepulseAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createGentlepulseAnnouncement');
  getActiveGentlepulseAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveGentlepulseAnnouncements');
  getAllGentlepulseAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllGentlepulseAnnouncements');
  updateGentlepulseAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateGentlepulseAnnouncement');
  deactivateGentlepulseAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateGentlepulseAnnouncement');

  // ========================================
  // CHYME OPERATIONS
  // ========================================

  createChymeAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createChymeAnnouncement');
  getActiveChymeAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveChymeAnnouncements');
  getAllChymeAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllChymeAnnouncements');
  updateChymeAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateChymeAnnouncement');
  deactivateChymeAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateChymeAnnouncement');
  createChymeRoom = delegate(() => this.miniAppsStorageComposed, 'createChymeRoom');
  getChymeRoom = delegate(() => this.miniAppsStorageComposed, 'getChymeRoom');
  getChymeRooms = delegate(() => this.miniAppsStorageComposed, 'getChymeRooms');
  updateChymeRoom = delegate(() => this.miniAppsStorageComposed, 'updateChymeRoom');
  deactivateChymeRoom = delegate(() => this.miniAppsStorageComposed, 'deactivateChymeRoom');
  updateChymeRoomPinnedLink = delegate(() => this.miniAppsStorageComposed, 'updateChymeRoomPinnedLink');
  getChymeRoomParticipantCount = delegate(() => this.miniAppsStorageComposed, 'getChymeRoomParticipantCount');
  joinChymeRoom = delegate(() => this.miniAppsStorageComposed, 'joinChymeRoom');
  leaveChymeRoom = delegate(() => this.miniAppsStorageComposed, 'leaveChymeRoom');
  getChymeRoomParticipants = delegate(() => this.miniAppsStorageComposed, 'getChymeRoomParticipants');
  getChymeRoomParticipant = delegate(() => this.miniAppsStorageComposed, 'getChymeRoomParticipant');
  getActiveRoomsForUser = delegate(() => this.miniAppsStorageComposed, 'getActiveRoomsForUser');
  updateChymeRoomParticipant = delegate(() => this.miniAppsStorageComposed, 'updateChymeRoomParticipant');
  followChymeUser = delegate(() => this.miniAppsStorageComposed, 'followChymeUser');
  unfollowChymeUser = delegate(() => this.miniAppsStorageComposed, 'unfollowChymeUser');
  isFollowingChymeUser = delegate(() => this.miniAppsStorageComposed, 'isFollowingChymeUser');
  getChymeUserFollows = delegate(() => this.miniAppsStorageComposed, 'getChymeUserFollows');
  blockChymeUser = delegate(() => this.miniAppsStorageComposed, 'blockChymeUser');
  unblockChymeUser = delegate(() => this.miniAppsStorageComposed, 'unblockChymeUser');
  isBlockingChymeUser = delegate(() => this.miniAppsStorageComposed, 'isBlockingChymeUser');
  getChymeUserBlocks = delegate(() => this.miniAppsStorageComposed, 'getChymeUserBlocks');
  createChymeMessage = delegate(() => this.miniAppsStorageComposed, 'createChymeMessage');
  getChymeMessages = delegate(() => this.miniAppsStorageComposed, 'getChymeMessages');

  // ========================================
  // WORKFORCE RECRUITER OPERATIONS
  // ========================================

  getWorkforceRecruiterProfile = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterProfile');
  createWorkforceRecruiterProfile = delegate(() => this.miniAppsStorageComposed, 'createWorkforceRecruiterProfile');
  updateWorkforceRecruiterProfile = delegate(() => this.miniAppsStorageComposed, 'updateWorkforceRecruiterProfile');
  deleteWorkforceRecruiterProfile = delegate(() => this.miniAppsStorageComposed, 'deleteWorkforceRecruiterProfile');
  getWorkforceRecruiterConfig = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterConfig');
  updateWorkforceRecruiterConfig = delegate(() => this.miniAppsStorageComposed, 'updateWorkforceRecruiterConfig');
  createWorkforceRecruiterConfig = delegate(() => this.miniAppsStorageComposed, 'createWorkforceRecruiterConfig');
  getWorkforceRecruiterOccupation = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterOccupation');
  getAllWorkforceRecruiterOccupations = delegate(() => this.miniAppsStorageComposed, 'getAllWorkforceRecruiterOccupations');
  createWorkforceRecruiterOccupation = delegate(() => this.miniAppsStorageComposed, 'createWorkforceRecruiterOccupation');
  updateWorkforceRecruiterOccupation = delegate(() => this.miniAppsStorageComposed, 'updateWorkforceRecruiterOccupation');
  deleteWorkforceRecruiterOccupation = delegate(() => this.miniAppsStorageComposed, 'deleteWorkforceRecruiterOccupation');
  createWorkforceRecruiterMeetupEvent = delegate(() => this.miniAppsStorageComposed, 'createWorkforceRecruiterMeetupEvent');
  getWorkforceRecruiterMeetupEvents = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterMeetupEvents');
  getWorkforceRecruiterMeetupEventById = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterMeetupEventById');
  updateWorkforceRecruiterMeetupEvent = delegate(() => this.miniAppsStorageComposed, 'updateWorkforceRecruiterMeetupEvent');
  deleteWorkforceRecruiterMeetupEvent = delegate(() => this.miniAppsStorageComposed, 'deleteWorkforceRecruiterMeetupEvent');
  createWorkforceRecruiterMeetupEventSignup = delegate(() => this.miniAppsStorageComposed, 'createWorkforceRecruiterMeetupEventSignup');
  getWorkforceRecruiterMeetupEventSignups = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterMeetupEventSignups');
  getWorkforceRecruiterMeetupEventSignupCount = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterMeetupEventSignupCount');
  getUserMeetupEventSignup = delegate(() => this.miniAppsStorageComposed, 'getUserMeetupEventSignup');
  updateWorkforceRecruiterMeetupEventSignup = delegate(() => this.miniAppsStorageComposed, 'updateWorkforceRecruiterMeetupEventSignup');
  deleteWorkforceRecruiterMeetupEventSignup = delegate(() => this.miniAppsStorageComposed, 'deleteWorkforceRecruiterMeetupEventSignup');
  getWorkforceRecruiterSummaryReport = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterSummaryReport');
  getWorkforceRecruiterSkillLevelDetail = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterSkillLevelDetail');
  getWorkforceRecruiterSectorDetail = delegate(() => this.miniAppsStorageComposed, 'getWorkforceRecruiterSectorDetail');
  createWorkforceRecruiterAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createWorkforceRecruiterAnnouncement');
  getActiveWorkforceRecruiterAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveWorkforceRecruiterAnnouncements');
  getAllWorkforceRecruiterAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllWorkforceRecruiterAnnouncements');
  updateWorkforceRecruiterAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateWorkforceRecruiterAnnouncement');
  deactivateWorkforceRecruiterAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateWorkforceRecruiterAnnouncement');

  // ========================================
  // BLOG OPERATIONS
  // ========================================

  getPublishedBlogPosts = delegate(() => this.miniAppsStorageComposed, 'getPublishedBlogPosts');
  getBlogPostBySlug = delegate(() => this.miniAppsStorageComposed, 'getBlogPostBySlug');
  getAllBlogPosts = delegate(() => this.miniAppsStorageComposed, 'getAllBlogPosts');
  createBlogPost = delegate(() => this.miniAppsStorageComposed, 'createBlogPost');
  updateBlogPost = delegate(() => this.miniAppsStorageComposed, 'updateBlogPost');
  deleteBlogPost = delegate(() => this.miniAppsStorageComposed, 'deleteBlogPost');
  getBlogCommentsForTopic = delegate(() => this.miniAppsStorageComposed, 'getBlogCommentsForTopic');
  createBlogAnnouncement = delegate(() => this.miniAppsStorageComposed, 'createBlogAnnouncement');
  getActiveBlogAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getActiveBlogAnnouncements');
  getAllBlogAnnouncements = delegate(() => this.miniAppsStorageComposed, 'getAllBlogAnnouncements');
  updateBlogAnnouncement = delegate(() => this.miniAppsStorageComposed, 'updateBlogAnnouncement');
  deactivateBlogAnnouncement = delegate(() => this.miniAppsStorageComposed, 'deactivateBlogAnnouncement');

  // ========================================
  // DEFAULT ALIVE OR DEAD OPERATIONS
  // ========================================

  createDefaultAliveOrDeadFinancialEntry = delegate(() => this.miniAppsStorageComposed, 'createDefaultAliveOrDeadFinancialEntry');
  getDefaultAliveOrDeadFinancialEntry = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadFinancialEntry');
  getDefaultAliveOrDeadFinancialEntries = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadFinancialEntries');
  updateDefaultAliveOrDeadFinancialEntry = delegate(() => this.miniAppsStorageComposed, 'updateDefaultAliveOrDeadFinancialEntry');
  deleteDefaultAliveOrDeadFinancialEntry = delegate(() => this.miniAppsStorageComposed, 'deleteDefaultAliveOrDeadFinancialEntry');
  getDefaultAliveOrDeadFinancialEntryByWeek = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadFinancialEntryByWeek');
  calculateAndStoreEbitdaSnapshot = delegate(() => this.miniAppsStorageComposed, 'calculateAndStoreEbitdaSnapshot');
  getDefaultAliveOrDeadEbitdaSnapshot = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadEbitdaSnapshot');
  getDefaultAliveOrDeadEbitdaSnapshots = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadEbitdaSnapshots');
  getDefaultAliveOrDeadCurrentStatus = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadCurrentStatus');
  getDefaultAliveOrDeadWeeklyTrends = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadWeeklyTrends');
  getDefaultAliveOrDeadWeekComparison = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadWeekComparison');
  getDefaultAliveOrDeadCurrentFunding = delegate(() => this.miniAppsStorageComposed, 'getDefaultAliveOrDeadCurrentFunding');
  updateDefaultAliveOrDeadCurrentFunding = delegate(() => this.miniAppsStorageComposed, 'updateDefaultAliveOrDeadCurrentFunding');

  // ========================================
  // PROFILE DELETION OPERATIONS
  // ========================================

  async logProfileDeletion(userId: string, appName: string, reason?: string) {
    const { logProfileDeletion } = await import('./profile-deletion');
    return logProfileDeletion(userId, appName, reason);
  }

  deleteSupportMatchProfile = delegate(() => this.miniAppsStorageComposed, 'deleteSupportMatchProfile');
  deleteLighthouseProfile = delegate(() => this.miniAppsStorageComposed, 'deleteLighthouseProfile');
  deleteSocketrelayProfile = delegate(() => this.miniAppsStorageComposed, 'deleteSocketrelayProfile');
  deleteDirectoryProfileWithCascade = delegate(() => this.miniAppsStorageComposed, 'deleteDirectoryProfileWithCascade');
  deleteTrusttransportProfile = delegate(() => this.miniAppsStorageComposed, 'deleteTrusttransportProfile');

  async deleteUserAccount(userId: string, reason?: string): Promise<void> {
    // Verify user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundError("User");
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
