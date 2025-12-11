import { useMemo } from "react";
import { fuzzySearch, type FuzzySearchOptions } from "@/lib/fuzzySearch";

/**
 * React hook for fuzzy search filtering
 * 
 * @example
 * const filteredItems = useFuzzySearch(items, searchQuery, {
 *   searchFields: ['name', 'description'],
 *   threshold: 0.3
 * });
 */
export function useFuzzySearch<T>(
  items: T[],
  query: string,
  options: FuzzySearchOptions = {}
): T[] {
  return useMemo(() => {
    return fuzzySearch(items, query, options);
  }, [items, query, JSON.stringify(options)]);
}
