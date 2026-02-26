/**
 * Web Vitals Configuration
 *
 * Production-grade configuration for Real User Monitoring (RUM) of Core Web Vitals.
 * This module provides type-safe configuration with environment-based defaults.
 *
 * NOTE: For React components, prefer using the config facade:
 * ```tsx
 * import { useConfig } from '@/config';
 *
 * function MyComponent() {
 *   const config = useConfig();
 *   const { enabled, sampleRate } = config.webVitals;
 *   // ...
 * }
 * ```
 */

/**
 * Environment type for sampling and enablement logic
 */
type Environment = "development" | "staging" | "production" | "test";

/**
 * Web Vitals reporting configuration
 */
export interface WebVitalsConfig {
  /** Whether Web Vitals reporting is enabled */
  enabled: boolean;
  /** Sample rate (0-1). 0.05 = 5% of sessions */
  sampleRate: number;
  /** API endpoint to send vitals data */
  endpoint: string;
  /** Environment identifier */
  environment: Environment;
  /** Application identifier */
  appName: string;
  /** Build version/SHA (optional) */
  buildId?: string;
  /** Debug mode - logs to console instead of/in addition to sending */
  debug: boolean;
}

/**
 * Get default sample rate based on environment
 */
function getDefaultSampleRate(env: Environment): number {
  switch (env) {
    case "production":
      return 0.05; // 5% sampling in production
    case "staging":
      return 0.25; // 25% sampling in staging
    case "development":
      return 0; // Disabled by default in dev
    case "test":
      return 0; // Disabled in tests
    default:
      return 0;
  }
}

/**
 * Get current environment from window location or default
 */
function getCurrentEnvironment(): Environment {
  if (typeof window === "undefined") return "production";

  // Simple hostname-based detection (fallback)
  // In production usage, this should come from runtime config
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }

  if (hostname.includes("staging")) {
    return "staging";
  }

  return "production"; // Safe default
}

/**
 * Get Web Vitals configuration from defaults.
 *
 * NOTE: This provides fallback configuration. For React components,
 * use the config facade instead:
 *
 * ```tsx
 * import { useConfig } from '@/config';
 * const { webVitals } = useConfig();
 * ```
 */
export function getWebVitalsConfig(): WebVitalsConfig {
  const environment = getCurrentEnvironment();
  const defaultSampleRate = getDefaultSampleRate(environment);

  return {
    enabled: environment !== "development" && environment !== "test",
    sampleRate: Math.max(0, Math.min(1, defaultSampleRate)),
    endpoint: "/api/telemetry/web-vitals",
    environment,
    appName: "atlas-web",
    buildId: undefined,
    debug: false,
  };
}

/**
 * Determine if current session should report vitals based on sample rate
 */
export function shouldReportVitals(sampleRate: number): boolean {
  if (sampleRate <= 0) return false;
  if (sampleRate >= 1) return true;

  // Use sessionStorage to ensure consistent sampling for the session
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return false;

  try {
    const stored = sessionStorage.getItem("web-vitals-sampled");
    if (stored !== null) {
      return stored === "true";
    }

    const sampled = Math.random() < sampleRate;
    sessionStorage.setItem("web-vitals-sampled", String(sampled));
    return sampled;
  } catch {
    // sessionStorage not available, fall back to random
    return Math.random() < sampleRate;
  }
}
