/**
 * Render Helpers
 *
 * Custom render function that wraps components with all necessary providers.
 * This is THE KEY HELPER for component testing.
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { createDefaultAdapter, FeatureFlagsProvider } from "@/lib/feature-flags";

import { createTestQueryClient } from "./reactQuery";
import { setMockPathname, setMockSearchParams } from "./router";

import type { QueryClient } from "@tanstack/react-query";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type React from "react";

/**
 * Options for renderWithProviders.
 */
export interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /**
   * Optional QueryClient instance.
   * If not provided, a new test client will be created.
   */
  queryClient?: QueryClient;

  /**
   * Initial route/pathname (for router mocks).
   * If provided, sets the mock pathname.
   */
  route?: string;

  /**
   * Initial search params (for router mocks).
   */
  searchParams?: Record<string, string>;

  /**
   * Feature flags to enable/disable in the test.
   * Keys should match FeatureFlags values (e.g., 'new_dashboard').
   */
  featureFlags?: Record<string, boolean>;
}

/**
 * Enhanced render result with additional utilities.
 */
export interface RenderWithProvidersResult extends RenderResult {
  /**
   * User event instance for simulating user interactions.
   */
  user: ReturnType<typeof userEvent.setup>;

  /**
   * QueryClient instance used in the render.
   * Use this to inspect cache or manually trigger invalidations.
   */
  queryClient: QueryClient;
}

/**
 * Render a component with all necessary providers for testing.
 *
 * This is the primary helper for component tests. It wraps the component with:
 * - QueryClientProvider (React Query)
 * - Any other app-level providers as needed
 *
 * @param ui - The component to render
 * @param options - Optional render options
 *
 * @example
 * ```tsx
 * const { user, queryClient } = renderWithProviders(<MyComponent />);
 *
 * // Interact with the component
 * await user.click(screen.getByRole('button'));
 *
 * // Inspect query cache
 * expect(queryClient.getQueryData(['my-key'])).toEqual(expectedData);
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
  const {
    queryClient: providedQueryClient,
    route,
    searchParams,
    featureFlags = {},
    ...renderOptions
  } = options;

  // Create or use provided QueryClient
  const queryClient = providedQueryClient || createTestQueryClient();

  // Create feature flags adapter with test flags
  const featureFlagsAdapter = createDefaultAdapter({
    runtimeFlags: featureFlags,
    isDevelopment: true,
  });

  // Setup router mocks if route is provided
  if (route !== undefined) {
    setMockPathname(route);
  }

  if (searchParams !== undefined) {
    setMockSearchParams(searchParams);
  }

  // Create wrapper with all providers
  function AllProviders({ children }: { children: React.ReactNode }) {
    return (
      <FeatureFlagsProvider adapter={featureFlagsAdapter}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </FeatureFlagsProvider>
    );
  }

  // Setup user event
  const user = userEvent.setup();

  // Render with providers
  const renderResult = render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });

  return {
    ...renderResult,
    user,
    queryClient,
  };
}

/**
 * Re-export render from RTL for cases where you don't need providers.
 */
export { render };
