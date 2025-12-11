import { db } from "../server/db";
import { users } from "../shared/schema";

async function seedTestUsers() {
  console.log("Creating test users...");

  // Create test users (without any mini-app profiles)
  const testData = [
    {
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Smith",
    },
    {
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Johnson",
    },
    {
      email: "carol@example.com",
      firstName: "Carol",
      lastName: "Williams",
    },
    {
      email: "david@example.com",
      firstName: "David",
      lastName: "Brown",
    },
    {
      email: "emma@example.com",
      firstName: "Emma",
      lastName: "Davis",
    },
    {
      email: "frank@example.com",
      firstName: "Frank",
      lastName: "Miller",
    },
    {
      email: "grace@example.com",
      firstName: "Grace",
      lastName: "Taylor",
    },
    {
      email: "henry@example.com",
      firstName: "Henry",
      lastName: "Anderson",
    },
    {
      email: "isabel@example.com",
      firstName: "Isabel",
      lastName: "Martinez",
    },
    {
      email: "jack@example.com",
      firstName: "Jack",
      lastName: "Robinson",
    },
    {
      email: "kate@example.com",
      firstName: "Kate",
      lastName: "Wilson",
    },
    {
      email: "leo@example.com",
      firstName: "Leo",
      lastName: "Thompson",
    },
    {
      email: "maya@example.com",
      firstName: "Maya",
      lastName: "Garcia",
    },
    {
      email: "noah@example.com",
      firstName: "Noah",
      lastName: "Lee",
    },
    {
      email: "olivia@example.com",
      firstName: "Olivia",
      lastName: "Harris",
    },
    {
      email: "paul@example.com",
      firstName: "Paul",
      lastName: "Clark",
    },
  ];

  for (const data of testData) {
    try {
      // Create user
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          isApproved: true,
          isAdmin: false,
        })
        .returning();

      console.log(`Created user: ${data.email}`);
    } catch (error) {
      console.log(`User ${data.email} may already exist, skipping...`);
    }
  }

  console.log(`\n✅ Test users created successfully!`);
  console.log(`\nTotal: ${testData.length} test users created`);
  console.log("\nNote: These users do not have any mini-app profiles.");
  console.log("To create SupportMatch profiles, run: npm run seed:supportmatch");
  
  process.exit(0);
}

seedTestUsers().catch((error) => {
  console.error("Error seeding test users:", error);
  process.exit(1);
});
