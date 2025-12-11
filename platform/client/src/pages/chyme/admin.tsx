import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Lock, Globe, Trash2, Edit, Plus, Users } from "lucide-react";
import { Link } from "wouter";
import type { ChymeRoom } from "@shared/schema";
import { useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";

export default function ChymeAdmin() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data: roomsData, isLoading: roomsLoading } = useQuery<{ rooms: ChymeRoom[]; total: number }>({
    queryKey: [`/api/chyme/rooms?showAll=true&limit=${limit}&offset=${page * limit}`],
  });

  const rooms = roomsData?.rooms || [];
  const total = roomsData?.total || 0;

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/chyme/admin/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms'] });
      toast({
        title: "Room deleted",
        description: "The room has been removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chyme Admin</h1>
          <p className="text-muted-foreground">
            Manage audio rooms and announcements
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/apps/chyme/admin/rooms/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>
            View and manage all audio rooms in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roomsLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : rooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rooms found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {room.currentParticipants} / {room.maxParticipants || '∞'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.isActive ? 'default' : 'secondary'}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(room.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            data-testid={`button-edit-room-${room.id}`}
                          >
                            <Link href={`/apps/chyme/admin/rooms/${room.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
                                deleteRoomMutation.mutate(room.id);
                              }
                            }}
                            disabled={deleteRoomMutation.isPending}
                            data-testid={`button-delete-room-${room.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Create and manage announcements for Chyme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create and manage announcements for this mini-app.
          </p>
          <Link href="/apps/chyme/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
