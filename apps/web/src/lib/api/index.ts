/**
 * API Layer Public Exports
 *
 * Central module for all API-related functionality.
 * Features:
 * - Type-safe API client with automatic error handling
 * - Standard error shapes and normalization
 * - Correlation ID generation and propagation
 * - Request/response interceptors
 * - Automatic retry logic for transient failures
 * - Runtime-aware hooks for client-side API calls
 */

// Client
export {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  apiRequest,
  type ApiRequestOptions,
  setAuthTokenProvider,
} from "./client";

// Runtime-aware hooks for client components
export { useApiBaseUrl, useApiClient } from "./hooks";

// Configuration (client-safe constants only)
export { DEFAULT_TIMEOUT, RETRY_CONFIG } from "./config";

// Server-only: getApiBaseUrl - import from "@/lib/api/config" directly in server code

// Errors
export {
  ApiError,
  type ApiErrorShape,
  getUserFacingMessage,
  isApiErrorWithCode,
  isRetryableError,
  normalizeApiError,
} from "./errors";

// Correlation
export { CORRELATION_ID_HEADER, extractCorrelationId, generateCorrelationId } from "./correlation";
