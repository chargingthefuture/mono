import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertChymeProfileSchema, type ChymeProfile } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { useLocation } from "wouter";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { VerifiedBadge } from "@/components/verified-badge";

const profileFormSchema = insertChymeProfileSchema.omit({ userId: true });

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ChymeProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery<ChymeProfile & { userIsVerified?: boolean } | null>({
    queryKey: ["/api/chyme/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {},
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("PUT", "/api/chyme/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chyme/profile"] });
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("POST", "/api/chyme/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chyme/profile"] });
      toast({ title: "Profile Created", description: "Your profile has been created successfully." });
      setLocation("/apps/chyme");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reason?: string) =>
      apiRequest("DELETE", "/api/chyme/profile", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chyme/profile"] });
      setDeleteDialogOpen(false);
      toast({ title: "Profile Deleted", description: "Your profile has been deleted successfully." });
      setLocation("/apps/chyme");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete profile", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (profile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <MiniAppBackButton />
      
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          {profile ? "Edit Profile" : "Create Profile"}
        </h1>
        {profile && <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-profile" />}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-3">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                  {profile ? "Update Profile" : "Create Profile"}
                </Button>
                {profile && (
                  <>
                    <Button type="button" variant="outline" onClick={() => setLocation("/apps/chyme")}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      data-testid="button-delete-profile"
                    >
                      Delete Profile
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {profile && (
        <DeleteProfileDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={(reason) => deleteMutation.mutate(reason)}
          appName="Chyme"
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

