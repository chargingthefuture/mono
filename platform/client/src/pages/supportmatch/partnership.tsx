import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Partnership, Message } from "@shared/schema";
import { format } from "date-fns";
import { Send, Calendar, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function SupportMatchPartnership() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: partnership } = useQuery<Partnership & { partnerNickname?: string } | null>({
    queryKey: ["/api/supportmatch/partnership/active"],
  });

  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/supportmatch/messages", partnership?.id],
    enabled: !!partnership,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/supportmatch/messages", {
        partnershipId: partnership?.id,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supportmatch/messages", partnership?.id] });
      setMessageText("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (partnership) {
      const interval = setInterval(() => {
        refetchMessages();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [partnership, refetchMessages]);

  if (!partnership) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Active Partnership</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            You don't have an active partnership at the moment.
          </p>
        </div>
      </div>
    );
  }

  const getPartnerUserId = () => {
    return partnership.user1Id === user?.id ? partnership.user2Id : partnership.user1Id;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Active Partnership</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Connect with your accountability partner
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[300px] sm:h-[400px] overflow-y-auto border rounded-md p-3 sm:p-4 space-y-3">
                {messages && messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-xs sm:text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="input-message"
                  className="text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                  size="sm"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Partnership Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Partner</span>
                </div>
                <p className="font-medium text-sm sm:text-base">
                  {partnership.partnerNickname || "Unknown Partner"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Duration</span>
                </div>
                <p className="font-medium text-sm sm:text-base">
                  {format(new Date(partnership.startDate), "MMM d")} -{" "}
                  {partnership.endDate ? format(new Date(partnership.endDate), "MMM d, yyyy") : "Ongoing"}
                </p>
                {partnership.endDate && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    (30-day partnership)
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <span>Status</span>
                </div>
                <Badge variant="default" className="text-xs">
                  {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
