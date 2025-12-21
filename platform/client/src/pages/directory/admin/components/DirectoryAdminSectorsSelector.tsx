import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sector {
  id: string;
  name: string;
}

interface DirectoryAdminSectorsSelectorProps {
  sectors: Sector[];
  selectedSectors: string[];
  onSectorsChange: (sectors: string[]) => void;
  isLoading?: boolean;
  labelId: string;
  testIdPrefix: string;
}

export function DirectoryAdminSectorsSelector({
  sectors,
  selectedSectors,
  onSectorsChange,
  isLoading = false,
  labelId,
  testIdPrefix,
}: DirectoryAdminSectorsSelectorProps) {
  const { toast } = useToast();

  const toggleSector = (sectorName: string) => {
    if (selectedSectors.includes(sectorName)) {
      onSectorsChange(selectedSectors.filter((s) => s !== sectorName));
    } else {
      if (selectedSectors.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 sectors", variant: "destructive" });
        return;
      }
      onSectorsChange([...selectedSectors, sectorName]);
    }
  };

  return (
    <div className="space-y-2">
      <Label id={labelId}>Sectors (up to 3, optional)</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-haspopup="listbox"
            aria-labelledby={labelId}
            data-testid={`${testIdPrefix}-trigger`}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {selectedSectors.length > 0 ? `${selectedSectors.length} selected` : "Select sectors"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
          <Command shouldFilter>
            <CommandInput placeholder="Search sectors…" />
            <CommandList>
              <CommandEmpty>No sectors found.</CommandEmpty>
              <CommandGroup>
                {sectors.map((sector) => {
                  const selected = selectedSectors.includes(sector.name);
                  return (
                    <CommandItem
                      key={sector.id}
                      value={sector.name}
                      onSelect={() => toggleSector(sector.name)}
                      data-testid={`${testIdPrefix}-item-${sector.name}`}
                      aria-selected={selected}
                    >
                      <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                      <span>{sector.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSectors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSectors.map((s) => (
            <Badge key={s} variant="outline" className="gap-1">
              {s}
              <button
                onClick={() => onSectorsChange(selectedSectors.filter((x) => x !== s))}
                className="ml-1 hover:bg-muted rounded"
                data-testid={`button-remove-sector-${s}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

