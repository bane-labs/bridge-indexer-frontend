/**
 * Web Vitals Payload Types
 *
 * Type-safe payload structures for Web Vitals telemetry.
 * Ensures privacy-conscious data collection with no PII.
 */

/**
 * Core Web Vitals metric names
 */
export type MetricName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

/**
 * Web Vitals rating categories
 */
export type MetricRating = "good" | "needs-improvement" | "poor";

/**
 * Sanitized pathname (no query params, no fragments)
 */
export type SanitizedRoute = string;

/**
 * Web Vitals metric payload sent to backend
 */
export interface WebVitalMetric {
  /** Metric name (LCP, CLS, INP, FCP, TTFB, FID) */
  name: MetricName;
  /** Metric value in milliseconds or score */
  value: number;
  /** Web Vitals rating (good/needs-improvement/poor) */
  rating?: MetricRating;
  /** Delta from previous value (if available) */
  delta?: number;
  /** Unique metric ID from web-vitals library */
  id: string;
  /** Sanitized page route (pathname only, no query params) */
  route: SanitizedRoute;
  /** Timestamp when metric was captured (Unix ms) */
  timestamp: number;
  /** Environment (dev/staging/production) */
  environment: string;
  /** Application identifier */
  appName: string;
  /** Build version/SHA (optional) */
  buildId?: string;
  /** Navigation type (navigate, reload, back_forward, prerender) */
  navigationType?: string;
}

/**
 * Batched metrics payload
 */
export interface WebVitalsBatch {
  /** Array of metrics in this batch */
  metrics: WebVitalMetric[];
  /** Session ID (generated, not tied to user identity) */
  sessionId: string;
  /** User agent hint (optional, minimal) */
  userAgent?: string;
}

/**
 * Sanitize URL pathname - remove query params and fragments
 */
export function sanitizeRoute(url: string): SanitizedRoute {
  if (typeof window === "undefined") return "/unknown";

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname;
  } catch {
    // Fallback for invalid URLs
    return "/unknown";
  }
}

/**
 * Get navigation type from Performance API
 */
export function getNavigationType(): string | undefined {
  if (typeof window === "undefined" || typeof performance === "undefined") return undefined;

  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    return nav?.type || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Generate a session ID for this browser session
 * Not tied to user identity, just for grouping metrics
 */
export function getSessionId(): string {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  try {
    let sessionId = sessionStorage.getItem("web-vitals-session-id");
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem("web-vitals-session-id", sessionId);
    }
    return sessionId;
  } catch {
    // sessionStorage not available
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * Get minimal user agent hint (browser name only, no version details)
 * This is privacy-conscious and doesn't leak detailed device info
 */
export function getUserAgentHint(): string | undefined {
  if (typeof window === "undefined" || typeof navigator === "undefined") return undefined;

  try {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("firefox")) return "firefox";
    if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
    if (ua.includes("chrome")) return "chrome";
    if (ua.includes("edge")) return "edge";
    return "other";
  } catch {
    return undefined;
  }
}
