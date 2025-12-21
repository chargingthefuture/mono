import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, X, Trash2 } from "lucide-react";
import type { DirectorySkill } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface DirectoryAdminSkillsSelectorProps {
  skills: DirectorySkill[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  isLoading?: boolean;
  labelId: string;
  testIdPrefix: string;
  onDeleteSkill?: (skill: DirectorySkill) => void;
  required?: boolean;
}

export function DirectoryAdminSkillsSelector({
  skills,
  selectedSkills,
  onSkillsChange,
  isLoading = false,
  labelId,
  testIdPrefix,
  onDeleteSkill,
  required = false,
}: DirectoryAdminSkillsSelectorProps) {
  const { toast } = useToast();

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skillName));
    } else {
      if (selectedSkills.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 skills", variant: "destructive" });
        return;
      }
      onSkillsChange([...selectedSkills, skillName]);
    }
  };

  return (
    <div className="space-y-2">
      <Label id={labelId}>
        Skills (up to 3) {required && <span className="text-red-600">*</span>}
      </Label>
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
            {selectedSkills.length > 0 ? `${selectedSkills.length} selected` : "Select skills"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
          <Command shouldFilter>
            <CommandInput placeholder="Search skills…" />
            <CommandList>
              <CommandEmpty>No skills found.</CommandEmpty>
              <CommandGroup>
                {skills.map((skill) => {
                  const selected = selectedSkills.includes(skill.name);
                  return (
                    <CommandItem
                      key={skill.name}
                      value={skill.name}
                      onSelect={() => toggleSkill(skill.name)}
                      data-testid={`${testIdPrefix}-item-${skill.name}`}
                      aria-selected={selected}
                    >
                      <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                      <span className="flex-1">{skill.name}</span>
                      {onDeleteSkill && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSkill(skill);
                          }}
                          data-testid={`button-delete-skill-${skill.name}`}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((s) => (
            <Badge key={s} variant="outline" className="gap-1">
              {s}
              <button
                onClick={() => onSkillsChange(selectedSkills.filter((x) => x !== s))}
                className="ml-1 hover:bg-muted rounded"
                data-testid={`button-remove-skill-${s}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {selectedSkills.length === 0 && required && (
        <p className="text-xs text-red-600" data-testid="help-admin-skills-required">
          Select at least one skill.
        </p>
      )}
    </div>
  );
}

