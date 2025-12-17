import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Smartphone, Copy, Check, ExternalLink } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useExternalLink } from "@/hooks/useExternalLink";
import { useState } from "react";

export default function ChymeDashboard() {
  const { user } = useAuth();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const releasesUrl = "https://github.com/chargingthefuture/mono/releases";

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
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

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Chyme</h1>
        <p className="text-muted-foreground">
          Android app authenticator
        </p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Android App Release</label>
          <p className="text-sm text-muted-foreground">
            Download the latest app release from GitHub.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {releasesUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(releasesUrl)}
              className="flex-shrink-0"
              aria-label="Copy releases link"
            >
              {copiedUrl === releasesUrl ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(releasesUrl)}
              className="flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/chyme/announcements"
        queryKey="/api/chyme/announcements"
      />

      {/* Mobile Auth Card for Android App */}
      {user && (user.isApproved || user.isAdmin) && (
        <MobileAuthCard />
      )}

      <ExternalLinkDialog />
    </div>
  );
}

function MobileAuthCard() {
  const { toast } = useToast();
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const generateAuthMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chyme/generate-mobile-token");
      const data = await response.json() as { code: string; deepLink: string; expiresAt: string };
      return data;
    },
    onSuccess: (data: { code: string; deepLink: string; expiresAt: string }) => {
      setDeepLink(data.deepLink);
      setExpiresAt(new Date(data.expiresAt));
      toast({
        title: "Auth Link Generated",
        description: "Click the button below to open the Android app and sign in. Link expires in 10 minutes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate auth link",
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    if (deepLink) {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Deep link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenDeepLink = () => {
    if (deepLink) {
      window.location.href = deepLink;
      toast({
        title: "Opening app...",
        description: "If the app doesn't open, make sure it's installed on your device.",
      });
    }
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          <CardTitle>Android App Sign In</CardTitle>
        </div>
        <CardDescription>
          Generate a sign-in link to authenticate with the Chyme Android app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!deepLink ? (
          <Button
            onClick={() => generateAuthMutation.mutate()}
            disabled={generateAuthMutation.isPending}
            className="w-full"
          >
            {generateAuthMutation.isPending ? "Generating..." : "Generate Sign-In Link"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Sign-In Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs bg-background px-2 py-1.5 rounded break-all">
                    {deepLink}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {expiresAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Expires in: {getTimeRemaining()}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleOpenDeepLink}
              className="w-full"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open in Android App
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeepLink(null);
                  setExpiresAt(null);
                }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={() => generateAuthMutation.mutate()}
                disabled={generateAuthMutation.isPending}
                className="flex-1"
              >
                Generate New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click "Open in Android App" to automatically sign in. Make sure the Chyme app is installed on your Android device.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}








