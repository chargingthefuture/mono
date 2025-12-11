import { db } from "../server/db";
import { users, payments } from "../shared/schema";

/**
 * Seeds payment data to populate Weekly Performance metrics:
 * - MAU (Monthly Active Users)
 * - Retention Rate
 * - MRR (Monthly Recurring Revenue)
 * - ARR (Annual Recurring Revenue)
 * - CLV (Customer Lifetime Value)
 * - Churn Rate
 * 
 * Creates payments across current month and previous month to show:
 * - Users active in both months (retention)
 * - Users only in previous month (churn)
 * - Users only in current month (new)
 */
async function seedWeeklyPerformanceMetrics() {
  console.log("Seeding payment data for Weekly Performance metrics...");

  // Get existing users (excluding admins)
  const allUsers = await db.select().from(users);
  const existingUsers = allUsers.filter(u => !u.isAdmin);

  if (existingUsers.length < 10) {
    console.log("Not enough users found. Please seed users first (run seedTestUsers.ts).");
    console.log(`Found ${existingUsers.length} users, need at least 10.`);
    process.exit(0);
  }

  console.log(`Found ${existingUsers.length} users to seed payments for`);

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Get current month in YYYY-MM format
  const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const previousMonthStr = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

  console.log(`Creating payments for:`);
  console.log(`  - Current month: ${currentMonthStr}`);
  console.log(`  - Previous month: ${previousMonthStr}`);

  // Payment amounts (realistic subscription pricing)
  const monthlyAmounts = ["25.00", "50.00", "75.00", "100.00"];
  const yearlyAmounts = ["250.00", "500.00", "750.00", "900.00"];

  let paymentsCreated = 0;

  // Strategy for realistic metrics:
  // - 60% of users have payments in both months (retained users)
  // - 20% have payments only in previous month (churned users)
  // - 20% have payments only in current month (new users)

  const retainedUsers = existingUsers.slice(0, Math.floor(existingUsers.length * 0.6));
  const churnedUsers = existingUsers.slice(retainedUsers.length, retainedUsers.length + Math.floor(existingUsers.length * 0.2));
  const newUsers = existingUsers.slice(retainedUsers.length + churnedUsers.length, retainedUsers.length + churnedUsers.length + Math.floor(existingUsers.length * 0.2));

  console.log(`\nUser distribution:`);
  console.log(`  - Retained (payments in both months): ${retainedUsers.length}`);
  console.log(`  - Churned (payments only in previous month): ${churnedUsers.length}`);
  console.log(`  - New (payments only in current month): ${newUsers.length}`);

  // Get admin user for recordedBy field
  let adminUser = allUsers.find(u => u.isAdmin);
  
  if (!adminUser) {
    console.log("\n⚠️  No admin user found. Creating a temporary admin user for seeding...");
    
    // Create a temporary admin user for seeding purposes
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
      console.log("  (You can delete this user later if needed)");
    } catch (error: any) {
      console.error("\n❌ Failed to create admin user:", error.message);
      console.log("\n💡 Alternative: Run 'npm run make-admin' to make an existing user an admin.");
      process.exit(1);
    }
  } else {
    console.log(`✓ Using admin user: ${adminUser.email}`);
  }

  // Create payments for retained users (both months)
  console.log("\nCreating payments for retained users (both months)...");
  for (const user of retainedUsers) {
    // Previous month payment
    const prevMonthDate = new Date(previousMonth);
    prevMonthDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month
    prevMonthDate.setHours(Math.floor(Math.random() * 24));
    
    const isMonthly = Math.random() < 0.8; // 80% monthly, 20% yearly
    
    try {
      await db.insert(payments).values({
        userId: user.id,
        amount: isMonthly 
          ? monthlyAmounts[Math.floor(Math.random() * monthlyAmounts.length)]
          : yearlyAmounts[Math.floor(Math.random() * yearlyAmounts.length)],
        paymentDate: prevMonthDate,
        paymentMethod: ['cash', 'venmo', 'paypal', 'zelle'][Math.floor(Math.random() * 4)],
        billingPeriod: isMonthly ? 'monthly' : 'yearly',
        billingMonth: isMonthly ? previousMonthStr : null,
        notes: `Seed payment for metrics testing`,
        recordedBy: adminUser.id,
      });
      paymentsCreated++;
    } catch (error) {
      console.log(`Failed to create previous month payment for user ${user.id}`);
    }

    // Current month payment
    const currentMonthDate = new Date(currentMonth);
    currentMonthDate.setDate(Math.floor(Math.random() * now.getDate()) + 1); // Random day up to today
    currentMonthDate.setHours(Math.floor(Math.random() * 24));

    try {
      await db.insert(payments).values({
        userId: user.id,
        amount: isMonthly 
          ? monthlyAmounts[Math.floor(Math.random() * monthlyAmounts.length)]
          : yearlyAmounts[Math.floor(Math.random() * yearlyAmounts.length)],
        paymentDate: currentMonthDate,
        paymentMethod: ['cash', 'venmo', 'paypal', 'zelle'][Math.floor(Math.random() * 4)],
        billingPeriod: isMonthly ? 'monthly' : 'yearly',
        billingMonth: isMonthly ? currentMonthStr : null,
        notes: `Seed payment for metrics testing`,
        recordedBy: adminUser.id,
      });
      paymentsCreated++;
    } catch (error) {
      console.log(`Failed to create current month payment for user ${user.id}`);
    }
  }

  // Create payments for churned users (only previous month)
  console.log("Creating payments for churned users (previous month only)...");
  for (const user of churnedUsers) {
    const prevMonthDate = new Date(previousMonth);
    prevMonthDate.setDate(Math.floor(Math.random() * 28) + 1);
    prevMonthDate.setHours(Math.floor(Math.random() * 24));

    const isMonthly = Math.random() < 0.8;
    
    try {
      await db.insert(payments).values({
        userId: user.id,
        amount: isMonthly 
          ? monthlyAmounts[Math.floor(Math.random() * monthlyAmounts.length)]
          : yearlyAmounts[Math.floor(Math.random() * yearlyAmounts.length)],
        paymentDate: prevMonthDate,
        paymentMethod: ['cash', 'venmo', 'paypal', 'zelle'][Math.floor(Math.random() * 4)],
        billingPeriod: isMonthly ? 'monthly' : 'yearly',
        billingMonth: isMonthly ? previousMonthStr : null,
        notes: `Seed payment for metrics testing (churned user)`,
        recordedBy: adminUser.id,
      });
      paymentsCreated++;
    } catch (error) {
      console.log(`Failed to create previous month payment for churned user ${user.id}`);
    }
  }

  // Create payments for new users (only current month)
  console.log("Creating payments for new users (current month only)...");
  for (const user of newUsers) {
    const currentMonthDate = new Date(currentMonth);
    currentMonthDate.setDate(Math.floor(Math.random() * now.getDate()) + 1);
    currentMonthDate.setHours(Math.floor(Math.random() * 24));

    const isMonthly = Math.random() < 0.8;
    
    try {
      await db.insert(payments).values({
        userId: user.id,
        amount: isMonthly 
          ? monthlyAmounts[Math.floor(Math.random() * monthlyAmounts.length)]
          : yearlyAmounts[Math.floor(Math.random() * yearlyAmounts.length)],
        paymentDate: currentMonthDate,
        paymentMethod: ['cash', 'venmo', 'paypal', 'zelle'][Math.floor(Math.random() * 4)],
        billingPeriod: isMonthly ? 'monthly' : 'yearly',
        billingMonth: isMonthly ? currentMonthStr : null,
        notes: `Seed payment for metrics testing (new user)`,
        recordedBy: adminUser.id,
      });
      paymentsCreated++;
    } catch (error) {
      console.log(`Failed to create current month payment for new user ${user.id}`);
    }
  }

  // Calculate expected metrics for verification
  const totalUsersWithPayments = retainedUsers.length + churnedUsers.length + newUsers.length;
  const retainedCount = retainedUsers.length;
  const previousMonthActiveUsers = retainedUsers.length + churnedUsers.length;
  const expectedRetentionRate = previousMonthActiveUsers > 0 
    ? (retainedCount / previousMonthActiveUsers) * 100 
    : 0;
  const expectedChurnRate = previousMonthActiveUsers > 0
    ? (churnedUsers.length / previousMonthActiveUsers) * 100
    : 0;

  console.log("\n=== Payment Seed Summary ===");
  console.log(`Total payments created: ${paymentsCreated}`);
  console.log(`\nExpected Metrics:`);
  console.log(`  MAU (Monthly Active Users): ~${retainedUsers.length + newUsers.length} (users with payments in current month)`);
  console.log(`  Retention Rate: ~${expectedRetentionRate.toFixed(1)}% (${retainedCount}/${previousMonthActiveUsers} retained)`);
  console.log(`  Churn Rate: ~${expectedChurnRate.toFixed(1)}% (${churnedUsers.length}/${previousMonthActiveUsers} churned)`);
  console.log(`  Previous Month Active Users: ${previousMonthActiveUsers}`);
  console.log(`  Current Month Active Users: ${retainedUsers.length + newUsers.length}`);
  
  console.log("\n✅ Payment seed data created successfully!");
  console.log("\nYou should now see populated metrics in the Weekly Performance dashboard:");
  console.log("  - Engagement and Retention section (MAU, Retention Rate)");
  console.log("  - Revenue Metrics section (MRR, ARR)");
  console.log("  - Customer Metrics section (Churn Rate, CLV)");
  
  process.exit(0);
}

seedWeeklyPerformanceMetrics().catch((error) => {
  console.error("\n❌ Error seeding payment data:");
  
  // Check for network/DNS errors
  if (error?.code === 'EAI_AGAIN' || error?.message?.includes('getaddrinfo')) {
    console.error("\n🌐 Network/DNS Error: Cannot resolve database hostname");
    console.error("   This is usually a temporary network issue.");
    console.error("\n💡 Try:");
    console.error("   1. Check your internet connection");
    console.error("   2. Verify the DATABASE_URL is correct");
    console.error("   3. Wait a few minutes and try again");
    console.error("   4. Check if Neon database is accessible");
  } else if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
    console.error("\n🔌 Connection Refused: Cannot connect to database");
    console.error("   The database server may be down or unreachable.");
    console.error("\n💡 Try:");
    console.error("   1. Verify the DATABASE_URL is correct");
    console.error("   2. Check if Neon database is running");
    console.error("   3. Verify network/firewall settings");
  } else {
    console.error(error);
  }
  
  process.exit(1);
});
