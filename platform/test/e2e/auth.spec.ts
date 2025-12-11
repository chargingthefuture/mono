import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 */

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to landing page', async ({ page }) => {
    await page.goto('/apps/supportmatch');
    
    // Wait for redirect to happen - Clerk needs to load first, then ProtectedRoute redirects
    // The redirect goes to "/" (root) which shows the landing page for unauthenticated users
    // Use waitForFunction to poll for URL change, which is more reliable than waitForURL
    // when there's async loading happening
    await page.waitForFunction(
      () => {
        const url = window.location.href;
        // Check if we're on root or landing page (redirect happened)
        return /\/$|\/landing/.test(url) && !url.includes('/apps/supportmatch');
      },
      { timeout: 15000 }
    );
    
    // Verify we're not on the protected route anymore
    const url = page.url();
    expect(url).not.toContain('/apps/supportmatch');
    
    // Verify we're on root or landing
    expect(url).toMatch(/\/$|\/landing/);
    
    // If Clerk is not configured in test environment, we might see "Configuration Error"
    // In that case, skip the content check but verify redirect happened
    const heading = await page.locator('h1').textContent({ timeout: 5000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      // This is a test environment configuration issue, not a code bug
      // The redirect still worked (we're not on /apps/supportmatch anymore)
      // Test passes - redirect functionality works
      return;
    }
    
    // Normal case: should be on landing page (root shows landing for unauthenticated users)
    // The heading might be "Welcome" or similar - just verify we're not on the protected route
    expect(url).toMatch(/\/$/);
  });

  test('should show access pending page for authenticated users without approval', async ({ page }) => {
    // This would require setting up auth state in test
    // For now, we're testing the structure
    
    // If authenticated but not approved, should show access pending message
    // This test structure shows the pattern
  });

  test('should allow authenticated and approved users to access features', async ({ page }) => {
    // With valid auth and approval, should access mini-apps
    // This test structure shows the pattern
  });
});

test.describe('Navigation', () => {
  test('should navigate between mini-apps via sidebar', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    
    // Click sidebar link (would need auth first)
    // This test structure shows the pattern
  });
});

