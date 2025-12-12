import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertMechanicmatchServiceRequestSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const requestFormSchema = insertMechanicmatchServiceRequestSchema.omit({
  ownerId: true,
  status: true,
});

type RequestFormData = z.infer<typeof requestFormSchema> & {
  requestType?: "advice_only" | "remote_diagnosis" | "in_person";
};

export default function CreateServiceRequest() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/mechanicmatch/vehicles"],
  });

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      vehicleId: null,
      symptoms: "",
      photos: null,
      videoUrl: "",
      estimatedLocation: "",
      requestType: "advice_only",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      return apiRequest("POST", "/api/mechanicmatch/service-requests", {
        ...data,
        videoUrl: data.videoUrl === "" ? null : data.videoUrl,
        photos: data.photos || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/service-requests"] });
      toast({
        title: "Success",
        description: "Service request created successfully",
      });
      setLocation("/apps/mechanicmatch");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/mechanicmatch">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Create Service Request</h1>
          <p className="text-muted-foreground">
            Describe your vehicle issue and get help from mechanics
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle">
                          <SelectValue placeholder="Select a vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Not in my list</SelectItem>
                        {vehicles.map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a vehicle from your list, or leave as "Not in my list"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms / Issue Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the problem with your vehicle..."
                        rows={6}
                        data-testid="textarea-symptoms"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advice_only">Advice Only (Chat/Video)</SelectItem>
                        <SelectItem value="remote_diagnosis">Remote Diagnosis (Pay-per-minute)</SelectItem>
                        <SelectItem value="in_person">In-Person Booking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how you want to work with the mechanic
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="City, State or approximate location"
                        data-testid="input-location"
                      />
                    </FormControl>
                    <FormDescription>
                      Helpful for finding nearby mechanics (for in-person services)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="URL to short video showing the issue"
                        data-testid="input-video-url"
                      />
                    </FormControl>
                    <FormDescription>
                      Link to a video demonstrating the problem (if available)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/apps/mechanicmatch")}
                  data-testid="button-cancel"
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
