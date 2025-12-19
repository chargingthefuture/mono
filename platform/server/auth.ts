import { requireAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { validateCsrfToken } from "./csrf";
import { withDatabaseErrorHandling } from "./databaseErrorHandler";
import { ExternalServiceError, UnauthorizedError, ForbiddenError } from "./errors";
import { loginEvents } from "@shared/schema";
import { db } from "./db";

// Clerk Configuration
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("Environment variable CLERK_SECRET_KEY not provided");
}

/**
 * Map Clerk user to our user schema
 */
function mapClerkUser(clerkUser: any) {
  const firstName = clerkUser.firstName || "";
  const lastName = clerkUser.lastName || "";
  const fullName = clerkUser.fullName || "";
  
  // If separate name fields not available, try to split from full name
  const nameParts = fullName.split(" ");
  const parsedFirstName = !firstName && nameParts.length > 0 ? nameParts[0] : firstName;
  const parsedLastName = !lastName && nameParts.length > 1 ? nameParts.slice(1).join(" ") : lastName;

  return {
    sub: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || "",
    first_name: parsedFirstName,
    last_name: parsedLastName,
    profile_image_url: clerkUser.imageUrl || null,
  };
}

/**
 * Check if a user account has been deleted
 * Deleted users have: email === null, firstName === "Deleted", lastName === "User"
 */
function isUserDeleted(user: any): boolean {
  return user && 
    user.email === null && 
    user.firstName === "Deleted" && 
    user.lastName === "User";
}

