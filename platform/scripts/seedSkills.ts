import { db } from "../server/db";
import {
  skillsSectors,
  skillsJobTitles,
  skillsSkills,
  type InsertSkillsSector,
  type InsertSkillsJobTitle,
  type InsertSkillsSkill,
} from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { skillsData } from "./data/skills-data";

// Note: skillsData is now imported from ./data/skills-data.ts
// The data structure is defined in that file

async function seedSkills() {
  console.log("Seeding Skills Database (Sectors → Job Titles → Skills)...");

  let sectorsCreated = 0;
  let jobTitlesCreated = 0;
  let skillsCreated = 0;
  let sectorsSkipped = 0;
  let jobTitlesSkipped = 0;
  let skillsSkipped = 0;

  for (const sectorData of skillsData) {
    // Create or get sector
    let sectorId: string;
    const [existingSector] = await db
      .select()
      .from(skillsSectors)
      .where(eq(skillsSectors.name, sectorData.sector.name))
      .limit(1);

    if (existingSector) {
      sectorId = existingSector.id;
      sectorsSkipped++;
      console.log(`Sector already exists: ${sectorData.sector.name}`);
    } else {
      const sectorInsert: InsertSkillsSector = {
        name: sectorData.sector.name,
        estimatedWorkforceShare: sectorData.sector.estimatedWorkforceShare
          ? sectorData.sector.estimatedWorkforceShare.toString()
          : null,
        estimatedWorkforceCount: sectorData.sector.estimatedWorkforceCount || null,
        displayOrder: sectorData.sector.displayOrder,
      };
      const [createdSector] = await db.insert(skillsSectors).values(sectorInsert).returning();
      sectorId = createdSector.id;
      sectorsCreated++;
      console.log(`Created sector: ${sectorData.sector.name}`);
    }

    // Create job titles for this sector
    for (const jobTitleData of sectorData.jobTitles) {
      let jobTitleId: string;
      const [existingJobTitle] = await db
        .select()
        .from(skillsJobTitles)
        .where(
          and(
            eq(skillsJobTitles.sectorId, sectorId),
            eq(skillsJobTitles.name, jobTitleData.name)
          )
        )
        .limit(1);

      if (existingJobTitle) {
        jobTitleId = existingJobTitle.id;
        jobTitlesSkipped++;
      } else {
        const jobTitleInsert: InsertSkillsJobTitle = {
          sectorId,
          name: jobTitleData.name,
          displayOrder: jobTitleData.displayOrder,
        };
        const [createdJobTitle] = await db
          .insert(skillsJobTitles)
          .values(jobTitleInsert)
          .returning();
        jobTitleId = createdJobTitle.id;
        jobTitlesCreated++;
      }

      // Create skills for this job title
      for (let i = 0; i < jobTitleData.skills.length; i++) {
        const skillName = jobTitleData.skills[i];
        const [existingSkill] = await db
          .select()
          .from(skillsSkills)
          .where(
            and(
              eq(skillsSkills.jobTitleId, jobTitleId),
              eq(skillsSkills.name, skillName)
            )
          )
          .limit(1);

        if (!existingSkill) {
          const skillInsert: InsertSkillsSkill = {
            jobTitleId,
            name: skillName,
            displayOrder: i + 1,
          };
          await db.insert(skillsSkills).values(skillInsert);
          skillsCreated++;
        } else {
          skillsSkipped++;
        }
      }
    }
  }

  // Get final counts
  const allSectors = await db.select().from(skillsSectors);
  const allJobTitles = await db.select().from(skillsJobTitles);
  const allSkills = await db.select().from(skillsSkills);

  console.log("\n✅ Skills Database seed complete!");
  console.log(`- Sectors: ${sectorsCreated} created, ${sectorsSkipped} skipped, ${allSectors.length} total`);
  console.log(`- Job Titles: ${jobTitlesCreated} created, ${jobTitlesSkipped} skipped, ${allJobTitles.length} total`);
  console.log(`- Skills: ${skillsCreated} created, ${skillsSkipped} skipped, ${allSkills.length} total`);

  process.exit(0);
}

seedSkills().catch((error) => {
  console.error("Error seeding skills database:", error);
  process.exit(1);
});

