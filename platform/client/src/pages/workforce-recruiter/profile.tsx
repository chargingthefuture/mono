import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertWorkforceRecruiterProfileSchema } from "@shared/schema";
import { z } from "zod";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { useLocation } from "wouter";
import type { WorkforceRecruiterProfile } from "@shared/schema";
import { VerifiedBadge } from "@/components/verified-badge";

const profileFormSchema = insertWorkforceRecruiterProfileSchema.omit({ userId: true });
type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function WorkforceRecruiterProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery<WorkforceRecruiterProfile & { userIsVerified?: boolean } | null>({
    queryKey: ["/api/workforce-recruiter/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        notes: profile.notes || "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("PUT", "/api/workforce-recruiter/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/profile"] });
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("POST", "/api/workforce-recruiter/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/profile"] });
      toast({ title: "Profile Created", description: "Your profile has been created successfully." });
      setLocation("/apps/workforce-recruiter");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reason?: string) =>
      apiRequest("DELETE", "/api/workforce-recruiter/profile", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/profile"] });
      setDeleteDialogOpen(false);
      toast({ title: "Profile Deleted", description: "Your profile has been deleted successfully." });
      setLocation("/apps/workforce-recruiter");
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

  if (isLoading) return <div className="p-4 sm:p-6 md:p-8">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
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

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Add any notes about your profile"
                        rows={4}
                        data-testid="input-notes"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending} 
                  data-testid="button-submit"
                  className="w-full sm:w-auto"
                >
                  {profile ? "Update Profile" : "Create Profile"}
                </Button>
                {profile && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setLocation("/apps/workforce-recruiter")} 
                      data-testid="button-cancel"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      data-testid="button-delete-profile"
                      className="w-full sm:w-auto"
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
          appName="Workforce Recruiter"
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

