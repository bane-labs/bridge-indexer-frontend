/**
 * PostHog Feature Flag Adapter (Stub)
 *
 * This is a placeholder adapter for future PostHog integration.
 * When implemented, it will:
 *
 * 1. Read feature flags from PostHog client
 * 2. Subscribe to flag changes in real-time
 * 3. Merge with kill switches (kill switches ALWAYS win)
 *
 * ## Prerequisites
 *
 * 1. Install posthog-js: `pnpm add posthog-js`
 * 2. Initialize PostHog client in the app
 * 3. Replace the default adapter with this one
 *
 * ## Usage (Future)
 *
 * ```tsx
 * // In providers/index.tsx
 * import { createPostHogAdapter } from '@/lib/feature-flags/adapters/posthogAdapter';
 *
 * <FeatureFlagsProvider adapter={createPostHogAdapter(posthog, runtimeFlags)}>
 *   {children}
 * </FeatureFlagsProvider>
 * ```
 *
 * @module feature-flags/adapters/posthogAdapter
 */

import { isKillSwitchFlag, isValidFeatureFlag } from "../flags";
import { mergeSnapshots } from "../types";

import type { FeatureFlagKey } from "../flags";
import type { FeatureFlagAdapter, FeatureFlagSnapshot } from "../types";

// ============================================================================
// PostHog Types (copied from posthog-js to avoid dependency)
// ============================================================================

/**
 * Minimal PostHog client interface.
 * This is what we need from the posthog-js client.
 */
export interface PostHogClient {
  /**
   * Check if a feature flag is enabled.
   */
  isFeatureEnabled(key: string): boolean | undefined;

  /**
   * Get all feature flags as a record.
   */
  getFeatureFlags(): Record<string, boolean | string> | undefined;

  /**
   * Subscribe to feature flag changes.
   */
  onFeatureFlags(callback: (flags: string[]) => void): () => void;

  /**
   * Reload feature flags from PostHog.
   */
  reloadFeatureFlags(): void;
}

// ============================================================================
// PostHog Adapter Options
// ============================================================================

/**
 * Options for creating the PostHog adapter.
 */
export interface PostHogAdapterOptions {
  /**
   * Runtime flags for kill switches and defaults.
   * Kill switches from runtime config ALWAYS take precedence.
   */
  runtimeFlags?: Record<string, boolean>;

  /**
   * Whether to automatically reload flags on mount.
   * @default true
   */
  reloadOnMount?: boolean;

  /**
   * Polling interval in milliseconds (0 to disable).
   * PostHog can push updates, but polling is a backup.
   * @default 0 (disabled)
   */
  pollInterval?: number;
}

// ============================================================================
// PostHog Adapter Implementation (Stub)
// ============================================================================

/**
 * Create a PostHog feature flag adapter.
 *
 * This adapter integrates with PostHog's feature flag system while
 * respecting kill switches from runtime config.
 *
 * **IMPORTANT**: Kill switches from runtime config ALWAYS take precedence.
 * This ensures operators can disable features instantly without waiting
 * for PostHog updates.
 *
 * @param posthog - PostHog client instance
 * @param options - Adapter options
 * @returns Feature flag adapter
 *
 * @example
 * ```tsx
 * // TODO: Implement when PostHog is added
 * import posthog from 'posthog-js';
 * import { createPostHogAdapter } from '@/lib/feature-flags/adapters/posthogAdapter';
 *
 * const adapter = createPostHogAdapter(posthog, {
 *   runtimeFlags: runtimeConfig.featureFlags,
 * });
 * ```
 */
