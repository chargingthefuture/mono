import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, VolumeX, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioListenerProps {
  roomId: string;
  signalingEndpoint: string;
}

export function AudioListener({ roomId, signalingEndpoint }: AudioListenerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    if (!roomId || !signalingEndpoint) return;

        const connect = async () => {
      try {
        // Parse WebSocket URL - for public rooms, no auth token needed
        const url = new URL(signalingEndpoint);
        const wsUrl = `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}${url.pathname}?roomId=${roomId}`;
        
        // For anonymous listeners in public rooms, connect without auth header
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
          toast({
            title: "Connected",
            description: "Listening to room audio",
          });
        };

        ws.onerror = (event) => {
          console.error("WebSocket error:", event);
          setError("Connection error. Please refresh the page.");
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Cleanup peer connections
          peerConnectionsRef.current.forEach((pc) => pc.close());
          peerConnectionsRef.current.clear();
          audioElementsRef.current.forEach((audio) => {
            audio.pause();
            audio.srcObject = null;
          });
          audioElementsRef.current.clear();
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Handle WebRTC signaling messages
            if (message.type === "offer") {
              await handleOffer(message);
            } else if (message.type === "answer") {
              await handleAnswer(message);
            } else if (message.type === "ice-candidate") {
              await handleIceCandidate(message);
            }
          } catch (err) {
            console.error("Error handling WebSocket message:", err);
          }
        };
      } catch (err) {
        console.error("Error connecting to signaling server:", err);
        setError("Failed to connect. Please refresh the page.");
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      audioElementsRef.current.forEach((audio) => {
        audio.pause();
        audio.srcObject = null;
      });
      audioElementsRef.current.clear();
    };
  }, [roomId, signalingEndpoint, toast]);

  const handleOffer = async (message: any) => {
    try {
      const fromUserId = message.fromUserId || message.from;
      if (!fromUserId) return;

      // Create peer connection for this speaker
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Handle incoming audio track
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          // Create or update audio element for this speaker
          let audio = audioElementsRef.current.get(fromUserId);
          if (!audio) {
            audio = new Audio();
            audio.autoplay = true;
            audioElementsRef.current.set(fromUserId, audio);
          }
          audio.srcObject = stream;
          audio.muted = isMuted;
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "ice-candidate",
            roomId,
            toUserId: fromUserId,
            candidate: {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
            },
          }));
        }
      };

      peerConnectionsRef.current.set(fromUserId, pc);

      // Set remote description and create answer
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: "offer",
        sdp: message.sdp,
      }));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "answer",
          roomId,
          toUserId: fromUserId,
          sdp: answer.sdp,
        }));
      }
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  };

  const handleAnswer = async (message: any) => {
    // Listeners don't send offers, so we shouldn't receive answers
    // But handle it gracefully if we do
    console.log("Received answer (unexpected for listener):", message);
  };

  const handleIceCandidate = async (message: any) => {
    try {
      const fromUserId = message.fromUserId || message.from;
      const pc = peerConnectionsRef.current.get(fromUserId);
      if (pc && message.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate({
          candidate: message.candidate.candidate,
          sdpMLineIndex: message.candidate.sdpMLineIndex,
          sdpMid: message.candidate.sdpMid,
        }));
      }
    } catch (err) {
      console.error("Error handling ICE candidate:", err);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    // Mute/unmute all audio elements
    audioElementsRef.current.forEach((audio) => {
      audio.muted = newMuted;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Live Audio Stream
        </CardTitle>
        <CardDescription>
          {isConnected ? "Connected and listening" : "Connecting..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Live" : "Connecting..."}
            </span>
          </div>
          
          <Button
            onClick={toggleMute}
            variant={isMuted ? "outline" : "default"}
            size="sm"
            disabled={!isConnected}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Unmute
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Mute
              </>
            )}
          </Button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-muted-foreground">
            Waiting for speakers to join the room...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

