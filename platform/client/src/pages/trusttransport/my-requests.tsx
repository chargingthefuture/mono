import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { UserCheck, MapPin, Calendar, ArrowLeft } from "lucide-react";
import type { TrusttransportRideRequest } from "@shared/schema";
import { format } from "date-fns";

export default function MyRequestsPage() {
  const { data: requests, isLoading } = useQuery<TrusttransportRideRequest[]>({
    queryKey: ["/api/trusttransport/ride-requests/my-requests"],
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const openRequests = requests?.filter(r => r.status === 'open') || [];
  const claimedRequests = requests?.filter(r => r.status === 'claimed') || [];
  const completedRequests = requests?.filter(r => r.status === 'completed') || [];
  const cancelledRequests = requests?.filter(r => r.status === 'cancelled') || [];
  const expiredRequests = requests?.filter(r => r.status === 'expired') || [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/trusttransport">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">My Requests</h1>
          <p className="text-muted-foreground">
            View and manage your ride requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimedRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {(!requests || requests.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">You haven't created any ride requests yet.</p>
            <Link href="/apps/trusttransport/request/new">
              <Button data-testid="button-create-request">
                Create Your First Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {openRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Open Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openRequests.map((request) => (
                    <Link key={request.id} href={`/apps/trusttransport/request/${request.id}`}>
                      <Card className="hover-elevate">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{request.pickupCity} → {request.dropoffCity}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                                {" "}• {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'}
                              </p>
                            </div>
                            <Badge variant="secondary">Open</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {claimedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Claimed Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {claimedRequests.map((request) => (
                    <Link key={request.id} href={`/apps/trusttransport/request/${request.id}`}>
                      <Card className="hover-elevate">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{request.pickupCity} → {request.dropoffCity}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                                {" "}• {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'}
                              </p>
                              {request.driverMessage && (
                                <p className="text-sm text-muted-foreground mt-1 italic">
                                  Driver: {request.driverMessage}
                                </p>
                              )}
                            </div>
                            <Badge variant="default">Claimed</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {expiredRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expired Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiredRequests.map((request) => (
                    <Link key={request.id} href={`/apps/trusttransport/request/${request.id}`}>
                      <Card className="hover-elevate">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{request.pickupCity} → {request.dropoffCity}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                                {" "}• {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'}
                              </p>
                            </div>
                            <Badge variant="outline">Expired</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(completedRequests.length > 0 || cancelledRequests.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...completedRequests, ...cancelledRequests].map((request) => (
                    <Link key={request.id} href={`/apps/trusttransport/request/${request.id}`}>
                      <Card className="hover-elevate">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{request.pickupCity} → {request.dropoffCity}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                            <Badge variant={request.status === "completed" ? "default" : "destructive"}>
                              {request.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
