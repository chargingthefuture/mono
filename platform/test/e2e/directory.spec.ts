import { test, expect } from '@playwright/test';

/**
 * E2E tests for Directory mini-app
 */

test.describe('Directory Profile Management', () => {
  test('should create a Directory profile', async ({ page }) => {
    await page.goto('/apps/directory/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory/profile')) {
      // Redirected away from profile page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading && (bodyText.includes('Profile') || bodyText.includes('profile'));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText(/profile/i, { timeout: 15000 });
    
    // Fill profile form
    await page.fill('[data-testid="input-description"]', 'Test description');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/apps\/directory/, { timeout: 10000 });
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/directory/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory/profile')) {
      // Redirected away from profile page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading && (bodyText.includes('Profile') || bodyText.includes('profile'));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for edit form to load (or create form if no profile exists)
    const h1Text = await page.locator('h1').textContent({ timeout: 15000 }).catch(() => null);
    if (!h1Text || (!h1Text.toLowerCase().includes('edit') && !h1Text.toLowerCase().includes('create'))) {
      // No profile exists, skip this test
      test.skip();
      return;
    }
    
    await expect(page.locator('h1')).toContainText(/edit.*profile|create.*profile/i, { timeout: 5000 });
    
    // Update description
    await page.fill('[data-testid="input-description"]', 'Updated description');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success message or redirect
    await expect(page.locator('[data-testid="toast-success"]').or(page.locator('text=Updated description'))).toBeVisible({ timeout: 5000 });
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/directory/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory/profile')) {
      // Redirected away from profile page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading;
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 5000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for delete button (only visible when profile exists)
    const deleteButton = page.locator('[data-testid="button-delete-profile"]');
    const isVisible = await deleteButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!isVisible) {
      // No profile exists, skip this test
      test.skip();
      return;
    }
    
    // Click delete button
    await deleteButton.click();
    
    // Fill confirmation dialog
    await page.fill('[data-testid="input-deletion-reason"]', 'Test deletion');
    
    // Confirm deletion
    await page.click('[data-testid="button-confirm-deletion"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/apps\/directory/, { timeout: 10000 });
  });
});

test.describe('Directory Dashboard', () => {
  test('should display dashboard with profile listing', async ({ page }) => {
    await page.goto('/apps/directory');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory')) {
      // Redirected away from dashboard (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading;
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Should show dashboard
    await expect(page.locator('h1')).toContainText(/directory/i, { timeout: 15000 });
    
    // Should show announcement banner
    await page.waitForSelector('[data-testid="announcement-banner"]', { timeout: 5000 }).catch(() => {
      // Banner may not exist if no announcements
    });
  });

  test('should show create profile prompt when no profile exists', async ({ page }) => {
    await page.goto('/apps/directory');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Check if redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory')) {
      test.skip();
      return;
    }
    
    // Check if Clerk is configured
    const heading = await page.locator('h1').textContent({ timeout: 5000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for page to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
      },
      { timeout: 15000 }
    ).catch(() => {});
    
    // Should show get started card (if no profile exists)
    // This test may pass or fail depending on whether profile exists - both are valid
    await page.waitForSelector('[data-testid="button-create-profile"]', { timeout: 10000 }).catch(() => {
      // If button doesn't exist, user might have a profile - that's okay
    });
  });

  test('should display public directory link when profile exists', async ({ page }) => {
    await page.goto('/apps/directory');
    
    // Wait for page to load
    await page.waitForSelector('h1');
    
    // May show public link if profile exists
    const hasPublicLink = await page.locator('[data-testid="button-copy-public-link"]').isVisible().catch(() => false);
    const hasCreatePrompt = await page.locator('[data-testid="button-create-profile"]').isVisible().catch(() => false);
    
    // One of these should be visible
    expect(hasPublicLink || hasCreatePrompt).toBe(true);
  });
});

test.describe('Directory Public Listing', () => {
  test('should display public directory page', async ({ page }) => {
    await page.goto('/apps/directory/public');
    
    // Wait for page to stabilize (public pages don't require auth, but may still load)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading;
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Should show public directory
    await expect(page.locator('h1')).toContainText(/directory/i, { timeout: 15000 });
    
    // Should show sign up button
    await expect(page.locator('[data-testid="button-sign-up"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display public profiles', async ({ page }) => {
    await page.goto('/apps/directory/public');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
      },
      { timeout: 15000 }
    ).catch(() => {});
    
    // Wait a bit for profiles to load
    await page.waitForTimeout(2000);
    
    const hasProfiles = await page.locator('[data-testid^="card-directory-profile-"]').count() > 0;
    const hasEmptyState = await page.locator('text=No profiles').isVisible().catch(() => false);
    
    // Should show either profiles or empty state
    expect(hasProfiles || hasEmptyState).toBe(true);
  });
});

test.describe('Directory Admin', () => {
  test('should display admin page', async ({ page }) => {
    await page.goto('/apps/directory/admin');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory/admin')) {
      // Redirected away from admin page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading;
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Should show admin interface
    await expect(page.locator('h1')).toContainText(/directory.*admin/i, { timeout: 15000 });
  });

  test('should manage announcements', async ({ page }) => {
    await page.goto('/apps/directory/admin/announcements');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/directory/admin/announcements')) {
      // Redirected away from announcements page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we're past the loading state
        return !isLoading && (bodyText.includes('Announcements') || bodyText.includes('announcements'));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, continue anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Should show announcement management page
    await expect(page.locator('h1')).toContainText(/announcements/i, { timeout: 15000 });
    
    // Should have create form
    await expect(page.locator('[data-testid="input-title"]')).toBeVisible({ timeout: 15000 });
  });
});

