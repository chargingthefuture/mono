import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";
import { log } from "./vite";

type Client = {
  socket: WebSocket;
  userId: string;
  roomId: string;
};

/**
 * Minimal WebSocket signaling hub for Chyme WebRTC rooms.
 *
 * - One shared WebSocketServer on the main HTTP server
 * - Clients connect with ?roomId=... (and will later be tied to auth)
 * - Messages are JSON and must include { roomId, type, ... }
 * - For now we simply broadcast to all other clients in the same room
 */
export function attachChymeSignaling(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/api/chyme/signaling",
  });

  const clients = new Set<Client>();

  wss.on("connection", (socket, req) => {
    const parsed = parse(req.url || "", true);
    const roomId = (parsed.query.roomId as string | undefined) || null;

    // TODO: Derive userId from Clerk / auth middleware instead of a query param.
    const userId = (parsed.query.userId as string | undefined) || "unknown";

    if (!roomId) {
      socket.close(1008, "Missing roomId");
      return;
    }

    const client: Client = { socket, userId, roomId };
    clients.add(client);
    log(`Chyme signaling: client connected userId=${userId} roomId=${roomId}`);

    socket.on("message", (data) => {
      const text = data.toString();
      let payload: any;
      try {
        payload = JSON.parse(text);
      } catch {
        return;
      }

      if (!payload || payload.roomId !== roomId) return;

      // For now: simple broadcast to all other clients in the same room.
      for (const other of clients) {
        if (other === client) continue;
        if (other.roomId !== roomId) continue;
        if (other.socket.readyState === WebSocket.OPEN) {
          other.socket.send(text);
        }
      }
    });

    socket.on("close", () => {
      clients.delete(client);
      log(`Chyme signaling: client disconnected userId=${userId} roomId=${roomId}`);
    });
  });
}


