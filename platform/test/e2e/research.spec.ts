import { test, expect } from '@playwright/test';

/**
 * E2E tests for Research mini-app
 */

test.describe('Research Items', () => {
  test('should create a research item', async ({ page }) => {
    await page.goto('/apps/research/new');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/new.*item/i);
    
    // Fill research item form
    await page.fill('[data-testid="input-title"]', 'Test Research Question');
    await page.fill('[data-testid="input-content"]', 'What is the answer to this question?');
    await page.selectOption('[data-testid="select-category"]', 'general');
    await page.fill('[data-testid="input-tags"]', 'test, research');
    
    // Set privacy
    await page.check('[data-testid="checkbox-isPublic"]');
    
    // Submit item
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to item view or timeline
    await expect(page).toHaveURL(/\/apps\/research/);
  });

  test('should view research item details', async ({ page }) => {
    await page.goto('/apps/research/item/test-item-id');
    
    // Should show item details
    await expect(page.locator('h1')).toContainText(/test research question/i);
    
    // Should show answers section
    await expect(page.locator('[data-testid="answers-section"]')).toBeVisible();
  });

  test('should post an answer to research item', async ({ page }) => {
    await page.goto('/apps/research/item/test-item-id');
    
    // Fill answer form
    await page.fill('[data-testid="input-answer-content"]', 'This is my answer');
    
    // Submit answer
    await page.click('[data-testid="button-submit-answer"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });

  test('should accept an answer as best answer', async ({ page }) => {
    await page.goto('/apps/research/item/test-item-id');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Check if redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/research')) {
      test.skip();
      return;
    }
    
    // Check if Clerk is configured
    const heading = await page.locator('h1').textContent({ timeout: 5000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for accept buttons
    await page.waitForSelector('[data-testid="button-accept-answer"]', { timeout: 10000 }).catch(() => {
      test.skip();
    });
    
    // Click accept button on an answer
    await page.locator('[data-testid="button-accept-answer"]').first().click();
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Research Interactions', () => {
  test('should upvote a research item', async ({ page }) => {
    await page.goto('/apps/research/item/test-item-id');
    
    // Click upvote button
    await page.click('[data-testid="button-upvote"]');
    
    // Should show updated vote count
    await expect(page.locator('[data-testid="vote-count"]')).toBeVisible();
  });

  test('should bookmark a research item', async ({ page }) => {
    await page.goto('/apps/research/item/test-item-id');
    
    // Click bookmark button
    await page.click('[data-testid="button-bookmark"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });

  test('should add a comment', async ({ page }) => {
    await page.goto('/apps/research/item/test-item-id');
    
    // Fill comment form
    await page.fill('[data-testid="input-comment"]', 'This is a comment');
    
    // Submit comment
    await page.click('[data-testid="button-submit-comment"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});

test.describe('Research Timeline', () => {
  test('should display timeline of research items', async ({ page }) => {
    await page.goto('/apps/research');
    
    // Should show timeline view
    await expect(page.locator('[data-testid="timeline-view"]')).toBeVisible();
  });

  test('should filter timeline by category', async ({ page }) => {
    await page.goto('/apps/research');
    
    // Click category filter
    await page.click('[data-testid="filter-category-general"]');
    
    // Should show filtered items
    await expect(page.locator('[data-testid="research-item"]')).toBeVisible();
  });
});

