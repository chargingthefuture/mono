import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PrivacyField } from "@/components/ui/privacy-field";
import { PaymentReminderBanner } from "@/components/payment-reminder-banner";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_TOAST_KEY = "payment-toast-shown";

export default function Home() {
  const { user, isLoading, _clerk, _dbError } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [toastShown, setToastShown] = useState(false);

  const { data: paymentStatus } = useQuery<{
    isDelinquent: boolean;
    missingMonths: string[];
    nextBillingDate: string | null;
    amountOwed: string;
    gracePeriodEnds?: string;
  }>({
    queryKey: ["/api/payments/status"],
    enabled: !!user,
  });

  // Show toast once when user first becomes delinquent
  useEffect(() => {
    if (!user || !paymentStatus || toastShown) return;

    const hasShownToast = localStorage.getItem(PAYMENT_TOAST_KEY);
    const missingMonthsKey = paymentStatus.missingMonths.join(",");
    const storedKey = localStorage.getItem(`${PAYMENT_TOAST_KEY}-months`);

    // Show toast if:
    // 1. User is delinquent
    // 2. Toast hasn't been shown for this set of missing months
    // 3. Grace period has ended (if it existed) or no grace period
    const gracePeriodEnded = paymentStatus.gracePeriodEnds
      ? new Date(paymentStatus.gracePeriodEnds) < new Date()
      : true;

    if (
      paymentStatus.isDelinquent &&
      gracePeriodEnded &&
      missingMonthsKey !== storedKey
    ) {
      const missingMonthText = paymentStatus.missingMonths.length === 1
        ? (() => {
            const [year, month] = paymentStatus.missingMonths[0].split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          })()
        : `${paymentStatus.missingMonths.length} months`;

      toast({
        title: "Payment not received",
        description: `Payment not received for ${missingMonthText}. Make payment or get help.`,
        duration: 5000,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            className="border-amber-300 text-amber-900"
            onClick={() => setLocation("/payments")}
          >
            Make payment
          </Button>
        ),
      });

      // Mark toast as shown for this set of missing months
      localStorage.setItem(PAYMENT_TOAST_KEY, "true");
      localStorage.setItem(`${PAYMENT_TOAST_KEY}-months`, missingMonthsKey);
      setToastShown(true);
    }
  }, [user, paymentStatus, toast, toastShown]);


  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
          {_clerk.clerkError && (
            <p className="text-sm text-destructive mt-2">{_clerk.clerkError}</p>
          )}
          {_dbError && (
            <p className="text-sm text-destructive mt-2">
              Error loading user: {_dbError instanceof Error ? _dbError.message : String(_dbError)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // If not authenticated, this shouldn't happen due to routing, but handle gracefully
  // Also handle case where user is authenticated with Clerk but database sync failed
  if (!user) {
    // Check if user is authenticated with Clerk but database returned null (sync failure)
    const isSyncFailure = _clerk.isSignedIn && !_dbError && !isLoading;
    
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isSyncFailure 
              ? "Your account is being set up. This may take a moment. Please wait a few seconds and refresh the page."
              : "Unable to load user data. Please try refreshing the page."}
          </p>
          {_dbError && (
            <p className="text-sm text-destructive mt-2">
              Error: {_dbError instanceof Error ? _dbError.message : String(_dbError)}
            </p>
          )}
          {isSyncFailure && (
            <div className="mt-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                data-testid="button-refresh-page"
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getSubscriptionStatus = () => {
    const status = user?.subscriptionStatus || 'active';
    if (status === 'active') {
      return { label: 'Active', variant: 'default' as const };
    } else if (status === 'overdue') {
      return { label: 'Payment Overdue', variant: 'destructive' as const };
    }
    return { label: 'Inactive', variant: 'secondary' as const };
  };

  const statusInfo = getSubscriptionStatus();

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Your psyop-free space for accessing essential support services
        </p>
      </div>

      {/* Payment reminder banner */}
      <PaymentReminderBanner />

      {/* Profile overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-semibold" data-testid="text-user-name">
                  {user?.firstName || ''}
                </h3>
                <div className="text-sm text-muted-foreground">
                  <PrivacyField 
                    value={user?.email || ""} 
                    type="email"
                    testId="text-user-email"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusInfo.variant} data-testid="badge-subscription-status">
                  {statusInfo.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ${user?.pricingTier}/month
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Services</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse available support services and resources
            </p>
            <Link href="/services">
              <Button variant="outline" className="w-full" data-testid="button-browse-services">
                Browse Services
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View your payment history and subscription details
            </p>
            <Link href="/payments">
              <Button variant="outline" className="w-full" data-testid="button-view-payments">
                View Payments
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Subscription</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your forever rate: ${user?.pricingTier}/month
            </p>
            <Badge variant="secondary" className="w-full justify-center">
              Pricing Locked
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Account Management */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg">Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your entire account from all mini-apps. This action cannot be undone.
          </p>
          <Link href="/account/delete">
            <Button variant="destructive" className="w-full" data-testid="button-delete-account">
              Delete My Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
