import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertGentlepulseMeditationSchema } from "@shared/schema";
import { z } from "zod";
import { Plus } from "lucide-react";
import type { GentlepulseMeditation } from "@shared/schema";

const meditationFormSchema = insertGentlepulseMeditationSchema;

type MeditationFormData = z.infer<typeof meditationFormSchema>;

export default function GentlePulseAdminMeditations() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: meditations, isLoading } = useQuery<{ meditations: GentlepulseMeditation[]; total: number }>({
    queryKey: ["/api/gentlepulse/meditations?limit=100"],
  });

  const form = useForm<MeditationFormData>({
    resolver: zodResolver(meditationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      wistiaUrl: "",
      tags: [],
      duration: null,
      isActive: true,
      position: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MeditationFormData) => {
      return apiRequest("POST", "/api/gentlepulse/admin/meditations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gentlepulse/meditations"] });
      form.reset();
      toast({ title: "Meditation created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MeditationFormData> }) => {
      return apiRequest("PUT", `/api/gentlepulse/admin/meditations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gentlepulse/meditations"] });
      form.reset();
      setEditingId(null);
      toast({ title: "Meditation updated successfully" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Edit Meditation" : "Add New Meditation"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (editingId) {
                updateMutation.mutate({ id: editingId, data });
              } else {
                createMutation.mutate(data);
              }
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Meditation title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Short description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wistiaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wistia URL *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t.length > 0);
                        field.onChange(tags.length > 0 ? tags : null);
                      }}
                      placeholder="grounding, sleep, anxiety"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Update Meditation" : "Create Meditation"}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* List of meditations */}
      <CardContent>
        <CardTitle className="mb-4">All Meditations</CardTitle>
        <div className="space-y-2">
          {meditations?.meditations.map((meditation) => (
            <div key={meditation.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <p className="font-medium">{meditation.title}</p>
                <p className="text-sm text-muted-foreground">{meditation.description.substring(0, 100)}...</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(meditation.id);
                  const tags = meditation.tags ? JSON.parse(meditation.tags) : [];
                  form.reset({
                    ...meditation,
                    tags: tags.length > 0 ? tags : null,
                  });
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
