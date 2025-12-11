import { db } from "../server/db";
import {
  users,
  mechanicmatchProfiles,
  mechanicmatchVehicles,
  mechanicmatchServiceRequests,
  mechanicmatchJobs,
} from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function seedMechanicMatch() {
  console.log("🌱 Seeding MechanicMatch data...");

  // Get or create test users
  const testUsers = [
    { email: "carowner1@example.com", firstName: "Sarah", lastName: "Johnson" },
    { email: "mechanic1@example.com", firstName: "Mike", lastName: "Thompson" },
    { email: "mechanic2@example.com", firstName: "Lisa", lastName: "Chen" },
  ];

  const userIds: Record<string, string> = {};

  for (const userData of testUsers) {
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (existing) {
        userIds[userData.email] = existing.id;
        console.log(`User ${userData.email} already exists`);
      } else {
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
      }
    } catch (error: any) {
      console.error(`Error with user ${userData.email}:`, error.message);
    }
  }

  // Create MechanicMatch profiles
  const profilesData = [
    {
      userId: userIds["carowner1@example.com"],
      displayName: "Sarah J.",
      isCarOwner: true,
      isMechanic: false,
      city: "Portland",
      state: "Oregon",
      country: "United States",
      signalUrl: "https://signal.me/#p/+1234567890",
    },
    {
      userId: userIds["mechanic1@example.com"],
      displayName: "Mike's Auto Repair",
      isCarOwner: false,
      isMechanic: true,
      city: "Portland",
      state: "Oregon",
      country: "United States",
      mechanicBio: "20 years of experience in automotive repair. Specialized in engine diagnostics and transmission work.",
      experience: 20,
      shopLocation: "123 Main St, Portland, OR",
      isMobileMechanic: true,
      hourlyRate: "75.00",
      specialties: "Engine Repair, Transmission, Diagnostics",
      certifications: '["ASE Certified", "Master Technician"]',
      signalUrl: "https://signal.me/#p/+1234567891",
    },
    {
      userId: userIds["mechanic2@example.com"],
      displayName: "Lisa's Mobile Service",
      isCarOwner: false,
      isMechanic: true,
      city: "Seattle",
      state: "Washington",
      country: "United States",
      mechanicBio: "Mobile mechanic specializing in quick fixes and roadside assistance.",
      experience: 10,
      isMobileMechanic: true,
      hourlyRate: "60.00",
      specialties: "Quick Fixes, Oil Changes, Tire Service",
      signalUrl: "https://signal.me/#p/+1234567892",
    },
  ];

  const profileIds: Record<string, string> = {};

  for (const profileData of profilesData) {
    try {
      const [existing] = await db
        .select()
        .from(mechanicmatchProfiles)
        .where(eq(mechanicmatchProfiles.userId, profileData.userId));

      if (existing) {
        profileIds[profileData.userId] = existing.id;
        console.log(`Profile for user ${profileData.userId} already exists`);
        continue;
      }

      const [profile] = await db
        .insert(mechanicmatchProfiles)
        .values(profileData)
        .returning();

      profileIds[profileData.userId] = profile.id;
      console.log(`Created profile for user ${profileData.userId}`);
    } catch (error: any) {
      console.error(`Error creating profile:`, error.message);
    }
  }

  // Create vehicles for car owner
  const carOwnerUserId = userIds["carowner1@example.com"];
  if (carOwnerUserId) {
    const vehiclesData = [
      {
        ownerId: carOwnerUserId,
        make: "Toyota",
        model: "Camry",
        year: 2018,
      },
      {
        ownerId: carOwnerUserId,
        make: "Honda",
        model: "Civic",
        year: 2020,
      },
    ];

    for (const vehicleData of vehiclesData) {
      try {
        const [existing] = await db
          .select()
          .from(mechanicmatchVehicles)
          .where(
            and(
              eq(mechanicmatchVehicles.ownerId, vehicleData.ownerId),
              eq(mechanicmatchVehicles.make, vehicleData.make),
              eq(mechanicmatchVehicles.model, vehicleData.model),
              eq(mechanicmatchVehicles.year, vehicleData.year)
            )
          );

        if (!existing) {
          await db.insert(mechanicmatchVehicles).values(vehicleData);
          console.log(`Created vehicle: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
        }
      } catch (error: any) {
        console.error(`Error creating vehicle:`, error.message);
      }
    }
  }

  console.log("✅ MechanicMatch seed data created successfully!");
}

seedMechanicMatch()
  .then(() => {
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  });
