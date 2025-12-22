/**
 * MechanicMatch Admin Utilities
 */

import { z } from "zod";

export const adminProfileFormSchema = z
  .object({
    firstName: z.string().max(100).optional().nullable(),
    isCarOwner: z.boolean().default(false),
    isMechanic: z.boolean().default(true),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    signalUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
    isPublic: z.boolean().default(false),
  })
  .refine((data) => data.isCarOwner || data.isMechanic, {
    message: "Select at least one role",
    path: ["isMechanic"],
  });

export type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;

export function transformProfilePayload(values: AdminProfileFormValues) {
  // Explicitly set all fields to ensure defaults are applied and undefined values are handled
  // Note: isClaimed is only set when creating new profiles, not when updating
  // This prevents claimed profiles from becoming unclaimed when edited
  return {
    firstName: values.firstName?.trim() || null,
    isCarOwner: values.isCarOwner ?? false,
    isMechanic: values.isMechanic ?? false,
    city: values.city?.trim() || null,
    state: values.state?.trim() || null,
    country: values.country?.trim() || null,
    phoneNumber: values.phoneNumber?.trim() || null,
    signalUrl: values.signalUrl?.trim() || null,
    isPublic: values.isPublic ?? false,
    // Explicitly set defaults for fields that have NOT NULL constraints
    isMobileMechanic: false,
    // isClaimed is only set when creating (handled in route), not when updating
  };
}

