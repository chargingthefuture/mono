import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";

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
    </div>
  );
}



