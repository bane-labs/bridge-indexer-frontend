/**
 * Users Feature
 *
 * Example feature module demonstrating Atlas data fetching patterns.
 *
 * This module showcases:
 * - Query key factories for consistent cache management
 * - Type-safe React Query hooks using OpenAPI contracts
 * - Standardized error handling with ApiError
 * - Smart cache invalidation patterns for mutations
 * - "No fetch spaghetti" - all API calls through central client
 */

export { userKeys } from "./keys";
export { useCreateUser, useDeleteUser, useUpdateUser } from "./mutations";
export { useUser, useUserList } from "./queries";
