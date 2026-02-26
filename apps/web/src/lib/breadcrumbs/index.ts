/**
 * Breadcrumb System
 *
 * Tree-based breadcrumb system with resolver inheritance.
 *
 * Features:
 * - Tree-based route matching
 * - Static, i18n, and parameterized resolvers
 * - Async resolver support (for data fetching)
 * - Inheritance control (inherit: false to start fresh)
 * - Escape hatch (return null to skip a segment)
 *
 * Usage:
 * ```ts
 * import { buildBreadcrumbs, breadcrumbTree } from "@/lib/breadcrumbs";
 *
 * const items = await buildBreadcrumbs({
 *   pathname: "/projects/123/settings",
 *   params: { projectId: "123" },
 *   searchParams: {},
 *   tree: breadcrumbTree,
 * });
 * ```
 */

// Types
export type {
  BreadcrumbContext,
  BreadcrumbItem,
  BreadcrumbNode,
  BreadcrumbResolver,
  BuildBreadcrumbsOptions,
} from "./types";

// Builder and resolvers
export { buildBreadcrumbs, i18nResolver, paramResolver, staticResolver } from "./builder";

// Default tree
export { breadcrumbTree, getBreadcrumbTree } from "./tree";

// React hook
export type { UseBreadcrumbsOptions, UseBreadcrumbsResult } from "./use-breadcrumbs";
export { useBreadcrumbs } from "./use-breadcrumbs";
