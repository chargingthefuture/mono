import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface SectorDetailsDialogProps {
  sector: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectorDetailsDialog({
  sector,
  open,
  onOpenChange,
}: SectorDetailsDialogProps) {
  const { data, isLoading } = useQuery<{
    sector: string;
    skills: Array<{ skill: string; count: number }>;
    jobTitles: Array<{ jobTitle: string; count: number }>;
    totalRecruited: number;
  }>({
    queryKey: [`/api/workforce-recruiter/sector/${encodeURIComponent(sector || "")}`],
    enabled: !!sector && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sector} Sector Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Recruited</p>
              <p className="text-3xl font-bold text-primary">{data.totalRecruited}</p>
            </div>

            {/* Job Titles */}
            {data.jobTitles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Job Titles</h3>
                <div className="space-y-2">
                  {data.jobTitles.map((item) => (
                    <div
                      key={item.jobTitle}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <span className="font-medium">{item.jobTitle}</span>
                      <Badge variant="secondary">{item.count} recruited</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Skills</h3>
                <div className="space-y-2">
                  {data.skills.map((item) => (
                    <div
                      key={item.skill}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <span className="font-medium">{item.skill}</span>
                      <Badge variant="secondary">{item.count} recruitments</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.jobTitles.length === 0 && data.skills.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No details available for this sector
              </p>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
