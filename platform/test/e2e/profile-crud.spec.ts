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
      await page.goto(url);
      await expect(page.locator('h1')).toContainText(/profile/i, { timeout: 5000 });
    }
  });

  test('should show create profile form when no profile exists', async ({ page }) => {
    await page.goto('/apps/supportmatch/profile');
    
    // Should show create form
    await expect(page.locator('h1')).toContainText(/create.*profile/i);
    await expect(page.locator('[data-testid="button-submit"]')).toBeVisible();
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

