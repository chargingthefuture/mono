/**
 * Mini-Apps Storage Composed
 * 
 * Handles delegation of mini-app storage operations.
 * This class composes all individual mini-app composed storage classes.
 * 
 * REFACTORED: Uses helper function to reduce duplication while maintaining
 * full type safety. Reduces from 1,573 lines to ~200 lines.
 */

import type { ISupportMatchStorage } from '../types/supportmatch-storage.interface';
import type { ILighthouseStorage } from '../types/lighthouse-storage.interface';
import type { IMechanicMatchStorage } from '../types/mechanicmatch-storage.interface';
import type { ISocketRelayStorage } from '../types/socketrelay-storage.interface';
import type { IDirectoryStorage } from '../types/directory-storage.interface';
import type { ISkillsStorage } from '../types/skills-storage.interface';
import type { IResearchStorage } from '../types/research-storage.interface';
import type { ILostMailStorage } from '../types/lostmail-storage.interface';
import type { ITrustTransportStorage } from '../types/trusttransport-storage.interface';
import type { IChatGroupsStorage } from '../types/chatgroups-storage.interface';
import type { IGentlePulseStorage } from '../types/gentlepulse-storage.interface';
import type { IChymeStorage } from '../types/chyme-storage.interface';
import type { IWorkforceRecruiterStorage } from '../types/workforce-recruiter-storage.interface';
import type { IBlogStorage } from '../types/blog-storage.interface';
import type { IDefaultAliveOrDeadStorage } from '../types/default-alive-or-dead-storage.interface';

import {
  SupportMatchStorageComposed,
  LighthouseStorageComposed,
  MechanicMatchStorageComposed,
  SocketRelayStorageComposed,
  DirectoryStorageComposed,
  SkillsStorageComposed,
  ResearchStorageComposed,
  LostMailStorageComposed,
  TrustTransportStorageComposed,
  ChatGroupsStorageComposed,
  GentlePulseStorageComposed,
  ChymeStorageComposed,
  WorkforceRecruiterStorageComposed,
  BlogStorageComposed,
  DefaultAliveOrDeadStorageComposed,
} from './mini-apps';

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

