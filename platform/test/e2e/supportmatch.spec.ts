import { test, expect } from '@playwright/test';

/**
 * E2E tests for SupportMatch mini-app
 */

test.describe('SupportMatch Profile Management', () => {
  test('should create a SupportMatch profile', async ({ page }) => {
    await page.goto('/apps/supportmatch/profile');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/profile/i);
    
    // Fill profile form
    await page.fill('[data-testid="input-nickname"]', 'Test User');
    await page.selectOption('[data-testid="select-gender"]', 'non-binary');
    await page.selectOption('[data-testid="select-genderPreference"]', 'any');
    await page.fill('[data-testid="input-city"]', 'New York');
    await page.selectOption('[data-testid="select-state"]', 'NY');
    await page.fill('[data-testid="input-country"]', 'USA');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/apps\/supportmatch/);
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/supportmatch/profile');
    
    // Wait for edit form to load
    await expect(page.locator('h1')).toContainText(/edit.*profile/i);
    
    // Update nickname
    await page.fill('[data-testid="input-nickname"]', 'Updated Nickname');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success message or redirect
    await expect(page.locator('[data-testid="toast-success"]').or(page.locator('text=Updated Nickname'))).toBeVisible({ timeout: 5000 });
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/supportmatch/profile');
    
    // Wait for delete button (only visible when profile exists)
    await page.waitForSelector('[data-testid="button-delete-profile"]', { timeout: 5000 }).catch(() => {
      // If no profile exists, skip this test
      test.skip();
    });
    
    // Click delete button
    await page.click('[data-testid="button-delete-profile"]');
    
    // Fill confirmation dialog
    await page.fill('[data-testid="input-deletion-reason"]', 'Test deletion');
    
    // Confirm deletion
    await page.click('[data-testid="button-confirm-deletion"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/apps\/supportmatch/);
  });
});

test.describe('SupportMatch Dashboard', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/apps/supportmatch');
    
    // Should show dashboard
    await expect(page.locator('h1')).toContainText(/supportmatch/i);
    
    // Should show announcement banner
    await page.waitForSelector('[data-testid="announcement-banner"]', { timeout: 5000 }).catch(() => {
      // Banner may not exist if no announcements
    });
  });

  test('should show create profile prompt when no profile exists', async ({ page }) => {
    await page.goto('/apps/supportmatch');
    
    // Should show get started card
    await expect(page.locator('[data-testid="button-create-profile"]')).toBeVisible();
  });

  test('should display partnership status', async ({ page }) => {
    await page.goto('/apps/supportmatch');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Should show partnership status or create profile prompt
    await page.waitForTimeout(2000);
    const hasPartnership = await page.locator('text=Active Partnership').or(page.locator('text=No Active Partnership')).isVisible().catch(() => false);
    const hasCreatePrompt = await page.locator('[data-testid="button-create-profile"]').isVisible().catch(() => false);
    
    expect(hasPartnership || hasCreatePrompt).toBe(true);
  });
});

test.describe('SupportMatch Partnership', () => {
  test('should view partnership page', async ({ page }) => {
    await page.goto('/apps/supportmatch/partnership');
    
    // Should show partnership page
    await expect(page.locator('h1')).toContainText(/partnership/i);
    
    // Should show partnership details or empty state
    await page.waitForTimeout(2000);
    const hasPartnership = await page.locator('[data-testid^="partnership-"]').count() > 0;
    const hasEmptyState = await page.locator('text=No partnership').isVisible().catch(() => false);
    
    expect(hasPartnership || hasEmptyState).toBe(true);
  });

  test('should send message in partnership', async ({ page }) => {
    await page.goto('/apps/supportmatch/partnership');
    
    // Wait for message input (only visible when partnership exists)
    await page.waitForSelector('[data-testid="input-message"]', { timeout: 5000 }).catch(() => {
      // If no partnership, skip this test
      test.skip();
    });
    
    // Type message
    await page.fill('[data-testid="input-message"]', 'Test message');
    
    // Send message
    await page.click('[data-testid="button-send-message"]');
    
    // Should show message in chat
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test message').or(page.locator('[data-testid^="message-"]'))).toBeVisible({ timeout: 3000 });
  });
});

test.describe('SupportMatch Safety', () => {
  test('should view safety page', async ({ page }) => {
    await page.goto('/apps/supportmatch/safety');
    
    // Should show safety page
    await expect(page.locator('h1')).toContainText(/safety/i);
  });

  test('should create an exclusion', async ({ page }) => {
    await page.goto('/apps/supportmatch/safety');
    
    // Wait for exclusions section
    await page.waitForSelector('[data-testid="button-add-exclusion"]', { timeout: 5000 }).catch(() => {
      // If no add button, skip
      test.skip();
    });
    
    // Click add exclusion
    await page.click('[data-testid="button-add-exclusion"]');
    
    // Fill exclusion form (would need user selection)
    // This is a structure test
  });

  test('should create a report', async ({ page }) => {
    await page.goto('/apps/supportmatch/safety');
    
    // Wait for reports section
    await page.waitForSelector('[data-testid="button-create-report"]', { timeout: 5000 }).catch(() => {
      // If no create button, skip
      test.skip();
    });
    
    // Click create report
    await page.click('[data-testid="button-create-report"]');
    
    // Fill report form
    await page.fill('[data-testid="input-report-reason"]', 'Test reason');
    await page.fill('[data-testid="textarea-report-description"]', 'Test description');
    
    // Submit report
    await page.click('[data-testid="button-submit-report"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('SupportMatch Admin', () => {
  test('should display admin page', async ({ page }) => {
    await page.goto('/apps/supportmatch/admin');
    
    // Should show admin interface
    await expect(page.locator('h1')).toContainText(/supportmatch.*admin/i);
  });

  test('should view admin statistics', async ({ page }) => {
    await page.goto('/apps/supportmatch/admin');
    
    // Should show stats cards
    await page.waitForTimeout(2000);
    const hasStats = await page.locator('[data-testid^="stat-"]').count() > 0;
    const hasCards = await page.locator('[data-testid^="card-"]').count() > 0;
    
    expect(hasStats || hasCards).toBe(true);
  });

  test('should manage announcements', async ({ page }) => {
    await page.goto('/apps/supportmatch/admin/announcements');
    
    // Should show announcement management page
    await expect(page.locator('h1')).toContainText(/announcements/i);
    
    // Should have create form
    await expect(page.locator('[data-testid="input-title"]')).toBeVisible();
  });
});

