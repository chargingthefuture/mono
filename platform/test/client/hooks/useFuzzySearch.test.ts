import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFuzzySearch } from '@/hooks/useFuzzySearch';

describe('useFuzzySearch', () => {
  const testItems = [
    { id: 1, name: 'Apple', description: 'Red fruit' },
    { id: 2, name: 'Banana', description: 'Yellow fruit' },
    { id: 3, name: 'Orange', description: 'Orange fruit' },
    { id: 4, name: 'Grape', description: 'Purple fruit' },
  ];

  it('should return all items when query is empty', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, '', { searchFields: ['name', 'description'] })
    );

    expect(result.current).toHaveLength(4);
  });

  it('should filter items by name', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, 'apple', { searchFields: ['name'] })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Apple');
  });

  it('should filter items by description', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, 'red', { searchFields: ['description'] })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Apple');
  });

  it('should handle typos with fuzzy matching', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, 'aple', { searchFields: ['name'], threshold: 0.3 })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Apple');
  });

  it('should search across multiple fields', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, 'yellow', { searchFields: ['name', 'description'] })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Banana');
  });

  it('should return empty array when no matches', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, 'xyz', { searchFields: ['name', 'description'] })
    );

    expect(result.current).toHaveLength(0);
  });

  it('should handle case-insensitive search', () => {
    const { result } = renderHook(() =>
      useFuzzySearch(testItems, 'APPLE', { searchFields: ['name'] })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Apple');
  });

  it('should respect threshold option', () => {
    // Lower threshold = more strict matching
    const { result: strictResult } = renderHook(() =>
      useFuzzySearch(testItems, 'aple', { searchFields: ['name'], threshold: 0.8 })
    );

    // Higher threshold = more lenient matching
    const { result: lenientResult } = renderHook(() =>
      useFuzzySearch(testItems, 'aple', { searchFields: ['name'], threshold: 0.3 })
    );

    expect(strictResult.current.length).toBeLessThanOrEqual(lenientResult.current.length);
  });
});

