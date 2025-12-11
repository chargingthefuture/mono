import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AnnouncementDisplay } from "@/components/announcement-display";
import type { WorkforceRecruiterAnnouncement } from "@shared/schema";

export default function WorkforceRecruiterAnnouncements() {
  const { data: announcements, isLoading } = useQuery<WorkforceRecruiterAnnouncement[]>({
    queryKey: ["/api/workforce-recruiter/announcements"], // Public endpoint shows only active announcements
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Announcements</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Stay updated with Workforce Recruiter news and important notifications
        </p>
      </div>

      {!announcements || announcements.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <p className="text-muted-foreground">No announcements at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementDisplay
              key={announcement.id}
              id={announcement.id}
              title={announcement.title}
              content={announcement.content}
              type={announcement.type}
              createdAt={announcement.createdAt}
              expiresAt={announcement.expiresAt}
              showExpiration={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}


