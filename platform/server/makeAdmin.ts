import { storage } from "./storage";

async function makeFirstUserAdmin() {
  try {
    const users = await storage.getAllUsers();
    
    if (users.length === 0) {
      return;
    }

    const firstUser = users[users.length - 1]; // Most recent user
    
    if (firstUser.isAdmin) {
      return;
    }

    await storage.upsertUser({
      ...firstUser,
      isAdmin: true,
    });

    // User made admin - logging removed for production
  } catch (error) {
    console.error("Error making user admin:", error);
  }
}

makeFirstUserAdmin();
