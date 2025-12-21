/**
 * Core Storage Composed
 * 
 * Handles delegation of core storage operations (users, auth, payments, etc.)
 */

import type { ICoreStorage } from '../types/core-storage.interface';
import { CoreStorage } from '../core';

export class CoreStorageComposed implements ICoreStorage {
  private coreStorage: CoreStorage;

  constructor() {
    this.coreStorage = new CoreStorage();
  }

  // User operations
  async getUser(id: string) {
    return this.coreStorage.getUser(id);
  }

  async upsertUser(user: any) {
    return this.coreStorage.upsertUser(user);
  }

  async getAllUsers() {
    return this.coreStorage.getAllUsers();
  }

  async updateUserVerification(userId: string, isVerified: boolean) {
    return this.coreStorage.updateUserVerification(userId, isVerified);
  }

  async updateUserApproval(userId: string, isApproved: boolean) {
    return this.coreStorage.updateUserApproval(userId, isApproved);
  }

  async updateTermsAcceptance(userId: string) {
    return this.coreStorage.updateTermsAcceptance(userId);
  }

  async updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null) {
    return this.coreStorage.updateUserQuoraProfileUrl(userId, quoraProfileUrl);
  }

  async updateUserName(userId: string, firstName: string | null, lastName: string | null) {
    return this.coreStorage.updateUserName(userId, firstName, lastName);
  }

  // OTP code methods
  async createOTPCode(userId: string, code: string, expiresAt: Date) {
    return this.coreStorage.createOTPCode(userId, code, expiresAt);
  }

  async findOTPCodeByCode(code: string) {
    return this.coreStorage.findOTPCodeByCode(code);
  }

  async deleteOTPCode(userId: string) {
    return this.coreStorage.deleteOTPCode(userId);
  }

  async deleteExpiredOTPCodes() {
    return this.coreStorage.deleteExpiredOTPCodes();
  }

  // Auth token methods
  async createAuthToken(token: string, userId: string, expiresAt: Date) {
    return this.coreStorage.createAuthToken(token, userId, expiresAt);
  }

  async findAuthTokenByToken(token: string) {
    return this.coreStorage.findAuthTokenByToken(token);
  }

  async deleteAuthToken(token: string) {
    return this.coreStorage.deleteAuthToken(token);
  }

  async deleteExpiredAuthTokens() {
    return this.coreStorage.deleteExpiredAuthTokens();
  }

  // Pricing tier operations
  async getCurrentPricingTier() {
    return this.coreStorage.getCurrentPricingTier();
  }

  async getAllPricingTiers() {
    return this.coreStorage.getAllPricingTiers();
  }

  async createPricingTier(tier: any) {
    return this.coreStorage.createPricingTier(tier);
  }

  async setCurrentPricingTier(id: string) {
    return this.coreStorage.setCurrentPricingTier(id);
  }

  // Payment operations
  async createPayment(payment: any) {
    return this.coreStorage.createPayment(payment);
  }

  async getPaymentsByUser(userId: string) {
    return this.coreStorage.getPaymentsByUser(userId);
  }

  async getAllPayments() {
    return this.coreStorage.getAllPayments();
  }

  async getUserPaymentStatus(userId: string) {
    return this.coreStorage.getUserPaymentStatus(userId);
  }

  async getDelinquentUsers() {
    return this.coreStorage.getDelinquentUsers();
  }

  // Admin action log operations
  async createAdminActionLog(log: any) {
    return this.coreStorage.createAdminActionLog(log);
  }

  async getAllAdminActionLogs() {
    return this.coreStorage.getAllAdminActionLogs();
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
    return this.coreStorage.createNpsResponse(response);
  }

  async getUserLastNpsResponse(userId: string) {
    return this.coreStorage.getUserLastNpsResponse(userId);
  }

  async getNpsResponsesForWeek(weekStart: Date, weekEnd: Date) {
    return this.coreStorage.getNpsResponsesForWeek(weekStart, weekEnd);
  }

  async getAllNpsResponses() {
    return this.coreStorage.getAllNpsResponses();
  }

  // User deletion operations
  async anonymizeUserData(userId: string) {
    return this.coreStorage.anonymizeUserData(userId);
  }

  async deleteUser(userId: string) {
    return this.coreStorage.deleteUser(userId);
  }

  // Helper methods for Weekly Performance Review
  // These are accessed via closure in getWeeklyPerformanceReview
  private async getDefaultAliveOrDeadEbitdaSnapshot(weekStart: Date) {
    // This will be provided by the main DatabaseStorage class
    throw new Error('getDefaultAliveOrDeadEbitdaSnapshot must be provided by DatabaseStorage');
  }
}

