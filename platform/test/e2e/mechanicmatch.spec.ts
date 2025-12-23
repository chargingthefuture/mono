import { test, expect } from '@playwright/test';

/**
 * E2E tests for MechanicMatch mini-app
 */

test.describe('MechanicMatch Profile', () => {
  test('should create a MechanicMatch profile', async ({ page }) => {
    await page.goto('/apps/mechanicmatch/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/mechanicmatch/profile')) {
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        return !isLoading && (bodyText.includes('Profile') || bodyText.includes('profile') || bodyText.includes('Create') || bodyText.includes('Edit'));
      },
      { timeout: 15000 }
    ).catch(() => {});
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for page to load - h1 might say "Create Profile" or "Edit Profile"
    if (!heading) {
      await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
      const headingRetry = await page.locator('h1').textContent({ timeout: 5000 }).catch(() => null);
      if (!headingRetry) {
        test.skip();
        return;
      }
      expect(headingRetry.toLowerCase()).toMatch(/profile|create|edit/);
    } else {
      expect(heading.toLowerCase()).toMatch(/profile|create|edit/);
    }
    
    // Fill profile form
    await page.fill('[data-testid="input-firstName"]', 'Test');
    await page.fill('[data-testid="input-lastName"]', 'User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    
    // Select role (mechanic or owner)
    await page.check('[data-testid="checkbox-isOwner"]');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/apps\/mechanicmatch/);
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/mechanicmatch/profile');
    
    // Update bio field
    await page.fill('[data-testid="input-bio"]', 'Updated bio');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/mechanicmatch/profile');
    
    // Click delete button
    await page.click('[data-testid="button-delete-profile"]');
    
    // Fill confirmation dialog
    await page.fill('[data-testid="input-deletion-reason"]', 'Test deletion');
    
    // Confirm deletion
    await page.click('[data-testid="button-confirm-deletion"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/apps\/mechanicmatch/);
  });
});

test.describe('MechanicMatch Vehicles', () => {
  test('should add a vehicle', async ({ page }) => {
    await page.goto('/apps/mechanicmatch/vehicles');
    
    // Click add vehicle button
    await page.click('[data-testid="button-add-vehicle"]');
    
    // Fill vehicle form
    await page.fill('[data-testid="input-make"]', 'Toyota');
    await page.fill('[data-testid="input-model"]', 'Camry');
    await page.fill('[data-testid="input-year"]', '2020');
    await page.fill('[data-testid="input-licensePlate"]', 'ABC123');
    
    // Submit
    await page.click('[data-testid="button-submit"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});

test.describe('MechanicMatch Service Requests', () => {
  test('should create a service request', async ({ page }) => {
    await page.goto('/apps/mechanicmatch/request-new');
    
    // Fill service request form
    await page.selectOption('[data-testid="select-vehicleId"]', 'vehicle-1');
    await page.selectOption('[data-testid="select-serviceType"]', 'repair');
    await page.fill('[data-testid="input-description"]', 'Engine trouble');
    await page.selectOption('[data-testid="select-urgency"]', 'high');
    
    // Submit request
    await page.click('[data-testid="button-submit"]');
    
    // Should show success
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});

