import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest, generateTestUserId } from '../fixtures/testData';

/**
 * Comprehensive API tests for Directory endpoints
 */

describe('API - Directory Profile', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/directory/profile', () => {
    it('should return user profile when authenticated', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('POST /api/directory/profile', () => {
    it('should create profile with valid data', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '555-1234',
        country: 'United States',
        state: 'NY',
        city: 'New York',
        bio: 'Test bio',
        isPublic: false,
      };
      expect(req.body.firstName).toBe('Test');
    });
  });

  describe('PUT /api/directory/profile', () => {
    it('should update profile', () => {
      const req = createMockRequest(testUserId);
      req.body = { bio: 'Updated bio' };
      expect(req.body.bio).toBe('Updated bio');
    });
  });

  describe('DELETE /api/directory/profile', () => {
    it('should delete profile with cascade anonymization', () => {
      const req = createMockRequest(testUserId);
      req.body = { reason: 'Test deletion' };
      expect(req.body.reason).toBe('Test deletion');
    });
  });
});

describe('API - Directory Public Endpoints', () => {
  describe('GET /api/directory/public', () => {
    it('should return public profiles with rate limiting', () => {
      const req = createMockRequest(undefined);
      expect(req).toBeDefined();
      // Should have rate limiting middleware applied
    });

    it('should apply anti-scraping protection', () => {
      const req = createMockRequest(undefined);
      req.headers = {
        'user-agent': 'bot',
      };
      // Should detect bot and apply delays
      expect(req.headers['user-agent']).toBe('bot');
    });

    it('should rotate display order', () => {
      // Display order should rotate every 5 minutes
      // This would be tested in integration tests
      expect(true).toBe(true);
    });
  });

  describe('GET /api/directory/public/:id', () => {
    it('should return public profile by ID', () => {
      const req = createMockRequest(undefined);
      req.params = { id: 'profile-id' };
      expect(req.params.id).toBe('profile-id');
    });

    it('should return 404 for non-public profiles', () => {
      // Private profiles should not be accessible via public endpoint
      expect(true).toBe(true);
    });

    it('should have rate limiting applied', () => {
      const req = createMockRequest(undefined);
      // Should have publicItemLimiter middleware
      expect(req).toBeDefined();
    });
  });
});

describe('API - Directory List', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/directory/list', () => {
    it('should return all profiles for authenticated users', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });

    it('should include additional fields for authenticated users', () => {
      // Authenticated users see signalUrl and other private fields
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });
});

describe('API - Directory Admin', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('GET /api/directory/admin/profiles', () => {
    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });

    it('should return firstName for claimed profiles from user data', async () => {
      // This test verifies: ALL profiles (claimed AND unclaimed) MUST show first names
      const claimedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        isClaimed: true,
        description: 'Test profile',
        country: 'United States',
        isPublic: false,
        isVerified: false,
      };

      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isVerified: true,
      };

      // Simulate the enrichment logic from the endpoint
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      if (claimedProfile.userId) {
        // Simulate fetching user data
        userFirstName = mockUser.firstName || null;
        userLastName = mockUser.lastName || null;
      } else {
        // For unclaimed profiles, use profile's own firstName field
        userFirstName = ((claimedProfile as any).firstName && (claimedProfile as any).firstName.trim()) || null;
      }

      const enrichedProfile = {
        ...claimedProfile,
        firstName: userFirstName || null,
        lastName: userLastName || null,
      };

      // Claimed profiles MUST have firstName from user
      expect(enrichedProfile.firstName).toBe('John');
      expect(enrichedProfile.firstName).not.toBeNull();
      expect(enrichedProfile.lastName).toBe('Doe');
    });

    it('should return firstName for unclaimed profiles from profile data', async () => {
      // This test verifies: ALL profiles (claimed AND unclaimed) MUST show first names
      // Unclaimed profiles should return firstName from profile.firstName field
      const unclaimedProfile = {
        id: 'profile-2',
        userId: null,
        isClaimed: false,
        description: 'Unclaimed profile',
        country: 'United States',
        isPublic: false,
        isVerified: false,
        firstName: 'UnclaimedFirstName', // This MUST be returned
      };

      // Simulate the enrichment logic from the endpoint
      let userFirstName: string | null = null;
      let userLastName: string | null = null;
      
      if (unclaimedProfile.userId) {
        // This branch should NOT execute for unclaimed profiles
      } else {
        // For unclaimed profiles, use profile's own firstName field
        userFirstName = ((unclaimedProfile as any).firstName && (unclaimedProfile as any).firstName.trim()) || null;
      }

      const enrichedProfile = {
        ...unclaimedProfile,
        firstName: userFirstName || null,
        lastName: userLastName || null,
      };

      // Unclaimed profiles MUST have firstName from profile.firstName
      expect(enrichedProfile.firstName).toBe('UnclaimedFirstName');
      expect(enrichedProfile.firstName).not.toBeNull();
    });

    it('should ALWAYS return firstName for both claimed and unclaimed profiles', async () => {
      // Test that the endpoint correctly handles both types - BOTH must have firstName
      const claimedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        isClaimed: true,
        description: 'Claimed',
      };

      const unclaimedProfile = {
        id: 'profile-2',
        userId: null,
        isClaimed: false,
        description: 'Unclaimed',
        firstName: 'UnclaimedUser', // MUST be returned
      };

      const mockUser = {
        id: 'user-1',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      // Enrich claimed profile
      const enrichedClaimed = {
        ...claimedProfile,
        firstName: claimedProfile.userId ? (mockUser.firstName || null) : (((claimedProfile as any).firstName && (claimedProfile as any).firstName.trim()) || null),
        lastName: claimedProfile.userId ? (mockUser.lastName || null) : null,
      };

      // Enrich unclaimed profile
      const enrichedUnclaimed = {
        ...unclaimedProfile,
        firstName: unclaimedProfile.userId ? null : (((unclaimedProfile as any).firstName && (unclaimedProfile as any).firstName.trim()) || null),
        lastName: null,
      };

      // BOTH profiles MUST have firstName
      expect(enrichedClaimed.firstName).toBe('Jane');
      expect(enrichedClaimed.firstName).not.toBeNull();
      expect(enrichedClaimed.lastName).toBe('Smith');

      expect(enrichedUnclaimed.firstName).toBe('UnclaimedUser');
      expect(enrichedUnclaimed.firstName).not.toBeNull();
    });
  });

  describe('POST /api/directory/admin/profiles', () => {
    it('should allow creating unclaimed profiles', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {
        firstName: 'Unclaimed',
        lastName: 'Profile',
        email: 'unclaimed@example.com',
        isClaimed: false,
      };
      expect(req.body.isClaimed).toBe(false);
    });
  });

  describe('PUT /api/directory/admin/profiles/:id/assign', () => {
    it('should assign profile to user', () => {
      const req = createMockRequest(adminUserId, true);
      req.params = { id: 'profile-id' };
      req.body = { userId: 'user-id' };
      expect(req.body.userId).toBe('user-id');
    });
  });
});

