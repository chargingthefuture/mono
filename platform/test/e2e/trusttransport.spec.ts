import { test, expect } from '@playwright/test';

/**
 * E2E tests for TrustTransport mini-app
 */

test.describe('TrustTransport Profile', () => {
  test('should create a TrustTransport profile', async ({ page }) => {
    await page.goto('/apps/trusttransport/profile');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/profile/i);
    
    // Fill profile form
    await page.fill('[data-testid="input-firstName"]', 'Test');
    await page.fill('[data-testid="input-lastName"]', 'User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-phone"]', '555-1234');
    
    // Select role (rider or driver)
    await page.check('[data-testid="checkbox-isRider"]');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/apps\/trusttransport/);
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/trusttransport/profile');
    
    // Wait for edit form to load
    await expect(page.locator('h1')).toContainText(/edit.*profile/i);
    
    // Update bio field
    await page.fill('[data-testid="input-bio"]', 'Updated bio');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success message or redirect
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/trusttransport/profile');
    
    // Click delete button
    await page.click('[data-testid="button-delete-profile"]');
    
    // Fill confirmation dialog
    await page.fill('[data-testid="input-deletion-reason"]', 'Test deletion');
    
    // Confirm deletion
    await page.click('[data-testid="button-confirm-deletion"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/apps\/trusttransport/);
  });
});

test.describe('TrustTransport Ride Requests', () => {
  test('should create a ride request', async ({ page }) => {
    await page.goto('/apps/trusttransport/request/new');
    
    // Fill ride request form
    await page.fill('[data-testid="input-pickupLocation"]', '123 Main St');
    await page.fill('[data-testid="input-dropoffLocation"]', '456 Oak Ave');
    await page.fill('[data-testid="input-pickupCity"]', 'New York');
    await page.fill('[data-testid="input-dropoffCity"]', 'Brooklyn');
    
    // Submit request
    await page.click('[data-testid="button-submit"]');
    
    // Should show success or redirect
    await expect(page).toHaveURL(/\/apps\/trusttransport/);
  });

  test('should view open ride requests', async ({ page }) => {
    await page.goto('/apps/trusttransport/browse');
    
    // Should display list of open requests
    await expect(page.locator('[data-testid="ride-request-list"]')).toBeVisible();
  });

  test('should claim a ride request as driver', async ({ page }) => {
    await page.goto('/apps/trusttransport/browse');
    
    // Click claim button on first request
    await page.locator('[data-testid="button-claim-request"]').first().click();
    
    // Fill driver message
    await page.fill('[data-testid="input-driverMessage"]', 'I can help');
    
    // Confirm claim
    await page.click('[data-testid="button-confirm-claim"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});

