/**
 * Typed API Client using OpenAPI-generated types
 *
 * Wrapper around the central API client that provides type-safe
 * access to API endpoints defined in the OpenAPI specification.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "../client";

import type { paths } from "./schema";

/**
 * Type-safe API client for the users resource.
 *
 * All methods use the generated OpenAPI types for request/response contracts.
 */
export const usersApi = {
  /**
   * List users with pagination and search.
   */
  list: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const endpoint = query ? `/users?${query}` : "/users";

    return apiGet<paths["/users"]["get"]["responses"]["200"]["content"]["application/json"]>(
      endpoint
    );
  },

  /**
   * Create a new user.
   */
  create: async (data: paths["/users"]["post"]["requestBody"]["content"]["application/json"]) => {
    return apiPost<paths["/users"]["post"]["responses"]["201"]["content"]["application/json"]>(
      "/users",
      data
    );
  },

  /**
   * Get a user by ID.
   */
  get: async (userId: string) => {
    return apiGet<
      paths["/users/{userId}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/users/${userId}`);
  },

  /**
   * Update a user.
   */
  update: async (
    userId: string,
    data: paths["/users/{userId}"]["patch"]["requestBody"]["content"]["application/json"]
  ) => {
    return apiPatch<
      paths["/users/{userId}"]["patch"]["responses"]["200"]["content"]["application/json"]
    >(`/users/${userId}`, data);
  },

  /**
   * Delete a user.
   */
  delete: async (userId: string) => {
    return apiDelete<void>(`/users/${userId}`);
  },
} as const;

/**
 * Type-safe API client for system endpoints.
 */
export const systemApi = {
  /**
   * Health check endpoint.
   */
  health: async () => {
    return apiGet<paths["/health"]["get"]["responses"]["200"]["content"]["application/json"]>(
      "/health"
    );
  },
} as const;

/**
 * Combined typed API client.
 * Use this as the primary interface for all API calls.
 *
 * @example
 * ```ts
 * import { api } from '@/lib/api/contracts';
 *
 * // List users
 * const users = await api.users.list({ page: 1, pageSize: 20 });
 *
 * // Get user by ID
 * const user = await api.users.get('user-123');
 *
 * // Create user
 * const newUser = await api.users.create({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 * });
 * ```
 */
export const api = {
  users: usersApi,
  system: systemApi,
} as const;

// Re-export types for convenience
export type { components, paths } from "./schema";
