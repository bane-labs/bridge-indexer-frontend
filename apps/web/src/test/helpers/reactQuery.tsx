/**
 * React Query Test Helpers
 *
 * Utilities for testing React Query hooks and components.
 * Provides test-friendly QueryClient configuration and wrapper components.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { QueryClientConfig } from "@tanstack/react-query";
import type React from "react";

/**
 * Create a QueryClient configured for testing.
 *
 * Test-friendly defaults:
 * - No retries (tests should be deterministic)
 * - Low cache times (tests should be isolated)
 * - Silent logger (no console noise during tests)
 * - No automatic refetching
 *
 * @param overrides - Optional config overrides per-test
 *
 * @example
 * ```ts
 * const queryClient = createTestQueryClient();
 * ```
 */
export function createTestQueryClient(overrides?: Partial<QueryClientConfig>): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries for deterministic tests
        retry: false,

        // Short cache times for test isolation
        gcTime: 0,
        staleTime: 0,

        // Disable automatic refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        // No retries for mutations
        retry: false,
      },
    },
    ...overrides,
  });
}

/**
 * Create a wrapper component with QueryClientProvider for testing hooks.
 *
 * Use this with `renderHook` from @testing-library/react.
 *
 * @param queryClient - Optional QueryClient instance (creates new one if not provided)
 *
 * @example
 * ```ts
 * const { result } = renderHook(() => useMyQuery(), {
 *   wrapper: createQueryWrapper(),
 * });
 * ```
 */
export function createQueryWrapper(
  queryClient?: QueryClient
): React.ComponentType<{ children: React.ReactNode }> {
  const client = queryClient || createTestQueryClient();

  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

/**
 * Wait for React Query to finish all pending queries/mutations.
 *
 * Useful when testing components that trigger queries on mount.
 *
 * @param queryClient - The QueryClient instance to wait for
 *
 * @example
 * ```ts
 * render(<MyComponent />, { wrapper: createQueryWrapper(queryClient) });
 * await waitForQueries(queryClient);
 * expect(screen.getByText('Data loaded')).toBeInTheDocument();
 * ```
 */
export async function waitForQueries(queryClient: QueryClient): Promise<void> {
  // Wait for all queries to settle
  const queries = queryClient.getQueryCache().getAll();
  await Promise.all(queries.map((query) => query.promise).filter(Boolean));
}
