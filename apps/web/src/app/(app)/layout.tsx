/**
 * App Shell Layout
 *
 * This layout wraps all authenticated/app routes with the application shell.
 * It provides consistent navigation, breadcrumbs, and layout structure.
 *
 * Route Group: (app)
 * - Routes within this group share the app shell
 * - The root layout handles providers and global styles
 * - This layout handles app-specific chrome (nav, sidebar, etc.)
 *
 * Convention:
 * - Use this pattern for authenticated sections of the app
 * - Nested layouts within (app) can customize the sidebar or hide breadcrumbs
 * - See /dashboard/project/[projectId]/layout.tsx for nested layout example
 */

import React from "react";

import { AppShell } from "@/components/layout";

import { AppHeader } from "./app-header";

/**
 * Example sidebar component.
 * Replace with your actual sidebar/sidenav component.
 */
function AppSidebar() {
  return (
    <nav className="flex flex-col gap-2 p-4">
      <a href="/dashboard" className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium">
        Dashboard
      </a>
      <a
        href="/dashboard/project"
        className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium"
      >
        Projects
      </a>
      <a href="/settings" className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium">
        Settings
      </a>
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={<AppHeader />} sidebar={<AppSidebar />} showBreadcrumbs={true}>
      {children}
    </AppShell>
  );
}
