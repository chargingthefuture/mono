import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Building2, UserCheck, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { PrivacyField } from "@/components/ui/privacy-field";
import { useExternalLink } from "@/hooks/useExternalLink";
import { Link } from "wouter";
import type { LighthouseProfile, LighthouseProperty, LighthouseMatch } from "@shared/schema";

type SeekerWithUser = LighthouseProfile & {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    isVerified: boolean;
  } | null;
  displayName?: string | null;
};

type HostWithUser = LighthouseProfile & {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    isVerified: boolean;
  } | null;
  displayName?: string | null;
};

export default function LighthouseAdminPage() {
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  
  const formatPropertyType = (type: string) => {
    const labels: Record<string, string> = {
      room: "Private Room",
      apartment: "Full Apartment",
      community: "Community Housing",
      rv_camper: "RV/Camper",
    };
    return labels[type] || type;
  };
  
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/lighthouse/admin/stats"],
  });

  const { data: seekers = [], isLoading: seekersLoading, error: seekersError } = useQuery<SeekerWithUser[]>({
    queryKey: ["/api/lighthouse/admin/seekers"],
    queryFn: async () => {
      const res = await fetch("/api/lighthouse/admin/seekers", {
        credentials: "include",
      });
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received:", text.substring(0, 500));
        throw new Error(`Server returned ${contentType} instead of JSON. Status: ${res.status}`);
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText}`);
      }
      return await res.json();
    },
  });

  const { data: hosts = [], isLoading: hostsLoading, error: hostsError } = useQuery<HostWithUser[]>({
    queryKey: ["/api/lighthouse/admin/hosts"],
    queryFn: async () => {
      const res = await fetch("/api/lighthouse/admin/hosts", {
        credentials: "include",
      });
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response received:", text.substring(0, 500));
        throw new Error(`Server returned ${contentType} instead of JSON. Status: ${res.status}`);
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText}`);
      }
      return await res.json();
    },
  });

  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery<LighthouseProperty[]>({
    queryKey: ["/api/lighthouse/admin/properties"],
  });

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery<LighthouseMatch[]>({
    queryKey: ["/api/lighthouse/admin/matches"],
  });

  useEffect(() => {
    if (seekersError) {
      console.error("Seekers error:", seekersError);
    }
  }, [seekers, seekersError]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              LightHouse Admin
            </h1>
            <p className="text-muted-foreground">
              Manage housing platform and matches
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="stat-card-seekers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Housing Seekers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-seekers">
              {stats?.totalSeekers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active profiles
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-card-hosts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Housing Hosts
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-hosts">
              {stats?.totalHosts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active profiles
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-card-properties">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-properties">
              {stats?.totalProperties || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available listings
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-card-matches">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Matches
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-matches">
              {stats?.activeMatches || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedMatches || 0} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Housing Seekers</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
              </p>
            </div>

            <div className="mt-6">
              {seekersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading seekers...</div>
              ) : seekersError ? (
                <div className="text-center py-8">
                  <p className="text-destructive font-medium">Error loading seekers</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {seekersError instanceof Error ? seekersError.message : 'Unknown error'}
                  </p>
                </div>
              ) : seekers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No housing seekers found</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Housing Needs</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Move-In Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seekers.map((seeker) => {
                        const userName = seeker.user
                          ? [seeker.user.firstName, seeker.user.lastName].filter(Boolean).join(' ') || 'User'
                          : 'Unknown User';
                        const displayName = seeker.displayName || userName;
                        const budgetRange = seeker.budgetMin && seeker.budgetMax
                          ? `$${seeker.budgetMin} - $${seeker.budgetMax}`
                          : seeker.budgetMin
                          ? `From $${seeker.budgetMin}`
                          : seeker.budgetMax
                          ? `Up to $${seeker.budgetMax}`
                          : 'Not specified';
                        const moveInDate = seeker.moveInDate
                          ? new Date(seeker.moveInDate).toLocaleDateString()
                          : 'Not specified';

                        const seekerProfileUrl = `${window.location.origin}/apps/lighthouse/admin/profile/${seeker.id}`;

                        return (
                          <TableRow key={seeker.id} data-testid={`row-seeker-${seeker.id}`}>
                            <TableCell className="font-medium">
                              <button
                                onClick={() => openExternal(seekerProfileUrl)}
                                className="text-primary hover:underline inline-flex items-center gap-1"
                                data-testid={`link-seeker-${seeker.id}`}
                              >
                                {userName}
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </TableCell>
                            <TableCell>{displayName}</TableCell>
                            <TableCell>
                              {seeker.user?.email ? (
                                <PrivacyField
                                  value={seeker.user.email}
                                  type="email"
                                  testId={`email-seeker-${seeker.id}`}
                                />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {seeker.user ? (
                                <VerifiedBadge isVerified={seeker.user.isVerified || seeker.isVerified} testId={`badge-seeker-${seeker.id}`} />
                              ) : (
                                <Badge variant="outline">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={seeker.housingNeeds || undefined}>
                                {seeker.housingNeeds || <span className="text-muted-foreground">—</span>}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{budgetRange}</TableCell>
                            <TableCell>{moveInDate}</TableCell>
                            <TableCell>
                              {seeker.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Housing Hosts</CardTitle>
          <CardDescription>
            All host profiles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mt-6">
              {hostsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading hosts...</div>
              ) : hostsError ? (
                <div className="text-center py-8">
                  <p className="text-destructive font-medium">Error loading hosts</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hostsError instanceof Error ? hostsError.message : 'Unknown error'}
                  </p>
                </div>
              ) : hosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No housing hosts found</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Has Property</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hosts.map((host) => {
                        const userName = host.user
                          ? [host.user.firstName, host.user.lastName].filter(Boolean).join(' ') || 'User'
                          : 'Unknown User';
                        const displayName = host.displayName || userName;
                        const hostProfileUrl = `${window.location.origin}/apps/lighthouse/admin/profile/${host.id}`;

                        return (
                          <TableRow key={host.id} data-testid={`row-host-${host.id}`}>
                            <TableCell className="font-medium">
                              <button
                                onClick={() => openExternal(hostProfileUrl)}
                                className="text-primary hover:underline inline-flex items-center gap-1"
                                data-testid={`link-host-${host.id}`}
                              >
                                {userName}
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </TableCell>
                            <TableCell>{displayName}</TableCell>
                            <TableCell>
                              {host.user?.email ? (
                                <PrivacyField
                                  value={host.user.email}
                                  type="email"
                                  testId={`email-host-${host.id}`}
                                />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {host.user ? (
                                <VerifiedBadge isVerified={host.user.isVerified || host.isVerified} testId={`badge-host-${host.id}`} />
                              ) : (
                                <Badge variant="outline">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={host.bio || undefined}>
                                {host.bio || <span className="text-muted-foreground">—</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              {host.hasProperty ? (
                                <Badge variant="default">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {host.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            All property listings in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mt-6">
              {propertiesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading properties...</div>
              ) : propertiesError ? (
                <div className="text-center py-8">
                  <p className="text-destructive font-medium">Error loading properties</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {propertiesError instanceof Error ? propertiesError.message : 'Unknown error'}
                  </p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No properties found</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Bedrooms</TableHead>
                        <TableHead>Bathrooms</TableHead>
                        <TableHead>Monthly Rent</TableHead>
                        <TableHead>Available From</TableHead>
                        <TableHead>Airbnb Profile</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => {
                        const location = `${property.city}, ${property.state} ${property.zipCode}`;
                        const availableFrom = property.availableFrom
                          ? new Date(property.availableFrom).toLocaleDateString()
                          : 'Not specified';

                        const propertyUrl = `${window.location.origin}/apps/lighthouse/property/${property.id}`;

                        return (
                          <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
                            <TableCell className="font-medium">
                              <button
                                onClick={() => openExternal(propertyUrl)}
                                className="text-primary hover:underline inline-flex items-center gap-1"
                                data-testid={`link-property-${property.id}`}
                              >
                                {property.title}
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{formatPropertyType(property.propertyType)}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={location}>
                                {location}
                              </div>
                            </TableCell>
                            <TableCell>{property.bedrooms ?? '—'}</TableCell>
                            <TableCell>{property.bathrooms ?? '—'}</TableCell>
                            <TableCell className="font-mono text-sm">
                              ${property.monthlyRent}
                            </TableCell>
                            <TableCell>{availableFrom}</TableCell>
                            <TableCell>
                              {property.airbnbProfileUrl ? (
                                <button
                                  onClick={() => openExternal(property.airbnbProfileUrl!)}
                                  className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                                  data-testid={`link-airbnb-${property.id}`}
                                >
                                  View Profile
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {property.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Matches</CardTitle>
          <CardDescription>
            All matches between seekers and properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mt-6">
              {matchesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading matches...</div>
              ) : matchesError ? (
                <div className="text-center py-8">
                  <p className="text-destructive font-medium">Error loading matches</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {matchesError instanceof Error ? matchesError.message : 'Unknown error'}
                  </p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No matches found</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seeker ID</TableHead>
                        <TableHead>Property ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Proposed Move-In</TableHead>
                        <TableHead>Actual Move-In</TableHead>
                        <TableHead>Proposed Move-Out</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match) => {
                        const proposedMoveIn = match.proposedMoveInDate
                          ? new Date(match.proposedMoveInDate).toLocaleDateString()
                          : '—';
                        const actualMoveIn = match.actualMoveInDate
                          ? new Date(match.actualMoveInDate).toLocaleDateString()
                          : '—';
                        const proposedMoveOut = match.proposedMoveOutDate
                          ? new Date(match.proposedMoveOutDate).toLocaleDateString()
                          : '—';
                        const created = match.createdAt
                          ? new Date(match.createdAt).toLocaleDateString()
                          : '—';

                        const statusVariant = match.status === 'accepted' ? 'default' 
                          : match.status === 'pending' ? 'secondary'
                          : match.status === 'completed' ? 'default'
                          : match.status === 'rejected' ? 'destructive'
                          : 'outline';

                        return (
                          <TableRow key={match.id} data-testid={`row-match-${match.id}`}>
                            <TableCell className="font-mono text-sm">{match.seekerId.substring(0, 8)}...</TableCell>
                            <TableCell className="font-mono text-sm">{match.propertyId.substring(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant}>{match.status}</Badge>
                            </TableCell>
                            <TableCell>{proposedMoveIn}</TableCell>
                            <TableCell>{actualMoveIn}</TableCell>
                            <TableCell>{proposedMoveOut}</TableCell>
                            <TableCell>{created}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create and manage announcements for LightHouse.
          </p>
          <Link href="/apps/lighthouse/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}
