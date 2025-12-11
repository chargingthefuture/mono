import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "wouter";
import type { SupportMatchProfile } from "@shared/schema";
import { format } from "date-fns";

export default function SupportMatchAdminUsers() {
  const { data: profiles, isLoading } = useQuery<SupportMatchProfile[]>({
    queryKey: ["/api/supportmatch/admin/profiles"],
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading user profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/supportmatch/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">User Profiles</h1>
          <p className="text-muted-foreground">
            View all SupportMatch user profiles
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {profiles?.length || 0} total profiles
          </span>
        </div>
        <Badge variant="secondary">
          {profiles?.filter(p => p.isActive).length || 0} active
        </Badge>
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No user profiles yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id} data-testid={`profile-card-${profile.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {profile.nickname || "Anonymous"}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={profile.isActive ? "default" : "secondary"}>
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {profile.gender && (
                        <Badge variant="outline">
                          Gender: {profile.gender}
                        </Badge>
                      )}
                      {profile.genderPreference && (
                        <Badge variant="outline">
                          Preference: {profile.genderPreference}
                        </Badge>
                      )}
                      {profile.timezone && (
                        <Badge variant="outline">
                          {profile.timezone}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created: {format(new Date(profile.createdAt), "MMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
