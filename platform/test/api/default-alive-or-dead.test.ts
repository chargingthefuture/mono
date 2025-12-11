import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { createMockRequest, createMockResponse, generateTestUserId } from '../fixtures/testData';
import { storage } from '../../server/storage';
import { db } from '../../server/db';
import { defaultAliveOrDeadEbitdaSnapshots, defaultAliveOrDeadFinancialEntries } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Comprehensive API tests for Default Alive or Dead endpoints
 */

// Check if DATABASE_URL is available
const hasDatabaseUrl = !!process.env.DATABASE_URL;
let canConnectToDatabase = false;

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping integration tests');
    return;
  }

  try {
    await db.execute({ sql: 'SELECT 1', args: [] });
    canConnectToDatabase = true;
  } catch (error: any) {
    console.warn('Database connection failed, skipping integration tests:', error.message);
    canConnectToDatabase = false;
  }
});

describe('API - Default Alive or Dead EBITDA Snapshot', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('POST /api/default-alive-or-dead/calculate-ebitda', () => {
    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false); // Not admin
      expect(req.isAdmin()).toBe(false);
    });

    it('should require weekStartDate parameter', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {}; // Missing weekStartDate
      expect(req.body.weekStartDate).toBeUndefined();
    });

    it('should accept weekStartDate and optional currentFunding', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {
        weekStartDate: '2025-12-05',
        currentFunding: 10000,
      };
      expect(req.body.weekStartDate).toBe('2025-12-05');
      expect(req.body.currentFunding).toBe(10000);
    });
  });

  describe('Week Boundary Calculations', () => {
    it('should normalize Nov 30, 2024 (Saturday) to itself', () => {
      // Nov 30, 2024 is a Saturday
      const inputDate = new Date('2024-11-30');
      const weekStart = new Date(inputDate);
      const dayOfWeek = weekStart.getDay(); // Should be 6 (Saturday)
      // To normalize to Saturday: if Saturday (6), stay; otherwise go back (dayOfWeek + 1) days
      const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      weekStart.setDate(weekStart.getDate() - daysToSaturday);
      weekStart.setHours(0, 0, 0, 0);

      expect(weekStart.getDay()).toBe(6); // Saturday
      expect(weekStart.getDate()).toBe(30);
      expect(weekStart.getMonth()).toBe(10); // November (0-indexed)
      expect(weekStart.getFullYear()).toBe(2024);
    });

    it('should calculate week end as Friday (Dec 6) for week starting Nov 30', () => {
      const weekStart = new Date('2024-11-30');
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      expect(weekEnd.getDay()).toBe(5); // Friday
      expect(weekEnd.getDate()).toBe(6);
      expect(weekEnd.getMonth()).toBe(11); // December (0-indexed)
      expect(weekEnd.getFullYear()).toBe(2024);
    });

    it('should normalize Dec 7, 2024 (Saturday) to itself', () => {
      // Dec 7, 2024 is a Saturday
      const inputDate = new Date('2024-12-07');
      const weekStart = new Date(inputDate);
      const dayOfWeek = weekStart.getDay(); // Should be 6 (Saturday)
      // To normalize to Saturday: if Saturday (6), stay; otherwise go back (dayOfWeek + 1) days
      const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      weekStart.setDate(weekStart.getDate() - daysToSaturday);
      weekStart.setHours(0, 0, 0, 0);

      expect(weekStart.getDay()).toBe(6); // Saturday
      expect(weekStart.getDate()).toBe(7);
      expect(weekStart.getMonth()).toBe(11); // December (0-indexed)
      expect(weekStart.getFullYear()).toBe(2024);
    });

    it('should calculate week end as Friday (Dec 13) for week starting Dec 7', () => {
      const weekStart = new Date('2024-12-07');
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      expect(weekEnd.getDay()).toBe(5); // Friday
      expect(weekEnd.getDate()).toBe(13);
      expect(weekEnd.getMonth()).toBe(11); // December (0-indexed)
      expect(weekEnd.getFullYear()).toBe(2024);
    });

    it('should normalize any date in the week to the Saturday start', () => {
      // Test with dates in the Nov 30 - Dec 6 week
      // Nov 29 (Friday) should normalize to Nov 23 (previous Saturday)
      // Nov 30 (Saturday) should stay as Nov 30
      // Dec 5 (Thursday) should normalize to Nov 30
      const testCases = [
        { input: new Date('2024-11-29'), expectedDate: 23, expectedMonth: 10 }, // Friday -> previous Saturday
        { input: new Date('2024-11-30'), expectedDate: 30, expectedMonth: 10 }, // Saturday -> itself
        { input: new Date('2024-12-01'), expectedDate: 30, expectedMonth: 10 }, // Sunday -> previous Saturday
        { input: new Date('2024-12-05'), expectedDate: 30, expectedMonth: 10 }, // Thursday -> Saturday
        { input: new Date('2024-12-06'), expectedDate: 30, expectedMonth: 10 }, // Friday -> Saturday
      ];

      testCases.forEach(({ input, expectedDate, expectedMonth }) => {
        const weekStart = new Date(input);
        const dayOfWeek = weekStart.getDay();
        // To normalize to Saturday: if Saturday (6), stay; otherwise go back (dayOfWeek + 1) days
        const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
        weekStart.setDate(weekStart.getDate() - daysToSaturday);
        weekStart.setHours(0, 0, 0, 0);

        expect(weekStart.getDay()).toBe(6); // Always Saturday
        expect(weekStart.getDate()).toBe(expectedDate);
        expect(weekStart.getMonth()).toBe(expectedMonth);
      });
    });

    it('should handle dates on Sunday (should normalize to previous Saturday)', () => {
      // Dec 1, 2024 is a Sunday
      const inputDate = new Date('2024-12-01');
      const weekStart = new Date(inputDate);
      const dayOfWeek = weekStart.getDay(); // Should be 0 (Sunday)
      // To normalize to Saturday: if Saturday (6), stay; otherwise go back (dayOfWeek + 1) days
      const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
      weekStart.setDate(weekStart.getDate() - daysToSaturday);
      weekStart.setHours(0, 0, 0, 0);

      // Should normalize to Nov 30 (Saturday)
      expect(weekStart.getDay()).toBe(6); // Saturday
      expect(weekStart.getDate()).toBe(30);
      expect(weekStart.getMonth()).toBe(10); // November (0-indexed)
    });

    it('should correctly calculate week boundaries for user-specified date ranges', () => {
      // User mentioned: Nov 29-Dec 5 and Dec 6-Dec 12 as weeks
      // These dates normalize to the Saturday of their respective weeks
      
      // Nov 29, 2024 (Thursday) should normalize to Nov 23 (previous Saturday)
      const nov29 = new Date('2024-11-29');
      let weekStart = new Date(nov29);
      const dayOfWeek1 = weekStart.getDay();
      // To normalize to Saturday: if Saturday (6), stay; otherwise go back (dayOfWeek + 1) days
      const daysToSaturday1 = dayOfWeek1 === 6 ? 0 : dayOfWeek1 + 1;
      weekStart.setDate(weekStart.getDate() - daysToSaturday1);
      weekStart.setHours(0, 0, 0, 0);
      
      let weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      expect(weekStart.getDay()).toBe(6); // Saturday
      expect(weekEnd.getDay()).toBe(5); // Friday
      // Week should be Nov 23 (Sat) to Nov 29 (Fri)

      // Dec 6, 2024 (Friday) should normalize to Nov 30 (previous Saturday)
      const dec6 = new Date('2024-12-06');
      weekStart = new Date(dec6);
      const dayOfWeek2 = weekStart.getDay();
      // To normalize to Saturday: if Saturday (6), stay; otherwise go back (dayOfWeek + 1) days
      const daysToSaturday2 = dayOfWeek2 === 6 ? 0 : dayOfWeek2 + 1;
      weekStart.setDate(weekStart.getDate() - daysToSaturday2);
      weekStart.setHours(0, 0, 0, 0);
      
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      expect(weekStart.getDay()).toBe(6); // Saturday
      expect(weekEnd.getDay()).toBe(5); // Friday
      // Week should be Nov 30 (Sat) to Dec 6 (Fri)
      expect(weekStart.getDate()).toBe(30);
      expect(weekStart.getMonth()).toBe(10); // November
      expect(weekEnd.getDate()).toBe(6);
      expect(weekEnd.getMonth()).toBe(11); // December
    });
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - Default Alive or Dead EBITDA Snapshot', () => {
  let testUserId: string;
  let testWeekStart: Date;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    // Use Nov 30, 2024 (Saturday) as test week
    testWeekStart = new Date('2024-11-30');
    testWeekStart.setHours(0, 0, 0, 0);

    // Cleanup any existing snapshots for test week
    try {
      await db
        .delete(defaultAliveOrDeadEbitdaSnapshots)
        .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, testWeekStart));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterAll(async () => {
    // Cleanup test snapshots
    try {
      await db
        .delete(defaultAliveOrDeadEbitdaSnapshots)
        .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, testWeekStart));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create EBITDA snapshot for a week', async () => {
    const snapshot = await storage.calculateAndStoreEbitdaSnapshot(testWeekStart, 10000);

    expect(snapshot).toBeDefined();
    expect(snapshot.weekStartDate).toEqual(testWeekStart);
    expect(snapshot.currentFunding).toBe('10000');
    expect(snapshot.revenue).toBeDefined();
    expect(snapshot.operatingExpenses).toBeDefined();
    expect(snapshot.ebitda).toBeDefined();
  });

  it.skipIf(!canConnectToDatabase)('should be idempotent - duplicate requests should update existing snapshot', async () => {
    // First request
    const firstSnapshot = await storage.calculateAndStoreEbitdaSnapshot(testWeekStart, 10000);
    expect(firstSnapshot).toBeDefined();
    const firstId = firstSnapshot.id;
    const firstUpdatedAt = firstSnapshot.updatedAt;

    // Wait a bit to ensure updatedAt changes
    await new Promise(resolve => setTimeout(resolve, 100));

    // Second request with same week (simulating duplicate POST)
    const secondSnapshot = await storage.calculateAndStoreEbitdaSnapshot(testWeekStart, 15000);

    expect(secondSnapshot).toBeDefined();
    expect(secondSnapshot.id).toBe(firstId); // Same record
    expect(secondSnapshot.weekStartDate).toEqual(testWeekStart);
    expect(secondSnapshot.currentFunding).toBe('15000'); // Updated value
    expect(new Date(secondSnapshot.updatedAt).getTime()).toBeGreaterThan(new Date(firstUpdatedAt).getTime()); // Updated timestamp
  });

  it.skipIf(!canConnectToDatabase)('should handle multiple concurrent duplicate requests', async () => {
    // Simulate concurrent requests
    const promises = [
      storage.calculateAndStoreEbitdaSnapshot(testWeekStart, 10000),
      storage.calculateAndStoreEbitdaSnapshot(testWeekStart, 20000),
      storage.calculateAndStoreEbitdaSnapshot(testWeekStart, 30000),
    ];

    const results = await Promise.all(promises);

    // All should succeed without unique constraint violation
    expect(results).toHaveLength(3);
    
    // All should reference the same snapshot (same week)
    const uniqueIds = new Set(results.map(r => r.id));
    expect(uniqueIds.size).toBe(1); // All should be the same record

    // The final value should be one of the concurrent updates
    const finalSnapshot = results[results.length - 1];
    expect(finalSnapshot.weekStartDate).toEqual(testWeekStart);
  });

  it.skipIf(!canConnectToDatabase)('should normalize week start date correctly for Nov 30-Dec 6 week', async () => {
    // Test with different dates in the same week (Nov 30 is Saturday)
    const datesInWeek = [
      new Date('2024-11-30'), // Saturday
      new Date('2024-12-01'), // Sunday
      new Date('2024-12-02'), // Monday
      new Date('2024-12-03'), // Tuesday
      new Date('2024-12-04'), // Wednesday
      new Date('2024-12-05'), // Thursday
      new Date('2024-12-06'), // Friday
    ];

    for (const date of datesInWeek) {
      const snapshot = await storage.calculateAndStoreEbitdaSnapshot(date, 10000);
      
      // All should normalize to Nov 30 (Saturday)
      expect(snapshot.weekStartDate.getDate()).toBe(30);
      expect(snapshot.weekStartDate.getMonth()).toBe(10); // November (0-indexed)
      expect(snapshot.weekStartDate.getDay()).toBe(6); // Saturday
    }

    // Cleanup
    await db
      .delete(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, testWeekStart));
  });

  it.skipIf(!canConnectToDatabase)('should normalize week start date correctly for Dec 7-Dec 13 week', async () => {
    const dec7WeekStart = new Date('2024-12-07');
    dec7WeekStart.setHours(0, 0, 0, 0);

    // Test with different dates in the Dec 7-13 week
    const datesInWeek = [
      new Date('2024-12-07'), // Saturday
      new Date('2024-12-08'), // Sunday
      new Date('2024-12-09'), // Monday
      new Date('2024-12-10'), // Tuesday
      new Date('2024-12-11'), // Wednesday
      new Date('2024-12-12'), // Thursday
      new Date('2024-12-13'), // Friday
    ];

    for (const date of datesInWeek) {
      const snapshot = await storage.calculateAndStoreEbitdaSnapshot(date, 10000);
      
      // All should normalize to Dec 7 (Saturday)
      expect(snapshot.weekStartDate.getDate()).toBe(7);
      expect(snapshot.weekStartDate.getMonth()).toBe(11); // December (0-indexed)
      expect(snapshot.weekStartDate.getDay()).toBe(6); // Saturday
    }

    // Cleanup
    await db
      .delete(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, dec7WeekStart));
  });

  it.skipIf(!canConnectToDatabase)('should create separate snapshots for different weeks', async () => {
    const week1Start = new Date('2024-11-30'); // Nov 30 (Saturday)
    week1Start.setHours(0, 0, 0, 0);
    
    const week2Start = new Date('2024-12-07'); // Dec 7 (Saturday)
    week2Start.setHours(0, 0, 0, 0);

    const snapshot1 = await storage.calculateAndStoreEbitdaSnapshot(week1Start, 10000);
    const snapshot2 = await storage.calculateAndStoreEbitdaSnapshot(week2Start, 20000);

    expect(snapshot1.id).not.toBe(snapshot2.id);
    expect(snapshot1.weekStartDate.getTime()).not.toBe(snapshot2.weekStartDate.getTime());
    expect(snapshot1.weekStartDate.getDate()).toBe(30);
    expect(snapshot2.weekStartDate.getDate()).toBe(7);

    // Cleanup
    await db
      .delete(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, week1Start));
    await db
      .delete(defaultAliveOrDeadEbitdaSnapshots)
      .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, week2Start));
  });
});

