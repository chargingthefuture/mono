/**
 * MechanicMatch Admin Delete Dialog Component
 */

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
import type { MechanicmatchProfile } from "@shared/schema";

interface MechanicMatchAdminDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MechanicmatchProfile | null;
  onDelete: (profileId: string) => void;
  isDeleting: boolean;
}

export function MechanicMatchAdminDeleteDialog({
  open,
  onOpenChange,
  profile,
  onDelete,
  isDeleting,
}: MechanicMatchAdminDeleteDialogProps) {
  const handleDelete = () => {
    if (profile) {
      onDelete(profile.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Unclaimed Profile</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the unclaimed profile. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete-profile">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            data-testid="button-confirm-delete-profile"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

