import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ExternalLink, Plus, X } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/usStates";
import { useExternalLink } from "@/hooks/useExternalLink";
import type { DirectorySkill } from "@shared/schema";
import { DirectoryAdminSkillsSelector } from "./DirectoryAdminSkillsSelector";
import { DirectoryAdminSectorsSelector } from "./DirectoryAdminSectorsSelector";
import { DirectoryAdminJobTitlesSelector } from "./DirectoryAdminJobTitlesSelector";

interface Sector {
  id: string;
  name: string;
}

interface JobTitle {
  id: string;
  name: string;
}

interface ProfileFormData {
  description: string;
  firstName: string;
  signalUrl: string;
  quoraUrl: string;
  city: string;
  state: string;
  country: string;
  skills: string[];
  sectors: string[];
  jobTitles: string[];
  isPublic: boolean;
}

interface DirectoryAdminProfileFormProps {
  formData: ProfileFormData;
  onFormDataChange: (data: Partial<ProfileFormData>) => void;
  skills: DirectorySkill[];
  sectors: Sector[];
  jobTitles: JobTitle[];
  isLoading?: {
    skills?: boolean;
    sectors?: boolean;
    jobTitles?: boolean;
  };
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  profileId?: string;
  onDeleteSkill?: (skill: DirectorySkill) => void;
  testIdPrefix?: string;
}

export function DirectoryAdminProfileForm({
  formData,
  onFormDataChange,
  skills,
  sectors,
  jobTitles,
  isLoading = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
  profileId,
  onDeleteSkill,
  testIdPrefix = mode === "create" ? "new" : `edit-${profileId}`,
}: DirectoryAdminProfileFormProps) {
  const { openExternal } = useExternalLink();

  const canSubmit = formData.skills.length > 0 && !!formData.country && !isSubmitting;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value.slice(0, 140) })}
          placeholder="140 chars max"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${testIdPrefix}-first-name`}>First Name</Label>
        <Input
          id={`${testIdPrefix}-first-name`}
          value={formData.firstName}
          onChange={(e) => onFormDataChange({ firstName: e.target.value })}
          placeholder="First name (for unclaimed profiles)"
          data-testid={`input-${testIdPrefix}-first-name`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${testIdPrefix}-signal-url`}>Signal URL</Label>
        <Input
          id={`${testIdPrefix}-signal-url`}
          type="url"
          value={formData.signalUrl}
          onChange={(e) => onFormDataChange({ signalUrl: e.target.value })}
          placeholder="https://signal.me/#p/…"
          data-testid={`input-${testIdPrefix}-signal-url`}
        />
        {formData.signalUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openExternal(formData.signalUrl)}
            className="justify-start px-0 text-primary"
            data-testid={`button-preview-signal-${testIdPrefix}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Open Signal link
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${testIdPrefix}-quora-url`}>Quora Profile URL</Label>
        <Input
          id={`${testIdPrefix}-quora-url`}
          type="url"
          value={formData.quoraUrl}
          onChange={(e) => onFormDataChange({ quoraUrl: e.target.value })}
          placeholder="https://www.quora.com/profile/…"
          data-testid={`input-${testIdPrefix}-quora-url`}
        />
        {formData.quoraUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openExternal(formData.quoraUrl)}
            className="justify-start px-0 text-primary"
            data-testid={`button-preview-quora-${testIdPrefix}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Open Quora link
          </Button>
        )}
      </div>

      <DirectoryAdminSkillsSelector
        skills={skills}
        selectedSkills={formData.skills}
        onSkillsChange={(skills) => onFormDataChange({ skills })}
        isLoading={isLoading.skills}
        labelId={`${testIdPrefix}-skills-label`}
        testIdPrefix={`combo-${testIdPrefix}-skills`}
        onDeleteSkill={onDeleteSkill}
        required
      />

      <DirectoryAdminSectorsSelector
        sectors={sectors}
        selectedSectors={formData.sectors}
        onSectorsChange={(sectors) => onFormDataChange({ sectors })}
        isLoading={isLoading.sectors}
        labelId={`${testIdPrefix}-sectors-label`}
        testIdPrefix={`combo-${testIdPrefix}-sectors`}
      />

      <DirectoryAdminJobTitlesSelector
        jobTitles={jobTitles}
        selectedJobTitles={formData.jobTitles}
        onJobTitlesChange={(jobTitles) => onFormDataChange({ jobTitles })}
        isLoading={isLoading.jobTitles}
        labelId={`${testIdPrefix}-job-titles-label`}
        testIdPrefix={`combo-${testIdPrefix}-job-titles`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${testIdPrefix}-city`}>City</Label>
          <Input
            id={`${testIdPrefix}-city`}
            value={formData.city}
            onChange={(e) => onFormDataChange({ city: e.target.value })}
            placeholder="City"
            data-testid={`input-${testIdPrefix}-city`}
          />
        </div>
        <div className="space-y-2">
          <Label id={`${testIdPrefix}-state-label`}>US State (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-haspopup="listbox"
                aria-labelledby={`${testIdPrefix}-state-label`}
                data-testid={`combo-state-${testIdPrefix}-trigger`}
                className="w-full justify-between"
              >
                {formData.state || "Select US State"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter>
                <CommandInput placeholder="Search US states…" />
                <CommandEmpty>No states found.</CommandEmpty>
                <CommandGroup>
                  {US_STATES.map((s) => (
                    <CommandItem
                      key={s}
                      value={s}
                      onSelect={() => onFormDataChange({ state: s })}
                      data-testid={`combo-state-${testIdPrefix}-item-${s}`}
                      aria-selected={formData.state === s}
                    >
                      <Check className={`mr-2 h-4 w-4 ${formData.state === s ? "opacity-100" : "opacity-0"}`} />
                      <span>{s}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label id={`${testIdPrefix}-country-label`}>
          Country <span className="text-red-600">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-haspopup="listbox"
              aria-labelledby={`${testIdPrefix}-country-label`}
              data-testid={`combo-country-${testIdPrefix}-trigger`}
              className="w-full justify-between"
            >
              {formData.country || "Select country"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter>
              <CommandInput placeholder="Search countries…" />
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => onFormDataChange({ country: c })}
                    data-testid={`combo-country-${testIdPrefix}-item-${c}`}
                    aria-selected={formData.country === c}
                  >
                    <Check className={`mr-2 h-4 w-4 ${formData.country === c ? "opacity-100" : "opacity-0"}`} />
                    <span>{c}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={formData.isPublic}
          onCheckedChange={(v) => onFormDataChange({ isPublic: !!v })}
        />
        <span>Make public</span>
      </label>

      {formData.isPublic && profileId && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Public Profile URL</Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/apps/directory/public/${profileId}`}
              className="font-mono text-xs"
              data-testid={`input-public-url-${profileId}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(`${window.location.origin}/apps/directory/public/${profileId}`)}
              data-testid={`button-view-public-${profileId}`}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          data-testid={`button-${mode === "create" ? "admin-create-unclaimed" : `save-edit-${profileId}`}`}
        >
          {mode === "create" ? (
            <>
              <Plus className="w-4 h-4 mr-2" /> {isSubmitting ? "Creating…" : "Create"}
            </>
          ) : (
            <>{isSubmitting ? "Saving…" : "Save Changes"}</>
          )}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting} data-testid={`button-cancel-edit-${profileId}`}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

