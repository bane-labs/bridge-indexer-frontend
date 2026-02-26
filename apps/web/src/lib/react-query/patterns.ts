/**
 * React Query Patterns and Utilities
 *
 * Standard patterns for queries and mutations with:
 * - Error normalization
 * - Consistent invalidation
 * - Type safety
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api";

import type { ApiError } from "@/lib/api";
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

/**
 * Create a standardized useQuery hook with automatic error normalization.
 *
 * @example
 * ```ts
 * const useUser = createQuery({
 *   queryKey: userKeys.detail,
 *   queryFn: (userId: string) => api.users.get(userId),
 * });
 *
 * // Usage in components
 * const { data, error } = useUser('user-123');
 * if (error) {
 *   console.log(error.shape.userMessage); // Safe user message
 * }
 * ```
 */
export function createQuery<TParams, TData>(config: {
  queryKey: (params: TParams) => readonly unknown[];
  queryFn: (params: TParams) => Promise<TData>;
}) {
  return (
    params: TParams,
    options?: Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn">
  ) => {
    return useQuery<TData, ApiError>({
      queryKey: config.queryKey(params),
      queryFn: async () => {
        try {
          return await config.queryFn(params);
        } catch (error) {
          throw normalizeApiError(error);
        }
      },
      ...options,
    });
  };
}

/**
 * Invalidation pattern configuration for mutations.
 */
export interface InvalidationConfig {
  /**
   * Query keys to invalidate on successful mutation.
   * Can be exact keys or partial keys for broader invalidation.
   */
  invalidateQueries?: readonly unknown[][];

  /**
   * Query keys to remove from cache on successful mutation.
   * Use for deleted resources.
   */
  removeQueries?: readonly unknown[][];

  /**
   * Whether to refetch active queries immediately after invalidation.
   * @default true
   */
  refetchActive?: boolean;
}

/**
 * Create a standardized useMutation hook with automatic invalidation.
 *
 * @example
 * ```ts
 * const useCreateUser = createMutation({
 *   mutationFn: (data: CreateUserData) => api.users.create(data),
 *   invalidation: {
 *     invalidateQueries: [userKeys.lists()], // Invalidate all user lists
 *     refetchActive: true,
 *   },
 * });
 *
 * // Usage in components
 * const { mutate } = useCreateUser();
 * mutate({ email: 'user@example.com', name: 'John' }, {
 *   onSuccess: (user) => {
 *     toast.success(`Created user: ${user.name}`);
 *   },
 * });
 * ```
 */
export function createMutation<TData, TVariables>(config: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidation?: InvalidationConfig;
}) {
  return (options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn">) => {
    const queryClient = useQueryClient();

    return useMutation<TData, ApiError, TVariables>({
      mutationFn: async (variables) => {
        try {
          return await config.mutationFn(variables);
        } catch (error) {
          throw normalizeApiError(error);
        }
      },
      onSuccess: async (data, variables, context) => {
        // Execute user-provided onSuccess first
        await options?.onSuccess?.(data, variables, context);

        // Apply invalidation pattern
        if (config.invalidation?.invalidateQueries) {
          await Promise.all(
            config.invalidation.invalidateQueries.map((queryKey) =>
              queryClient.invalidateQueries({
                queryKey: queryKey as unknown[],
                refetchType: config.invalidation?.refetchActive !== false ? "active" : "none",
              })
            )
          );
        }

        // Remove queries from cache
        if (config.invalidation?.removeQueries) {
          config.invalidation.removeQueries.forEach((queryKey) => {
            queryClient.removeQueries({
              queryKey: queryKey as unknown[],
            });
          });
        }
      },
      ...options,
    });
  };
}

/**
 * Standard invalidation patterns for common operations.
 */
export const invalidationPatterns = {
  /**
   * Invalidate all list queries for a resource after creation.
   * Use this when creating a new item that should appear in lists.
   */
  afterCreate: (baseKey: readonly unknown[]): InvalidationConfig => ({
    invalidateQueries: [[...baseKey, "list"]],
    refetchActive: true,
  }),

  /**
   * Invalidate detail and related lists after update.
   * Use this when updating an item that may affect list filters/sorting.
   */
  afterUpdate: (baseKey: readonly unknown[], id: string): InvalidationConfig => ({
    invalidateQueries: [
      [...baseKey, "detail", id],
      [...baseKey, "list"],
    ],
    refetchActive: true,
  }),

  /**
   * Remove detail and invalidate lists after deletion.
   * Use this when deleting an item.
   */
  afterDelete: (baseKey: readonly unknown[], id: string): InvalidationConfig => ({
    removeQueries: [[...baseKey, "detail", id]],
    invalidateQueries: [[...baseKey, "list"]],
    refetchActive: true,
  }),
} as const;
