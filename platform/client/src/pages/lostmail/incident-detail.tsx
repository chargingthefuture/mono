import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { LostmailIncident } from "@shared/schema";

export default function LostMailIncidentDetail() {
  const [, params] = useRoute("/apps/lostmail/incident/:id");
  const [location] = useLocation();
  const incidentId = params?.id;
  
  // Extract email from query params if present
  const urlParams = new URLSearchParams(location.split("?")[1]);
  const email = urlParams.get("email");

  const { data: incident, isLoading } = useQuery<LostmailIncident>({
    queryKey: [`/api/lostmail/incidents/${incidentId}${email ? `?email=${encodeURIComponent(email)}` : ""}`],
    enabled: !!incidentId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Incident not found</p>
          <Link href="/apps/lostmail">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const photos: string[] = incident.photos ? (typeof incident.photos === 'string' ? JSON.parse(incident.photos) : incident.photos) : [];

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 print:p-4">
      {/* Header - Hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/apps/lostmail">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Incident Report</h1>
            <p className="text-muted-foreground">Incident ID: {incident.id}</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" data-testid="button-print">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Main Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={getStatusBadgeVariant(incident.status)}>
                {incident.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Severity</span>
              <Badge variant={getSeverityColor(incident.severity)}>
                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Incident Type</span>
              <p className="font-medium">{incident.incidentType.charAt(0).toUpperCase() + incident.incidentType.slice(1)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Tracking Number</span>
              <p className="font-medium">{incident.trackingNumber}</p>
            </div>
            {incident.carrier && (
              <div>
                <span className="text-sm text-muted-foreground">Carrier</span>
                <p className="font-medium">{incident.carrier}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Expected Delivery Date</span>
              <p className="font-medium">
                {format(new Date(incident.expectedDeliveryDate), "MMMM d, yyyy")}
              </p>
            </div>
            {incident.noticedDate && (
              <div>
                <span className="text-sm text-muted-foreground">Date Noticed</span>
                <p className="font-medium">
                  {format(new Date(incident.noticedDate), "MMMM d, yyyy")}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Submitted</span>
              <p className="font-medium">
                {format(new Date(incident.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reporter Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reporter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{incident.reporterName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="font-medium">{incident.reporterEmail}</p>
            </div>
            {incident.reporterPhone && (
              <div>
                <span className="text-sm text-muted-foreground">Phone</span>
                <p className="font-medium">{incident.reporterPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{incident.description}</p>
        </CardContent>
      </Card>

      {/* Photos */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photoUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={photoUrl}
                    alt={`Incident photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
