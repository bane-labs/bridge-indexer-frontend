/**
 * Client Configuration Module
 *
 * Provides client-safe configuration by building it directly from
 * validated environment variables (via @t3-oss/env-nextjs).
 *
 * This module must NOT import server-only modules or use serverEnv.
 *
 * @module config/client
 */

"use client";

import { clientEnv } from "@/env";

import { clientConfigSchema } from "./schema";

import type { ClientConfig } from "./schema";

/**
 * Cached client config — built once from env vars (inlined at build time).
 */
let _cached: ClientConfig | null = null;

/**
 * Build client config from validated env vars.
 *
 * Values come from @t3-oss/env-nextjs `clientEnv` which reads
 * NEXT_PUBLIC_* vars inlined by Next.js at build time.
 *
 * @returns Client-safe config object
 * @internal
 */
function buildClientConfig(): ClientConfig {
  if (_cached) return _cached;

  _cached = clientConfigSchema.parse({
    app: {
      url: clientEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      env: clientEnv.NEXT_PUBLIC_APP_ENV ?? "development",
      buildId: clientEnv.NEXT_PUBLIC_BUILD_ID,
    },

    api: {
      baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    },

    sentry: {
      enabled: Boolean(clientEnv.NEXT_PUBLIC_SENTRY_DSN),
      dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
      environment: clientEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      release: clientEnv.NEXT_PUBLIC_SENTRY_RELEASE,
    },

    webVitals: {
      enabled: clientEnv.NEXT_PUBLIC_WEB_VITALS_ENABLED ?? false,
      sampleRate: clientEnv.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE ?? 0.05,
      endpoint: clientEnv.NEXT_PUBLIC_WEB_VITALS_ENDPOINT ?? "/api/telemetry/web-vitals",
      debug: clientEnv.NEXT_PUBLIC_WEB_VITALS_DEBUG ?? false,
    },

    features: {},
  });

  return _cached;
}

/**
 * Get client config (non-hook version).
 *
 * Can be used outside React components.
 *
 * @returns Client-safe configuration object
 */
export function getClientConfig(): ClientConfig {
  return buildClientConfig();
}

/**
 * Hook to access client-side configuration.
 *
 * Returns the canonical config shape built from validated env vars.
 * No provider needed — values are inlined at build time.
 *
 * @returns Client-safe configuration object
 *
 * @example
 * ```tsx
 * import { useConfig } from '@/config';
 *
 * function ApiClient() {
 *   const config = useConfig();
 *   const response = await fetch(`${config.api.baseUrl}/data`);
 * }
 * ```
 */
export function useConfig(): ClientConfig {
  return buildClientConfig();
}

/**
 * Reset the cached client config.
 * Only needed in test environments where env vars change between tests.
 * @internal
 */
export function _resetClientConfigCache(): void {
  _cached = null;
}
