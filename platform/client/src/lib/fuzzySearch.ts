/**
 * Fuzzy search utility for client-side filtering
 * Uses a simple fuzzy matching algorithm that handles typos, partial matches, and character order variations
 */

export interface FuzzySearchOptions {
  /**
   * Threshold for match quality (0-1). Higher values require better matches.
   * Default: 0.3 (allows for significant typos)
   */
  threshold?: number;
  /**
   * Whether to ignore case when matching
   * Default: true
   */
  ignoreCase?: boolean;
  /**
   * Whether to match substrings
   * Default: true
   */
  allowPartial?: boolean;
  /**
   * Custom field accessor function for objects
   */
  getFieldValue?: (item: any) => string;
  /**
   * Multiple fields to search (for objects)
   */
  searchFields?: string[];
}

/**
 * Calculate fuzzy match score between query and text
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
export function fuzzyScore(query: string, text: string, options: FuzzySearchOptions = {}): number {
  const { ignoreCase = true, allowPartial = true } = options;
  
  const normalizedQuery = ignoreCase ? query.toLowerCase().trim() : query.trim();
  const normalizedText = ignoreCase ? text.toLowerCase() : text;

  if (normalizedQuery.length === 0) return 1;
  if (normalizedText.length === 0) return 0;

  // Exact match (highest score)
  if (normalizedText === normalizedQuery) return 1;

  // Starts with query (high score)
  if (normalizedText.startsWith(normalizedQuery)) return 0.9;

  // Contains query as substring
  if (allowPartial && normalizedText.includes(normalizedQuery)) return 0.8;

  // Fuzzy character matching
  let queryIndex = 0;
  let textIndex = 0;
  let matches = 0;
  let consecutiveMatches = 0;
  let maxConsecutive = 0;

  while (textIndex < normalizedText.length && queryIndex < normalizedQuery.length) {
    if (normalizedText[textIndex] === normalizedQuery[queryIndex]) {
      matches++;
      consecutiveMatches++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
    textIndex++;
  }

  // If not all query characters were matched, score is low
  if (queryIndex < normalizedQuery.length) {
    return 0;
  }

  // Calculate score based on:
  // - Percentage of matched characters
  // - Consecutive match bonus
  // - Position bonus (earlier matches score higher)
  const matchRatio = matches / normalizedQuery.length;
  const consecutiveBonus = maxConsecutive / normalizedQuery.length * 0.2;
  const positionBonus = matches > 0 ? (normalizedText.length - textIndex) / normalizedText.length * 0.1 : 0;
  
  return Math.min(1, matchRatio * 0.7 + consecutiveBonus + positionBonus);
}

/**
 * Perform fuzzy search on an array of items
 * @param items Array of items to search
 * @param query Search query string
 * @param options Search options
 * @returns Array of items sorted by relevance (best matches first)
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: FuzzySearchOptions = {}
): T[] {
  const {
    threshold = 0.3,
    getFieldValue,
    searchFields = [],
  } = options;

  if (!query || query.trim().length === 0) {
    return items;
  }

  const results: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    let maxScore = 0;

    // If custom field accessor provided, use it
    if (getFieldValue) {
      const value = getFieldValue(item);
      if (typeof value === 'string') {
        maxScore = Math.max(maxScore, fuzzyScore(query, value, options));
      }
    } else if (searchFields.length > 0) {
      // Search multiple fields
      for (const field of searchFields) {
        const value = (item as any)[field];
        if (typeof value === 'string') {
          maxScore = Math.max(maxScore, fuzzyScore(query, value, options));
        }
      }
    } else if (typeof item === 'string') {
      // Direct string comparison
      maxScore = fuzzyScore(query, item, options);
    } else {
      // Try common fields
      const commonFields = ['name', 'title', 'description', 'email', 'id', 'label', 'text', 'content'];
      for (const field of commonFields) {
        const value = (item as any)[field];
        if (typeof value === 'string') {
          maxScore = Math.max(maxScore, fuzzyScore(query, value, options));
        }
      }
    }

    if (maxScore >= threshold) {
      results.push({ item, score: maxScore });
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results.map(r => r.item);
}
