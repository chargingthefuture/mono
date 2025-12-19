import { storage } from "./storage";
import type { InsertAdminActionLog } from "@shared/schema";
import { getUserId } from "./auth";

/**
 * Helper function to log admin actions
 * 
 * @param req - Express request object (must have userId from isAuthenticated middleware)
 * @param action - Action name (e.g., "verify_user", "create_payment", "update_pricing_tier")
 * @param resourceType - Type of resource being acted upon (e.g., "user", "payment", "pricing_tier")
 * @param resourceId - ID of the resource being acted upon (optional)
 * @param details - Additional details about the action (optional)
 */
export async function logAdminAction(
  req: any,
  action: string,
  resourceType: string,
  resourceId?: string | null,
  details?: Record<string, any> | null
): Promise<void> {
  try {
    const adminId = getUserId(req);
    
    const logData: InsertAdminActionLog = {
      adminId,
      action,
      resourceType,
      resourceId: resourceId || null,
      details: details || null,
    };
    
    await storage.createAdminActionLog(logData);
  } catch (error: any) {
    // Log error but don't throw - admin action logging should not break the main operation
    console.error("Failed to log admin action:", {
      action,
      resourceType,
      resourceId,
      error: error?.message || String(error),
    });
  }
}

