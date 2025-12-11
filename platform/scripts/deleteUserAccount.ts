import { storage } from "../server/storage";

/**
 * Script to delete a user's entire account from all mini-apps
 * 
 * This script:
 * - Deletes all mini-app profiles (SupportMatch, LightHouse, SocketRelay, Directory, TrustTransport, MechanicMatch)
 * - Anonymizes all related data (messages, requests, partnerships, etc.)
 * - Anonymizes other user-related data (NPS responses, payments, admin actions, research items)
 * - Anonymizes the user record itself (sets email to null, name to "Deleted User", etc.)
 * 
 * Usage:
 *   tsx scripts/deleteUserAccount.ts <user-id> [reason]
 * 
 * Examples:
 *   tsx scripts/deleteUserAccount.ts user_2abc123def
 *   tsx scripts/deleteUserAccount.ts user_2abc123def "User requested account deletion"
 * 
 * WARNING: This is a destructive operation. The user account will be permanently deleted
 * from all mini-apps and all personal data will be anonymized.
 */

async function deleteUserAccount() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("Usage: tsx scripts/deleteUserAccount.ts <user-id> [reason]");
    console.error("\nExample:");
    console.error("  tsx scripts/deleteUserAccount.ts user_2abc123def");
    console.error("  tsx scripts/deleteUserAccount.ts user_2abc123def \"User requested account deletion\"");
    console.error("\nWARNING: This is a destructive operation that will:");
    console.error("  - Delete all mini-app profiles");
    console.error("  - Anonymize all related data");
    console.error("  - Anonymize the user record itself");
    process.exit(1);
  }

  const userId = args[0];
  const reason = args[1] || "Account deletion via script";

  console.log(`\n⚠️  WARNING: This will permanently delete the user account!`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Reason: ${reason}`);
  console.log(`\nThis operation will:`);
  console.log(`  - Delete all mini-app profiles`);
  console.log(`  - Anonymize all related data`);
  console.log(`  - Anonymize the user record`);
  console.log(`\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n`);

  // Give user 5 seconds to cancel
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      console.error(`\n❌ Error: User with ID ${userId} not found.`);
      process.exit(1);
    }

    console.log(`\nFound user:`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A');
    console.log(`   Is Admin: ${user.isAdmin}`);
    console.log(`\nStarting account deletion...\n`);

    // Delete the account
    await storage.deleteUserAccount(userId, reason);

    console.log("\n✅ Account deletion completed successfully!");
    console.log(`   All mini-app profiles have been deleted`);
    console.log(`   All related data has been anonymized`);
    console.log(`   User record has been anonymized`);
    console.log(`\n🎉 Account deletion complete!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error deleting user account:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    process.exit(1);
  }
}

deleteUserAccount();


