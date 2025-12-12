import { storage } from "../server/storage";
import { skillsData } from "./seedSkills";

async function findDeletedSkills() {
  console.log("Comparing seed data with database to find deleted skills...\n");

  // Build a map of what's in the database: sector -> jobTitle -> skills[]
  const dbHierarchy = new Map<string, Map<string, Set<string>>>();
  
  // Use the storage API to get the full hierarchy
  const hierarchy = await storage.getSkillsHierarchy();

  // Build the database structure
  for (const { sector, jobTitles } of hierarchy) {
    const jobTitleMap = new Map<string, Set<string>>();
    
    for (const { jobTitle, skills } of jobTitles) {
      const skillSet = new Set<string>();
      for (const skill of skills) {
        skillSet.add(skill.name.toLowerCase().trim());
      }
      jobTitleMap.set(jobTitle.name.toLowerCase().trim(), skillSet);
    }
    dbHierarchy.set(sector.name.toLowerCase().trim(), jobTitleMap);
  }

  // Now compare with seed data
  const deletedSkills: Array<{
    sector: string;
    jobTitle: string;
    skill: string;
    lineNumber?: number;
  }> = [];

  for (const sectorData of skillsData) {
    const sectorName = sectorData.sector.name.toLowerCase().trim();
    const dbSector = dbHierarchy.get(sectorName);

    if (!dbSector) {
      console.log(`⚠️  Sector "${sectorData.sector.name}" not found in database - all its skills would be recreated`);
      continue;
    }

    for (const jobTitleData of sectorData.jobTitles) {
      const jobTitleName = jobTitleData.name.toLowerCase().trim();
      const dbJobTitleSkills = dbSector.get(jobTitleName);

      if (!dbJobTitleSkills) {
        console.log(`⚠️  Job Title "${jobTitleData.name}" in sector "${sectorData.sector.name}" not found in database - all its skills would be recreated`);
        continue;
      }

      for (const skillName of jobTitleData.skills) {
        const skillNameLower = skillName.toLowerCase().trim();
        if (!dbJobTitleSkills.has(skillNameLower)) {
          deletedSkills.push({
            sector: sectorData.sector.name,
            jobTitle: jobTitleData.name,
            skill: skillName,
          });
        }
      }
    }
  }

  // Report results
  if (deletedSkills.length === 0) {
    console.log("✅ No deleted skills found! All skills in seed data exist in the database.");
    console.log("   The seed script will not recreate any deleted skills.");
  } else {
    console.log(`\n❌ Found ${deletedSkills.length} skill(s) in seed data that are NOT in the database:`);
    console.log("   These skills were likely deleted in the UI and will be recreated by the seed script.\n");
    
    // Group by sector and job title for better readability
    const grouped = new Map<string, Map<string, string[]>>();
    for (const deleted of deletedSkills) {
      if (!grouped.has(deleted.sector)) {
        grouped.set(deleted.sector, new Map());
      }
      const sectorMap = grouped.get(deleted.sector)!;
      if (!sectorMap.has(deleted.jobTitle)) {
        sectorMap.set(deleted.jobTitle, []);
      }
      sectorMap.get(deleted.jobTitle)!.push(deleted.skill);
    }

    for (const [sector, jobTitleMap] of grouped.entries()) {
      console.log(`\n📁 Sector: ${sector}`);
      for (const [jobTitle, skills] of jobTitleMap.entries()) {
        console.log(`   👔 Job Title: ${jobTitle}`);
        for (const skill of skills) {
          console.log(`      ❌ "${skill}"`);
        }
      }
    }

    console.log("\n💡 To prevent these from being recreated, remove them from the skillsData array in seedSkills.ts");
  }

  process.exit(0);
}

findDeletedSkills().catch((error) => {
  console.error("Error comparing skills:", error);
  process.exit(1);
});

