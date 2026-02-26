/**
 * Sentry Utilities for Client-Side Error Handling
 *
 * Provides helpers for capturing errors and setting context in client components.
 */

"use client";

import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
    route?: string;
    feature?: string;
  }
) {
  Sentry.captureException(error, {
    level: context?.level || "error",
    tags: {
      runtime: "client",
      ...context?.tags,
      ...(context?.route && { route: context.route }),
      ...(context?.feature && { feature: context.feature }),
    },
    extra: context?.extra,
  });
}

/**
 * Capture a message with context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) {
  Sentry.captureMessage(message, {
    level,
    tags: {
      runtime: "client",
      ...context?.tags,
    },
    extra: context?.extra,
  });
}

/**
 * Set user context for Sentry events
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "info"
) {
  Sentry.addBreadcrumb({
    message,
    data,
    level,
  });
}

/**
 * Set tags on the current scope
 */
export function setTags(tags: Record<string, string>) {
  Sentry.setTags(tags);
}

/**
 * Set extra context on the current scope
 */
export function setExtras(extras: Record<string, unknown>) {
  Sentry.setExtras(extras);
}

/**
 * Start a new transaction for manual performance tracking
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}
