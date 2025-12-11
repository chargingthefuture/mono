import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { PaginationControls } from "@/components/pagination-controls";
import { Eye } from "lucide-react";
import type { WorkforceRecruiterOccupation } from "@shared/schema";

export default function OccupationsPage() {
  const [page, setPage] = useState(0);
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: (page * limit).toString(),
    });
    if (sectorFilter !== "all") {
      params.append("sector", sectorFilter);
    }
    if (skillLevelFilter !== "all") {
      params.append("skillLevel", skillLevelFilter);
    }
    return params.toString();
  }, [sectorFilter, skillLevelFilter, page, limit]);

  const { data, isLoading } = useQuery<{ occupations: WorkforceRecruiterOccupation[]; total: number }>({
    queryKey: [`/api/workforce-recruiter/occupations?${queryParams}`],
  });

  // Get all occupations (without filters) to build the sectors dropdown
  const { data: allOccupationsData } = useQuery<{ occupations: WorkforceRecruiterOccupation[]; total: number }>({
    queryKey: [`/api/workforce-recruiter/occupations?limit=1000&offset=0`],
  });

  const occupations = data?.occupations || [];
  const total = data?.total || 0;

  // Get unique sectors for filter from ALL occupations (not filtered)
  const sectors = useMemo(() => {
    const sectorSet = new Set<string>();
    const allOccs = allOccupationsData?.occupations || [];
    allOccs.forEach(occ => {
      if (occ.sector) {
        sectorSet.add(occ.sector);
      }
    });
    return Array.from(sectorSet).sort();
  }, [allOccupationsData]);

  // Fuzzy search
  const filteredOccupations = useFuzzySearch(occupations, searchQuery, {
    searchFields: ["occupationTitle", "sector"],
    threshold: 0.3,
  });

  const getSkillLevelBadgeVariant = (skillLevel: string) => {
    switch (skillLevel) {
      case "Advanced":
        return "default";
      case "Intermediate":
        return "secondary";
      case "Foundational":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading occupations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Occupations</h1>
          <p className="text-muted-foreground">
            View and manage workforce occupations and recruitment
          </p>
        </div>
        <Link href="/apps/workforce-recruiter">
          <Button variant="outline" data-testid="button-back-dashboard">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search occupations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Select 
                value={sectorFilter} 
                onValueChange={(value) => {
                  setSectorFilter(value);
                  setPage(0); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger id="sector" data-testid="select-sector">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select 
                value={skillLevelFilter} 
                onValueChange={(value) => {
                  setSkillLevelFilter(value);
                  setPage(0); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger id="skillLevel" data-testid="select-skill-level">
                  <SelectValue placeholder="All Skill Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skill Levels</SelectItem>
                  <SelectItem value="Foundational">Foundational</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Occupations ({filteredOccupations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOccupations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No occupations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Sector</th>
                    <th className="text-left p-2 text-sm font-medium">Occupation</th>
                    <th className="text-right p-2 text-sm font-medium">Target</th>
                    <th className="text-right p-2 text-sm font-medium">Recruited</th>
                    <th className="text-center p-2 text-sm font-medium">Progress</th>
                    <th className="text-center p-2 text-sm font-medium">Skill</th>
                    <th className="text-right p-2 text-sm font-medium">Annual Training</th>
                    <th className="text-center p-2 text-sm font-medium">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOccupations.map((occupation) => {
                    const percentFilled = occupation.headcountTarget > 0
                      ? (occupation.currentRecruited / occupation.headcountTarget) * 100
                      : 0;
                    return (
                      <tr key={occupation.id} className="border-b hover:bg-accent/50">
                        <td className="p-2 text-sm">{occupation.sector}</td>
                        <td className="p-2 text-sm font-medium">{occupation.occupationTitle}</td>
                        <td className="p-2 text-sm text-right">{occupation.headcountTarget.toLocaleString()}</td>
                        <td className="p-2 text-sm text-right">{occupation.currentRecruited.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="space-y-1">
                            <Progress value={Math.min(percentFilled, 100)} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">
                              {percentFilled.toFixed(1)}%
                            </p>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant={getSkillLevelBadgeVariant(occupation.skillLevel)}>
                            {occupation.skillLevel}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-right">{occupation.annualTrainingTarget.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="flex items-center justify-center">
                            <Link href={`/apps/workforce-recruiter/occupations/${occupation.id}`}>
                              <Button variant="ghost" size="sm" data-testid={`button-view-${occupation.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaginationControls
        currentPage={page}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={setPage}
      />
    </div>
  );
}

