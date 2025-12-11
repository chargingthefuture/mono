import { db } from "../server/db";
import { 
  users, 
  supportMatchProfiles, 
  partnerships, 
  messages, 
  exclusions, 
  reports,
  supportmatchAnnouncements
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedSupportMatch() {
  console.log("Creating SupportMatch seed data...");

  // Create test users for SupportMatch
  const testUsers = [
    { email: "alice@example.com", firstName: "Alice", lastName: "Smith", nickname: "Alice", gender: "female", genderPreference: "any", timezone: "America/New_York", city: "New York", state: "New York", country: "United States" },
    { email: "bob@example.com", firstName: "Bob", lastName: "Johnson", nickname: "Bob", gender: "male", genderPreference: "same_gender", timezone: "America/New_York", city: "Boston", state: "Massachusetts", country: "United States" },
    { email: "carol@example.com", firstName: "Carol", lastName: "Williams", nickname: "Carol", gender: "female", genderPreference: "same_gender", timezone: "America/Los_Angeles", city: "Los Angeles", state: "California", country: "United States" },
    { email: "david@example.com", firstName: "David", lastName: "Brown", nickname: "David", gender: "male", genderPreference: "any", timezone: "America/New_York", city: "Philadelphia", state: "Pennsylvania", country: "United States" },
    { email: "emma@example.com", firstName: "Emma", lastName: "Davis", nickname: "Emma", gender: "female", genderPreference: "any", timezone: "America/Chicago", city: "Chicago", state: "Illinois", country: "United States" },
    { email: "frank@example.com", firstName: "Frank", lastName: "Miller", nickname: "Frank", gender: "male", genderPreference: "same_gender", timezone: "America/Chicago", city: "Detroit", state: "Michigan", country: "United States" },
    { email: "grace@example.com", firstName: "Grace", lastName: "Taylor", nickname: "Grace", gender: "female", genderPreference: "same_gender", timezone: "America/New_York", city: "Washington", state: "District of Columbia", country: "United States" },
    { email: "henry@example.com", firstName: "Henry", lastName: "Anderson", nickname: "Henry", gender: "male", genderPreference: "any", timezone: "America/Los_Angeles", city: "San Francisco", state: "California", country: "United States" },
  ];

  const userIds: Record<string, string> = {};
  const createdProfiles: Record<string, any> = {};

  // Create users and profiles
  for (const userData of testUsers) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isApproved: true,
          isAdmin: false,
        })
        .returning();

      userIds[userData.email] = user.id;
      console.log(`Created user: ${userData.email}`);
    } catch (error) {
      // User might already exist, try to get their ID
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingUser) {
        userIds[userData.email] = existingUser.id;
        console.log(`User ${userData.email} already exists, using existing ID`);
      }
    }

    // Create SupportMatch profile
    try {
      const [profile] = await db
        .insert(supportMatchProfiles)
        .values({
          userId: userIds[userData.email],
          nickname: userData.nickname,
          gender: userData.gender,
          genderPreference: userData.genderPreference,
          city: userData.city,
          state: userData.state,
          country: userData.country,
          timezone: userData.timezone,
          timezonePreference: "same_timezone",
          isActive: true,
        })
        .returning();

      createdProfiles[userData.email] = profile;
      console.log(`Created SupportMatch profile for: ${userData.email}`);
    } catch (error) {
      console.log(`Profile for ${userData.email} already exists or error:`, error);
      // Try to get existing profile
      const [existingProfile] = await db
        .select()
        .from(supportMatchProfiles)
        .where(eq(supportMatchProfiles.userId, userIds[userData.email]));
      
      if (existingProfile) {
        createdProfiles[userData.email] = existingProfile;
      }
    }
  }

  // Create partnerships
  const partnershipsData = [
    {
      user1Email: "alice@example.com",
      user2Email: "david@example.com",
      status: "active" as const,
      daysAgo: 5, // Started 5 days ago
    },
    {
      user1Email: "bob@example.com",
      user2Email: "frank@example.com",
      status: "active" as const,
      daysAgo: 10, // Started 10 days ago
    },
    {
      user1Email: "carol@example.com",
      user2Email: "grace@example.com",
      status: "completed" as const,
      daysAgo: 35, // Started 35 days ago (completed)
    },
    {
      user1Email: "emma@example.com",
      user2Email: "henry@example.com",
      status: "ended_early" as const,
      daysAgo: 20, // Started 20 days ago, ended early
    },
  ];

  const createdPartnerships: any[] = [];

  for (const partnershipData of partnershipsData) {
    try {
      const profile1 = createdProfiles[partnershipData.user1Email];
      const profile2 = createdProfiles[partnershipData.user2Email];

      if (!profile1 || !profile2) {
        console.log(`Skipping partnership - missing profiles`);
        continue;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - partnershipData.daysAgo);

      let endDate: Date | null = null;
      if (partnershipData.status === "completed") {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30); // 30-day partnership
      } else if (partnershipData.status === "ended_early") {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 15); // Ended after 15 days
      }

      const [partnership] = await db
        .insert(partnerships)
        .values({
          user1Id: profile1.userId,
          user2Id: profile2.userId,
          startDate: startDate,
          endDate: endDate,
          status: partnershipData.status,
        })
        .returning();

      createdPartnerships.push(partnership);
      console.log(`Created partnership: ${partnershipData.user1Email} <-> ${partnershipData.user2Email} (${partnershipData.status})`);
    } catch (error) {
      console.log(`Error creating partnership:`, error);
    }
  }

  // Create messages for active partnerships
  const messagesData = [
    {
      partnershipIndex: 0, // Alice <-> David
      senderEmail: "alice@example.com",
      content: "Hi David! Just checking in. How are you doing today?",
      hoursAgo: 2,
    },
    {
      partnershipIndex: 0,
      senderEmail: "david@example.com",
      content: "Hey Alice! I'm doing well, thanks for checking in. Had a good day at work today.",
      hoursAgo: 1,
    },
    {
      partnershipIndex: 0,
      senderEmail: "alice@example.com",
      content: "That's great to hear! I'm here if you need to talk about anything.",
      hoursAgo: 0.5,
    },
    {
      partnershipIndex: 1, // Bob <-> Frank
      senderEmail: "bob@example.com",
      content: "Morning Frank! Hope you're having a good week.",
      hoursAgo: 5,
    },
    {
      partnershipIndex: 1,
      senderEmail: "frank@example.com",
      content: "Thanks Bob! Same to you. Let's keep each other accountable this week.",
      hoursAgo: 4,
    },
    {
      partnershipIndex: 1,
      senderEmail: "bob@example.com",
      content: "Absolutely! We've got this.",
      hoursAgo: 3,
    },
  ];

  for (const messageData of messagesData) {
    try {
      const partnership = createdPartnerships[messageData.partnershipIndex];
      const senderProfile = createdProfiles[messageData.senderEmail];

      if (!partnership || !senderProfile) {
        console.log(`Skipping message - missing partnership or sender`);
        continue;
      }

      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - messageData.hoursAgo);

      await db.insert(messages).values({
        partnershipId: partnership.id,
        senderId: senderProfile.userId,
        content: messageData.content,
        createdAt: createdAt,
      });

      console.log(`Created message from ${messageData.senderEmail}`);
    } catch (error) {
      console.log(`Error creating message:`, error);
    }
  }

  // Create some exclusions (user blocking)
  const exclusionsData = [
    {
      userEmail: "emma@example.com",
      excludedUserEmail: "henry@example.com",
      reason: "Incompatible communication style",
    },
  ];

  for (const exclusionData of exclusionsData) {
    try {
      const userProfile = createdProfiles[exclusionData.userEmail];
      const excludedProfile = createdProfiles[exclusionData.excludedUserEmail];

      if (!userProfile || !excludedProfile) {
        console.log(`Skipping exclusion - missing profiles`);
        continue;
      }

      await db.insert(exclusions).values({
        userId: userProfile.userId,
        excludedUserId: excludedProfile.userId,
        reason: exclusionData.reason,
      });

      console.log(`Created exclusion: ${exclusionData.userEmail} blocked ${exclusionData.excludedUserEmail}`);
    } catch (error) {
      console.log(`Error creating exclusion:`, error);
    }
  }

  // Create some reports
  const reportsData = [
    {
      reporterEmail: "carol@example.com",
      reportedUserEmail: "grace@example.com",
      partnershipIndex: 2, // Carol <-> Grace (completed partnership)
      reason: "Inappropriate behavior",
      description: "User made inappropriate comments during our partnership.",
      status: "resolved" as const,
      resolution: "Issue was addressed and partnership completed successfully.",
    },
  ];

  for (const reportData of reportsData) {
    try {
      const reporterProfile = createdProfiles[reportData.reporterEmail];
      const reportedProfile = createdProfiles[reportData.reportedUserEmail];
      const partnership = createdPartnerships[reportData.partnershipIndex];

      if (!reporterProfile || !reportedProfile) {
        console.log(`Skipping report - missing profiles`);
        continue;
      }

      await db.insert(reports).values({
        reporterId: reporterProfile.userId,
        reportedUserId: reportedProfile.userId,
        partnershipId: partnership?.id || null,
        reason: reportData.reason,
        description: reportData.description,
        status: reportData.status,
        resolution: reportData.resolution,
      });

      console.log(`Created report: ${reportData.reporterEmail} reported ${reportData.reportedUserEmail}`);
    } catch (error) {
      console.log(`Error creating report:`, error);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to SupportMatch",
      content: "SupportMatch helps you find accountability partners for your recovery journey. Create your profile and get matched with compatible partners.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "Monthly Matching Cycle",
      content: "New partnerships are created at the beginning of each month. Make sure your profile is active to be included in the next matching cycle.",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    },
    {
      title: "Safety Reminder",
      content: "Remember to report any inappropriate behavior through the reporting system. Your safety is our top priority.",
      type: "warning" as const,
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(supportmatchAnnouncements).values({
        title: announcementData.title,
        content: announcementData.content,
        type: announcementData.type,
        isActive: announcementData.isActive,
        expiresAt: announcementData.expiresAt,
      });

      console.log(`Created announcement: ${announcementData.title}`);
    } catch (error) {
      console.log(`Error creating announcement:`, error);
    }
  }

  console.log("\n✅ SupportMatch seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${testUsers.length} users created`);
  console.log(`- ${testUsers.length} SupportMatch profiles created`);
  console.log(`- ${createdPartnerships.length} partnerships created`);
  console.log(`  - ${createdPartnerships.filter(p => p.status === 'active').length} active`);
  console.log(`  - ${createdPartnerships.filter(p => p.status === 'completed').length} completed`);
  console.log(`  - ${createdPartnerships.filter(p => p.status === 'ended_early').length} ended early`);
  console.log(`- ${messagesData.length} messages created`);
  console.log(`- ${exclusionsData.length} exclusions created`);
  console.log(`- ${reportsData.length} reports created`);
  console.log(`- ${announcementsData.length} announcements created`);
  
  process.exit(0);
}

seedSupportMatch().catch((error) => {
  console.error("Error seeding SupportMatch data:", error);
  process.exit(1);
});

