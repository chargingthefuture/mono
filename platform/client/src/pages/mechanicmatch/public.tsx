import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check, MapPin, Star, DollarSign, Wrench, Clock, Award, Briefcase } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { useToast } from "@/hooks/use-toast";
import { useExternalLink } from "@/hooks/useExternalLink";
import type { MechanicmatchProfile } from "@shared/schema";

type PublicMechanicMatchProfile = MechanicmatchProfile & {
  userIsVerified?: boolean;
  firstName?: string | null;
};

export default function PublicMechanicMatchProfile() {
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const publicMechanicMatchUrl = `${window.location.origin}/apps/mechanicmatch/public`;
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Public MechanicMatch link copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };
  
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = useQuery<PublicMechanicMatchProfile | null>({
    queryKey: ["/api/mechanicmatch/public", id],
    queryFn: async () => {
      const res = await fetch(`/api/mechanicmatch/public/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Profile not found or not public</p>
        </div>
      </div>
    );
  }

  const userIsVerified = profile.userIsVerified || false;
  const isMechanic = profile.isMechanic || false;
  const isCarOwner = profile.isCarOwner || false;

  const formatSpecialties = (specialties: string | null) => {
    if (!specialties) return [];
    try {
      const parsed = JSON.parse(specialties);
      return Array.isArray(parsed) ? parsed : [specialties];
    } catch {
      return specialties.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  const formatCertifications = (certifications: string | null) => {
    if (!certifications) return [];
    try {
      const parsed = JSON.parse(certifications);
      return Array.isArray(parsed) ? parsed : [certifications];
    } catch {
      return [];
    }
  };

  const specialties = formatSpecialties(profile.specialties);
  const certifications = formatCertifications(profile.certifications);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">MechanicMatch Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Public profile</p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Public MechanicMatch Link</label>
          <p className="text-sm text-muted-foreground">Return to the public directory to view all public profiles.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {publicMechanicMatchUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(publicMechanicMatchUrl)}
              className="flex-shrink-0"
              data-testid="button-copy-public-mechanicmatch"
              aria-label="Copy public MechanicMatch link"
            >
              {copiedUrl === publicMechanicMatchUrl ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(publicMechanicMatchUrl)}
              className="flex-shrink-0"
              data-testid="button-open-public-mechanicmatch"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg sm:text-xl">
                {profile.firstName?.trim() || "MechanicMatch Profile"}
              </CardTitle>
              <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-public" />
              {isMechanic && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  Mechanic
                </Badge>
              )}
              {isCarOwner && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Car Owner
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {(profile.city || profile.state || profile.country) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Car Owner Bio */}
          {isCarOwner && profile.ownerBio && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">About</p>
              <p className="text-base">{profile.ownerBio}</p>
            </div>
          )}

          {/* Mechanic-specific fields */}
          {isMechanic && (
            <>
              {profile.mechanicBio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">About</p>
                  <p className="text-base">{profile.mechanicBio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.experience !== null && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="text-base font-medium">{profile.experience} {profile.experience === 1 ? 'year' : 'years'}</p>
                    </div>
                  </div>
                )}

                {profile.hourlyRate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-base font-medium">${parseFloat(profile.hourlyRate)}/hr</p>
                    </div>
                  </div>
                )}

                {profile.averageRating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-base font-medium">{parseFloat(profile.averageRating).toFixed(1)} / 5.0</p>
                    </div>
                  </div>
                )}

                {profile.totalJobsCompleted !== null && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Jobs Completed</p>
                      <p className="text-base font-medium">{profile.totalJobsCompleted}</p>
                    </div>
                  </div>
                )}

                {profile.responseTimeHours !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <p className="text-base font-medium">{profile.responseTimeHours} {profile.responseTimeHours === 1 ? 'hour' : 'hours'}</p>
                    </div>
                  </div>
                )}
              </div>

              {profile.isMobileMechanic && (
                <div>
                  <Badge variant="secondary">Mobile Mechanic</Badge>
                </div>
              )}

              {profile.shopLocation && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shop Location</p>
                  <p className="text-base">{profile.shopLocation}</p>
                </div>
              )}

              {specialties.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {certifications.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}

