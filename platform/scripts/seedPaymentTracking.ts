import { db } from "../server/db";
import { users, payments } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seeds payment data to test the payment tracking and delinquent user features:
 * - Users who are up to date (paid for all months)
 * - Users who are delinquent (missing last month)
 * - Users who are delinquent (missing multiple months)
 * - Users with yearly subscriptions (should not be delinquent)
 * - Users with no payments at all
 */
async function seedPaymentTracking() {
  console.log("Seeding payment tracking test data...");

  // Get existing users (excluding admins)
  const allUsers = await db.select().from(users);
  const existingUsers = allUsers.filter(u => !u.isAdmin);

  // Get admin user for recordedBy field
  let adminUser = allUsers.find(u => u.isAdmin);
  
  if (!adminUser) {
    console.log("\n⚠️  No admin user found. Creating a temporary admin user for seeding...");
    
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
      console.error("\n❌ Failed to create admin user:", error.message);
      console.log("\n💡 Alternative: Run 'npm run make-admin' to make an existing user an admin.");
      process.exit(1);
    }
  } else {
    console.log(`✓ Using admin user: ${adminUser.email}`);
  }

  // Create test users if we don't have enough
  const testUserEmails = [
    "payment-test-1@example.com",
    "payment-test-2@example.com",
    "payment-test-3@example.com",
    "payment-test-4@example.com",
    "payment-test-5@example.com",
    "payment-test-6@example.com",
    "payment-test-7@example.com",
    "payment-test-8@example.com",
  ];

  const testUserIds: string[] = [];

  for (const email of testUserEmails) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: email,
          firstName: email.split("@")[0].split("-")[2] || "Test",
          lastName: "User",
          isApproved: true,
          isAdmin: false,
          pricingTier: "1.00", // $1/month for testing
        })
        .returning();

      testUserIds.push(user.id);
      console.log(`✓ Created test user: ${email}`);
    } catch (error) {
      // User might already exist
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      
      if (existingUser) {
        testUserIds.push(existingUser.id);
        console.log(`✓ User ${email} already exists, using existing ID`);
      }
    }
  }

  // Use existing users if we have them, otherwise use test users
  const usersToSeed = existingUsers.length >= 8 
    ? existingUsers.slice(0, 8).map(u => u.id)
    : testUserIds;

  if (usersToSeed.length < 8) {
    console.log(`\n⚠️  Only found ${usersToSeed.length} users. Creating ${8 - usersToSeed.length} more test users...`);
    
    for (let i = usersToSeed.length; i < 8; i++) {
      try {
        const [user] = await db
          .insert(users)
          .values({
            email: `payment-test-${i + 1}@example.com`,
            firstName: `Test${i + 1}`,
            lastName: "User",
            isApproved: true,
            isAdmin: false,
            pricingTier: "1.00",
          })
          .returning();
        
        usersToSeed.push(user.id);
        console.log(`✓ Created test user: payment-test-${i + 1}@example.com`);
      } catch (error) {
        console.log(`⚠️  Could not create test user ${i + 1}`);
      }
    }
  }

  console.log(`\n✓ Using ${usersToSeed.length} users for payment seeding`);

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  // Get months in YYYY-MM format
  const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  const twoMonthsAgoStr = `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
  const threeMonthsAgoStr = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  console.log(`\nPayment scenarios:`);
  console.log(`  - Current month: ${currentMonthStr}`);
  console.log(`  - Last month: ${lastMonthStr}`);
  console.log(`  - Two months ago: ${twoMonthsAgoStr}`);
  console.log(`  - Three months ago: ${threeMonthsAgoStr}`);

  let paymentsCreated = 0;

  // Scenario 1: User up to date (paid for last month and two months ago)
  if (usersToSeed[0]) {
    console.log(`\n1. Creating payments for user 1 (up to date):`);
    
    // Payment for two months ago
    await db.insert(payments).values({
      userId: usersToSeed[0],
      amount: "1.00",
      paymentDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 5),
      paymentMethod: "venmo",
      billingPeriod: "monthly",
      billingMonth: twoMonthsAgoStr,
      recordedBy: adminUser.id,
      notes: "Test payment - up to date user",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${twoMonthsAgoStr}`);

    // Payment for last month
    await db.insert(payments).values({
      userId: usersToSeed[0],
      amount: "1.00",
      paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 3),
      paymentMethod: "paypal",
      billingPeriod: "monthly",
      billingMonth: lastMonthStr,
      recordedBy: adminUser.id,
      notes: "Test payment - up to date user",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${lastMonthStr}`);
  }

  // Scenario 2: User delinquent (missing last month only)
  if (usersToSeed[1]) {
    console.log(`\n2. Creating payments for user 2 (delinquent - missing last month):`);
    
    // Payment for two months ago
    await db.insert(payments).values({
      userId: usersToSeed[1],
      amount: "1.00",
      paymentDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 10),
      paymentMethod: "zelle",
      billingPeriod: "monthly",
      billingMonth: twoMonthsAgoStr,
      recordedBy: adminUser.id,
      notes: "Test payment - delinquent user (missing last month)",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${twoMonthsAgoStr}`);
    console.log(`   ⚠️  Missing payment for ${lastMonthStr} (delinquent)`);
  }

  // Scenario 3: User delinquent (missing multiple months)
  if (usersToSeed[2]) {
    console.log(`\n3. Creating payments for user 3 (delinquent - missing 2 months):`);
    
    // Payment for three months ago (last payment)
    await db.insert(payments).values({
      userId: usersToSeed[2],
      amount: "1.00",
      paymentDate: new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth(), 8),
      paymentMethod: "cash",
      billingPeriod: "monthly",
      billingMonth: threeMonthsAgoStr,
      recordedBy: adminUser.id,
      notes: "Test payment - delinquent user (missing 2 months)",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${threeMonthsAgoStr}`);
    console.log(`   ⚠️  Missing payments for ${twoMonthsAgoStr} and ${lastMonthStr} (severely delinquent)`);
  }

  // Scenario 4: User with yearly subscription (should not be delinquent)
  if (usersToSeed[3]) {
    console.log(`\n4. Creating yearly payment for user 4 (yearly subscription - not delinquent):`);
    
    const yearlyStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const yearlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const yearlyStartStr = `${yearlyStart.getFullYear()}-${String(yearlyStart.getMonth() + 1).padStart(2, '0')}`;
    const yearlyEndStr = `${yearlyEnd.getFullYear()}-${String(yearlyEnd.getMonth() + 1).padStart(2, '0')}`;

    await db.insert(payments).values({
      userId: usersToSeed[3],
      amount: "12.00",
      paymentDate: new Date(yearlyStart.getFullYear(), yearlyStart.getMonth(), 15),
      paymentMethod: "paypal",
      billingPeriod: "yearly",
      yearlyStartMonth: yearlyStartStr,
      yearlyEndMonth: yearlyEndStr,
      recordedBy: adminUser.id,
      notes: "Test payment - yearly subscription (active)",
    });
    paymentsCreated++;
    console.log(`   ✓ Yearly payment from ${yearlyStartStr} to ${yearlyEndStr}`);
  }

  // Scenario 5: User with expired yearly subscription (should be delinquent)
  if (usersToSeed[4]) {
    console.log(`\n5. Creating expired yearly payment for user 5 (expired yearly - delinquent):`);
    
    const yearlyStart = new Date(now.getFullYear() - 1, now.getMonth() - 2, 1);
    const yearlyEnd = new Date(now.getFullYear(), now.getMonth() - 2, 0);
    const yearlyStartStr = `${yearlyStart.getFullYear()}-${String(yearlyStart.getMonth() + 1).padStart(2, '0')}`;
    const yearlyEndStr = `${yearlyEnd.getFullYear()}-${String(yearlyEnd.getMonth() + 1).padStart(2, '0')}`;

    await db.insert(payments).values({
      userId: usersToSeed[4],
      amount: "12.00",
      paymentDate: new Date(yearlyStart.getFullYear(), yearlyStart.getMonth(), 20),
      paymentMethod: "venmo",
      billingPeriod: "yearly",
      yearlyStartMonth: yearlyStartStr,
      yearlyEndMonth: yearlyEndStr,
      recordedBy: adminUser.id,
      notes: "Test payment - expired yearly subscription (delinquent)",
    });
    paymentsCreated++;
    console.log(`   ✓ Expired yearly payment from ${yearlyStartStr} to ${yearlyEndStr}`);
    console.log(`   ⚠️  Subscription expired, now delinquent`);
  }

  // Scenario 6: User with no payments at all (severely delinquent)
  if (usersToSeed[5]) {
    console.log(`\n6. User 6 (no payments - severely delinquent):`);
    console.log(`   ⚠️  No payments recorded - will appear as delinquent`);
  }

  // Scenario 7: User paid for last month but not two months ago (edge case)
  if (usersToSeed[6]) {
    console.log(`\n7. Creating payments for user 7 (paid last month, missing two months ago):`);
    
    // Payment for last month
    await db.insert(payments).values({
      userId: usersToSeed[6],
      amount: "1.00",
      paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 12),
      paymentMethod: "zelle",
      billingPeriod: "monthly",
      billingMonth: lastMonthStr,
      recordedBy: adminUser.id,
      notes: "Test payment - paid last month but missing previous",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${lastMonthStr}`);
    console.log(`   ⚠️  Missing payment for ${twoMonthsAgoStr} (delinquent)`);
  }

  // Scenario 8: User with multiple months paid (well ahead)
  if (usersToSeed[7]) {
    console.log(`\n8. Creating payments for user 8 (well ahead - paid for multiple months):`);
    
    // Payment for three months ago
    await db.insert(payments).values({
      userId: usersToSeed[7],
      amount: "1.00",
      paymentDate: new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth(), 7),
      paymentMethod: "paypal",
      billingPeriod: "monthly",
      billingMonth: threeMonthsAgoStr,
      recordedBy: adminUser.id,
      notes: "Test payment - well ahead user",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${threeMonthsAgoStr}`);

    // Payment for two months ago
    await db.insert(payments).values({
      userId: usersToSeed[7],
      amount: "1.00",
      paymentDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 5),
      paymentMethod: "venmo",
      billingPeriod: "monthly",
      billingMonth: twoMonthsAgoStr,
      recordedBy: adminUser.id,
      notes: "Test payment - well ahead user",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${twoMonthsAgoStr}`);

    // Payment for last month
    await db.insert(payments).values({
      userId: usersToSeed[7],
      amount: "1.00",
      paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 4),
      paymentMethod: "cash",
      billingPeriod: "monthly",
      billingMonth: lastMonthStr,
      recordedBy: adminUser.id,
      notes: "Test payment - well ahead user",
    });
    paymentsCreated++;
    console.log(`   ✓ Payment for ${lastMonthStr}`);
  }

  console.log(`\n✅ Payment tracking seed complete!`);
  console.log(`   Created ${paymentsCreated} payments`);
  console.log(`\n📊 Summary:`);
  console.log(`   - User 1: Up to date (paid for last month)`);
  console.log(`   - User 2: Delinquent (missing last month)`);
  console.log(`   - User 3: Severely delinquent (missing 2 months)`);
  console.log(`   - User 4: Yearly subscription (not delinquent)`);
  console.log(`   - User 5: Expired yearly (delinquent)`);
  console.log(`   - User 6: No payments (severely delinquent)`);
  console.log(`   - User 7: Paid last month, missing previous (delinquent)`);
  console.log(`   - User 8: Well ahead (paid for multiple months)`);
  console.log(`\n💡 Test the feature by:`);
  console.log(`   1. Viewing the admin payments page to see delinquent users`);
  console.log(`   2. Logging in as a delinquent user to see the payment reminder banner`);
  console.log(`   3. Checking the user payments page for in-context reminders`);
}

// Run the seed function
seedPaymentTracking()
  .then(() => {
    console.log("\n✅ Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });

