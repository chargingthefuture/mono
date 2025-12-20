/**
 * Workforce Recruiter Utility Functions
 * 
 * Shared utilities for case-insensitive matching and profile operations.
 */

/**
 * Normalizes a string for case-insensitive comparison
 */
export function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Builds a map of jobTitleId -> normalized skill names for fast lookup
 */
export function buildJobTitleSkillsMap(
  jobTitleSkills: Array<{ jobTitleId: string; name: string }>
): Map<string, Set<string>> {
  const jobTitleSkillsMap = new Map<string, Set<string>>();
  jobTitleSkills.forEach(skill => {
    if (!jobTitleSkillsMap.has(skill.jobTitleId)) {
      jobTitleSkillsMap.set(skill.jobTitleId, new Set());
    }
    jobTitleSkillsMap.get(skill.jobTitleId)!.add(normalizeString(skill.name));
  });
  return jobTitleSkillsMap;
}

/**
 * Matches a profile to occupations based on sector, job title, or skills
 * Only matches if there's a REAL connection - skills must match the job title skills for that specific occupation
 */
export function matchProfileToOccupations(
  profile: {
    sectors?: string[] | null;
    jobTitles?: string[] | null;
    skills?: string[] | null;
  },
  occupations: Array<{
    id: string;
    sector: string;
    jobTitleId: string | null;
    occupationTitle: string;
  }>,
  jobTitleSkillsMap: Map<string, Set<string>>
): {
  matchingOccupations: Array<{ id: string; title: string; sector: string }>;
  matchReason: string;
} {
  const matchingOccupations: Array<{ id: string; title: string; sector: string }> = [];
  let matchReason = 'none';

  for (const occ of occupations) {
    let matches = false;
    let currentMatchReason = 'none';
    
    // Method 1: Case-insensitive sector matching (only if profile explicitly has this sector)
    if (profile.sectors && profile.sectors.length > 0) {
      const profileSectorsNormalized = profile.sectors.map(s => normalizeString(s));
      if (profileSectorsNormalized.includes(normalizeString(occ.sector))) {
        matches = true;
        currentMatchReason = 'sector';
      }
    }
    
    // Method 2: Job title matching (exact ID match) - strongest match
    if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.length > 0) {
      if (profile.jobTitles.includes(occ.jobTitleId)) {
        matches = true;
        currentMatchReason = 'jobTitle'; // Job title match takes precedence
      }
    }
    
    // Method 3: Skill matching (case-insensitive) - only if profile skills match THIS occupation's job title skills
    // This is the most precise match - skills must match the job title skills for THIS specific occupation
    if (!matches && profile.skills && profile.skills.length > 0 && occ.jobTitleId) {
      const jobTitleSkills = jobTitleSkillsMap.get(occ.jobTitleId);
      if (jobTitleSkills && jobTitleSkills.size > 0) {
        const normalizedProfileSkills = new Set(
          profile.skills.map(skill => normalizeString(skill))
        );
        // Check if any profile skill matches any job title skill for THIS occupation's job title
        const hasMatchingSkill = Array.from(jobTitleSkills).some(jobSkill => 
          normalizedProfileSkills.has(jobSkill)
        );
        if (hasMatchingSkill) {
          matches = true;
          currentMatchReason = 'skill';
        }
      }
    }

    // Only add if there's a real match
    if (matches) {
      matchingOccupations.push({
        id: occ.id,
        title: occ.occupationTitle,
        sector: occ.sector,
      });
      // Update overall match reason (prioritize: jobTitle > skill > sector)
      if (matchReason === 'none' || 
          (currentMatchReason === 'jobTitle') ||
          (currentMatchReason === 'skill' && matchReason !== 'jobTitle') ||
          (currentMatchReason === 'sector' && matchReason === 'none')) {
        matchReason = currentMatchReason;
      }
    }
  }

  return {
    matchingOccupations,
    matchReason: matchReason === 'none' && matchingOccupations.length === 0 ? 'general' : matchReason,
  };
}

