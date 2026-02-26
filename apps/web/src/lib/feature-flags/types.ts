/**
 * Feature Flags Type Definitions
 *
 * Defines interfaces for the feature flags system, designed for adapter-based
 * extensibility. The system supports multiple flag sources with clear precedence rules.
 *
 * ## Precedence Rules (highest to lowest)
 *
 * 1. **Kill switches OFF** - If a kill switch is enabled, the feature is DISABLED
 * 2. **Local overrides** - Developer overrides via localStorage (dev only)
 * 3. **Query params** - URL overrides via ?ff_flag=1 (dev only)
 * 4. **Runtime config** - Flags from /api/runtime-config
 * 5. **Defaults** - Hardcoded defaults (all false)
 *
 * @module feature-flags/types
 */

import type { FeatureFlagKey } from "./flags";

/**
 * Source identifier for flag values.
 * Used for debugging and understanding flag resolution.
 */
export type FeatureFlagSource = "runtime" | "local" | "query" | "posthog" | "default" | "mixed";

/**
 * Snapshot of all feature flag values at a point in time.
 *
 * This is the primary data structure passed through the system.
 * Adapters produce snapshots, and the provider consumes them.
 */
export interface FeatureFlagSnapshot {
  /**
   * Current values for all known feature flags.
   * Missing flags are treated as false.
   */
  values: Partial<Record<FeatureFlagKey, boolean>>;

  /**
   * Kill switch states.
   * When a kill switch is TRUE, the corresponding feature is DISABLED.
   * Kill switches take highest precedence.
   */
  killSwitches: Partial<Record<FeatureFlagKey, boolean>>;

  /**
   * Source of the snapshot for debugging.
   */
  source: FeatureFlagSource;

  /**
   * Per-flag source tracking for debugging.
   * Maps each flag key to its source.
   */
  sources?: Partial<Record<FeatureFlagKey, FeatureFlagSource>>;

  /**
   * Timestamp when the snapshot was created.
   */
  timestamp: number;
}

/**
 * Feature flag adapter interface.
 *
 * Adapters are responsible for fetching and subscribing to flag values
 * from various sources (runtime config, PostHog, LaunchDarkly, etc.).
 *
 * The default adapter reads from runtime-config and localStorage.
 * Future adapters can integrate with feature flag services.
 */
export interface FeatureFlagAdapter {
  /**
   * Get the current snapshot of all feature flags.
   *
   * This method should be synchronous and return cached values.
   * For async initialization, use subscribe() to be notified of updates.
   */
  getSnapshot(): FeatureFlagSnapshot;

  /**
   * Subscribe to flag changes (optional).
   *
   * Some adapters (like PostHog) can push updates when flags change.
   * The callback is invoked with the new snapshot.
   *
   * @param callback - Function to call when flags change
   * @returns Unsubscribe function
   */
  subscribe?(callback: (snapshot: FeatureFlagSnapshot) => void): () => void;

  /**
   * Destroy the adapter and clean up resources.
   * Called when the provider unmounts.
   */
  destroy?(): void;
}

/**
 * Options for creating a feature flag adapter.
 */
export interface FeatureFlagAdapterOptions {
  /**
   * Whether to enable development features like local overrides.
   * Defaults to checking process.env.NODE_ENV === 'development'.
   */
  isDevelopment?: boolean;

  /**
   * Initial flag values from runtime config.
   * Used to seed the adapter before any overrides.
   */
  runtimeFlags?: Record<string, boolean>;

  /**
   * Storage key for local overrides.
   * @default 'ff-overrides'
   */
  localStorageKey?: string;
}

/**
 * Local override storage format.
 * Stored in localStorage as JSON.
 */
export interface LocalOverrides {
  /**
   * Override values for specific flags.
   * true = force enabled, false = force disabled, undefined = use default
   */
  flags: Partial<Record<FeatureFlagKey, boolean>>;

  /**
   * When overrides were last updated.
   */
  updatedAt?: number;
}

/**
 * Create an empty feature flag snapshot.
 *
 * @param source - Source identifier for the snapshot
 * @returns Empty snapshot with all flags false
 */
export function createEmptySnapshot(source: FeatureFlagSource = "default"): FeatureFlagSnapshot {
  return {
    values: {},
    killSwitches: {},
    source,
    timestamp: Date.now(),
  };
}

/**
 * Merge multiple snapshots with precedence rules.
 *
 * Precedence (highest to lowest):
 * 1. Kill switches - if enabled, feature is DISABLED
 * 2. Higher-precedence snapshot values override lower ones
 *
 * @param snapshots - Array of snapshots, highest precedence first
 * @returns Merged snapshot
 *
 * @example
 * ```tsx
 * const merged = mergeSnapshots([
 *   localOverrides,  // Highest precedence
 *   runtimeConfig,   // Lower precedence
 *   defaults,        // Lowest precedence
 * ]);
 * ```
 */
export function mergeSnapshots(snapshots: FeatureFlagSnapshot[]): FeatureFlagSnapshot {
  if (snapshots.length === 0) {
    return createEmptySnapshot();
  }

  if (snapshots.length === 1) {
    const first = snapshots[0];
    if (!first) {
      return createEmptySnapshot();
    }
    return first;
  }

  const merged: FeatureFlagSnapshot = {
    values: {},
    killSwitches: {},
    sources: {},
    source: "mixed",
    timestamp: Date.now(),
  };

  // Merge from lowest to highest precedence
  // Higher precedence sources overwrite lower ones
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const snapshot = snapshots[i];
    if (!snapshot) continue;

    // Merge flag values
    for (const [key, value] of Object.entries(snapshot.values)) {
      if (value !== undefined) {
        merged.values[key as FeatureFlagKey] = value;
        if (merged.sources) {
          merged.sources[key as FeatureFlagKey] = snapshot.source;
        }
      }
    }

    // Merge kill switches (any true kills the feature)
    for (const [key, value] of Object.entries(snapshot.killSwitches)) {
      if (value === true) {
        merged.killSwitches[key as FeatureFlagKey] = true;
      }
    }
  }

  return merged;
}

/**
 * Resolve whether a feature is enabled, applying kill switch logic.
 *
 * @param snapshot - Current feature flag snapshot
 * @param key - Feature flag key to check
 * @returns True if enabled, false if disabled or killed
 *
 * @example
 * ```tsx
 * const isEnabled = resolveFlag(snapshot, 'risky_upload_flow');
 * // Returns false if kill_risky_upload_flow is true
 * ```
 */
export function resolveFlag(snapshot: FeatureFlagSnapshot, key: FeatureFlagKey): boolean {
  // Check kill switch first - takes highest precedence
  const killSwitchKey = `kill_${key}` as FeatureFlagKey;
  if (snapshot.killSwitches[killSwitchKey] === true) {
    return false;
  }

  // Also check if the key itself is a kill switch set to true
  // (shouldn't query kill switches directly, but handle gracefully)
  if (key.startsWith("kill_") && snapshot.values[key] === true) {
    return true; // Kill switch is "enabled" means it's active
  }

  // Return flag value, defaulting to false
  return snapshot.values[key] ?? false;
}
