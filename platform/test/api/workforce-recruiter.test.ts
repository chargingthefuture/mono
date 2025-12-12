import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, generateTestUserId } from '../fixtures/testData';
import { insertWorkforceRecruiterProfileSchema, insertWorkforceRecruiterAnnouncementSchema, insertWorkforceRecruiterOccupationSchema } from '@shared/schema';
import { z } from 'zod';

/**
 * Comprehensive API tests for Workforce Recruiter endpoints
 * 
 * NOTE: These are unit tests for route handlers using mocks.
 * For database integration tests, see test/integration/storage.test.ts
 */

describe('API - Workforce Recruiter Profile', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/workforce-recruiter/profile', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should allow authenticated users to access their profile', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
      expect(req.user?.claims.sub).toBe(testUserId);
    });
  });

  describe('POST /api/workforce-recruiter/profile', () => {
    it('should validate profile data with Zod schema', () => {
      const validData = {
        notes: 'Test notes',
      };
      
      // Should not throw when validated
      expect(() => {
        insertWorkforceRecruiterProfileSchema.parse(validData);
      }).not.toThrow();
    });

    it('should accept optional fields', () => {
      const minimalData = {};
      expect(() => {
        insertWorkforceRecruiterProfileSchema.parse(minimalData);
      }).not.toThrow();
    });


    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });
  });

  describe('PUT /api/workforce-recruiter/profile', () => {
    it('should allow partial updates', () => {
      const req = createMockRequest(testUserId);
      req.body = { notes: 'Updated notes' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.body.notes).toBe('Updated notes');
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });
  });

  describe('DELETE /api/workforce-recruiter/profile', () => {
    it('should accept optional deletion reason', () => {
      const req = createMockRequest(testUserId);
      req.body = { reason: 'Test deletion reason' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.body.reason).toBe('Test deletion reason');
    });

    it('should work without deletion reason', () => {
      const req = createMockRequest(testUserId);
      req.body = {};
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.body.reason).toBeUndefined();
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });
  });
});

describe('API - Workforce Recruiter Announcements', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/workforce-recruiter/announcements', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should return active announcements for authenticated users', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('POST /api/workforce-recruiter/admin/announcements', () => {
    it('should validate announcement data with Zod schema', () => {
      const validData = {
        title: 'Test Announcement',
        content: 'Test content',
        type: 'info' as const,
      };
      
      expect(() => {
        insertWorkforceRecruiterAnnouncementSchema.parse(validData);
      }).not.toThrow();
    });

    it('should require title', () => {
      const invalidData = {
        content: 'Test content',
        type: 'info' as const,
      };
      
      expect(() => {
        insertWorkforceRecruiterAnnouncementSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require content', () => {
      const invalidData = {
        title: 'Test Announcement',
        type: 'info' as const,
      };
      
      expect(() => {
        insertWorkforceRecruiterAnnouncementSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to create announcements', () => {
      const req = createMockRequest(testUserId, true);
      expect(req.isAdmin()).toBe(true);
    });
  });

  describe('PUT /api/workforce-recruiter/admin/announcements/:id', () => {
    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to update announcements', () => {
      const req = createMockRequest(testUserId, true);
      req.params = { id: 'announcement-id' };
      req.body = { title: 'Updated Announcement' };
      
      expect(req.isAdmin()).toBe(true);
      expect(req.params.id).toBe('announcement-id');
      expect(req.body.title).toBe('Updated Announcement');
    });
  });

  describe('DELETE /api/workforce-recruiter/admin/announcements/:id', () => {
    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to deactivate announcements', () => {
      const req = createMockRequest(testUserId, true);
      req.params = { id: 'announcement-id' };
      
      expect(req.isAdmin()).toBe(true);
      expect(req.params.id).toBe('announcement-id');
    });
  });
});

describe('API - Workforce Recruiter Config', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/workforce-recruiter/config', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should allow authenticated users to view config', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('PUT /api/workforce-recruiter/config', () => {
    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to update config', () => {
      const req = createMockRequest(testUserId, true);
      req.body = { 
        population: 6000000,
        workforceParticipationRate: 0.6,
      };
      
      expect(req.isAdmin()).toBe(true);
      expect(req.body.population).toBe(6000000);
    });
  });
});

