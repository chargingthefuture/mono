/**
 * MechanicMatch Admin Profile Form Component
 * 
 * Reusable form component for creating and editing profiles
 */

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { RoleCheckbox } from "./RoleCheckbox";
import { StateSelect } from "./StateSelect";
import { CountrySelect } from "./CountrySelect";
import type { AdminProfileFormValues } from "../utils/mechanicMatchAdminUtils";
import { useForm } from "react-hook-form";

interface MechanicMatchAdminProfileFormProps {
  form: ReturnType<typeof useForm<AdminProfileFormValues>>;
  onSubmit: (values: AdminProfileFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
  formPrefix: "create" | "edit";
  showResetButton?: boolean;
}

export function MechanicMatchAdminProfileForm({
  form,
  onSubmit,
  isSubmitting,
  submitLabel,
  formPrefix,
  showResetButton = false,
}: MechanicMatchAdminProfileFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <RoleCheckbox 
            control={form.control} 
            name="isCarOwner" 
            label="Car Owner" 
            description={formPrefix === "create" ? "Provide owner context" : "Has owner profile"} 
            dataTestId={`checkbox-car-owner-${formPrefix}`} 
          />
          <RoleCheckbox 
            control={form.control} 
            name="isMechanic" 
            label="Mechanic" 
            description={formPrefix === "create" ? "Available for bookings" : "Offers services"} 
            dataTestId={`checkbox-mechanic-${formPrefix}`} 
          />
        </div>

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="First name (for unclaimed profiles)" data-testid={`input-first-name-${formPrefix}`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="City" data-testid={`input-city-${formPrefix}`} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <StateSelect form={form} name="state" testId={`select-state-${formPrefix}`} />
          <CountrySelect form={form} name="country" testId={`select-country-${formPrefix}`} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder={formPrefix === "create" ? "+1 555 123 4567" : ""} data-testid={`input-phone-${formPrefix}`} />
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
                <FormLabel>Signal Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder={formPrefix === "create" ? "https://signal.me/#p/+1..." : ""} data-testid={`input-signal-${formPrefix}`} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid={`checkbox-public-${formPrefix}`}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Make profile public</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Allow this profile to be visible in the public directory
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" className="flex-1" disabled={isSubmitting} data-testid={`button-admin-${formPrefix}-profile`}>
            <Wrench className="w-4 h-4 mr-2" />
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
          {showResetButton && (
            <Button type="button" variant="outline" onClick={() => form.reset()} data-testid="button-admin-clear-form">
              Reset
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

