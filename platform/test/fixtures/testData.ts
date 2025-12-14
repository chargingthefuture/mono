import { vi } from 'vitest';
import type { InsertSupportMatchProfile } from '@shared/schema';
import type { InsertLighthouseProfile } from '@shared/schema';
import type { InsertSocketrelayProfile } from '@shared/schema';
import type { InsertDirectoryProfile } from '@shared/schema';
import type { InsertWorkforceRecruiterProfile } from '@shared/schema';
import type { InsertTrusttransportProfile } from '@shared/schema';
import type { InsertMechanicmatchProfile } from '@shared/schema';

/**
 * Test data fixtures for creating consistent test data
 */

export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  profileImageUrl: null,
  isAdmin: false,
  isVerified: false,
  isApproved: true,
  pricingTier: '1.00',
  subscriptionStatus: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestAdminUser = (overrides = {}) =>
  createTestUser({ ...overrides, isAdmin: true });

export const createTestSupportMatchProfile = (
  userId: string,
  overrides: Partial<InsertSupportMatchProfile> = {}
): InsertSupportMatchProfile => ({
  userId,
  timezone: 'America/New_York',
  city: 'New York',
  state: 'NY',
  country: 'United States',
  nickname: 'Test User',
  ...overrides,
});

export const createTestLighthouseProfile = (
  userId: string,
  overrides: Partial<InsertLighthouseProfile> = {}
): InsertLighthouseProfile => ({
  userId,
  profileType: 'seeker',
  bio: 'Test bio',
  phoneNumber: '555-1234',
  desiredCountry: 'United States',
  ...overrides,
});

export const createTestSocketrelayProfile = (
  userId: string,
  overrides: Partial<InsertSocketrelayProfile> = {}
): InsertSocketrelayProfile => ({
  userId,
  country: 'United States',
  state: 'NY',
  city: 'New York',
  ...overrides,
});

export const createTestDirectoryProfile = (
  userId: string,
  overrides: Partial<InsertDirectoryProfile> = {}
): InsertDirectoryProfile => ({
  userId,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '555-1234',
  country: 'United States',
  state: 'NY',
  city: 'New York',
  bio: 'Test bio',
  isPublic: false,
  ...overrides,
});

export const createTestWorkforceRecruiterProfile = (
  userId: string,
  overrides: Partial<InsertWorkforceRecruiterProfile> = {}
): InsertWorkforceRecruiterProfile => ({
  userId,
  notes: 'Test notes',
  ...overrides,
});

export const createTestTrusttransportProfile = (
  userId: string,
  overrides: Partial<InsertTrusttransportProfile> = {}
): InsertTrusttransportProfile => ({
  userId,
  isDriver: false,
  isRider: true,
  city: 'New York',
  state: 'NY',
  country: 'United States',
  ...overrides,
});

export const createTestMechanicmatchProfile = (
  userId: string,
  overrides: Partial<InsertMechanicmatchProfile> = {}
): InsertMechanicmatchProfile => ({
  userId,
  isCarOwner: true,
  isMechanic: false,
  city: 'New York',
  state: 'NY',
  country: 'United States',
  isClaimed: true,
  ...overrides,
});


/**
 * Generate a unique test user ID
 */
export const generateTestUserId = () => `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Mock request object for testing
 * Supports both Clerk auth (req.auth) and legacy auth (req.user)
 */
export const createMockRequest = (userId?: string, isAdmin = false) => ({
  // Clerk auth structure (req.auth)
  auth: userId
    ? {
        userId,
        sessionClaims: {
          sub: userId,
        },
      }
    : undefined,
  // Legacy auth structure (req.user) - for backward compatibility
  user: userId
    ? {
        claims: { sub: userId },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'test-refresh-token',
      }
    : null,
  isAuthenticated: () => !!userId,
  isAdmin: () => isAdmin,
  body: {},
  params: {},
  query: {},
  headers: {},
  path: '/',
  method: 'GET',
  get: () => 'test-host',
  hostname: 'localhost',
} as any);

/**
 * Mock response object for testing
 */
export const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
  return res as any;
};

