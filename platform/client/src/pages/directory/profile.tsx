import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DirectoryProfile } from "@shared/schema";
import { ExternalLink, Check, X, Copy } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { US_STATES } from "@/lib/usStates";
import type { DirectorySkill } from "@shared/schema";

type SkillsSector = {
  id: string;
  name: string;
};

type SkillsJobTitle = {
  id: string;
  name: string;
};
import { useExternalLink } from "@/hooks/useExternalLink";
import { VerifiedBadge } from "@/components/verified-badge";
import { DeleteProfileDialog } from "@/components/delete-profile-dialog";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useAuth } from "@/hooks/useAuth";
import { MiniAppBackButton } from "@/components/mini-app-back-button";

export default function DirectoryProfilePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { data: profile, isLoading } = useQuery<DirectoryProfile | null>({
    queryKey: ["/api/directory/profile"],
  });
  const { data: availableSkillsData, isLoading: skillsLoading } = useQuery<DirectorySkill[]>({
    queryKey: ["/api/directory/skills"],
  });
  const availableSkills = availableSkillsData ?? [];
  const { data: availableSectorsData, isLoading: sectorsLoading } = useQuery<SkillsSector[]>({
    queryKey: ["/api/directory/sectors"],
  });
  const availableSectors = availableSectorsData ?? [];
  const { data: availableJobTitlesData, isLoading: jobTitlesLoading } = useQuery<SkillsJobTitle[]>({
    queryKey: ["/api/directory/job-titles"],
  });
  const availableJobTitles = availableJobTitlesData ?? [];
  
  const publicDirectoryUrl = `${window.location.origin}/apps/directory/public`;
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Public Directory link copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [signalUrl, setSignalUrl] = useState("");
  const [quoraUrl, setQuoraUrl] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { openExternal, ExternalLinkDialog } = useExternalLink();

  useEffect(() => {
    if (profile) {
      setDescription(profile.description || "");
      setSkills(profile.skills || []);
      setSectors(profile.sectors || []);
      setJobTitles(profile.jobTitles || []);
      setSignalUrl(profile.signalUrl || "");
      setQuoraUrl(profile.quoraUrl || "");
      setCity(profile.city || "");
      setStateVal(profile.state || "");
      setCountry(profile.country || "");
      setIsPublic(!!profile.isPublic);
      setIsEditing(false);
    }
  }, [profile, user]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        description: description.trim(),
        skills,
        sectors: sectors.length > 0 ? sectors : undefined,
        jobTitles: jobTitles.length > 0 ? jobTitles : undefined,
        signalUrl: signalUrl || null,
        quoraUrl: quoraUrl || null,
        city: city || null,
        state: stateVal || null,
        country: country,
        isPublic,
      };
      return apiRequest("POST", "/api/directory/profile", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/directory/profile"] });
      toast({ title: "Saved", description: "Directory profile created" });
      setIsEditing(false);
      setLocation("/apps/directory");
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to create profile", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        description: description.trim(),
        skills,
        sectors: sectors.length > 0 ? sectors : undefined,
        jobTitles: jobTitles.length > 0 ? jobTitles : undefined,
        signalUrl: signalUrl || null,
        quoraUrl: quoraUrl || null,
        city: city || null,
        state: stateVal || null,
        country: country,
        isPublic,
      };
      return apiRequest("PUT", "/api/directory/profile", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/directory/profile"] });
      toast({ title: "Saved", description: "Directory profile updated" });
      setIsEditing(false);
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to update profile", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const res = await apiRequest("DELETE", "/api/directory/profile", { reason });
      return await res.json();
    },
    onSuccess: async () => {
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/directory/profile"] });
      // Reset all form state
      setDescription(""); 
      setSkills([]);
      setSectors([]);
      setJobTitles([]);
      setSignalUrl(""); 
      setQuoraUrl(""); 
      setCity(""); 
      setStateVal(""); 
      setCountry(""); 
      setIsPublic(false);
      setIsEditing(true); // Show form for creating new profile
      toast({ title: "Deleted", description: "Directory profile deleted successfully" });
      // Navigate to dashboard which will show welcome message
      setLocation("/apps/directory");
    },
    onError: (e: any) => {
      console.error("Delete profile error:", e);
      toast({ title: "Error", description: e.message || "Failed to delete profile", variant: "destructive" });
    }
  });

  const remaining = useMemo(() => 140 - description.length, [description]);

  const toggleSkill = (s: string) => {
    setSkills(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 skills", variant: "destructive" });
        return prev;
      }
      return [...prev, s];
    });
  };

  const toggleSector = (s: string) => {
    setSectors(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 sectors", variant: "destructive" });
        return prev;
      }
      return [...prev, s];
    });
  };

  const toggleJobTitle = (jt: string) => {
    setJobTitles(prev => {
      if (prev.includes(jt)) return prev.filter(x => x !== jt);
      if (prev.length >= 3) {
        toast({ title: "Limit reached", description: "Select up to 3 job titles", variant: "destructive" });
        return prev;
      }
      return [...prev, jt];
    });
  };


  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const userIsVerified = (profile as any)?.userIsVerified || false;

  const shareUrl = profile?.isPublic ? `${window.location.origin}/apps/directory/public/${profile.id}` : null;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
      <MiniAppBackButton />
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Directory Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Connect and exchange skills with other survivors</p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Public Directory Link</label>
          <p>This link is a where your profile will appear if you choose to have a public profile. Use it to view anyone that has chosen to have a public profile.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {publicDirectoryUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(publicDirectoryUrl)}
              className="flex-shrink-0"
              data-testid="button-copy-public-directory"
              aria-label="Copy public Directory link"
            >
              {copiedUrl === publicDirectoryUrl ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(publicDirectoryUrl)}
              className="flex-shrink-0"
              data-testid="button-open-public-directory"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/directory/announcements"
        queryKey="/api/directory/announcements"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              {profile ? "Your Profile" : "Create Your Profile"}
              {profile && <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-profile" />}
            </CardTitle>
            <div className="flex items-center gap-2">
              {profile && !isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)} data-testid="button-delete-directory-profile">
                    Delete Profile
                  </Button>
                </>
              )}
              {shareUrl && (
                <Button variant="outline" size="sm" onClick={() => openExternal(shareUrl)} data-testid="button-share">
                  <ExternalLink className="w-4 h-4 mr-2" /> Share public link
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && !isEditing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{description || "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="mt-1">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || '—'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.length ? skills.map(s => (<Badge key={s} variant="secondary">{s}</Badge>)) : <span>—</span>}
                </div>
              </div>
              {sectors.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Sectors</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {sectors.map(s => (<Badge key={s} variant="secondary">{s}</Badge>))}
                  </div>
                </div>
              )}
              {jobTitles.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Job Titles</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {jobTitles.map(jt => (<Badge key={jt} variant="secondary">{jt}</Badge>))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-muted-foreground">Signal</Label>
                  {signalUrl ? (
                    <Button variant="ghost" size="sm" onClick={() => openExternal(signalUrl)} className="justify-start px-0 text-primary mt-1">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Signal link
                    </Button>
                  ) : (
                    <div className="mt-1">—</div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Quora</Label>
                  {quoraUrl ? (
                    <Button variant="ghost" size="sm" onClick={() => openExternal(quoraUrl)} className="justify-start px-0 text-primary">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Quora link
                    </Button>
                  ) : (
                    <div className="mt-1">—</div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <div className="mt-1">{[city, stateVal, country].filter(Boolean).join(', ') || '—'}</div>
                </div>
              </div>
            </div>
          ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (skills.length === 0 || !country) {
              toast({ 
                title: "Validation Error", 
                description: "Please select at least one skill and a country.", 
                variant: "destructive" 
              });
              return;
            }
            if (!profile) {
              createMutation.mutate();
            } else {
              updateMutation.mutate();
            }
          }}>
          <div className="space-y-2">
            <Label htmlFor="description">Short description ({remaining} left)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 140))} placeholder="What can you offer or what are you looking for?" />
          </div>

          <div className="space-y-2">
            <Label id="skills-label">Skills (up to 3) <span className="text-red-600">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="skills-label"
                  data-testid="combo-skills-trigger"
                  className="w-full justify-between"
                  disabled={skillsLoading}
                >
                  {skills.length > 0 ? `${skills.length} selected` : "Select skills"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search skills…" />
                  <CommandList>
                  <CommandEmpty>No skills found.</CommandEmpty>
                  <CommandGroup>
                    {availableSkills.map((skill) => {
                      const selected = skills.includes(skill.name);
                      return (
                        <CommandItem
                          key={skill.name}
                          value={skill.name}
                          onSelect={() => toggleSkill(skill.name)}
                          data-testid={`combo-skills-item-${skill.name}`}
                          aria-selected={selected}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"}`} />
                          <span>{skill.name}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="pr-0">
                    <span className="mr-1">{s}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSkill(s)}
                      className="h-5 w-5 ml-1"
                      aria-label={`Remove ${s}`}
                      data-testid={`button-remove-skill-${s}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {skills.length === 0 && (
              <p className="text-xs text-red-600" data-testid="help-skills-required">Select at least one skill.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label id="sectors-label">Sectors (up to 3, optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="sectors-label"
                  data-testid="combo-sectors-trigger"
                  className="w-full justify-between"
                  disabled={sectorsLoading}
                >
                  {sectors.length > 0 ? `${sectors.length} selected` : "Select sectors"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search sectors…" />
                  <CommandList>
                  <CommandEmpty>No sectors found.</CommandEmpty>
                  <CommandGroup>
                    {availableSectors.map((sector) => {
                      const selected = sectors.includes(sector.name);
                      return (
                        <CommandItem
                          key={sector.id}
                          value={sector.name}
                          onSelect={() => toggleSector(sector.name)}
                          data-testid={`combo-sectors-item-${sector.name}`}
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

            {sectors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sectors.map((s) => (
                  <Badge key={s} variant="secondary" className="pr-0">
                    <span className="mr-1">{s}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSector(s)}
                      className="h-5 w-5 ml-1"
                      aria-label={`Remove ${s}`}
                      data-testid={`button-remove-sector-${s}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label id="job-titles-label">Job Titles (up to 3, optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-labelledby="job-titles-label"
                  data-testid="combo-job-titles-trigger"
                  className="w-full justify-between"
                  disabled={jobTitlesLoading}
                >
                  {jobTitles.length > 0 ? `${jobTitles.length} selected` : "Select job titles"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[80vh] flex flex-col" align="start">
                <Command shouldFilter>
                  <CommandInput placeholder="Search job titles…" />
                  <CommandList>
                  <CommandEmpty>No job titles found.</CommandEmpty>
                  <CommandGroup>
                    {availableJobTitles.map((jobTitle) => {
                      const selected = jobTitles.includes(jobTitle.name);
                      return (
                        <CommandItem
                          key={jobTitle.id}
                          value={jobTitle.name}
                          onSelect={() => toggleJobTitle(jobTitle.name)}
                          data-testid={`combo-job-titles-item-${jobTitle.name}`}
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

            {jobTitles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {jobTitles.map((jt) => (
                  <Badge key={jt} variant="secondary" className="pr-0">
                    <span className="mr-1">{jt}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleJobTitle(jt)}
                      className="h-5 w-5 ml-1"
                      aria-label={`Remove ${jt}`}
                      data-testid={`button-remove-job-title-${jt}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="signal">Signal profile URL</Label>
              <Input id="signal" placeholder="https://signal.me/#p/…" value={signalUrl} onChange={(e) => setSignalUrl(e.target.value)} />
              {signalUrl && (
                <Button variant="ghost" size="sm" onClick={() => openExternal(signalUrl)} className="justify-start px-0 text-primary">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Signal link
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quora">Quora profile URL</Label>
              <Input id="quora" placeholder="https://www.quora.com/profile/…" value={quoraUrl} onChange={(e) => setQuoraUrl(e.target.value)} />
              {quoraUrl && (
                <Button variant="ghost" size="sm" onClick={() => openExternal(quoraUrl)} className="justify-start px-0 text-primary">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Quora link
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isPublic} onCheckedChange={(v) => setIsPublic(!!v)} />
                <span>Make my Directory profile public</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label id="state-label">US State (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-labelledby="state-label"
                    data-testid="combo-state-trigger"
                    className="w-full justify-between"
                  >
                    {stateVal || "Select US State"}
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
                          onSelect={() => setStateVal(s)}
                          data-testid={`combo-state-item-${s}`}
                          aria-selected={stateVal === s}
                        >
                          <Check className={`mr-2 h-4 w-4 ${stateVal === s ? "opacity-100" : "opacity-0"}`} />
                          <span>{s}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label id="country-label">Country <span className="text-red-600">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-labelledby="country-label"
                    data-testid="combo-country-trigger"
                    className="w-full justify-between"
                  >
                    {country || "Select country"}
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
                          onSelect={() => setCountry(c)}
                          data-testid={`combo-country-item-${c}`}
                          aria-selected={country === c}
                        >
                          <Check className={`mr-2 h-4 w-4 ${country === c ? "opacity-100" : "opacity-0"}`} />
                          <span>{c}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {!country && (
                <p className="text-xs text-red-600" data-testid="help-country-required">Country is required.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {!profile ? (
              <Button type="submit" disabled={skills.length === 0 || !country || createMutation.isPending} data-testid="button-create-directory-profile">
                {createMutation.isPending ? "Saving…" : "Create Profile"}
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={skills.length === 0 || !country || updateMutation.isPending} data-testid="button-update-directory-profile">
                  {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={deleteMutation.isPending} data-testid="button-delete-directory-profile">
                  Delete Profile
                </Button>
              </>
            )}
          </div>
          </form>
          )}
        </CardContent>
      </Card>

      <ExternalLinkDialog />

      {profile && (
        <DeleteProfileDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={(reason) => deleteMutation.mutate(reason)}
          appName="Directory"
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
