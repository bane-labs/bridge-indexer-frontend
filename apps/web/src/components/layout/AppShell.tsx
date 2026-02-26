"use client";

/**
 * AppShell Component
 *
 * The main application shell that provides consistent layout structure.
 * Includes slots for header, sidebar, and main content with breadcrumbs.
 *
 * Usage:
 * ```tsx
 * <AppShell
 *   header={<TopNav />}
 *   sidebar={<SideNav />}
 * >
 *   {children}
 * </AppShell>
 * ```
 */

import React from "react";

import { cn } from "@atlas/ui";

import { AppBreadcrumbs } from "@/components/navigation/AppBreadcrumbs";

export interface AppShellProps {
  /**
   * Main content to render in the shell.
   */
  children: React.ReactNode;

  /**
   * Optional header component (e.g., top navigation).
   */
  header?: React.ReactNode;

  /**
   * Optional sidebar component (e.g., side navigation).
   */
  sidebar?: React.ReactNode;

  /**
   * Whether to show breadcrumbs.
   * Default: true
   */
  showBreadcrumbs?: boolean;

  /**
   * Additional CSS classes for the shell container.
   */
  className?: string;

  /**
   * Additional CSS classes for the main content area.
   */
  contentClassName?: string;

  /**
   * Whether the sidebar is collapsible.
   * Default: false
   */
  collapsibleSidebar?: boolean;
}

/**
 * Main application shell component.
 * Provides consistent layout with header, sidebar, breadcrumbs, and content.
 */
export function AppShell({
  children,
  header,
  sidebar,
  showBreadcrumbs = true,
  className,
  contentClassName,
}: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      {/* Header */}
      {header && (
        <header className="bg-background border-border sticky top-0 z-50 border-b">{header}</header>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebar && (
          <aside className="bg-background border-border hidden w-64 shrink-0 border-r md:block">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">{sidebar}</div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn("flex-1", contentClassName)}>
          {/* Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 border-b px-4 py-2 backdrop-blur md:px-6">
              <AppBreadcrumbs />
            </div>
          )}

          {/* Page Content */}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
