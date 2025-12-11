import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSupportMatchProfileSchema } from "@shared/schema";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SupportMatchProfile } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { US_STATES } from "@/lib/usStates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check as CheckIcon } from "lucide-react";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { VerifiedBadge } from "@/components/verified-badge";

const profileFormSchema = insertSupportMatchProfileSchema.omit({ userId: true }).extend({
  nickname: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  gender: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  genderPreference: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  city: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  state: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  country: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  timezone: z.preprocess((val) => (val === "" ? null : val), z.string().nullish()),
  timezonePreference: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function SupportMatchProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery<SupportMatchProfile & { userIsVerified?: boolean } | null>({
    queryKey: ["/api/supportmatch/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: "",
      gender: "",
      genderPreference: "",
      city: "",
      state: null,
      country: "",
      timezone: "",
      timezonePreference: "same_timezone",
      isActive: true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        nickname: profile.nickname || "",
        gender: profile.gender || "",
        genderPreference: profile.genderPreference || "",
        city: profile.city || "",
        state: profile.state || null,
        country: profile.country || "",
        timezone: profile.timezone || "",
        timezonePreference: profile.timezonePreference || "same_timezone",
        isActive: profile.isActive,
      });
    }
  }, [profile, form]);

  const createMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("POST", "/api/supportmatch/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/profile"] });
      toast({
        title: "Profile Created",
        description: "Your SupportMatch profile has been created successfully.",
      });
      setLocation("/apps/supportmatch");
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
      apiRequest("PUT", "/api/supportmatch/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your SupportMatch profile has been updated successfully.",
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
      const res = await apiRequest("DELETE", "/api/supportmatch/profile", { reason });
      return await res.json();
    },
    onSuccess: async () => {
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/profile"] });
      toast({
        title: "Profile Deleted",
        description: "Your SupportMatch profile has been deleted successfully.",
      });
      setLocation("/apps/supportmatch");
    },
    onError: (error: any) => {
      console.error("Delete profile error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // Convert empty strings to null for optional fields
    const cleanedData = {
      ...data,
      nickname: data.nickname?.trim() || null,
      gender: data.gender || null,
      genderPreference: data.genderPreference || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      country: data.country || null,
      timezone: data.timezone || null,
      timezonePreference: data.timezonePreference || "same_timezone",
    };
    
    if (profile) {
      updateMutation.mutate(cleanedData);
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const state = form.watch("state");

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <MiniAppBackButton />
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
            {profile ? "Edit Profile" : "Create Profile"}
          </h1>
          {profile && <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-profile" />}
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          {profile 
            ? "Update your SupportMatch profile and preferences" 
            : "Set up your profile to start matching with accountability partners"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="How you'd like to be called"
                        data-testid="input-nickname"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genderPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Gender Preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender-preference">
                          <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="same_gender">Same gender as yourself</SelectItem>
                        <SelectItem value="any">Any gender</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your city"
                          data-testid="input-city"
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel>US State (Optional)</FormLabel>
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
                      <FormLabel>Country (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="New Zealand">New Zealand</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Malaysia">Malaysia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="Belgium">Belgium</SelectItem>
                          <SelectItem value="Switzerland">Switzerland</SelectItem>
                          <SelectItem value="Austria">Austria</SelectItem>
                          <SelectItem value="Sweden">Sweden</SelectItem>
                          <SelectItem value="Norway">Norway</SelectItem>
                          <SelectItem value="Denmark">Denmark</SelectItem>
                          <SelectItem value="Finland">Finland</SelectItem>
                          <SelectItem value="Poland">Poland</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Greece">Greece</SelectItem>
                          <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                          <SelectItem value="Mexico">Mexico</SelectItem>
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          <SelectItem value="Argentina">Argentina</SelectItem>
                          <SelectItem value="Chile">Chile</SelectItem>
                          <SelectItem value="Colombia">Colombia</SelectItem>
                          <SelectItem value="Peru">Peru</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="South Korea">South Korea</SelectItem>
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="Taiwan">Taiwan</SelectItem>
                          <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                          <SelectItem value="Thailand">Thailand</SelectItem>
                          <SelectItem value="Vietnam">Vietnam</SelectItem>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Pakistan">Pakistan</SelectItem>
                          <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                          <SelectItem value="Nepal">Nepal</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="Morocco">Morocco</SelectItem>
                          <SelectItem value="Israel">Israel</SelectItem>
                          <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                          <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="Turkey">Turkey</SelectItem>
                          <SelectItem value="Russia">Russia</SelectItem>
                          <SelectItem value="Ukraine">Ukraine</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-timezone">
                          <SelectValue placeholder="Select your timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Phoenix">Arizona</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Anchorage">Alaska</SelectItem>
                        <SelectItem value="Pacific/Honolulu">Hawaii</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris, Berlin, Rome</SelectItem>
                        <SelectItem value="Europe/Athens">Athens, Istanbul</SelectItem>
                        <SelectItem value="Europe/Moscow">Moscow</SelectItem>
                        <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                        <SelectItem value="Asia/Kolkata">India</SelectItem>
                        <SelectItem value="Asia/Bangkok">Bangkok, Jakarta</SelectItem>
                        <SelectItem value="Asia/Shanghai">Beijing, Shanghai</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo, Seoul</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney, Melbourne</SelectItem>
                        <SelectItem value="Pacific/Auckland">Auckland</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezonePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone Partner Preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "same_timezone"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-timezone-preference">
                          <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="same_timezone">Match only with my timezone</SelectItem>
                        <SelectItem value="any_timezone">Match with any timezone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-profile"
                  className="text-sm sm:text-base"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : profile
                    ? "Update Profile"
                    : "Create Profile"}
                </Button>
                {profile && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/apps/supportmatch")}
                      data-testid="button-cancel"
                      className="text-sm sm:text-base"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      data-testid="button-delete-profile"
                      className="text-sm sm:text-base sm:ml-auto"
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
          appName="SupportMatch"
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
