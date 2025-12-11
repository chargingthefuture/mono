import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Partnership, SupportMatchProfile } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function SupportMatchAdminPartnerships() {
  const { toast } = useToast();

  const { data: profiles } = useQuery<SupportMatchProfile[]>({
    queryKey: ["/api/supportmatch/admin/profiles"],
  });

  const { data: partnerships, isLoading } = useQuery<Partnership[]>({
    queryKey: ["/api/supportmatch/admin/partnerships"],
  });

  const runMatchingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/supportmatch/admin/partnerships/run-matching", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/admin/partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/admin/stats"] });
      toast({
        title: "Success",
        description: data.message || "Matching algorithm completed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to run matching algorithm",
        variant: "destructive",
      });
    },
  });

  const endMutation = useMutation({
    mutationFn: async (partnershipId: string) => {
      return apiRequest("PUT", `/api/supportmatch/admin/partnerships/${partnershipId}/status`, { status: "ended" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/admin/partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/admin/stats"] });
      toast({
        title: "Success",
        description: "Partnership ended successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to end partnership",
        variant: "destructive",
      });
    },
  });

  const getUserNickname = (userId: string) => {
    const profile = profiles?.find(p => p.userId === userId);
    return profile?.nickname || "Anonymous";
  };

  const activePartnerships = partnerships?.filter(p => p.status === "active") || [];
  const endedPartnerships = partnerships?.filter(p => p.status === "ended") || [];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading partnerships...</p>
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
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-semibold">Partnership Management</h1>
          <p className="text-muted-foreground">
            Algorithm-based accountability partnerships
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Algorithmic Matching</CardTitle>
          <CardDescription>
            Run the matching algorithm to create new partnerships based on timezone, gender preferences, and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The algorithm matches users who:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
              <li>Don't have an active partnership</li>
              <li>Have compatible gender preferences (mutual match)</li>
              <li>Are in compatible timezones (same timezone preferred)</li>
              <li>Don't have mutual exclusions</li>
            </ul>
          </div>
          <Button
            onClick={() => runMatchingMutation.mutate()}
            disabled={runMatchingMutation.isPending}
            data-testid="button-run-matching"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {runMatchingMutation.isPending ? "Running Algorithm..." : "Run Matching Algorithm"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Partnerships</h2>
          {activePartnerships.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No active partnerships.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activePartnerships.map((partnership) => (
                <Card key={partnership.id} data-testid={`partnership-card-${partnership.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {getUserNickname(partnership.user1Id)} & {getUserNickname(partnership.user2Id)}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="default">Active</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(partnership.startDate), "MMM d, yyyy")} - {partnership.endDate ? format(new Date(partnership.endDate), "MMM d, yyyy") : "Ongoing"}
                          </span>
                          {partnership.endDate && (
                            <span className="text-xs text-muted-foreground">
                              (30 days)
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => endMutation.mutate(partnership.id)}
                        disabled={endMutation.isPending}
                        data-testid={`button-end-${partnership.id}`}
                      >
                        End Partnership
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Past Partnerships</h2>
          {endedPartnerships.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No past partnerships.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {endedPartnerships.map((partnership) => (
                <Card key={partnership.id} data-testid={`past-partnership-card-${partnership.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {getUserNickname(partnership.user1Id)} & {getUserNickname(partnership.user2Id)}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">Ended</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(partnership.startDate), "MMM d, yyyy")} - {partnership.endDate ? format(new Date(partnership.endDate), "MMM d, yyyy") : "?"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
