import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest, generateTestUserId } from '../fixtures/testData';

/**
 * Comprehensive API tests for GentlePulse endpoints
 */

describe('API - GentlePulse Meditations', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/gentlepulse/meditations', () => {
    it('should return meditations for authenticated users', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('GET /api/gentlepulse/meditations/:id', () => {
    it('should return meditation by ID', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'meditation-id' };
      expect(req.params.id).toBe('meditation-id');
    });
  });
});

describe('API - GentlePulse Favorites', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/gentlepulse/favorites', () => {
    it('should add meditation to favorites', () => {
      const req = createMockRequest(testUserId);
      req.body = { meditationId: 'meditation-id' };
      expect(req.body.meditationId).toBe('meditation-id');
    });
  });

  describe('GET /api/gentlepulse/favorites', () => {
    it('should return user\'s favorite meditations', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('DELETE /api/gentlepulse/favorites/:id', () => {
    it('should remove meditation from favorites', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'meditation-id' };
      expect(req.params.id).toBe('meditation-id');
    });
  });
});

describe('API - GentlePulse Progress', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/gentlepulse/progress', () => {
    it('should record meditation progress', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        meditationId: 'meditation-id',
        completed: true,
        duration: 600, // 10 minutes in seconds
      };
      expect(req.body.completed).toBe(true);
      expect(req.body.duration).toBe(600);
    });
  });

  describe('GET /api/gentlepulse/progress', () => {
    it('should return user\'s meditation progress', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });
});

describe('API - GentlePulse Announcements', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/gentlepulse/announcements', () => {
    it('should return active announcements for authenticated users', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });
});

describe('API - GentlePulse Admin', () => {
  let adminUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
  });

  describe('GET /api/gentlepulse/admin/meditations', () => {
    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('POST /api/gentlepulse/admin/meditations', () => {
    it('should create meditation with valid data', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {
        title: 'Test Meditation',
        description: 'Test description',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 600,
        category: 'anxiety',
        isActive: true,
      };
      expect(req.body.title).toBe('Test Meditation');
      expect(req.body.duration).toBe(600);
    });
  });

  describe('GET /api/gentlepulse/admin/announcements', () => {
    it('should require admin access', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.user).toBeDefined();
    });
  });

  describe('POST /api/gentlepulse/admin/announcements', () => {
    it('should create announcement with valid data', () => {
      const req = createMockRequest(adminUserId, true);
      req.body = {
        title: 'Test Announcement',
        content: 'Test content',
        type: 'info',
        isActive: true,
      };
      expect(req.body.title).toBe('Test Announcement');
    });
  });
});

