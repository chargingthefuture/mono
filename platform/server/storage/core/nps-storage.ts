/**
 * NPS Storage Module
 * 
 * Handles NPS (Net Promoter Score) response operations.
 */

import {
  npsResponses,
  type NpsResponse,
  type InsertNpsResponse,
} from "@shared/schema";
import { db } from "../../../db";
import { eq, desc, gte, lte } from "drizzle-orm";

export class NpsStorage {
  async createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse> {
    const [npsResponse] = await db
      .insert(npsResponses)
      .values(response)
      .returning();
    return npsResponse;
  }

  async getUserLastNpsResponse(userId: string): Promise<NpsResponse | undefined> {
    const [response] = await db
      .select()
      .from(npsResponses)
      .where(eq(npsResponses.userId, userId))
      .orderBy(desc(npsResponses.createdAt))
      .limit(1);
    return response;
  }

  async getNpsResponsesForWeek(weekStart: Date, weekEnd: Date): Promise<NpsResponse[]> {
    return await db
      .select()
      .from(npsResponses)
      .where(
        and(
          gte(npsResponses.createdAt, weekStart),
          lte(npsResponses.createdAt, weekEnd)
        )
      )
      .orderBy(desc(npsResponses.createdAt));
  }

  async getAllNpsResponses(): Promise<NpsResponse[]> {
    return await db
      .select()
      .from(npsResponses)
      .orderBy(desc(npsResponses.createdAt));
  }
}

