/**
 * Admin routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, getUserId } from "../auth";
import { validateCsrfToken, generateCsrfTokenForAdmin } from "../csrf";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { 
  insertPaymentSchema,
  insertPricingTierSchema,
  type User,
  type Payment,
  type PricingTier,
} from "@shared/schema";
import { logAdminAction } from "./shared";
import { getSuspiciousPatterns, getSuspiciousPatternsForIP, clearSuspiciousPatterns } from "../antiScraping";
import { logInfo } from "../errorLogger";

export function registerAdminRoutes(app: Express) {
  // CSRF Protection for admin endpoints
  // Generate CSRF tokens on GET requests to admin endpoints (runs early)
  app.use('/api/admin', (req, res, next) => {
    if (req.method === 'GET') {
      generateCsrfTokenForAdmin(req, res, next);
    } else {
      next();
    }
  });
  
  app.use('/api/:app/admin', (req, res, next) => {
    if (req.method === 'GET') {
      generateCsrfTokenForAdmin(req, res, next);
    } else {
      next();
    }
  });

  // Weekly Performance Review
  app.get('/api/admin/weekly-performance', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const weekStartParam = req.query.weekStart;
    let weekStart: Date;
    
    if (weekStartParam) {
      // Parse date string (YYYY-MM-DD) and interpret as local date, not UTC
      const [year, month, day] = weekStartParam.split('-').map(Number);
      weekStart = new Date(year, month - 1, day);
      if (isNaN(weekStart.getTime())) {
        throw new Error("Invalid weekStart date format");
      }
    } else {
      // Default to current week
      weekStart = new Date();
    }
    
    logInfo("Weekly performance request", req, {
      weekStartInput: weekStartParam || "current date",
      parsedWeekStart: weekStart.toISOString()
    });
    
    const review = await withDatabaseErrorHandling(
      () => storage.getWeeklyPerformanceReview(weekStart),
      'getWeeklyPerformanceReview'
    );
    
    logInfo("Weekly Performance Review Result", req, {
      reviewKeys: Object.keys(review),
      hasMetricsProperty: 'metrics' in review,
      metricsValue: review.metrics,
      metricsType: typeof review.metrics
    });
    
    // ALWAYS ensure metrics is present
    const defaultMetrics = {
      weeklyGrowthRate: 0,
      mrr: 0,
      arr: 0,
      mrrGrowth: 0,
      mau: 0,
      churnRate: 0,
      clv: 0,
      retentionRate: 0,
      verifiedUsersPercentage: 0,
      verifiedUsersPercentageChange: 0,
      averageMood: 0,
      moodChange: 0,
      moodResponses: 0,
    };
    
    const response = {
      currentWeek: review.currentWeek,
      previousWeek: review.previousWeek,
      comparison: review.comparison,
      metrics: review.metrics || defaultMetrics,
    };
    
    logInfo("Weekly Performance Response", req, {
      responseKeys: Object.keys(response),
      hasMetrics: 'metrics' in response,
      metrics: response.metrics
    });
    
    res.json(response);
  }));

  // Admin routes - Anti-scraping monitoring
  app.get('/api/admin/anti-scraping/patterns', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const ip = req.query.ip as string | undefined;
    const patterns = ip 
      ? getSuspiciousPatternsForIP(ip)
      : getSuspiciousPatterns();
    res.json(patterns);
  }));

  app.delete('/api/admin/anti-scraping/patterns', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req, res) => {
    const ip = req.query.ip as string | undefined;
    clearSuspiciousPatterns(ip);
    res.json({ message: ip ? `Cleared patterns for IP ${ip}` : "Cleared all patterns" });
  }));

  // Admin routes - Users
  app.get('/api/admin/users', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const users = await withDatabaseErrorHandling(
      () => storage.getAllUsers(),
      'getAllUsers'
    ) as User[];
    logInfo(`[Admin Users API] Fetched ${users.length} users from database`, req);
    if (users.length > 0) {
      logInfo(`[Admin Users API] Sample user IDs`, req, {
        sampleUsers: users.slice(0, 3).map(u => ({ id: u.id, idType: typeof u.id, email: u.email }))
      });
    }
    res.json(users);
  }));

  app.put('/api/admin/users/:id/verify', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { isVerified } = req.body;
    const user = await withDatabaseErrorHandling(
      () => storage.updateUserVerification(req.params.id, !!isVerified),
      'updateUserVerification'
    ) as User;
    await logAdminAction(adminId, 'verify_user', 'user', user.id, { isVerified: user.isVerified });
    res.json(user);
  }));

  app.put('/api/admin/users/:id/approve', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { isApproved } = req.body;
    const user = await withDatabaseErrorHandling(
      () => storage.updateUserApproval(req.params.id, !!isApproved),
      'updateUserApproval'
    ) as User;
    await logAdminAction(adminId, 'approve_user', 'user', user.id, { isApproved: user.isApproved });
    res.json(user);
  }));

  // Admin routes - Payments
  app.get('/api/admin/payments', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const payments = await withDatabaseErrorHandling(
      () => storage.getAllPayments(),
      'getAllPayments'
    );
    res.json(payments);
  }));

  app.get('/api/admin/payments/delinquent', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const delinquentUsers = await withDatabaseErrorHandling(
      () => storage.getDelinquentUsers(),
      'getDelinquentUsers'
    );
    res.json(delinquentUsers);
  }));

  app.post('/api/admin/payments', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    
    // Prepare data for validation
    const dataToValidate: any = {
      ...req.body,
      recordedBy: userId,
    };
    
    // Ensure billingMonth is explicitly null for yearly payments
    if (req.body.billingPeriod === "yearly") {
      dataToValidate.billingMonth = null;
    }
    
    const validatedData = validateWithZod(insertPaymentSchema, dataToValidate, 'Invalid payment data');

    const payment = await withDatabaseErrorHandling(
      () => storage.createPayment(validatedData),
      'createPayment'
    ) as Payment;
    
    await logAdminAction(
      userId,
      "record_payment",
      "payment",
      payment.id,
      { userId: payment.userId, amount: payment.amount }
    );

    res.json(payment);
  }));

  // Admin routes - Activity log
  app.get('/api/admin/activity', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const logs = await withDatabaseErrorHandling(
      () => storage.getAllAdminActionLogs(),
      'getAllAdminActionLogs'
    );
    res.json(logs);
  }));

  // Admin routes - Pricing Tiers
  app.get('/api/admin/pricing-tiers', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const tiers = await withDatabaseErrorHandling(
      () => storage.getAllPricingTiers(),
      'getAllPricingTiers'
    );
    res.json(tiers);
  }));

  app.post('/api/admin/pricing-tiers', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertPricingTierSchema, req.body, 'Invalid pricing tier data');
    const tier = await withDatabaseErrorHandling(
      () => storage.createPricingTier(validatedData),
      'createPricingTier'
    ) as PricingTier;
    
    await logAdminAction(
      userId,
      "create_pricing_tier",
      "pricing_tier",
      tier.id,
      { amount: tier.amount, effectiveDate: tier.effectiveDate, isCurrentTier: tier.isCurrentTier }
    );

    res.json(tier);
  }));

  app.put('/api/admin/pricing-tiers/:id/set-current', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const tier = await withDatabaseErrorHandling(
      () => storage.setCurrentPricingTier(req.params.id),
      'setCurrentPricingTier'
    ) as PricingTier;
    
    await logAdminAction(
      userId,
      "set_current_pricing_tier",
      "pricing_tier",
      tier.id,
      { amount: tier.amount }
    );

    res.json(tier);
  }));
}

