import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Partnership } from "@shared/schema";
import { format } from "date-fns";

type PartnershipWithPartner = Partnership & {
  partnerFirstName?: string | null;
  partnerLastName?: string | null;
};

export default function SupportMatchHistory() {
  const { data: partnerships, isLoading } = useQuery<PartnershipWithPartner[]>({
    queryKey: ["/api/supportmatch/partnership/history"],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "completed":
        return "secondary" as const;
      case "ended_early":
        return "destructive" as const;
      case "cancelled":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ended_early":
        return "Ended Early";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Partnership History</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          View your past accountability partnerships
        </p>
      </div>

      {!partnerships || partnerships.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              No partnership history yet. You'll see your partnerships here once you're matched.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {partnerships.map((partnership) => (
            <Card key={partnership.id} data-testid={`partnership-${partnership.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-base sm:text-lg">Partnership</CardTitle>
                  <Badge variant={getStatusVariant(partnership.status)} className="text-xs">
                    {getStatusLabel(partnership.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(partnership.partnerFirstName || partnership.partnerLastName) && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Matched With</p>
                    <p className="font-medium text-sm sm:text-base">
                      {[partnership.partnerFirstName, partnership.partnerLastName].filter(Boolean).join(" ") || "Unknown"}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium text-sm sm:text-base">
                      {format(new Date(partnership.startDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium text-sm sm:text-base">
                      {partnership.endDate ? format(new Date(partnership.endDate), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
