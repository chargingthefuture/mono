/**
 * Skills data structure: Sector → Job Title → Skills
 * 
 * This file contains the comprehensive skills hierarchy data.
 * Extracted from seedSkills.ts for better organization.
 */

export const skillsData: {
  sector: {
    name: string;
    estimatedWorkforceShare?: number;
    estimatedWorkforceCount?: number;
    displayOrder: number;
  };
  jobTitles: {
    name: string;
    displayOrder: number;
    skills: string[];
  }[];
}[] = [
  // NOTE: This is a placeholder. The actual data (1,600+ lines) should be extracted
  // from seedSkills.ts lines 13-1691
  // 
  // To complete this extraction:
  // 1. Copy the skillsData array from seedSkills.ts (lines 13-1691)
  // 2. Paste it here
  // 3. Update seedSkills.ts to import from this file
];

