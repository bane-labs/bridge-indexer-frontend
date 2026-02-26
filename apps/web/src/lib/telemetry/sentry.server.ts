/**
 * Sentry Utilities for Server-Side Error Handling
 *
 * Provides helpers for capturing errors in server components, route handlers,
 * and server actions with proper context propagation.
 */

import "server-only";

import * as Sentry from "@sentry/nextjs";

import { getRequestContext } from "@/lib/logging/request-context.server";

/**
 * API Error types that should not be sent to Sentry as exceptions
 */
export type KnownErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMIT";

export interface KnownError extends Error {
  code: KnownErrorCode;
  statusCode?: number;
}

/**
 * Check if an error is a known/expected error
 */
export function isKnownError(error: unknown): error is KnownError {
  return (
    error instanceof Error &&
    "code" in error &&
    [
      "VALIDATION_ERROR",
      "AUTHENTICATION_ERROR",
      "AUTHORIZATION_ERROR",
      "NOT_FOUND",
      "RATE_LIMIT",
    ].includes((error as KnownError).code)
  );
}

/**
 * Capture an exception with server-side context
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
  // Get request context if available
  const requestContext = getRequestContext();

  Sentry.captureException(error, {
    level: context?.level || "error",
    tags: {
      runtime: "server",
      ...context?.tags,
      ...(context?.route && { route: context.route }),
      ...(context?.feature && { feature: context.feature }),
      ...(requestContext?.requestId && { correlationId: requestContext.requestId }),
    },
    extra: {
      ...context?.extra,
      ...(requestContext && {
        requestContext: {
          route: requestContext.route,
          method: requestContext.method,
          userId: requestContext.userId,
          tenantId: requestContext.tenantId,
        },
      }),
    },
  });
}

/**
 * Capture API errors with proper classification
 *
 * Known errors (validation, auth, etc.) are logged as messages, not exceptions.
 * Unknown errors are captured as exceptions.
 */
export function captureApiError(
  error: unknown,
  context?: {
    route?: string;
    feature?: string;
    extra?: Record<string, unknown>;
  }
) {
  const requestContext = getRequestContext();

  // If it's a known error, log as a message (not an exception)
  if (isKnownError(error)) {
    Sentry.captureMessage(`Known API error: ${error.code}`, {
      level: "warning",
      tags: {
        runtime: "server",
        errorCode: error.code,
        ...(context?.route && { route: context.route }),
        ...(context?.feature && { feature: context.feature }),
        ...(requestContext?.requestId && { correlationId: requestContext.requestId }),
      },
      extra: {
        errorMessage: error.message,
        statusCode: error.statusCode,
        ...context?.extra,
      },
    });
    return;
  }

  // Unknown error - capture as exception
  if (error instanceof Error) {
    captureException(error, {
      level: "error",
      route: context?.route,
      feature: context?.feature,
      extra: context?.extra,
    });
  } else {
    // Non-Error thrown - capture as message
    Sentry.captureMessage(`Unknown error thrown: ${String(error)}`, {
      level: "error",
      tags: {
        runtime: "server",
        ...(context?.route && { route: context.route }),
        ...(requestContext?.requestId && { correlationId: requestContext.requestId }),
      },
      extra: {
        error,
        ...context?.extra,
      },
    });
  }
}

/**
 * Capture a message with server-side context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) {
  const requestContext = getRequestContext();

  Sentry.captureMessage(message, {
    level,
    tags: {
      runtime: "server",
      ...context?.tags,
      ...(requestContext?.requestId && { correlationId: requestContext.requestId }),
    },
    extra: {
      ...context?.extra,
      ...(requestContext && {
        requestContext: {
          route: requestContext.route,
          method: requestContext.method,
        },
      }),
    },
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
 * Wrap a route handler with Sentry context
 *
 * This automatically:
 * - Sets tags for route, method, and correlationId
 * - Captures unhandled errors
 * - Attaches request context
 */
export function withSentryRouteHandler<T>(
  handler: (req: Request, context?: unknown) => Promise<T>,
  options?: {
    route?: string;
    feature?: string;
  }
) {
  return async (req: Request, context?: unknown): Promise<T> => {
    const requestContext = getRequestContext();

    // Set tags for this request
    Sentry.setTags({
      runtime: "server",
      route: options?.route || requestContext?.route || "unknown",
      method: requestContext?.method || req.method,
      ...(options?.feature && { feature: options.feature }),
      ...(requestContext?.requestId && { correlationId: requestContext.requestId }),
    });

    try {
      return await handler(req, context);
    } catch (error) {
      // Capture error with context
      if (error instanceof Error) {
        captureApiError(error, {
          route: options?.route || requestContext?.route,
          feature: options?.feature,
        });
      }
      throw error;
    }
  };
}
