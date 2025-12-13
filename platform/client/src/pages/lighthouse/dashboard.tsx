import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Home, Building2, UserCheck, MapPin, Plus, Edit, Bell } from "lucide-react";
import type { LighthouseProfile, LighthouseProperty, LighthouseMatch } from "@shared/schema";
import { AnnouncementBanner } from "@/components/announcement-banner";

type LighthouseProfileWithUser = LighthouseProfile & {
  firstName?: string | null;
  userIsVerified?: boolean;
};

export default function LighthouseDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<LighthouseProfileWithUser | null>({
    queryKey: ["/api/lighthouse/profile"],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<LighthouseProperty[]>({
    queryKey: ["/api/lighthouse/properties"],
    enabled: !!profile,
  });

  const { data: matches, isLoading: matchesLoading } = useQuery<LighthouseMatch[]>({
    queryKey: ["/api/lighthouse/matches"],
    enabled: !!profile,
  });

  const { data: myProperties } = useQuery<LighthouseProperty[]>({
    queryKey: ["/api/lighthouse/my-properties"],
    enabled: profile?.profileType === "host",
  });

  if (profileLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no profile, show welcome screen with prompt to create one
  if (!profile) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Welcome to LightHouse</h1>
            <p className="text-muted-foreground">
              Safe, survivor-only housing connections
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your LightHouse profile to access the housing marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Housing Seekers</h3>
                  <p className="text-sm text-muted-foreground">
                    Find safe, affordable housing options in survivor-only communities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Housing Hosts</h3>
                  <p className="text-sm text-muted-foreground">
                    Offer rooms or community spaces to fellow survivors
                  </p>
                </div>
              </div>
            </div>
            <Link href="/apps/lighthouse/profile">
              <Button className="w-full" data-testid="button-create-profile">
                Create Your Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile exists - show dashboard based on profile type
  const isSeeker = profile.profileType === "seeker";
  const isHost = profile.profileType === "host";
  const pendingMatches = matches?.filter(m => m.status === "pending") || [];
  const activeProperties = properties?.filter(p => p.isActive) || [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">LightHouse</h1>
            <p className="text-muted-foreground">
              {isSeeker ? "Find your safe housing" : "Manage your housing offerings"}
            </p>
          </div>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/lighthouse/announcements"
        queryKey="/api/lighthouse/announcements"
      />

      {/* Profile Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              {profile.firstName || '—'} • {isSeeker ? "Housing Seeker" : "Housing Host"}
            </CardDescription>
          </div>
          <Link href="/apps/lighthouse/profile">
            <Button variant="outline" size="sm" data-testid="button-edit-profile">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{profile.bio || "No bio provided"}</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {isSeeker && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
                <Home className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-properties">
                  {activeProperties.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Housing options to browse
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Match Requests</CardTitle>
                <UserCheck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-matches">
                  {matches?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingMatches.length} pending
                </p>
              </CardContent>
            </Card>
          </>
        )}
        {isHost && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Properties</CardTitle>
                <Home className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-my-properties">
                  {myProperties?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active listings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Match Requests</CardTitle>
                <UserCheck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-match-requests">
                  {matches?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingMatches.length} pending
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {isSeeker && (
              <>
                <Link href="/apps/lighthouse/browse">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-browse-properties">
                    <MapPin className="w-4 h-4 mr-2" />
                    Browse Housing Options
                  </Button>
                </Link>
                <Link href="/apps/lighthouse/matches">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-view-matches">
                    <UserCheck className="w-4 h-4 mr-2" />
                    View My Match Requests
                  </Button>
                </Link>
              </>
            )}
            {isHost && (
              <>
                <Link href="/apps/lighthouse/property/new">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-add-property">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Property
                  </Button>
                </Link>
                <Link href="/apps/lighthouse/my-properties">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-manage-properties">
                    <Home className="w-4 h-4 mr-2" />
                    Manage My Properties
                  </Button>
                </Link>
                <Link href="/apps/lighthouse/matches">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-view-match-requests">
                    <UserCheck className="w-4 h-4 mr-2" />
                    View Match Requests
                  </Button>
                </Link>
                <Link href="/apps/lighthouse/browse">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-browse-all">
                    <MapPin className="w-4 h-4 mr-2" />
                    Browse All Properties
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {matches && matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Match Requests</CardTitle>
            <CardDescription>
              {isSeeker ? "Your recent housing requests" : "Recent requests for your properties"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.slice(0, 3).map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">Match Request</p>
                    <p className="text-xs text-muted-foreground">
                      Status: <Badge variant={match.status === "accepted" ? "default" : match.status === "rejected" ? "destructive" : "secondary"}>{match.status}</Badge>
                    </p>
                  </div>
                  <Link href="/apps/lighthouse/matches">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            {matches.length > 3 && (
              <Link href="/apps/lighthouse/matches">
                <Button variant="ghost" className="w-full mt-4">
                  View All Requests
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Announcements Section */}
      <div className="grid md:grid-cols-3 gap-4">
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
            <Link href="/apps/lighthouse/announcements">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-announcements">
                View Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
