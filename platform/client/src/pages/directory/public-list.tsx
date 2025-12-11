import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { MapPin, ArrowRight, Building2, ExternalLink } from "lucide-react";
import { useExternalLink } from "@/hooks/useExternalLink";

type PublicDirectoryProfile = {
  id: string;
  description: string;
  skills: string[];
  sectors?: string[];
  jobTitles?: string[];
  city: string | null;
  state: string | null;
  country: string | null;
  quoraUrl: string | null;
  displayName: string | null;
  userIsVerified: boolean;
  createdAt: string;
};

export default function PublicDirectoryList() {
  const [, setLocation] = useLocation();
  const { openExternal, ExternalLinkDialog } = useExternalLink();

  const { data: profiles = [], isLoading, error } = useQuery<PublicDirectoryProfile[]>({
    queryKey: ["/api/directory/public"],
    queryFn: async () => {
      const res = await fetch("/api/directory/public");
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
  });

  const handleSignUp = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground">Loading directory profiles...</p>
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
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Directory</h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Find talented individuals to collaborate with and exchange skills
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with other survivors who share your skills and interests in our supportive community
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

        {/* Directory Profiles Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">Directory Profiles</h2>
              <p className="text-muted-foreground mt-1">
                {profiles.length} {profiles.length === 1 ? "profile" : "profiles"} available
              </p>
            </div>
          </div>

          {profiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 sm:py-16">
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
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
                const profileUrl = `${window.location.origin}/apps/directory/public/${profile.id}`;

                return (
                  <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow" data-testid={`card-profile-${profile.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg line-clamp-1 flex-1">
                            {profile.displayName || profile.nickname || 'Directory Profile'}
                          </CardTitle>
                          <VerifiedBadge isVerified={profile.userIsVerified || false} testId={`badge-verified-${profile.id}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Description</p>
                          <p className="text-sm line-clamp-2">{profile.description || '—'}</p>
                        </div>

                        {profile.skills && profile.skills.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {profile.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {profile.sectors && profile.sectors.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Sectors</p>
                            <div className="flex flex-wrap gap-1">
                              {profile.sectors.slice(0, 3).map((sector) => (
                                <Badge key={sector} variant="secondary" className="text-xs">
                                  {sector}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {profile.jobTitles && profile.jobTitles.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Job Titles</p>
                            <div className="flex flex-wrap gap-1">
                              {profile.jobTitles.slice(0, 3).map((jobTitle) => (
                                <Badge key={jobTitle} variant="secondary" className="text-xs">
                                  {jobTitle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

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

                        {profile.quoraUrl && (
                          <div className="text-sm">
                            <button
                              onClick={() => openExternal(profile.quoraUrl!)}
                              className="text-primary inline-flex items-center gap-1 hover:underline"
                              data-testid={`link-quora-${profile.id}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Quora profile
                            </button>
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
                  Sign up to create your own profile, showcase your skills, and connect with talented individuals in our supportive community
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

