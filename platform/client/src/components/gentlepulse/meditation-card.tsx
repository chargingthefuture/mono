import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Play } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useClientId } from "@/hooks/useClientId";
import { useExternalLink } from "@/hooks/useExternalLink";
import { useToast } from "@/hooks/use-toast";
import type { GentlepulseMeditation } from "@shared/schema";

interface MeditationCardProps {
  meditation: GentlepulseMeditation;
}

export function MeditationCard({ meditation }: MeditationCardProps) {
  const clientId = useClientId();
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const tags = meditation.tags ? JSON.parse(meditation.tags) : [];
  const averageRating = meditation.averageRating ? Number(meditation.averageRating) : 0;
  const ratingCount = meditation.ratingCount || 0;

  // Note: User rating would need a separate endpoint - for now we'll track locally or skip
  const [userRating, setUserRating] = useState<number>(0);

  // Check if favorited
  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/gentlepulse/favorites/check?clientId=${clientId}&meditationId=${meditation.id}`],
    enabled: !!clientId,
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest("POST", "/api/gentlepulse/ratings", {
        clientId,
        meditationId: meditation.id,
        rating,
      });
    },
    onSuccess: (_, rating) => {
      setUserRating(rating);
      queryClient.invalidateQueries({ queryKey: [`/api/gentlepulse/meditations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/gentlepulse/meditations/${meditation.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/gentlepulse/meditations/${meditation.id}/ratings`] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      if (isFavorite) {
        return apiRequest("POST", "/api/gentlepulse/favorites", {
          clientId,
          meditationId: meditation.id,
        });
      } else {
        return apiRequest("DELETE", `/api/gentlepulse/favorites/${meditation.id}?clientId=${clientId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/gentlepulse/favorites/check?clientId=${clientId}&meditationId=${meditation.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/gentlepulse/favorites?clientId=${clientId}`] });
      toast({
        title: favoriteData?.isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    },
  });

  const playMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/gentlepulse/meditations/${meditation.id}/play`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/gentlepulse/meditations`] });
      openExternal(meditation.wistiaUrl);
    },
  });

  const handlePlay = () => {
    playMutation.mutate();
  };

  const handleRating = (rating: number) => {
    ratingMutation.mutate(rating);
    toast({
      title: "Rating Submitted",
      description: "Thank you for your feedback!",
    });
  };

  const handleFavorite = () => {
    favoriteMutation.mutate(!favoriteData?.isFavorite);
  };

  const currentRating = userRating || 0;

  return (
    <>
      <Card className="hover-elevate overflow-hidden">
        <div className="relative">
          {meditation.thumbnail && (
            <img
              src={meditation.thumbnail}
              alt={meditation.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={`${favoriteData?.isFavorite ? "text-red-500" : ""} bg-background/80 backdrop-blur`}
              data-testid={`button-favorite-${meditation.id}`}
              aria-label={favoriteData?.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${favoriteData?.isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{meditation.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{meditation.description}</p>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={`Rate ${star} stars`}
                    data-testid={`star-${star}-${meditation.id}`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (hoveredStar || currentRating || Math.round(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {ratingCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({ratingCount})
                </span>
              )}
            </div>
            {meditation.duration && (
              <span className="text-xs text-muted-foreground">{meditation.duration} min</span>
            )}
          </div>

          <Button
            onClick={handlePlay}
            className="w-full"
            size="lg"
            data-testid={`button-play-${meditation.id}`}
          >
            <Play className="w-4 h-4 mr-2" />
            Play Meditation
          </Button>
        </CardContent>
      </Card>
      <ExternalLinkDialog />
    </>
  );
}
