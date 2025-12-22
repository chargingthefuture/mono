import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrivacyField } from "@/components/ui/privacy-field";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertLighthouseProfileSchema, type LighthouseProfile } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import { Home, ExternalLink, Check as CheckIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { useLocation } from "wouter";
import { useExternalLink } from "@/hooks/useExternalLink";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { COUNTRIES } from "@/lib/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { VerifiedBadge } from "@/components/verified-badge";

export default function LighthouseProfilePage() {
  const { toast } = useToast();
  const { handleError } = useErrorHandler({ showToast: false }); // We show custom toasts
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [desiredCountryOpen, setDesiredCountryOpen] = useState(false);
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const hasInitializedRef = useRef(false);
  const { data: profileData, isLoading } = useQuery<LighthouseProfile & { userIsVerified?: boolean; firstName?: string | null } | null>({
    queryKey: ["/api/lighthouse/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, firstName: _firstName, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;
  const firstName = (profileData as any)?.firstName || null;

  const form = useForm({
    resolver: zodResolver(
      insertLighthouseProfileSchema
        .omit({ userId: true })
        .extend({
          moveInDate: insertLighthouseProfileSchema.shape.moveInDate.optional().nullable(),
          budgetMin: insertLighthouseProfileSchema.shape.budgetMin.optional().nullable(),
          budgetMax: insertLighthouseProfileSchema.shape.budgetMax.optional().nullable(),
          desiredCountry: insertLighthouseProfileSchema.shape.desiredCountry.optional().nullable(),
        })
    ),
    defaultValues: {
      profileType: "seeker",
      bio: "",
      phoneNumber: "",
      signalUrl: "",
      housingNeeds: "",
      moveInDate: null,
      budgetMin: null,
      budgetMax: null,
      desiredCountry: null,
      hasProperty: false,
      isActive: true,
    },
  });

  // Load existing profile data
  useEffect(() => {
    if (profile && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      form.reset({
        profileType: profile.profileType,
        bio: profile.bio || "",
        phoneNumber: profile.phoneNumber || "",
        signalUrl: profile.signalUrl || "",
        housingNeeds: profile.housingNeeds || "",
        moveInDate: profile.moveInDate ? new Date(profile.moveInDate) : null,
        budgetMin: profile.budgetMin ?? null,
        budgetMax: profile.budgetMax ?? null,
        desiredCountry: profile.desiredCountry || null,
        hasProperty: profile.hasProperty || false,
        isActive: profile.isActive,
      } as any);
    } else if (!profile) {
      // Reset flag when profile is deleted/doesn't exist
      hasInitializedRef.current = false;
    }
  }, [profile]); // Only initialize once when profile first loads

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/lighthouse/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/profile"] });
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      setLocation("/apps/lighthouse");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PUT", "/api/lighthouse/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const res = await apiRequest("DELETE", "/api/lighthouse/profile", { reason });
      return await res.json();
    },
    onSuccess: async () => {
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/profile"] });
      toast({
        title: "Profile Deleted",
        description: "Your LightHouse profile has been deleted successfully.",
      });
      setLocation("/apps/lighthouse");
    },
    onError: (error: any) => {
      const parsed = handleError(error, "Delete Profile Error");
      toast({
        title: "Error",
        description: parsed.message || "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Transform empty strings to null for optional fields
    const submitData = {
      ...data,
      signalUrl: data.signalUrl === "" ? null : data.signalUrl,
      phoneNumber: data.phoneNumber === "" ? null : data.phoneNumber,
      desiredCountry: data.desiredCountry === "" ? null : data.desiredCountry,
    };
    
    if (profile) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const profileType = form.watch("profileType");
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <MiniAppBackButton />
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-semibold">
                {profile ? "Edit Profile" : "Create Profile"}
              </h1>
              {profile && <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-profile" />}
            </div>
            <p className="text-muted-foreground">
              {profile ? "Update your LightHouse profile information" : "Set up your LightHouse profile to get started"}
            </p>
            {firstName && (
              <p className="text-sm text-muted-foreground mt-1">
                Name: <span className="font-medium">{firstName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Tell us about yourself and your housing needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="profileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!profile && !isAdmin}>
                      <FormControl>
                        <SelectTrigger data-testid="select-profileType">
                          <SelectValue placeholder="Select profile type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="seeker">Housing Seeker (I need housing)</SelectItem>
                        <SelectItem value="host">Housing Host (I have housing to offer)</SelectItem>
                      </SelectContent>
                    </Select>
                    {profile && !isAdmin && (
                      <FormDescription>
                        Profile type cannot be changed after creation
                      </FormDescription>
                    )}
                    {profile && isAdmin && (
                      <FormDescription>
                        Admin: Profile type can be changed to view both marketplaces
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Me</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="Share a bit about yourself" 
                        rows={4}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    {profile?.phoneNumber && (
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">Current: </span>
                        <PrivacyField 
                          value={profile.phoneNumber} 
                          type="phone"
                          testId="current-phone-display"
                          className="text-sm"
                        />
                      </div>
                    )}
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="(555) 123-4567" data-testid="input-phoneNumber" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signal Profile URL (Optional)</FormLabel>
                    {profile?.signalUrl && (
                      <div className="mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openExternal(profile.signalUrl!)}
                          className="justify-start px-0 text-primary"
                          data-testid="button-open-signal-link"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Open Signal link
                        </Button>
                      </div>
                    )}
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="https://signal.me/#p/…" data-testid="input-signalUrl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {profileType === "seeker" && (
                <>
                  <FormField
                    control={form.control}
                    name="housingNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Housing Needs</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""} 
                            placeholder="Describe your housing needs and situation" 
                            rows={3}
                            data-testid="input-housingNeeds"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moveInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Move-in Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} 
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            data-testid="input-moveInDate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="desiredCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Country (Optional)</FormLabel>
                        <Popover open={desiredCountryOpen} onOpenChange={setDesiredCountryOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                data-testid="select-desiredCountry"
                              >
                                {field.value || "Select country"}
                                <CheckIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search countries…" />
                              <CommandEmpty>No countries found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((country) => (
                                  <CommandItem
                                    key={country}
                                    value={country}
                                    onSelect={() => {
                                      field.onChange(country);
                                      setDesiredCountryOpen(false);
                                    }}
                                    data-testid={`combo-desiredCountry-item-${country}`}
                                  >
                                    <CheckIcon className={`mr-2 h-4 w-4 ${field.value === country ? "opacity-100" : "opacity-0"}`} />
                                    <span>{country}</span>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budgetMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Monthly Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ""} 
                              onChange={(e) => field.onChange(e.target.value ? e.target.value : null)}
                              placeholder="0" 
                              data-testid="input-budgetMin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Monthly Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ""} 
                              onChange={(e) => field.onChange(e.target.value ? e.target.value : null)}
                              placeholder="0" 
                              data-testid="input-budgetMax"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={isSubmitting} data-testid="button-save">
                  {isSubmitting ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
                </Button>
                {profile && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    data-testid="button-delete-profile"
                  >
                    Delete Profile
                  </Button>
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
          appName="LightHouse"
          isDeleting={deleteMutation.isPending}
        />
      )}
      <ExternalLinkDialog />
    </div>
  );
}
