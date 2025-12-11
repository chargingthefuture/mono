import { db } from "../server/db";
import { users, socketrelayProfiles, socketrelayRequests, socketrelayFulfillments, socketrelayMessages } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedSocketRelay() {
  console.log("Creating SocketRelay seed data...");

  // Create test users for SocketRelay
  const testUsers = [
    { email: "requester1@example.com", firstName: "Sarah", lastName: "Chen" },
    { email: "requester2@example.com", firstName: "Marcus", lastName: "Johnson" },
    { email: "requester3@example.com", firstName: "Lisa", lastName: "Rodriguez" },
    { email: "fulfiller1@example.com", firstName: "Alex", lastName: "Kim" },
    { email: "fulfiller2@example.com", firstName: "Jordan", lastName: "Taylor" },
    { email: "fulfiller3@example.com", firstName: "Morgan", lastName: "Davis" },
  ];

  const userIds: Record<string, string> = {};

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
  }

  // Create SocketRelay profiles for all users
  const profilesData = [
    { email: "requester1@example.com", displayName: "Sarah C.", city: "Daytona Beach", state: "Florida", country: "United States" },
    { email: "requester2@example.com", displayName: "Marcus J.", city: "New York", state: "New York", country: "United States" },
    { email: "requester3@example.com", displayName: "Lisa R.", city: "Chicago", state: "Illinois", country: "United States" },
    { email: "fulfiller1@example.com", displayName: "Alex K.", city: "Daytona Beach", state: "Florida", country: "United States" },
    { email: "fulfiller2@example.com", displayName: "Jordan T.", city: "New York", state: "New York", country: "United States" },
    { email: "fulfiller3@example.com", displayName: "Morgan D.", city: "Chicago", state: "Illinois", country: "United States" },
  ];

  for (const profileData of profilesData) {
    try {
      await db.insert(socketrelayProfiles).values({
        userId: userIds[profileData.email],
        displayName: profileData.displayName,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
      });
      console.log(`Created profile for: ${profileData.email}`);
    } catch (error) {
      console.log(`Profile for ${profileData.email} already exists`);
    }
  }

  // Create various requests with mix of public and private
  const requestsData = [
    {
      userId: userIds["requester1@example.com"],
      description: "Looking for warm winter coats, size L or XL. Any condition is fine, just need something for the cold weather.",
      daysAgo: 2,
      status: 'active' as const,
      isPublic: true, // Public - user wants to share
    },
    {
      userId: userIds["requester2@example.com"],
      description: "Need pots and pans for my new apartment. Basic cookware set would be amazing!",
      daysAgo: 5,
      status: 'active' as const,
      isPublic: false, // Private - user chose not to share
    },
    {
      userId: userIds["requester3@example.com"],
      description: "Looking for women's professional clothes, size 8-10. Starting a new job and need interview outfits.",
      daysAgo: 1,
      status: 'active' as const,
      isPublic: true, // Public
    },
    {
      userId: userIds["requester1@example.com"],
      description: "Need bedding - sheets, blankets, pillows. Moving into my own place for the first time.",
      daysAgo: 7,
      status: 'fulfilled' as const,
      isPublic: true, // Public
    },
    {
      userId: userIds["requester2@example.com"],
      description: "Looking for kids clothes, boys size 6-8. Growing fast and could use hand-me-downs.",
      daysAgo: 10,
      status: 'closed' as const,
      isPublic: false, // Private
    },
    {
      userId: userIds["requester3@example.com"],
      description: "Need basic kitchen items - plates, bowls, cups, silverware. Setting up a new home.",
      daysAgo: 3,
      status: 'active' as const,
      isPublic: true, // Public
    },
    {
      userId: userIds["requester1@example.com"],
      description: "Looking for casual clothes - jeans, t-shirts, hoodies. Men's medium. Lost everything in recent move.",
      daysAgo: 4,
      status: 'fulfilled' as const,
      isPublic: false, // Private - more personal request
    },
    {
      userId: userIds["requester2@example.com"],
      description: "Need towels and bathroom basics. Just moved and don't have any household items yet.",
      daysAgo: 6,
      status: 'active' as const,
      isPublic: true, // Public
    },
  ];

  const createdRequests: any[] = [];

  for (const reqData of requestsData) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - reqData.daysAgo);
    
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 14);

    const [request] = await db
      .insert(socketrelayRequests)
      .values({
        userId: reqData.userId,
        description: reqData.description,
        status: reqData.status,
        isPublic: reqData.isPublic, // User's choice - mix of public and private
        expiresAt: expiresAt,
        createdAt: createdAt,
        updatedAt: createdAt,
      })
      .returning();

    createdRequests.push(request);
    console.log(`Created request: "${reqData.description.substring(0, 50)}..."`);
  }

  // Create fulfillments for some requests
  // Note: requestIndex refers to the position in requestsData array
  const fulfillmentsData = [
    {
      requestIndex: 3, // "Need bedding" (fulfilled request)
      fulfiller: userIds["fulfiller1@example.com"],
      status: 'completed_success' as const,
      hasMessages: true,
    },
    {
      requestIndex: 4, // "Looking for kids clothes" (closed request)
      fulfiller: userIds["fulfiller2@example.com"],
      status: 'completed_failure' as const,
      hasMessages: true,
    },
    {
      requestIndex: 6, // "Looking for casual clothes" (fulfilled request)
      fulfiller: userIds["fulfiller3@example.com"],
      status: 'active' as const,
      hasMessages: true,
    },
  ];

  for (const fulfillmentData of fulfillmentsData) {
    const request = createdRequests[fulfillmentData.requestIndex];
    
    const fulfillmentCreatedAt = new Date(request.createdAt);
    fulfillmentCreatedAt.setHours(fulfillmentCreatedAt.getHours() + 2);

    const fulfillmentValues: any = {
      requestId: request.id,
      fulfillerUserId: fulfillmentData.fulfiller,
      status: fulfillmentData.status,
      createdAt: fulfillmentCreatedAt,
      updatedAt: fulfillmentCreatedAt,
    };

    if (fulfillmentData.status !== 'active') {
      const closedAt = new Date(fulfillmentCreatedAt);
      closedAt.setDate(closedAt.getDate() + 2);
      fulfillmentValues.closedBy = request.userId;
      fulfillmentValues.closedAt = closedAt;
    }

    const [fulfillment] = await db
      .insert(socketrelayFulfillments)
      .values(fulfillmentValues)
      .returning();

    console.log(`Created fulfillment for: "${request.description.substring(0, 50)}..."`);

    // Add messages to the chat if specified
    if (fulfillmentData.hasMessages) {
      const messagesData = [
        { sender: fulfillmentData.fulfiller, content: "Hi! I can help with this.", minutesAfter: 5 },
        { sender: request.userId, content: "That would be great! Thanks for reaching out.", minutesAfter: 15 },
        { sender: fulfillmentData.fulfiller, content: "When would be a good time?", minutesAfter: 20 },
        { sender: request.userId, content: "How about this Saturday morning?", minutesAfter: 30 },
        { sender: fulfillmentData.fulfiller, content: "Saturday works for me. What time?", minutesAfter: 45 },
        { sender: request.userId, content: "Is 9am okay?", minutesAfter: 50 },
        { sender: fulfillmentData.fulfiller, content: "Perfect! See you then.", minutesAfter: 55 },
      ];

      for (const msgData of messagesData) {
        const msgCreatedAt = new Date(fulfillmentCreatedAt);
        msgCreatedAt.setMinutes(msgCreatedAt.getMinutes() + msgData.minutesAfter);

        await db.insert(socketrelayMessages).values({
          fulfillmentId: fulfillment.id,
          senderId: msgData.sender,
          content: msgData.content,
          createdAt: msgCreatedAt,
        });
      }

      console.log(`  Added ${messagesData.length} messages to chat`);
    }
  }

  console.log("\n✅ SocketRelay seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${testUsers.length} users created`);
  console.log(`- ${profilesData.length} profiles created`);
  console.log(`- ${requestsData.length} requests created`);
  console.log(`  - ${requestsData.filter(r => r.status === 'active').length} active requests`);
  console.log(`  - ${requestsData.filter(r => r.status === 'fulfilled').length} fulfilled requests`);
  console.log(`  - ${requestsData.filter(r => r.status === 'closed').length} closed requests`);
  console.log(`  - ${requestsData.filter(r => r.isPublic).length} public requests (shareable)`);
  console.log(`  - ${requestsData.filter(r => !r.isPublic).length} private requests`);
  console.log(`- ${fulfillmentsData.length} fulfillments created`);
  console.log(`  - ${fulfillmentsData.filter(f => f.status === 'active').length} active`);
  console.log(`  - ${fulfillmentsData.filter(f => f.status === 'completed_success').length} successful`);
  console.log(`  - ${fulfillmentsData.filter(f => f.status === 'completed_failure').length} failed`);
  console.log(`- ${fulfillmentsData.filter(f => f.hasMessages).length * 7} messages created`);
  
  process.exit(0);
}

seedSocketRelay().catch((error) => {
  console.error("Error seeding SocketRelay data:", error);
  process.exit(1);
});
