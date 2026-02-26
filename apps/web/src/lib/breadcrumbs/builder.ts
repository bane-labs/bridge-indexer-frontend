/**
 * Breadcrumb Builder
 *
 * Builds a breadcrumb trail by matching the current pathname against a tree structure.
 * Supports parameterized routes, async resolvers, and inheritance control.
 */

import type {
  BreadcrumbContext,
  BreadcrumbItem,
  BreadcrumbNode,
  BuildBreadcrumbsOptions,
} from "./types";

/**
 * Check if a segment is a parameterized segment (e.g., "[id]", "[projectId]").
 */
function isParamSegment(segment: string): boolean {
  return segment.startsWith("[") && segment.endsWith("]");
}

/**
 * Check if a segment is a catch-all segment (e.g., "[...slug]").
 */
function isCatchAllSegment(segment: string): boolean {
  return segment.startsWith("[...") && segment.endsWith("]");
}

/**
 * Find a matching child node for a path segment.
 */
function findMatchingNode(
  nodes: BreadcrumbNode[] | undefined,
  pathSegment: string
): BreadcrumbNode | undefined {
  if (!nodes) {
    return undefined;
  }

  // First, try exact match
  const exactMatch = nodes.find((node) => node.segment === pathSegment);
  if (exactMatch) {
    return exactMatch;
  }

  // Then, try parameterized match
  const paramMatch = nodes.find(
    (node) => isParamSegment(node.segment) || isCatchAllSegment(node.segment)
  );
  if (paramMatch) {
    return paramMatch;
  }

  return undefined;
}

/**
 * Build the href for a breadcrumb item.
 */
function buildHref(segments: string[], index: number): string {
  const path = `/${segments.slice(0, index + 1).join("/")}`;
  return path || "/";
}

/**
 * Build breadcrumb items from a pathname and tree.
 *
 * @param options - Build options including pathname, params, tree, etc.
 * @returns Promise resolving to array of breadcrumb items
 *
 * @example
 * ```ts
 * const items = await buildBreadcrumbs({
 *   pathname: "/projects/123/settings",
 *   params: { projectId: "123" },
 *   searchParams: {},
 *   tree: breadcrumbTree,
 * });
 * // [{ label: "Projects", href: "/projects" }, { label: "Project 123", href: "/projects/123" }, { label: "Settings", current: true }]
 * ```
 */
export async function buildBreadcrumbs(
  options: BuildBreadcrumbsOptions
): Promise<BreadcrumbItem[]> {
  const { pathname, params, searchParams, tree, t: translateFn } = options;

  // Split pathname into segments, filtering out empty strings
  const pathSegments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [];
  let currentNodes: BreadcrumbNode[] | undefined = tree;

  // Build context for resolvers
  const context: BreadcrumbContext = {
    params,
    searchParams,
    pathname,
    t: translateFn,
  };

  // Traverse path segments and match against tree
  for (let i = 0; i < pathSegments.length; i++) {
    const pathSegment = pathSegments[i];
    if (!pathSegment) continue;

    const node = findMatchingNode(currentNodes, pathSegment);

    if (!node) {
      // No matching node; stop traversing
      break;
    }

    // Check inheritance - clears parent crumbs if false
    if (node.inherit === false) {
      items.length = 0;
    }

    // Resolve breadcrumb if resolver exists
    if (node.resolver) {
      try {
        const item = await node.resolver(context);

        if (item !== null) {
          const isLast = i === pathSegments.length - 1;

          items.push({
            label: item.label,
            href: isLast ? undefined : (item.href ?? buildHref(pathSegments, i)),
            current: isLast || item.current,
          });
        }
      } catch {
        // Resolver failed - skip this breadcrumb but continue chain
      }
    }

    // Move to children for next segment
    currentNodes = node.children;
  }

  // Ensure the last item is marked as current and has no href
  const lastItem = items[items.length - 1];
  if (lastItem) {
    lastItem.current = true;
    lastItem.href = undefined;
  }

  return items;
}

/**
 * Create a simple static resolver.
 *
 * @param label - The label to display
 * @param href - Optional custom href
 *
 * @example
 * ```ts
 * const node = {
 *   segment: "settings",
 *   resolver: staticResolver("Settings"),
 * };
 * ```
 */
export function staticResolver(label: string, href?: string): () => BreadcrumbItem {
  return () => ({ label, href });
}

/**
 * Create a resolver that uses the translation function.
 *
 * @param key - The translation key
 * @param fallback - Fallback if translation not found
 *
 * @example
 * ```ts
 * const node = {
 *   segment: "settings",
 *   resolver: i18nResolver("nav.settings", "Settings"),
 * };
 * ```
 */
export function i18nResolver(
  key: string,
  fallback: string
): (ctx: BreadcrumbContext) => BreadcrumbItem {
  return (ctx) => ({
    label: ctx.t ? ctx.t(key, fallback) : fallback,
  });
}

/**
 * Create a resolver for parameterized routes.
 *
 * @param paramName - The parameter name to extract
 * @param formatter - Optional function to format the param value
 *
 * @example
 * ```ts
 * const node = {
 *   segment: "[projectId]",
 *   resolver: paramResolver("projectId", (id) => `Project ${id}`),
 * };
 * ```
 */
export function paramResolver(
  paramName: string,
  formatter?: (value: string, ctx: BreadcrumbContext) => string | Promise<string>
): (ctx: BreadcrumbContext) => BreadcrumbItem | Promise<BreadcrumbItem> {
  return async (ctx) => {
    const value = ctx.params[paramName] || paramName;
    const label = formatter ? await formatter(value, ctx) : value;
    return { label };
  };
}
