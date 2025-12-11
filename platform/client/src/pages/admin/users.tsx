import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrivacyField } from "@/components/ui/privacy-field";
import { VerifiedBadge } from "@/components/verified-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useExternalLink } from "@/hooks/useExternalLink";
import { ExternalLink } from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });


  // Filter out deleted users (identified by ID starting with "deleted_user_")
  // Also handle cases where ID might be null, undefined, or not a string
  const activeUsers = users?.filter((user) => {
    if (!user || !user.id) {
      console.warn(`[Admin Users] Found user with missing ID:`, user);
      return false;
    }
    try {
      const id = String(user.id); // Ensure it's a string
      return !id.startsWith("deleted_user_");
    } catch (e) {
      console.error(`[Admin Users] Error processing user ID:`, user.id, e);
      return false;
    }
  }) || [];

  const verifyMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}/verify`, { isVerified });
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Updated", description: "User verification updated" });
    },
    onError: (e: any) => {
      console.error("Verification error:", e);
      toast({ title: "Error", description: e.message || "Failed to update verification", variant: "destructive" });
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}/approve`, { isApproved });
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Updated", description: "User approval updated" });
    },
    onError: (e: any) => {
      console.error("Approval error:", e);
      toast({ title: "Error", description: e.message || "Failed to update approval", variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge variant="default">Active</Badge>;
    } else if (status === 'overdue') {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">User Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage platform users and their subscription status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            All Users
            {!isLoading && activeUsers.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">
                ({activeUsers.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error loading users</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          ) : !activeUsers || activeUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found</p>
              {users && users.length > 0 && (
                <p className="text-xs mt-2">
                  ({users.length} user{users.length !== 1 ? 's' : ''} filtered out)
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Quora Profile</TableHead>
                      <TableHead>Pricing Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((user) => (
                      <TableRow key={user.id} className="hover-elevate" data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profileImageUrl || undefined} />
                              <AvatarFallback>{getInitials(user)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : 'User'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <PrivacyField 
                            value={user.email || ""} 
                            type="email"
                            testId={`email-${user.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <VerifiedBadge isVerified={user.isVerified ?? false} testId={`badge-verified-${user.id}`} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.quoraProfileUrl ? (
                            <button
                              onClick={() => openExternal(user.quoraProfileUrl!)}
                              className="flex items-center gap-1 text-primary hover:underline"
                              data-testid={`link-quora-${user.id}`}
                            >
                              <span className="truncate max-w-[200px]">{user.quoraProfileUrl}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">${user.pricingTier}/mo</TableCell>
                        <TableCell>{getStatusBadge(user.subscriptionStatus)}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="secondary">Admin</Badge>
                          ) : (
                            <span className="text-muted-foreground">User</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isApproved ? (
                            <Badge variant="default">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant={user.isApproved ? "outline" : "default"}
                              size="sm"
                              onClick={() => {
                                const currentStatus = user.isApproved ?? false;
                                approveMutation.mutate({ id: user.id, isApproved: !currentStatus });
                              }}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${user.id}`}
                            >
                              {user.isApproved ? "Revoke" : "Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentStatus = user.isVerified ?? false;
                                verifyMutation.mutate({ id: user.id, isVerified: !currentStatus });
                              }}
                              disabled={verifyMutation.isPending}
                              data-testid={`button-verify-${user.id}`}
                            >
                              {(user.isVerified ?? false) ? "Unverify" : "Verify"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {activeUsers.map((user) => (
                  <Card key={user.id} data-testid={`row-user-${user.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profileImageUrl || undefined} />
                          <AvatarFallback>{getInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : 'User'}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            <PrivacyField 
                              value={user.email || ""} 
                              type="email"
                              testId={`email-mobile-${user.id}`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground text-sm">Verification</span>
                          <div className="mt-1">
                            <VerifiedBadge isVerified={user.isVerified ?? false} testId={`badge-verified-mobile-${user.id}`} />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-sm">Quora Profile</span>
                          <div className="mt-1">
                            {user.quoraProfileUrl ? (
                              <button
                                onClick={() => openExternal(user.quoraProfileUrl!)}
                                className="flex items-center gap-1 text-primary hover:underline text-sm"
                                data-testid={`link-quora-mobile-${user.id}`}
                              >
                                <span className="truncate">{user.quoraProfileUrl}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </button>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-sm">Approval</span>
                          <div className="mt-1">
                            {user.isApproved ? (
                              <Badge variant="default">Approved</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Status</span>
                            <div className="mt-1">{getStatusBadge(user.subscriptionStatus)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Role</span>
                            <div className="mt-1">
                              {user.isAdmin ? (
                                <Badge variant="secondary">Admin</Badge>
                              ) : (
                                <span className="text-muted-foreground">User</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price</span>
                            <p className="font-mono mt-1">${user.pricingTier}/mo</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Joined</span>
                            <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button
                            variant={user.isApproved ? "outline" : "default"}
                            size="sm"
                            onClick={() => {
                              const currentStatus = user.isApproved ?? false;
                              approveMutation.mutate({ id: user.id, isApproved: !currentStatus });
                            }}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-mobile-${user.id}`}
                            className="w-full"
                          >
                            {user.isApproved ? "Revoke" : "Approve"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentStatus = user.isVerified ?? false;
                              verifyMutation.mutate({ id: user.id, isVerified: !currentStatus });
                            }}
                            disabled={verifyMutation.isPending}
                            data-testid={`button-verify-mobile-${user.id}`}
                            className="w-full"
                          >
                            {(user.isVerified ?? false) ? "Unverify" : "Verify"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ExternalLinkDialog />
    </div>
  );
}
