/**
 * Core Storage Module
 * 
 * Composes domain-specific storage modules for core app operations.
 * This class aggregates user, auth, pricing, payment, admin, NPS, analytics, and deletion operations.
 */

import { UserStorage } from "./user-storage";
import { AuthStorage } from "./auth-storage";
import { PricingStorage } from "./pricing-storage";
import { PaymentStorage } from "./payment-storage";
import { AdminStorage } from "./admin-storage";
import { NpsStorage } from "./nps-storage";
import { AnalyticsStorage } from "./analytics-storage";
import { UserDeletionStorage } from "./user-deletion-storage";
import type {
  User,
  UpsertUser,
  OTPCode,
  InsertOTPCode,
  AuthToken,
  InsertAuthToken,
  PricingTier,
  InsertPricingTier,
  Payment,
  InsertPayment,
  AdminActionLog,
  InsertAdminActionLog,
  NpsResponse,
  InsertNpsResponse,
} from "@shared/schema";

export class CoreStorage {
  private userStorage: UserStorage;
  private authStorage: AuthStorage;
  private pricingStorage: PricingStorage;
  private paymentStorage: PaymentStorage;
  private adminStorage: AdminStorage;
  private npsStorage: NpsStorage;
  private analyticsStorage: AnalyticsStorage;
  private userDeletionStorage: UserDeletionStorage;

  constructor() {
    this.userStorage = new UserStorage();
    this.authStorage = new AuthStorage();
    this.pricingStorage = new PricingStorage();
    this.paymentStorage = new PaymentStorage(
      (id) => this.userStorage.getUser(id),
      () => this.userStorage.getAllUsers()
    );
    this.adminStorage = new AdminStorage();
    this.npsStorage = new NpsStorage();
    this.analyticsStorage = new AnalyticsStorage();
    this.userDeletionStorage = new UserDeletionStorage();
  }

  // ========================================
  // USER OPERATIONS (delegated to UserStorage)
  // ========================================

