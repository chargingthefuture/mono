import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertResearchItemSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link } from "wouter";

const itemFormSchema = insertResearchItemSchema.omit({ userId: true });

type ItemFormData = z.infer<typeof itemFormSchema>;

export default function NewCompareNotesItem() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: "",
      bodyMd: "",
      tags: [],
      attachments: [],
      deadline: null,
      isPublic: false,
      status: "open",
    },
  });

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const createMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      const response = await apiRequest("POST", "/api/research/items", {
        ...data,
        tags: tags.length > 0 ? tags : null,
      });
      return await response.json();
    },
    onSuccess: async (item) => {
      // Set the item in cache immediately so it's available when we navigate
      queryClient.setQueryData([`/api/research/items/${item.id}`], item);
      
      // Invalidate timeline queries so they refetch when user navigates back
      queryClient.invalidateQueries({ 
        queryKey: ["/api/research/items"],
        refetchType: "active", // Only refetch active queries
      });
      
      toast({
        title: "Question Posted",
        description: "Your research question has been posted successfully",
      });
      
      // Navigate immediately - the item is now in cache
      setLocation(`/apps/research/item/${item.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create research item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ItemFormData) => {
    createMutation.mutate({ ...data, tags: tags.length > 0 ? tags : null });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/apps/research">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">New Research Question</h1>
          <p className="text-muted-foreground">
            Post a research question and get collaborative answers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Short, descriptive title" data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyMd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Markdown supported) *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide detailed context for your research question..."
                        rows={12}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tags (Optional)</FormLabel>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    data-testid="input-tag"
                  />
                  <Button type="button" onClick={addTag} variant="outline" data-testid="button-add-tag">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                        <span className="text-sm">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => removeTag(index)}
                          data-testid={`button-remove-tag-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        data-testid="input-deadline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-public"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this question public</FormLabel>
                      <FormDescription>
                        Public questions can be viewed by anyone, even without an account
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Posting..." : "Post Question"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/apps/research")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
