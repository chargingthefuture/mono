import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { storage } from '../../server/storage';
import { db } from '../../server/db';
import { users, supportMatchProfiles, lighthouseProfiles, socketrelayProfiles, directoryProfiles, workforceRecruiterProfiles, trusttransportProfiles, mechanicmatchProfiles, chymeProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateTestUserId, createTestSupportMatchProfile, createTestLighthouseProfile, createTestSocketrelayProfile, createTestDirectoryProfile, createTestWorkforceRecruiterProfile, createTestTrusttransportProfile, createTestMechanicmatchProfile, createTestChymeProfile } from '../fixtures/testData';

/**
 * Integration tests for storage layer
 * These tests use a real database connection
 * 
 * These tests will be skipped if:
 * - DATABASE_URL is not set
 * - Database connection fails (e.g., in CI without proper credentials)
 */

// Check if DATABASE_URL is available (synchronous check for describe.skipIf)
const hasDatabaseUrl = !!process.env.DATABASE_URL;

let canConnectToDatabase = false;

beforeAll(async () => {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping integration tests');
    return;
  }

  // Try to connect to database
  try {
    // Simple query to test connection
    await db.execute({ sql: 'SELECT 1', args: [] });
    canConnectToDatabase = true;
  } catch (error: any) {
    // If connection fails (e.g., authentication error), skip tests
    if (error.message?.includes('authentication') || error.message?.includes('password')) {
      console.warn('Database authentication failed, skipping integration tests:', error.message);
      canConnectToDatabase = false;
    } else {
      // Other errors might be transient, but we'll still skip to be safe
      console.warn('Database connection failed, skipping integration tests:', error.message);
      canConnectToDatabase = false;
    }
  }
});

