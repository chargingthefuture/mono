import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, History } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LostmailIncident, LostmailAuditTrail } from "@shared/schema";

export default function LostMailAdminIncidentDetail() {
  const [, params] = useRoute("/apps/lostmail/admin/incident/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const incidentId = params?.id;

  const [status, setStatus] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: incident, isLoading } = useQuery<LostmailIncident>({
    queryKey: [`/api/lostmail/incidents/${incidentId}`],
    enabled: !!incidentId,
  });

  useEffect(() => {
    if (incident) {
      setStatus(incident.status);
      setAssignedTo(incident.assignedTo || "");
    }
  }, [incident]);

  const { data: auditTrail = [] } = useQuery<LostmailAuditTrail[]>({
    queryKey: [`/api/lostmail/incidents/${incidentId}/audit-trail`],
    enabled: !!incidentId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { status?: string; assignedTo?: string; note?: string }) => {
      const response = await apiRequest("PUT", `/api/lostmail/incidents/${incidentId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lostmail/incidents/${incidentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/lostmail/incidents/${incidentId}/audit-trail`] });
      queryClient.invalidateQueries({ queryKey: ["/api/lostmail/incidents"] });
      toast({ title: "Incident Updated", description: "The incident has been updated successfully." });
      setIsEditing(false);
      setNote("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update incident",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updateData: { status?: string; assignedTo?: string; note?: string } = {};
    
    if (status !== incident?.status) {
      updateData.status = status;
    }
    
    if (assignedTo !== (incident?.assignedTo || "")) {
      updateData.assignedTo = assignedTo || undefined;
    }
    
    if (note.trim()) {
      updateData.note = note.trim();
    }

    if (Object.keys(updateData).length === 0) {
      toast({ title: "No Changes", description: "No changes to save." });
      return;
    }

    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    if (incident) {
      setStatus(incident.status);
      setAssignedTo(incident.assignedTo || "");
    }
    setNote("");
    setIsEditing(false);
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
          <Link href="/apps/lostmail/admin">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
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
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/apps/lostmail/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Incident Details</h1>
            <p className="text-muted-foreground">Incident ID: {incident.id}</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit">
            Edit
          </Button>
        )}
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
              {isEditing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-40" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={getStatusBadgeVariant(incident.status)}>
                  {incident.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
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
            <div>
              <span className="text-sm text-muted-foreground">Assigned To</span>
              {isEditing ? (
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter assignee name"
                  className="mt-1"
                  data-testid="input-assigned-to"
                />
              ) : (
                <p className="font-medium">{incident.assignedTo || "Unassigned"}</p>
              )}
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

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Update Incident</CardTitle>
            <CardDescription>Update the status, assignment, or add a note</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this update..."
                rows={4}
                data-testid="textarea-note"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <CardTitle>Audit Trail</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {auditTrail.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No audit trail entries yet.</p>
          ) : (
            <div className="space-y-4">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="border-l-2 border-primary pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{entry.action.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">by {entry.adminName}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {entry.note && (
                    <p className="text-sm mt-2">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



