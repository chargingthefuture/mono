import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChymeSurveyDialogProps {
  roomId?: string;
  clientId: string;
}

export function ChymeSurveyDialog({ roomId, clientId }: ChymeSurveyDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [foundValuable, setFoundValuable] = useState<boolean | null>(null);

  // Check if survey should be shown
  const { data: eligibleData } = useQuery<{ eligible: boolean }>({
    queryKey: [`/api/chyme/survey/check-eligible?clientId=${clientId}${roomId ? `&roomId=${roomId}` : ''}`],
    enabled: !!clientId,
    refetchInterval: false,
  });

  const submitMutation = useMutation({
    mutationFn: async (valuable: boolean) => {
      return await apiRequest('POST', '/api/chyme/survey', {
        clientId,
        roomId: roomId || null,
        foundValuable: valuable,
      });
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/chyme/survey/check-eligible`] });
      toast({
        title: "Thank you",
        description: "Your feedback has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit survey",
        variant: "destructive",
      });
    },
  });

  // Show dialog when eligible
  useEffect(() => {
    if (eligibleData?.eligible) {
      // Delay showing the dialog slightly to avoid interrupting user flow
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [eligibleData]);

  const handleSubmit = () => {
    if (foundValuable !== null) {
      submitMutation.mutate(foundValuable);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open && foundValuable === null} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Feedback</DialogTitle>
          <DialogDescription>
            Did you find this audio room valuable?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 py-4">
          <Button
            variant={foundValuable === true ? "default" : "outline"}
            onClick={() => setFoundValuable(true)}
            className="flex-1"
            data-testid="button-survey-yes"
          >
            Yes
          </Button>
          <Button
            variant={foundValuable === false ? "default" : "outline"}
            onClick={() => setFoundValuable(false)}
            className="flex-1"
            data-testid="button-survey-no"
          >
            No
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={submitMutation.isPending}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={foundValuable === null || submitMutation.isPending}
            data-testid="button-submit-survey"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

