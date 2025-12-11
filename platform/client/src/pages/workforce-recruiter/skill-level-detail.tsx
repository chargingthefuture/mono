import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Briefcase, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AnnouncementBanner } from "@/components/announcement-banner";

interface SkillLevelDetail {
  skillLevel: string;
  target: number;
  recruited: number;
  percent: number;
  profiles: Array<{
    profileId: string;
    displayName: string;
    skills: string[];
    sectors: string[];
    jobTitles: string[];
    matchingOccupations: Array<{ id: string; title: string; sector: string }>;
    matchReason: string; // "sector", "jobTitle", "skill", or "none"
  }>;
}

export default function WorkforceRecruiterSkillLevelDetail() {
  const [, setLocation] = useLocation();
  const skillLevel = decodeURIComponent(window.location.pathname.split("/").pop() || "");

  const { data: detail, isLoading } = useQuery<SkillLevelDetail>({
    queryKey: [`/api/workforce-recruiter/reports/skill-level/${encodeURIComponent(skillLevel)}`],
    enabled: !!skillLevel,
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Skill level not found</p>
          <Button
            onClick={() => setLocation("/apps/workforce-recruiter")}
            className="mt-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getMatchReasonBadge = (reason: string) => {
    switch (reason) {
      case "sector":
        return <Badge variant="default" className="bg-blue-500">Sector Match</Badge>;
      case "jobTitle":
        return <Badge variant="default" className="bg-green-500">Job Title Match</Badge>;
      case "skill":
        return <Badge variant="default" className="bg-purple-500">Skill Match</Badge>;
      case "none":
        return <Badge variant="destructive">No Match</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <AnnouncementBanner
        apiEndpoint="/api/workforce-recruiter/announcements"
        queryKey="/api/workforce-recruiter/announcements"
      />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/apps/workforce-recruiter")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">{detail.skillLevel} Skill Level</h1>
          <p className="text-muted-foreground">Detailed recruitment breakdown</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Recruitment progress for {detail.skillLevel} skill level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                Target
              </div>
              <div className="text-2xl font-semibold">{detail.target.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                Recruited
              </div>
              <div className="text-2xl font-semibold">{detail.recruited.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Progress
              </div>
              <div className="text-2xl font-semibold">{detail.percent.toFixed(1)}%</div>
              <Progress value={detail.percent} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      <Card>
        <CardHeader>
          <CardTitle>Profiles ({detail.profiles.length})</CardTitle>
          <CardDescription>
            Directory profiles in the {detail.skillLevel} skill level category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No profiles found in this skill level
            </div>
          ) : (
            <div className="space-y-4">
              {detail.profiles.map((profile) => (
                <Card key={profile.profileId} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{profile.displayName}</h3>
                        <div className="flex gap-2 mt-2">
                          {getMatchReasonBadge(profile.matchReason)}
                          {profile.matchingOccupations.length > 0 && (
                            <Badge variant="outline">
                              {profile.matchingOccupations.length} occupation{profile.matchingOccupations.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {profile.matchingOccupations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Matching Occupations:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.matchingOccupations.map((occ) => (
                            <Badge key={occ.id} variant="secondary" className="text-xs">
                              {occ.title} ({occ.sector})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {profile.skills.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.sectors.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Sectors:</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.sectors.map((sector, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {sector}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.jobTitles.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Job Titles:</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.jobTitles.map((title, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {profile.matchReason === "none" && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ This profile doesn't match any occupations. Check if skills, sectors, or job titles need to be updated in the Directory or if new occupations need to be created.
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






