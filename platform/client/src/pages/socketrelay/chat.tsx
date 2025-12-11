import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Send, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SocketrelayMessage, SocketrelayRequest, SocketrelayFulfillment } from "@shared/schema";
import { useRoute } from "wouter";

export default function SocketRelayChat() {
  const [, params] = useRoute("/apps/socketrelay/chat/:id");
  const fulfillmentId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeStatus, setCloseStatus] = useState<string>("completed_success");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: fulfillmentData, isLoading: fulfillmentLoading } = useQuery<{
    fulfillment: SocketrelayFulfillment;
    request: SocketrelayRequest;
  }>({
    queryKey: ['/api/socketrelay/fulfillments', fulfillmentId],
    enabled: !!fulfillmentId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<SocketrelayMessage[]>({
    queryKey: ['/api/socketrelay/fulfillments', fulfillmentId, 'messages'],
    enabled: !!fulfillmentId,
  });

  useEffect(() => {
    if (!fulfillmentId) return;
    
    const interval = setInterval(() => {
      refetchMessages();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [fulfillmentId, refetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', `/api/socketrelay/fulfillments/${fulfillmentId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/socketrelay/fulfillments', fulfillmentId, 'messages'] });
      setNewMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const closeFulfillmentMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest('POST', `/api/socketrelay/fulfillments/${fulfillmentId}/close`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/socketrelay/fulfillments', fulfillmentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/socketrelay/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/socketrelay/my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/socketrelay/my-fulfillments'] });
      setShowCloseDialog(false);
      toast({
        title: "Request closed",
        description: "This fulfillment has been closed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close request",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim().length === 0) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleCloseRequest = () => {
    closeFulfillmentMutation.mutate(closeStatus);
  };

  if (fulfillmentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!fulfillmentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Fulfillment not found</p>
      </div>
    );
  }

  const { fulfillment, request } = fulfillmentData;
  const isRequester = request.userId === user?.id;
  const isFulfiller = fulfillment.fulfillerUserId === user?.id;
  const isClosed = fulfillment.status !== 'active';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">Request Chat</h1>
              <Badge variant={isClosed ? "secondary" : "default"}>
                {fulfillment.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">{request.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {isRequester ? "You" : "Requester"} | {isFulfiller ? "You" : "Fulfiller"}
              </span>
              <span>Started {formatDistanceToNow(new Date(fulfillment.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          {!isClosed && (
            <Button
              variant="destructive"
              onClick={() => setShowCloseDialog(true)}
              data-testid="button-close-request"
            >
              Close Request
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message: SocketrelayMessage) => {
            const isOwnMessage = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.id}`}
              >
                <Card className={`max-w-[70%] ${isOwnMessage ? "bg-primary text-primary-foreground" : ""}`}>
                  <CardContent className="p-4">
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-2 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isClosed && (
        <div className="p-6 border-t bg-background">
          <div className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || newMessage.trim().length === 0}
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent data-testid="dialog-close-request">
          <DialogHeader>
            <DialogTitle>Close Request</DialogTitle>
            <DialogDescription>
              How did this fulfillment go? Your feedback helps improve the community.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={closeStatus} onValueChange={setCloseStatus}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed_success" id="success" data-testid="radio-success" />
              <Label htmlFor="success" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">Successfully Completed</p>
                  <p className="text-sm text-muted-foreground">The request was fulfilled successfully</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed_failure" id="failure" data-testid="radio-failure" />
              <Label htmlFor="failure" className="flex items-center gap-2 cursor-pointer">
                <XCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium">Not Completed</p>
                  <p className="text-sm text-muted-foreground">The request could not be fulfilled</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cancelled" id="cancelled" data-testid="radio-cancelled" />
              <Label htmlFor="cancelled" className="flex items-center gap-2 cursor-pointer">
                <XCircle className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium">Cancelled</p>
                  <p className="text-sm text-muted-foreground">The request was cancelled</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)} data-testid="button-cancel-close">
              Cancel
            </Button>
            <Button
              onClick={handleCloseRequest}
              disabled={closeFulfillmentMutation.isPending}
              data-testid="button-confirm-close"
            >
              {closeFulfillmentMutation.isPending ? "Closing..." : "Close Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
