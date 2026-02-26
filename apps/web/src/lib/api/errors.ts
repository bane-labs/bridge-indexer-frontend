/**
 * API Error Types and Utilities
 *
 * Standard error shape and normalization for all API failures.
 * Ensures consistent error handling across the application.
 */

/**
 * Standard API error shape.
 * All API errors are normalized to this structure for consistent handling.
 */
export interface ApiErrorShape {
  /**
   * Machine-readable error code (e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED').
   */
  code: string;

  /**
   * Technical error message (for logging/debugging).
   */
  message: string;

  /**
   * Optional user-friendly message (safe to display in UI).
   */
  userMessage?: string;

  /**
   * Correlation ID for request tracing.
   */
  correlationId?: string;

  /**
   * Additional error context (validation errors, field details, etc.).
   */
  details?: unknown;
}

/**
 * Custom error class for API failures.
 * Extends Error with structured API error information.
 */
export class ApiError extends Error {
  /**
   * Structured error information.
   */
  public readonly shape: ApiErrorShape;

  /**
   * HTTP status code (if applicable).
   */
  public readonly status?: number;

  /**
   * Original error that caused this ApiError (if any).
   */
  public readonly cause?: unknown;

  constructor(shape: ApiErrorShape, status?: number, cause?: unknown) {
    super(shape.message);
    this.name = "ApiError";
    this.shape = shape;
    this.status = status;
    this.cause = cause;

    // Maintain proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Normalize any error into an ApiError.
 * Handles various error types (ApiError, Error, network failures, unknown).
 *
 * @param error - The error to normalize
 * @param correlationId - Optional correlation ID to include
 * @returns Normalized ApiError
 */
export function normalizeApiError(error: unknown, correlationId?: string): ApiError {
  // Already an ApiError - return as-is
  if (error instanceof ApiError) {
    return error;
  }

  // Standard Error object
  if (error instanceof Error) {
    return new ApiError(
      {
        code: "UNKNOWN_ERROR",
        message: error.message,
        userMessage: "An unexpected error occurred. Please try again.",
        correlationId,
      },
      undefined,
      error
    );
  }

  // Network errors (fetch failures)
  if (error && typeof error === "object" && "name" in error && error.name === "TypeError") {
    return new ApiError(
      {
        code: "NETWORK_ERROR",
        message: "message" in error ? String(error.message) : "Network request failed",
        userMessage: "Unable to connect to the server. Please check your connection.",
        correlationId,
      },
      undefined,
      error
    );
  }

  // Unknown error type
  return new ApiError(
    {
      code: "UNKNOWN_ERROR",
      message: String(error),
      userMessage: "An unexpected error occurred. Please try again.",
      correlationId,
    },
    undefined,
    error
  );
}

/**
 * Extract user-facing error message from any error.
 * Safe to display in UI without leaking sensitive information.
 *
 * @param error - The error to extract message from
 * @returns User-friendly error message
 */
export function getUserFacingMessage(error: unknown): string {
  const normalized = normalizeApiError(error);
  return normalized.shape.userMessage ?? "An unexpected error occurred. Please try again.";
}

/**
 * Check if an error is an API error with a specific code.
 *
 * @param error - The error to check
 * @param code - The error code to match
 * @returns True if error matches the code
 */
export function isApiErrorWithCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.shape.code === code;
}

/**
 * Check if an error is retryable based on status code or error type.
 *
 * @param error - The error to check
 * @returns True if the error should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  // Retry network errors
  if (error.shape.code === "NETWORK_ERROR") {
    return true;
  }

  // Retry specific HTTP status codes
  if (error.status) {
    const retryableStatuses = [408, 429, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  return false;
}
