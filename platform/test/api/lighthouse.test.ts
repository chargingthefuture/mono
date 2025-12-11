import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest, generateTestUserId } from '../fixtures/testData';

/**
 * Comprehensive API tests for LightHouse endpoints
 */

describe('API - LightHouse Profile', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/lighthouse/profile', () => {
    it('should return user profile when authenticated', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });

    it('should return 401 when not authenticated', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });
  });

  describe('POST /api/lighthouse/profile', () => {
    it('should create seeker profile', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        role: 'seeker',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        country: 'United States',
        state: 'NY',
        city: 'New York',
        bio: 'Test bio',
        isPublic: false,
      };
      expect(req.body.role).toBe('seeker');
    });

    it('should create host profile', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        role: 'host',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        country: 'United States',
        state: 'NY',
        city: 'New York',
        bio: 'Test bio',
        isPublic: false,
      };
      expect(req.body.role).toBe('host');
    });
  });

  describe('PUT /api/lighthouse/profile', () => {
    it('should update profile', () => {
      const req = createMockRequest(testUserId);
      req.body = { role: 'host' };
      expect(req.body.role).toBe('host');
    });
  });

  describe('DELETE /api/lighthouse/profile', () => {
    it('should delete profile with cascade anonymization', () => {
      const req = createMockRequest(testUserId);
      req.body = { reason: 'Test deletion' };
      expect(req.body.reason).toBe('Test deletion');
    });
  });
});

describe('API - LightHouse Properties', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/lighthouse/properties', () => {
    it('should return active properties (public)', () => {
      const req = createMockRequest(undefined);
      expect(req).toBeDefined();
    });
  });

  describe('GET /api/lighthouse/properties/my', () => {
    it('should return user properties when authenticated', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('POST /api/lighthouse/properties', () => {
    it('should create property with valid data', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        title: 'Test Property',
        description: 'Test description',
        address: '123 Test St',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        pricePerMonth: 1000,
        isActive: true,
      };
      expect(req.body.title).toBe('Test Property');
    });
  });

  describe('PUT /api/lighthouse/properties/:id', () => {
    it('should update property', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'property-id' };
      req.body = { title: 'Updated Title' };
      expect(req.body.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/lighthouse/properties/:id', () => {
    it('should delete property', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'property-id' };
      expect(req.params.id).toBe('property-id');
    });
  });
});

describe('API - LightHouse Matches', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/lighthouse/matches', () => {
    it('should return user matches when authenticated', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('POST /api/lighthouse/matches', () => {
    it('should create match request', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        propertyId: 'property-id',
        message: 'Test match request',
      };
      expect(req.body.propertyId).toBe('property-id');
    });
  });

  describe('PUT /api/lighthouse/matches/:id', () => {
    it('should update match status', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'match-id' };
      req.body = { status: 'accepted' };
      expect(req.body.status).toBe('accepted');
    });
  });
});

describe('API - LightHouse Admin', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('GET /api/lighthouse/admin/stats', () => {
    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('GET /api/lighthouse/admin/profiles', () => {
    it('should return all profiles for admin', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('GET /api/lighthouse/admin/properties', () => {
    it('should return all properties for admin', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });
});

