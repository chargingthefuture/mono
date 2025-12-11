import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "wouter";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import type { WorkforceRecruiterConfig } from "@shared/schema";

const configFormSchema = z.object({
  population: z.number().int().min(1, "Population must be at least 1"),
  workforceParticipationRate: z.number().min(0).max(1, "Participation rate must be between 0 and 1"),
  minRecruitable: z.number().int().min(0, "Min recruitable must be at least 0"),
  maxRecruitable: z.number().int().min(0, "Max recruitable must be at least 0"),
}).refine((data) => data.maxRecruitable >= data.minRecruitable, {
  message: "Max recruitable must be greater than or equal to min recruitable",
  path: ["maxRecruitable"],
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

export default function WorkforceRecruiterConfigPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: config, isLoading } = useQuery<WorkforceRecruiterConfig | null>({
    queryKey: ["/api/workforce-recruiter/config"],
  });

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      population: config?.population || 5000000,
      workforceParticipationRate: config ? Number(config.workforceParticipationRate) : 0.5,
      minRecruitable: (config as any)?.minRecruitable || 2000000,
      maxRecruitable: (config as any)?.maxRecruitable || 5000000,
    },
  });

  // Update form when config loads
  useEffect(() => {
    if (config && !form.formState.isDirty) {
      form.reset({
        population: config.population,
        workforceParticipationRate: Number(config.workforceParticipationRate),
        minRecruitable: (config as any).minRecruitable || 2000000,
        maxRecruitable: (config as any).maxRecruitable || 5000000,
      });
    }
  }, [config, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ConfigFormValues) => {
      return apiRequest("PUT", "/api/workforce-recruiter/config", {
        population: data.population,
        workforceParticipationRate: data.workforceParticipationRate,
        minRecruitable: data.minRecruitable,
        maxRecruitable: data.maxRecruitable,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workforce-recruiter/reports/summary"] });
      toast({
        title: "Configuration Updated",
        description: "Workforce configuration has been updated successfully.",
      });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ConfigFormValues) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const workforceTotal = form.watch("population") * form.watch("workforceParticipationRate");

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <MiniAppBackButton href="/apps/workforce-recruiter/admin" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Configuration</h1>
          <p className="text-muted-foreground">
            Configure population, workforce participation rate, and recruitable limits
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workforce Configuration</CardTitle>
          <CardDescription>
            Set the base parameters for workforce tracking and recruitment targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="population"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Population</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        data-testid="input-population"
                      />
                    </FormControl>
                    <FormDescription>
                      Total population size for workforce calculations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workforceParticipationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workforce Participation Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-participation-rate"
                      />
                    </FormControl>
                    <FormDescription>
                      Percentage of population in workforce (0.0 to 1.0). Current workforce total: {Math.round(workforceTotal).toLocaleString()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minRecruitable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Recruitable</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        data-testid="input-min-recruitable"
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum number of people that can be recruited
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxRecruitable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Recruitable</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        data-testid="input-max-recruitable"
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of people that can be recruited
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  data-testid="button-save-config"
                >
                  {isSubmitting || updateMutation.isPending ? "Saving..." : "Save Configuration"}
                </Button>
                <Link href="/apps/workforce-recruiter/admin">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

