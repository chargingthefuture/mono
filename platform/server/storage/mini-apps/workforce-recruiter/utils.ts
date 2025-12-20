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
    
    // Case-insensitive sector matching
    if (profile.sectors && profile.sectors.some(s => 
      normalizeString(s) === normalizeString(occ.sector)
    )) {
      matches = true;
      if (matchReason === 'none') matchReason = 'sector';
    }
    
    // Job title matching (exact ID match)
    if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
      matches = true;
      matchReason = 'jobTitle';
    }
    
    // Skill matching (case-insensitive)
    if (profile.skills && occ.jobTitleId && profile.skills.length > 0) {
      const jobTitleSkills = jobTitleSkillsMap.get(occ.jobTitleId);
      if (jobTitleSkills) {
        const normalizedProfileSkills = new Set(
          profile.skills.map(skill => normalizeString(skill))
        );
        // Check if any profile skill matches any job title skill
        const hasMatchingSkill = Array.from(jobTitleSkills).some(jobSkill => 
          normalizedProfileSkills.has(jobSkill)
        );
        if (hasMatchingSkill) {
          matches = true;
          if (matchReason === 'none') matchReason = 'skill';
        }
      }
    }

    if (matches) {
      matchingOccupations.push({
        id: occ.id,
        title: occ.occupationTitle,
        sector: occ.sector,
      });
    }
  }

  return {
    matchingOccupations,
    matchReason: matchReason === 'none' && matchingOccupations.length === 0 ? 'general' : matchReason,
  };
}

