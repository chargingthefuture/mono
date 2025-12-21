/**
 * Admin Storage Module
 * 
 * Handles admin action log operations and admin statistics.
 */

import {
  adminActionLogs,
  users,
  type AdminActionLog,
  type InsertAdminActionLog,
} from "@shared/schema";
import { db } from "../../../db";
import { eq, desc } from "drizzle-orm";

export class AdminStorage {
  async createAdminActionLog(logData: InsertAdminActionLog): Promise<AdminActionLog> {
    const [log] = await db
      .insert(adminActionLogs)
      .values(logData)
      .returning();
    return log;
  }

  async getAllAdminActionLogs(): Promise<AdminActionLog[]> {
    return await db
      .select()
      .from(adminActionLogs)
      .orderBy(desc(adminActionLogs.createdAt))
      .limit(100);
  }

  async getAdminStats() {
    const allUsers = await db.select().from(users);
    
    // Calculate outstanding revenue based on current active users
    const outstandingRevenue = allUsers.reduce((sum, user) => {
      if (user.subscriptionStatus === 'active') {
        return sum + parseFloat(user.pricingTier);
      }
      return sum;
    }, 0);

    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.subscriptionStatus === 'active').length,
      verifiedUsers: allUsers.filter(u => u.isVerified).length,
      approvedUsers: allUsers.filter(u => u.isApproved).length,
      outstandingRevenue: parseFloat(outstandingRevenue.toFixed(2)),
    };
  }
}

