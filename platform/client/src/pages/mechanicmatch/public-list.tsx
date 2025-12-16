import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { MapPin, ArrowRight, Wrench, Star, DollarSign, ExternalLink, Briefcase } from "lucide-react";
import { useExternalLink } from "@/hooks/useExternalLink";
import type { MechanicmatchProfile } from "@shared/schema";

type PublicMechanicMatchProfile = MechanicmatchProfile & {
  userIsVerified?: boolean;
  firstName?: string | null;
};

export default function PublicMechanicMatchList() {
  const [, setLocation] = useLocation();
  const { openExternal, ExternalLinkDialog } = useExternalLink();

  const { data: profiles = [], isLoading, error } = useQuery<PublicMechanicMatchProfile[]>({
    queryKey: ["/api/mechanicmatch/public"],
    queryFn: async () => {
      const res = await fetch("/api/mechanicmatch/public");
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
  });

  const handleSignUp = () => {
    setLocation("/");
  };

  const formatSpecialties = (specialties: string | null) => {
    if (!specialties) return [];
    try {
      const parsed = JSON.parse(specialties);
      return Array.isArray(parsed) ? parsed : [specialties];
    } catch {
      return specialties.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground">Loading MechanicMatch profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-16">
            <p className="text-destructive">Error loading profiles</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6 pt-8 sm:pt-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">MechanicMatch</h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Connect with trusted mechanics and car owners in your community
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Find skilled mechanics for your vehicle needs or showcase your automotive expertise
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={handleSignUp}
              size="lg"
              className="text-base sm:text-lg px-8"
              data-testid="button-sign-up"
            >
              Sign Up to Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Profiles Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">Public Profiles</h2>
              <p className="text-muted-foreground mt-1">
                {profiles.length} {profiles.length === 1 ? "profile" : "profiles"} available
              </p>
            </div>
          </div>

          {profiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 sm:py-16">
                  <Wrench className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg sm:text-xl font-medium mb-2">No profiles yet</p>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a profile and start connecting with others
                  </p>
                  <Button onClick={handleSignUp} data-testid="button-sign-up-empty">
                    Sign Up to Create a Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {profiles.map((profile) => {
                const profileUrl = `${window.location.origin}/apps/mechanicmatch/public/${profile.id}`;
                const specialties = formatSpecialties(profile.specialties);
                const isMechanic = profile.isMechanic || false;
                const isCarOwner = profile.isCarOwner || false;

                const displayName = profile.firstName?.trim() || "MechanicMatch Profile";

                return (
                  <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow" data-testid={`card-profile-${profile.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg line-clamp-1 flex-1">
                            {displayName}
                          </CardTitle>
                          <VerifiedBadge isVerified={profile.userIsVerified || false} testId={`badge-verified-${profile.id}`} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {isMechanic && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            Mechanic
                          </Badge>
                        )}
                        {isCarOwner && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Car Owner
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        {(profile.city || profile.state || profile.country) && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {[profile.city, profile.state, profile.country]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}

                        {isMechanic && profile.mechanicBio && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">About</p>
                            <p className="text-sm line-clamp-2">{profile.mechanicBio}</p>
                          </div>
                        )}

                        {isCarOwner && profile.ownerBio && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">About</p>
                            <p className="text-sm line-clamp-2">{profile.ownerBio}</p>
                          </div>
                        )}

                        {isMechanic && specialties.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Specialties</p>
                            <div className="flex flex-wrap gap-1">
                              {specialties.slice(0, 3).map((specialty, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {specialties.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{specialties.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {isMechanic && (
                          <div className="flex items-center justify-between text-sm">
                            {profile.hourlyRate && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">${parseFloat(profile.hourlyRate)}/hr</span>
                              </div>
                            )}
                            {profile.averageRating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{parseFloat(profile.averageRating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {isMechanic && profile.experience !== null && (
                          <div className="text-xs text-muted-foreground">
                            {profile.experience} {profile.experience === 1 ? 'year' : 'years'} experience
                            {profile.totalJobsCompleted !== null && profile.totalJobsCompleted > 0 && (
                              <> • {profile.totalJobsCompleted} {profile.totalJobsCompleted === 1 ? 'job' : 'jobs'} completed</>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => openExternal(profileUrl)}
                          data-testid={`button-view-profile-${profile.id}`}
                        >
                          View Profile
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        {profiles.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold">Join Our Community</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Sign up to create your own profile, connect with mechanics, or showcase your automotive expertise
                </p>
                <Button
                  onClick={handleSignUp}
                  size="lg"
                  className="mt-4"
                  data-testid="button-sign-up-bottom"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <ExternalLinkDialog />
      </div>
    </div>
  );
}