/**
 * Retry helper for transient failures
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Don't retry on non-transient errors
      if (error.message?.includes("deleted") || 
          error.message?.includes("Invalid") ||
          error.statusCode === 403 ||
          error.statusCode === 404) {
        throw error;
      }
      // If it's the last attempt, throw
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms for sync operation`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function syncClerkUserToDatabase(userId: string, sessionClaims?: any) {
  try {
    // Check if user is deleted before syncing
    // Wrap in error handling - if database is unavailable, we'll try to continue with Clerk data
    let existingUser;
    try {
      existingUser = await withDatabaseErrorHandling(
        () => storage.getUser(userId),
        'getUserForSync'
      );
    } catch (dbError: any) {
      // If it's a connection error, log but continue - we'll try to create user from Clerk data
      if (dbError instanceof ExternalServiceError && dbError.statusCode === 503) {
        console.warn(`Database unavailable when checking existing user ${userId}, will attempt to create from Clerk data`);
        existingUser = undefined;
      } else {
        // For other database errors (like deleted user check), re-throw
        throw dbError;
      }
    }
    
    if (existingUser && isUserDeleted(existingUser)) {
      throw new Error("This account has been deleted. Please contact support if you believe this is an error.");
    }
    
    // Get full user details from Clerk with retry logic for transient failures
    let clerkUser;
    try {
      clerkUser = await retryWithBackoff(
        () => clerkClient.users.getUser(userId),
        3, // 3 retries
        1000 // 1 second base delay
      );
    } catch (clerkError: any) {
      // Log detailed error for debugging
      console.error("Error fetching user from Clerk API (after retries):", {
        userId,
        error: clerkError.message,
        statusCode: clerkError.statusCode,
        status: clerkError.status,
        stack: clerkError.stack,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        secretKeyPrefix: process.env.CLERK_SECRET_KEY?.substring(0, 10),
        environment: process.env.NODE_ENV,
      });
      
      // If we have an existing user in DB, return it instead of failing
      if (existingUser) {
        console.log(`Clerk API call failed, but user exists in DB. Returning existing user: ${userId}`);
        return existingUser;
      }
      
      // If we have session claims from JWT, try to create a minimal user
      if (sessionClaims && sessionClaims.email) {
        console.log(`Clerk API unavailable, creating minimal user from JWT claims for: ${userId}`);
        try {
          const minimalUser = {
            id: userId,
            email: sessionClaims.email,
            firstName: sessionClaims.firstName || sessionClaims.name?.split(' ')[0] || '',
            lastName: sessionClaims.lastName || sessionClaims.name?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: sessionClaims.imageUrl || null,
          };
          
          // Get current pricing tier with error handling
          let pricingTier = '1.00';
          try {
            const currentTier = await withDatabaseErrorHandling(
              () => storage.getCurrentPricingTier(),
              'getCurrentPricingTierForFallback'
            );
            pricingTier = currentTier?.amount || '1.00';
          } catch (tierError: any) {
            console.warn(`Failed to get pricing tier, using default: ${tierError.message}`);
            // Use default pricing tier if database is unavailable
          }
          
          // Try to create user with retry logic
          // Use the returned user directly to avoid replication lag issues
          const jwtUserData = {
            ...minimalUser,
            pricingTier,
            isAdmin: false,
            isVerified: false,
            isApproved: false, // New users must be approved by admin
            subscriptionStatus: 'active',
          };
          
          const jwtUserResult = await retryWithBackoff(
            () => withDatabaseErrorHandling(
              () => storage.upsertUser(jwtUserData),
              'upsertUserFromJWTClaims'
            ),
            2, // 2 retries for database operations
            500 // 500ms base delay
          );
          
          if (jwtUserResult) {
            // Use the result directly instead of querying again
            // This avoids replication lag issues and is more reliable
            return jwtUserResult;
          }
          
          // Fallback: If result is null/undefined, try to get user (shouldn't happen)
          const createdUser = await retryWithBackoff(
            () => withDatabaseErrorHandling(
              () => storage.getUser(userId),
              'getUserAfterJWTFallback'
            ),
            2,
            500
          );
          
          if (!createdUser) {
            console.error(`User created but not found after creation for ${userId}. This indicates a database sync issue.`);
            throw new Error("User created but not found. Please try again.");
          }
          
          return createdUser;
        } catch (fallbackError: any) {
          console.error("Error creating user from JWT claims:", {
            userId,
            error: fallbackError.message,
            stack: fallbackError.stack,
            name: fallbackError.name,
            code: fallbackError.code,
          });
          // If it's a connection error, provide a more helpful message
          if (fallbackError instanceof ExternalServiceError && fallbackError.statusCode === 503) {
            throw new Error("Database temporarily unavailable. Please try again in a moment.");
          }
          // Continue to throw original error
          throw fallbackError;
        }
      }
      
      // Re-throw with more context
      throw new Error(`Failed to fetch user from Clerk: ${clerkError.message || 'Unknown error'}`);
    }
    
    // Upsert user in our database with retry logic
    // upsertUser returns the user directly, so we can use that instead of calling getUser again
    let upsertedUser: any;
    try {
      upsertedUser = await retryWithBackoff(
        () => upsertUser(clerkUser),
        2, // 2 retries for database operations
        500 // 500ms base delay
      );
    } catch (upsertError: any) {
      console.error(`Failed to upsert user ${userId}:`, {
        error: upsertError.message,
        stack: upsertError.stack,
        code: upsertError.code,
        errno: upsertError.errno,
        sqlState: upsertError.sqlState,
        constraint: upsertError.constraint,
        detail: upsertError.detail,
        name: upsertError.name,
      });
      throw new Error(`Failed to sync user to database: ${upsertError.message || 'Unknown error'}`);
    }
    
    // Verify the upserted user exists and has required fields
    if (!upsertedUser || !upsertedUser.id) {
      console.error(`Upsert returned invalid user for ${userId}:`, {
        upsertedUser,
        hasId: !!upsertedUser?.id,
      });
      // Try to get user from database as fallback
      const fallbackUser = await retryWithBackoff(
        () => withDatabaseErrorHandling(
          () => storage.getUser(userId),
          'getUserAfterUpsertFailure'
        ),
        2,
        500
      );
      if (!fallbackUser) {
        throw new Error("User upserted but not found. Please try again.");
      }
      return fallbackUser;
    }
    
    // Return the upserted user directly (more reliable than calling getUser again)
    return upsertedUser;
  } catch (error: any) {
    console.error("Error syncing Clerk user to database:", {
      userId,
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

async function upsertUser(clerkUser: any) {
  // Map Clerk user to our schema format
  const mappedUser = mapClerkUser(clerkUser);
  
  if (!mappedUser.sub || !mappedUser.email) {
    throw new Error("Invalid user data from Clerk");
  }
  
  // Check if user already exists with error handling
  let existingUser;
  try {
    existingUser = await withDatabaseErrorHandling(
      () => storage.getUser(mappedUser.sub),
      'getUserForUpsert'
    );
  } catch (dbError: any) {
    // If it's a connection error, we can't check if user exists
    // But we should still try to upsert - if user exists, it will update; if not, it will create
    if (dbError instanceof ExternalServiceError && dbError.statusCode === 503) {
      console.warn(`Database unavailable when checking existing user for upsert ${mappedUser.sub}, will attempt upsert anyway`);
      existingUser = undefined;
    } else {
      throw dbError;
    }
  }
  
  if (existingUser) {
    // For existing users, only update profile information, preserve pricing tier
    // Preserve approval status and admin status
    // IMPORTANT: Only update firstName/lastName if Clerk has actual values (not empty strings)
    // This prevents Clerk sync from overwriting manually set names when Clerk doesn't have them
    const firstNameToUse = mappedUser.first_name && mappedUser.first_name.trim() !== "" 
      ? mappedUser.first_name 
      : existingUser.firstName;
    const lastNameToUse = mappedUser.last_name && mappedUser.last_name.trim() !== "" 
      ? mappedUser.last_name 
      : existingUser.lastName;
    
    const updatedUser = await withDatabaseErrorHandling(
      () => storage.upsertUser({
        id: mappedUser.sub,
        email: mappedUser.email,
        firstName: firstNameToUse,
        lastName: lastNameToUse,
        profileImageUrl: mappedUser.profile_image_url,
        quoraProfileUrl: existingUser.quoraProfileUrl, // Preserve Quora profile URL
        pricingTier: existingUser.pricingTier, // Preserve existing pricing tier (grandfathered)
        isAdmin: existingUser.isAdmin, // Preserve admin status
        isApproved: existingUser.isApproved, // Preserve approval status
        subscriptionStatus: existingUser.subscriptionStatus, // Preserve subscription status
      }),
      'upsertExistingUser'
    );
    return updatedUser;
  } else {
    // For new users, get current pricing tier
    let pricingTier = '1.00';
    try {
      const currentTier = await withDatabaseErrorHandling(
        () => storage.getCurrentPricingTier(),
        'getCurrentPricingTierForNewUser'
      );
      pricingTier = currentTier?.amount || '1.00';
    } catch (tierError: any) {
      console.warn(`Failed to get pricing tier for new user, using default: ${tierError.message}`);
      // Use default pricing tier if database is unavailable
    }

    const newUser = await withDatabaseErrorHandling(
      () => storage.upsertUser({
        id: mappedUser.sub,
        email: mappedUser.email,
        firstName: mappedUser.first_name,
        lastName: mappedUser.last_name,
        profileImageUrl: mappedUser.profile_image_url,
        pricingTier,
        isAdmin: false,
        isVerified: false,
        isApproved: false, // New users must be approved by admin
        subscriptionStatus: 'active',
      }),
      'upsertNewUser'
    );
    return newUser;
  }
}

export async function setupAuth(app: Express) {
  // Clerk middleware automatically handles authentication
  // No manual session management needed - Clerk handles it via cookies/JWT
  
  // Middleware to sync Clerk user with our database on every authenticated request
  // This ensures users are synced before route handlers try to access them
  app.use(async (req: any, res, next) => {
    // Clerk middleware runs first (via requireAuth/withAuth)
    // After Clerk verifies auth, we sync user to our DB
    if (req.auth?.userId) {
      try {
        const sessionClaims = (req.auth as any)?.sessionClaims;
        await syncClerkUserToDatabase(req.auth.userId, sessionClaims);

        // Record a login event for DAU/MAU analytics.
        // We only record for standard Clerk-authenticated web sessions (not OTP Android flows).
        if (!req.otpAuth) {
          try {
            await db.insert(loginEvents).values({
              userId: req.auth.userId,
              source: "webapp",
            });
          } catch (logError: any) {
            console.error("Error recording login event:", {
              userId: req.auth.userId,
              error: logError?.message,
            });
          }
        }
      } catch (error: any) {
        // Log sync failures with detailed context for debugging
        console.error("Error syncing Clerk user to database in middleware:", {
          userId: req.auth.userId,
          error: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name,
          timestamp: new Date().toISOString(),
          path: req.path,
        });
        
        // If it's a deleted user error, block the request
        if (error.message?.includes("deleted")) {
          return next(new ForbiddenError(
            error.message || "This account has been deleted. Please contact support if you believe this is an error."
          ));
        }
        
        // For other sync failures, log but don't block - let the route handlers deal with it
        // This prevents empty responses that cause JSON parsing errors
        // The /api/auth/user endpoint will handle sync failures gracefully with retry logic
        // However, we should still log prominently so admins can see sync issues
        if (process.env.NODE_ENV === 'production') {
          console.error(`[SYNC FAILURE] User ${req.auth.userId} sync failed in middleware. Route handlers will attempt fallback sync.`);
        }
      }
    }
    next();
  });
}

// Middleware to validate OTP token from Android app
export const validateOTPToken: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Check if token exists in database
    try {
      const { storage } = await import('./storage');
      const authToken = await storage.findAuthTokenByToken(token);
      
      if (authToken) {
        const now = Date.now();
        const expiresAt = authToken.expiresAt.getTime();
        
        if (expiresAt > now) {
          // Token is valid, attach user info to request
          req.auth = {
            userId: authToken.userId
          };
          req.otpAuth = true; // Flag to indicate this is OTP auth, not Clerk
          return next();
        } else {
          // Token expired, remove it
          await storage.deleteAuthToken(token);
        }
      }
    } catch (error) {
      // If database lookup fails, continue to Clerk auth
      console.error('Error validating OTP token:', error);
    }
  }
  // If no valid OTP token, continue to Clerk auth
  next();
};

// Middleware to require authentication (supports both Clerk and OTP)
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // First try OTP token validation
  await new Promise<void>((resolve) => {
    validateOTPToken(req, res, () => resolve());
  });
  
  // If OTP auth succeeded, continue
  if (req.otpAuth && req.auth?.userId) {
    return next();
  }
  
  // Otherwise, use Clerk authentication
  return requireAuth({
    // This middleware automatically:
    // 1. Verifies the Clerk session/JWT
    // 2. Attaches user data to req.auth
    // 3. Returns 401 if not authenticated
  })(req, res, next);
};

// Note: For routes that need optional auth, use clerkMiddleware() directly
// which attaches req.auth without blocking unauthenticated requests

/**
 * Synchronous helper function to check if a user is an admin
 * Use this when you need to check admin status without calling next()
 * 
 * @param req - Express request object
 * @returns Promise<boolean> - true if user is authenticated and is an admin, false otherwise
 */
