/**
 * Workforce Recruiter Reports Module
 * 
 * Handles all report generation logic for Workforce Recruiter.
 */

import {
  workforceRecruiterOccupations,
  directoryProfiles,
  skillsJobTitles,
  skillsSkills,
} from "@shared/schema";
import { db } from "../../db";
import { eq, sql, inArray } from "drizzle-orm";
import { normalizeString, buildJobTitleSkillsMap, matchProfileToOccupations } from "./utils";

export class WorkforceRecruiterReports {
  /**
   * Gets the summary report with totals, sector breakdown, skill level breakdown, and training gaps
   */
  async getSummaryReport(): Promise<{
    totalWorkforceTarget: number;
    totalCurrentRecruited: number;
    percentRecruited: number;
    sectorBreakdown: Array<{ sector: string; target: number; recruited: number; percent: number }>;
    skillLevelBreakdown: Array<{ skillLevel: string; target: number; recruited: number; percent: number }>;
    annualTrainingGap: Array<{ occupationId: string; occupationTitle: string; sector: string; target: number; actual: number; gap: number }>;
  }> {
    // Get all occupations
    const occupations = await db.select().from(workforceRecruiterOccupations);
    
    // Get all directory profiles (this is the source of truth for "recruited")
    const allDirectoryProfiles = await db.select().from(directoryProfiles);

    // Calculate totals
    const totalWorkforceTarget = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);
    // Count directory profiles instead of summing currentRecruited from occupations
    const totalCurrentRecruited = allDirectoryProfiles.length;
    const percentRecruited = totalWorkforceTarget > 0 ? (totalCurrentRecruited / totalWorkforceTarget) * 100 : 0;

    // Sector breakdown - count directory profiles that match each sector
    // Use case-insensitive matching for sectors
    // Match by: 1) profile.sectors array, 2) profile.jobTitles that link to sectors, 3) profile.skills that link to job titles that link to sectors
    const sectorMap = new Map<string, { target: number; recruited: number; normalizedKey: string }>();
    const sectorNormalizedToOriginal = new Map<string, string>(); // normalized -> original
    
    // Get all job titles with their sectors for matching
    const allJobTitleIds = occupations
      .map(occ => occ.jobTitleId)
      .filter((id): id is string => id !== null);
    const allJobTitles = allJobTitleIds.length > 0
      ? await db.select().from(skillsJobTitles).where(inArray(skillsJobTitles.id, allJobTitleIds))
      : [];
    const jobTitleToSectorMap = new Map<string, string>(); // jobTitleId -> sector
    occupations.forEach(occ => {
      if (occ.jobTitleId) {
        const jobTitle = allJobTitles.find(jt => jt.id === occ.jobTitleId);
        if (jobTitle) {
          // Get the sector from the occupation (more reliable than job title's sectorId)
          jobTitleToSectorMap.set(occ.jobTitleId, occ.sector);
        }
      }
    });
    
    // Pre-load all job title skills for skill-based matching
    const allJobTitleSkills = allJobTitleIds.length > 0
      ? await db.select().from(skillsSkills).where(inArray(skillsSkills.jobTitleId, allJobTitleIds))
      : [];
    const jobTitleSkillsMap = buildJobTitleSkillsMap(allJobTitleSkills);
    
    occupations.forEach(occ => {
      const normalizedSector = normalizeString(occ.sector);
      if (!sectorNormalizedToOriginal.has(normalizedSector)) {
        sectorNormalizedToOriginal.set(normalizedSector, occ.sector);
      }
      const existing = sectorMap.get(normalizedSector) || { target: 0, recruited: 0, normalizedKey: normalizedSector };
      sectorMap.set(normalizedSector, {
        target: existing.target + occ.headcountTarget,
        recruited: existing.recruited, // Will be updated below
        normalizedKey: normalizedSector,
      });
    });
    
