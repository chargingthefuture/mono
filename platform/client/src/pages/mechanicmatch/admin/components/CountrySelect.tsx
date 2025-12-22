/**
 * Country Select Component
 */

import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import type { AdminProfileFormValues } from "../utils/mechanicMatchAdminUtils";
import { useForm } from "react-hook-form";

interface CountrySelectProps {
  form: ReturnType<typeof useForm<AdminProfileFormValues>>;
  name: "state" | "country";
  testId: string;
}

export function CountrySelect({ form, name, testId }: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Country</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                  data-testid={testId}
                >
                  {field.value || "Select country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandList>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {COUNTRIES.map((country) => (
                      <CommandItem
                        key={country}
                        value={country}
                        onSelect={() => {
                          form.setValue(name, country);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", country === field.value ? "opacity-100" : "opacity-0")} />
                        {country}
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

