import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Smartphone, Copy, Check } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useState } from "react";

export default function ChymeDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Chyme</h1>
        <p className="text-muted-foreground">
          Android app authenticator
        </p>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/chyme/announcements"
        queryKey="/api/chyme/announcements"
      />

      {/* OTP Generation Card for Android App */}
      {user && (user.isApproved || user.isAdmin) && (
        <OTPGenerationCard />
      )}
    </div>
  );
}

function OTPGenerationCard() {
  const { toast } = useToast();
  const [otp, setOtp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const generateOTPMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chyme/generate-otp");
      const data = await response.json() as { otp: string; expiresAt: string };
      return data;
    },
    onSuccess: (data: { otp: string; expiresAt: string }) => {
      setOtp(data.otp);
      setExpiresAt(new Date(data.expiresAt));
      toast({
        title: "OTP Generated",
        description: "Use this code to sign in to the Android app. It expires in 5 minutes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate OTP",
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    if (otp) {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "OTP code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
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
          <CardTitle>Android App Access</CardTitle>
        </div>
        <CardDescription>
          Generate a one-time passcode to sign in to the Chyme Android app
        </CardDescription>
        <div className="mt-2">
          <a
            href="https://github.com/chargingthefuture/mono/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Download the latest app release
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!otp ? (
          <Button
            onClick={() => generateOTPMutation.mutate()}
            disabled={generateOTPMutation.isPending}
            className="w-full"
          >
            {generateOTPMutation.isPending ? "Generating..." : "Generate OTP Code"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your OTP Code</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{otp}</p>
                {expiresAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Expires in: {getTimeRemaining()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="ml-4"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOtp(null);
                  setExpiresAt(null);
                }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={() => generateOTPMutation.mutate()}
                disabled={generateOTPMutation.isPending}
                className="flex-1"
              >
                Generate New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Enter this 6-digit code in the Android app to sign in. Only approved users can access the app.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}








