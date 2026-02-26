/**
 * Kill Switch Guard Patterns
 *
 * Provides guard components and utilities for implementing kill switches.
 * Kill switches are a safety mechanism to disable risky features instantly.
 *
 * ## CRITICAL: Two-Boundary Rule
 *
 * Risky features MUST be guarded in TWO places:
 * 1. **UI Entry Points** - Hide/disable the feature in the UI
 * 2. **Execution Boundary** - Block the action server-side
 *
 * UI-only hiding is NOT sufficient! Users can bypass UI guards.
 *
 * @module feature-flags/killSwitch
 */

"use client";

import { useFlag, useKillSwitch } from "./provider";

import type { FeatureFlagKey } from "./flags";
import type React from "react";

/**
 * Props for the FeatureGuard component.
 */
export interface FeatureGuardProps {
  /**
   * The feature flag to check.
   */
  feature: FeatureFlagKey;

  /**
   * Content to render when the feature is enabled.
   */
  children: React.ReactNode;

  /**
   * Content to render when the feature is disabled or killed.
   * If not provided, renders nothing.
   */
  fallback?: React.ReactNode;

  /**
   * Content to render specifically when a kill switch is active.
   * Falls back to `fallback` if not provided.
   */
  killedFallback?: React.ReactNode;
}

/**
 * Guard component for feature-flagged content.
 *
 * Renders children only if the feature is enabled AND not killed.
 * Renders fallback when disabled, with optional special treatment for killed features.
 *
 * @example Basic usage
 * ```tsx
 * import { FeatureGuard, FeatureFlags } from '@/lib/feature-flags';
 *
 * function Dashboard() {
 *   return (
 *     <FeatureGuard
 *       feature={FeatureFlags.NEW_DASHBOARD}
 *       fallback={<LegacyDashboard />}
 *     >
 *       <NewDashboard />
 *     </FeatureGuard>
 *   );
 * }
 * ```
 *
 * @example With kill switch handling
 * ```tsx
 * import { FeatureGuard, FeatureFlags } from '@/lib/feature-flags';
 *
 * function RiskyUploadSection() {
 *   return (
 *     <FeatureGuard
 *       feature={FeatureFlags.RISKY_UPLOAD_FLOW}
 *       fallback={<StandardUpload />}
 *       killedFallback={
 *         <Alert variant="warning">
 *           Enhanced upload is temporarily unavailable.
 *         </Alert>
 *       }
 *     >
 *       <RiskyUpload />
 *     </FeatureGuard>
 *   );
 * }
 * ```
 */
export function FeatureGuard({
  feature,
  children,
  fallback = null,
  killedFallback,
}: FeatureGuardProps) {
  const isEnabled = useFlag(feature);
  const isKilled = useKillSwitch(feature);

  // Show killed fallback if feature is killed
  if (isKilled) {
    return <>{killedFallback ?? fallback}</>;
  }

  // Show regular fallback if feature is disabled
  if (!isEnabled) {
    return <>{fallback}</>;
  }

  // Feature is enabled and not killed
  return <>{children}</>;
}

/**
 * Error thrown when a feature is disabled on the server.
 *
 * Use this error in server actions and API routes to enforce feature guards.
 */
export class FeatureDisabledError extends Error {
  public readonly code = "FEATURE_DISABLED";
  public readonly feature: string;
  public readonly isKillSwitch: boolean;

  constructor(feature: string, isKillSwitch = false) {
    super(
      isKillSwitch
        ? `Feature "${feature}" has been disabled by kill switch`
        : `Feature "${feature}" is not enabled`
    );
    this.name = "FeatureDisabledError";
    this.feature = feature;
    this.isKillSwitch = isKillSwitch;
  }

  /**
   * Convert to API-friendly error response.
   */
  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        feature: this.feature,
        isKillSwitch: this.isKillSwitch,
      },
    };
  }
}

// ============================================================================
// Server-Side Guards
// ============================================================================
// These are patterns for server-side code, not actual implementations.
// The actual implementation depends on how you access runtime config on server.

