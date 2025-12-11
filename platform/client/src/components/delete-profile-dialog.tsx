import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  appName: string;
  isDeleting?: boolean;
}

export function DeleteProfileDialog({
  open,
  onOpenChange,
  onConfirm,
  appName,
  isDeleting = false,
}: DeleteProfileDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason(""); // Reset after confirmation
  };

  const handleCancel = () => {
    setReason(""); // Reset on cancel
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle>Delete {appName} Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your {appName} profile? This action is permanent and cannot be undone.
          </AlertDialogDescription>
          <AlertDialogDescription>
            If you delete your profile, you will need to create a new profile to rejoin {appName} in the future.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
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
            disabled={isDeleting}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting} data-testid="button-cancel-delete">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete-profile"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete Profile"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

