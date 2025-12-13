import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Users, TrendingUp, Target, AlertCircle, BarChart3, Briefcase, Bell, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import type { WorkforceRecruiterConfig, WorkforceRecruiterOccupation, WorkforceRecruiterMeetupEvent } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { SectorDetailsDialog } from "@/components/sector-details-dialog";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2 } from "lucide-react";

interface SummaryReport {
  totalWorkforceTarget: number;
  totalCurrentRecruited: number;
  percentRecruited: number;
  sectorBreakdown: Array<{ sector: string; target: number; recruited: number; percent: number }>;
  skillLevelBreakdown: Array<{ skillLevel: string; target: number; recruited: number; percent: number }>;
  annualTrainingGap: Array<{ occupationId: string; occupationTitle: string; sector: string; target: number; actual: number; gap: number }>;
}

interface SectorItemProps {
  sector: { sector: string; target: number; recruited: number; percent: number };
}

function SectorItem({ sector }: SectorItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: sectorDetails, isLoading } = useQuery<{
    sector: string;
    target: number;
    recruited: number;
    percent: number;
    jobTitles: Array<{ id: string; name: string; count: number }>;
    skills: Array<{ name: string; count: number }>;
    occupations: Array<{ id: string; title: string; jobTitleId: string | null; headcountTarget: number; skillLevel: string }>;
    profiles: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string;
    }>;
  }>({
    queryKey: [`/api/workforce-recruiter/sector/${encodeURIComponent(sector.sector)}`],
    enabled: isOpen,
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full text-left hover:bg-accent rounded-md p-2 -m-2 transition-colors"
            data-testid={`sector-trigger-${sector.sector}`}
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2 flex-1">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">{sector.sector}</span>
            </div>
            <span className="text-muted-foreground text-sm">
              {sector.recruited.toLocaleString()} / {sector.target.toLocaleString()}
            </span>
          </button>
        </CollapsibleTrigger>
        <Progress value={sector.percent} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {sector.percent.toFixed(1)}% filled
        </div>
        <CollapsibleContent className="pt-2 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : sectorDetails && sectorDetails.jobTitles.length > 0 ? (
            <div className="pl-6 space-y-2 border-l-2 border-muted">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Job Titles
              </h4>
              <div className="space-y-1">
                {sectorDetails.jobTitles.map((jobTitle) => (
                  <div
                    key={jobTitle.id}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <span className="text-muted-foreground">{jobTitle.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {jobTitle.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pl-6 text-xs text-muted-foreground">
              No job titles available for this sector
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function WorkforceRecruiterDashboard() {
  const { data: config, isLoading: configLoading } = useQuery<WorkforceRecruiterConfig>({
    queryKey: ["/api/workforce-recruiter/config"],
  });

  const { data: summaryReport, isLoading: reportLoading } = useQuery<SummaryReport>({
    queryKey: ["/api/workforce-recruiter/reports/summary"],
  });

  const { data: occupationsData, isLoading: occupationsLoading } = useQuery<{
    occupations: WorkforceRecruiterOccupation[];
    total: number;
  }>({
    queryKey: ["/api/workforce-recruiter/occupations?limit=10&offset=0"],
  });

  const { data: meetupEventsData, isLoading: meetupEventsLoading } = useQuery<{
    events: WorkforceRecruiterMeetupEvent[];
    total: number;
  }>({
    queryKey: ["/api/workforce-recruiter/meetup-events?isActive=true&limit=10&offset=0"],
  });

  // Get signup counts for all events
  const { data: signupCounts } = useQuery<Record<string, number>>({
    queryKey: ["/api/workforce-recruiter/meetup-events-signup-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      const events = meetupEventsData?.events || [];
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
    enabled: (meetupEventsData?.events.length || 0) > 0,
  });

  const totalSignups = signupCounts ? Object.values(signupCounts).reduce((sum, count) => sum + count, 0) : 0;

  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);

  if (configLoading || reportLoading || occupationsLoading || meetupEventsLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const workforceTotal = config
    ? Math.round(config.population * parseFloat(config.workforceParticipationRate))
    : 2500000;
  const remainingCapacity = config
    ? config.maxRecruitable - (summaryReport?.totalCurrentRecruited || 0)
    : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Workforce Recruiter Tracker</h1>
          <p className="text-muted-foreground">
            Track recruitment and distribution of workforce for a community of {config?.population.toLocaleString() || "5,000,000"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/apps/workforce-recruiter/occupations">
            <Button variant="outline" data-testid="button-view-occupations">
              <Briefcase className="w-4 h-4 mr-2" />
              View Occupations
            </Button>
          </Link>
          <Link href="/apps/workforce-recruiter/reports">
            <Button variant="outline" data-testid="button-view-reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link href="/apps/workforce-recruiter/meetup-events">
            <Button variant="outline" data-testid="button-view-meetup-events">
              <Calendar className="w-4 h-4 mr-2" />
              Meetup Events
            </Button>
          </Link>
        </div>
      </div>

      <AnnouncementBanner
        apiEndpoint="/api/workforce-recruiter/announcements"
        queryKey="/api/workforce-recruiter/announcements"
      />

      {/* Top-line Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config?.population.toLocaleString() || "5,000,000"}</div>
            <p className="text-xs text-muted-foreground mt-1">Community size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workforce Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {config ? `${(parseFloat(config.workforceParticipationRate) * 100).toFixed(0)}% participation rate` : "50% participation rate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Headcount Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryReport?.totalWorkforceTarget.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Target positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recruited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryReport?.totalCurrentRecruited.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryReport ? `${summaryReport.percentRecruited.toFixed(1)}% of target` : "0% of target"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Recruitment Progress</CardTitle>
          <CardDescription>Overall progress toward workforce targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-medium">
                  {summaryReport?.percentRecruited.toFixed(1) || "0"}%
                </span>
              </div>
              <Progress value={summaryReport?.percentRecruited || 0} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Remaining Capacity: </span>
                <span className="font-medium">{remainingCapacity.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Min Recruitable: </span>
                <span className="font-medium">{config?.minRecruitable.toLocaleString() || "2,000,000"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Level Breakdown</CardTitle>
          <CardDescription>Recruitment progress by skill level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {summaryReport?.skillLevelBreakdown.map((skill) => (
              <Link
                key={skill.skillLevel}
                href={`/apps/workforce-recruiter/skill-level/${encodeURIComponent(skill.skillLevel)}`}
                className="block"
              >
                <div className="space-y-2 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors" data-testid={`skill-level-${skill.skillLevel}`}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.skillLevel}</span>
                    <span className="text-muted-foreground">
                      {skill.recruited.toLocaleString()} / {skill.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={skill.percent} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {skill.percent.toFixed(1)}% filled
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sector Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
            <CardDescription>Target vs Recruited by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryReport?.sectorBreakdown.slice(0, 8).map((sector) => (
                <SectorItem key={sector.sector} sector={sector} />
              ))}
              {summaryReport && summaryReport.sectorBreakdown.length > 8 && (
                <Link href="/apps/workforce-recruiter/reports">
                  <Button variant="outline" className="w-full" size="sm">
                    View All Sectors
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Occupations by Gap */}
        <Card>
          <CardHeader>
            <CardTitle>Top Training Gaps</CardTitle>
            <CardDescription>Occupations with largest annual training gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryReport?.annualTrainingGap.length === 0 ? (
                <p className="text-sm text-muted-foreground">No training gaps identified</p>
              ) : (
                summaryReport?.annualTrainingGap.slice(0, 10).map((gap) => (
                  <div key={gap.occupationId} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{gap.occupationTitle}</p>
                        <p className="text-xs text-muted-foreground">{gap.sector}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Gap: {gap.gap.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: {gap.target.toLocaleString()} | Actual: {gap.actual.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
              <Link href="/apps/workforce-recruiter/reports">
                <Button variant="outline" className="w-full" size="sm">
                  View Full Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetup Events Widget */}
      {meetupEventsData && meetupEventsData.events.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Meetup Events</CardTitle>
                <CardDescription>Active meetup events and participant signups</CardDescription>
              </div>
              <Link href="/apps/workforce-recruiter/meetup-events">
                <Button variant="outline" size="sm" data-testid="button-view-all-meetup-events">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetupEventsData.events.slice(0, 5).map((event) => {
                const signupCount = signupCounts?.[event.id] || 0;
                return (
                  <div key={event.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        <Users className="w-3 h-3 mr-1" />
                        {signupCount} {signupCount === 1 ? "participant" : "participants"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {meetupEventsData.total > 5 && (
                <Link href="/apps/workforce-recruiter/meetup-events">
                  <Button variant="outline" className="w-full" size="sm">
                    View All {meetupEventsData.total} Events
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Signups</span>
                <span className="text-lg font-semibold">{totalSignups}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              View platform updates and notifications
            </p>
            <Link href="/apps/workforce-recruiter/announcements">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-announcements">
                View Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Sector Summary */}
      {/* This section is not directly related to the edit, but it's part of the new_code.
          It will be added based on the new_code's structure. */}
      {/* <SectorDetailsDialog
        sector={selectedSector}
        open={sectorDialogOpen}
        onOpenChange={setSectorDialogOpen}
      /> */}
    </div>
  );
}

