/**
 * Core Storage Interface
 * 
 * Defines core operations for users, authentication, payments, and admin functions.
 */

import type {
  User,
  UpsertUser,
  OTPCode,
  AuthToken,
  PricingTier,
  InsertPricingTier,
  Payment,
  InsertPayment,
  AdminActionLog,
  InsertAdminActionLog,
  NpsResponse,
  InsertNpsResponse,
} from "@shared/schema";

export interface ICoreStorage {
  // User operations (IMPORTANT: mandatory for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserVerification(userId: string, isVerified: boolean): Promise<User>;
  updateUserApproval(userId: string, isApproved: boolean): Promise<User>;
  updateTermsAcceptance(userId: string): Promise<User>;
  updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null): Promise<User>;
  updateUserName(userId: string, firstName: string | null, lastName: string | null): Promise<User>;
  
  // OTP code methods
  createOTPCode(userId: string, code: string, expiresAt: Date): Promise<OTPCode>;
  findOTPCodeByCode(code: string): Promise<OTPCode | undefined>;
  deleteOTPCode(userId: string): Promise<void>;
  deleteExpiredOTPCodes(): Promise<void>;
  
  // Auth token methods
  createAuthToken(token: string, userId: string, expiresAt: Date): Promise<AuthToken>;
  findAuthTokenByToken(token: string): Promise<AuthToken | undefined>;
  deleteAuthToken(token: string): Promise<void>;
  deleteExpiredAuthTokens(): Promise<void>;
  
  // Pricing tier operations
  getCurrentPricingTier(): Promise<PricingTier | undefined>;
  getAllPricingTiers(): Promise<PricingTier[]>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  setCurrentPricingTier(id: string): Promise<PricingTier>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  getUserPaymentStatus(userId: string): Promise<{
    isDelinquent: boolean;
    missingMonths: string[];
    nextBillingDate: string | null;
    amountOwed: string;
    gracePeriodEnds?: string;
  }>;
  getDelinquentUsers(): Promise<Array<{
    userId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    missingMonths: string[];
    amountOwed: string;
    lastPaymentDate: Date | null;
  }>>;
  
  // Admin action log operations
  createAdminActionLog(log: InsertAdminActionLog): Promise<AdminActionLog>;
  getAllAdminActionLogs(): Promise<AdminActionLog[]>;
  
  // Weekly Performance Review
  getWeeklyPerformanceReview(weekStart: Date): Promise<{
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
  }>;
  
  // NPS (Net Promoter Score) operations
  createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse>;
  getUserLastNpsResponse(userId: string): Promise<NpsResponse | undefined>;
  getNpsResponsesForWeek(weekStart: Date, weekEnd: Date): Promise<NpsResponse[]>;
  getAllNpsResponses(): Promise<NpsResponse[]>;
}

