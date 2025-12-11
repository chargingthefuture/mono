import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/pagination-controls";
import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, ClipboardList, MapPin, MessageSquare, Plus, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import type { MechanicmatchServiceRequest } from "@shared/schema";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  accepted: "secondary",
  in_progress: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export default function MechanicMatchServiceRequests() {
  const limit = 10;
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: (page * limit).toString(),
    });
    return `/api/mechanicmatch/service-requests?${params.toString()}`;
  }, [limit, page]);

  const { data, isLoading } = useQuery<{ items: MechanicmatchServiceRequest[]; total: number }>({
    queryKey: [endpoint],
  });

  const fuzzyResults = useFuzzySearch(data?.items ?? [], searchQuery, {
    searchFields: ["symptoms", "requestType", "estimatedLocation"],
    threshold: 0.3,
  });

  const filteredRequests = fuzzyResults.filter((request) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  const invalidateRequests = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("/api/mechanicmatch/service-requests"),
    });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/mechanicmatch/service-requests/${id}`, { status });
    },
    onSuccess: () => {
      invalidateRequests();
      toast({
        title: "Request Updated",
        description: "Service request status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service request",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const totalItems = data?.total ?? 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/apps/mechanicmatch">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-semibold">My Service Requests</h1>
          <p className="text-muted-foreground">
            Track every MechanicMatch request, update statuses, and keep mechanics informed.
          </p>
        </div>
        <Link href="/apps/mechanicmatch/request-new">
          <Button data-testid="button-create-request">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Use fuzzy search to handle typos or partial matches automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="search">
                Search requests
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Search by symptom, location, or type"
                  className="pl-10"
                  data-testid="input-search-requests"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status filter</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="mt-2" data-testid="select-status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Requests</CardTitle>
            <CardDescription>Showing {filteredRequests.length} of {totalItems} total requests</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => invalidateRequests()}
            data-testid="button-refresh-requests"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading service requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No service requests found.</p>
              <Link href="/apps/mechanicmatch/request-new">
                <Button data-testid="button-empty-create">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Create Your First Request
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg space-y-3" data-testid={`request-card-${request.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariantMap[request.status] || "secondary"} className="capitalize">
                        {request.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.createdAt ?? "").toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{request.requestType?.replace("_", " ")}</span>
                  </div>
                  <p className="font-medium leading-tight">{request.symptoms.substring(0, 160)}{request.symptoms.length > 160 ? "..." : ""}</p>
                  {request.estimatedLocation && (
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="w-4 h-4" />
                      {request.estimatedLocation}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {request.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "cancelled")}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`button-cancel-${request.id}`}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Cancel Request
                      </Button>
                    )}
                    {request.status === "accepted" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "completed")}
                        disabled={updateStatusMutation.isPending}
                        data-testid={`button-complete-${request.id}`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaginationControls
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={setPage}
            className="mt-6"
          />
        </CardContent>
      </Card>
    </div>
  );
}

