/**
 * Hook for MechanicMatch Admin Profiles
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import type { MechanicmatchProfile } from "@shared/schema";
import { adminProfileFormSchema, transformProfilePayload, type AdminProfileFormValues } from "../utils/mechanicMatchAdminUtils";

export function useMechanicMatchAdminProfiles() {
  const limit = 20;
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<"all" | "mechanic" | "owner">("all");
  const [claimedFilter, setClaimedFilter] = useState<"all" | "claimed" | "unclaimed">("all");
  const [searchTerm, setSearchTerm] = useState("");
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

  return {
    limit,
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
    displayedProfiles: fuzzyProfiles,
    totalItems: data?.total ?? 0,
    createForm,
    createProfileMutation,
    invalidateProfiles,
  };
}

