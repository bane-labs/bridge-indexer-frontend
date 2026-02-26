/**
 * Runtime-Aware API Client Hooks
 *
 * Provides API client functions that use runtime config instead of
 * build-time environment variables.
 *
 * Use these hooks in client components to ensure API calls use the
 * correct runtime-configured base URL.
 *
 * @module api/hooks
 */

"use client";

import { useConfig } from "@/config";

import { apiRequest } from "./client";

import type { ApiRequestOptions } from "./client";

/**
 * Hook to get runtime-configured API base URL.
 *
 * @returns API base URL from runtime config
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const apiBaseUrl = useApiBaseUrl();
 *   return <div>API: {apiBaseUrl}</div>;
 * }
 * ```
 */
export function useApiBaseUrl(): string {
  const config = useConfig();
  return config.api.baseUrl;
}

/**
 * Hook to create runtime-configured API client functions.
 *
 * Returns API client functions that automatically use the runtime-configured
 * base URL instead of build-time env vars.
 *
 * @returns API client functions (get, post, put, patch, delete)
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const api = useApiClient();
 *
 *   const fetchUser = async () => {
 *     const user = await api.get('/users/me');
 *     return user;
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useApiClient() {
  const config = useConfig();
  const apiBaseUrl = config.api.baseUrl;

  return {
    /**
     * Make a GET request.
     */
    get: async <T>(endpoint: string, options?: Omit<ApiRequestOptions, "method" | "body">) => {
      const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`;
      return apiRequest<T>(url, { ...options, method: "GET" });
    },

    /**
     * Make a POST request.
     */
    post: async <T>(
      endpoint: string,
      body?: unknown,
      options?: Omit<ApiRequestOptions, "method" | "body">
    ) => {
      const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`;
      return apiRequest<T>(url, { ...options, method: "POST", body });
    },

    /**
     * Make a PUT request.
     */
    put: async <T>(
      endpoint: string,
      body?: unknown,
      options?: Omit<ApiRequestOptions, "method" | "body">
    ) => {
      const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`;
      return apiRequest<T>(url, { ...options, method: "PUT", body });
    },

    /**
     * Make a PATCH request.
     */
    patch: async <T>(
      endpoint: string,
      body?: unknown,
      options?: Omit<ApiRequestOptions, "method" | "body">
    ) => {
      const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`;
      return apiRequest<T>(url, { ...options, method: "PATCH", body });
    },

    /**
     * Make a DELETE request.
     */
    delete: async <T>(endpoint: string, options?: Omit<ApiRequestOptions, "method" | "body">) => {
      const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`;
      return apiRequest<T>(url, { ...options, method: "DELETE" });
    },
  };
}
