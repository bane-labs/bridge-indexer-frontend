/**
 * Feature Flags Module
 *
 * Provides runtime feature flag management with support for:
 * - Typed flag keys (no stringly-typed flags)
 * - Runtime flags from config
 * - Local development overrides
 * - Kill switch patterns
 * - Future adapter support (PostHog, etc.)
 *
 * ## Quick Start
 *
 * ```tsx
 * import { useFlag, FeatureFlags } from '@/lib/feature-flags';
 *
 * function MyComponent() {
 *   const isNewDashboard = useFlag(FeatureFlags.NEW_DASHBOARD);
 *   return isNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
 * }
 * ```
 *
 * ## Kill Switch Pattern
 *
 * ```tsx
 * import { FeatureGuard, FeatureFlags } from '@/lib/feature-flags';
 *
 * function RiskyFeature() {
 *   return (
 *     <FeatureGuard
 *       feature={FeatureFlags.RISKY_UPLOAD_FLOW}
 *       fallback={<SafeAlternative />}
 *     >
 *       <RiskyImplementation />
 *     </FeatureGuard>
 *   );
 * }
 * ```
 *
 * @module feature-flags
 * @see {@link file://../../docs/FEATURE_FLAGS.md} for detailed documentation
 */

// ============================================================================
// Flag Contract
// ============================================================================

export type { FeatureFlagKey } from "./flags";
export {
  ALL_FEATURE_FLAGS,
  FeatureFlags,
  getKillSwitchForFlag,
  isKillSwitchFlag,
  isValidFeatureFlag,
} from "./flags";

// ============================================================================
// Types
// ============================================================================

export type {
  FeatureFlagAdapter,
  FeatureFlagAdapterOptions,
  FeatureFlagSnapshot,
  FeatureFlagSource,
  LocalOverrides,
} from "./types";
export { createEmptySnapshot, mergeSnapshots, resolveFlag } from "./types";

// ============================================================================
// Default Adapter
// ============================================================================

export {
  clearLocalOverrides,
  createAdapterFromRuntimeConfig,
  createDefaultAdapter,
  readLocalOverrides,
  readQueryParamOverrides,
  writeLocalOverrides,
} from "./defaultAdapter";

// ============================================================================
// Provider and Hooks
// ============================================================================

export type { FeatureFlagsContextValue, FeatureFlagsProviderProps } from "./provider";
export { FeatureFlagsProvider, useFlag, useFlags, useKillSwitch } from "./provider";

// ============================================================================
// Kill Switch Patterns
// ============================================================================

export type { FeatureGuardProps } from "./killSwitch";
export {
  checkServerFeature,
  createServerGuard,
  FeatureDisabledError,
  FeatureGuard,
} from "./killSwitch";
