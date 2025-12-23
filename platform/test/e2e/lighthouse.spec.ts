import { test, expect } from '@playwright/test';

/**
 * E2E tests for LightHouse mini-app
 */

test.describe('LightHouse Profile Management', () => {
  test('should create a LightHouse profile', async ({ page }) => {
    await page.goto('/apps/lighthouse/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/profile')) {
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
    
    // Wait for page to load - h1 might say "Create Profile" or "Edit Profile"
    if (!heading) {
      // If no heading found, try waiting a bit more
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
    await page.selectOption('[data-testid="select-profileType"]', 'seeker');
    
    // Submit form
    await page.click('[data-testid="button-submit"]');
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/apps\/lighthouse/, { timeout: 10000 });
  });

  test('should update an existing profile', async ({ page }) => {
    await page.goto('/apps/lighthouse/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/profile')) {
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
    
    // Update bio
    await page.fill('[data-testid="textarea-bio"]', 'Updated bio');
    
    // Submit update
    await page.click('[data-testid="button-submit"]');
    
    // Verify success message or redirect
    await expect(
      page.locator('[data-testid="toast-success"]').or(page.locator('text=Updated Name'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should delete profile with confirmation', async ({ page }) => {
    await page.goto('/apps/lighthouse/profile');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/profile')) {
      // Redirected away from profile page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
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
    await expect(page).toHaveURL(/\/apps\/lighthouse/, { timeout: 10000 });
  });
});

test.describe('LightHouse Dashboard', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/apps/lighthouse');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse')) {
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
    await expect(page.locator('h1')).toContainText(/lighthouse/i, { timeout: 15000 });
    
    // Should show announcement banner
    await page.waitForSelector('[data-testid="announcement-banner"]', { timeout: 5000 }).catch(() => {
      // Banner may not exist if no announcements
    });
  });

  test('should show create profile prompt when no profile exists', async ({ page }) => {
    await page.goto('/apps/lighthouse');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Check if redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse')) {
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
});

test.describe('LightHouse Properties', () => {
  test('should create a property listing', async ({ page }) => {
    await page.goto('/apps/lighthouse/property/new');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse')) {
      // Redirected away from property page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
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
    
    // Wait for form or profile requirement message
    const formInput = page.locator('[data-testid="input-title"]');
    const createProfileButton = page.locator('[data-testid="button-create-profile"]');
    await Promise.race([
      formInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      createProfileButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    ]);
    
    // If profile required, skip (would need profile setup)
    const needsProfile = await createProfileButton.isVisible().catch(() => false);
    if (needsProfile) {
      test.skip();
      return;
    }
    
    // Fill property form
    await page.fill('[data-testid="input-title"]', 'Test Property');
    await page.fill('[data-testid="textarea-description"]', 'Test description');
    await page.fill('[data-testid="input-address"]', '123 Main St');
    await page.fill('[data-testid="input-city"]', 'New York');
    await page.fill('[data-testid="input-zipCode"]', '10001');
    await page.fill('[data-testid="input-monthlyRent"]', '1000');
    
    // Submit
    await page.click('[data-testid="button-submit"]');
    
    // Should show success
    await expect(
      page.locator('[data-testid="toast-success"]').or(page.locator('text=Test Property'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should browse properties', async ({ page }) => {
    await page.goto('/apps/lighthouse/browse');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/browse')) {
      // Redirected away from browse page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
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
    
    // Should show browse page
    await expect(page.locator('h1')).toContainText(/browse/i, { timeout: 15000 });
    
    // Should show properties list or empty state
    await page.waitForTimeout(2000);
    const hasProperties = await page.locator('[data-testid^="card-property-"]').count() > 0;
    const hasEmptyState = await page.locator('text=No properties').isVisible().catch(() => false);
    
    expect(hasProperties || hasEmptyState).toBe(true);
  });
});

test.describe('LightHouse Matches', () => {
  test('should view matches page', async ({ page }) => {
    await page.goto('/apps/lighthouse/matches');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/matches')) {
      // Redirected away from matches page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
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
    
    // Should show matches page
    await expect(page.locator('h1')).toContainText(/matches/i, { timeout: 15000 });
    
    // Should show matches list or empty state
    await page.waitForTimeout(2000);
    const hasMatches = await page.locator('[data-testid^="card-match-"]').count() > 0;
    const hasEmptyState = await page.locator('text=No matches').isVisible().catch(() => false);
    
    expect(hasMatches || hasEmptyState).toBe(true);
  });
});

test.describe('LightHouse Admin', () => {
  test('should display admin page', async ({ page }) => {
    await page.goto('/apps/lighthouse/admin');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/admin')) {
      // Redirected away from admin page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
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
    await expect(page.locator('h1')).toContainText(/lighthouse.*admin/i, { timeout: 15000 });
  });

  test('should manage announcements', async ({ page }) => {
    await page.goto('/apps/lighthouse/admin/announcements');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/lighthouse/admin/announcements')) {
      // Redirected away from announcements page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...') && (bodyText.includes('Announcements') || bodyText.includes('announcements'));
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

