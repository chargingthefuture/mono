/**
 * Link Verification Utility
 * 
 * Fetches actual page content and computes similarity scores between
 * linked pages and answer content.
 */

import { logError } from './errorLogger';
import * as Sentry from '@sentry/node';

// Domain trust scores (configurable whitelist/blacklist)
const DOMAIN_TRUST_SCORES: Record<string, number> = {
  // High trust domains
  'edu': 0.9,
  'gov': 0.9,
  'org': 0.7,
  // Medium trust
  'com': 0.5,
  'net': 0.5,
  // Lower trust
  'info': 0.3,
  'biz': 0.3,
};

// Blacklisted domains (spam, malicious, etc.)
const BLACKLISTED_DOMAINS: Set<string> = new Set([
  // Add known malicious or spam domains here
]);

// HTTP fetch configuration
const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface FetchResult {
  httpStatus: number;
  title: string;
  snippet: string;
  content: string;
}

/**
 * Fetch page content with timeout and retry logic
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkVerifier/1.0; +https://chargingthefuture.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const { title, snippet, content } = extractContent(html);

    return {
      httpStatus: response.status,
      title,
      snippet,
      content,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    // Retry on network errors
    if (retries > 0 && (error.message?.includes('network') || error.message?.includes('ECONNREFUSED'))) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }

    throw error;
  }
}

/**
 * Extract title, description, and main content from HTML
 */
function extractContent(html: string): { title: string; snippet: string; content: string } {
  // Remove script and style tags
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Extract title
  const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ||
                     cleaned.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Extract meta description
  const descMatch = cleaned.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    cleaned.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  const snippet = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Extract main content (text from body, excluding navigation/footer)
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = '';
  if (bodyMatch) {
    // Remove HTML tags and get text content
    content = bodyMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit content length
  }

  return { title, snippet, content };
}

/**
 * Compute domain trust score
 */
function computeDomainScore(domain: string): number {
  // Check blacklist
  if (BLACKLISTED_DOMAINS.has(domain.toLowerCase())) {
    return 0.1;
  }

  // Extract TLD
  const parts = domain.split('.');
  if (parts.length < 2) {
    return 0.3; // Default for invalid domains
  }

  const tld = parts[parts.length - 1].toLowerCase();
  
  // Check specific domain matches
  for (const [key, score] of Object.entries(DOMAIN_TRUST_SCORES)) {
    if (tld === key || domain.includes(`.${key}`)) {
      return score;
    }
  }

  // Default score for unknown domains
  return 0.4;
}

/**
 * Simple text similarity using word overlap (Jaccard similarity)
 * In production, consider using embeddings (OpenAI, etc.) for better accuracy
 */
function computeSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  // Normalize text: lowercase, remove punctuation, split into words
  const normalize = (text: string): Set<string> => {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2) // Filter out short words
    );
  };

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  if (words1.size === 0 || words2.size === 0) return 0;

  // Compute intersection and union
  let intersection = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      intersection++;
    }
  }

  const union = words1.size + words2.size - intersection;

  // Jaccard similarity: intersection / union
  return union > 0 ? intersection / union : 0;
}

/**
 * Verify a link by fetching content and computing similarity
 */
export async function verifyLink(
  answerId: string,
  url: string,
  answerContent: string
): Promise<{
  httpStatus: number;
  title: string;
  snippet: string;
  domain: string;
  domainScore: number;
  similarityScore: number;
  isSupportive: boolean;
}> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Check for SSRF vulnerabilities (block local/internal IPs)
    if (
      domain === 'localhost' ||
      domain === '127.0.0.1' ||
      domain.startsWith('192.168.') ||
      domain.startsWith('10.') ||
      domain.startsWith('172.16.') ||
      domain.startsWith('172.17.') ||
      domain.startsWith('172.18.') ||
      domain.startsWith('172.19.') ||
      domain.startsWith('172.20.') ||
      domain.startsWith('172.21.') ||
      domain.startsWith('172.22.') ||
      domain.startsWith('172.23.') ||
      domain.startsWith('172.24.') ||
      domain.startsWith('172.25.') ||
      domain.startsWith('172.26.') ||
      domain.startsWith('172.27.') ||
      domain.startsWith('172.28.') ||
      domain.startsWith('172.29.') ||
      domain.startsWith('172.30.') ||
      domain.startsWith('172.31.')
    ) {
      throw new Error('Invalid URL: local/internal IPs are not allowed');
    }

    // Fetch page content
    const fetchResult = await fetchWithRetry(url);

    // Compute domain score
    const domainScore = computeDomainScore(domain);

    // Compute similarity between answer content and fetched content
    // Combine title, snippet, and content for comparison
    const pageContent = `${fetchResult.title} ${fetchResult.snippet} ${fetchResult.content}`.trim();
    const similarityScore = computeSimilarity(answerContent, pageContent);

    // Determine if link is supportive
    // Link is supportive if similarity > 0.3 and domain score > 0.4
    const isSupportive = similarityScore > 0.3 && domainScore > 0.4;

    return {
      httpStatus: fetchResult.httpStatus,
      title: fetchResult.title || domain,
      snippet: fetchResult.snippet || `Content from ${domain}`,
      domain,
      domainScore,
      similarityScore,
      isSupportive,
    };
  } catch (error: any) {
    // Log error but don't throw - we'll create provenance with error status
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const domainScore = computeDomainScore(domain);

    Sentry.captureException(error, {
      tags: { component: 'linkVerification', answerId, url },
      extra: { domain, errorMessage: error.message },
    });

    logError(error, undefined);

    // Return error result
    return {
      httpStatus: 0,
      title: domain,
      snippet: `Error fetching: ${error.message || 'Unknown error'}`,
      domain,
      domainScore: domainScore * 0.5, // Reduce score on error
      similarityScore: 0,
      isSupportive: false,
    };
  }
}

