/**
 * Server Configuration Module
 *
 * Assembles server-side configuration from validated environment variables.
 * This module runs only on the server and has access to both server-only
 * and public environment variables.
 *
 * IMPORTANT: This module must NOT be imported in client components.
 * Use the client config module instead for browser code.
 *
 * @module config/server
 */
import { clientEnv, serverEnv } from "@/env";

import { configSchema } from "./schema";

import type { Config } from "./schema";

/**
 * Get complete server-side configuration.
 *
 * Assembles config from validated environment variables (via @t3-oss/env-nextjs).
 * This includes both server-only and public configuration.
 *
 * The config is built on-demand (not cached) to ensure it reflects the current
 * environment state. For most use cases, this is called infrequently enough
 * that caching is unnecessary.
 *
 * @returns Complete validated configuration object
 *
 * @example Server component
 * ```tsx
 * import { getServerConfig } from '@/config/server';
 *
 * export default async function Page() {
 *   const config = getServerConfig();
 *   const data = await fetch(`${config.api.baseUrl}/users`);
 *   // ...
 * }
 * ```
 *
 * @example API route
 * ```tsx
 * import { getServerConfig } from '@/config/server';
 *
 * export async function GET() {
 *   const config = getServerConfig();
 *   // Use config.logging.level, config.api.baseUrl, etc.
 * }
 * ```
 */
export function getServerConfig(): Config {
  const config: Config = {
    app: {
      url: clientEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      env: clientEnv.NEXT_PUBLIC_APP_ENV ?? "development",
      buildId: clientEnv.NEXT_PUBLIC_BUILD_ID,
    },

    api: {
      // Prefer server-specific API_BASE_URL, fall back to public
      baseUrl: serverEnv.API_BASE_URL ?? clientEnv.NEXT_PUBLIC_API_URL,
    },

    sentry: {
      // Sentry is enabled if DSN is provided
      enabled: Boolean(serverEnv.SENTRY_DSN),
      dsn: serverEnv.SENTRY_DSN,
      environment: serverEnv.SENTRY_ENVIRONMENT,
      release: serverEnv.SENTRY_RELEASE,
    },

    webVitals: {
      enabled: clientEnv.NEXT_PUBLIC_WEB_VITALS_ENABLED ?? false,
      sampleRate: clientEnv.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE ?? 0.05,
      endpoint: clientEnv.NEXT_PUBLIC_WEB_VITALS_ENDPOINT ?? "/api/telemetry/web-vitals",
      debug: clientEnv.NEXT_PUBLIC_WEB_VITALS_DEBUG ?? false,
    },

    logging: {
      level: serverEnv.LOG_LEVEL ?? "info",
    },

    auth: {
      googleClientId: serverEnv.GOOGLE_CLIENT_ID,
      googleClientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      sessionSecret: serverEnv.AUTH_SESSION_SECRET,
      sessionTtlSeconds: serverEnv.AUTH_SESSION_TTL_SECONDS ?? 604800,
    },

    features: {
      // Feature flags - set via environment variables
      // See docs/FEATURE_FLAGS.md for documentation
      new_dashboard: serverEnv.FEATURE_NEW_DASHBOARD ?? false,
      beta_features: serverEnv.FEATURE_BETA_FEATURES ?? false,
      risky_upload_flow: serverEnv.FEATURE_RISKY_UPLOAD_FLOW ?? false,
      enhanced_analytics: serverEnv.FEATURE_ENHANCED_ANALYTICS ?? false,

      // Kill switches - when true, the corresponding feature is DISABLED
      // Kill switches take highest precedence
      kill_risky_upload_flow: serverEnv.KILL_RISKY_UPLOAD_FLOW ?? false,
    },
  };

  // Validate config against schema
  // This ensures we never return invalid config even if env validation is bypassed
  return configSchema.parse(config);
}

/**
 * Cached server configuration.
 *
 * For use cases where config is accessed frequently and environment doesn't change.
 * Most server code should use getServerConfig() directly.
 *
 * @internal
 */
let cachedServerConfig: Config | null = null;

/**
 * Get cached server configuration.
 *
 * Returns the same config instance for the lifetime of the process.
 * Use this only if you need to avoid repeated config construction.
 *
 * @returns Cached configuration object
 *
 * @example
 * ```tsx
 * import { serverConfig } from '@/config/server';
 *
 * // Use in module-level initialization
 * const logger = createLogger({ level: serverConfig.logging.level });
 * ```
 */
export const serverConfig: Config = (() => {
  if (!cachedServerConfig) {
    cachedServerConfig = getServerConfig();
  }
  return cachedServerConfig;
})();
