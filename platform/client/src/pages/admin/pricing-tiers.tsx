import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PricingTier } from "@shared/schema";
import { format } from "date-fns";
import { DollarSign, Plus, Check, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const pricingTierFormSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  effectiveDate: z.string().optional(),
  isCurrentTier: z.boolean().default(false),
});

type PricingTierFormValues = z.infer<typeof pricingTierFormSchema>;

export default function PricingTiers() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: tiers, isLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/pricing-tiers"],
  });

  const form = useForm<PricingTierFormValues>({
    resolver: zodResolver(pricingTierFormSchema),
    defaultValues: {
      amount: "",
      effectiveDate: new Date().toISOString().split('T')[0],
      isCurrentTier: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PricingTierFormValues) => {
      const payload = {
        amount: data.amount,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
        isCurrentTier: data.isCurrentTier,
      };
      return apiRequest("POST", "/api/admin/pricing-tiers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
      form.reset();
      setShowForm(false);
      toast({
        title: "Success",
        description: "Pricing tier created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pricing tier",
        variant: "destructive",
      });
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PUT", `/api/admin/pricing-tiers/${id}/set-current`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
      toast({
        title: "Success",
        description: "Current pricing tier updated. New users will be assigned this price.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update current pricing tier",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PricingTierFormValues) => {
    createMutation.mutate(data);
  };

  const currentTier = tiers?.find(t => t.isCurrentTier);

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
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          Pricing Management
        </h1>
        <p className="text-muted-foreground">
          Manage subscription pricing with grandparented rates for existing users
        </p>
      </div>

      {/* Current Pricing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription Price</CardTitle>
          <CardDescription>
            New users joining the platform will be assigned this price. Existing users keep their original price (your forever pricing).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-semibold" data-testid="text-current-price">
                {formatCurrency(currentTier?.amount || '1.00')}<span className="text-lg text-muted-foreground">/month</span>
              </p>
              {currentTier && (
                <p className="text-sm text-muted-foreground">
                  Effective since {format(new Date(currentTier.effectiveDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Pricing Tier */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} data-testid="button-add-pricing-tier">
          <Plus className="w-4 h-4 mr-2" />
          Create New Pricing Tier
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Pricing Tier</CardTitle>
            <CardDescription>
              Set a new subscription price for future users. You can optionally make it the current tier immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.00"
                          data-testid="input-amount"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the monthly subscription price in dollars (e.g., 1.00 or 2.50)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-effective-date"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The date this pricing tier becomes active (defaults to today)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isCurrentTier"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-is-current-tier"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as current tier</FormLabel>
                        <FormDescription>
                          If checked, new users will immediately start being assigned this price
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-pricing-tier"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pricing Tier
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Pricing History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Pricing History</h2>
        {!tiers || tiers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pricing tiers yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tiers.map((tier) => (
              <Card key={tier.id} data-testid={`pricing-tier-${tier.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-semibold" data-testid={`text-price-${tier.id}`}>
                            {formatCurrency(tier.amount)}
                            <span className="text-sm text-muted-foreground">/month</span>
                          </p>
                          {tier.isCurrentTier && (
                            <Badge variant="default" data-testid={`badge-current-${tier.id}`}>
                              <Check className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          Effective {format(new Date(tier.effectiveDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    {!tier.isCurrentTier && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMutation.mutate(tier.id)}
                        disabled={setCurrentMutation.isPending}
                        data-testid={`button-set-current-${tier.id}`}
                      >
                        Set as Current
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
