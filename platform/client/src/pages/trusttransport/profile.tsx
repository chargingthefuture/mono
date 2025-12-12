import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrusttransportProfileSchema } from "@shared/schema";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TrusttransportProfile } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Car, ExternalLink, Check as CheckIcon } from "lucide-react";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { useExternalLink } from "@/hooks/useExternalLink";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/usStates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { VerifiedBadge } from "@/components/verified-badge";

const profileFormSchema = insertTrusttransportProfileSchema.omit({ userId: true });

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function TrustTransportProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const hasInitializedRef = useRef(false);

  const { data: profileData, isLoading } = useQuery<TrusttransportProfile & { userIsVerified?: boolean } | null>({
    queryKey: ["/api/trusttransport/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      isDriver: false,
      isRider: false,
      city: "",
      state: "",
      country: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: null,
      vehicleColor: "",
      licensePlate: "",
      bio: "",
      phoneNumber: "",
      signalUrl: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (profile && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      form.reset({
        isDriver: profile.isDriver ?? false,
        isRider: profile.isRider ?? true,
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        vehicleMake: profile.vehicleMake || "",
        vehicleModel: profile.vehicleModel || "",
        vehicleYear: profile.vehicleYear || null,
        vehicleColor: profile.vehicleColor || "",
        licensePlate: profile.licensePlate || "",
        bio: profile.bio || "",
        phoneNumber: profile.phoneNumber || "",
        signalUrl: profile.signalUrl || "",
        isActive: profile.isActive,
      });
    } else if (!profile) {
      // Reset flag when profile is deleted/doesn't exist
      hasInitializedRef.current = false;
    }
  }, [profile]); // Only initialize once when profile first loads

  const createMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("POST", "/api/trusttransport/profile", data),
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your TrustTransport profile has been created successfully.",
      });
      // Navigate immediately, query will refetch on the dashboard
      setLocation("/apps/trusttransport");
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
    mutationFn: (data: ProfileFormData) =>
      apiRequest("PUT", "/api/trusttransport/profile", data),
    onSuccess: async () => {
      // Update form values directly instead of invalidating to prevent re-render loop
      toast({
        title: "Profile Updated",
        description: "Your TrustTransport profile has been updated successfully.",
      });
      // Invalidate after a delay to allow UI to update first
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/profile"] });
      }, 500);
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
    mutationFn: (reason?: string) =>
      apiRequest("DELETE", "/api/trusttransport/profile", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/profile"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Profile Deleted",
        description: "Your TrustTransport profile has been deleted successfully.",
      });
      setLocation("/apps/trusttransport");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // Transform empty strings to null for optional fields
    const submitData = {
      ...data,
      signalUrl: data.signalUrl === "" ? null : data.signalUrl,
      phoneNumber: data.phoneNumber === "" ? null : data.phoneNumber,
    };
    
    if (profile) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const country = form.watch("country");
  const state = form.watch("state");

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
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <MiniAppBackButton />
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {profile ? "Edit Profile" : "Create Profile"}
              </h1>
              {profile && <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-profile" />}
            </div>
            <p className="text-muted-foreground">
              {profile ? "Update your TrustTransport driver profile" : "Set up your TrustTransport driver profile"}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Tell us about yourself and your vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <FormLabel>I am a *</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">
                  Select all that apply. You can be both a driver and rider.
                </p>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="isDriver"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-is-driver"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            Driver (I offer rides)
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Check this if you plan to offer rides to others. Fill in the vehicle information below if checked.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isRider"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-is-rider"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            Rider (I need rides)
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Check this if you may request rides from others.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City" data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>US State *</FormLabel>
                      <Popover open={stateOpen} onOpenChange={setStateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                              data-testid="combo-state-trigger"
                            >
                              {state || "Select US State"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command shouldFilter>
                            <CommandInput placeholder="Search US states…" />
                            <CommandEmpty>No states found.</CommandEmpty>
                            <CommandGroup>
                              {US_STATES.map((s) => (
                                <CommandItem
                                  key={s}
                                  value={s}
                                  onSelect={() => {
                                    field.onChange(s);
                                    setStateOpen(false);
                                  }}
                                  data-testid={`combo-state-item-${s}`}
                                >
                                  <CheckIcon className={`mr-2 h-4 w-4 ${state === s ? "opacity-100" : "opacity-0"}`} />
                                  <span>{s}</span>
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

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                              data-testid="combo-country-trigger"
                            >
                              {country || "Select country"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command shouldFilter>
                            <CommandInput placeholder="Search countries…" />
                            <CommandEmpty>No countries found.</CommandEmpty>
                            <CommandGroup>
                              {COUNTRIES.map((c) => (
                                <CommandItem
                                  key={c}
                                  value={c}
                                  onSelect={() => {
                                    field.onChange(c);
                                    setCountryOpen(false);
                                  }}
                                  data-testid={`combo-country-item-${c}`}
                                >
                                  <CheckIcon className={`mr-2 h-4 w-4 ${country === c ? "opacity-100" : "opacity-0"}`} />
                                  <span>{c}</span>
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
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="Tell others about yourself" 
                        rows={3}
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

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Vehicle Information (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Only fill this section if you plan to offer rides as a driver
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Make</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., Toyota" data-testid="input-vehicleMake" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., Camry" data-testid="input-vehicleModel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || ""} 
                            placeholder="e.g., 2020"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            data-testid="input-vehicleYear"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Color</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., Blue" data-testid="input-vehicleColor" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="e.g., ABC123" data-testid="input-licensePlate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
                  {profile ? "Update Profile" : "Create Profile"}
                </Button>
                {profile && (
                  <>
                    <Button type="button" variant="outline" onClick={() => setLocation("/apps/trusttransport")}>
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
          appName="TrustTransport"
          isDeleting={deleteMutation.isPending}
        />
      )}
      <ExternalLinkDialog />
    </div>
  );
}

