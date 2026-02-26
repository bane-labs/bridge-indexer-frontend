"use client";

/**
 * AppBreadcrumbs Component
 *
 * Application-level breadcrumb component that integrates with the breadcrumb system.
 * Uses the useBreadcrumbs hook and renders using shadcn/ui breadcrumb primitives.
 *
 * Usage:
 * ```tsx
 * // In your app shell layout
 * <AppBreadcrumbs />
 * ```
 */

import { HomeIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@atlas/ui";

import { useBreadcrumbs } from "@/lib/breadcrumbs/use-breadcrumbs";

import type { BreadcrumbItem as BreadcrumbItemType } from "@/lib/breadcrumbs";

export interface AppBreadcrumbsProps {
  /**
   * Additional CSS classes.
   */
  className?: string;

  /**
   * Whether to show a home icon instead of text.
   * Default: true
   */
  showHomeIcon?: boolean;

  /**
   * Maximum number of items to display before truncating.
   * Set to 0 or undefined to disable truncation.
   */
  maxItems?: number;
}

/**
 * Render breadcrumb items (for use with custom rendering).
 */
export function BreadcrumbItems({ items }: { items: BreadcrumbItemType[] }) {
  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={item.href || item.label}>
          <BreadcrumbItem>
            {item.current || !item.href ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={item.href}>{item.label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {index < items.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ))}
    </>
  );
}

/**
 * Application breadcrumb component with integrated hook.
 */
export function AppBreadcrumbs({ className, showHomeIcon = true, maxItems }: AppBreadcrumbsProps) {
  const { items } = useBreadcrumbs();

  // Don't render if no items or only home
  if (items.length <= 1) {
    return null;
  }

  // Apply truncation if maxItems is set
  let displayItems = items;
  if (maxItems && maxItems > 0 && items.length > maxItems && items[0]) {
    // Keep first and last (maxItems - 1) items
    displayItems = [items[0], ...items.slice(-(maxItems - 1))];
  }

  // Replace first item label with home icon if requested
  const renderItems = displayItems.map((item, index) => {
    if (index === 0 && showHomeIcon && item.href === "/") {
      return {
        ...item,
        label: "",
        icon: <HomeIcon className="size-4" />,
      };
    }
    return item;
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {renderItems.map((item, index) => {
          const hasIcon = "icon" in item && item.icon;
          const isHomeIcon = index === 0 && showHomeIcon && item.href === "/";

          return (
            <React.Fragment key={item.href || item.label || index}>
              <BreadcrumbItem>
                {item.current || !item.href ? (
                  <BreadcrumbPage>{hasIcon ? item.icon : item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} aria-label={isHomeIcon ? "Home" : undefined}>
                      {hasIcon ? item.icon : item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < renderItems.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default AppBreadcrumbs;
