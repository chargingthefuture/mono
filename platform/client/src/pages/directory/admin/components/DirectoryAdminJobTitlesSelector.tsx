import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobTitle {
  id: string;
  name: string;
}

interface DirectoryAdminJobTitlesSelectorProps {
  jobTitles: JobTitle[];
  selectedJobTitles: string[];
  onJobTitlesChange: (jobTitles: string[]) => void;
  isLoading?: boolean;
  labelId: string;
  testIdPrefix: string;
}

export function DirectoryAdminJobTitlesSelector({
  jobTitles,
  selectedJobTitles,
  onJobTitlesChange,
  isLoading = false,
  labelId,
  testIdPrefix,
}: DirectoryAdminJobTitlesSelectorProps) {
  const { toast } = useToast();

  const toggleJobTitle = (jobTitleName: string) => {
    if (selectedJobTitles.includes(jobTitleName)) {
      onJobTitlesChange(selectedJobTitles.filter((jt) => jt !== jobTitleName));
    } else {
      if (selectedJobTitles.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 job titles", variant: "destructive" });
        return;
      }
      onJobTitlesChange([...selectedJobTitles, jobTitleName]);
    }
  };

  return (
    <div className="space-y-2">
      <Label id={labelId}>Job Titles (up to 3, optional)</Label>
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
            {selectedJobTitles.length > 0 ? `${selectedJobTitles.length} selected` : "Select job titles"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
          <Command shouldFilter>
            <CommandInput placeholder="Search job titles…" />
            <CommandList>
              <CommandEmpty>No job titles found.</CommandEmpty>
              <CommandGroup>
                {jobTitles.map((jobTitle) => {
                  const selected = selectedJobTitles.includes(jobTitle.name);
                  return (
                    <CommandItem
                      key={jobTitle.id}
                      value={jobTitle.name}
                      onSelect={() => toggleJobTitle(jobTitle.name)}
                      data-testid={`${testIdPrefix}-item-${jobTitle.name}`}
                      aria-selected={selected}
                    >
                      <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                      <span>{jobTitle.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedJobTitles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedJobTitles.map((jt) => (
            <Badge key={jt} variant="outline" className="gap-1">
              {jt}
              <button
                onClick={() => onJobTitlesChange(selectedJobTitles.filter((x) => x !== jt))}
                className="ml-1 hover:bg-muted rounded"
                data-testid={`button-remove-job-title-${jt}`}
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

