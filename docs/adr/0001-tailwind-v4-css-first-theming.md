# ADR-0001: Tailwind v4 CSS-First Theming

## Status

**Accepted**

## Context

Atlas needed a theming system that supports:

- Light and dark modes
- System preference detection
- No flash of unstyled content (FOUC)
- Semantic design tokens
- Easy customization

We evaluated:

1. `next-themes` + Tailwind config
2. CSS variables + Tailwind v4 CSS-first configuration
3. CSS-in-JS solutions (styled-components, emotion)

### Technical Constraints

- Tailwind CSS v4 moved to CSS-first configuration
- No `tailwind.config.js` needed for most use cases
- CSS custom properties are the recommended pattern

## Decision

We use **Tailwind CSS v4 with CSS-first configuration** and a custom `useTheme` hook. No
`next-themes` or `tailwind.config.js`.

### Implementation

1. **Design tokens in CSS** (`packages/ui/src/styles/globals.css`):

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.61 0.11 222);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.71 0.13 215);
}
```

2. **Tailwind mapping via `@theme inline`**:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
}
```

3. **Theme applied via `.dark` class on `<html>`**

4. **Custom `useTheme` hook** for preference management

5. **Inline bootstrap script** prevents FOUC

## Alternatives Considered

### Alternative 1: next-themes + tailwind.config

**Pros:**

- Popular, well-maintained
- Handles SSR edge cases

**Cons:**

- Additional dependency
- Requires `tailwind.config.js` (against v4 direction)
- Less control over implementation

**Why not chosen:** Adds dependency for something we can do natively with Tailwind v4.

### Alternative 2: CSS-in-JS (styled-components)

**Pros:**

- Full JavaScript control
- Component-scoped styles

**Cons:**

- Runtime overhead
- Incompatible with Tailwind approach
- Larger bundle size

**Why not chosen:** Atlas is committed to Tailwind CSS.

## Consequences

### Positive

- Zero external theme dependencies
- Full control over theme behavior
- Native Tailwind v4 patterns
- OKLCH color space for better color manipulation
- Smaller bundle (no next-themes)

### Negative

- Must maintain custom `useTheme` hook
- Team needs to understand CSS custom properties
- No automatic SSR handling (we handle it manually)

### Neutral

- Tokens live in CSS, not JavaScript

## References

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [OKLCH Color Space](https://oklch.com/)
- Implementation: `packages/ui/src/styles/globals.css`, `packages/ui/src/hooks/use-theme.ts`
