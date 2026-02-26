/**
 * Breadcrumb Tree Definition
 *
 * Defines the application's breadcrumb structure using a tree-based approach.
 * Each node represents a route segment and optionally provides a resolver.
 *
 * Convention:
 * - Add new routes by adding nodes to the tree
 * - Use staticResolver for simple labels
 * - Use i18nResolver for translated labels
 * - Use paramResolver for dynamic segments
 * - Custom async resolvers can fetch data (e.g., project names)
 */

import { i18nResolver, paramResolver, staticResolver } from "./builder";

import type { BreadcrumbNode } from "./types";

/**
 * The main breadcrumb tree for the application.
 *
 * Structure mirrors the app router file structure.
 * Add new routes by extending this tree.
 */
export const breadcrumbTree: BreadcrumbNode[] = [
  // Dashboard routes
  {
    segment: "dashboard",
    resolver: i18nResolver("nav.dashboard", "Dashboard"),
    children: [
      // Projects
      {
        segment: "project",
        resolver: staticResolver("Projects"),
        children: [
          {
            segment: "[projectId]",
            resolver: paramResolver("projectId", (id, _ctx) => {
              // In a real app, you might fetch the project name here:
              // const project = await fetchProject(id);
              // return project.name;
              return `Project ${id}`;
            }),
            children: [
              {
                segment: "settings",
                resolver: i18nResolver("nav.settings", "Settings"),
                children: [
                  {
                    segment: "build",
                    resolver: staticResolver("Build"),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // Demo routes
  {
    segment: "demo",
    resolver: staticResolver("Demo"),
    children: [
      {
        segment: "auth",
        resolver: staticResolver("Auth"),
      },
      {
        segment: "data",
        resolver: staticResolver("Data"),
      },
      {
        segment: "form",
        resolver: staticResolver("Form"),
      },
      {
        segment: "flags",
        resolver: staticResolver("Flags"),
      },
      {
        segment: "observability",
        resolver: staticResolver("Observability"),
      },
      {
        segment: "a11y-theme",
        resolver: staticResolver("A11y & Theme"),
      },
      {
        segment: "sentry",
        resolver: staticResolver("Sentry"),
      },
    ],
  },

  // Settings (top-level)
  {
    segment: "settings",
    resolver: i18nResolver("nav.settings", "Settings"),
    children: [
      {
        segment: "profile",
        resolver: i18nResolver("nav.profile", "Profile"),
      },
    ],
  },

  // Admin section (example of inherit: false to start fresh trail)
  {
    segment: "admin",
    resolver: i18nResolver("nav.admin", "Admin"),
    // inherit: false, // Uncomment to start fresh breadcrumb trail
    children: [
      {
        segment: "users",
        resolver: staticResolver("Users"),
      },
      {
        segment: "settings",
        resolver: staticResolver("System Settings"),
      },
    ],
  },
];

/**
 * Get the breadcrumb tree.
 * Useful for testing or if you need to modify the tree dynamically.
 */
export function getBreadcrumbTree(): BreadcrumbNode[] {
  return breadcrumbTree;
}
