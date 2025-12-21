/**
 * Common validation schemas for API endpoints
 */

import { z } from "zod";

/**
 * UUID validation schema for route parameters
 * Validates that an ID is a non-empty string (UUID format)
 */
export const uuidParamSchema = z.string().min(1, "ID is required").uuid("ID must be a valid UUID");

/**
 * Generic ID parameter schema (for non-UUID IDs)
 */
export const idParamSchema = z.string().min(1, "ID is required").max(255, "ID is too long");

/**
 * Schema for user verification request body
 */
export const verifyUserSchema = z.object({
  isVerified: z.boolean({
    required_error: "isVerified is required",
    invalid_type_error: "isVerified must be a boolean",
  }),
});

/**
 * Schema for user approval request body
 */
export const approveUserSchema = z.object({
  isApproved: z.boolean({
    required_error: "isApproved is required",
    invalid_type_error: "isApproved must be a boolean",
  }),
});

