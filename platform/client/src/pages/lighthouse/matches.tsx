import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Calendar, MapPin, Home, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";
import type { LighthouseMatch, LighthouseProperty } from "@shared/schema";

export default function MatchesPage() {
  const { toast } = useToast();
  const { data: matches, isLoading } = useQuery<LighthouseMatch[]>({
    queryKey: ["/api/lighthouse/matches"],
  });

  // Fetch property data for each match
  const propertyQueries = useQueries({
    queries: (matches || []).map((match) => ({
      queryKey: ["/api/lighthouse/properties", match.propertyId] as const,
      enabled: !!match.propertyId && !!matches,
    })),
  });

  // Create a map of propertyId -> property for easy lookup
  const propertyMap = useMemo(() => {
    const map = new Map<string, LighthouseProperty | null>();
    propertyQueries.forEach((query, index) => {
      if (matches && matches[index]) {
        const property = query.data as LighthouseProperty | undefined;
        map.set(matches[index].propertyId, property || null);
      }
    });
    return map;
  }, [propertyQueries, matches]);

  const updateMatchMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => 
      apiRequest("PUT", `/api/lighthouse/matches/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/matches"] });
      toast({
        title: "Success",
        description: "Match updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update match",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
      rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
      completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    return colors[status] || colors.pending;
  };

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
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              My Matches
            </h1>
            <p className="text-muted-foreground">
              View and manage your housing matches
            </p>
          </div>
        </div>
      </div>

      {!matches || matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No matches yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Browse available properties to request a match
            </p>
            <Button onClick={() => window.location.href = "/apps/lighthouse/browse"} data-testid="button-browse">
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {matches.map((match) => {
            const property = propertyMap.get(match.propertyId);
            const isLoadingProperty = propertyQueries.find(
              (q, idx) => matches[idx]?.propertyId === match.propertyId
            )?.isLoading;

            return (
              <Card key={match.id} data-testid={`match-card-${match.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Match Request
                      </CardTitle>
                      {property && (
                        <div className="mt-2">
                          <Link 
                            href={`/apps/lighthouse/property/${property.id}`}
                            className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            data-testid={`link-property-${match.id}`}
                          >
                            {property.title}
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                      {isLoadingProperty && (
                        <div className="mt-2 text-sm text-muted-foreground">Loading property...</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(match.status)} data-testid={`badge-status-${match.id}`}>
                          {match.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                {match.seekerMessage && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Your Message</h4>
                    <p className="text-muted-foreground text-sm">{match.seekerMessage}</p>
                  </div>
                )}

                {match.hostResponse && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Host Response</h4>
                    <p className="text-muted-foreground text-sm">{match.hostResponse}</p>
                  </div>
                )}

                {match.proposedMoveInDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Proposed move-in: {new Date(match.proposedMoveInDate).toLocaleDateString()}</span>
                  </div>
                )}

                {match.actualMoveInDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Moved in: {new Date(match.actualMoveInDate).toLocaleDateString()}</span>
                  </div>
                )}

                {match.status === "pending" && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateMatchMutation.mutate({ id: match.id, status: "cancelled" })}
                      disabled={updateMatchMutation.isPending}
                      data-testid={`button-cancel-${match.id}`}
                    >
                      Cancel Request
                    </Button>
                  </div>
                )}

                {match.status === "accepted" && (
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Your match request has been accepted! The host will be in touch with you soon.
                    </p>
                  </div>
                )}

                {match.status === "rejected" && (
                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      This match request was not accepted. Continue browsing for other options.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
