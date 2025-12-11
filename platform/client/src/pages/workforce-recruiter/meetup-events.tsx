import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEETUP_LOCATIONS } from "@/lib/locations";
import { useAuth } from "@/hooks/useAuth";
import { AnnouncementBanner } from "@/components/announcement-banner";
import type { WorkforceRecruiterMeetupEvent } from "@shared/schema";
import { PaginationControls } from "@/components/pagination-controls";

export default function MeetupEventsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WorkforceRecruiterMeetupEvent | null>(null);
  const limit = 20;

  // Form state
  const [location, setLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);
  const [availability, setAvailability] = useState<string[]>([]);
  const [whyInterested, setWhyInterested] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  const { data, isLoading } = useQuery<{ events: WorkforceRecruiterMeetupEvent[]; total: number }>({
    queryKey: [`/api/workforce-recruiter/meetup-events?isActive=true&limit=${limit}&offset=${page * limit}`],
  });

  const events = data?.events || [];
  const total = data?.total || 0;

  // Check if user already signed up for the selected event (for dialog)
  const { data: existingSignup } = useQuery({
    queryKey: [`/api/workforce-recruiter/meetup-events/${selectedEvent?.id}/my-signup`],
    enabled: !!selectedEvent && !!user && signupDialogOpen,
  });

  // Get user signups for all events to show correct button state
  const { data: userSignups } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/workforce-recruiter/meetup-events/my-signups"],
    queryFn: async () => {
      const signups: Record<string, boolean> = {};
      for (const event of events) {
        try {
          const response = await fetch(`/api/workforce-recruiter/meetup-events/${event.id}/my-signup`);
          const data = await response.json();
          signups[event.id] = !!data;
        } catch (error) {
          signups[event.id] = false;
        }
      }
      return signups;
    },
    enabled: events.length > 0 && !!user,
  });

  // Get signup counts for all events
  const signupCounts = useQuery({
    queryKey: ["/api/workforce-recruiter/meetup-events-signup-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const event of events) {
        try {
          const response = await fetch(`/api/workforce-recruiter/meetup-events/${event.id}/signup-count`);
          const data = await response.json();
          counts[event.id] = data.count || 0;
        } catch (error) {
          counts[event.id] = 0;
        }
      }
      return counts;
    },
    enabled: events.length > 0,
  });

  const signupMutation = useMutation({
    mutationFn: async (data: {
      eventId: string;
      location: string;
      preferredMeetupDate?: Date;
      availability: string[];
      whyInterested?: string;
      additionalComments?: string;
    }) => {
      const payload: any = {
        location: data.location,
        availability: data.availability,
      };
      if (data.preferredMeetupDate) {
        payload.preferredMeetupDate = format(data.preferredMeetupDate, "yyyy-MM-dd");
      }
      if (data.whyInterested?.trim()) {
        payload.whyInterested = data.whyInterested.trim();
      }
      if (data.additionalComments?.trim()) {
        payload.additionalComments = data.additionalComments.trim();
      }
      return apiRequest("POST", `/api/workforce-recruiter/meetup-events/${data.eventId}/signups`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events-signup-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/meetup-events/my-signups"] });
      if (selectedEvent) {
        queryClient.invalidateQueries({ queryKey: [`/api/workforce-recruiter/meetup-events/${selectedEvent.id}/my-signup`] });
        queryClient.invalidateQueries({ queryKey: [`/api/workforce-recruiter/meetup-events/${selectedEvent.id}/signup-count`] });
      }
      setSignupDialogOpen(false);
      setLocation("");
      setPreferredDate(undefined);
      setAvailability([]);
      setWhyInterested("");
      setAdditionalComments("");
      setSelectedEvent(null);
      toast({
        title: "Signed Up Successfully",
        description: "You have successfully signed up for this meetup event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up for event",
        variant: "destructive",
      });
    },
  });

  const handleSignup = (event: WorkforceRecruiterMeetupEvent) => {
    setSelectedEvent(event);
    setSignupDialogOpen(true);
  };

  const toggleAvailability = (option: string) => {
    setAvailability(prev => {
      if (prev.includes(option)) {
        return prev.filter(a => a !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSubmitSignup = () => {
    if (!selectedEvent) return;
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please select a location",
        variant: "destructive",
      });
      return;
    }
    if (availability.length === 0) {
      toast({
        title: "Availability Required",
        description: "Please select at least one availability option",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({
      eventId: selectedEvent.id,
      location,
      preferredMeetupDate: preferredDate,
      availability,
      whyInterested: whyInterested.trim() || undefined,
      additionalComments: additionalComments.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading meetup events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Meetup Events</h1>
        <p className="text-muted-foreground">
          Join in-person meetup events to discuss and explore different occupations
        </p>
      </div>

      <AnnouncementBanner
        apiEndpoint="/api/workforce-recruiter/announcements"
        queryKey="/api/workforce-recruiter/announcements"
      />

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active meetup events at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {events.map((event) => {
              const signupCount = signupCounts.data?.[event.id] || 0;
              const userSignedUp = userSignups?.[event.id] || false;

              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl">{event.title}</CardTitle>
                        {event.description && (
                          <CardDescription className="mt-2">{event.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        <Users className="w-3 h-3 mr-1" />
                        {signupCounts.isLoading ? "..." : signupCount} {signupCount === 1 ? "participant" : "participants"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>Join others interested in discussing this occupation</p>
                      </div>
                      <Button
                        onClick={() => handleSignup(event)}
                        disabled={userSignedUp}
                        data-testid={`button-signup-${event.id}`}
                      >
                        {userSignedUp ? "Already Signed Up" : "Sign Up"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {total > limit && (
            <PaginationControls
              currentPage={page}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Signup Dialog */}
      <Dialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sign Up for Meetup Event</DialogTitle>
            <DialogDescription>
              {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-600">*</span></Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location" data-testid="select-location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {MEETUP_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc} data-testid={`location-option-${loc}`}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!location && (
                <p className="text-xs text-red-600 mt-1">Location is required</p>
              )}
            </div>

            <div>
              <Label>Preferred Meetup Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !preferredDate && "text-muted-foreground"
                    )}
                    data-testid="button-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {preferredDate ? format(preferredDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={preferredDate}
                    onSelect={setPreferredDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Availability <span className="text-red-600">*</span></Label>
              <div className="space-y-2 mt-2">
                {["weekdays", "weekends", "morning", "afternoon", "evening"].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <Checkbox
                      checked={availability.includes(option)}
                      onCheckedChange={() => toggleAvailability(option)}
                      data-testid={`checkbox-availability-${option}`}
                    />
                    <span className="text-sm capitalize">{option}</span>
                  </label>
                ))}
              </div>
              {availability.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Select at least one availability option</p>
              )}
            </div>

            <div>
              <Label htmlFor="why-interested">Why are you interested? (Optional)</Label>
              <Textarea
                id="why-interested"
                value={whyInterested}
                onChange={(e) => setWhyInterested(e.target.value)}
                placeholder="Tell us what interests you about this occupation..."
                rows={4}
                data-testid="textarea-why-interested"
              />
            </div>

            <div>
              <Label htmlFor="additional-comments">Additional Comments (Optional)</Label>
              <Textarea
                id="additional-comments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Any additional information or specific requests..."
                rows={3}
                data-testid="textarea-additional-comments"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSignupDialogOpen(false);
                setLocation("");
                setPreferredDate(undefined);
                setAvailability([]);
                setWhyInterested("");
                setAdditionalComments("");
                setSelectedEvent(null);
              }}
              data-testid="button-cancel-signup"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSignup}
              disabled={signupMutation.isPending || !location || availability.length === 0}
              data-testid="button-submit-signup"
            >
              {signupMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


