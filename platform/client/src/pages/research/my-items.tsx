import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Tag, Eye, MessageSquare, Clock, Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import type { ResearchItem } from "@shared/schema";
import { PaginationControls } from "@/components/pagination-controls";

export default function CompareNotesMyItems() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery<{ items: ResearchItem[]; total: number }>({
    queryKey: [`/api/comparenotes/items?userId=${user?.id}&limit=${limit}&offset=${page * limit}`],
    enabled: !!user,
  });

  const items = data?.items || [];
  const total = data?.total || 0;

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
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2">My Questions</h1>
            <p className="text-muted-foreground">
              Questions you've created
            </p>
          </div>
        </div>
        <Link href="/apps/comparenotes/new">
          <Button data-testid="button-new-research">
            <Plus className="w-4 h-4 mr-2" />
            New Question
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any questions yet</p>
            <Link href="/apps/comparenotes/new">
              <Button data-testid="button-create-first">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Question
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Pagination */}
          <PaginationControls
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            className="mt-6"
          />
        </div>
      )}
    </div>
  );
}


