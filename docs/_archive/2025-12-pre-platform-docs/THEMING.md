# Theming System

Atlas implements a robust, lightweight theming system using **Tailwind CSS v4** CSS-first
configuration, **without** relying on `next-themes` or a `tailwind.config` file.

## Overview

The theming system provides:

- ✅ Semantic CSS design tokens (background, foreground, primary, etc.)
- ✅ Light, dark, and system preference modes
- ✅ localStorage persistence across sessions
- ✅ System theme synchronization via `prefers-color-scheme`
- ✅ No flash of unstyled content (FOUC) on initial page load
- ✅ Type-safe React hook API
- ✅ Zero external theme dependencies

## Architecture

### 1. CSS Design Tokens

Theme tokens are defined in `/packages/ui/src/styles/globals.css` using CSS custom properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.61 0.11 222);
  --primary-foreground: oklch(0.98 0.02 201);
  /* ... other tokens */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.71 0.13 215);
  --primary-foreground: oklch(0.3 0.05 230);
  /* ... other tokens */
}
```

### 2. Tailwind v4 Integration

Tokens are mapped to Tailwind utilities using `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  /* ... other mappings */
}
```

This enables utilities like:

- `bg-background`
- `text-foreground`
- `border-border`
- `bg-primary text-primary-foreground`

### 3. Theme Application

Themes are applied by toggling the `.dark` class on `<html>`:

```tsx
// Light mode
<html lang="en">

// Dark mode
<html lang="en" class="dark">
```

### 4. No-Flash Bootstrap

A minimal inline script in `apps/web/src/app/layout.tsx` runs before first paint:

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
      (function() {
        const stored = localStorage.getItem("theme-preference") || "system";
        const theme = stored === "system" 
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : stored;
        
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      })();
    `,
    }}
  />
</head>
```

This ensures the correct theme is applied **before** React hydrates, preventing any theme flash.

## Usage

### Basic Hook Usage

```tsx
"use client";

import { useTheme } from "@atlas/ui";

export function MyComponent() {
  const { preference, resolvedTheme, setPreference, toggle, setSystem } = useTheme();

  return (
    <div>
      <p>Current preference: {preference}</p>
      <p>Resolved theme: {resolvedTheme}</p>

      <button onClick={toggle}>Toggle Theme</button>
      <button onClick={() => setPreference("light")}>Light</button>
      <button onClick={() => setPreference("dark")}>Dark</button>
      <button onClick={setSystem}>System</button>
    </div>
  );
}
```

### Hook API

```typescript
type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface UseThemeReturn {
  preference: ThemePreference; // Current stored preference
  resolvedTheme: ResolvedTheme; // Actual applied theme
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void; // Toggles between light/dark
  setSystem: () => void; // Sets to system preference
}
```

### Theme Toggle Component

Atlas includes a pre-built theme toggle:

```tsx
import { ThemeToggle } from "@atlas/ui";

export function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### Using Design Tokens in Components

Use semantic color utilities in your components:

```tsx
export function Card() {
  return (
    <div className="bg-card text-card-foreground border-border rounded-lg border p-4">
      <h2 className="text-foreground font-bold">Title</h2>
      <p className="text-muted-foreground">Description</p>
      <button className="bg-primary text-primary-foreground rounded px-4 py-2">Action</button>
    </div>
  );
}
```

## Available Design Tokens

### Color Tokens

| Token                | Light      | Dark              | Usage              |
| -------------------- | ---------- | ----------------- | ------------------ |
| `background`         | White      | Dark gray         | Main background    |
| `foreground`         | Black      | White             | Main text color    |
| `card`               | White      | Gray              | Card backgrounds   |
| `card-foreground`    | Black      | White             | Card text          |
| `primary`            | Cyan       | Light cyan        | Primary actions    |
| `primary-foreground` | White      | Dark              | Primary text       |
| `secondary`          | Light gray | Gray              | Secondary elements |
| `muted`              | Light gray | Gray              | Muted backgrounds  |
| `muted-foreground`   | Gray       | Light gray        | Muted text         |
| `accent`             | Light gray | Dark gray         | Accent elements    |
| `destructive`        | Red        | Light red         | Error states       |
| `border`             | Gray       | Transparent white | Borders            |
| `input`              | Gray       | Transparent white | Input borders      |
| `ring`               | Cyan       | Light cyan        | Focus rings        |

### Additional Tokens

- **Sidebar**: `sidebar`, `sidebar-foreground`, `sidebar-primary`, etc.
- **Chart**: `chart-1` through `chart-5`
- **Surface**: `surface`, `surface-foreground`
- **Selection**: `selection`, `selection-foreground`