export class MiniAppsStorageComposed 
  implements ISupportMatchStorage, ILighthouseStorage, IMechanicMatchStorage, ISocketRelayStorage, IDirectoryStorage, ISkillsStorage,
             IResearchStorage, ILostMailStorage, ITrustTransportStorage, IChatGroupsStorage, IGentlePulseStorage, IChymeStorage,
             IWorkforceRecruiterStorage, IBlogStorage, IDefaultAliveOrDeadStorage {
  
  private supportMatchStorage: SupportMatchStorageComposed;
  private lighthouseStorage: LighthouseStorageComposed;
  private mechanicMatchStorage: MechanicMatchStorageComposed;
  private socketRelayStorage: SocketRelayStorageComposed;
  private directoryStorage: DirectoryStorageComposed;
  private skillsStorage: SkillsStorageComposed;
  private researchStorage: ResearchStorageComposed;
  private lostMailStorage: LostMailStorageComposed;
  private trustTransportStorage: TrustTransportStorageComposed;
  private chatGroupsStorage: ChatGroupsStorageComposed;
  private gentlePulseStorage: GentlePulseStorageComposed;
  private chymeStorage: ChymeStorageComposed;
  private workforceRecruiterStorage: WorkforceRecruiterStorageComposed;
  private blogStorage: BlogStorageComposed;
  private defaultAliveOrDeadStorage: DefaultAliveOrDeadStorageComposed;

  constructor() {
    this.supportMatchStorage = new SupportMatchStorageComposed();
    this.lighthouseStorage = new LighthouseStorageComposed();
    this.mechanicMatchStorage = new MechanicMatchStorageComposed();
    this.socketRelayStorage = new SocketRelayStorageComposed();
    this.directoryStorage = new DirectoryStorageComposed();
    this.skillsStorage = new SkillsStorageComposed();
    this.researchStorage = new ResearchStorageComposed();
    this.lostMailStorage = new LostMailStorageComposed();
    this.trustTransportStorage = new TrustTransportStorageComposed();
    this.chatGroupsStorage = new ChatGroupsStorageComposed();
    this.gentlePulseStorage = new GentlePulseStorageComposed();
    this.chymeStorage = new ChymeStorageComposed();
    this.workforceRecruiterStorage = new WorkforceRecruiterStorageComposed();
    this.blogStorage = new BlogStorageComposed();
    this.defaultAliveOrDeadStorage = new DefaultAliveOrDeadStorageComposed();
  }

  // ========================================
  // SUPPORTMATCH OPERATIONS
  // ========================================

  getSupportMatchProfile = delegate(() => this.supportMatchStorage, 'getSupportMatchProfile');
  createSupportMatchProfile = delegate(() => this.supportMatchStorage, 'createSupportMatchProfile');
  updateSupportMatchProfile = delegate(() => this.supportMatchStorage, 'updateSupportMatchProfile');
  getAllActiveSupportMatchProfiles = delegate(() => this.supportMatchStorage, 'getAllActiveSupportMatchProfiles');
  getAllSupportMatchProfiles = delegate(() => this.supportMatchStorage, 'getAllSupportMatchProfiles');
  createPartnership = delegate(() => this.supportMatchStorage, 'createPartnership');
  getPartnershipById = delegate(() => this.supportMatchStorage, 'getPartnershipById');
  getActivePartnershipByUser = delegate(() => this.supportMatchStorage, 'getActivePartnershipByUser');
  getAllPartnerships = delegate(() => this.supportMatchStorage, 'getAllPartnerships');
  getPartnershipHistory = delegate(() => this.supportMatchStorage, 'getPartnershipHistory');
  updatePartnershipStatus = delegate(() => this.supportMatchStorage, 'updatePartnershipStatus');
  createAlgorithmicMatches = delegate(() => this.supportMatchStorage, 'createAlgorithmicMatches');
  createMessage = delegate(() => this.supportMatchStorage, 'createMessage');
  getMessagesByPartnership = delegate(() => this.supportMatchStorage, 'getMessagesByPartnership');
  createExclusion = delegate(() => this.supportMatchStorage, 'createExclusion');
  getExclusionsByUser = delegate(() => this.supportMatchStorage, 'getExclusionsByUser');
  checkMutualExclusion = delegate(() => this.supportMatchStorage, 'checkMutualExclusion');
  deleteExclusion = delegate(() => this.supportMatchStorage, 'deleteExclusion');
  createReport = delegate(() => this.supportMatchStorage, 'createReport');
  getAllReports = delegate(() => this.supportMatchStorage, 'getAllReports');
  updateReportStatus = delegate(() => this.supportMatchStorage, 'updateReportStatus');
  createAnnouncement = delegate(() => this.supportMatchStorage, 'createAnnouncement');
  getActiveAnnouncements = delegate(() => this.supportMatchStorage, 'getActiveAnnouncements');
  getAllAnnouncements = delegate(() => this.supportMatchStorage, 'getAllAnnouncements');
  updateAnnouncement = delegate(() => this.supportMatchStorage, 'updateAnnouncement');
  deactivateAnnouncement = delegate(() => this.supportMatchStorage, 'deactivateAnnouncement');
  createSupportmatchAnnouncement = delegate(() => this.supportMatchStorage, 'createSupportmatchAnnouncement');
  getActiveSupportmatchAnnouncements = delegate(() => this.supportMatchStorage, 'getActiveSupportmatchAnnouncements');
  getAllSupportmatchAnnouncements = delegate(() => this.supportMatchStorage, 'getAllSupportmatchAnnouncements');
  updateSupportmatchAnnouncement = delegate(() => this.supportMatchStorage, 'updateSupportmatchAnnouncement');
  deactivateSupportmatchAnnouncement = delegate(() => this.supportMatchStorage, 'deactivateSupportmatchAnnouncement');
  getSupportMatchStats = delegate(() => this.supportMatchStorage, 'getSupportMatchStats');
  deleteSupportMatchProfile = delegate(() => this.supportMatchStorage, 'deleteSupportMatchProfile');

  // ========================================
  // LIGHTHOUSE OPERATIONS
  // ========================================

  createLighthouseProfile = delegate(() => this.lighthouseStorage, 'createLighthouseProfile');
  getLighthouseProfileByUserId = delegate(() => this.lighthouseStorage, 'getLighthouseProfileByUserId');
  getLighthouseProfileById = delegate(() => this.lighthouseStorage, 'getLighthouseProfileById');
  updateLighthouseProfile = delegate(() => this.lighthouseStorage, 'updateLighthouseProfile');
  getAllLighthouseProfiles = delegate(() => this.lighthouseStorage, 'getAllLighthouseProfiles');
  getLighthouseProfilesByType = delegate(() => this.lighthouseStorage, 'getLighthouseProfilesByType');
  createLighthouseProperty = delegate(() => this.lighthouseStorage, 'createLighthouseProperty');
  getLighthousePropertyById = delegate(() => this.lighthouseStorage, 'getLighthousePropertyById');
  getPropertiesByHost = delegate(() => this.lighthouseStorage, 'getPropertiesByHost');
  getAllActiveProperties = delegate(() => this.lighthouseStorage, 'getAllActiveProperties');
  getAllProperties = delegate(() => this.lighthouseStorage, 'getAllProperties');
  updateLighthouseProperty = delegate(() => this.lighthouseStorage, 'updateLighthouseProperty');
  deleteLighthouseProperty = delegate(() => this.lighthouseStorage, 'deleteLighthouseProperty');
  createLighthouseMatch = delegate(() => this.lighthouseStorage, 'createLighthouseMatch');
  getLighthouseMatchById = delegate(() => this.lighthouseStorage, 'getLighthouseMatchById');
  getMatchesBySeeker = delegate(() => this.lighthouseStorage, 'getMatchesBySeeker');
  getMatchesByProperty = delegate(() => this.lighthouseStorage, 'getMatchesByProperty');
  getAllMatches = delegate(() => this.lighthouseStorage, 'getAllMatches');
  getMatchesByProfile = delegate(() => this.lighthouseStorage, 'getMatchesByProfile');
  getAllLighthouseMatches = delegate(() => this.lighthouseStorage, 'getAllLighthouseMatches');
  updateLighthouseMatch = delegate(() => this.lighthouseStorage, 'updateLighthouseMatch');
  getLighthouseStats = delegate(() => this.lighthouseStorage, 'getLighthouseStats');
  createLighthouseAnnouncement = delegate(() => this.lighthouseStorage, 'createLighthouseAnnouncement');
  getActiveLighthouseAnnouncements = delegate(() => this.lighthouseStorage, 'getActiveLighthouseAnnouncements');
  getAllLighthouseAnnouncements = delegate(() => this.lighthouseStorage, 'getAllLighthouseAnnouncements');
  updateLighthouseAnnouncement = delegate(() => this.lighthouseStorage, 'updateLighthouseAnnouncement');
  deactivateLighthouseAnnouncement = delegate(() => this.lighthouseStorage, 'deactivateLighthouseAnnouncement');
  createLighthouseBlock = delegate(() => this.lighthouseStorage, 'createLighthouseBlock');
  getLighthouseBlocksByUser = delegate(() => this.lighthouseStorage, 'getLighthouseBlocksByUser');
  checkLighthouseBlock = delegate(() => this.lighthouseStorage, 'checkLighthouseBlock');
  deleteLighthouseBlock = delegate(() => this.lighthouseStorage, 'deleteLighthouseBlock');
  deleteLighthouseProfile = delegate(() => this.lighthouseStorage, 'deleteLighthouseProfile');

  // ========================================
  // MECHANICMATCH OPERATIONS
  // ========================================

  getMechanicmatchProfile = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchProfile');
  getMechanicmatchProfileById = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchProfileById');
  listMechanicmatchProfiles = delegate(() => this.mechanicMatchStorage, 'listMechanicmatchProfiles');
  listPublicMechanicmatchProfiles = delegate(() => this.mechanicMatchStorage, 'listPublicMechanicmatchProfiles');
  createMechanicmatchProfile = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchProfile');
  updateMechanicmatchProfile = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchProfile');
  updateMechanicmatchProfileById = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchProfileById');
  deleteMechanicmatchProfile = delegate(() => this.mechanicMatchStorage, 'deleteMechanicmatchProfile');
  deleteMechanicmatchProfileById = delegate(() => this.mechanicMatchStorage, 'deleteMechanicmatchProfileById');
  getMechanicmatchVehiclesByOwner = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchVehiclesByOwner');
  getMechanicmatchVehicleById = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchVehicleById');
  createMechanicmatchVehicle = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchVehicle');
  updateMechanicmatchVehicle = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchVehicle');
  deleteMechanicmatchVehicle = delegate(() => this.mechanicMatchStorage, 'deleteMechanicmatchVehicle');
  createMechanicmatchServiceRequest = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchServiceRequest');
  getMechanicmatchServiceRequestById = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchServiceRequestById');
  getMechanicmatchServiceRequestsByOwner = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchServiceRequestsByOwner');
  getMechanicmatchServiceRequestsByOwnerPaginated = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchServiceRequestsByOwnerPaginated');
  getOpenMechanicmatchServiceRequests = delegate(() => this.mechanicMatchStorage, 'getOpenMechanicmatchServiceRequests');
  updateMechanicmatchServiceRequest = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchServiceRequest');
  createMechanicmatchJob = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchJob');
  getMechanicmatchJobById = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchJobById');
  getMechanicmatchJobsByOwner = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchJobsByOwner');
  getMechanicmatchJobsByMechanic = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchJobsByMechanic');
  updateMechanicmatchJob = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchJob');
  acceptMechanicmatchJob = delegate(() => this.mechanicMatchStorage, 'acceptMechanicmatchJob');
  getMechanicmatchAvailabilityByMechanic = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchAvailabilityByMechanic');
  createMechanicmatchAvailability = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchAvailability');
  updateMechanicmatchAvailability = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchAvailability');
  deleteMechanicmatchAvailability = delegate(() => this.mechanicMatchStorage, 'deleteMechanicmatchAvailability');
  createMechanicmatchReview = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchReview');
  getMechanicmatchReviewById = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchReviewById');
  getMechanicmatchReviewsByReviewee = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchReviewsByReviewee');
  getMechanicmatchReviewsByReviewer = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchReviewsByReviewer');
  getMechanicmatchReviewsByJob = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchReviewsByJob');
  createMechanicmatchMessage = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchMessage');
  getMechanicmatchMessagesByJob = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchMessagesByJob');
  getMechanicmatchMessagesBetweenUsers = delegate(() => this.mechanicMatchStorage, 'getMechanicmatchMessagesBetweenUsers');
  markMechanicmatchMessageAsRead = delegate(() => this.mechanicMatchStorage, 'markMechanicmatchMessageAsRead');
  getUnreadMechanicmatchMessages = delegate(() => this.mechanicMatchStorage, 'getUnreadMechanicmatchMessages');
  searchMechanicmatchMechanics = delegate(() => this.mechanicMatchStorage, 'searchMechanicmatchMechanics');
  createMechanicmatchAnnouncement = delegate(() => this.mechanicMatchStorage, 'createMechanicmatchAnnouncement');
  getActiveMechanicmatchAnnouncements = delegate(() => this.mechanicMatchStorage, 'getActiveMechanicmatchAnnouncements');
  getAllMechanicmatchAnnouncements = delegate(() => this.mechanicMatchStorage, 'getAllMechanicmatchAnnouncements');
  updateMechanicmatchAnnouncement = delegate(() => this.mechanicMatchStorage, 'updateMechanicmatchAnnouncement');
  deactivateMechanicmatchAnnouncement = delegate(() => this.mechanicMatchStorage, 'deactivateMechanicmatchAnnouncement');

  // ========================================
  // SOCKETRELAY OPERATIONS
  // ========================================

  createSocketrelayRequest = delegate(() => this.socketRelayStorage, 'createSocketrelayRequest');
  getActiveSocketrelayRequests = delegate(() => this.socketRelayStorage, 'getActiveSocketrelayRequests');
  getAllSocketrelayRequests = delegate(() => this.socketRelayStorage, 'getAllSocketrelayRequests');
  getSocketrelayRequestById = delegate(() => this.socketRelayStorage, 'getSocketrelayRequestById');
  getSocketrelayRequestsByUser = delegate(() => this.socketRelayStorage, 'getSocketrelayRequestsByUser');
  getPublicSocketrelayRequestById = delegate(() => this.socketRelayStorage, 'getPublicSocketrelayRequestById');
  listPublicSocketrelayRequests = delegate(() => this.socketRelayStorage, 'listPublicSocketrelayRequests');
  updateSocketrelayRequest = delegate(() => this.socketRelayStorage, 'updateSocketrelayRequest');
  updateSocketrelayRequestStatus = delegate(() => this.socketRelayStorage, 'updateSocketrelayRequestStatus');
  repostSocketrelayRequest = delegate(() => this.socketRelayStorage, 'repostSocketrelayRequest');
  deleteSocketrelayRequest = delegate(() => this.socketRelayStorage, 'deleteSocketrelayRequest');
  createSocketrelayFulfillment = delegate(() => this.socketRelayStorage, 'createSocketrelayFulfillment');
  getSocketrelayFulfillmentById = delegate(() => this.socketRelayStorage, 'getSocketrelayFulfillmentById');
  getSocketrelayFulfillmentsByRequest = delegate(() => this.socketRelayStorage, 'getSocketrelayFulfillmentsByRequest');
  getSocketrelayFulfillmentsByUser = delegate(() => this.socketRelayStorage, 'getSocketrelayFulfillmentsByUser');
  getAllSocketrelayFulfillments = delegate(() => this.socketRelayStorage, 'getAllSocketrelayFulfillments');
  closeSocketrelayFulfillment = delegate(() => this.socketRelayStorage, 'closeSocketrelayFulfillment');
  createSocketrelayMessage = delegate(() => this.socketRelayStorage, 'createSocketrelayMessage');
  getSocketrelayMessagesByFulfillment = delegate(() => this.socketRelayStorage, 'getSocketrelayMessagesByFulfillment');
  getSocketrelayProfile = delegate(() => this.socketRelayStorage, 'getSocketrelayProfile');
  createSocketrelayProfile = delegate(() => this.socketRelayStorage, 'createSocketrelayProfile');
  updateSocketrelayProfile = delegate(() => this.socketRelayStorage, 'updateSocketrelayProfile');
  createSocketrelayAnnouncement = delegate(() => this.socketRelayStorage, 'createSocketrelayAnnouncement');
  getActiveSocketrelayAnnouncements = delegate(() => this.socketRelayStorage, 'getActiveSocketrelayAnnouncements');
  getAllSocketrelayAnnouncements = delegate(() => this.socketRelayStorage, 'getAllSocketrelayAnnouncements');
  updateSocketrelayAnnouncement = delegate(() => this.socketRelayStorage, 'updateSocketrelayAnnouncement');
  deactivateSocketrelayAnnouncement = delegate(() => this.socketRelayStorage, 'deactivateSocketrelayAnnouncement');
  deleteSocketrelayProfile = delegate(() => this.socketRelayStorage, 'deleteSocketrelayProfile');

  // ========================================
  // DIRECTORY OPERATIONS
  // ========================================

  getDirectoryProfileById = delegate(() => this.directoryStorage, 'getDirectoryProfileById');
  getDirectoryProfileByUserId = delegate(() => this.directoryStorage, 'getDirectoryProfileByUserId');
  listAllDirectoryProfiles = delegate(() => this.directoryStorage, 'listAllDirectoryProfiles');
  listPublicDirectoryProfiles = delegate(() => this.directoryStorage, 'listPublicDirectoryProfiles');
  createDirectoryProfile = delegate(() => this.directoryStorage, 'createDirectoryProfile');
  updateDirectoryProfile = delegate(() => this.directoryStorage, 'updateDirectoryProfile');
  deleteDirectoryProfile = delegate(() => this.directoryStorage, 'deleteDirectoryProfile');
  createDirectoryAnnouncement = delegate(() => this.directoryStorage, 'createDirectoryAnnouncement');
  getActiveDirectoryAnnouncements = delegate(() => this.directoryStorage, 'getActiveDirectoryAnnouncements');
  getAllDirectoryAnnouncements = delegate(() => this.directoryStorage, 'getAllDirectoryAnnouncements');
  updateDirectoryAnnouncement = delegate(() => this.directoryStorage, 'updateDirectoryAnnouncement');
  deactivateDirectoryAnnouncement = delegate(() => this.directoryStorage, 'deactivateDirectoryAnnouncement');
  getAllDirectorySkills = delegate(() => this.directoryStorage, 'getAllDirectorySkills');
  createDirectorySkill = delegate(() => this.directoryStorage, 'createDirectorySkill');
  deleteDirectorySkill = delegate(() => this.directoryStorage, 'deleteDirectorySkill');
  deleteDirectoryProfileWithCascade = delegate(() => this.directoryStorage, 'deleteDirectoryProfileWithCascade');

  // ========================================
  // SKILLS OPERATIONS (Shared)
  // ========================================

  getAllSkillsSectors = delegate(() => this.skillsStorage, 'getAllSkillsSectors');
  getSkillsSectorById = delegate(() => this.skillsStorage, 'getSkillsSectorById');
  createSkillsSector = delegate(() => this.skillsStorage, 'createSkillsSector');
  updateSkillsSector = delegate(() => this.skillsStorage, 'updateSkillsSector');
  deleteSkillsSector = delegate(() => this.skillsStorage, 'deleteSkillsSector');
  getAllSkillsJobTitles = delegate(() => this.skillsStorage, 'getAllSkillsJobTitles');
  getSkillsJobTitleById = delegate(() => this.skillsStorage, 'getSkillsJobTitleById');
  createSkillsJobTitle = delegate(() => this.skillsStorage, 'createSkillsJobTitle');
  updateSkillsJobTitle = delegate(() => this.skillsStorage, 'updateSkillsJobTitle');
  deleteSkillsJobTitle = delegate(() => this.skillsStorage, 'deleteSkillsJobTitle');
  getAllSkillsSkills = delegate(() => this.skillsStorage, 'getAllSkillsSkills');
  getSkillsSkillById = delegate(() => this.skillsStorage, 'getSkillsSkillById');
  createSkillsSkill = delegate(() => this.skillsStorage, 'createSkillsSkill');
  updateSkillsSkill = delegate(() => this.skillsStorage, 'updateSkillsSkill');
  deleteSkillsSkill = delegate(() => this.skillsStorage, 'deleteSkillsSkill');
  getSkillsHierarchy = delegate(() => this.skillsStorage, 'getSkillsHierarchy');
  getAllSkillsFlattened = delegate(() => this.skillsStorage, 'getAllSkillsFlattened');

  // ========================================
  // RESEARCH OPERATIONS
  // ========================================

  createResearchItem = delegate(() => this.researchStorage, 'createResearchItem');
  getResearchItemById = delegate(() => this.researchStorage, 'getResearchItemById');
  getResearchItems = delegate(() => this.researchStorage, 'getResearchItems');
  updateResearchItem = delegate(() => this.researchStorage, 'updateResearchItem');
  incrementResearchItemViewCount = delegate(() => this.researchStorage, 'incrementResearchItemViewCount');
  acceptResearchAnswer = delegate(() => this.researchStorage, 'acceptResearchAnswer');
  createResearchAnswer = delegate(() => this.researchStorage, 'createResearchAnswer');
  getResearchAnswerById = delegate(() => this.researchStorage, 'getResearchAnswerById');
  getResearchAnswersByItemId = delegate(() => this.researchStorage, 'getResearchAnswersByItemId');
  updateResearchAnswer = delegate(() => this.researchStorage, 'updateResearchAnswer');
  calculateAnswerRelevance = delegate(() => this.researchStorage, 'calculateAnswerRelevance');
  updateAnswerScore = delegate(() => this.researchStorage, 'updateAnswerScore');
  createResearchComment = delegate(() => this.researchStorage, 'createResearchComment');
  getResearchComments = delegate(() => this.researchStorage, 'getResearchComments');
  updateResearchComment = delegate(() => this.researchStorage, 'updateResearchComment');
  deleteResearchComment = delegate(() => this.researchStorage, 'deleteResearchComment');
  createOrUpdateResearchVote = delegate(() => this.researchStorage, 'createOrUpdateResearchVote');
  getResearchVote = delegate(() => this.researchStorage, 'getResearchVote');
  deleteResearchVote = delegate(() => this.researchStorage, 'deleteResearchVote');
  createResearchLinkProvenance = delegate(() => this.researchStorage, 'createResearchLinkProvenance');
  getResearchLinkProvenancesByAnswerId = delegate(() => this.researchStorage, 'getResearchLinkProvenancesByAnswerId');
  updateResearchLinkProvenance = delegate(() => this.researchStorage, 'updateResearchLinkProvenance');
  calculateAnswerVerificationScore = delegate(() => this.researchStorage, 'calculateAnswerVerificationScore');
  createResearchBookmark = delegate(() => this.researchStorage, 'createResearchBookmark');
  deleteResearchBookmark = delegate(() => this.researchStorage, 'deleteResearchBookmark');
  getResearchBookmarks = delegate(() => this.researchStorage, 'getResearchBookmarks');
  createResearchFollow = delegate(() => this.researchStorage, 'createResearchFollow');
  deleteResearchFollow = delegate(() => this.researchStorage, 'deleteResearchFollow');
  getResearchFollows = delegate(() => this.researchStorage, 'getResearchFollows');
  createResearchReport = delegate(() => this.researchStorage, 'createResearchReport');
  getResearchReports = delegate(() => this.researchStorage, 'getResearchReports');
  updateResearchReport = delegate(() => this.researchStorage, 'updateResearchReport');
  createResearchAnnouncement = delegate(() => this.researchStorage, 'createResearchAnnouncement');
  getActiveResearchAnnouncements = delegate(() => this.researchStorage, 'getActiveResearchAnnouncements');
  getAllResearchAnnouncements = delegate(() => this.researchStorage, 'getAllResearchAnnouncements');
  updateResearchAnnouncement = delegate(() => this.researchStorage, 'updateResearchAnnouncement');
  deactivateResearchAnnouncement = delegate(() => this.researchStorage, 'deactivateResearchAnnouncement');
  getResearchTimeline = delegate(() => this.researchStorage, 'getResearchTimeline');
  getUserReputation = delegate(() => this.researchStorage, 'getUserReputation');

  // ========================================
  // LOSTMAIL OPERATIONS
  // ========================================

  createLostmailIncident = delegate(() => this.lostMailStorage, 'createLostmailIncident');
  getLostmailIncidentById = delegate(() => this.lostMailStorage, 'getLostmailIncidentById');
  getLostmailIncidentsByEmail = delegate(() => this.lostMailStorage, 'getLostmailIncidentsByEmail');
  getLostmailIncidents = delegate(() => this.lostMailStorage, 'getLostmailIncidents');
  updateLostmailIncident = delegate(() => this.lostMailStorage, 'updateLostmailIncident');
  createLostmailAuditTrailEntry = delegate(() => this.lostMailStorage, 'createLostmailAuditTrailEntry');
  getLostmailAuditTrailByIncident = delegate(() => this.lostMailStorage, 'getLostmailAuditTrailByIncident');
  createLostmailAnnouncement = delegate(() => this.lostMailStorage, 'createLostmailAnnouncement');
  getActiveLostmailAnnouncements = delegate(() => this.lostMailStorage, 'getActiveLostmailAnnouncements');
  getAllLostmailAnnouncements = delegate(() => this.lostMailStorage, 'getAllLostmailAnnouncements');
  updateLostmailAnnouncement = delegate(() => this.lostMailStorage, 'updateLostmailAnnouncement');
  deactivateLostmailAnnouncement = delegate(() => this.lostMailStorage, 'deactivateLostmailAnnouncement');

  // ========================================
  // TRUSTTRANSPORT OPERATIONS
  // ========================================

  getTrusttransportProfile = delegate(() => this.trustTransportStorage, 'getTrusttransportProfile');
  createTrusttransportProfile = delegate(() => this.trustTransportStorage, 'createTrusttransportProfile');
  updateTrusttransportProfile = delegate(() => this.trustTransportStorage, 'updateTrusttransportProfile');
  deleteTrusttransportProfile = delegate(() => this.trustTransportStorage, 'deleteTrusttransportProfile');
  createTrusttransportRideRequest = delegate(() => this.trustTransportStorage, 'createTrusttransportRideRequest');
  getTrusttransportRideRequestById = delegate(() => this.trustTransportStorage, 'getTrusttransportRideRequestById');
  getTrusttransportRideRequestsByRider = delegate(() => this.trustTransportStorage, 'getTrusttransportRideRequestsByRider');
  getOpenTrusttransportRideRequests = delegate(() => this.trustTransportStorage, 'getOpenTrusttransportRideRequests');
  getTrusttransportRideRequestsByDriver = delegate(() => this.trustTransportStorage, 'getTrusttransportRideRequestsByDriver');
  claimTrusttransportRideRequest = delegate(() => this.trustTransportStorage, 'claimTrusttransportRideRequest');
  updateTrusttransportRideRequest = delegate(() => this.trustTransportStorage, 'updateTrusttransportRideRequest');
  cancelTrusttransportRideRequest = delegate(() => this.trustTransportStorage, 'cancelTrusttransportRideRequest');
  createTrusttransportAnnouncement = delegate(() => this.trustTransportStorage, 'createTrusttransportAnnouncement');
  getActiveTrusttransportAnnouncements = delegate(() => this.trustTransportStorage, 'getActiveTrusttransportAnnouncements');
  getAllTrusttransportAnnouncements = delegate(() => this.trustTransportStorage, 'getAllTrusttransportAnnouncements');
  updateTrusttransportAnnouncement = delegate(() => this.trustTransportStorage, 'updateTrusttransportAnnouncement');
  deactivateTrusttransportAnnouncement = delegate(() => this.trustTransportStorage, 'deactivateTrusttransportAnnouncement');

  // ========================================
  // CHATGROUPS OPERATIONS
  // ========================================

  getAllChatGroups = delegate(() => this.chatGroupsStorage, 'getAllChatGroups');
  getActiveChatGroups = delegate(() => this.chatGroupsStorage, 'getActiveChatGroups');
  getChatGroupById = delegate(() => this.chatGroupsStorage, 'getChatGroupById');
  createChatGroup = delegate(() => this.chatGroupsStorage, 'createChatGroup');
  updateChatGroup = delegate(() => this.chatGroupsStorage, 'updateChatGroup');
  deleteChatGroup = delegate(() => this.chatGroupsStorage, 'deleteChatGroup');
  createChatgroupsAnnouncement = delegate(() => this.chatGroupsStorage, 'createChatgroupsAnnouncement');
  getActiveChatgroupsAnnouncements = delegate(() => this.chatGroupsStorage, 'getActiveChatgroupsAnnouncements');
  getAllChatgroupsAnnouncements = delegate(() => this.chatGroupsStorage, 'getAllChatgroupsAnnouncements');
  updateChatgroupsAnnouncement = delegate(() => this.chatGroupsStorage, 'updateChatgroupsAnnouncement');
  deactivateChatgroupsAnnouncement = delegate(() => this.chatGroupsStorage, 'deactivateChatgroupsAnnouncement');

  // ========================================
  // GENTLEPULSE OPERATIONS
  // ========================================

  createGentlepulseMeditation = delegate(() => this.gentlePulseStorage, 'createGentlepulseMeditation');
  getGentlepulseMeditations = delegate(() => this.gentlePulseStorage, 'getGentlepulseMeditations');
  getGentlepulseMeditationById = delegate(() => this.gentlePulseStorage, 'getGentlepulseMeditationById');
  updateGentlepulseMeditation = delegate(() => this.gentlePulseStorage, 'updateGentlepulseMeditation');
  incrementGentlepulsePlayCount = delegate(() => this.gentlePulseStorage, 'incrementGentlepulsePlayCount');
  createOrUpdateGentlepulseRating = delegate(() => this.gentlePulseStorage, 'createOrUpdateGentlepulseRating');
  getGentlepulseRatingsByMeditationId = delegate(() => this.gentlePulseStorage, 'getGentlepulseRatingsByMeditationId');
  getGentlepulseRatingByClientAndMeditation = delegate(() => this.gentlePulseStorage, 'getGentlepulseRatingByClientAndMeditation');
  updateGentlepulseMeditationRating = delegate(() => this.gentlePulseStorage, 'updateGentlepulseMeditationRating');
  createGentlepulseMoodCheck = delegate(() => this.gentlePulseStorage, 'createGentlepulseMoodCheck');
  getGentlepulseMoodChecksByClientId = delegate(() => this.gentlePulseStorage, 'getGentlepulseMoodChecksByClientId');
  getGentlepulseMoodChecksByDateRange = delegate(() => this.gentlePulseStorage, 'getGentlepulseMoodChecksByDateRange');
  createGentlepulseFavorite = delegate(() => this.gentlePulseStorage, 'createGentlepulseFavorite');
  deleteGentlepulseFavorite = delegate(() => this.gentlePulseStorage, 'deleteGentlepulseFavorite');
  getGentlepulseFavoritesByClientId = delegate(() => this.gentlePulseStorage, 'getGentlepulseFavoritesByClientId');
  isGentlepulseFavorite = delegate(() => this.gentlePulseStorage, 'isGentlepulseFavorite');
  createGentlepulseAnnouncement = delegate(() => this.gentlePulseStorage, 'createGentlepulseAnnouncement');
  getActiveGentlepulseAnnouncements = delegate(() => this.gentlePulseStorage, 'getActiveGentlepulseAnnouncements');
  getAllGentlepulseAnnouncements = delegate(() => this.gentlePulseStorage, 'getAllGentlepulseAnnouncements');
  updateGentlepulseAnnouncement = delegate(() => this.gentlePulseStorage, 'updateGentlepulseAnnouncement');
  deactivateGentlepulseAnnouncement = delegate(() => this.gentlePulseStorage, 'deactivateGentlepulseAnnouncement');

  // ========================================
  // CHYME OPERATIONS
  // ========================================

  createChymeAnnouncement = delegate(() => this.chymeStorage, 'createChymeAnnouncement');
  getActiveChymeAnnouncements = delegate(() => this.chymeStorage, 'getActiveChymeAnnouncements');
  getAllChymeAnnouncements = delegate(() => this.chymeStorage, 'getAllChymeAnnouncements');
  updateChymeAnnouncement = delegate(() => this.chymeStorage, 'updateChymeAnnouncement');
  deactivateChymeAnnouncement = delegate(() => this.chymeStorage, 'deactivateChymeAnnouncement');
  createChymeRoom = delegate(() => this.chymeStorage, 'createChymeRoom');
  getChymeRoom = delegate(() => this.chymeStorage, 'getChymeRoom');
  getChymeRooms = delegate(() => this.chymeStorage, 'getChymeRooms');
  updateChymeRoom = delegate(() => this.chymeStorage, 'updateChymeRoom');
  deactivateChymeRoom = delegate(() => this.chymeStorage, 'deactivateChymeRoom');
  updateChymeRoomPinnedLink = delegate(() => this.chymeStorage, 'updateChymeRoomPinnedLink');
  getChymeRoomParticipantCount = delegate(() => this.chymeStorage, 'getChymeRoomParticipantCount');
  joinChymeRoom = delegate(() => this.chymeStorage, 'joinChymeRoom');
  leaveChymeRoom = delegate(() => this.chymeStorage, 'leaveChymeRoom');
  getChymeRoomParticipants = delegate(() => this.chymeStorage, 'getChymeRoomParticipants');
  getChymeRoomParticipant = delegate(() => this.chymeStorage, 'getChymeRoomParticipant');
  updateChymeRoomParticipant = delegate(() => this.chymeStorage, 'updateChymeRoomParticipant');
  getActiveRoomsForUser = delegate(() => this.chymeStorage, 'getActiveRoomsForUser');
  followChymeUser = delegate(() => this.chymeStorage, 'followChymeUser');
  unfollowChymeUser = delegate(() => this.chymeStorage, 'unfollowChymeUser');
  isFollowingChymeUser = delegate(() => this.chymeStorage, 'isFollowingChymeUser');
  getChymeUserFollows = delegate(() => this.chymeStorage, 'getChymeUserFollows');
  blockChymeUser = delegate(() => this.chymeStorage, 'blockChymeUser');
  unblockChymeUser = delegate(() => this.chymeStorage, 'unblockChymeUser');
  isBlockingChymeUser = delegate(() => this.chymeStorage, 'isBlockingChymeUser');
  getChymeUserBlocks = delegate(() => this.chymeStorage, 'getChymeUserBlocks');
  createChymeMessage = delegate(() => this.chymeStorage, 'createChymeMessage');
  getChymeMessages = delegate(() => this.chymeStorage, 'getChymeMessages');

  // ========================================
  // WORKFORCE RECRUITER OPERATIONS
  // ========================================

  getWorkforceRecruiterProfile = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterProfile');
  createWorkforceRecruiterProfile = delegate(() => this.workforceRecruiterStorage, 'createWorkforceRecruiterProfile');
  updateWorkforceRecruiterProfile = delegate(() => this.workforceRecruiterStorage, 'updateWorkforceRecruiterProfile');
  deleteWorkforceRecruiterProfile = delegate(() => this.workforceRecruiterStorage, 'deleteWorkforceRecruiterProfile');
  getWorkforceRecruiterConfig = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterConfig');
  updateWorkforceRecruiterConfig = delegate(() => this.workforceRecruiterStorage, 'updateWorkforceRecruiterConfig');
  createWorkforceRecruiterConfig = delegate(() => this.workforceRecruiterStorage, 'createWorkforceRecruiterConfig');
  getWorkforceRecruiterOccupation = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterOccupation');
  getAllWorkforceRecruiterOccupations = delegate(() => this.workforceRecruiterStorage, 'getAllWorkforceRecruiterOccupations');
  createWorkforceRecruiterOccupation = delegate(() => this.workforceRecruiterStorage, 'createWorkforceRecruiterOccupation');
  updateWorkforceRecruiterOccupation = delegate(() => this.workforceRecruiterStorage, 'updateWorkforceRecruiterOccupation');
  deleteWorkforceRecruiterOccupation = delegate(() => this.workforceRecruiterStorage, 'deleteWorkforceRecruiterOccupation');
  createWorkforceRecruiterMeetupEvent = delegate(() => this.workforceRecruiterStorage, 'createWorkforceRecruiterMeetupEvent');
  getWorkforceRecruiterMeetupEvents = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterMeetupEvents');
  getWorkforceRecruiterMeetupEventById = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterMeetupEventById');
  updateWorkforceRecruiterMeetupEvent = delegate(() => this.workforceRecruiterStorage, 'updateWorkforceRecruiterMeetupEvent');
  deleteWorkforceRecruiterMeetupEvent = delegate(() => this.workforceRecruiterStorage, 'deleteWorkforceRecruiterMeetupEvent');
  createWorkforceRecruiterMeetupEventSignup = delegate(() => this.workforceRecruiterStorage, 'createWorkforceRecruiterMeetupEventSignup');
  getWorkforceRecruiterMeetupEventSignups = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterMeetupEventSignups');
  getWorkforceRecruiterMeetupEventSignupCount = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterMeetupEventSignupCount');
  getUserMeetupEventSignup = delegate(() => this.workforceRecruiterStorage, 'getUserMeetupEventSignup');
  updateWorkforceRecruiterMeetupEventSignup = delegate(() => this.workforceRecruiterStorage, 'updateWorkforceRecruiterMeetupEventSignup');
  deleteWorkforceRecruiterMeetupEventSignup = delegate(() => this.workforceRecruiterStorage, 'deleteWorkforceRecruiterMeetupEventSignup');
  getWorkforceRecruiterSummaryReport = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterSummaryReport');
  getWorkforceRecruiterSkillLevelDetail = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterSkillLevelDetail');
  getWorkforceRecruiterSectorDetail = delegate(() => this.workforceRecruiterStorage, 'getWorkforceRecruiterSectorDetail');
  createWorkforceRecruiterAnnouncement = delegate(() => this.workforceRecruiterStorage, 'createWorkforceRecruiterAnnouncement');
  getActiveWorkforceRecruiterAnnouncements = delegate(() => this.workforceRecruiterStorage, 'getActiveWorkforceRecruiterAnnouncements');
  getAllWorkforceRecruiterAnnouncements = delegate(() => this.workforceRecruiterStorage, 'getAllWorkforceRecruiterAnnouncements');
  updateWorkforceRecruiterAnnouncement = delegate(() => this.workforceRecruiterStorage, 'updateWorkforceRecruiterAnnouncement');
  deactivateWorkforceRecruiterAnnouncement = delegate(() => this.workforceRecruiterStorage, 'deactivateWorkforceRecruiterAnnouncement');

  // ========================================
  // BLOG OPERATIONS
  // ========================================

  getPublishedBlogPosts = delegate(() => this.blogStorage, 'getPublishedBlogPosts');
  getBlogPostBySlug = delegate(() => this.blogStorage, 'getBlogPostBySlug');
  getAllBlogPosts = delegate(() => this.blogStorage, 'getAllBlogPosts');
  createBlogPost = delegate(() => this.blogStorage, 'createBlogPost');
  updateBlogPost = delegate(() => this.blogStorage, 'updateBlogPost');
  deleteBlogPost = delegate(() => this.blogStorage, 'deleteBlogPost');
  getBlogCommentsForTopic = delegate(() => this.blogStorage, 'getBlogCommentsForTopic');
  createBlogAnnouncement = delegate(() => this.blogStorage, 'createBlogAnnouncement');
  getActiveBlogAnnouncements = delegate(() => this.blogStorage, 'getActiveBlogAnnouncements');
  getAllBlogAnnouncements = delegate(() => this.blogStorage, 'getAllBlogAnnouncements');
  updateBlogAnnouncement = delegate(() => this.blogStorage, 'updateBlogAnnouncement');
  deactivateBlogAnnouncement = delegate(() => this.blogStorage, 'deactivateBlogAnnouncement');

  // ========================================
  // DEFAULT ALIVE OR DEAD OPERATIONS
  // ========================================

  createDefaultAliveOrDeadFinancialEntry = delegate(() => this.defaultAliveOrDeadStorage, 'createDefaultAliveOrDeadFinancialEntry');
  getDefaultAliveOrDeadFinancialEntry = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadFinancialEntry');
  getDefaultAliveOrDeadFinancialEntries = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadFinancialEntries');
  updateDefaultAliveOrDeadFinancialEntry = delegate(() => this.defaultAliveOrDeadStorage, 'updateDefaultAliveOrDeadFinancialEntry');
  deleteDefaultAliveOrDeadFinancialEntry = delegate(() => this.defaultAliveOrDeadStorage, 'deleteDefaultAliveOrDeadFinancialEntry');
  getDefaultAliveOrDeadFinancialEntryByWeek = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadFinancialEntryByWeek');
  calculateAndStoreEbitdaSnapshot = delegate(() => this.defaultAliveOrDeadStorage, 'calculateAndStoreEbitdaSnapshot');
  getDefaultAliveOrDeadEbitdaSnapshot = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadEbitdaSnapshot');
  getDefaultAliveOrDeadEbitdaSnapshots = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadEbitdaSnapshots');
  getDefaultAliveOrDeadCurrentStatus = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadCurrentStatus');
  getDefaultAliveOrDeadWeeklyTrends = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadWeeklyTrends');
  getDefaultAliveOrDeadWeekComparison = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadWeekComparison');
  getDefaultAliveOrDeadCurrentFunding = delegate(() => this.defaultAliveOrDeadStorage, 'getDefaultAliveOrDeadCurrentFunding');
  updateDefaultAliveOrDeadCurrentFunding = delegate(() => this.defaultAliveOrDeadStorage, 'updateDefaultAliveOrDeadCurrentFunding');
}
