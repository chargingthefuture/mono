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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { PrivacyField } from "@/components/ui/privacy-field";
import type { SocketrelayRequest, SocketrelayFulfillment } from "@shared/schema";

export default function SocketRelayAdmin() {
  const { toast } = useToast();

  const { data: allRequests = [], isLoading: requestsLoading } = useQuery<SocketrelayRequest[]>({
    queryKey: ['/api/socketrelay/admin/requests'],
  });

  const { data: allFulfillments = [], isLoading: fulfillmentsLoading } = useQuery<any[]>({
    queryKey: ['/api/socketrelay/admin/fulfillments'],
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/socketrelay/admin/requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/socketrelay/admin/requests'] });
      toast({
        title: "Request deleted",
        description: "The request has been removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete request",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" data-testid={`badge-${status}`}><Clock className="w-3 h-3 mr-1" />Active</Badge>;
      case 'completed_success':
        return <Badge variant="default" className="bg-green-600" data-testid={`badge-${status}`}><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case 'completed_failure':
        return <Badge variant="destructive" data-testid={`badge-${status}`}><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" data-testid={`badge-${status}`}><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">SocketRelay Admin</h1>
        <p className="text-muted-foreground">
          Oversee all requests and fulfillments in the SocketRelay system
        </p>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList data-testid="tabs-admin">
          <TabsTrigger value="requests" data-testid="tab-requests">Requests</TabsTrigger>
          <TabsTrigger value="fulfillments" data-testid="tab-fulfillments">Fulfillments</TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>
                View and manage all requests in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : allRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No requests found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRequests.map((request: any) => (
                      <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                        <TableCell className="max-w-md">
                          <p className="truncate">{request.description}</p>
                        </TableCell>
                        <TableCell>
                          {request.user?.firstName || request.user?.lastName
                            ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim()
                            : 'User'}
                        </TableCell>
                        <TableCell>
                          {request.user?.email ? (
                            <PrivacyField
                              value={request.user.email}
                              type="email"
                              testId={`email-request-${request.id}`}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {isExpired(request.expiresAt) ? (
                            <span className="text-destructive">Expired</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRequestMutation.mutate(request.id)}
                            disabled={deleteRequestMutation.isPending}
                            data-testid={`button-delete-${request.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Fulfillments</CardTitle>
              <CardDescription>
                View all fulfillments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fulfillmentsLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : allFulfillments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No fulfillments found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allFulfillments.map((fulfillment: any) => (
                      <TableRow key={fulfillment.id} data-testid={`row-fulfillment-${fulfillment.id}`}>
                        <TableCell className="max-w-md">
                          <p className="truncate">{fulfillment.request?.description || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          {fulfillment.user?.firstName || fulfillment.user?.lastName
                            ? `${fulfillment.user.firstName || ''} ${fulfillment.user.lastName || ''}`.trim()
                            : 'User'}
                        </TableCell>
                        <TableCell>
                          {fulfillment.user?.email ? (
                            <PrivacyField
                              value={fulfillment.user.email}
                              type="email"
                              testId={`email-fulfillment-${fulfillment.id}`}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(fulfillment.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{getStatusBadge(fulfillment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-requests">{allRequests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-active-requests">
                  {allRequests.filter((r: SocketrelayRequest) => r.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fulfillments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-fulfillments">{allFulfillments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-success-rate">
                  {allFulfillments.length > 0
                    ? Math.round(
                        (allFulfillments.filter((f: any) => f.status === 'completed_success').length /
                          allFulfillments.filter((f: any) => f.status !== 'active').length) *
                          100
                      ) || 0
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Announcements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create and manage announcements for SocketRelay.
          </p>
          <Link href="/apps/socketrelay/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
