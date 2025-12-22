/**
 * Role Checkbox Component
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface RoleCheckboxProps {
  control: any;
  name: "isCarOwner" | "isMechanic";
  label: string;
  description: string;
  dataTestId: string;
}

export function RoleCheckbox({ control, name, label, description, dataTestId }: RoleCheckboxProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid={dataTestId} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </FormItem>
      )}
    />
  );
}

