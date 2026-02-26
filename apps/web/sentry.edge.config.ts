/**
 * Sentry Edge Configuration
 *
 * Configures Sentry for the Edge runtime (middleware, edge API routes).
 * Edge has limited APIs (no fs, no Node.js builtins) — keep this lean.
 *
 * IMPORTANT: Bootstrap file — uses process.env directly, not @/env.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV;
const SENTRY_RELEASE = process.env.SENTRY_RELEASE;
const IS_DEV = SENTRY_ENVIRONMENT === "development";
const ENABLED_IN_DEV = process.env.SENTRY_ENABLE_IN_DEV === "true";
const IS_PRODUCTION = SENTRY_ENVIRONMENT === "production";
const IS_STAGING = SENTRY_ENVIRONMENT === "staging";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    enableLogs: true,

    tracesSampleRate: IS_PRODUCTION ? 0.1 : IS_STAGING ? 0.3 : 0,

    beforeSend(event) {
      event.tags = { ...event.tags, runtime: "edge" };
      if (IS_DEV && !ENABLED_IN_DEV) return null;
      return event;
    },

    debug: IS_DEV && ENABLED_IN_DEV,
  });
}
