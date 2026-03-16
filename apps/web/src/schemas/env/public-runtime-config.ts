/**
 * Client-side environment variables schema.
 *
 * Defines validation rules for public NEXT_PUBLIC_* variables
 * that are safe to expose to the browser.
 */

import { z } from "zod";

/**
 * Zod schema for validating public client-side environment variables.
 *
 * All variables defined here will be bundled into the client-side JavaScript
 * and visible to users. Only include non-sensitive configuration.
 */
export const ClientEnvSchema = {
  /**
   * Base API URL for client-side requests.
   * Can be a full URL (for external APIs) or a path (for same-origin routes).
   *
   * @example 'https://api.example.com', '/api'
   */
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1)
    .default("https://banelabs-bridge-indexer-backend.app.mf.axlabs.net/"),

  /**
   * Application URL (where the frontend is hosted).
   * Used for redirects, OAuth callbacks, and link generation.
   *
   * @example 'https://app.example.com', 'http://localhost:3000'
   */
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  /**
   * Environment identifier for telemetry and feature flags.
   *
   * @example 'development', 'staging', 'production'
   */
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).optional(),

  /**
   * Build ID or Git SHA for version tracking.
   *
   * @example 'abc123def', 'v1.2.3'
   */
  NEXT_PUBLIC_BUILD_ID: z.string().optional(),

  /**
   * Enable/disable Web Vitals reporting.
   *
   * @default Enabled in production/staging, disabled in development
   */
  NEXT_PUBLIC_WEB_VITALS_ENABLED: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  /**
   * Web Vitals sampling rate (0-1).
   *
   * @default 0.05 (5%) in production, 0.25 (25%) in staging
   */
  NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE: z
    .string()
    .regex(/^(0|1|0\.\d+)$/)
    .transform(Number)
    .optional(),

  /**
   * Web Vitals endpoint override.
   *
   * @default '/api/telemetry/web-vitals'
   */
  NEXT_PUBLIC_WEB_VITALS_ENDPOINT: z.string().optional(),

  /**
   * Enable debug logging for Web Vitals.
   *
   * @default false
   */
  NEXT_PUBLIC_WEB_VITALS_DEBUG: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  /**
   * Sentry DSN for client-side error tracking.
   * Optional - when not provided, Sentry is disabled gracefully.
   *
   * @security Public - will be visible in browser bundles
   * @example 'https://abc123@o123.ingest.sentry.io/456'
   */
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  /**
   * Sentry environment name.
   * Falls back to NODE_ENV if not specified.
   *
   * @example 'production' | 'staging' | 'development'
   */
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),

  /**
   * Sentry release identifier.
   * Used to track which version of code produced an error.
   *
   * @example 'my-app@1.0.0' | 'abc123def456' (git SHA)
   */
  NEXT_PUBLIC_SENTRY_RELEASE: z.string().optional(),

  /**
   * Enable Sentry in development mode.
   * By default, Sentry is disabled in development even if DSN is set.
   *
   * @default undefined (disabled)
   * @example 'true'
   */
  NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // Analytics Configuration
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * PostHog API key for analytics.
   * When provided, PostHog analytics is enabled.
   *
   * @example 'phc_xxxxxxxxxxxxx'
   * @see docs/analytics.md
   */
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),

  /**
   * PostHog API host URL.
   * Defaults to PostHog cloud (https://us.i.posthog.com).
   *
   * @example 'https://us.i.posthog.com', 'https://eu.posthog.com'
   */
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  /**
   * Google Analytics 4 Measurement ID.
   * When provided, GA4 analytics is enabled.
   *
   * @example 'G-XXXXXXXXXX'
   * @see docs/analytics.md
   */
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  /**
   * Enable analytics debug mode.
   * When enabled, analytics events are logged to console.
   *
   * @default false
   */
  NEXT_PUBLIC_ANALYTICS_DEBUG: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
};
