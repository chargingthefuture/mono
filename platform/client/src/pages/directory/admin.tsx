import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { DirectoryProfile, User } from "@shared/schema";
import type { DirectorySkill } from "@shared/schema";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { useExternalLink } from "@/hooks/useExternalLink";
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
import { DirectoryAdminProfileForm } from "./admin/components/DirectoryAdminProfileForm";
import { DirectoryAdminProfileList } from "./admin/components/DirectoryAdminProfileList";
import { useDirectoryAdminProfiles } from "./admin/hooks/useDirectoryAdminProfiles";
import { useDirectoryAdminSkills } from "./admin/hooks/useDirectoryAdminSkills";

// Extended type for directory profiles with user data from API
type DirectoryProfileWithUser = DirectoryProfile & {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  userIsVerified?: boolean;
};

type SkillsSector = {
  id: string;
  name: string;
};

type SkillsJobTitle = {
  id: string;
  name: string;
};

export default function AdminDirectoryPage() {
  const { ExternalLinkDialog } = useExternalLink();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 50; // Admin lists use 50 items per page

  const { data: profiles = [], isLoading } = useQuery<DirectoryProfileWithUser[]>({
    queryKey: ["/api/directory/admin/profiles"],
  });

  // Client-side fuzzy search on all profiles
  const filteredProfiles = useFuzzySearch(profiles, searchTerm, {
    searchFields: ["description", "firstName", "city", "state", "country"],
    threshold: 0.3,
  });

  // Client-side pagination on filtered results
  const total = filteredProfiles.length;
  const paginatedProfiles = useMemo(() => {
    const start = page * limit;
    const end = start + limit;
    return filteredProfiles.slice(start, end);
  }, [filteredProfiles, page, limit]);

  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: skills = [], isLoading: skillsLoading } = useQuery<DirectorySkill[]>({
    queryKey: ["/api/directory/admin/skills"],
  });

  const { data: availableSectors = [], isLoading: sectorsLoading } = useQuery<SkillsSector[]>({
    queryKey: ["/api/directory/sectors"],
  });
  const { data: availableJobTitles = [], isLoading: jobTitlesLoading } = useQuery<SkillsJobTitle[]>({
    queryKey: ["/api/directory/job-titles"],
  });

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    description: "",
    firstName: "",
    signalUrl: "",
    quoraUrl: "",
    city: "",
    state: "",
    country: "",
    skills: [] as string[],
    sectors: [] as string[],
    jobTitles: [] as string[],
    isPublic: false,
  });

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    firstName: "",
    signalUrl: "",
    quoraUrl: "",
    city: "",
    state: "",
    country: "",
    skills: [] as string[],
    sectors: [] as string[],
    jobTitles: [] as string[],
    isPublic: false,
  });

  // Hooks
  const { createProfile, updateProfile, deleteProfile, assignProfile } = useDirectoryAdminProfiles();
  const { deleteSkill } = useDirectoryAdminSkills();

  // Delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<DirectoryProfileWithUser | null>(null);
  const [deleteSkillDialogOpen, setDeleteSkillDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<DirectorySkill | null>(null);

  // Handlers
  const handleCreate = () => {
    const payload = {
      description: createFormData.description.trim(),
      firstName: createFormData.firstName.trim() || null,
      signalUrl: createFormData.signalUrl.trim() || null,
      quoraUrl: createFormData.quoraUrl.trim() || null,
      city: createFormData.city.trim() || null,
      state: createFormData.state.trim() || null,
      skills: createFormData.skills.slice(0, 3),
      sectors: createFormData.sectors.length > 0 ? createFormData.sectors.slice(0, 3) : undefined,
      jobTitles: createFormData.jobTitles.length > 0 ? createFormData.jobTitles.slice(0, 3) : undefined,
      country: createFormData.country,
      isPublic: createFormData.isPublic,
    };
    createProfile.mutate(payload, {
      onSuccess: (data) => {
        // Reset form
        setCreateFormData({
          description: "",
          firstName: "",
          signalUrl: "",
          quoraUrl: "",
          city: "",
          state: "",
          country: "",
          skills: [],
          sectors: [],
          jobTitles: [],
          isPublic: false,
        });
      },
    });
  };

  const handleUpdate = (id: string) => {
    const payload = {
      description: editFormData.description.trim() || null,
      firstName: editFormData.firstName.trim() || null,
      signalUrl: editFormData.signalUrl.trim() || null,
      quoraUrl: editFormData.quoraUrl.trim() || null,
      city: editFormData.city.trim() || null,
      state: editFormData.state.trim() || null,
      skills: editFormData.skills.slice(0, 3),
      sectors: editFormData.sectors.length > 0 ? editFormData.sectors.slice(0, 3) : undefined,
      jobTitles: editFormData.jobTitles.length > 0 ? editFormData.jobTitles.slice(0, 3) : undefined,
      country: editFormData.country || null,
      isPublic: editFormData.isPublic,
    };
    updateProfile.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          setEditingId(null);
        },
      }
    );
  };

  const startEdit = (profile: DirectoryProfileWithUser) => {
    setEditingId(profile.id);
    setEditFormData({
      description: profile.description || "",
      firstName: (profile as any).firstName || "",
      signalUrl: profile.signalUrl || "",
      quoraUrl: profile.quoraUrl || "",
      city: profile.city || "",
      state: profile.state || "",
      skills: profile.skills || [],
      sectors: profile.sectors || [],
      jobTitles: profile.jobTitles || [],
      isPublic: profile.isPublic || false,
      country: profile.country || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteClick = (profile: DirectoryProfile) => {
    if (!profile.isClaimed) {
      setProfileToDelete(profile as DirectoryProfileWithUser);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (profileToDelete) {
      deleteProfile.mutate(profileToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProfileToDelete(null);
        },
        onError: () => {
          setDeleteDialogOpen(false);
          setProfileToDelete(null);
        },
      });
    }
  };

  const handleDeleteSkill = (skill: DirectorySkill) => {
    setSkillToDelete(skill);
    setDeleteSkillDialogOpen(true);
  };

  const handleDeleteSkillConfirm = () => {
    if (skillToDelete) {
      deleteSkill.mutate(skillToDelete.name, {
        onSuccess: () => {
          setDeleteSkillDialogOpen(false);
          setSkillToDelete(null);
        },
        onError: () => {
          setDeleteSkillDialogOpen(false);
          setSkillToDelete(null);
        },
      });
    }
  };

  const handleAssign = (profileId: string, userId: string) => {
    assignProfile.mutate({ id: profileId, userId });
  };

  const renderEditForm = (profile: DirectoryProfileWithUser) => (
    <Card>
      <CardContent className="p-4">
        <DirectoryAdminProfileForm
          formData={editFormData}
          onFormDataChange={(data) => setEditFormData({ ...editFormData, ...data })}
          skills={skills}
          sectors={availableSectors}
          jobTitles={availableJobTitles}
          isLoading={{
            skills: skillsLoading,
            sectors: sectorsLoading,
            jobTitles: jobTitlesLoading,
          }}
          onSubmit={() => handleUpdate(profile.id)}
          onCancel={cancelEdit}
          isSubmitting={updateProfile.isPending}
          mode="edit"
          profileId={profile.id}
          onDeleteSkill={handleDeleteSkill}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Directory Admin</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage Directory profiles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Create Unclaimed Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DirectoryAdminProfileForm
            formData={createFormData}
            onFormDataChange={(data) => setCreateFormData({ ...createFormData, ...data })}
            skills={skills}
            sectors={availableSectors}
            jobTitles={availableJobTitles}
            isLoading={{
              skills: skillsLoading,
              sectors: sectorsLoading,
              jobTitles: jobTitlesLoading,
            }}
            onSubmit={handleCreate}
            isSubmitting={createProfile.isPending}
            mode="create"
            onDeleteSkill={handleDeleteSkill}
          />
        </CardContent>
      </Card>

      <DirectoryAdminProfileList
        profiles={paginatedProfiles}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        page={page}
        onPageChange={setPage}
        limit={limit}
        total={total}
        users={users}
        onEdit={startEdit}
        onDelete={handleDeleteClick}
        onAssign={handleAssign}
        editingId={editingId}
        renderEditForm={renderEditForm}
      />

      {/* Delete Profile Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unclaimed Profile</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Are you sure you want to delete this unclaimed profile? This action is permanent and cannot be undone.</p>
              {profileToDelete && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Profile Details:</p>
                  <p className="text-sm text-muted-foreground">{profileToDelete.description}</p>
                  {(profileToDelete as any).firstName || (profileToDelete as any).lastName || (profileToDelete as any).displayName ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Full name: {[(profileToDelete as any).firstName, (profileToDelete as any).lastName]
                          .filter(Boolean)
                          .join(" ") || (profileToDelete as any).displayName || "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        First name: {(profileToDelete as any).firstName || "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last name: {(profileToDelete as any).lastName || "—"}
                      </p>
                    </>
                  ) : null}
                  {profileToDelete.skills && profileToDelete.skills.length > 0 && (
                    <p className="text-sm text-muted-foreground">Skills: {profileToDelete.skills.join(", ")}</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setProfileToDelete(null);
              }}
              disabled={deleteProfile.isPending}
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteProfile.isPending || !profileToDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteProfile.isPending ? "Deleting..." : "Delete Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Skill Confirmation Dialog */}
      <AlertDialog open={deleteSkillDialogOpen} onOpenChange={setDeleteSkillDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Are you sure you want to delete this skill? This action is permanent and cannot be undone.</p>
              {skillToDelete && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Skill Name:</p>
                  <p className="text-sm text-muted-foreground">{skillToDelete.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: This will not remove the skill from existing profiles, but it will no longer be available for new
                    selections.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteSkillDialogOpen(false);
                setSkillToDelete(null);
              }}
              disabled={deleteSkill.isPending}
              data-testid="button-cancel-delete-skill"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSkillConfirm}
              disabled={deleteSkill.isPending || !skillToDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-skill"
            >
              {deleteSkill.isPending ? "Deleting..." : "Delete Skill"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Announcements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Create and manage announcements for Directory.</p>
          <Link href="/apps/directory/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}
