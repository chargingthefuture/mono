import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { ArrowLeft, Edit2, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional().nullable(),
  contentMd: z.string().min(1, "Content is required"),
  contentHtml: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export default function BlogAdmin() {
  const { toast } = useToast();
  const { data: posts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/admin/posts"],
  });

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      contentMd: "",
      contentHtml: "",
      authorName: "",
      category: "",
      isPublished: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues) => {
      return apiRequest("POST", "/api/blog/admin/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      form.reset({ title: "", slug: "", excerpt: "", contentMd: "", contentHtml: "", authorName: "", category: "", isPublished: true });
      toast({ title: "Success", description: "Blog post created" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/blog/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({ title: "Success", description: "Blog post deleted" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogPostFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <MiniAppBackButton />
      <div className="flex items-center gap-4">
        <Link href="/admin/activity">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Blog Admin</h1>
          <p className="text-muted-foreground">
            Manage imported Discourse posts and native blog content
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" data-testid="input-title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-slug" data-testid="input-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author name" data-testid="input-author" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional category" data-testid="input-category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short summary (optional)"
                        rows={3}
                        data-testid="input-excerpt"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentMd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full post content in Markdown"
                        rows={10}
                        data-testid="input-content-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" data-testid="button-save-post">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!posts || posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded-md p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">{post.title}</span>
                    {!post.isPublished && (
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                    <span>{post.slug}</span>
                    <span>•</span>
                    <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline" size="icon" data-testid={`button-view-${post.id}`}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid={`button-delete-${post.id}`}
                    onClick={() => deleteMutation.mutate(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}



