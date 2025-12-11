import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, ArrowUp, ArrowDown, Bookmark, Share2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ResearchItem, ResearchAnswer, ResearchComment } from "@shared/schema";
import ResearchAnswerComposer from "./answer-composer";

export default function ResearchItemView() {
  const [, params] = useRoute("/apps/research/item/:id");
  const itemId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState("relevance");

  const { data: item, isLoading: itemLoading } = useQuery<ResearchItem>({
    queryKey: [`/api/research/items/${itemId}`],
    enabled: !!itemId,
  });

  const { data: answers = [], isLoading: answersLoading } = useQuery<ResearchAnswer[]>({
    queryKey: [`/api/research/items/${itemId}/answers?sortBy=${sortBy}`],
    enabled: !!itemId,
  });
  
  const answerCount = answers.length;

  const { data: comments = [] } = useQuery<ResearchComment[]>({
    queryKey: [`/api/research/comments?researchItemId=${itemId}`],
    enabled: !!itemId,
  });

  const { data: userVote } = useQuery({
    queryKey: [`/api/research/votes?researchItemId=${itemId}`],
    enabled: !!itemId && !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ value, answerId }: { value: 1 | -1; answerId?: string }) => {
      return apiRequest("POST", "/api/research/votes", {
        researchItemId: answerId ? undefined : itemId,
        answerId: answerId,
        value,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/research/items/${itemId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/research/items/${itemId}/answers`] });
      if (variables.answerId) {
        queryClient.invalidateQueries({ queryKey: [`/api/research/votes?answerId=${variables.answerId}`] });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/research/votes?researchItemId=${itemId}`] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/research/bookmarks", {
        researchItemId: itemId,
      });
    },
    onSuccess: () => {
      toast({ title: "Bookmarked", description: "Research item bookmarked" });
      queryClient.invalidateQueries({ queryKey: ["/api/research/bookmarks"] });
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId: string) => {
      return apiRequest("POST", `/api/research/items/${itemId}/accept-answer/${answerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/research/items/${itemId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/research/items/${itemId}/answers`] });
      toast({ title: "Answer Accepted", description: "This answer is now marked as accepted" });
    },
  });

  if (itemLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Research item not found</p>
          <Link href="/apps/research">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timeline
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tags = item.tags ? JSON.parse(item.tags) : [];
  const isOwner = user && item.userId === user.id;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/apps/research">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => bookmarkMutation.mutate()}
            data-testid="button-bookmark"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmark
          </Button>
          <Button variant="outline" size="sm" data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <Badge variant={item.status === "answered" ? "default" : "secondary"}>
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Asked {format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                <span>•</span>
                <span>{item.viewCount || 0} views</span>
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
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{item.bodyMd}</p>
              </div>
            </CardContent>
          </Card>

          {/* Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{answers.length} Answers</h2>
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {answersLoading ? (
              <p className="text-muted-foreground">Loading answers...</p>
            ) : answers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No answers yet</p>
                  {user && <ResearchAnswerComposer researchItemId={itemId!} />}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <Card key={answer.id} className={answer.isAccepted ? "border-primary" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => voteMutation.mutate({ value: 1, answerId: answer.id })}
                            data-testid={`button-upvote-${answer.id}`}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </Button>
                          <span className="font-semibold">{answer.score || 0}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => voteMutation.mutate({ value: -1, answerId: answer.id })}
                            data-testid={`button-downvote-${answer.id}`}
                          >
                            <ArrowDown className="w-5 h-5" />
                          </Button>
                          {answer.isAccepted && (
                            <Check className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="prose max-w-none">
                            <p className="whitespace-pre-wrap">{answer.bodyMd}</p>
                          </div>
                          {answer.links && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Supporting Links:</h4>
                              <ul className="list-disc list-inside space-y-1">
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
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                              Answered {format(new Date(answer.createdAt), "MMM d, yyyy")}
                            </div>
                            {isOwner && !answer.isAccepted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acceptAnswerMutation.mutate(answer.id)}
                                data-testid={`button-accept-${answer.id}`}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept Answer
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResearchAnswerComposer researchItemId={itemId!} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}
