/**
 * Analytics Storage Module
 * 
 * Handles weekly performance review and analytics operations.
 * This is a complex module that aggregates data from multiple sources.
 */

import {
  users,
  payments,
  loginEvents,
  gentlepulseMoodChecks,
  type NpsResponse,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { normalizeError } from "../../errors";
import { logError } from "../../errorLogger";
import { getWeekStart, getWeekEnd, formatDate, getDaysInWeek } from "./utils";

/**
 * Helper function to identify test users by email pattern, user ID, or name
 * Test users are created during E2E tests and security tests
 */
function isTestUser(user: { id?: string; email: string | null; firstName?: string | null; lastName?: string | null } | null | undefined): boolean {
  if (!user) return false;
  
  // Check user ID pattern: test-user-{timestamp}-{random}
  if (user.id && typeof user.id === 'string' && user.id.startsWith('test-user-')) {
    return true;
  }
  
  // Check name pattern: "Test User" (CI-created test user)
  const firstName = user.firstName?.trim().toLowerCase() || '';
  const lastName = user.lastName?.trim().toLowerCase() || '';
  if (firstName === 'test' && lastName === 'user') {
    return true;
  }
  
  // Check email patterns
  if (!user.email) return false;
  
  // Trim whitespace and convert to lowercase for consistent matching
  const email = String(user.email).trim().toLowerCase();
  
  // SQL injection test email pattern (from security tests)
  // CI creates users with email: test' OR '1'='1'
  if (email === "test' or '1'='1" || email === "test' or '1'='1'") {
    return true;
  }
  
  // Also check for SQL injection pattern with regex (more flexible)
  if (/^test'\s+or\s+'1'='1'?$/i.test(email)) {
    return true;
  }
  
  // Common test email patterns (for seed scripts and other test data)
  const testPatterns = [
    /@example\.com$/,                     // Any @example.com email
    /^e2e-test/,                         // E2E test user (e2e-test@example.com, etc.)
    /^payment-test-\d+@example\.com$/,   // Payment test users
    /^test.*@example\.com$/,             // Generic test@example.com
    /^seed-.*@example\.com$/,            // Seed script users
  ];
  
  return testPatterns.some(pattern => pattern.test(email));
}

export class AnalyticsStorage {
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
      previousWeekMonthMRR: number;
      previousWeekMonthARR: number;
      previousWeekMonthMAU: number;
      previousWeekMonthChurnRate: number;
      previousWeekMonthCLV: number;
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

    // Get all test user IDs upfront to filter them from all metrics
    const allUsersForTestFilter = await db.select().from(users);
    const testUserIds = new Set<string>(
      allUsersForTestFilter
        .filter(user => isTestUser(user))
        .map(user => String(user.id))
    );

    // Get new users for current week (excluding deleted users and test users)
    const currentWeekNewUsersRaw = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, currentWeekStart),
          lte(users.createdAt, currentWeekEnd)
        )
      );
    
    // Filter out deleted users (those with IDs starting with "deleted_user_") and test users
    const currentWeekNewUsers = currentWeekNewUsersRaw.filter(user => {
      if (!user || !user.id) return false;
      const id = String(user.id);
      // Exclude deleted users
      if (id.startsWith("deleted_user_")) return false;
      // Exclude test users
      if (isTestUser(user)) return false;
      return true;
    });
    
    // Get new users for previous week (excluding deleted users and test users)
    const previousWeekNewUsersRaw = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, previousWeekStart),
          lte(users.createdAt, previousWeekEnd)
        )
      );
    
    // Filter out deleted users and test users
    const previousWeekNewUsers = previousWeekNewUsersRaw.filter(user => {
      if (!user || !user.id) return false;
      const id = String(user.id);
      // Exclude deleted users
      if (id.startsWith("deleted_user_")) return false;
      // Exclude test users
      if (isTestUser(user)) return false;
      return true;
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

    // Calculate daily active users (excluding test users)
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
        .filter(e => !testUserIds.has(e.userId)) // Exclude test users
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
        .filter(e => !testUserIds.has(e.userId)) // Exclude test users
        .map(e => e.userId);

      const uniqueUsers = new Set(usersWithLogins);

      return {
        date: day.dateString,
        count: uniqueUsers.size,
      };
    });

    // Calculate daily revenue (excluding test users)
    const currentWeekDailyRevenue = currentWeekDays.map(day => {
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = currentWeekPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() >= dayStart.getTime() && paymentDate.getTime() <= dayEnd.getTime();
      }).filter(p => !testUserIds.has(p.userId)); // Exclude test users

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
      }).filter(p => !testUserIds.has(p.userId)); // Exclude test users

      const amount = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        date: day.dateString,
        amount: parseFloat(amount.toFixed(2)),
      };
    });

    // Calculate total revenue (excluding test users)
    const currentWeekRevenue = currentWeekPayments
      .filter(p => !testUserIds.has(p.userId)) // Exclude test users
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const previousWeekRevenue = previousWeekPayments
      .filter(p => !testUserIds.has(p.userId)) // Exclude test users
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

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

    // Previous week's month metrics (for comparison table)
    let previousWeekMonthMRR = 0;
    let previousWeekMonthARR = 0;
    let previousWeekMonthMAU = 0;
    let previousWeekMonthChurnRate = 0;
    let previousWeekMonthCLV = 0;

    try {
      // Calculate MRR (Monthly Recurring Revenue)
      const currentMonth = new Date(weekStart);
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Current month in YYYY-MM format for comparison
      const currentMonthStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      // Calculate previous week's month (the month that contains the previous week)
      const previousWeekMonth = new Date(previousWeekStart);
      const previousWeekMonthStart = new Date(previousWeekMonth.getFullYear(), previousWeekMonth.getMonth(), 1);
      previousWeekMonthStart.setHours(0, 0, 0, 0);
      const previousWeekMonthEnd = new Date(previousWeekMonth.getFullYear(), previousWeekMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      const previousWeekMonthStr = `${previousWeekMonthStart.getFullYear()}-${String(previousWeekMonthStart.getMonth() + 1).padStart(2, '0')}`;
      
      // MRR: All active monthly subscriptions for the current month
      // A monthly subscription is active if billingMonth matches the current month
      const allMonthlyPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.billingPeriod, 'monthly'));
      
      // Filter to only payments where billingMonth matches current month and exclude test users
      const activeMonthlyPayments = allMonthlyPayments.filter(p => 
        p.billingMonth === currentMonthStr && !testUserIds.has(p.userId)
      );
      mrr = activeMonthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Calculate ARR (Annual Recurring Revenue)
      // ARR: All active yearly subscriptions where current month falls within the subscription period
      const allYearlyPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.billingPeriod, 'yearly'));
      
      // Filter to only payments where current month is within the subscription period and exclude test users
      const activeYearlyPayments = allYearlyPayments.filter(p => {
        if (!p.yearlyStartMonth || !p.yearlyEndMonth) {
          // If yearly subscription doesn't have start/end months, exclude it
          return false;
        }
        // Current month must be >= start month and <= end month, and not a test user
        return currentMonthStr >= p.yearlyStartMonth && currentMonthStr <= p.yearlyEndMonth && !testUserIds.has(p.userId);
      });
      
      const yearlyRevenue = activeYearlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      arr = yearlyRevenue;

      // Calculate MAU (Monthly Active Users) - excluding test users
      const monthlyLoginEvents = await db
        .select()
        .from(loginEvents)
        .where(
          and(
            gte(loginEvents.createdAt, monthStart),
            lte(loginEvents.createdAt, monthEnd),
          )
        );

      const activeUserIds = new Set(
        monthlyLoginEvents
          .filter(e => !testUserIds.has(e.userId)) // Exclude test users
          .map(e => e.userId)
      );
      mau = activeUserIds.size;

      // Calculate Churn Rate
      const previousMonth = new Date(monthStart);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
      previousMonthStart.setHours(0, 0, 0, 0);
      const previousMonthEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Previous month in YYYY-MM format
      const previousMonthStr = `${previousMonthStart.getFullYear()}-${String(previousMonthStart.getMonth() + 1).padStart(2, '0')}`;
      
      // Get all payments to determine active subscriptions (excluding test users)
      const allPaymentsForChurn = (await db.select().from(payments))
        .filter(p => !testUserIds.has(p.userId)); // Exclude test users
      
      // Previous month active users: users with active subscriptions in previous month
      const previousMonthActiveUserIds = new Set<string>();
      
      // Monthly subscriptions active in previous month
      allPaymentsForChurn
        .filter(p => p.billingPeriod === 'monthly' && p.billingMonth === previousMonthStr)
        .forEach(p => previousMonthActiveUserIds.add(p.userId));
      
      // Yearly subscriptions active in previous month
      allPaymentsForChurn
        .filter(p => {
          if (p.billingPeriod !== 'yearly' || !p.yearlyStartMonth || !p.yearlyEndMonth) {
            return false;
          }
          return previousMonthStr >= p.yearlyStartMonth && previousMonthStr <= p.yearlyEndMonth;
        })
        .forEach(p => previousMonthActiveUserIds.add(p.userId));
      
      // Current month active users: users with active subscriptions in current month
      const currentMonthActiveUserIds = new Set<string>();
      
      // Monthly subscriptions active in current month
      activeMonthlyPayments.forEach(p => currentMonthActiveUserIds.add(p.userId));
      
      // Yearly subscriptions active in current month
      activeYearlyPayments.forEach(p => currentMonthActiveUserIds.add(p.userId));
      
      // Churned users: were active in previous month but not in current month
      const churnedUsers = Array.from(previousMonthActiveUserIds).filter(id => !currentMonthActiveUserIds.has(id)).length;
      const totalPreviousMonthActiveUsers = previousMonthActiveUserIds.size;
      churnRate = totalPreviousMonthActiveUsers === 0 ? 0 : (churnedUsers / totalPreviousMonthActiveUsers) * 100;

      // Calculate CLV (Customer Lifetime Value) - excluding test users
      const allPayments = (await db.select().from(payments))
        .filter(p => !testUserIds.has(p.userId)); // Exclude test users
      const userTotalRevenue = new Map<string, number>();
      allPayments.forEach(p => {
        const current = userTotalRevenue.get(p.userId) || 0;
        userTotalRevenue.set(p.userId, current + parseFloat(p.amount));
      });
      const totalUsersWithPayments = userTotalRevenue.size;
      const totalLifetimeRevenue = Array.from(userTotalRevenue.values()).reduce((sum, rev) => sum + rev, 0);
      clv = totalUsersWithPayments === 0 ? 0 : totalLifetimeRevenue / totalUsersWithPayments;

      // Calculate Retention Rate
      // Retained users: were active in previous month and still active in current month
      const retainedUsers = Array.from(previousMonthActiveUserIds).filter(id => 
        currentMonthActiveUserIds.has(id)
      ).length;
      retentionRate = previousMonthActiveUserIds.size === 0 ? 0 : (retainedUsers / previousMonthActiveUserIds.size) * 100;

      // Calculate previous month MRR for comparison
      // Previous month MRR: monthly subscriptions active in previous month (test users already excluded in allPaymentsForChurn)
      const previousMonthMonthlyPayments = allPaymentsForChurn.filter(p => 
        p.billingPeriod === 'monthly' && p.billingMonth === previousMonthStr
      );
      const previousMRR = previousMonthMonthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      mrrGrowth = previousMRR === 0 ? (mrr > 0 ? 100 : 0) : ((mrr - previousMRR) / previousMRR) * 100;

      // Calculate previous week's month metrics (for comparison table)
      // Only calculate if previous week's month is different from current month
      if (previousWeekMonthStr !== currentMonthStr) {
        // Previous week's month MRR
        const previousWeekMonthMonthlyPayments = allPaymentsForChurn.filter(p => 
          p.billingPeriod === 'monthly' && p.billingMonth === previousWeekMonthStr
        );
        previousWeekMonthMRR = previousWeekMonthMonthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Previous week's month ARR
        const previousWeekMonthYearlyPayments = allPaymentsForChurn.filter(p => {
          if (p.billingPeriod !== 'yearly' || !p.yearlyStartMonth || !p.yearlyEndMonth) {
            return false;
          }
          return previousWeekMonthStr >= p.yearlyStartMonth && previousWeekMonthStr <= p.yearlyEndMonth;
        });
        previousWeekMonthARR = previousWeekMonthYearlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Previous week's month MAU (excluding test users)
        const previousWeekMonthLoginEvents = await db
          .select()
          .from(loginEvents)
          .where(
            and(
              gte(loginEvents.createdAt, previousWeekMonthStart),
              lte(loginEvents.createdAt, previousWeekMonthEnd),
            )
          );
        const previousWeekMonthActiveUserIds = new Set(
          previousWeekMonthLoginEvents
            .filter(e => !testUserIds.has(e.userId)) // Exclude test users
            .map(e => e.userId)
        );
        previousWeekMonthMAU = previousWeekMonthActiveUserIds.size;

        // Previous week's month Churn Rate
        // Calculate the month before the previous week's month
        const prevWeekMonthBefore = new Date(previousWeekMonthStart);
        prevWeekMonthBefore.setMonth(prevWeekMonthBefore.getMonth() - 1);
        const prevWeekMonthBeforeStart = new Date(prevWeekMonthBefore.getFullYear(), prevWeekMonthBefore.getMonth(), 1);
        prevWeekMonthBeforeStart.setHours(0, 0, 0, 0);
        const prevWeekMonthBeforeEnd = new Date(prevWeekMonthBefore.getFullYear(), prevWeekMonthBefore.getMonth() + 1, 0, 23, 59, 59, 999);
        const prevWeekMonthBeforeStr = `${prevWeekMonthBeforeStart.getFullYear()}-${String(prevWeekMonthBeforeStart.getMonth() + 1).padStart(2, '0')}`;

        // Users active in the month before previous week's month
        const prevWeekMonthBeforeActiveUserIds = new Set<string>();
        allPaymentsForChurn
          .filter(p => p.billingPeriod === 'monthly' && p.billingMonth === prevWeekMonthBeforeStr)
          .forEach(p => prevWeekMonthBeforeActiveUserIds.add(p.userId));
        allPaymentsForChurn
          .filter(p => {
            if (p.billingPeriod !== 'yearly' || !p.yearlyStartMonth || !p.yearlyEndMonth) {
              return false;
            }
            return prevWeekMonthBeforeStr >= p.yearlyStartMonth && prevWeekMonthBeforeStr <= p.yearlyEndMonth;
          })
          .forEach(p => prevWeekMonthBeforeActiveUserIds.add(p.userId));

        // Users active in previous week's month
        const prevWeekMonthActiveUserIds = new Set<string>();
        previousWeekMonthMonthlyPayments.forEach(p => prevWeekMonthActiveUserIds.add(p.userId));
        previousWeekMonthYearlyPayments.forEach(p => prevWeekMonthActiveUserIds.add(p.userId));

        // Churned users: were active in month before but not in previous week's month
        const prevWeekMonthChurnedUsers = Array.from(prevWeekMonthBeforeActiveUserIds).filter(id => !prevWeekMonthActiveUserIds.has(id)).length;
        const prevWeekMonthTotalBefore = prevWeekMonthBeforeActiveUserIds.size;
        previousWeekMonthChurnRate = prevWeekMonthTotalBefore === 0 ? 0 : (prevWeekMonthChurnedUsers / prevWeekMonthTotalBefore) * 100;

        // Previous week's month CLV (same calculation as current, but calculated at that point in time)
        // For CLV, we calculate based on all payments up to the end of previous week's month (excluding test users)
        const prevWeekMonthAllPayments = (await db
          .select()
          .from(payments)
          .where(lte(payments.paymentDate, previousWeekMonthEnd)))
          .filter(p => !testUserIds.has(p.userId)); // Exclude test users
        const prevWeekMonthUserTotalRevenue = new Map<string, number>();
        prevWeekMonthAllPayments.forEach(p => {
          const current = prevWeekMonthUserTotalRevenue.get(p.userId) || 0;
          prevWeekMonthUserTotalRevenue.set(p.userId, current + parseFloat(p.amount));
        });
        const prevWeekMonthTotalUsersWithPayments = prevWeekMonthUserTotalRevenue.size;
        const prevWeekMonthTotalLifetimeRevenue = Array.from(prevWeekMonthUserTotalRevenue.values()).reduce((sum, rev) => sum + rev, 0);
        previousWeekMonthCLV = prevWeekMonthTotalUsersWithPayments === 0 ? 0 : prevWeekMonthTotalLifetimeRevenue / prevWeekMonthTotalUsersWithPayments;
      } else {
        // If previous week is in the same month, use current month's values
        previousWeekMonthMRR = mrr;
        previousWeekMonthARR = arr;
        previousWeekMonthMAU = mau;
        previousWeekMonthChurnRate = churnRate;
        previousWeekMonthCLV = clv;
      }
    } catch (error) {
      const normalized = normalizeError(error);
      logError(normalized, { path: 'calculateWeeklyPerformanceMetrics' } as any);
    }

    // Calculate NPS (excluding test users)
    let nps = 0;
    let npsChange = 0;
    let npsResponsesCount = 0;
    
    try {
      const currentWeekNpsResponsesRaw = await getNpsResponsesForWeekFn(currentWeekStart, currentWeekEnd);
      const previousWeekNpsResponsesRaw = await getNpsResponsesForWeekFn(previousWeekStart, previousWeekEnd);
      
      // Filter out test users from NPS responses
      const currentWeekNpsResponses = currentWeekNpsResponsesRaw.filter(r => !testUserIds.has(r.userId));
      const previousWeekNpsResponses = previousWeekNpsResponsesRaw.filter(r => !testUserIds.has(r.userId));
      
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
      
      // Filter out deleted users (those with IDs starting with "deleted_user_") and test users
      const currentWeekUsers = currentWeekUsersRaw.filter(user => {
        if (!user || !user.id) return false;
        const id = String(user.id);
        // Exclude deleted users
        if (id.startsWith("deleted_user_")) return false;
        // Exclude test users
        if (isTestUser(user)) return false;
        return true;
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
      
      // Filter out deleted users and test users
      const previousWeekUsers = previousWeekUsersRaw.filter(user => {
        if (!user || !user.id) return false;
        const id = String(user.id);
        // Exclude deleted users
        if (id.startsWith("deleted_user_")) return false;
        // Exclude test users
        if (isTestUser(user)) return false;
        return true;
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
        // Previous week's month metrics (for comparison table)
        previousWeekMonthMRR: parseFloat(previousWeekMonthMRR.toFixed(2)),
        previousWeekMonthARR: parseFloat(previousWeekMonthARR.toFixed(2)),
        previousWeekMonthMAU: previousWeekMonthMAU,
        previousWeekMonthChurnRate: parseFloat(previousWeekMonthChurnRate.toFixed(2)),
        previousWeekMonthCLV: parseFloat(previousWeekMonthCLV.toFixed(2)),
      },
    };
  }
}

