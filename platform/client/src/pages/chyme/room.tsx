import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Lock, Globe, Mic, MicOff, LogOut, ArrowLeft } from "lucide-react";
import type { ChymeRoom, ChymeMessage, ChymeRoomParticipant, ChymeProfile } from "@shared/schema";
import { useRoute, Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { MiniAppBackButton } from "@/components/mini-app-back-button";
import { ChymeSurveyDialog } from "@/components/chyme-survey-dialog";
import { useChymeAudio } from "@/hooks/useChymeAudio";

export default function ChymeRoom() {
  const [, params] = useRoute("/apps/chyme/room/:id");
  const roomId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [clientId] = useState(() => {
    // Generate or retrieve client ID for anonymous survey
    const stored = localStorage.getItem('chyme-client-id');
    if (stored) return stored;
    const newId = `client_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('chyme-client-id', newId);
    return newId;
  });

  const { data: room, isLoading: roomLoading } = useQuery<ChymeRoom>({
    queryKey: ['/api/chyme/rooms', roomId],
    enabled: !!roomId,
  });

  const { data: profile } = useQuery<ChymeProfile | null>({
    queryKey: ["/api/chyme/profile"],
  });

  const { data: participants = [], refetch: refetchParticipants } = useQuery<ChymeRoomParticipant[]>({
    queryKey: ['/api/chyme/rooms', roomId, 'participants'],
    enabled: !!roomId && isJoined,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Calculate permissions based on room type:
  // Private Room: Must join to speak/chat/listen
  // Public Room: Can listen without join, but must join + be authenticated to speak/chat
  const canSpeak = isJoined && profile !== null; // Speaking requires joining and authentication for both room types
  const canChat = (room?.roomType === 'public' && user && isJoined) || (room?.roomType === 'private' && isJoined);
  const canListen = room?.roomType === 'public' || (room?.roomType === 'private' && isJoined); // Public rooms allow listening without join

  // WebRTC audio functionality
  const audio = useChymeAudio({
    roomId: roomId || '',
    userId: user?.id || '',
    enabled: canSpeak,
    onError: (error) => {
      toast({
        title: "Audio Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Allow viewing messages in public rooms without joining (listening mode)
  // Private rooms require joining to see messages
  const { data: messagesData, refetch: refetchMessages } = useQuery<{ messages: ChymeMessage[]; total: number }>({
    queryKey: ['/api/chyme/rooms', roomId, 'messages'],
    enabled: !!roomId && (room?.roomType === 'public' || isJoined),
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const messages = messagesData?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if user is already a participant
  useEffect(() => {
    if (roomId && participants.length > 0) {
      const isParticipant = participants.some(p => p.userId === user?.id && !p.leftAt);
      setIsJoined(isParticipant);
    }
  }, [participants, roomId, user?.id]);

  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/chyme/rooms/${roomId}/join`, {});
    },
    onSuccess: () => {
      setIsJoined(true);
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms', roomId, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms', roomId] });
      toast({
        title: "Joined room",
        description: "You've successfully joined the audio room.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join room",
        variant: "destructive",
      });
    },
  });

  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/chyme/rooms/${roomId}/leave`, {});
    },
    onSuccess: () => {
      setIsJoined(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms', roomId, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms', roomId] });
      toast({
        title: "Left room",
        description: "You've left the audio room.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to leave room",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', `/api/chyme/rooms/${roomId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms', roomId, 'messages'] });
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

  const handleJoin = async () => {
    if (!profile) {
      toast({
        title: "Profile required",
        description: "Please create a profile first.",
        variant: "destructive",
      });
      return;
    }

    // Request microphone permission proactively (before joining)
    // This ensures the browser prompts for permission immediately
    // The audio hook will get its own stream, so we stop this one after requesting permission
    let tempStream: MediaStream | null = null;
    try {
      tempStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      // Stop the temporary stream - the audio hook will get its own stream
      tempStream.getTracks().forEach(track => track.stop());
      // Permission granted, proceed with joining
      joinRoomMutation.mutate();
    } catch (error: any) {
      // Permission denied or error
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to join audio rooms. You can still join to listen, but speaking requires microphone permission.",
        variant: "destructive",
      });
      // Still allow joining (user can listen even without mic permission)
      joinRoomMutation.mutate();
    }
  };

  const handleLeave = () => {
    // Disconnect audio before leaving
    if (audio.isConnected) {
      audio.disconnect();
    }
    leaveRoomMutation.mutate();
  };

  const handleSendMessage = () => {
    if (newMessage.trim().length === 0) return;
    if (!canChat) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be signed in to send messages.",
          variant: "destructive",
        });
      } else if (!isJoined) {
        toast({
          title: "Join required",
          description: "You must join the room to send messages.",
          variant: "destructive",
        });
      }
      return;
    }
    sendMessageMutation.mutate(newMessage.trim());
  };

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Room not found</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MiniAppBackButton />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold">{room.name}</h1>
                <Badge variant={room.roomType === 'private' ? 'default' : 'secondary'}>
                  {room.roomType === 'private' ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </>
                  )}
                </Badge>
              </div>
              {room.description && (
                <p className="text-muted-foreground">{room.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.currentParticipants} / {room.maxParticipants || '∞'} participants
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isJoined ? (
              <>
                {room.roomType === 'public' && !user && (
                  <Button
                    variant="outline"
                    disabled
                    data-testid="button-sign-in-required"
                  >
                    Sign in to participate
                  </Button>
                )}
                {user && (
                  <Button
                    onClick={handleJoin}
                    disabled={joinRoomMutation.isPending || !profile}
                    data-testid="button-join-room"
                  >
                    Join Room
                  </Button>
                )}
              </>
            ) : (
              <>
                {canSpeak && (
                  <Button
                    variant={audio.isMuted ? "outline" : "default"}
                    onClick={audio.toggleMute}
                    data-testid="button-toggle-mute"
                  >
                    {audio.isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {audio.isMuted ? "Unmute" : "Mute"}
                    {audio.isSpeaking && !audio.isMuted && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleLeave}
                  disabled={leaveRoomMutation.isPending}
                  data-testid="button-leave-room"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden audio elements for remote streams */}
      {isJoined && Array.from(audio.remoteStreams.entries()).map(([userId, stream]) => (
        <audio
          key={userId}
          ref={(el) => {
            if (el && stream) {
              el.srcObject = stream;
              el.play().catch(() => {
                // Auto-play may be blocked, user will need to interact
              });
            }
          }}
          autoPlay
          playsInline
        />
      ))}

      <div className="flex-1 flex overflow-hidden">
        {/* Participants sidebar */}
        {isJoined && (
          <div className="w-64 border-r bg-muted/50 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Participants ({participants.length})</h3>
            <div className="space-y-2">
              {participants.map((participant) => {
                const isRemoteParticipant = participant.userId !== user?.id;
                const hasRemoteAudio = isRemoteParticipant && audio.remoteStreams.has(participant.userId);
                
                return (
                  <div key={participant.id} className="flex items-center gap-2 text-sm">
                    <div className="flex-1">
                      <div className="font-medium">
                        {participant.userId === user?.id ? "You" : "Anonymous"}
                      </div>
                      {participant.isSpeaking && (
                        <Badge variant="outline" className="text-xs mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Speaking
                        </Badge>
                      )}
                      {hasRemoteAudio && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Audio Connected
                        </Badge>
                      )}
                    </div>
                    {participant.isMuted && (
                      <MicOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.userId === user?.id;
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

          {/* Message input */}
          {canChat && (
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
                  data-testid="button-send-message"
                >
                  Send
                </Button>
              </div>
            </div>
          )}

          {!canChat && canListen && (
            <div className="p-6 border-t bg-background text-center text-muted-foreground">
              {!user ? (
                "Sign in and join to send messages"
              ) : !isJoined ? (
                "Join the room to send messages"
              ) : (
                "Unable to send messages"
              )}
            </div>
          )}

          {!canChat && !canListen && (
            <div className="p-6 border-t bg-background text-center text-muted-foreground">
              Join the room to send messages
            </div>
          )}
        </div>
      </div>

      {/* Survey dialog - shown after leaving room */}
      <ChymeSurveyDialog roomId={roomId || undefined} clientId={clientId} />
    </div>
  );
}
