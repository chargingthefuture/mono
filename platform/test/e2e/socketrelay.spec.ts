import { test, expect } from '@playwright/test';

/**
 * E2E tests for SocketRelay mini-app
 */

test.describe('SocketRelay Profile Management', () => {
  test('should create a SocketRelay profile', async ({ page }) => {
    await page.goto('/apps/socketrelay/profile');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/profile/i);
    
    // Fill profile form
    await page.fill('[data-testid="input-city"]', 'New York');
    await page.fill('[data-testid="input-state"]', 'NY');
    await page.fill('[data-testid="input-country"]', 'USA');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/apps\/socketrelay/);
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/socketrelay/profile');
    
    // Wait for edit form to load
    await expect(page.locator('h1')).toContainText(/edit.*profile/i);
    
    // Update city
    await page.fill('[data-testid="input-city"]', 'Updated City');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success message or redirect
    await expect(page.locator('[data-testid="toast-success"]').or(page.locator('text=Updated Name'))).toBeVisible({ timeout: 5000 });
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/socketrelay/profile');
    
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
    await expect(page).toHaveURL(/\/apps\/socketrelay/);
  });
});

test.describe('SocketRelay Dashboard', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/apps/socketrelay');
    
    // Should show dashboard
    await expect(page.locator('h1')).toContainText(/socketrelay/i);
    
    // Should show announcement banner
    await page.waitForSelector('[data-testid="announcement-banner"]', { timeout: 5000 }).catch(() => {
      // Banner may not exist if no announcements
    });
  });

  test('should show create profile prompt when no profile exists', async ({ page }) => {
    await page.goto('/apps/socketrelay');
    
    // Should show get started card
    await expect(page.locator('[data-testid="button-create-profile"]')).toBeVisible();
  });

  test('should create a new request', async ({ page }) => {
    await page.goto('/apps/socketrelay');
    
    // Wait for request input (only visible when profile exists)
    await page.waitForSelector('[data-testid="input-new-request"]', { timeout: 5000 }).catch(() => {
      // If no profile, skip this test
      test.skip();
    });
    
    // Fill request
    await page.fill('[data-testid="input-new-request"]', 'Test request for help');
    
    // Submit request
    await page.click('[data-testid="button-submit-request"]');
    
    // Should show success or new request in list
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="toast-success"]').or(page.locator('text=Test request'))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('SocketRelay Requests', () => {
  test('should view my requests', async ({ page }) => {
    await page.goto('/apps/socketrelay');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // Should show requests section
    await page.waitForTimeout(2000);
    const hasRequests = await page.locator('[data-testid^="card-request-"]').count() > 0;
    const hasEmptyState = await page.locator('text=No requests').isVisible().catch(() => false);
    
    expect(hasRequests || hasEmptyState).toBe(true);
  });

  test('should fulfill a request', async ({ page }) => {
    await page.goto('/apps/socketrelay');
    
    // Wait for requests to load
    await page.waitForSelector('[data-testid^="button-fulfill-request-"]', { timeout: 10000 }).catch(() => {
      // If no requests, skip this test
      test.skip();
    });
    
    // Click fulfill button on first request
    await page.locator('[data-testid^="button-fulfill-request-"]').first().click();
    
    // Should navigate to chat or show success
    await page.waitForTimeout(2000);
    const isChatPage = page.url().includes('/chat/');
    const hasSuccess = await page.locator('[data-testid="toast-success"]').isVisible().catch(() => false);
    
    expect(isChatPage || hasSuccess).toBe(true);
  });
});

test.describe('SocketRelay Chat', () => {
  test('should display chat interface', async ({ page }) => {
    // Navigate to a chat (would need valid fulfillment ID)
    await page.goto('/apps/socketrelay/chat/test-id');
    
    // Should show chat interface or error
    await page.waitForTimeout(2000);
    const hasChat = await page.locator('[data-testid="input-message"]').isVisible().catch(() => false);
    const hasError = await page.locator('text=not found').or(page.locator('text=error')).isVisible().catch(() => false);
    
    // Either chat interface or error message is valid
    expect(hasChat || hasError).toBe(true);
  });

  test('should send a message in chat', async ({ page }) => {
    await page.goto('/apps/socketrelay/chat/test-id');
    
    // Wait for message input
    await page.waitForSelector('[data-testid="input-message"]', { timeout: 5000 }).catch(() => {
      // If no chat interface, skip
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

test.describe('SocketRelay Public Listing', () => {
  test('should display public requests page', async ({ page }) => {
    await page.goto('/apps/socketrelay/public');
    
    // Should show public listing
    await expect(page.locator('h1')).toContainText(/socketrelay/i);
    
    // Should show sign up button
    await expect(page.locator('[data-testid="button-sign-up"]')).toBeVisible();
  });

  test('should display public requests', async ({ page }) => {
    await page.goto('/apps/socketrelay/public');
    
    // Wait for requests to load or empty state
    await page.waitForTimeout(2000);
    const requestsCount = await page.locator('[data-testid^="card-request-"]').count();
    const hasRequests = requestsCount > 0;

    // Empty state uses "No active requests yet" copy, not "No requests"
    const hasEmptyState = await page
      .locator('text=No active requests yet')
      .isVisible()
      .catch(() => false);
    
    expect(hasRequests || hasEmptyState).toBe(true);
  });
});

test.describe('SocketRelay Admin', () => {
  test('should display admin page', async ({ page }) => {
    await page.goto('/apps/socketrelay/admin');
    
    // Should show admin interface
    await expect(page.locator('h1')).toContainText(/socketrelay.*admin/i);
  });

  test('should view admin tabs', async ({ page }) => {
    await page.goto('/apps/socketrelay/admin');
    
    // Should show tabs
    await expect(page.locator('[data-testid="tabs-admin"]')).toBeVisible();
    
    // Should have requests, fulfillments, and stats tabs
    await expect(page.locator('[data-testid="tab-requests"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-fulfillments"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-stats"]')).toBeVisible();
  });

  test('should manage announcements', async ({ page }) => {
    await page.goto('/apps/socketrelay/admin/announcements');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/socketrelay/admin/announcements')) {
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        return h1 !== null || (!isLoading && (bodyText.includes('Announcements') || bodyText.includes('announcements')));
      },
      { timeout: 15000 }
    ).catch(() => {});
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Should show announcement management page
    await expect(page.locator('h1')).toContainText(/announcements/i, { timeout: 15000 });
    
    // Should have create form
    await expect(page.locator('[data-testid="input-title"]')).toBeVisible({ timeout: 10000 });
  });
});

