import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";
import { log } from "./vite";
import { storage } from "./storage";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { verifyToken } from "@clerk/backend";

type Client = {
  socket: WebSocket;
  userId: string;
  roomId: string;
  role: "creator" | "speaker" | "listener";
  lastMessageTime: number;
  messageCount: number;
};

// Rate limiting: max messages per window
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const RATE_LIMIT_MAX_MESSAGES = 50; // Max 50 messages per 10 seconds

// Message types that require speaker/creator role
const MEDIA_MESSAGE_TYPES = ["offer", "answer", "ice-candidate", "media-offer", "media-answer"];

/**
 * Authenticate WebSocket connection using Clerk session or OTP token
 */
async function authenticateWebSocket(req: any): Promise<{ userId: string; isOTPAuth: boolean } | null> {
  try {
    // Try OTP token from Authorization header first (for Android app)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const authToken = await storage.findAuthTokenByToken(token);
      
      if (authToken) {
        const now = Date.now();
        const expiresAt = authToken.expiresAt.getTime();
        
        if (expiresAt > now) {
          return { userId: authToken.userId, isOTPAuth: true };
        } else {
          // Token expired
          await storage.deleteAuthToken(token);
        }
      }
    }
    
    // Try Clerk session from cookies
    const cookies = req.headers.cookie || "";
    // Clerk uses __session cookie for session tokens
    const sessionTokenMatch = cookies.match(/__session=([^;]+)/);
    
    if (sessionTokenMatch) {
      const sessionToken = decodeURIComponent(sessionTokenMatch[1]);
      try {
        // First try to verify as JWT token
        try {
          const { userId } = await verifyToken(sessionToken, {
            secretKey: process.env.CLERK_SECRET_KEY!,
          });
          
          if (userId) {
            return { userId, isOTPAuth: false };
          }
        } catch (jwtError) {
          // If verifyToken fails, try to get session by ID
          // Clerk session cookies might be session IDs, not JWTs
          try {
            const session = await clerkClient.sessions.getSession(sessionToken);
            if (session && session.userId) {
              return { userId: session.userId, isOTPAuth: false };
            }
          } catch (sessionError) {
            // Both methods failed
            log(`WebSocket Clerk authentication failed (JWT and session lookup): ${sessionError}`);
          }
        }
      } catch (error) {
        // General error handling
        log(`WebSocket Clerk session verification failed: ${error}`);
      }
    }
    
    return null;
  } catch (error) {
    log(`WebSocket authentication error: ${error}`);
    return null;
  }
}

/**
 * Check if user is authorized to send a specific message type
 */
function isAuthorizedForMessageType(client: Client, messageType: string): boolean {
  // Media-related messages require speaker or creator role
  if (MEDIA_MESSAGE_TYPES.includes(messageType)) {
    return client.role === "speaker" || client.role === "creator";
  }
  
  // Other message types (like chat, hand-raise, etc.) can be sent by anyone
  return true;
}

/**
 * Check rate limiting for a client
 */
function checkRateLimit(client: Client): boolean {
  const now = Date.now();
  
  // Reset counter if window expired
  if (now - client.lastMessageTime > RATE_LIMIT_WINDOW_MS) {
    client.messageCount = 0;
    client.lastMessageTime = now;
  }
  
  // Check if limit exceeded
  if (client.messageCount >= RATE_LIMIT_MAX_MESSAGES) {
    return false;
  }
  
  client.messageCount++;
  return true;
}

/**
 * Secure WebSocket signaling hub for Chyme WebRTC rooms.
 *
 * Features:
 * - Authenticated connections (Clerk or OTP tokens)
 * - Authorization checks (only speakers/creators can send media offers)
 * - Rate limiting per user
 * - Room membership validation
 * - Per-recipient routing support
 */
export function attachChymeSignaling(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/api/chyme/signaling",
  });

  const clients = new Set<Client>();

  wss.on("connection", async (socket, req) => {
    const parsed = parse(req.url || "", true);
    const roomId = (parsed.query.roomId as string | undefined) || null;

    if (!roomId) {
      socket.close(1008, "Missing roomId");
      return;
    }

    // Authenticate the connection
    const auth = await authenticateWebSocket(req);
    if (!auth) {
      socket.close(1008, "Authentication required");
      return;
    }

    const { userId } = auth;

    // Verify user is a participant in the room and get their role
    let participant;
    try {
      participant = await storage.getChymeRoomParticipant(roomId, userId);
      if (!participant || participant.leftAt) {
        socket.close(1008, "Not a participant in this room");
        return;
      }
    } catch (error) {
      log(`Error checking room participation: ${error}`);
      socket.close(1011, "Internal server error");
      return;
    }

    const client: Client = {
      socket,
      userId,
      roomId,
      role: participant.role as "creator" | "speaker" | "listener",
      lastMessageTime: Date.now(),
      messageCount: 0,
    };

    clients.add(client);
    log(`Chyme signaling: client connected userId=${userId} roomId=${roomId} role=${client.role}`);

    socket.on("message", (data) => {
      const text = data.toString();
      let payload: any;
      try {
        payload = JSON.parse(text);
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      // Validate payload
      if (!payload || payload.roomId !== roomId) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid roomId" }));
        return;
      }

      // Check rate limiting
      if (!checkRateLimit(client)) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Rate limit exceeded. Please slow down.",
        }));
        return;
      }

      // Check authorization for message type
      const messageType = payload.type || "";
      if (!isAuthorizedForMessageType(client, messageType)) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Unauthorized: Only speakers and creators can send media offers",
        }));
        return;
      }

      // Add sender info to payload for recipient identification
      const enrichedPayload = {
        ...payload,
        fromUserId: userId,
        fromRole: client.role,
      };

      const enrichedText = JSON.stringify(enrichedPayload);

      // Broadcast to all other clients in the same room
      // Future: Could add per-recipient routing here based on payload.toUserId
      let sentCount = 0;
      for (const other of clients) {
        if (other === client) continue;
        if (other.roomId !== roomId) continue;
        if (other.socket.readyState === WebSocket.OPEN) {
          // If payload specifies a recipient, only send to that user
          if (payload.toUserId && payload.toUserId !== other.userId) {
            continue;
          }
          
          other.socket.send(enrichedText);
          sentCount++;
        }
      }

      log(`Chyme signaling: message type=${messageType} from=${userId} to=${sentCount} recipients`);
    });

    socket.on("close", () => {
      clients.delete(client);
      log(`Chyme signaling: client disconnected userId=${userId} roomId=${roomId}`);
    });

    socket.on("error", (error) => {
      log(`Chyme signaling: socket error userId=${userId} roomId=${roomId} error=${error}`);
    });
  });
}


