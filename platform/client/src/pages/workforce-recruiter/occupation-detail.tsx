import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PaginationControls } from "@/components/pagination-controls";
import { format } from "date-fns";
import type { WorkforceRecruiterOccupation, WorkforceRecruiterMeetupEvent } from "@shared/schema";

export default function WorkforceRecruiterOccupationDetail() {
  const params = useParams();
  const occupationId = params.id;
  const [eventsPage, setEventsPage] = useState(0);
  const eventsLimit = 20;

  const { data: occupation, isLoading } = useQuery<WorkforceRecruiterOccupation>({
    queryKey: [`/api/workforce-recruiter/occupations/${occupationId}`],
    enabled: !!occupationId,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{
    events: WorkforceRecruiterMeetupEvent[];
    total: number;
  }>({
    queryKey: [`/api/workforce-recruiter/meetup-events?occupationId=${occupationId}&limit=${eventsLimit}&offset=${eventsPage * eventsLimit}`],
    enabled: !!occupationId,
  });

  const events = eventsData?.events || [];
  const eventsTotal = eventsData?.total || 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!occupation) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Occupation not found</p>
          <Link href="/apps/workforce-recruiter/occupations">
            <Button className="mt-4" variant="outline">
              Back to Occupations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const percentFilled = occupation.headcountTarget > 0
    ? (occupation.currentRecruited / occupation.headcountTarget) * 100
    : 0;

  const getSkillLevelBadgeVariant = (skillLevel: string) => {
    switch (skillLevel) {
      case "Foundational":
        return "default";
      case "Intermediate":
        return "secondary";
      case "Advanced":
        return "destructive";
      default:
        return "outline";
    }
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/apps/workforce-recruiter/occupations">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">{occupation.occupationTitle}</h1>
          <p className="text-muted-foreground">
            Detailed information about this occupation
          </p>
        </div>
      </div>

      <AnnouncementBanner
        apiEndpoint="/api/workforce-recruiter/announcements"
        queryKey="/api/workforce-recruiter/announcements"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Sector</p>
              <p className="text-base font-medium">{occupation.sector}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Skill Level</p>
              <Badge variant={getSkillLevelBadgeVariant(occupation.skillLevel)}>
                {occupation.skillLevel}
              </Badge>
            </div>
            {occupation.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-base">{occupation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recruitment Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Recruitment Progress</span>
                <span className="font-medium">{percentFilled.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(percentFilled, 100)} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Headcount Target</p>
                <p className="text-2xl font-bold">{occupation.headcountTarget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Recruited</p>
                <p className="text-2xl font-bold">{occupation.currentRecruited.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-xl font-semibold">
                {(occupation.headcountTarget - occupation.currentRecruited).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Information */}
      <Card>
        <CardHeader>
          <CardTitle>Training Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Annual Training Target</p>
              <p className="text-2xl font-bold">{occupation.annualTrainingTarget.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetup Events */}
      <Card>
        <CardHeader>
          <CardTitle>Meetup Events</CardTitle>
          <CardDescription>
            In-person events for this occupation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No meetup events created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 space-y-2"
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant={event.isActive ? "default" : "secondary"}>
                            {event.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(event.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created by: {event.createdBy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <PaginationControls
                currentPage={eventsPage}
                totalItems={eventsTotal}
                itemsPerPage={eventsLimit}
                onPageChange={setEventsPage}
                className="mt-6"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


