/**
 * SocketRelay Storage Interface
 * 
 * Defines SocketRelay mini-app storage operations.
 */

import type {
  SocketrelayRequest,
  InsertSocketrelayRequest,
  SocketrelayFulfillment,
  InsertSocketrelayFulfillment,
  SocketrelayMessage,
  InsertSocketrelayMessage,
  SocketrelayProfile,
  InsertSocketrelayProfile,
  SocketrelayAnnouncement,
  InsertSocketrelayAnnouncement,
} from "@shared/schema";

export interface ISocketRelayStorage {
  // Request operations
  createSocketrelayRequest(userId: string, description: string, isPublic?: boolean): Promise<SocketrelayRequest>;
  getActiveSocketrelayRequests(): Promise<any[]>;
  getAllSocketrelayRequests(): Promise<any[]>;
  getSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined>;
  getSocketrelayRequestsByUser(userId: string): Promise<SocketrelayRequest[]>;
  getPublicSocketrelayRequestById(id: string): Promise<SocketrelayRequest | undefined>;
  listPublicSocketrelayRequests(): Promise<SocketrelayRequest[]>;
  updateSocketrelayRequest(id: string, userId: string, description: string, isPublic?: boolean): Promise<SocketrelayRequest>;
  updateSocketrelayRequestStatus(id: string, status: string): Promise<SocketrelayRequest>;
  repostSocketrelayRequest(id: string, userId: string): Promise<SocketrelayRequest>;
  deleteSocketrelayRequest(id: string): Promise<void>;

  // Fulfillment operations
  createSocketrelayFulfillment(requestId: string, fulfillerUserId: string): Promise<SocketrelayFulfillment>;
  getSocketrelayFulfillmentById(id: string): Promise<SocketrelayFulfillment | undefined>;
  getSocketrelayFulfillmentsByRequest(requestId: string): Promise<SocketrelayFulfillment[]>;
  getSocketrelayFulfillmentsByUser(userId: string): Promise<any[]>;
  getAllSocketrelayFulfillments(): Promise<any[]>;
  closeSocketrelayFulfillment(id: string, userId: string, status: string): Promise<SocketrelayFulfillment>;

  // Message operations
  createSocketrelayMessage(message: InsertSocketrelayMessage): Promise<SocketrelayMessage>;
  getSocketrelayMessagesByFulfillment(fulfillmentId: string): Promise<SocketrelayMessage[]>;

  // Profile operations
  getSocketrelayProfile(userId: string): Promise<SocketrelayProfile | undefined>;
  createSocketrelayProfile(profile: InsertSocketrelayProfile): Promise<SocketrelayProfile>;
  updateSocketrelayProfile(userId: string, profile: Partial<InsertSocketrelayProfile>): Promise<SocketrelayProfile>;

  // Announcement operations
  createSocketrelayAnnouncement(announcement: InsertSocketrelayAnnouncement): Promise<SocketrelayAnnouncement>;
  getActiveSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]>;
  getAllSocketrelayAnnouncements(): Promise<SocketrelayAnnouncement[]>;
  updateSocketrelayAnnouncement(id: string, announcement: Partial<InsertSocketrelayAnnouncement>): Promise<SocketrelayAnnouncement>;
  deactivateSocketrelayAnnouncement(id: string): Promise<SocketrelayAnnouncement>;
  
  // Profile deletion
  deleteSocketrelayProfile(userId: string, reason?: string): Promise<void>;
}


