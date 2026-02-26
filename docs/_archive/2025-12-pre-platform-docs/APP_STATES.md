# App States Kit

A comprehensive, enterprise-grade UI kit for handling loading, empty, and error states across the
Atlas platform.

## Overview

The App States Kit provides consistent, accessible components for the most common UI states in
data-driven applications:

- **Loader patterns** - Loading indicators for various contexts
- **Skeleton components** - Content placeholders during data fetching
- **EmptyState** - User-friendly "no data" messages
- **ErrorFallback** - Graceful error displays with recovery options

All components follow Atlas design principles:

- ✅ Accessible (ARIA, keyboard navigation, screen readers)
- ✅ Composable and flexible
- ✅ Theme-aware (uses Atlas design tokens)
- ✅ Works in both Client and Server Components
- ✅ Respects reduced motion preferences

## Components

### Loader

Loading indicators for various contexts.

#### Loader (Standard)

```tsx
import { Loader } from "@atlas/ui";

// Basic usage
<Loader />

// With custom label (for screen readers)
<Loader label="Loading products" />

// Size variants
<Loader size="sm" />
<Loader size="md" /> // default
<Loader size="lg" />
```

**Props:**

- `size`: `"sm" | "md" | "lg"` - Size of the spinner
- `label`: `string` - Screen reader label (default: "Loading")
- `className`: `string` - Additional CSS classes

**Accessibility:**

- `role="status"` - Announces loading state
- `aria-live="polite"` - Non-intrusive updates
- `aria-label` - Screen reader description

---

#### InlineLoader

Compact loader for buttons and inline contexts.

```tsx
import { InlineLoader } from "@atlas/ui";

// In a button
<button disabled>
  <InlineLoader label="Saving" />
  Saving...
</button>

// Inline with text
<div className="flex items-center gap-2">
  <InlineLoader />
  <span>Processing your request</span>
</div>
```

**Props:**

- `label`: `string` - Screen reader label (default: "Loading")
- `className`: `string` - Additional CSS classes

**Best practices:**

- Use for loading states that shouldn't shift layout
- Keep near associated content for context

---

#### PageLoader

Full-page loading indicator with optional title and description.

```tsx
import { PageLoader } from "@atlas/ui";

// Basic
<PageLoader />

// With title
<PageLoader title="Loading dashboard" />

// With title and description
<PageLoader
  title="Loading your data"
  description="This may take a few moments..."
  size="lg"
/>
```

**Props:**

- `title`: `string` - Optional loading title
- `description`: `string` - Optional description text
- `size`: `"sm" | "md" | "lg"` - Loader size (default: "lg")
- `className`: `string` - Additional CSS classes

**Use cases:**

- Next.js App Router `loading.tsx` files
- Full-page suspense boundaries
- Initial page loads

---

### Skeleton Components

Content placeholders that maintain layout during loading.

#### Skeleton

Basic skeleton block with shimmer animation.

```tsx
import { Skeleton } from "@atlas/ui";

// Basic block
<Skeleton className="h-4 w-full" />

// Avatar
<Skeleton className="h-12 w-12 rounded-full" />

// With radius variants
<Skeleton radius="sm" className="h-20 w-full" />
<Skeleton radius="md" className="h-20 w-full" /> // default
<Skeleton radius="lg" className="h-20 w-full" />
```

**Props:**

- `radius`: `"sm" | "md" | "lg"` - Border radius
- `className`: `string` - Additional CSS classes (use for sizing)

---

#### SkeletonText

Multiple skeleton lines for text content.

```tsx
import { SkeletonText } from "@atlas/ui";

// Default (3 lines)
<SkeletonText />

// Custom number of lines
<SkeletonText lines={5} />

// Custom styling
<SkeletonText
  lines={3}
  lineClassName="h-6"
/>
```

**Props:**

- `lines`: `number` - Number of skeleton lines (default: 3)
- `lineClassName`: `string` - CSS classes for each line
- `className`: `string` - Container CSS classes

**Features:**

- Last line is automatically shorter (80% width)
- Stacked with consistent spacing

---

#### SkeletonList

Repeated skeleton items for lists and grids.

