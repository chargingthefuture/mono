/**
 * Seed script for skills database
 * 
 * Refactored version - imports data from separate file
 */

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

/**
 * Main seeding function
 */
async function seedSkills() {
  console.log("Starting skills seeding...");

  for (const sectorData of skillsData) {
    // Create or get sector
    const [existingSector] = await db
      .select()
      .from(skillsSectors)
      .where(eq(skillsSectors.name, sectorData.sector.name))
      .limit(1);

    let sectorId: string;
    if (existingSector) {
      sectorId = existingSector.id;
      console.log(`Sector already exists: ${sectorData.sector.name}`);
    } else {
      const [newSector] = await db
        .insert(skillsSectors)
        .values({
          name: sectorData.sector.name,
          estimatedWorkforceShare: sectorData.sector.estimatedWorkforceShare?.toString(),
          estimatedWorkforceCount: sectorData.sector.estimatedWorkforceCount,
          displayOrder: sectorData.sector.displayOrder,
        } as InsertSkillsSector)
        .returning();
      sectorId = newSector.id;
      console.log(`Created sector: ${sectorData.sector.name}`);
    }

    // Create job titles and skills
    for (const jobTitleData of sectorData.jobTitles) {
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

      let jobTitleId: string;
      if (existingJobTitle) {
        jobTitleId = existingJobTitle.id;
        console.log(`  Job title already exists: ${jobTitleData.name}`);
      } else {
        const [newJobTitle] = await db
          .insert(skillsJobTitles)
          .values({
            sectorId,
            name: jobTitleData.name,
            displayOrder: jobTitleData.displayOrder,
          } as InsertSkillsJobTitle)
          .returning();
        jobTitleId = newJobTitle.id;
        console.log(`  Created job title: ${jobTitleData.name}`);
      }

      // Create skills
      for (const skillName of jobTitleData.skills) {
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
          await db.insert(skillsSkills).values({
            jobTitleId,
            name: skillName,
          } as InsertSkillsSkill);
          console.log(`    Created skill: ${skillName}`);
        }
      }
    }
  }

  console.log("Skills seeding completed!");
}

// Run if called directly
if (require.main === module) {
  seedSkills()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding skills:", error);
      process.exit(1);
    });
}

export { seedSkills };

