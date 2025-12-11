import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Lock, Globe, Settings, MessageSquare } from "lucide-react";
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