  async getUser(id: string): Promise<User | undefined> {
    return this.userStorage.getUser(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return this.userStorage.upsertUser(userData);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userStorage.getAllUsers();
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<User> {
    return this.userStorage.updateUserVerification(userId, isVerified);
  }

  async updateUserApproval(userId: string, isApproved: boolean): Promise<User> {
    return this.userStorage.updateUserApproval(userId, isApproved);
  }

  async updateTermsAcceptance(userId: string): Promise<User> {
    return this.userStorage.updateTermsAcceptance(userId);
  }

  async updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null): Promise<User> {
    return this.userStorage.updateUserQuoraProfileUrl(userId, quoraProfileUrl);
  }

  async updateUserName(userId: string, firstName: string | null, lastName: string | null): Promise<User> {
    return this.userStorage.updateUserName(userId, firstName, lastName);
  }

  // ========================================
  // OTP CODE OPERATIONS (delegated to AuthStorage)
  // ========================================

  async createOTPCode(userId: string, code: string, expiresAt: Date): Promise<OTPCode> {
    return this.authStorage.createOTPCode(userId, code, expiresAt);
  }
  
  async findOTPCodeByCode(code: string): Promise<OTPCode | undefined> {
    return this.authStorage.findOTPCodeByCode(code);
  }
  
  async deleteOTPCode(userId: string): Promise<void> {
    return this.authStorage.deleteOTPCode(userId);
  }
  
  async deleteExpiredOTPCodes(): Promise<void> {
    return this.authStorage.deleteExpiredOTPCodes();
  }

  // ========================================
  // AUTH TOKEN OPERATIONS (delegated to AuthStorage)
  // ========================================

  async createAuthToken(token: string, userId: string, expiresAt: Date): Promise<AuthToken> {
    return this.authStorage.createAuthToken(token, userId, expiresAt);
  }
  
  async findAuthTokenByToken(token: string): Promise<AuthToken | undefined> {
    return this.authStorage.findAuthTokenByToken(token);
  }
  
  async deleteAuthToken(token: string): Promise<void> {
    return this.authStorage.deleteAuthToken(token);
  }
  
  async deleteExpiredAuthTokens(): Promise<void> {
    return this.authStorage.deleteExpiredAuthTokens();
  }

  // ========================================
  // PRICING TIER OPERATIONS (delegated to PricingStorage)
  // ========================================

  async getCurrentPricingTier(): Promise<PricingTier | undefined> {
    return this.pricingStorage.getCurrentPricingTier();
  }

  async getAllPricingTiers(): Promise<PricingTier[]> {
    return this.pricingStorage.getAllPricingTiers();
  }

  async createPricingTier(tierData: InsertPricingTier): Promise<PricingTier> {
    return this.pricingStorage.createPricingTier(tierData);
  }

  async setCurrentPricingTier(id: string): Promise<PricingTier> {
    return this.pricingStorage.setCurrentPricingTier(id);
  }

  // ========================================
  // PAYMENT OPERATIONS (delegated to PaymentStorage)
  // ========================================

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    return this.paymentStorage.createPayment(paymentData);
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.paymentStorage.getPaymentsByUser(userId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentStorage.getAllPayments();
  }

  async getUserPaymentStatus(userId: string): Promise<{
    isDelinquent: boolean;
    missingMonths: string[];
    nextBillingDate: string | null;
    amountOwed: string;
    gracePeriodEnds?: string;
  }> {
    return this.paymentStorage.getUserPaymentStatus(userId);
  }

  async getDelinquentUsers(): Promise<Array<{
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    missingMonths: string[];
    amountOwed: string;
    lastPaymentDate: Date | null;
  }>> {
    return this.paymentStorage.getDelinquentUsers();
  }

  // ========================================
  // ADMIN ACTION LOG OPERATIONS (delegated to AdminStorage)
  // ========================================

  async createAdminActionLog(logData: InsertAdminActionLog): Promise<AdminActionLog> {
    return this.adminStorage.createAdminActionLog(logData);
  }

  async getAllAdminActionLogs(): Promise<AdminActionLog[]> {
    return this.adminStorage.getAllAdminActionLogs();
  }

  async getAdminStats() {
    return this.adminStorage.getAdminStats();
  }

  // ========================================
  // NPS OPERATIONS (delegated to NpsStorage)
  // ========================================

  async createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse> {
    return this.npsStorage.createNpsResponse(response);
  }

  async getUserLastNpsResponse(userId: string): Promise<NpsResponse | undefined> {
    return this.npsStorage.getUserLastNpsResponse(userId);
  }

  async getNpsResponsesForWeek(weekStart: Date, weekEnd: Date): Promise<NpsResponse[]> {
    return this.npsStorage.getNpsResponsesForWeek(weekStart, weekEnd);
  }

  async getAllNpsResponses(): Promise<NpsResponse[]> {
    return this.npsStorage.getAllNpsResponses();
  }

  // ========================================
  // WEEKLY PERFORMANCE REVIEW (delegated to AnalyticsStorage)
  // ========================================

  async getWeeklyPerformanceReview(
    weekStart: Date,
    getNpsResponsesForWeekFn: (weekStart: Date, weekEnd: Date) => Promise<NpsResponse[]>,
    getDefaultAliveOrDeadEbitdaSnapshotFn?: (weekStart: Date) => Promise<any>
  ): Promise<{
    currentWeek: {
      startDate: string;
      endDate: string;
      newUsers: number;
      dailyActiveUsers: Array<{ date: string; count: number }>;
      revenue: number;
      dailyRevenue: Array<{ date: string; amount: number }>;
      totalUsers: number;
      verifiedUsers: number;
      approvedUsers: number;
      isDefaultAlive: boolean | null;
    };
    previousWeek: {
      startDate: string;
      endDate: string;
      newUsers: number;
      dailyActiveUsers: Array<{ date: string; count: number }>;
      revenue: number;
      dailyRevenue: Array<{ date: string; amount: number }>;
      totalUsers: number;
      verifiedUsers: number;
      approvedUsers: number;
      isDefaultAlive: boolean | null;
    };
    comparison: {
      newUsersChange: number;
      revenueChange: number;
      totalUsersChange: number;
      verifiedUsersChange: number;
      approvedUsersChange: number;
    };
    metrics: {
      weeklyGrowthRate: number;
      mrr: number;
      arr: number;
      mrrGrowth: number;
      mau: number;
      churnRate: number;
      clv: number;
      retentionRate: number;
      nps: number;
      npsChange: number;
      npsResponses: number;
      verifiedUsersPercentage: number;
      verifiedUsersPercentageChange: number;
      averageMood: number;
      moodChange: number;
      moodResponses: number;
    };
  }> {
    // Use the NPS storage method for the callback
    const npsCallback = (weekStart: Date, weekEnd: Date) => 
      this.npsStorage.getNpsResponsesForWeek(weekStart, weekEnd);
    
    return this.analyticsStorage.getWeeklyPerformanceReview(
      weekStart,
      npsCallback,
      getDefaultAliveOrDeadEbitdaSnapshotFn
    );
  }

  // ========================================
  // USER DELETION OPERATIONS (delegated to UserDeletionStorage)
  // ========================================

  /**
   * Anonymizes all core user data before account deletion
   */
  async anonymizeUserData(userId: string): Promise<void> {
    return this.userDeletionStorage.anonymizeUserData(userId);
  }

  /**
   * Deletes a user account from the users table
   */
  async deleteUser(userId: string): Promise<void> {
    return this.userDeletionStorage.deleteUser(userId);
  }
}