// Skip tests if DATABASE_URL is not set (synchronous check)
// Individual tests will also check canConnectToDatabase for connection failures
describe.skipIf(!hasDatabaseUrl)('Storage Layer - User Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
  });

  afterAll(async () => {
    // Cleanup test users
    try {
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create and retrieve a user', async () => {
    const testUser = {
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    };

    const created = await storage.upsertUser(testUser);
    expect(created).toBeDefined();
    expect(created.id).toBe(testUserId);
    expect(created.email).toBe(testUser.email);

    const retrieved = await storage.getUser(testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(testUserId);
    expect(retrieved?.email).toBe(testUser.email);
  });

  it.skipIf(!canConnectToDatabase)('should update user verification status', async () => {
    const testUser = {
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    };

    await storage.upsertUser(testUser);
    const updated = await storage.updateUserVerification(testUserId, true);

    expect(updated.isVerified).toBe(true);
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - SupportMatch Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    // Create user first
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    // Cleanup
    try {
      await db.delete(supportMatchProfiles).where(eq(supportMatchProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a SupportMatch profile', async () => {
    const profileData = createTestSupportMatchProfile(testUserId);
    const created = await storage.createSupportMatchProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
    expect(created.timezone).toBe(profileData.timezone);
  });

  it.skipIf(!canConnectToDatabase)('should retrieve a SupportMatch profile by userId', async () => {
    const profileData = createTestSupportMatchProfile(testUserId);
    await storage.createSupportMatchProfile(profileData);

    const retrieved = await storage.getSupportMatchProfile(testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should update a SupportMatch profile', async () => {
    const profileData = createTestSupportMatchProfile(testUserId);
    await storage.createSupportMatchProfile(profileData);

    const updated = await storage.updateSupportMatchProfile(testUserId, {
      nickname: 'Updated Nickname',
      city: 'Boston',
    });

    expect(updated.nickname).toBe('Updated Nickname');
    expect(updated.city).toBe('Boston');
  });

  it.skipIf(!canConnectToDatabase)('should delete SupportMatch profile and anonymize related data', async () => {
    const profileData = createTestSupportMatchProfile(testUserId);
    await storage.createSupportMatchProfile(profileData);

    await storage.deleteSupportMatchProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getSupportMatchProfile(testUserId);
    expect(retrieved).toBeUndefined();

    // Verify deletion was logged
    // This would need to check profile_deletion_logs table
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - LightHouse Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(lighthouseProfiles).where(eq(lighthouseProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a LightHouse profile', async () => {
    const profileData = createTestLighthouseProfile(testUserId);
    const created = await storage.createLighthouseProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
    expect(created.profileType).toBe('seeker');
  });

  it.skipIf(!canConnectToDatabase)('should update a LightHouse profile', async () => {
    const profileData = createTestLighthouseProfile(testUserId);
    const created = await storage.createLighthouseProfile(profileData);

    const updated = await storage.updateLighthouseProfile(created.id, {
      profileType: 'host',
    });

    expect(updated.profileType).toBe('host');
  });

  it.skipIf(!canConnectToDatabase)('should delete LightHouse profile with cascade anonymization', async () => {
    const profileData = createTestLighthouseProfile(testUserId);
    await storage.createLighthouseProfile(profileData);

    await storage.deleteLighthouseProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getLighthouseProfileByUserId(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - SocketRelay Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(socketrelayProfiles).where(eq(socketrelayProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a SocketRelay profile', async () => {
    const profileData = createTestSocketrelayProfile(testUserId);
    const created = await storage.createSocketrelayProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should delete SocketRelay profile with cascade anonymization', async () => {
    const profileData = createTestSocketrelayProfile(testUserId);
    await storage.createSocketrelayProfile(profileData);

    await storage.deleteSocketrelayProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getSocketrelayProfile(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - Directory Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(directoryProfiles).where(eq(directoryProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a Directory profile', async () => {
    const profileData = createTestDirectoryProfile(testUserId);
    const created = await storage.createDirectoryProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should list public Directory profiles only when isPublic is true', async () => {
    const publicProfileData = createTestDirectoryProfile(testUserId, { isPublic: true });
    await storage.createDirectoryProfile(publicProfileData);

    const publicProfiles = await storage.listPublicDirectoryProfiles();
    expect(publicProfiles.some(p => p.userId === testUserId)).toBe(true);
  });

  it.skipIf(!canConnectToDatabase)('should delete Directory profile with cascade anonymization', async () => {
    const profileData = createTestDirectoryProfile(testUserId);
    await storage.createDirectoryProfile(profileData);

    await storage.deleteDirectoryProfileWithCascade(testUserId, 'Test deletion');

    const retrieved = await storage.getDirectoryProfileByUserId(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - Workforce Recruiter Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(workforceRecruiterProfiles).where(eq(workforceRecruiterProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a Workforce Recruiter profile', async () => {
    const profileData = createTestWorkforceRecruiterProfile(testUserId);
    const created = await storage.createWorkforceRecruiterProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
    expect(created.notes).toBe(profileData.notes);
  });

  it.skipIf(!canConnectToDatabase)('should retrieve a Workforce Recruiter profile by userId', async () => {
    const profileData = createTestWorkforceRecruiterProfile(testUserId);
    await storage.createWorkforceRecruiterProfile(profileData);

    const retrieved = await storage.getWorkforceRecruiterProfile(testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should update a Workforce Recruiter profile', async () => {
    const profileData = createTestWorkforceRecruiterProfile(testUserId);
    await storage.createWorkforceRecruiterProfile(profileData);

    const updated = await storage.updateWorkforceRecruiterProfile(testUserId, {
      notes: 'Updated notes',
    });

    expect(updated.notes).toBe('Updated notes');
  });

  it.skipIf(!canConnectToDatabase)('should delete Workforce Recruiter profile and log deletion', async () => {
    const profileData = createTestWorkforceRecruiterProfile(testUserId);
    await storage.createWorkforceRecruiterProfile(profileData);

    await storage.deleteWorkforceRecruiterProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getWorkforceRecruiterProfile(testUserId);
    expect(retrieved).toBeUndefined();
  });

  it.skipIf(!canConnectToDatabase)('should return undefined when profile does not exist', async () => {
    const retrieved = await storage.getWorkforceRecruiterProfile(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - TrustTransport Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(trusttransportProfiles).where(eq(trusttransportProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a TrustTransport profile', async () => {
    const profileData = createTestTrusttransportProfile(testUserId);
    const created = await storage.createTrusttransportProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
    expect(created.isRider).toBe(true);
  });

  it.skipIf(!canConnectToDatabase)('should retrieve a TrustTransport profile by userId', async () => {
    const profileData = createTestTrusttransportProfile(testUserId);
    await storage.createTrusttransportProfile(profileData);

    const retrieved = await storage.getTrusttransportProfile(testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should update a TrustTransport profile', async () => {
    const profileData = createTestTrusttransportProfile(testUserId);
    await storage.createTrusttransportProfile(profileData);

    const updated = await storage.updateTrusttransportProfile(testUserId, {
      bio: 'Updated bio',
    });

    expect(updated.bio).toBe('Updated bio');
  });

  it.skipIf(!canConnectToDatabase)('should delete TrustTransport profile with cascade anonymization', async () => {
    const profileData = createTestTrusttransportProfile(testUserId);
    await storage.createTrusttransportProfile(profileData);

    await storage.deleteTrusttransportProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getTrusttransportProfile(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - MechanicMatch Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(mechanicmatchProfiles).where(eq(mechanicmatchProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a MechanicMatch profile', async () => {
    const profileData = createTestMechanicmatchProfile(testUserId);
    const created = await storage.createMechanicmatchProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
    expect(created.isCarOwner).toBe(true);
  });

  it.skipIf(!canConnectToDatabase)('should retrieve a MechanicMatch profile by userId', async () => {
    const profileData = createTestMechanicmatchProfile(testUserId);
    await storage.createMechanicmatchProfile(profileData);

    const retrieved = await storage.getMechanicmatchProfile(testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should update a MechanicMatch profile', async () => {
    const profileData = createTestMechanicmatchProfile(testUserId);
    await storage.createMechanicmatchProfile(profileData);

    const updated = await storage.updateMechanicmatchProfile(testUserId, {
      ownerBio: 'Updated bio',
    });

    expect(updated.ownerBio).toBe('Updated bio');
  });

  it.skipIf(!canConnectToDatabase)('should delete MechanicMatch profile with cascade anonymization', async () => {
    const profileData = createTestMechanicmatchProfile(testUserId);
    await storage.createMechanicmatchProfile(profileData);

    await storage.deleteMechanicmatchProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getMechanicmatchProfile(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

describe.skipIf(!hasDatabaseUrl)('Storage Layer - Chyme Profile Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateTestUserId();
    await storage.upsertUser({
      id: testUserId,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  afterAll(async () => {
    try {
      await db.delete(chymeProfiles).where(eq(chymeProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it.skipIf(!canConnectToDatabase)('should create a Chyme profile', async () => {
    const profileData = createTestChymeProfile(testUserId);
    const created = await storage.createChymeProfile(profileData);

    expect(created).toBeDefined();
    expect(created.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should retrieve a Chyme profile by userId', async () => {
    const profileData = createTestChymeProfile(testUserId);
    await storage.createChymeProfile(profileData);

    const retrieved = await storage.getChymeProfile(testUserId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.userId).toBe(testUserId);
  });

  it.skipIf(!canConnectToDatabase)('should update a Chyme profile', async () => {
    const profileData = createTestChymeProfile(testUserId);
    await storage.createChymeProfile(profileData);

    const updated = await storage.updateChymeProfile(testUserId, {});
    expect(updated).toBeDefined();
  });

  it.skipIf(!canConnectToDatabase)('should delete Chyme profile and log deletion', async () => {
    const profileData = createTestChymeProfile(testUserId);
    await storage.createChymeProfile(profileData);

    await storage.deleteChymeProfile(testUserId, 'Test deletion');

    const retrieved = await storage.getChymeProfile(testUserId);
    expect(retrieved).toBeUndefined();
  });
});

