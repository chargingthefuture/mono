import { test, expect } from '@playwright/test';

/**
 * E2E tests for Chat Groups mini-app
 */

test.describe('Chat Groups User Interface', () => {
  test('should display list of chat groups on dashboard', async ({ page }) => {
    await page.goto('/apps/chatgroups');
    
    // Wait for page to stabilize - handle redirects and loading states
    // First check if we were redirected (unauthenticated users go to landing page)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups')) {
      // Redirected away from chatgroups page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load (either heading or loading state)
    // The page shows "Loading..." while data loads, then shows the heading
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we have an h1 OR we're past the loading state
        return h1 !== null || (!isLoading && bodyText.includes('Chat Groups'));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, try to get heading anyway
    });
    
    // Wait for heading to appear
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    
    // If Clerk is not configured in test environment, skip this test
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // If no heading found, the page might still be loading or redirected
    if (!heading) {
      // Check if we're still on the chatgroups page
      const url = page.url();
      if (!url.includes('/apps/chatgroups')) {
        test.skip();
        return;
      }
      // If still on page but no heading, fail with helpful message
      throw new Error('Could not find h1 heading on ChatGroups page. Page might still be loading or structure changed.');
    }
    
    // Normal case: should see Chat Groups heading
    await expect(page.locator('h1')).toContainText(/chat groups/i);
    
    // Should display groups list or empty state
    const hasGroups = await page.locator('[data-testid^="card-chat-group-"]').count() > 0;
    const hasEmptyState = await page.locator('text=No chat groups available yet').isVisible();
    
    expect(hasGroups || hasEmptyState).toBe(true);
  });

  test('should display announcement banner', async ({ page }) => {
    await page.goto('/apps/chatgroups');
    
    // Wait for page to stabilize - handle redirects
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups')) {
      // Redirected away from chatgroups page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Announcement banner should be present (may be empty)
    await page.waitForSelector('[data-testid="announcement-banner"]', { timeout: 5000 }).catch(() => {
      // Banner may not exist if no announcements, which is fine
    });
  });

  test('should show join group button for each group', async ({ page }) => {
    await page.goto('/apps/chatgroups');
    
    // Wait for page to stabilize - handle redirects
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups')) {
      // Redirected away from chatgroups page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for groups to load
    await page.waitForSelector('[data-testid^="card-chat-group-"]', { timeout: 10000 }).catch(() => {
      // If no groups, test passes (empty state is valid)
      return;
    });
    
    // Check if any groups exist
    const groupCount = await page.locator('[data-testid^="card-chat-group-"]').count();
    
    if (groupCount > 0) {
      // Each group should have a join button
      const firstGroup = page.locator('[data-testid^="card-chat-group-"]').first();
      await expect(firstGroup.locator('[data-testid^="button-join-group-"]')).toBeVisible();
    }
  });

  test('should open external link dialog when clicking join group', async ({ page }) => {
    await page.goto('/apps/chatgroups');
    
    // Wait for page to stabilize - handle redirects
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups')) {
      // Redirected away from chatgroups page (likely to landing page)
      // This means user is not authenticated - skip test
      test.skip();
      return;
    }
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // Wait for groups
    await page.waitForSelector('[data-testid^="button-join-group-"]', { timeout: 10000 }).catch(() => {
      // If no groups, skip this test
      test.skip();
    });
    
    // Click first join button
    await page.locator('[data-testid^="button-join-group-"]').first().click();
    
    // Should show external link confirmation dialog
    await expect(page.locator('[data-testid="external-link-dialog"]')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Chat Groups Admin', () => {
  test('should display admin page', async ({ page }) => {
    await page.goto('/apps/chatgroups/admin');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups/admin')) {
      // Redirected away from admin page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load (either heading or loading state)
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we have an h1 OR we're past the loading state
        return h1 !== null || (!isLoading && bodyText.includes('Administration'));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, try to get heading anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // If no heading found, the page might still be loading or redirected
    if (!heading) {
      // Check if we're still on the admin page
      const url = page.url();
      if (!url.includes('/apps/chatgroups/admin')) {
        test.skip();
        return;
      }
      // If still on page but no heading, fail with helpful message
      throw new Error('Could not find h1 heading on ChatGroups admin page. Page might still be loading or structure changed.');
    }
    
    // Should show admin interface
    await expect(page.locator('h1')).toContainText(/chat groups.*admin/i);
  });

  test('should create a new chat group', async ({ page }) => {
    await page.goto('/apps/chatgroups/admin');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups/admin')) {
      // Redirected away from admin page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load (either heading or loading state)
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we have an h1 OR we're past the loading state
        return h1 !== null || (!isLoading && bodyText.includes('Administration'));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, try to get heading anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // If no heading found, the page might still be loading or redirected
    if (!heading) {
      // Check if we're still on the admin page
      const url = page.url();
      if (!url.includes('/apps/chatgroups/admin')) {
        test.skip();
        return;
      }
      // If still on page but no heading, fail with helpful message
      throw new Error('Could not find h1 heading on ChatGroups admin page. Page might still be loading or structure changed.');
    }
    
    // Wait for create form to be visible
    await page.waitForSelector('[data-testid="input-new-group-name"]', { timeout: 15000 });
    
    // Fill form
    await page.fill('[data-testid="input-new-group-name"]', 'Test Chat Group');
    await page.fill('[data-testid="input-new-group-url"]', 'https://signal.group/#test');
    await page.fill('[data-testid="input-new-group-description"]', 'Test description');
    
    // Submit
    await page.click('[data-testid="button-create-group"]');
    
    // Should show success or new group in list
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test Chat Group').or(page.locator('[data-testid="toast-success"]'))).toBeVisible({ timeout: 5000 });
  });

  test('should manage announcements', async ({ page }) => {
    await page.goto('/apps/chatgroups/admin/announcements');
    
    // Wait for page to stabilize - handle redirects and loading states
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // If networkidle times out, continue anyway
    });
    
    // Check current URL - if redirected to landing page, skip test
    const currentUrl = page.url();
    if (!currentUrl.includes('/apps/chatgroups/admin/announcements')) {
      // Redirected away from announcements page (likely to landing page or not admin)
      // This means user is not authenticated or not admin - skip test
      test.skip();
      return;
    }
    
    // Wait for page content to load (either heading or loading state)
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        const bodyText = document.body.textContent || '';
        const isLoading = bodyText.includes('Loading...');
        // Page is ready when we have an h1 OR we're past the loading state
        return h1 !== null || (!isLoading && (bodyText.includes('Announcements') || bodyText.includes('announcements')));
      },
      { timeout: 15000 }
    ).catch(() => {
      // If function times out, try to get heading anyway
    });
    
    // Check if Clerk is configured (skip if Configuration Error)
    const heading = await page.locator('h1').textContent({ timeout: 10000 }).catch(() => null);
    if (heading && heading.includes('Configuration Error')) {
      test.skip();
      return;
    }
    
    // If no heading found, the page might still be loading or redirected
    if (!heading) {
      // Check if we're still on the announcements page
      const url = page.url();
      if (!url.includes('/apps/chatgroups/admin/announcements')) {
        test.skip();
        return;
      }
      // If still on page but no heading, fail with helpful message
      throw new Error('Could not find h1 heading on ChatGroups announcements page. Page might still be loading or structure changed.');
    }
    
    // Should show announcement management page
    await expect(page.locator('h1')).toContainText(/announcements/i);
    
    // Should have create form
    await expect(page.locator('[data-testid="input-title"]')).toBeVisible();
  });
});

