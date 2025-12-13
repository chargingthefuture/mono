import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Car, UserCheck, MapPin, Plus, Edit, Bell, Calendar, Users } from "lucide-react";
import type { TrusttransportProfile, TrusttransportRideRequest } from "@shared/schema";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function TrustTransportDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("driver");

  const { data: profile, isLoading: profileLoading } = useQuery<(TrusttransportProfile & { firstName?: string | null }) | null>({
    queryKey: ["/api/trusttransport/profile"],
  });

  // Open requests (for drivers to see)
  const { data: openRequests, isLoading: openRequestsLoading } = useQuery<TrusttransportRideRequest[]>({
    queryKey: ["/api/trusttransport/ride-requests/open"],
    enabled: !!profile?.isDriver,
  });

  // User's requests as a rider
  const { data: myRequests } = useQuery<TrusttransportRideRequest[]>({
    queryKey: ["/api/trusttransport/ride-requests/my-requests"],
    enabled: !!profile?.isRider,
  });

  // Requests claimed by user as a driver
  const { data: myClaimedRequests } = useQuery<TrusttransportRideRequest[]>({
    queryKey: ["/api/trusttransport/ride-requests/my-claimed"],
    enabled: !!profile?.isDriver,
  });

  const claimMutation = useMutation({
    mutationFn: async ({ requestId, driverMessage }: { requestId: string; driverMessage?: string }) => {
      return apiRequest("POST", `/api/trusttransport/ride-requests/${requestId}/claim`, {
        driverMessage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/open"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/my-claimed"] });
      toast({
        title: "Success",
        description: "Ride request claimed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim ride request",
        variant: "destructive",
      });
    },
  });

  // Calculate role flags with safe defaults (before early returns to maintain hook order)
  const isDriver = profile?.isDriver ?? false;
  const isRider = profile?.isRider ?? true;
  const showTabs = isDriver && isRider;

  // Set initial tab based on available roles
  // This hook must be called before any early returns to comply with Rules of Hooks
  useEffect(() => {
    if (!showTabs) {
      if (isDriver) setActiveTab("driver");
      if (isRider) setActiveTab("rider");
    }
  }, [showTabs, isDriver, isRider]);

  if (profileLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no profile, show welcome screen
  if (!profile) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Welcome to TrustTransport</h1>
            <p className="text-muted-foreground">
              Safe ridesharing for survivors
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your TrustTransport profile to request rides or offer transportation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Drivers</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse ride requests and claim ones you can fulfill
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Riders</h3>
                  <p className="text-sm text-muted-foreground">
                    Create ride requests with your specific needs and criteria
                  </p>
                </div>
              </div>
            </div>
            <Link href="/apps/trusttransport/profile">
              <Button className="w-full" data-testid="button-create-profile">
                Create Your Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabel = [];
  if (isDriver) roleLabel.push("Driver");
  if (isRider) roleLabel.push("Rider");

  const openRequestsList = openRequests?.filter(r => r.status === 'open') || [];
  const myOpenRequests = myRequests?.filter(r => r.status === 'open') || [];
  const myClaimedRequestsList = myClaimedRequests?.filter(r => r.status === 'claimed') || [];

  const DriverView = () => (
    <div className="space-y-6">
      {/* Stats Grid for Driver */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-open-requests">
              {openRequestsList.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests available to claim
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Claims</CardTitle>
            <Car className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-claimed-requests">
              {myClaimedRequestsList.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests you've claimed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Driver */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <Link href="/apps/trusttransport/browse">
              <Button variant="outline" className="w-full justify-start" data-testid="button-browse-requests">
                <MapPin className="w-4 h-4 mr-2" />
                Browse Open Requests
              </Button>
            </Link>
            <Link href="/apps/trusttransport/my-claimed">
              <Button variant="outline" className="w-full justify-start" data-testid="button-my-claimed">
                <Car className="w-4 h-4 mr-2" />
                View My Claims
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Open Requests */}
      {openRequestsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Open Requests</CardTitle>
            <CardDescription>
              Ride requests looking for drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openRequestsList.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{request.pickupCity} → {request.dropoffCity}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                      {" "}• {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'}
                    </p>
                  </div>
                  <Link href={`/apps/trusttransport/request/${request.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            {openRequestsList.length > 3 && (
              <Link href="/apps/trusttransport/browse">
                <Button variant="ghost" className="w-full mt-4">
                  View All Open Requests
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {openRequestsList.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Open Requests</CardTitle>
            <CardDescription>
              There are currently no ride requests available. Check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );

  const RiderView = () => (
    <div className="space-y-6">
      {/* Stats Grid for Rider */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Requests</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-my-requests">
              {myRequests?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {myOpenRequests.length} open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Rider */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <Link href="/apps/trusttransport/request/new">
              <Button variant="default" className="w-full justify-start" data-testid="button-create-request">
                <Plus className="w-4 h-4 mr-2" />
                Create Ride Request
              </Button>
            </Link>
            <Link href="/apps/trusttransport/my-requests">
              <Button variant="outline" className="w-full justify-start" data-testid="button-my-requests">
                <UserCheck className="w-4 h-4 mr-2" />
                View My Requests
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests for Rider */}
      {myRequests && myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Ride Requests</CardTitle>
            <CardDescription>
              Your ride requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{request.pickupCity} → {request.dropoffCity}</p>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant={request.status === "claimed" ? "default" : request.status === "cancelled" ? "destructive" : "secondary"}>
                        {request.status}
                      </Badge>
                      {" "}• {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                      {" "}• {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'}
                    </p>
                  </div>
                  <Link href={`/apps/trusttransport/request/${request.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            {myRequests.length > 3 && (
              <Link href="/apps/trusttransport/my-requests">
                <Button variant="ghost" className="w-full mt-4">
                  View All Requests
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State for No Requests */}
      {(!myRequests || myRequests.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>No Ride Requests</CardTitle>
            <CardDescription>
              Create your first ride request to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/apps/trusttransport/request/new">
              <Button variant="outline" className="w-full" data-testid="button-create-first-request">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">TrustTransport</h1>
            <p className="text-muted-foreground">
              {showTabs ? "Manage your rides and requests" : (isDriver ? "Browse and claim ride requests" : "Create and manage your ride requests")}
            </p>
          </div>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/trusttransport/announcements"
        queryKey="/api/trusttransport/announcements"
      />

      {/* Profile Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              {profile.firstName || '—'} • {roleLabel.join(" & ")}
            </CardDescription>
          </div>
          <Link href="/apps/trusttransport/profile">
            <Button variant="outline" size="sm" data-testid="button-edit-profile">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Location:</span> {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</p>
            {isDriver && profile.vehicleMake && profile.vehicleModel && (
              <p><span className="font-medium">Vehicle:</span> {profile.vehicleYear ? `${profile.vehicleYear} ` : ''}{profile.vehicleMake} {profile.vehicleModel}</p>
            )}
            {profile.bio && (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Driver/Rider Views */}
      {showTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="driver" data-testid="tab-driver">
              <Car className="w-4 h-4 mr-2" />
              Driver
            </TabsTrigger>
            <TabsTrigger value="rider" data-testid="tab-rider">
              <UserCheck className="w-4 h-4 mr-2" />
              Rider
            </TabsTrigger>
          </TabsList>
          <TabsContent value="driver" className="mt-6">
            <DriverView />
          </TabsContent>
          <TabsContent value="rider" className="mt-6">
            <RiderView />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {isDriver && <DriverView />}
          {isRider && <RiderView />}
        </>
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
            <Link href="/apps/trusttransport/announcements">
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
