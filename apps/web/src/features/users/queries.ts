/**
 * User Queries
 *
 * React Query hooks for fetching user data.
 * All queries use the typed API client and standardized error handling.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/contracts";
import { normalizeApiError } from "@/lib/api/errors";

import { userKeys } from "./keys";

import type { components } from "@/lib/api/contracts";
import type { ApiError } from "@/lib/api/errors";

type User = components["schemas"]["User"];
type UserListResponse = components["schemas"]["UserListResponse"];

/**
 * Query hook for fetching a list of users.
 *
 * Features:
 * - Pagination support
 * - Search filtering
 * - Automatic error normalization
 * - Type-safe response
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { data, error, isLoading } = useUserList({ page: 1, pageSize: 20 });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {getUserFacingMessage(error)}</div>;
 *
 *   return (
 *     <ul>
 *       {data.data.map(user => (
 *         <li key={user.id}>{user.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useUserList(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery<UserListResponse, ApiError>({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      try {
        return await api.users.list(params);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}

/**
 * Query hook for fetching a single user by ID.
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, error, isLoading } = useUser(userId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {getUserFacingMessage(error)}</div>;
 *   if (!user) return <div>User not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser(userId: string) {
  return useQuery<User, ApiError>({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      try {
        return await api.users.get(userId);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    enabled: Boolean(userId), // Only run query if userId is provided
  });
}
