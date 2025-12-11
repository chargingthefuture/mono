/**
 * Data obfuscation module
 * Implements periodic rotation of display order and delays for automated requests
 */

/**
 * Rotate array order using a deterministic but time-based seed
 * This makes scraping harder while keeping the order consistent for legitimate users
 */
export function rotateDisplayOrder<T>(items: T[], seed?: string): T[] {
  if (items.length === 0) return items;

  // Use time-based seed (changes every 5 minutes) combined with optional seed
  const now = Date.now();
  const timeWindow = Math.floor(now / (5 * 60 * 1000)); // 5-minute windows
  const seedValue = seed || timeWindow.toString();
  
  // Simple hash function for seed
  let hash = 0;
  for (let i = 0; i < seedValue.length; i++) {
    const char = seedValue.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Create a shuffled array using seeded random
  const shuffled = [...items];
  const random = () => {
    hash = ((hash << 5) - hash) + 1;
    hash = hash & hash;
    return (hash >>> 0) / (0xFFFFFFFF + 1); // Convert to 0-1 range
  };

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Add subtle delay for suspicious or automated requests
 * Returns a promise that resolves after a random delay
 */
export async function addAntiScrapingDelay(
  isSuspicious: boolean,
  minDelay: number = 100,
  maxDelay: number = 500
): Promise<void> {
  // Longer delay for suspicious requests
  const delay = isSuspicious
    ? Math.floor(Math.random() * (maxDelay * 2 - minDelay * 2)) + minDelay * 2
    : Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;

  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Check if request appears to be from a bot/scraper
 */
export function isLikelyBot(userAgent?: string, accept?: string, acceptLanguage?: string): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  
  // Common bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /axios/i,
    /node-fetch/i,
    /postman/i,
    /insomnia/i,
    /httpie/i,
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true;
  }

  // Missing typical browser headers
  if (!accept || !accept.includes('text/html')) return true;
  if (!acceptLanguage) return true;

  return false;
}

