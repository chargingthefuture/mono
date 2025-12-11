import { db } from "../server/db";
import { users, lighthouseProfiles, lighthouseProperties, lighthouseMatches, lighthouseAnnouncements } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedLighthouse() {
  console.log("Creating Lighthouse seed data...");

  // Create test users for Lighthouse
  const testUsers = [
    // Seekers
    { email: "seeker1@example.com", firstName: "Alex", lastName: "Martinez" },
    { email: "seeker2@example.com", firstName: "Jordan", lastName: "Kim" },
    { email: "seeker3@example.com", firstName: "Taylor", lastName: "Brown" },
    { email: "seeker4@example.com", firstName: "Morgan", lastName: "Davis" },
    // Hosts
    { email: "host1@example.com", firstName: "Sarah", lastName: "Chen" },
    { email: "host2@example.com", firstName: "Marcus", lastName: "Johnson" },
    { email: "host3@example.com", firstName: "Lisa", lastName: "Rodriguez" },
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

  // Create Lighthouse profiles
  const profilesData = [
    // Seekers
    {
      email: "seeker1@example.com",
      profileType: "seeker" as const,
      displayName: "Alex M.",
      bio: "Looking for a safe, stable place to call home. I'm quiet, respectful, and looking to rebuild my life.",
      phoneNumber: "+1-555-0101",
      signalUrl: "https://signal.me/#p/+15550101",
      housingNeeds: "Need a private room or small apartment. Prefer quiet neighborhood, close to public transit.",
      moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      budgetMin: "800",
      budgetMax: "1200",
      isVerified: true,
    },
    {
      email: "seeker2@example.com",
      profileType: "seeker" as const,
      displayName: "Jordan K.",
      bio: "Survivor seeking housing stability. I work part-time and am looking for a room in a supportive environment.",
      phoneNumber: "+1-555-0102",
      signalUrl: null,
      housingNeeds: "Looking for a room in a shared house. Need kitchen access and laundry facilities.",
      moveInDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      budgetMin: "600",
      budgetMax: "900",
      isVerified: false,
    },
    {
      email: "seeker3@example.com",
      profileType: "seeker" as const,
      displayName: "Taylor B.",
      bio: "Recently transitioned and need safe housing. Looking for LGBTQ+ friendly space.",
      phoneNumber: "+1-555-0103",
      signalUrl: "https://signal.me/#p/+15550103",
      housingNeeds: "Need a room in an inclusive, accepting environment. Prefer own bathroom if possible.",
      moveInDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      budgetMin: "700",
      budgetMax: "1000",
      isVerified: true,
    },
    {
      email: "seeker4@example.com",
      profileType: "seeker" as const,
      displayName: "Morgan D.",
      bio: "Single parent with one child. Looking for a safe place for us to start fresh.",
      phoneNumber: "+1-555-0104",
      signalUrl: null,
      housingNeeds: "Need 2-bedroom apartment or house. Must be child-friendly and in safe neighborhood.",
      moveInDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      budgetMin: "1000",
      budgetMax: "1500",
      isVerified: false,
    },
    // Hosts
    {
      email: "host1@example.com",
      profileType: "host" as const,
      displayName: "Sarah C.",
      bio: "Experienced host offering safe, supportive housing. I understand the challenges survivors face.",
      phoneNumber: "+1-555-0201",
      signalUrl: "https://signal.me/#p/+15550201",
      hasProperty: true,
      isVerified: true,
    },
    {
      email: "host2@example.com",
      profileType: "host" as const,
      displayName: "Marcus J.",
      bio: "Community-minded person with extra space. Committed to providing a trauma-informed environment.",
      phoneNumber: "+1-555-0202",
      signalUrl: null,
      hasProperty: true,
      isVerified: true,
    },
    {
      email: "host3@example.com",
      profileType: "host" as const,
      displayName: "Lisa R.",
      bio: "Small property owner dedicated to helping survivors find stability and safety.",
      phoneNumber: "+1-555-0203",
      signalUrl: "https://signal.me/#p/+15550203",
      hasProperty: true,
      isVerified: false,
    },
  ];

  const createdProfiles: Record<string, any> = {};

  for (const profileData of profilesData) {
    try {
      const profilePayload: any = {
        userId: userIds[profileData.email],
        profileType: profileData.profileType,
        displayName: profileData.displayName,
        bio: profileData.bio,
        phoneNumber: profileData.phoneNumber,
        signalUrl: profileData.signalUrl,
        isVerified: profileData.isVerified,
        isActive: true,
      };

      if (profileData.profileType === "seeker") {
        profilePayload.housingNeeds = profileData.housingNeeds;
        profilePayload.moveInDate = profileData.moveInDate;
        profilePayload.budgetMin = profileData.budgetMin;
        profilePayload.budgetMax = profileData.budgetMax;
        // Note: desiredCountry is optional and not included in seed data
        // If your database schema is out of sync, run: npm run db:push
      } else {
        profilePayload.hasProperty = profileData.hasProperty;
      }

      // Insert without .returning() to avoid issues when database schema is out of sync
      // (e.g., if desired_country column doesn't exist in DB but is in schema)
      await db
        .insert(lighthouseProfiles)
        .values(profilePayload);

      // Query the created profile separately
      const [profile] = await db
        .select()
        .from(lighthouseProfiles)
        .where(eq(lighthouseProfiles.userId, userIds[profileData.email]));

      if (profile) {
        createdProfiles[profileData.email] = profile;
        console.log(`Created ${profileData.profileType} profile for: ${profileData.email}`);
      }
    } catch (error: any) {
      // If insert fails, try to get existing profile
      // This handles both "already exists" and "schema mismatch" errors
      if (error?.code === '23505') {
        // Unique constraint violation - profile already exists
        console.log(`Profile for ${profileData.email} already exists`);
      } else {
        console.log(`Profile for ${profileData.email} error:`, error.message || error);
      }
      
      try {
        const [existingProfile] = await db
          .select()
          .from(lighthouseProfiles)
          .where(eq(lighthouseProfiles.userId, userIds[profileData.email]));
        
        if (existingProfile) {
          createdProfiles[profileData.email] = existingProfile;
        }
      } catch (selectError: any) {
        // If select also fails (e.g., due to missing column), log and continue
        console.log(`Could not query profile for ${profileData.email}:`, selectError.message || selectError);
        console.log(`⚠️  Database schema may be out of sync. Run: npm run db:push`);
      }
    }
  }

  // Create properties for hosts
  const propertiesData = [
    {
      hostEmail: "host1@example.com",
      propertyType: "room" as const,
      title: "Cozy Private Room in Safe Neighborhood",
      description: "Private bedroom in a quiet, supportive home. Shared kitchen and bathroom. Close to public transit and grocery stores. LGBTQ+ friendly environment.",
      address: "123 Oak Street",
      city: "Portland",
      state: "Oregon",
      zipCode: "97201",
      bedrooms: 1,
      bathrooms: "1.0",
      amenities: ["WiFi", "Kitchen Access", "Laundry", "Parking", "Pet Friendly"],
      houseRules: "No smoking, quiet hours after 10pm, respect shared spaces",
      monthlyRent: "850",
      securityDeposit: "850",
      availableFrom: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      availableUntil: null,
      maxOccupants: 1,
      photos: [],
      airbnbProfileUrl: "https://www.airbnb.com/users/show/12345",
      isActive: true,
    },
    {
      hostEmail: "host1@example.com",
      propertyType: "apartment" as const,
      title: "Studio Apartment - Fresh Start Space",
      description: "Small but comfortable studio apartment perfect for someone starting over. Includes kitchenette and private bathroom. Located in a safe, walkable neighborhood.",
      address: "456 Maple Avenue",
      city: "Portland",
      state: "Oregon",
      zipCode: "97202",
      bedrooms: 0,
      bathrooms: "1.0",
      amenities: ["WiFi", "Kitchen", "Laundry", "Parking"],
      houseRules: "No smoking, no parties, keep space clean",
      monthlyRent: "1100",
      securityDeposit: "1100",
      availableFrom: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      availableUntil: null,
      maxOccupants: 1,
      photos: [],
      airbnbProfileUrl: null,
      isActive: true,
    },
    {
      hostEmail: "host2@example.com",
      propertyType: "room" as const,
      title: "Shared House - Supportive Community",
      description: "Room in a shared house with other survivors. We support each other and maintain a trauma-informed environment. Kitchen, living room, and laundry all shared.",
      address: "789 Pine Road",
      city: "Seattle",
      state: "Washington",
      zipCode: "98101",
      bedrooms: 1,
      bathrooms: "2.0",
      amenities: ["WiFi", "Kitchen Access", "Laundry", "Parking", "Garden"],
      houseRules: "Respectful communication, shared chores, support group meetings optional",
      monthlyRent: "750",
      securityDeposit: "750",
      availableFrom: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      availableUntil: null,
      maxOccupants: 1,
      photos: [],
      airbnbProfileUrl: null,
      isActive: true,
    },
    {
      hostEmail: "host2@example.com",
      propertyType: "house" as const,
      title: "2-Bedroom House - Family Friendly",
      description: "Small house perfect for a single parent with child. Two bedrooms, one bathroom, fenced yard. Safe neighborhood with good schools nearby.",
      address: "321 Elm Street",
      city: "Seattle",
      state: "Washington",
      zipCode: "98102",
      bedrooms: 2,
      bathrooms: "1.0",
      amenities: ["WiFi", "Kitchen", "Laundry", "Parking", "Yard", "Pet Friendly"],
      houseRules: "No smoking, child-friendly environment, yard maintenance shared",
      monthlyRent: "1400",
      securityDeposit: "1400",
      availableFrom: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      availableUntil: null,
      maxOccupants: 3,
      photos: [],
      airbnbProfileUrl: null,
      isActive: true,
    },
    {
      hostEmail: "host3@example.com",
      propertyType: "room" as const,
      title: "Affordable Room - Quick Move-In Available",
      description: "Simple, clean room available immediately. Shared bathroom with one other person. Close to downtown and public transit.",
      address: "654 Cedar Lane",
      city: "San Francisco",
      state: "California",
      zipCode: "94102",
      bedrooms: 1,
      bathrooms: "1.0",
      amenities: ["WiFi", "Kitchen Access", "Laundry"],
      houseRules: "No smoking, no pets, quiet after 11pm",
      monthlyRent: "950",
      securityDeposit: "950",
      availableFrom: new Date(), // Available now
      availableUntil: null,
      maxOccupants: 1,
      photos: [],
      airbnbProfileUrl: "https://www.airbnb.com/users/show/67890",
      isActive: true,
    },
  ];

  const createdProperties: any[] = [];

  for (const propertyData of propertiesData) {
    try {
      const hostProfile = createdProfiles[propertyData.hostEmail];
      if (!hostProfile) {
        console.log(`Skipping property - host profile not found for ${propertyData.hostEmail}`);
        continue;
      }

      const [property] = await db
        .insert(lighthouseProperties)
        .values({
          hostId: hostProfile.id,
          propertyType: propertyData.propertyType,
          title: propertyData.title,
          description: propertyData.description,
          address: propertyData.address,
          city: propertyData.city,
          state: propertyData.state,
          zipCode: propertyData.zipCode,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          amenities: propertyData.amenities,
          houseRules: propertyData.houseRules,
          monthlyRent: propertyData.monthlyRent,
          securityDeposit: propertyData.securityDeposit,
          availableFrom: propertyData.availableFrom,
          availableUntil: propertyData.availableUntil,
          maxOccupants: propertyData.maxOccupants,
          photos: propertyData.photos,
          airbnbProfileUrl: propertyData.airbnbProfileUrl,
          isActive: propertyData.isActive,
        })
        .returning();

      createdProperties.push(property);
      console.log(`Created property: "${propertyData.title}"`);
    } catch (error) {
      console.log(`Error creating property "${propertyData.title}":`, error);
    }
  }

  // Create matches between seekers and properties
  const matchesData = [
    {
      seekerEmail: "seeker1@example.com",
      propertyIndex: 0, // "Cozy Private Room" - matches budget and needs
      status: "pending" as const,
      proposedMoveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      seekerMessage: "Hi! I'm very interested in this room. It sounds like exactly what I'm looking for. Would it be possible to schedule a viewing?",
      daysAgo: 2,
    },
    {
      seekerEmail: "seeker1@example.com",
      propertyIndex: 1, // "Studio Apartment" - also matches
      status: "pending" as const,
      proposedMoveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      seekerMessage: "This studio looks perfect for my needs. I'm very responsible and looking for a long-term place.",
      daysAgo: 1,
    },
    {
      seekerEmail: "seeker2@example.com",
      propertyIndex: 2, // "Shared House" - matches budget
      status: "accepted" as const,
      proposedMoveInDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      seekerMessage: "I'm interested in joining your supportive community. This sounds like a great fit.",
      hostResponse: "We'd love to have you! Let's schedule a time to meet and discuss details.",
      daysAgo: 5,
    },
    {
      seekerEmail: "seeker3@example.com",
      propertyIndex: 0, // "Cozy Private Room" - LGBTQ+ friendly
      status: "pending" as const,
      proposedMoveInDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      seekerMessage: "I'm looking for a safe, accepting space. Your listing mentions LGBTQ+ friendly - that's very important to me.",
      daysAgo: 3,
    },
    {
      seekerEmail: "seeker4@example.com",
      propertyIndex: 3, // "2-Bedroom House" - perfect for parent with child
      status: "accepted" as const,
      proposedMoveInDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      seekerMessage: "This house sounds perfect for me and my child. The safe neighborhood and good schools are exactly what we need.",
      hostResponse: "We'd be happy to have you both! The neighborhood is very family-friendly.",
      daysAgo: 7,
    },
    {
      seekerEmail: "seeker2@example.com",
      propertyIndex: 4, // "Affordable Room" - quick move-in
      status: "rejected" as const,
      proposedMoveInDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      seekerMessage: "I need to move quickly. Is this room still available?",
      hostResponse: "Sorry, the room has been filled. Best of luck with your search!",
      daysAgo: 10,
    },
  ];

  for (const matchData of matchesData) {
    try {
      const seekerProfile = createdProfiles[matchData.seekerEmail];
      const property = createdProperties[matchData.propertyIndex];

      if (!seekerProfile || !property) {
        console.log(`Skipping match - missing seeker or property`);
        continue;
      }

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - matchData.daysAgo);

      const matchPayload: any = {
        seekerId: seekerProfile.id,
        propertyId: property.id,
        status: matchData.status,
        proposedMoveInDate: matchData.proposedMoveInDate,
        seekerMessage: matchData.seekerMessage,
        createdAt: createdAt,
        updatedAt: createdAt,
      };

      if (matchData.hostResponse) {
        matchPayload.hostResponse = matchData.hostResponse;
      }

      if (matchData.status === "accepted") {
        matchPayload.actualMoveInDate = matchData.proposedMoveInDate;
      }

      await db.insert(lighthouseMatches).values(matchPayload);
      console.log(`Created match: ${matchData.seekerEmail} -> "${property.title}" (${matchData.status})`);
    } catch (error) {
      console.log(`Error creating match:`, error);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to LightHouse",
      content: "LightHouse connects survivors seeking safe housing with hosts offering supportive spaces. Create a profile as a seeker or host to get started.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "New Properties Available",
      content: "Several new properties have been added this month. Check out the listings to find your perfect match!",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    },
    {
      title: "Safety First",
      content: "Remember to meet in public places first and trust your instincts. Your safety is our top priority. Report any concerns immediately.",
      type: "warning" as const,
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(lighthouseAnnouncements).values({
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

  console.log("\n✅ Lighthouse seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${testUsers.length} users created`);
  console.log(`  - ${profilesData.filter(p => p.profileType === 'seeker').length} seekers`);
  console.log(`  - ${profilesData.filter(p => p.profileType === 'host').length} hosts`);
  console.log(`- ${profilesData.length} Lighthouse profiles created`);
  console.log(`- ${createdProperties.length} properties created`);
  console.log(`  - ${createdProperties.filter(p => p.propertyType === 'room').length} rooms`);
  console.log(`  - ${createdProperties.filter(p => p.propertyType === 'apartment').length} apartments`);
  console.log(`  - ${createdProperties.filter(p => p.propertyType === 'house').length} houses`);
  console.log(`- ${matchesData.length} matches created`);
  console.log(`  - ${matchesData.filter(m => m.status === 'pending').length} pending`);
  console.log(`  - ${matchesData.filter(m => m.status === 'accepted').length} accepted`);
  console.log(`  - ${matchesData.filter(m => m.status === 'rejected').length} rejected`);
  console.log(`- ${announcementsData.length} announcements created`);
  
  process.exit(0);
}

seedLighthouse().catch((error) => {
  console.error("Error seeding Lighthouse data:", error);
  process.exit(1);
});

