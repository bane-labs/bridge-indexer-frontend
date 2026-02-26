# Accessibility Baseline

Atlas enforces a baseline accessibility standard to ensure our applications are usable by everyone.
This document outlines the rules we follow, common patterns to use, and how to fix violations.

## Why Accessibility Matters

Accessible applications:

- Work for users with disabilities (visual, motor, cognitive, auditory)
- Improve usability for all users
- Perform better in search engines
- Meet legal requirements in many jurisdictions

## ESLint Baseline

We use `eslint-plugin-jsx-a11y` to catch common accessibility bugs at build time.

### Most Important Rules

Our configuration enforces these critical patterns:

- **Images must have alt text**: All `<img>` elements need an `alt` attribute (use `alt=""` for
  decorative images)
- **Forms must have labels**: Every input needs an associated `<label>` or `aria-label`
- **Interactive elements need keyboard support**: Clickable divs/spans must be replaced with
  `<button>` or `<a>`
- **Valid ARIA only**: ARIA attributes must be valid and used correctly
- **Semantic HTML**: Use proper HTML elements (`<button>`, `<a>`, `<nav>`, etc.) instead of generic
  divs

### How to Fix Common Violations

#### ❌ Clickable div without keyboard support

```tsx
// BAD: Not keyboard accessible
<div onClick={handleClick}>Click me</div>
```

✅ **Fix:** Use a button for actions, a link for navigation

```tsx
// GOOD: Use semantic HTML
<button onClick={handleClick}>Click me</button>

// Or for navigation:
<a href="/page">Go to page</a>
```

#### ❌ Image without alt text

```tsx
// BAD: Screen readers can't describe the image
<img src="/logo.png" />
```

✅ **Fix:** Add meaningful alt text, or empty string for decorative images

```tsx
// GOOD: Meaningful alt for content images
<img src="/logo.png" alt="Atlas company logo" />

// GOOD: Empty alt for decorative images
<img src="/divider.png" alt="" />
```

#### ❌ Input without label

```tsx
// BAD: Screen readers can't identify the input
<input type="email" placeholder="Email" />
```

✅ **Fix:** Add a visible label or aria-label

```tsx
// BEST: Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// OK: aria-label when visual label isn't needed
<input type="email" aria-label="Email address" />
```

### When to Disable Rules

Avoid disabling accessibility rules. If a rule produces a false positive:

1. **First, verify it's truly a false positive** (consult the team)
2. **Document why** in a comment
3. **Use inline disable** (not file-level):
   ```tsx
   {
     /* eslint-disable-next-line jsx-a11y/no-autofocus */
   }
   <input autoFocus aria-label="Search" />;
   ```

Common valid exceptions:

- `no-autofocus`: Acceptable in modal dialogs that manage focus properly
- Custom components from Radix UI: These libraries handle accessibility internally

## Keyboard and Focus Patterns

### Interactive Elements

**Rule:** Use semantic HTML elements for their intended purpose.

#### ✅ DO

```tsx
// Buttons for actions
<button onClick={handleSave}>Save</button>

// Links for navigation (Next.js Link is fine)
<Link href="/settings">Settings</Link>

// Native form elements
<select>
  <option>Choose</option>
</select>
```

#### ❌ DON'T

```tsx
// Don't use div/span for interactive elements
<div onClick={handleClick}>Click</div>
<span onClick={handleClick}>Click</span>

// Don't use <a> without href
<a onClick={handleClick}>Click</a>

// Don't use <button> for navigation
<button onClick={() => router.push('/page')}>Go</button>
```

### Focus Styles

**Rule:** Never remove focus indicators. Always use `:focus-visible` for custom focus styles.

#### ✅ DO

```tsx
// Use focus-visible with proper ring utilities
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  Click me
</button>

// Our components already have proper focus styles built-in
<Button>Click me</Button>
```

#### ❌ DON'T

```tsx
// Never remove focus without replacement
<button className="outline-none">Bad</button>

// Don't use :focus instead of :focus-visible
<button className="focus:ring-2">Also bad</button>
```

**Note:** Our component library (in `packages/ui`) uses `outline-none` paired with
`focus-visible:ring-*` utilities. This is correct—we replace the default outline with a custom,
visible focus ring.

### Forms

**Rule:** Every form input must have an associated label and proper error handling.

#### ✅ DO

```tsx
// Visible label (preferred)
<div>
  <label htmlFor="username">Username</label>
  <input id="username" type="text" />
</div>

// Error messages linked via aria-describedby
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && <span id="email-error">Invalid email format</span>}
</div>

// Required fields
<input type="text" required aria-required="true" />
```

