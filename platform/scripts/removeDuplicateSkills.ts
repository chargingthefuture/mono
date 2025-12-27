/**
 * Script to remove duplicate skills from the database
 * 
 * This script finds skills with duplicate names (same name, different job titles)
 * and removes the duplicates, keeping only one instance per skill name.
 */

import { db } from "../server/db";
import { skillsSkills, skillsJobTitles } from "../shared/schema";
import { sql, eq, inArray } from "drizzle-orm";

async function removeDuplicateSkills() {
  console.log("🔍 Finding duplicate skills...\n");

  try {
    // Find all skills with duplicate names
    const duplicates = await db
      .select({
        name: skillsSkills.name,
        count: sql<number>`count(*)::int`.as('count'),
        ids: sql<string[]>`array_agg(${skillsSkills.id})`.as('ids'),
        jobTitleIds: sql<string[]>`array_agg(${skillsSkills.jobTitleId})`.as('job_title_ids'),
      })
      .from(skillsSkills)
      .groupBy(skillsSkills.name)
      .having(sql`count(*) > 1`);

    console.log(`Found ${duplicates.length} skills with duplicate names:\n`);

    let totalRemoved = 0;

    for (const dup of duplicates) {
      console.log(`\n📋 Skill: "${dup.name}"`);
      console.log(`   Found ${dup.count} duplicates`);

      // Get job title names for context
      const jobTitleIds = dup.jobTitleIds as string[];
      const jobTitles = jobTitleIds.length > 0
        ? await db
            .select()
            .from(skillsJobTitles)
            .where(inArray(skillsJobTitles.id, jobTitleIds))
        : [];

      console.log(`   Job Titles: ${jobTitles.map(jt => jt.name).join(', ')}`);

      // Keep the first one (lowest ID or first in array), remove the rest
      const idsToRemove = (dup.ids as string[]).slice(1); // Keep first, remove rest

      if (idsToRemove.length > 0) {
        console.log(`   Removing ${idsToRemove.length} duplicate(s)...`);
        
        for (const id of idsToRemove) {
          await db.delete(skillsSkills).where(eq(skillsSkills.id, id));
          totalRemoved++;
        }
        
        console.log(`   ✅ Removed duplicates`);
      }
    }

    console.log(`\n✅ Cleanup complete! Removed ${totalRemoved} duplicate skill entries.`);

    // Verify no duplicates remain
    const remainingDuplicates = await db
      .select({
        name: skillsSkills.name,
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(skillsSkills)
      .groupBy(skillsSkills.name)
      .having(sql`count(*) > 1`);

    if (remainingDuplicates.length === 0) {
      console.log(`\n✅ Verification: No duplicate skills remain in database.`);
    } else {
      console.log(`\n⚠️  Warning: ${remainingDuplicates.length} skills still have duplicates:`);
      for (const dup of remainingDuplicates) {
        console.log(`   - "${dup.name}" (${dup.count} instances)`);
      }
    }

  } catch (error) {
    console.error("❌ Error removing duplicate skills:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  removeDuplicateSkills()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export { removeDuplicateSkills };

