import { chromium, type FullConfig } from '@playwright/test';
import { clerkClient } from '@clerk/clerk-sdk-node';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for E2E tests
 * 
 * This authenticates a test user with Clerk using session tokens and stores the authentication state
 * so all tests can reuse it without re-authenticating.
 */
async function globalSetup(config: FullConfig) {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  
  // If Clerk is not configured, skip authentication setup
  if (!clerkSecretKey || !clerkPublishableKey) {
    console.warn('[E2E Setup] Clerk not configured - tests will run unauthenticated');
    // Create empty auth state file so tests don't fail
    const authStatePath = path.join(__dirname, '../.auth/state.json');
    const authDir = path.dirname(authStatePath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    fs.writeFileSync(authStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    return;
  }

  // Safety check: Warn if using production Clerk key (should use test/dev key)
  if (clerkSecretKey.startsWith('sk_live_')) {
    console.warn('[E2E Setup] ⚠️  WARNING: Using PRODUCTION Clerk key for E2E tests!');
    console.warn('[E2E Setup] This is not recommended. Use CLERK_SECRET_KEY_TEST or CLERK_SECRET_KEY_DEV instead.');
    console.warn('[E2E Setup] Production keys start with "sk_live_", test keys start with "sk_test_"');
  } else if (clerkSecretKey.startsWith('sk_test_')) {
    console.log('[E2E Setup] ✓ Using test/dev Clerk key (sk_test_*) - this is correct');
  } else if (clerkSecretKey === 'dev_dummy_clerk_secret_key_do_not_use_in_production') {
    console.warn('[E2E Setup] Using dummy Clerk key - authentication will not work');
  }

  // Test user email - should be created in Clerk dashboard
  const testUserEmail = process.env.E2E_TEST_USER_EMAIL || 'e2e-test@example.com';

  try {
    console.log('[E2E Setup] Starting authentication setup...');
    
    // Initialize Clerk client
    const clerk = clerkClient(clerkSecretKey);
    
    // Find test user
    let testUser;
    try {
      const users = await clerk.users.getUserList({ emailAddress: [testUserEmail], limit: 1 });
      if (users.data.length > 0) {
        testUser = users.data[0];
        console.log(`[E2E Setup] Found test user: ${testUser.id}`);
      } else {
        throw new Error(`Test user not found: ${testUserEmail}. Please create this user in Clerk dashboard.`);
      }
    } catch (error: any) {
      console.error('[E2E Setup] Failed to find test user:', error.message);
      throw error;
    }

    // Ensure user is approved (if your app requires approval)
    if (testUser.publicMetadata?.isApproved !== true) {
      await clerk.users.updateUserMetadata(testUser.id, {
        publicMetadata: { ...testUser.publicMetadata, isApproved: true },
      });
      console.log('[E2E Setup] Marked test user as approved');
    }

    // Use the test authentication endpoint to create a Clerk session
    // This is simpler and more reliable than trying to create sessions directly
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:5000';
    
    // Launch browser first (needed for request API)
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Wait for server to be ready (webServer should start it, but wait a bit)
    console.log('[E2E Setup] Waiting for server to be ready...');
    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await page.request.get(`${baseURL}/api/health`);
        if (response.ok()) {
          serverReady = true;
          break;
        }
      } catch {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!serverReady) {
      await browser.close();
      throw new Error('Server did not become ready in time');
    }

    // Try to use the test login endpoint first
    let authSuccess = false;
    try {
      console.log('[E2E Setup] Creating Clerk session via test endpoint...');
      const response = await page.request.post(`${baseURL}/api/auth/test-login`, {
        data: { userId: testUser.id },
      });

      if (response.ok()) {
        const result = await response.json();
        console.log('[E2E Setup] Test login successful:', result.message);
        authSuccess = true;
      } else {
        const errorText = await response.text();
        console.warn(`[E2E Setup] Test endpoint failed: ${response.status()} ${errorText}`);
      }
    } catch (error: any) {
      console.warn('[E2E Setup] Test endpoint not available:', error.message);
    }

    // If test endpoint didn't work, try UI sign-in as fallback
    if (!authSuccess) {
      console.log('[E2E Setup] Attempting UI sign-in as fallback...');
      const testUserPassword = process.env.E2E_TEST_USER_PASSWORD;
      
      if (testUserPassword) {
        try {
          // Navigate to sign-in page
          // Clerk uses hosted pages, so we need to find the right URL
          const signInUrl = `${baseURL}/sign-in`;
          await page.goto(signInUrl, { waitUntil: 'networkidle', timeout: 30000 });
          
          // Wait for Clerk's sign-in form to load
          // Clerk forms use specific selectors - try common ones
          await page.waitForSelector('input[type="email"], input[name="identifier"], input[id*="identifier"]', { timeout: 10000 });
          
          // Fill in credentials
          const emailInput = page.locator('input[type="email"], input[name="identifier"], input[id*="identifier"]').first();
          await emailInput.fill(testUserEmail);
          
          const passwordInput = page.locator('input[type="password"]').first();
          await passwordInput.fill(testUserPassword);
          
          // Submit form
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();
          
          // Wait for redirect after sign-in
          await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
          
          // Wait for Clerk to set cookies
          await page.waitForTimeout(2000);
          
          authSuccess = true;
          console.log('[E2E Setup] UI sign-in successful');
        } catch (uiError: any) {
          console.warn('[E2E Setup] UI sign-in failed:', uiError.message);
        }
      } else {
        console.warn('[E2E Setup] E2E_TEST_USER_PASSWORD not set - cannot use UI sign-in fallback');
      }
    }

    // Navigate to verify authentication works
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    
    // Wait a moment for Clerk to process the session
    await page.waitForTimeout(2000);

    // Save authentication state
    const authStatePath = path.join(__dirname, '../.auth/state.json');
    const authDir = path.dirname(authStatePath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    
    await context.storageState({ path: authStatePath });
    console.log(`[E2E Setup] Saved authentication state to ${authStatePath}`);

    await browser.close();
    console.log('[E2E Setup] Authentication setup complete');
  } catch (error: any) {
    console.error('[E2E Setup] Authentication setup failed:', error.message);
    console.error('[E2E Setup] Stack:', error.stack);
    // Create empty auth state file so tests don't fail on file read
    const authStatePath = path.join(__dirname, '../.auth/state.json');
    const authDir = path.dirname(authStatePath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    fs.writeFileSync(authStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    console.warn('[E2E Setup] Continuing without authentication - tests may fail');
  }
}

export default globalSetup;

