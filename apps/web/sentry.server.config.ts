/**
 * Sentry Server Configuration
 *
 * Configures Sentry for the Node.js runtime. Captures errors from server
 * components, API route handlers, server actions, and generateMetadata.
 *
 * IMPORTANT: This is a bootstrap file loaded via instrumentation.ts register()
 * before the application starts. It uses process.env directly — NOT @/env.
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

    // --- Sampling (ADR-0005) ---
    tracesSampleRate: IS_PRODUCTION ? 0.1 : IS_STAGING ? 0.3 : 0,
    profilesSampleRate: 0,

    integrations: [Sentry.httpIntegration()],

    // Known/expected errors — don't noise up the dashboard
    ignoreErrors: ["ValidationError", "ZodError"],

    beforeSend(event) {
      event.tags = { ...event.tags, runtime: "server" };
      if (IS_DEV && !ENABLED_IN_DEV) return null;
      return event;
    },

    debug: IS_DEV && ENABLED_IN_DEV,
    maxBreadcrumbs: IS_PRODUCTION ? 50 : 100,
  });
}
