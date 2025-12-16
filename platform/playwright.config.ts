import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env files (same as db.ts does)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only - reduced to 1 to prevent timeout */
  retries: process.env.CI ? 1 : 0,
  /* Run tests in parallel on CI - use environment variable or default to 2 */
  workers: process.env.PLAYWRIGHT_WORKERS 
    ? parseInt(process.env.PLAYWRIGHT_WORKERS, 10) 
    : process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['junit', { outputFile: './test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Increase timeout for CI environments where things may be slower */
    actionTimeout: process.env.CI ? 30000 : 10000,
    navigationTimeout: process.env.CI ? 60000 : 30000,
  },
  
  /* Global timeout for each test */
  timeout: process.env.CI ? 120000 : 30000,
  
  /* Expect timeout */
  expect: {
    timeout: process.env.CI ? 10000 : 5000,
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

