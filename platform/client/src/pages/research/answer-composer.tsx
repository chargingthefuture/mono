import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertResearchAnswerSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, X } from "lucide-react";

const answerFormSchema = insertResearchAnswerSchema.omit({
  researchItemId: true,
  userId: true,
});

type AnswerFormData = z.infer<typeof answerFormSchema>;

interface ResearchAnswerComposerProps {
  researchItemId: string;
}

export default function ResearchAnswerComposer({ researchItemId }: ResearchAnswerComposerProps) {
  const { toast } = useToast();
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");

  const form = useForm<AnswerFormData>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      bodyMd: "",
      links: [],
      attachments: [],
      confidenceScore: null,
    },
  });

  const addLink = () => {
    if (newLink && !links.includes(newLink)) {
      const updatedLinks = [...links, newLink];
      setLinks(updatedLinks);
      form.setValue("links", updatedLinks);
      setNewLink("");
    }
  };

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    form.setValue("links", updatedLinks);
  };

  const onSubmit = async (data: AnswerFormData) => {
    try {
      await apiRequest("POST", "/api/comparenotes/answers", {
        ...data,
        researchItemId,
        links: links.length > 0 ? links : null,
      });
      
      toast({
        title: "Answer Posted",
        description: "Your answer has been posted successfully",
      });
      
      form.reset();
      setLinks([]);
      queryClient.invalidateQueries({ queryKey: [`/api/comparenotes/items/${researchItemId}/answers`] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post answer",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bodyMd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Answer (Markdown supported)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Write your answer here... (Markdown supported)"
                  rows={8}
                  data-testid="textarea-answer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Supporting Links (Optional)</FormLabel>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              data-testid="input-link"
            />
            <Button type="button" onClick={addLink} variant="outline" data-testid="button-add-link">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {links.length > 0 && (
            <div className="space-y-1">
              {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm truncate flex-1">{link}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                    data-testid={`button-remove-link-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="confidenceScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confidence Score (0-100%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Optional"
                  data-testid="input-confidence"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" data-testid="button-submit-answer">
          Post Answer
        </Button>
      </form>
    </Form>
  );
}
