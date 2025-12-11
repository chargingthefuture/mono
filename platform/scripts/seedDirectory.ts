import { db } from "../server/db";
import { directoryProfiles, users, directoryAnnouncements, directorySkills, type InsertDirectoryProfile, type InsertDirectorySkill } from "../shared/schema";
import { ALL_SKILLS } from "../client/src/lib/skills";

async function seedDirectory() {
  console.log("Seeding Directory app profiles...");

  const countries = [
    "United States","United Kingdom","Canada","Australia","Germany","France","India","Brazil","Japan","Kenya"
  ];
  // Use ALL_SKILLS from client/src/lib/skills.ts (manually maintained list)
  const skillsPool = ALL_SKILLS;

  // Seed directory_skills table (REQUIRED for admin dropdown)
  console.log("Seeding directory skills...");
  for (const skillName of skillsPool) {
    try {
      await db.insert(directorySkills).values({
        name: skillName,
      } as InsertDirectorySkill);
      console.log(`Created skill: ${skillName}`);
    } catch (error) {
      // Skill may already exist (unique constraint), skip
      console.log(`Skill "${skillName}" may already exist, skipping...`);
    }
  }

  const pickSkills = () => {
    const shuffled = [...skillsPool].sort(() => Math.random() - 0.5);
    const n = 1 + Math.floor(Math.random() * 3);
    return shuffled.slice(0, n);
  };

  // Optionally attach some profiles to existing users to exercise first-name display
  const existingUsers = await db.select().from(users).limit(20);

  const count = 16;
  for (let i = 0; i < count; i++) {
    try {
      const maybeUser = existingUsers[i % Math.max(existingUsers.length, 1)];
      const attachToUser = !!maybeUser && Math.random() < 0.5;

      const payload: InsertDirectoryProfile = {
        // userId optional to allow unclaimed
        userId: attachToUser ? maybeUser.id : undefined,
        description: `Available for ${Math.random() < 0.5 ? 'helping' : 'learning'} (${i + 1})`,
        skills: pickSkills(),
        signalUrl: null,
        quoraUrl: null,
        city: null,
        state: null,
        country: countries[Math.floor(Math.random() * countries.length)],
        isPublic: Math.random() < 0.8,
        isVerified: Math.random() < 0.4,
        // isClaimed is automatically set based on userId presence
        // naming
        nickname: Math.random() < 0.6 ? `Helper ${i + 1}` : null,
        displayNameType: Math.random() < 0.5 ? 'nickname' : 'first',
      };

      await db.insert(directoryProfiles).values(payload);
    } catch (error) {
      console.log(`Row ${i + 1} may already exist, skipping...`);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to Directory",
      content: "Directory is a skill-sharing platform where survivors can offer help or seek assistance. Create a profile to connect with others in the community.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "Profile Verification",
      content: "Verified profiles help build trust in our community. Contact an admin if you'd like to verify your profile.",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires in 60 days
    },
    {
      title: "Safety Reminder",
      content: "Remember to use Signal for secure communication. Never share personal information publicly. Your safety is our priority.",
      type: "warning" as const,
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(directoryAnnouncements).values({
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

  console.log("Directory seed complete.");
  console.log(`- ${skillsPool.length} skills available (from ALL_SKILLS)`);
  console.log(`- ${count} profiles created`);
  console.log(`- ${announcementsData.length} announcements created`);
  process.exit(0);
}

seedDirectory().catch((error) => {
  console.error("Error seeding Directory:", error);
  process.exit(1);
});