/**
 * Server-side feature flag check.
 *
 * This is a pattern/example for server-side code. Import and use
 * getServerConfig() to read flags, then use this pattern.
 *
 * @example In a Server Action
 * ```tsx
 * // In your server action file
 * "use server";
 *
 * import { getServerConfig } from "@/config/server";
 * import { FeatureFlags, assertFeatureEnabled } from "@/lib/feature-flags";
 *
 * export async function riskyUploadAction(formData: FormData) {
 *   const config = getServerConfig();
 *
 *   // Check kill switch first (convention: kill_<feature> = true means killed)
 *   const isKilled = config.features[`kill_${FeatureFlags.RISKY_UPLOAD_FLOW}`] === true;
 *   const isEnabled = config.features[FeatureFlags.RISKY_UPLOAD_FLOW] === true;
 *
 *   if (isKilled) {
 *     throw new FeatureDisabledError(FeatureFlags.RISKY_UPLOAD_FLOW, true);
 *   }
 *
 *   if (!isEnabled) {
 *     throw new FeatureDisabledError(FeatureFlags.RISKY_UPLOAD_FLOW, false);
 *   }
 *
 *   // Feature is enabled, proceed with risky upload
 *   return await processRiskyUpload(formData);
 * }
 * ```
 *
 * @example In an API Route
 * ```tsx
 * // In app/api/risky-upload/route.ts
 * import { NextResponse } from "next/server";
 * import { getServerConfig } from "@/config/server";
 * import { FeatureFlags, FeatureDisabledError } from "@/lib/feature-flags";
 *
 * export async function POST(request: Request) {
 *   const config = getServerConfig();
 *
 *   // Check feature is enabled and not killed
 *   const killKey = `kill_${FeatureFlags.RISKY_UPLOAD_FLOW}`;
 *   const isKilled = config.features[killKey] === true;
 *   const isEnabled = config.features[FeatureFlags.RISKY_UPLOAD_FLOW] === true;
 *
 *   if (isKilled || !isEnabled) {
 *     return NextResponse.json(
 *       new FeatureDisabledError(FeatureFlags.RISKY_UPLOAD_FLOW, isKilled).toResponse(),
 *       { status: 403 }
 *     );
 *   }
 *
 *   // Process request...
 * }
 * ```
 */

/**
 * Create a server-side feature guard function.
 *
 * This is a factory pattern for creating reusable guards.
 *
 * @param getFeatures - Function that returns the features record
 * @returns Guard function
 *
 * @example
 * ```tsx
 * // In lib/feature-flags/server.ts
 * import { getServerConfig } from "@/config/server";
 * import { createServerGuard } from "@/lib/feature-flags";
 *
 * export const assertFeature = createServerGuard(() => getServerConfig().features);
 *
 * // Usage in server action:
 * assertFeature(FeatureFlags.RISKY_UPLOAD_FLOW);
 * ```
 */
export function createServerGuard(getFeatures: () => Record<string, boolean>) {
  return function assertFeatureEnabled(key: FeatureFlagKey): void {
    const features = getFeatures();

    // Check kill switch (convention: kill_<feature> = true means killed)
    const killKey = `kill_${key}`;
    const isKilled = features[killKey] === true;

    if (isKilled) {
      throw new FeatureDisabledError(key, true);
    }

    // Check feature is enabled
    const isEnabled = features[key] === true;

    if (!isEnabled) {
      throw new FeatureDisabledError(key, false);
    }
  };
}

/**
 * Check if a feature is enabled on the server (non-throwing version).
 *
 * @param features - Features record from config
 * @param key - Feature flag key
 * @returns Object with enabled and killed status
 */
export function checkServerFeature(
  features: Record<string, boolean>,
  key: FeatureFlagKey
): { enabled: boolean; killed: boolean } {
  const killKey = `kill_${key}`;
  const killed = features[killKey] === true;
  const enabled = !killed && features[key] === true;

  return { enabled, killed };
}
