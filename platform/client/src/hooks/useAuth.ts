import { useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { User as DbUser } from "@shared/schema";
import { useEffect, useState, useRef } from "react";

/**
 * useAuth
 * - Returns the combined auth state from Clerk and the app DB user.
 * - Starts DB fetch only when Clerk is loaded and reports signed-in.
 */
export function useAuth() {
  const [clerkError, setClerkError] = useState<string | null>(null);
  const [clerkLoadTimeout, setClerkLoadTimeout] = useState(false);
  
  // Read Clerk hook values - hooks must be called unconditionally
  // If ClerkProvider isn't mounted or fails, these will throw or return undefined
  const clerkUserHook = useClerkUser();
  const clerkAuthHook = useClerkAuth();

  // clerkUserHook shape: { isLoaded, isSignedIn, user }
  // Use optional chaining to safely access properties
  // Check both hooks for isLoaded to ensure we catch the state correctly
  const clerkLoaded = Boolean(
    (clerkUserHook as any)?.isLoaded ?? 
    (clerkAuthHook as any)?.isLoaded ??
    false
  );
  const isSignedIn = Boolean(
    (clerkUserHook as any)?.isSignedIn ?? 
    (clerkAuthHook as any)?.isSignedIn ??
    false
  );
  const clerkUser = (clerkUserHook as any)?.user ?? (clerkAuthHook as any)?.user ?? null;

  // Detect Clerk loading errors and check configuration
  useEffect(() => {
    const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    
    // Check for missing or invalid key first
    if (!clerkKey || clerkKey === 'undefined' || clerkKey.trim() === '') {
      setClerkError("Missing or invalid Clerk publishable key. Please set VITE_CLERK_PUBLISHABLE_KEY environment variable.");
      return;
    }

    // Check if Clerk scripts are loaded
    if (typeof window !== 'undefined') {
      const checkScripts = () => {
        const scripts = Array.from(document.querySelectorAll('script')).filter(
          s => s.src && (s.src.includes('clerk') || s.src.includes('clerk.dev') || s.src.includes('clerk.com'))
        );
        return scripts.length > 0;
      };

      // Initial check
      if (!checkScripts()) {
        // Wait a bit for scripts to load
        const timer = setTimeout(() => {
          if (!checkScripts() && !clerkLoaded) {
            setClerkError("Clerk scripts failed to load. This may indicate a network issue, CORS problem, or invalid publishable key.");
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }

    // If Clerk is loaded, clear any errors and timeout
    if (clerkLoaded) {
      setClerkError(null);
      setClerkLoadTimeout(false);
    }
  }, [clerkLoaded]);

  // Timeout for Clerk loading - if Clerk doesn't load within 10 seconds, show error
  useEffect(() => {
    if (!clerkLoaded && typeof window !== 'undefined') {
      const timeout = setTimeout(() => {
        setClerkLoadTimeout(true);
        if (!clerkError) {
          setClerkError("Clerk is taking longer than expected to load. Please check your network connection and try refreshing the page.");
        }
      }, 10000); // 10 second timeout
      return () => clearTimeout(timeout);
    }
  }, [clerkLoaded, clerkError]);

  const { data: dbUser, isLoading: dbLoading, error: dbError, isFetching } = useQuery<DbUser | null>({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error: any) => {
      // Don't retry on 500 errors from sync failures - these need user action
      // Only retry on network errors or transient failures
      const errorMessage = error?.message || '';
      if (errorMessage.includes('500:') || 
          errorMessage.includes('Failed to sync user') ||
          errorMessage.includes('User sync failed')) {
        return false;
      }
      // Retry up to 2 times for other errors (network issues, etc.)
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff
    enabled: clerkLoaded && isSignedIn,
  });

  // Track null responses to avoid false positive error logs during sync
  const nullResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoggedNullErrorRef = useRef(false);

  // Log errors and null responses for debugging
  useEffect(() => {
    if (dbError) {
      console.error("Error fetching user from database:", dbError);
      // Reset null error tracking on actual error
      hasLoggedNullErrorRef.current = false;
      if (nullResponseTimeoutRef.current) {
        clearTimeout(nullResponseTimeoutRef.current);
        nullResponseTimeoutRef.current = null;
      }
      return;
    }

    // If user loads successfully, reset tracking
    // Handle both null and undefined (null from API, undefined from error)
    if (dbUser !== null && dbUser !== undefined) {
      hasLoggedNullErrorRef.current = false;
      if (nullResponseTimeoutRef.current) {
        clearTimeout(nullResponseTimeoutRef.current);
        nullResponseTimeoutRef.current = null;
      }
      return;
    }

    // Only log null response error if:
    // 1. Clerk is loaded and user is signed in
    // 2. Query has finished loading (not loading, not fetching)
    // 3. Result is null or undefined (but not due to an error)
    // 4. No error occurred (if error, it's handled above)
    // 5. We haven't already logged this error
    // 6. We wait a bit to allow for async sync to complete
    if (
      clerkLoaded &&
      isSignedIn &&
      !dbLoading &&
      !isFetching &&
      (dbUser === null || dbUser === undefined) &&
      !dbError &&
      !hasLoggedNullErrorRef.current &&
      !nullResponseTimeoutRef.current
    ) {
      // Wait 3 seconds before logging to allow for async sync operations
      // This prevents false positives when the endpoint is still syncing the user
      nullResponseTimeoutRef.current = setTimeout(() => {
        // Double-check conditions before logging (user might have loaded during the delay)
        // Use the latest values by checking the query state again
        if (clerkLoaded && isSignedIn && (dbUser === null || dbUser === undefined) && !dbError) {
          console.error("User authenticated with Clerk but database returned null. This may indicate a sync failure.", {
            clerkUserId: clerkUser?.id,
            clerkEmail: clerkUser?.primaryEmailAddress?.emailAddress,
            timestamp: new Date().toISOString(),
          });
          hasLoggedNullErrorRef.current = true;
        }
        nullResponseTimeoutRef.current = null;
      }, 3000); // 3 second delay to allow sync to complete
    }

    // Cleanup timeout on unmount or when conditions change
    return () => {
      if (nullResponseTimeoutRef.current) {
        clearTimeout(nullResponseTimeoutRef.current);
        nullResponseTimeoutRef.current = null;
      }
    };
  }, [dbError, dbUser, clerkLoaded, isSignedIn, dbLoading, isFetching, clerkUser]);

  // isLoading: true when:
  // - Clerk is not loaded yet (and not timed out), OR
  // - Clerk is loaded, user is signed in, and we're fetching DB user
  // If there's an error or timeout, don't keep loading forever
  const isLoading = (!clerkLoaded && !clerkLoadTimeout) || (clerkLoaded && isSignedIn && dbLoading);

  const isAuthenticated = isSignedIn && Boolean(clerkUser);
  // If user is authenticated with Clerk but dbUser is null, treat as sync failure
  const user = isAuthenticated && dbUser ? dbUser : null;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.isAdmin ?? false,
    // expose Clerk internals if needed by callers
    _clerk: {
      clerkLoaded,
      isSignedIn,
      clerkUser,
      clerkError,
    },
    // expose DB query error for debugging
    _dbError: dbError,
  } as const;
}
