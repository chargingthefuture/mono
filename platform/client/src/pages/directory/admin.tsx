import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DirectoryProfile, User } from "@shared/schema";
import { Plus, X, ExternalLink, Edit, Trash2, Search } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/usStates";
import type { DirectorySkill } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import { useExternalLink } from "@/hooks/useExternalLink";
import { Link } from "wouter";
import { PaginationControls } from "@/components/pagination-controls";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Extended type for directory profiles with user data from API
type DirectoryProfileWithUser = DirectoryProfile & {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  userIsVerified?: boolean;
};

export default function AdminDirectoryPage() {
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 50; // Admin lists use 50 items per page
  
  const { data: profiles = [], isLoading } = useQuery<DirectoryProfileWithUser[]>({
    queryKey: ["/api/directory/admin/profiles"],
  });
  
  // Client-side fuzzy search on all profiles
  const filteredProfiles = useFuzzySearch(profiles, searchTerm, {
    searchFields: ["description", "firstName", "city", "state", "country"],
    threshold: 0.3,
  });
  
  // Client-side pagination on filtered results
  const total = filteredProfiles.length;
  const paginatedProfiles = useMemo(() => {
    const start = page * limit;
    const end = start + limit;
    return filteredProfiles.slice(start, end);
  }, [filteredProfiles, page, limit]);
  
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: skills = [], isLoading: skillsLoading } = useQuery<DirectorySkill[]>({
    queryKey: ["/api/directory/admin/skills"],
  });
  
  type SkillsSector = {
    id: string;
    name: string;
  };
  
  type SkillsJobTitle = {
    id: string;
    name: string;
  };
  
  const { data: availableSectors = [], isLoading: sectorsLoading } = useQuery<SkillsSector[]>({
    queryKey: ["/api/directory/sectors"],
  });
  const { data: availableJobTitles = [], isLoading: jobTitlesLoading } = useQuery<SkillsJobTitle[]>({
    queryKey: ["/api/directory/job-titles"],
  });

  const [newDescription, setNewDescription] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newSignalUrl, setNewSignalUrl] = useState("");
  const [newQuoraUrl, setNewQuoraUrl] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [newSectors, setNewSectors] = useState<string[]>([]);
  const [newJobTitles, setNewJobTitles] = useState<string[]>([]);
  const [newPublic, setNewPublic] = useState(false);
  const [newCountry, setNewCountry] = useState<string>("");

  const toggleSkill = (s: string) => {
    setNewSkills(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 skills", variant: "destructive" });
        return prev;
      }
      return [...prev, s];
    });
  };

  const toggleSector = (s: string) => {
    setNewSectors(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 sectors", variant: "destructive" });
        return prev;
      }
      return [...prev, s];
    });
  };

  const toggleJobTitle = (jt: string) => {
    setNewJobTitles(prev => {
      if (prev.includes(jt)) return prev.filter(x => x !== jt);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 job titles", variant: "destructive" });
        return prev;
      }
      return [...prev, jt];
    });
  };

  const createUnclaimed = useMutation({
    mutationFn: async () => {
      const payload = {
        description: newDescription.trim(),
        signalUrl: newSignalUrl.trim() || null,
        quoraUrl: newQuoraUrl.trim() || null,
        city: newCity.trim() || null,
        state: newState.trim() || null,
        skills: newSkills.slice(0, 3),
        sectors: newSectors.length > 0 ? newSectors.slice(0, 3) : undefined,
        jobTitles: newJobTitles.length > 0 ? newJobTitles.slice(0, 3) : undefined,
        country: newCountry,
        isPublic: newPublic,
      };
      const res = await apiRequest("POST", "/api/directory/admin/profiles", payload);
      return await res.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      const profileId = data?.id;
      const wasPublic = newPublic;
      setNewDescription(""); setNewSignalUrl(""); setNewQuoraUrl(""); setNewCity(""); setNewState(""); setNewSkills([]); setNewSectors([]); setNewJobTitles([]); setNewPublic(false); setNewCountry("");
      if (profileId && wasPublic) {
        toast({ 
          title: "Created", 
          description: `Profile created. Public URL: ${window.location.origin}/apps/directory/public/${profileId}`,
          duration: 8000,
        });
      } else {
        toast({ title: "Created", description: "Unclaimed Directory profile created" });
      }
    },
    onError: (e: any) => toast({ title: "Error", description: e.message || "Failed to create profile", variant: "destructive" })
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => apiRequest("PUT", `/api/directory/admin/profiles/${id}/assign`, { userId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      toast({ title: "Assigned", description: "Profile assigned to user" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message || "Failed to assign", variant: "destructive" })
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<DirectoryProfileWithUser | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/directory/admin/profiles/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
      toast({ title: "Deleted", description: "Unclaimed profile deleted successfully" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to delete profile", variant: "destructive" });
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  });

  const handleDeleteClick = (profile: DirectoryProfile) => {
    if (!profile.isClaimed) {
      setProfileToDelete(profile);
      setDeleteDialogOpen(true);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editSignalUrl, setEditSignalUrl] = useState("");
  const [editQuoraUrl, setEditQuoraUrl] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editSectors, setEditSectors] = useState<string[]>([]);
  const [editJobTitles, setEditJobTitles] = useState<string[]>([]);
  const [editPublic, setEditPublic] = useState(false);
  const [editCountry, setEditCountry] = useState<string>("");

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/directory/admin/profiles/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/directory/admin/profiles"),
      });
      setEditingId(null);
      toast({ title: "Updated", description: "Profile updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message || "Failed to update profile", variant: "destructive" })
  });

  const startEdit = (profile: DirectoryProfileWithUser) => {
    setEditingId(profile.id);
    setEditDescription(profile.description || "");
    setEditSignalUrl(profile.signalUrl || "");
    setEditQuoraUrl(profile.quoraUrl || "");
    setEditCity(profile.city || "");
    setEditState(profile.state || "");
    setEditSkills(profile.skills || []);
    setEditSectors(profile.sectors || []);
    setEditJobTitles(profile.jobTitles || []);
    setEditPublic(profile.isPublic || false);
    setEditCountry(profile.country || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = (id: string) => {
    const payload = {
      description: editDescription.trim() || null,
      signalUrl: editSignalUrl.trim() || null,
      quoraUrl: editQuoraUrl.trim() || null,
      city: editCity.trim() || null,
      state: editState.trim() || null,
      skills: editSkills.slice(0, 3),
      sectors: editSectors.length > 0 ? editSectors.slice(0, 3) : undefined,
      jobTitles: editJobTitles.length > 0 ? editJobTitles.slice(0, 3) : undefined,
      country: editCountry || null,
      isPublic: editPublic,
    };
    updateMutation.mutate({ id, data: payload });
  };

  const toggleEditSkill = (s: string) => {
    setEditSkills(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 skills", variant: "destructive" });
        return prev;
      }
      return [...prev, s];
    });
  };

  const toggleEditSector = (s: string) => {
    setEditSectors(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 sectors", variant: "destructive" });
        return prev;
      }
      return [...prev, s];
    });
  };

  const toggleEditJobTitle = (jt: string) => {
    setEditJobTitles(prev => {
      if (prev.includes(jt)) return prev.filter(x => x !== jt);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 job titles", variant: "destructive" });
        return prev;
      }
      return [...prev, jt];
    });
  };

  // Skill management mutations
  const [deleteSkillDialogOpen, setDeleteSkillDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<DirectorySkill | null>(null);

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      // Send skill name in request body to avoid URL encoding issues
      return apiRequest("DELETE", "/api/directory/admin/skills", { name: skillName });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/directory/admin/skills"] });
      setDeleteSkillDialogOpen(false);
      setSkillToDelete(null);
      toast({ title: "Deleted", description: "Skill deleted successfully" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to delete skill", variant: "destructive" });
      setDeleteSkillDialogOpen(false);
      setSkillToDelete(null);
    }
  });

  // Seed functionality removed - use scripts/seedDirectory.ts

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Directory Admin</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage Directory profiles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Create Unclaimed Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value.slice(0,140))} placeholder="140 chars max" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-signal-url">Signal URL</Label>
            <Input 
              id="new-signal-url"
              type="url"
              value={newSignalUrl} 
              onChange={(e) => setNewSignalUrl(e.target.value)} 
              placeholder="https://signal.me/#p/…" 
              data-testid="input-new-signal-url"
            />
            {newSignalUrl && (
              <Button variant="ghost" size="sm" onClick={() => openExternal(newSignalUrl)} className="justify-start px-0 text-primary" data-testid="button-preview-signal-admin">
                <ExternalLink className="w-4 h-4 mr-2" /> Open Signal link
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-quora-url">Quora Profile URL</Label>
            <Input 
              id="new-quora-url"
              type="url"
              value={newQuoraUrl} 
              onChange={(e) => setNewQuoraUrl(e.target.value)} 
              placeholder="https://www.quora.com/profile/…" 
              data-testid="input-new-quora-url"
            />
            {newQuoraUrl && (
              <Button variant="ghost" size="sm" onClick={() => openExternal(newQuoraUrl)} className="justify-start px-0 text-primary" data-testid="button-preview-quora-admin">
                <ExternalLink className="w-4 h-4 mr-2" /> Open Quora link
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label id="admin-skills-label">Skills (up to 3) <span className="text-red-600">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="admin-skills-label"
                  data-testid="combo-admin-skills-trigger"
                  className="w-full justify-between"
                  disabled={skillsLoading}
                >
                  {newSkills.length > 0 ? `${newSkills.length} selected` : "Select skills"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search skills…" />
                  <CommandList>
                  <CommandEmpty>No skills found.</CommandEmpty>
                  <CommandGroup>
                    {skills.map((skill) => {
                      const selected = newSkills.includes(skill.name);
                      return (
                        <CommandItem
                          key={skill.name}
                          value={skill.name}
                          onSelect={() => toggleSkill(skill.name)}
                          data-testid={`combo-admin-skills-item-${skill.name}`}
                          aria-selected={selected}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                          <span className="flex-1">{skill.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSkillToDelete(skill);
                              setDeleteSkillDialogOpen(true);
                            }}
                            data-testid={`button-delete-skill-${skill.name}`}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {newSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newSkills.map((s) => (
                  <Badge key={s} variant="outline" className="gap-1">
                    {s}
                    <button
                      onClick={() => setNewSkills(prev => prev.filter(x => x !== s))}
                      className="ml-1 hover:bg-muted rounded"
                      data-testid={`button-remove-skill-${s}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {newSkills.length === 0 && (
              <p className="text-xs text-red-600" data-testid="help-admin-skills-required">Select at least one skill.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label id="admin-sectors-label">Sectors (up to 3, optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="admin-sectors-label"
                  data-testid="combo-admin-sectors-trigger"
                  className="w-full justify-between"
                  disabled={sectorsLoading}
                >
                  {newSectors.length > 0 ? `${newSectors.length} selected` : "Select sectors"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search sectors…" />
                  <CommandList>
                  <CommandEmpty>No sectors found.</CommandEmpty>
                  <CommandGroup>
                    {availableSectors.map((sector) => {
                      const selected = newSectors.includes(sector.name);
                      return (
                        <CommandItem
                          key={sector.id}
                          value={sector.name}
                          onSelect={() => toggleSector(sector.name)}
                          data-testid={`combo-admin-sectors-item-${sector.name}`}
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

            {newSectors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newSectors.map((s) => (
                  <Badge key={s} variant="outline" className="gap-1">
                    {s}
                    <button
                      onClick={() => setNewSectors(prev => prev.filter(x => x !== s))}
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

          <div className="space-y-2">
            <Label id="admin-job-titles-label">Job Titles (up to 3, optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="admin-job-titles-label"
                  data-testid="combo-admin-job-titles-trigger"
                  className="w-full justify-between"
                  disabled={jobTitlesLoading}
                >
                  {newJobTitles.length > 0 ? `${newJobTitles.length} selected` : "Select job titles"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search job titles…" />
                  <CommandList>
                  <CommandEmpty>No job titles found.</CommandEmpty>
                  <CommandGroup>
                    {availableJobTitles.map((jobTitle) => {
                      const selected = newJobTitles.includes(jobTitle.name);
                      return (
                        <CommandItem
                          key={jobTitle.id}
                          value={jobTitle.name}
                          onSelect={() => toggleJobTitle(jobTitle.name)}
                          data-testid={`combo-admin-job-titles-item-${jobTitle.name}`}
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

            {newJobTitles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newJobTitles.map((jt) => (
                  <Badge key={jt} variant="outline" className="gap-1">
                    {jt}
                    <button
                      onClick={() => setNewJobTitles(prev => prev.filter(x => x !== jt))}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="new-city">City</Label>
              <Input id="new-city" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="City" data-testid="input-new-city" />
            </div>
            <div className="space-y-2">
              <Label id="new-state-label">US State (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-labelledby="new-state-label"
                    data-testid="combo-state-trigger-admin"
                    className="w-full justify-between"
                  >
                    {newState || "Select US State"}
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
                          onSelect={() => setNewState(s)}
                          data-testid={`combo-state-item-admin-${s}`}
                          aria-selected={newState === s}
                        >
                          <Check className={`mr-2 h-4 w-4 ${newState === s ? "opacity-100" : "opacity-0"}`} />
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
            <Label id="admin-country-label">Country <span className="text-red-600">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="admin-country-label"
                  data-testid="combo-country-trigger-admin"
                  className="w-full justify-between"
                >
                  {newCountry || "Select country"}
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
                        onSelect={() => setNewCountry(c)}
                        data-testid={`combo-country-item-admin-${c}`}
                        aria-selected={newCountry === c}
                      >
                        <Check className={`mr-2 h-4 w-4 ${newCountry === c ? "opacity-100" : "opacity-0"}`} />
                        <span>{c}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={newPublic} onCheckedChange={(v) => setNewPublic(!!v)} />
            <span>Make public</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
          <Button data-testid="button-admin-create-unclaimed" onClick={() => createUnclaimed.mutate()} disabled={newSkills.length === 0 || !newCountry || createUnclaimed.isPending}>
            <Plus className="w-4 h-4 mr-2" /> {createUnclaimed.isPending ? "Creating…" : "Create"}
          </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Profiles
            {!isLoading && profiles.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">
                ({profiles.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search box */}
          <div className="space-y-2">
            <Label htmlFor="search-profiles">Search Profiles</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-profiles"
                type="text"
                placeholder="Search by description, name, city, state, or country..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0); // Reset to first page when searching
                }}
                className="pl-10"
                data-testid="input-search-profiles"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-muted-foreground py-6 text-center">Loading…</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center">
              {searchTerm ? "No profiles match your search" : "No profiles"}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedProfiles.map((p) => {
                // Use userIsVerified from enriched API response, fallback to profile's isVerified field
                const isVerified = (p as any).userIsVerified ?? (p.isVerified || false);
                const firstName = (p as any).firstName?.trim?.() || "";
                const lastName = (p as any).lastName?.trim?.() || "";
                const fullName = [firstName, lastName].filter(Boolean).join(" ") || (p as any).displayName || "";
                
                return editingId === p.id ? (
                  <Card key={p.id}>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value.slice(0,140))} placeholder="140 chars max" rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-signal-url-${p.id}`}>Signal URL</Label>
                        <Input id={`edit-signal-url-${p.id}`} type="url" value={editSignalUrl} onChange={(e) => setEditSignalUrl(e.target.value)} placeholder="https://signal.me/#p/…" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-quora-url-${p.id}`}>Quora Profile URL</Label>
                        <Input id={`edit-quora-url-${p.id}`} type="url" value={editQuoraUrl} onChange={(e) => setEditQuoraUrl(e.target.value)} placeholder="https://www.quora.com/profile/…" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-city-${p.id}`}>City</Label>
                          <Input id={`edit-city-${p.id}`} value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" data-testid={`input-edit-city-${p.id}`} />
                        </div>
                        <div className="space-y-2">
                          <Label id={`edit-state-label-${p.id}`}>US State (Optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-haspopup="listbox"
                                aria-labelledby={`edit-state-label-${p.id}`}
                                data-testid={`combo-state-edit-trigger-${p.id}`}
                                className="w-full justify-between"
                              >
                                {editState || "Select US State"}
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
                                      onSelect={() => setEditState(s)}
                                      data-testid={`combo-state-edit-item-${p.id}-${s}`}
                                      aria-selected={editState === s}
                                    >
                                      <Check className={`mr-2 h-4 w-4 ${editState === s ? "opacity-100" : "opacity-0"}`} />
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
                        <Label id={`edit-skills-label-${p.id}`}>Skills (up to 3) <span className="text-red-600">*</span></Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-haspopup="listbox" aria-labelledby={`edit-skills-label-${p.id}`} className="w-full justify-between" disabled={skillsLoading}>
                              {editSkills.length > 0 ? `${editSkills.length} selected` : "Select skills"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search skills…" />
                              <CommandList>
                              <CommandEmpty>No skills found.</CommandEmpty>
                              <CommandGroup>
                                {skills.map((skill) => {
                                  const selected = editSkills.includes(skill.name);
                                  return (
                                    <CommandItem key={skill.name} value={skill.name} onSelect={() => toggleEditSkill(skill.name)} aria-selected={selected}>
                                      <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                                      <span className="flex-1">{skill.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 ml-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSkillToDelete(skill);
                                          setDeleteSkillDialogOpen(true);
                                        }}
                                        data-testid={`button-delete-skill-edit-${skill.name}`}
                                      >
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                      </Button>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {editSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {editSkills.map((s) => (
                              <Badge key={s} variant="outline" className="gap-1">
                                {s}
                                <button onClick={() => setEditSkills(prev => prev.filter(x => x !== s))} className="ml-1 hover:bg-muted rounded" aria-label={`Remove ${s}`}>
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label id={`edit-sectors-label-${p.id}`}>Sectors (up to 3, optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-haspopup="listbox"
                              aria-labelledby={`edit-sectors-label-${p.id}`}
                              data-testid={`combo-edit-sectors-trigger-${p.id}`}
                              className="w-full justify-between"
                              disabled={sectorsLoading}
                            >
                              {editSectors.length > 0 ? `${editSectors.length} selected` : "Select sectors"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search sectors…" />
                              <CommandList>
                              <CommandEmpty>No sectors found.</CommandEmpty>
                              <CommandGroup>
                                {availableSectors.map((sector) => {
                                  const selected = editSectors.includes(sector.name);
                                  return (
                                    <CommandItem
                                      key={sector.id}
                                      value={sector.name}
                                      onSelect={() => toggleEditSector(sector.name)}
                                      data-testid={`combo-edit-sectors-item-${p.id}-${sector.name}`}
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

                        {editSectors.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {editSectors.map((s) => (
                              <Badge key={s} variant="outline" className="gap-1">
                                {s}
                                <button
                                  onClick={() => setEditSectors(prev => prev.filter(x => x !== s))}
                                  className="ml-1 hover:bg-muted rounded"
                                  data-testid={`button-remove-edit-sector-${p.id}-${s}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label id={`edit-job-titles-label-${p.id}`}>Job Titles (up to 3, optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-haspopup="listbox"
                              aria-labelledby={`edit-job-titles-label-${p.id}`}
                              data-testid={`combo-edit-job-titles-trigger-${p.id}`}
                              className="w-full justify-between"
                              disabled={jobTitlesLoading}
                            >
                              {editJobTitles.length > 0 ? `${editJobTitles.length} selected` : "Select job titles"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search job titles…" />
                              <CommandList>
                              <CommandEmpty>No job titles found.</CommandEmpty>
                              <CommandGroup>
                                {availableJobTitles.map((jobTitle) => {
                                  const selected = editJobTitles.includes(jobTitle.name);
                                  return (
                                    <CommandItem
                                      key={jobTitle.id}
                                      value={jobTitle.name}
                                      onSelect={() => toggleEditJobTitle(jobTitle.name)}
                                      data-testid={`combo-edit-job-titles-item-${p.id}-${jobTitle.name}`}
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

                        {editJobTitles.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {editJobTitles.map((jt) => (
                              <Badge key={jt} variant="outline" className="gap-1">
                                {jt}
                                <button
                                  onClick={() => setEditJobTitles(prev => prev.filter(x => x !== jt))}
                                  className="ml-1 hover:bg-muted rounded"
                                  data-testid={`button-remove-edit-job-title-${p.id}-${jt}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label id={`edit-country-label-${p.id}`}>Country <span className="text-red-600">*</span></Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-haspopup="listbox" aria-labelledby={`edit-country-label-${p.id}`} className="w-full justify-between">
                              {editCountry || "Select country"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command shouldFilter>
                              <CommandInput placeholder="Search countries…" />
                              <CommandEmpty>No countries found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((c) => (
                                  <CommandItem key={c} value={c} onSelect={() => setEditCountry(c)} aria-selected={editCountry === c}>
                                    <Check className={`mr-2 h-4 w-4 ${editCountry === c ? "opacity-100" : "opacity-0"}`} />
                                    <span>{c}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={editPublic} onCheckedChange={(v) => setEditPublic(!!v)} />
                        <span>Make public</span>
                      </label>
                      {(editPublic || p.isPublic) && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Public Profile URL</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              readOnly
                              value={`${window.location.origin}/apps/directory/public/${p.id}`}
                              className="font-mono text-xs"
                              data-testid={`input-public-url-${p.id}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openExternal(`${window.location.origin}/apps/directory/public/${p.id}`)}
                              data-testid={`button-view-public-${p.id}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(p.id)} disabled={editSkills.length === 0 || !editCountry || updateMutation.isPending} data-testid={`button-save-edit-${p.id}`}>
                            {updateMutation.isPending ? "Saving…" : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={cancelEdit} disabled={updateMutation.isPending} data-testid={`button-cancel-edit-${p.id}`}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div key={p.id} className="rounded-md border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <VerifiedBadge isVerified={isVerified} testId={`badge-verified-${p.id}`} />
                        {!p.isClaimed && <Badge variant="outline">Unclaimed</Badge>}
                        {p.isPublic && (
                          <Badge variant="default" className="gap-1">
                            <ExternalLink className="w-3 h-3" /> Public
                          </Badge>
                        )}
                      </div>
                      {/* Admins should clearly see full name, first name, and last name */}
                      {(fullName || firstName || lastName) && (
                        <div className="mt-1 space-y-0.5 text-sm">
                          <div className="font-medium">
                            {fullName || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Full name: {fullName || "—"} • First name: {firstName || "—"} • Last name: {lastName || "—"}
                          </div>
                        </div>
                      )}
                      <div className="text-sm mt-1 truncate">{p.description}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.city || p.state || p.country ? [p.city, p.state, p.country].filter(Boolean).join(', ') : '—'}
                      </div>
                      {p.isPublic && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openExternal(`${window.location.origin}/apps/directory/public/${p.id}`)}
                            className="text-primary text-xs h-auto p-0"
                            data-testid={`button-view-public-link-${p.id}`}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Public Profile
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!p.isClaimed && (
                        <select 
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                          defaultValue="" 
                          onChange={(e) => e.target.value && assignMutation.mutate({ id: p.id, userId: e.target.value })}
                          data-testid={`select-assign-user-${p.id}`}
                        >
                          <option value="">Assign to user…</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User'}</option>
                          ))}
                        </select>
                      )}
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)} data-testid={`button-edit-${p.id}`}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      {!p.isClaimed && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteClick(p)} 
                          data-testid={`button-delete-${p.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Pagination Controls - only show if there are more items than per page */}
              {total > limit && (
                <PaginationControls
                  currentPage={page}
                  totalItems={total}
                  itemsPerPage={limit}
                  onPageChange={setPage}
                  className="mt-6"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unclaimed Profile</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Are you sure you want to delete this unclaimed profile? This action is permanent and cannot be undone.
              </p>
              {profileToDelete && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Profile Details:</p>
                  <p className="text-sm text-muted-foreground">{profileToDelete.description}</p>
                  {(profileToDelete as any).firstName || (profileToDelete as any).lastName || (profileToDelete as any).displayName ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Full name: {([ (profileToDelete as any).firstName, (profileToDelete as any).lastName ].filter(Boolean).join(" ") || (profileToDelete as any).displayName || "—")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        First name: {(profileToDelete as any).firstName || "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last name: {(profileToDelete as any).lastName || "—"}
                      </p>
                    </>
                  ) : null}
                  {profileToDelete.skills && profileToDelete.skills.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Skills: {profileToDelete.skills.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setProfileToDelete(null);
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => profileToDelete && deleteMutation.mutate(profileToDelete.id)}
              disabled={deleteMutation.isPending || !profileToDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Skill Confirmation Dialog */}
      <AlertDialog open={deleteSkillDialogOpen} onOpenChange={setDeleteSkillDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Are you sure you want to delete this skill? This action is permanent and cannot be undone.
              </p>
              {skillToDelete && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Skill Name:</p>
                  <p className="text-sm text-muted-foreground">{skillToDelete.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: This will not remove the skill from existing profiles, but it will no longer be available for new selections.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteSkillDialogOpen(false);
                setSkillToDelete(null);
              }}
              disabled={deleteSkillMutation.isPending}
              data-testid="button-cancel-delete-skill"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => skillToDelete && deleteSkillMutation.mutate(skillToDelete.name)}
              disabled={deleteSkillMutation.isPending || !skillToDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-skill"
            >
              {deleteSkillMutation.isPending ? "Deleting..." : "Delete Skill"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Announcements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create and manage announcements for Directory.
          </p>
          <Link href="/apps/directory/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}
