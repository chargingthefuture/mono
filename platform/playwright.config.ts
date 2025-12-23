import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env files (same as db.ts does)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test/e2e',
  /* Global setup - authenticates test user before tests run */
  globalSetup: require.resolve('./test/e2e/global-setup.ts'),
  /* Skip E2E tests if SKIP_E2E_TESTS is set (useful when tests are flaky due to auth/env issues) */
  testIgnore: process.env.SKIP_E2E_TESTS === 'true' ? ['**/*'] : undefined,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only - reduced to 1 to prevent timeout */
  retries: process.env.CI ? 1 : 0,
  /* Run tests in parallel - increased workers for faster execution */
  workers: process.env.PLAYWRIGHT_WORKERS 
    ? parseInt(process.env.PLAYWRIGHT_WORKERS, 10) 
    : process.env.CI ? 4 : undefined, // Increased from 2 to 4 for CI
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['junit', { outputFile: './test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5000',
    /* Use stored authentication state from global setup (if available) */
    storageState: (() => {
      const authStatePath = path.join(__dirname, 'test/.auth/state.json');
      // Only use storage state if file exists (auth setup succeeded)
      try {
        if (fs.existsSync(authStatePath)) {
          return authStatePath;
        }
      } catch {
        // File doesn't exist, tests will run unauthenticated
      }
      return undefined;
    })(),
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Optimized timeouts - reduced for faster test execution */
    actionTimeout: process.env.CI ? 15000 : 5000, // Reduced from 30s/10s to 15s/5s
    navigationTimeout: process.env.CI ? 30000 : 15000, // Reduced from 60s/30s to 30s/15s
  },
  
  /* Global timeout for each test - reduced for faster feedback */
  timeout: process.env.CI ? 60000 : 20000, // Reduced from 120s/30s to 60s/20s
  
  /* Expect timeout - reduced for faster feedback */
  expect: {
    timeout: process.env.CI ? 5000 : 3000, // Reduced from 10s/5s to 5s/3s
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180 * 1000 : 120 * 1000, // 3 minutes for CI, 2 minutes locally
    env: {
      // Pass through all environment variables to the webServer (including those loaded from .env files)
      ...process.env,
    },
  },
});

