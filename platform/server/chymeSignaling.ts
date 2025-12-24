import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";
import { log } from "./vite";
import { storage } from "./storage";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { verifyToken } from "@clerk/backend";
import { validateOTPToken } from "./auth";
import { requireAuth } from "@clerk/express";

type Client = {
  socket: WebSocket;
  userId: string;
  roomId: string;
  role: "creator" | "speaker" | "listener";
  lastMessageTime: number;
  messageCount: number;
  ipAddress: string;
  connectedAt: number;
};

// Connection-level rate limiting
const MAX_CONNECTIONS_PER_IP = 10; // Max 10 concurrent connections per IP
const MAX_CONNECTIONS_PER_USER = 5; // Max 5 concurrent connections per user
const CONNECTION_RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_CONNECTIONS_PER_IP_PER_WINDOW = 20; // Max 20 connection attempts per IP per minute

// Message-level rate limiting: max messages per window
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const RATE_LIMIT_MAX_MESSAGES = 50; // Max 50 messages per 10 seconds (general)
const RATE_LIMIT_MAX_CHAT_MESSAGES = 10; // Max 10 chat messages per 10 seconds
const RATE_LIMIT_MAX_ICE_MESSAGES = 30; // Max 30 ICE candidates per 10 seconds

// Message types that require speaker/creator role
const MEDIA_MESSAGE_TYPES = ["offer", "answer", "ice-candidate", "media-offer", "media-answer"];
const CHAT_MESSAGE_TYPE = "chat-message";
const ICE_MESSAGE_TYPE = "ice-candidate";

// Track connections and connection attempts for abuse detection
const connectionAttempts = new Map<string, { count: number; resetTime: number }>();
const connectionsByIp = new Map<string, Set<Client>>();
const connectionsByUser = new Map<string, Set<Client>>();

/**
 * Get IP address from request (handles proxies/load balancers)
 */
function getIpAddress(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

/**
 * Check connection-level rate limiting (prevent connection abuse)
 */
function checkConnectionRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const attempts = connectionAttempts.get(ipAddress);
  
  if (attempts) {
    // Reset if window expired
    if (now > attempts.resetTime) {
      connectionAttempts.set(ipAddress, { count: 1, resetTime: now + CONNECTION_RATE_LIMIT_WINDOW_MS });
      return true;
    }
    
    // Check if limit exceeded
    if (attempts.count >= MAX_CONNECTIONS_PER_IP_PER_WINDOW) {
      return false;
    }
    
    attempts.count++;
  } else {
    connectionAttempts.set(ipAddress, { count: 1, resetTime: now + CONNECTION_RATE_LIMIT_WINDOW_MS });
  }
  
  return true;
}

/**
 * Authenticate WebSocket connection using the same pattern as REST routes
 * (validateOTPToken + Clerk requireAuth)
 */
