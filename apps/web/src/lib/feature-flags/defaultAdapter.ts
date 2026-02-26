/**
 * Default Feature Flag Adapter
 *
 * Reads feature flags from multiple sources and merges them with precedence:
 *
 * 1. **Kill switches** - If enabled, feature is DISABLED (highest precedence)
 * 2. **Local overrides** - localStorage key 'ff-overrides' (dev only)
 * 3. **Query params** - URL params like ?ff_new_dashboard=1 (dev only)
 * 4. **Runtime config** - Flags from useRuntimeConfig().featureFlags
 * 5. **Defaults** - All false
 *
 * ## Local Overrides (Development Only)
 *
 * Store JSON in localStorage at key 'ff-overrides':
 * ```json
 * { "flags": { "new_dashboard": true, "beta_features": false } }
 * ```
 *
 * ## Query Param Overrides (Development Only)
 *
 * Add to URL: ?ff_new_dashboard=1&ff_beta_features=0
 * - ff_<flag_name>=1 → enabled
 * - ff_<flag_name>=0 → disabled
 *
 * @module feature-flags/defaultAdapter
 */

import { isKillSwitchFlag, isValidFeatureFlag } from "./flags";

import type { FeatureFlagKey } from "./flags";
import type {
  FeatureFlagAdapter,
  FeatureFlagAdapterOptions,
  FeatureFlagSnapshot,
  LocalOverrides,
} from "./types";

/**
 * Default localStorage key for local overrides.
 */
const DEFAULT_LOCAL_STORAGE_KEY = "ff-overrides";

/**
 * Query param prefix for flag overrides.
 */
const QUERY_PARAM_PREFIX = "ff_";

/**
 * Check if we're in a browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if we're in development mode.
 * Using NODE_ENV check which is available at build time.
 */
function isDev(): boolean {
  // NODE_ENV is inlined at build time by Next.js, so this is safe
  // eslint-disable-next-line no-restricted-syntax
  return process.env.NODE_ENV === "development";
}

/**
 * Safely parse JSON with a fallback.
 */
function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Read local overrides from localStorage.
 *
 * @param key - Storage key to read from
 * @returns Local overrides or empty object
 */
export function readLocalOverrides(key: string = DEFAULT_LOCAL_STORAGE_KEY): LocalOverrides {
  if (!isBrowser()) {
    return { flags: {} };
  }

  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return { flags: {} };
    }

    const parsed = safeJsonParse<LocalOverrides>(stored, { flags: {} });

    // Validate flag keys
    const validatedFlags: Partial<Record<FeatureFlagKey, boolean>> = {};
    for (const [flagKey, value] of Object.entries(parsed.flags || {})) {
      if (isValidFeatureFlag(flagKey) && typeof value === "boolean") {
        validatedFlags[flagKey] = value;
      }
    }

    return {
      flags: validatedFlags,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return { flags: {} };
  }
}

/**
 * Write local overrides to localStorage.
 *
 * @param overrides - Overrides to store
 * @param key - Storage key to write to
 */
export function writeLocalOverrides(
  overrides: LocalOverrides,
  key: string = DEFAULT_LOCAL_STORAGE_KEY
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        ...overrides,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // localStorage might be unavailable or full
    // eslint-disable-next-line no-console
    console.warn("[feature-flags] Failed to write local overrides");
  }
}

/**
 * Clear all local overrides.
 *
 * @param key - Storage key to clear
 */
export function clearLocalOverrides(key: string = DEFAULT_LOCAL_STORAGE_KEY): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

/**
 * Read flag overrides from URL query parameters.
 *
 * Format: ?ff_flag_name=1 or ?ff_flag_name=0
 *
 * @returns Object mapping flag keys to boolean values
 */
export function readQueryParamOverrides(): Partial<Record<FeatureFlagKey, boolean>> {
  if (!isBrowser()) {
    return {};
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const overrides: Partial<Record<FeatureFlagKey, boolean>> = {};

    for (const [key, value] of params.entries()) {
      if (key.startsWith(QUERY_PARAM_PREFIX)) {
        const flagKey = key.slice(QUERY_PARAM_PREFIX.length);
        if (isValidFeatureFlag(flagKey)) {
          // 1, true, yes → enabled; 0, false, no → disabled
          overrides[flagKey] = ["1", "true", "yes"].includes(value.toLowerCase());
        }
      }
    }

    return overrides;
  } catch {
    return {};
  }
}

