import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Users, Radio, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useExternalLink } from "@/hooks/useExternalLink";
import { useAuth } from "@/hooks/useAuth";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { AudioListener } from "@/components/chyme/audio-listener";

interface ChymeRoom {
  id: string;
  name: string;
  description: string | null;
  roomType: "public" | "private";
  topic: string | null;
  isActive: boolean;
  currentParticipants: number;
  maxParticipants: number | null;
  pinnedLink: string | null;
  createdAt: string;
  creatorId: string;
}

export default function ChymeRoomDetail() {
  const [match, params] = useRoute<{ roomId: string }>("/apps/chyme/room/:roomId");
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { _clerk } = useAuth();
  const roomId = params?.roomId;
  
  // Get signaling endpoint - use same origin with wss protocol
  const signalingEndpoint = typeof window !== "undefined" 
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/chyme/signaling`
    : "";

  const { data: room, isLoading, error } = useQuery<ChymeRoom>({
    queryKey: [`/api/chyme/rooms`, roomId],
    enabled: !!roomId,
  });

  const releasesUrl = "https://github.com/chargingthefuture/mono/releases";

  if (!roomId) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid room ID</p>
            <Link href="/apps/chyme">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chyme
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading room...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Room not found or you don't have access to it.
            </p>
            <Link href="/apps/chyme">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chyme
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room.isActive) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-2">{room.name}</h2>
            <Badge variant="secondary" className="mb-4">Room Ended</Badge>
            <p className="text-muted-foreground mb-4">
              This room is no longer active.
            </p>
            <Link href="/apps/chyme">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chyme
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/apps/chyme">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">{room.name}</h1>
          <p className="text-muted-foreground">Join this room in the Chyme Android app</p>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/chyme/announcements"
        queryKey="/api/chyme/announcements"
      />

      {/* Show audio listener for public rooms when unauthenticated */}
      {room.roomType === "public" && !_clerk.isSignedIn && room.isActive && (
        <AudioListener 
          roomId={roomId!} 
          signalingEndpoint={signalingEndpoint}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Room Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Room Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Room Type</p>
              <Badge variant={room.roomType === "public" ? "default" : "secondary"}>
                {room.roomType.toUpperCase()}
              </Badge>
            </div>

            {room.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{room.description}</p>
              </div>
            )}

            {room.topic && (
              <div>
                <p className="text-sm font-medium mb-1">Topic</p>
                <p className="text-sm text-muted-foreground">{room.topic}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">
                <span className="font-medium">{room.currentParticipants}</span>
                {room.maxParticipants && (
                  <span className="text-muted-foreground"> / {room.maxParticipants}</span>
                )}
                <span className="text-muted-foreground"> participants</span>
              </p>
            </div>

            {room.pinnedLink && (
              <div>
                <p className="text-sm font-medium mb-1">Pinned Link</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openExternal(room.pinnedLink!)}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Join This Room
            </CardTitle>
            <CardDescription>
              Chyme rooms are accessed through the Android app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                To join this room, you need the Chyme Android app installed on your device.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Download the Chyme app from the releases page</li>
                <li>Sign in to your account</li>
                <li>Find this room in the room list or search for "{room.name}"</li>
                <li>Tap the room to join</li>
              </ol>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={() => openExternal(releasesUrl)}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Download Android App
              </Button>
              <Link href="/apps/chyme">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Chyme Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExternalLinkDialog />
    </div>
  );
}

