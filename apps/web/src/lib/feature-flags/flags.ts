/**
 * Feature Flags Contract
 *
 * Defines all known feature flags as strongly-typed constants.
 * This ensures type safety and prevents stringly-typed flag references.
 *
 * ## Adding a New Flag
 *
 * 1. Add the flag key to FeatureFlags object below
 * 2. Add runtime default in config/server.ts features object
 * 3. Use: useFlag(FeatureFlags.YOUR_FLAG_NAME)
 *
 * ## Naming Conventions
 *
 * - Use SCREAMING_SNAKE_CASE for constant keys
 * - Use descriptive names that indicate the feature
 * - Prefix kill switches with "KILL_" for clarity
 *
 * @module feature-flags/flags
 */

/**
 * All known feature flags in the application.
 *
 * Reference these constants instead of raw strings to get:
 * - Type safety and autocompletion
 * - Compile-time errors if flag names change
 * - Easy refactoring across the codebase
 *
 * @example
 * ```tsx
 * import { FeatureFlags } from '@/lib/feature-flags';
 *
 * // ✅ Correct - type-safe
 * const isEnabled = useFlag(FeatureFlags.NEW_DASHBOARD);
 *
 * // ❌ Wrong - stringly-typed, no type safety
 * const isEnabled = useFlag('new_dashboard');
 * ```
 */
export const FeatureFlags = {
  /**
   * New dashboard UI experience.
   * When enabled, users see the redesigned dashboard.
   */
  NEW_DASHBOARD: "new_dashboard",

  /**
   * Beta features access.
   * Enables experimental features for beta testers.
   */
  BETA_FEATURES: "beta_features",

  /**
   * New upload flow with enhanced capabilities.
   * This is a risky feature that should be guarded with kill switch.
   */
  RISKY_UPLOAD_FLOW: "risky_upload_flow",

  /**
   * Kill switch for risky upload flow.
   * When true, the risky upload flow is forcibly DISABLED regardless of other flags.
   * Kill switches take highest precedence.
   */
  KILL_RISKY_UPLOAD_FLOW: "kill_risky_upload_flow",

  /**
   * Enhanced analytics tracking.
   * When enabled, sends additional analytics events.
   */
  ENHANCED_ANALYTICS: "enhanced_analytics",

  /**
   * Demo: New table UI.
   * When enabled, shows the new table design in demos.
   */
  DEMO_NEW_TABLE: "demo_new_table",

  /**
   * Demo: Dangerous action feature.
   * This is a demo feature to show kill switch patterns.
   */
  DEMO_DANGEROUS_ACTION: "demo_dangerous_action",

  /**
   * Kill switch for demo dangerous action.
   * When true, the dangerous action is forcibly DISABLED.
   */
  KILL_DEMO_DANGEROUS_ACTION: "kill_demo_dangerous_action",
} as const;

/**
 * Union type of all valid feature flag keys.
 *
 * Use this type for function parameters that accept flag names.
 *
 * @example
 * ```tsx
 * function isFeatureEnabled(flag: FeatureFlagKey): boolean {
 *   // Implementation
 * }
 * ```
 */
export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

/**
 * Array of all feature flag keys.
 * Useful for iteration, validation, and debugging.
 */
export const ALL_FEATURE_FLAGS = Object.values(FeatureFlags);

/**
 * Check if a string is a valid feature flag key.
 *
 * @param key - String to validate
 * @returns True if the key is a valid FeatureFlagKey
 *
 * @example
 * ```tsx
 * if (isValidFeatureFlag(userInput)) {
 *   // userInput is now typed as FeatureFlagKey
 * }
 * ```
 */
export function isValidFeatureFlag(key: string): key is FeatureFlagKey {
  return ALL_FEATURE_FLAGS.includes(key as FeatureFlagKey);
}

/**
 * Check if a flag key is a kill switch.
 * Kill switches are prefixed with "kill_".
 *
 * @param key - Feature flag key to check
 * @returns True if the flag is a kill switch
 */
export function isKillSwitchFlag(key: string): boolean {
  return key.startsWith("kill_");
}

/**
 * Get the kill switch key for a given feature flag.
 * Returns undefined if no kill switch exists.
 *
 * @param key - Feature flag key
 * @returns The kill switch key, or undefined
 *
 * @example
 * ```tsx
 * getKillSwitchForFlag('risky_upload_flow')
 * // => 'kill_risky_upload_flow'
 * ```
 */
export function getKillSwitchForFlag(key: FeatureFlagKey): FeatureFlagKey | undefined {
  const killSwitchKey = `kill_${key}` as FeatureFlagKey;
  return isValidFeatureFlag(killSwitchKey) ? killSwitchKey : undefined;
}
