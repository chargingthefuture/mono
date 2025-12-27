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
import { ArrowLeft, Plus, Edit, Trash2, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { PaginationControls } from "@/components/pagination-controls";
import type { WorkforceRecruiterOccupation } from "@shared/schema";
import { insertWorkforceRecruiterOccupationSchema } from "@shared/schema";
import { format } from "date-fns";

const occupationFormSchema = insertWorkforceRecruiterOccupationSchema;
type OccupationFormValues = z.infer<typeof occupationFormSchema>;

export default function WorkforceRecruiterAdminOccupations() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [occupationToDelete, setOccupationToDelete] = useState<WorkforceRecruiterOccupation | null>(null);
  const [meetupEventDialogOpen, setMeetupEventDialogOpen] = useState(false);
  const [selectedOccupation, setSelectedOccupation] = useState<WorkforceRecruiterOccupation | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const limit = 20;

  const { data, isLoading } = useQuery<{ occupations: WorkforceRecruiterOccupation[]; total: number }>({
    queryKey: [`/api/workforce-recruiter/occupations?limit=${limit}&offset=${page * limit}`],
  });

  const occupations = data?.occupations || [];
  const total = data?.total || 0;

  const filteredOccupations = useFuzzySearch(occupations, searchQuery, {
    searchFields: ["occupationTitle", "sector"],
    threshold: 0.3,
  });

  const form = useForm<OccupationFormValues>({
    resolver: zodResolver(occupationFormSchema),
    defaultValues: {
      sector: "",
      occupationTitle: "",
      headcountTarget: 0,
      skillLevel: "Intermediate",
      annualTrainingTarget: 0,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OccupationFormValues) => {
      return apiRequest("POST", "/api/workforce-recruiter/occupations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/occupations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/reports/summary"] });
      form.reset();
      toast({
        title: "Occupation Created",
        description: "The occupation has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create occupation",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OccupationFormValues> }) => {
      return apiRequest("PUT", `/api/workforce-recruiter/occupations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/occupations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/reports/summary"] });
      setEditingId(null);
      form.reset();
      toast({
        title: "Occupation Updated",
        description: "The occupation has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update occupation",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/workforce-recruiter/occupations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/occupations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/reports/summary"] });
      setDeleteDialogOpen(false);
      setOccupationToDelete(null);
      toast({
        title: "Occupation Deleted",
        description: "The occupation has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete occupation",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (occupation: WorkforceRecruiterOccupation) => {
    setEditingId(occupation.id);
    form.reset({
      sector: occupation.sector,
      occupationTitle: occupation.occupationTitle,
      headcountTarget: occupation.headcountTarget,
      skillLevel: occupation.skillLevel as "Foundational" | "Intermediate" | "Advanced",
      annualTrainingTarget: occupation.annualTrainingTarget,
      notes: occupation.notes || "",
    });
  };

  const handleDelete = (occupation: WorkforceRecruiterOccupation) => {
    setOccupationToDelete(occupation);
    setDeleteDialogOpen(true);
  };

  const meetupEventMutation = useMutation({
    mutationFn: async (data: { occupationId: string; title: string; description?: string }) => {
      return apiRequest("POST", "/api/workforce-recruiter/meetup-events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/occupations"] });
      setMeetupEventDialogOpen(false);
      setEventTitle("");
      setEventDescription("");
      setSelectedOccupation(null);
      toast({
        title: "Meetup Event Created",
        description: "The meetup event has been created successfully. Users can now sign up to participate.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create meetup event",
        variant: "destructive",
      });
    },
  });

  const handleCreateMeetupEvent = (occupation: WorkforceRecruiterOccupation) => {
    setSelectedOccupation(occupation);
    setEventTitle(`Meetup for ${occupation.occupationTitle}`);
    setEventDescription("");
    setMeetupEventDialogOpen(true);
  };

  const handleSubmitMeetupEvent = () => {
    if (!selectedOccupation) return;
    if (!eventTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter an event title",
        variant: "destructive",
      });
      return;
    }

    meetupEventMutation.mutate({
      occupationId: selectedOccupation.id,
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
    });
  };

  const onSubmit = (data: OccupationFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getSkillLevelBadgeVariant = (skillLevel: string) => {
    switch (skillLevel) {
      case "Advanced":
        return "default";
      case "Intermediate":
        return "secondary";
      case "Foundational":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading occupations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <MiniAppBackButton />
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Manage Occupations</h1>
          <p className="text-muted-foreground">
            Create, edit, and delete workforce occupations
          </p>
        </div>
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Occupation" : "Create New Occupation"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-sector" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupationTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation Title</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-occupation-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="headcountTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headcount Target</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          data-testid="input-headcount-target"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-skill-level">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Foundational">Foundational</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualTrainingTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Training Target</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          data-testid="input-annual-training-target"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} data-testid="textarea-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-occupation"
                >
                  {editingId
                    ? updateMutation.isPending
                      ? "Updating..."
                      : "Update Occupation"
                    : createMutation.isPending
                    ? "Creating..."
                    : "Create Occupation"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                    data-testid="button-cancel-edit"
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
        <CardHeader>
          <CardTitle>Search Occupations</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by title or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </CardContent>
      </Card>

      {/* Occupations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Occupations ({filteredOccupations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOccupations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No occupations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Sector</th>
                    <th className="text-left p-2 text-sm font-medium">Occupation</th>
                    <th className="text-right p-2 text-sm font-medium">Target</th>
                    <th className="text-center p-2 text-sm font-medium">Skill</th>
                    <th className="text-right p-2 text-sm font-medium">Training Target</th>
                    <th className="text-center p-2 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOccupations.map((occupation) => (
                    <tr key={occupation.id} className="border-b hover:bg-accent/50">
                      <td className="p-2 text-sm">{occupation.sector}</td>
                      <td className="p-2 text-sm font-medium">{occupation.occupationTitle}</td>
                      <td className="p-2 text-sm text-right">{occupation.headcountTarget.toLocaleString()}</td>
                      <td className="p-2 text-center">
                        <Badge variant={getSkillLevelBadgeVariant(occupation.skillLevel)}>
                          {occupation.skillLevel}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-right">{occupation.annualTrainingTarget.toLocaleString()}</td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(occupation)}
                            data-testid={`button-edit-${occupation.id}`}
                            title="Edit occupation"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCreateMeetupEvent(occupation)}
                            data-testid={`button-create-meetup-event-${occupation.id}`}
                            title="Create in-person meetup event for this occupation"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(occupation)}
                            data-testid={`button-delete-${occupation.id}`}
                            title="Delete occupation"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
            <DialogTitle>Delete Occupation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{occupationToDelete?.occupationTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setOccupationToDelete(null);
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (occupationToDelete) {
                  deleteMutation.mutate(occupationToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meetup Event Dialog */}
      <Dialog open={meetupEventDialogOpen} onOpenChange={setMeetupEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create In-Person Meetup Event</DialogTitle>
            <DialogDescription>
              Create an in-person meetup event for <strong>{selectedOccupation?.occupationTitle}</strong>. This will allow community members to sign up and meet to discuss this occupation, share experiences, and explore opportunities in this role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title <span className="text-red-600">*</span></Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g., Meetup for Software Engineers"
                data-testid="input-event-title"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                A clear title for the meetup event
              </p>
            </div>
            <div>
              <Label htmlFor="event-description">Description (Optional)</Label>
              <Textarea
                id="event-description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Additional details about the meetup event..."
                data-testid="textarea-event-description"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide more context about what will be discussed at the meetup
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMeetupEventDialogOpen(false);
                setEventTitle("");
                setEventDescription("");
                setSelectedOccupation(null);
              }}
              data-testid="button-cancel-meetup-event"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMeetupEvent}
              disabled={meetupEventMutation.isPending || !eventTitle.trim()}
              data-testid="button-submit-meetup-event"
            >
              {meetupEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

