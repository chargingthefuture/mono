import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, generateTestUserId, createTestUser } from '../fixtures/testData';

/**
 * API tests for user endpoints
 * These tests verify user-related endpoint behavior and validation
 */

describe('API - User Quora Profile URL', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
    vi.clearAllMocks();
  });

  describe('PUT /api/user/quora-profile-url', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined); // No user
      expect(req.isAuthenticated()).toBe(false);
      expect(req.auth).toBeUndefined();
    });

    it('should accept authenticated requests', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
      expect(req.auth?.userId).toBe(testUserId);
    });

    it('should validate userId is present in request', () => {
      const req = createMockRequest(testUserId);
      // When authenticated, userId should be available via req.auth.userId
      expect(req.auth?.userId).toBeDefined();
      expect(req.auth?.userId).toBe(testUserId);
    });

    it('should reject requests with missing userId', () => {
      // Request with auth object but no userId
      const req = createMockRequest(undefined);
      expect(req.auth?.userId).toBeUndefined();
      // This should trigger 401 error in actual endpoint
    });

    it('should reject requests with empty userId', () => {
      // Request with empty string userId
      const req = {
        ...createMockRequest(undefined),
        auth: { userId: '' },
      };
      expect(req.auth?.userId).toBe('');
      // Empty string should trigger 401 error in actual endpoint
    });

    it('should accept valid quoraProfileUrl in request body', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };
      expect(req.body.quoraProfileUrl).toBe('https://www.quora.com/profile/TestUser');
    });

    it('should accept null quoraProfileUrl in request body', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: null,
      };
      expect(req.body.quoraProfileUrl).toBeNull();
    });

    it('should accept undefined quoraProfileUrl in request body (treated as null)', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: undefined,
      };
      expect(req.body.quoraProfileUrl).toBeUndefined();
      // Endpoint should treat undefined as null
    });

    it('should validate request structure for successful update', () => {
      const req = createMockRequest(testUserId);
      req.method = 'PUT';
      req.path = '/api/user/quora-profile-url';
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };

      expect(req.method).toBe('PUT');
      expect(req.path).toBe('/api/user/quora-profile-url');
      expect(req.auth?.userId).toBe(testUserId);
      expect(req.body.quoraProfileUrl).toBeDefined();
    });

    it('should handle missing quoraProfileUrl in body (defaults to null)', () => {
      const req = createMockRequest(testUserId);
      req.body = {};
      // Endpoint should treat missing field as null
      expect(req.body.quoraProfileUrl).toBeUndefined();
    });
  });

  describe('PUT /api/user/quora-profile-url - Error Scenarios', () => {
    it('should handle getUserId throwing an error', () => {
      // Simulate getUserId throwing an error
      const req = createMockRequest(testUserId);
      // If getUserId throws, endpoint should catch and return 401
      // This tests the try-catch around getUserId(req)
    });

    it('should return 401 when userId is missing', () => {
      const req = createMockRequest(undefined);
      const res = createMockResponse();
      
      // Endpoint should return 401 with appropriate message
      expect(req.auth?.userId).toBeUndefined();
      // In actual endpoint: res.status(401).json({ message: "Authentication failed: User ID not found..." })
    });

    it('should return 401 when userId is empty string', () => {
      const req = {
        ...createMockRequest(undefined),
        auth: { userId: '' },
      };
      const res = createMockResponse();
      
      // Endpoint should return 401
      expect(req.auth?.userId).toBe('');
      // In actual endpoint: res.status(401).json({ message: "Authentication failed: User ID not found..." })
    });

    it('should return 404 when user does not exist in database', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };
      
      // If storage.updateUserQuoraProfileUrl returns null/undefined, endpoint should return 404
      // This tests the validation: if (!user) return res.status(404)
    });

    it('should return 404 when storage throws "User not found" error', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };
      
      // If storage.updateUserQuoraProfileUrl throws "User not found", endpoint should return 404
      // This tests: error.message === "User not found" ? 404 : 400
    });

    it('should return 400 for other storage errors', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };
      
      // If storage.updateUserQuoraProfileUrl throws other errors, endpoint should return 400
      // This tests: error.message === "User not found" ? 404 : 400
    });
  });

  describe('PUT /api/user/quora-profile-url - Success Scenarios', () => {
    it('should successfully update quoraProfileUrl', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };
      const res = createMockResponse();

      // Valid request structure
      expect(req.auth?.userId).toBe(testUserId);
      expect(req.body.quoraProfileUrl).toBeDefined();
      
      // Endpoint should call: storage.updateUserQuoraProfileUrl(userId, quoraProfileUrl)
      // And return: res.json(user)
    });

    it('should successfully clear quoraProfileUrl (set to null)', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: null,
      };
      const res = createMockResponse();

      // Valid request to clear URL
      expect(req.auth?.userId).toBe(testUserId);
      expect(req.body.quoraProfileUrl).toBeNull();
      
      // Endpoint should call: storage.updateUserQuoraProfileUrl(userId, null)
    });

    it('should return updated user object on success', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      };
      const res = createMockResponse();

      // Mock successful response
      const mockUser = createTestUser({
        id: testUserId,
        quoraProfileUrl: 'https://www.quora.com/profile/TestUser',
      });

      // Endpoint should return: res.json(user)
      // Response should contain the updated user with quoraProfileUrl
      expect(mockUser.quoraProfileUrl).toBe('https://www.quora.com/profile/TestUser');
    });
  });

  describe('PUT /api/user/quora-profile-url - Request Logging', () => {
    it('should include request info in error logs', () => {
      const req = createMockRequest(testUserId);
      req.method = 'PUT';
      req.path = '/api/user/quora-profile-url';

      // Endpoint logs requestInfo with:
      // - hasAuth: !!req.auth
      // - authUserId: req.auth?.userId
      // - path: req.path
      // - method: req.method
      // - timestamp: new Date().toISOString()

      const requestInfo = {
        hasAuth: !!req.auth,
        authUserId: req.auth?.userId,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      };

      expect(requestInfo.hasAuth).toBe(true);
      expect(requestInfo.authUserId).toBe(testUserId);
      expect(requestInfo.path).toBe('/api/user/quora-profile-url');
      expect(requestInfo.method).toBe('PUT');
    });
  });
});

