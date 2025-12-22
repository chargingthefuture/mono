/**
 * Pricing Storage Module
 * 
 * Handles pricing tier operations.
 */

import {
  pricingTiers,
  type PricingTier,
  type InsertPricingTier,
} from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export class PricingStorage {
  async getCurrentPricingTier(): Promise<PricingTier | undefined> {
    const [tier] = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.isCurrentTier, true))
      .orderBy(desc(pricingTiers.effectiveDate))
      .limit(1);
    return tier;
  }

  async getAllPricingTiers(): Promise<PricingTier[]> {
    return await db
      .select()
      .from(pricingTiers)
      .orderBy(desc(pricingTiers.effectiveDate));
  }

  async createPricingTier(tierData: InsertPricingTier): Promise<PricingTier> {
    // If this is set as the current tier, unset all others
    if (tierData.isCurrentTier) {
      await db
        .update(pricingTiers)
        .set({ isCurrentTier: false })
        .where(eq(pricingTiers.isCurrentTier, true));
    }

    const [tier] = await db
      .insert(pricingTiers)
      .values(tierData)
      .returning();
    return tier;
  }

  async setCurrentPricingTier(id: string): Promise<PricingTier> {
    // Unset all current tiers
    await db
      .update(pricingTiers)
      .set({ isCurrentTier: false })
      .where(eq(pricingTiers.isCurrentTier, true));

    // Set the specified tier as current
    const [tier] = await db
      .update(pricingTiers)
      .set({ isCurrentTier: true })
      .where(eq(pricingTiers.id, id))
      .returning();
    
    return tier;
  }
}

