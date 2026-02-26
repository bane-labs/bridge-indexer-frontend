/**
 * Next.js Client Instrumentation
 *
 * This file is automatically loaded by Next.js in the browser before any other client code.
 * It's the proper place to initialize client-side instrumentation like Sentry.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import "./sentry.client.config";

import * as Sentry from "@sentry/nextjs";

// Required by @sentry/nextjs to capture client-side route transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
