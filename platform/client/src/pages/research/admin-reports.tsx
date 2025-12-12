import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PaginationControls } from "@/components/pagination-controls";
import type { ResearchReport } from "@shared/schema";

export default function CompareNotesAdminReports() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery<{ reports: ResearchReport[]; total: number }>({
    queryKey: [`/api/comparenotes/admin/reports?status=${statusFilter}&limit=${limit}&offset=${page * limit}`],
  });

  const reports = data?.reports || [];
  const total = data?.total || 0;

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/comparenotes/admin/reports/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comparenotes/admin/reports"] });
      toast({ title: "Report updated successfully" });
    },
  });

  if (isLoading) {
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
      <div className="flex items-center gap-4">
        <Link href="/apps/comparenotes/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">CompareNotes Reports</h1>
          <p className="text-muted-foreground">
            Review and manage reported content
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "reviewed" ? "default" : "outline"}
          onClick={() => setStatusFilter("reviewed")}
        >
          Reviewed
        </Button>
        <Button
          variant={statusFilter === "resolved" ? "default" : "outline"}
          onClick={() => setStatusFilter("resolved")}
        >
          Resolved
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No reports found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === "pending" ? "default" : "secondary"}>
                        {report.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Reported {format(new Date(report.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="font-medium">Reason: {report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    )}
                    {report.researchItemId && (
                      <Link href={`/apps/comparenotes/item/${report.researchItemId}`}>
                        <Button variant="ghost" size="sm">
                          View Question
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {report.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateReportMutation.mutate({ id: report.id, status: "reviewed" })}
                        >
                          Mark Reviewed
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateReportMutation.mutate({ id: report.id, status: "resolved" })}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Pagination */}
          <PaginationControls
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            className="mt-6"
          />
        </div>
      )}
    </div>
  );
}
