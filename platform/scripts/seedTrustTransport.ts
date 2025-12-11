import { db } from "../server/db";
import { users, trusttransportProfiles, trusttransportRideRequests, trusttransportAnnouncements } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedTrustTransport() {
  console.log("Creating TrustTransport seed data...");

  // Create test users for TrustTransport
  const testUsers = [
    { email: "driver1@example.com", firstName: "John", lastName: "Smith" },
    { email: "driver2@example.com", firstName: "Maria", lastName: "Garcia" },
    { email: "driver3@example.com", firstName: "David", lastName: "Brown" },
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

  // Create TrustTransport profiles for all users
  const profilesData = [
    {
      userId: userIds["driver1@example.com"],
      displayName: "John S.",
      city: "San Francisco",
      state: "California",
      country: "United States",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: 2020,
      vehicleColor: "Silver",
      bio: "Experienced driver offering safe rides",
      isActive: true,
    },
    {
      userId: userIds["driver2@example.com"],
      displayName: "Maria G.",
      city: "Los Angeles",
      state: "California",
      country: "United States",
      vehicleMake: "Honda",
      vehicleModel: "Accord",
      vehicleYear: 2019,
      vehicleColor: "Blue",
      bio: "Safe and reliable transportation",
      isActive: true,
    },
    {
      userId: userIds["driver3@example.com"],
      displayName: "David B.",
      city: "San Diego",
      state: "California",
      country: "United States",
      vehicleMake: "Nissan",
      vehicleModel: "Altima",
      vehicleYear: 2021,
      vehicleColor: "Black",
      bio: "Comfortable rides with music",
      isActive: true,
    },
  ];

  const profileIds: Record<string, string> = {};

  for (const profileData of profilesData) {
    try {
      // Check if profile already exists
      const [existing] = await db
        .select()
        .from(trusttransportProfiles)
        .where(eq(trusttransportProfiles.userId, profileData.userId));

      if (existing) {
        profileIds[profileData.userId] = existing.id;
        console.log(`Profile for user ${profileData.userId} already exists`);
        continue;
      }

      const [profile] = await db
        .insert(trusttransportProfiles)
        .values(profileData)
        .returning();

      profileIds[profileData.userId] = profile.id;
      console.log(`Created profile for user ${profileData.userId}`);
    } catch (error: any) {
      console.error(`Error creating profile for user ${profileData.userId}:`, error.message);
    }
  }

  // Create sample ride requests (riders create requests that drivers can claim)
  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 3);
  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 5);
  const futureDate3 = new Date();
  futureDate3.setDate(futureDate3.getDate() + 7);

  const rideRequestsData = [
    {
      riderId: userIds["driver1@example.com"], // Using first user as rider
      pickupLocation: "123 Main St, San Francisco, CA",
      dropoffLocation: "456 Market St, Oakland, CA",
      pickupCity: "San Francisco",
      pickupState: "California",
      dropoffCity: "Oakland",
      dropoffState: "California",
      departureDateTime: futureDate1,
      requestedSeats: 2,
      requestedCarType: "sedan" as const,
      requiresHeat: false,
      requiresAC: true,
      requiresWheelchairAccess: false,
      requiresChildSeat: false,
      riderMessage: "Need a ride for a doctor's appointment. Pet friendly preferred.",
      status: "open" as const,
    },
    {
      riderId: userIds["driver2@example.com"], // Using second user as rider
      pickupLocation: "789 Sunset Blvd, Los Angeles, CA",
      dropoffLocation: "321 Hollywood Blvd, Los Angeles, CA",
      pickupCity: "Los Angeles",
      pickupState: "California",
      dropoffCity: "Los Angeles",
      dropoffState: "California",
      departureDateTime: futureDate2,
      requestedSeats: 1,
      requestedCarType: null,
      requiresHeat: false,
      requiresAC: true,
      requiresWheelchairAccess: false,
      requiresChildSeat: false,
      riderMessage: "Looking for a comfortable ride to help the community",
      status: "open" as const,
    },
    {
      riderId: userIds["driver3@example.com"], // Using third user as rider
      pickupLocation: "555 Beach Dr, San Diego, CA",
      dropoffLocation: "777 Harbor Way, San Diego, CA",
      pickupCity: "San Diego",
      pickupState: "California",
      dropoffCity: "San Diego",
      dropoffState: "California",
      departureDateTime: futureDate3,
      requestedSeats: 3,
      requestedCarType: "suv" as const,
      requiresHeat: false,
      requiresAC: true,
      requiresWheelchairAccess: false,
      requiresChildSeat: true,
      riderMessage: "Need a larger vehicle with child seat for family trip",
      status: "open" as const,
    },
  ];

  for (const rideRequestData of rideRequestsData) {
    try {
      await db
        .insert(trusttransportRideRequests)
        .values(rideRequestData);
      console.log(`Created ride request from ${rideRequestData.pickupCity} to ${rideRequestData.dropoffCity}`);
    } catch (error: any) {
      console.error(`Error creating ride request:`, error.message);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to TrustTransport",
      content: "TrustTransport connects survivors with safe, reliable rides. Create a profile as a driver or rider to get started. Your safety is our priority.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "Safety Guidelines",
      content: "Always meet in public places, verify driver/rider identity, and trust your instincts. Report any concerns immediately. Never share personal information until you feel comfortable.",
      type: "warning" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "New Features Available",
      content: "You can now filter rides by car type, accessibility needs, and other preferences. Check out the updated ride request form!",
      type: "update" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires in 60 days
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(trusttransportAnnouncements).values({
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

  console.log("\n✅ TrustTransport seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${testUsers.length} users created`);
  console.log(`- ${profilesData.length} TrustTransport profiles created`);
  console.log(`- ${rideRequestsData.length} ride requests created`);
  console.log(`- ${announcementsData.length} announcements created`);
}

seedTrustTransport()
  .then(() => {
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding:", error);
    process.exit(1);
  });