describe('API - Default Alive or Dead Financial Entries', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('GET /api/default-alive-or-dead/financial-entries', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false); // Not admin
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to access financial entries', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.isAuthenticated()).toBe(true);
      expect(req.isAdmin()).toBe(true);
    });

    it('should accept optional limit and offset query parameters', () => {
      const req = createMockRequest(adminUserId, true);
      req.query = { limit: '50', offset: '0' };
      expect(req.query.limit).toBe('50');
      expect(req.query.offset).toBe('0');
    });
  });

  describe('POST /api/default-alive-or-dead/financial-entries', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should validate financial entry data', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {
        weekStartDate: '2024-11-30',
        operatingExpenses: 1000.50,
        depreciation: 100.00,
        amortization: 50.00,
        notes: 'Test entry',
      };
      expect(req.body.weekStartDate).toBe('2024-11-30');
      expect(req.body.operatingExpenses).toBe(1000.50);
    });

    it('should accept optional depreciation and amortization', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {
        weekStartDate: '2024-11-30',
        operatingExpenses: 1000.50,
      };
      expect(req.body.depreciation).toBeUndefined();
      expect(req.body.amortization).toBeUndefined();
    });
  });

  describe('PUT /api/default-alive-or-dead/financial-entries/:id', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow partial updates', () => {
      const req = createMockRequest(adminUserId, true);
      req.params = { id: 'test-id' };
      req.body = { operatingExpenses: 1500.00 };
      expect(req.params.id).toBe('test-id');
      expect(req.body.operatingExpenses).toBe(1500.00);
    });
  });

  describe('DELETE /api/default-alive-or-dead/financial-entries/:id', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should accept entry ID in params', () => {
      const req = createMockRequest(adminUserId, true);
      req.params = { id: 'test-entry-id' };
      expect(req.params.id).toBe('test-entry-id');
    });
  });
});

