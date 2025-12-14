import { db } from "../server/db";
import { 
  chymeAnnouncements
} from "../shared/schema";

async function seedChyme() {
  console.log("Creating Chyme seed data...");

  // Create announcements
  const announcements = [
    {
      title: "Welcome to Chyme",
      content: "Chyme is an Android app authenticator. Generate OTP codes to sign in to the Android app.",
      type: "info" as const,
      isActive: true,
    },
    {
      title: "How to Use",
      content: "Click 'Generate OTP Code' to create a one-time passcode. Enter this code in the Android app to sign in. Codes expire in 5 minutes.",
      type: "info" as const,
      isActive: true,
    },
  ];

  for (const announcementData of announcements) {
    try {
      await db
        .insert(chymeAnnouncements)
        .values(announcementData);
      console.log(`Created announcement: ${announcementData.title}`);
    } catch (error: any) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        console.log(`Announcement already exists: ${announcementData.title}`);
      } else {
        console.error(`Error creating announcement:`, error.message);
      }
    }
  }

  console.log("\n✅ Chyme seeding completed!");
  console.log(`   - Created ${announcements.length} announcements`);
}

// Run the seed function
seedChyme()
  .then(() => {
    console.log("\n🎉 Chyme seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error running Chyme seed script:", error);
    process.exit(1);
  });
