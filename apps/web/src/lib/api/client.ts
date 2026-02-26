/**
 * Central API Client
 *
 * ONLY place in the application allowed to call fetch() directly.
 * All HTTP requests MUST go through this module to ensure:
 * - Consistent error handling
 * - Correlation ID propagation
 * - Authentication header injection
 * - Request/response logging
 * - Retry logic for transient failures
 */

import { RETRY_CONFIG } from "./config";
import { CORRELATION_ID_HEADER, extractCorrelationId, generateCorrelationId } from "./correlation";
import { ApiError, normalizeApiError } from "./errors";

/**
 * Request options for API calls.
 */
export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /**
   * Request body. Will be JSON-stringified automatically.
   */
  body?: unknown;

  /**
   * Correlation ID for request tracing.
   * If not provided, one will be generated automatically.
   */
  correlationId?: string;

  /**
   * Custom timeout in milliseconds.
   * Overrides the default timeout from config.
   */
  timeout?: number;

  /**
   * Whether to skip automatic retry on transient failures.
   * @default false
   */
  skipRetry?: boolean;

  /**
   * Whether to skip auth token injection.
   * Useful for public endpoints or when manually providing auth headers.
   * @default false
   */
  skipAuth?: boolean;
}

/**
 * Auth token provider function.
 * Can be set globally to inject authentication tokens into requests.
 *
 * @example
 * ```ts
 * import { setAuthTokenProvider } from '@/lib/api';
 *
 * setAuthTokenProvider(async () => {
 *   const session = await getSession();
 *   return session?.accessToken;
 * });
 * ```
 */
let authTokenProvider: (() => Promise<string | null>) | null = null;

/**
 * Set the global auth token provider.
 * This function will be called for each API request to inject auth tokens.
 *
 * @param provider - Async function that returns the auth token
 */
export function setAuthTokenProvider(provider: () => Promise<string | null>): void {
  authTokenProvider = provider;
}

/**
 * Calculate exponential backoff delay.
 *
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function calculateBackoff(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Sleep for a specified duration.
 *
 * @param ms - Duration in milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make an HTTP request with automatic error handling, retries, and correlation.
 *
 * @param endpoint - API endpoint (will be prefixed with base URL)
 * @param options - Request options
 * @returns Parsed response data
 * @throws ApiError on failure
 */
export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    body,
    correlationId = generateCorrelationId(),
    timeout,
    skipRetry = false,
    skipAuth = false,
    ...fetchOptions
  } = options;

  // Endpoint should be a full URL when called from client code
  // The hooks layer (useApiClient) builds the full URL from runtime config
  const url = endpoint;

  // Build headers
  const headers = new Headers(fetchOptions.headers);

  // Set content type for JSON requests
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Set accept header
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Add correlation ID
  headers.set(CORRELATION_ID_HEADER, correlationId);

  // Inject auth token if available
  if (!skipAuth && authTokenProvider) {
    try {
      const token = await authTokenProvider();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      // Log auth error but continue with request
      // eslint-disable-next-line no-console
      console.error("Failed to get auth token:", error);
    }
  }

  // Prepare request init
  const requestInit: RequestInit = {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  // Execute request with retry logic
  let lastError: unknown;
  const maxAttempts = skipRetry ? 1 : RETRY_CONFIG.maxAttempts;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Add timeout if specified
      let response: Response;
      if (timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          response = await fetch(url, {
            ...requestInit,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      } else {
        response = await fetch(url, requestInit);
      }

      // Extract correlation ID from response
      const responseCorrelationId = extractCorrelationId(response.headers);

      // Handle successful responses (2xx)
      if (response.ok) {
        // Handle 204 No Content
        if (response.status === 204) {
          return undefined as T;
        }

        // Parse JSON response
        try {
          return (await response.json()) as T;
        } catch (error) {
          throw new ApiError(
            {
              code: "INVALID_RESPONSE",
              message: "Failed to parse response JSON",
              userMessage: "Received an invalid response from the server.",
              correlationId: responseCorrelationId ?? correlationId,
            },
            response.status,
            error
          );
        }
      }

      // Handle error responses
      let errorShape;
      try {
        const errorBody = await response.json();

        // Check if response matches our standard error shape
        if (
          errorBody &&
          typeof errorBody === "object" &&
          "code" in errorBody &&
          "message" in errorBody
        ) {
          errorShape = {
            code: errorBody.code as string,
            message: errorBody.message as string,
            userMessage: errorBody.userMessage as string | undefined,
            correlationId: responseCorrelationId ?? correlationId,
            details: errorBody.details,
          };
        } else {
          // Non-standard error response
          errorShape = {
            code: `HTTP_${response.status}`,
            message: `HTTP ${response.status}: ${response.statusText}`,
            userMessage: getDefaultUserMessage(response.status),
            correlationId: responseCorrelationId ?? correlationId,
            details: errorBody,
          };
        }
      } catch {
        // Failed to parse error body
        errorShape = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          userMessage: getDefaultUserMessage(response.status),
          correlationId: responseCorrelationId ?? correlationId,
        };
      }

      const apiError = new ApiError(errorShape, response.status);

      // Check if error is retryable
      if (
        attempt < maxAttempts - 1 &&
        RETRY_CONFIG.retryableStatuses.includes(response.status as 408 | 429 | 502 | 503 | 504)
      ) {
        const delay = calculateBackoff(attempt);
        await sleep(delay);
        continue; // Retry
      }

      throw apiError;
    } catch (error) {
      lastError = error;

      // Don't retry ApiError (already processed)
      if (error instanceof ApiError) {
        throw error;
      }

      // Check if it's a network error and retryable
      if (attempt < maxAttempts - 1) {
        const delay = calculateBackoff(attempt);
        await sleep(delay);
        continue; // Retry
      }

      // Out of retries - normalize and throw
      throw normalizeApiError(error, correlationId);
    }
  }

  // Should never reach here, but just in case
  throw normalizeApiError(lastError, correlationId);
}

/**
 * Get default user-facing message for HTTP status codes.
 *
 * @param status - HTTP status code
 * @returns User-friendly error message
 */
function getDefaultUserMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "You need to sign in to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 408:
      return "The request timed out. Please try again.";
    case 409:
      return "This action conflicts with existing data.";
    case 422:
      return "The provided data is invalid.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "An internal server error occurred. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "The service is temporarily unavailable. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Convenience method for GET requests.
 */
export async function apiGet<T>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

/**
 * Convenience method for POST requests.
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "POST", body });
}

/**
 * Convenience method for PUT requests.
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "PUT", body });
}

/**
 * Convenience method for PATCH requests.
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "PATCH", body });
}

/**
 * Convenience method for DELETE requests.
 */
export async function apiDelete<T>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}
