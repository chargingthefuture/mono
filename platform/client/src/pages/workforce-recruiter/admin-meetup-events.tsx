import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Edit, Trash2, Users, Eye } from "lucide-react";
import { Link } from "wouter";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { PaginationControls } from "@/components/pagination-controls";
import { Switch } from "@/components/ui/switch";
import { PrivacyField } from "@/components/ui/privacy-field";
import type { WorkforceRecruiterMeetupEvent, WorkforceRecruiterMeetupEventSignup, WorkforceRecruiterOccupation } from "@shared/schema";
import { insertWorkforceRecruiterMeetupEventSchema } from "@shared/schema";
import { format } from "date-fns";

const eventFormSchema = insertWorkforceRecruiterMeetupEventSchema;
type EventFormValues = z.infer<typeof eventFormSchema>;

export default function WorkforceRecruiterAdminMeetupEvents() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<WorkforceRecruiterMeetupEvent | null>(null);
  const [signupsDialogOpen, setSignupsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WorkforceRecruiterMeetupEvent | null>(null);
  const [signupsPage, setSignupsPage] = useState(0);
  const limit = 20;
  const signupsLimit = 20;

  // Fetch occupations for the dropdown
  const { data: occupationsData } = useQuery<{ occupations: WorkforceRecruiterOccupation[]; total: number }>({
    queryKey: [`/api/workforce-recruiter/occupations?limit=1000&offset=0`],
  });

  const occupations = occupationsData?.occupations || [];

  // Fetch all events (active and inactive)
  const { data, isLoading } = useQuery<{ events: WorkforceRecruiterMeetupEvent[]; total: number }>({
    queryKey: [`/api/workforce-recruiter/meetup-events?limit=${limit}&offset=${page * limit}`],
  });

  const events = data?.events || [];
  const total = data?.total || 0;

  const filteredEvents = useFuzzySearch(events, searchQuery, {
    searchFields: ["title", "description"],
    threshold: 0.3,
  });

  // Fetch signups for selected event (now includes user data)
  const { data: signupsData, isLoading: signupsLoading } = useQuery<{ signups: (WorkforceRecruiterMeetupEventSignup & { user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null })[], total: number }>({
    queryKey: [`/api/workforce-recruiter/meetup-events/${selectedEvent?.id}/signups?limit=${signupsLimit}&offset=${signupsPage * signupsLimit}`],
    enabled: !!selectedEvent && signupsDialogOpen,
  });

  const signups = signupsData?.signups || [];
  const signupsTotal = signupsData?.total || 0;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      occupationId: "",
      title: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when editing
  const handleEdit = (event: WorkforceRecruiterMeetupEvent) => {
    setEditingId(event.id);
    form.reset({
      occupationId: event.occupationId,
      title: event.title,
      description: event.description || "",
      isActive: event.isActive,
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      return apiRequest("POST", "/api/workforce-recruiter/meetup-events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events"] });
      form.reset();
      toast({
        title: "Event Created",
        description: "The meetup event has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormValues> }) => {
      return apiRequest("PUT", `/api/workforce-recruiter/meetup-events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events"] });
      setEditingId(null);
      form.reset();
      toast({
        title: "Event Updated",
        description: "The meetup event has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/workforce-recruiter/meetup-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events"] });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      toast({
        title: "Event Deleted",
        description: "The meetup event has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (event: WorkforceRecruiterMeetupEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleViewSignups = (event: WorkforceRecruiterMeetupEvent) => {
    setSelectedEvent(event);
    setSignupsPage(0);
    setSignupsDialogOpen(true);
  };

  const getOccupationName = (occupationId: string) => {
    const occupation = occupations.find(occ => occ.id === occupationId);
    return occupation?.occupationTitle || "Unknown Occupation";
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <MiniAppBackButton href="/apps/workforce-recruiter/admin" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Manage Meetup Events</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage meetup events and view signups
          </p>
        </div>
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Meetup Event" : "Create New Meetup Event"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="occupationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-occupation">
                          <SelectValue placeholder="Select an occupation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {occupations.map((occupation) => (
                          <SelectItem key={occupation.id} value={occupation.id}>
                            {occupation.occupationTitle} ({occupation.sector})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-title" placeholder="e.g., Meetup for Agronomists" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        data-testid="input-description"
                        placeholder="Optional description of the meetup event"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Active events are visible to users. Inactive events are hidden.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingId ? "Update Event" : "Create Event"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search events by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "No events match your search." : "No meetup events yet. Create one above."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{event.title}</CardTitle>
                      {event.isActive ? (
                        <Badge variant="default" data-testid="badge-active">Active</Badge>
                      ) : (
                        <Badge variant="secondary" data-testid="badge-inactive">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Occupation: {getOccupationName(event.occupationId)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {format(new Date(event.createdAt), "PPp")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSignups(event)}
                      data-testid={`button-view-signups-${event.id}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Signups
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      data-testid={`button-edit-${event.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event)}
                      data-testid={`button-delete-${event.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <PaginationControls
        currentPage={page}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={setPage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meetup Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone and will also delete all associated signups.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => eventToDelete && deleteMutation.mutate(eventToDelete.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signups Dialog */}
      <Dialog open={signupsDialogOpen} onOpenChange={setSignupsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Signups for "{selectedEvent?.title}"</DialogTitle>
            <DialogDescription>
              View all users who have signed up for this meetup event.
            </DialogDescription>
          </DialogHeader>
          {signupsLoading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading signups...</p>
            </div>
          ) : signups.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No signups yet for this event.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {signups.map((signup) => (
                  <Card key={signup.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="space-y-1">
                              {(signup.user?.firstName || signup.user?.lastName) ? (
                                <p className="font-medium">
                                  {[signup.user.firstName, signup.user.lastName].filter(Boolean).join(' ') || 'User'}
                                </p>
                              ) : (
                                <p className="font-medium text-muted-foreground">User</p>
                              )}
                              {signup.user?.email && (
                                <div className="text-sm">
                                  <PrivacyField
                                    value={signup.user.email}
                                    type="email"
                                    testId={`signup-email-${signup.id}`}
                                  />
                                </div>
                              )}
                              {!signup.user?.email && !signup.user?.firstName && !signup.user?.lastName && (
                                <p className="text-sm text-muted-foreground">User ID: {signup.userId}</p>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Signed up: {format(new Date(signup.createdAt), "PPp")}
                            </p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Location</Label>
                            <p className="text-sm">{signup.location}</p>
                          </div>
                          {signup.preferredMeetupDate && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Preferred Date</Label>
                              <p className="text-sm">{format(new Date(signup.preferredMeetupDate), "PP")}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-xs text-muted-foreground">Availability</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {signup.availability.map((avail) => (
                                <Badge key={avail} variant="secondary" className="text-xs">
                                  {avail}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {signup.whyInterested && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Why Interested</Label>
                            <p className="text-sm mt-1">{signup.whyInterested}</p>
                          </div>
                        )}
                        {signup.additionalComments && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Additional Comments</Label>
                            <p className="text-sm mt-1">{signup.additionalComments}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {signupsTotal > signupsLimit && (
                <div className="mt-4">
                  <PaginationControls
                    currentPage={signupsPage}
                    totalItems={signupsTotal}
                    itemsPerPage={signupsLimit}
                    onPageChange={setSignupsPage}
                  />
                </div>
              )}
            </>
          )}
          <DialogFooter>
            <Button onClick={() => setSignupsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

