import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MeditationCard } from "@/components/gentlepulse/meditation-card";
import { MoodCheckDialog, SafetyMessageDialog } from "@/components/gentlepulse/mood-check-dialog";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PaginationControls } from "@/components/pagination-controls";
import { GentlePulseDesktopNav } from "@/components/gentlepulse/desktop-nav";
import { useClientId } from "@/hooks/useClientId";
import { Heart, List } from "lucide-react";
import type { GentlepulseMeditation } from "@shared/schema";

export default function GentlePulseLibrary() {
  const clientId = useClientId();
  const [sortBy, setSortBy] = useState("newest");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [showSafetyMessage, setShowSafetyMessage] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Check if mood check should be shown
  const { data: moodEligible } = useQuery<{ eligible: boolean }>({
    queryKey: [`/api/gentlepulse/mood/check-eligible?clientId=${clientId}`],
    enabled: !!clientId,
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    // Show mood dialog if eligible and hasn't been shown in this session
    // Backend already enforces 7-day check, so we only need to prevent showing multiple times per session
    if (moodEligible?.eligible) {
      const sessionKey = `gentlepulse_mood_shown_${clientId}`;
      const shownThisSession = sessionStorage.getItem(sessionKey);
      if (!shownThisSession) {
        setShowMoodDialog(true);
        sessionStorage.setItem(sessionKey, "true");
      }
    }
  }, [moodEligible, clientId]);

  // Fetch favorites - always fetch if clientId exists, but only use when filtering
  const { data: favoriteIds = [] } = useQuery<string[]>({
    queryKey: [`/api/gentlepulse/favorites?clientId=${clientId}`],
    enabled: !!clientId,
  });

  // Convert "all" to empty string for API call
  const tagFilterForApi = tagFilter === "all" ? "" : tagFilter;

  // When showing favorites only, we need to fetch all meditations and filter client-side
  // Otherwise, use paginated API
  const shouldFetchAll = showFavoritesOnly && favoriteIds.length > 0;
  const queryKey = shouldFetchAll
    ? `/api/gentlepulse/meditations?sortBy=${sortBy}&tag=${tagFilterForApi}&limit=1000&offset=0`
    : `/api/gentlepulse/meditations?sortBy=${sortBy}&tag=${tagFilterForApi}&limit=${limit}&offset=${page * limit}`;

  const { data, isLoading } = useQuery<{ meditations: GentlepulseMeditation[]; total: number }>({
    queryKey: [queryKey],
  });

  // Filter meditations by favorites if needed
  const filteredMeditations = useMemo(() => {
    if (!showFavoritesOnly) {
      return data?.meditations || [];
    }
    // If showing favorites only but no favorites, return empty array
    if (favoriteIds.length === 0) {
      return [];
    }
    return (data?.meditations || []).filter(m => favoriteIds.includes(m.id));
  }, [data?.meditations, showFavoritesOnly, favoriteIds]);

  // Apply client-side pagination when showing favorites
  const paginatedMeditations = useMemo(() => {
    if (showFavoritesOnly) {
      const start = page * limit;
      const end = start + limit;
      return filteredMeditations.slice(start, end);
    }
    return filteredMeditations;
  }, [filteredMeditations, page, limit, showFavoritesOnly]);

  const total = showFavoritesOnly ? filteredMeditations.length : (data?.total || 0);
  const meditations = paginatedMeditations;

  // Get unique tags from all meditations (use data?.meditations to get all tags, not just filtered)
  const allTags = new Set<string>();
  (data?.meditations || []).forEach((m) => {
    if (m.tags) {
      try {
        const tags = JSON.parse(m.tags);
        tags.forEach((tag: string) => allTags.add(tag));
      } catch (e) {
        // ignore
      }
    }
  });

  const handleMoodSubmitted = (showSafety: boolean) => {
    // Backend already tracks submission date, no need for localStorage
    // Clear session flag so it can show again after 7 days (when backend says eligible)
    if (clientId) {
      sessionStorage.removeItem(`gentlepulse_mood_shown_${clientId}`);
    }
    if (showSafety) {
      setShowSafetyMessage(true);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading meditations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 pb-24" data-testid="meditation-library">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">GentlePulse</h1>
        <p className="text-muted-foreground">
          Guided meditations for peace and healing
        </p>
      </div>

      <GentlePulseDesktopNav />

      <AnnouncementBanner
        apiEndpoint="/api/gentlepulse/announcements"
        queryKey="/api/gentlepulse/announcements"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most-rated">Most Rated</SelectItem>
            <SelectItem value="highest-rating">Highest Rating</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-tag">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {Array.from(allTags).map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setPage(0); // Reset to first page when toggling filter
            }}
            className="flex items-center gap-2"
            data-testid="button-toggle-favorites"
          >
            {showFavoritesOnly ? (
              <List className="w-4 h-4" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {showFavoritesOnly ? "Show All" : "Favorites Only"}
          </Button>
        </div>
      </div>

      {/* Meditation Grid */}
      {meditations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {showFavoritesOnly 
                ? "No favorite meditations found" 
                : "No meditations found"}
            </p>
            {showFavoritesOnly && (
              <p className="text-sm text-muted-foreground">
                Tap the heart icon on any meditation to save it as a favorite
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meditations.map((meditation) => (
              <MeditationCard key={meditation.id} meditation={meditation} />
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      )}

      {/* Mood Check Dialog */}
      <MoodCheckDialog
        open={showMoodDialog}
        onOpenChange={setShowMoodDialog}
        onMoodSubmitted={handleMoodSubmitted}
      />

      {/* Safety Message Dialog */}
      <SafetyMessageDialog
        open={showSafetyMessage}
        onOpenChange={setShowSafetyMessage}
      />
    </div>
  );
}
