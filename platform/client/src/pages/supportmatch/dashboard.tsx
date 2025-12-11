import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Settings, Bell, MessageSquare, UserCheck, ShieldAlert } from "lucide-react";
import type { SupportMatchProfile, Partnership } from "@shared/schema";
import { format } from "date-fns";
import { AnnouncementBanner } from "@/components/announcement-banner";

export default function SupportMatchDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<SupportMatchProfile | null>({
    queryKey: ["/api/supportmatch/profile"],
  });

  const { data: activePartnership, isLoading: partnershipLoading } = useQuery<Partnership | null>({
    queryKey: ["/api/supportmatch/partnership/active"],
    enabled: !!profile,
  });

  if (profileLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Welcome to SupportMatch</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Connect with accountability partners for your recovery journey
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm sm:text-base">
              To use SupportMatch, you'll need to create your profile first. This helps us match you with
              a compatible accountability partner.
            </p>
            <Link href="/apps/supportmatch/profile">
              <Button className="w-full" data-testid="button-create-profile">
                Create Your Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPartnershipStatus = () => {
    if (partnershipLoading) {
      return { label: 'Loading...', variant: 'secondary' as const };
    }
    if (!activePartnership) {
      return { label: 'No Active Partnership', variant: 'secondary' as const };
    }
    return { label: 'Active Partnership', variant: 'default' as const };
  };

  const statusInfo = getPartnershipStatus();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">
          SupportMatch Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {profile.nickname ? `Hey ${profile.nickname}!` : 'Your accountability partner connection'}
        </p>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/supportmatch/announcements"
        queryKey="/api/supportmatch/announcements"
      />

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Partnership Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Current Status</p>
                <Badge variant={statusInfo.variant} data-testid="badge-partnership-status" className="text-xs">
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            
            {activePartnership && (
              <Link href="/apps/supportmatch/partnership">
                <Button data-testid="button-view-partnership" size="sm" className="text-xs sm:text-sm">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  View Partnership
                </Button>
              </Link>
            )}
          </div>

          {activePartnership && (
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Partner:</span> {(activePartnership as any).partnerNickname || 'Loading...'}
              </p>
              <p>
                <span className="font-medium text-foreground">Started:</span> {format(new Date(activePartnership.startDate), 'MMM d, yyyy')}
              </p>
              {activePartnership.endDate && (
                <p>
                  <span className="font-medium text-foreground">Ends:</span> {format(new Date(activePartnership.endDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          )}
          
          {!activePartnership && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              You're currently not in an active partnership. Your admin will match you with a partner during the next monthly cycle.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Profile Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Update your preferences and gender settings
            </p>
            <Link href="/apps/supportmatch/profile">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-manage-profile">
                Manage Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Safety & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Manage blocked users and privacy settings
            </p>
            <Link href="/apps/supportmatch/safety">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-manage-safety">
                Manage Safety
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              View platform updates and notifications
            </p>
            <Link href="/apps/supportmatch/announcements">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-announcements">
                View Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              View your past partnerships and connection history
            </p>
            <Link href="/apps/supportmatch/history">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-history">
                View History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
