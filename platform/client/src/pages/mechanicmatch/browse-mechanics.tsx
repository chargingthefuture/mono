import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, MapPin, Star, DollarSign, Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { MechanicmatchProfile } from "@shared/schema";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BrowseMechanicsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [isMobileMechanic, setIsMobileMechanic] = useState<boolean | undefined>(undefined);
  const [maxHourlyRate, setMaxHourlyRate] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");

  // Build query params
  const queryParams = new URLSearchParams();
  if (cityFilter) queryParams.append('city', cityFilter);
  if (stateFilter) queryParams.append('state', stateFilter);
  if (isMobileMechanic !== undefined) queryParams.append('isMobileMechanic', String(isMobileMechanic));
  if (maxHourlyRate) queryParams.append('maxHourlyRate', maxHourlyRate);
  if (minRating) queryParams.append('minRating', minRating);

  const { data: mechanics = [], isLoading } = useQuery<MechanicmatchProfile[]>({
    queryKey: [`/api/mechanicmatch/search/mechanics?${queryParams.toString()}`],
  });

  // Apply fuzzy search to results (displayName may not exist, so we'll compute it)
  const mechanicsWithDisplayName = mechanics.map(m => ({
    ...m,
    displayName: m.displayName || (m.city && m.state ? `${m.city}, ${m.state}` : 'Mechanic') || 'Mechanic'
  }));
  const filteredMechanics = useFuzzySearch(mechanicsWithDisplayName, searchQuery, {
    searchFields: ['displayName', 'city', 'state', 'mechanicBio', 'specialties'],
    threshold: 0.3,
  });

  const formatSpecialties = (specialties: string | null) => {
    if (!specialties) return [];
    try {
      const parsed = JSON.parse(specialties);
      return Array.isArray(parsed) ? parsed : [specialties];
    } catch {
      return specialties.split(',').map(s => s.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading mechanics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/mechanicmatch">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Browse Mechanics</h1>
          <p className="text-muted-foreground">
            Find trusted mechanics for your vehicle needs
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, location, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                data-testid="input-city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                data-testid="input-state"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-rate">Max Hourly Rate ($)</Label>
              <Input
                id="max-rate"
                type="number"
                placeholder="e.g., 100"
                value={maxHourlyRate}
                onChange={(e) => setMaxHourlyRate(e.target.value)}
                data-testid="input-max-rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-rating">Min Rating</Label>
              <Input
                id="min-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="e.g., 4.0"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                data-testid="input-min-rating"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mobile-mechanic"
              checked={isMobileMechanic === true}
              onCheckedChange={(checked) => setIsMobileMechanic(checked ? true : undefined)}
              data-testid="checkbox-mobile"
            />
            <Label htmlFor="mobile-mechanic" className="cursor-pointer">
              Mobile mechanic only
            </Label>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setCityFilter("");
              setStateFilter("");
              setIsMobileMechanic(undefined);
              setMaxHourlyRate("");
              setMinRating("");
              setSearchQuery("");
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredMechanics.length} {filteredMechanics.length === 1 ? 'Mechanic' : 'Mechanics'} Found
          </h2>
        </div>

        {filteredMechanics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No mechanics found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMechanics.map((mechanic) => {
              const specialties = formatSpecialties(mechanic.specialties);
              return (
                <Card key={mechanic.id} className="hover-elevate" data-testid={`card-mechanic-${mechanic.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{mechanic.displayName}</CardTitle>
                        <CardDescription className="mt-1">
                          {mechanic.city && mechanic.state && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-3 h-3" />
                              {mechanic.city}, {mechanic.state}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      {mechanic.averageRating && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {parseFloat(mechanic.averageRating).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mechanic.mechanicBio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {mechanic.mechanicBio}
                      </p>
                    )}

                    {specialties.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {specialties.slice(0, 3).map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      {mechanic.hourlyRate && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">${parseFloat(mechanic.hourlyRate)}/hr</span>
                        </div>
                      )}
                      {mechanic.isMobileMechanic && (
                        <Badge variant="secondary" className="text-xs">
                          Mobile
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{mechanic.totalJobsCompleted || 0} jobs completed</span>
                      {mechanic.experience && (
                        <span>{mechanic.experience} years experience</span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      data-testid={`button-request-service-${mechanic.id}`}
                    >
                      <Link href="/apps/mechanicmatch/request-new">
                        Request Service
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

