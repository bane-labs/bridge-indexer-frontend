# @atlas/ui

Shared UI component library built with React, TypeScript, and Tailwind CSS.

## Components

- **Button** - Versatile button with variants, sizes, loading and icon support
- **Card** - Container component with header, content, and footer
- **Alert** - Alert messages with different severity levels
- **Skeleton** - Loading placeholders
- **EmptyState** - Empty state displays
- **ErrorMessage** - Error display with retry option

## Usage

```tsx
import { Button, Card } from "@atlas/ui";

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## Styling

Import the global styles in your app:

```tsx
import "@atlas/ui/styles";
```

This automatically imports Tailwind CSS v4 with all the design tokens and theme variables. No
additional configuration needed.
