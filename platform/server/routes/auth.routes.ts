/**
 * Authentication and user routes
 */

import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, getUserId, syncClerkUserToDatabase } from "../auth";
import { asyncHandler } from "../errorHandler";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError, ForbiddenError, UnauthorizedError, ExternalServiceError } from "../errors";
import { logError, logInfo, logWarning } from "../errorLogger";

export function registerAuthRoutes(app: Express) {
  // Test-only authentication endpoint for E2E tests
  // Creates a real Clerk session for testing
  // Only available when E2E_TEST_MODE is enabled
  if (process.env.E2E_TEST_MODE === 'true') {
    app.post('/api/auth/test-login', asyncHandler(async (req: any, res) => {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      // Verify user exists in our database
      try {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Use Clerk API to create a session for this user
        // This creates a real Clerk session that will work with Clerk middleware
        const { clerkClient } = await import('@clerk/clerk-sdk-node');
        const clerkSecret = process.env.CLERK_SECRET_KEY;
        
        if (!clerkSecret || clerkSecret === 'dev_dummy_clerk_secret_key_do_not_use_in_production') {
          return res.status(500).json({ 
            message: 'Clerk not properly configured for E2E tests. CLERK_SECRET_KEY must be set.' 
          });
        }

        // clerkClient is already configured via CLERK_SECRET_KEY environment variable
        const clerk = clerkClient;
        
        // Create a session for the user
        let session;
        try {
          session = await clerk.sessions.createSession({
            userId: userId,
          });
        } catch (sessionError: any) {
          logError(sessionError, req);
          return res.status(500).json({ 
            message: 'Failed to create Clerk session: ' + sessionError.message 
          });
        }

        // Create a session token (if the method exists)
        // Note: Clerk's API may vary - this is the expected method name
        let sessionToken: string;
        try {
          // Try the createSessionToken method
          if (typeof (clerk.sessions as any).createSessionToken === 'function') {
            sessionToken = await (clerk.sessions as any).createSessionToken(session.id, {
              expiresInSeconds: 3600, // 1 hour
            });
          } else {
            // Fallback: use session ID as token (may not work, but worth trying)
            sessionToken = session.id;
            logWarning('createSessionToken method not available, using session ID', req);
          }
        } catch (tokenError: any) {
          // If token creation fails, try using session ID directly
          logWarning(`Session token creation failed: ${tokenError.message}, using session ID`, req);
          sessionToken = session.id;
        }

        // Set the Clerk session cookie
        // Clerk expects the session token in the __session cookie
        res.cookie('__session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600 * 1000, // 1 hour
          path: '/',
        });

        res.json({ 
          success: true, 
          userId,
          sessionId: session.id,
          message: 'Test authentication successful (E2E_TEST_MODE only)' 
        });
      } catch (error: any) {
        logError(error, req);
        res.status(500).json({ message: 'Failed to authenticate test user: ' + error.message });
      }
    }));
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, asyncHandler(async (req: any, res) => {
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
      logError(getUserIdError, req, 'error');
      throw new UnauthorizedError("Authentication failed: Unable to extract user ID. Please try signing in again.");
    }
    
    // Validate userId is present
    if (!userId || userId.trim() === "") {
      logError(new Error("userId is missing or empty"), req, 'error');
      throw new UnauthorizedError("Authentication failed: User ID not found. Please try signing in again.");
    }
      
    // Try to get user from database with specific error handling
    let user: any;
    try {
      user = await storage.getUser(userId);
    } catch (dbError: any) {
      // Log detailed database error for production debugging
      logError(dbError, req, 'error');
      
      // If database query fails, try to sync from Clerk as fallback
      // This handles cases where database is temporarily unavailable
      logWarning(`Database query failed for user ${userId}, attempting to sync from Clerk as fallback`, req);
      try {
        const sessionClaims = (req.auth as any)?.sessionClaims;
        user = await syncClerkUserToDatabase(userId, sessionClaims);
        // If sync succeeds, return the user
        if (user) {
          return res.json(user);
        }
        // If sync returns null, treat it as a sync failure
        // This should not happen normally, but we handle it explicitly to avoid returning null
        logError(new Error(`Sync returned null for user ${userId}. This indicates a sync failure.`), req, 'error');
        throw new Error("User sync failed: Unable to retrieve or create user. Please try refreshing the page.");
      } catch (syncError: any) {
        logError(syncError, req, 'error');
        // Also log the original database error for full context
        logError(dbError, req, 'error');
        
        // If sync fails (e.g., deleted user), return appropriate error
        if (syncError.message?.includes("deleted")) {
          throw new ForbiddenError(syncError.message || "This account has been deleted. Please contact support if you believe this is an error.");
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
          logError(new Error("Database connection error - returning 503 Service Unavailable"), req, 'error');
          throw new ExternalServiceError("Database", "Database temporarily unavailable. Please try again in a moment.", 503);
        }
        
        // For other errors, return 500 error instead of null
        // Never return null for authenticated users - this causes sync failure errors in frontend
        logError(new Error(`Both database query and sync failed for user ${userId}`), req, 'error');
        const errorMsg = "Failed to sync user. Please try refreshing the page.";
        const error = new Error(errorMsg);
        (error as any).statusCode = 500;
        (error as any).details = process.env.NODE_ENV === 'development' ? `Database error: ${dbError.message}. Sync error: ${syncError.message}` : undefined;
        throw error;
      }
    }
    
    // If user doesn't exist in our database after middleware sync, try one more time
    // This handles edge cases where sync might have failed in middleware
    if (!user) {
      logWarning(`User not found in database after middleware sync, attempting fallback sync: ${userId}`, req, {
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
          logError(new Error(`Sync completed but user is still null for ${userId}. This should not happen.`), req, 'error');
          // Try one more time to get the user (might be a timing issue)
          try {
            // Wait a bit for database to catch up
            await new Promise(resolve => setTimeout(resolve, 100));
            user = await storage.getUser(userId);
            if (user) {
              logInfo(`User found on retry for ${userId}`, req);
            } else {
              logError(new Error(`User still not found after retry for ${userId}. This indicates a sync failure.`), req);
              throw new Error("User sync failed. Please try refreshing the page.");
            }
          } catch (retryError: any) {
            logError(retryError, req, 'error');
            throw new Error("Failed to retrieve user after sync. Please try refreshing the page.");
          }
        } else {
          logInfo(`Successfully synced user ${userId} in ${syncDuration}ms (fallback sync)`, req);
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
        
        logError(new Error("Error syncing user from Clerk (fallback)"), req, 'error');
        
        // If sync fails (e.g., deleted user), return appropriate error
        if (syncError.message?.includes("deleted")) {
          throw new ForbiddenError(syncError.message || "This account has been deleted. Please contact support if you believe this is an error.");
        }
        
        // If it's a database connection error, return 503
        if (syncError.message?.includes("Database temporarily unavailable") ||
            syncError instanceof ExternalServiceError && syncError.statusCode === 503) {
          throw new ExternalServiceError("Database", "Database temporarily unavailable. Please try again in a moment.", 503);
        }
        
        // For other sync errors, return 500 with helpful message
        // Don't return null - this causes confusion in the frontend
        const errorMsg = "Failed to sync user. Please try refreshing the page.";
        const error = new Error(errorMsg);
        (error as any).statusCode = 500;
        (error as any).details = process.env.NODE_ENV === 'development' ? syncError.message : undefined;
        throw error;
      }
    }
    
    // Check if user is deleted
    if (user && user.email === null && user.firstName === "Deleted" && user.lastName === "User") {
      throw new ForbiddenError("This account has been deleted. Please contact support if you believe this is an error.");
    }
    
    res.json(user);
  }));

  // Account deletion - delete entire user account from all mini-apps
  app.delete('/api/account/delete', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { reason } = req.body;

    await withDatabaseErrorHandling(
      () => storage.deleteUserAccount(userId, reason),
      'deleteUserAccount'
    );
    
    res.json({ message: "Account deleted successfully" });
  }));

  // Terms acceptance
  app.post('/api/account/accept-terms', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    
    const user = await withDatabaseErrorHandling(
      () => storage.updateTermsAcceptance(userId),
      'updateTermsAcceptance'
    ) as { termsAcceptedAt: Date | null };
    
    res.json({ message: "Terms accepted successfully", termsAcceptedAt: user.termsAcceptedAt });
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

  // User route - Update own Quora profile URL
  app.put('/api/user/quora-profile-url', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { quoraProfileUrl } = req.body;
    const user = await withDatabaseErrorHandling(
      () => storage.updateUserQuoraProfileUrl(userId, quoraProfileUrl || null),
      'updateUserQuoraProfileUrl'
    );
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    res.json(user);
  }));

  app.put('/api/user/name', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = getUserId(req);
    const { firstName, lastName } = req.body;
    
    // Validate input - firstName and lastName are optional but if provided should be strings
    if (firstName !== undefined && firstName !== null && typeof firstName !== 'string') {
      return res.status(400).json({ message: "firstName must be a string or null" });
    }
    if (lastName !== undefined && lastName !== null && typeof lastName !== 'string') {
      return res.status(400).json({ message: "lastName must be a string or null" });
    }
    
    // Trim whitespace and convert empty strings to null
    const trimmedFirstName = typeof firstName === 'string' ? firstName.trim() || null : firstName;
    const trimmedLastName = typeof lastName === 'string' ? lastName.trim() || null : lastName;
    
    const user = await withDatabaseErrorHandling(
      () => storage.updateUserName(userId, trimmedFirstName, trimmedLastName),
      'updateUserName'
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  }));
}

