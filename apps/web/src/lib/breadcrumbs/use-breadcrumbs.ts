"use client";

/**
 * useBreadcrumbs Hook
 *
 * React hook that builds breadcrumb items from the current route.
 * Uses Next.js navigation hooks to access pathname and params.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { items, isLoading } = useBreadcrumbs();
 *   return <Breadcrumbs items={items} />;
 * }
 * ```
 */

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { breadcrumbTree, buildBreadcrumbs } from "@/lib/breadcrumbs";
import { hasTranslation, t as translate, type TranslationKey } from "@/lib/i18n";

import type { BreadcrumbItem, BreadcrumbNode } from "@/lib/breadcrumbs";

export interface UseBreadcrumbsOptions {
  /**
   * Custom breadcrumb tree. Defaults to the application tree.
   */
  tree?: BreadcrumbNode[];

  /**
   * Whether to include the home breadcrumb.
   * Default: true
   */
  includeHome?: boolean;

  /**
   * Home breadcrumb configuration.
   */
  home?: {
    label?: string;
    href?: string;
  };
}

export interface UseBreadcrumbsResult {
  /**
   * The resolved breadcrumb items.
   */
  items: BreadcrumbItem[];

  /**
   * Whether breadcrumbs are currently being resolved.
   */
  isLoading: boolean;

  /**
   * Error if breadcrumb resolution failed.
   */
  error: Error | null;
}

/**
 * Wrapper for t() that accepts any string key.
 * Falls back to the fallback value for unknown keys.
 */
function translateKey(key: string, fallback?: string): string {
  // Check if the key exists in translations before calling t()
  if (hasTranslation(key)) {
    return translate(key as TranslationKey, fallback);
  }
  return fallback ?? key;
}

/**
 * Hook to get breadcrumb items for the current route.
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): UseBreadcrumbsResult {
  const { tree = breadcrumbTree, includeHome = true, home } = options;

  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setIsLoading(true);
      setError(null);

      try {
        // Convert params to Record<string, string>
        const paramsRecord: Record<string, string> = {};
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            if (typeof value === "string") {
              paramsRecord[key] = value;
            } else if (Array.isArray(value)) {
              paramsRecord[key] = value.join("/");
            }
          }
        }

        // Convert searchParams to Record<string, string>
        const searchParamsRecord: Record<string, string> = {};
        if (searchParams) {
          searchParams.forEach((value, key) => {
            searchParamsRecord[key] = value;
          });
        }

        const resolved = await buildBreadcrumbs({
          pathname,
          params: paramsRecord,
          searchParams: searchParamsRecord,
          tree,
          t: translateKey,
        });

        if (cancelled) return;

        // Prepend home breadcrumb if requested and not already on home
        const result: BreadcrumbItem[] = [];

        if (includeHome && pathname !== "/") {
          result.push({
            label: home?.label ?? translate("nav.home", "Home"),
            href: home?.href ?? "/",
          });
        }

        result.push(...resolved);

        setItems(result);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Failed to resolve breadcrumbs"));
        setItems([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [pathname, params, searchParams, tree, includeHome, home]);

  return { items, isLoading, error };
}
