/**
 * Analytics Core - Vendor-Agnostic Analytics API
 *
 * This module provides the main analytics singleton and initialization logic.
 * Application code should ONLY import from this module, never from adapters directly.
 *
 * @module analytics
 *
 * @example Basic usage
 * ```typescript
 * import { analytics } from "@/lib/analytics";
 *
 * // Track events (type-safe)
 * analytics.track("auth.login", { method: "google" });
 * analytics.track("feature.used", { feature: "dark-mode" });
 *
 * // Page views
 * analytics.page("Dashboard");
 *
 * // User identification
 * analytics.identify("user_123", { email: "user@example.com" });
 *
 * // Consent management
 * analytics.setConsent(true);
 * ```
 *
 * @example Provider initialization (in providers/index.tsx)
 * ```typescript
 * import { initAnalytics } from "@/lib/analytics";
 * import { createPostHogAdapter } from "@/lib/analytics/adapters/posthog";
 *
 * useEffect(() => {
 *   const adapters = [];
 *   if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
 *     adapters.push(createPostHogAdapter());
 *   }
 *   initAnalytics(adapters);
 * }, []);
 * ```
 */

import { generateCorrelationId } from "@/lib/api/correlation";

import { NoopAnalytics } from "./noop";

import type {
  Analytics,
  AnalyticsConfig,
  AnalyticsEventMap,
  AnalyticsEventName,
  CommonEventProps,
  PageProps,
  UserTraits,
} from "./types";

// Global analytics state
let currentAnalytics: Analytics = new NoopAnalytics();
let isInitialized = false;
let currentEnvironment: CommonEventProps["env"] = "development";
let currentCorrelationId: string | undefined;

/**
 * Get the current environment from various sources.
 */
function detectEnvironment(): CommonEventProps["env"] {
  // SSR-safe check
  if (typeof window === "undefined") {
    return "development";
  }

  // Try to get from runtime config or env
  // This is set during provider initialization
  return currentEnvironment;
}

/**
 * Get common properties to attach to all events.
 */
function getCommonProps(): CommonEventProps {
  return {
    app: "atlas",
    env: detectEnvironment(),
    correlationId: currentCorrelationId ?? generateCorrelationId(),
    timestamp: Date.now(),
  };
}

/**
 * MultiAnalytics - Fans out events to multiple analytics adapters.
 *
 * Used when multiple providers (e.g., PostHog + GA) are configured.
 */
class MultiAnalytics implements Analytics {
  private adapters: Analytics[];
  private debug: boolean;
  private enabled: boolean;
  private consentGranted: boolean;

  constructor(adapters: Analytics[], config: AnalyticsConfig = {}) {
    this.adapters = adapters;
    this.debug = config.debug ?? false;
    this.enabled = config.enabled ?? true;
    this.consentGranted = config.consentGranted ?? false;
  }

  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
    if (!this.enabled || !this.consentGranted) return;

    const enrichedProps = { ...props, ...getCommonProps() };

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics] track", event, enrichedProps);
    }

    for (const adapter of this.adapters) {
      try {
        adapter.track(event, enrichedProps);
      } catch (error) {
        // Silently fail - analytics should never break the app
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.error("[analytics] adapter error:", error);
        }
      }
    }
  }

  page(name?: string, props?: PageProps): void {
    if (!this.enabled || !this.consentGranted) return;

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics] page", name, props);
    }

    for (const adapter of this.adapters) {
      try {
        adapter.page(name, props);
      } catch (error) {
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.error("[analytics] adapter error:", error);
        }
      }
    }
  }

  identify(userId: string, traits?: UserTraits): void {
    if (!this.enabled) return;

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics] identify", userId, traits);
    }

    for (const adapter of this.adapters) {
      try {
        adapter.identify(userId, traits);
      } catch (error) {
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.error("[analytics] adapter error:", error);
        }
      }
    }
  }

  reset(): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics] reset");
    }

    for (const adapter of this.adapters) {
      try {
        adapter.reset();
      } catch (error) {
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.error("[analytics] adapter error:", error);
        }
      }
    }
  }

  setConsent(granted: boolean): void {
    this.consentGranted = granted;

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics] setConsent", granted);
    }

    for (const adapter of this.adapters) {
      try {
        adapter.setConsent(granted);
      } catch (error) {
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.error("[analytics] adapter error:", error);
        }
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.consentGranted;
  }
}

