import { db } from "../server/db";
import { users, supportMatchProfiles, partnerships, reports } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedReportsData() {
  console.log("Creating test data for reporting system...");

  // First, create additional test users specifically for reporting scenarios
  const reportTestUsers = [
    {
      email: "reporter1@example.com",
      firstName: "Sarah",
      lastName: "Reporter",
      nickname: "Sarah",
      gender: "female",
      genderPreference: "any",
      timezone: "America/New_York",
    },
    {
      email: "reporter2@example.com",
      firstName: "Mike",
      lastName: "Reporter",
      nickname: "Mike",
      gender: "male",
      genderPreference: "any",
      timezone: "America/New_York",
    },
    {
      email: "problematic1@example.com",
      firstName: "John",
      lastName: "Problem",
      nickname: "John",
      gender: "male",
      genderPreference: "any",
      timezone: "America/New_York",
    },
    {
      email: "problematic2@example.com",
      firstName: "Jane",
      lastName: "Problem",
      nickname: "Jane",
      gender: "female",
      genderPreference: "any",
      timezone: "America/Chicago",
    },
    {
      email: "resolved1@example.com",
      firstName: "Tom",
      lastName: "Resolved",
      nickname: "Tom",
      gender: "male",
      genderPreference: "any",
      timezone: "America/Los_Angeles",
    },
    {
      email: "witness1@example.com",
      firstName: "Lisa",
      lastName: "Witness",
      nickname: "Lisa",
      gender: "female",
      genderPreference: "any",
      timezone: "America/Denver",
    },
  ];

  const createdUsers: any[] = [];

  for (const data of reportTestUsers) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          isApproved: true,
          isAdmin: false,
        })
        .returning();

      console.log(`Created user: ${data.email}`);

      await db.insert(supportMatchProfiles).values({
        userId: user.id,
        nickname: data.nickname,
        gender: data.gender,
        genderPreference: data.genderPreference,
        timezone: data.timezone,
        timezonePreference: "any_timezone", // Explicitly set
        isActive: true,
      });

      createdUsers.push({ ...user, nickname: data.nickname });
      console.log(`Created profile for: ${data.nickname}`);
    } catch (error) {
      console.log(`User ${data.email} may already exist, fetching...`);
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);
      if (existing[0]) {
        const profile = await db
          .select()
          .from(supportMatchProfiles)
          .where(eq(supportMatchProfiles.userId, existing[0].id))
          .limit(1);
        createdUsers.push({ ...existing[0], nickname: profile[0]?.nickname || data.nickname });
      }
    }
  }

  // Get all existing profiles to create partnerships
  const allProfiles = await db.select().from(supportMatchProfiles);
  
  if (allProfiles.length < 4) {
    console.log("Not enough users to create test partnerships. Please run seedTestUsers.ts first.");
    process.exit(1);
  }

  // Create some test partnerships to link reports to
  console.log("\nCreating test partnerships...");
  const testPartnerships: any[] = [];

  // Partnership 1: Sarah + John (will have a harassment report)
  if (createdUsers.length >= 3) {
    try {
      const sarah = createdUsers.find(u => u.email === "reporter1@example.com");
      const john = createdUsers.find(u => u.email === "problematic1@example.com");
      
      if (sarah && john) {
        const [partnership1] = await db
          .insert(partnerships)
          .values({
            user1Id: sarah.id,
            user2Id: john.id,
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            status: 'active',
          })
          .returning();
        testPartnerships.push(partnership1);
        console.log(`Created partnership: Sarah + John`);
      }
    } catch (error) {
      console.log("Partnership may already exist, continuing...");
    }
  }

  // Partnership 2: Mike + Jane (will have inappropriate content report, now resolved)
  if (createdUsers.length >= 4) {
    try {
      const mike = createdUsers.find(u => u.email === "reporter2@example.com");
      const jane = createdUsers.find(u => u.email === "problematic2@example.com");
      
      if (mike && jane) {
        const [partnership2] = await db
          .insert(partnerships)
          .values({
            user1Id: mike.id,
            user2Id: jane.id,
            startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // ended 5 days ago
            status: 'completed',
          })
          .returning();
        testPartnerships.push(partnership2);
        console.log(`Created partnership: Mike + Jane`);
      }
    } catch (error) {
      console.log("Partnership may already exist, continuing...");
    }
  }

  // Now create diverse test reports
  console.log("\nCreating test reports...");

  const sarah = createdUsers.find(u => u.email === "reporter1@example.com");
  const mike = createdUsers.find(u => u.email === "reporter2@example.com");
  const john = createdUsers.find(u => u.email === "problematic1@example.com");
  const jane = createdUsers.find(u => u.email === "problematic2@example.com");
  const tom = createdUsers.find(u => u.email === "resolved1@example.com");
  const lisa = createdUsers.find(u => u.email === "witness1@example.com");

  const reportsData = [
    // Report 1: Harassment - Pending
    {
      reporterId: sarah?.id,
      reportedUserId: john?.id,
      partnershipId: testPartnerships[0]?.id || null,
      reason: "harassment",
      description: "This user has been sending aggressive and threatening messages during our partnership check-ins. I no longer feel safe communicating with them.",
      status: "pending",
      resolution: null,
    },
    // Report 2: Inappropriate Content - Under Investigation
    {
      reporterId: mike?.id,
      reportedUserId: jane?.id,
      partnershipId: testPartnerships[1]?.id || null,
      reason: "inappropriate_content",
      description: "My partner shared inappropriate photos and content that violated the platform's community guidelines. This made me very uncomfortable.",
      status: "investigating",
      resolution: null,
    },
    // Report 3: Spam/Unwanted Contact - Pending
    {
      reporterId: lisa?.id,
      reportedUserId: john?.id,
      partnershipId: null,
      reason: "spam",
      description: "This user keeps trying to contact me outside of our designated partnership times and won't respect my boundaries when I ask them to stop.",
      status: "pending",
      resolution: null,
    },
    // Report 4: Boundary Violation - Resolved
    {
      reporterId: sarah?.id,
      reportedUserId: tom?.id,
      partnershipId: null,
      reason: "boundary_violation",
      description: "User asked for my personal phone number and social media accounts repeatedly despite me declining. Made me feel pressured.",
      status: "resolved",
      resolution: "Contacted both parties. Reported user apologized and agreed to respect boundaries. Partnership was ended early. User given a warning and required to complete boundary training module before future partnerships.",
    },
    // Report 5: Suspicious Activity - Dismissed
    {
      reporterId: mike?.id,
      reportedUserId: lisa?.id,
      partnershipId: null,
      reason: "suspicious_activity",
      description: "User's profile information seems fake and they asked unusual questions about other platform members.",
      status: "dismissed",
      resolution: "After investigation, user's profile was verified as legitimate. Questions were related to understanding how the matching algorithm works. No policy violations found. Reporter educated on platform features.",
    },
    // Report 6: Harassment - Resolved
    {
      reporterId: tom?.id,
      reportedUserId: jane?.id,
      partnershipId: null,
      reason: "harassment",
      description: "Received hostile messages after our partnership ended. User blamed me for their struggles and sent multiple angry messages.",
      status: "resolved",
      resolution: "User account temporarily suspended for 30 days. User must complete conflict resolution training before reinstatement. Reporter advised on blocking features and safety tools. Partnership history reviewed.",
    },
    // Report 7: Privacy Concern - Investigating
    {
      reporterId: lisa?.id,
      reportedUserId: john?.id,
      partnershipId: null,
      reason: "privacy_concern",
      description: "This user mentioned they found my Facebook profile and commented on photos I posted. I never shared that information with them and feel my privacy has been violated.",
      status: "investigating",
      resolution: null,
    },
    // Report 8: Other - Pending
    {
      reporterId: sarah?.id,
      reportedUserId: jane?.id,
      partnershipId: null,
      reason: "other",
      description: "My partner frequently missed our scheduled check-ins without notice and was unreliable. When they did show up, they seemed disinterested and distracted. This isn't helping my recovery.",
      status: "pending",
      resolution: null,
    },
  ];

  for (const reportData of reportsData) {
    if (!reportData.reporterId || !reportData.reportedUserId) {
      console.log("Skipping report - missing user IDs");
      continue;
    }

    try {
      await db.insert(reports).values({
        reporterId: reportData.reporterId,
        reportedUserId: reportData.reportedUserId,
        partnershipId: reportData.partnershipId,
        reason: reportData.reason,
        description: reportData.description,
        status: reportData.status,
        resolution: reportData.resolution,
      });
      console.log(`Created ${reportData.status} report: ${reportData.reason}`);
    } catch (error) {
      console.log(`Error creating report: ${error}`);
    }
  }

  console.log("\n✅ Test data created successfully!");
  console.log("\nReport Summary:");
  console.log("- 3 Pending reports (harassment, spam, other)");
  console.log("- 2 Investigating reports (inappropriate content, privacy concern)");
  console.log("- 2 Resolved reports (boundary violation, harassment)");
  console.log("- 1 Dismissed report (suspicious activity)");
  console.log("\nTotal: 8 diverse reports for testing the report management system");
  console.log("\nYou can now test:");
  console.log("- Viewing reports by status");
  console.log("- Filtering by reason");
  console.log("- Updating report status (pending → investigating → resolved/dismissed)");
  console.log("- Adding resolution notes");
  console.log("- Partnership-linked vs. standalone reports");
  
  process.exit(0);
}

seedReportsData().catch((error) => {
  console.error("Error seeding reports data:", error);
  process.exit(1);
});