    // Count directory profiles per sector (case-insensitive matching)
    // Match by: 1) profile.sectors, 2) profile.jobTitles, 3) profile.skills
    const profileSectorMatches = new Map<string, Set<string>>(); // profileId -> Set of normalized sectors
    allDirectoryProfiles.forEach(profile => {
      const matchedSectors = new Set<string>();
      
      // Method 1: Direct sector matching from profile.sectors
      if (profile.sectors && profile.sectors.length > 0) {
        profile.sectors.forEach(sector => {
          const normalizedSector = normalizeString(sector);
          matchedSectors.add(normalizedSector);
        });
      }
      
      // Method 2: Match via job titles (profile.jobTitles -> job title -> sector)
      if (profile.jobTitles && profile.jobTitles.length > 0) {
        profile.jobTitles.forEach(jobTitleId => {
          const sector = jobTitleToSectorMap.get(jobTitleId);
          if (sector) {
            matchedSectors.add(normalizeString(sector));
          }
        });
      }
      
      // Method 3: Match via skills (profile.skills -> job title skills -> job title -> sector)
      if (profile.skills && profile.skills.length > 0) {
        const normalizedProfileSkills = new Set(
          profile.skills.map(skill => normalizeString(skill))
        );
        
        // Check each job title to see if its skills match profile skills
        jobTitleToSectorMap.forEach((sector, jobTitleId) => {
          const jobTitleSkills = jobTitleSkillsMap.get(jobTitleId);
          if (jobTitleSkills) {
            // Check if any profile skill matches any job title skill
            const hasMatchingSkill = Array.from(jobTitleSkills).some(jobSkill => 
              normalizedProfileSkills.has(jobSkill)
            );
            if (hasMatchingSkill) {
              matchedSectors.add(normalizeString(sector));
            }
          }
        });
      }
      
      if (matchedSectors.size > 0) {
        profileSectorMatches.set(profile.id, matchedSectors);
      }
    });
    
    // Count profiles per sector
    profileSectorMatches.forEach((matchedSectors, profileId) => {
      matchedSectors.forEach(normalizedSector => {
        const existing = sectorMap.get(normalizedSector);
        if (existing) {
          existing.recruited += 1;
        }
      });
    });
    
    const sectorBreakdown = Array.from(sectorMap.entries()).map(([normalizedSector, data]) => ({
      sector: sectorNormalizedToOriginal.get(normalizedSector) || normalizedSector,
      target: data.target,
      recruited: data.recruited,
      percent: data.target > 0 ? (data.recruited / data.target) * 100 : 0,
    })).sort((a, b) => b.target - a.target);

    // Skill level breakdown - count directory profiles that match occupations by skill level
    const skillLevelMap = new Map<string, { target: number; recruited: number }>();
    occupations.forEach(occ => {
      const existing = skillLevelMap.get(occ.skillLevel) || { target: 0, recruited: 0 };
      skillLevelMap.set(occ.skillLevel, {
        target: existing.target + occ.headcountTarget,
        recruited: existing.recruited, // Will be updated below
      });
    });
    
    // Pre-load all job title skills for efficient matching
    const allJobTitleIds = occupations
      .map(occ => occ.jobTitleId)
      .filter((id): id is string => id !== null);
    const allJobTitleSkills = allJobTitleIds.length > 0
      ? await db.select().from(skillsSkills).where(inArray(skillsSkills.jobTitleId, allJobTitleIds))
      : [];
    
    // Build a map of jobTitleId -> normalized skill names for fast lookup
    const jobTitleSkillsMap = buildJobTitleSkillsMap(allJobTitleSkills);
    