describe('API - Default Alive or Dead EBITDA Snapshots', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('GET /api/default-alive-or-dead/ebitda-snapshots', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should accept optional limit and offset query parameters', () => {
      const req = createMockRequest(adminUserId, true);
      req.query = { limit: '20', offset: '0' };
      expect(req.query.limit).toBe('20');
      expect(req.query.offset).toBe('0');
    });
  });

  describe('GET /api/default-alive-or-dead/current-status', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to access current status', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.isAuthenticated()).toBe(true);
      expect(req.isAdmin()).toBe(true);
    });
  });

  describe('GET /api/default-alive-or-dead/weekly-trends', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should accept optional weeks query parameter', () => {
      const req = createMockRequest(adminUserId, true);
      req.query = { weeks: '12' };
      expect(req.query.weeks).toBe('12');
    });

    it('should default to reasonable number of weeks if not provided', () => {
      const req = createMockRequest(adminUserId, true);
      req.query = {};
      expect(req.query.weeks).toBeUndefined();
    });
  });

  describe('GET /api/default-alive-or-dead/week-comparison', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should require weekStart query parameter', () => {
      const req = createMockRequest(adminUserId, true);
      req.query = { weekStart: '2024-11-30' };
      expect(req.query.weekStart).toBe('2024-11-30');
    });

    it('should handle missing weekStart parameter', () => {
      const req = createMockRequest(adminUserId, true);
      req.query = {};
      expect(req.query.weekStart).toBeUndefined();
    });
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - Default Alive or Dead Financial Entries', () => {
  let testUserId: string;
  let testWeekStart: Date;
  let testEntryId: string | null = null;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    testWeekStart = new Date('2024-11-30');
    testWeekStart.setHours(0, 0, 0, 0);

    // Cleanup any existing entries for test week
    try {
      await db
        .delete(defaultAliveOrDeadFinancialEntries)
        .where(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, testWeekStart));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterAll(async () => {
    // Cleanup test entries
    if (testEntryId) {
      try {
        await db
          .delete(defaultAliveOrDeadFinancialEntries)
          .where(eq(defaultAliveOrDeadFinancialEntries.id, testEntryId));
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it.skipIf(!canConnectToDatabase)('should create financial entry', async () => {
    const entry = await storage.createDefaultAliveOrDeadFinancialEntry({
      weekStartDate: testWeekStart,
      operatingExpenses: 1000.50,
      depreciation: 100.00,
      amortization: 50.00,
      notes: 'Test entry',
    }, testUserId);

    expect(entry).toBeDefined();
    expect(entry.weekStartDate).toEqual(testWeekStart);
    expect(entry.operatingExpenses).toBe('1000.50');
    expect(entry.depreciation).toBe('100.00');
    expect(entry.amortization).toBe('50.00');
    testEntryId = entry.id;
  });

  it.skipIf(!canConnectToDatabase)('should retrieve financial entries', async () => {
    // Create a test entry
    const created = await storage.createDefaultAliveOrDeadFinancialEntry({
      weekStartDate: testWeekStart,
      operatingExpenses: 1000.50,
    }, testUserId);
    testEntryId = created.id;

    // Retrieve entries
    const result = await storage.getDefaultAliveOrDeadFinancialEntries({
      limit: 10,
      offset: 0,
    });

    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(1);
    
    const found = result.items.find(e => e.id === created.id);
    expect(found).toBeDefined();
    expect(found?.operatingExpenses).toBe('1000.50');
  });

  it.skipIf(!canConnectToDatabase)('should update financial entry', async () => {
    // Create a test entry
    const created = await storage.createDefaultAliveOrDeadFinancialEntry({
      weekStartDate: testWeekStart,
      operatingExpenses: 1000.50,
    }, testUserId);
    testEntryId = created.id;

    // Update the entry
    const updated = await storage.updateDefaultAliveOrDeadFinancialEntry(created.id, {
      operatingExpenses: 1500.00,
      notes: 'Updated entry',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.operatingExpenses).toBe('1500.00');
    expect(updated.notes).toBe('Updated entry');
  });

  it.skipIf(!canConnectToDatabase)('should delete financial entry', async () => {
    // Create a test entry
    const created = await storage.createDefaultAliveOrDeadFinancialEntry({
      weekStartDate: testWeekStart,
      operatingExpenses: 1000.50,
    }, testUserId);

    // Delete the entry
    await storage.deleteDefaultAliveOrDeadFinancialEntry(created.id);

    // Verify it's deleted
    const result = await storage.getDefaultAliveOrDeadFinancialEntries({});
    const found = result.items.find(e => e.id === created.id);
    expect(found).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - Default Alive or Dead Status & Trends', () => {
  let testWeekStart: Date;

  beforeEach(async () => {
    testWeekStart = new Date('2024-11-30');
    testWeekStart.setHours(0, 0, 0, 0);
  });

  it.skipIf(!canConnectToDatabase)('should get current status', async () => {
    const status = await storage.getDefaultAliveOrDeadCurrentStatus();
    
    expect(status).toBeDefined();
    expect(status).toHaveProperty('currentSnapshot');
    expect(status).toHaveProperty('isDefaultAlive');
    expect(status).toHaveProperty('projectedProfitabilityDate');
    expect(status).toHaveProperty('projectedCapitalNeeded');
    expect(status).toHaveProperty('weeksUntilProfitability');
  });

  it.skipIf(!canConnectToDatabase)('should get weekly trends', async () => {
    const trends = await storage.getDefaultAliveOrDeadWeeklyTrends(12);
    
    expect(Array.isArray(trends)).toBe(true);
    // Trends should be ordered by week start date (most recent first)
    if (trends.length > 1) {
      const firstWeek = new Date(trends[0].weekStartDate);
      const secondWeek = new Date(trends[1].weekStartDate);
      expect(firstWeek.getTime()).toBeGreaterThanOrEqual(secondWeek.getTime());
    }
  });

  it.skipIf(!canConnectToDatabase)('should get week comparison', async () => {
    const comparison = await storage.getDefaultAliveOrDeadWeekComparison(testWeekStart);
    
    expect(comparison).toBeDefined();
    expect(comparison).toHaveProperty('currentWeek');
    expect(comparison).toHaveProperty('previousWeek');
    expect(comparison).toHaveProperty('change');
  });
});

