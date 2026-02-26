/**
 * API Configuration
 *
 * Centralized configuration for API client behavior.
 *
 * NOTE: getApiBaseUrl() is for SERVER-SIDE ONLY.
 * For client-side, use useApiClient() hook from './hooks'
 */

/**
 * Get the API base URL from configuration.
 *
 * SERVER-SIDE ONLY. For client-side usage, use the useApiClient() hook instead.
 *
 * @example Server-side usage
 * ```tsx
 * import { getApiBaseUrl } from '@/lib/api/config';
 *
 * export async function GET() {
 *   const baseUrl = getApiBaseUrl();
 *   const response = await fetch(`${baseUrl}/users`);
 *   // ...
 * }
 * ```
 *
 * @example Client-side usage
 * ```tsx
 * import { useApiClient } from '@/lib/api/hooks';
 *
 * function MyComponent() {
 *   const api = useApiClient();
 *   // api.get(), api.post(), etc. use runtime config
 * }
 * ```
 */
export async function getApiBaseUrl(): Promise<string> {
  if (typeof window !== "undefined") {
    throw new Error("getApiBaseUrl() is server-only. Use useApiClient() hook on the client.");
  }
  const { getServerConfig } = await import("@/config/server");
  return getServerConfig().api.baseUrl;
}

/**
 * Default API request timeout in milliseconds.
 */
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Default retry configuration for network errors and specific status codes.
 */
export const RETRY_CONFIG = {
  /**
   * Maximum number of retry attempts for retryable errors.
   */
  maxAttempts: 3,

  /**
   * HTTP status codes that should trigger a retry.
   * - 408: Request Timeout
   * - 429: Too Many Requests (with backoff)
   * - 502: Bad Gateway
   * - 503: Service Unavailable
   * - 504: Gateway Timeout
   */
  retryableStatuses: [408, 429, 502, 503, 504],

  /**
   * Base delay for exponential backoff in milliseconds.
   */
  baseDelayMs: 1000,

  /**
   * Maximum delay between retries in milliseconds.
   */
  maxDelayMs: 10000,
} as const;
