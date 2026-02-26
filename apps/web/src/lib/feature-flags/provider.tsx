/**
 * Feature Flags Provider and Hooks
 *
 * Provides feature flag access throughout the React component tree.
 *
 * ## Usage
 *
 * ```tsx
 * // In providers/index.tsx (already wired)
 * <FeatureFlagsProvider>
 *   {children}
 * </FeatureFlagsProvider>
 *
 * // In any component
 * import { useFlag, FeatureFlags } from '@/lib/feature-flags';
 *
 * function MyComponent() {
 *   const isNewDashboard = useFlag(FeatureFlags.NEW_DASHBOARD);
 *   return isNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
 * }
 * ```
 *
 * @module feature-flags/provider
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useConfig } from "@/config";

import { createAdapterFromRuntimeConfig } from "./defaultAdapter";
import { resolveFlag } from "./types";

import type { FeatureFlagKey } from "./flags";
import type { FeatureFlagAdapter, FeatureFlagSnapshot, FeatureFlagSource } from "./types";
import type React from "react";

/**
 * Feature flags context value.
 */
export interface FeatureFlagsContextValue {
  /**
   * Check if a feature flag is enabled.
   * Applies kill switch logic automatically.
   *
   * @param key - Feature flag key
   * @returns True if enabled, false if disabled or killed
   */
  isEnabled: (key: FeatureFlagKey) => boolean;

  /**
   * Get the source of a flag value (for debugging).
   *
   * @param key - Feature flag key
   * @returns Source identifier
   */
  getSource: (key: FeatureFlagKey) => FeatureFlagSource;

  /**
   * Check if a kill switch is active.
   * When a kill switch is active, the corresponding feature is DISABLED.
   *
   * @param key - Feature flag key (not the kill switch key)
   * @returns True if the kill switch is active (feature is killed)
   */
  isKilled: (key: FeatureFlagKey) => boolean;

  /**
   * Current snapshot (for debugging, dev only).
   */
  snapshot: FeatureFlagSnapshot;

  /**
   * Force refresh the snapshot.
   * Useful after updating local overrides.
   */
  refresh: () => void;
}

/**
 * Feature flags React context.
 */
const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

/**
 * Props for FeatureFlagsProvider.
 */
export interface FeatureFlagsProviderProps {
  /**
   * Child components that will have access to feature flags.
   */
  children: React.ReactNode;

  /**
   * Custom adapter for testing or alternative flag sources.
   * If not provided, uses the default adapter with runtime config.
   */
  adapter?: FeatureFlagAdapter;
}

/**
 * Feature Flags Provider.
 *
 * Provides feature flag access to all child components via React Context.
 * @example
 * ```tsx
 * // Typically wired in providers/index.tsx
 * <FeatureFlagsProvider>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export function FeatureFlagsProvider({
  children,
  adapter: customAdapter,
}: FeatureFlagsProviderProps) {
  // Get feature flags from client config (built from env vars)
  const config = useConfig();

  // Create adapter from config flags if not provided
  const adapter = useMemo(
    () => customAdapter ?? createAdapterFromRuntimeConfig(config.features ?? {}),
    [customAdapter, config.features]
  );

  // Store current snapshot in state
  const [snapshot, setSnapshot] = useState<FeatureFlagSnapshot>(() => adapter.getSnapshot());

  // Subscribe to adapter updates if supported
  useEffect(() => {
    if (adapter.subscribe) {
      const unsubscribe = adapter.subscribe(setSnapshot);
      return () => {
        unsubscribe();
      };
    }
  }, [adapter]);

  // Refresh snapshot manually (useful after localStorage changes)
  const refresh = useCallback(() => {
    setSnapshot(adapter.getSnapshot());
  }, [adapter]);

  // Memoize context value
  const value = useMemo<FeatureFlagsContextValue>(() => {
    return {
      isEnabled: (key: FeatureFlagKey) => resolveFlag(snapshot, key),

      getSource: (key: FeatureFlagKey) => {
        return snapshot.sources?.[key] ?? snapshot.source;
      },

      isKilled: (key: FeatureFlagKey) => {
        const killSwitchKey = `kill_${key}` as FeatureFlagKey;
        return snapshot.killSwitches[killSwitchKey] === true;
      },

      snapshot,
      refresh,
    };
  }, [snapshot, refresh]);

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

/**
 * Hook to access feature flags context.
 *
 * Must be used within a FeatureFlagsProvider.
 *
 * @returns Feature flags context value
 * @throws Error if used outside FeatureFlagsProvider
 *
 * @example
 * ```tsx
 * import { useFlags, FeatureFlags } from '@/lib/feature-flags';
 *
 * function MyComponent() {
 *   const { isEnabled, getSource } = useFlags();
 *
 *   if (!isEnabled(FeatureFlags.NEW_DASHBOARD)) {
 *     return <LegacyDashboard />;
 *   }
 *
 *   return <NewDashboard />;
 * }
 * ```
 */
export function useFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);

  if (context === undefined) {
    throw new Error(
      "useFlags must be used within a FeatureFlagsProvider. " +
        "Make sure FeatureFlagsProvider is mounted in your component tree."
    );
  }

  return context;
}

/**
 * Hook to check if a single feature flag is enabled.
 *
 * Convenience hook for the common case of checking one flag.
 * Applies kill switch logic automatically.
 *
 * @param key - Feature flag key to check
 * @returns True if enabled, false if disabled or killed
 *
 * @example
 * ```tsx
 * import { useFlag, FeatureFlags } from '@/lib/feature-flags';
 *
 * function UploadButton() {
 *   const isRiskyUploadEnabled = useFlag(FeatureFlags.RISKY_UPLOAD_FLOW);
 *
 *   if (!isRiskyUploadEnabled) {
 *     return <StandardUpload />;
 *   }
 *
 *   return <RiskyUpload />;
 * }
 * ```
 */
export function useFlag(key: FeatureFlagKey): boolean {
  const { isEnabled } = useFlags();
  return isEnabled(key);
}

/**
 * Hook to check if a kill switch is active.
 *
 * When a kill switch is active, the corresponding feature is forcibly DISABLED.
 *
 * @param key - Feature flag key (not the kill switch key)
 * @returns True if the feature is killed
 *
 * @example
 * ```tsx
 * import { useKillSwitch, FeatureFlags } from '@/lib/feature-flags';
 *
 * function RiskyFeature() {
 *   const isKilled = useKillSwitch(FeatureFlags.RISKY_UPLOAD_FLOW);
 *
 *   if (isKilled) {
 *     return <MaintenanceMessage />;
 *   }
 *
 *   return <RiskyUpload />;
 * }
 * ```
 */
export function useKillSwitch(key: FeatureFlagKey): boolean {
  const { isKilled } = useFlags();
  return isKilled(key);
}
