import { useState } from "react";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Car, MapPin, Calendar, Users, Search, CheckCircle } from "lucide-react";
import type { TrusttransportRideRequest, TrusttransportProfile } from "@shared/schema";
import { format } from "date-fns";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function BrowseRequestsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profile } = useQuery<TrusttransportProfile | null>({
    queryKey: ["/api/trusttransport/profile"],
  });

  const { data: requests, isLoading } = useQuery<TrusttransportRideRequest[]>({
    queryKey: ["/api/trusttransport/ride-requests/open"],
    enabled: !!profile?.isDriver,
  });

  const claimMutation = useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      return apiRequest("POST", `/api/trusttransport/ride-requests/${requestId}/claim`, {});
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

  // Filter requests using fuzzy search
  const filteredRequests = useFuzzySearch(requests || [], searchTerm, {
    searchFields: ['pickupLocation', 'dropoffLocation', 'pickupCity', 'dropoffCity', 'riderMessage'],
    threshold: 0.3,
  });

  if (!profile?.isDriver) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">You must be a driver to browse ride requests.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/apps/trusttransport/profile")}
            data-testid="button-go-to-profile"
          >
            Update Profile
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Browse Ride Requests</h1>
            <p className="text-muted-foreground">
              Find ride requests you can fulfill
            </p>
          </div>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/trusttransport/announcements"
        queryKey="/api/trusttransport/announcements"
      />

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'} Available
          </h2>
        </div>

        {!requests || requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No ride requests available at the moment.</p>
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No requests match your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover-elevate h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">
                      {request.pickupCity} → {request.dropoffCity}
                    </CardTitle>
                    <Badge variant="default">Open</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'} needed
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{request.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{request.dropoffLocation}</span>
                    </div>
                  </div>

                  {/* Criteria */}
                  {(request.requestedCarType || request.requiresHeat || request.requiresAC || request.requiresWheelchairAccess || request.requiresChildSeat) && (
                    <div className="space-y-1 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {request.requestedCarType && (
                          <Badge variant="outline" className="text-xs">
                            {request.requestedCarType}
                          </Badge>
                        )}
                        {request.requiresHeat && (
                          <Badge variant="outline" className="text-xs">Heat</Badge>
                        )}
                        {request.requiresAC && (
                          <Badge variant="outline" className="text-xs">AC</Badge>
                        )}
                        {request.requiresWheelchairAccess && (
                          <Badge variant="outline" className="text-xs">Wheelchair Access</Badge>
                        )}
                        {request.requiresChildSeat && (
                          <Badge variant="outline" className="text-xs">Child Seat</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {request.riderMessage && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {request.riderMessage}
                    </CardDescription>
                  )}

                  <div className="flex gap-2 pt-2 mt-auto">
                    <Link href={`/apps/trusttransport/request/${request.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-${request.id}`}>
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => claimMutation.mutate({ requestId: request.id })}
                      disabled={claimMutation.isPending}
                      data-testid={`button-claim-${request.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Claim
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


