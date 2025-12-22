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

