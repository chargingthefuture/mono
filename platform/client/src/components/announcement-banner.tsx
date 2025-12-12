import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, Wrench, Bell, Megaphone, X } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export interface AnnouncementBannerProps {
  apiEndpoint: string;
  queryKey?: string;
}

export function AnnouncementBanner({ apiEndpoint, queryKey }: AnnouncementBannerProps) {
  const { handleError } = useErrorHandler({ showToast: true, toastTitle: "Announcements Error" });
  const { data: announcements, isLoading, error } = useQuery<any[]>({
    queryKey: [queryKey || apiEndpoint],
    // Provide an explicit queryFn because tests use a QueryClient without a default queryFn.
    queryFn: async () => {
      const res = await fetch(apiEndpoint, { credentials: "include" });

      // Treat undefined ok (from mocked fetch in tests) as success to avoid false failures.
      if (res.ok === false) {
        throw new Error(`Failed to fetch announcements: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      // Ensure we always return an array, even if the API returns something else
      return Array.isArray(data) ? data : [];
    },
  });

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem(`dismissed-announcements-${apiEndpoint}`) || "[]"))
  );

  const dismissAnnouncement = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem(
      `dismissed-announcements-${apiEndpoint}`,
      JSON.stringify(Array.from(newDismissed))
    );
  };

  // Ensure announcements is an array before checking length
  const announcementsArray = Array.isArray(announcements) ? announcements : [];
  
  if (isLoading || !announcementsArray || announcementsArray.length === 0) {
    return null;
  }

  const activeAnnouncements = announcementsArray.filter(
    (announcement) => !dismissedIds.has(announcement.id)
  );

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />;
      case "maintenance":
        return <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
      case "update":
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
      case "promotion":
        return <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
    }
  };

  const getAnnouncementBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive" as const;
      case "maintenance":
        return "secondary" as const;
      case "update":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      {activeAnnouncements.map((announcement) => (
        <Card
          key={announcement.id}
          data-testid={`announcement-banner-${announcement.id}`}
          className="border-l-4 border-l-primary"
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getAnnouncementIcon(announcement.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm sm:text-base">{announcement.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => dismissAnnouncement(announcement.id)}
                    data-testid={`button-dismiss-${announcement.id}`}
                    aria-label="Dismiss announcement"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getAnnouncementBadgeVariant(announcement.type)} className="text-xs">
                    {announcement.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                  </span>
                  {announcement.expiresAt && (
                    <span className="text-xs text-muted-foreground">
                      Expires: {format(new Date(announcement.expiresAt), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}








