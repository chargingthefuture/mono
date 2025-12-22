/**
 * State Select Component
 */

import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { US_STATES } from "@/lib/usStates";
import { cn } from "@/lib/utils";
import type { AdminProfileFormValues } from "../utils/mechanicMatchAdminUtils";
import { useForm } from "react-hook-form";

interface StateSelectProps {
  form: ReturnType<typeof useForm<AdminProfileFormValues>>;
  name: "state" | "country";
  testId: string;
}

export function StateSelect({ form, name, testId }: StateSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>State</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                  data-testid={testId}
                >
                  {field.value || "Select state"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search state..." />
                <CommandEmpty>No state found.</CommandEmpty>
                <CommandList>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {US_STATES.map((state) => (
                      <CommandItem
                        key={state}
                        value={state}
                        onSelect={() => {
                          form.setValue(name, state);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", state === field.value ? "opacity-100" : "opacity-0")} />
                        {state}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

