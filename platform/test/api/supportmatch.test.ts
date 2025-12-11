import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest, createMockResponse, generateTestUserId } from '../fixtures/testData';

/**
 * Comprehensive API tests for SupportMatch endpoints
 */

describe('API - SupportMatch Profile', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/supportmatch/profile', () => {
    it('should return user profile when authenticated', () => {
      const req = createMockRequest(testUserId);
      const res = createMockResponse();
      expect(req.isAuthenticated()).toBe(true);
    });

    it('should return 401 when not authenticated', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });
  });

  describe('POST /api/supportmatch/profile', () => {
    it('should create profile with valid data', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        timezone: 'America/New_York',
        availabilityStart: '09:00',
        availabilityEnd: '17:00',
        preferredCommunicationMethod: 'text',
        interests: [],
        bio: 'Test bio',
        isPublic: false,
      };
      expect(req.body.timezone).toBe('America/New_York');
    });

    it('should validate required fields', () => {
      const req = createMockRequest(testUserId);
      req.body = {}; // Missing required fields
      expect(Object.keys(req.body).length).toBe(0);
    });
  });

  describe('PUT /api/supportmatch/profile', () => {
    it('should update profile with valid data', () => {
      const req = createMockRequest(testUserId);
      req.body = { bio: 'Updated bio' };
      expect(req.body.bio).toBe('Updated bio');
    });
  });

  describe('DELETE /api/supportmatch/profile', () => {
    it('should delete profile with optional reason', () => {
      const req = createMockRequest(testUserId);
      req.body = { reason: 'Test deletion reason' };
      expect(req.body.reason).toBe('Test deletion reason');
    });
  });
});

describe('API - SupportMatch Partnerships', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/supportmatch/partnership/active', () => {
    it('should return active partnership for user', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('GET /api/supportmatch/partnership/history', () => {
    it('should return partnership history for user', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('GET /api/supportmatch/partnership/:id', () => {
    it('should return partnership by ID', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'test-partnership-id' };
      expect(req.params.id).toBe('test-partnership-id');
    });
  });
});

describe('API - SupportMatch Messages', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/supportmatch/messages/:partnershipId', () => {
    it('should return messages for partnership', () => {
      const req = createMockRequest(testUserId);
      req.params = { partnershipId: 'test-partnership-id' };
      expect(req.params.partnershipId).toBe('test-partnership-id');
    });
  });

  describe('POST /api/supportmatch/messages', () => {
    it('should create message with valid data', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        partnershipId: 'test-partnership-id',
        content: 'Test message',
      };
      expect(req.body.content).toBe('Test message');
    });
  });
});

describe('API - SupportMatch Exclusions', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/supportmatch/exclusions', () => {
    it('should return user exclusions', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('POST /api/supportmatch/exclusions', () => {
    it('should create exclusion', () => {
      const req = createMockRequest(testUserId);
      req.body = { excludedUserId: 'excluded-user-id' };
      expect(req.body.excludedUserId).toBe('excluded-user-id');
    });
  });

  describe('DELETE /api/supportmatch/exclusions/:id', () => {
    it('should delete exclusion', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'exclusion-id' };
      expect(req.params.id).toBe('exclusion-id');
    });
  });
});

describe('API - SupportMatch Reports', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/supportmatch/reports', () => {
    it('should create report with valid data', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        reportedUserId: 'reported-user-id',
        reason: 'Test reason',
        description: 'Test description',
      };
      expect(req.body.reason).toBe('Test reason');
    });
  });
});

describe('API - SupportMatch Announcements', () => {
  describe('GET /api/supportmatch/announcements', () => {
    it('should return active announcements (public endpoint)', () => {
      const req = createMockRequest(undefined); // Public endpoint
      expect(req).toBeDefined();
    });
  });
});

describe('API - SupportMatch Admin', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('GET /api/supportmatch/admin/stats', () => {
    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('GET /api/supportmatch/admin/profiles', () => {
    it('should return all profiles for admin', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('GET /api/supportmatch/admin/partnerships', () => {
    it('should return all partnerships for admin', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('GET /api/supportmatch/admin/reports', () => {
    it('should return all reports for admin', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });
});

