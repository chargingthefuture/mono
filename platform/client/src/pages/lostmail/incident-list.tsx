import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import type { LostmailIncident } from "@shared/schema";

interface LostMailIncidentListProps {
  email: string;
}

export default function LostMailIncidentList({ email }: LostMailIncidentListProps) {
  const { data: incidents = [], isLoading } = useQuery<LostmailIncident[]>({
    queryKey: [`/api/lostmail/incidents?email=${email}`],
    enabled: !!email,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading your incidents...</p>
        </CardContent>
      </Card>
    );
  }

  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-muted-foreground">No incidents found for this email address.</p>
          <p className="text-sm text-muted-foreground">
            If you submitted a report, make sure you're using the same email address you used when submitting.
          </p>
        </CardContent>
      </Card>
    );
  }

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
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Incidents</h2>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
              data-testid="incident-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">ID: {incident.id}</span>
                    <Badge variant={getStatusBadgeVariant(incident.status)}>
                      {incident.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Type: {incident.incidentType.charAt(0).toUpperCase() + incident.incidentType.slice(1)}
                  </p>
                  <p className="text-sm line-clamp-2">{incident.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {format(new Date(incident.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Link href={`/apps/lostmail/incident/${incident.id}?email=${encodeURIComponent(email)}`}>
                  <Button variant="outline" size="sm" data-testid={`button-view-${incident.id}`}>
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
