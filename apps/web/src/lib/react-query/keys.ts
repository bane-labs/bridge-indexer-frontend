/**
 * React Query Key Factories
 *
 * Standardized query key generation for consistent cache management.
 *
 * Query keys should be:
 * - Hierarchical (general → specific)
 * - Deterministic (same inputs → same keys)
 * - Serializable (no functions, only data)
 *
 * Pattern:
 * - ['resource'] - all queries for this resource
 * - ['resource', 'list'] - all list queries
 * - ['resource', 'list', params] - specific list query
 * - ['resource', 'detail', id] - specific detail query
 */

/**
 * Generic query key factory for a resource.
 * Provides standardized key structures for common query patterns.
 *
 * @example
 * ```ts
 * const userKeys = createQueryKeys('users');
 *
 * // All user queries
 * userKeys.all() // ['users']
 *
 * // All user list queries
 * userKeys.lists() // ['users', 'list']
 *
 * // Specific user list query
 * userKeys.list({ page: 1, search: 'john' })
 * // ['users', 'list', { page: 1, search: 'john' }]
 *
 * // Specific user detail
 * userKeys.detail('user-123')
 * // ['users', 'detail', 'user-123']
 * ```
 */
export function createQueryKeys<TResource extends string>(resource: TResource) {
  return {
    /**
     * Base key for all queries of this resource.
     * Used for invalidating ALL queries related to this resource.
     */
    all: () => [resource] as const,

    /**
     * Base key for all list queries of this resource.
     * Used for invalidating all list queries (e.g., after create/delete).
     */
    lists: () => [resource, "list"] as const,

    /**
     * Specific list query with parameters.
     * Parameters are automatically sorted and serialized for consistent keys.
     */
    list: (params?: Record<string, unknown>) => [resource, "list", params ?? {}] as const,

    /**
     * Base key for all detail queries of this resource.
     * Used for invalidating all detail queries.
     */
    details: () => [resource, "detail"] as const,

    /**
     * Specific detail query for a single resource by ID.
     */
    detail: (id: string) => [resource, "detail", id] as const,

    /**
     * Custom query key for specialized queries.
     * Use this for queries that don't fit list/detail patterns.
     */
    custom: (key: string, params?: Record<string, unknown>) =>
      [resource, key, params ?? {}] as const,
  };
}

/**
 * Predefined query keys for the users resource.
 */
export const userKeys = createQueryKeys("users");

/**
 * Predefined query keys for the system resource.
 */
export const systemKeys = createQueryKeys("system");

/**
 * Type helper to extract query key from a query key factory.
 */
export type QueryKey<T> = T extends (...args: unknown[]) => infer R ? R : never;
