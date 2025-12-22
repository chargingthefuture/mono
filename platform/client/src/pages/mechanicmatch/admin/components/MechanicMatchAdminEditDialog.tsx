/**
 * MechanicMatch Admin Edit Dialog Component
 */

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MechanicMatchAdminProfileForm } from "./MechanicMatchAdminProfileForm";
import { adminProfileFormSchema, transformProfilePayload, type AdminProfileFormValues } from "../utils/mechanicMatchAdminUtils";
import type { MechanicmatchProfile } from "@shared/schema";

interface MechanicMatchAdminEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MechanicmatchProfile | null;
  onSubmit: (values: AdminProfileFormValues) => void;
  isSubmitting: boolean;
}

export function MechanicMatchAdminEditDialog({
  open,
  onOpenChange,
  profile,
  onSubmit,
  isSubmitting,
}: MechanicMatchAdminEditDialogProps) {
  const editForm = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileFormSchema),
  });

  useEffect(() => {
    if (profile) {
      editForm.reset({
        firstName: profile.firstName || "",
        isCarOwner: profile.isCarOwner,
        isMechanic: profile.isMechanic,
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        phoneNumber: profile.phoneNumber || "",
        signalUrl: profile.signalUrl || "",
        isPublic: profile.isPublic ?? false,
      });
    }
  }, [editForm, profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update the selected profile. Claimed status cannot be changed here.</DialogDescription>
        </DialogHeader>
        <MechanicMatchAdminProfileForm
          form={editForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Profile"
          formPrefix="edit"
        />
      </DialogContent>
    </Dialog>
  );
}

