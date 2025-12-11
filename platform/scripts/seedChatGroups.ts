import { db } from "../server/db";
import { chatGroups, chatgroupsAnnouncements, type InsertChatGroup } from "../shared/schema";

async function seedChatGroups() {
  console.log("Seeding Chat Groups...");

  const groups: InsertChatGroup[] = [
    {
      name: "General Support",
      signalUrl: "https://signal.group/#CjQKIO6X...",
      description: "A general support group for all survivors to connect and share resources.",
      displayOrder: 1,
      isActive: true,
    },
    {
      name: "Local NYC Meetups",
      signalUrl: "https://signal.group/#CjQKIO6Y...",
      description: "Coordinate local meetups and events in New York City area.",
      displayOrder: 2,
      isActive: true,
    },
    {
      name: "Job Opportunities",
      signalUrl: "https://signal.group/#CjQKIO6Z...",
      description: "Share job postings, resume tips, and career support.",
      displayOrder: 3,
      isActive: true,
    },
  ];

  for (const groupData of groups) {
    try {
      await db.insert(chatGroups).values(groupData);
      console.log(`Created chat group: ${groupData.name}`);
    } catch (error) {
      console.log(`Chat group ${groupData.name} may already exist, skipping...`);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to Chat Groups",
      content: "Chat Groups connects you with Signal.org group chats for survivors. Join groups that match your interests and needs.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "New Groups Added",
      content: "We've added several new Signal groups this month. Check them out and find your community!",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    },
    {
      title: "Signal Privacy",
      content: "All groups use Signal for end-to-end encrypted communication. Your privacy and security are protected.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(chatgroupsAnnouncements).values({
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

  console.log("Chat Groups seed complete.");
  console.log(`- ${groups.length} chat groups created`);
  console.log(`- ${announcementsData.length} announcements created`);
  process.exit(0);
}

seedChatGroups().catch((error) => {
  console.error("Error seeding Chat Groups:", error);
  process.exit(1);
});

