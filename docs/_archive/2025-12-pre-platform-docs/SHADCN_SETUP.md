# shadcn/ui Setup for Next.js 16

This document describes the shadcn/ui setup in the Atlas project, configured for Next.js 16
compatibility.

## Overview

shadcn/ui is a collection of re-usable components built using Radix UI and Tailwind CSS. Components
are not installed as dependencies but are added to your project's source code, giving you full
control and ownership.

## Installation Details

### Dependencies Installed

```json
{
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "0.7.1",
  "clsx": "2.1.1",
  "tailwind-merge": "2.6.0",
  "@radix-ui/react-slot": "latest",
  "lucide-react": "^0.561.0"
}
```

### Configuration Files

- **tailwind.config.ts**: Tailwind CSS configuration with shadcn theme variables
- **components.json**: shadcn/ui configuration file
- **src/app/globals.css**: Global styles with CSS custom properties for theming
- **src/lib/utils.ts**: Utility function for className merging

### TypeScript Paths

Updated `tsconfig.json` to include shadcn-compatible path aliases:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/hooks/*": ["./src/hooks/*"]
  }
}
```

## Installed Components

The following components have been installed:

### Core Components

- **Button**: Various button styles and sizes
- **Card**: Card container with header, content, and footer
- **Input**: Text input field
- **Label**: Form label
- **Textarea**: Multi-line text input

### Form Components

- **Form**: Form wrapper with validation support
- **Select**: Dropdown select component
- **Checkbox**: Checkbox input
- **Radio Group**: Radio button group
- **Switch**: Toggle switch

### Layout Components

- **Separator**: Horizontal or vertical divider
- **Tabs**: Tabbed interface
- **Accordion**: Collapsible content sections
- **Sheet**: Slide-out panel
- **Dialog**: Modal dialog

### Feedback Components

- **Alert**: Alert messages
- **Sonner**: Toast notifications (via sonner library)
- **Skeleton**: Loading placeholder

### Display Components

- **Badge**: Status badge
- **Avatar**: User avatar with fallback
- **Table**: Data table with header, body, and footer
- **Tooltip**: Hover tooltip
- **Popover**: Popover content
- **Dropdown Menu**: Context menu

## Usage

### Importing Components

Components can be imported from the barrel export:

```tsx
import { Button, Card, Input } from "@/components";
```

Or directly from the UI folder:

```tsx
import { Button } from "@/components/ui/button";
```

### Example Usage

```tsx
"use client";

import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components";
import { toast } from "sonner";

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => toast.success("Hello!")}>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Theming

The project uses CSS custom properties for theming, supporting both light and dark modes. Colors are
defined in [src/app/globals.css](../../apps/web/src/app/globals.css).

### Theme Variables

- `--background`: Main background color
- `--foreground`: Main text color
- `--primary`: Primary brand color
- `--secondary`: Secondary color
- `--muted`: Muted/subtle color
- `--accent`: Accent color
- `--destructive`: Error/danger color
- `--border`: Border color
- `--input`: Input border color
- `--ring`: Focus ring color

### Dark Mode

Dark mode is handled by the `ThemeProvider` in
[src/providers/theme-provider.tsx](../../apps/web/src/providers/theme-provider.tsx). Toggle between
themes using the `next-themes` library.

## Toast Notifications

Toast notifications are provided by the `sonner` library. The `<Toaster />` component is included in
the root layout.

### Using Toasts

```tsx
import { toast } from "sonner";

// Success toast
toast.success("Operation completed successfully");

// Error toast
toast.error("Something went wrong");

// Info toast
toast.info("This is an info message");

// Custom toast
toast("Custom message", {
  description: "With a description",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
});
```

## Demo Page

A comprehensive demo of all components is available at `/components` when running the dev server.

Visit: [http://localhost:3000/components](http://localhost:3000/components)

## Adding New Components

To add additional shadcn/ui components:

```bash
cd apps/web
pnpm dlx shadcn@latest add [component-name]
```

For example:

```bash
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add data-table
```

## Customization

Since components are copied into your project, you have complete control to customize them:

1. Navigate to `apps/web/src/components/ui/`
2. Modify any component file
3. Changes are immediately reflected in your app

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## Compatibility

- ✅ Next.js 16.0.10
- ✅ React 19.0.0
- ✅ Tailwind CSS 4.1.18
- ✅ TypeScript 5.7.2

## Next Steps

1. Customize the theme colors in `globals.css` to match your brand
2. Add more components as needed
3. Create composite components by combining primitives
4. Implement form validation with React Hook Form + Zod
