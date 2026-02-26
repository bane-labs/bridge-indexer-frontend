/**
 * Web Vitals Collection Module
 *
 * Collects Core Web Vitals (LCP, CLS, INP, FCP, TTFB) using the official
 * web-vitals library and sends them to the backend for RUM analytics.
 *
 * Production-safe with sampling, batching, and privacy protections.
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

import { getWebVitalsConfig, shouldReportVitals } from "./config";
import { initTransport, sendMetric } from "./transport";
import { getNavigationType, sanitizeRoute } from "./types";

import type { MetricName, WebVitalMetric } from "./types";
import type { Metric } from "web-vitals";

/**
 * Web Vitals initialization options
 */
export interface WebVitalsOptions {
  /** Override default configuration */
  config?: {
    enabled?: boolean;
    sampleRate?: number;
    endpoint?: string;
    debug?: boolean;
  };
  /** Callback for each metric (for custom handling) */
  onMetric?: (metric: WebVitalMetric) => void;
}

/**
 * Initialize Web Vitals reporting
 *
 * Call this once on app initialization (client-side only).
 * Automatically handles sampling, batching, and transport.
 *
 * @example
 * ```tsx
 * // In a client component or useEffect
 * initWebVitalsReporting({ debug: true });
 * ```
 */
export function initWebVitalsReporting(options: WebVitalsOptions = {}): void {
  // Only run in browser
  if (typeof window === "undefined") {
    return;
  }

  // Get configuration
  const config = {
    ...getWebVitalsConfig(),
    ...options.config,
  };

  // Check if enabled
  if (!config.enabled) {
    if (config.debug) {
      console.log("[Web Vitals] Reporting disabled via config");
    }
    return;
  }

  // Check sampling
  if (!shouldReportVitals(config.sampleRate)) {
    if (config.debug) {
      console.log(`[Web Vitals] Session not sampled (rate: ${config.sampleRate})`);
    }
    return;
  }

  if (config.debug) {
    console.log("[Web Vitals] Reporting enabled", {
      environment: config.environment,
      sampleRate: config.sampleRate,
      endpoint: config.endpoint,
    });
  }

  // Initialize transport layer
  initTransport({
    endpoint: config.endpoint,
    debug: config.debug,
  });

  // Create metric handler
  const handleMetric = (metric: Metric) => {
    const payload: WebVitalMetric = {
      name: metric.name as MetricName,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      route: sanitizeRoute(window.location.href),
      timestamp: Date.now(),
      environment: config.environment,
      appName: config.appName,
      buildId: config.buildId,
      navigationType: getNavigationType(),
    };

    // Custom callback if provided
    if (options.onMetric) {
      options.onMetric(payload);
    }

    // Send to backend
    sendMetric(payload);
  };

  // Register Core Web Vitals observers
  try {
    onLCP(handleMetric);
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);

    if (config.debug) {
      console.log("[Web Vitals] Observers registered");
    }
  } catch (error) {
    if (config.debug) {
      console.error("[Web Vitals] Failed to register observers:", error);
    }
  }
}

/**
 * Check if Web Vitals reporting is active in current session
 */
export function isReportingActive(): boolean {
  if (typeof window === "undefined") return false;

  const config = getWebVitalsConfig();
  return config.enabled && shouldReportVitals(config.sampleRate);
}