export function createPostHogAdapter(
  posthog: PostHogClient,
  options: PostHogAdapterOptions = {}
): FeatureFlagAdapter {
  const { runtimeFlags = {}, reloadOnMount = true, pollInterval = 0 } = options;

  let subscribers: ((snapshot: FeatureFlagSnapshot) => void)[] = [];
  let unsubscribePostHog: (() => void) | null = null;
  let pollIntervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Get kill switches from runtime flags.
   * These ALWAYS take precedence over PostHog flags.
   */
  function getKillSwitches(): Partial<Record<FeatureFlagKey, boolean>> {
    const killSwitches: Partial<Record<FeatureFlagKey, boolean>> = {};
    for (const [key, value] of Object.entries(runtimeFlags)) {
      if (isKillSwitchFlag(key) && isValidFeatureFlag(key)) {
        killSwitches[key] = value;
      }
    }
    return killSwitches;
  }

  /**
   * Convert PostHog flags to our format.
   */
  function getPostHogFlags(): Partial<Record<FeatureFlagKey, boolean>> {
    const flags: Partial<Record<FeatureFlagKey, boolean>> = {};
    const posthogFlags = posthog.getFeatureFlags();

    if (!posthogFlags) {
      return flags;
    }

    for (const [key, value] of Object.entries(posthogFlags)) {
      if (isValidFeatureFlag(key)) {
        // PostHog can return boolean or string (for multivariate flags)
        // Treat any truthy value as enabled
        flags[key] = Boolean(value);
      }
    }

    return flags;
  }

  /**
   * Build the current snapshot.
   */
  function getSnapshot(): FeatureFlagSnapshot {
    const timestamp = Date.now();
    const killSwitches = getKillSwitches();

    // Build PostHog snapshot
    const posthogSnapshot: FeatureFlagSnapshot = {
      values: getPostHogFlags(),
      killSwitches: {},
      source: "posthog",
      timestamp,
    };

    // Build runtime snapshot (for defaults and kill switches)
    const runtimeSnapshot: FeatureFlagSnapshot = {
      values: { ...runtimeFlags } as Partial<Record<FeatureFlagKey, boolean>>,
      killSwitches,
      source: "runtime",
      timestamp,
    };

    // Merge with precedence: PostHog > runtime (except kill switches)
    // Kill switches from runtime ALWAYS win
    const merged = mergeSnapshots([posthogSnapshot, runtimeSnapshot]);

    // Ensure kill switches are enforced
    merged.killSwitches = killSwitches;
    merged.source = "posthog";

    return merged;
  }

  /**
   * Notify all subscribers of a flag change.
   */
  function notifySubscribers(): void {
    const snapshot = getSnapshot();
    for (const callback of subscribers) {
      try {
        callback(snapshot);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[feature-flags] Subscriber error:", error);
      }
    }
  }

  /**
   * Subscribe to flag changes.
   */
  function subscribe(callback: (snapshot: FeatureFlagSnapshot) => void): () => void {
    subscribers.push(callback);

    // Set up PostHog subscription on first subscriber
    if (subscribers.length === 1 && !unsubscribePostHog) {
      unsubscribePostHog = posthog.onFeatureFlags(() => {
        notifySubscribers();
      });

      // Set up polling if configured
      if (pollInterval > 0) {
        pollIntervalId = setInterval(() => {
          posthog.reloadFeatureFlags();
        }, pollInterval);
      }

      // Reload flags on mount
      if (reloadOnMount) {
        posthog.reloadFeatureFlags();
      }
    }

    // Return unsubscribe function
    return () => {
      subscribers = subscribers.filter((cb) => cb !== callback);

      // Clean up when no subscribers left
      if (subscribers.length === 0) {
        if (unsubscribePostHog) {
          unsubscribePostHog();
          unsubscribePostHog = null;
        }
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
          pollIntervalId = null;
        }
      }
    };
  }

  /**
   * Clean up resources.
   */
  function destroy(): void {
    subscribers = [];
    if (unsubscribePostHog) {
      unsubscribePostHog();
      unsubscribePostHog = null;
    }
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  }

  return {
    getSnapshot,
    subscribe,
    destroy,
  };
}

// ============================================================================
// TODO: Implementation Checklist
// ============================================================================

/**
 * ## Implementation Checklist
 *
 * When adding PostHog to the project:
 *
 * 1. [ ] Install posthog-js: `pnpm add posthog-js`
 *
 * 2. [ ] Initialize PostHog in app/layout.tsx or a provider:
 *    ```tsx
 *    import posthog from 'posthog-js';
 *    import { PostHogProvider } from 'posthog-js/react';
 *
 *    posthog.init('<your-api-key>', {
 *      api_host: '<your-host>',
 *      loaded: (posthog) => {
 *        if (process.env.NODE_ENV === 'development') posthog.debug();
 *      },
 *    });
 *    ```
 *
 * 3. [ ] Create a PostHog provider wrapper in providers/:
 *    ```tsx
 *    export function FeatureFlagsWithPostHog({ children }) {
 *      const runtimeConfig = useRuntimeConfig();
 *      const adapter = useMemo(
 *        () => createPostHogAdapter(posthog, {
 *          runtimeFlags: runtimeConfig.featureFlags,
 *        }),
 *        [runtimeConfig.featureFlags]
 *      );
 *
 *      return (
 *        <FeatureFlagsProvider adapter={adapter}>
 *          {children}
 *        </FeatureFlagsProvider>
 *      );
 *    }
 *    ```
 *
 * 4. [ ] Update providers/index.tsx to use the PostHog adapter
 *
 * 5. [ ] Configure PostHog flags in PostHog dashboard
 *
 * 6. [ ] Test kill switch precedence works correctly
 */
