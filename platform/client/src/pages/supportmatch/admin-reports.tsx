import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Report, SupportMatchProfile } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function SupportMatchAdminReports() {
  const { toast } = useToast();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/supportmatch/admin/reports"],
  });

  const { data: profiles } = useQuery<(SupportMatchProfile & { firstName?: string | null })[]>({
    queryKey: ["/api/supportmatch/admin/profiles"],
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status, resolution }: { id: string; status: string; resolution: string }) => {
      return apiRequest("PUT", `/api/supportmatch/admin/reports/${id}/status`, { status, resolution });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/admin/stats"] });
      setResolvingId(null);
      setResolution("");
      toast({
        title: "Success",
        description: "Report updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    },
  });

  const getUserNickname = (userId: string) => {
    const profile = profiles?.find(p => p.userId === userId);
    return profile?.nickname || "Anonymous";
  };

  const handleResolve = (reportId: string, status: "resolved" | "dismissed") => {
    resolveMutation.mutate({
      id: reportId,
      status,
      resolution: resolution || `Report ${status}`,
    });
  };

  const pendingReports = reports?.filter(r => r.status === "pending") || [];
  const resolvedReports = reports?.filter(r => r.status !== "pending") || [];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/supportmatch/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Report Management</h1>
          <p className="text-muted-foreground">
            Review and respond to safety reports
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm text-muted-foreground">
            {pendingReports.length} pending report{pendingReports.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pending Reports</h2>
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending reports.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingReports.map((report) => (
                <Card key={report.id} data-testid={`report-card-${report.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          Report from {getUserNickname(report.reporterId)}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <Badge variant="destructive">Pending</Badge>
                          <span className="text-sm text-muted-foreground">
                            Reported: {getUserNickname(report.reportedUserId)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(report.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        
                        {resolvingId === report.id ? (
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Add resolution notes (optional)"
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              rows={3}
                              data-testid={`input-resolution-${report.id}`}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleResolve(report.id, "resolved")}
                                disabled={resolveMutation.isPending}
                                data-testid={`button-resolve-${report.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolve(report.id, "dismissed")}
                                disabled={resolveMutation.isPending}
                                data-testid={`button-dismiss-${report.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Dismiss
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setResolvingId(null);
                                  setResolution("");
                                }}
                                data-testid={`button-cancel-${report.id}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResolvingId(report.id)}
                            data-testid={`button-take-action-${report.id}`}
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Resolved Reports</h2>
          {resolvedReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No resolved reports.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resolvedReports.map((report) => (
                <Card key={report.id} data-testid={`resolved-report-card-${report.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          Report from {getUserNickname(report.reporterId)}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <Badge variant={report.status === "resolved" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Reported: {getUserNickname(report.reportedUserId)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(report.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        {report.resolution && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Resolution:</strong> {report.resolution}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