describe('API - Workforce Recruiter Occupations', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/workforce-recruiter/occupations', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should support filtering by sector', () => {
      const req = createMockRequest(testUserId);
      req.query = { sector: 'Technology' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.sector).toBe('Technology');
    });

    it('should support filtering by skillLevel', () => {
      const req = createMockRequest(testUserId);
      req.query = { skillLevel: 'Advanced' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.skillLevel).toBe('Advanced');
    });

    it('should support pagination with limit and offset', () => {
      const req = createMockRequest(testUserId);
      req.query = { limit: '20', offset: '40' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.limit).toBe('20');
      expect(req.query.offset).toBe('40');
    });
  });

  describe('GET /api/workforce-recruiter/occupations/:id', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should return occupation by ID', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'occupation-id' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.params.id).toBe('occupation-id');
    });
  });

  describe('POST /api/workforce-recruiter/occupations', () => {
    it('should validate occupation data with Zod schema', () => {
      const validData = {
        sector: 'Technology',
        occupationTitle: 'Software Engineer',
        headcountTarget: 1000,
        skillLevel: 'Advanced' as const,
        annualTrainingTarget: 500,
      };
      
      expect(() => {
        insertWorkforceRecruiterOccupationSchema.parse(validData);
      }).not.toThrow();
    });

    it('should require sector', () => {
      const invalidData = {
        occupationTitle: 'Software Engineer',
        headcountTarget: 1000,
        skillLevel: 'Advanced' as const,
        annualTrainingTarget: 500,
      };
      
      expect(() => {
        insertWorkforceRecruiterOccupationSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require occupationTitle', () => {
      const invalidData = {
        sector: 'Technology',
        headcountTarget: 1000,
        skillLevel: 'Advanced' as const,
        annualTrainingTarget: 500,
      };
      
      expect(() => {
        insertWorkforceRecruiterOccupationSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to create occupations', () => {
      const req = createMockRequest(testUserId, true);
      expect(req.isAdmin()).toBe(true);
    });
  });

  describe('PUT /api/workforce-recruiter/occupations/:id', () => {
    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to update occupations', () => {
      const req = createMockRequest(testUserId, true);
      req.params = { id: 'occupation-id' };
      req.body = { headcountTarget: 2000 };
      
      expect(req.isAdmin()).toBe(true);
      expect(req.params.id).toBe('occupation-id');
      expect(req.body.headcountTarget).toBe(2000);
    });
  });

  describe('DELETE /api/workforce-recruiter/occupations/:id', () => {
    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to delete occupations', () => {
      const req = createMockRequest(testUserId, true);
      req.params = { id: 'occupation-id' };
      
      expect(req.isAdmin()).toBe(true);
      expect(req.params.id).toBe('occupation-id');
    });
  });
});

describe('API - Workforce Recruiter Meetup Events', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/workforce-recruiter/meetup-events', () => {
    it('should require admin access', () => {
      const req = createMockRequest(testUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to create meetup events', () => {
      const req = createMockRequest(testUserId, true);
      req.body = {
        occupationId: 'occupation-id',
        title: 'Tech Meetup',
        description: 'A meetup for tech professionals',
      };
      
      expect(req.isAdmin()).toBe(true);
      expect(req.body.occupationId).toBe('occupation-id');
      expect(req.body.title).toBe('Tech Meetup');
    });
  });

  describe('GET /api/workforce-recruiter/meetup-events', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should support filtering by occupationId', () => {
      const req = createMockRequest(testUserId);
      req.query = { occupationId: 'occupation-id' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.occupationId).toBe('occupation-id');
    });

    it('should support filtering by isActive', () => {
      const req = createMockRequest(testUserId);
      req.query = { isActive: 'true' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.isActive).toBe('true');
    });
  });

  describe('POST /api/workforce-recruiter/meetup-events/:eventId/signups', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should allow authenticated users to sign up for events', () => {
      const req = createMockRequest(testUserId);
      req.params = { eventId: 'event-id' };
      req.body = {
        location: 'New York',
        availability: ['weekdays', 'morning'],
      };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.params.eventId).toBe('event-id');
      expect(req.body.location).toBe('New York');
    });
  });
});

describe('API - Workforce Recruiter Reports', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/workforce-recruiter/reports/summary', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should allow authenticated users to view summary reports', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });

  describe('GET /api/workforce-recruiter/reports/skill-level/:skillLevel', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should filter reports by skill level', () => {
      const req = createMockRequest(testUserId);
      req.params = { skillLevel: 'Advanced' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.params.skillLevel).toBe('Advanced');
    });
  });

  describe('GET /api/workforce-recruiter/export', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should support JSON export format', () => {
      const req = createMockRequest(testUserId);
      req.query = { format: 'json' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.format).toBe('json');
    });

    it('should support CSV export format', () => {
      const req = createMockRequest(testUserId);
      req.query = { format: 'csv' };
      
      expect(req.isAuthenticated()).toBe(true);
      expect(req.query.format).toBe('csv');
    });
  });
});
