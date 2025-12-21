/**
 * User Storage Module
 * 
 * Handles user operations: CRUD, verification, approval, name updates.
 */

import {
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "../../../db";
import { eq, desc } from "drizzle-orm";
import { NotFoundError } from "../../../errors";
import { logError } from "../../../errorLogger";

export class UserStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, try to find existing user by ID (primary key)
    let existingUser: User | undefined;
    
    if (userData.id) {
      existingUser = await this.getUser(userData.id);
    }
    
    if (existingUser) {
      // User exists with same ID - update normally
      const [updated] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updated;
    }
    
    // User doesn't exist by ID - try to insert
    // If there's a unique constraint violation on email, handle it
    try {
      const [inserted] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return inserted;
    } catch (error: any) {
      // Handle unique constraint violation on email (PostgreSQL error code 23505)
      if (error?.code === '23505' && error?.constraint?.includes('email')) {
        // User exists with same email but different ID
        // Find the user by email and update them
        if (userData.email) {
          const [userByEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, userData.email));
          
          if (userByEmail) {
            // Update the existing user with the new data
            const [updated] = await db
              .update(users)
              .set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                quoraProfileUrl: userData.quoraProfileUrl,
                updatedAt: new Date(),
                // Preserve existing fields that weren't provided
                pricingTier: userData.pricingTier ?? userByEmail.pricingTier,
                isAdmin: userData.isAdmin ?? userByEmail.isAdmin,
                isVerified: userData.isVerified ?? userByEmail.isVerified,
                isApproved: userData.isApproved ?? userByEmail.isApproved,
                subscriptionStatus: userData.subscriptionStatus ?? userByEmail.subscriptionStatus,
              })
              .where(eq(users.id, userByEmail.id))
              .returning();
            return updated;
          }
        }
      }
      // Re-throw if it's not a unique email constraint violation
      // Log error with context before re-throwing
      logError(error, undefined, 'error');
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<User> {
    // Update user verification
    const [user] = await db
      .update(users)
      .set({ 
        isVerified: !!isVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundError("User");
    }

    // Note: Profile verification updates are handled in profile deletion module
    // to avoid circular dependencies

    return user;
  }

  async updateUserApproval(userId: string, isApproved: boolean): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          isApproved: !!isApproved,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new NotFoundError("User");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  async updateTermsAcceptance(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        termsAcceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async updateUserQuoraProfileUrl(userId: string, quoraProfileUrl: string | null): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          quoraProfileUrl: quoraProfileUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new NotFoundError("User");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }

  async updateUserName(userId: string, firstName: string | null, lastName: string | null): Promise<User> {
    // Retry logic to handle database replication lag
    const maxRetries = 3;
    const baseDelay = 100; // 100ms base delay
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const [user] = await db
        .update(users)
        .set({
          firstName: firstName || null,
          lastName: lastName || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (user) {
        return user;
      }
      
      // If update returned no rows, check if user exists (might be replication lag)
      if (attempt < maxRetries - 1) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // If user doesn't exist at all, throw error immediately
        if (existingUser.length === 0) {
          throw new NotFoundError("User");
        }
        
        // User exists but update failed - likely replication lag, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // All retries exhausted
    throw new Error("User not found");
  }
}

