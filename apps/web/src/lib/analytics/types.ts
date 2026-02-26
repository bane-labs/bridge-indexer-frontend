/**
 * Analytics Types - Vendor-Agnostic Analytics Interface
 *
 * This module defines the core analytics types and interfaces.
 * All analytics implementations must conform to these interfaces.
 *
 * @module analytics/types
 */

/**
 * Common properties automatically attached to all analytics events.
 * These provide context for every tracked event.
 */
export interface CommonEventProps {
  /** Application name (always "atlas") */
  app: "atlas";
  /** Current environment */
  env: "development" | "staging" | "production";
  /** Request correlation ID for distributed tracing */
  correlationId?: string;
  /** Event timestamp (Unix ms) */
  timestamp?: number;
}

/**
 * Typed event taxonomy for Atlas.
 *
 * Add new events here to ensure type-safety throughout the application.
 * Each event key maps to its required properties.
 *
 * @example Adding a new event
 * ```typescript
 * // In types.ts, add to AnalyticsEventMap:
 * "checkout.completed": { orderId: string; total: number };
 *
 * // Usage becomes type-safe:
 * analytics.track("checkout.completed", { orderId: "123", total: 99.99 });
 * ```
 */
export interface AnalyticsEventMap {
  // Authentication events
  "auth.login": { method: "google" | "email" | "github" | "sso" };
  "auth.logout": Record<string, never>;
  "auth.signup": { method: "google" | "email" | "github" | "sso" };

  // Navigation events
  "nav.click": { target: string; location?: string };
  "nav.page_view": { path: string; referrer?: string };

  // Feature usage events
  "feature.used": { feature: string; metadata?: Record<string, unknown> };
  "feature.enabled": { feature: string };
  "feature.disabled": { feature: string };

  // UI interaction events
  "ui.button_click": { buttonId: string; label?: string };
  "ui.form_submit": { formId: string; success: boolean };
  "ui.modal_open": { modalId: string };
  "ui.modal_close": { modalId: string };

  // Error events
  "error.boundary": { componentStack?: string; error: string };
  "error.api": { endpoint: string; statusCode: number; message?: string };

  // Performance events
  "perf.web_vital": {
    metric: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
  };

  // Search events
  "search.query": { query: string; resultsCount: number };
  "search.result_click": { query: string; resultIndex: number; resultId: string };

  // Generic custom event (escape hatch for one-off events)
  "custom.event": { name: string; data?: Record<string, unknown> };
}

/**
 * All valid event names from the typed event map.
 */
export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * Properties for a specific event, including common props.
 */
export type AnalyticsEventProps<E extends AnalyticsEventName> = AnalyticsEventMap[E] &
  Partial<CommonEventProps>;

/**
 * User traits for identification.
 */
export interface UserTraits {
  email?: string;
  name?: string;
  avatar?: string;
  plan?: string;
  company?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Page properties for page view tracking.
 */
export interface PageProps {
  path?: string;
  referrer?: string;
  title?: string;
  url?: string;
  search?: string;
  [key: string]: unknown;
}

/**
 * Core Analytics interface.
 *
 * All analytics adapters must implement this interface.
 * This ensures consistent API across PostHog, GA, and any future providers.
 */
export interface Analytics {
  /**
   * Track a typed event.
   *
   * @param event - Event name from AnalyticsEventMap
   * @param props - Event properties (type-checked per event)
   *
   * @example
   * ```typescript
   * analytics.track("auth.login", { method: "google" });
   * analytics.track("feature.used", { feature: "dark-mode" });
   * ```
   */
  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void;

  /**
   * Track a page view.
   *
   * @param name - Optional page name
   * @param props - Optional page properties
   *
   * @example
   * ```typescript
   * analytics.page("Dashboard");
   * analytics.page("Settings", { section: "profile" });
   * ```
   */
  page(name?: string, props?: PageProps): void;

  /**
   * Identify a user.
   *
   * @param userId - Unique user identifier
   * @param traits - Optional user traits/properties
   *
   * @example
   * ```typescript
   * analytics.identify("user_123", { email: "user@example.com", plan: "pro" });
   * ```
   */
  identify(userId: string, traits?: UserTraits): void;

  /**
   * Reset analytics state (e.g., on logout).
   * Clears user identity and any stored data.
   */
  reset(): void;

  /**
   * Set consent state for tracking.
   *
   * @param granted - Whether user has granted consent
   *
   * @example
   * ```typescript
   * // User accepts cookies
   * analytics.setConsent(true);
   *
   * // User declines cookies
   * analytics.setConsent(false);
   * ```
   */
  setConsent(granted: boolean): void;

  /**
   * Check if analytics is currently enabled.
   */
  isEnabled(): boolean;
}

/**
 * Analytics adapter configuration.
 */
export interface AnalyticsConfig {
  /** Whether analytics is enabled */
  enabled?: boolean;
  /** Whether to log events to console (development) */
  debug?: boolean;
  /** Initial consent state */
  consentGranted?: boolean;
  /** Application environment */
  environment?: "development" | "staging" | "production";
}
