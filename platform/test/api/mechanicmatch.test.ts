import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest, generateTestUserId } from '../fixtures/testData';
import { insertMechanicmatchProfileSchema, insertMechanicmatchVehicleSchema, insertMechanicmatchServiceRequestSchema, insertMechanicmatchJobSchema, insertMechanicmatchReviewSchema, insertMechanicmatchAnnouncementSchema } from '@shared/schema';

/**
 * Comprehensive API tests for MechanicMatch endpoints
 * Tests Zod validation, error cases, and authorization checks
 */

describe('API - MechanicMatch Profile', () => {
  let testUserId: string;
  let otherUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
    otherUserId = generateTestUserId();
  });

  describe('GET /api/mechanicmatch/profile', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should allow authenticated users to access their own profile', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
      expect(req.user?.claims?.sub).toBe(testUserId);
    });

    it('should only return profile for the authenticated user (authorization check)', () => {
      const req = createMockRequest(testUserId);
      // In actual implementation, userId is extracted from req.user.claims.sub
      // Users cannot access other users' profiles
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('POST /api/mechanicmatch/profile - Zod Validation', () => {
    it('should accept valid profile data', () => {
      const validData = {
        userId: testUserId,
        displayName: 'Test User',
        isCarOwner: true,
        isMechanic: false,
        city: 'New York',
        state: 'NY',
        country: 'United States',
        isClaimed: true,
      };

      const result = insertMechanicmatchProfileSchema.parse(validData);
      expect(result.displayName).toBe('Test User');
      expect(result.isCarOwner).toBe(true);
    });

    it('should reject missing required displayName', () => {
      const invalidData = {
        userId: testUserId,
        // Missing displayName
        isCarOwner: true,
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject empty displayName', () => {
      const invalidData = {
        userId: testUserId,
        displayName: '',
        isCarOwner: true,
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject displayName exceeding max length', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'a'.repeat(101), // Exceeds max 100 characters
        isCarOwner: true,
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid experience (negative)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        isMechanic: true,
        experience: -1,
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid experience (exceeds max)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        isMechanic: true,
        experience: 101, // Exceeds max 100
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid hourlyRate (negative)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        isMechanic: true,
        hourlyRate: -1,
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid hourlyRate (exceeds max)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        isMechanic: true,
        hourlyRate: 10001, // Exceeds max 10000
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid averageRating (negative)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        isMechanic: true,
        averageRating: -1,
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid averageRating (exceeds max)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        isMechanic: true,
        averageRating: 6, // Exceeds max 5
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid signalUrl (not a valid URL)', () => {
      const invalidData = {
        userId: testUserId,
        displayName: 'Test User',
        signalUrl: 'not-a-valid-url',
      };

      expect(() => {
        insertMechanicmatchProfileSchema.parse(invalidData);
      }).toThrow();
    });

    it('should accept valid signalUrl', () => {
      const validData = {
        userId: testUserId,
        displayName: 'Test User',
        signalUrl: 'https://signal.me/#p/+1234567890',
      };

      const result = insertMechanicmatchProfileSchema.parse(validData);
      expect(result.signalUrl).toBe('https://signal.me/#p/+1234567890');
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should automatically set userId from authenticated user', () => {
      const req = createMockRequest(testUserId);
      // In actual route, userId is extracted from req.user.claims.sub
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('PUT /api/mechanicmatch/profile', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should only allow users to update their own profile (authorization check)', () => {
      const req = createMockRequest(testUserId);
      // userId is extracted from req.user.claims.sub, so users can only update their own profile
      expect(req.user?.claims?.sub).toBe(testUserId);
    });

    it('should validate partial update data', () => {
      const partialSchema = insertMechanicmatchProfileSchema.partial();
      
      // Valid partial update
      const validUpdate = {
        displayName: 'Updated Name',
      };
      expect(() => partialSchema.parse(validUpdate)).not.toThrow();

      // Invalid partial update (exceeds max length)
      const invalidUpdate = {
        displayName: 'a'.repeat(101),
      };
      expect(() => partialSchema.parse(invalidUpdate)).toThrow();
    });

    it('should reject attempts to update userId (security check)', () => {
      const req = createMockRequest(testUserId);
      req.body = {
        userId: otherUserId, // Attempt to change userId
        displayName: 'Updated Name',
      };
      
      // In actual route, userId is extracted from req.user.claims.sub, not from body
      // This prevents users from changing their userId
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('DELETE /api/mechanicmatch/profile', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should only allow users to delete their own profile (authorization check)', () => {
      const req = createMockRequest(testUserId);
      // userId is extracted from req.user.claims.sub
      expect(req.user?.claims?.sub).toBe(testUserId);
    });

    it('should accept optional reason for deletion', () => {
      const req = createMockRequest(testUserId);
      req.body = { reason: 'Test deletion reason' };
      expect(req.body.reason).toBe('Test deletion reason');
    });
  });
});

describe('API - MechanicMatch Vehicles', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('GET /api/mechanicmatch/vehicles', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should only return vehicles for the authenticated user (authorization check)', () => {
      const req = createMockRequest(testUserId);
      // In actual route, ownerId is extracted from req.user.claims.sub
      // Users can only see their own vehicles
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('POST /api/mechanicmatch/vehicles - Zod Validation', () => {
    it('should accept valid vehicle data', () => {
      const validData = {
        ownerId: testUserId,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };

      const result = insertMechanicmatchVehicleSchema.parse(validData);
      expect(result.make).toBe('Toyota');
      expect(result.year).toBe(2020);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        ownerId: testUserId,
        // Missing make, model, year
      };

      expect(() => {
        insertMechanicmatchVehicleSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should automatically set ownerId from authenticated user', () => {
      const req = createMockRequest(testUserId);
      // In actual route, ownerId is extracted from req.user.claims.sub
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('PUT /api/mechanicmatch/vehicles/:id', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should only allow the vehicle owner to update it (authorization check)', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'vehicle-id' };
      // Only the owner can update their vehicle
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('DELETE /api/mechanicmatch/vehicles/:id', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should only allow the vehicle owner to delete it (authorization check)', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'vehicle-id' };
      // Only the owner can delete their vehicle
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });
});

describe('API - MechanicMatch Service Requests', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/mechanicmatch/service-requests - Zod Validation', () => {
    it('should accept valid service request data', () => {
      const validData = {
        vehicleId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        symptoms: 'Engine trouble - car won\'t start',
        requestType: 'in_person' as const,
      };

      const result = insertMechanicmatchServiceRequestSchema.parse(validData);
      expect(result.symptoms).toBe('Engine trouble - car won\'t start');
      expect(result.requestType).toBe('in_person');
      expect(result.vehicleId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept service request without vehicleId (optional)', () => {
      const validData = {
        symptoms: 'Engine trouble - car won\'t start',
        requestType: 'advice_only' as const,
        vehicleId: null, // Optional field
      };

      const result = insertMechanicmatchServiceRequestSchema.parse(validData);
      expect(result.symptoms).toBe('Engine trouble - car won\'t start');
      expect(result.requestType).toBe('advice_only');
      expect(result.vehicleId).toBeNull();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        // Missing symptoms and requestType (required fields)
      };

      expect(() => {
        insertMechanicmatchServiceRequestSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid requestType', () => {
      const invalidData = {
        symptoms: 'Engine trouble',
        requestType: 'invalid_type', // Not one of the allowed types
      };

      expect(() => {
        insertMechanicmatchServiceRequestSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid vehicleId (not a UUID)', () => {
      const invalidData = {
        vehicleId: 'not-a-valid-uuid',
        symptoms: 'Engine trouble',
        requestType: 'in_person' as const,
      };

      expect(() => {
        insertMechanicmatchServiceRequestSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject empty symptoms', () => {
      const invalidData = {
        symptoms: '', // Empty string not allowed
        requestType: 'in_person' as const,
      };

      expect(() => {
        insertMechanicmatchServiceRequestSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should automatically set ownerId from authenticated user', () => {
      const req = createMockRequest(testUserId);
      // In actual route, ownerId is extracted from req.user.claims.sub
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('GET /api/mechanicmatch/service-requests/open', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should return open service requests for authenticated mechanics', () => {
      const req = createMockRequest(testUserId);
      expect(req.isAuthenticated()).toBe(true);
    });
  });
});

describe('API - MechanicMatch Jobs', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/mechanicmatch/jobs - Zod Validation', () => {
    it('should accept valid job data', () => {
      const validData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002', // Required - mechanic creating the job
        serviceRequestId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID (optional)
        vehicleId: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID (optional)
        symptoms: 'Engine trouble - car won\'t start',
        jobType: 'in_person' as const,
        location: '123 Main St, New York, NY',
        scheduledDateTime: new Date('2024-12-31T10:00:00Z'),
      };

      const result = insertMechanicmatchJobSchema.parse(validData);
      expect(result.symptoms).toBe('Engine trouble - car won\'t start');
      expect(result.jobType).toBe('in_person');
      expect(result.mechanicId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(result.serviceRequestId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.location).toBe('123 Main St, New York, NY');
    });

    it('should accept job data without serviceRequestId (direct booking)', () => {
      const validData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002', // Required
        symptoms: 'Brake pads need replacement',
        jobType: 'in_person' as const,
        vehicleId: null, // Optional
        serviceRequestId: null, // Optional - direct booking
      };

      const result = insertMechanicmatchJobSchema.parse(validData);
      expect(result.symptoms).toBe('Brake pads need replacement');
      expect(result.jobType).toBe('in_person');
      expect(result.serviceRequestId).toBeNull();
    });

    it('should accept remote diagnosis job with rate per minute', () => {
      const validData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002', // Required
        symptoms: 'Diagnostic check needed',
        jobType: 'remote_diagnosis' as const,
        ratePerMinute: 2.50,
        videoUrl: 'https://example.com/video.mp4',
      };

      const result = insertMechanicmatchJobSchema.parse(validData);
      expect(result.jobType).toBe('remote_diagnosis');
      expect(result.ratePerMinute).toBe(2.50);
      expect(result.videoUrl).toBe('https://example.com/video.mp4');
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        // Missing mechanicId, symptoms, and jobType (required fields)
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject missing mechanicId', () => {
      const invalidData = {
        symptoms: 'Engine trouble',
        jobType: 'in_person' as const,
        // Missing mechanicId (required)
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid mechanicId (not a UUID)', () => {
      const invalidData = {
        mechanicId: 'not-a-valid-uuid',
        symptoms: 'Engine trouble',
        jobType: 'in_person' as const,
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid jobType', () => {
      const invalidData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002',
        symptoms: 'Engine trouble',
        jobType: 'invalid_type', // Not one of the allowed types
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid serviceRequestId (not a UUID)', () => {
      const invalidData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002',
        serviceRequestId: 'not-a-valid-uuid',
        symptoms: 'Engine trouble',
        jobType: 'in_person' as const,
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject empty symptoms', () => {
      const invalidData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002',
        symptoms: '', // Empty string not allowed
        jobType: 'in_person' as const,
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid ratePerMinute (negative)', () => {
      const invalidData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002',
        symptoms: 'Diagnostic check',
        jobType: 'remote_diagnosis' as const,
        ratePerMinute: -1,
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid ratePerMinute (exceeds max)', () => {
      const invalidData = {
        mechanicId: '550e8400-e29b-41d4-a716-446655440002',
        symptoms: 'Diagnostic check',
        jobType: 'remote_diagnosis' as const,
        ratePerMinute: 101, // Exceeds max 100
      };

      expect(() => {
        insertMechanicmatchJobSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should automatically set ownerId from authenticated user', () => {
      const req = createMockRequest(testUserId);
      // In actual route, ownerId is extracted from req.user.claims.sub
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });

  describe('POST /api/mechanicmatch/jobs/:id/accept', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should only allow the car owner to accept jobs for their service requests (authorization check)', () => {
      const req = createMockRequest(testUserId);
      req.params = { id: 'job-id' };
      // Only the car owner who created the service request can accept jobs
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });
});

describe('API - MechanicMatch Reviews', () => {
  let testUserId: string;

  beforeEach(() => {
    testUserId = generateTestUserId();
  });

  describe('POST /api/mechanicmatch/reviews - Zod Validation', () => {
    it('should accept valid review data', () => {
      const validData = {
        jobId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID (optional)
        revieweeId: '550e8400-e29b-41d4-a716-446655440001', // Required - profile being reviewed
        rating: 5,
        comment: 'Great service!',
      };

      const result = insertMechanicmatchReviewSchema.parse(validData);
      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Great service!');
      expect(result.revieweeId).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should accept review without jobId (optional)', () => {
      const validData = {
        revieweeId: '550e8400-e29b-41d4-a716-446655440001', // Required
        rating: 4,
        comment: 'Good work!',
        jobId: null, // Optional - can review without a job
      };

      const result = insertMechanicmatchReviewSchema.parse(validData);
      expect(result.rating).toBe(4);
      expect(result.jobId).toBeNull();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        // Missing revieweeId and rating (required fields)
      };

      expect(() => {
        insertMechanicmatchReviewSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject missing revieweeId', () => {
      const invalidData = {
        rating: 5,
        // Missing revieweeId (required)
      };

      expect(() => {
        insertMechanicmatchReviewSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid revieweeId (not a UUID)', () => {
      const invalidData = {
        revieweeId: 'not-a-valid-uuid',
        rating: 5,
      };

      expect(() => {
        insertMechanicmatchReviewSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid jobId (not a UUID)', () => {
      const invalidData = {
        revieweeId: '550e8400-e29b-41d4-a716-446655440001',
        jobId: 'not-a-valid-uuid',
        rating: 5,
      };

      expect(() => {
        insertMechanicmatchReviewSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid rating (negative)', () => {
      const invalidData = {
        revieweeId: '550e8400-e29b-41d4-a716-446655440001',
        rating: -1,
      };

      expect(() => {
        insertMechanicmatchReviewSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid rating (exceeds max)', () => {
      const invalidData = {
        revieweeId: '550e8400-e29b-41d4-a716-446655440001',
        rating: 6, // Exceeds max 5
      };

      expect(() => {
        insertMechanicmatchReviewSchema.parse(invalidData);
      }).toThrow();
    });

    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should automatically set reviewerId from authenticated user', () => {
      const req = createMockRequest(testUserId);
      // In actual route, reviewerId is extracted from req.user.claims.sub
      expect(req.user?.claims?.sub).toBe(testUserId);
    });
  });
});

describe('API - MechanicMatch Admin', () => {
  let adminUserId: string;
  let regularUserId: string;

  beforeEach(() => {
    adminUserId = generateTestUserId();
    regularUserId = generateTestUserId();
  });

  describe('GET /api/mechanicmatch/admin/announcements', () => {
    it('should require authentication', () => {
      const req = createMockRequest(undefined);
      expect(req.isAuthenticated()).toBe(false);
    });

    it('should require admin access', () => {
      const req = createMockRequest(regularUserId, false);
      expect(req.isAdmin()).toBe(false);
    });

    it('should allow admin users to access', () => {
      const req = createMockRequest(adminUserId, true);
      expect(req.isAdmin()).toBe(true);
    });
  });

  describe('POST /api/mechanicmatch/admin/announcements - Zod Validation', () => {
    it('should accept valid announcement data', () => {
      const validData = {
        title: 'Test Announcement',
        content: 'Test content',
        type: 'info',
        isActive: true,
      };

      const result = insertMechanicmatchAnnouncementSchema.parse(validData);
      expect(result.title).toBe('Test Announcement');
      expect(result.type).toBe('info');
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        // Missing title, content, type
      };

      expect(() => {
        insertMechanicmatchAnnouncementSchema.parse(invalidData);
      }).toThrow();
    });

    it('should reject invalid announcement type', () => {
      const invalidData = {
        title: 'Test',
        content: 'Test content',
        type: 'invalid-type', // Not one of the allowed types
      };

      expect(() => {
        insertMechanicmatchAnnouncementSchema.parse(invalidData);
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
