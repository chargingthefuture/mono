import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Tag, Eye, MessageSquare, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ResearchItem } from "@shared/schema";
import { PaginationControls } from "@/components/pagination-controls";

export default function CompareNotesBookmarks() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: bookmarksData, isLoading } = useQuery<{ items: ResearchItem[]; total: number }>({
    queryKey: ["/api/comparenotes/bookmarks"],
  });
  const bookmarks = bookmarksData?.items || [];

  // Paginate bookmarks
  const paginatedBookmarks = bookmarks.slice(page * limit, (page + 1) * limit);
  const total = bookmarks.length;

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest("DELETE", `/api/comparenotes/bookmarks/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comparenotes/bookmarks"] });
      toast({ title: "Bookmark Removed", description: "Item removed from bookmarks" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove bookmark",
        variant: "destructive",
      });
    },
  });

  const parseTags = (tagsStr: string | null): string[] => {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/apps/comparenotes">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Bookmarks</h1>
            <p className="text-muted-foreground">
              Research items you've saved
            </p>
          </div>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No bookmarks yet</p>
            <p className="text-sm text-muted-foreground">
              Bookmark research items to save them for later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedBookmarks.map((item) => {
            const tags = parseTags(item.tags);
            const excerpt = item.bodyMd.length > 200 
              ? item.bodyMd.substring(0, 200) + "..." 
              : item.bodyMd;

            return (
              <Card key={item.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/apps/comparenotes/item/${item.id}`}>
                        <CardTitle className="text-lg hover:underline cursor-pointer">
                          {item.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.viewCount || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>Answers</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={item.status === "answered" ? "default" : "secondary"}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {excerpt}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/apps/comparenotes/item/${item.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-${item.id}`}>
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBookmarkMutation.mutate(item.id)}
                        disabled={deleteBookmarkMutation.isPending}
                        data-testid={`button-remove-bookmark-${item.id}`}
                      >
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Pagination */}
          {total > limit && (
            <PaginationControls
              currentPage={page}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </div>
      )}
    </div>
  );
}
