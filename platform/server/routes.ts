import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId, syncClerkUserToDatabase } from "./auth";
import { setCsrfTokenCookie } from "./csrf";
import { logAdminAction } from "./adminLogging";
import { 
  insertPaymentSchema, 
  insertPricingTierSchema,
  uuidParamSchema,
  verifyUserSchema,
  approveUserSchema,
} from "@shared/schema";
import { z } from "zod";
import { NotFoundError, ValidationError } from "./errors";
import { validateWithZod } from "./validationErrorFormatter";
import { asyncHandler } from "./errorHandler";

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // ========================================
  // AUTH ROUTES
  // ========================================

  // Get current authenticated user
  // This endpoint handles user sync failures gracefully with retry logic
  app.get("/api/auth/user", isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    
    // Try to get user from database first
    let user = await storage.getUser(userId);
    
    // If user not found, try to sync from Clerk
    // This handles cases where the user exists in Clerk but hasn't been synced to our DB yet
    if (!user && req.auth?.userId) {
      try {
        const sessionClaims = (req.auth as any)?.sessionClaims;
        user = await syncClerkUserToDatabase(userId, sessionClaims);
      } catch (syncError: any) {
        // If sync fails, return null instead of throwing an error
        // The client has retry logic to handle this gracefully
        // Log the error for debugging but don't block the request
        console.warn(`Failed to sync user ${userId} in /api/auth/user endpoint:`, syncError.message);
        return res.json(null);
      }
    }
    
    // Return user or null if still not found
    res.json(user || null);
  }));

  // ========================================
  // ADMIN ROUTES
  // ========================================

  // Admin Stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  }));

  // Admin Users
  app.get("/api/admin/users", isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    // Set CSRF token cookie for subsequent requests
    setCsrfTokenCookie(req, res);
    const users = await storage.getAllUsers();
    res.json(users);
  }));

  app.put("/api/admin/users/:id/verify", isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    // Validate route parameter
    const { id } = validateWithZod(
      z.object({ id: uuidParamSchema }),
      { id: req.params.id },
      "Invalid user ID"
    );

    // Validate request body
    const { isVerified } = validateWithZod(
      verifyUserSchema,
      req.body,
      "Invalid request body"
    );

    const user = await storage.updateUserVerification(id, isVerified);

    // Log admin action
    await logAdminAction(
      req,
      isVerified ? "verify_user" : "unverify_user",
      "user",
      id,
      { 
        userId: id,
        email: user.email,
        previousStatus: !isVerified,
        newStatus: isVerified
      }
    );

    res.json(user);
  }));

  app.put("/api/admin/users/:id/approve", isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    // Validate route parameter
    const { id } = validateWithZod(
      z.object({ id: uuidParamSchema }),
      { id: req.params.id },
      "Invalid user ID"
    );

    // Validate request body
    const { isApproved } = validateWithZod(
      approveUserSchema,
      req.body,
      "Invalid request body"
    );

    const user = await storage.updateUserApproval(id, isApproved);

    // Log admin action
    await logAdminAction(
      req,
      isApproved ? "approve_user" : "unapprove_user",
      "user",
      id,
      { 
        userId: id,
        email: user.email,
        previousStatus: !isApproved,
        newStatus: isApproved
      }
    );

    res.json(user);
  }));

  // Admin Payments
  app.get("/api/admin/payments", isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    // Set CSRF token cookie for subsequent requests
    setCsrfTokenCookie(req, res);
    const payments = await storage.getAllPayments();
    res.json(payments);
  }));

  app.get("/api/admin/payments/delinquent", isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const delinquentUsers = await storage.getDelinquentUsers();
    res.json(delinquentUsers);
  }));

  app.post("/api/admin/payments", isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    
    // Validate and parse request body
    const paymentData = {
      ...validateWithZod(
        insertPaymentSchema,
        req.body,
        "Invalid payment data"
      ),
      recordedBy: adminId,
    };

    const payment = await storage.createPayment(paymentData);

    // Log admin action
    await logAdminAction(
      req,
      "create_payment",
      "payment",
      payment.id,
      {
        userId: payment.userId,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        billingPeriod: payment.billingPeriod,
        billingMonth: payment.billingMonth,
        yearlyStartMonth: payment.yearlyStartMonth,
        yearlyEndMonth: payment.yearlyEndMonth,
      }
    );

    res.json(payment);
  }));

  // Admin Pricing Tiers
  app.get("/api/admin/pricing-tiers", isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    // Set CSRF token cookie for subsequent requests
    setCsrfTokenCookie(req, res);
    const tiers = await storage.getAllPricingTiers();
    res.json(tiers);
  }));

  app.post("/api/admin/pricing-tiers", isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    // Validate request body
    const tierData = validateWithZod(
      insertPricingTierSchema,
      req.body,
      "Invalid pricing tier data"
    );
    const tier = await storage.createPricingTier(tierData);

    // Log admin action
    await logAdminAction(
      req,
      "create_pricing_tier",
      "pricing_tier",
      tier.id,
      {
        amount: tier.amount,
        effectiveDate: tier.effectiveDate,
        isCurrentTier: tier.isCurrentTier,
      }
    );

    res.json(tier);
  }));

  app.put("/api/admin/pricing-tiers/:id/set-current", isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    // Validate route parameter
    const { id } = validateWithZod(
      z.object({ id: uuidParamSchema }),
      { id: req.params.id },
      "Invalid pricing tier ID"
    );
    const tier = await storage.setCurrentPricingTier(id);

    // Log admin action
    await logAdminAction(
      req,
      "set_current_pricing_tier",
      "pricing_tier",
      id,
      {
        amount: tier.amount,
        effectiveDate: tier.effectiveDate,
      }
    );

    res.json(tier);
  }));

  // Admin Activity Logs
  app.get("/api/admin/activity", isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const logs = await storage.getAllAdminActionLogs();
    res.json(logs);
  }));

  return server;
}

