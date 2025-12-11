import { db } from "../server/db";
import {
  skillsSectors,
  skillsJobTitles,
  workforceRecruiterOccupations,
  workforceRecruiterAnnouncements,
  type InsertWorkforceRecruiterOccupation,
  type InsertWorkforceRecruiterAnnouncement,
} from "../shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Seed script for Workforce Recruiter
 * 
 * Creates occupation records from the skills database (sectors and job titles).
 * Each job title becomes an occupation with reasonable defaults for headcount targets,
 * skill levels, and training targets.
 */

// Helper function to determine skill level based on job title name
function determineSkillLevel(jobTitleName: string): "Foundational" | "Intermediate" | "Advanced" {
  const lowerName = jobTitleName.toLowerCase();
  
  // Advanced skill level indicators
  if (
    lowerName.includes("engineer") ||
    lowerName.includes("scientist") ||
    lowerName.includes("doctor") ||
    lowerName.includes("surgeon") ||
    lowerName.includes("architect") ||
    lowerName.includes("manager") ||
    lowerName.includes("director") ||
    lowerName.includes("specialist") ||
    lowerName.includes("analyst") ||
    lowerName.includes("consultant") ||
    lowerName.includes("therapist") ||
    lowerName.includes("counselor") ||
    lowerName.includes("teacher") ||
    lowerName.includes("instructor") ||
    lowerName.includes("coordinator")
  ) {
    return "Advanced";
  }
  
  // Foundational skill level indicators
  if (
    lowerName.includes("helper") ||
    lowerName.includes("assistant") ||
    lowerName.includes("aide") ||
    lowerName.includes("laborer") ||
    lowerName.includes("cleaner") ||
    lowerName.includes("porter") ||
    lowerName.includes("guard") ||
    lowerName.includes("attendant")
  ) {
    return "Foundational";
  }
  
  // Default to Intermediate
  return "Intermediate";
}

// Helper function to calculate headcount target based on sector workforce
function calculateHeadcountTarget(
  sectorWorkforceCount: number | null,
  sectorWorkforceShare: string | null
): number {
  // If we have an estimated workforce count, use a percentage of it
  if (sectorWorkforceCount) {
    // Assume each occupation should target 1-5% of sector workforce
    // Use a random factor between 0.01 and 0.05 for variety
    const factor = 0.01 + Math.random() * 0.04;
    return Math.round(sectorWorkforceCount * factor);
  }
  
  // If we have workforce share percentage, estimate from 5M population
  if (sectorWorkforceShare) {
    const share = parseFloat(sectorWorkforceShare);
    const estimatedSectorWorkforce = Math.round(5000000 * (share / 100));
    const factor = 0.01 + Math.random() * 0.04;
    return Math.round(estimatedSectorWorkforce * factor);
  }
  
  // Default fallback: random between 500 and 5000
  return Math.round(500 + Math.random() * 4500);
}

// Helper function to calculate annual training target
function calculateAnnualTrainingTarget(headcountTarget: number, skillLevel: "Foundational" | "Intermediate" | "Advanced"): number {
  // Training targets as percentage of headcount:
  // Advanced skill: 20-30% (more training needed)
  // Intermediate skill: 10-20%
  // Foundational skill: 5-15% (less training needed)
  
  let minPercent = 0.05;
  let maxPercent = 0.15;
  
  if (skillLevel === "Advanced") {
    minPercent = 0.20;
    maxPercent = 0.30;
  } else if (skillLevel === "Intermediate") {
    minPercent = 0.10;
    maxPercent = 0.20;
  }
  
  const factor = minPercent + Math.random() * (maxPercent - minPercent);
  return Math.round(headcountTarget * factor);
}

async function seedWorkforceRecruiter() {
  console.log("Seeding Workforce Recruiter...");
  console.log("Creating occupations from skills database...\n");

  // Get all sectors
  const sectors = await db
    .select()
    .from(skillsSectors)
    .orderBy(skillsSectors.displayOrder);

  if (sectors.length === 0) {
    console.error("❌ No sectors found in skills database!");
    console.error("   Please run seedSkills.ts first to populate the skills database.");
    process.exit(1);
  }

  console.log(`Found ${sectors.length} sectors in skills database\n`);

  let occupationsCreated = 0;
  let occupationsSkipped = 0;

  // For each sector, get all job titles and create occupations
  for (const sector of sectors) {
    const jobTitles = await db
      .select()
      .from(skillsJobTitles)
      .where(eq(skillsJobTitles.sectorId, sector.id))
      .orderBy(skillsJobTitles.displayOrder);

    console.log(`Processing sector: ${sector.name} (${jobTitles.length} job titles)`);

    for (const jobTitle of jobTitles) {
      // Check if occupation already exists for this sector/job title combination
      const [existingOccupation] = await db
        .select()
        .from(workforceRecruiterOccupations)
        .where(
          and(
            eq(workforceRecruiterOccupations.sector, sector.name),
            eq(workforceRecruiterOccupations.occupationTitle, jobTitle.name)
          )
        )
        .limit(1);

      if (existingOccupation) {
        occupationsSkipped++;
        console.log(`  ⏭️  Skipped: ${jobTitle.name} (already exists)`);
        continue;
      }

      // Determine skill level
      const skillLevel = determineSkillLevel(jobTitle.name);

      // Calculate headcount target
      const headcountTarget = calculateHeadcountTarget(
        sector.estimatedWorkforceCount,
        sector.estimatedWorkforceShare
      );

      // Calculate annual training target
      const annualTrainingTarget = calculateAnnualTrainingTarget(headcountTarget, skillLevel);

      // Create occupation record
      const occupationData: InsertWorkforceRecruiterOccupation = {
        sector: sector.name,
        occupationTitle: jobTitle.name,
        jobTitleId: jobTitle.id, // Link to skills database for skill matching
        headcountTarget,
        skillLevel,
        annualTrainingTarget,
        notes: `Auto-generated from skills database`,
      };

      try {
        await db.insert(workforceRecruiterOccupations).values(occupationData);
        occupationsCreated++;
        console.log(`  ✅ Created: ${jobTitle.name} (Target: ${headcountTarget.toLocaleString()}, Skill: ${skillLevel})`);
      } catch (error: any) {
        console.error(`  ❌ Error creating occupation for ${jobTitle.name}:`, error.message);
      }
    }
  }

  // Create a default announcement if none exists
  const existingAnnouncements = await db
    .select()
    .from(workforceRecruiterAnnouncements)
    .limit(1);

  if (existingAnnouncements.length === 0) {
    const announcementData: InsertWorkforceRecruiterAnnouncement = {
      title: "Welcome to Workforce Recruiter",
      content: "Use this tool to track recruitment and distribution of workforce across different occupations and sectors. Create recruitment events to monitor progress toward your headcount targets.",
      type: "info",
      isActive: true,
    };

    try {
      await db.insert(workforceRecruiterAnnouncements).values(announcementData);
      console.log("\n✅ Created default announcement");
    } catch (error: any) {
      console.error("❌ Error creating announcement:", error.message);
    }
  }

  // Get final counts
  const allOccupations = await db.select().from(workforceRecruiterOccupations);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Workforce Recruiter seed complete!");
  console.log(`- Occupations: ${occupationsCreated} created, ${occupationsSkipped} skipped, ${allOccupations.length} total`);
  console.log("=".repeat(60) + "\n");

  process.exit(0);
}

seedWorkforceRecruiter().catch((error) => {
  console.error("❌ Error seeding Workforce Recruiter:", error);
  process.exit(1);
});


















