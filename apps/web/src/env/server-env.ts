/**
 * Server-only environment configuration.
 *
 * This file validates all sensitive backend-only environment variables
 * (e.g., database URLs, secrets, internal API keys) using Zod and `@t3-oss/env-nextjs`.
 *
 * No `NEXT_PUBLIC_` variables should be used here — this file must not expose client-safe vars.
 */

import { createEnv } from "@t3-oss/env-nextjs";

import { ServerEnvSchema } from "@/schemas/env/server-runtime-config";

/**
 * Validates and exposes server-only environment variables.
 *
 * These variables are only available in server-side contexts (e.g. API routes,
 * getServerSideProps, middleware, etc.) and are never exposed to the client bundle.
 *
 * @example
 * ```typescript
 * // Usage in API routes
 * import { env } from '@/env/server-env';
 *
 * export async function GET(request: NextRequest) {
 *   const dbUrl = env.DATABASE_URL;
 *   // Type-safe access to server-only variables
 * }
 * ```
 *
 * @security All variables accessed through this export are server-only
 */
export const env = createEnv({
  /**
   * Server-only environment variables schema.
   *
   * Defined separately in `schemas/env/server-runtime-config.ts` for reusability.
   * Contains validation rules for all server-side environment variables.
   */
  server: {
    ...ServerEnvSchema,
  },

  /**
   * Client-side variables (empty for server-only config).
   *
   * No public vars here — they belong in `env/public-env.ts`.
   * This ensures complete separation between server and client environments.
   */
  client: {},

  /**
   * Runtime values from process.env.
   *
   * Maps environment variable names to their `process.env` values.
   * These should never be exposed to the client and must match the
   * schema keys defined in `ServerEnvSchema`.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    API_BASE_URL: process.env.API_BASE_URL,
    INDEXER_API_UPSTREAM: process.env.INDEXER_API_UPSTREAM,
    DATABASE_URL: process.env.DATABASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    SENTRY_RELEASE: process.env.SENTRY_RELEASE,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_ENABLE_IN_DEV: process.env.SENTRY_ENABLE_IN_DEV,
    ENABLE_HSTS: process.env.ENABLE_HSTS,
    // Feature flags
    FEATURE_NEW_DASHBOARD: process.env.FEATURE_NEW_DASHBOARD,
    FEATURE_BETA_FEATURES: process.env.FEATURE_BETA_FEATURES,
    FEATURE_RISKY_UPLOAD_FLOW: process.env.FEATURE_RISKY_UPLOAD_FLOW,
    FEATURE_ENHANCED_ANALYTICS: process.env.FEATURE_ENHANCED_ANALYTICS,
    KILL_RISKY_UPLOAD_FLOW: process.env.KILL_RISKY_UPLOAD_FLOW,
    // OAuth / Authentication
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
    AUTH_SESSION_TTL_SECONDS: process.env.AUTH_SESSION_TTL_SECONDS,
  },

  /**
   * Skip environment validation flag.
   *
   * When `SKIP_ENV_VALIDATION` is set to 'true', validation is bypassed.
   * Useful in CI environments or when using dynamic environment injection.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",

  /**
   * Treat empty strings as `undefined`.
   *
   * Common in Docker/CI environments where empty strings are passed
   * instead of undefined values.
   */
  emptyStringAsUndefined: true,
});
