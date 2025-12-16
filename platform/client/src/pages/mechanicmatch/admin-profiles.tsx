import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import type { MechanicmatchProfile } from "@shared/schema";
import { PaginationControls } from "@/components/pagination-controls";
import { Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { ArrowLeft, Users, Wrench, ShieldQuestion, PencilLine, Trash2, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/usStates";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

const adminProfileFormSchema = z
  .object({
    firstName: z.string().max(100).optional().nullable(),
    isCarOwner: z.boolean().default(false),
    isMechanic: z.boolean().default(true),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    signalUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
    isPublic: z.boolean().default(false),
  })
  .refine((data) => data.isCarOwner || data.isMechanic, {
    message: "Select at least one role",
    path: ["isMechanic"],
  });

type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;

export default function MechanicMatchAdminProfiles() {
  const limit = 20;
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<"all" | "mechanic" | "owner">("all");
  const [claimedFilter, setClaimedFilter] = useState<"all" | "claimed" | "unclaimed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<MechanicmatchProfile | null>(null);
  const [assigningProfile, setAssigningProfile] = useState<MechanicmatchProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<MechanicmatchProfile | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const { toast } = useToast();

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: (page * limit).toString(),
    });

    if (roleFilter !== "all") {
      params.append("role", roleFilter === "mechanic" ? "mechanic" : "owner");
    }

    if (claimedFilter !== "all") {
      params.append("claimed", claimedFilter === "claimed" ? "true" : "false");
    }

    return params.toString();
  }, [claimedFilter, limit, page, roleFilter]);

  const endpoint = `/api/mechanicmatch/admin/profiles?${queryParams}`;

  const { data, isLoading } = useQuery<{ items: MechanicmatchProfile[]; total: number }>({
    queryKey: [endpoint],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const fuzzyProfiles = useFuzzySearch(data?.items ?? [], searchTerm, {
    searchFields: ["city", "state", "country", "mechanicBio", "ownerBio", "phoneNumber"],
    threshold: 0.3,
  });

  const invalidateProfiles = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("/api/mechanicmatch/admin/profiles"),
    });
  };

  const createForm = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileFormSchema),
    defaultValues: {
      firstName: "",
      isCarOwner: false,
      isMechanic: true,
      city: "",
      state: "",
      country: "",
      phoneNumber: "",
      signalUrl: "",
      isPublic: false,
    },
  });

  const editForm = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileFormSchema),
  });

  useEffect(() => {
    if (editingProfile) {
      editForm.reset({
        firstName: editingProfile.firstName || "",
        isCarOwner: editingProfile.isCarOwner,
        isMechanic: editingProfile.isMechanic,
        city: editingProfile.city || "",
        state: editingProfile.state || "",
        country: editingProfile.country || "",
        phoneNumber: editingProfile.phoneNumber || "",
        signalUrl: editingProfile.signalUrl || "",
        isPublic: editingProfile.isPublic ?? false,
      });
    }
  }, [editForm, editingProfile]);

  const createProfileMutation = useMutation({
    mutationFn: async (values: AdminProfileFormValues) => {
      const payload = transformProfilePayload(values);
      const response = await apiRequest("POST", "/api/mechanicmatch/admin/profiles", payload);
      return await response.json();
    },
    onSuccess: (data) => {
      invalidateProfiles();
      const wasPublic = createForm.getValues("isPublic");
      createForm.reset();
      if (data?.id && wasPublic) {
        toast({ 
          title: "Profile Created", 
          description: `Unclaimed profile created. Public URL: ${window.location.origin}/apps/mechanicmatch/public/${data.id}`,
          duration: 8000,
        });
      } else {
        toast({ title: "Profile Created", description: "Unclaimed profile created successfully." });
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create profile", variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: AdminProfileFormValues) => {
      if (!editingProfile) throw new Error("No profile selected");
      const payload = transformProfilePayload(values);
      await apiRequest("PUT", `/api/mechanicmatch/admin/profiles/${editingProfile.id}`, payload);
    },
    onSuccess: () => {
      invalidateProfiles();
      setEditDialogOpen(false);
      toast({ title: "Profile Updated", description: "Profile details updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
    },
  });

  const assignProfileMutation = useMutation({
    mutationFn: async ({ profileId, userId }: { profileId: string; userId: string }) => {
      await apiRequest("PUT", `/api/mechanicmatch/admin/profiles/${profileId}/assign`, { userId });
    },
    onSuccess: () => {
      invalidateProfiles();
      setAssignDialogOpen(false);
      setAssignUserId("");
      setUserSearchOpen(false);
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

  const displayedProfiles = fuzzyProfiles;
  const totalItems = data?.total ?? 0;

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
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <RoleCheckbox control={createForm.control} name="isCarOwner" label="Car Owner" description="Provide owner context" dataTestId="checkbox-car-owner-create" />
                <RoleCheckbox control={createForm.control} name="isMechanic" label="Mechanic" description="Available for bookings" dataTestId="checkbox-mechanic-create" />
              </div>

              <FormField
                control={createForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="First name (for unclaimed profiles)" data-testid="input-first-name-create" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={createForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="City" data-testid="input-city-create" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <StateSelect form={createForm} name="state" testId="select-state-create" />
                <CountrySelect form={createForm} name="country" testId="select-country-create" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={createForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="+1 555 123 4567" data-testid="input-phone-create" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="signalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signal Link</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://signal.me/#p/+1..." data-testid="input-signal-create" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-public-create"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make profile public</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow this profile to be visible in the public directory
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1" disabled={createProfileMutation.isPending} data-testid="button-admin-create-profile">
                  <Wrench className="w-4 h-4 mr-2" />
                  {createProfileMutation.isPending ? "Creating..." : "Create Unclaimed Profile"}
                </Button>
                <Button type="button" variant="outline" onClick={() => createForm.reset()} data-testid="button-admin-clear-form">
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Profile Directory</CardTitle>
            <CardDescription>Track claimed and unclaimed listings.</CardDescription>
          </div>
          <div className="grid gap-3 md:grid-cols-3 w-full md:w-auto">
            <Input
              placeholder="Search profiles"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
              data-testid="input-admin-search"
            />
            <Select
              value={roleFilter}
              onValueChange={(value: "all" | "mechanic" | "owner") => {
                setRoleFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="mechanic">Mechanics</SelectItem>
                <SelectItem value="owner">Car Owners</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={claimedFilter}
              onValueChange={(value: "all" | "claimed" | "unclaimed") => {
                setClaimedFilter(value);
                setPage(0);
              }}
            >
              <SelectTrigger data-testid="select-claimed-filter">
                <SelectValue placeholder="Claimed status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All profiles</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="unclaimed">Unclaimed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading profiles...</p>
            </div>
          ) : displayedProfiles.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShieldQuestion className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <p className="text-muted-foreground">No profiles match your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedProfiles.map((profile) => (
                <div key={profile.id} className="p-4 border rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between" data-testid={`profile-row-${profile.id}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{profile.userId ? "Claimed Profile" : "Unclaimed Profile"}</h3>
                      <Badge variant={profile.isClaimed ? "default" : "secondary"}>
                        {profile.isClaimed ? "Claimed" : "Unclaimed"}
                      </Badge>
                    </div>
                    {(() => {
                      const firstName = (profile as any).firstName?.trim();
                      return firstName ? (
                        <div className="text-base font-medium">{firstName}</div>
                      ) : null;
                    })()}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {profile.city && <span>{profile.city}</span>}
                      {profile.state && <span>{profile.state}</span>}
                      {profile.country && <span>{profile.country}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide">
                      {profile.isMechanic && <Badge variant="outline">Mechanic</Badge>}
                      {profile.isCarOwner && <Badge variant="outline">Car Owner</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!profile.isClaimed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAssigningProfile(profile);
                          setAssignDialogOpen(true);
                        }}
                        data-testid={`button-assign-${profile.id}`}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign to User
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProfile(profile);
                        setEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-${profile.id}`}
                    >
                      <PencilLine className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {!profile.isClaimed && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeletingProfile(profile);
                          setDeleteDialogOpen(true);
                        }}
                        data-testid={`button-delete-${profile.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaginationControls
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={setPage}
            className="mt-6"
          />
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => setEditDialogOpen(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update the selected profile. Claimed status cannot be changed here.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <RoleCheckbox control={editForm.control} name="isCarOwner" label="Car Owner" description="Has owner profile" dataTestId="checkbox-car-owner-edit" />
                <RoleCheckbox control={editForm.control} name="isMechanic" label="Mechanic" description="Offers services" dataTestId="checkbox-mechanic-edit" />
              </div>

              <FormField
                control={editForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="First name (for unclaimed profiles)" data-testid="input-first-name-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-city-edit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <StateSelect form={editForm} name="state" testId="select-state-edit" />
                <CountrySelect form={editForm} name="country" testId="select-country-edit" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-phone-edit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="signalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signal Link</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-signal-edit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-public-edit"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make profile public</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow this profile to be visible in the public directory
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-edit">
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(open) => {
        setAssignDialogOpen(open);
        if (!open) {
          setAssignUserId("");
          setUserSearchOpen(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Profile</DialogTitle>
            <DialogDescription>Select a user to claim this profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userSearchOpen}
                  className="w-full justify-between"
                  data-testid="button-select-user"
                >
                  {assignUserId
                    ? (() => {
                        const selectedUser = users.find((u) => u.id === assignUserId);
                        if (selectedUser) {
                          const displayName = selectedUser.firstName && selectedUser.lastName
                            ? `${selectedUser.firstName} ${selectedUser.lastName}`
                            : selectedUser.email || "User";
                          return displayName;
                        }
                        return "Select user...";
                      })()
                    : "Select user..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search users by name or email..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users
                        .filter((user) => {
                          // Filter out deleted users
                          if (!user || !user.id) return false;
                          const id = String(user.id);
                          return !id.startsWith("deleted_user_");
                        })
                        .map((user) => {
                          const selected = assignUserId === user.id;
                          const displayName = user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : "User";
                          return (
                            <CommandItem
                              key={user.id}
                              value={`${displayName} ${user.email || ""}`}
                              onSelect={() => {
                                setAssignUserId(user.id);
                                setUserSearchOpen(false);
                              }}
                              data-testid={`command-user-${user.id}`}
                              className="break-words"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  selected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate">{displayName}</span>
                                {user.email && (
                                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setAssignDialogOpen(false);
              setAssignUserId("");
              setUserSearchOpen(false);
            }} data-testid="button-cancel-assign">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!assignUserId || assignProfileMutation.isPending || !assigningProfile}
              onClick={() => {
                if (assigningProfile && assignUserId) {
                  assignProfileMutation.mutate({ profileId: assigningProfile.id, userId: assignUserId });
                }
              }}
              data-testid="button-confirm-assign"
            >
              {assignProfileMutation.isPending ? "Assigning..." : "Assign Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => setDeleteDialogOpen(open)}>
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
              onClick={() => {
                if (deletingProfile) {
                  deleteProfileMutation.mutate(deletingProfile.id);
                }
              }}
              data-testid="button-confirm-delete-profile"
            >
              {deleteProfileMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function transformProfilePayload(values: AdminProfileFormValues) {
  // Explicitly set all fields to ensure defaults are applied and undefined values are handled
  return {
    firstName: values.firstName?.trim() || null,
    isCarOwner: values.isCarOwner ?? false,
    isMechanic: values.isMechanic ?? false,
    city: values.city?.trim() || null,
    state: values.state?.trim() || null,
    country: values.country?.trim() || null,
    phoneNumber: values.phoneNumber?.trim() || null,
    signalUrl: values.signalUrl?.trim() || null,
    isPublic: values.isPublic ?? false,
    // Explicitly set defaults for fields that have NOT NULL constraints
    isMobileMechanic: false,
    isClaimed: false,
  };
}

interface RoleCheckboxProps {
  control: any;
  name: "isCarOwner" | "isMechanic";
  label: string;
  description: string;
  dataTestId: string;
}

function RoleCheckbox({ control, name, label, description, dataTestId }: RoleCheckboxProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid={dataTestId} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </FormItem>
      )}
    />
  );
}

interface LocationSelectProps {
  form: ReturnType<typeof useForm<AdminProfileFormValues>>;
  name: "state" | "country";
  testId: string;
}

function StateSelect({ form, name, testId }: LocationSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>State</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                  data-testid={testId}
                >
                  {field.value || "Select state"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search state..." />
                <CommandEmpty>No state found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {US_STATES.map((state) => (
                    <CommandItem
                      key={state}
                      value={state}
                      onSelect={() => {
                        form.setValue(name, state);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", state === field.value ? "opacity-100" : "opacity-0")} />
                      {state}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CountrySelect({ form, name, testId }: LocationSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Country</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                  data-testid={testId}
                >
                  {field.value || "Select country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {COUNTRIES.map((country) => (
                    <CommandItem
                      key={country}
                      value={country}
                      onSelect={() => {
                        form.setValue(name, country);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", country === field.value ? "opacity-100" : "opacity-0")} />
                      {country}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

