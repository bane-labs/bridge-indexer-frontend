import "server-only";

import { type RequestContext, runWithRequestContext } from "./request-context.server";

/**
 * Wrap a Next.js route handler with request context
 * Extracts requestId, route, and method from the request and makes them available
 * to all logging calls within the handler
 */
export function withRequestContext<T>(req: Request, fn: () => T | Promise<T>): T | Promise<T> {
  // Extract requestId from header (set by middleware)
  const requestId = req.headers.get("x-request-id") || "unknown";

  // Extract route from URL pathname
  const url = new URL(req.url);
  const route = url.pathname;

  // Extract HTTP method
  const method = req.method;

  // Build context
  const ctx: RequestContext = {
    requestId,
    route,
    method,
  };

  // Run the handler within this context
  return runWithRequestContext(ctx, fn);
}