```tsx
import { SkeletonList } from "@atlas/ui";

// Default list (5 items)
<SkeletonList />

// Custom count
<SkeletonList count={3} />

// Grid variant
<SkeletonList variant="card" count={6} />

// Custom items
<SkeletonList
  count={3}
  renderItem={(index) => (
    <div key={index} className="flex gap-4">
      <Skeleton className="h-16 w-16 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )}
/>
```

**Props:**

- `count`: `number` - Number of items (default: 5)
- `variant`: `"list" | "card"` - Layout style
- `itemClassName`: `string` - CSS classes for each item
- `renderItem`: `(index: number) => ReactNode` - Custom item renderer
- `className`: `string` - Container CSS classes

**Variants:**

- `list` - Vertical stack with spacing
- `card` - Responsive grid layout

---

### EmptyState

User-friendly display for "no data" scenarios.

```tsx
import { EmptyState } from "@atlas/ui";
import { PackageIcon } from "lucide-react";

// Basic
<EmptyState title="No products found" />

// With description
<EmptyState
  title="No results"
  description="Try adjusting your search or filters"
/>

// With custom icon
<EmptyState
  title="No orders yet"
  description="Your order history will appear here"
  icon={<PackageIcon className="size-10" />}
/>

// With actions
<EmptyState
  title="No projects"
  description="Get started by creating your first project"
  actions={
    <button className="...">
      Create project
    </button>
  }
/>

// Compact variant (no border)
<EmptyState
  variant="compact"
  title="No notifications"
/>

// No icon
<EmptyState
  title="Empty folder"
  icon={null}
/>
```

**Props:**

- `title`: `string` (required) - Main heading
- `description`: `string` - Supporting text
- `icon`: `ReactNode` - Custom icon (default: InboxIcon)
- `actions`: `ReactNode` - Action buttons or links
- `variant`: `"default" | "compact"` - Visual style
- `className`: `string` - Additional CSS classes

**Accessibility:**

- Title uses `role="heading"` with `aria-level="2"`
- Icon is `aria-hidden="true"`

**Best practices:**

- Keep titles concise (2-5 words)
- Provide actionable descriptions
- Offer relevant actions when possible
- Use icons that match the context

---

### ErrorFallback

Graceful error display with recovery options.

```tsx
import { ErrorFallback } from "@atlas/ui";

// Basic
<ErrorFallback />

// Custom message
<ErrorFallback
  title="Failed to load data"
  description="We couldn't retrieve your dashboard data"
/>

// With retry
<ErrorFallback
  title="Connection failed"
  onRetry={() => refetch()}
/>

// With error object (ApiError-aware)
<ErrorFallback error={error} />

// With correlation ID
<ErrorFallback
  correlationId="req-abc-123"
  onRetry={handleRetry}
/>

// Inline variant (smaller)
<ErrorFallback
  variant="inline"
  title="Failed to save"
  onRetry={handleRetry}
/>

// With custom actions
<ErrorFallback
  title="Something went wrong"
  actions={
    <>
      <button onClick={goHome}>Go home</button>
      <button onClick={contactSupport}>Contact support</button>
    </>
  }
/>
```

**Props:**

- `title`: `string` - Error heading (default: "Something went wrong")
- `description`: `string` - Error description
- `error`: `unknown` - Error object (extracts ApiError details)
- `correlationId`: `string` - Request tracing ID
- `onRetry`: `() => void` - Retry handler (shows retry button)
- `actions`: `ReactNode` - Custom action buttons
- `variant`: `"default" | "inline"` - Visual style
- `className`: `string` - Additional CSS classes

**Accessibility:**

- `role="alert"` - Announces error to screen readers
- Retry button is keyboard accessible

**ApiError integration:**

- Automatically extracts `userMessage` from ApiError
- Displays `correlationId` from error or prop
- Never shows stack traces in production
- Safe error message fallbacks

**Best practices:**

- Always provide a retry mechanism when possible
- Display correlation IDs for support debugging
- Keep error messages user-friendly
- Don't leak technical details in production

---

## Usage Patterns

### React Query Integration

```tsx
import { useQuery } from "@tanstack/react-query";
import { SkeletonList, ErrorFallback, EmptyState } from "@atlas/ui";

function ProductList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  if (isError) {
    return <ErrorFallback error={error} onRetry={() => refetch()} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your search filters"
        actions={<button onClick={clearFilters}>Clear filters</button>}
      />
    );
  }

  return (
    <div>
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Next.js App Router - loading.tsx

```tsx
// app/dashboard/loading.tsx
import { PageLoader } from "@atlas/ui";

