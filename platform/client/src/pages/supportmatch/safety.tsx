import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Exclusion, SupportMatchProfile } from "@shared/schema";
import { format } from "date-fns";
import { ShieldAlert, UserX, Trash2 } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupportMatchSafety() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reason, setReason] = useState("");

  const { data: exclusions, isLoading: exclusionsLoading } = useQuery<Exclusion[]>({
    queryKey: ["/api/supportmatch/exclusions"],
  });

  const { data: allProfiles } = useQuery<(SupportMatchProfile & { nickname?: string | null })[]>({
    queryKey: ["/api/supportmatch/admin/profiles"],
  });

  const addExclusionMutation = useMutation({
    mutationFn: (data: { excludedUserId: string; reason?: string }) =>
      apiRequest("POST", "/api/supportmatch/exclusions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/exclusions"] });
      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      setIsDialogOpen(false);
      setSelectedUserId("");
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    },
  });

  const removeExclusionMutation = useMutation({
    mutationFn: (exclusionId: string) =>
      apiRequest("DELETE", `/api/supportmatch/exclusions/${exclusionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/exclusions"] });
      toast({
        title: "Success",
        description: "User unblocked successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unblock user",
        variant: "destructive",
      });
    },
  });

  const handleAddExclusion = () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to block",
        variant: "destructive",
      });
      return;
    }

    addExclusionMutation.mutate({
      excludedUserId: selectedUserId,
      reason: reason.trim() || undefined,
    });
  };

  const getUserNickname = (userId: string) => {
    const profile = allProfiles?.find((p) => p.userId === userId);
    return profile?.nickname || "Unknown User";
  };

  // Filter out current user and already excluded users
  const availableUsers = allProfiles?.filter(
    (profile) =>
      profile.userId !== user?.id &&
      !exclusions?.some((ex) => ex.excludedUserId === profile.userId)
  );

  if (exclusionsLoading) {
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
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">Safety & Privacy</h1>
        <p className="text-muted-foreground">
          Manage your blocked users and safety preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Blocked Users
              </CardTitle>
              <CardDescription className="mt-2">
                Users you've blocked will never be matched with you. This is permanent until you
                unblock them.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-exclusion">
                  <UserX className="w-4 h-4 mr-2" />
                  Block User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Block a User</DialogTitle>
                  <DialogDescription>
                    This user will never be matched with you in future partnerships.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select User</label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger data-testid="select-user">
                        <SelectValue placeholder="Choose a user to block..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers && availableUsers.length > 0 ? (
                          availableUsers.map((profile) => (
                            <SelectItem
                              key={profile.userId}
                              value={profile.userId}
                              data-testid={`user-option-${profile.userId}`}
                            >
                              {profile.nickname || "Unknown User"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No users available to block
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reason (Optional)
                    </label>
                    <Textarea
                      placeholder="Why are you blocking this user?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      data-testid="input-reason"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddExclusion}
                      disabled={!selectedUserId || addExclusionMutation.isPending}
                      data-testid="button-confirm-block"
                    >
                      Block User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!exclusions || exclusions.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">You haven't blocked any users yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Blocked users will never be matched with you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exclusions.map((exclusion) => (
                <Card key={exclusion.id} data-testid={`exclusion-${exclusion.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <UserX className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getUserNickname(exclusion.excludedUserId)}
                          </span>
                        </div>
                        {exclusion.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {exclusion.reason}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Blocked on {format(new Date(exclusion.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeExclusionMutation.mutate(exclusion.id)}
                        disabled={removeExclusionMutation.isPending}
                        data-testid={`button-unblock-${exclusion.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Unblock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
