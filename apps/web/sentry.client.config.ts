/**
 * Sentry Client Configuration
 *
 * Configures Sentry for the browser runtime. Captures React errors,
 * unhandled rejections, Web Vitals, and client-side navigation.
 *
 * IMPORTANT: This is a bootstrap file loaded via instrumentation-client.ts
 * before the application starts. It uses process.env directly — NOT @/env —
 * because @t3-oss/env-nextjs validation must not run at instrumentation time.
 * (Same convention as next.config.js and instrumentation.ts.)
 *
 * The tunnel URL is constructed automatically by the SDK via the
 * `tunnelRoute: "/monitoring"` option in next.config.js (withSentryConfig).
 * The SDK's `applyTunnelRouteOption` reads `_sentryRewritesTunnelPath` (injected
 * by Turbopack/webpack) and builds `/monitoring?o=ORG&p=PROJECT&r=REGION`.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE;
const IS_DEV = SENTRY_ENVIRONMENT === "development";
const ENABLED_IN_DEV = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
const IS_PRODUCTION = SENTRY_ENVIRONMENT === "production";
const IS_STAGING = SENTRY_ENVIRONMENT === "staging";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    enableLogs: true,
    sendDefaultPii: true,

    // Tunnel is handled automatically by the SDK via `tunnelRoute` in next.config.js.
    // Do NOT set `tunnel` manually — the SDK reads `_sentryRewritesTunnelPath` (injected by
    // Turbopack) and constructs the correct URL including region code.

    // --- Sampling (ADR-0005) ---
    tracesSampleRate: IS_PRODUCTION ? 0.1 : IS_STAGING ? 0.3 : 0,
    replaysSessionSampleRate: IS_PRODUCTION ? 0.01 : IS_STAGING ? 0.05 : 0,
    replaysOnErrorSampleRate: IS_PRODUCTION ? 0.5 : IS_STAGING ? 1.0 : 0,

    integrations: [
      Sentry.browserTracingIntegration({ enableInp: true }),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: true }),
    ],

    // --- Noise Reduction ---
    ignoreErrors: [
      "top.GLOBALS",
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Script error.",
    ],
    denyUrls: [/extensions\//i, /^chrome(-extension)?:\/\//i, /^moz-extension:\/\//i],

    beforeSend(event, hint) {
      // Tag every client event for filtering in Sentry dashboard
      event.tags = { ...event.tags, runtime: "client" };

      // In dev, only send if explicitly opted in
      if (IS_DEV && !ENABLED_IN_DEV) return null;

      // Drop auto-captured network errors (user connectivity issues)
      // but keep manually captured API errors that happen to have similar messages
      const err = hint?.originalException;
      if (
        err instanceof TypeError &&
        (err.message === "Failed to fetch" ||
          err.message === "NetworkError when attempting to fetch resource.")
      ) {
        return null;
      }

      return event;
    },

    // Debug logging in dev with Sentry enabled — check browser console for output
    debug: IS_DEV && ENABLED_IN_DEV,
  });
}
