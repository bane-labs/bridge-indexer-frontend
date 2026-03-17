/**
 * Server-Side API Access
 *
 * Server-only utilities for data fetching in React Server Components.
 * Uses the existing fetchWithContext infrastructure that propagates
 * correlation IDs from the request context.
 *
 * IMPORTANT: This file is server-only and cannot be imported by client components.
 */

import "server-only";

import { headers } from "next/headers";

import { fetchWithContext } from "../http/fetch-with-context.server";

import { getApiBaseUrl } from "./config";
import { ApiError, normalizeApiError } from "./errors";

import type { ApiErrorShape } from "./errors";

/**
 * Server-side API request options.
 */
export interface ServerApiRequestOptions extends Omit<RequestInit, "body"> {
  /**
   * Request body. Will be JSON-stringified automatically.
   */
  body?: unknown;
}

async function buildServerApiUrl(endpoint: string, baseUrl: string): Promise<string> {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return `${baseUrl.replace(/\/$/, "")}${normalizedEndpoint}`;
  }

  if (baseUrl.startsWith("/")) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const forwardedProto = requestHeaders.get("x-forwarded-proto");

    if (!host) {
      throw new Error("Unable to resolve request host for relative API base URL");
    }

    const proto = forwardedProto ?? (host.includes("localhost") ? "http" : "https");
    const normalizedBase = baseUrl.replace(/\/$/, "");
    return `${proto}://${host}${normalizedBase}${normalizedEndpoint}`;
  }

  throw new Error(`Invalid API base URL: ${baseUrl}`);
}

/**
 * Make a server-side API request.
 * Uses fetchWithContext to propagate correlation IDs from request context.
 *
 * @param endpoint - API endpoint (will be prefixed with base URL)
 * @param options - Request options
 * @returns Parsed response data
 * @throws ApiError on failure
 *
 * @example
 * ```ts
 * // In a Server Component
 * import { serverApiRequest } from '@/lib/api/server';
 *
 * export default async function UserPage({ params }: { params: { id: string } }) {
 *   const user = await serverApiRequest<User>(`/users/${params.id}`);
 *   return <div>{user.name}</div>;
 * }
 * ```
 */
export async function serverApiRequest<T>(
  endpoint: string,
  options: ServerApiRequestOptions = {}
): Promise<T> {
  const { body, ...fetchOptions } = options;

  const baseUrl = await getApiBaseUrl();
  const url = await buildServerApiUrl(endpoint, baseUrl);

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

  // Prepare request init
  const requestInit: RequestInit = {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  try {
    // Use fetchWithContext to propagate correlation IDs
    const response = await fetchWithContext(url, requestInit);

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
        const correlationId = response.headers.get("x-request-id") ?? undefined;
        throw new ApiError(
          {
            code: "INVALID_RESPONSE",
            message: "Failed to parse response JSON",
            userMessage: "Received an invalid response from the server.",
            correlationId,
          },
          response.status,
          error
        );
      }
    }

    // Handle error responses
    let errorShape: ApiErrorShape;
    const correlationId = response.headers.get("x-request-id") ?? undefined;

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
          correlationId,
          details: errorBody.details,
        };
      } else {
        // Non-standard error response
        errorShape = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          userMessage: getDefaultUserMessage(response.status),
          correlationId,
          details: errorBody,
        };
      }
    } catch {
      // Failed to parse error body
      errorShape = {
        code: `HTTP_${response.status}`,
        message: `HTTP ${response.status}: ${response.statusText}`,
        userMessage: getDefaultUserMessage(response.status),
        correlationId,
      };
    }

    throw new ApiError(errorShape, response.status);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

/**
 * Get default user-facing message for HTTP status codes.
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
 * Convenience method for server-side GET requests.
 */
export async function serverApiGet<T>(
  endpoint: string,
  options?: Omit<ServerApiRequestOptions, "method" | "body">
): Promise<T> {
  return serverApiRequest<T>(endpoint, { ...options, method: "GET" });
}

/**
 * Convenience method for server-side POST requests.
 */
export async function serverApiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ServerApiRequestOptions, "method" | "body">
): Promise<T> {
  return serverApiRequest<T>(endpoint, { ...options, method: "POST", body });
}

/**
 * Convenience method for server-side PUT requests.
 */
export async function serverApiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ServerApiRequestOptions, "method" | "body">
): Promise<T> {
  return serverApiRequest<T>(endpoint, { ...options, method: "PUT", body });
}

/**
 * Convenience method for server-side PATCH requests.
 */
export async function serverApiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<ServerApiRequestOptions, "method" | "body">
): Promise<T> {
  return serverApiRequest<T>(endpoint, { ...options, method: "PATCH", body });
}

/**
 * Convenience method for server-side DELETE requests.
 */
export async function serverApiDelete<T>(
  endpoint: string,
  options?: Omit<ServerApiRequestOptions, "method" | "body">
): Promise<T> {
  return serverApiRequest<T>(endpoint, { ...options, method: "DELETE" });
}
