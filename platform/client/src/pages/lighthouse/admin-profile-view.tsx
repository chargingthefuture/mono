import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { PrivacyField } from "@/components/ui/privacy-field";
import type { LighthouseProfile } from "@shared/schema";

type ProfileWithUser = LighthouseProfile & {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    isVerified: boolean;
  } | null;
};

export default function LighthouseAdminProfileView() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = useQuery<ProfileWithUser>({
    queryKey: ["/api/lighthouse/admin/profiles", id],
    queryFn: async () => {
      const res = await fetch(`/api/lighthouse/admin/profiles/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return await res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-destructive font-medium">Profile not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "The profile you're looking for doesn't exist."}
          </p>
          <Link href="/apps/lighthouse/admin">
            <Button variant="outline" className="mt-4" data-testid="button-back-to-admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = profile.user
    ? [profile.user.firstName, profile.user.lastName].filter(Boolean).join(' ') || null
    : null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/apps/lighthouse/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Profile View</h1>
          <p className="text-muted-foreground">Admin view of user profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Basic user details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">First Name</label>
            <p className="text-base font-medium">{profile.user?.firstName || <span className="text-muted-foreground">—</span>}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Name</label>
            <p className="text-base font-medium">{profile.user?.lastName || <span className="text-muted-foreground">—</span>}</p>
          </div>
          {fullName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-base font-medium">{fullName}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="mt-1">
              {profile.user?.email ? (
                <PrivacyField
                  value={profile.user.email}
                  type="email"
                  testId="profile-email"
                />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
            <div className="mt-1">
              {profile.user ? (
                <VerifiedBadge isVerified={profile.user.isVerified || profile.isVerified} testId="profile-verified" />
              ) : (
                <Badge variant="outline">Unverified</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LightHouse Profile</CardTitle>
          <CardDescription>Profile type: <Badge variant="outline">{profile.profileType}</Badge></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Display Name</label>
            <p className="text-base">{profile.displayName || <span className="text-muted-foreground">—</span>}</p>
          </div>

          {profile.bio && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio</label>
              <p className="text-base whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {profile.phoneNumber && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <div className="mt-1">
                <PrivacyField
                  value={profile.phoneNumber}
                  type="phone"
                  testId="profile-phone"
                />
              </div>
            </div>
          )}

          {profile.profileType === 'seeker' && (
            <>
              {profile.housingNeeds && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Housing Needs</label>
                  <p className="text-base whitespace-pre-wrap">{profile.housingNeeds}</p>
                </div>
              )}

              {(profile.budgetMin || profile.budgetMax) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Budget</label>
                  <p className="text-base font-mono">
                    {profile.budgetMin && profile.budgetMax
                      ? `$${profile.budgetMin} - $${profile.budgetMax}`
                      : profile.budgetMin
                      ? `From $${profile.budgetMin}`
                      : profile.budgetMax
                      ? `Up to $${profile.budgetMax}`
                      : '—'}
                  </p>
                </div>
              )}

              {profile.moveInDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Move-In Date</label>
                  <p className="text-base">
                    {new Date(profile.moveInDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {profile.desiredCountry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Desired Country</label>
                  <p className="text-base">{profile.desiredCountry}</p>
                </div>
              )}
            </>
          )}

          {profile.profileType === 'host' && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Has Property</label>
              <div className="mt-1">
                {profile.hasProperty ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              {profile.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-base text-muted-foreground">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-base text-muted-foreground">
              {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

