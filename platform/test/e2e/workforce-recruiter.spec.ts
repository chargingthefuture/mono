import { test, expect } from '@playwright/test';

/**
 * E2E tests for Workforce Recruiter mini-app
 */

test.describe('Workforce Recruiter Profile', () => {
  test('should create a Workforce Recruiter profile', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/profile');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/profile/i);
    
    // Fill profile form
    await page.fill('[data-testid="input-display-name"]', 'Test User');
    await page.fill('[data-testid="input-notes"]', 'Test notes for profile');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/apps\/workforce-recruiter/);
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/profile');
    
    // Wait for edit form to load
    await expect(page.locator('h1')).toContainText(/edit.*profile/i);
    
    // Update display name
    await page.fill('[data-testid="input-display-name"]', 'Updated Name');
    
    // Update notes
    await page.fill('[data-testid="input-notes"]', 'Updated notes');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success message or redirect
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/profile');
    
    // Wait for delete button (only visible when profile exists)
    await expect(page.locator('[data-testid="button-delete-profile"]')).toBeVisible();
    
    // Click delete button
    await page.click('[data-testid="button-delete-profile"]');
    
    // Fill confirmation dialog
    await page.fill('[data-testid="input-deletion-reason"]', 'Test deletion');
    
    // Confirm deletion
    await page.click('[data-testid="button-confirm-deletion"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/apps\/workforce-recruiter/);
  });

  test('should not show delete button when profile does not exist', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/profile');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/create.*profile/i);
    
    // Delete button should not be visible
    await expect(page.locator('[data-testid="button-delete-profile"]')).not.toBeVisible();
  });
});

test.describe('Workforce Recruiter Dashboard', () => {
  test('should display dashboard after profile creation', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter');
    
    // Should display dashboard content
    await expect(page.locator('h1')).toContainText(/workforce.*recruiter/i);
  });

  test('should navigate to profile page from dashboard', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter');
    
    // Click on profile link or button (adjust selector based on actual implementation)
    const profileLink = page.locator('a[href*="/profile"]').first();
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/\/apps\/workforce-recruiter\/profile/);
    }
  });
});

test.describe('Workforce Recruiter Occupations', () => {
  test('should view occupations list', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/occupations');
    
    // Should display occupations page
    await expect(page.locator('h1')).toContainText(/occupations/i);
  });

  test('should view occupation details', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/occupations');
    
    // Click on first occupation if available
    const firstOccupation = page.locator('[data-testid^="occupation-"]').first();
    if (await firstOccupation.isVisible()) {
      await firstOccupation.click();
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/apps\/workforce-recruiter\/occupations\/.+/);
    }
  });
});

test.describe('Workforce Recruiter Meetup Events', () => {
  test('should view meetup events', async ({ page }) => {
    await page.goto('/apps/workforce-recruiter/meetup-events', { waitUntil: 'domcontentloaded' });
    
    // Wait a moment for any redirects or initial page load
    await page.waitForTimeout(1000);
    
    // Check if we're seeing configuration error first
    const configError = page.locator('h1:has-text("Configuration Error")');
    const configErrorVisible = await configError.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (configErrorVisible) {
      // If configuration error is shown, provide helpful error message
      throw new Error(
        'Clerk publishable key not configured in test environment. ' +
        'Set VITE_CLERK_PUBLISHABLE_KEY environment variable to run this test. ' +
        'The test environment needs a valid Clerk key to authenticate users.'
      );
    }
    
    // Check if we were redirected (e.g., to landing page due to authentication)
    const currentUrl = page.url();
    if (!currentUrl.includes('/meetup-events')) {
      // If redirected, wait a bit more and check again
      await page.waitForTimeout(2000);
      const finalUrl = page.url();
      if (!finalUrl.includes('/meetup-events') && !finalUrl.includes('/apps/workforce-recruiter')) {
        throw new Error(
          `Test was redirected from meetup-events page to ${finalUrl}. ` +
          'This may indicate an authentication issue. Ensure the test environment has proper authentication setup.'
        );
      }
    }
    
    // Wait for the page to be fully loaded (network requests complete)
    await page.waitForLoadState('networkidle');
    
    // Wait for the h1 element to appear - the page might show loading state first
    // The meetup events page has an h1 with "Meetup Events" text
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible({ timeout: 10000 });
    
    // Should display meetup events page with "Meetup Events" heading
    await expect(h1).toContainText(/meetup/i, { timeout: 5000 });
  });
});

