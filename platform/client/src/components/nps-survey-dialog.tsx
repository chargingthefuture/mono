"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Smile, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NpsSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NpsSurveyDialog({ open, onOpenChange }: NpsSurveyDialogProps) {
  const { toast } = useToast();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const submitMutation = useMutation({
    mutationFn: async (score: number) =>
      apiRequest("POST", "/api/nps/response", { score }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nps/should-show"] });
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve the platform.",
      });
      onOpenChange(false);
      setSelectedScore(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (selectedScore !== null) {
      submitMutation.mutate(selectedScore);
    }
  };

  const handleScoreClick = (score: number) => {
    setSelectedScore(score);
  };

  const getScoreLabel = (score: number): string => {
    if (score === 0) return "Extremely Unhappy";
    if (score <= 3) return "Unhappy";
    if (score <= 6) return "Neutral";
    if (score <= 8) return "Happy";
    if (score === 10) return "Extremely Happy";
    return "";
  };

  const getScoreColor = (score: number): string => {
    if (selectedScore === score) {
      if (score <= 3) return "bg-red-500 text-white border-red-600";
      if (score <= 6) return "bg-yellow-500 text-white border-yellow-600";
      return "bg-green-500 text-white border-green-600";
    }
    if (hoveredScore === score) {
      if (score <= 3) return "bg-red-100 border-red-300";
      if (score <= 6) return "bg-yellow-100 border-yellow-300";
      return "bg-green-100 border-green-300";
    }
    return "bg-background border-border hover:bg-accent";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="nps-survey-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">
            We value your feedback
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            How would you feel if this app no longer existed?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Scale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Frown className="w-4 h-4" />
                <span className="hidden sm:inline">Extremely Unhappy</span>
                <span className="sm:hidden">Unhappy</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Extremely Happy</span>
                <span className="sm:hidden">Happy</span>
                <Smile className="w-4 h-4" />
              </span>
            </div>

            <div className="grid grid-cols-11 gap-1 sm:gap-2">
              {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreClick(score)}
                  onMouseEnter={() => setHoveredScore(score)}
                  onMouseLeave={() => setHoveredScore(null)}
                  className={cn(
                    "aspect-square w-full rounded-lg border-2 font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    getScoreColor(score)
                  )}
                  data-testid={`nps-score-${score}`}
                  aria-label={`Score ${score}: ${getScoreLabel(score)}`}
                >
                  {score}
                </button>
              ))}
            </div>

            {/* Selected Score Label */}
            {selectedScore !== null && (
              <div className="text-center">
                <p className="text-sm font-medium">
                  Selected: <span className="text-primary">{selectedScore}</span> - {getScoreLabel(selectedScore)}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={selectedScore === null || submitMutation.isPending}
              className="w-full sm:w-auto min-w-[120px]"
              data-testid="nps-submit-button"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
