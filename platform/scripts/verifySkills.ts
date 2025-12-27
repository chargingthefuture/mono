/**
 * Script to verify skills data in the database
 * 
 * This script checks the current state of skills in the database
 * to verify that seeding and deduplication worked correctly.
 */

import { db } from "../server/db";
import { skillsSkills, skillsJobTitles, skillsSectors } from "../shared/schema";
import { sql, count } from "drizzle-orm";

async function verifySkills() {
  console.log("🔍 Verifying skills data in database...\n");

  try {
    // Count total skills
    const totalSkills = await db
      .select({ count: count() })
      .from(skillsSkills);
    
    console.log(`📊 Total skills in database: ${totalSkills[0].count}`);

    // Count total job titles
    const totalJobTitles = await db
      .select({ count: count() })
      .from(skillsJobTitles);
    
    console.log(`📊 Total job titles in database: ${totalJobTitles[0].count}`);

    // Count total sectors
    const totalSectors = await db
      .select({ count: count() })
      .from(skillsSectors);
    
    console.log(`📊 Total sectors in database: ${totalSectors[0].count}`);

    // Check for duplicates
    const duplicates = await db
      .select({
        name: skillsSkills.name,
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(skillsSkills)
      .groupBy(skillsSkills.name)
      .having(sql`count(*) > 1`);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} skills with duplicate names:`);
      duplicates.forEach(dup => {
        console.log(`   - "${dup.name}" (${dup.count} instances)`);
      });
    } else {
      console.log(`\n✅ No duplicate skills found`);
    }

    // Show sample skills
    const sampleSkills = await db
      .select()
      .from(skillsSkills)
      .limit(10);
    
    console.log(`\n📋 Sample skills (first 10):`);
    sampleSkills.forEach(skill => {
      console.log(`   - ${skill.name} (ID: ${skill.id})`);
    });

    // Get skills by job title
    const skillsByJobTitle = await db
      .select({
        jobTitleName: skillsJobTitles.name,
        skillCount: sql<number>`count(${skillsSkills.id})::int`.as('skill_count'),
      })
      .from(skillsSkills)
      .innerJoin(skillsJobTitles, sql`${skillsSkills.jobTitleId} = ${skillsJobTitles.id}`)
      .groupBy(skillsJobTitles.name)
      .orderBy(sql`count(${skillsSkills.id}) DESC`)
      .limit(10);

    console.log(`\n📋 Top 10 job titles by skill count:`);
    skillsByJobTitle.forEach(item => {
      console.log(`   - ${item.jobTitleName}: ${item.skillCount} skills`);
    });

    console.log(`\n✅ Verification complete!`);

  } catch (error) {
    console.error("❌ Error verifying skills:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifySkills()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export { verifySkills };

