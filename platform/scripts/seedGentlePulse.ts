import { db } from "../server/db";
import { 
  gentlepulseMeditations,
  gentlepulseRatings,
  gentlepulseMoodChecks,
  gentlepulseFavorites,
  gentlepulseAnnouncements
} from "../shared/schema";

// Generate a random client ID (simulating anonymous users)
function generateClientId(): string {
  return `client_${Math.random().toString(36).substring(2, 15)}`;
}

async function seedGentlePulse() {
  console.log("Creating GentlePulse seed data...");

  // Create meditation content
  const meditationsData = [
    {
      title: "Morning Calm - 10 Minute Guided Meditation",
      description: "Start your day with peace and clarity. This gentle morning meditation helps you set positive intentions and find calm before the day begins.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/abc123def",
      tags: JSON.stringify(["morning", "calm", "beginner", "10-min"]),
      duration: 10,
      position: 1,
      isActive: true,
    },
    {
      title: "Deep Sleep Meditation - 30 Minutes",
      description: "A longer meditation designed to help you relax deeply and fall asleep peacefully. Perfect for bedtime or when you need deep rest.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/def456ghi",
      tags: JSON.stringify(["sleep", "bedtime", "relaxation", "30-min"]),
      duration: 30,
      position: 2,
      isActive: true,
    },
    {
      title: "Anxiety Relief - Breathing Exercise",
      description: "When anxiety feels overwhelming, this breathing-focused meditation can help you find your center and calm your nervous system.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/ghi789jkl",
      tags: JSON.stringify(["anxiety", "breathing", "stress-relief", "15-min"]),
      duration: 15,
      position: 3,
      isActive: true,
    },
    {
      title: "Body Scan for Trauma Recovery",
      description: "A gentle body scan meditation designed specifically for trauma survivors. Move at your own pace and honor your body's signals.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/jkl012mno",
      tags: JSON.stringify(["trauma", "body-scan", "healing", "20-min"]),
      duration: 20,
      position: 4,
      isActive: true,
    },
    {
      title: "Gratitude Practice - 5 Minutes",
      description: "A short daily gratitude practice to help shift your perspective and find moments of joy, even on difficult days.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/mno345pqr",
      tags: JSON.stringify(["gratitude", "daily", "quick", "5-min"]),
      duration: 5,
      position: 5,
      isActive: true,
    },
    {
      title: "Loving Kindness Meditation",
      description: "Cultivate compassion for yourself and others with this traditional loving kindness practice. Suitable for all levels.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/pqr678stu",
      tags: JSON.stringify(["loving-kindness", "compassion", "self-care", "25-min"]),
      duration: 25,
      position: 6,
      isActive: true,
    },
    {
      title: "Grounding Meditation for Flashbacks",
      description: "When you feel disconnected or overwhelmed, this grounding meditation helps you return to the present moment safely.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/stu901vwx",
      tags: JSON.stringify(["grounding", "flashbacks", "safety", "12-min"]),
      duration: 12,
      position: 7,
      isActive: true,
    },
    {
      title: "Nature Sounds - Forest Walk",
      description: "Immerse yourself in the sounds of nature. A peaceful forest walk meditation to help you feel connected and calm.",
      thumbnail: null,
      wistiaUrl: "https://fast.wistia.net/embed/iframe/vwx234yza",
      tags: JSON.stringify(["nature", "sounds", "relaxation", "18-min"]),
      duration: 18,
      position: 8,
      isActive: true,
    },
  ];

  const createdMeditations: any[] = [];

  for (const meditationData of meditationsData) {
    try {
      const [meditation] = await db
        .insert(gentlepulseMeditations)
        .values({
          title: meditationData.title,
          description: meditationData.description,
          thumbnail: meditationData.thumbnail,
          wistiaUrl: meditationData.wistiaUrl,
          tags: meditationData.tags,
          duration: meditationData.duration,
          playCount: Math.floor(Math.random() * 100) + 10, // Random play count
          averageRating: (Math.random() * 1.5 + 3.5).toFixed(2), // Random rating between 3.5-5.0
          ratingCount: Math.floor(Math.random() * 50) + 5, // Random rating count
          position: meditationData.position,
          isActive: meditationData.isActive,
        })
        .returning();

      createdMeditations.push(meditation);
      console.log(`Created meditation: "${meditationData.title}"`);
    } catch (error) {
      console.log(`Error creating meditation:`, error);
    }
  }

  // Create some anonymous ratings (using client IDs)
  const clientIds = [generateClientId(), generateClientId(), generateClientId(), generateClientId()];
  
  const ratingsData = [
    { meditationIndex: 0, clientId: clientIds[0], rating: 5 },
    { meditationIndex: 0, clientId: clientIds[1], rating: 4 },
    { meditationIndex: 1, clientId: clientIds[0], rating: 5 },
    { meditationIndex: 1, clientId: clientIds[2], rating: 5 },
    { meditationIndex: 2, clientId: clientIds[1], rating: 4 },
    { meditationIndex: 2, clientId: clientIds[3], rating: 5 },
    { meditationIndex: 3, clientId: clientIds[0], rating: 5 },
    { meditationIndex: 4, clientId: clientIds[2], rating: 4 },
    { meditationIndex: 5, clientId: clientIds[1], rating: 5 },
    { meditationIndex: 6, clientId: clientIds[3], rating: 5 },
  ];

  for (const ratingData of ratingsData) {
    try {
      const meditation = createdMeditations[ratingData.meditationIndex];
      if (!meditation) {
        console.log(`Skipping rating - missing meditation`);
        continue;
      }

      await db.insert(gentlepulseRatings).values({
        meditationId: meditation.id,
        clientId: ratingData.clientId,
        rating: ratingData.rating,
      });

      console.log(`Created rating: ${ratingData.rating} stars`);
    } catch (error) {
      console.log(`Error creating rating:`, error);
    }
  }

  // Create some mood checks (anonymous, using client IDs)
  const moodChecksData = [
    { clientId: clientIds[0], moodValue: 3, daysAgo: 0 }, // Today
    { clientId: clientIds[0], moodValue: 4, daysAgo: 1 }, // Yesterday
    { clientId: clientIds[0], moodValue: 3, daysAgo: 2 },
    { clientId: clientIds[1], moodValue: 4, daysAgo: 0 },
    { clientId: clientIds[1], moodValue: 5, daysAgo: 1 },
    { clientId: clientIds[2], moodValue: 2, daysAgo: 0 },
    { clientId: clientIds[2], moodValue: 3, daysAgo: 1 },
    { clientId: clientIds[3], moodValue: 4, daysAgo: 0 },
  ];

  for (const moodData of moodChecksData) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - moodData.daysAgo);

      await db.insert(gentlepulseMoodChecks).values({
        clientId: moodData.clientId,
        moodValue: moodData.moodValue,
        date: date.toISOString().split('T')[0], // ISO date string
      });

      console.log(`Created mood check: ${moodData.moodValue}/5`);
    } catch (error) {
      console.log(`Error creating mood check:`, error);
    }
  }

  // Create some favorites (anonymous, using client IDs)
  const favoritesData = [
    { meditationIndex: 0, clientId: clientIds[0] },
    { meditationIndex: 1, clientId: clientIds[0] },
    { meditationIndex: 2, clientId: clientIds[1] },
    { meditationIndex: 3, clientId: clientIds[1] },
    { meditationIndex: 4, clientId: clientIds[2] },
    { meditationIndex: 5, clientId: clientIds[3] },
  ];

  for (const favoriteData of favoritesData) {
    try {
      const meditation = createdMeditations[favoriteData.meditationIndex];
      if (!meditation) {
        console.log(`Skipping favorite - missing meditation`);
        continue;
      }

      await db.insert(gentlepulseFavorites).values({
        meditationId: meditation.id,
        clientId: favoriteData.clientId,
      });

      console.log(`Created favorite`);
    } catch (error) {
      console.log(`Error creating favorite:`, error);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to GentlePulse",
      content: "GentlePulse is a meditation library designed specifically for trauma survivors. All meditations are trauma-informed and can be used at your own pace.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "New Meditations Added",
      content: "We've added several new guided meditations this month, including anxiety relief and grounding practices. Check them out!",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    },
    {
      title: "Self-Care Reminder",
      content: "Remember to take care of yourself. If a meditation doesn't feel right, it's okay to stop. Your safety and comfort come first.",
      type: "warning" as const,
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(gentlepulseAnnouncements).values({
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

  console.log("\n✅ GentlePulse seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${createdMeditations.length} meditations created`);
  console.log(`  - ${createdMeditations.filter(m => m.duration <= 10).length} short (≤10 min)`);
  console.log(`  - ${createdMeditations.filter(m => m.duration > 10 && m.duration <= 20).length} medium (11-20 min)`);
  console.log(`  - ${createdMeditations.filter(m => m.duration > 20).length} long (>20 min)`);
  console.log(`- ${ratingsData.length} ratings created`);
  console.log(`- ${moodChecksData.length} mood checks created`);
  console.log(`- ${favoritesData.length} favorites created`);
  console.log(`- ${announcementsData.length} announcements created`);
  
  process.exit(0);
}

seedGentlePulse().catch((error) => {
  console.error("Error seeding GentlePulse data:", error);
  process.exit(1);
});

