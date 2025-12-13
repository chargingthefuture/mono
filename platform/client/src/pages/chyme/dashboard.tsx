import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Lock, Globe, Settings, MessageSquare, Smartphone, Copy, Check } from "lucide-react";
import type { ChymeRoom, ChymeProfile } from "@shared/schema";
import { Link } from "wouter";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";

export default function ChymeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: profile, isLoading: profileLoading } = useQuery<ChymeProfile | null>({
    queryKey: ["/api/chyme/profile"],
  });

  const { data: roomsData, isLoading: roomsLoading } = useQuery<{ rooms: ChymeRoom[]; total: number }>({
    queryKey: [`/api/chyme/rooms?limit=${limit}&offset=${page * limit}`],
  });

  const rooms = roomsData?.rooms || [];
  const total = roomsData?.total || 0;

  if (profileLoading || roomsLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold">Chyme Audio Rooms</h1>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Join private or public audio rooms for voice conversations
          </p>
        </div>
        {profile && (
          <Button asChild variant="outline">
            <Link href="/apps/chyme/profile">
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </Link>
          </Button>
        )}
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/chyme/announcements"
        queryKey="/api/chyme/announcements"
      />

      {/* OTP Generation Card for Android App */}
      {user && (user.isApproved || user.isAdmin) && (
        <OTPGenerationCard />
      )}

      {!profile && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your Chyme profile to join audio rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/apps/chyme/profile">Create Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {profile && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant={room.roomType === 'private' ? 'default' : 'secondary'}>
                      {room.roomType === 'private' ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                  </div>
                  {room.description && (
                    <CardDescription className="mt-2">{room.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {room.currentParticipants} / {room.maxParticipants || '∞'} participants
                      </span>
                    </div>
                  </div>
                  <Button asChild className="w-full" data-testid={`button-join-room-${room.id}`}>
                    <Link href={`/apps/chyme/room/${room.id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Room
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {rooms.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No rooms available at this time.</p>
              </CardContent>
            </Card>
          )}

          {total > limit && (
            <PaginationControls
              currentPage={page}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </>
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
      const response = await apiRequest("/api/chyme/generate-otp", {
        method: "POST",
      });
      return response;
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








