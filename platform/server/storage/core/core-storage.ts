/**
 * Core Storage Module
 * 
 * Handles core app operations: users, authentication, pricing, payments, admin logs, 
 * weekly performance review, and NPS responses.
 */

import {
  users,
  loginEvents,
  otpCodes,
  authTokens,
  pricingTiers,
  payments,
  adminActionLogs,
  npsResponses,
  gentlepulseMoodChecks,
  type User,
  type UpsertUser,
  type OTPCode,
  type InsertOTPCode,
  type AuthToken,
  type InsertAuthToken,
  type PricingTier,
  type InsertPricingTier,
  type Payment,
  type InsertPayment,
  type AdminActionLog,
  type InsertAdminActionLog,
  type NpsResponse,
  type InsertNpsResponse,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, gte, lte, lt } from "drizzle-orm";
import { NotFoundError, normalizeError } from "../errors";
import { logError } from "../errorLogger";
import { getWeekStart, getWeekEnd, formatDate, getDaysInWeek } from "./utils";

export class CoreStorage {
  // ========================================
  // USER OPERATIONS
  // ========================================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, try to find existing user by ID (primary key)
    let existingUser: User | undefined;
    
    if (userData.id) {
      existingUser = await this.getUser(userData.id);
    }
    
    if (existingUser) {
      // User exists with same ID - update normally
      const [updated] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updated;
    }
    
