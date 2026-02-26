/**
 * Config Schema - Typed Configuration Contract
 *
 * Defines the canonical shape of application configuration used throughout Atlas.
 * This schema ensures consistent, type-safe access to configuration regardless
 * of the source (environment variables or runtime config).
 *
 * @module config/schema
 */

import { z } from "zod";

/**
 * Application metadata and base configuration.
 */
const appConfigSchema = z.object({
  /**
   * Application URL (where the frontend is hosted).
   *
   * @example 'https://app.example.com', 'http://localhost:3000'
   */
  url: z.string().url(),

  /**
   * Environment identifier.
   *
   * @example 'development', 'staging', 'production'
   */
  env: z.enum(["development", "staging", "production"]),

  /**
   * Build ID or Git SHA for version tracking.
   *
   * @example 'abc123def', 'v1.2.3'
   */
  buildId: z.string().optional(),
});

/**
 * API client configuration.
 */
const apiConfigSchema = z.object({
  /**
   * Base API URL for client-side and server-side requests.
   * Can be a full URL (for external APIs) or a path (for same-origin).
   *
   * @example 'https://api.example.com', '/api'
   */
  baseUrl: z.string().min(1),
});

/**
 * Sentry error tracking configuration.
 */
const sentryConfigSchema = z.object({
  /**
   * Whether Sentry error tracking is enabled.
   */
  enabled: z.boolean(),

  /**
   * Sentry DSN (Data Source Name).
   * Required when enabled is true.
   *
   * @security Public - will be visible in browser bundles
   * @example 'https://abc123@o123.ingest.sentry.io/456'
   */
  dsn: z.string().url().optional(),

  /**
   * Sentry environment name.
   * Used to tag errors in Sentry for environment-based filtering.
   *
   * @example 'production', 'staging', 'development'
   */
  environment: z.string().optional(),

  /**
   * Sentry release identifier.
   * Used to track which version of code produced an error.
   *
   * @example 'my-app@1.0.0', 'abc123def456' (git SHA)
   */
  release: z.string().optional(),
});

/**
 * Web Vitals telemetry configuration.
 */
const webVitalsConfigSchema = z.object({
  /**
   * Whether Web Vitals reporting is enabled.
   */
  enabled: z.boolean(),

  /**
   * Web Vitals sampling rate (0-1).
   *
   * @default 0.05 (5%) in production
   */
  sampleRate: z.number().min(0).max(1),

  /**
   * Web Vitals reporting endpoint.
   *
   * @default '/api/telemetry/web-vitals'
   */
  endpoint: z.string(),

  /**
   * Enable debug logging for Web Vitals.
   *
   * @default false
   */
  debug: z.boolean(),
});

/**
 * Logging configuration.
 */
const loggingConfigSchema = z.object({
  /**
   * Log level for server-side logging.
   *
   * @default 'info'
   */
  level: z.enum(["debug", "info", "warn", "error"]),
});

/**
 * Authentication/OAuth configuration.
 */
const authConfigSchema = z.object({
  /**
   * Google OAuth Client ID.
   * Required for Google OAuth authentication.
   */
  googleClientId: z.string().optional(),

  /**
   * Google OAuth Client Secret.
   * @security Server-only - never expose to client
   */
  googleClientSecret: z.string().optional(),

  /**
   * Session encryption secret.
   * Must be at least 32 characters.
   * @security Server-only - never expose
   */
  sessionSecret: z.string().optional(),

  /**
   * Session TTL in seconds.
   * @default 604800 (7 days)
   */
  sessionTtlSeconds: z.number().positive(),
});

/**
 * Complete configuration schema for Atlas application.
 *
 * This is the single source of truth for what configuration looks like.
 * All config accessors (server and client) must return this shape.
 */
export const configSchema = z.object({
  /**
   * Application metadata and URLs.
   */
  app: appConfigSchema,

  /**
   * API client configuration.
   */
  api: apiConfigSchema,

  /**
   * Sentry error tracking configuration.
   */
  sentry: sentryConfigSchema,

  /**
   * Web Vitals telemetry configuration.
   */
  webVitals: webVitalsConfigSchema,

  /**
   * Logging configuration (server-side only).
   */
  logging: loggingConfigSchema,

  /**
   * Authentication/OAuth configuration (server-side only).
   */
  auth: authConfigSchema,

  /**
   * Feature flags for runtime behavior control.
   * Each key is a feature name, each value is a boolean toggle.
   *
   * @example { newDashboard: true, betaFeatures: false }
   */
  features: z.record(z.string(), z.boolean()).default({}),
});

/**
 * Inferred TypeScript type for complete configuration.
 * Use this type when working with full config objects.
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Client-safe configuration schema.
 * Excludes server-only fields like logging config and auth secrets.
 */
export const clientConfigSchema = configSchema.omit({
  logging: true,
  auth: true,
});

/**
 * Client-safe configuration type.
 * Safe to expose to browser - no server secrets.
 */
export type ClientConfig = z.infer<typeof clientConfigSchema>;
