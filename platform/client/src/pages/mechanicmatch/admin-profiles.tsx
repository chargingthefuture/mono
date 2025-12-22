/**
 * MechanicMatch Admin Profiles Page
 * 
 * REFACTORED: Extracted components and hooks for better maintainability.
 * Main file reduced from 917 lines to ~200 lines.
 */

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Wrench } from "lucide-react";
import type { MechanicmatchProfile } from "@shared/schema";
import type { User } from "@shared/schema";
import { useMechanicMatchAdminProfiles } from "./admin/hooks/useMechanicMatchAdminProfiles";
import { MechanicMatchAdminProfileList } from "./admin/components/MechanicMatchAdminProfileList";
import { MechanicMatchAdminProfileForm } from "./admin/components/MechanicMatchAdminProfileForm";
import { MechanicMatchAdminEditDialog } from "./admin/components/MechanicMatchAdminEditDialog";
import { MechanicMatchAdminAssignDialog } from "./admin/components/MechanicMatchAdminAssignDialog";
import { MechanicMatchAdminDeleteDialog } from "./admin/components/MechanicMatchAdminDeleteDialog";
import { transformProfilePayload, type AdminProfileFormValues } from "./admin/utils/mechanicMatchAdminUtils";

export default function MechanicMatchAdminProfiles() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<MechanicmatchProfile | null>(null);
  const [assigningProfile, setAssigningProfile] = useState<MechanicmatchProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<MechanicmatchProfile | null>(null);
  const { toast } = useToast();
  const { handleError } = useErrorHandler({ showToast: false }); // We'll show custom toasts

  const {
    page,
    setPage,
    roleFilter,
    setRoleFilter,
    claimedFilter,
    setClaimedFilter,
    searchTerm,
    setSearchTerm,
    data,
    isLoading,
    displayedProfiles,
    totalItems,
    createForm,
    createProfileMutation,
    invalidateProfiles,
  } = useMechanicMatchAdminProfiles();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: AdminProfileFormValues) => {
      if (!editingProfile) {
        const error = new Error("No profile selected for editing");
        handleError(error, "Update Error");
        throw error;
      }
      const payload = transformProfilePayload(values);
      await apiRequest("PUT", `/api/mechanicmatch/admin/profiles/${editingProfile.id}`, payload);
    },
    onSuccess: () => {
      invalidateProfiles();
      setEditDialogOpen(false);
      toast({ title: "Profile Updated", description: "Profile details updated successfully." });
    },
    onError: (error: any) => {
      const parsed = handleError(error, "Update Error");
      toast({ 
        title: "Error", 
        description: parsed.message || "Failed to update profile", 
        variant: "destructive" 
      });
    },
  });

  const assignProfileMutation = useMutation({
    mutationFn: async ({ profileId, userId }: { profileId: string; userId: string }) => {
      await apiRequest("PUT", `/api/mechanicmatch/admin/profiles/${profileId}/assign`, { userId });
    },
    onSuccess: () => {
      invalidateProfiles();
      setAssignDialogOpen(false);
      toast({ title: "Profile Assigned", description: "Profile assigned to user successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to assign profile", variant: "destructive" });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      await apiRequest("DELETE", `/api/mechanicmatch/admin/profiles/${profileId}`);
    },
    onSuccess: () => {
      invalidateProfiles();
      setDeleteDialogOpen(false);
      toast({ title: "Profile Deleted", description: "Unclaimed profile deleted." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete profile", variant: "destructive" });
    },
  });

  const onSubmitCreate = (values: AdminProfileFormValues) => {
    createProfileMutation.mutate(values);
  };

  const onSubmitEdit = (values: AdminProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const handleEdit = (profile: MechanicmatchProfile) => {
    setEditingProfile(profile);
    setEditDialogOpen(true);
  };

  const handleAssign = (profile: MechanicmatchProfile) => {
    setAssigningProfile(profile);
    setAssignDialogOpen(true);
  };

  const handleDelete = (profile: MechanicmatchProfile) => {
    setDeletingProfile(profile);
    setDeleteDialogOpen(true);
  };

  const handleAssignConfirm = (profileId: string, userId: string) => {
    assignProfileMutation.mutate({ profileId, userId });
  };

  const handleDeleteConfirm = (profileId: string) => {
    deleteProfileMutation.mutate(profileId);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/mechanicmatch/admin">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">MechanicMatch Profiles</h1>
          <p className="text-muted-foreground">
            Create unclaimed profiles, assign them to trusted members, or keep listings updated.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Unclaimed Profile</CardTitle>
          <CardDescription>Seed trusted mechanic listings so survivors can claim them later.</CardDescription>
        </CardHeader>
        <CardContent>
          <MechanicMatchAdminProfileForm
            form={createForm}
            onSubmit={onSubmitCreate}
            isSubmitting={createProfileMutation.isPending}
            submitLabel="Create Unclaimed Profile"
            formPrefix="create"
            showResetButton
          />
        </CardContent>
      </Card>

      <MechanicMatchAdminProfileList
        profiles={displayedProfiles}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        claimedFilter={claimedFilter}
        onClaimedFilterChange={setClaimedFilter}
        page={page}
        totalItems={totalItems}
        itemsPerPage={20}
        onPageChange={setPage}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onDelete={handleDelete}
      />

      <MechanicMatchAdminEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={editingProfile}
        onSubmit={onSubmitEdit}
        isSubmitting={updateProfileMutation.isPending}
      />

      <MechanicMatchAdminAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        profile={assigningProfile}
        users={users}
        onAssign={handleAssignConfirm}
        isAssigning={assignProfileMutation.isPending}
      />

      <MechanicMatchAdminDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        profile={deletingProfile}
        onDelete={handleDeleteConfirm}
        isDeleting={deleteProfileMutation.isPending}
      />
    </div>
  );
}