export default function Loading() {
  return <PageLoader title="Loading dashboard" />;
}
```

```tsx
// app/products/loading.tsx
import { SkeletonList } from "@atlas/ui";

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
      </div>
      <SkeletonList variant="card" count={6} />
    </div>
  );
}
```

### Next.js App Router - error.tsx

```tsx
// app/dashboard/error.tsx
"use client";

import { ErrorFallback } from "@atlas/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} correlationId={error.digest} onRetry={reset} />;
}
```

### Button Loading States

```tsx
import { InlineLoader } from "@atlas/ui";

function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <button disabled={isSaving} onClick={handleSave} className="flex items-center gap-2">
      {isSaving && <InlineLoader />}
      {isSaving ? "Saving..." : "Save"}
    </button>
  );
}
```

### Suspense Boundaries

```tsx
import { Suspense } from "react";
import { PageLoader, SkeletonList } from "@atlas/ui";

function Page() {
  return (
    <div>
      <Suspense fallback={<PageLoader title="Loading profile" />}>
        <ProfileHeader />
      </Suspense>

      <Suspense fallback={<SkeletonList count={3} />}>
        <ActivityFeed />
      </Suspense>
    </div>
  );
}
```

### Error Boundaries

```tsx
import { Component, ReactNode } from "react";
import { ErrorFallback } from "@atlas/ui";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

### Loader Components

- ✅ `role="status"` for live region announcements
- ✅ `aria-live="polite"` for non-intrusive updates
- ✅ `aria-label` for screen reader context
- ✅ Hidden text via `.sr-only` utility

### Skeleton Components

- ✅ Respects `prefers-reduced-motion: reduce`
- ✅ No animation when user prefers reduced motion
- ✅ Maintains layout to prevent content shift

### EmptyState

- ✅ Semantic heading structure
- ✅ Icons marked with `aria-hidden="true"`
- ✅ Actionable elements are keyboard accessible

### ErrorFallback

- ✅ `role="alert"` for immediate error announcements
- ✅ Focus management on retry button
- ✅ Clear, actionable error messages
- ✅ Keyboard navigation support

---

## Theming

All components use Atlas design tokens and respect theme switching:

- `bg-background` / `text-foreground` - Primary colors
- `text-muted-foreground` - Secondary text
- `border-border` - Borders and dividers
- `bg-accent` - Skeleton backgrounds
- `bg-destructive` / `text-destructive` - Error states
- `bg-primary` / `text-primary-foreground` - Actions

Components automatically adapt to light/dark themes.

---

## Do's and Don'ts

### ✅ Do

- Use `PageLoader` for full-page loading states
- Use `SkeletonList` for content that maintains layout
- Provide retry mechanisms in error states
- Display correlation IDs for debugging
- Use `InlineLoader` to prevent layout shift
- Provide descriptive labels for screen readers
- Use `EmptyState` for zero-data scenarios
- Keep error messages user-friendly

### ❌ Don't

- Create custom spinners or skeleton components
- Show raw error messages or stack traces to users
- Use loaders without aria labels
- Forget to handle empty states
- Ignore retry functionality in errors
- Use `Loader` where `InlineLoader` is more appropriate
- Skip correlation IDs in production errors
- Use generic "Error" titles - be specific

---

## Examples

See the component stories in Storybook for interactive examples:

```bash
cd packages/ui
pnpm storybook
```

---

## Testing

All components include comprehensive tests covering:

- Accessibility (ARIA attributes, roles, labels)
- Component behavior and interactions
- Variant and prop handling
- Error extraction and handling

Run tests:

```bash
cd packages/ui
pnpm test
```

---

## Migration Guide

If you have existing loading/error/empty components:

1. **Replace custom spinners** → `Loader`, `InlineLoader`, `PageLoader`
2. **Replace custom skeletons** → `Skeleton`, `SkeletonText`, `SkeletonList`
3. **Replace empty states** → `EmptyState`
4. **Replace error displays** → `ErrorFallback`

The existing `Spinner` and `Empty` components are still available but the new components offer
better APIs and patterns.

---

## Support

For questions or issues:

- Review examples in this documentation
- Check Storybook for interactive demos
- See tests for usage patterns
- Review existing usage in the codebase
