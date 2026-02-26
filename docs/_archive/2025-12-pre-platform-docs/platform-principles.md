# Platform Principles

This document outlines the core principles and conventions for the Frontend Platform monorepo.

## Goals

1. **Consistency** - Predictable structure and patterns across all apps and packages
2. **Maintainability** - Clear boundaries and ownership
3. **Quality** - Automated gates prevent regressions
4. **Developer Experience** - Fast feedback loops, clear documentation
5. **Scalability** - Support multiple teams and applications

## Architecture Boundaries

### What Goes in `packages/ui`?

✅ **DO:**

- Presentational components with clear props APIs
- Design system primitives (buttons, cards, inputs)
- Layout components (grids, stacks)
- UI utilities (`cn`, theme helpers)

❌ **DON'T:**

- Business logic
- API calls or data fetching
- App-specific components (use feature folders instead)
- State management beyond local component state

### What Goes in `packages/config`?

✅ **DO:**

- Linting configurations
- TypeScript configs
- Testing presets
- Formatter settings
- Build tool configurations

❌ **DON'T:**

- Runtime code
- Environment variables
- App-specific settings

### What Goes in Apps?

✅ **DO:**

- Routes and pages
- Feature modules
- Business logic
- API integration
- App-specific providers
- Environment configuration

❌ **DON'T:**

- Reusable UI components (promote to `packages/ui`)
- Shared utilities used by multiple apps (create new package)

## Code Organization

### Feature-Sliced Design

We recommend organizing app code by feature:

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   ├── types.ts
│   └── index.ts
└── dashboard/
    ├── components/
    ├── hooks/
    ├── api/
    ├── types.ts
    └── index.ts
```

**Benefits:**

- Colocates related code
- Clear feature boundaries
- Easy to navigate and delete
- Scales with team size

### Component Design

**Props API:**

- Keep props flat and simple
- Use TypeScript for self-documentation
- Prefer composition over configuration
- Export prop types for consumers

**Example:**

```tsx
export interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({ variant = "primary", ...props }: ButtonProps) {
  // Implementation
}
```

## Testing Strategy

### Unit Tests

**Required for:**

- All UI components in `packages/ui`
- Critical utilities and helpers
- Complex business logic

**Not required for:**

- Simple presentational wrappers
- Type definitions
- Configuration files

**Guidelines:**

- Test user behavior, not implementation
- Use RTL queries in priority order: `getByRole` > `getByLabelText` > `getByText`
- Avoid testing internal state
- Aim for 70%+ coverage on critical paths

**Coverage Thresholds (Quality Gates):**

- **Global minimum**: 60-70% (branches/functions/lines/statements)
- **Critical paths** (components, lib): 70-80%
- Enforced in CI - builds fail if thresholds not met
- Run `pnpm test:coverage` to check locally

### E2E Tests

**Required for:**

- Critical user journeys (auth, checkout, etc.)
- Smoke tests (home page loads, navigation works)

**Guidelines:**

- Keep tests stable and fast
- Use data-testid sparingly (prefer semantic queries)
- Run in CI on every PR
- Test in real browser environments

## Styling Conventions

### Tailwind Usage

**DO:**

- Use utility classes for layout and spacing
- Leverage design tokens (colors, spacing, typography)
- Use `cn()` helper for conditional classes
- Extract repeated patterns into components

**DON'T:**

- Use arbitrary values excessively (`w-[347px]`)
- Duplicate long className strings
- Style with inline styles unless necessary
- Fight the framework

### Dark Mode

- Always test components in both light and dark modes
- Use semantic color tokens (`bg-background`, `text-foreground`)
- Avoid hardcoded colors

## Tooling Conventions

### ESLint

- Auto-fix on save in your editor
- Pre-commit hook catches issues
- CI enforces clean build
- Disable rules sparingly with comments explaining why

### TypeScript

- Strict mode enabled everywhere
- No `any` without eslint-disable comment
- Use `type` for objects, `interface` for extension
- Prefer type inference over explicit annotations

### Import Order

Enforced by ESLint:

1. Node built-ins
2. External packages
3. Internal packages (`@thedanielmark/*`)
4. Relative imports (parent)
5. Relative imports (sibling)
6. Type imports (separate group)

## Performance

### Bundle Size

- Use dynamic imports for heavy dependencies
- Tree-shake by importing specific exports
- Monitor bundle size in CI (consider bundle analyzer)

### Core Web Vitals

- Target LCP < 2.5s, FID < 100ms, CLS < 0.1
- Use Next.js Image component
- Lazy load below-the-fold content
- Prefetch critical data

## Deployment

### Environment Variables

- **Never commit** secrets or API keys
- Use `.env.local` for local development
- Validate env vars with Zod schemas at build time
- Use `NEXT_PUBLIC_` prefix for client-side vars

### Build Process

1. Lint → 2. Type check → 3. Test → 4. Build → 5. E2E

All steps must pass in CI before merge.

## Team Collaboration

### Pull Requests

- Keep PRs small and focused
- Include screenshots for UI changes
- Link to relevant issues or tickets
- Request reviews from relevant teams

### Code Review

- Review for logic, not style (automated)
- Suggest, don't demand (unless critical)
- Approve quickly, iterate later for non-critical items
- Test the changes locally if significant

### Documentation

- Update README when adding packages or apps
- Document complex logic with comments
- Keep docs close to code (feature README if needed)
- Update this doc when patterns evolve

## Migration Strategy

When patterns change:

1. Document new pattern
2. Update examples
3. Migrate incrementally (don't block feature work)
4. Provide codemod if possible
5. Deprecate old pattern with warnings

## Support

For questions or discussions:

- Open an issue in the repo
- Reach out in team Slack channel
- Schedule architecture review for major changes

---

**Last Updated:** December 2025
