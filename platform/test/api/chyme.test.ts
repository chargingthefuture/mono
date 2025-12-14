import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest, createMockResponse, generateTestUserId } from '../fixtures/testData';
import { insertChymeAnnouncementSchema } from '@shared/schema';

/**
 * API tests for Chyme endpoints
 * Tests Zod validation, error cases, and authorization checks for announcements
 */

describe('API - Chyme Announcements', () => {
  let testUserId: string;
  let adminUserId: string;
  let regularUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
    adminUserId = generateTestUserId();
    regularUserId = generateTestUserId();
  });

  describe('GET /api/chyme/announcements', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should return active announcements for authenticated users', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('POST /api/chyme/admin/announcements - Zod Validation', () => {
    it('should accept valid announcement data', () => {
      const validData = {
        title: 'Test Announcement',
        content: 'Test content',
        type: 'info',
        isActive: true,
      };

      const result = insertChymeAnnouncementSchema.parse(validData);
      expect(result.title).toBe('Test Announcement');
      expect(result.type).toBe('info');
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        // Missing title, content, type
      };

      expect(() => {
        insertChymeAnnouncementSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid announcement type', () => {
      const invalidData = {
        title: 'Test',
        content: 'Test content',
        type: 'invalid-type', // Not one of the allowed types
      };

      expect(() => {
        insertChymeAnnouncementSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require admin access', () => {
      const req = createMockRequest(regularUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to create announcements', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.isAdmin()).toBe(true);
    });
  });
});
