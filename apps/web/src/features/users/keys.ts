/**
 * User Query Keys
 *
 * Standardized query keys for user-related queries.
 * Exported from this feature module for use throughout the app.
 */

import { createQueryKeys } from "@/lib/react-query";

/**
 * Query keys for all user-related queries.
 *
 * @example
 * ```ts
 * // All user queries
 * userKeys.all() // ['users']
 *
 * // All user list queries
 * userKeys.lists() // ['users', 'list']
 *
 * // Specific user list with filters
 * userKeys.list({ page: 1, search: 'john' })
 * // ['users', 'list', { page: 1, search: 'john' }]
 *
 * // Specific user detail
 * userKeys.detail('user-123')
 * // ['users', 'detail', 'user-123']
 * ```
 */
export const userKeys = createQueryKeys("users");
