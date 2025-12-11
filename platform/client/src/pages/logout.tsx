import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

export default function LogoutPage() {
  const clerk = useClerk();

  useEffect(() => {
    // Automatically sign out when page loads
    const performLogout = async () => {
      try {
        // Clear any cached query data
        if (typeof window !== 'undefined') {
          // Clear localStorage if needed
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Sign out via Clerk - this will clear Clerk cookies and redirect
        await clerk.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
        // Fallback: redirect to sign-in page
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const isProduction = hostname.includes('app.chargingthefuture.com');
        const isStaging = hostname.includes('the-comic.com') || hostname.includes('staging');
        
        let signInUrl: string;
        if (isProduction) {
          signInUrl = 'https://accounts.app.chargingthefuture.com/sign-in';
        } else if (isStaging) {
          const stagingCustomDomain = import.meta.env.VITE_CLERK_STAGING_DOMAIN;
          if (stagingCustomDomain) {
            signInUrl = `https://${stagingCustomDomain}/sign-in`;
          } else {
            signInUrl = `${window.location.origin}/sign-in`;
          }
        } else {
          signInUrl = 'https://sure-oarfish-90.accounts.dev/sign-in';
        }
        window.location.href = signInUrl;
      }
    };

    performLogout();
  }, [clerk]);

  // Show loading message while logout is in progress
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Signing out...</h1>
        <p className="text-muted-foreground">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}













