"use client";

/**
 * Demo Shell Component
 *
 * Application shell specifically for the demo section.
 * Provides sidebar navigation to all demo pages.
 *
 * @module app/demo/components/DemoShell
 */

import { AlertCircle, Database, FileText, Flag, Home, Lock, Palette, Radio } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn, ThemeToggle } from "@atlas/ui";

import { AppBreadcrumbs } from "@/components/navigation/AppBreadcrumbs";

const demoRoutes = [
  {
    href: "/demo",
    label: "Overview",
    icon: Home,
    description: "Demo landing page",
  },
  {
    href: "/demo/auth",
    label: "Auth",
    icon: Lock,
    description: "Authentication flow",
  },
  {
    href: "/demo/data",
    label: "Data",
    icon: Database,
    description: "React Query + API states",
  },
  {
    href: "/demo/form",
    label: "Form",
    icon: FileText,
    description: "RHF + Zod validation",
  },
  {
    href: "/demo/flags",
    label: "Flags",
    icon: Flag,
    description: "Feature flags & kill switch",
  },
  {
    href: "/demo/observability",
    label: "Observability",
    icon: Radio,
    description: "Sentry + logging",
  },
  {
    href: "/demo/a11y-theme",
    label: "A11y & Theme",
    icon: Palette,
    description: "Accessibility + theming",
  },
];

export interface DemoShellProps {
  children: React.ReactNode;
}

export function DemoShell({ children }: DemoShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background border-border sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">
            Atlas
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Showcase</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-background border-border hidden w-64 shrink-0 border-r md:block">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <nav className="flex flex-col gap-1 p-4">
              <p className="text-muted-foreground mb-2 px-2 text-xs font-medium tracking-wider uppercase">
                Demo Pages
              </p>
              {demoRoutes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{route.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t p-4">
              <div className="rounded-md bg-amber-500/10 p-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Demo Mode</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Data is mocked and in-memory only.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 border-b px-4 py-2 backdrop-blur md:px-6">
            <AppBreadcrumbs />
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
