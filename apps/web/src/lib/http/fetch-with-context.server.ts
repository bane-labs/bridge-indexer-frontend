import "server-only";

import { performance } from "node:perf_hooks";

import { log } from "../logging/logger.server";
import { getRequestContext } from "../logging/request-context.server";

/**
 * Fetch wrapper that propagates correlation IDs and logs outbound requests
 * - Forwards x-request-id from current request context
 * - Logs request timing and outcomes
 * - Does NOT log response bodies (security/performance)
 */
export async function fetchWithContext(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
): Promise<Awaited<ReturnType<typeof fetch>>> {
  // Extract URL for logging
  let url: string;
  if (typeof input === "string") {
    url = input;
  } else if ("url" in input) {
    url = input.url;
  } else {
    url = input.toString();
  }

  const startTime = performance.now();

  // Get request context to propagate correlation ID
  const ctx = getRequestContext();
  const requestId = ctx?.requestId;

  // Merge x-request-id header if we have one
  const headers = new Headers(init?.headers);
  if (requestId) {
    headers.set("x-request-id", requestId);
  }

  try {
    // Make the request
    const response = await fetch(input, {
      ...init,
      headers,
    });

    const durationMs = Math.round(performance.now() - startTime);

    // Log successful request
    log.info({
      event: "outbound_http",
      url,
      status: response.status,
      durationMs,
    });

    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);

    // Log failed request
    log.error({
      event: "outbound_http_error",
      url,
      durationMs,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    throw error;
  }
}