export async function isUserAdmin(req: any): Promise<boolean> {
  // First ensure user is authenticated
  if (!req.auth?.userId) {
    return false;
  }

  const userId = req.auth.userId;
  let user;
  try {
    user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserForAdminCheck'
    );
  } catch (error: any) {
    // If database is unavailable or any error occurs, return false
    return false;
  }
  
  return !!(user && user.isAdmin);
}

// Admin middleware - checks if user is admin in our database
export const isAdmin: RequestHandler = async (req: any, res, next) => {
  // First ensure user is authenticated
  if (!req.auth?.userId) {
    return next(new UnauthorizedError("Authentication required"));
  }

  const userId = req.auth.userId;
  let user;
  try {
    user = await withDatabaseErrorHandling(
      () => storage.getUser(userId),
      'getUserForAdminCheck'
    );
  } catch (error: any) {
    // If database is unavailable, pass the error to error handler
    if (error instanceof ExternalServiceError && error.statusCode === 503) {
      return next(error);
    }
    // For other errors, deny access
    return next(new ForbiddenError("Admin access required"));
  }
  
  if (!user || !user.isAdmin) {
    return next(new ForbiddenError("Admin access required"));
  }

  next();
};

/**
 * Combined middleware: Admin auth + CSRF validation
 * Use this for state-changing admin operations (POST, PUT, DELETE, PATCH)
 * 
 * Usage:
 * app.post('/api/admin/endpoint', isAuthenticated, ...isAdminWithCsrf, async (req, res) => { ... });
 */
export const isAdminWithCsrf: RequestHandler[] = [isAdmin, validateCsrfToken];

// Helper to get user ID from request
// Throws UnauthorizedError if userId is not available (should not happen if isAuthenticated middleware is used)
export function getUserId(req: any): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new UnauthorizedError("User ID not found in request. Authentication may have failed.");
  }
  return userId;
}
