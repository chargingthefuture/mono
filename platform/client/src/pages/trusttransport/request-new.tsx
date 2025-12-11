import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertTrusttransportRideRequestSchema, type TrusttransportProfile } from "@shared/schema";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { US_STATES } from "@/lib/usStates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useState } from "react";

const requestFormSchema = insertTrusttransportRideRequestSchema.extend({
  departureDateTime: z.string().min(1, "Departure date and time is required"),
  requestedCarType: z.union([
    z.enum(["sedan", "suv", "van", "truck"]),
    z.literal("none"),
    z.null(),
    z.undefined(),
  ]).optional().nullable(),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

export default function RequestRidePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [pickupStateOpen, setPickupStateOpen] = useState(false);
  const [dropoffStateOpen, setDropoffStateOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery<TrusttransportProfile | null>({
    queryKey: ["/api/trusttransport/profile"],
  });

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    mode: "onChange",
    defaultValues: {
      pickupLocation: "",
      dropoffLocation: "",
      pickupCity: "",
      pickupState: null,
      dropoffCity: "",
      dropoffState: null,
      departureDateTime: "",
      requestedSeats: 1,
      requestedCarType: null,
      requiresHeat: false,
      requiresAC: false,
      requiresWheelchairAccess: false,
      requiresChildSeat: false,
      riderMessage: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      // Convert date string to ISO string for proper serialization
      const payload = {
        ...data,
        departureDateTime: new Date(data.departureDateTime).toISOString(),
      };
      return apiRequest("POST", "/api/trusttransport/ride-requests", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusttransport/ride-requests/my-requests"] });
      toast({
        title: "Success",
        description: "Ride request created successfully",
      });
      setLocation("/apps/trusttransport");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ride request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormData) => {
    // Ensure car type is null if "none" was selected or is undefined
    const submitData = {
      ...data,
      requestedCarType: (data.requestedCarType === "none" || !data.requestedCarType) ? null : data.requestedCarType,
      pickupState: data.pickupState || null,
      dropoffState: data.dropoffState || null,
      riderMessage: data.riderMessage || null,
    };
    
    // Remove undefined values to avoid validation issues
    Object.keys(submitData).forEach(key => {
      if (submitData[key as keyof typeof submitData] === undefined) {
        delete submitData[key as keyof typeof submitData];
      }
    });
    
    createMutation.mutate(submitData);
  };

  if (profileLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.isRider) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">You need to be a rider to create ride requests.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/apps/trusttransport/profile")}
            data-testid="button-go-to-profile"
          >
            Update Profile
          </Button>
        </div>
      </div>
    );
  }

  // Get country options (you may need to import this from a shared location)
  const countries = ["United States", "Canada", "Mexico"]; // Add more as needed

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/apps/trusttransport")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Create Ride Request</h1>
          <p className="text-muted-foreground">
            Specify your transportation needs and criteria
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ride Details</CardTitle>
          <CardDescription>
            Provide information about your transportation request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Pickup Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pickup Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" data-testid="input-pickup-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickupState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>US State (Optional)</FormLabel>
                        <Popover open={pickupStateOpen} onOpenChange={setPickupStateOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                data-testid="select-pickup-state"
                              >
                                {field.value || "Select US State"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search US states…" />
                              <CommandEmpty>No states found.</CommandEmpty>
                              <CommandGroup>
                                {US_STATES.map((state) => (
                                  <CommandItem
                                    key={state}
                                    value={state}
                                    onSelect={() => {
                                      form.setValue("pickupState", state);
                                      setPickupStateOpen(false);
                                    }}
                                    data-testid={`combo-pickup-state-item-${state}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === state ? "opacity-100" : "opacity-0"
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
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Full address or specific location"
                          rows={2}
                          data-testid="textarea-pickup-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dropoff Location */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Dropoff Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dropoffCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" data-testid="input-dropoff-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dropoffState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>US State (Optional)</FormLabel>
                        <Popover open={dropoffStateOpen} onOpenChange={setDropoffStateOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                data-testid="select-dropoff-state"
                              >
                                {field.value || "Select US State"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search US states…" />
                              <CommandEmpty>No states found.</CommandEmpty>
                              <CommandGroup>
                                {US_STATES.map((state) => (
                                  <CommandItem
                                    key={state}
                                    value={state}
                                    onSelect={() => {
                                      form.setValue("dropoffState", state);
                                      setDropoffStateOpen(false);
                                    }}
                                    data-testid={`combo-dropoff-state-item-${state}`}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === state ? "opacity-100" : "opacity-0"
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
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Full address or specific location"
                          rows={2}
                          data-testid="textarea-dropoff-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date & Time */}
              <div className="border-t pt-4">
                <FormField
                  control={form.control}
                  name="departureDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date & Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          data-testid="input-departure-datetime"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Request Criteria */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Request Criteria</h3>
                <FormField
                  control={form.control}
                  name="requestedSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Seats *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          data-testid="input-requested-seats"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requestedCarType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Car Type (Optional)</FormLabel>
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-car-type">
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Any type</SelectItem>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-3">
                  <FormLabel>Additional Requirements</FormLabel>
                  <FormField
                    control={form.control}
                    name="requiresHeat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-heat"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            Requires Heat
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresAC"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-ac"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            Requires Air Conditioning
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresWheelchairAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-wheelchair"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            Requires Wheelchair Access
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresChildSeat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-child-seat"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            Requires Child Seat
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Message */}
              <div className="border-t pt-4">
                <FormField
                  control={form.control}
                  name="riderMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Any additional information or special requests..."
                          rows={4}
                          data-testid="textarea-rider-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/apps/trusttransport")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</p>
                  <ul className="text-sm text-destructive list-disc list-inside space-y-1">
                    {Object.entries(form.formState.errors).map(([field, error]: [string, any]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {error?.message || "Invalid value"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

