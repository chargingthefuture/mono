import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSocketrelayProfileSchema } from "@shared/schema";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SocketrelayProfile, SupportMatchProfile, LighthouseProfile } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Package, Check as CheckIcon } from "lucide-react";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { US_STATES } from "@/lib/usStates";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { VerifiedBadge } from "@/components/verified-badge";

const profileFormSchema = insertSocketrelayProfileSchema.omit({ userId: true });

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function SocketRelayProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery<SocketrelayProfile & { userIsVerified?: boolean } | null>({
    queryKey: ["/api/socketrelay/profile"],
  });
  
  const profile = profileData ? (() => {
    const { userIsVerified, ...rest } = profileData;
    return rest;
  })() : null;
  
  const userIsVerified = (profileData as any)?.userIsVerified || false;

  // Fetch other app profiles to pre-fill location data
  const { data: supportMatchProfile } = useQuery<SupportMatchProfile | null>({
    queryKey: ["/api/supportmatch/profile"],
  });

  const { data: lighthouseProfile } = useQuery<LighthouseProfile | null>({
    queryKey: ["/api/lighthouse/profile"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      city: "",
      state: "",
      country: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (profile) {
      // If SocketRelay profile exists, use its data
      form.reset({
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        isActive: profile.isActive,
      });
    } else {
      // Pre-fill from other apps if they have location data
      const city = supportMatchProfile?.city || "";
      const state = supportMatchProfile?.state || "";
      const country = supportMatchProfile?.country || "";
      
      if (city || state || country) {
        form.reset({
          displayName: (supportMatchProfile as any)?.nickname || "",
          city,
          state: state || "",
          country,
          isActive: true,
        });
      }
    }
  }, [profile, supportMatchProfile, form]);

  const createMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("POST", "/api/socketrelay/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/socketrelay/profile"] });
      toast({
        title: "Profile Created",
        description: "Your SocketRelay profile has been created successfully.",
      });
      setLocation("/apps/socketrelay");
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
      apiRequest("PUT", "/api/socketrelay/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/socketrelay/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your SocketRelay profile has been updated successfully.",
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
      const res = await apiRequest("DELETE", "/api/socketrelay/profile", { reason });
      return await res.json();
    },
    onSuccess: async () => {
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/socketrelay/profile"] });
      toast({
        title: "Profile Deleted",
        description: "Your SocketRelay profile has been deleted successfully.",
      });
      setLocation("/apps/socketrelay");
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
    if (profile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const state = form.watch("state");

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <MiniAppBackButton />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-semibold">
              {profile ? "Edit Profile" : "Create Profile"}
            </h1>
            {profile && <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-profile" />}
          </div>
          <p className="text-muted-foreground">
            {profile ? "Update your SocketRelay information" : "Set up your SocketRelay profile"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your location helps others know if they can fulfill your requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Daytona Beach"
                          data-testid="input-city"
                          required
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
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} required>
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
                      onClick={() => setLocation("/apps/socketrelay")}
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
          appName="SocketRelay"
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
