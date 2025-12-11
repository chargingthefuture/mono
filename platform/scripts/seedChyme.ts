import { db } from "../server/db";
import { 
  users, 
  chymeProfiles,
  chymeRooms,
  chymeAnnouncements
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedChyme() {
  console.log("Creating Chyme seed data...");

  // Get existing users (or create test users if needed)
  const existingUsers = await db.select().from(users).limit(5);
  
  if (existingUsers.length === 0) {
    console.log("No users found. Please run seedTestUsers.ts first.");
    return;
  }

  // Create Chyme profiles for existing users
  const createdProfiles: Record<string, string> = {};
  
  for (const user of existingUsers.slice(0, 3)) {
    try {
      const [profile] = await db
        .insert(chymeProfiles)
        .values({
          userId: user.id,
          displayName: `${user.firstName || "User"}`,
          isAnonymous: false,
        })
        .returning();
      
      createdProfiles[user.id] = profile.id;
      console.log(`Created Chyme profile for user: ${user.email}`);
    } catch (error: any) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        console.log(`Profile already exists for user: ${user.email}`);
        const [existing] = await db
          .select()
          .from(chymeProfiles)
          .where(eq(chymeProfiles.userId, user.id));
        if (existing) {
          createdProfiles[user.id] = existing.id;
        }
      } else {
        console.error(`Error creating profile for ${user.email}:`, error.message);
      }
    }
  }

  // Create test rooms
  const roomCreatorId = existingUsers[0]?.id;
  if (!roomCreatorId) {
    console.log("No users available to create rooms");
    return;
  }

  const rooms = [
    {
      name: "General Discussion",
      description: "A welcoming space for general conversations and support",
      roomType: "private" as const,
      maxParticipants: 20,
      isActive: true,
    },
    {
      name: "Public Listening Room",
      description: "Open room for anyone to listen in. Chat requires authentication.",
      roomType: "public" as const,
      maxParticipants: 50,
      isActive: true,
    },
    {
      name: "Evening Support",
      description: "Evening hours support and discussion",
      roomType: "private" as const,
      maxParticipants: 15,
      isActive: true,
    },
  ];

  const createdRooms: string[] = [];

  for (const roomData of rooms) {
    try {
      const [room] = await db
        .insert(chymeRooms)
        .values({
          ...roomData,
          createdBy: roomCreatorId,
        })
        .returning();
      
      createdRooms.push(room.id);
      console.log(`Created room: ${room.name} (${room.roomType})`);
    } catch (error: any) {
      console.error(`Error creating room ${roomData.name}:`, error.message);
    }
  }

  // Create announcements
  const announcements = [
    {
      title: "Welcome to Chyme Audio Rooms",
      content: "Chyme provides secure, private audio rooms for voice conversations. Create your profile to get started!",
      type: "info" as const,
      isActive: true,
    },
    {
      title: "Privacy and Security",
      content: "All audio streams are encrypted end-to-end. Your privacy and safety are our top priorities.",
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
  console.log(`   - Created ${Object.keys(createdProfiles).length} profiles`);
  console.log(`   - Created ${createdRooms.length} rooms`);
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


