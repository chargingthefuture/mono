import { db } from "../server/db";
import { npsResponses, users } from "../shared/schema";

/**
 * Seeds NPS responses for existing users across multiple months
 * Creates realistic distribution:
 * - Promoters (9-10): ~30-40%
 * - Passives (7-8): ~20-30%
 * - Detractors (0-6): ~30-40%
 */
async function seedNpsResponses() {
  console.log("Seeding NPS responses...");

  // Get existing users (excluding admins)
  const allUsers = await db.select().from(users);
  const existingUsers = allUsers.filter(u => !u.isAdmin).slice(0, 50); // Limit to avoid too many responses

  if (existingUsers.length === 0) {
    console.log("No users found. Please seed users first.");
    process.exit(0);
  }

  console.log(`Found ${existingUsers.length} users to seed responses for`);

  // Generate responses for the past 3 months plus current month
  const now = new Date();
  const months: string[] = [];
  
  // Current month
  months.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  
  // Past 3 months
  for (let i = 1; i <= 3; i++) {
    const pastDate = new Date(now);
    pastDate.setMonth(pastDate.getMonth() - i);
    months.push(`${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}`);
  }

  console.log(`Generating responses for months: ${months.join(", ")}`);

  let totalResponses = 0;
  const scoreDistribution = {
    promoters: 0, // 9-10
    passives: 0,  // 7-8
    detractors: 0, // 0-6
  };

  // Fetch all existing responses once to avoid repeated queries
  const allResponses = await db.select().from(npsResponses);
  
  // Generate responses for each month
  for (const month of months) {
    // Each month, ~40% of users respond (to simulate realistic participation)
    const usersToRespond = existingUsers.filter(() => Math.random() < 0.4);
    
    for (const user of usersToRespond) {
      // Only one response per user per month
      const existingResponse = allResponses.find(
        (r) => r.userId === user.id && r.responseMonth === month
      );

      if (existingResponse) {
        continue; // Skip if user already has a response for this month
      }

      // Generate score with realistic distribution
      // 35% promoters (9-10), 25% passives (7-8), 40% detractors (0-6)
      let score: number;
      const rand = Math.random();
      
      if (rand < 0.35) {
        // Promoters: 9 or 10
        score = Math.random() < 0.5 ? 9 : 10;
        scoreDistribution.promoters++;
      } else if (rand < 0.60) {
        // Passives: 7 or 8
        score = Math.random() < 0.5 ? 7 : 8;
        scoreDistribution.passives++;
      } else {
        // Detractors: 0-6
        // Weight towards middle (4-6) but include some very unhappy (0-3)
        if (Math.random() < 0.3) {
          score = Math.floor(Math.random() * 4); // 0-3 (very unhappy)
        } else {
          score = 4 + Math.floor(Math.random() * 3); // 4-6 (somewhat unhappy)
        }
        scoreDistribution.detractors++;
      }

      // Create response with random date within the month
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const randomDay = 1 + Math.floor(Math.random() * daysInMonth);
      const responseDate = new Date(year, monthNum - 1, randomDay);
      
      // Add some random time within the day
      responseDate.setHours(Math.floor(Math.random() * 24));
      responseDate.setMinutes(Math.floor(Math.random() * 60));

      try {
        await db.insert(npsResponses).values({
          userId: user.id,
          score: score,
          responseMonth: month,
          createdAt: responseDate,
        });

        totalResponses++;
      } catch (error) {
        console.log(`Failed to create response for user ${user.id} in ${month}, skipping...`);
      }
    }
  }

  console.log("\n=== NPS Seed Summary ===");
  console.log(`Total responses created: ${totalResponses}`);
  console.log(`Score distribution:`);
  console.log(`  Promoters (9-10): ${scoreDistribution.promoters} (${((scoreDistribution.promoters / totalResponses) * 100).toFixed(1)}%)`);
  console.log(`  Passives (7-8): ${scoreDistribution.passives} (${((scoreDistribution.passives / totalResponses) * 100).toFixed(1)}%)`);
  console.log(`  Detractors (0-6): ${scoreDistribution.detractors} (${((scoreDistribution.detractors / totalResponses) * 100).toFixed(1)}%)`);
  
  if (totalResponses > 0) {
    const promotersPercent = (scoreDistribution.promoters / totalResponses) * 100;
    const detractorsPercent = (scoreDistribution.detractors / totalResponses) * 100;
    const calculatedNps = Math.round(promotersPercent - detractorsPercent);
    console.log(`\nCalculated NPS: ${calculatedNps} (${promotersPercent.toFixed(1)}% promoters - ${detractorsPercent.toFixed(1)}% detractors)`);
  }

  console.log("\nNPS responses seeded successfully!");
  process.exit(0);
}

seedNpsResponses().catch((error) => {
  console.error("Error seeding NPS responses:", error);
  process.exit(1);
});
