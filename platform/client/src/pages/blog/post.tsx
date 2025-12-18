import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost, BlogComment } from "@shared/schema";
import { format } from "date-fns";
import { PaginationControls } from "@/components/pagination-controls";
import { useState } from "react";

export default function BlogPostPage() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading } = useQuery<BlogPost | null>({
    queryKey: slug ? [`/api/blog/posts/${slug}`] : ["blog-post"],
    enabled: !!slug,
  });

  if (!slug) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <p className="text-muted-foreground">Missing blog post slug.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Post not found.</p>
        </div>
      </div>
    );
  }

  // Paginated comments (replies imported from Discourse)
  const [commentsPage, setCommentsPage] = useState(0);
  const commentsLimit = 20;

  type BlogCommentsResponse = {
    items: BlogComment[];
    total: number;
  };

  const { data: commentsData } = useQuery<BlogCommentsResponse>({
    queryKey: [
      `/api/blog/posts/${post.slug}/comments?limit=${commentsLimit}&offset=${commentsPage * commentsLimit}`,
    ],
  });

  const comments = commentsData?.items ?? [];
  const commentsTotal = commentsData?.total ?? 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-semibold mb-2">
            {post.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            {post.authorName && <span>{post.authorName}</span>}
            <span>•</span>
            <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
            {post.category && (
              <>
                <span>•</span>
                <span>{post.category}</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {post.contentHtml ? (
            <div
              className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap text-sm sm:text-base font-sans">
              {post.contentMd}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Comments / replies */}
      <section aria-label="Comments" className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Discussion</h2>

        {commentsTotal === 0 ? (
          <p className="text-sm text-muted-foreground">
            There are no imported replies for this post yet.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="py-4">
                    {comment.contentHtml ? (
                      <div
                        className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm font-sans">
                        {comment.contentMd}
                      </pre>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Reply #{comment.postNumber}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {commentsTotal > commentsLimit && (
              <PaginationControls
                currentPage={commentsPage}
                totalItems={commentsTotal}
                itemsPerPage={commentsLimit}
                onPageChange={setCommentsPage}
                className="pt-2"
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}



