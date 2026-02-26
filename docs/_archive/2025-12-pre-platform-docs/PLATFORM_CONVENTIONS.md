# Platform Conventions

This document covers the Atlas platform's foundational patterns for layouts, navigation, error
handling, notifications, and internationalization.

## Table of Contents

1. [Layout Conventions](#layout-conventions)
2. [Breadcrumb System](#breadcrumb-system)
3. [Error Patterns](#error-patterns)
4. [Notifications](#notifications)
5. [i18n-Ready Conventions](#i18n-ready-conventions)

---

## Layout Conventions

Atlas uses a three-tier layout hierarchy for consistent structure across the application.

### Layout Hierarchy

```
┌─────────────────────────────────────────────┐
│ Root Layout (app/layout.tsx)                │
│ - <html>, <body>                            │
│ - Global providers (MainProvider)           │
│ - Global styles                             │
│ - Toaster mount point                       │
├─────────────────────────────────────────────┤
│ App Shell Layout (app/(app)/layout.tsx)     │
│ - Header/TopNav                             │
│ - Sidebar/SideNav                           │
│ - Breadcrumbs                               │
│ - Main content area                         │
├─────────────────────────────────────────────┤
│ Nested Layouts (feature-specific)           │
│ - app/(app)/settings/layout.tsx             │
│ - app/(app)/admin/layout.tsx                │
│ - app/(app)/projects/[id]/layout.tsx        │
└─────────────────────────────────────────────┘
```

### Root Layout

Located at `app/layout.tsx`. Contains only:

- `<html>` and `<body>` tags
- Global providers (via `MainProvider`)
- Global styles
- Theme initialization script
- Toaster component

**Do not add** navigation or section-specific UI here.

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainProvider>
          {children}
          <Toaster />
        </MainProvider>
      </body>
    </html>
  );
}
```

### App Shell Layout

Located at `app/(app)/layout.tsx`. Provides consistent app chrome:

```tsx
// app/(app)/layout.tsx
import { AppShell } from "@/components/layout";

export default function AppLayout({ children }) {
  return (
    <AppShell header={<YourHeader />} sidebar={<YourSidebar />} showBreadcrumbs={true}>
      {children}
    </AppShell>
  );
}
```

### Nested Layouts

For feature sections that need custom layout adjustments:

```tsx
// app/(app)/settings/layout.tsx
export default function SettingsLayout({ children }) {
  return (
    <div className="mx-auto max-w-4xl">
      <SettingsTabs />
      {children}
    </div>
  );
}
```

### Adding a New Section

1. Create a folder under `app/(app)/your-section/`
2. Add `layout.tsx` if custom layout is needed
3. Add pages as `page.tsx`
4. Add `error.tsx` for section-specific error handling (optional)

---

## Breadcrumb System

Atlas uses a **tree-based breadcrumb system** with resolver inheritance.

### How It Works

1. **Tree Structure**: Routes are defined as a tree matching the file system
2. **Resolvers**: Each node can have a resolver that generates the breadcrumb label
3. **Inheritance**: Child routes automatically include parent breadcrumbs
4. **Async Support**: Resolvers can be async (e.g., fetch entity names)

### Adding a Breadcrumb Node

Edit `src/lib/breadcrumbs/tree.ts`:

```tsx
import { staticResolver, i18nResolver, paramResolver } from "./builder";

export const breadcrumbTree: BreadcrumbNode[] = [
  {
    segment: "projects",
    resolver: staticResolver("Projects"),
    children: [
      {
        segment: "[projectId]",
        resolver: paramResolver("projectId", async (id) => {
          // Optionally fetch project name
          const project = await fetchProject(id);
          return project.name;
        }),
        children: [
          {
            segment: "settings",
            resolver: i18nResolver("nav.settings", "Settings"),
          },
        ],
      },
    ],
  },
];
```

### Resolver Types

| Resolver                           | Use Case          | Example                            |
| ---------------------------------- | ----------------- | ---------------------------------- |
| `staticResolver(label)`            | Fixed labels      | `staticResolver("Dashboard")`      |
| `i18nResolver(key, fallback)`      | Translated labels | `i18nResolver("nav.home", "Home")` |
| `paramResolver(param, formatter?)` | Dynamic params    | `paramResolver("projectId")`       |
| Custom function                    | Full control      | `(ctx) => ({ label: ... })`        |

### Skipping a Segment

Return `null` from a resolver to skip that segment:

```tsx
{
  segment: "internal",
  resolver: () => null, // Skipped in breadcrumb trail
  children: [...]
}
```

### Starting Fresh (No Inheritance)

Set `inherit: false` to start a new breadcrumb trail:

```tsx
{
  segment: "admin",
  resolver: staticResolver("Admin"),
  inherit: false, // Parent crumbs not included
}
```

### Using Breadcrumbs in Components

```tsx
import { useBreadcrumbs } from "@/lib/breadcrumbs";

function MyComponent() {
  const { items, isLoading } = useBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb">
      {items.map((item) => (
        <span key={item.href}>{item.label}</span>
      ))}
    </nav>
  );
}
```

---

## Error Patterns

Atlas provides consistent error handling at multiple levels.

### Route-Level Errors (error.tsx)

Catches errors within a route segment. Preserves parent layouts.

```tsx
// app/(app)/error.tsx
"use client";

import { ErrorFallback } from "@atlas/ui";

export default function Error({ error, reset }) {
  return <ErrorFallback error={error} correlationId={error.digest} onRetry={reset} />;
}
```

### Global Errors (global-error.tsx)

Catches catastrophic errors including root layout failures. Must render `<html>` and `<body>`.

```tsx
// app/global-error.tsx
"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        {/* Inline styles since CSS may have failed */}
        <h1>Something went wrong</h1>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

### Component-Level ErrorBoundary

For non-route errors in specific components:

```tsx
import { ErrorBoundary } from "@/components/errors";

<ErrorBoundary onError={(error) => console.error(error)} showNotification={true}>
  <DangerousComponent />
</ErrorBoundary>;
```

### Correlation IDs

Always surface correlation IDs in error UI:

```tsx
<ErrorFallback error={error} correlationId={error.digest || apiError?.shape?.correlationId} />
```

---

## Notifications

Consistent toast notifications via the `notify` wrapper.

### Basic Usage

```tsx
import { notify } from "@/lib/notifications";

// Success
notify.success("Changes saved!");

// Error
notify.error("Something went wrong");

// Info
notify.info("New version available");

// Warning
notify.warning("Session expires soon");
```

### With Options

```tsx
notify.success("Profile updated", {
  description: "Your changes are now live",
  duration: 5000,
  action: {
    label: "Undo",
    onClick: handleUndo,
  },
});
```

### API Error Helper

Normalizes errors and shows user-friendly messages:

```tsx
import { notifyApiError } from "@/lib/notifications";

try {
  await api.updateUser(data);
  notify.success("Profile updated");
} catch (err) {
  notifyApiError(err); // Shows userMessage + correlationId
}
```

### Promise Tracking

```tsx
notify.promise(saveData(), {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed to save",
});
```

### Loading States

```tsx
const id = notify.loading("Uploading...");
// ... after completion
notify.dismiss(id);
notify.success("Upload complete!");
```

---

## i18n-Ready Conventions

Atlas is prepared for localization without adding heavy i18n libraries.

### String Location

All translatable strings live in `src/lib/i18n/strings/`:

```
src/lib/i18n/
├── types.ts          # Locale types
├── t.ts              # Translation function
├── index.ts          # Public exports
└── strings/
    └── en.ts         # English strings
```

### Using t()

```tsx
import { t } from "@/lib/i18n";

// Simple lookup
t("errors.generic"); // "Something went wrong"

// With fallback
t("errors.custom", "Custom fallback");

// With replacements
import { tReplace } from "@/lib/i18n";
tReplace("greeting", { name: "World" }); // "Hello, World!"
```

### String Organization

```ts
// src/lib/i18n/strings/en.ts
export const en = {
  common: {
    loading: "Loading",
    tryAgain: "Try again",
    // ...
  },
  errors: {
    generic: "Something went wrong",
    // ...
  },
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    // ...
  },
};
```

### Rules

| Component Type     | String Source                       |
| ------------------ | ----------------------------------- |
| Shared/Platform UI | Always use `t()`                    |
| Feature pages      | Inline strings OK, but prefer `t()` |
| Error messages     | Always use `t("errors.*")`          |
| Navigation         | Always use `t("nav.*")`             |

### Adding a New Locale (Future)

1. Create `src/lib/i18n/strings/<locale>.ts`
2. Add locale to `AVAILABLE_LOCALES` in `types.ts`
3. Update `t.ts` to select strings based on current locale

---

## Quick Reference

### Files Created/Modified

| File                                           | Purpose                       |
| ---------------------------------------------- | ----------------------------- |
| `src/lib/i18n/`                                | i18n strings and t() function |
| `src/lib/breadcrumbs/`                         | Breadcrumb tree system        |
| `src/lib/notifications/`                       | Notification wrapper          |
| `src/components/layout/AppShell.tsx`           | App shell component           |
| `src/components/navigation/AppBreadcrumbs.tsx` | Breadcrumb UI                 |
| `src/components/errors/ErrorBoundary.tsx`      | Component error boundary      |
| `app/(app)/layout.tsx`                         | App shell layout              |
| `app/(app)/error.tsx`                          | Route error handler           |
| `app/global-error.tsx`                         | Global error handler          |

### Import Paths

```tsx
// Layout
import { AppShell } from "@/components/layout";

// Navigation
import { AppBreadcrumbs } from "@/components/navigation";

// Errors
import { ErrorBoundary } from "@/components/errors";

// Breadcrumbs
import { buildBreadcrumbs, useBreadcrumbs } from "@/lib/breadcrumbs";

// Notifications
import { notify, notifyApiError } from "@/lib/notifications";

// i18n
import { t, tReplace } from "@/lib/i18n";
```
