import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const TERMS_ACCEPTANCE_INTERVAL_DAYS = 60;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface TermsAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsAcceptanceDialog({ open, onOpenChange }: TermsAcceptanceDialogProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/account/accept-terms", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onOpenChange(false);
      toast({
        title: "Terms Accepted",
        description: "Thank you for accepting the terms and conditions.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept terms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewTerms = () => {
    onOpenChange(false);
    setLocation("/terms");
  };

  const handleAccept = () => {
    acceptMutation.mutate();
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing the dialog without accepting terms
    // Only allow closing after terms are accepted (handled in onSuccess)
    if (!newOpen && !acceptMutation.isSuccess) {
      return; // Ignore close attempts
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden" 
        data-testid="dialog-terms-acceptance"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Terms and Conditions Update</DialogTitle>
          <DialogDescription>
            Please review and accept our Terms and Conditions to continue using the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Our Terms and Conditions have been updated or it has been 60 days since you last reviewed them. 
            Please take a moment to read through the terms before continuing.
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleViewTerms}
            className="w-full sm:w-auto"
            data-testid="button-view-terms"
          >
            View Terms
          </Button>
          <Button
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-accept-terms"
          >
            {acceptMutation.isPending ? "Accepting..." : "I Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to check if user needs to accept terms (60 days since last acceptance)
 * Returns true if user needs to see the dialog
 */
export function useTermsAcceptanceCheck(): boolean {
  const { user, isLoading } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);

  useEffect(() => {
    if (isLoading || !user) {
      setNeedsAcceptance(false);
      return;
    }

    // If user has never accepted terms, they need to accept
    if (!user.termsAcceptedAt) {
      setNeedsAcceptance(true);
      return;
    }

    // Calculate days since last acceptance
    const lastAcceptance = new Date(user.termsAcceptedAt);
    const now = new Date();
    const daysSinceAcceptance = Math.floor(
      (now.getTime() - lastAcceptance.getTime()) / MILLISECONDS_PER_DAY
    );

    // Show dialog if 60 or more days have passed
    if (daysSinceAcceptance >= TERMS_ACCEPTANCE_INTERVAL_DAYS) {
      setNeedsAcceptance(true);
    } else {
      setNeedsAcceptance(false);
    }
  }, [user, isLoading]);

  return needsAcceptance;
}


















