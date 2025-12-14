#!/usr/bin/env node

/**
 * Main seed script for all mini-apps
 * 
 * This script runs all mini-app seed scripts in sequence.
 * Each script seeds its respective mini-app's data including announcements.
 * 
 * Usage: tsx scripts/seedAllMiniApps.ts
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const seedScripts = [
  {
    name: "Test Users",
    script: "seedTestUsers.ts",
    description: "Test Users - Test users for the application",
  },
  {
    name: "NPS Responses",
    script: "seedNpsResponses.ts",
    description: "NPS Responses - NPS responses for the application",
  },
  {
    name: "ChatGroups",
    script: "seedChatGroups.ts",
    description: "Chat Groups - Signal group listings",
  },
  {
    name: "Directory",
    script: "seedDirectory.ts",
    description: "Directory - Skill-sharing profiles",
  },
  {
    name: "LightHouse",
    script: "seedLighthouse.ts",
    description: "LightHouse - Housing for survivors",
  },
  {
    name: "SocketRelay",
    script: "seedSocketRelay.ts",
    description: "SocketRelay - Request/fulfillment system",
  },
  {
    name: "SupportMatch",
    script: "seedSupportMatch.ts",
    description: "SupportMatch - Accountability partnerships",
  },
  {
    name: "TrustTransport",
    script: "seedTrustTransport.ts",
    description: "TrustTransport - Ride sharing",
  },
  {
    name: "MechanicMatch",
    script: "seedMechanicMatch.ts",
    description: "MechanicMatch - Vehicle repair services",
  },
  {
    name: "LostMail",
    script: "seedLostMail.ts",
    description: "LostMail - Mail incident reporting",
  },
  {
    name: "Research",
    script: "seedResearch.ts",
    description: "Research - Q&A and knowledge sharing",
  },
  {
    name: "GentlePulse",
    script: "seedGentlePulse.ts",
    description: "GentlePulse - Meditation library",
  },
  {
    name: "Chyme",
    script: "seedChyme.ts",
    description: "Chyme - Android app authenticator",
  },
  {
    name: "Payment Tracking",
    script: "seedPaymentTracking.ts",
    description: "Payment Tracking - Payment tracking and delinquent user features",
  },
  {
    name: "WeeklyPerformanceMetrics",
    script: "seedWeeklyPerformanceMetrics.ts",
    description: "Weekly Performance Metrics - Weekly performance metrics for the application",
  },
  {
    name: "Reports Data",
    script: "seedReportsData.ts",
    description: "Reports Data - Reports data for the application",
  },
  {
    name: "Workforce Data",
    script: "seedWorkforceRecruiter.ts",
    description: "Workforce Recruiter - data for the application",
  },
  {
    name: "Skills Data",
    script: "seedSkills.ts",
    description: "Skills - Skills data for the application",
  },
  {
    name: "Default Alive or Dead",
    script: "seedDefaultAliveOrDead.ts",
    description: "Default Alive or Dead - Financial tracking and EBITDA calculations",
  },
];

async function runSeedScript(scriptPath: string, name: string): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🌱 Seeding ${name}...`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const { stdout, stderr } = await execAsync(`tsx scripts/${scriptPath}`, {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stdout) {
      console.log(stdout);
    }

    if (stderr && !stderr.includes("already exists")) {
      // Some scripts log "already exists" messages to stderr, which is fine
      // Only show stderr if it's not just duplicate warnings
      if (!stderr.match(/already exists|skipping/i)) {
        console.error(`⚠️  Warnings for ${name}:`, stderr);
      }
    }

    console.log(`✅ ${name} seeding completed successfully\n`);
  } catch (error: any) {
    // Check if it's a non-zero exit code (which is expected for some scripts)
    if (error.code === 0 || (error.stdout && !error.stderr?.match(/Error|error|failed|Failed/i))) {
      // Script ran but may have exited with code 0 after process.exit(0)
      // Or stdout exists without error indicators in stderr
      if (error.stdout) {
        console.log(error.stdout);
      }
      console.log(`✅ ${name} seeding completed\n`);
    } else {
      // Script failed - report the error
      console.error(`❌ Error seeding ${name}:`, error.message || "Unknown error");
      if (error.stdout) {
        console.error("Output:", error.stdout);
      }
      if (error.stderr) {
        console.error("Errors:", error.stderr);
      }
      // Extract error message from stderr if available for better reporting
      const errorMessage = error.stderr || error.message || "Unknown error";
      throw new Error(`${name}: ${errorMessage}`);
    }
  }
}

async function seedAllMiniApps() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Starting Master Seed Script for All Mini-Apps");
  console.log("=".repeat(60));
  console.log(`\nWill seed ${seedScripts.length} mini-apps:\n`);

  seedScripts.forEach((script, index) => {
    console.log(`  ${index + 1}. ${script.name} - ${script.description}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("Starting seeding process...\n");

  const startTime = Date.now();
  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  for (const seedScript of seedScripts) {
    try {
      await runSeedScript(seedScript.script, seedScript.name);
      results.push({ name: seedScript.name, success: true });
    } catch (error: any) {
      // Extract comprehensive error message
      let errorMessage = error.message || String(error);
      
      // If error has stderr, include it in the message
      if (error.stderr) {
        // Extract the actual error from stderr (skip dotenv warnings)
        const errorLines = error.stderr.split('\n').filter((line: string) => 
          line.trim() && 
          !line.includes('dotenv') && 
          !line.includes('injecting env') &&
          (line.includes('Error') || line.includes('error') || line.includes('failed') || line.includes('Failed'))
        );
        if (errorLines.length > 0) {
          errorMessage = errorLines.join('; ');
        } else {
          errorMessage = error.stderr.substring(0, 200); // Limit length
        }
      }
      
      results.push({
        name: seedScript.name,
        success: false,
        error: errorMessage,
      });
      console.error(`\n⚠️  Failed to seed ${seedScript.name}, continuing with next script...\n`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Seeding Summary");
  console.log("=".repeat(60) + "\n");

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${seedScripts.length}`);
  successful.forEach((result) => {
    console.log(`   ✓ ${result.name}`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${seedScripts.length}`);
    failed.forEach((result) => {
      console.log(`   ✗ ${result.name}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
  }

  console.log(`\n⏱️  Total time: ${duration}s`);
  console.log("\n" + "=".repeat(60));

  if (failed.length > 0) {
    console.log("\n⚠️  Some seed scripts failed. Check the errors above.");
    process.exit(1);
  } else {
    console.log("\n🎉 All mini-apps seeded successfully!");
    process.exit(0);
  }
}

// Run the master seed script
seedAllMiniApps().catch((error) => {
  console.error("\n❌ Fatal error in master seed script:", error);
  process.exit(1);
});