    // User doesn't exist by ID - try to insert
    // If there's a unique constraint violation on email, handle it
    try {
      const [inserted] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return inserted;
    } catch (error: any) {
      // Handle unique constraint violation on email (PostgreSQL error code 23505)
      if (error?.code === '23505' && error?.constraint?.includes('email')) {
        // User exists with same email but different ID
        // Find the user by email and update them
        if (userData.email) {
          const [userByEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, userData.email));
          
          if (userByEmail) {
            // Update the existing user with the new data
            const [updated] = await db
              .update(users)
              .set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                quoraProfileUrl: userData.quoraProfileUrl,
                updatedAt: new Date(),
                // Preserve existing fields that weren't provided
                pricingTier: userData.pricingTier ?? userByEmail.pricingTier,
                isAdmin: userData.isAdmin ?? userByEmail.isAdmin,
                isVerified: userData.isVerified ?? userByEmail.isVerified,
                isApproved: userData.isApproved ?? userByEmail.isApproved,
                subscriptionStatus: userData.subscriptionStatus ?? userByEmail.subscriptionStatus,
              })
              .where(eq(users.id, userByEmail.id))
              .returning();
            return updated;
          }
        }
      }
      // Re-throw if it's not a unique email constraint violation
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<User> {
    // Update user verification
    const [user] = await db
      .update(users)
      .set({ 
        isVerified: !!isVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundError("User");
    }

    // Note: Profile verification updates are handled in profile deletion module
    // to avoid circular dependencies

    return user;
  }

  async updateUserApproval(userId: string, isApproved: boolean): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          isApproved: !!isApproved,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new NotFoundError("User");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  async updateTermsAcceptance(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        termsAcceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          quoraProfileUrl: quoraProfileUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new NotFoundError("User");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  async updateUserName(userId: string, firstName: string | null, lastName: string | null): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          firstName: firstName || null,
          lastName: lastName || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new NotFoundError("User");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  // ========================================
  // OTP CODE OPERATIONS
  // ========================================

  async createOTPCode(userId: string, code: string, expiresAt: Date): Promise<OTPCode> {
    // Delete any existing OTP for this user first
    await db.delete(otpCodes).where(eq(otpCodes.userId, userId));
    
    // Create new OTP
    const [otp] = await db.insert(otpCodes).values({
      userId,
      code,
      expiresAt,
    }).returning();
    
    return otp;
  }
  
  async findOTPCodeByCode(code: string): Promise<OTPCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.code, code))
      .limit(1);
    return otp;
  }
  
  async deleteOTPCode(userId: string): Promise<void> {
    await db.delete(otpCodes).where(eq(otpCodes.userId, userId));
  }
  
  async deleteExpiredOTPCodes(): Promise<void> {
    const now = new Date();
    await db.delete(otpCodes).where(lt(otpCodes.expiresAt, now));
  }

  // ========================================
  // AUTH TOKEN OPERATIONS
  // ========================================

  async createAuthToken(token: string, userId: string, expiresAt: Date): Promise<AuthToken> {
    const [authToken] = await db.insert(authTokens).values({
      token,
      userId,
      expiresAt,
    }).returning();
    
    return authToken;
  }
  
  async findAuthTokenByToken(token: string): Promise<AuthToken | undefined> {
    const [authToken] = await db
      .select()
      .from(authTokens)
      .where(eq(authTokens.token, token))
      .limit(1);
    return authToken;
  }
  
  async deleteAuthToken(token: string): Promise<void> {
    await db.delete(authTokens).where(eq(authTokens.token, token));
  }
  
  async deleteExpiredAuthTokens(): Promise<void> {
    const now = new Date();
    await db.delete(authTokens).where(lt(authTokens.expiresAt, now));
  }

  // ========================================
  // PRICING TIER OPERATIONS
  // ========================================

  async getCurrentPricingTier(): Promise<PricingTier | undefined> {
    const [tier] = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.isCurrentTier, true))
      .orderBy(desc(pricingTiers.effectiveDate))
      .limit(1);
    return tier;
  }

  async getAllPricingTiers(): Promise<PricingTier[]> {
    return await db
      .select()
      .from(pricingTiers)
      .orderBy(desc(pricingTiers.effectiveDate));
  }

  async createPricingTier(tierData: InsertPricingTier): Promise<PricingTier> {
    // If this is set as the current tier, unset all others
    if (tierData.isCurrentTier) {
      await db
        .update(pricingTiers)
        .set({ isCurrentTier: false })
        .where(eq(pricingTiers.isCurrentTier, true));
    }

    const [tier] = await db
      .insert(pricingTiers)
      .values(tierData)
      .returning();
    return tier;
  }

  async setCurrentPricingTier(id: string): Promise<PricingTier> {
    // Unset all current tiers
    await db
      .update(pricingTiers)
      .set({ isCurrentTier: false })
      .where(eq(pricingTiers.isCurrentTier, true));

    // Set the specified tier as current
    const [tier] = await db
      .update(pricingTiers)
      .set({ isCurrentTier: true })
      .where(eq(pricingTiers.id, id))
      .returning();
    
    return tier;
  }

  // ========================================
  // PAYMENT OPERATIONS
  // ========================================

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    console.log("Creating payment with data:", JSON.stringify(paymentData, null, 2));
    
    // Explicitly build the values object to ensure all fields are included
    const values: any = {
      userId: paymentData.userId,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      billingPeriod: paymentData.billingPeriod,
      notes: paymentData.notes ?? null,
      recordedBy: paymentData.recordedBy,
    };
    
    // Include billingMonth for monthly payments
    if ('billingMonth' in paymentData) {
      values.billingMonth = paymentData.billingMonth ?? null;
    } else {
      values.billingMonth = null;
    }
    
    // Include yearly subscription dates for yearly payments
    if ('yearlyStartMonth' in paymentData) {
      values.yearlyStartMonth = paymentData.yearlyStartMonth ?? null;
    } else {
      values.yearlyStartMonth = null;
    }
    
    if ('yearlyEndMonth' in paymentData) {
      values.yearlyEndMonth = paymentData.yearlyEndMonth ?? null;
    } else {
      values.yearlyEndMonth = null;
    }
    
    console.log("Inserting with values:", JSON.stringify(values, null, 2));
    
    const [payment] = await db
      .insert(payments)
      .values(values)
      .returning();
    
    console.log("Created payment:", JSON.stringify(payment, null, 2));
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.paymentDate));
  }

  async getUserPaymentStatus(userId: string): Promise<{
    isDelinquent: boolean;
    missingMonths: string[];
    nextBillingDate: string | null;
    amountOwed: string;
    gracePeriodEnds?: string;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    const userPayments = await this.getPaymentsByUser(userId);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Check for yearly subscription coverage
    const activeYearlyPayment = userPayments.find(p => {
      if (p.billingPeriod !== 'yearly' || !p.yearlyStartMonth || !p.yearlyEndMonth) {
        return false;
      }
      const start = new Date(p.yearlyStartMonth + '-01');
      const end = new Date(p.yearlyEndMonth + '-01');
      // Set end to last day of the month
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      return now >= start && now <= end;
    });

    // If user has active yearly subscription, they're not delinquent
    if (activeYearlyPayment) {
      const endDate = new Date(activeYearlyPayment.yearlyEndMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      const nextBilling = new Date(endDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      nextBilling.setDate(1);
      
      return {
        isDelinquent: false,
        missingMonths: [],
        nextBillingDate: nextBilling.toISOString().split('T')[0],
        amountOwed: '0.00',
      };
    }

    // For monthly payments, check which months are missing
    const paidMonths = new Set<string>();
    userPayments.forEach(payment => {
      if (payment.billingPeriod === 'monthly' && payment.billingMonth) {
        paidMonths.add(payment.billingMonth);
      }
    });

    // Calculate billing months starting from user's signup date
    const signupDate = user.createdAt;
    const signupMonth = new Date(signupDate.getFullYear(), signupDate.getMonth(), 1);
    const signupMonthStr = `${signupMonth.getFullYear()}-${String(signupMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate all expected billing months from signup to last month (current month not due yet)
    const expectedMonths: string[] = [];
    const checkDate = new Date(signupMonth);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    while (checkDate <= lastMonthDate) {
      const monthStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
      expectedMonths.push(monthStr);
      // Move to next month
      checkDate.setMonth(checkDate.getMonth() + 1);
    }
    
    // Find missing months (expected months that haven't been paid)
    const missingMonths: string[] = expectedMonths.filter(month => !paidMonths.has(month));
    const monthlyRate = parseFloat(user.pricingTier);

    // Grace period: 15 days into current month
    const gracePeriodEnds = new Date(now.getFullYear(), now.getMonth(), 15);
    const isInGracePeriod = now <= gracePeriodEnds;

    // User is delinquent if they have missing months and grace period has passed
    const isDelinquent = missingMonths.length > 0 && !isInGracePeriod;
    
    // Calculate amount owed (only for actually missing months)
    const amountOwed = (missingMonths.length * monthlyRate).toFixed(2);
    
    // Next billing date is first of next month
    const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      isDelinquent,
      missingMonths,
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      amountOwed,
      gracePeriodEnds: isInGracePeriod ? gracePeriodEnds.toISOString().split('T')[0] : undefined,
    };
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
    const allUsers = await this.getAllUsers();
    const delinquentUsers: Array<{
      userId: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      missingMonths: string[];
      amountOwed: string;
      lastPaymentDate: Date | null;
    }> = [];

    for (const user of allUsers) {
      const status = await this.getUserPaymentStatus(user.id);
      if (status.isDelinquent) {
        const userPayments = await this.getPaymentsByUser(user.id);
        const lastPayment = userPayments.length > 0 
          ? userPayments[0].paymentDate 
          : null;

        delinquentUsers.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          missingMonths: status.missingMonths,
          amountOwed: status.amountOwed,
          lastPaymentDate: lastPayment,
        });
      }
    }

    return delinquentUsers.sort((a, b) => {
      // Sort by number of missing months (most delinquent first)
      if (b.missingMonths.length !== a.missingMonths.length) {
        return b.missingMonths.length - a.missingMonths.length;
      }
      // Then by last payment date (oldest first)
      if (!a.lastPaymentDate && !b.lastPaymentDate) return 0;
      if (!a.lastPaymentDate) return -1;
      if (!b.lastPaymentDate) return 1;
      return a.lastPaymentDate.getTime() - b.lastPaymentDate.getTime();
    });
  }

  // ========================================
  // ADMIN ACTION LOG OPERATIONS
  // ========================================

  async createAdminActionLog(logData: InsertAdminActionLog): Promise<AdminActionLog> {
    const [log] = await db
      .insert(adminActionLogs)
      .values(logData)
      .returning();
    return log;
  }

  async getAllAdminActionLogs(): Promise<AdminActionLog[]> {
    return await db
      .select()
      .from(adminActionLogs)
      .orderBy(desc(adminActionLogs.createdAt))
      .limit(100);
  }

  async getAdminStats() {
    const allUsers = await db.select().from(users);
    
    // Calculate outstanding revenue based on current active users
    const outstandingRevenue = allUsers.reduce((sum, user) => {
      if (user.subscriptionStatus === 'active') {
        return sum + parseFloat(user.pricingTier);
      }
      return sum;
    }, 0);

    // Calculate collected revenue from payments made this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, startOfMonth),
          lte(payments.paymentDate, endOfMonth)
        )
      );
    
    const collectedMonthlyRevenue = monthlyPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    return {
      totalUsers: allUsers.length,
      collectedMonthlyRevenue: collectedMonthlyRevenue.toFixed(2),
      outstandingRevenue: outstandingRevenue.toFixed(2),
    };
  }

  // ========================================
  // NPS (NET PROMOTER SCORE) OPERATIONS
  // ========================================

  async createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse> {
    const [npsResponse] = await db
      .insert(npsResponses)
      .values(response)
      .returning();
    return npsResponse;
  }

  async getUserLastNpsResponse(userId: string): Promise<NpsResponse | undefined> {
    const [response] = await db
      .select()
      .from(npsResponses)
      .where(eq(npsResponses.userId, userId))
      .orderBy(desc(npsResponses.createdAt))
      .limit(1);
    return response;
  }

  async getNpsResponsesForWeek(weekStart: Date, weekEnd: Date): Promise<NpsResponse[]> {
    return await db
      .select()
      .from(npsResponses)
      .where(
        and(
          gte(npsResponses.createdAt, weekStart),
          lte(npsResponses.createdAt, weekEnd)
        )
      )
      .orderBy(desc(npsResponses.createdAt));
  }

  async getAllNpsResponses(): Promise<NpsResponse[]> {
    return await db
      .select()
      .from(npsResponses)
      .orderBy(desc(npsResponses.createdAt));
  }

  // ========================================
  // WEEKLY PERFORMANCE REVIEW
  // ========================================
  // Note: This method has dependencies on:
  // - getNpsResponsesForWeek (from this module)
  // - getDefaultAliveOrDeadEbitdaSnapshot (from default-alive-or-dead-storage)
  // These dependencies will be injected via the composed storage class

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
    // Calculate current week boundaries (Saturday to Friday)
    const currentWeekStart = getWeekStart(weekStart);
    const currentWeekEnd = getWeekEnd(weekStart);
    
    // Calculate previous week boundaries
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(currentWeekEnd);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    // Initialize user statistics variables
    let totalUsersCurrentWeek = 0;
    let verifiedUsersCurrentWeek = 0;
    let approvedUsersCurrentWeek = 0;
    let totalUsersPreviousWeek = 0;
    let verifiedUsersPreviousWeek = 0;
    let approvedUsersPreviousWeek = 0;
    let verifiedUsersPercentage = 0;
    let verifiedUsersPercentageChange = 0;

    // Get new users for current week (excluding deleted users)
    const currentWeekNewUsersRaw = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, currentWeekStart),
          lte(users.createdAt, currentWeekEnd)
        )
      );
    
    // Filter out deleted users (those with IDs starting with "deleted_user_")
    const currentWeekNewUsers = currentWeekNewUsersRaw.filter(user => {
      if (!user || !user.id) return false;
      const id = String(user.id);
      return !id.startsWith("deleted_user_");
    });
    
    // Get new users for previous week (excluding deleted users)
    const previousWeekNewUsersRaw = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, previousWeekStart),
          lte(users.createdAt, previousWeekEnd)
        )
      );
    
    // Filter out deleted users
    const previousWeekNewUsers = previousWeekNewUsersRaw.filter(user => {
      if (!user || !user.id) return false;
      const id = String(user.id);
      return !id.startsWith("deleted_user_");
    });

    // Get payments for current week
    const currentWeekPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, currentWeekStart),
          lte(payments.paymentDate, currentWeekEnd)
        )
      );

    // Get payments for previous week
    const previousWeekPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, previousWeekStart),
          lte(payments.paymentDate, previousWeekEnd)
        )
      );

    // Get login events for current week
    const currentWeekLoginEvents = await db
      .select()
      .from(loginEvents)
      .where(
        and(
          gte(loginEvents.createdAt, currentWeekStart),
          lte(loginEvents.createdAt, currentWeekEnd),
        )
      );

    // Get login events for previous week
    const previousWeekLoginEvents = await db
      .select()
      .from(loginEvents)
      .where(
        and(
          gte(loginEvents.createdAt, previousWeekStart),
          lte(loginEvents.createdAt, previousWeekEnd),
        )
      );

    // Calculate daily active users
    const currentWeekDays = getDaysInWeek(currentWeekStart);
    const currentWeekDAU = currentWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const usersWithLogins = currentWeekLoginEvents
        .filter(e => {
          const loginDate = new Date(e.createdAt);
          return loginDate >= dayStart && loginDate <= dayEnd;
        })
        .map(e => e.userId);

      const uniqueUsers = new Set(usersWithLogins);

      return {
        date: day.dateString,
        count: uniqueUsers.size,
      };
    });

    const previousWeekDays = getDaysInWeek(previousWeekStart);
    const previousWeekDAU = previousWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const usersWithLogins = previousWeekLoginEvents
        .filter(e => {
          const loginDate = new Date(e.createdAt);
          loginDate.setHours(0, 0, 0, 0);
          return loginDate.getTime() === dayStart.getTime();
        })
        .map(e => e.userId);

      const uniqueUsers = new Set(usersWithLogins);

      return {
        date: day.dateString,
        count: uniqueUsers.size,
      };
    });

    // Calculate daily revenue
    const currentWeekDailyRevenue = currentWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = currentWeekPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() >= dayStart.getTime() && paymentDate.getTime() <= dayEnd.getTime();
      });

      const amount = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        date: day.dateString,
        amount: parseFloat(amount.toFixed(2)),
      };
    });

    const previousWeekDailyRevenue = previousWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = previousWeekPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() >= dayStart.getTime() && paymentDate.getTime() <= dayEnd.getTime();
      });

      const amount = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        date: day.dateString,
        amount: parseFloat(amount.toFixed(2)),
      };
    });

    // Calculate total revenue
    const currentWeekRevenue = currentWeekPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const previousWeekRevenue = previousWeekPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Calculate percentage changes
    const newUsersChange = previousWeekNewUsers.length === 0
      ? (currentWeekNewUsers.length > 0 ? 100 : 0)
      : ((currentWeekNewUsers.length - previousWeekNewUsers.length) / previousWeekNewUsers.length) * 100;

    const revenueChange = previousWeekRevenue === 0
      ? (currentWeekRevenue > 0 ? 100 : 0)
      : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;

    let totalUsersChange = 0;
    let approvedUsersChange = 0;
    let verifiedUsersChange = 0;

    // Growth Metrics
    const weeklyGrowthRate = parseFloat(newUsersChange.toFixed(2));

    let mrr = 0;
    let arr = 0;
    let mau = 0;
    let churnRate = 0;
    let clv = 0;
    let retentionRate = 0;
    let mrrGrowth = 0;

    try {
      // Calculate MRR (Monthly Recurring Revenue)
      const currentMonth = new Date(weekStart);
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const monthlyPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, monthStart),
            lte(payments.paymentDate, monthEnd),
            eq(payments.billingPeriod, 'monthly')
          )
        );
      
      mrr = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Calculate ARR (Annual Recurring Revenue)
      const yearlyPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, monthStart),
            lte(payments.paymentDate, monthEnd),
            eq(payments.billingPeriod, 'yearly')
          )
        );
      
      const yearlyRevenue = yearlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      arr = yearlyRevenue;

      // Calculate MAU (Monthly Active Users)
      const monthlyLoginEvents = await db
        .select()
        .from(loginEvents)
        .where(
          and(
            gte(loginEvents.createdAt, monthStart),
            lte(loginEvents.createdAt, monthEnd),
          )
        );

      const activeUserIds = new Set(monthlyLoginEvents.map(e => e.userId));
      mau = activeUserIds.size;

      // Calculate Churn Rate
      const previousMonth = new Date(monthStart);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
      previousMonthStart.setHours(0, 0, 0, 0);
      const previousMonthEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const previousMonthPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, previousMonthStart),
            lte(payments.paymentDate, previousMonthEnd)
          )
        );
      
      const previousMonthMonthlyPayments = previousMonthPayments.filter(p => p.billingPeriod === 'monthly');
      const previousMonthYearlyPayments = previousMonthPayments.filter(p => p.billingPeriod === 'yearly');
      
      const currentMonthStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      
      const activeYearlySubscribers = new Set<string>();
      previousMonthYearlyPayments.forEach(payment => {
        if (payment.yearlyEndMonth && payment.yearlyEndMonth >= currentMonthStr) {
          activeYearlySubscribers.add(payment.userId);
        }
      });
      
      const previousMonthMonthlyUserIds = new Set(previousMonthMonthlyPayments.map(p => p.userId));
      const expiredYearlyUserIds = new Set(
        previousMonthYearlyPayments
          .filter(p => !p.yearlyEndMonth || p.yearlyEndMonth < currentMonthStr)
          .map(p => p.userId)
      );
      
      const previousMonthActiveUsers = new Set([
        ...previousMonthMonthlyUserIds,
        ...expiredYearlyUserIds
      ]);
      
      const churnedUsers = Array.from(previousMonthActiveUsers).filter(id => !activeUserIds.has(id)).length;
      const totalPreviousMonthActiveUsers = previousMonthActiveUsers.size;
      churnRate = totalPreviousMonthActiveUsers === 0 ? 0 : (churnedUsers / totalPreviousMonthActiveUsers) * 100;

      // Calculate CLV (Customer Lifetime Value)
      const allPayments = await db.select().from(payments);
      const userTotalRevenue = new Map<string, number>();
      allPayments.forEach(p => {
        const current = userTotalRevenue.get(p.userId) || 0;
        userTotalRevenue.set(p.userId, current + parseFloat(p.amount));
      });
      const totalUsersWithPayments = userTotalRevenue.size;
      const totalLifetimeRevenue = Array.from(userTotalRevenue.values()).reduce((sum, rev) => sum + rev, 0);
      clv = totalUsersWithPayments === 0 ? 0 : totalLifetimeRevenue / totalUsersWithPayments;

      // Calculate Retention Rate
      const allPreviousMonthUserIds = new Set(previousMonthPayments.map(p => p.userId));
      const retainedUsers = Array.from(allPreviousMonthUserIds).filter(id => 
        activeUserIds.has(id) || activeYearlySubscribers.has(id)
      ).length;
      retentionRate = allPreviousMonthUserIds.size === 0 ? 0 : (retainedUsers / allPreviousMonthUserIds.size) * 100;

      // Calculate previous month MRR for comparison
      const previousMRR = previousMonthMonthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      mrrGrowth = previousMRR === 0 ? (mrr > 0 ? 100 : 0) : ((mrr - previousMRR) / previousMRR) * 100;
    } catch (error) {
      const normalized = normalizeError(error);
      logError(normalized, { path: 'calculateWeeklyPerformanceMetrics' } as any);
    }

    // Calculate NPS
    let nps = 0;
    let npsChange = 0;
    let npsResponsesCount = 0;
    
    try {
      const currentWeekNpsResponses = await getNpsResponsesForWeekFn(currentWeekStart, currentWeekEnd);
      const previousWeekNpsResponses = await getNpsResponsesForWeekFn(previousWeekStart, previousWeekEnd);
      
      if (currentWeekNpsResponses.length > 0) {
        // Invert scores because the question is "How would you feel if this app no longer existed?"
        const promoters = currentWeekNpsResponses.filter(r => (10 - r.score) >= 9).length;
        const detractors = currentWeekNpsResponses.filter(r => (10 - r.score) <= 6).length;
        const total = currentWeekNpsResponses.length;
        const promoterPercent = (promoters / total) * 100;
        const detractorPercent = (detractors / total) * 100;
        nps = Math.round(promoterPercent - detractorPercent);
        npsResponsesCount = total;
      }
      
      if (previousWeekNpsResponses.length > 0 && currentWeekNpsResponses.length > 0) {
        const prevPromoters = previousWeekNpsResponses.filter(r => (10 - r.score) >= 9).length;
        const prevDetractors = previousWeekNpsResponses.filter(r => (10 - r.score) <= 6).length;
        const prevTotal = previousWeekNpsResponses.length;
        const prevPromoterPercent = (prevPromoters / prevTotal) * 100;
        const prevDetractorPercent = (prevDetractors / prevTotal) * 100;
        const prevNps = Math.round(prevPromoterPercent - prevDetractorPercent);
        npsChange = nps - prevNps;
      } else if (previousWeekNpsResponses.length === 0 && currentWeekNpsResponses.length > 0) {
        npsChange = nps;
      }
    } catch (error) {
      const normalized = normalizeError(error);
      logError(normalized, { path: 'calculateWeeklyPerformanceMetrics' } as any);
    }

    // Calculate GentlePulse Mood Check statistics
    let averageMood = 0;
    let moodChange = 0;
    let moodResponsesCount = 0;
    
    try {
      const currentWeekMoodChecks = await db
        .select()
        .from(gentlepulseMoodChecks)
        .where(
          and(
            gte(gentlepulseMoodChecks.date, formatDate(currentWeekStart)),
            lte(gentlepulseMoodChecks.date, formatDate(currentWeekEnd))
          )
        );
      
      const previousWeekMoodChecks = await db
        .select()
        .from(gentlepulseMoodChecks)
        .where(
          and(
            gte(gentlepulseMoodChecks.date, formatDate(previousWeekStart)),
            lte(gentlepulseMoodChecks.date, formatDate(previousWeekEnd))
          )
        );
      
      if (currentWeekMoodChecks.length > 0) {
        const totalMood = currentWeekMoodChecks.reduce((sum, check) => sum + check.moodValue, 0);
        averageMood = parseFloat((totalMood / currentWeekMoodChecks.length).toFixed(2));
        moodResponsesCount = currentWeekMoodChecks.length;
      }
      
      if (previousWeekMoodChecks.length > 0 && currentWeekMoodChecks.length > 0) {
        const prevTotalMood = previousWeekMoodChecks.reduce((sum, check) => sum + check.moodValue, 0);
        const prevAverageMood = parseFloat((prevTotalMood / previousWeekMoodChecks.length).toFixed(2));
        moodChange = parseFloat((averageMood - prevAverageMood).toFixed(2));
      } else if (previousWeekMoodChecks.length === 0 && currentWeekMoodChecks.length > 0) {
        moodChange = averageMood;
      }
    } catch (error) {
      const normalized = normalizeError(error);
      logError(normalized, { path: 'calculateWeeklyPerformanceMetrics' } as any);
    }

    // Calculate User Statistics
    // Count users that existed as of the end of each week (not all users in database)
    // This ensures consistency with user management counts at the time of each week
    try {
      // Get users created on or before the current week end (as of Friday of that week)
      const currentWeekUsersRaw = await db
        .select()
        .from(users)
        .where(lte(users.createdAt, currentWeekEnd));
      
      // Filter out deleted users (those with IDs starting with "deleted_user_")
      const currentWeekUsers = currentWeekUsersRaw.filter(user => {
        if (!user || !user.id) return false;
        const id = String(user.id);
        return !id.startsWith("deleted_user_");
      });
      
      totalUsersCurrentWeek = currentWeekUsers.length;
      verifiedUsersCurrentWeek = currentWeekUsers.filter(user => user.isVerified === true).length;
      approvedUsersCurrentWeek = currentWeekUsers.filter(user => user.isApproved === true).length;
      
      verifiedUsersPercentage = totalUsersCurrentWeek === 0 
        ? 0 
        : parseFloat(((verifiedUsersCurrentWeek / totalUsersCurrentWeek) * 100).toFixed(2));

      // Get users created on or before the previous week end (as of Friday of that week)
      const previousWeekUsersRaw = await db
        .select()
        .from(users)
        .where(lte(users.createdAt, previousWeekEnd));
      
      // Filter out deleted users
      const previousWeekUsers = previousWeekUsersRaw.filter(user => {
        if (!user || !user.id) return false;
        const id = String(user.id);
        return !id.startsWith("deleted_user_");
      });
      
      totalUsersPreviousWeek = previousWeekUsers.length;
      verifiedUsersPreviousWeek = previousWeekUsers.filter(user => user.isVerified === true).length;
      approvedUsersPreviousWeek = previousWeekUsers.filter(user => user.isApproved === true).length;
      
      const verifiedUsersPercentagePreviousWeek = totalUsersPreviousWeek === 0 
        ? 0 
        : parseFloat(((verifiedUsersPreviousWeek / totalUsersPreviousWeek) * 100).toFixed(2));

      verifiedUsersPercentageChange = verifiedUsersPercentage - verifiedUsersPercentagePreviousWeek;

      totalUsersChange = totalUsersPreviousWeek === 0
        ? (totalUsersCurrentWeek > 0 ? 100 : 0)
        : ((totalUsersCurrentWeek - totalUsersPreviousWeek) / totalUsersPreviousWeek) * 100;

      approvedUsersChange = approvedUsersPreviousWeek === 0
        ? (approvedUsersCurrentWeek > 0 ? 100 : 0)
        : ((approvedUsersCurrentWeek - approvedUsersPreviousWeek) / approvedUsersPreviousWeek) * 100;

      verifiedUsersChange = verifiedUsersPreviousWeek === 0
        ? (verifiedUsersCurrentWeek > 0 ? 100 : 0)
        : ((verifiedUsersCurrentWeek - verifiedUsersPreviousWeek) / verifiedUsersPreviousWeek) * 100;
    } catch (error) {
      const normalized = normalizeError(error);
      logError(normalized, { path: 'calculateWeeklyPerformanceMetrics' } as any);
    }

    // Get EBITDA snapshots for both weeks to determine Default Alive/Dead status
    let currentWeekIsDefaultAlive: boolean | null = null;
    let previousWeekIsDefaultAlive: boolean | null = null;
    
    try {
      if (getDefaultAliveOrDeadEbitdaSnapshotFn) {
        const currentWeekSnapshot = await getDefaultAliveOrDeadEbitdaSnapshotFn(currentWeekStart);
        const previousWeekSnapshot = await getDefaultAliveOrDeadEbitdaSnapshotFn(previousWeekStart);
        
        currentWeekIsDefaultAlive = currentWeekSnapshot?.isDefaultAlive ?? null;
        previousWeekIsDefaultAlive = previousWeekSnapshot?.isDefaultAlive ?? null;
      }
    } catch (error) {
      const normalized = normalizeError(error);
      logError(normalized, { path: 'calculateWeeklyPerformanceMetrics' } as any);
    }

    return {
      currentWeek: {
        startDate: formatDate(currentWeekStart),
        endDate: formatDate(currentWeekEnd),
        newUsers: currentWeekNewUsers.length,
        dailyActiveUsers: currentWeekDAU,
        revenue: parseFloat(currentWeekRevenue.toFixed(2)),
        dailyRevenue: currentWeekDailyRevenue,
        totalUsers: totalUsersCurrentWeek,
        verifiedUsers: verifiedUsersCurrentWeek,
        approvedUsers: approvedUsersCurrentWeek,
        isDefaultAlive: currentWeekIsDefaultAlive,
      },
      previousWeek: {
        startDate: formatDate(previousWeekStart),
        endDate: formatDate(previousWeekEnd),
        newUsers: previousWeekNewUsers.length,
        dailyActiveUsers: previousWeekDAU,
        revenue: parseFloat(previousWeekRevenue.toFixed(2)),
        dailyRevenue: previousWeekDailyRevenue,
        totalUsers: totalUsersPreviousWeek,
        verifiedUsers: verifiedUsersPreviousWeek,
        approvedUsers: approvedUsersPreviousWeek,
        isDefaultAlive: previousWeekIsDefaultAlive,
      },
      comparison: {
        newUsersChange: parseFloat(newUsersChange.toFixed(2)),
        revenueChange: parseFloat(revenueChange.toFixed(2)),
        totalUsersChange: parseFloat(totalUsersChange.toFixed(2)),
        verifiedUsersChange: parseFloat(verifiedUsersChange.toFixed(2)),
        approvedUsersChange: parseFloat(approvedUsersChange.toFixed(2)),
      },
      metrics: {
        weeklyGrowthRate: weeklyGrowthRate,
        mrr: parseFloat(mrr.toFixed(2)),
        arr: parseFloat(arr.toFixed(2)),
        mrrGrowth: parseFloat(mrrGrowth.toFixed(2)),
        mau: mau,
        churnRate: parseFloat(churnRate.toFixed(2)),
        clv: parseFloat(clv.toFixed(2)),
        retentionRate: parseFloat(retentionRate.toFixed(2)),
        nps: nps,
        npsChange: npsChange,
        npsResponses: npsResponsesCount,
        verifiedUsersPercentage: verifiedUsersPercentage,
        verifiedUsersPercentageChange: parseFloat(verifiedUsersPercentageChange.toFixed(2)),
        averageMood: averageMood,
        moodChange: moodChange,
        moodResponses: moodResponsesCount,
      },
    };
  }
}