/**
 * Extract kill switches from a flags record.
 * Kill switches are flags prefixed with "kill_".
 *
 * @param flags - Record of all flags
 * @returns Record of only kill switch flags
 */
function extractKillSwitches(
  flags: Record<string, boolean>
): Partial<Record<FeatureFlagKey, boolean>> {
  const killSwitches: Partial<Record<FeatureFlagKey, boolean>> = {};

  for (const [key, value] of Object.entries(flags)) {
    if (isKillSwitchFlag(key) && isValidFeatureFlag(key)) {
      killSwitches[key] = value;
    }
  }

  return killSwitches;
}

/**
 * Create the default feature flag adapter.
 *
 * Reads from runtime config, localStorage (dev only), and query params (dev only).
 * Apply kill switch precedence on flag resolution.
 *
 * @param options - Adapter configuration options
 * @returns Feature flag adapter instance
 *
 * @example
 * ```tsx
 * const runtimeFlags = useRuntimeConfig().featureFlags;
 * const adapter = createDefaultAdapter({ runtimeFlags });
 *
 * const snapshot = adapter.getSnapshot();
 * const isNewDashboardEnabled = resolveFlag(snapshot, 'new_dashboard');
 * ```
 */
export function createDefaultAdapter(options: FeatureFlagAdapterOptions = {}): FeatureFlagAdapter {
  const {
    isDevelopment = isDev(),
    runtimeFlags = {},
    localStorageKey = DEFAULT_LOCAL_STORAGE_KEY,
  } = options;

  /**
   * Get the current merged snapshot.
   */
  function getSnapshot(): FeatureFlagSnapshot {
    const timestamp = Date.now();

    // Start with runtime flags as base
    const runtimeSnapshot: FeatureFlagSnapshot = {
      values: { ...runtimeFlags } as Partial<Record<FeatureFlagKey, boolean>>,
      killSwitches: extractKillSwitches(runtimeFlags),
      source: "runtime",
      timestamp,
    };

    // In production, return runtime flags only
    if (!isDevelopment) {
      return runtimeSnapshot;
    }

    // In development, apply overrides
    const localOverrides = readLocalOverrides(localStorageKey);
    const queryOverrides = readQueryParamOverrides();

    // Build merged snapshot with sources
    const merged: FeatureFlagSnapshot = {
      values: { ...runtimeSnapshot.values },
      killSwitches: { ...runtimeSnapshot.killSwitches },
      sources: {},
      source: "mixed",
      timestamp,
    };

    // Track sources for debugging
    for (const key of Object.keys(runtimeSnapshot.values)) {
      if (merged.sources) {
        merged.sources[key as FeatureFlagKey] = "runtime";
      }
    }

    // Apply local overrides (higher precedence)
    for (const [key, value] of Object.entries(localOverrides.flags)) {
      if (value !== undefined) {
        merged.values[key as FeatureFlagKey] = value;
        if (merged.sources) {
          merged.sources[key as FeatureFlagKey] = "local";
        }
        // Also update kill switches if it's a kill switch
        if (isKillSwitchFlag(key)) {
          merged.killSwitches[key as FeatureFlagKey] = value;
        }
      }
    }

    // Apply query param overrides (highest precedence for dev)
    for (const [key, value] of Object.entries(queryOverrides)) {
      if (value !== undefined) {
        merged.values[key as FeatureFlagKey] = value;
        if (merged.sources) {
          merged.sources[key as FeatureFlagKey] = "query";
        }
        // Also update kill switches if it's a kill switch
        if (isKillSwitchFlag(key)) {
          merged.killSwitches[key as FeatureFlagKey] = value;
        }
      }
    }

    return merged;
  }

  return {
    getSnapshot,
  };
}

/**
 * Default adapter factory for use with the provider.
 * Creates an adapter using runtime flags from config.
 *
 * @param runtimeFlags - Feature flags from runtime config
 * @returns Feature flag adapter
 */
export function createAdapterFromRuntimeConfig(
  runtimeFlags: Record<string, boolean> = {}
): FeatureFlagAdapter {
  return createDefaultAdapter({ runtimeFlags });
}
