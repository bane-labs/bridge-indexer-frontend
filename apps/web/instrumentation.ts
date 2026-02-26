/**
 * Next.js Instrumentation
 *
 * This file is automatically loaded by Next.js before any other code.
 * It's the proper place to initialize global instrumentation like Sentry.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Only load Sentry on server-side (not in edge runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  // Edge runtime loads sentry.edge.config automatically
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Capture errors from Server Components, middleware, and proxies.
 * Requires @sentry/nextjs version 8.28.0+ and Next.js 15+
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
export const onRequestError = Sentry.captureRequestError;
