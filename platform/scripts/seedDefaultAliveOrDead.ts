import { db } from "../server/db";
import {
  users,
  defaultAliveOrDeadFinancialEntries,
  defaultAliveOrDeadEbitdaSnapshots,
} from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seeds Default Alive or Dead app data:
 * - Financial entries for operating expenses, depreciation, and amortization
 * - EBITDA snapshots with calculated values
 */
async function seedDefaultAliveOrDead() {
  console.log("🌱 Seeding Default Alive or Dead data...");

  // Get or create admin user for createdBy field
  let adminUser = await db
    .select()
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1)
    .then((users) => users[0]);

  if (!adminUser) {
    console.log("⚠️  No admin user found. Creating a temporary admin user for seeding...");
    try {
      const [newAdmin] = await db
        .insert(users)
        .values({
          email: "seed-admin@example.com",
          firstName: "Seed",
          lastName: "Admin",
          isApproved: true,
          isAdmin: true,
        })
        .returning();

      adminUser = newAdmin;
      console.log(`✓ Created temporary admin user: ${adminUser.email}`);
    } catch (error: any) {
      console.error("❌ Failed to create admin user:", error.message);
      process.exit(1);
    }
  } else {
    console.log(`✓ Using admin user: ${adminUser.email}`);
  }

  // Helper function to get Saturday of a given week (weekends start on Saturday)
  const getSaturdayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 6 ? 0 : 6 - day; // If Saturday, return same day; otherwise get next Saturday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Generate financial entries for the last 12 weeks
  const now = new Date();
  const financialEntriesData = [];

  for (let i = 0; i < 12; i++) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    const weekStartDate = getSaturdayOfWeek(weekDate);

    // Vary operating expenses to simulate realistic data
    const baseExpenses = 5000;
    const variance = Math.random() * 1000 - 500; // ±$500 variance
    const operatingExpenses = (baseExpenses + variance).toFixed(2);

    // Add depreciation and amortization for some weeks
    const hasDepreciation = i % 3 === 0; // Every 3rd week
    const hasAmortization = i % 4 === 0; // Every 4th week

    financialEntriesData.push({
      weekStartDate: weekStartDate,
      operatingExpenses: operatingExpenses,
      depreciation: hasDepreciation ? "500.00" : "0.00",
      amortization: hasAmortization ? "200.00" : "0.00",
      depreciationData: hasDepreciation
        ? {
            assetCost: "10000",
            usefulLife: 20,
            method: "straight-line",
          }
        : null,
      amortizationData: hasAmortization
        ? {
            assetCost: "5000",
            usefulLife: 25,
          }
        : null,
      notes: i === 0 ? "Current week - highest expenses due to new equipment purchase" : null,
      createdBy: adminUser.id,
    });
  }

  // Insert financial entries
  for (const entryData of financialEntriesData) {
    try {
      const [existing] = await db
        .select()
        .from(defaultAliveOrDeadFinancialEntries)
        .where(eq(defaultAliveOrDeadFinancialEntries.weekStartDate, entryData.weekStartDate));

      if (!existing) {
        await db.insert(defaultAliveOrDeadFinancialEntries).values(entryData);
        console.log(
          `✓ Created financial entry for week starting ${entryData.weekStartDate.toISOString().split("T")[0]}`
        );
      } else {
        console.log(
          `⊘ Financial entry for week starting ${entryData.weekStartDate.toISOString().split("T")[0]} already exists`
        );
      }
    } catch (error: any) {
      console.error(`Error creating financial entry:`, error.message);
    }
  }

  // Generate EBITDA snapshots for the same weeks
  // Revenue would typically be calculated from payments table, but for seeding we'll use sample data
  const ebitdaSnapshotsData = [];

  for (let i = 0; i < 12; i++) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    const weekStartDate = getSaturdayOfWeek(weekDate);

    // Simulate growing revenue over time (more recent weeks have higher revenue)
    const baseRevenue = 3000;
    const growthFactor = (12 - i) * 100; // $100 growth per week going forward
    const revenue = (baseRevenue + growthFactor).toFixed(2);

    // Match operating expenses from financial entries
    const matchingEntry = financialEntriesData.find(
      (e) => e.weekStartDate.toISOString().split("T")[0] === weekStartDate.toISOString().split("T")[0]
    );
    const operatingExpenses = matchingEntry?.operatingExpenses || "5000.00";
    const depreciation = matchingEntry?.depreciation || "0.00";
    const amortization = matchingEntry?.amortization || "0.00";

    // Calculate EBITDA: Revenue - Operating Expenses + Depreciation + Amortization
    const ebitda = (
      parseFloat(revenue) -
      parseFloat(operatingExpenses) +
      parseFloat(depreciation) +
      parseFloat(amortization)
    ).toFixed(2);

    // Determine if default alive (positive EBITDA or projected to be positive soon)
    const isDefaultAlive = parseFloat(ebitda) > 0 || (12 - i) <= 4; // Recent weeks or positive EBITDA

    // Calculate growth rate (simulate 2-5% weekly growth)
    const growthRate = (0.02 + Math.random() * 0.03).toFixed(4);

    // Project profitability date if not default alive
    let projectedProfitabilityDate: Date | null = null;
    let projectedCapitalNeeded: string | null = null;

    if (!isDefaultAlive && parseFloat(ebitda) < 0) {
      // Project when EBITDA becomes positive based on growth rate
      const weeksToProfitability = Math.ceil(Math.abs(parseFloat(ebitda)) / (parseFloat(revenue) * parseFloat(growthRate)));
      const profitabilityDate = new Date(weekStartDate);
      profitabilityDate.setDate(profitabilityDate.getDate() + weeksToProfitability * 7);
      projectedProfitabilityDate = profitabilityDate;

      // Estimate capital needed (negative EBITDA * weeks to profitability)
      projectedCapitalNeeded = (Math.abs(parseFloat(ebitda)) * weeksToProfitability).toFixed(2);
    }

    ebitdaSnapshotsData.push({
      weekStartDate: weekStartDate,
      revenue: revenue,
      operatingExpenses: operatingExpenses,
      depreciation: depreciation,
      amortization: amortization,
      ebitda: ebitda,
      isDefaultAlive: isDefaultAlive,
      projectedProfitabilityDate: projectedProfitabilityDate,
      projectedCapitalNeeded: projectedCapitalNeeded,
      currentFunding: i === 0 ? "50000.00" : null, // Current funding for most recent week
      growthRate: growthRate,
      calculationMetadata: {
        calculatedAt: new Date().toISOString(),
        assumptions: {
          revenueGrowthRate: growthRate,
          expenseGrowthRate: "0.01",
          depreciationMethod: "straight-line",
        },
      },
    });
  }

  // Insert EBITDA snapshots
  for (const snapshotData of ebitdaSnapshotsData) {
    try {
      const [existing] = await db
        .select()
        .from(defaultAliveOrDeadEbitdaSnapshots)
        .where(eq(defaultAliveOrDeadEbitdaSnapshots.weekStartDate, snapshotData.weekStartDate));

      if (!existing) {
        await db.insert(defaultAliveOrDeadEbitdaSnapshots).values(snapshotData);
        console.log(
          `✓ Created EBITDA snapshot for week starting ${snapshotData.weekStartDate.toISOString().split("T")[0]} (EBITDA: $${snapshotData.ebitda})`
        );
      } else {
        console.log(
          `⊘ EBITDA snapshot for week starting ${snapshotData.weekStartDate.toISOString().split("T")[0]} already exists`
        );
      }
    } catch (error: any) {
      console.error(`Error creating EBITDA snapshot:`, error.message);
    }
  }

  console.log("✅ Default Alive or Dead seed data created successfully!");
}

seedDefaultAliveOrDead()
  .then(() => {
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  });