    // Count directory profiles per skill level by matching them to occupations
    // Match by sector, job title, OR skills (case-insensitive)
    const skillLevelProfileCount = new Map<string, Set<string>>();
    allDirectoryProfiles.forEach(profile => {
      // Match profile to occupations based on sector, job title, or skills
      occupations.forEach(occ => {
        let matches = false;
        // Case-insensitive sector matching
        if (profile.sectors && profile.sectors.some(s => 
          normalizeString(s) === normalizeString(occ.sector)
        )) {
          matches = true;
        }
        // Job title matching (exact ID match)
        if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
          matches = true;
        }
        // Skill matching (case-insensitive) - check if profile skills match job title skills
        if (!matches && profile.skills && occ.jobTitleId && profile.skills.length > 0) {
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
            }
          }
        }
        if (matches) {
          if (!skillLevelProfileCount.has(occ.skillLevel)) {
            skillLevelProfileCount.set(occ.skillLevel, new Set());
          }
          skillLevelProfileCount.get(occ.skillLevel)!.add(profile.id);
        }
      });
    });
    
    // Update recruited counts for each skill level
    skillLevelProfileCount.forEach((profileIds, skillLevel) => {
      const existing = skillLevelMap.get(skillLevel);
      if (existing) {
        existing.recruited = profileIds.size;
      }
    });
    
    const skillLevelBreakdown = Array.from(skillLevelMap.entries()).map(([skillLevel, data]) => ({
      skillLevel,
      target: data.target,
      recruited: data.recruited,
      percent: data.target > 0 ? (data.recruited / data.target) * 100 : 0,
    })).sort((a, b) => {
      // Sort by skill level order: Foundational, Intermediate, Advanced
      const order = { 'Foundational': 0, 'Intermediate': 1, 'Advanced': 2 };
      return (order[a.skillLevel as keyof typeof order] ?? 99) - (order[b.skillLevel as keyof typeof order] ?? 99);
    });

    // Annual training gap (target vs actual recruited) - use directory profile count per occupation
    // Match by sector, job title, OR skills (case-insensitive)
    const occupationProfileCount = new Map<string, number>();
    allDirectoryProfiles.forEach(profile => {
      occupations.forEach(occ => {
        let matches = false;
        // Case-insensitive sector matching
        if (profile.sectors && profile.sectors.some(s => 
          normalizeString(s) === normalizeString(occ.sector)
        )) {
          matches = true;
        }
        // Job title matching (exact ID match)
        if (occ.jobTitleId && profile.jobTitles && profile.jobTitles.includes(occ.jobTitleId)) {
          matches = true;
        }
        // Skill matching (case-insensitive) - check if profile skills match job title skills
        if (!matches && profile.skills && occ.jobTitleId && profile.skills.length > 0) {
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
            }
          }
        }
        if (matches) {
          occupationProfileCount.set(occ.id, (occupationProfileCount.get(occ.id) || 0) + 1);
        }
      });
    });
    
    const annualTrainingGap = occupations.map(occ => ({
      occupationId: occ.id,
      occupationTitle: occ.occupationTitle,
      sector: occ.sector,
      target: occ.annualTrainingTarget,
      actual: occupationProfileCount.get(occ.id) || 0,
      gap: occ.annualTrainingTarget - (occupationProfileCount.get(occ.id) || 0),
    })).filter(item => item.gap > 0).sort((a, b) => b.gap - a.gap);

    return {
      totalWorkforceTarget,
      totalCurrentRecruited,
      percentRecruited,
      sectorBreakdown,
      skillLevelBreakdown,
      annualTrainingGap,
    };
  }

  /**
   * Gets detailed report for a specific skill level
   */
  async getSkillLevelDetail(skillLevel: string): Promise<{
    skillLevel: string;
    target: number;
    recruited: number;
    percent: number;
    profiles: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string;
    }>;
  }> {
    // Get occupations for this skill level
    const occupations = await db
      .select()
      .from(workforceRecruiterOccupations)
      .where(eq(workforceRecruiterOccupations.skillLevel, skillLevel));

    const target = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);

    // Get directory profiles and match them to occupations
    // IMPORTANT: Show ALL directory profiles and count ALL as recruited
    // This ensures all 23 profiles appear in workforce recruiter and are counted
    const allProfiles = await db.select().from(directoryProfiles);
    
    // Pre-load all job title skills for efficient matching
    const jobTitleIds = occupations
      .map(occ => occ.jobTitleId)
      .filter((id): id is string => id !== null);
    const allJobTitleSkills = jobTitleIds.length > 0
      ? await db.select().from(skillsSkills).where(inArray(skillsSkills.jobTitleId, jobTitleIds))
      : [];
    
    // Build a map of jobTitleId -> normalized skill names for fast lookup
    const jobTitleSkillsMap = buildJobTitleSkillsMap(allJobTitleSkills);

    const profiles = allProfiles.map(profile => {
      const matchResult = matchProfileToOccupations(
        profile,
        occupations.map(occ => ({
          id: occ.id,
          sector: occ.sector,
          jobTitleId: occ.jobTitleId,
          occupationTitle: occ.occupationTitle,
        })),
        jobTitleSkillsMap
      );

      return {
        profileId: profile.id,
        displayName: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
        skills: profile.skills || [],
        sectors: profile.sectors || [],
        jobTitles: profile.jobTitles || [],
        matchingOccupations: matchResult.matchingOccupations,
        matchReason: matchResult.matchReason,
      };
    });

    // IMPORTANT: Count ALL directory profiles as recruited (all 23 profiles)
    // This ensures the total recruited count matches the number of directory profiles
    const recruited = allProfiles.length;
    const percent = target > 0 ? (recruited / target) * 100 : 0;

    return {
      skillLevel,
      target,
      recruited,
      percent,
      profiles,
    };
  }

  /**
   * Gets detailed report for a specific sector
   */
  async getSectorDetail(sector: string): Promise<{
    sector: string;
    target: number;
    recruited: number;
    percent: number;
    jobTitles: Array<{ id: string; name: string; count: number }>;
    skills: Array<{ name: string; count: number }>;
    occupations: Array<{ id: string; title: string; jobTitleId: string | null; headcountTarget: number; skillLevel: string }>;
    profiles: Array<{
      profileId: string;
      displayName: string;
      skills: string[];
      sectors: string[];
      jobTitles: string[];
      matchingOccupations: Array<{ id: string; title: string; sector: string }>;
      matchReason: string;
    }>;
  }> {
    // Get occupations for this sector (case-insensitive)
    const occupations = await db
      .select()
      .from(workforceRecruiterOccupations)
      .where(sql`LOWER(${workforceRecruiterOccupations.sector}) = LOWER(${sector})`);

    const target = occupations.reduce((sum, occ) => sum + occ.headcountTarget, 0);
    
    // Get directory profiles and count those matching this sector (instead of using currentRecruited)
    // Use case-insensitive matching to match the occupation query
    const allProfiles = await db.select().from(directoryProfiles);
    const normalizedSector = normalizeString(sector);
    const profilesInSector = allProfiles.filter(profile => 
      profile.sectors && profile.sectors.some(s => normalizeString(s) === normalizedSector)
    );
    const recruited = profilesInSector.length;
    const percent = target > 0 ? (recruited / target) * 100 : 0;

    // Get job titles from occupations
    const jobTitleIds = occupations.map(occ => occ.jobTitleId).filter((id): id is string => id !== null);
    const jobTitles = jobTitleIds.length > 0
      ? await db.select().from(skillsJobTitles).where(inArray(skillsJobTitles.id, jobTitleIds))
      : [];

    // Count job titles
    const jobTitleCounts = new Map<string, number>();
    occupations.forEach(occ => {
      if (occ.jobTitleId) {
        jobTitleCounts.set(occ.jobTitleId, (jobTitleCounts.get(occ.jobTitleId) || 0) + 1);
      }
    });
    const jobTitleBreakdown = Array.from(jobTitleCounts.entries()).map(([id, count]) => {
      const jobTitle = jobTitles.find(jt => jt.id === id);
      return {
        id,
        name: jobTitle?.name || 'Unknown',
        count,
      };
    });

    // Count skills from directory profiles (skills are stored as text names, not IDs)
    const skillCounts = new Map<string, number>();
    // Count skills from profiles in this sector (use case-insensitive matching)
    profilesInSector.forEach(profile => {
      if (profile.skills) {
        // Directory profiles store skills as text names, not IDs
        profile.skills.forEach(skillName => {
          if (skillName && skillName.trim()) {
            // Use normalizeString for case-insensitive counting
            const normalizedName = normalizeString(skillName);
            skillCounts.set(normalizedName, (skillCounts.get(normalizedName) || 0) + 1);
          }
        });
      }
    });
    // Convert to array with original case preserved (use first occurrence for display)
    const skillNameMap = new Map<string, string>(); // normalized -> original
    profilesInSector.forEach(profile => {
      if (profile.skills) {
        profile.skills.forEach(skillName => {
          if (skillName && skillName.trim()) {
            const normalizedName = normalizeString(skillName);
            if (!skillNameMap.has(normalizedName)) {
              skillNameMap.set(normalizedName, skillName.trim());
            }
          }
        });
      }
    });
    const skillBreakdown = Array.from(skillCounts.entries()).map(([normalizedName, count]) => {
      return {
        name: skillNameMap.get(normalizedName) || normalizedName,
        count,
      };
    }).sort((a, b) => b.count - a.count);

    // Pre-load all job title skills for efficient matching
    const allJobTitleSkills = jobTitleIds.length > 0
      ? await db.select().from(skillsSkills).where(inArray(skillsSkills.jobTitleId, jobTitleIds))
      : [];
    
    // Build a map of jobTitleId -> normalized skill names for fast lookup
    const jobTitleSkillsMap = buildJobTitleSkillsMap(allJobTitleSkills);

    // Get profiles matching this sector (use case-insensitive matching)
    const profiles = profilesInSector.map(profile => {
      const matchResult = matchProfileToOccupations(
        profile,
        occupations.map(occ => ({
          id: occ.id,
          sector: occ.sector,
          jobTitleId: occ.jobTitleId,
          occupationTitle: occ.occupationTitle,
        })),
        jobTitleSkillsMap
      );

      // Override matchReason to 'sector' if no other match was found (since we're already filtered by sector)
      const matchReason = matchResult.matchingOccupations.length > 0 
        ? matchResult.matchReason 
        : 'sector';

      return {
        profileId: profile.id,
        displayName: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
        skills: profile.skills || [],
        sectors: profile.sectors || [],
        jobTitles: profile.jobTitles || [],
        matchingOccupations: matchResult.matchingOccupations,
        matchReason,
      };
    });

    return {
      sector,
      target,
      recruited,
      percent,
      jobTitles: jobTitleBreakdown,
      skills: skillBreakdown,
      occupations: occupations.map(occ => ({
        id: occ.id,
        title: occ.occupationTitle,
        jobTitleId: occ.jobTitleId,
        headcountTarget: occ.headcountTarget,
        skillLevel: occ.skillLevel,
      })),
      profiles,
    };
  }
}

