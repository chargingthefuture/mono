import { Page, expect } from '@playwright/test';

/**
 * E2E Test Helpers - Optimized for performance
 * 
 * These helpers replace slow patterns like waitForLoadState('networkidle')
 * and waitForTimeout with faster, more reliable alternatives.
 */

/**
 * Wait for page to be ready - faster alternative to waitForLoadState('networkidle')
 * Waits for DOM to be ready and checks for loading indicators
 */
export async function waitForPageReady(page: Page, timeout = 5000): Promise<void> {
  // Wait for DOM to be ready (much faster than networkidle)
  await page.waitForLoadState('domcontentloaded', { timeout });
  
  // Wait for loading indicators to disappear (if any)
  try {
    await page.waitForFunction(
      () => {
        const bodyText = document.body.textContent || '';
        return !bodyText.includes('Loading...');
      },
      { timeout: 3000 }
    );
  } catch {
    // If no loading indicator, continue anyway
  }
}

/**
 * Wait for element to be visible and stable - faster than multiple waits
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options: { timeout?: number; state?: 'visible' | 'attached' } = {}
): Promise<void> {
  const { timeout = 5000, state = 'visible' } = options;
  await page.waitForSelector(selector, { state, timeout });
}

/**
 * Wait for navigation to complete - faster than networkidle
 */
export async function waitForNavigation(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout });
  // Give a brief moment for any async operations to complete
  await page.waitForTimeout(100); // Minimal delay for async operations
}

/**
 * Wait for toast/success message - replaces waitForTimeout after actions
 */
export async function waitForSuccessToast(
  page: Page,
  timeout = 3000
): Promise<void> {
  try {
    await page.waitForSelector('[data-testid="toast-success"]', { timeout, state: 'visible' });
  } catch {
    // Toast might not appear, continue anyway
  }
}

/**
 * Wait for form to be ready - checks for form elements instead of networkidle
 */
export async function waitForFormReady(
  page: Page,
  formSelector: string = 'form',
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(formSelector, { timeout });
  // Wait for any loading states to clear
  try {
    await page.waitForFunction(
      (selector) => {
        const form = document.querySelector(selector);
        if (!form) return false;
        const formText = form.textContent || '';
        return !formText.includes('Loading...');
      },
      formSelector,
      { timeout: 3000 }
    );
  } catch {
    // Continue if no loading indicator
  }
}

/**
 * Check if user is authenticated - faster redirect check
 */
export async function checkAuthentication(
  page: Page,
  expectedPath: string
): Promise<boolean> {
  // Wait for initial navigation
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
  
  const currentUrl = page.url();
  return currentUrl.includes(expectedPath);
}

/**
 * Wait for API response - waits for specific network request instead of all network
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 5000
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Smart wait - waits for either element or timeout, whichever comes first
 * Replaces hard-coded waitForTimeout with conditional waiting
 */
export async function smartWait(
  page: Page,
  condition: () => Promise<boolean>,
  options: { timeout?: number; checkInterval?: number } = {}
): Promise<boolean> {
  const { timeout = 3000, checkInterval = 100 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await page.waitForTimeout(checkInterval);
  }
  
  return false;
}

/**
 * Wait for content to load - checks for specific content instead of networkidle
 */
export async function waitForContent(
  page: Page,
  contentSelector: string,
  expectedText?: string,
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(contentSelector, { timeout });
  
  if (expectedText) {
    await expect(page.locator(contentSelector)).toContainText(expectedText, { timeout });
  }
}

