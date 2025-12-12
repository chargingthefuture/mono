import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Plus, FileText, Bookmark, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AnnouncementBanner } from "@/components/announcement-banner";
import type { ResearchItem } from "@shared/schema";

export default function CompareNotesDashboard() {
  const { user } = useAuth();

  const { data: myItemsData } = useQuery<{ items: ResearchItem[]; total: number }>({
    queryKey: [`/api/research/items?userId=${user?.id}&limit=5`],
    enabled: !!user,
  });
  const myItems = myItemsData?.items || [];

  const { data: bookmarksData } = useQuery<{ items: ResearchItem[]; total: number }>({
    queryKey: ["/api/research/bookmarks"],
    enabled: !!user,
  });
  const bookmarks = bookmarksData?.items || [];

  const { data: timeline = [] } = useQuery<ResearchItem[]>({
    queryKey: [`/api/research/timeline?limit=5`],
    enabled: !!user,
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold">CompareNotes Dashboard</h1>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Collaborative questions and answers
          </p>
        </div>
        <Link href="/apps/research/new">
          <Button data-testid="button-new-research">
            <Plus className="w-4 h-4 mr-2" />
            New Question
          </Button>
        </Link>
      </div>

      <AnnouncementBanner
        apiEndpoint="/api/research/announcements"
        queryKey="/api/research/announcements"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>Latest questions from your network</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in your timeline yet</p>
            ) : (
              <div className="space-y-2">
                {timeline.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/apps/research/item/${item.id}`}>
                    <div className="p-2 rounded hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.bodyMd.substring(0, 60)}...
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/apps/research/timeline">
              <Button variant="outline" className="w-full" data-testid="button-view-timeline">
                View Full Timeline
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>My Questions</CardTitle>
                  <CardDescription>Questions you've created</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {myItems.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">You haven't created any questions yet</p>
                <Link href="/apps/research/new">
                  <Button variant="outline" className="w-full" data-testid="button-create-first">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Question
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myItems.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/apps/research/item/${item.id}`}>
                    <div className="p-2 rounded hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.status.replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link href="/apps/research/my-items">
                  <Button variant="outline" className="w-full" data-testid="button-view-my-items">
                    View All My Questions
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Bookmarks</CardTitle>
                  <CardDescription>Questions you've saved</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
            ) : (
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/apps/research/item/${item.id}`}>
                    <div className="p-2 rounded hover:bg-accent cursor-pointer">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.bodyMd.substring(0, 60)}...
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/apps/research/bookmarks">
              <Button variant="outline" className="w-full" data-testid="button-view-bookmarks">
                View All Bookmarks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/apps/research/new">
              <Button variant="outline" className="w-full" data-testid="button-new-question">
                <Plus className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            </Link>
            <Link href="/apps/research/timeline">
              <Button variant="outline" className="w-full" data-testid="button-browse-timeline">
                Browse Timeline
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


