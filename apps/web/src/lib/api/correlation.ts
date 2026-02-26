/**
 * Correlation ID Utilities
 *
 * Generates and manages correlation IDs for request tracing.
 * Correlation IDs link client requests to server logs for debugging.
 */

/**
 * Generate a unique correlation ID.
 * Uses crypto.randomUUID() if available, falls back to timestamp-based ID.
 *
 * @returns A unique correlation ID string
 */
export function generateCorrelationId(): string {
  // Use crypto.randomUUID if available (modern browsers + Node 16.7+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: timestamp + random number
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Standard header name for correlation IDs.
 * Matches the existing Atlas logging infrastructure (x-request-id).
 */
export const CORRELATION_ID_HEADER = "x-request-id";

/**
 * Extract correlation ID from response headers.
 *
 * @param headers - Response headers
 * @returns Correlation ID if present
 */
export function extractCorrelationId(headers: Headers): string | undefined {
  return headers.get(CORRELATION_ID_HEADER) ?? undefined;
}
