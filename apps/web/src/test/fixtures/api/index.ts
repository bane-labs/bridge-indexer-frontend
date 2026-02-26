/**
 * API Fixtures
 *
 * Realistic sample API responses matching Atlas API contract shapes.
 * Use these in tests to provide consistent, predictable data.
 */

import type { components } from "@/lib/api/contracts";

/**
 * Success response fixtures
 */
export const apiFixtures = {
  /**
   * Health check success response
   */
  healthSuccess: {
    status: "healthy",
    timestamp: "2024-12-24T00:00:00Z",
    version: "1.0.0",
  } as components["schemas"]["HealthResponse"],

  /**
   * User list success response
   */
  userListSuccess: ({ page = 1, pageSize = 20 } = {}) => ({
    data: [
      {
        id: "user-1",
        email: "alice@example.com",
        name: "Alice Johnson",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "user-2",
        email: "bob@example.com",
        name: "Bob Smith",
        createdAt: "2024-01-16T14:20:00Z",
        updatedAt: "2024-01-16T14:20:00Z",
      },
    ],
    pagination: {
      page,
      pageSize,
      totalPages: 5,
      totalItems: 100,
    },
  }),

  /**
   * User detail success response
   */
  userDetailSuccess: ({ userId = "user-1" } = {}) => ({
    id: userId,
    email: "alice@example.com",
    name: "Alice Johnson",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  }),

  /**
   * User create success response
   */
  userCreateSuccess: (data: { email: string; name: string }) => ({
    id: "user-new",
    email: data.email,
    name: data.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  /**
   * User update success response
   */
  userUpdateSuccess: ({
    userId = "user-1",
    updates = {},
  }: {
    userId?: string;
    updates?: Record<string, unknown>;
  }) => ({
    id: userId,
    email: "alice@example.com",
    name: "Alice Johnson",
    ...updates,
    updatedAt: new Date().toISOString(),
  }),
} as const;

/**
 * Error response fixtures matching Atlas ApiError shape
 */
export const errorFixtures = {
  /**
   * 400 Bad Request - Validation error
   */
  error400: {
    code: "VALIDATION_ERROR",
    message: "Invalid request data",
    userMessage: "Please check your input and try again.",
    correlationId: "test-correlation-id-400",
    details: {
      field: "email",
      issue: "Invalid email format",
    },
  },

  /**
   * 401 Unauthorized - Authentication error
   */
  error401: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
    userMessage: "Please log in to continue.",
    correlationId: "test-correlation-id-401",
  },

  /**
   * 403 Forbidden - Authorization error
   */
  error403: {
    code: "FORBIDDEN",
    message: "Insufficient permissions",
    userMessage: "You don't have permission to perform this action.",
    correlationId: "test-correlation-id-403",
  },

  /**
   * 404 Not Found
   */
  error404: {
    code: "NOT_FOUND",
    message: "Resource not found",
    userMessage: "The requested resource could not be found.",
    correlationId: "test-correlation-id-404",
  },

  /**
   * 409 Conflict
   */
  error409: {
    code: "CONFLICT",
    message: "Resource conflict",
    userMessage: "This action conflicts with existing data.",
    correlationId: "test-correlation-id-409",
    details: {
      conflictingField: "email",
      existingValue: "alice@example.com",
    },
  },

  /**
   * 429 Too Many Requests - Rate limit
   */
  error429: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests",
    userMessage: "You've made too many requests. Please try again later.",
    correlationId: "test-correlation-id-429",
    details: {
      retryAfter: 60,
    },
  },

  /**
   * 500 Internal Server Error
   */
  error500: {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    userMessage: "Something went wrong. Please try again later.",
    correlationId: "test-correlation-id-500",
  },

  /**
   * 502 Bad Gateway
   */
  error502: {
    code: "BAD_GATEWAY",
    message: "Bad gateway",
    userMessage: "Service temporarily unavailable. Please try again.",
    correlationId: "test-correlation-id-502",
  },

  /**
   * 503 Service Unavailable
   */
  error503: {
    code: "SERVICE_UNAVAILABLE",
    message: "Service unavailable",
    userMessage: "Service is temporarily down. Please try again later.",
    correlationId: "test-correlation-id-503",
  },

  /**
   * 504 Gateway Timeout
   */
  error504: {
    code: "GATEWAY_TIMEOUT",
    message: "Gateway timeout",
    userMessage: "Request timed out. Please try again.",
    correlationId: "test-correlation-id-504",
  },

  /**
   * Network error (no response from server)
   */
  networkError: {
    code: "NETWORK_ERROR",
    message: "Network request failed",
    userMessage: "Unable to connect. Please check your internet connection.",
    correlationId: "test-correlation-id-network",
  },
} as const;

/**
 * Combined fixtures export
 */
export const fixtures = {
  api: apiFixtures,
  errors: errorFixtures,
} as const;
