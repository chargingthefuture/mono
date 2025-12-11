import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bell } from "lucide-react";
import type { ChatGroup } from "@shared/schema";
import { useExternalLink } from "@/hooks/useExternalLink";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { Link } from "wouter";

export default function ChatGroupsPage() {
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { data: groups = [], isLoading } = useQuery<ChatGroup[]>({
    queryKey: ["/api/chatgroups"],
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Chat Groups</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Join Signal.org groups to connect with other survivors</p>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/chatgroups/announcements"
        queryKey="/api/chatgroups/announcements"
      />

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground">No chat groups available yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Card key={group.id} data-testid={`card-chat-group-${group.id}`}>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{group.description}</p>
                <Button
                  variant="outline"
                  onClick={() => openExternal(group.signalUrl)}
                  className="w-full"
                  data-testid={`button-join-group-${group.id}`}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Announcements Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              View platform updates and notifications
            </p>
            <Link href="/apps/chatgroups/announcements">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-announcements">
                View Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ExternalLinkDialog />
    </div>
  );
}

