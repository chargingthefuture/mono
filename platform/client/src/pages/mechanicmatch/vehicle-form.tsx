import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { insertMechanicmatchVehicleSchema, type MechanicmatchVehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const vehicleFormSchema = insertMechanicmatchVehicleSchema.pick({
  make: true,
  model: true,
  year: true,
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface MechanicMatchVehicleFormProps {
  mode: "create" | "edit";
  vehicleId?: string;
}

export default function MechanicMatchVehicleForm({ mode, vehicleId }: MechanicMatchVehicleFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: vehicle, isLoading: isVehicleLoading } = useQuery<MechanicmatchVehicle | null>({
    queryKey: [`/api/mechanicmatch/vehicles/${vehicleId}`],
    enabled: mode === "edit" && !!vehicleId,
  });

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (mode === "edit" && vehicle) {
      form.reset({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
      });
    }
  }, [form, mode, vehicle]);

  const invalidateVehicleQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("/api/mechanicmatch/vehicles"),
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      await apiRequest("POST", "/api/mechanicmatch/vehicles", data);
    },
    onSuccess: () => {
      invalidateVehicleQueries();
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been added successfully.",
      });
      setLocation("/apps/mechanicmatch/vehicles");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      if (!vehicleId) throw new Error("Vehicle id is required");
      await apiRequest("PUT", `/api/mechanicmatch/vehicles/${vehicleId}`, data);
    },
    onSuccess: () => {
      invalidateVehicleQueries();
      toast({
        title: "Vehicle Updated",
        description: "Vehicle details have been updated.",
      });
      setLocation("/apps/mechanicmatch/vehicles");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    if (mode === "edit") {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (mode === "edit" && !vehicleId) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-destructive">Vehicle not found.</p>
      </div>
    );
  }

  if (mode === "edit" && isVehicleLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const heading = mode === "edit" ? "Edit Vehicle" : "Add Vehicle";
  const description =
    mode === "edit"
      ? "Update details for this vehicle"
      : "Add a vehicle to request help faster";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/apps/mechanicmatch/vehicles">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">{heading}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
          <CardDescription>These details help mechanics understand your vehicle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Toyota" data-testid="input-make" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Camry" data-testid="input-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={typeof field.value === "number" ? field.value : new Date().getFullYear()}
                        onChange={(event) => {
                          const value = event.target.value;
                          // Convert to number, default to current year if empty or invalid
                          if (value === "" || isNaN(Number(value))) {
                            field.onChange(new Date().getFullYear());
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        data-testid="input-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : mode === "edit" ? "Update Vehicle" : "Save Vehicle"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/apps/mechanicmatch/vehicles")}
                  data-testid="button-cancel"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

