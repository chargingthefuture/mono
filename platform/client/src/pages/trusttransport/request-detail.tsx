import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Car, MapPin, Calendar, ArrowLeft, Users, CheckCircle, X } from "lucide-react";
import type { TrusttransportRideRequest, TrusttransportProfile } from "@shared/schema";
import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [driverMessage, setDriverMessage] = useState("");

  const { data: request, isLoading } = useQuery<TrusttransportRideRequest>({
    queryKey: ["/api/trusttransport/ride-requests", id],
    queryFn: async () => {
      const res = await fetch(`/api/trusttransport/ride-requests/${id}`);
      if (!res.ok) throw new Error("Request not found");
      return await res.json();
    },
    enabled: !!id,
  });

  const { data: profile } = useQuery<TrusttransportProfile | null>({
    queryKey: ["/api/trusttransport/profile"],
  });

  const isRider = request?.riderId === user?.id;
  const isDriver = profile?.isDriver ?? false;
  const isExpired = request?.status === 'expired';
  const canClaim = isDriver && request?.status === 'open' && !isRider && !isExpired;

  const claimMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/trusttransport/ride-requests/${id}/claim`, {
        driverMessage: driverMessage || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/open"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/my-claimed"] });
      toast({
        title: "Success",
        description: "Ride request claimed successfully",
      });
      setLocation("/apps/trusttransport");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim ride request",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/trusttransport/ride-requests/${id}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/my-claimed"] });
      toast({
        title: "Success",
        description: "Ride request cancelled successfully",
      });
      setLocation("/apps/trusttransport");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel ride request",
        variant: "destructive",
      });
    },
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

  if (!request) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ride request not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/apps/trusttransport")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/apps/trusttransport")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-semibold">Ride Request Details</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={
              request.status === "claimed" ? "default" 
              : request.status === "cancelled" ? "destructive" 
              : request.status === "expired" ? "outline"
              : "secondary"
            }>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Pickup</Label>
            <p className="font-medium">{request.pickupCity}{request.pickupState && `, ${request.pickupState}`}</p>
            <p className="text-sm text-muted-foreground">{request.pickupLocation}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Dropoff</Label>
            <p className="font-medium">{request.dropoffCity}{request.dropoffState && `, ${request.dropoffState}`}</p>
            <p className="text-sm text-muted-foreground">{request.dropoffLocation}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Departure</Label>
              <p className="font-medium">{format(new Date(request.departureDateTime), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Seats Needed</Label>
              <p className="font-medium">{request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'}</p>
            </div>
          </div>

          {/* Criteria */}
          {(request.requestedCarType || request.requiresHeat || request.requiresAC || request.requiresWheelchairAccess || request.requiresChildSeat) && (
            <div>
              <Label className="text-muted-foreground">Requirements</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {request.requestedCarType && (
                  <Badge variant="outline">{request.requestedCarType}</Badge>
                )}
                {request.requiresHeat && (
                  <Badge variant="outline">Heat</Badge>
                )}
                {request.requiresAC && (
                  <Badge variant="outline">AC</Badge>
                )}
                {request.requiresWheelchairAccess && (
                  <Badge variant="outline">Wheelchair Access</Badge>
                )}
                {request.requiresChildSeat && (
                  <Badge variant="outline">Child Seat</Badge>
                )}
              </div>
            </div>
          )}

          {request.riderMessage && (
            <div>
              <Label className="text-muted-foreground">Additional Notes</Label>
              <p className="mt-1">{request.riderMessage}</p>
            </div>
          )}

          {request.driverMessage && (
            <div>
              <Label className="text-muted-foreground">Driver Message</Label>
              <p className="mt-1">{request.driverMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Notice */}
      {isExpired && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                This ride request has expired. The departure date has passed and it can no longer be claimed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claim Form (for drivers) */}
      {canClaim && (
        <Card>
          <CardHeader>
            <CardTitle>Claim This Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="driver-message">Message to Rider (Optional)</Label>
              <Textarea
                id="driver-message"
                value={driverMessage}
                onChange={(e) => setDriverMessage(e.target.value)}
                placeholder="Introduce yourself or add any notes..."
                rows={4}
                data-testid="textarea-driver-message"
              />
            </div>
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="w-full"
              data-testid="button-claim"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {claimMutation.isPending ? "Claiming..." : "Claim This Request"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel Button (for rider or driver who claimed) */}
      {(isRider || (request.driverId === profile?.id && profile?.isDriver)) && request.status !== 'cancelled' && request.status !== 'expired' && (
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="w-full"
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Request"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

