import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import type { BlogPost } from "@shared/schema";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PaginationControls } from "@/components/pagination-controls";

type BlogPostsResponse = {
  items: BlogPost[];
  total: number;
};

export default function BlogIndex() {
  const [page, setPage] = useState(0); // 0-indexed
  const limit = 10;

  const { data, isLoading } = useQuery<BlogPostsResponse>({
    queryKey: [`/api/blog/posts?limit=${limit}&offset=${page * limit}`],
  });

  const posts = data?.items ?? [];
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Charging the Future Blog</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Essays and updates from the TI Skills Economy (imported from the Discourse townsquare).
        </p>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/blog/announcements"
        queryKey="/api/blog/announcements"
      />

      {!posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <p className="text-muted-foreground">No blog posts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="hover-elevate cursor-pointer">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl line-clamp-2">
                      {post.title}
                    </CardTitle>
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {post.authorName && <span>{post.authorName}</span>}
                    <span>•</span>
                    <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt || post.contentMd.substring(0, 200)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {total > limit && (
          <PaginationControls
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            className="pt-2"
          />
        )}
        </>
      )}
    </div>
  );
}