/**
 * Initialize the analytics system with configured adapters.
 *
 * Call this once during app initialization (e.g., in MainProvider).
 * Subsequent calls are no-ops to ensure idempotency.
 *
 * @param adapters - Array of analytics adapters to use
 * @param config - Optional configuration
 *
 * @example
 * ```typescript
 * import { initAnalytics } from "@/lib/analytics";
 * import { createPostHogAdapter } from "@/lib/analytics/adapters/posthog";
 * import { createGAAdapter } from "@/lib/analytics/adapters/ga";
 *
 * const adapters = [];
 *
 * if (posthogConfigured) {
 *   adapters.push(createPostHogAdapter({ apiKey: "...", host: "..." }));
 * }
 *
 * if (gaConfigured) {
 *   adapters.push(createGAAdapter({ measurementId: "G-..." }));
 * }
 *
 * initAnalytics(adapters, { debug: true, environment: "production" });
 * ```
 */
export function initAnalytics(
  adapters: Analytics[],
  config: AnalyticsConfig & { environment?: CommonEventProps["env"]; correlationId?: string } = {}
): void {
  // Idempotent - only initialize once
  if (isInitialized) {
    return;
  }

  // Set environment
  if (config.environment) {
    currentEnvironment = config.environment;
  }

  // Set correlation ID if provided
  if (config.correlationId) {
    currentCorrelationId = config.correlationId;
  }

  // Create appropriate analytics instance
  if (adapters.length === 0) {
    currentAnalytics = new NoopAnalytics({ debug: config.debug });
  } else if (adapters.length === 1 && adapters[0]) {
    currentAnalytics = adapters[0];
  } else {
    currentAnalytics = new MultiAnalytics(adapters, config);
  }

  isInitialized = true;

  if (config.debug) {
    // eslint-disable-next-line no-console
    console.debug("[analytics] initialized with", adapters.length, "adapter(s)");
  }
}

/**
 * Reset analytics initialization (primarily for testing).
 */
export function resetAnalytics(): void {
  currentAnalytics = new NoopAnalytics();
  isInitialized = false;
  currentCorrelationId = undefined;
}

/**
 * Set the correlation ID for subsequent events.
 *
 * @param correlationId - The correlation ID to attach to events
 */
export function setCorrelationId(correlationId: string): void {
  currentCorrelationId = correlationId;
}

/**
 * The main analytics singleton.
 *
 * This is safe to import and use anywhere in the application.
 * Before initialization, all methods are no-ops.
 *
 * @example
 * ```typescript
 * import { analytics } from "@/lib/analytics";
 *
 * // Always safe to call - noop if not initialized
 * analytics.track("auth.login", { method: "email" });
 * ```
 */
export const analytics: Analytics = {
  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
    // SSR guard
    if (typeof window === "undefined") return;
    currentAnalytics.track(event, props);
  },

  page(name?: string, props?: PageProps): void {
    if (typeof window === "undefined") return;
    currentAnalytics.page(name, props);
  },

  identify(userId: string, traits?: UserTraits): void {
    if (typeof window === "undefined") return;
    currentAnalytics.identify(userId, traits);
  },

  reset(): void {
    if (typeof window === "undefined") return;
    currentAnalytics.reset();
  },

  setConsent(granted: boolean): void {
    if (typeof window === "undefined") return;
    currentAnalytics.setConsent(granted);
  },

  isEnabled(): boolean {
    if (typeof window === "undefined") return false;
    return currentAnalytics.isEnabled();
  },
};

// Re-export types for convenience
export type {
  Analytics,
  AnalyticsConfig,
  AnalyticsEventMap,
  AnalyticsEventName,
  CommonEventProps,
  PageProps,
  UserTraits,
} from "./types";
