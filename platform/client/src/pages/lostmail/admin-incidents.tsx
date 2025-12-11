import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import { PaginationControls } from "@/components/pagination-controls";
import type { LostmailIncident } from "@shared/schema";

export default function LostMailAdminIncidents() {
  const [filters, setFilters] = useState({
    incidentType: "all",
    status: "all",
    severity: "all",
    search: "",
    limit: 50,
    offset: 0,
  });

  const queryParams = new URLSearchParams();
  if (filters.incidentType && filters.incidentType !== "all") queryParams.append("incidentType", filters.incidentType);
  if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);
  if (filters.severity && filters.severity !== "all") queryParams.append("severity", filters.severity);
  if (filters.search) queryParams.append("search", filters.search);
  queryParams.append("limit", filters.limit.toString());
  queryParams.append("offset", filters.offset.toString());

  const { data, isLoading } = useQuery<{ incidents: LostmailIncident[]; total: number }>({
    queryKey: [`/api/lostmail/incidents?${queryParams.toString()}`],
  });

  const incidents = data?.incidents || [];
  const total = data?.total || 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "default";
      case "under_review":
        return "secondary";
      case "in_progress":
        return "default";
      case "resolved":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Incidents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by ID, tracking, name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, offset: 0 })}
            data-testid="input-search"
          />
          <Select
            value={filters.incidentType}
            onValueChange={(value) => setFilters({ ...filters, incidentType: value, offset: 0 })}
          >
            <SelectTrigger data-testid="select-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="tampered">Tampered</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value, offset: 0 })}
          >
            <SelectTrigger data-testid="select-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.severity}
            onValueChange={(value) => setFilters({ ...filters, severity: value, offset: 0 })}
          >
            <SelectTrigger data-testid="select-severity">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No incidents found</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {incidents.length} of {total} incidents
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Reporter</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Severity</th>
                    <th className="text-left p-2">Tracking</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b hover:bg-accent">
                      <td className="p-2 font-mono text-xs">{incident.id.substring(0, 8)}...</td>
                      <td className="p-2">{incident.reporterName}</td>
                      <td className="p-2 capitalize">{incident.incidentType}</td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(incident.status)}>
                          {incident.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-2 capitalize">{incident.severity}</td>
                      <td className="p-2">{incident.trackingNumber}</td>
                      <td className="p-2 text-sm">
                        {format(new Date(incident.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="p-2">
                        <Link href={`/apps/lostmail/admin/incident/${incident.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-${incident.id}`}>
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <PaginationControls
              currentPage={Math.floor(filters.offset / filters.limit)}
              totalItems={total}
              itemsPerPage={filters.limit}
              onPageChange={(page) => setFilters({ ...filters, offset: page * filters.limit })}
              className="mt-6"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