async function authenticateWebSocket(req: any): Promise<{ userId: string; isOTPAuth: boolean } | null> {
  try {
    // Create a mock request/response object for validateOTPToken
    const mockReq: any = {
      headers: req.headers,
      auth: null,
      otpAuth: false,
    };
    
    const mockRes: any = {
      status: () => mockRes,
      json: () => mockRes,
    };
    
    let authResolved = false;
    let authResult: { userId: string; isOTPAuth: boolean } | null = null;
    
    // Try OTP token validation first (same as REST routes)
    await new Promise<void>((resolve) => {
      validateOTPToken(mockReq, mockRes, () => {
        if (mockReq.otpAuth && mockReq.auth?.userId) {
          authResult = { userId: mockReq.auth.userId, isOTPAuth: true };
          authResolved = true;
        }
        resolve();
      });
    });
    
    if (authResolved && authResult) {
      return authResult;
    }
    
    // If OTP auth didn't work, try Clerk authentication
    // For WebSocket, we need to manually verify the session token
    const cookies = req.headers.cookie || "";
    const sessionTokenMatch = cookies.match(/__session=([^;]+)/);
    
    if (sessionTokenMatch) {
      const sessionToken = decodeURIComponent(sessionTokenMatch[1]);
      try {
        // Try to verify as JWT token first
        try {
          const result = await verifyToken(sessionToken, {
            secretKey: process.env.CLERK_SECRET_KEY!,
          });
          
          if (result && result.userId && typeof result.userId === 'string') {
            return { userId: result.userId, isOTPAuth: false };
          }
        } catch (jwtError) {
          // If verifyToken fails, try to get session by ID
          try {
            const session = await clerkClient.sessions.getSession(sessionToken);
            if (session && session.userId) {
              return { userId: session.userId, isOTPAuth: false };
            }
          } catch (sessionError) {
            log(`WebSocket Clerk authentication failed: ${sessionError}`);
          }
        }
      } catch (error) {
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
 * Check rate limiting for a client (message-type-specific)
 */
function checkRateLimit(client: Client, messageType: string): boolean {
  const now = Date.now();
  
  // Reset counter if window expired
  if (now - client.lastMessageTime > RATE_LIMIT_WINDOW_MS) {
    client.messageCount = 0;
    client.lastMessageTime = now;
  }
  
  // Different limits for different message types
  let maxMessages: number;
  if (messageType === CHAT_MESSAGE_TYPE) {
    maxMessages = RATE_LIMIT_MAX_CHAT_MESSAGES;
  } else if (messageType === ICE_MESSAGE_TYPE) {
    maxMessages = RATE_LIMIT_MAX_ICE_MESSAGES;
  } else {
    maxMessages = RATE_LIMIT_MAX_MESSAGES;
  }
  
  // Check if limit exceeded
  if (client.messageCount >= maxMessages) {
    return false;
  }
  
  client.messageCount++;
  return true;
}

/**
 * Track suspicious patterns for abuse detection
 */
function trackSuspiciousActivity(userId: string, ipAddress: string, reason: string) {
  log(`[SECURITY] Suspicious activity detected: userId=${userId} ip=${ipAddress} reason=${reason}`);
  // In production, this could send to monitoring/alerting system
}

/**
 * Clean up connection tracking when client disconnects
 */
function removeConnectionTracking(client: Client) {
  // Remove from IP tracking
  const ipConnections = connectionsByIp.get(client.ipAddress);
  if (ipConnections) {
    ipConnections.delete(client);
    if (ipConnections.size === 0) {
      connectionsByIp.delete(client.ipAddress);
    }
  }
  
  // Remove from user tracking
  const userConnections = connectionsByUser.get(client.userId);
  if (userConnections) {
    userConnections.delete(client);
    if (userConnections.size === 0) {
      connectionsByUser.delete(client.userId);
    }
  }
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
    const ipAddress = getIpAddress(req);
    const parsed = parse(req.url || "", true);
    const roomId = (parsed.query.roomId as string | undefined) || null;

    // Check connection-level rate limiting (prevent connection spam)
    if (!checkConnectionRateLimit(ipAddress)) {
      log(`[SECURITY] Connection rate limit exceeded for IP: ${ipAddress}`);
      socket.close(1008, "Too many connection attempts. Please try again later.");
      return;
    }

    if (!roomId) {
      socket.close(1008, "Missing roomId");
      return;
    }

    // Check if room is public - allow unauthenticated listeners for public rooms
    let room;
    try {
      room = await storage.getChymeRoom(roomId);
    } catch (error) {
      log(`[ERROR] Failed to fetch room: ${error}`);
      socket.close(1008, "Room not found");
      return;
    }

    if (!room || !room.isActive) {
      socket.close(1008, "Room not found or inactive");
      return;
    }

    // Authenticate the connection using same pattern as REST routes
    const auth = await authenticateWebSocket(req);
    
    // For public rooms, allow unauthenticated listeners (read-only)
    // For private rooms, require authentication
    if (room.roomType === "private" && !auth) {
      log(`[SECURITY] WebSocket authentication failed for private room: ip=${ipAddress} roomId=${roomId}`);
      socket.close(1008, "Authentication required for private rooms");
      return;
    }

    // For unauthenticated listeners in public rooms, use a special "anonymous" userId
    const userId = auth?.userId || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // For anonymous listeners in public rooms, skip participant check
    // They can only receive audio, not send offers
    let participant;
    const isAnonymous = !auth;
    
    if (isAnonymous) {
      // Anonymous listeners have a special "listener" role with limited permissions
      participant = null; // No database participant record for anonymous users
    } else {
      // Verify authenticated user is a participant in the room and get their role
      // This enforces room membership before accepting connection
      try {
        participant = await storage.getChymeRoomParticipant(roomId, userId);
        if (!participant || participant.leftAt) {
          log(`[SECURITY] WebSocket connection rejected - not a participant: userId=${userId} roomId=${roomId}`);
          socket.close(1008, "Not a participant in this room");
          return;
        }
      } catch (error) {
        log(`Error checking room participation: ${error}`);
        socket.close(1011, "Internal server error");
        return;
      }
    }

    // Check connection limits per IP
    const ipConnections = connectionsByIp.get(ipAddress) || new Set<Client>();
    if (ipConnections.size >= MAX_CONNECTIONS_PER_IP) {
      trackSuspiciousActivity(userId, ipAddress, `Too many connections from IP: ${ipConnections.size}`);
      socket.close(1008, "Too many concurrent connections from this IP");
      return;
    }

    // Check connection limits per user
    const userConnections = connectionsByUser.get(userId) || new Set<Client>();
    if (userConnections.size >= MAX_CONNECTIONS_PER_USER) {
      trackSuspiciousActivity(userId, ipAddress, `Too many connections from user: ${userConnections.size}`);
      socket.close(1008, "Too many concurrent connections");
      return;
    }

    const client: Client = {
      socket,
      userId,
      roomId,
      role: isAnonymous ? "listener" : (participant.role as "creator" | "speaker" | "listener"),
      lastMessageTime: Date.now(),
      messageCount: 0,
      ipAddress,
      connectedAt: Date.now(),
    };

    clients.add(client);
    ipConnections.add(client);
    userConnections.add(client);
    connectionsByIp.set(ipAddress, ipConnections);
    connectionsByUser.set(userId, userConnections);
    
    log(`Chyme signaling: client connected userId=${userId} roomId=${roomId} role=${client.role} ip=${ipAddress}`);

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

      // Check rate limiting (message-type-specific)
      const messageType = payload.type || "";
      if (!checkRateLimit(client, messageType)) {
        trackSuspiciousActivity(userId, client.ipAddress, `Rate limit exceeded: type=${messageType} count=${client.messageCount}`);
        socket.send(JSON.stringify({
          type: "error",
          message: `Rate limit exceeded for ${messageType}. Please slow down.`,
        }));
        return;
      }

      // Check authorization for message type
      if (!isAuthorizedForMessageType(client, messageType)) {
        trackSuspiciousActivity(userId, client.ipAddress, `Unauthorized message type: ${messageType} role=${client.role}`);
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
      removeConnectionTracking(client);
      log(`Chyme signaling: client disconnected userId=${userId} roomId=${roomId}`);
    });

    socket.on("error", (error) => {
      log(`Chyme signaling: socket error userId=${userId} roomId=${roomId} error=${error}`);
      trackSuspiciousActivity(userId, client.ipAddress, `Socket error: ${error}`);
    });
  });
}


