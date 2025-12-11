import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Wrench, Car, Plus, Settings, Search, Calendar, MessageSquare } from "lucide-react";
import type { MechanicmatchProfile, MechanicmatchJob, MechanicmatchServiceRequest } from "@shared/schema";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useAuth } from "@/hooks/useAuth";

export default function MechanicMatchDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data: profile, isLoading: profileLoading } = useQuery<MechanicmatchProfile | null>({
    queryKey: ["/api/mechanicmatch/profile"],
  });

  // Jobs for car owners
  const { data: myJobs } = useQuery<MechanicmatchJob[]>({
    queryKey: ["/api/mechanicmatch/jobs"],
    enabled: !!profile?.isCarOwner,
  });

  // Service requests for car owners (limit to latest 5 for dashboard)
  const { data: myRequestsData } = useQuery<{ items: MechanicmatchServiceRequest[]; total: number }>({
    queryKey: ["/api/mechanicmatch/service-requests?limit=5&offset=0"],
    enabled: !!profile?.isCarOwner,
  });
  const myRequests = myRequestsData?.items ?? [];
  const myRequestsTotal = myRequestsData?.total ?? 0;

  // Jobs for mechanics
  const { data: mechanicJobs } = useQuery<MechanicmatchJob[]>({
    queryKey: ["/api/mechanicmatch/jobs"],
    enabled: !!profile?.isMechanic,
  });

  if (profileLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no profile, show welcome screen
  if (!profile) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Welcome to MechanicMatch</h1>
            <p className="text-muted-foreground">
              Connect with trusted mechanics for your vehicle needs
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your MechanicMatch profile to get started. You can be both a car owner and a mechanic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Car className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">As a Car Owner</h3>
                  <p className="text-sm text-muted-foreground">
                    List your vehicles, post service requests, and connect with mechanics for advice, remote diagnosis, or in-person service.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Wrench className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">As a Mechanic</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your professional profile, set availability, and help car owners with their vehicle issues.
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setLocation("/apps/mechanicmatch/profile")} 
              className="w-full"
              data-testid="button-create-profile"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCarOwner = profile.isCarOwner;
  const isMechanic = profile.isMechanic;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">MechanicMatch</h1>
          <p className="text-muted-foreground">
            {isCarOwner && isMechanic && "Manage your vehicles and mechanic services"}
            {isCarOwner && !isMechanic && "Connect with trusted mechanics for your vehicle needs"}
            {!isCarOwner && isMechanic && "Help car owners with their vehicle issues"}
          </p>
        </div>
        <Link href="/apps/mechanicmatch/profile">
          <Button variant="outline" size="sm" data-testid="button-edit-profile">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/mechanicmatch/announcements"
        queryKey="/api/mechanicmatch/announcements"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isCarOwner && <TabsTrigger value="owner">Car Owner</TabsTrigger>}
          {isMechanic && <TabsTrigger value="mechanic">Mechanic</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {isCarOwner && (
              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Car Owner</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">My Vehicles</span>
                    <Badge variant="secondary">{profile ? "View" : "0"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Service Requests</span>
                    <Badge variant="secondary">{myRequestsTotal}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Jobs</span>
                    <Badge variant="secondary">{myJobs?.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length || 0}</Badge>
                  </div>
                  <Link href="/apps/mechanicmatch/service-requests">
                    <Button variant="outline" className="w-full" data-testid="button-view-service-requests">
                      View Requests
                    </Button>
                  </Link>
                  <Link href="/apps/mechanicmatch/vehicles">
                    <Button variant="outline" className="w-full" data-testid="button-manage-vehicles">
                      Manage Vehicles
                    </Button>
                  </Link>
                  <Link href="/apps/mechanicmatch/browse-mechanics">
                    <Button variant="outline" className="w-full" data-testid="button-browse-mechanics">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Mechanics
                    </Button>
                  </Link>
                  <Link href="/apps/mechanicmatch/request-new">
                    <Button className="w-full" data-testid="button-new-request">
                      <Plus className="w-4 h-4 mr-2" />
                      New Service Request
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {isMechanic && (
              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Mechanic</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Jobs</span>
                    <Badge variant="secondary">{mechanicJobs?.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobs Completed</span>
                    <Badge variant="secondary">{profile.totalJobsCompleted || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <Badge variant="secondary">{profile.averageRating ? `${parseFloat(profile.averageRating).toFixed(1)}★` : "N/A"}</Badge>
                  </div>
                  <Link href="/apps/mechanicmatch/availability">
                    <Button variant="outline" className="w-full" data-testid="button-manage-availability">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Availability
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {isCarOwner && (
          <TabsContent value="owner" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Car Owner Dashboard</h2>
              <Link href="/apps/mechanicmatch/request-new">
                <Button data-testid="button-new-service-request">
                  <Plus className="w-4 h-4 mr-2" />
                  New Service Request
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Vehicles</CardTitle>
                <CardDescription>Manage your vehicle list</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/apps/mechanicmatch/vehicles">
                  <Button variant="outline" className="w-full" data-testid="button-view-vehicles">
                    View All Vehicles
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>Your active service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {myRequests && myRequests.length > 0 ? (
                  <div className="space-y-4">
                    {myRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{request.symptoms.substring(0, 50)}...</p>
                            <p className="text-sm text-muted-foreground capitalize">{request.requestType.replace('_', ' ')}</p>
                          </div>
                          <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No service requests yet</p>
                )}
                <Link href="/apps/mechanicmatch/service-requests">
                  <Button variant="outline" className="mt-4 w-full" data-testid="button-manage-requests">
                    Manage Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Jobs</CardTitle>
                <CardDescription>Track your jobs with mechanics</CardDescription>
              </CardHeader>
              <CardContent>
                {myJobs && myJobs.length > 0 ? (
                  <div className="space-y-4">
                    {myJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{job.symptoms.substring(0, 50)}...</p>
                            <p className="text-sm text-muted-foreground capitalize">{job.jobType.replace('_', ' ')}</p>
                          </div>
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No jobs yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isMechanic && (
          <TabsContent value="mechanic" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Mechanic Dashboard</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Jobs</CardTitle>
                <CardDescription>Manage your active jobs</CardDescription>
              </CardHeader>
              <CardContent>
                {mechanicJobs && mechanicJobs.length > 0 ? (
                  <div className="space-y-4">
                    {mechanicJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{job.symptoms.substring(0, 50)}...</p>
                            <p className="text-sm text-muted-foreground capitalize">{job.jobType.replace('_', ' ')}</p>
                          </div>
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No jobs yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Jobs Completed</span>
                  <Badge variant="secondary">{profile.totalJobsCompleted || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Rating</span>
                  <Badge variant="secondary">{profile.averageRating ? `${parseFloat(profile.averageRating).toFixed(1)}★` : "N/A"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hourly Rate</span>
                  <Badge variant="secondary">{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "Not set"}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
