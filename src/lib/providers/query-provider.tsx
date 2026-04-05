/**
 * TanStack Query Provider
 * ========================
 * Client-side wrapper for QueryClientProvider.
 * Configures default options for queries and mutations.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { DraggableTanstackToggle } from './draggable-tanstack-toggle';

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a client instance per component mount to avoid sharing state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching by default (opt-in per query)
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Enable React Query Devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          <DraggableTanstackToggle />
        </>
      )}
    </QueryClientProvider>
  );
}
