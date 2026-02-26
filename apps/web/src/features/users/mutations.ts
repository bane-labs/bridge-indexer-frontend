/**
 * User Mutations
 *
 * React Query mutation hooks for user data modifications.
 * All mutations use the typed API client, automatic error handling,
 * and standardized cache invalidation patterns.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/contracts";
import { normalizeApiError } from "@/lib/api/errors";

import { userKeys } from "./keys";

import type { components, paths } from "@/lib/api/contracts";
import type { ApiError } from "@/lib/api/errors";

type User = components["schemas"]["User"];
type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];
type UpdateUserRequest =
  paths["/users/{userId}"]["patch"]["requestBody"]["content"]["application/json"];

/**
 * Mutation hook for creating a new user.
 *
 * Features:
 * - Type-safe request/response
 * - Automatic error normalization
 * - Cache invalidation (refreshes user lists)
 *
 * @example
 * ```tsx
 * function CreateUserForm() {
 *   const createUser = useCreateUser();
 *
 *   const handleSubmit = (data: CreateUserRequest) => {
 *     createUser.mutate(data, {
 *       onSuccess: (user) => {
 *         toast.success(`Created user: ${user.name}`);
 *       },
 *       onError: (error) => {
 *         toast.error(getUserFacingMessage(error));
 *       },
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, CreateUserRequest>({
    mutationFn: async (data) => {
      try {
        return await api.users.create(data);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: () => {
      // Invalidate all user list queries to show new user
      void queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

/**
 * Mutation hook for updating an existing user.
 *
 * Features:
 * - Type-safe request/response
 * - Automatic error normalization
 * - Smart cache invalidation (detail + lists)
 *
 * @example
 * ```tsx
 * function EditUserForm({ userId }: { userId: string }) {
 *   const updateUser = useUpdateUser();
 *
 *   const handleSubmit = (data: UpdateUserRequest) => {
 *     updateUser.mutate({ userId, data }, {
 *       onSuccess: (user) => {
 *         toast.success(`Updated user: ${user.name}`);
 *       },
 *       onError: (error) => {
 *         toast.error(getUserFacingMessage(error));
 *       },
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, { userId: string; data: UpdateUserRequest }>({
    mutationFn: async ({ userId, data }) => {
      try {
        return await api.users.update(userId, data);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: (updatedUser) => {
      // Invalidate the specific user detail query
      void queryClient.invalidateQueries({
        queryKey: userKeys.detail(updatedUser.id),
      });

      // Invalidate all user list queries (user might appear/disappear based on filters)
      void queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

/**
 * Mutation hook for deleting a user.
 *
 * Features:
 * - Type-safe request
 * - Automatic error normalization
 * - Cache cleanup (removes detail, invalidates lists)
 *
 * @example
 * ```tsx
 * function DeleteUserButton({ userId }: { userId: string }) {
 *   const deleteUser = useDeleteUser();
 *
 *   const handleDelete = () => {
 *     if (!confirm('Are you sure?')) return;
 *
 *     deleteUser.mutate(userId, {
 *       onSuccess: () => {
 *         toast.success('User deleted');
 *       },
 *       onError: (error) => {
 *         toast.error(getUserFacingMessage(error));
 *       },
 *     });
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 * ```
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (userId) => {
      try {
        return await api.users.delete(userId);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: (_data, userId) => {
      // Remove the specific user detail from cache
      queryClient.removeQueries({
        queryKey: userKeys.detail(userId),
      });

      // Invalidate all user list queries to remove deleted user
      void queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
