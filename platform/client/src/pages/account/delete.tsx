import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle } from "lucide-react";

export default function DeleteAccountPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [reason, setReason] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (reason?: string) =>
      apiRequest("DELETE", "/api/account/delete", { reason }),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted. You will be logged out.",
        variant: "default",
      });
      // Redirect to landing page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
      setConfirmDialogOpen(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(reason.trim() || undefined);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Delete Account</h1>
        <p className="text-muted-foreground">
          Permanently delete your entire account from all mini-apps
        </p>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Warning: This action is permanent</CardTitle>
          </div>
          <CardDescription>
            Deleting your account will permanently remove all your data from the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">What will be deleted:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>All mini-app profiles (SupportMatch, LightHouse, SocketRelay, Directory, TrustTransport, MechanicMatch)</li>
              <li>All related data (messages, requests, partnerships, etc.)</li>
              <li>Your user account and personal information</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">What will be anonymized:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>NPS survey responses</li>
              <li>Payment records</li>
              <li>Admin action logs (if applicable)</li>
              <li>Research items and contributions</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="delete-reason" className="text-sm font-normal">
              Reason for deletion (optional)
            </Label>
            <Textarea
              id="delete-reason"
              placeholder="Help us understand why you're leaving..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              data-testid="textarea-delete-reason"
              disabled={deleteMutation.isPending}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              disabled={deleteMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-account"
            >
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This will permanently delete your entire account from all mini-apps. This action cannot be undone.
              </p>
              <p className="font-semibold text-destructive">
                You will lose access to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>All your mini-app profiles</li>
                <li>All your messages and conversations</li>
                <li>All your requests and partnerships</li>
                <li>Your account and login access</li>
              </ul>
              <p>
                If you're sure you want to proceed, click "Confirm Delete Account" below.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmDialogOpen(false)}
              disabled={deleteMutation.isPending}
              data-testid="button-cancel-confirm"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-account"
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


