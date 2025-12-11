import { db } from "../server/db";
import { 
  users,
  researchItems, 
  researchAnswers,
  researchComments,
  researchVotes,
  researchBookmarks,
  researchAnnouncements
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedResearch() {
  console.log("Creating Research seed data...");

  // Get or create test users
  const testUserEmails = [
    "researcher1@example.com",
    "researcher2@example.com",
    "researcher3@example.com",
    "researcher4@example.com",
  ];

  const userIds: Record<string, string> = {};

  for (const email of testUserEmails) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          email: email,
          firstName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          lastName: "Researcher",
          isApproved: true,
          isAdmin: false,
        })
        .returning();

      userIds[email] = user.id;
      console.log(`Created user: ${email}`);
    } catch (error) {
      // User might already exist
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      
      if (existingUser) {
        userIds[email] = existingUser.id;
        console.log(`User ${email} already exists, using existing ID`);
      }
    }
  }

  // Create research items (questions/posts)
  const researchItemsData = [
    {
      userEmail: "researcher1@example.com",
      title: "What are the best resources for trauma-informed therapy?",
      bodyMd: "I'm looking for recommendations on trauma-informed therapy approaches and resources. What has worked well for others?",
      tags: JSON.stringify(["therapy", "trauma", "resources"]),
      attachments: null,
      deadline: null,
      isPublic: true,
      status: "open" as const,
      daysAgo: 5,
    },
    {
      userEmail: "researcher2@example.com",
      title: "How to find safe housing after leaving a trafficking situation?",
      bodyMd: "I need information about finding safe, affordable housing. What programs or resources are available?",
      tags: JSON.stringify(["housing", "safety", "resources"]),
      attachments: null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isPublic: true,
      status: "in_progress" as const,
      daysAgo: 3,
    },
    {
      userEmail: "researcher1@example.com",
      title: "Legal rights for survivors - what should I know?",
      bodyMd: "I'm trying to understand my legal rights as a survivor. Can anyone share information about legal resources and protections?",
      tags: JSON.stringify(["legal", "rights", "survivors"]),
      attachments: null,
      deadline: null,
      isPublic: true,
      status: "answered" as const,
      daysAgo: 10,
    },
    {
      userEmail: "researcher3@example.com",
      title: "Support groups in my area",
      bodyMd: "Are there any support groups for survivors in the Portland area? Looking for in-person or online options.",
      tags: JSON.stringify(["support-groups", "portland", "community"]),
      attachments: null,
      deadline: null,
      isPublic: false,
      status: "open" as const,
      daysAgo: 1,
    },
  ];

  const createdItems: any[] = [];

  for (const itemData of researchItemsData) {
    try {
      const userId = userIds[itemData.userEmail];
      if (!userId) {
        console.log(`Skipping item - user not found: ${itemData.userEmail}`);
        continue;
      }

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - itemData.daysAgo);

      const [item] = await db
        .insert(researchItems)
        .values({
          userId: userId,
          title: itemData.title,
          bodyMd: itemData.bodyMd,
          tags: itemData.tags,
          attachments: itemData.attachments,
          deadline: itemData.deadline,
          isPublic: itemData.isPublic,
          status: itemData.status,
          viewCount: Math.floor(Math.random() * 50) + 10, // Random view count
          createdAt: createdAt,
          updatedAt: createdAt,
        })
        .returning();

      createdItems.push(item);
      console.log(`Created research item: "${itemData.title}"`);
    } catch (error) {
      console.log(`Error creating research item:`, error);
    }
  }

  // Create answers for research items
  const answersData = [
    {
      itemIndex: 0, // Trauma-informed therapy question
      userEmail: "researcher2@example.com",
      bodyMd: "I've found EMDR (Eye Movement Desensitization and Reprocessing) to be very effective. Here are some resources:\n\n- [EMDR Institute](https://www.emdr.com)\n- [Trauma-Informed Care Network](https://www.traumainformedcare.org)\n\nCognitive Behavioral Therapy (CBT) adapted for trauma is also helpful.",
      links: JSON.stringify(["https://www.emdr.com", "https://www.traumainformedcare.org"]),
      attachments: null,
      confidenceScore: 85,
      daysAgo: 4,
    },
    {
      itemIndex: 0,
      userEmail: "researcher3@example.com",
      bodyMd: "Somatic experiencing and body-based therapies can be particularly helpful for trauma. The book 'The Body Keeps the Score' by Bessel van der Kolk is an excellent resource.",
      links: null,
      attachments: null,
      confidenceScore: 75,
      daysAgo: 3,
    },
    {
      itemIndex: 1, // Housing question
      userEmail: "researcher4@example.com",
      bodyMd: "There are several programs available:\n\n1. **HUD Section 8 Housing** - Provides rental assistance\n2. **Local non-profits** - Many cities have organizations specifically for survivors\n3. **Transitional housing programs** - Short-term housing with support services\n\nI recommend contacting your local housing authority first.",
      links: JSON.stringify(["https://www.hud.gov/topics/rental_assistance"]),
      attachments: null,
      confidenceScore: 90,
      daysAgo: 2,
    },
    {
      itemIndex: 2, // Legal rights question
      userEmail: "researcher2@example.com",
      bodyMd: "As a survivor, you have several important legal rights:\n\n- **Right to privacy** - Your personal information is protected\n- **Right to safety** - You can request protective orders\n- **Right to compensation** - You may be eligible for victim compensation funds\n- **Right to legal representation** - Free legal services are available through various organizations\n\nI recommend contacting a legal aid organization in your area.",
      links: JSON.stringify(["https://www.lsc.gov"]),
      attachments: null,
      confidenceScore: 80,
      isAccepted: true, // This answer was accepted
      daysAgo: 8,
    },
  ];

  const createdAnswers: any[] = [];

  for (const answerData of answersData) {
    try {
      const item = createdItems[answerData.itemIndex];
      const userId = userIds[answerData.userEmail];

      if (!item || !userId) {
        console.log(`Skipping answer - missing item or user`);
        continue;
      }

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - answerData.daysAgo);

      const [answer] = await db
        .insert(researchAnswers)
        .values({
          researchItemId: item.id,
          userId: userId,
          bodyMd: answerData.bodyMd,
          links: answerData.links,
          attachments: answerData.attachments,
          confidenceScore: answerData.confidenceScore,
          score: Math.floor(Math.random() * 20) + 5, // Random score
          isAccepted: answerData.isAccepted || false,
          createdAt: createdAt,
          updatedAt: createdAt,
        })
        .returning();

      createdAnswers.push(answer);
      console.log(`Created answer for item "${item.title.substring(0, 50)}..."`);

      // If this answer was accepted, update the research item
      if (answerData.isAccepted) {
        await db
          .update(researchItems)
          .set({ 
            acceptedAnswerId: answer.id,
            status: "answered"
          })
          .where(eq(researchItems.id, item.id));
      }
    } catch (error) {
      console.log(`Error creating answer:`, error);
    }
  }

  // Create comments
  const commentsData = [
    {
      itemIndex: 0,
      answerIndex: null,
      userEmail: "researcher4@example.com",
      bodyMd: "Thank you for sharing these resources! I'll look into EMDR.",
      parentCommentId: null,
      daysAgo: 2,
    },
    {
      itemIndex: 0,
      answerIndex: 0,
      userEmail: "researcher1@example.com",
      bodyMd: "This is very helpful, thank you!",
      parentCommentId: null,
      daysAgo: 1,
    },
    {
      itemIndex: 2,
      answerIndex: 3,
      userEmail: "researcher3@example.com",
      bodyMd: "Great information! I found this very useful.",
      parentCommentId: null,
      daysAgo: 5,
    },
  ];

  for (const commentData of commentsData) {
    try {
      const item = createdItems[commentData.itemIndex];
      const userId = userIds[commentData.userEmail];

      if (!item || !userId) {
        console.log(`Skipping comment - missing item or user`);
        continue;
      }

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - commentData.daysAgo);

      await db.insert(researchComments).values({
        researchItemId: commentData.answerIndex === null ? item.id : null,
        answerId: commentData.answerIndex !== null ? createdAnswers[commentData.answerIndex]?.id : null,
        userId: userId,
        bodyMd: commentData.bodyMd,
        parentCommentId: commentData.parentCommentId,
        createdAt: createdAt,
        updatedAt: createdAt,
      });

      console.log(`Created comment`);
    } catch (error) {
      console.log(`Error creating comment:`, error);
    }
  }

  // Create some votes
  const votesData = [
    { itemIndex: 0, answerIndex: 0, userEmail: "researcher1@example.com", value: 1 },
    { itemIndex: 0, answerIndex: 0, userEmail: "researcher3@example.com", value: 1 },
    { itemIndex: 0, answerIndex: 1, userEmail: "researcher1@example.com", value: 1 },
    { itemIndex: 2, answerIndex: 3, userEmail: "researcher1@example.com", value: 1 },
    { itemIndex: 2, answerIndex: 3, userEmail: "researcher3@example.com", value: 1 },
    { itemIndex: 2, answerIndex: 3, userEmail: "researcher4@example.com", value: 1 },
  ];

  for (const voteData of votesData) {
    try {
      const item = createdItems[voteData.itemIndex];
      const answer = createdAnswers[voteData.answerIndex];
      const userId = userIds[voteData.userEmail];

      if (!item || !answer || !userId) {
        console.log(`Skipping vote - missing item, answer, or user`);
        continue;
      }

      await db.insert(researchVotes).values({
        userId: userId,
        researchItemId: null,
        answerId: answer.id,
        value: voteData.value,
      });

      console.log(`Created vote`);
    } catch (error) {
      console.log(`Error creating vote:`, error);
    }
  }

  // Create some bookmarks
  const bookmarksData = [
    { itemIndex: 0, userEmail: "researcher2@example.com" },
    { itemIndex: 1, userEmail: "researcher3@example.com" },
    { itemIndex: 2, userEmail: "researcher4@example.com" },
  ];

  for (const bookmarkData of bookmarksData) {
    try {
      const item = createdItems[bookmarkData.itemIndex];
      const userId = userIds[bookmarkData.userEmail];

      if (!item || !userId) {
        console.log(`Skipping bookmark - missing item or user`);
        continue;
      }

      await db.insert(researchBookmarks).values({
        userId: userId,
        researchItemId: item.id,
      });

      console.log(`Created bookmark`);
    } catch (error) {
      console.log(`Error creating bookmark:`, error);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to Research",
      content: "Research is a Q&A and knowledge-sharing platform for survivors. Ask questions, share knowledge, and help build a community of support.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "Community Guidelines",
      content: "Please be respectful and trauma-informed in all interactions. Remember that everyone here is on their own journey.",
      type: "warning" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "New Features Available",
      content: "You can now bookmark questions and follow topics. Check out the new features!",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires in 60 days
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(researchAnnouncements).values({
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

  console.log("\n✅ Research seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${testUserEmails.length} users created`);
  console.log(`- ${createdItems.length} research items created`);
  console.log(`  - ${createdItems.filter(i => i.status === 'open').length} open`);
  console.log(`  - ${createdItems.filter(i => i.status === 'in_progress').length} in_progress`);
  console.log(`  - ${createdItems.filter(i => i.status === 'answered').length} answered`);
  console.log(`- ${createdAnswers.length} answers created`);
  console.log(`  - ${createdAnswers.filter(a => a.isAccepted).length} accepted`);
  console.log(`- ${commentsData.length} comments created`);
  console.log(`- ${votesData.length} votes created`);
  console.log(`- ${bookmarksData.length} bookmarks created`);
  console.log(`- ${announcementsData.length} announcements created`);
  
  process.exit(0);
}

seedResearch().catch((error) => {
  console.error("Error seeding Research data:", error);
  process.exit(1);
});

