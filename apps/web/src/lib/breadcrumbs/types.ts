/**
 * Breadcrumb Types
 *
 * Type definitions for the tree-based breadcrumb system.
 */

/**
 * A single breadcrumb item to display.
 */
export interface BreadcrumbItem {
  /**
   * Display label for the breadcrumb.
   */
  label: string;

  /**
   * Optional href for navigation.
   * If undefined, the breadcrumb is not clickable (typically the current page).
   */
  href?: string;

  /**
   * Whether this is the current page.
   * Used for accessibility (aria-current="page").
   */
  current?: boolean;
}

/**
 * Context passed to breadcrumb resolvers.
 */
export interface BreadcrumbContext {
  /**
   * Route parameters (e.g., { projectId: "123" }).
   */
  params: Record<string, string>;

  /**
   * Search/query parameters.
   */
  searchParams: Record<string, string>;

  /**
   * Current pathname (e.g., "/projects/123/settings").
   */
  pathname: string;

  /**
   * Translation function for i18n support.
   * Optional; falls back to static labels if not provided.
   */
  t?: (key: string, fallback?: string) => string;
}

/**
 * Function that resolves a breadcrumb item from context.
 *
 * Return:
 * - BreadcrumbItem to display the crumb
 * - null to skip this segment (escape hatch)
 * - Promise for async resolution (e.g., fetching entity names)
 */
export type BreadcrumbResolver = (
  ctx: BreadcrumbContext
) => BreadcrumbItem | null | Promise<BreadcrumbItem | null>;

/**
 * A node in the breadcrumb tree.
 * Represents a route segment that may produce a breadcrumb.
 */
export interface BreadcrumbNode {
  /**
   * The route segment to match.
   * - Static: "projects", "settings"
   * - Parameterized: "[id]", "[projectId]"
   * - Catch-all: "[...slug]"
   */
  segment: string;

  /**
   * Optional resolver to generate the breadcrumb item.
   * If not provided, the segment is skipped in the breadcrumb trail.
   */
  resolver?: BreadcrumbResolver;

  /**
   * Child nodes for nested routes.
   */
  children?: BreadcrumbNode[];

  /**
   * Whether to inherit parent breadcrumbs.
   * Default: true
   *
   * Set to false if a route should start a fresh breadcrumb trail.
   */
  inherit?: boolean;
}

/**
 * Options for the breadcrumb builder.
 */
export interface BuildBreadcrumbsOptions {
  /**
   * Current pathname.
   */
  pathname: string;

  /**
   * Route parameters.
   */
  params: Record<string, string>;

  /**
   * Search parameters.
   */
  searchParams: Record<string, string>;

  /**
   * The breadcrumb tree to match against.
   */
  tree: BreadcrumbNode[];

  /**
   * Optional translation function.
   */
  t?: (key: string, fallback?: string) => string;
}
