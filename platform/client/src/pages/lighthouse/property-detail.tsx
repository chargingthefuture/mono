import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Home, MapPin, BedDouble, Bath, DollarSign, Calendar, CheckCircle2, ExternalLink } from "lucide-react";
import type { LighthouseProperty, LighthouseProfile, LighthouseMatch } from "@shared/schema";
import { useState } from "react";
import { useExternalLink } from "@/hooks/useExternalLink";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [message, setMessage] = useState("");

  const { data: property, isLoading: propertyLoading } = useQuery<LighthouseProperty>({
    queryKey: ["/api/lighthouse/properties", id],
  });

  const { data: profile } = useQuery<LighthouseProfile | null>({
    queryKey: ["/api/lighthouse/profile"],
  });

  const { data: matches } = useQuery<LighthouseMatch[]>({
    queryKey: ["/api/lighthouse/matches"],
    enabled: !!profile && profile.profileType === "seeker",
  });

  // Check if there's already a match for this property (excluding cancelled)
  const existingMatch = matches?.find(
    (match) => match.propertyId === id && match.status !== "cancelled"
  );

  const requestMatchMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/lighthouse/matches", {
      propertyId: id,
      message,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/matches"] });
      toast({
        title: "Success",
        description: "Match request sent successfully",
      });
      setLocation("/apps/lighthouse/matches");
    },
    onError: (error: any) => {
      // Handle 409 error specifically
      // Error format from apiRequest is "409: {...}" or error.message contains "already requested"
      const errorMessage = error.message || "";
      const is409Error = errorMessage.startsWith("409:") || errorMessage.includes("already requested");
      
      if (is409Error) {
        toast({
          title: "Already Requested",
          description: "You have already messaged this host. Check your matches to view the conversation.",
          variant: "default",
        });
        // Invalidate matches to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/matches"] });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to request match",
          variant: "destructive",
        });
      }
    },
  });

  if (propertyLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 md:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Property not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      room: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      apartment: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      community: "bg-green-500/10 text-green-700 dark:text-green-400",
      rv_camper: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    };
    return colors[type] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  };

  const formatPropertyType = (type: string) => {
    const labels: Record<string, string> = {
      room: "Private Room",
      apartment: "Full Apartment",
      community: "Community Housing",
      rv_camper: "RV/Camper",
    };
    return labels[type] || type;
  };

  const canRequestMatch = profile && profile.profileType === "seeker";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => setLocation("/apps/lighthouse/browse")} data-testid="button-back">
        ← Back to Browse
      </Button>

      {property.photos && property.photos.length > 0 && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img 
            src={property.photos[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl md:text-3xl">{property.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getPropertyTypeColor(property.propertyType)}>
                  {formatPropertyType(property.propertyType)}
                </Badge>
                {property.isActive && (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                )}
              </div>
            </div>
            {property.monthlyRent && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-semibold text-primary">
                  <DollarSign className="w-6 h-6" />
                  {property.monthlyRent}
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
            </div>
            {property.bedrooms && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <BedDouble className="w-5 h-5" />
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bath className="w-5 h-5" />
                <span>{property.bathrooms} {property.bathrooms === "1" ? 'bathroom' : 'bathrooms'}</span>
              </div>
            )}
            {property.availableFrom && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>Available from {new Date(property.availableFrom).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <Badge key={idx} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {property.housingRules && (
            <div>
              <h3 className="font-semibold mb-2">Housing Rules</h3>
              <p className="text-muted-foreground">{property.housingRules}</p>
            </div>
          )}

          {property.airbnbProfileUrl && (
            <div>
              <h3 className="font-semibold mb-2">Host Verification</h3>
              <Button
                variant="outline"
                onClick={() => openExternal(property.airbnbProfileUrl!)}
                className="text-primary"
                data-testid="button-airbnb-profile"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Airbnb Host Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ExternalLinkDialog />

      {canRequestMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Request to Connect</CardTitle>
            <CardDescription>
              {existingMatch
                ? "You have already messaged this host"
                : "Send a message to the host to request this housing option"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingMatch && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You already messaged this host. Check your matches to view the conversation and any responses.
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setLocation("/apps/lighthouse/matches")}
                  data-testid="button-view-matches"
                >
                  View My Matches
                </Button>
              </div>
            )}
            <div>
              <Label htmlFor="message">Message to Host (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  existingMatch
                    ? "You have already messaged this host..."
                    : "Introduce yourself and explain why you're interested in this housing option..."
                }
                rows={4}
                disabled={!!existingMatch}
                className={existingMatch ? "bg-muted cursor-not-allowed" : ""}
                data-testid="input-message"
              />
            </div>
            <Button 
              onClick={() => requestMatchMutation.mutate()} 
              disabled={requestMatchMutation.isPending || !!existingMatch}
              data-testid="button-request-match"
            >
              {requestMatchMutation.isPending ? "Sending..." : "Request Match"}
            </Button>
          </CardContent>
        </Card>
      )}

      {!profile && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Create a profile to request this housing option
            </p>
            <Button onClick={() => setLocation("/apps/lighthouse/profile")} data-testid="button-create-profile">
              Create Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {profile && profile.profileType === "host" && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You are registered as a host. Switch to a seeker profile to request housing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
