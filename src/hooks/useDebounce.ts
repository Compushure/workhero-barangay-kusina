/**
 * useDebounce Hook
 * =================
 * Custom hook to debounce values with configurable delay.
 * Prevents excessive API calls when user is typing in search fields.
 *
 * @example
 * ```tsx
 * function SearchUsers() {
 *   const [searchQuery, setSearchQuery] = useState('')
 *   const debouncedQuery = useDebounce(searchQuery, 300)
 *
 *   // Effect only runs when debouncedQuery changes (after 300ms of no typing)
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       fetchUsers(debouncedQuery)
 *     }
 *   }, [debouncedQuery])
 *
 *   return <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
 * }
 * ```
 */

import { useEffect, useState } from 'react';

/**
 * Debounces a value with a specified delay
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Clean up the timeout if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
