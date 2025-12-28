import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { MapPin, Clock, Share2, ArrowRight, Package, Copy, Check, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useExternalLink } from "@/hooks/useExternalLink";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";

type PublicRequest = {
  id: string;
  description: string;
  expiresAt: string;
  createdAt: string;
  creatorProfile: {
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  creator: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    isVerified: boolean;
  } | null;
};

export default function PublicSocketRelayList() {
  const [location, setLocation] = useLocation();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { toast } = useToast();
  const { handleError } = useErrorHandler({ showToast: false }); // UI handles error display
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Extract user query parameter from URL
  const urlParams = new URLSearchParams(location.split("?")[1]);
  const userId = urlParams.get("user") || undefined;
  
  const publicSocketRelayUrl = userId 
    ? `${window.location.origin}/apps/socketrelay/public?user=${encodeURIComponent(userId)}`
    : `${window.location.origin}/apps/socketrelay/public`;
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: userId ? "Wish list link copied to clipboard" : "Public SocketRelay link copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      handleError(error as Error, "Copy Error");
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  // Build API URL with optional user parameter
  const apiUrl = userId 
    ? `/api/socketrelay/public?user=${encodeURIComponent(userId)}`
    : "/api/socketrelay/public";

  const { data: requests = [], isLoading, error } = useQuery<PublicRequest[]>({
    queryKey: [apiUrl],
    queryFn: async () => {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(errorText || `Failed to load requests: ${res.status} ${res.statusText}`);
        handleError(error, "SocketRelay Error");
        throw error;
      }
      return await res.json();
    }
  });

  // Get the first request's creator info for wish list header (all requests will be from same user when filtered)
  const wishListCreator = requests.length > 0 && requests[0]?.creator 
    ? (() => {
        const creator = requests[0].creator;
        if (creator.firstName) {
          return creator.firstName;
        }
        if (creator.displayName) {
          const [firstToken] = creator.displayName.split(" ");
          return firstToken || "Someone";
        }
        return "Someone";
      })()
    : null;

  // Log errors to Sentry when they occur
  useEffect(() => {
    if (error) {
      handleError(error, "SocketRelay Error");
    }
  }, [error, handleError]);

  const handleSignUp = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground">Loading active requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-16">
            <p className="text-destructive">Error loading requests</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6 pt-8 sm:pt-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {userId ? `${wishListCreator ? wishListCreator + "'s" : "Wish List"}` : "SocketRelay"}
            </h1>
          </div>
          {userId ? (
            <>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                {wishListCreator ? `${wishListCreator}'s public requests` : "Public requests from this user"}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Help fulfill these requests by connecting with the requester
              </p>
            </>
          ) : (
            <>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Find what you need or help others get the goods and services they request
              </p>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our community of survivors supporting each other through mutual aid and resource sharing
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  onClick={handleSignUp}
                  size="lg"
                  className="text-base sm:text-lg px-8"
                  data-testid="button-sign-up"
                >
                  Sign Up to Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Active Requests Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                {userId ? "Wish List Requests" : "Active Requests"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {requests.length} {requests.length === 1 ? "request" : "requests"} {userId ? "in this wish list" : "currently active"}
              </p>
            </div>
          </div>
          
          {/* Public SocketRelay Link / Wish List Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {userId ? "Wish List Link" : "Public SocketRelay Link"}
            </label>
            <p className="text-sm text-muted-foreground">
              {userId 
                ? "Share this link to show this user's public requests."
                : "Share this link to view all public SocketRelay requests."}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
                {publicSocketRelayUrl}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyUrl(publicSocketRelayUrl)}
                className="flex-shrink-0"
                data-testid={userId ? "button-copy-wish-list" : "button-copy-public-socketrelay"}
                aria-label={userId ? "Copy wish list link" : "Copy public SocketRelay link"}
              >
                {copiedUrl === publicSocketRelayUrl ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternal(publicSocketRelayUrl)}
                className="flex-shrink-0"
                data-testid={userId ? "button-open-wish-list" : "button-open-public-socketrelay"}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Open
              </Button>
            </div>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 sm:py-16">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg sm:text-xl font-medium mb-2">
                    {userId ? "No public requests in this wish list" : "No active requests yet"}
                  </p>
                  <p className="text-muted-foreground mb-6">
                    {userId 
                      ? "This user hasn't created any public requests yet."
                      : "Be the first to create a request and start connecting with others"}
                  </p>
                  {!userId && (
                    <Button onClick={handleSignUp} data-testid="button-sign-up-empty">
                      Sign Up to Create a Request
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {requests.map((request) => {
                const shareUrl = `${window.location.origin}/apps/socketrelay/public/${request.id}`;
                // Privacy: public SocketRelay list should show first name only
                const creatorFirstName = (() => {
                  if (!request.creator) return "Anonymous";
                  const first = request.creator.firstName?.trim();
                  if (first) return first;

                  const displayName = request.creator.displayName?.trim();
                  if (displayName) {
                    const [firstToken] = displayName.split(" ");
                    if (firstToken) return firstToken;
                  }

                  return "Anonymous";
                })();

                return (
                  <Card key={request.id} className="flex flex-col hover:shadow-lg transition-shadow" data-testid={`card-request-${request.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">
                          {request.description}
                        </CardTitle>
                        <Badge variant="default" className="flex-shrink-0 gap-1">
                          <Share2 className="w-3 h-3" />
                          Public
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        {request.creator && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Requested by</span>
                            <span className="text-sm font-medium">{creatorFirstName}</span>
                            {request.creator.isVerified && (
                              <VerifiedBadge isVerified={true} testId={`badge-verified-${request.id}`} />
                            )}
                          </div>
                        )}

                        {request.creatorProfile && (request.creatorProfile.city || request.creatorProfile.state || request.creatorProfile.country) && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {[request.creatorProfile.city, request.creatorProfile.state, request.creatorProfile.country]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>Expires {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => openExternal(shareUrl)}
                          data-testid={`button-view-request-${request.id}`}
                        >
                          View Request
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        {requests.length > 0 && !userId && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold">Join Our Community</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Sign up to create your own requests, help fulfill others' needs, and connect with a supportive community
                </p>
                <Button
                  onClick={handleSignUp}
                  size="lg"
                  className="mt-4"
                  data-testid="button-sign-up-bottom"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <ExternalLinkDialog />
      </div>
    </div>
  );
}

