import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Building2, Briefcase, Wrench } from "lucide-react";
import type { SkillsSector, SkillsJobTitle, SkillsSkill } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SkillsHierarchy = Array<{
  sector: SkillsSector;
  jobTitles: Array<{
    jobTitle: SkillsJobTitle;
    skills: SkillsSkill[];
  }>;
}>;

export default function AdminSkillsPage() {
  const { toast } = useToast();
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [expandedJobTitles, setExpandedJobTitles] = useState<Set<string>>(new Set());

  // Fetch full hierarchy
  const { data: hierarchy = [], isLoading } = useQuery<SkillsHierarchy>({
    queryKey: ["/api/skills/hierarchy"],
    // Skills hierarchy can be updated by admins, so use shorter staleTime (2 minutes)
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Sector management
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<SkillsSector | null>(null);
  const [sectorName, setSectorName] = useState("");
  const [sectorWorkforceShare, setSectorWorkforceShare] = useState("");
  const [sectorWorkforceCount, setSectorWorkforceCount] = useState("");
  const [sectorDisplayOrder, setSectorDisplayOrder] = useState("0");

  // Job title management
  const [jobTitleDialogOpen, setJobTitleDialogOpen] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<SkillsJobTitle | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [jobTitleName, setJobTitleName] = useState("");
  const [jobTitleDisplayOrder, setJobTitleDisplayOrder] = useState("0");

  // Skill management
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillsSkill | null>(null);
  const [selectedJobTitleId, setSelectedJobTitleId] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillDisplayOrder, setSkillDisplayOrder] = useState("1");

  // Delete dialogs
  const [deleteSectorDialogOpen, setDeleteSectorDialogOpen] = useState(false);
  const [deleteJobTitleDialogOpen, setDeleteJobTitleDialogOpen] = useState(false);
  const [deleteSkillDialogOpen, setDeleteSkillDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'sector' | 'jobTitle' | 'skill'; id: string; name: string } | null>(null);

  const toggleSector = (sectorId: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorId)) {
      newExpanded.delete(sectorId);
    } else {
      newExpanded.add(sectorId);
    }
    setExpandedSectors(newExpanded);
  };

  const toggleJobTitle = (jobTitleId: string) => {
    const newExpanded = new Set(expandedJobTitles);
    if (newExpanded.has(jobTitleId)) {
      newExpanded.delete(jobTitleId);
    } else {
      newExpanded.add(jobTitleId);
    }
    setExpandedJobTitles(newExpanded);
  };

  // Sector mutations
  const createSectorMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/skills/sectors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setSectorDialogOpen(false);
      resetSectorForm();
      toast({ title: "Success", description: "Sector created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create sector", variant: "destructive" });
    },
  });

  const updateSectorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/skills/sectors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setSectorDialogOpen(false);
      resetSectorForm();
      toast({ title: "Success", description: "Sector updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update sector", variant: "destructive" });
    },
  });

  const deleteSectorMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/skills/sectors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setDeleteSectorDialogOpen(false);
      toast({ title: "Success", description: "Sector deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete sector", variant: "destructive" });
    },
  });

  // Job title mutations
  const createJobTitleMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/skills/job-titles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setJobTitleDialogOpen(false);
      resetJobTitleForm();
      toast({ title: "Success", description: "Job title created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create job title", variant: "destructive" });
    },
  });

  const updateJobTitleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/skills/job-titles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setJobTitleDialogOpen(false);
      resetJobTitleForm();
      toast({ title: "Success", description: "Job title updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update job title", variant: "destructive" });
    },
  });

  const deleteJobTitleMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/skills/job-titles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setDeleteJobTitleDialogOpen(false);
      toast({ title: "Success", description: "Job title deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete job title", variant: "destructive" });
    },
  });

  // Skill mutations
  const createSkillMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/skills/skills", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setSkillDialogOpen(false);
      resetSkillForm();
      toast({ title: "Success", description: "Skill created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create skill", variant: "destructive" });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/skills/skills/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setSkillDialogOpen(false);
      resetSkillForm();
      toast({ title: "Success", description: "Skill updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update skill", variant: "destructive" });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/skills/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      setDeleteSkillDialogOpen(false);
      toast({ title: "Success", description: "Skill deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete skill", variant: "destructive" });
    },
  });

  const resetSectorForm = () => {
    setEditingSector(null);
    setSectorName("");
    setSectorWorkforceShare("");
    setSectorWorkforceCount("");
    setSectorDisplayOrder("0");
  };

  const resetJobTitleForm = () => {
    setEditingJobTitle(null);
    setSelectedSectorId("");
    setJobTitleName("");
    setJobTitleDisplayOrder("0");
  };

  const resetSkillForm = () => {
    setEditingSkill(null);
    setSelectedJobTitleId("");
    setSkillName("");
    setSkillDisplayOrder("1");
  };

  const openSectorDialog = (sector?: SkillsSector) => {
    if (sector) {
      setEditingSector(sector);
      setSectorName(sector.name);
      setSectorWorkforceShare(sector.estimatedWorkforceShare || "");
      setSectorWorkforceCount(sector.estimatedWorkforceCount?.toString() || "");
      setSectorDisplayOrder(sector.displayOrder.toString());
    } else {
      resetSectorForm();
    }
    setSectorDialogOpen(true);
  };

  const openJobTitleDialog = (sectorId: string, jobTitle?: SkillsJobTitle) => {
    if (jobTitle) {
      setEditingJobTitle(jobTitle);
      setSelectedSectorId(jobTitle.sectorId);
      setJobTitleName(jobTitle.name);
      setJobTitleDisplayOrder(jobTitle.displayOrder.toString());
    } else {
      resetJobTitleForm();
      setSelectedSectorId(sectorId);
    }
    setJobTitleDialogOpen(true);
  };

  const openSkillDialog = (jobTitleId: string, skill?: SkillsSkill) => {
    if (skill) {
      setEditingSkill(skill);
      setSelectedJobTitleId(skill.jobTitleId);
      setSkillName(skill.name);
      setSkillDisplayOrder(skill.displayOrder.toString());
    } else {
      resetSkillForm();
      setSelectedJobTitleId(jobTitleId);
    }
    setSkillDialogOpen(true);
  };

  const handleSectorSubmit = () => {
    const data: any = {
      name: sectorName.trim(),
      displayOrder: parseInt(sectorDisplayOrder) || 0,
    };
    if (sectorWorkforceShare) data.estimatedWorkforceShare = sectorWorkforceShare;
    if (sectorWorkforceCount) data.estimatedWorkforceCount = parseInt(sectorWorkforceCount);

    if (editingSector) {
      updateSectorMutation.mutate({ id: editingSector.id, data });
    } else {
      createSectorMutation.mutate(data);
    }
  };

  const handleJobTitleSubmit = () => {
    const data = {
      sectorId: selectedSectorId,
      name: jobTitleName.trim(),
      displayOrder: parseInt(jobTitleDisplayOrder) || 0,
    };

    if (editingJobTitle) {
      updateJobTitleMutation.mutate({ id: editingJobTitle.id, data });
    } else {
      createJobTitleMutation.mutate(data);
    }
  };

  const handleSkillSubmit = () => {
    const data = {
      jobTitleId: selectedJobTitleId,
      name: skillName.trim(),
      displayOrder: parseInt(skillDisplayOrder) || 1,
    };

    if (editingSkill) {
      updateSkillMutation.mutate({ id: editingSkill.id, data });
    } else {
      createSkillMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading skills database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Skills Database Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage sectors, job titles, and skills for Directory and Workforce Recruiter apps
          </p>
        </div>
        <Button onClick={() => openSectorDialog()} data-testid="button-add-sector" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Sector
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Skills Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {hierarchy.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sectors found. Create your first sector to get started.</p>
            </div>
          ) : (
            <div className="space-y-2 min-w-0">
              {hierarchy.map(({ sector, jobTitles }) => (
                <div key={sector.id} className="border rounded-lg overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 hover:bg-accent/50">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSector(sector.id)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        {expandedSectors.has(sector.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium truncate">{sector.name}</span>
                        {sector.estimatedWorkforceCount && (
                          <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                            ({sector.estimatedWorkforceCount.toLocaleString()} workers)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openJobTitleDialog(sector.id)}
                        data-testid={`button-add-job-title-${sector.id}`}
                        className="text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Job Title</span>
                        <span className="sm:hidden">Job</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSectorDialog(sector)}
                        data-testid={`button-edit-sector-${sector.id}`}
                        className="flex-shrink-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToDelete({ type: 'sector', id: sector.id, name: sector.name });
                          setDeleteSectorDialogOpen(true);
                        }}
                        data-testid={`button-delete-sector-${sector.id}`}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {expandedSectors.has(sector.id) && (
                    <div className="pl-4 sm:pl-8 pr-2 sm:pr-3 pb-3 space-y-2">
                      {jobTitles.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No job titles. Click "Job Title" to add one.
                        </p>
                      ) : (
                        jobTitles.map(({ jobTitle, skills }) => (
                          <div key={jobTitle.id} className="border rounded-lg overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 hover:bg-accent/50">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleJobTitle(jobTitle.id)}
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                >
                                  {expandedJobTitles.has(jobTitle.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </Button>
                                <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{jobTitle.name}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openSkillDialog(jobTitle.id)}
                                  data-testid={`button-add-skill-${jobTitle.id}`}
                                  className="text-xs sm:text-sm"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Skill
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openJobTitleDialog(sector.id, jobTitle)}
                                  data-testid={`button-edit-job-title-${jobTitle.id}`}
                                  className="flex-shrink-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete({ type: 'jobTitle', id: jobTitle.id, name: jobTitle.name });
                                    setDeleteJobTitleDialogOpen(true);
                                  }}
                                  data-testid={`button-delete-job-title-${jobTitle.id}`}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {expandedJobTitles.has(jobTitle.id) && (
                              <div className="pl-4 sm:pl-8 pr-2 pb-2 space-y-1">
                                {skills.length === 0 ? (
                                  <p className="text-sm text-muted-foreground py-2">
                                    No skills. Click "Skill" to add one.
                                  </p>
                                ) : (
                                  skills.map((skill) => (
                                    <div
                                      key={skill.id}
                                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 hover:bg-accent/50 rounded"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm truncate">{skill.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openSkillDialog(jobTitle.id, skill)}
                                          data-testid={`button-edit-skill-${skill.id}`}
                                          className="flex-shrink-0"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setItemToDelete({ type: 'skill', id: skill.id, name: skill.name });
                                            setDeleteSkillDialogOpen(true);
                                          }}
                                          data-testid={`button-delete-skill-${skill.id}`}
                                          className="flex-shrink-0"
                                        >
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Dialog */}
      <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSector ? "Edit Sector" : "Add Sector"}</DialogTitle>
            <DialogDescription>
              {editingSector ? "Update sector information" : "Create a new sector"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sector-name">Sector Name *</Label>
              <Input
                id="sector-name"
                value={sectorName}
                onChange={(e) => setSectorName(e.target.value)}
                placeholder="e.g., Food & Agriculture"
                data-testid="input-sector-name"
              />
            </div>
            <div>
              <Label htmlFor="sector-workforce-share">Estimated Workforce Share (%)</Label>
              <Input
                id="sector-workforce-share"
                type="number"
                step="0.1"
                value={sectorWorkforceShare}
                onChange={(e) => setSectorWorkforceShare(e.target.value)}
                placeholder="e.g., 8.0"
                data-testid="input-sector-workforce-share"
              />
            </div>
            <div>
              <Label htmlFor="sector-workforce-count">Estimated Workforce Count</Label>
              <Input
                id="sector-workforce-count"
                type="number"
                value={sectorWorkforceCount}
                onChange={(e) => setSectorWorkforceCount(e.target.value)}
                placeholder="e.g., 200000"
                data-testid="input-sector-workforce-count"
              />
            </div>
            <div>
              <Label htmlFor="sector-display-order">Display Order</Label>
              <Input
                id="sector-display-order"
                type="number"
                value={sectorDisplayOrder}
                onChange={(e) => setSectorDisplayOrder(e.target.value)}
                data-testid="input-sector-display-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectorDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSectorSubmit}
              disabled={!sectorName.trim() || createSectorMutation.isPending || updateSectorMutation.isPending}
              data-testid="button-submit-sector"
            >
              {editingSector ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Title Dialog */}
      <Dialog open={jobTitleDialogOpen} onOpenChange={setJobTitleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingJobTitle ? "Edit Job Title" : "Add Job Title"}</DialogTitle>
            <DialogDescription>
              {editingJobTitle ? "Update job title information" : "Create a new job title"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="job-title-sector">Sector *</Label>
              <Select value={selectedSectorId} onValueChange={setSelectedSectorId} disabled={!!editingJobTitle}>
                <SelectTrigger id="job-title-sector" data-testid="select-job-title-sector">
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {hierarchy.map(({ sector }) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job-title-name">Job Title Name *</Label>
              <Input
                id="job-title-name"
                value={jobTitleName}
                onChange={(e) => setJobTitleName(e.target.value)}
                placeholder="e.g., Farmers"
                data-testid="input-job-title-name"
              />
            </div>
            <div>
              <Label htmlFor="job-title-display-order">Display Order</Label>
              <Input
                id="job-title-display-order"
                type="number"
                value={jobTitleDisplayOrder}
                onChange={(e) => setJobTitleDisplayOrder(e.target.value)}
                data-testid="input-job-title-display-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobTitleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleJobTitleSubmit}
              disabled={!jobTitleName.trim() || !selectedSectorId || createJobTitleMutation.isPending || updateJobTitleMutation.isPending}
              data-testid="button-submit-job-title"
            >
              {editingJobTitle ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Dialog */}
      <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>
              {editingSkill ? "Update skill information" : "Create a new skill"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="skill-job-title">Job Title *</Label>
              <Select value={selectedJobTitleId} onValueChange={setSelectedJobTitleId} disabled={!!editingSkill}>
                <SelectTrigger id="skill-job-title" data-testid="select-skill-job-title">
                  <SelectValue placeholder="Select a job title" />
                </SelectTrigger>
                <SelectContent>
                  {hierarchy.flatMap(({ sector, jobTitles }) =>
                    jobTitles.map(({ jobTitle }) => (
                      <SelectItem key={jobTitle.id} value={jobTitle.id}>
                        {sector.name} → {jobTitle.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., Crop management"
                data-testid="input-skill-name"
              />
            </div>
            <div>
              <Label htmlFor="skill-display-order">Display Order</Label>
              <Input
                id="skill-display-order"
                type="number"
                value={skillDisplayOrder}
                onChange={(e) => setSkillDisplayOrder(e.target.value)}
                data-testid="input-skill-display-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSkillSubmit}
              disabled={!skillName.trim() || !selectedJobTitleId || createSkillMutation.isPending || updateSkillMutation.isPending}
              data-testid="button-submit-skill"
            >
              {editingSkill ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <AlertDialog open={deleteSectorDialogOpen} onOpenChange={setDeleteSectorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sector</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This will also delete all job titles and skills under this sector. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteSectorMutation.mutate(itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteJobTitleDialogOpen} onOpenChange={setDeleteJobTitleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Title</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This will also delete all skills under this job title. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteJobTitleMutation.mutate(itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteSkillDialogOpen} onOpenChange={setDeleteSkillDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteSkillMutation.mutate(itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

