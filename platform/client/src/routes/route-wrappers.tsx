/**
 * Route wrapper components for authentication and authorization
 */

import React from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TermsAcceptanceDialog, useTermsAcceptanceCheck } from "@/components/terms-acceptance-dialog";
import { PendingApproval } from "@/components/pending-approval";
import Home from "@/pages/home";
import Landing from "@/pages/landing";

// Protected route wrapper that redirects unauthenticated users
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { _clerk, user, isLoading } = useAuth();
  const needsApproval = user && !user.isApproved && !user.isAdmin;
  const needsTermsAcceptance = useTermsAcceptanceCheck();
  const [termsDialogOpen, setTermsDialogOpen] = React.useState(false);

  // Show terms acceptance dialog if needed (block access until accepted)
  // MUST be called before any early returns to follow React hooks rules
  React.useEffect(() => {
    if (!isLoading && user && needsTermsAcceptance) {
      setTermsDialogOpen(true);
    }
  }, [isLoading, user, needsTermsAcceptance]);

  // If Clerk is still loading, show loading indicator
  if (!_clerk.clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not signed in, redirect to landing
  if (!_clerk.isSignedIn) {
    return <Redirect to="/" />;
  }

  // If needs approval, show waiting message
  if (needsApproval) {
    return <PendingApproval />;
  }

  // Block access if terms need to be accepted
  if (needsTermsAcceptance && !isLoading && user) {
    return (
      <>
        <TermsAcceptanceDialog 
          open={termsDialogOpen} 
          onOpenChange={setTermsDialogOpen}
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Terms Acceptance Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please accept the terms and conditions to continue using the platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

// Conditional route wrapper for Chyme rooms
// Allows public access for public rooms, requires auth for private rooms
export function ChymeRoomRoute({ children }: { children: React.ReactNode }) {
  const { _clerk, user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Extract roomId from URL
  const roomIdMatch = location.match(/\/apps\/chyme\/room\/([^/]+)/);
  const roomId = roomIdMatch ? roomIdMatch[1] : null;
  
  // Fetch room data to check if it's public
  const { data: room } = useQuery<{ roomType: "public" | "private" }>({
    queryKey: ["/api/chyme/rooms", roomId],
    enabled: !!roomId,
    retry: false,
  });
  
  // If Clerk is still loading, show loading indicator
  if (!_clerk.clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If room is public, allow unauthenticated access
  if (room?.roomType === "public") {
    return <>{children}</>;
  }
  
  // For private rooms or if room data not loaded yet, require authentication
  if (!_clerk.isSignedIn) {
    return <Redirect to="/" />;
  }
  
  // If needs approval, show waiting message
  const needsApproval = user && !user.isApproved && !user.isAdmin;
  if (needsApproval) {
    return <PendingApproval />;
  }
  
  return <>{children}</>;
}

// Admin route wrapper that requires admin privileges
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { _clerk, user, isLoading, isAdmin } = useAuth();

  // First check authentication (ProtectedRoute logic)
  if (!_clerk.clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!_clerk.isSignedIn) {
    return <Redirect to="/" />;
  }

  // Wait for user data to load before checking admin status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check admin status - redirect non-admin users
  if (!isAdmin || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You do not have permission to access this page. Admin privileges are required.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Landing/root route handler
export function RootRoute() {
  const { _clerk, user, isLoading } = useAuth();
  const needsApproval = user && !user.isApproved && !user.isAdmin;
  const needsTermsAcceptance = useTermsAcceptanceCheck();
  const [termsDialogOpen, setTermsDialogOpen] = React.useState(false);

  // Show terms acceptance dialog if needed (block access until accepted)
  // MUST be called before any early returns to follow React hooks rules
  React.useEffect(() => {
    if (!isLoading && user && needsTermsAcceptance) {
      setTermsDialogOpen(true);
    }
  }, [isLoading, user, needsTermsAcceptance]);

  // If Clerk is still loading, show loading indicator
  if (!_clerk.clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If signed in, wait for DB user to load before redirecting
  if (_clerk.isSignedIn) {
    // Still loading DB user, show loading indicator
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    
    // If needs approval, show waiting message
    if (needsApproval) {
      return <PendingApproval />;
    }

    // Block access if terms need to be accepted
    if (needsTermsAcceptance && !isLoading && user) {
      return (
        <>
          <TermsAcceptanceDialog 
            open={termsDialogOpen} 
            onOpenChange={setTermsDialogOpen}
          />
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Terms Acceptance Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please accept the terms and conditions to continue using the platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
    
    // Signed in and approved - show home dashboard
    // Don't redirect to avoid infinite loop, just render Home
    return <Home />;
  }

  // Show landing page for unauthenticated users
  return <Landing />;
}

