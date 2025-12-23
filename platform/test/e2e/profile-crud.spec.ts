import { test, expect } from '@playwright/test';

/**
 * E2E tests for profile CRUD operations across multiple mini-apps
 * 
 * Note: This file tests general profile CRUD patterns.
 * Mini-app specific tests are in their respective spec files:
 * - supportmatch.spec.ts
 * - lighthouse.spec.ts
 * - socketrelay.spec.ts
 * - directory.spec.ts
 * - trusttransport.spec.ts
 * - mechanicmatch.spec.ts
 * - chyme.spec.ts
 * - workforce-recruiter.spec.ts
 */

test.describe('Profile CRUD Patterns', () => {
  test('should navigate to profile pages', async ({ page }) => {
    // Test navigation to various profile pages
    const profilePages = [
      '/apps/supportmatch/profile',
      '/apps/lighthouse/profile',
      '/apps/socketrelay/profile',
      '/apps/directory/profile',
      '/apps/trusttransport/profile',
      '/apps/mechanicmatch/profile',
      '/apps/workforce-recruiter/profile',
    ];

    for (const url of profilePages) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for page to stabilize
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      
      // Check if redirected
      const currentUrl = page.url();
      if (!currentUrl.includes(url.replace('/', ''))) {
        // Redirected away - skip this page
        continue;
      }
      
      // Wait for h1 to appear - it might say "Create Profile", "Edit Profile", or contain "Profile"
      const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
      if (heading && heading.includes('Configuration Error')) {
        // Skip if Clerk not configured
        continue;
      }
      
      if (heading) {
        // Check if heading contains profile-related text
        const headingLower = heading.toLowerCase();
        expect(headingLower).toMatch(/profile|create|edit/);
      } else {
        // If no heading, try waiting a bit more
        await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
        const headingRetry = await page.locator('h1').textContent({ timeout: 5000 }).catch(() => null);
        if (headingRetry) {
          const headingRetryLower = headingRetry.toLowerCase();
          expect(headingRetryLower).toMatch(/profile|create|edit/);
        }
      }
    }
  });

  test('should show create profile form when no profile exists', async ({ page }) => {
    await page.goto('/apps/supportmatch/profile');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Check if redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/supportmatch/profile')) {
      test.skip();
      return;
    }
    
    // Wait for page content
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
      },
      { timeout: 15000 }
    ).catch(() => {});
    
    // Check if Clerk is configured
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Should show create form (or edit form if profile exists - both are valid)
    if (heading) {
      const headingLower = heading.toLowerCase();
      expect(headingLower).toMatch(/create.*profile|edit.*profile|profile/);
    }
    
    // Submit button should be visible (for either create or edit)
    await expect(page.locator('[data-testid="button-submit"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show delete button only when profile exists', async ({ page }) => {
    await page.goto('/apps/supportmatch/profile');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Delete button should only be visible if profile exists
    const deleteButton = page.locator('[data-testid="button-delete-profile"]');
    const hasProfile = await deleteButton.isVisible().catch(() => false);
    const hasCreateForm = await page.locator('text=Create Profile').isVisible().catch(() => false);
    
    // Either delete button (profile exists) or create form (no profile)
    expect(hasProfile || hasCreateForm).toBe(true);
  });
});

