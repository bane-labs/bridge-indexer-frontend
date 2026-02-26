/**
 * PostHog Analytics Adapter
 *
 * Implements the Analytics interface for PostHog.
 * Only active when NEXT_PUBLIC_POSTHOG_KEY is configured.
 *
 * @module analytics/adapters/posthog
 *
 * @example
 * ```typescript
 * import { createPostHogAdapter } from "@/lib/analytics/adapters/posthog";
 *
 * const adapter = createPostHogAdapter({
 *   apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
 *   host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
 * });
 * ```
 */

import posthog from "posthog-js";

import type {
  Analytics,
  AnalyticsEventMap,
  AnalyticsEventName,
  PageProps,
  UserTraits,
} from "../types";

/**
 * PostHog adapter configuration.
 */
export interface PostHogAdapterConfig {
  /** PostHog API key (required) */
  apiKey: string;
  /** PostHog host URL (optional, defaults to PostHog cloud) */
  host?: string;
  /** Enable debug mode */
  debug?: boolean;
  /** Initial consent state */
  consentGranted?: boolean;
  /** Capture pageviews automatically */
  capturePageview?: boolean;
  /** Capture pageleave events */
  capturePageleave?: boolean;
}

/**
 * PostHog Analytics Adapter.
 *
 * Wraps the PostHog JS SDK to conform to the Atlas Analytics interface.
 */
class PostHogAdapter implements Analytics {
  private initialized = false;
  private consentGranted: boolean;
  private debug: boolean;

  constructor(private config: PostHogAdapterConfig) {
    this.consentGranted = config.consentGranted ?? false;
    this.debug = config.debug ?? false;
    this.initialize();
  }

  private initialize(): void {
    // SSR guard
    if (typeof window === "undefined") {
      return;
    }

    // Already initialized check
    if (this.initialized) {
      return;
    }

    try {
      posthog.init(this.config.apiKey, {
        api_host: this.config.host ?? "https://us.i.posthog.com",
        // Start with tracking disabled if no consent
        opt_out_capturing_by_default: !this.consentGranted,
        // Disable automatic pageview capture - we handle this manually for consistency
        capture_pageview: this.config.capturePageview ?? false,
        capture_pageleave: this.config.capturePageleave ?? true,
        // Session recording settings (can be enabled via PostHog dashboard)
        disable_session_recording: !this.consentGranted,
        // Respect Do Not Track
        respect_dnt: true,
        // Persistence
        persistence: this.consentGranted ? "localStorage+cookie" : "memory",
        // Debug mode
        debug: this.debug,
        loaded: (ph) => {
          if (this.debug) {
            // eslint-disable-next-line no-console
            console.debug("[analytics:posthog] initialized", ph.get_distinct_id());
          }
        },
      });

      this.initialized = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[analytics:posthog] initialization failed:", error);
    }
  }

  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
    if (!this.initialized || !this.consentGranted) return;

    try {
      posthog.capture(event, props as Record<string, unknown>);
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:posthog] track error:", error);
      }
    }
  }

  page(name?: string, props?: PageProps): void {
    if (!this.initialized || !this.consentGranted) return;

    try {
      posthog.capture("$pageview", {
        $current_url: props?.url ?? window.location.href,
        $pathname: props?.path ?? window.location.pathname,
        $referrer: props?.referrer ?? document.referrer,
        $title: props?.title ?? document.title,
        page_name: name,
        ...props,
      });
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:posthog] page error:", error);
      }
    }
  }

  identify(userId: string, traits?: UserTraits): void {
    if (!this.initialized) return;

    try {
      posthog.identify(userId, traits as Record<string, unknown>);
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:posthog] identify error:", error);
      }
    }
  }

  reset(): void {
    if (!this.initialized) return;

    try {
      posthog.reset();
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:posthog] reset error:", error);
      }
    }
  }

  setConsent(granted: boolean): void {
    this.consentGranted = granted;

    if (!this.initialized) return;

    try {
      if (granted) {
        posthog.opt_in_capturing();
        // Update persistence when consent is granted
        posthog.set_config({ persistence: "localStorage+cookie" });
      } else {
        posthog.opt_out_capturing();
        posthog.set_config({ persistence: "memory" });
      }
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:posthog] setConsent error:", error);
      }
    }
  }

  isEnabled(): boolean {
    return this.initialized && this.consentGranted;
  }
}

/**
 * Create a PostHog analytics adapter.
 *
 * @param config - PostHog configuration
 * @returns Analytics adapter instance
 *
 * @example
 * ```typescript
 * const adapter = createPostHogAdapter({
 *   apiKey: "phc_...",
 *   host: "https://us.posthog.com",
 *   debug: process.env.NODE_ENV === "development",
 * });
 * ```
 */
export function createPostHogAdapter(config: PostHogAdapterConfig): Analytics {
  return new PostHogAdapter(config);
}

/**
 * Check if PostHog is configured via environment variables.
 *
 * Uses a runtime check that's safe for both client and server.
 */
export function isPostHogConfigured(): boolean {
  // SSR guard - return false on server
  if (typeof window === "undefined") {
    return false;
  }

  // Check for env vars at runtime
  // These are inlined by Next.js at build time for NEXT_PUBLIC_ vars
  const apiKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_KEY : undefined;

  return Boolean(apiKey);
}
