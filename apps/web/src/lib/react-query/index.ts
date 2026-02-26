/**
 * React Query Library
 *
 * Centralized React Query utilities for data fetching and caching.
 *
 * Features:
 * - Standardized QueryClient with enterprise defaults
 * - Query key factories for consistent cache management
 * - Mutation patterns with automatic invalidation
 * - Type-safe wrappers around React Query hooks
 */

export { createQueryKeys, type QueryKey, systemKeys, userKeys } from "./keys";
export {
  createMutation,
  createQuery,
  type InvalidationConfig,
  invalidationPatterns,
} from "./patterns";
export { createQueryClient, ReactQueryProvider } from "./provider";
