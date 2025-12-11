import { db } from "../server/db";
import { directoryProfiles, workforceRecruiterOccupations, skillsJobTitles, skillsSkills, skillsSectors } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Diagnostic script to identify skills that are matching incorrectly
 * 
 * This script analyzes skill matching patterns to find:
 * - Skills that match too many sectors (potential false positives)
 * - Skills that don't match when they should
 * - Skills with normalization issues
 */
async function diagnoseSkillMatching() {
  console.log("🔍 Diagnosing skill matching issues...\n");

  try {
    // Get all directory profiles with skills
    const profiles = await db
      .select()
      .from(directoryProfiles)
      .where(sql`array_length(${directoryProfiles.skills}, 1) > 0`);

    console.log(`Found ${profiles.length} profiles with skills\n`);

    // Get all occupations
    const occupations = await db.select().from(workforceRecruiterOccupations);

    // Build skills database maps
    const allSectors = await db.select().from(skillsSectors);
    const allJobTitles = await db.select().from(skillsJobTitles);
    const allSkills = await db.select().from(skillsSkills);

    const sectorIdToNameMap = new Map<string, string>();
    for (const sector of allSectors) {
      sectorIdToNameMap.set(sector.id, sector.name);
    }

    const jobTitleToSectorMap = new Map<string, string>();
    const jobTitleIdToNameMap = new Map<string, string>();
    for (const jobTitle of allJobTitles) {
      jobTitleIdToNameMap.set(jobTitle.id, jobTitle.name);
      const sectorName = sectorIdToNameMap.get(jobTitle.sectorId);
      if (sectorName) {
        jobTitleToSectorMap.set(jobTitle.id, sectorName);
      }
    }

    const jobTitleSkillsMap = new Map<string, Set<string>>();
    const skillNameToSectorsMap = new Map<string, Set<string>>();
    
    // Normalize skill name helper (same as in storage.ts)
    const normalizeSkillName = (skill: string): string => {
      return skill
        .toLowerCase()
        .trim()
        .replace(/[.,;:!?()[\]{}'"]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s/g, '');
    };

    for (const skill of allSkills) {
      if (!jobTitleSkillsMap.has(skill.jobTitleId)) {
        jobTitleSkillsMap.set(skill.jobTitleId, new Set());
      }
      const normalizedSkillName = normalizeSkillName(skill.name);
      jobTitleSkillsMap.get(skill.jobTitleId)!.add(normalizedSkillName);
      
      const jobTitleSector = jobTitleToSectorMap.get(skill.jobTitleId);
      if (jobTitleSector) {
        if (!skillNameToSectorsMap.has(normalizedSkillName)) {
          skillNameToSectorsMap.set(normalizedSkillName, new Set());
        }
        skillNameToSectorsMap.get(normalizedSkillName)!.add(jobTitleSector);
      }
    }

    // Build occupation skills map
    const occupationSkillsMap = new Map<string, Set<string>>();
    const occupationSectorMap = new Map<string, string>();
    
    for (const occ of occupations) {
      occupationSectorMap.set(occ.id, occ.sector || "Unknown");
      if (occ.jobTitleId) {
        if (jobTitleSkillsMap.has(occ.jobTitleId)) {
          occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(occ.jobTitleId)!);
        }
      } else {
        // Fallback: match by occupation title name
        const normalizedOccTitle = occ.occupationTitle.toLowerCase().trim();
        for (const [jobTitleId, jobTitleName] of jobTitleIdToNameMap.entries()) {
          const normalizedJobTitle = jobTitleName.toLowerCase().trim();
          if (normalizedOccTitle === normalizedJobTitle) {
            if (jobTitleSkillsMap.has(jobTitleId)) {
              occupationSkillsMap.set(occ.id, jobTitleSkillsMap.get(jobTitleId)!);
            }
            break;
          }
        }
      }
    }

    // Analyze each profile skill
    const skillMatchStats = new Map<string, {
      skill: string;
      normalized: string;
      matchCount: number;
      sectors: Set<string>;
      occupations: Set<string>;
    }>();

    for (const profile of profiles) {
      const profileSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
      
      for (const profileSkill of profileSkills) {
        const normalized = normalizeSkillName(profileSkill);
        
        if (!skillMatchStats.has(normalized)) {
          skillMatchStats.set(normalized, {
            skill: profileSkill,
            normalized,
            matchCount: 0,
            sectors: new Set(),
            occupations: new Set(),
          });
        }

        const stats = skillMatchStats.get(normalized)!;

        // Check which occupations this skill matches
        for (const occ of occupations) {
          const occSkills = occupationSkillsMap.get(occ.id) || new Set<string>();
          const occSector = occupationSectorMap.get(occ.id) || "Unknown";

          // Simple matching logic (same as storage.ts)
          let matches = false;
          
          // Exact match
          for (const occSkill of occSkills) {
            const normalizedOccSkill = normalizeSkillName(occSkill);
            if (normalized === normalizedOccSkill) {
              matches = true;
              break;
            }
          }

          // Partial match
          if (!matches) {
            for (const occSkill of occSkills) {
              const normalizedOccSkill = normalizeSkillName(occSkill);
              const shorterLength = Math.min(normalized.length, normalizedOccSkill.length);
              const longerLength = Math.max(normalized.length, normalizedOccSkill.length);
              
              if (shorterLength >= 3 && longerLength > 0) {
                const lengthRatio = shorterLength / longerLength;
                let minRatio = 0.3;
                if (shorterLength <= 4) {
                  minRatio = 0.5;
                }
                
                if (lengthRatio >= minRatio) {
                  if (normalized.includes(normalizedOccSkill) || 
                      normalizedOccSkill.includes(normalized)) {
                    matches = true;
                    break;
                  }
                }
              }
            }
          }

          if (matches) {
            stats.matchCount++;
            stats.sectors.add(occSector);
            stats.occupations.add(occ.id);
          }
        }
      }
    }

    // Find problematic skills
    console.log("📊 Skill Matching Analysis:\n");

    // Skills that match too many sectors (potential false positives)
    const multiSectorSkills = Array.from(skillMatchStats.values())
      .filter(s => s.sectors.size > 3)
      .sort((a, b) => b.sectors.size - a.sectors.size);

    if (multiSectorSkills.length > 0) {
      console.log("⚠️  Skills matching multiple sectors (potential false positives):");
      for (const stats of multiSectorSkills.slice(0, 10)) {
        console.log(`  "${stats.skill}" (normalized: "${stats.normalized}")`);
        console.log(`    - Matches ${stats.sectors.size} sectors: ${Array.from(stats.sectors).join(", ")}`);
        console.log(`    - Matches ${stats.occupations.size} occupations`);
        console.log("");
      }
    }

    // Skills that match many occupations
    const highMatchSkills = Array.from(skillMatchStats.values())
      .filter(s => s.occupations.size > 10)
      .sort((a, b) => b.occupations.size - a.occupations.size);

    if (highMatchSkills.length > 0) {
      console.log("⚠️  Skills matching many occupations:");
      for (const stats of highMatchSkills.slice(0, 10)) {
        console.log(`  "${stats.skill}" matches ${stats.occupations.size} occupations across ${stats.sectors.size} sectors`);
      }
      console.log("");
    }

    // Skills with unusual normalization
    const unusualNormalization = Array.from(skillMatchStats.values())
      .filter(s => s.skill !== s.normalized && s.normalized.length < s.skill.length * 0.7);

    if (unusualNormalization.length > 0) {
      console.log("⚠️  Skills with significant normalization changes:");
      for (const stats of unusualNormalization.slice(0, 10)) {
        console.log(`  "${stats.skill}" -> "${stats.normalized}"`);
      }
      console.log("");
    }

    // Summary
    console.log("📈 Summary:");
    console.log(`  Total unique skills in profiles: ${skillMatchStats.size}`);
    console.log(`  Skills matching multiple sectors (>3): ${multiSectorSkills.length}`);
    console.log(`  Skills matching many occupations (>10): ${highMatchSkills.length}`);
    console.log("");

  } catch (error: any) {
    console.error("❌ Diagnosis failed:", error.message);
    throw error;
  }
}

// Run diagnosis if called directly
diagnoseSkillMatching()
  .then(() => {
    console.log("✅ Diagnosis complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Diagnosis failed:", error);
    process.exit(1);
  });

export { diagnoseSkillMatching };