## Adding Custom Themes

To add a new theme variant:

1. **Add CSS tokens** in `globals.css`:

```css
.theme-custom {
  --background: oklch(...);
  --foreground: oklch(...);
  --primary: oklch(...);
  /* ... other tokens */
}
```

2. **Update theme utilities** in `packages/ui/src/hooks/use-theme.ts`:

```typescript
export type ThemePreference = "light" | "dark" | "system" | "custom";
```

3. **Extend the hook** to handle the new theme.

## System Theme Synchronization

When preference is set to `"system"`, the theme automatically:

1. Reads the OS preference via `prefers-color-scheme`
2. Applies the matching theme
3. Subscribes to OS theme changes
4. Updates the theme when OS preference changes

```tsx
const { preference, resolvedTheme } = useTheme();

// User sets preference to "system"
setPreference("system");

// If OS is in dark mode:
// preference === "system"
// resolvedTheme === "dark"

// User switches OS to light mode:
// preference === "system" (unchanged)
// resolvedTheme === "light" (updated automatically)
```

## Persistence

Theme preferences are stored in `localStorage` with the key `"theme-preference"`.

```typescript
localStorage.setItem("theme-preference", "dark");
localStorage.getItem("theme-preference"); // "dark"
```

The system gracefully handles:

- Unavailable localStorage (SSR, private browsing)
- Invalid stored values (falls back to "system")
- Missing values (defaults to "system")

## Implementation Details

### Why No `next-themes`?

- **Zero dependencies**: Reduce bundle size and dependency chain
- **Full control**: Customize behavior without library constraints
- **Tailwind v4 native**: Leverage CSS-first configuration
- **Simpler**: Fewer abstractions, easier to understand and debug

### Why No `tailwind.config`?

Tailwind v4 embraces CSS-first configuration. Theme tokens live in CSS where they belong, not in
JavaScript config files.

### OKLCH Color Space

Atlas uses OKLCH (vs. HSL) for:

- Perceptually uniform color manipulation
- Better color interpolation
- Future-proof color science
- Modern browser support

## Troubleshooting

### Theme Flash on Load

If you see a brief flash:

1. Ensure `suppressHydrationWarning` is on `<html>`
2. Verify the bootstrap script runs in `<head>`
3. Check that script doesn't throw errors

### Theme Not Persisting

1. Check localStorage is available
2. Verify key is `"theme-preference"`
3. Check browser console for errors

### System Theme Not Updating

1. Ensure preference is set to `"system"`
2. Check browser supports `prefers-color-scheme`
3. Verify event listener is attached (check hook implementation)

## Examples

### Conditional Rendering Based on Theme

```tsx
"use client";

import { useTheme } from "@atlas/ui";

export function ThemeAwareComponent() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      {resolvedTheme === "dark" ? (
        <img src="/logo-dark.svg" alt="Logo" />
      ) : (
        <img src="/logo-light.svg" alt="Logo" />
      )}
    </div>
  );
}
```

### Custom Theme Toggle

```tsx
"use client";

import { useTheme } from "@atlas/ui";
import { Moon, Sun } from "lucide-react";

export function SimpleToggle() {
  const { resolvedTheme, toggle } = useTheme();

  return (
    <button onClick={toggle} className="p-2">
      {resolvedTheme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
```

### Reading Preference on Server

The theme preference cannot be read on the server (no localStorage). Use the client hook in client
components only.

```tsx
// ❌ Server Component - Won't work
export default function ServerPage() {
  const { preference } = useTheme(); // Error!
}

// ✅ Client Component - Works
("use client");
export default function ClientPage() {
  const { preference } = useTheme(); // ✓
}
```

## Best Practices

1. **Use semantic tokens**: Prefer `bg-background` over `bg-white`
2. **Client components for theme logic**: Theme state requires client-side hooks
3. **Test both themes**: Always verify UI works in light and dark modes
4. **Respect user preference**: Default to `"system"` when possible
5. **Accessible controls**: Theme toggles should be keyboard accessible

## Files Reference

| File                                              | Purpose                        |
| ------------------------------------------------- | ------------------------------ |
| `/packages/ui/src/styles/globals.css`             | Theme tokens, Tailwind mapping |
| `/packages/ui/src/hooks/use-theme.ts`             | Theme hook and utilities       |
| `/packages/ui/src/components/ui/theme-toggle.tsx` | Pre-built toggle component     |
| `/apps/web/src/app/layout.tsx`                    | Bootstrap script injection     |

---

**Last Updated**: December 23, 2025
