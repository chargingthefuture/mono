import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { MapPin, Clock, Copy, Check, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useExternalLink } from "@/hooks/useExternalLink";

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

export default function PublicSocketRelayRequest() {
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  
  const publicSocketRelayUrl = `${window.location.origin}/apps/socketrelay/public`;
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Public SocketRelay link copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };
  const { data: request, isLoading, error } = useQuery<PublicRequest | null>({
    queryKey: ["/api/socketrelay/public", id],
    queryFn: async () => {
      const res = await fetch(`/api/socketrelay/public/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Request not found or not public</p>
        </div>
      </div>
    );
  }

  const creatorName = request.creator
    ? request.creator.displayName || [request.creator.firstName, request.creator.lastName].filter(Boolean).join(' ') || 'Anonymous'
    : 'Anonymous';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">SocketRelay Request</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Public request</p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Public SocketRelay Link</label>
          <p className="text-sm text-muted-foreground">Return to the public SocketRelay list to view all public requests.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {publicSocketRelayUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(publicSocketRelayUrl)}
              className="flex-shrink-0"
              data-testid="button-copy-public-socketrelay"
              aria-label="Copy public SocketRelay link"
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
              data-testid="button-open-public-socketrelay"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg sm:text-xl">Request</CardTitle>
              {request.creator?.isVerified && (
                <VerifiedBadge isVerified={request.creator.isVerified} testId="badge-verified-public" />
              )}
            </div>
            <Badge variant="default">Public</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-base">{request.description}</p>
          </div>

          {request.creator && (
            <div>
              <p className="text-sm text-muted-foreground">Requested by</p>
              <p className="text-base">{creatorName}</p>
            </div>
          )}

          {request.creatorProfile && (request.creatorProfile.city || request.creatorProfile.state || request.creatorProfile.country) && (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>
                  {[request.creatorProfile.city, request.creatorProfile.state, request.creatorProfile.country]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Posted</p>
              <p className="mt-1">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}

