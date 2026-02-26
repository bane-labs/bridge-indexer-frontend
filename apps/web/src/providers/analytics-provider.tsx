/**
 * Analytics Provider
 *
 * Initializes and configures analytics adapters based on environment variables.
 * Handles the wiring of PostHog, GA, and any future analytics providers.
 *
 * @module providers/analytics-provider
 */

"use client";

import { useEffect, useRef } from "react";

import { initAnalytics } from "@/lib/analytics";
import { createGAAdapter, GAScript } from "@/lib/analytics/adapters/ga";
import { createPostHogAdapter } from "@/lib/analytics/adapters/posthog";

import type { Analytics, CommonEventProps } from "@/lib/analytics";

/**
 * Analytics configuration from environment.
 *
 * These values are read at runtime from NEXT_PUBLIC_* env vars.
 */
interface AnalyticsConfig {
  posthog?: {
    apiKey: string;
    host?: string;
  };
  ga?: {
    measurementId: string;
  };
  debug: boolean;
  environment: CommonEventProps["env"];
}

/**
 * Get analytics configuration from environment.
 *
 * Safely reads env vars at runtime (client-side only).
 */
function getAnalyticsConfig(): AnalyticsConfig {
  // Default to development
  let environment: CommonEventProps["env"] = "development";

  // Try to detect environment
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  if (appEnv === "production" || appEnv === "staging" || appEnv === "development") {
    environment = appEnv;
  } else if (process.env.NODE_ENV === "production") {
    environment = "production";
  }

  const config: AnalyticsConfig = {
    debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
    environment,
  };

  // PostHog configuration
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey) {
    config.posthog = {
      apiKey: posthogKey,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    };
  }

  // GA configuration
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaMeasurementId) {
    config.ga = {
      measurementId: gaMeasurementId,
    };
  }

  return config;
}

/**
 * Props for the AnalyticsProvider component.
 */
interface AnalyticsProviderProps {
  children: React.ReactNode;
  /**
   * Initial consent state.
   * Set to true if user has already granted consent (e.g., from cookie).
   * @default false
   */
  consentGranted?: boolean;
  /**
   * CSP nonce for inline scripts.
   * Passed from server component to ensure CSP compliance.
   */
  nonce?: string;
}

/**
 * Analytics Provider Component.
 *
 * Initializes analytics adapters based on environment configuration.
 * Should be placed high in the component tree (e.g., in MainProvider).
 *
 * @example
 * ```tsx
 * import { AnalyticsProvider } from "@/providers/analytics-provider";
 *
 * export function MainProvider({ children }) {
 *   return (
 *     <AnalyticsProvider>
 *       {children}
 *     </AnalyticsProvider>
 *   );
 * }
 * ```
 */
export function AnalyticsProvider({
  children,
  consentGranted = false,
  nonce,
}: AnalyticsProviderProps) {
  const initialized = useRef(false);
  const config = getAnalyticsConfig();

  useEffect(() => {
    // Ensure we only initialize once
    if (initialized.current) return;
    initialized.current = true;

    const adapters: Analytics[] = [];

    // Initialize PostHog adapter if configured
    if (config.posthog) {
      const posthogAdapter = createPostHogAdapter({
        apiKey: config.posthog.apiKey,
        host: config.posthog.host,
        debug: config.debug,
        consentGranted,
      });
      adapters.push(posthogAdapter);

      if (config.debug) {
        // eslint-disable-next-line no-console
        console.debug("[analytics] PostHog adapter configured");
      }
    }

    // Initialize GA adapter if configured
    if (config.ga) {
      const gaAdapter = createGAAdapter({
        measurementId: config.ga.measurementId,
        debug: config.debug,
        consentGranted,
      });
      adapters.push(gaAdapter);

      if (config.debug) {
        // eslint-disable-next-line no-console
        console.debug("[analytics] GA adapter configured");
      }
    }

    // Initialize the analytics system
    initAnalytics(adapters, {
      debug: config.debug,
      environment: config.environment,
      consentGranted,
    });

    if (config.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics] Initialized with", adapters.length, "adapter(s)");
    }
  }, [config.debug, config.posthog, config.ga, config.environment, consentGranted]);

  return (
    <>
      {/* Inject GA script if configured */}
      {config.ga && (
        <GAScript measurementId={config.ga.measurementId} debug={config.debug} nonce={nonce} />
      )}
      {children}
    </>
  );
}
