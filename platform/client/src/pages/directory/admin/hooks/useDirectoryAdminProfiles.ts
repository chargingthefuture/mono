import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DirectoryProfile } from "@shared/schema";

export function useDirectoryAdminProfiles() {
  const { toast } = useToast();

  const createProfile = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/directory/admin/profiles", payload);
      return await res.json();
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      const profileId = data?.id;
      const wasPublic = variables.isPublic;
      if (profileId && wasPublic) {
        toast({
          title: "Created",
          description: `Profile created. Public URL: ${window.location.origin}/apps/directory/public/${profileId}`,
          duration: 8000,
        });
      } else {
        toast({ title: "Created", description: "Unclaimed Directory profile created" });
      }
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message || "Failed to create profile", variant: "destructive" }),
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      apiRequest("PUT", `/api/directory/admin/profiles/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      toast({ title: "Updated", description: "Profile updated" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message || "Failed to update profile", variant: "destructive" }),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/directory/admin/profiles/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      toast({ title: "Deleted", description: "Unclaimed profile deleted successfully" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message || "Failed to delete profile", variant: "destructive" }),
  });

  const assignProfile = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) =>
      apiRequest("PUT", `/api/directory/admin/profiles/${id}/assign`, { userId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      toast({ title: "Assigned", description: "Profile assigned to user" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message || "Failed to assign", variant: "destructive" }),
  });

  return {
    createProfile,
    updateProfile,
    deleteProfile,
    assignProfile,
  };
}

