# Storybook for Atlas UI

This directory contains the Storybook setup for the Atlas UI component library.

## What is Storybook?

Storybook is an open-source tool for developing UI components in isolation. It makes building
stunning UIs organized and efficient by providing:

- **Component Playground**: Interactively develop and test components in isolation
- **Visual Documentation**: Auto-generated docs for all component props and variants
- **Dark Mode Toggle**: Test components in both light and dark themes
- **Accessibility Testing**: Built-in a11y addon to ensure WCAG compliance
- **Responsive Testing**: View components at different viewport sizes

## Quick Start

### Development Mode

Run Storybook locally:

```bash
# From the root of the monorepo
pnpm storybook

# Or from packages/ui directory
cd packages/ui && pnpm storybook
```

Storybook will start at [http://localhost:6006](http://localhost:6006)

### Build Static Version

Build a static version of Storybook for deployment:

```bash
pnpm build-storybook
```

The static build will be output to `packages/ui/storybook-static/`

## Project Structure

```
packages/ui/
├── .storybook/              # Storybook configuration
│   ├── main.ts             # Main config (addons, framework)
│   ├── preview.tsx         # Preview config (decorators, themes)
│   └── preview-head.html   # Custom CSS for preview
├── src/
│   ├── components/ui/
│   │   ├── button.tsx
│   │   ├── button.stories.tsx  # Button stories
│   │   ├── card.tsx
│   │   ├── card.stories.tsx    # Card stories
│   │   └── ...
│   └── stories/
│       └── Introduction.mdx     # Welcome page
```

## Writing Stories

Stories are written in CSF (Component Story Format) 3.0. Here's the pattern:

### Basic Story Example

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline"],
      description: "The visual style variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};
```

### Complex Story with Custom Render

```tsx
export const LoginForm: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" />
        <Input type="password" placeholder="Password" />
      </CardContent>
      <CardFooter>
        <Button>Login</Button>
      </CardFooter>
    </Card>
  ),
};
```

## Addons Included

### Core Addons

- **@storybook/addon-essentials**: Controls, Actions, Viewport, Backgrounds, Toolbars, Measure,
  Outline
- **@storybook/addon-interactions**: Interactive component testing
- **@storybook/addon-a11y**: Accessibility testing and reporting
- **@storybook/addon-themes**: Dark/light theme switching
- **@storybook/addon-onboarding**: Interactive onboarding guide

## Turbo Integration

Storybook is integrated into the Turborepo pipeline:

```json
{
  "storybook": {
    "cache": false,
    "persistent": true
  },
  "build-storybook": {
    "dependsOn": ["^build"],
    "outputs": ["storybook-static/**"]
  }
}
```

This means:

- `pnpm storybook` runs from the root using Turbo
- `pnpm build-storybook` respects dependency order
- Build outputs are cached for faster CI/CD

## Deployment

### Static Hosting

The static build can be deployed to any static hosting service:

```bash
# Build
pnpm build-storybook

# Deploy to Vercel, Netlify, S3, etc.
# The output is in packages/ui/storybook-static/
```

### Chromatic (Recommended)

For visual regression testing and hosting:

```bash
# Install Chromatic
pnpm add -D chromatic

# Deploy to Chromatic
npx chromatic --project-token=<your-token>
```

## Best Practices

### 1. Story Organization

- **One `.stories.tsx` file per component**
- Name stories descriptively: `Default`, `WithIcon`, `Loading`, etc.
- Group related stories under the same title prefix: `UI/Button`, `UI/Card`

### 2. Accessibility

- Use semantic HTML in your components
- Test with the a11y addon (bottom panel → Accessibility tab)
- Aim for zero violations in all stories

### 3. Dark Mode

- Test every component in both themes
- Use semantic color tokens from Tailwind: `bg-background`, `text-foreground`
- Avoid hardcoded color values

### 4. Interactive States

Show all component states:

- Default
- Hover
- Active
- Disabled
- Loading
- Error
- Empty

### 5. Documentation

- Use `tags: ["autodocs"]` to generate docs automatically
- Add descriptions to `argTypes` for better prop documentation
- Include usage examples in MDX files for complex patterns

## Troubleshooting

### Storybook Won't Start

```bash
# Clear cache and restart
rm -rf node_modules/.cache/storybook
pnpm storybook
```

### TypeScript Errors

```bash
# Rebuild the package first
pnpm build

# Then start Storybook
pnpm storybook
```

### Hot Reload Not Working

- Check if Vite config is correct in `.storybook/main.ts`
- Restart Storybook
- Clear browser cache

## Links

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [Storybook Addons](https://storybook.js.org/addons)
- [Atlas Platform Principles](../../docs/platform-principles.md)

---

**Atlas** - Single way to build. Single way to write UI. Single way to scale teams.
