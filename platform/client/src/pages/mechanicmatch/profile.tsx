import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertMechanicmatchProfileSchema, type MechanicmatchProfile } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { useLocation } from "wouter";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/usStates";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/verified-badge";

const profileFormSchema = insertMechanicmatchProfileSchema.omit({ userId: true });

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function MechanicMatchProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery<MechanicmatchProfile & { userIsVerified?: boolean } | null>({
    queryKey: ["/api/mechanicmatch/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      isCarOwner: false,
      isMechanic: false,
      city: "",
      state: null,
      country: null,
      phoneNumber: "",
      signalUrl: "",
      ownerBio: "",
      mechanicBio: "",
      experience: null,
      shopLocation: "",
      isMobileMechanic: false,
      hourlyRate: null,
      specialties: "",
      certifications: "",
      sampleJobs: "",
      portfolioPhotos: "",
      responseTimeHours: null,
      averageRating: null,
      isPublic: false,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        isCarOwner: profile.isCarOwner ?? false,
        isMechanic: profile.isMechanic ?? false,
        city: profile.city || "",
        state: profile.state || null,
        country: profile.country || null,
        phoneNumber: profile.phoneNumber || "",
        signalUrl: profile.signalUrl || "",
        ownerBio: profile.ownerBio || "",
        mechanicBio: profile.mechanicBio || "",
        experience: profile.experience || null,
        shopLocation: profile.shopLocation || "",
        isMobileMechanic: profile.isMobileMechanic ?? false,
        hourlyRate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : null,
        specialties: profile.specialties || "",
        certifications: profile.certifications || "",
        sampleJobs: profile.sampleJobs || "",
        portfolioPhotos: profile.portfolioPhotos || "",
        responseTimeHours: profile.responseTimeHours || null,
        averageRating: profile.averageRating ? parseFloat(profile.averageRating) : null,
        isPublic: profile.isPublic ?? false,
      });
    }
  }, [profile, form]);

  const createMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("POST", "/api/mechanicmatch/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/profile"] });
      toast({
        title: "Profile Created",
        description: "Your MechanicMatch profile has been created successfully.",
      });
      setLocation("/apps/mechanicmatch");
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
      apiRequest("PUT", "/api/mechanicmatch/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your MechanicMatch profile has been updated successfully.",
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
    mutationFn: (reason?: string) =>
      apiRequest("DELETE", "/api/mechanicmatch/profile", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/profile"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Profile Deleted",
        description: "Your MechanicMatch profile has been deleted successfully.",
      });
      setLocation("/apps/mechanicmatch");
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
      city: data.city === "" ? null : data.city,
      state: data.state === "" ? null : data.state,
      country: data.country === "" ? null : data.country,
      ownerBio: data.ownerBio === "" ? null : data.ownerBio,
      mechanicBio: data.mechanicBio === "" ? null : data.mechanicBio,
      shopLocation: data.shopLocation === "" ? null : data.shopLocation,
      specialties: data.specialties === "" ? null : data.specialties,
      certifications: data.certifications === "" ? null : data.certifications,
      sampleJobs: data.sampleJobs === "" ? null : data.sampleJobs,
      portfolioPhotos: data.portfolioPhotos === "" ? null : data.portfolioPhotos,
    };

    if (profile) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const countryValue = form.watch("country");
  const stateValue = form.watch("state");

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
          <CardDescription>
            You can be both a car owner and a mechanic. Select your roles below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium">Roles</h3>
                <FormField
                  control={form.control}
                  name="isCarOwner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-car-owner"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Car Owner</FormLabel>
                        <FormDescription>
                          I need help with my vehicle(s)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isMechanic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-mechanic"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mechanic</FormLabel>
                        <FormDescription>
                          I provide vehicle repair and maintenance services
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Common Fields */}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="City" data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>State</FormLabel>
                      <Popover open={stateOpen} onOpenChange={setStateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="select-state"
                            >
                              {field.value
                                ? US_STATES.find((state) => state === field.value)
                                : "Select state"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup>
                              {US_STATES.map((state) => (
                                <CommandItem
                                  value={state}
                                  key={state}
                                  onSelect={() => {
                                    form.setValue("state", state);
                                    setStateOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      state === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
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
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="select-country"
                          >
                            {field.value
                              ? COUNTRIES.find((country) => country === field.value)
                              : "Select country"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {COUNTRIES.map((country) => (
                              <CommandItem
                                value={country}
                                key={country}
                                onSelect={() => {
                                  form.setValue("country", country);
                                  setCountryOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    country === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
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

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Phone number" data-testid="input-phone" />
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
                    <FormLabel>Signal Profile URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="https://signal.me/..." data-testid="input-signal-url" />
                    </FormControl>
                    <FormDescription>Link to your Signal profile for secure communication</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Car Owner Specific Fields */}
              {form.watch("isCarOwner") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Car Owner Information</h3>
                  <FormField
                    control={form.control}
                    name="ownerBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} placeholder="Tell us about yourself as a car owner" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Mechanic Specific Fields */}
              {form.watch("isMechanic") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Mechanic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="mechanicBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} placeholder="Tell us about your experience and expertise" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              min="0"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  field.onChange(null);
                                } else {
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    field.onChange(numValue);
                                  }
                                }
                              }}
                              placeholder="Years"
                              data-testid="input-experience"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              placeholder="Rate per hour"
                              data-testid="input-hourly-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shopLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Location</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="Physical shop address (optional)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isMobileMechanic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-mobile-mechanic"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mobile Mechanic</FormLabel>
                          <FormDescription>
                            I provide on-site service (come to customer location)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialties</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Comma-separated list (e.g., Engine Repair, Transmission, Brakes)"
                            rows={2}
                          />
                        </FormControl>
                        <FormDescription>List your areas of expertise</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="List your certifications (JSON format or plain text)"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Visibility */}
              <div className="space-y-2 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-public-profile"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make my MechanicMatch profile public</FormLabel>
                        <FormDescription>
                          Allow others to view your profile in the public directory
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  data-testid="button-save-profile"
                >
                  {isSubmitting ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
                </Button>
                {profile && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/apps/mechanicmatch")}
                      data-testid="button-cancel"
                    >
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
          appName="MechanicMatch"
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
