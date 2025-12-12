import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isAdminWithCsrf, isUserAdmin, getUserId, syncClerkUserToDatabase } from "./auth";
import { validateCsrfToken, generateCsrfTokenForAdmin } from "./csrf";
import { publicListingLimiter, publicItemLimiter } from "./rateLimiter";
import { fingerprintRequests, getSuspiciousPatterns, getSuspiciousPatternsForIP, clearSuspiciousPatterns } from "./antiScraping";
import { rotateDisplayOrder, addAntiScrapingDelay, isLikelyBot } from "./dataObfuscation";
import { readSkillsFromFile, addSkillToFile, removeSkillFromFile, getSkillsAsDirectorySkills } from "./skillsFileManager";
import { 
  insertPaymentSchema,
  insertPricingTierSchema,
  insertSupportMatchProfileSchema,
  insertPartnershipSchema,
  insertMessageSchema,
  insertExclusionSchema,
  insertReportSchema,
  insertAnnouncementSchema,
  insertSupportmatchAnnouncementSchema,
  insertLighthouseProfileSchema,
  insertLighthousePropertySchema,
  insertLighthouseMatchSchema,
  insertLighthouseAnnouncementSchema,
  insertSocketrelayRequestSchema,
  insertSocketrelayFulfillmentSchema,
  insertSocketrelayMessageSchema,
  insertSocketrelayProfileSchema,
  insertSocketrelayAnnouncementSchema,
  insertDirectoryProfileSchema,
  insertDirectoryAnnouncementSchema,
  insertDirectorySkillSchema,
  insertSkillsSectorSchema,
  insertSkillsJobTitleSchema,
  insertSkillsSkillSchema,
  insertChatGroupSchema,
  insertChatgroupsAnnouncementSchema,
  insertTrusttransportProfileSchema,
  insertTrusttransportRideRequestSchema,
  insertTrusttransportAnnouncementSchema,
  insertNpsResponseSchema,
  type InsertTrusttransportRideRequest,
  insertMechanicmatchProfileSchema,
  insertMechanicmatchVehicleSchema,
  insertMechanicmatchServiceRequestSchema,
  insertMechanicmatchJobSchema,
  insertMechanicmatchAvailabilitySchema,
  insertMechanicmatchReviewSchema,
  insertMechanicmatchMessageSchema,
  insertMechanicmatchAnnouncementSchema,
  type InsertMechanicmatchProfile,
  insertLostmailIncidentSchema,
  insertLostmailAnnouncementSchema,
  insertLostmailAuditTrailSchema,
  insertResearchItemSchema,
  insertResearchAnswerSchema,
  insertResearchCommentSchema,
  insertResearchVoteSchema,
  insertResearchLinkProvenanceSchema,
  insertResearchBookmarkSchema,
  insertResearchFollowSchema,
  insertResearchReportSchema,
  insertResearchAnnouncementSchema,
  insertGentlepulseMeditationSchema,
  insertGentlepulseRatingSchema,
  insertGentlepulseMoodCheckSchema,
  insertGentlepulseFavoriteSchema,
  insertGentlepulseAnnouncementSchema,
  insertChymeProfileSchema,
  insertChymeRoomSchema,
  insertChymeMessageSchema,
  insertChymeSurveyResponseSchema,
  insertChymeAnnouncementSchema,
  insertWorkforceRecruiterProfileSchema,
  insertWorkforceRecruiterConfigSchema,
  insertWorkforceRecruiterOccupationSchema,
  insertWorkforceRecruiterMeetupEventSchema,
  insertWorkforceRecruiterMeetupEventSignupSchema,
  insertWorkforceRecruiterAnnouncementSchema,
  insertDefaultAliveOrDeadFinancialEntrySchema,
  insertDefaultAliveOrDeadEbitdaSnapshotSchema,
} from "@shared/schema";
import { asyncHandler } from "./errorHandler";
import { validateWithZod } from "./validationErrorFormatter";
import { withDatabaseErrorHandling } from "./databaseErrorHandler";
import { NotFoundError, ForbiddenError, ValidationError, UnauthorizedError, ExternalServiceError } from "./errors";
import * as Sentry from '@sentry/node';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Anti-scraping: Fingerprint requests (must be before rate limiting)
  app.use(fingerprintRequests);

  // Helper to get user ID from request (imported from auth module)

  // Helper to log admin actions
  const logAdminAction = async (
    adminId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ) => {
    try {
      await storage.createAdminActionLog({
        adminId,
        action,
        resourceType,
        resourceId: resourceId || null,
        details: details || null,
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  };

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

  // Clerk webhook endpoint for user events
  // Note: This endpoint should be configured in Clerk Dashboard with webhook secret
  // Configure the webhook URL in Clerk Dashboard: https://app.chargingthefuture.com/api/webhooks/clerk
  // For now, it's a placeholder that can be enhanced with proper webhook verification using @clerk/backend
  app.post('/api/webhooks/clerk', async (req: any, res) => {
    try {
      // TODO: Add webhook signature verification using CLERK_WEBHOOK_SECRET
      // Install @clerk/backend and use webhook verification:
      // import { Webhook } from '@clerk/backend';
      // const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      // const payload = webhook.verify(req.body, req.headers);
      
      const event = req.body;
      
      // Handle user.created event
      if (event.type === 'user.created') {
        const clerkUserId = event.data.id;
        const email = event.data.email_addresses?.[0]?.email_address;
        
        // Note: User will be synced to DB via the auth middleware on first request
        // This webhook is mainly for logging
        // Users need to be manually approved by an admin to access the app
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error("Error processing Clerk webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Log request details for debugging
      const requestInfo = {
        hasAuth: !!req.auth,
        authUserId: req.auth?.userId,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      };
      
      let userId: string;
      try {
        userId = getUserId(req);
      } catch (getUserIdError: any) {
        console.error("Error getting userId from request:", {
          ...requestInfo,
          error: getUserIdError.message,
          stack: getUserIdError.stack,
        });
        return res.status(401).json({ 
          message: "Authentication failed: Unable to extract user ID. Please try signing in again." 
        });
      }
      
      // Validate userId is present
      if (!userId || userId.trim() === "") {
        console.error("Error: userId is missing or empty", requestInfo);
        return res.status(401).json({ 
          message: "Authentication failed: User ID not found. Please try signing in again." 
        });
      }
      
      // Try to get user from database with specific error handling
      let user: any;
      try {
        user = await storage.getUser(userId);
      } catch (dbError: any) {
        // Log detailed database error for production debugging
        console.error("Database error fetching user:", {
          userId,
          error: dbError.message,
          code: dbError.code,
          errno: dbError.errno,
          sqlState: dbError.sqlState,
          stack: dbError.stack,
          name: dbError.name,
          // Include environment info for debugging
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        });
        
        // If database query fails, try to sync from Clerk as fallback
        // This handles cases where database is temporarily unavailable
        console.log(`Database query failed for user ${userId}, attempting to sync from Clerk as fallback`);
        try {
          const sessionClaims = (req.auth as any)?.sessionClaims;
          user = await syncClerkUserToDatabase(userId, sessionClaims);
          // If sync succeeds, return the user
          if (user) {
            return res.json(user);
          }
        } catch (syncError: any) {
          console.error("Both database and Clerk sync failed:", {
            userId,
            dbError: dbError.message,
            syncError: syncError.message,
            dbErrorCode: dbError.code,
            syncErrorCode: syncError.code,
            dbErrorStack: dbError.stack,
            syncErrorStack: syncError.stack,
            environment: process.env.NODE_ENV,
            hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            timestamp: new Date().toISOString(),
          });
          
          // If sync fails (e.g., deleted user), return appropriate error
          if (syncError.message?.includes("deleted")) {
            return res.status(403).json({ 
              message: syncError.message || "This account has been deleted. Please contact support if you believe this is an error." 
            });
          }
          
          // If both database and Clerk fail, return a more specific error
          // Check if it's a connection/timeout error
          const isConnectionError = 
            dbError.message?.includes("timeout") ||
            dbError.message?.includes("ECONNREFUSED") ||
            dbError.message?.includes("ENOTFOUND") ||
            dbError.code === "ETIMEDOUT" ||
            dbError.code === "ECONNREFUSED";
          
          if (isConnectionError) {
            console.error("Database connection error - returning 503 Service Unavailable", {
              userId,
              environment: process.env.NODE_ENV,
              timestamp: new Date().toISOString(),
            });
            return res.status(503).json({ 
              message: "Database temporarily unavailable. Please try again in a moment.",
              retryAfter: 5, // Suggest retry after 5 seconds
            });
          }
          
          // For other errors, return 500 error instead of null
          // Never return null for authenticated users - this causes sync failure errors in frontend
          console.error(`Both database query and sync failed for user ${userId}, returning error.`, {
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            dbErrorType: dbError.constructor?.name,
            syncErrorType: syncError.constructor?.name,
            dbErrorMessage: dbError.message,
            syncErrorMessage: syncError.message,
          });
          return res.status(500).json({ 
            message: "Failed to sync user. Please try refreshing the page.",
            error: process.env.NODE_ENV === 'development' ? `Database error: ${dbError.message}. Sync error: ${syncError.message}` : undefined
          });
        }
      }
      
      // If user doesn't exist in our database after middleware sync, try one more time
      // This handles edge cases where sync might have failed in middleware
      if (!user) {
        console.log(`User not found in database after middleware sync, attempting fallback sync: ${userId}`, {
          hasSessionClaims: !!(req.auth as any)?.sessionClaims,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        });
        try {
          // Pass session claims as fallback if Clerk API fails
          const sessionClaims = (req.auth as any)?.sessionClaims;
          const syncStartTime = Date.now();
          user = await syncClerkUserToDatabase(userId, sessionClaims);
          const syncDuration = Date.now() - syncStartTime;
          
          // If sync succeeded but user is still null, log warning and try one more fetch
          if (!user) {
            console.error(`Sync completed but user is still null for ${userId}. This should not happen.`, {
              syncDuration,
              environment: process.env.NODE_ENV,
              timestamp: new Date().toISOString(),
            });
            // Try one more time to get the user (might be a timing issue)
            try {
              // Wait a bit for database to catch up
              await new Promise(resolve => setTimeout(resolve, 100));
              user = await storage.getUser(userId);
              if (user) {
                console.log(`User found on retry for ${userId}`);
              } else {
                console.error(`User still not found after retry for ${userId}. This indicates a sync failure.`);
                return res.status(500).json({ 
                  message: "User sync failed. Please try refreshing the page." 
                });
              }
            } catch (retryError: any) {
              console.error(`Retry getUser also failed for ${userId}:`, retryError.message);
              return res.status(500).json({ 
                message: "Failed to retrieve user after sync. Please try refreshing the page." 
              });
            }
          } else {
            console.log(`Successfully synced user ${userId} in ${syncDuration}ms (fallback sync)`);
          }
        } catch (syncError: any) {
          const errorDetails = {
            userId,
            error: syncError.message,
            statusCode: syncError.statusCode,
            stack: syncError.stack,
            name: syncError.name,
            code: syncError.code,
            environment: process.env.NODE_ENV,
            hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            timestamp: new Date().toISOString(),
          };
          
          console.error("Error syncing user from Clerk (fallback):", errorDetails);
          
          // If sync fails (e.g., deleted user), return appropriate error
          if (syncError.message?.includes("deleted")) {
            return res.status(403).json({ 
              message: syncError.message || "This account has been deleted. Please contact support if you believe this is an error." 
            });
          }
          
          // If it's a database connection error, return 503
          if (syncError.message?.includes("Database temporarily unavailable") ||
              syncError instanceof ExternalServiceError && syncError.statusCode === 503) {
            return res.status(503).json({ 
              message: "Database temporarily unavailable. Please try again in a moment.",
              retryAfter: 5,
            });
          }
          
          // For other sync errors, return 500 with helpful message
          // Don't return null - this causes confusion in the frontend
          return res.status(500).json({ 
            message: "Failed to sync user. Please try refreshing the page.",
            error: process.env.NODE_ENV === 'development' ? syncError.message : undefined
          });
        }
      }
      
      // Check if user is deleted
      if (user && user.email === null && user.firstName === "Deleted" && user.lastName === "User") {
        return res.status(403).json({ 
          message: "This account has been deleted. Please contact support if you believe this is an error." 
        });
      }
      
      res.json(user);
    } catch (error: any) {
      // Catch any unexpected errors that bypassed inner error handlers
      const errorDetails = {
        error: error.message,
        stack: error.stack,
        userId: req.auth?.userId,
        hasAuth: !!req.auth,
        name: error.name,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        statusCode: error.statusCode,
        // Environment checks
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        // Request details
        path: req.path,
        method: req.method,
      };
      
      console.error("Unexpected error fetching user (outer catch):", errorDetails);
      
      // Send to Sentry
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: {
            endpoint: '/api/auth/user',
            errorType: 'unexpected',
          },
          extra: errorDetails,
          user: {
            id: req.auth?.userId,
          },
        });
      }
      
      // Provide more helpful error message based on error type
      let errorMessage = "Failed to fetch user";
      if (error.message?.includes("DATABASE_URL")) {
        errorMessage = "Database configuration error. Please contact support.";
      } else if (error.message?.includes("CLERK_SECRET_KEY")) {
        errorMessage = "Authentication service configuration error. Please contact support.";
      } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        errorMessage = "Database connection failed. Please try again in a moment.";
      }
      
      res.status(500).json({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Account deletion - delete entire user account from all mini-apps
  app.delete('/api/account/delete', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;

    try {
      await storage.deleteUserAccount(userId, reason);
      res.json({ message: "Account deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user account:", error);
      res.status(400).json({ message: error.message || "Failed to delete account" });
    }
  }));

  // Terms acceptance
  app.post('/api/account/accept-terms', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.updateTermsAcceptance(userId);
      res.json({ message: "Terms accepted successfully", termsAcceptedAt: user.termsAcceptedAt });
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      res.status(500).json({ message: error.message || "Failed to accept terms" });
    }
  }));

  // User routes
  app.get('/api/payments', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const payments = await withDatabaseErrorHandling(
      () => storage.getPaymentsByUser(userId),
      'getPaymentsByUser'
    );
    res.json(payments);
  }));

  app.get('/api/payments/status', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const status = await withDatabaseErrorHandling(
      () => storage.getUserPaymentStatus(userId),
      'getUserPaymentStatus'
    );
    res.json(status);
  }));

  // Weekly Performance Review
  app.get('/api/admin/weekly-performance', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const weekStartParam = req.query.weekStart;
      let weekStart: Date;
      
      if (weekStartParam) {
        // Parse date string (YYYY-MM-DD) and interpret as local date, not UTC
        const [year, month, day] = weekStartParam.split('-').map(Number);
        weekStart = new Date(year, month - 1, day);
        if (isNaN(weekStart.getTime())) {
          return res.status(400).json({ message: "Invalid weekStart date format" });
        }
      } else {
        // Default to current week
        weekStart = new Date();
      }
      
      console.log("Weekly performance request - weekStart input:", weekStartParam || "current date");
      console.log("Parsed weekStart date:", weekStart.toISOString());
      
      const review = await storage.getWeeklyPerformanceReview(weekStart);
      
      console.log("=== Weekly Performance Review Result ===");
      console.log("Review keys:", Object.keys(review));
      console.log("Has metrics property:", 'metrics' in review);
      console.log("Metrics value:", review.metrics);
      console.log("Metrics type:", typeof review.metrics);
      
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
        chymeValuablePercentage: 0,
        chymeValuableChange: 0,
        chymeSurveyResponses: 0,
      };
      
      const response = {
        currentWeek: review.currentWeek,
        previousWeek: review.previousWeek,
        comparison: review.comparison,
        metrics: review.metrics || defaultMetrics,
      };
      
      console.log("Response keys:", Object.keys(response));
      console.log("Response has metrics:", 'metrics' in response);
      console.log("Response metrics:", response.metrics);
      
      res.json(response);
    } catch (error: any) {
      console.error("Error fetching weekly performance review:", error);
      res.status(500).json({ message: error.message || "Failed to fetch weekly performance review" });
    }
  });

  // Admin routes - Anti-scraping monitoring
  app.get('/api/admin/anti-scraping/patterns', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const ip = req.query.ip as string | undefined;
      const patterns = ip 
        ? getSuspiciousPatternsForIP(ip)
        : getSuspiciousPatterns();
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching suspicious patterns:", error);
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });

  app.delete('/api/admin/anti-scraping/patterns', isAuthenticated, isAdmin, validateCsrfToken, async (req, res) => {
    try {
      const ip = req.query.ip as string | undefined;
      clearSuspiciousPatterns(ip);
      res.json({ message: ip ? `Cleared patterns for IP ${ip}` : "Cleared all patterns" });
    } catch (error) {
      console.error("Error clearing suspicious patterns:", error);
      res.status(500).json({ message: "Failed to clear patterns" });
    }
  });

  // Admin routes - Users
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      console.log(`[Admin Users API] Fetched ${users.length} users from database`);
      if (users.length > 0) {
        console.log(`[Admin Users API] Sample user IDs:`, users.slice(0, 3).map(u => ({ id: u.id, idType: typeof u.id, email: u.email })));
      }
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/verify', isAuthenticated, isAdmin, validateCsrfToken, async (req: any, res) => {
    try {
      const adminId = getUserId(req);
      const { isVerified } = req.body;
      const user = await storage.updateUserVerification(req.params.id, !!isVerified);
      await logAdminAction(adminId, 'verify_user', 'user', user.id, { isVerified: user.isVerified });
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user verification:", error);
      res.status(400).json({ message: error.message || "Failed to update user verification" });
    }
  });

  app.put('/api/admin/users/:id/approve', isAuthenticated, isAdmin, validateCsrfToken, async (req: any, res) => {
    try {
      const adminId = getUserId(req);
      const { isApproved } = req.body;
      const user = await storage.updateUserApproval(req.params.id, !!isApproved);
      await logAdminAction(adminId, 'approve_user', 'user', user.id, { isApproved: user.isApproved });
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user approval:", error);
      // Return 404 for "User not found" errors, 400 for other errors
      const statusCode = error.message === "User not found" ? 404 : 400;
      res.status(statusCode).json({ message: error.message || "Failed to update user approval" });
    }
  });

  // User route - Update own Quora profile URL
  app.put('/api/user/quora-profile-url', isAuthenticated, async (req: any, res) => {
    try {
      // Log request details for debugging
      const requestInfo = {
        hasAuth: !!req.auth,
        authUserId: req.auth?.userId,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      };
      
      let userId: string;
      try {
        userId = getUserId(req);
      } catch (getUserIdError: any) {
        console.error("Error getting userId from request:", {
          ...requestInfo,
          error: getUserIdError.message,
          stack: getUserIdError.stack,
        });
        return res.status(401).json({ 
          message: "Authentication failed: Unable to extract user ID. Please try signing in again." 
        });
      }
      
      // Validate userId is present
      if (!userId || userId.trim() === "") {
        console.error("Error: userId is missing or empty", requestInfo);
        return res.status(401).json({ 
          message: "Authentication failed: User ID not found. Please try signing in again." 
        });
      }
      
      const { quoraProfileUrl } = req.body;
      const user = await storage.updateUserQuoraProfileUrl(userId, quoraProfileUrl || null);
      if (!user) {
        console.error("Error: User not found after update attempt", {
          ...requestInfo,
          userId,
        });
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Error updating Quora profile URL:", {
        error: error.message,
        stack: error.stack,
        hasAuth: !!req.auth,
        authUserId: req.auth?.userId,
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      // Return 404 for "User not found" errors, 400 for other errors
      const statusCode = error.message === "User not found" ? 404 : 400;
      res.status(statusCode).json({ message: error.message || "Failed to update Quora profile URL" });
    }
  });

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
    );
    
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
    );
    
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
    );
    
    await logAdminAction(
      userId,
      "set_current_pricing_tier",
      "pricing_tier",
      tier.id,
      { amount: tier.amount }
    );

    res.json(tier);
  }));

  // ========================================
  // SUPPORTMATCH APP ROUTES
  // ========================================

  // ========================================
  // DIRECTORY APP ROUTES
  // ========================================

  // Current user's Directory profile
  app.get('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileByUserId(userId),
      'getDirectoryProfileByUserId'
    );
    if (!profile) {
      return res.json(null);
    }
    let displayName: string | null = null;
    let userIsVerified = false;
    let userFirstName: string | null = null;
    let userLastName: string | null = null;
    
    // Get user data if userId exists
    if (profile.userId) {
      const user = await withDatabaseErrorHandling(
        () => storage.getUser(profile.userId),
        'getUserForDirectoryProfile'
      );
      if (user) {
        userFirstName = user.firstName || null;
        userLastName = user.lastName || null;
        userIsVerified = user.isVerified || false;
        // Build display name from firstName and lastName
        if (userFirstName && userLastName) {
          displayName = `${userFirstName} ${userLastName}`;
        } else if (userFirstName) {
          displayName = userFirstName;
        }
      }
    } else {
      // For admin-created profiles without userId, use profile's own isVerified field
      userIsVerified = profile.isVerified || false;
    }
    
    res.json({ ...profile, displayName, userIsVerified, firstName: userFirstName, lastName: userLastName });
  }));

  app.post('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    // Prevent duplicate
    const existing = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileByUserId(userId),
      'getDirectoryProfileByUserId'
    );
    if (existing) {
      // Reuse validation error pathway
      return res.status(400).json({ message: "Directory profile already exists" });
    }

    const validated = validateWithZod(insertDirectoryProfileSchema, {
      ...req.body,
      userId,
      isClaimed: true,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createDirectoryProfile(validated),
      'createDirectoryProfile'
    );
    res.json(profile);
  }));

  app.put('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileByUserId(userId),
      'getDirectoryProfileByUserId'
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Do not allow changing userId/isClaimed directly
    const { userId: _u, isClaimed: _c, ...update } = req.body;
    const validated = validateWithZod(insertDirectoryProfileSchema.partial() as any, update, 'Invalid profile update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateDirectoryProfile(profile.id, validated),
      'updateDirectoryProfile'
    );
    res.json(updated);
  }));

  app.delete('/api/directory/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteDirectoryProfileWithCascade(userId, reason),
      'deleteDirectoryProfileWithCascade'
    );
    res.json({ message: "Directory profile deleted successfully" });
  }));

  // Public skills endpoint (for authenticated users to view available skills)
  // Returns flattened list of all skills for Directory app compatibility
  app.get('/api/directory/skills', isAuthenticated, asyncHandler(async (_req, res) => {
    try {
      const skills = await withDatabaseErrorHandling(
        () => storage.getAllSkillsFlattened(),
        'getAllSkillsFlattened'
      );
      // Format as DirectorySkill[] for backward compatibility
      const formatted = skills.map(s => ({ id: s.id, name: s.name }));
      
      // Log if no skills found (helps debug seeding issues)
      if (formatted.length === 0) {
        console.warn('⚠️ No skills found in database. Run seed script: npx tsx scripts/seedSkills.ts');
      }
      
      res.json(formatted);
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      // Return empty array instead of error to prevent frontend breakage
      // The frontend will show "No skills found" which is better than an error
      res.json([]);
    }
  }));

  // Public sectors endpoint (for authenticated users to view available sectors)
  app.get('/api/directory/sectors', isAuthenticated, asyncHandler(async (_req, res) => {
    try {
      const sectors = await withDatabaseErrorHandling(
        () => storage.getAllSkillsSectors(),
        'getAllSkillsSectors'
      );
      // Format as { id, name }[] for Directory app compatibility
      const formatted = sectors.map(s => ({ id: s.id, name: s.name }));
      
      // Log if no sectors found (helps debug seeding issues)
      if (formatted.length === 0) {
        console.warn('⚠️ No sectors found in database. Run seed script: npx tsx scripts/seedSkills.ts');
      }
      
      res.json(formatted);
    } catch (error: any) {
      console.error('Error fetching sectors:', error);
      // Return empty array instead of error to prevent frontend breakage
      res.json([]);
    }
  }));

  // Public job titles endpoint (for authenticated users to view available job titles)
  app.get('/api/directory/job-titles', isAuthenticated, asyncHandler(async (_req, res) => {
    try {
      const jobTitles = await withDatabaseErrorHandling(
        () => storage.getAllSkillsJobTitles(),
        'getAllSkillsJobTitles'
      );
      // Format as { id, name }[] for Directory app compatibility
      const formatted = jobTitles.map(jt => ({ id: jt.id, name: jt.name }));
      
      // Log if no job titles found (helps debug seeding issues)
      if (formatted.length === 0) {
        console.warn('⚠️ No job titles found in database. Run seed script: npx tsx scripts/seedSkills.ts');
      }
      
      res.json(formatted);
    } catch (error: any) {
      console.error('Error fetching job titles:', error);
      // Return empty array instead of error to prevent frontend breakage
      res.json([]);
    }
  }));

  // Public routes (with rate limiting to prevent scraping)
  app.get('/api/directory/public/:id', publicItemLimiter, asyncHandler(async (req, res) => {
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileById(req.params.id),
      'getDirectoryProfileById'
    );
    if (!profile || !profile.isPublic) {
      return res.status(404).json({ message: "Profile not found" });
    }
    let displayName: string | null = null;
    let userIsVerified = false;
    let userFirstName: string | null = null;
    let userLastName: string | null = null;
    
    // Get user data if userId exists
    if (profile.userId) {
      const user = await withDatabaseErrorHandling(
        () => storage.getUser(profile.userId),
        'getUserForPublicDirectoryProfile'
      );
      if (user) {
        userFirstName = user.firstName || null;
        userLastName = user.lastName || null;
        userIsVerified = user.isVerified || false;
        // Build display name from firstName and lastName
        if (userFirstName && userLastName) {
          displayName = `${userFirstName} ${userLastName}`;
        } else if (userFirstName) {
          displayName = userFirstName;
        }
      }
    } else {
      // For admin-created profiles without userId, use profile's own isVerified field
      userIsVerified = profile.isVerified || false;
    }
    res.json({ ...profile, displayName, userIsVerified, firstName: userFirstName, lastName: userLastName });
  }));

  app.get('/api/directory/public', publicListingLimiter, asyncHandler(async (req, res) => {
    // Add delay for suspicious requests
    const isSuspicious = (req as any).isSuspicious || false;
    const userAgent = req.headers['user-agent'];
    const accept = req.headers['accept'];
    const acceptLang = req.headers['accept-language'];
    const likelyBot = isLikelyBot(userAgent, accept, acceptLang);
    
    if (isSuspicious || likelyBot) {
      await addAntiScrapingDelay(true, 200, 800);
    } else {
      await addAntiScrapingDelay(false, 50, 200);
    }

    const profiles = await withDatabaseErrorHandling(
      () => storage.listPublicDirectoryProfiles(),
      'listPublicDirectoryProfiles'
    );
    const withNames = await Promise.all(profiles.map(async (p) => {
      let name: string | null = null;
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Get user data if userId exists
      if (p.userId) {
        const u = await withDatabaseErrorHandling(
          () => storage.getUser(p.userId),
          'getUserForPublicDirectoryList'
        );
        if (u) {
          userFirstName = u.firstName || null;
          userLastName = u.lastName || null;
          userIsVerified = u.isVerified || false;
          // Build display name from firstName and lastName
          if (userFirstName && userLastName) {
            name = `${userFirstName} ${userLastName}`;
          } else if (userFirstName) {
            name = userFirstName;
          }
        }
      } else {
        // For admin-created profiles without userId, use profile's own isVerified field
        userIsVerified = p.isVerified || false;
      }
      
      // Ensure we always return displayName, firstName, and lastName (even if null)
      return { ...p, displayName: name || null, userIsVerified, firstName: userFirstName, lastName: userLastName };
    }));
    
    // Rotate display order to make scraping harder
    const rotated = rotateDisplayOrder(withNames);
    
    res.json(rotated);
  }));

  // Authenticated list (shows additional non-public fields like signalUrl)
  app.get('/api/directory/list', isAuthenticated, asyncHandler(async (_req, res) => {
    const profiles = await withDatabaseErrorHandling(
      () => storage.listAllDirectoryProfiles(),
      'listAllDirectoryProfiles'
    );
    const withNames = await Promise.all(profiles.map(async (p) => {
      let name: string | null = null;
      let userIsVerified = false;
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      // Fetch user data once if userId exists
      let user: any = null;
      if (p.userId) {
        user = await withDatabaseErrorHandling(
          () => storage.getUser(p.userId),
          'getUserForDirectoryList'
        );
        if (user) {
          userFirstName = user.firstName || null;
          userLastName = user.lastName || null;
          userIsVerified = user.isVerified || false;
          // Build display name from firstName and lastName
          if (userFirstName && userLastName) {
            name = `${userFirstName} ${userLastName}`;
          } else if (userFirstName) {
            name = userFirstName;
          }
        }
      } else {
        // For admin-created profiles without userId, use profile's own isVerified field
        userIsVerified = p.isVerified || false;
      }
      
      // Ensure we always return displayName, firstName, and lastName (even if null)
      return { 
        ...p, 
        displayName: name || null, 
        userIsVerified,
        firstName: userFirstName || null,
        lastName: userLastName || null,
      };
    }));
    res.json(withNames);
  }));

  // Admin routes for Directory
  app.get('/api/directory/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    // For admin, return all profiles (no pagination on server)
    // Client-side pagination and search provides better UX for admins
    const profiles = await withDatabaseErrorHandling(
      () => storage.listAllDirectoryProfiles(),
      'listAllDirectoryProfiles'
    );
    res.json(profiles);
  }));

  // Admin creates an unclaimed profile
  app.post('/api/directory/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertDirectoryProfileSchema, {
      ...req.body,
      userId: req.body.userId || null,
      isClaimed: !!req.body.userId,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createDirectoryProfile(validated),
      'createDirectoryProfile'
    );
    await logAdminAction(adminId, 'create_directory_profile', 'directory_profile', profile.id, { isClaimed: profile.isClaimed });
    res.json(profile);
  }));

  // Removed admin seed endpoint; use scripts/seedDirectory.ts instead

  // Admin assigns an unclaimed profile to a user
  app.put('/api/directory/admin/profiles/:id/assign', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const updated = await withDatabaseErrorHandling(
      () => storage.updateDirectoryProfile(req.params.id, { userId, isClaimed: true } as any),
      'assignDirectoryProfile'
    );
    await logAdminAction(adminId, 'assign_directory_profile', 'directory_profile', updated.id, { userId });
    res.json(updated);
  }));

  // Admin update Directory profile (for editing unclaimed profiles)
  app.put('/api/directory/admin/profiles/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertDirectoryProfileSchema.partial() as any, req.body, 'Invalid profile update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateDirectoryProfile(req.params.id, validated),
      'updateDirectoryProfile'
    );
    await logAdminAction(adminId, 'update_directory_profile', 'directory_profile', updated.id);
    res.json(updated);
  }));

  // Admin delete Directory profile (for deleting unclaimed profiles)
  // NOTE: Unclaimed profile deletion is EXEMPT from data integrity requirements.
  // Unclaimed profiles have no user account, so no anonymization, cascade handling, or
  // profile deletion logging is required. This is a simple hard delete for admin cleanup.
  app.delete('/api/directory/admin/profiles/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const profileId = req.params.id;
    
    // Get profile first to check if it's unclaimed
    const profile = await withDatabaseErrorHandling(
      () => storage.getDirectoryProfileById(profileId),
      'getDirectoryProfileById'
    );
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Only allow deletion of unclaimed profiles via admin endpoint
    // Claimed profiles must use the user profile deletion endpoint which handles data integrity
    if (profile.isClaimed) {
      return res.status(400).json({ message: 'Cannot delete claimed profiles. Use profile deletion instead.' });
    }
    
    // Simple hard delete - no data integrity requirements for unclaimed profiles
    // No anonymization, no cascade handling, no profile deletion logging needed
    await withDatabaseErrorHandling(
      () => storage.deleteDirectoryProfile(profileId),
      'deleteDirectoryProfile'
    );
    
    // Log admin action for audit trail (not a profile deletion log)
    await logAdminAction(adminId, 'delete_directory_profile', 'directory_profile', profileId, { 
      wasUnclaimed: true,
      description: profile.description 
    });
    
    res.json({ message: 'Profile deleted successfully' });
  }));

  // Admin routes for Directory Skills (admin only) - Legacy, now uses hierarchical skills database
  app.get('/api/directory/admin/skills', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    try {
      const skills = await withDatabaseErrorHandling(
        () => storage.getAllSkillsFlattened(),
        'getAllSkillsFlattened'
      );
      // Format as DirectorySkill[] for backward compatibility
      const formatted = skills.map(s => ({ id: s.id, name: s.name }));
      res.json(formatted);
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ message: 'Failed to fetch skills' });
    }
  }));

  app.post('/api/directory/admin/skills', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertDirectorySkillSchema, req.body, 'Invalid skill data');
    
    try {
      addSkillToFile(validated.name);
      const skill = { name: validated.name };
      
      await logAdminAction(adminId, 'create_directory_skill', 'skill_file', validated.name, { name: validated.name });
      res.json(skill);
    } catch (error: any) {
      console.error('Error adding skill to file:', error);
      if (error.message?.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to add skill' });
      }
    }
  }));

  app.delete('/api/directory/admin/skills', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { name: skillNameParam } = req.body;
    
    if (!skillNameParam || typeof skillNameParam !== 'string') {
      return res.status(400).json({ message: 'Skill name is required in request body' });
    }
    
    const trimmedName = skillNameParam.trim();
    
    try {
      // Get all skills and find the exact match (case-insensitive)
      const skills = readSkillsFromFile();
      const skillLower = trimmedName.toLowerCase();
      const exactSkill = skills.find(s => s.trim().toLowerCase() === skillLower);
      
      if (!exactSkill) {
        console.error(`Skill not found: "${trimmedName}"`);
        console.error(`Searching for (lowercase): "${skillLower}"`);
        console.error(`Total skills in file: ${skills.length}`);
        console.error(`Sample skills:`, skills.slice(0, 10).map(s => `"${s}"`));
        return res.status(404).json({ message: `Skill "${trimmedName}" not found` });
      }
      
      // Use the exact skill name from the file for deletion
      removeSkillFromFile(exactSkill);
      
      await logAdminAction(adminId, 'delete_directory_skill', 'skill_file', exactSkill, { name: exactSkill });
      res.json({ message: 'Skill deleted successfully' });
    } catch (error: any) {
      console.error('Error removing skill from file:', error);
      if (error.message?.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to delete skill' });
      }
    }
  }));

  // ========================================
  // SHARED SKILLS DATABASE API ROUTES
  // ========================================

  // Get full hierarchy (for admin management)
  app.get('/api/skills/hierarchy', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const hierarchy = await withDatabaseErrorHandling(
      () => storage.getSkillsHierarchy(),
      'getSkillsHierarchy'
    );
    res.json(hierarchy);
  }));

  // Get flattened list (for Directory app)
  app.get('/api/skills/flattened', isAuthenticated, asyncHandler(async (_req, res) => {
    const skills = await withDatabaseErrorHandling(
      () => storage.getAllSkillsFlattened(),
      'getAllSkillsFlattened'
    );
    res.json(skills);
  }));

  // Sectors CRUD
  app.get('/api/skills/sectors', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const sectors = await withDatabaseErrorHandling(
      () => storage.getAllSkillsSectors(),
      'getAllSkillsSectors'
    );
    res.json(sectors);
  }));

  app.post('/api/skills/sectors', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertSkillsSectorSchema, req.body, 'Invalid sector data');
    const sector = await withDatabaseErrorHandling(
      () => storage.createSkillsSector(validated),
      'createSkillsSector'
    );
    await logAdminAction(adminId, 'create_skills_sector', 'skills_sector', sector.id, { name: sector.name });
    res.json(sector);
  }));

  app.put('/api/skills/sectors/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const sector = await withDatabaseErrorHandling(
      () => storage.updateSkillsSector(req.params.id, req.body),
      'updateSkillsSector'
    );
    await logAdminAction(adminId, 'update_skills_sector', 'skills_sector', sector.id, { name: sector.name });
    res.json(sector);
  }));

  app.delete('/api/skills/sectors/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteSkillsSector(req.params.id),
      'deleteSkillsSector'
    );
    await logAdminAction(adminId, 'delete_skills_sector', 'skills_sector', req.params.id, {});
    res.json({ message: 'Sector deleted successfully' });
  }));

  // Job Titles CRUD
  app.get('/api/skills/job-titles', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const sectorId = req.query.sectorId as string | undefined;
    const jobTitles = await withDatabaseErrorHandling(
      () => storage.getAllSkillsJobTitles(sectorId),
      'getAllSkillsJobTitles'
    );
    res.json(jobTitles);
  }));

  app.post('/api/skills/job-titles', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertSkillsJobTitleSchema, req.body, 'Invalid job title data');
    const jobTitle = await withDatabaseErrorHandling(
      () => storage.createSkillsJobTitle(validated),
      'createSkillsJobTitle'
    );
    await logAdminAction(adminId, 'create_skills_job_title', 'skills_job_title', jobTitle.id, { name: jobTitle.name });
    res.json(jobTitle);
  }));

  app.put('/api/skills/job-titles/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const jobTitle = await withDatabaseErrorHandling(
      () => storage.updateSkillsJobTitle(req.params.id, req.body),
      'updateSkillsJobTitle'
    );
    await logAdminAction(adminId, 'update_skills_job_title', 'skills_job_title', jobTitle.id, { name: jobTitle.name });
    res.json(jobTitle);
  }));

  app.delete('/api/skills/job-titles/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteSkillsJobTitle(req.params.id),
      'deleteSkillsJobTitle'
    );
    await logAdminAction(adminId, 'delete_skills_job_title', 'skills_job_title', req.params.id, {});
    res.json({ message: 'Job title deleted successfully' });
  }));

  // Skills CRUD
  app.get('/api/skills/skills', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const jobTitleId = req.query.jobTitleId as string | undefined;
    const skills = await withDatabaseErrorHandling(
      () => storage.getAllSkillsSkills(jobTitleId),
      'getAllSkillsSkills'
    );
    res.json(skills);
  }));

  app.post('/api/skills/skills', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertSkillsSkillSchema, req.body, 'Invalid skill data');
    const skill = await withDatabaseErrorHandling(
      () => storage.createSkillsSkill(validated),
      'createSkillsSkill'
    );
    await logAdminAction(adminId, 'create_skills_skill', 'skills_skill', skill.id, { name: skill.name });
    res.json(skill);
  }));

  app.put('/api/skills/skills/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const skill = await withDatabaseErrorHandling(
      () => storage.updateSkillsSkill(req.params.id, req.body),
      'updateSkillsSkill'
    );
    await logAdminAction(adminId, 'update_skills_skill', 'skills_skill', skill.id, { name: skill.name });
    res.json(skill);
  }));

  app.delete('/api/skills/skills/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteSkillsSkill(req.params.id),
      'deleteSkillsSkill'
    );
    await logAdminAction(adminId, 'delete_skills_skill', 'skills_skill', req.params.id, {});
    res.json({ message: 'Skill deleted successfully' });
  }));

  // ========================================
  // CHAT GROUPS APP ROUTES
  // ========================================

  // Public routes - anyone can view active groups
  app.get('/api/chatgroups', asyncHandler(async (_req, res) => {
    const groups = await withDatabaseErrorHandling(
      () => storage.getActiveChatGroups(),
      'getActiveChatGroups'
    );
    res.json(groups);
  }));

  // Admin routes
  app.get('/api/chatgroups/admin', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const groups = await withDatabaseErrorHandling(
      () => storage.getAllChatGroups(),
      'getAllChatGroups'
    );
    res.json(groups);
  }));

  app.post('/api/chatgroups/admin', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertChatGroupSchema, req.body, 'Invalid chat group data');
    const group = await withDatabaseErrorHandling(
      () => storage.createChatGroup(validated),
      'createChatGroup'
    );
    await logAdminAction(adminId, 'create_chat_group', 'chat_group', group.id);
    res.json(group);
  }));

  app.put('/api/chatgroups/admin/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertChatGroupSchema.partial() as any, req.body, 'Invalid chat group update');
    const group = await withDatabaseErrorHandling(
      () => storage.updateChatGroup(req.params.id, validated),
      'updateChatGroup'
    );
    await logAdminAction(adminId, 'update_chat_group', 'chat_group', group.id);
    res.json(group);
  }));

  app.delete('/api/chatgroups/admin/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteChatGroup(req.params.id),
      'deleteChatGroup'
    );
    await logAdminAction(adminId, 'delete_chat_group', 'chat_group', req.params.id);
    res.json({ message: "Chat group deleted" });
  }));

  // ChatGroups Announcement routes
  app.get('/api/chatgroups/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveChatgroupsAnnouncements(),
      'getActiveChatgroupsAnnouncements'
    );
    res.json(announcements);
  }));

  app.get('/api/chatgroups/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllChatgroupsAnnouncements(),
      'getAllChatgroupsAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/chatgroups/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChatgroupsAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createChatgroupsAnnouncement(validatedData),
      'createChatgroupsAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_chatgroups_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/chatgroups/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChatgroupsAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateChatgroupsAnnouncement(req.params.id, validatedData),
      'updateChatgroupsAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_chatgroups_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/chatgroups/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateChatgroupsAnnouncement(req.params.id),
      'deactivateChatgroupsAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_chatgroups_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // SupportMatch Profile routes
  app.get('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getSupportMatchProfile(userId),
      'getSupportMatchProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForSupportMatchProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSupportMatchProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');

    const profile = await withDatabaseErrorHandling(
      () => storage.createSupportMatchProfile(validatedData),
      'createSupportMatchProfile'
    );
    res.json(profile);
  }));

  app.put('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateSupportMatchProfile(userId, req.body),
      'updateSupportMatchProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/supportmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteSupportMatchProfile(userId, reason),
      'deleteSupportMatchProfile'
    );
    res.json({ message: "SupportMatch profile deleted successfully" });
  }));

  // SupportMatch Partnership routes
  app.get('/api/supportmatch/partnership/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const partnership = await storage.getActivePartnershipByUser(userId);
      res.json(partnership || null);
    } catch (error) {
      console.error("Error fetching active partnership:", error);
      res.status(500).json({ message: "Failed to fetch active partnership" });
    }
  });

  app.get('/api/supportmatch/partnership/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const partnerships = await storage.getPartnershipHistory(userId);
      res.json(partnerships);
    } catch (error) {
      console.error("Error fetching partnership history:", error);
      res.status(500).json({ message: "Failed to fetch partnership history" });
    }
  });

  app.get('/api/supportmatch/partnership/:id', isAuthenticated, async (req, res) => {
    try {
      const partnership = await storage.getPartnershipById(req.params.id);
      if (!partnership) {
        return res.status(404).json({ message: "Partnership not found" });
      }
      res.json(partnership);
    } catch (error) {
      console.error("Error fetching partnership:", error);
      res.status(500).json({ message: "Failed to fetch partnership" });
    }
  });

  // SupportMatch Messaging routes
  app.get('/api/supportmatch/messages/:partnershipId', isAuthenticated, asyncHandler(async (req, res) => {
    const messages = await withDatabaseErrorHandling(
      () => storage.getMessagesByPartnership(req.params.partnershipId),
      'getMessagesByPartnership'
    );
    res.json(messages);
  }));

  app.post('/api/supportmatch/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMessageSchema, {
      ...req.body,
      senderId: userId,
    }, 'Invalid message data');

    const message = await withDatabaseErrorHandling(
      () => storage.createMessage(validatedData),
      'createMessage'
    );
    res.json(message);
  }));

  // SupportMatch Exclusion routes
  app.get('/api/supportmatch/exclusions', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const exclusions = await withDatabaseErrorHandling(
      () => storage.getExclusionsByUser(userId),
      'getExclusionsByUser'
    );
    res.json(exclusions);
  }));

  app.post('/api/supportmatch/exclusions', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertExclusionSchema, {
      ...req.body,
      userId,
    }, 'Invalid exclusion data');

    const exclusion = await withDatabaseErrorHandling(
      () => storage.createExclusion(validatedData),
      'createExclusion'
    );
    res.json(exclusion);
  }));

  app.delete('/api/supportmatch/exclusions/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    await withDatabaseErrorHandling(
      () => storage.deleteExclusion(req.params.id),
      'deleteExclusion'
    );
    res.json({ message: "Exclusion removed successfully" });
  }));

  // SupportMatch Report routes
  app.post('/api/supportmatch/reports', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertReportSchema, {
      ...req.body,
      reporterId: userId,
    }, 'Invalid report data');

    const report = await withDatabaseErrorHandling(
      () => storage.createReport(validatedData),
      'createReport'
    );
    res.json(report);
  }));

  // SupportMatch Announcement routes (public)
  app.get('/api/supportmatch/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveSupportmatchAnnouncements(),
      'getActiveSupportmatchAnnouncements'
    );
    res.json(announcements);
  }));

  // SupportMatch Admin routes
  app.get('/api/supportmatch/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getSupportMatchStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching SupportMatch stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/supportmatch/admin/profiles', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const profiles = await storage.getAllSupportMatchProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get('/api/supportmatch/admin/partnerships', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const partnerships = await withDatabaseErrorHandling(
      () => storage.getAllPartnerships(),
      'getAllPartnerships'
    );
    res.json(partnerships);
  }));

  app.put('/api/supportmatch/admin/partnerships/:id/status', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const partnership = await withDatabaseErrorHandling(
      () => storage.updatePartnershipStatus(req.params.id, status),
      'updatePartnershipStatus'
    );
    await logAdminAction(
      userId,
      "update_partnership_status",
      "partnership",
      partnership.id,
      { status }
    );
    res.json(partnership);
  }));

  app.post('/api/supportmatch/admin/partnerships/run-matching', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const partnerships = await withDatabaseErrorHandling(
      () => storage.createAlgorithmicMatches(),
      'createAlgorithmicMatches'
    );
    await logAdminAction(
      userId,
      "run_algorithmic_matching",
      "partnership",
      undefined,
      { matchesCreated: partnerships.length }
    );
    res.json({
      message: `Successfully created ${partnerships.length} partnership(s)`,
      partnerships,
    });
  }));

  app.get('/api/supportmatch/admin/reports', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const reports = await withDatabaseErrorHandling(
      () => storage.getAllReports(),
      'getAllReports'
    );
    res.json(reports);
  }));

  app.put('/api/supportmatch/admin/reports/:id/status', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { status, resolution } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const report = await withDatabaseErrorHandling(
      () => storage.updateReportStatus(req.params.id, status, resolution),
      'updateReportStatus'
    );
    await logAdminAction(
      userId,
      "update_report_status",
      "report",
      report.id,
      { status, resolution }
    );
    res.json(report);
  }));

  app.get('/api/supportmatch/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllSupportmatchAnnouncements(),
      'getAllSupportmatchAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/supportmatch/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSupportmatchAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createSupportmatchAnnouncement(validatedData),
      'createSupportmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_supportmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/supportmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSupportmatchAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateSupportmatchAnnouncement(req.params.id, validatedData),
      'updateSupportmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_supportmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/supportmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateSupportmatchAnnouncement(req.params.id),
      'deactivateSupportmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_announcement",
      "announcement",
      announcement.id
    );

    res.json(announcement);
  }));

  // ========================================
  // LIGHTHOUSE APP ROUTES
  // ========================================

  // Profile routes
  app.get('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForLighthouseProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    
    // Check if profile already exists
    const existingProfile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    
    // Validate and create profile
    const validatedData = validateWithZod(insertLighthouseProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createLighthouseProfile(validatedData),
      'createLighthouseProfile'
    );
    
    res.json(profile);
  }));

  app.put('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Validate partial update (exclude userId from being updated)
    const { userId: _, ...updateData } = req.body;
    const validatedData = validateWithZod(insertLighthouseProfileSchema.partial() as any, updateData, 'Invalid profile update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProfile(profile.id, validatedData),
      'updateLighthouseProfile'
    );
    
    res.json(updated);
  }));

  app.delete('/api/lighthouse/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteLighthouseProfile(userId, reason),
      'deleteLighthouseProfile'
    );
    res.json({ message: "LightHouse profile deleted successfully" });
  }));

  // Property browsing routes (for seekers)
  app.get('/api/lighthouse/properties', isAuthenticated, asyncHandler(async (_req, res) => {
    const properties = await withDatabaseErrorHandling(
      () => storage.getAllActiveProperties(),
      'getAllActiveProperties'
    );
    res.json(properties);
  }));

  app.get('/api/lighthouse/properties/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  }));

  // Property management routes (for hosts)
  app.get('/api/lighthouse/my-properties', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.json([]);
    }
    
    const properties = await withDatabaseErrorHandling(
      () => storage.getPropertiesByHost(profile.id),
      'getPropertiesByHost'
    );
    res.json(properties);
  }));

  app.post('/api/lighthouse/properties', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    if (profile.profileType !== 'host') {
      return res.status(403).json({ message: "Only hosts can create properties" });
    }
    
    // Validate and create property
    const validatedData = validateWithZod(insertLighthousePropertySchema, {
      ...req.body,
      hostId: profile.id,
    }, 'Invalid property data');
    const property = await withDatabaseErrorHandling(
      () => storage.createLighthouseProperty(validatedData),
      'createLighthouseProperty'
    );
    
    res.json(property);
  }));

  app.put('/api/lighthouse/properties/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (!profile || property.hostId !== profile.id) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }
    
    // Validate partial update (exclude hostId from being updated)
    const { hostId: _, ...updateData } = req.body;
    const validatedData = validateWithZod(insertLighthousePropertySchema.partial() as any, updateData, 'Invalid property update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProperty(req.params.id, validatedData),
      'updateLighthouseProperty'
    );
    
    res.json(updated);
  }));

  // Match routes
  app.get('/api/lighthouse/matches', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.json([]);
    }
    
    const matches = await withDatabaseErrorHandling(
      () => storage.getMatchesByProfile(profile.id),
      'getMatchesByProfile'
    );
    res.json(matches);
  }));

  app.post('/api/lighthouse/matches', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please create a profile first." });
    }
    
    if (profile.profileType !== 'seeker') {
      return res.status(403).json({ message: "Only seekers can request matches" });
    }
    
    const { propertyId, message } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    
    // Validate property exists
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(propertyId),
      'getLighthousePropertyById'
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if match already exists to prevent duplicates
    const existingMatches = await withDatabaseErrorHandling(
      () => storage.getMatchesBySeeker(profile.id),
      'getMatchesBySeeker'
    );
    const existingMatch = existingMatches.find(m => m.propertyId === propertyId);
    if (existingMatch && existingMatch.status !== 'cancelled') {
      return res.status(409).json({ 
        message: "You have already requested a match for this property",
        matchId: existingMatch.id 
      });
    }

    // Create match request (note: no hostId field, it's determined via property)
    const validatedData = validateWithZod(insertLighthouseMatchSchema, {
      seekerId: profile.id,
      propertyId,
      seekerMessage: message || null,
      status: 'pending',
    }, 'Invalid match data');
    const match = await withDatabaseErrorHandling(
      () => storage.createLighthouseMatch(validatedData),
      'createLighthouseMatch'
    );
    
    if (!match) {
      return res.status(500).json({ message: "Failed to create match request" });
    }
    
    res.json(match);
  }));

  app.put('/api/lighthouse/matches/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileByUserId(userId),
      'getLighthouseProfileByUserId'
    );
    const match = await withDatabaseErrorHandling(
      () => storage.getLighthouseMatchById(req.params.id),
      'getLighthouseMatchById'
    );
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    if (!profile) {
      return res.status(403).json({ message: "Profile not found" });
    }
    
    // Get property to determine host
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(match.propertyId),
      'getLighthousePropertyById'
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check authorization
    const isHost = property.hostId === profile.id;
    const isSeeker = match.seekerId === profile.id;
    
    if (!isHost && !isSeeker) {
      return res.status(403).json({ message: "You can only update your own matches" });
    }
    
    const { status, hostResponse } = req.body;
    
    // Only hosts can accept/reject matches
    if (status && status !== 'cancelled' && !isHost) {
      return res.status(403).json({ message: "Only the host can accept or reject matches" });
    }
    
    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (hostResponse && isHost) updateData.hostResponse = hostResponse;
    
    const validatedData = validateWithZod(insertLighthouseMatchSchema.partial() as any, updateData, 'Invalid match update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseMatch(req.params.id, validatedData),
      'updateLighthouseMatch'
    );
    
    res.json(updated);
  }));

  // Admin routes
  app.get('/api/lighthouse/admin/stats', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const stats = await withDatabaseErrorHandling(
      () => storage.getLighthouseStats(),
      'getLighthouseStats'
    );
    res.json(stats);
  }));

  app.get('/api/lighthouse/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const profiles = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseProfiles(),
      'getAllLighthouseProfiles'
    );
    res.json(profiles);
  }));

  app.get('/api/lighthouse/admin/profiles/:id', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const profile = await withDatabaseErrorHandling(
      () => storage.getLighthouseProfileById(req.params.id),
      'getLighthouseProfileById'
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Enrich with user information
    const user = profile.userId ? await withDatabaseErrorHandling(
      () => storage.getUser(profile.userId!),
      'getUserForLighthouseAdminProfile'
    ) : null;
    const profileWithUser = {
      ...profile,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      } : null,
    };
    
    res.json(profileWithUser);
  }));

  app.get('/api/lighthouse/admin/seekers', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    // Get all seekers (both active and inactive) for admin view
    const allProfiles = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseProfiles(),
      'getAllLighthouseProfiles'
    );
    const seekers = allProfiles.filter(p => p.profileType === 'seeker');
    
    // Enrich with user information
    const seekersWithUsers = await Promise.all(seekers.map(async (seeker) => {
      const user = seeker.userId ? await withDatabaseErrorHandling(
        () => storage.getUser(seeker.userId!),
        'getUserForLighthouseAdminSeekers'
      ) : null;
      return {
        ...seeker,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        } : null,
      };
    }));
    res.json(seekersWithUsers);
  }));

  app.get('/api/lighthouse/admin/hosts', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    // Get all hosts (both active and inactive) for admin view
    const allProfiles = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseProfiles(),
      'getAllLighthouseProfiles'
    );
    const hosts = allProfiles.filter(p => p.profileType === 'host');
    
    // Enrich with user information
    const hostsWithUsers = await Promise.all(hosts.map(async (host) => {
      const user = host.userId ? await withDatabaseErrorHandling(
        () => storage.getUser(host.userId!),
        'getUserForLighthouseAdminHosts'
      ) : null;
      return {
        ...host,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        } : null,
      };
    }));
    res.json(hostsWithUsers);
  }));

  app.get('/api/lighthouse/admin/properties', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const properties = await withDatabaseErrorHandling(
      () => storage.getAllProperties(),
      'getAllProperties'
    );
    res.json(properties);
  }));

  app.put('/api/lighthouse/admin/properties/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const property = await withDatabaseErrorHandling(
      () => storage.getLighthousePropertyById(req.params.id),
      'getLighthousePropertyById'
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Validate partial update
    const validatedData = validateWithZod(insertLighthousePropertySchema.partial() as any, req.body, 'Invalid property update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseProperty(req.params.id, validatedData),
      'updateLighthouseProperty'
    );
    
    await logAdminAction(
      userId,
      "update_lighthouse_property",
      "lighthouse_property",
      updated.id,
      { title: updated.title }
    );
    
    res.json(updated);
  }));

  app.get('/api/lighthouse/admin/matches', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const matches = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseMatches(),
      'getAllLighthouseMatches'
    );
    res.json(matches);
  }));

  app.put('/api/lighthouse/admin/matches/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const match = await withDatabaseErrorHandling(
      () => storage.getLighthouseMatchById(req.params.id),
      'getLighthouseMatchById'
    );
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    // Validate partial update
    const validatedData = validateWithZod(insertLighthouseMatchSchema.partial() as any, req.body, 'Invalid match update');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLighthouseMatch(req.params.id, validatedData),
      'updateLighthouseMatch'
    );
    
    await logAdminAction(
      userId,
      "update_lighthouse_match",
      "lighthouse_match",
      updated.id,
      { status: updated.status }
    );
    
    res.json(updated);
  }));

  // LightHouse Announcement routes (public)
  app.get('/api/lighthouse/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveLighthouseAnnouncements(),
      'getActiveLighthouseAnnouncements'
    );
    res.json(announcements);
  }));

  // LightHouse Admin announcement routes
  app.get('/api/lighthouse/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllLighthouseAnnouncements(),
      'getAllLighthouseAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/lighthouse/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLighthouseAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createLighthouseAnnouncement(validatedData),
      'createLighthouseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_lighthouse_announcement",
      "lighthouse_announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/lighthouse/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLighthouseAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateLighthouseAnnouncement(req.params.id, validatedData),
      'updateLighthouseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_lighthouse_announcement",
      "lighthouse_announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/lighthouse/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateLighthouseAnnouncement(req.params.id),
      'deactivateLighthouseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_lighthouse_announcement",
      "lighthouse_announcement",
      announcement.id
    );

    res.json(announcement);
  }));

  // SocketRelay Routes

  // SocketRelay Profile routes
  app.get('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getSocketrelayProfile(userId),
      'getSocketrelayProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForSocketrelayProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSocketrelayProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');

    const profile = await withDatabaseErrorHandling(
      () => storage.createSocketrelayProfile(validatedData),
      'createSocketrelayProfile'
    );
    res.json(profile);
  }));

  app.put('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateSocketrelayProfile(userId, req.body),
      'updateSocketrelayProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/socketrelay/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteSocketrelayProfile(userId, reason),
      'deleteSocketrelayProfile'
    );
    res.json({ message: "SocketRelay profile deleted successfully" });
  }));

  // Get all active requests
  app.get('/api/socketrelay/requests', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getActiveSocketrelayRequests(),
      'getActiveSocketrelayRequests'
    );
    res.json(requests);
  }));

  // Get single request by ID
  app.get('/api/socketrelay/requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(req.params.id),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', req.params.id);
    }
    res.json(request);
  }));

  // Get user's own requests
  app.get('/api/socketrelay/my-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requests = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestsByUser(userId),
      'getSocketrelayRequestsByUser'
    );
    res.json(requests);
  }));

  // Create a new request
  app.post('/api/socketrelay/requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validated = validateWithZod(insertSocketrelayRequestSchema, req.body, 'Invalid request data');
    
    const request = await withDatabaseErrorHandling(
      () => storage.createSocketrelayRequest(userId, validated.description, validated.isPublic || false),
      'createSocketrelayRequest'
    );
    res.json(request);
  }));

  // Update an existing request
  app.put('/api/socketrelay/requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requestId = req.params.id;
    const validated = validateWithZod(insertSocketrelayRequestSchema, req.body, 'Invalid request data');
    
    const request = await withDatabaseErrorHandling(
      () => storage.updateSocketrelayRequest(requestId, userId, validated.description, validated.isPublic || false),
      'updateSocketrelayRequest'
    );
    res.json(request);
  }));

  // Public SocketRelay request routes (no auth required, with rate limiting)
  app.get('/api/socketrelay/public', publicListingLimiter, asyncHandler(async (req, res) => {
    // Add delay for suspicious requests
    const isSuspicious = (req as any).isSuspicious || false;
    const userAgent = req.headers['user-agent'];
    const accept = req.headers['accept'];
    const acceptLang = req.headers['accept-language'];
    const likelyBot = isLikelyBot(userAgent, accept, acceptLang);
    
    if (isSuspicious || likelyBot) {
      await addAntiScrapingDelay(true, 200, 800);
    } else {
      await addAntiScrapingDelay(false, 50, 200);
    }

    const requests = await withDatabaseErrorHandling(
      () => storage.listPublicSocketrelayRequests(),
      'listPublicSocketrelayRequests'
    );
    
    // Enrich requests with creator info
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      const creatorProfile = await withDatabaseErrorHandling(
        () => storage.getSocketrelayProfile(request.userId),
        'getSocketrelayProfile'
      );
      const creator = await withDatabaseErrorHandling(
        () => storage.getUser(request.userId),
        'getUser'
      );
      
      return {
        ...request,
        creatorProfile: creatorProfile ? {
          city: creatorProfile.city,
          state: creatorProfile.state,
          country: creatorProfile.country,
        } : null,
        creator: creator ? {
          firstName: creator.firstName,
          lastName: creator.lastName,
          isVerified: creator.isVerified,
        } : null,
      };
    }));
    
    // Rotate display order to make scraping harder
    const rotated = rotateDisplayOrder(enrichedRequests);
    
    res.json(rotated);
  }));

  app.get('/api/socketrelay/public/:id', publicItemLimiter, asyncHandler(async (req, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getPublicSocketrelayRequestById(req.params.id),
      'getPublicSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', req.params.id);
    }
    
    // Get creator profile for location info
    const creatorProfile = await withDatabaseErrorHandling(
      () => storage.getSocketrelayProfile(request.userId),
      'getSocketrelayProfile'
    );
    const creator = await withDatabaseErrorHandling(
      () => storage.getUser(request.userId),
      'getUser'
    );
    
    // Build display name from firstName and lastName
    let displayName: string | null = null;
    if (creator) {
      if (creator.firstName && creator.lastName) {
        displayName = `${creator.firstName} ${creator.lastName}`;
      } else if (creator.firstName) {
        displayName = creator.firstName;
      }
    }
    
    res.json({
      ...request,
      creatorProfile: creatorProfile ? {
        city: creatorProfile.city,
        state: creatorProfile.state,
        country: creatorProfile.country,
      } : null,
      creator: creator ? {
        displayName,
        firstName: creator.firstName,
        lastName: creator.lastName,
        isVerified: creator.isVerified,
      } : null,
    });
  }));

  // Fulfill a request (create fulfillment)
  app.post('/api/socketrelay/requests/:id/fulfill', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requestId = req.params.id;

    // Check if request exists and is active
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', requestId);
    }

    if (request.status !== 'active') {
      throw new ValidationError("Request is not active");
    }

    // Check if already expired
    if (new Date(request.expiresAt) < new Date()) {
      throw new ValidationError("Request has expired");
    }

    // Don't allow users to fulfill their own requests
    if (request.userId === userId) {
      throw new ValidationError("You cannot fulfill your own request");
    }

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.createSocketrelayFulfillment(requestId, userId),
      'createSocketrelayFulfillment'
    );
    res.json(fulfillment);
  }));

  // Repost an expired request
  app.post('/api/socketrelay/requests/:id/repost', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requestId = req.params.id;

    const request = await withDatabaseErrorHandling(
      () => storage.repostSocketrelayRequest(requestId, userId),
      'repostSocketrelayRequest'
    );
    res.json(request);
  }));

  // Get fulfillment by ID (with request data)
  app.get('/api/socketrelay/fulfillments/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(req.params.id),
      'getSocketrelayFulfillmentById'
    );
    
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', req.params.id);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    res.json({ fulfillment, request });
  }));

  // Get user's fulfillments (where they are the fulfiller)
  app.get('/api/socketrelay/my-fulfillments', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillments = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentsByUser(userId),
      'getSocketrelayFulfillmentsByUser'
    );
    res.json(fulfillments);
  }));

  // Close a fulfillment
  app.post('/api/socketrelay/fulfillments/:id/close', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { status } = req.body; // completed_success or completed_failure

    if (!status || !['completed_success', 'completed_failure', 'cancelled'].includes(status)) {
      throw new ValidationError("Invalid status");
    }

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(req.params.id),
      'getSocketrelayFulfillmentById'
    );
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', req.params.id);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.closeSocketrelayFulfillment(req.params.id, userId, status),
      'closeSocketrelayFulfillment'
    );
    
    // Update request status to closed
    await withDatabaseErrorHandling(
      () => storage.updateSocketrelayRequestStatus(request.id, 'closed'),
      'updateSocketrelayRequestStatus'
    );

    res.json(updated);
  }));

  // Get messages for a fulfillment
  app.get('/api/socketrelay/fulfillments/:id/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillmentId = req.params.id;

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(fulfillmentId),
      'getSocketrelayFulfillmentById'
    );
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', fulfillmentId);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const messages = await withDatabaseErrorHandling(
      () => storage.getSocketrelayMessagesByFulfillment(fulfillmentId),
      'getSocketrelayMessagesByFulfillment'
    );
    res.json(messages);
  }));

  // Send a message in a fulfillment chat
  app.post('/api/socketrelay/fulfillments/:id/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const fulfillmentId = req.params.id;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError("Message content is required");
    }

    const fulfillment = await withDatabaseErrorHandling(
      () => storage.getSocketrelayFulfillmentById(fulfillmentId),
      'getSocketrelayFulfillmentById'
    );
    if (!fulfillment) {
      throw new NotFoundError('Fulfillment', fulfillmentId);
    }

    // Check if user is part of this fulfillment
    const request = await withDatabaseErrorHandling(
      () => storage.getSocketrelayRequestById(fulfillment.requestId),
      'getSocketrelayRequestById'
    );
    if (!request) {
      throw new NotFoundError('Request', fulfillment.requestId);
    }

    if (request.userId !== userId && fulfillment.fulfillerUserId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const message = await withDatabaseErrorHandling(
      () => storage.createSocketrelayMessage({
        fulfillmentId,
        senderId: userId,
        content: content.trim(),
      }),
      'createSocketrelayMessage'
    );

    res.json(message);
  }));

  // SocketRelay Admin Routes
  app.get('/api/socketrelay/admin/requests', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getAllSocketrelayRequests(),
      'getAllSocketrelayRequests'
    );
    res.json(requests);
  }));

  app.get('/api/socketrelay/admin/fulfillments', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const fulfillments = await withDatabaseErrorHandling(
      () => storage.getAllSocketrelayFulfillments(),
      'getAllSocketrelayFulfillments'
    );
    res.json(fulfillments);
  }));

  app.delete('/api/socketrelay/admin/requests/:id', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    await withDatabaseErrorHandling(
      () => storage.deleteSocketrelayRequest(req.params.id),
      'deleteSocketrelayRequest'
    );
    res.json({ message: "Request deleted successfully" });
  }));

  // SocketRelay Announcement routes
  app.get('/api/socketrelay/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveSocketrelayAnnouncements(),
      'getActiveSocketrelayAnnouncements'
    );
    res.json(announcements);
  }));

  app.get('/api/socketrelay/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllSocketrelayAnnouncements(),
      'getAllSocketrelayAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/socketrelay/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSocketrelayAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createSocketrelayAnnouncement(validatedData),
      'createSocketrelayAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_socketrelay_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/socketrelay/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertSocketrelayAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateSocketrelayAnnouncement(req.params.id, validatedData),
      'updateSocketrelayAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_socketrelay_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/socketrelay/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateSocketrelayAnnouncement(req.params.id),
      'deactivateSocketrelayAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_socketrelay_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // Directory Announcement routes
  app.get('/api/directory/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveDirectoryAnnouncements(),
      'getActiveDirectoryAnnouncements'
    );
    res.json(announcements);
  }));

  app.get('/api/directory/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllDirectoryAnnouncements(),
      'getAllDirectoryAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/directory/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertDirectoryAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createDirectoryAnnouncement(validatedData),
      'createDirectoryAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_directory_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/directory/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertDirectoryAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateDirectoryAnnouncement(req.params.id, validatedData),
      'updateDirectoryAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_directory_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/directory/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateDirectoryAnnouncement(req.params.id),
      'deactivateDirectoryAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_directory_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // ========================================
  // TRUSTTRANSPORT ROUTES
  // ========================================

  // TrustTransport Announcement routes (public)
  app.get('/api/trusttransport/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveTrusttransportAnnouncements(),
      'getActiveTrusttransportAnnouncements'
    );
    res.json(announcements);
  }));

  // TrustTransport Profile routes
  app.get('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForTrusttransportProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertTrusttransportProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createTrusttransportProfile(validatedData),
      'createTrusttransportProfile'
    );
    res.json(profile);
  }));

  app.put('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateTrusttransportProfile(userId, req.body),
      'updateTrusttransportProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/trusttransport/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteTrusttransportProfile(userId, reason),
      'deleteTrusttransportProfile'
    );
    res.json({ message: "TrustTransport profile deleted successfully" });
  }));

  // TrustTransport Ride Request routes (simplified model)
  
  // Create new ride request (as a rider) - MUST come before :id routes
  app.post('/api/trusttransport/ride-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) {
      throw new UnauthorizedError("User ID not found in authentication token");
    }
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    if (!profile || !profile.isRider) {
      throw new ValidationError("You must be a rider to create ride requests");
    }
    const validatedData = validateWithZod(insertTrusttransportRideRequestSchema, req.body, 'Invalid ride request data');
    // Add riderId after validation since it's omitted from the schema
    const requestData = {
      ...validatedData,
      riderId: userId,
    } as InsertTrusttransportRideRequest & { riderId: string };
    const request = await withDatabaseErrorHandling(
      () => storage.createTrusttransportRideRequest(requestData),
      'createTrusttransportRideRequest'
    );
    res.json(request);
  }));
  
  // Get open ride requests (for drivers to browse)
  app.get('/api/trusttransport/ride-requests/open', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getOpenTrusttransportRideRequests(),
      'getOpenTrusttransportRideRequests'
    );
    res.json(requests);
  }));

  // Get user's ride requests (as a rider)
  app.get('/api/trusttransport/ride-requests/my-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const requests = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestsByRider(userId),
      'getTrusttransportRideRequestsByRider'
    );
    res.json(requests);
  }));

  // Get requests claimed by driver
  app.get('/api/trusttransport/ride-requests/my-claimed', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    if (!profile || !profile.isDriver) {
      return res.json([]);
    }
    const requests = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestsByDriver(profile.id),
      'getTrusttransportRideRequestsByDriver'
    );
    res.json(requests);
  }));

  // Get single ride request
  app.get('/api/trusttransport/ride-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestById(req.params.id),
      'getTrusttransportRideRequestById'
    );
    if (!request) {
      throw new NotFoundError('Ride request', req.params.id);
    }
    res.json(request);
  }));


  // Claim a ride request (as a driver)
  app.post('/api/trusttransport/ride-requests/:id/claim', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { driverMessage } = req.body;
    const request = await withDatabaseErrorHandling(
      () => storage.claimTrusttransportRideRequest(req.params.id, userId, driverMessage),
      'claimTrusttransportRideRequest'
    );
    res.json(request);
  }));

  // Update ride request (rider can update their request, driver can update claimed request)
  app.put('/api/trusttransport/ride-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.getTrusttransportRideRequestById(req.params.id),
      'getTrusttransportRideRequestById'
    );
    if (!request) {
      throw new NotFoundError('Ride request', req.params.id);
    }
    
    const profile = await withDatabaseErrorHandling(
      () => storage.getTrusttransportProfile(userId),
      'getTrusttransportProfile'
    );
    
    // Check authorization
    const isRider = request.riderId === userId;
    const isDriver = request.driverId === profile?.id && profile?.isDriver;
    
    if (!isRider && !isDriver) {
      throw new ForbiddenError("Unauthorized to update this ride request");
    }
    
    // Riders can only update open requests
    if (isRider && request.status !== 'open') {
      throw new ValidationError("Cannot update a request that has been claimed");
    }
    
    const validatedData = validateWithZod(insertTrusttransportRideRequestSchema.partial(), req.body, 'Invalid ride request data');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateTrusttransportRideRequest(req.params.id, validatedData),
      'updateTrusttransportRideRequest'
    );
    res.json(updated);
  }));

  // Cancel ride request (rider or driver can cancel)
  app.post('/api/trusttransport/ride-requests/:id/cancel', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.cancelTrusttransportRideRequest(req.params.id, userId),
      'cancelTrusttransportRideRequest'
    );
    res.json(request);
  }));

  // TrustTransport Admin Announcement routes
  app.get('/api/trusttransport/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllTrusttransportAnnouncements(),
      'getAllTrusttransportAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/trusttransport/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertTrusttransportAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createTrusttransportAnnouncement(validatedData),
      'createTrusttransportAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_trusttransport_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/trusttransport/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertTrusttransportAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateTrusttransportAnnouncement(req.params.id, validatedData),
      'updateTrusttransportAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_trusttransport_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/trusttransport/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateTrusttransportAnnouncement(req.params.id),
      'deactivateTrusttransportAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_trusttransport_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // ========================================
  // NPS (Net Promoter Score) Routes
  // ========================================

  // Check if user should see the NPS survey
  app.get('/api/nps/should-show', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const lastResponse = await storage.getUserLastNpsResponse(userId);
      
      // Get current month in YYYY-MM format
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if user has already responded this month
      const hasRespondedThisMonth = lastResponse?.responseMonth === currentMonth;
      
      res.json({
        shouldShow: !hasRespondedThisMonth,
        lastResponseMonth: lastResponse?.responseMonth || null,
      });
    } catch (error) {
      console.error("Error checking NPS survey eligibility:", error);
      res.status(500).json({ message: "Failed to check survey eligibility" });
    }
  });

  // Submit NPS response
  app.post('/api/nps/response', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const now = new Date();
      const responseMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const validatedData = insertNpsResponseSchema.parse({
        ...req.body,
        userId,
        responseMonth,
      });
      
      const response = await storage.createNpsResponse(validatedData);
      res.json(response);
    } catch (error: any) {
      console.error("Error submitting NPS response:", error);
      res.status(400).json({ message: error.message || "Failed to submit response" });
    }
  });

  // Get NPS responses for admin (Weekly Performance dashboard)
  app.get('/api/admin/nps-responses', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const weekStart = req.query.weekStart ? new Date(req.query.weekStart as string) : undefined;
      const weekEnd = req.query.weekEnd ? new Date(req.query.weekEnd as string) : undefined;
      
      let responses;
      if (weekStart && weekEnd) {
        responses = await storage.getNpsResponsesForWeek(weekStart, weekEnd);
      } else {
        responses = await storage.getAllNpsResponses();
      }
      
      res.json(responses);
    } catch (error) {
      console.error("Error fetching NPS responses:", error);
      res.status(500).json({ message: "Failed to fetch NPS responses" });
    }
  });

  // ========================================
  // MECHANICMATCH ROUTES
  // ========================================

  // MechanicMatch Announcement routes (public)
  app.get('/api/mechanicmatch/announcements', isAuthenticated, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveMechanicmatchAnnouncements(),
      'getActiveMechanicmatchAnnouncements'
    );
    res.json(announcements);
  }));

  // MechanicMatch Profile routes
  app.get('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForMechanicmatchProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchProfileSchema, {
      ...req.body,
        userId,
        isClaimed: true, // User is claiming their own profile
    }, 'Invalid profile data');
    const profile = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchProfile(validatedData),
      'createMechanicmatchProfile'
    );
    res.json(profile);
  }));

  app.put('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfile(userId, req.body),
      'updateMechanicmatchProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/mechanicmatch/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchProfile(userId, reason),
      'deleteMechanicmatchProfile'
    );
    res.json({ message: "MechanicMatch profile deleted successfully" });
  }));

  // Public routes (with rate limiting to prevent scraping)
  app.get('/api/mechanicmatch/public/:id', publicItemLimiter, asyncHandler(async (req, res) => {
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );
    if (!profile || !profile.isPublic) {
      return res.status(404).json({ message: "Profile not found" });
    }
    // Get verification status from user
    let userIsVerified = false;
    if (profile.userId) {
      const user = await withDatabaseErrorHandling(
        () => storage.getUser(profile.userId),
        'getUserVerificationForPublicMechanicmatchProfile'
      );
      userIsVerified = user?.isVerified || false;
    }
    res.json({ ...profile, userIsVerified });
  }));

  app.get('/api/mechanicmatch/public', publicListingLimiter, asyncHandler(async (req, res) => {
    // Add delay for suspicious requests
    const isSuspicious = (req as any).isSuspicious || false;
    const userAgent = req.headers['user-agent'];
    const accept = req.headers['accept'];
    const acceptLang = req.headers['accept-language'];
    const likelyBot = isLikelyBot(userAgent, accept, acceptLang);
    
    if (isSuspicious || likelyBot) {
      await addAntiScrapingDelay(true, 200, 800);
    } else {
      await addAntiScrapingDelay(false, 50, 200);
    }

    const profiles = await withDatabaseErrorHandling(
      () => storage.listPublicMechanicmatchProfiles(),
      'listPublicMechanicmatchProfiles'
    );
    const withVerification = await Promise.all(profiles.map(async (p) => {
      let userIsVerified = false;
      if (p.userId) {
        const u = await withDatabaseErrorHandling(
          () => storage.getUser(p.userId),
          'getUserVerificationForPublicMechanicmatchList'
        );
        userIsVerified = u?.isVerified || false;
      }
      return { ...p, userIsVerified };
    }));
    
    // Rotate display order to make scraping harder
    const rotated = rotateDisplayOrder(withVerification);
    
    res.json(rotated);
  }));

  // MechanicMatch Vehicle routes
  app.get('/api/mechanicmatch/vehicles', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const vehicles = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehiclesByOwner(userId),
      'getMechanicmatchVehiclesByOwner'
    );
    res.json(vehicles);
  }));

  app.get('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const vehicle = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehicleById(req.params.id),
      'getMechanicmatchVehicleById'
    );
    if (!vehicle) {
      throw new NotFoundError('Vehicle', req.params.id);
    }
    res.json(vehicle);
  }));

  app.post('/api/mechanicmatch/vehicles', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchVehicleSchema, req.body, 'Invalid vehicle data');
    const vehicle = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchVehicle({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchVehicle'
    );
    res.json(vehicle);
  }));

  app.put('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const vehicle = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchVehicleById(req.params.id),
      'getMechanicmatchVehicleById'
    );
    if (!vehicle || vehicle.ownerId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchVehicle(req.params.id, req.body),
      'updateMechanicmatchVehicle'
    );
    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/vehicles/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchVehicle(req.params.id, userId),
      'deleteMechanicmatchVehicle'
    );
    res.json({ message: "Vehicle deleted successfully" });
  }));

  // MechanicMatch Service Request routes
  app.get('/api/mechanicmatch/service-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const requests = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestsByOwnerPaginated(userId, limit, offset),
      'getMechanicmatchServiceRequestsByOwnerPaginated'
    );
    res.json(requests);
  }));

  app.get('/api/mechanicmatch/service-requests/open', isAuthenticated, asyncHandler(async (_req, res) => {
    const requests = await withDatabaseErrorHandling(
      () => storage.getOpenMechanicmatchServiceRequests(),
      'getOpenMechanicmatchServiceRequests'
    );
    res.json(requests);
  }));

  app.get('/api/mechanicmatch/service-requests/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const request = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestById(req.params.id),
      'getMechanicmatchServiceRequestById'
    );
    if (!request) {
      throw new NotFoundError('Service request', req.params.id);
    }
    res.json(request);
  }));

  app.post('/api/mechanicmatch/service-requests', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isCarOwner) {
      throw new ValidationError("You must be a car owner to create service requests");
    }
    const validatedData = validateWithZod(insertMechanicmatchServiceRequestSchema, req.body, 'Invalid service request data');
    const request = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchServiceRequest({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchServiceRequest'
    );
    res.json(request);
  }));

  app.put('/api/mechanicmatch/service-requests/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const request = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchServiceRequestById(req.params.id),
      'getMechanicmatchServiceRequestById'
    );
    if (!request || request.ownerId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchServiceRequest(req.params.id, req.body),
      'updateMechanicmatchServiceRequest'
    );
    res.json(updated);
  }));

  // MechanicMatch Job routes
  app.get('/api/mechanicmatch/jobs', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile) {
      throw new NotFoundError('Profile');
    }
    
    let jobs;
    if (profile.isCarOwner) {
      jobs = await withDatabaseErrorHandling(
        () => storage.getMechanicmatchJobsByOwner(userId),
        'getMechanicmatchJobsByOwner'
      );
    } else if (profile.isMechanic) {
      jobs = await withDatabaseErrorHandling(
        () => storage.getMechanicmatchJobsByMechanic(profile.id),
        'getMechanicmatchJobsByMechanic'
      );
    } else {
      return res.json([]);
    }
    
    res.json(jobs);
  }));

  app.get('/api/mechanicmatch/jobs/:id', isAuthenticated, asyncHandler(async (req, res) => {
    const job = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchJobById(req.params.id),
      'getMechanicmatchJobById'
    );
    if (!job) {
      throw new NotFoundError('Job', req.params.id);
    }
    res.json(job);
  }));

  app.post('/api/mechanicmatch/jobs', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchJobSchema, req.body, 'Invalid job data');
    const job = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchJob({
        ...validatedData,
        ownerId: userId,
      }),
      'createMechanicmatchJob'
    );
    res.json(job);
  }));

  app.put('/api/mechanicmatch/jobs/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const job = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchJobById(req.params.id),
      'getMechanicmatchJobById'
    );
    if (!job) {
      throw new NotFoundError('Job', req.params.id);
    }
    
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile) {
      throw new NotFoundError('Profile');
    }
    
    // Only owner or assigned mechanic can update
    if (job.ownerId !== userId && job.mechanicId !== profile.id) {
      throw new ForbiddenError("Unauthorized");
    }
    
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchJob(req.params.id, req.body),
      'updateMechanicmatchJob'
    );
    res.json(updated);
  }));

  app.post('/api/mechanicmatch/jobs/:id/accept', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to accept jobs");
    }
    const job = await withDatabaseErrorHandling(
      () => storage.acceptMechanicmatchJob(req.params.id, profile.id),
      'acceptMechanicmatchJob'
    );
    res.json(job);
  }));

  // MechanicMatch Availability routes
  app.get('/api/mechanicmatch/availability', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to view availability");
    }
    const availability = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchAvailabilityByMechanic(profile.id),
      'getMechanicmatchAvailabilityByMechanic'
    );
    res.json(availability);
  }));

  app.post('/api/mechanicmatch/availability', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to set availability");
    }
    const validatedData = validateWithZod(insertMechanicmatchAvailabilitySchema, req.body, 'Invalid availability data');
    const availability = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchAvailability({
        ...validatedData,
        mechanicId: profile.id,
      }),
      'createMechanicmatchAvailability'
    );
    res.json(availability);
  }));

  app.put('/api/mechanicmatch/availability/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to update availability");
    }
    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchAvailability(req.params.id, req.body),
      'updateMechanicmatchAvailability'
    );
    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/availability/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfile(userId),
      'getMechanicmatchProfile'
    );
    if (!profile || !profile.isMechanic) {
      throw new ValidationError("You must be a mechanic to delete availability");
    }
    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchAvailability(req.params.id, profile.id),
      'deleteMechanicmatchAvailability'
    );
    res.json({ message: "Availability deleted successfully" });
  }));

  // MechanicMatch Review routes
  app.get('/api/mechanicmatch/reviews/mechanic/:mechanicId', isAuthenticated, asyncHandler(async (req, res) => {
    const reviews = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchReviewsByReviewee(req.params.mechanicId),
      'getMechanicmatchReviewsByReviewee'
    );
    res.json(reviews);
  }));

  app.get('/api/mechanicmatch/reviews/job/:jobId', isAuthenticated, asyncHandler(async (req, res) => {
    const reviews = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchReviewsByJob(req.params.jobId),
      'getMechanicmatchReviewsByJob'
    );
    res.json(reviews);
  }));

  app.post('/api/mechanicmatch/reviews', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchReviewSchema, req.body, 'Invalid review data');
    const review = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchReview({
        ...validatedData,
        reviewerId: userId,
      }),
      'createMechanicmatchReview'
    );
    res.json(review);
  }));

  // MechanicMatch Message routes
  app.get('/api/mechanicmatch/messages/job/:jobId', isAuthenticated, asyncHandler(async (req, res) => {
    const messages = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchMessagesByJob(req.params.jobId),
      'getMechanicmatchMessagesByJob'
    );
    res.json(messages);
  }));

  app.get('/api/mechanicmatch/messages/unread', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const messages = await withDatabaseErrorHandling(
      () => storage.getUnreadMechanicmatchMessages(userId),
      'getUnreadMechanicmatchMessages'
    );
    res.json(messages);
  }));

  app.post('/api/mechanicmatch/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchMessageSchema, req.body, 'Invalid message data');
    const message = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchMessage({
        ...validatedData,
        senderId: userId,
      }),
      'createMechanicmatchMessage'
    );
    res.json(message);
  }));

  app.put('/api/mechanicmatch/messages/:id/read', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const message = await withDatabaseErrorHandling(
      () => storage.markMechanicmatchMessageAsRead(req.params.id, userId),
      'markMechanicmatchMessageAsRead'
    );
    res.json(message);
  }));

  // MechanicMatch Search routes
  app.get('/api/mechanicmatch/search/mechanics', isAuthenticated, asyncHandler(async (req: any, res) => {
    const filters: any = {};
    if (req.query.city) filters.city = req.query.city;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.isMobileMechanic !== undefined) filters.isMobileMechanic = req.query.isMobileMechanic === 'true';
    if (req.query.maxHourlyRate) filters.maxHourlyRate = parseFloat(req.query.maxHourlyRate);
    if (req.query.minRating) filters.minRating = parseFloat(req.query.minRating);
    if (req.query.specialties) filters.specialties = Array.isArray(req.query.specialties) ? req.query.specialties : [req.query.specialties];
    
    const mechanics = await withDatabaseErrorHandling(
      () => storage.searchMechanicmatchMechanics(filters),
      'searchMechanicmatchMechanics'
    );
    res.json(mechanics);
  }));

  // MechanicMatch Admin Profile routes
  app.get('/api/mechanicmatch/admin/profiles', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const offsetParam = Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset;
    const searchParam = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;
    const roleParam = Array.isArray(req.query.role) ? req.query.role[0] : req.query.role;
    const claimedParam = Array.isArray(req.query.claimed) ? req.query.claimed[0] : req.query.claimed;

    const limit = Math.min(parseInt(limitParam || '50', 10) || 50, 100);
    const offset = parseInt(offsetParam || '0', 10) || 0;
    const role = roleParam === 'mechanic' || roleParam === 'owner' ? roleParam : undefined;
    const isClaimed =
      claimedParam === 'true' ? true : claimedParam === 'false' ? false : undefined;

    const profiles = await withDatabaseErrorHandling(
      () => storage.listMechanicmatchProfiles({
        limit,
        offset,
        search: searchParam || undefined,
        role,
        isClaimed,
      }),
      'listMechanicmatchProfiles'
    );
    res.json(profiles);
  }));

  app.post('/api/mechanicmatch/admin/profiles', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    // Ensure all required fields with defaults are explicitly set
    const payload = {
      ...req.body,
      userId: req.body.userId && req.body.userId.trim() !== "" ? req.body.userId : null,
      isClaimed: !!(req.body.userId && req.body.userId.trim() !== ""),
      // Explicitly set defaults for fields that have NOT NULL constraints
      isCarOwner: req.body.isCarOwner ?? false,
      isMechanic: req.body.isMechanic ?? false,
      isMobileMechanic: req.body.isMobileMechanic ?? false,
    };
    const validated = validateWithZod(insertMechanicmatchProfileSchema, payload, 'Invalid profile data');

    if (!validated.isCarOwner && !validated.isMechanic) {
      return res.status(400).json({ message: "Profile must be at least a car owner or mechanic" });
    }

    const profile = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchProfile(validated),
      'createMechanicmatchProfile'
    );

    await logAdminAction(
      adminId,
      'create_mechanicmatch_profile',
      'mechanicmatch_profile',
      profile.id,
      { isClaimed: profile.isClaimed }
    );

    res.json(profile);
  }));

  app.put('/api/mechanicmatch/admin/profiles/:id/assign', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.isClaimed) {
      return res.status(400).json({ message: "Profile is already claimed" });
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfileById(profile.id, { userId, isClaimed: true }),
      'assignMechanicmatchProfile'
    );

    await logAdminAction(
      adminId,
      'assign_mechanicmatch_profile',
      'mechanicmatch_profile',
      updated.id,
      { userId }
    );

    res.json(updated);
  }));

  app.put('/api/mechanicmatch/admin/profiles/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const validated = validateWithZod(insertMechanicmatchProfileSchema.partial() as any, req.body, 'Invalid profile update');

    const updated = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchProfileById(req.params.id, validated),
      'updateMechanicmatchProfileById'
    );

    await logAdminAction(
      adminId,
      'update_mechanicmatch_profile',
      'mechanicmatch_profile',
      updated.id
    );

    res.json(updated);
  }));

  app.delete('/api/mechanicmatch/admin/profiles/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const adminId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getMechanicmatchProfileById(req.params.id),
      'getMechanicmatchProfileById'
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (profile.isClaimed) {
      return res.status(400).json({ message: "Cannot delete claimed profiles. Ask user to delete via profile settings." });
    }

    await withDatabaseErrorHandling(
      () => storage.deleteMechanicmatchProfileById(profile.id),
      'deleteMechanicmatchProfileById'
    );

    await logAdminAction(
      adminId,
      'delete_mechanicmatch_profile',
      'mechanicmatch_profile',
      profile.id,
      {
        wasUnclaimed: true,
      }
    );

    res.json({ message: "Profile deleted successfully" });
  }));

  // MechanicMatch Admin Announcement routes
  app.get('/api/mechanicmatch/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllMechanicmatchAnnouncements(),
      'getAllMechanicmatchAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/mechanicmatch/admin/announcements', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createMechanicmatchAnnouncement(validatedData),
      'createMechanicmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_mechanicmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/mechanicmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertMechanicmatchAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateMechanicmatchAnnouncement(req.params.id, validatedData),
      'updateMechanicmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_mechanicmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/mechanicmatch/admin/announcements/:id', isAuthenticated, isAdmin, validateCsrfToken, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateMechanicmatchAnnouncement(req.params.id),
      'deactivateMechanicmatchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_mechanicmatch_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // ========================================
  // COMPARENOTES ROUTES
  // ========================================

  // CompareNotes Announcement routes (public)
  app.get('/api/comparenotes/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveResearchAnnouncements(),
      'getActiveResearchAnnouncements'
    );
    res.json(announcements);
  }));

  // CompareNotes Item routes
  app.post('/api/comparenotes/items', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    // Parse JSON arrays if strings
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }
    if (typeof body.attachments === 'string') {
      try {
        body.attachments = JSON.parse(body.attachments);
      } catch (e) {
        body.attachments = [];
      }
    }

    const validatedData = validateWithZod(insertResearchItemSchema, { ...body, userId }, 'Invalid question data');
    const item = await withDatabaseErrorHandling(
      () => storage.createResearchItem(validatedData),
      'createResearchItem'
    );
    
    console.log(`CompareNotes question created: ${item.id} by ${userId}`);
    res.json(item);
  }));

  app.get('/api/comparenotes/items', asyncHandler(async (req, res) => {
    const filters: any = {};
    if (req.query.userId) filters.userId = req.query.userId as string;
    if (req.query.tag) filters.tag = req.query.tag as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    filters.limit = parseInt(req.query.limit as string || "50");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getResearchItems(filters),
      'getResearchItems'
    );
    res.json(result);
  }));

  app.get('/api/comparenotes/items/public', publicListingLimiter, asyncHandler(async (req, res) => {
    const filters: any = { isPublic: true };
    if (req.query.tag) filters.tag = req.query.tag as string;
    if (req.query.search) filters.search = req.query.search as string;
    filters.limit = parseInt(req.query.limit as string || "20");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getResearchItems(filters),
      'getResearchItems'
    );
    res.json(result.items);
  }));

  app.get('/api/comparenotes/public/:id', publicListingLimiter, asyncHandler(async (req, res) => {
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.id),
      'getResearchItemById'
    );
    if (!item) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    if (!item.isPublic) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    // Increment view count
    await withDatabaseErrorHandling(
      () => storage.incrementResearchItemViewCount(req.params.id),
      'incrementResearchItemViewCount'
    );
    
    res.json(item);
  }));

  app.get('/api/comparenotes/items/:id', asyncHandler(async (req, res) => {
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.id),
      'getResearchItemById'
    );
    if (!item) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    // Increment view count
    await withDatabaseErrorHandling(
      () => storage.incrementResearchItemViewCount(req.params.id),
      'incrementResearchItemViewCount'
    );
    
    res.json(item);
  }));

  app.put('/api/comparenotes/items/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.id),
      'getResearchItemById'
    );
    
    if (!item) {
      throw new NotFoundError('Question', req.params.id);
    }
    
    if (item.userId !== userId && !(await isUserAdmin(req))) {
      throw new ForbiddenError("Forbidden");
    }

    const body = req.body;
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }
    if (typeof body.attachments === 'string') {
      try {
        body.attachments = JSON.parse(body.attachments);
      } catch (e) {
        body.attachments = [];
      }
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchItem(req.params.id, body),
      'updateResearchItem'
    );
    res.json(updated);
  }));

  // CompareNotes Answer routes
  app.post('/api/comparenotes/answers', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    if (typeof body.links === 'string') {
      try {
        body.links = JSON.parse(body.links);
      } catch (e) {
        body.links = [];
      }
    }
    if (typeof body.attachments === 'string') {
      try {
        body.attachments = JSON.parse(body.attachments);
      } catch (e) {
        body.attachments = [];
      }
    }

    const validatedData = validateWithZod(insertResearchAnswerSchema, { ...body, userId }, 'Invalid answer data');
    const answer = await withDatabaseErrorHandling(
      () => storage.createResearchAnswer(validatedData),
      'createResearchAnswer'
    );
    
    // Trigger link verification for any links provided
    if (validatedData.links && validatedData.links.length > 0) {
      // Queue link verification (async, non-blocking)
      setImmediate(async () => {
        for (const url of validatedData.links || []) {
          try {
            await verifyCompareNotesLink(answer.id, url);
          } catch (error) {
            console.error(`Error verifying link ${url}:`, error);
          }
        }
      });
    }
    
    res.json(answer);
  }));

  app.get('/api/comparenotes/items/:id/answers', asyncHandler(async (req, res) => {
    const sortBy = req.query.sortBy as string || "relevance";
    const answers = await withDatabaseErrorHandling(
      () => storage.getResearchAnswersByItemId(req.params.id, sortBy),
      'getResearchAnswersByItemId'
    );
    res.json(answers);
  }));

  app.get('/api/comparenotes/answers/:id', asyncHandler(async (req, res) => {
    const answer = await withDatabaseErrorHandling(
      () => storage.getResearchAnswerById(req.params.id),
      'getResearchAnswerById'
    );
    if (!answer) {
      throw new NotFoundError('Answer', req.params.id);
    }
    res.json(answer);
  }));

  app.put('/api/comparenotes/answers/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const answer = await withDatabaseErrorHandling(
      () => storage.getResearchAnswerById(req.params.id),
      'getResearchAnswerById'
    );
    
    if (!answer) {
      throw new NotFoundError('Answer', req.params.id);
    }
    
    if (answer.userId !== userId && !(await isUserAdmin(req))) {
      throw new ForbiddenError("Forbidden");
    }

    const body = req.body;
    if (typeof body.links === 'string') {
      try {
        body.links = JSON.parse(body.links);
      } catch (e) {
        body.links = [];
      }
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchAnswer(req.params.id, body),
      'updateResearchAnswer'
    );
    res.json(updated);
  }));

  // Accept answer endpoint
  app.post('/api/comparenotes/items/:itemId/accept-answer/:answerId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const item = await withDatabaseErrorHandling(
      () => storage.getResearchItemById(req.params.itemId),
      'getResearchItemById'
    );
    
    if (!item || item.userId !== userId) {
      throw new ForbiddenError("Forbidden");
    }

    const updatedItem = await withDatabaseErrorHandling(
      () => storage.acceptResearchAnswer(req.params.itemId, req.params.answerId),
      'acceptResearchAnswer'
    );
    res.json(updatedItem);
  }));

  // CompareNotes Comment routes
  app.post('/api/comparenotes/comments', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchCommentSchema, { ...req.body, userId }, 'Invalid comment data');
    const comment = await withDatabaseErrorHandling(
      () => storage.createResearchComment(validatedData),
      'createResearchComment'
    );
    res.json(comment);
  }));

  app.get('/api/comparenotes/comments', asyncHandler(async (req, res) => {
    const filters: any = {};
    if (req.query.researchItemId) filters.researchItemId = req.query.researchItemId as string;
    if (req.query.answerId) filters.answerId = req.query.answerId as string;
    
    const comments = await withDatabaseErrorHandling(
      () => storage.getResearchComments(filters),
      'getResearchComments'
    );
    res.json(comments);
  }));

  app.put('/api/comparenotes/comments/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const comment = await withDatabaseErrorHandling(
      () => storage.getResearchComments({ researchItemId: undefined, answerId: undefined }).then(cs => cs.find(c => c.id === req.params.id)),
      'getResearchComments'
    );
    
    if (!comment || comment.userId !== userId) {
      throw new ForbiddenError("Forbidden");
    }

    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchComment(req.params.id, req.body),
      'updateResearchComment'
    );
    res.json(updated);
  }));

  app.delete('/api/comparenotes/comments/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    // Note: In production, check ownership or admin status
    await withDatabaseErrorHandling(
      () => storage.deleteResearchComment(req.params.id),
      'deleteResearchComment'
    );
    res.json({ message: "Comment deleted" });
  }));

  // CompareNotes Vote routes
  app.post('/api/comparenotes/votes', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchVoteSchema, { ...req.body, userId }, 'Invalid vote data');
    const vote = await withDatabaseErrorHandling(
      () => storage.createOrUpdateResearchVote(validatedData),
      'createOrUpdateResearchVote'
    );
    res.json(vote);
  }));

  app.get('/api/comparenotes/votes', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const researchItemId = req.query.researchItemId as string;
    const answerId = req.query.answerId as string;
    
    const vote = await withDatabaseErrorHandling(
      () => storage.getResearchVote(userId, researchItemId, answerId),
      'getResearchVote'
    );
    res.json(vote || null);
  }));

  app.delete('/api/comparenotes/votes', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const researchItemId = req.query.researchItemId as string;
    const answerId = req.query.answerId as string;
    
    await storage.deleteResearchVote(userId, researchItemId, answerId);
    res.json({ message: "Vote deleted" });
  }));

  // CompareNotes Bookmark routes
  app.post('/api/comparenotes/bookmarks', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchBookmarkSchema, { ...req.body, userId }, 'Invalid bookmark data');
    const bookmark = await withDatabaseErrorHandling(
      () => storage.createResearchBookmark(validatedData),
      'createResearchBookmark'
    );
    res.json(bookmark);
  }));

  app.delete('/api/comparenotes/bookmarks/:itemId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteResearchBookmark(userId, req.params.itemId),
      'deleteResearchBookmark'
    );
    res.json({ message: "Bookmark deleted" });
  }));

  app.get('/api/comparenotes/bookmarks', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const bookmarks = await withDatabaseErrorHandling(
      () => storage.getResearchBookmarks(userId),
      'getResearchBookmarks'
    );
    
    // Fetch full questions for each bookmark
    const items = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const item = await withDatabaseErrorHandling(
          () => storage.getResearchItemById(bookmark.researchItemId),
          'getResearchItemById'
        );
        return item;
      })
    );
    
    // Filter out any null items (in case a bookmarked item was deleted)
    const validItems = items.filter((item): item is NonNullable<typeof item> => item !== undefined);
    
    res.json({ items: validItems, total: validItems.length });
  }));

  // CompareNotes Follow routes
  app.post('/api/comparenotes/follows', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchFollowSchema, { ...req.body, userId }, 'Invalid follow data');
    const follow = await withDatabaseErrorHandling(
      () => storage.createResearchFollow(validatedData),
      'createResearchFollow'
    );
    res.json(follow);
  }));

  app.delete('/api/comparenotes/follows', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const filters: any = {};
    if (req.query.followedUserId) filters.followedUserId = req.query.followedUserId as string;
    if (req.query.researchItemId) filters.researchItemId = req.query.researchItemId as string;
    if (req.query.tag) filters.tag = req.query.tag as string;
    
    await withDatabaseErrorHandling(
      () => storage.deleteResearchFollow(userId, filters),
      'deleteResearchFollow'
    );
    res.json({ message: "Follow deleted" });
  }));

  app.get('/api/comparenotes/follows', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const follows = await withDatabaseErrorHandling(
      () => storage.getResearchFollows(userId),
      'getResearchFollows'
    );
    res.json(follows);
  }));

  // CompareNotes Timeline/Feed
  app.get('/api/comparenotes/timeline', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const limit = parseInt(req.query.limit as string || "50");
    const offset = parseInt(req.query.offset as string || "0");
    
    const items = await withDatabaseErrorHandling(
      () => storage.getResearchTimeline(userId, limit, offset),
      'getResearchTimeline'
    );
    res.json(items);
  }));

  // CompareNotes Link Provenance routes
  app.get('/api/comparenotes/answers/:answerId/links', asyncHandler(async (req, res) => {
    const provenances = await withDatabaseErrorHandling(
      () => storage.getResearchLinkProvenancesByAnswerId(req.params.answerId),
      'getResearchLinkProvenancesByAnswerId'
    );
    res.json(provenances);
  }));

  // Link verification endpoint (triggers async verification)
  app.post('/api/comparenotes/verify-link', isAuthenticated, asyncHandler(async (req: any, res) => {
    const { answerId, url } = req.body;
    
    if (!answerId || !url) {
      throw new ValidationError("answerId and url are required");
    }

    // Queue verification (non-blocking)
    setImmediate(async () => {
      try {
        await verifyCompareNotesLink(answerId, url);
      } catch (error) {
        console.error(`Error verifying link ${url}:`, error);
      }
    });

    res.json({ message: "Link verification queued" });
  }));

  // CompareNotes Report routes
  app.post('/api/comparenotes/reports', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchReportSchema, { ...req.body, userId }, 'Invalid report data');
    const report = await withDatabaseErrorHandling(
      () => storage.createResearchReport(validatedData),
      'createResearchReport'
    );
    res.json(report);
  }));

  app.get('/api/comparenotes/admin/reports', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status as string;
    filters.limit = parseInt(req.query.limit as string || "50");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getResearchReports(filters),
      'getResearchReports'
    );
    res.json(result);
  }));

  app.put('/api/comparenotes/admin/reports/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const updated = await withDatabaseErrorHandling(
      () => storage.updateResearchReport(req.params.id, {
        ...req.body,
        reviewedBy: userId,
        reviewedAt: new Date(),
      }),
      'updateResearchReport'
    );
    res.json(updated);
  }));

  // CompareNotes User Reputation
  app.get('/api/comparenotes/users/:userId/reputation', asyncHandler(async (req, res) => {
    const reputation = await withDatabaseErrorHandling(
      () => storage.getUserReputation(req.params.userId),
      'getUserReputation'
    );
    res.json({ reputation });
  }));

  // CompareNotes Admin Announcement routes
  app.get('/api/comparenotes/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllResearchAnnouncements(),
      'getAllResearchAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/comparenotes/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createResearchAnnouncement(validatedData),
      'createResearchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_comparenotes_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/comparenotes/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertResearchAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateResearchAnnouncement(req.params.id, validatedData),
      'updateResearchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_comparenotes_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/comparenotes/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateResearchAnnouncement(req.params.id),
      'deactivateResearchAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_comparenotes_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // Link verification helper function (simplified - fetches link and computes fake similarity)
  async function verifyCompareNotesLink(answerId: string, url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // Fetch link (simplified - in production, use proper HTTP client with timeout)
      let httpStatus = 200;
      let title = "";
      let snippet = "";
      let domainScore = 0.5; // Default

      try {
        // Simple domain scoring (in production, use whitelist/blacklist)
        if (domain.includes('.edu') || domain.includes('.gov')) {
          domainScore = 0.9;
        } else if (domain.includes('.org')) {
          domainScore = 0.7;
        } else if (domain.includes('.com')) {
          domainScore = 0.5;
        }

        // In production, fetch actual page content
        // For now, create a fake similarity score (0.6-0.9 range)
        const similarityScore = 0.6 + Math.random() * 0.3;

        // Create provenance entry
        await storage.createResearchLinkProvenance({
          answerId,
          url,
          httpStatus,
          title: title || domain,
          snippet: snippet || `Content from ${domain}`,
          domain,
          domainScore,
          similarityScore,
          isSupportive: similarityScore > 0.7 && domainScore > 0.5,
        });

        console.log(`Link verified: ${url} for answer ${answerId}`);
      } catch (fetchError: any) {
        // If fetch fails, still create provenance with error status
        await storage.createResearchLinkProvenance({
          answerId,
          url,
          httpStatus: 0,
          title: domain,
          snippet: `Error fetching: ${fetchError.message}`,
          domain,
          domainScore: 0.3,
          similarityScore: 0,
          isSupportive: false,
        });
      }
    } catch (error: any) {
      console.error(`Error verifying link ${url}:`, error);
      throw error;
    }
  }

  // ========================================
  // ========================================
  // GENTLEPULSE ROUTES
  // ========================================

  // Helper to strip IP and metadata from request for privacy
  const stripIPAndMetadata = (req: any) => {
    // Remove IP, user-agent, and other identifying headers before storage
    delete req.ip;
    delete req.connection?.remoteAddress;
    delete req.socket?.remoteAddress;
    delete req.headers["x-forwarded-for"];
    delete req.headers["x-real-ip"];
  };

  // GentlePulse Announcement routes (public)
  app.get('/api/gentlepulse/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveGentlepulseAnnouncements(),
      'getActiveGentlepulseAnnouncements'
    );
    res.json(announcements);
  }));

  // GentlePulse Meditation routes (public)
  app.get('/api/gentlepulse/meditations', publicListingLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const filters: any = {};
    if (req.query.tag) filters.tag = req.query.tag as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    filters.limit = parseInt(req.query.limit as string || "50");
    filters.offset = parseInt(req.query.offset as string || "0");
    
    const result = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMeditations(filters),
      'getGentlepulseMeditations'
    );
    res.json(result);
  }));

  app.get('/api/gentlepulse/meditations/:id', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const meditation = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMeditationById(req.params.id),
      'getGentlepulseMeditationById'
    );
    if (!meditation) {
      throw new NotFoundError('Meditation', req.params.id);
    }
    res.json(meditation);
  }));

  // Track meditation play (increment play count)
  app.post('/api/gentlepulse/meditations/:id/play', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    await withDatabaseErrorHandling(
      () => storage.incrementGentlepulsePlayCount(req.params.id),
      'incrementGentlepulsePlayCount'
    );
    res.json({ message: "Play count updated" });
  }));

  // GentlePulse Rating routes (public, anonymous)
  app.post('/api/gentlepulse/ratings', publicItemLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const validatedData = validateWithZod(insertGentlepulseRatingSchema, req.body, 'Invalid rating data');
    const rating = await withDatabaseErrorHandling(
      () => storage.createOrUpdateGentlepulseRating(validatedData),
      'createOrUpdateGentlepulseRating'
    );
    
    console.log(`GentlePulse rating submitted: meditation ${validatedData.meditationId}, rating ${validatedData.rating}`);
    
    res.json(rating);
  }));

  app.get('/api/gentlepulse/meditations/:id/ratings', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const ratings = await withDatabaseErrorHandling(
      () => storage.getGentlepulseRatingsByMeditationId(req.params.id),
      'getGentlepulseRatingsByMeditationId'
    );
    // Return only aggregated data, not individual ratings
    const average = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;
    res.json({ average: Number(average.toFixed(2)), count: ratings.length });
  }));

  // GentlePulse Mood Check routes (public, anonymous)
  app.post('/api/gentlepulse/mood', publicItemLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const validatedData = validateWithZod(insertGentlepulseMoodCheckSchema, {
      ...req.body,
      date: new Date().toISOString().split('T')[0], // Today's date
    }, 'Invalid mood check data');
    
    const moodCheck = await withDatabaseErrorHandling(
      () => storage.createGentlepulseMoodCheck(validatedData),
      'createGentlepulseMoodCheck'
    );
    
    // Check for suicide prevention trigger (3+ extremely negative moods in 7 days)
    const recentMoods = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMoodChecksByClientId(validatedData.clientId, 7),
      'getGentlepulseMoodChecksByClientId'
    );
    const extremelyNegative = recentMoods.filter(m => m.moodValue === 1).length;
    
    console.log(`GentlePulse mood check submitted: client ${validatedData.clientId}, mood ${validatedData.moodValue}`);
    
    res.json({
      ...moodCheck,
      showSafetyMessage: extremelyNegative >= 3,
    });
  }));

  // Check if mood check should be shown (once every 7 days)
  app.get('/api/gentlepulse/mood/check-eligible', asyncHandler(async (req, res) => {
    const clientId = req.query.clientId as string;
    if (!clientId) {
      return res.json({ eligible: false });
    }

    const recentMoods = await withDatabaseErrorHandling(
      () => storage.getGentlepulseMoodChecksByClientId(clientId, 7),
      'getGentlepulseMoodChecksByClientId'
    );
    const lastMood = recentMoods[0];
    
    if (!lastMood) {
      return res.json({ eligible: true });
    }

    const daysSinceLastMood = (Date.now() - new Date(lastMood.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    res.json({ eligible: daysSinceLastMood >= 7 });
  }));

  // GentlePulse Favorites routes (public, anonymous)
  app.post('/api/gentlepulse/favorites', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const validatedData = validateWithZod(insertGentlepulseFavoriteSchema, req.body, 'Invalid favorite data');
    const favorite = await withDatabaseErrorHandling(
      () => storage.createGentlepulseFavorite(validatedData),
      'createGentlepulseFavorite'
    );
    res.json(favorite);
  }));

  app.delete('/api/gentlepulse/favorites/:meditationId', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const clientId = req.query.clientId as string;
    if (!clientId) {
      throw new ValidationError("clientId required");
    }
    await withDatabaseErrorHandling(
      () => storage.deleteGentlepulseFavorite(clientId, req.params.meditationId),
      'deleteGentlepulseFavorite'
    );
    res.json({ message: "Favorite removed" });
  }));

  app.get('/api/gentlepulse/favorites', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const clientId = req.query.clientId as string;
    if (!clientId) {
      return res.json([]);
    }
    const favorites = await withDatabaseErrorHandling(
      () => storage.getGentlepulseFavoritesByClientId(clientId),
      'getGentlepulseFavoritesByClientId'
    );
    res.json(favorites.map(f => f.meditationId));
  }));

  app.get('/api/gentlepulse/favorites/check', asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    const clientId = req.query.clientId as string;
    const meditationId = req.query.meditationId as string;
    if (!clientId || !meditationId) {
      return res.json({ isFavorite: false });
    }
    const isFavorite = await withDatabaseErrorHandling(
      () => storage.isGentlepulseFavorite(clientId, meditationId),
      'isGentlepulseFavorite'
    );
    res.json({ isFavorite });
  }));

  // GentlePulse Admin routes
  app.post('/api/gentlepulse/admin/meditations', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }

    const validatedData = validateWithZod(insertGentlepulseMeditationSchema, body, 'Invalid meditation data');
    const meditation = await withDatabaseErrorHandling(
      () => storage.createGentlepulseMeditation(validatedData),
      'createGentlepulseMeditation'
    );
    
    await logAdminAction(
      userId,
      "create_gentlepulse_meditation",
      "meditation",
      meditation.id,
      { title: meditation.title }
    );

    res.json(meditation);
  }));

  app.put('/api/gentlepulse/admin/meditations/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const body = req.body;
    
    if (typeof body.tags === 'string') {
      try {
        body.tags = JSON.parse(body.tags);
      } catch (e) {
        body.tags = [];
      }
    }

    const meditation = await withDatabaseErrorHandling(
      () => storage.updateGentlepulseMeditation(req.params.id, body),
      'updateGentlepulseMeditation'
    );
    
    await logAdminAction(
      userId,
      "update_gentlepulse_meditation",
      "meditation",
      meditation.id,
      { title: meditation.title }
    );

    res.json(meditation);
  }));

  // GentlePulse Admin Announcement routes
  app.get('/api/gentlepulse/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllGentlepulseAnnouncements(),
      'getAllGentlepulseAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/gentlepulse/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertGentlepulseAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createGentlepulseAnnouncement(validatedData),
      'createGentlepulseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_gentlepulse_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/gentlepulse/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertGentlepulseAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateGentlepulseAnnouncement(req.params.id, validatedData),
      'updateGentlepulseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_gentlepulse_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/gentlepulse/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateGentlepulseAnnouncement(req.params.id),
      'deactivateGentlepulseAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_gentlepulse_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // ========================================
  // LOSTMAIL ROUTES
  // ========================================

  // LostMail Announcement routes (public)
  app.get('/api/lostmail/announcements', asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveLostmailAnnouncements(),
      'getActiveLostmailAnnouncements'
    );
    res.json(announcements);
  }));

  // LostMail Incident routes
  app.post('/api/lostmail/incidents', asyncHandler(async (req, res) => {
    // Parse photos array if present (from JSON string)
    const body = req.body;
    if (typeof body.photos === 'string') {
      try {
        body.photos = JSON.parse(body.photos);
      } catch (e) {
        body.photos = null;
      }
    }
    if (Array.isArray(body.photos)) {
      body.photos = JSON.stringify(body.photos);
    }

    const validatedData = validateWithZod(insertLostmailIncidentSchema, body, 'Invalid incident data');
    const incident = await withDatabaseErrorHandling(
      () => storage.createLostmailIncident(validatedData),
      'createLostmailIncident'
    );
    
    console.log(`LostMail incident created: ${incident.id} by ${incident.reporterEmail}`);
    
    res.json(incident);
  }));

  app.get('/api/lostmail/incidents', asyncHandler(async (req, res) => {
    const email = req.query.email as string;
    
    if (email) {
      // User lookup by email
      const incidents = await withDatabaseErrorHandling(
        () => storage.getLostmailIncidentsByEmail(email),
        'getLostmailIncidentsByEmail'
      );
      res.json(incidents);
    } else if (await isUserAdmin(req)) {
      // Admin list with filters
      const filters: any = {};
      if (req.query.incidentType) filters.incidentType = req.query.incidentType as string;
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.severity) filters.severity = req.query.severity as string;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.search) filters.search = req.query.search as string;
      filters.limit = parseInt(req.query.limit as string || "50");
      filters.offset = parseInt(req.query.offset as string || "0");
      
      const result = await withDatabaseErrorHandling(
        () => storage.getLostmailIncidents(filters),
        'getLostmailIncidents'
      );
      res.json(result);
    } else {
      throw new UnauthorizedError("Unauthorized");
    }
  }));

  app.get('/api/lostmail/incidents/:id', asyncHandler(async (req, res) => {
    const incident = await withDatabaseErrorHandling(
      () => storage.getLostmailIncidentById(req.params.id),
      'getLostmailIncidentById'
    );
    if (!incident) {
      throw new NotFoundError('Incident', req.params.id);
    }
    
    // Only admins or the reporter can view details
    const email = req.query.email as string;
    if (!(await isUserAdmin(req)) && incident.reporterEmail !== email) {
      throw new ForbiddenError("Forbidden");
    }
    
    res.json(incident);
  }));

  app.put('/api/lostmail/incidents/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const incidentId = req.params.id;
    const updateData = req.body;
    
    // Get old incident to track status changes
    const oldIncident = await withDatabaseErrorHandling(
      () => storage.getLostmailIncidentById(incidentId),
      'getLostmailIncidentById'
    );
    if (!oldIncident) {
      throw new NotFoundError('Incident', incidentId);
    }
    
    // Get admin user info
    const adminUser = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUser'
    );
    const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "Admin";
    
    // Track status change in audit trail
    if (updateData.status && updateData.status !== oldIncident.status) {
      await withDatabaseErrorHandling(
        () => storage.createLostmailAuditTrailEntry({
          incidentId,
          adminName,
          action: "status_change",
          note: `Status changed from ${oldIncident.status} to ${updateData.status}${updateData.note ? `: ${updateData.note}` : ""}`,
        }),
        'createLostmailAuditTrailEntry'
      );
    }
    
    // Track assignment change
    if (updateData.assignedTo !== undefined && updateData.assignedTo !== oldIncident.assignedTo) {
      await withDatabaseErrorHandling(
        () => storage.createLostmailAuditTrailEntry({
          incidentId,
          adminName,
          action: "assigned",
          note: `Assigned to ${updateData.assignedTo || "unassigned"}`,
        }),
        'createLostmailAuditTrailEntry'
      );
    }
    
    // Track note addition
    if (updateData.note && updateData.note !== "") {
      await withDatabaseErrorHandling(
        () => storage.createLostmailAuditTrailEntry({
          incidentId,
          adminName,
          action: "note_added",
          note: updateData.note,
        }),
        'createLostmailAuditTrailEntry'
      );
    }
    
    // Remove note from update data (it's only for audit trail)
    const { note, ...updateDataWithoutNote } = updateData;
    
    const updated = await withDatabaseErrorHandling(
      () => storage.updateLostmailIncident(incidentId, updateDataWithoutNote),
      'updateLostmailIncident'
    );
    
    console.log(`LostMail incident ${incidentId} updated by admin ${adminName}`);
    
    res.json(updated);
  }));

  app.get('/api/lostmail/incidents/:id/audit-trail', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const auditTrail = await withDatabaseErrorHandling(
      () => storage.getLostmailAuditTrailByIncident(req.params.id),
      'getLostmailAuditTrailByIncident'
    );
    res.json(auditTrail);
  }));


  // Bulk export endpoint
  app.get('/api/lostmail/admin/export', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const format = req.query.format as string || "json";
      const ids = req.query.ids as string | string[];
      
      let incidents: any[];
      
      if (ids) {
        const idArray = Array.isArray(ids) ? ids : [ids];
        incidents = await Promise.all(
          idArray.map(id => storage.getLostmailIncidentById(id))
        );
        incidents = incidents.filter(i => i !== undefined);
      } else {
        const result = await storage.getLostmailIncidents({ limit: 1000 });
        incidents = result.incidents;
      }
      
      if (format === "csv") {
        // CSV export
        const headers = ["ID", "Reporter Name", "Email", "Type", "Status", "Severity", "Tracking Number", "Carrier", "Created At"];
        const rows = incidents.map(inc => [
          inc.id,
          inc.reporterName,
          inc.reporterEmail,
          inc.incidentType,
          inc.status,
          inc.severity,
          inc.trackingNumber,
          inc.carrier || "",
          new Date(inc.createdAt).toISOString(),
        ]);
        
        const csv = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
        
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="lostmail-incidents-${Date.now()}.csv"`);
        res.send(csv);
      } else {
        // JSON export
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="lostmail-incidents-${Date.now()}.json"`);
        res.json(incidents);
      }
      
      console.log(`LostMail export: ${incidents.length} incidents exported as ${format}`);
    } catch (error: any) {
      console.error("Error exporting LostMail incidents:", error);
      res.status(500).json({ message: error.message || "Failed to export incidents" });
    }
  });

  // LostMail Admin Announcement routes
  app.get('/api/lostmail/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (_req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllLostmailAnnouncements(),
      'getAllLostmailAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/lostmail/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLostmailAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createLostmailAnnouncement(validatedData),
      'createLostmailAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_lostmail_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/lostmail/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertLostmailAnnouncementSchema.partial() as any, req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateLostmailAnnouncement(req.params.id, validatedData),
      'updateLostmailAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_lostmail_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/lostmail/admin/announcements/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateLostmailAnnouncement(req.params.id),
      'deactivateLostmailAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_lostmail_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // ========================================
  // CHYME ROUTES
  // ========================================

  // Chyme Announcement routes (public)
  app.get('/api/chyme/announcements', isAuthenticated, asyncHandler(async (req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveChymeAnnouncements(),
      'getActiveChymeAnnouncements'
    );
    res.json(announcements);
  }));

  // Chyme Profile routes
  app.get('/api/chyme/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getChymeProfile(userId),
      'getChymeProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to build displayName
    let displayName: string | null = null;
    let userIsVerified = false;
    let userFirstName: string | null = null;
    let userLastName: string | null = null;
    
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForChymeProfile'
    );
    if (user) {
      userFirstName = user.firstName || null;
      userLastName = user.lastName || null;
      userIsVerified = user.isVerified || false;
      // Build display name from firstName and lastName
      if (userFirstName && userLastName) {
        displayName = `${userFirstName} ${userLastName}`;
      } else if (userFirstName) {
        displayName = userFirstName;
      }
    }
    res.json({ ...profile, displayName, userIsVerified, firstName: userFirstName, lastName: userLastName });
  }));

  app.post('/api/chyme/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChymeProfileSchema, {
      ...req.body,
      userId,
    }, 'Invalid profile data');
    
    const profile = await withDatabaseErrorHandling(
      () => storage.createChymeProfile(validatedData),
      'createChymeProfile'
    );
    res.json(profile);
  }));

  app.put('/api/chyme/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateChymeProfile(userId, req.body),
      'updateChymeProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/chyme/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteChymeProfile(userId, reason),
      'deleteChymeProfile'
    );
    res.json({ message: "Chyme profile deleted successfully" });
  }));

  // Chyme Room routes (public listing, admin creation)
  app.get('/api/chyme/rooms', isAuthenticated, asyncHandler(async (req: any, res) => {
    const roomType = req.query.roomType as string | undefined;
    const showAll = req.query.showAll === 'true';
    // Default to showing only active rooms for user-facing endpoint
    // If showAll=true, don't filter by isActive (show all rooms)
    const isActive = showAll ? undefined : (req.query.isActive !== undefined ? req.query.isActive === 'true' : true);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {};
    if (roomType) filters.roomType = roomType;
    if (isActive !== undefined) filters.isActive = isActive;

    const result = await withDatabaseErrorHandling(
      () => storage.getAllChymeRooms(filters, limit, offset),
      'getAllChymeRooms'
    );
    res.json(result);
  }));

  // GET room details: Public rooms allow unauthenticated access (for listening)
  // Private rooms require authentication
  app.get('/api/chyme/rooms/:id', publicItemLimiter, asyncHandler(async (req: any, res) => {
    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoomById(req.params.id),
      'getChymeRoomById'
    );
    if (!room || !room.isActive) {
      throw new NotFoundError("Room not found or inactive");
    }

    // Private rooms require authentication
    if (room.roomType === 'private') {
      if (!req.auth?.userId) {
        return res.status(401).json({ message: "Authentication required for private rooms" });
      }
    }

    res.json(room);
  }));

  // Admin room creation
  app.post('/api/chyme/admin/rooms', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChymeRoomSchema, {
      ...req.body,
      createdBy: userId,
    }, 'Invalid room data');
    
    const room = await withDatabaseErrorHandling(
      () => storage.createChymeRoom(validatedData),
      'createChymeRoom'
    );
    
    await logAdminAction(
      userId,
      "create_chyme_room",
      "room",
      room.id,
      { name: room.name, roomType: room.roomType }
    );

    res.json(room);
  }));

  app.put('/api/chyme/admin/rooms/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const room = await withDatabaseErrorHandling(
      () => storage.updateChymeRoom(req.params.id, req.body),
      'updateChymeRoom'
    );
    
    await logAdminAction(
      userId,
      "update_chyme_room",
      "room",
      room.id,
      { name: room.name }
    );

    res.json(room);
  }));

  app.delete('/api/chyme/admin/rooms/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteChymeRoom(req.params.id),
      'deleteChymeRoom'
    );
    
    await logAdminAction(
      userId,
      "delete_chyme_room",
      "room",
      req.params.id,
      {}
    );

    res.json({ message: "Room deleted successfully" });
  }));

  // Chyme Room Participant routes
  app.post('/api/chyme/rooms/:roomId/join', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;
    
    // Check if room exists and user can join
    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoomById(roomId),
      'getChymeRoomById'
    );
    if (!room || !room.isActive) {
      throw new NotFoundError("Room not found or inactive");
    }

    // Check if room is full
    if (room.maxParticipants && room.currentParticipants >= room.maxParticipants) {
      throw new ValidationError("Room is full");
    }

    // Check if already a participant
    const existingParticipants = await withDatabaseErrorHandling(
      () => storage.getChymeRoomParticipants(roomId),
      'getChymeRoomParticipants'
    );
    const alreadyParticipant = existingParticipants.some(p => p.userId === userId && !p.leftAt);
    
    if (!alreadyParticipant) {
      await withDatabaseErrorHandling(
        () => storage.addChymeRoomParticipant({
          roomId,
          userId,
          isMuted: false,
          isSpeaking: false,
        }),
        'addChymeRoomParticipant'
      );
    }

    res.json({ message: "Joined room successfully" });
  }));

  app.post('/api/chyme/rooms/:roomId/leave', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;
    
    await withDatabaseErrorHandling(
      () => storage.removeChymeRoomParticipant(roomId, userId),
      'removeChymeRoomParticipant'
    );

    res.json({ message: "Left room successfully" });
  }));

  app.get('/api/chyme/rooms/:roomId/participants', isAuthenticated, asyncHandler(async (req: any, res) => {
    const roomId = req.params.roomId;
    const participants = await withDatabaseErrorHandling(
      () => storage.getChymeRoomParticipants(roomId),
      'getChymeRoomParticipants'
    );
    res.json(participants);
  }));

  // Chyme Message routes
  // GET messages: Public rooms allow unauthenticated access (listening mode)
  // Private rooms require authentication
  app.get('/api/chyme/rooms/:roomId/messages', publicItemLimiter, asyncHandler(async (req: any, res) => {
    const roomId = req.params.roomId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    // Check room type - public rooms allow unauthenticated access
    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoomById(roomId),
      'getChymeRoomById'
    );
    
    if (!room || !room.isActive) {
      throw new NotFoundError("Room not found or inactive");
    }

    // Private rooms require authentication
    if (room.roomType === 'private') {
      // Check if user is authenticated via Clerk
      if (!req.auth?.userId) {
        return res.status(401).json({ message: "Authentication required for private rooms" });
      }
    }

    const result = await withDatabaseErrorHandling(
      () => storage.getChymeMessagesByRoom(roomId, limit, offset),
      'getChymeMessagesByRoom'
    );
    res.json(result);
  }));

  app.post('/api/chyme/rooms/:roomId/messages', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const roomId = req.params.roomId;
    
    // Check if user is participant (for private rooms) or authenticated (for public rooms)
    const room = await withDatabaseErrorHandling(
      () => storage.getChymeRoomById(roomId),
      'getChymeRoomById'
    );
    if (!room || !room.isActive) {
      throw new NotFoundError("Room not found or inactive");
    }

    // For private rooms, check if user is a participant
    if (room.roomType === 'private') {
      const participants = await withDatabaseErrorHandling(
        () => storage.getChymeRoomParticipants(roomId),
        'getChymeRoomParticipants'
      );
      const isParticipant = participants.some(p => p.userId === userId && !p.leftAt);
      if (!isParticipant) {
        throw new ForbiddenError("You must be a participant to send messages in private rooms");
      }
    }

    // Get user profile to check if anonymous
    const profile = await withDatabaseErrorHandling(
      () => storage.getChymeProfile(userId),
      'getChymeProfile'
    );

    const validatedData = validateWithZod(insertChymeMessageSchema, {
      ...req.body,
      roomId,
      userId,
    }, 'Invalid message data');
    
    const message = await withDatabaseErrorHandling(
      () => storage.createChymeMessage(validatedData),
      'createChymeMessage'
    );
    res.json(message);
  }));

  // Chyme Survey routes (anonymous)
  app.post('/api/chyme/survey', publicItemLimiter, asyncHandler(async (req, res) => {
    stripIPAndMetadata(req);
    
    const validatedData = validateWithZod(insertChymeSurveyResponseSchema, {
      ...req.body,
      date: new Date().toISOString().split('T')[0], // Today's date
    }, 'Invalid survey data');
    
    const response = await withDatabaseErrorHandling(
      () => storage.createChymeSurveyResponse(validatedData),
      'createChymeSurveyResponse'
    );
    
    console.log(`Chyme survey response submitted: client ${validatedData.clientId}, foundValuable ${validatedData.foundValuable}`);
    
    res.json(response);
  }));

  // Check if survey should be shown (once per room per client)
  app.get('/api/chyme/survey/check-eligible', asyncHandler(async (req, res) => {
    const clientId = req.query.clientId as string;
    const roomId = req.query.roomId as string | undefined;
    
    if (!clientId) {
      return res.json({ eligible: false });
    }

    const recentResponses = await withDatabaseErrorHandling(
      () => storage.getChymeSurveyResponsesByClientId(clientId, 7),
      'getChymeSurveyResponsesByClientId'
    );
    
    // If roomId provided, check if already responded for this room
    if (roomId) {
      const roomResponse = recentResponses.find(r => r.roomId === roomId);
      if (roomResponse) {
        return res.json({ eligible: false });
      }
    }
    
    // Otherwise, allow if no response in last 7 days
    res.json({ eligible: recentResponses.length === 0 });
  }));

  // Chyme Admin Announcement routes
  app.get('/api/chyme/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllChymeAnnouncements(),
      'getAllChymeAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/chyme/admin/announcements', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertChymeAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createChymeAnnouncement(validatedData),
      'createChymeAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_chyme_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/chyme/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateChymeAnnouncement(req.params.id, req.body),
      'updateChymeAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_chyme_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/chyme/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateChymeAnnouncement(req.params.id),
      'deactivateChymeAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_chyme_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // ========================================
  // WORKFORCE RECRUITER TRACKER ROUTES
  // ========================================

  // Workforce Recruiter Tracker Announcement routes (public)
  app.get('/api/workforce-recruiter/announcements', isAuthenticated, asyncHandler(async (req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getActiveWorkforceRecruiterAnnouncements(),
      'getActiveWorkforceRecruiterAnnouncements'
    );
    res.json(announcements);
  }));

  // Workforce Recruiter Tracker Profile routes
  app.get('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterProfile(userId),
      'getWorkforceRecruiterProfile'
    );
    if (!profile) {
      return res.json(null);
    }
    // Get user data to return firstName
    const user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserVerificationForWorkforceRecruiterProfile'
    );
    const userIsVerified = user?.isVerified || false;
    const userFirstName = user?.firstName || null;
    res.json({ ...profile, userIsVerified, firstName: userFirstName });
  }));

  app.post('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterProfileSchema, req.body, 'Invalid profile data');
    
    const profile = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterProfile({
        ...validatedData,
        userId,
      }),
      'createWorkforceRecruiterProfile'
    );
    res.json(profile);
  }));

  app.put('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const profile = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterProfile(userId, req.body),
      'updateWorkforceRecruiterProfile'
    );
    res.json(profile);
  }));

  app.delete('/api/workforce-recruiter/profile', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterProfile(userId, reason),
      'deleteWorkforceRecruiterProfile'
    );
    res.json({ message: "Workforce Recruiter Tracker profile deleted successfully" });
  }));

  // Workforce Recruiter Tracker Config routes
  app.get('/api/workforce-recruiter/config', isAuthenticated, asyncHandler(async (req, res) => {
    const config = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterConfig(),
      'getWorkforceRecruiterConfig'
    );
    res.json(config);
  }));

  app.put('/api/workforce-recruiter/config', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const validatedData = validateWithZod(insertWorkforceRecruiterConfigSchema.partial(), req.body, 'Invalid config data');
    const config = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterConfig(validatedData),
      'updateWorkforceRecruiterConfig'
    );
    res.json(config);
  }));

  // Workforce Recruiter Tracker Occupation routes
  app.get('/api/workforce-recruiter/occupations', isAuthenticated, asyncHandler(async (req: any, res) => {
    const sector = req.query.sector as string | undefined;
    const skillLevel = req.query.skillLevel as 'Foundational' | 'Intermediate' | 'Advanced' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {};
    if (sector) filters.sector = sector;
    if (skillLevel) filters.skillLevel = skillLevel;
    filters.limit = limit;
    filters.offset = offset;

    const result = await withDatabaseErrorHandling(
      () => storage.getAllWorkforceRecruiterOccupations(filters),
      'getAllWorkforceRecruiterOccupations'
    );
    res.json(result);
  }));

  app.get('/api/workforce-recruiter/occupations/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const occupation = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterOccupation(req.params.id),
      'getWorkforceRecruiterOccupation'
    );
    if (!occupation) {
      throw new NotFoundError("Occupation not found");
    }
    res.json(occupation);
  }));

  app.post('/api/workforce-recruiter/occupations', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterOccupationSchema, req.body, 'Invalid occupation data');
    const occupation = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterOccupation(validatedData),
      'createWorkforceRecruiterOccupation'
    );
    
    await logAdminAction(
      userId,
      "create_workforce_recruiter_occupation",
      "occupation",
      occupation.id,
      { title: occupation.occupationTitle, sector: occupation.sector }
    );

    res.json(occupation);
  }));

  app.put('/api/workforce-recruiter/occupations/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterOccupationSchema.partial(), req.body, 'Invalid occupation data');
    const occupation = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterOccupation(req.params.id, validatedData),
      'updateWorkforceRecruiterOccupation'
    );
    
    await logAdminAction(
      userId,
      "update_workforce_recruiter_occupation",
      "occupation",
      occupation.id,
      { title: occupation.occupationTitle }
    );

    res.json(occupation);
  }));

  app.delete('/api/workforce-recruiter/occupations/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterOccupation(req.params.id),
      'deleteWorkforceRecruiterOccupation'
    );
    
    await logAdminAction(
      userId,
      "delete_workforce_recruiter_occupation",
      "occupation",
      req.params.id,
      {}
    );

    res.json({ message: "Occupation deleted successfully" });
  }));

  // Workforce Recruiter Meetup Event routes
  app.post('/api/workforce-recruiter/meetup-events', isAuthenticated, isAdmin, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSchema, req.body, 'Invalid meetup event data');
    
    // Add createdBy after validation (schema omits it, but database requires it)
    const event = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterMeetupEvent({
        ...validatedData,
        createdBy: userId,
      } as any),
      'createWorkforceRecruiterMeetupEvent'
    );
    
    await logAdminAction(
      userId,
      "create_workforce_recruiter_meetup_event",
      "meetup_event",
      event.id,
      { title: event.title, occupationId: event.occupationId }
    );
    
    res.json(event);
  }));

  app.get('/api/workforce-recruiter/meetup-events', isAuthenticated, asyncHandler(async (req: any, res) => {
    const occupationId = req.query.occupationId as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {};
    if (occupationId) filters.occupationId = occupationId;
    if (isActive !== undefined) filters.isActive = isActive;
    filters.limit = limit;
    filters.offset = offset;

    const result = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEvents(filters),
      'getWorkforceRecruiterMeetupEvents'
    );
    res.json(result);
  }));

  app.get('/api/workforce-recruiter/meetup-events/:id', isAuthenticated, asyncHandler(async (req: any, res) => {
    const event = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventById(req.params.id),
      'getWorkforceRecruiterMeetupEventById'
    );
    if (!event) {
      return res.status(404).json({ message: "Meetup event not found" });
    }
    res.json(event);
  }));

  app.put('/api/workforce-recruiter/meetup-events/:id', isAuthenticated, isAdmin, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSchema.partial(), req.body, 'Invalid meetup event data');
    const event = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterMeetupEvent(req.params.id, validatedData),
      'updateWorkforceRecruiterMeetupEvent'
    );
    
    await logAdminAction(
      userId,
      "update_workforce_recruiter_meetup_event",
      "meetup_event",
      event.id,
      { title: event.title }
    );
    
    res.json(event);
  }));

  app.delete('/api/workforce-recruiter/meetup-events/:id', isAuthenticated, isAdmin, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterMeetupEvent(req.params.id),
      'deleteWorkforceRecruiterMeetupEvent'
    );
    
    await logAdminAction(
      userId,
      "delete_workforce_recruiter_meetup_event",
      "meetup_event",
      req.params.id,
      {}
    );
    
    res.json({ message: "Meetup event deleted successfully" });
  }));

  // Workforce Recruiter Meetup Event Signup routes
  app.post('/api/workforce-recruiter/meetup-events/:eventId/signups', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const eventId = req.params.eventId;
    
    // Check if user already signed up
    const existingSignup = await withDatabaseErrorHandling(
      () => storage.getUserMeetupEventSignup(eventId, userId),
      'getUserMeetupEventSignup'
    );
    
    if (existingSignup) {
      return res.status(400).json({ message: "You have already signed up for this event" });
    }
    
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSignupSchema, {
      ...req.body,
      eventId,
    }, 'Invalid signup data');
    
    // Add userId after validation (schema omits it, but database requires it)
    const signup = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterMeetupEventSignup({
        ...validatedData,
        userId,
      } as any),
      'createWorkforceRecruiterMeetupEventSignup'
    );
    res.json(signup);
  }));

  app.get('/api/workforce-recruiter/meetup-events/:eventId/signups', isAuthenticated, asyncHandler(async (req: any, res) => {
    const eventId = req.params.eventId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const filters: any = {
      eventId,
      limit,
      offset,
    };

    const result = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignups(filters),
      'getWorkforceRecruiterMeetupEventSignups'
    );
    res.json(result);
  }));

  app.get('/api/workforce-recruiter/meetup-events/:eventId/signup-count', isAuthenticated, asyncHandler(async (req: any, res) => {
    const eventId = req.params.eventId;
    const count = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignupCount(eventId),
      'getWorkforceRecruiterMeetupEventSignupCount'
    );
    res.json({ count });
  }));

  app.get('/api/workforce-recruiter/meetup-events/:eventId/my-signup', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const eventId = req.params.eventId;
    const signup = await withDatabaseErrorHandling(
      () => storage.getUserMeetupEventSignup(eventId, userId),
      'getUserMeetupEventSignup'
    );
    res.json(signup || null);
  }));

  app.put('/api/workforce-recruiter/meetup-events/:eventId/signups/:signupId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const signupId = req.params.signupId;
    
    // Verify user owns this signup
    const existingSignup = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignups({ userId, limit: 1000, offset: 0 }),
      'getWorkforceRecruiterMeetupEventSignups'
    );
    const signup = existingSignup.signups.find(s => s.id === signupId);
    if (!signup || signup.userId !== userId) {
      return res.status(403).json({ message: "You can only update your own signup" });
    }
    
    const validatedData = validateWithZod(insertWorkforceRecruiterMeetupEventSignupSchema.partial(), req.body, 'Invalid signup data');
    const updated = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterMeetupEventSignup(signupId, validatedData),
      'updateWorkforceRecruiterMeetupEventSignup'
    );
    res.json(updated);
  }));

  app.delete('/api/workforce-recruiter/meetup-events/:eventId/signups/:signupId', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const signupId = req.params.signupId;
    
    // Verify user owns this signup
    const existingSignup = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterMeetupEventSignups({ userId, limit: 1000, offset: 0 }),
      'getWorkforceRecruiterMeetupEventSignups'
    );
    const signup = existingSignup.signups.find(s => s.id === signupId);
    if (!signup || signup.userId !== userId) {
      return res.status(403).json({ message: "You can only delete your own signup" });
    }
    
    await withDatabaseErrorHandling(
      () => storage.deleteWorkforceRecruiterMeetupEventSignup(signupId),
      'deleteWorkforceRecruiterMeetupEventSignup'
    );
    res.json({ message: "Signup deleted successfully" });
  }));

  // Workforce Recruiter Tracker Reports routes
  app.get('/api/workforce-recruiter/reports/summary', isAuthenticated, asyncHandler(async (req, res) => {
    const report = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterSummaryReport(),
      'getWorkforceRecruiterSummaryReport'
    );
    res.json(report);
  }));

  app.get('/api/workforce-recruiter/reports/skill-level/:skillLevel', isAuthenticated, asyncHandler(async (req, res) => {
    const { skillLevel } = req.params;
    const detail = await withDatabaseErrorHandling(
      () => storage.getWorkforceRecruiterSkillLevelDetail(skillLevel),
      'getWorkforceRecruiterSkillLevelDetail'
    );
    res.json(detail);
  }));

  // Workforce Recruiter Tracker Export route
  app.get('/api/workforce-recruiter/export', isAuthenticated, asyncHandler(async (req: any, res) => {
    const format = (req.query.format as string) || 'csv';
    
    const [report, occupationsResult] = await Promise.all([
      withDatabaseErrorHandling(
        () => storage.getWorkforceRecruiterSummaryReport(),
        'getWorkforceRecruiterSummaryReport'
      ),
      withDatabaseErrorHandling(
        () => storage.getAllWorkforceRecruiterOccupations({ limit: 10000, offset: 0 }),
        'getAllWorkforceRecruiterOccupations'
      ),
    ]);

    const occupations = occupationsResult.occupations;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="workforce-recruiter-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        summary: report,
        occupations,
        exportedAt: new Date().toISOString(),
      });
    } else {
      // CSV export
      const csvRows: string[] = [];
      
      // Summary section
      csvRows.push('Summary');
      csvRows.push(`Total Workforce Target,${report.totalWorkforceTarget}`);
      csvRows.push(`Total Current Recruited,${report.totalCurrentRecruited}`);
      csvRows.push(`Percent Recruited,${report.percentRecruited.toFixed(2)}%`);
      csvRows.push('');
      
      // Sector breakdown
      csvRows.push('Sector Breakdown');
      csvRows.push('Sector,Target,Recruited,Percent');
      report.sectorBreakdown.forEach(sector => {
        csvRows.push(`${sector.sector},${sector.target},${sector.recruited},${sector.percent.toFixed(2)}%`);
      });
      csvRows.push('');
      
      // Skill level breakdown
      csvRows.push('Skill Level Breakdown');
      csvRows.push('Skill Level,Target,Recruited,Percent');
      report.skillLevelBreakdown.forEach(skill => {
        csvRows.push(`${skill.skillLevel},${skill.target},${skill.recruited},${skill.percent.toFixed(2)}%`);
      });
      csvRows.push('');
      
      // Occupations
      csvRows.push('Occupations');
      csvRows.push('Sector,Occupation Title,Headcount Target,Current Recruited,Skill Level,Annual Training Target,Notes');
      occupations.forEach(occ => {
        const notes = (occ.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
        csvRows.push(`${occ.sector},${occ.occupationTitle},${occ.headcountTarget},${occ.currentRecruited},${occ.skillLevel},${occ.annualTrainingTarget},"${notes}"`);
      });
      
      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="workforce-recruiter-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }
  }));

  // Workforce Recruiter Tracker Admin Announcement routes
  app.get('/api/workforce-recruiter/admin/announcements', isAuthenticated, isAdmin, asyncHandler(async (req, res) => {
    const announcements = await withDatabaseErrorHandling(
      () => storage.getAllWorkforceRecruiterAnnouncements(),
      'getAllWorkforceRecruiterAnnouncements'
    );
    res.json(announcements);
  }));

  app.post('/api/workforce-recruiter/admin/announcements', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterAnnouncementSchema, req.body, 'Invalid announcement data');

    const announcement = await withDatabaseErrorHandling(
      () => storage.createWorkforceRecruiterAnnouncement(validatedData),
      'createWorkforceRecruiterAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "create_workforce_recruiter_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title, type: announcement.type }
    );

    res.json(announcement);
  }));

  app.put('/api/workforce-recruiter/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const validatedData = validateWithZod(insertWorkforceRecruiterAnnouncementSchema.partial(), req.body, 'Invalid announcement data');
    const announcement = await withDatabaseErrorHandling(
      () => storage.updateWorkforceRecruiterAnnouncement(req.params.id, validatedData),
      'updateWorkforceRecruiterAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "update_workforce_recruiter_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  app.delete('/api/workforce-recruiter/admin/announcements/:id', isAuthenticated, ...isAdminWithCsrf, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const announcement = await withDatabaseErrorHandling(
      () => storage.deactivateWorkforceRecruiterAnnouncement(req.params.id),
      'deactivateWorkforceRecruiterAnnouncement'
    );
    
    await logAdminAction(
      userId,
      "deactivate_workforce_recruiter_announcement",
      "announcement",
      announcement.id,
      { title: announcement.title }
    );

    res.json(announcement);
  }));

  // Add this route after the existing workforce-recruiter routes (around line 2800+)

  // Get sector details with skills and job titles breakdown
  app.get(
    "/api/workforce-recruiter/sector/:sector",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const sector = decodeURIComponent(req.params.sector);

        const details = await storage.getWorkforceRecruiterSectorDetail(sector);

        res.json(details);
      } catch (error: any) {
        console.error("Error fetching sector details:", error);
        res.status(500).json({ message: error.message });
      }
    }
  );

  // ========================================
  // DEFAULT ALIVE OR DEAD ROUTES (ADMIN ONLY)
  // ========================================

  // Default Alive or Dead Financial Entry routes (admin only)
  app.get('/api/default-alive-or-dead/financial-entries', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const weekStartDate = req.query.weekStartDate ? new Date(req.query.weekStartDate) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      
      const result = await storage.getDefaultAliveOrDeadFinancialEntries({
        weekStartDate,
        limit,
        offset,
      });
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching financial entries:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  app.post('/api/default-alive-or-dead/financial-entries', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = validateWithZod(insertDefaultAliveOrDeadFinancialEntrySchema, req.body, 'Invalid financial entry data');
      const entry = await storage.createDefaultAliveOrDeadFinancialEntry(validatedData, userId);
      
      // Automatically calculate EBITDA for this week
      await storage.calculateAndStoreEbitdaSnapshot(validatedData.weekStartDate);
      
      res.json(entry);
    } catch (error: any) {
      console.error("Error creating financial entry:", error);
      res.status(400).json({ message: error.message || "Failed to create financial entry" });
    }
  }));

  app.put('/api/default-alive-or-dead/financial-entries/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      // Get the existing entry first to know which week to recalculate
      const existingEntry = await storage.getDefaultAliveOrDeadFinancialEntry(req.params.id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Financial entry not found" });
      }

      const validatedData = validateWithZod(insertDefaultAliveOrDeadFinancialEntrySchema.partial(), req.body, 'Invalid financial entry data');
      const entry = await storage.updateDefaultAliveOrDeadFinancialEntry(req.params.id, validatedData);
      
      // Recalculate EBITDA for this week with updated expenses
      // Use weekStartDate from updated entry if provided, otherwise use existing
      const weekStartDate = validatedData.weekStartDate || existingEntry.weekStartDate;
      await storage.calculateAndStoreEbitdaSnapshot(new Date(weekStartDate));
      
      res.json(entry);
    } catch (error: any) {
      console.error("Error updating financial entry:", error);
      res.status(400).json({ message: error.message || "Failed to update financial entry" });
    }
  }));

  app.delete('/api/default-alive-or-dead/financial-entries/:id', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      await storage.deleteDefaultAliveOrDeadFinancialEntry(req.params.id);
      res.json({ message: "Financial entry deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting financial entry:", error);
      res.status(400).json({ message: error.message || "Failed to delete financial entry" });
    }
  }));

  // Default Alive or Dead EBITDA Snapshot routes (admin only)
  app.post('/api/default-alive-or-dead/calculate-ebitda', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const { weekStartDate, currentFunding } = req.body;
      if (!weekStartDate) {
        return res.status(400).json({ message: "weekStartDate is required" });
      }
      const snapshot = await storage.calculateAndStoreEbitdaSnapshot(new Date(weekStartDate), currentFunding);
      res.json(snapshot);
    } catch (error: any) {
      console.error("Error calculating EBITDA snapshot:", error);
      res.status(500).json({ message: error.message || "Failed to calculate EBITDA snapshot" });
    }
  }));

  app.get('/api/default-alive-or-dead/ebitda-snapshots', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      
      const result = await storage.getDefaultAliveOrDeadEbitdaSnapshots({
        limit,
        offset,
      });
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching EBITDA snapshots:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  app.get('/api/default-alive-or-dead/current-status', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const status = await storage.getDefaultAliveOrDeadCurrentStatus();
      res.json(status);
    } catch (error: any) {
      console.error("Error fetching current status:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  app.get('/api/default-alive-or-dead/weekly-trends', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const weeks = req.query.weeks ? parseInt(req.query.weeks, 10) : 12;
      const trends = await storage.getDefaultAliveOrDeadWeeklyTrends(weeks);
      res.json(trends);
    } catch (error: any) {
      console.error("Error fetching weekly trends:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  app.get('/api/default-alive-or-dead/week-comparison', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const weekStartParam = req.query.weekStart;
      let weekStart: Date;
      
      if (weekStartParam) {
        // Parse date string (YYYY-MM-DD) and interpret as local date, not UTC
        const [year, month, day] = weekStartParam.split('-').map(Number);
        weekStart = new Date(year, month - 1, day);
        if (isNaN(weekStart.getTime())) {
          return res.status(400).json({ message: "Invalid weekStart date format" });
        }
      } else {
        // Default to current week
        weekStart = new Date();
      }
      
      const comparison = await storage.getDefaultAliveOrDeadWeekComparison(weekStart);
      res.json(comparison);
    } catch (error: any) {
      console.error("Error fetching week comparison:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  // Current funding routes
  app.get('/api/default-alive-or-dead/current-funding', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const funding = await storage.getDefaultAliveOrDeadCurrentFunding();
      res.json({ currentFunding: funding });
    } catch (error: any) {
      console.error("Error fetching current funding:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  app.put('/api/default-alive-or-dead/current-funding', isAuthenticated, isAdmin, asyncHandler(async (req: any, res) => {
    try {
      const { currentFunding } = req.body;
      if (typeof currentFunding !== 'number' || currentFunding < 0) {
        return res.status(400).json({ message: "currentFunding must be a non-negative number" });
      }
      await storage.updateDefaultAliveOrDeadCurrentFunding(currentFunding);
      res.json({ message: "Current funding updated successfully", currentFunding });
    } catch (error: any) {
      console.error("Error updating current funding:", error);
      res.status(500).json({ message: error.message });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
