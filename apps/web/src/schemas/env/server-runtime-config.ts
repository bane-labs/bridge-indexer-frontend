/**
 * Server-only environment variables schema.
 *
 * Defines validation rules for sensitive server-side variables
 * that should never be exposed to the client.
 */

import { z } from "zod";

/**
 * Zod schema for validating server-only environment variables.
 *
 * These values are pulled from process.env and validated on app startup.
 * They are kept strictly on the server side and never exposed to the client.
 */
export const ServerEnvSchema = {
  /**
   * Node environment for server-side logic.
   * Determines application behavior and security settings.
   *
   * @default 'development'
   * @example 'production' | 'development' | 'test'
   */
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /**
   * Logging level for server-side logs.
   * Controls verbosity of pino logger output.
   *
   * @default 'info'
   * @example 'debug' | 'info' | 'warn' | 'error'
   */
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  /**
   * Server-side API base URL.
   * Optional - used when server needs to make API calls to itself.
   *
   * @example 'http://localhost:3001/api' | 'https://api.example.com'
   */
  API_BASE_URL: z.string().url().optional(),

  /**
   * Database connection URL.
   * Used to connect to your database (PostgreSQL, MySQL, etc.)
   *
   * @security Keep this secret secure - never expose to client
   * @example 'postgresql://user:password@localhost:5432/dbname'
   */
  DATABASE_URL: z.string().url().optional(),

  /**
   * Sentry DSN for server-side error tracking.
   * Optional - when not provided, Sentry is disabled gracefully.
   *
   * @security Server-only - do not expose to client
   * @example 'https://abc123@o123.ingest.sentry.io/456'
   */
  SENTRY_DSN: z.string().url().optional(),

  /**
   * Sentry environment name.
   * Falls back to NODE_ENV if not specified.
   *
   * @example 'production' | 'staging' | 'development'
   */
  SENTRY_ENVIRONMENT: z.string().optional(),

  /**
   * Sentry release identifier.
   * Used to track which version of code produced an error.
   *
   * @example 'my-app@1.0.0' | 'abc123def456' (git SHA)
   */
  SENTRY_RELEASE: z.string().optional(),

  /**
   * Sentry auth token for uploading sourcemaps.
   * Only needed for CI/CD builds that upload sourcemaps.
   *
   * @security Keep this secret secure - CI/CD only
   */
  SENTRY_AUTH_TOKEN: z.string().optional(),

  /**
   * Sentry organization slug.
   * Only needed for CI/CD builds that upload sourcemaps.
   *
   * @example 'my-company'
   */
  SENTRY_ORG: z.string().optional(),

  /**
   * Sentry project slug.
   * Only needed for CI/CD builds that upload sourcemaps.
   *
   * @example 'my-project'
   */
  SENTRY_PROJECT: z.string().optional(),

  /**
   * Enable Sentry in development mode.
   * By default, Sentry is disabled in development even if DSN is set.
   *
   * @default undefined (disabled)
   * @example 'true'
   */
  SENTRY_ENABLE_IN_DEV: z.string().optional(),

  /**
   * Enable Strict-Transport-Security (HSTS) header.
   * Only enable in production when HTTPS is guaranteed.
   *
   * @default 'false'
   * @security ONLY enable when HTTPS is available (production)
   * @example 'true' | 'false'
   */
  ENABLE_HSTS: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  // ============================================================================
  // Feature Flags
  // ============================================================================

  /**
   * Enable new dashboard feature.
   * @default 'false'
   */
  FEATURE_NEW_DASHBOARD: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  /**
   * Enable beta features.
   * @default 'false'
   */
  FEATURE_BETA_FEATURES: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  /**
   * Enable risky upload flow feature.
   * @default 'false'
   */
  FEATURE_RISKY_UPLOAD_FLOW: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  /**
   * Enable enhanced analytics feature.
   * @default 'false'
   */
  FEATURE_ENHANCED_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  /**
   * Kill switch for risky upload flow.
   * When true, risky upload flow is DISABLED regardless of other flags.
   * @default 'false'
   */
  KILL_RISKY_UPLOAD_FLOW: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  // ============================================================================
  // OAuth / Authentication
  // ============================================================================

  /**
   * Google OAuth Client ID.
   * Required for Google OAuth authentication.
   * Optional in test environment.
   *
   * @see https://console.cloud.google.com/apis/credentials
   * @example '123456789-abc123.apps.googleusercontent.com'
   */
  GOOGLE_CLIENT_ID: z.string().optional(),

  /**
   * Google OAuth Client Secret.
   * Required for Google OAuth authentication.
   * Optional in test environment.
   *
   * @security Keep this secret secure - never expose to client
   * @see https://console.cloud.google.com/apis/credentials
   */
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  /**
   * Secret key used to encrypt/sign session cookies.
   * Must be at least 32 characters for secure encryption.
   * Optional in test environment.
   *
   * @security Keep this secret secure - never expose
   * @example Generate with: openssl rand -base64 32
   */
  AUTH_SESSION_SECRET: z.string().optional(),

  /**
   * Session time-to-live in seconds.
   * Default: 7 days (604800 seconds)
   *
   * @default 604800
   * @example '86400' (1 day), '604800' (7 days)
   */
  AUTH_SESSION_TTL_SECONDS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .optional()
    .default("604800"),
};
