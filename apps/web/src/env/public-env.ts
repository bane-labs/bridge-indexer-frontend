/**
 * Public environment configuration validated at runtime.
 *
 * Uses @t3-oss/env-nextjs + Zod to validate and expose all NEXT_PUBLIC_* variables
 * to the client in a type-safe and secure manner.
 *
 * Only variables prefixed with `NEXT_PUBLIC_` should be added here.
 * Never include server secrets in this file — use `server-env.ts` instead.
 */

import { createEnv } from "@t3-oss/env-nextjs";

import { ClientEnvSchema } from "@/schemas/env/public-runtime-config";

/**
 * Validates and exposes public (client-side) environment variables.
 *
 * These are accessible in both browser and server components, and must be safe to expose.
 * All variables are prefixed with `NEXT_PUBLIC_` and will be bundled into the client-side
 * JavaScript where they are visible to users.
 *
 * @example
 * ```typescript
 * // Usage in client components
 * import { env } from '@/env/public-env';
 *
 * function MyComponent() {
 *   const apiUrl = env.NEXT_PUBLIC_API_URL;
 *   // Type-safe access to validated environment variables
 * }
 * ```
 *
 * @security Never include secrets or sensitive data - these are public
 */
export const env = createEnv({
  /**
   * Server-side variables (empty for client-only config).
   *
   * No server variables here — handled in env/server-env.ts.
   * This ensures complete separation between server and client environments.
   */
  server: {},

  /**
   * Client-side environment variables schema.
   *
   * All variables must be prefixed with NEXT_PUBLIC_ to be accessible
   * in the browser. Validation rules are defined in ClientEnvSchema.
   */
  client: {
    ...ClientEnvSchema,
  },

  /**
   * Runtime environment bindings from `process.env`.
   *
   * These are injected by Next.js at build time and must match the
   * schema keys defined in `ClientEnvSchema`. Values are accessible
   * in both server and client contexts.
   */
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID,
    NEXT_PUBLIC_WEB_VITALS_ENABLED: process.env.NEXT_PUBLIC_WEB_VITALS_ENABLED,
    NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE: process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE,
    NEXT_PUBLIC_WEB_VITALS_ENDPOINT: process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT,
    NEXT_PUBLIC_WEB_VITALS_DEBUG: process.env.NEXT_PUBLIC_WEB_VITALS_DEBUG,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV,
    // Analytics
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_ANALYTICS_DEBUG: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG,
  },

  /**
   * Skip environment validation flag.
   *
   * When set to true, validation is bypassed. Useful for CI/CD.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",

  /**
   * Treat empty strings as `undefined`.
   *
   * Useful for optional variables where empty strings should be treated
   * as undefined values.
   */
  emptyStringAsUndefined: true,
});
