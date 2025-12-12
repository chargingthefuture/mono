import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useExternalLink } from "@/hooks/useExternalLink";
import type { ResearchItem, ResearchAnswer } from "@shared/schema";

export default function PublicCompareNotesQuestion() {
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  
  const publicCompareNotesUrl = `${window.location.origin}/apps/research/public`;
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Public CompareNotes link copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const { data: item, isLoading, error } = useQuery<ResearchItem | null>({
    queryKey: ["/api/research/public", id],
    queryFn: async () => {
      const res = await fetch(`/api/research/public/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
  });

  const { data: answers = [] } = useQuery<ResearchAnswer[]>({
    queryKey: [`/api/research/items/${id}/answers?sortBy=score`],
    enabled: !!item && !!id,
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Question not found or not public</p>
        </div>
      </div>
    );
  }

  const tags = item.tags ? JSON.parse(item.tags) : [];
  const publicQuestionUrl = `${window.location.origin}/apps/research/public/${id}`;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">CompareNotes Question</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Public question</p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Public CompareNotes Link</label>
          <p className="text-sm text-muted-foreground">Return to the public CompareNotes list to view all public questions.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {publicCompareNotesUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(publicCompareNotesUrl)}
              className="flex-shrink-0"
              data-testid="button-copy-public-comparenotes"
              aria-label="Copy public CompareNotes link"
            >
              {copiedUrl === publicCompareNotesUrl ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(publicCompareNotesUrl)}
              className="flex-shrink-0"
              data-testid="button-open-public-comparenotes"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">This Question's Public Link</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {publicQuestionUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(publicQuestionUrl)}
              className="flex-shrink-0"
              data-testid="button-copy-public-question-url"
              aria-label="Copy public question link"
            >
              {copiedUrl === publicQuestionUrl ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(publicQuestionUrl)}
              className="flex-shrink-0"
              data-testid="button-open-public-question-url"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl mb-2">{item.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Asked {format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                <span>•</span>
                <span>{item.viewCount || 0} views</span>
                <span>•</span>
                <span>{answers.length} answers</span>
              </div>
            </div>
            <Badge variant="default">Public</Badge>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Question</p>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{item.bodyMd}</p>
            </div>
          </div>

          {answers.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Answers ({answers.length})</p>
              <div className="space-y-4">
                {answers.map((answer) => (
                  <Card key={answer.id} className={answer.isAccepted ? "border-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">{answer.bodyMd}</p>
                      </div>
                      {answer.links && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-sm">Supporting Links:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {JSON.parse(answer.links).map((link: string, idx: number) => (
                              <li key={idx}>
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-2">
                        Answered {format(new Date(answer.createdAt), "MMM d, yyyy")}
                        {answer.isAccepted && (
                          <Badge variant="default" className="ml-2">Accepted</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}
