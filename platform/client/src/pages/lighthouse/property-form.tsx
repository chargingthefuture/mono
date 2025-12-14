import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertLighthousePropertySchema, type LighthouseProperty, type LighthouseProfile } from "@shared/schema";
import { useEffect, useState } from "react";
import { Home, Plus, X, Check as CheckIcon } from "lucide-react";
import { z } from "zod";
import { US_STATES } from "@/lib/usStates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

export default function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = id && id !== "new";
  const [photos, setPhotos] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [stateOpen, setStateOpen] = useState(false);

  const { data: profile } = useQuery<LighthouseProfile | null>({
    queryKey: ["/api/lighthouse/profile"],
  });

  const { data: property, isLoading: propertyLoading } = useQuery<LighthouseProperty>({
    queryKey: ["/api/lighthouse/properties", id],
    enabled: !!isEditing,
  });

  const form = useForm({
    resolver: zodResolver(
      insertLighthousePropertySchema
        .omit({ hostId: true })
        .extend({
          monthlyRent: z.string().optional().nullable(),
          bedrooms: z.string().optional().nullable(),
          bathrooms: z.string().optional().nullable(),
        })
    ),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "room",
      address: "",
      city: "",
      state: null,
      zipCode: "",
      bedrooms: null,
      bathrooms: null,
      monthlyRent: null,
      availableFrom: null,
      houseRules: "",
      airbnbProfileUrl: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        address: property.address,
        city: property.city,
        state: property.state ?? undefined,
        zipCode: property.zipCode ?? undefined,
        bedrooms: property.bedrooms != null ? property.bedrooms.toString() : undefined,
        bathrooms: property.bathrooms != null ? property.bathrooms.toString() : undefined,
        monthlyRent: property.monthlyRent != null ? property.monthlyRent.toString() : undefined,
        availableFrom: property.availableFrom ? new Date(property.availableFrom) : undefined,
        houseRules: property.houseRules || "",
        airbnbProfileUrl: property.airbnbProfileUrl ?? undefined,
        isActive: property.isActive,
      });
      if (property.photos) setPhotos(property.photos);
      if (property.amenities) setAmenities(property.amenities);
    }
  }, [property, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/lighthouse/properties", {
      ...data,
      photos,
      amenities,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/properties"] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      setLocation("/apps/lighthouse/my-properties");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PUT", `/api/lighthouse/properties/${id}`, {
      ...data,
      photos,
      amenities,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lighthouse/properties"] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      setLocation("/apps/lighthouse/my-properties");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addPhoto = () => {
    const url = prompt("Enter photo URL:");
    if (url) setPhotos([...photos, url]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const addAmenityInput = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  if (propertyLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.profileType !== "host") {
    return (
      <div className="p-6 md:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              You need a host profile to create property listings
            </p>
            <Button onClick={() => setLocation("/apps/lighthouse/profile")} data-testid="button-create-profile">
              Create Host Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const state = form.watch("state");

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">
              {isEditing ? "Edit Property" : "Create Property Listing"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update your property information" : "List a new housing option"}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>
            Provide details about the housing you're offering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Cozy Private Room in Quiet Neighborhood" data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the property, surroundings, and what makes it special" 
                        rows={4}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-propertyType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="room">Private Room</SelectItem>
                        <SelectItem value="apartment">Full Apartment</SelectItem>
                        <SelectItem value="community">Community Housing</SelectItem>
                        <SelectItem value="rv_camper">RV/Camper</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="e.g., 1" 
                          data-testid="input-bedrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="e.g., 1" 
                          data-testid="input-bathrooms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St" data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
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
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12345" data-testid="input-zipCode" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""}
                        placeholder="0" 
                        data-testid="input-monthlyRent"
                      />
                    </FormControl>
                    <FormDescription>Leave blank if rent varies or is negotiable</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available From (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} 
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        data-testid="input-availableFrom"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="airbnbProfileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airbnb Profile URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="https://www.airbnb.com/users/show/..."
                        type="url"
                        data-testid="input-airbnb-profile-url"
                      />
                    </FormControl>
                    <FormDescription>Link to your Airbnb host profile for verification</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Photos (Optional)</label>
                <div className="space-y-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input value={photo} readOnly />
                      <Button type="button" variant="outline" size="icon" onClick={() => removePhoto(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addPhoto} data-testid="button-add-photo">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photo URL
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amenities (Optional)</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{amenity}</span>
                        <button type="button" onClick={() => removeAmenity(idx)} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newAmenity} 
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenityInput())}
                      placeholder="e.g., WiFi, parking, laundry"
                      data-testid="input-new-amenity"
                    />
                    <Button type="button" variant="outline" onClick={addAmenityInput} data-testid="button-add-amenity">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="houseRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Housing Rules (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        placeholder="Any rules or guidelines for residents" 
                        rows={3}
                        data-testid="input-housingRules"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/apps/lighthouse/my-properties")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="button-save">
                  {isSubmitting ? "Saving..." : isEditing ? "Update Property" : "Create Property"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