#### ❌ DON'T

```tsx
// No label
<input type="text" placeholder="Username" />

// Error message not associated with input
<input type="email" />
<span className="text-red">Error!</span>
```

### Modals and Dialogs

**Rule:** Use our Radix UI Dialog components—they handle focus management automatically.

When a modal opens:

1. Focus moves into the modal
2. Focus is trapped inside the modal
3. Background is inert (can't be clicked or focused)
4. Escape key closes the modal
5. Focus returns to the trigger element on close

```tsx
import { Dialog, DialogContent, DialogTrigger } from "@atlas/ui/components/dialog";

// ✅ DO: Use our Dialog component
<Dialog>
  <DialogTrigger asChild>
    <Button>Open modal</Button>
  </DialogTrigger>
  <DialogContent>
    <h2>Modal title</h2>
    <p>Content</p>
  </DialogContent>
</Dialog>;
```

**Don't build custom modals** without proper focus management.

### Menus, Dropdowns, and Popovers

**Rule:** Use Radix UI components—they provide keyboard navigation out of the box.

Our component library includes:

- `DropdownMenu`: Full keyboard support (Arrow keys, Enter, Escape)
- `Select`: Native-like keyboard behavior
- `Popover`: Focus management and Escape handling

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@atlas/ui";

// ✅ DO: Use our components
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>{/* Menu items */}</DropdownMenuContent>
</DropdownMenu>;
```

### Loading States

**Rule:** Loading states must be announced to screen readers.

```tsx
// ✅ DO: Use role="status" for loading indicators
{
  isLoading && (
    <div role="status" aria-live="polite">
      <Spinner />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ✅ DO: Use role="alert" for errors
{
  error && <div role="alert">{error.message}</div>;
}
```

### Empty States

```tsx
// ✅ DO: Provide meaningful empty state messages
{
  items.length === 0 && (
    <div role="status">
      <p>No items found</p>
    </div>
  );
}
```

### Page Transitions (Next.js App Router)

For route-level states, ensure they're screen-reader friendly:

**Error boundaries** (`error.tsx`):

```tsx
export default function Error({ error, reset }: ErrorProps) {
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Loading states** (`loading.tsx`):

```tsx
export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <Spinner />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}
```

## Testing for Accessibility

### Manual Keyboard Testing

Before submitting a PR, test your feature with keyboard only:

1. **Tab through all interactive elements** - Can you reach everything?
2. **Check focus visibility** - Can you see where focus is?
3. **Test Enter/Space on buttons** - Do they activate?
4. **Test Escape in modals** - Do they close?
5. **Test Arrow keys in menus** - Do they navigate?

### Screen Reader Testing (Optional but Recommended)

- **macOS**: VoiceOver (Cmd + F5)
- **Windows**: NVDA (free) or JAWS
- **Browser DevTools**: Accessibility tree inspector

### Automated Testing

Our Storybook includes the `@storybook/addon-a11y` addon which automatically:

- Checks color contrast
- Validates ARIA usage
- Identifies missing labels
- Reports keyboard accessibility issues

View the "Accessibility" tab in Storybook for any component.

## Component Library (@atlas/ui)

Our UI components are built with accessibility in mind:

- **Based on Radix UI**: Industry-standard accessible primitives
- **Keyboard navigation**: All interactive components support keyboard
- **Focus management**: Modals, dropdowns, and menus handle focus correctly
- **ARIA attributes**: Proper roles and states included
- **Screen reader tested**: Components work with VoiceOver and NVDA

When building new components:

1. Start with a Radix UI primitive when available
2. Ensure keyboard operability
3. Add visible focus states using `focus-visible:ring-*`
4. Include proper ARIA attributes
5. Test with keyboard and screen reader

## Resources

- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Documentation](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [WebAIM](https://webaim.org/)
- [eslint-plugin-jsx-a11y rules](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules)

## Summary

**In Atlas, we expect:**

✅ Semantic HTML (`<button>`, `<a>`, not `<div onClick>`)  
✅ Visible focus indicators (using `focus-visible`)  
✅ All images have alt text  
✅ All inputs have labels  
✅ Error messages are associated with inputs  
✅ Modals manage focus (use our Dialog component)  
✅ Keyboard accessibility for all interactive elements  
✅ Loading/error states use proper ARIA roles

When in doubt, use our component library—it's built with these patterns in mind.
