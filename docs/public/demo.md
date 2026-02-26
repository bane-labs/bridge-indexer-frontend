# Demo

> Proof of capability through working examples.

---

## Purpose

The Atlas demo section at `/demo` isn't sample code—it's **integration evidence**. Each demo page
exercises a specific platform pattern with real behavior. If the demo works, the pattern works.

The demo serves multiple purposes:

- **Living documentation** — See exactly how patterns behave
- **Onboarding resource** — New engineers can explore working examples
- **Regression canary** — If demo breaks, something fundamental changed
- **Credibility evidence** — Claims are backed by observable behavior

---

## Demo Mode

All demos operate in **mock mode**:

- Data stored in-memory on the server
- No external backend required
- State resets on server restart

This makes demos safe to explore without side effects.

---

## Demo Pages

### Authentication (`/demo/auth`)

**What it proves:** OAuth works, sessions are SSR-safe, and auth state is consistent.

When you visit this page, you'll see:

| State      | What You Observe                        |
| ---------- | --------------------------------------- |
| Signed out | Sign-in button with provider branding   |
| OAuth flow | Redirect to provider, then back         |
| Signed in  | User info displayed, sign-out available |
| Refresh    | Session persists across page reloads    |

**Key behaviors demonstrated:**

- **SSR-safe session** — User info renders correctly on first paint, no hydration flash
- **Secure cookies** — Tokens stay server-side, never in browser JavaScript
- **Session hook** — Components access user state via `useSession`
- **Graceful degradation** — Unauthenticated state is a valid state, not an error

Try this: Sign in, then refresh the page. The session survives. Open DevTools Network tab—you'll see
session fetch, but no tokens in responses.

---

### Data Fetching (`/demo/data`)

**What it proves:** API contracts work, and all app states are handled intentionally.

This is the most instructive demo. It shows how Atlas handles the four fundamental data states:

| State   | URL Parameter   | What You See                                  |
| ------- | --------------- | --------------------------------------------- |
| Loading | (initial)       | Skeleton placeholders matching content layout |
| Success | `?mode=success` | Rendered data with proper styling             |
| Empty   | `?mode=empty`   | Designed empty state, not blank space         |
| Error   | `?mode=error`   | Error display with correlation ID             |
| Slow    | `?mode=slow`    | Extended loading to observe skeleton behavior |

**Key behaviors demonstrated:**

- **Typed API client** — Responses match OpenAPI-generated types
- **Consistent loading** — Skeletons prevent layout shift
- **Error normalization** — All errors become a standard shape
- **Correlation IDs** — Errors include IDs for debugging
- **Query caching** — Navigate away and back—data doesn't refetch immediately

Try this: Open DevTools, go to Network tab, trigger an error with `?mode=error`. The response
includes a `correlationId`. In production, this ID appears in logs and error tracking.

---

### Forms & Validation (`/demo/form`)

**What it proves:** Validation is aligned between client and server, and form UX is polished.

The form demo shows:

| Scenario          | What You Observe                       |
| ----------------- | -------------------------------------- |
| Validation errors | Field-level errors appear as you type  |
| Required fields   | Clear indication of what's mandatory   |
| Server errors     | Backend validation maps to form fields |
| Success           | Form submits, data appears in list     |

**Key behaviors demonstrated:**

- **Schema sharing** — Same validation logic on client and server
- **Field-level errors** — Errors appear next to relevant fields
- **Accessible forms** — Labels, ARIA attributes, focus management
- **Server error mapping** — Backend validation surfaces in the UI
- **Optimistic updates** — UI responds immediately, reconciles with server

Try this: Submit an empty form. Watch errors appear. Fill in valid data, submit. The new item
appears immediately (optimistic), then syncs with server.

---

### Feature Flags (`/demo/flags`)

**What it proves:** Features can be toggled without deployment, and kill switches work.

The flags demo shows:

| Pattern            | What You Observe            |
| ------------------ | --------------------------- |
| Feature enabled    | Additional UI appears       |
| Feature disabled   | UI hidden, no trace in DOM  |
| Kill switch active | Feature completely disabled |
| Guard component    | Declarative feature gating  |

**Key behaviors demonstrated:**

- **Flag hook** — Components check flag state via `useFlag`
- **Kill switch** — Emergency disable that overrides feature flags
- **Feature guard** — Wrapper component for declarative gating
- **Type-safe flags** — Flag names are typed, no string typos

Try this: Toggle a feature flag. The UI updates. Enable the kill switch—the feature disappears
regardless of flag state. This is how you can disable broken features in production without
deploying.

---

### Observability (`/demo/observability`)

**What it proves:** Errors are tracked with context, and debugging is possible.

The observability demo shows:

| Action           | What Happens                          |
| ---------------- | ------------------------------------- |
| Trigger error    | Exception captured with stack trace   |
| View correlation | Error includes request correlation ID |
| Check logs       | Structured output appears in console  |

**Key behaviors demonstrated:**

- **Error capture** — Exceptions are sent to error tracking
- **Correlation IDs** — Every request has a traceable ID
- **Structured logging** — Logs include timestamp, context, not just messages
- **Development safety** — Errors in demo mode don't pollute production dashboards

Try this: Click "Trigger Error". Open DevTools console. You'll see structured log output. In
production, this error would appear in Sentry with the correlation ID attached.

---

### Accessibility & Theming (`/demo/a11y-theme`)

**What it proves:** The platform is accessible by default, and theming works correctly.

The a11y/theme demo shows:

| Feature        | What You Observe                     |
| -------------- | ------------------------------------ |
| Theme toggle   | Switch between light, dark, system   |
| No flash       | Theme applies before first paint     |
| Focus visible  | Keyboard focus is always obvious     |
| Keyboard nav   | Tab through all interactive elements |
| Modal behavior | Focus trapping, Escape to close      |

**Key behaviors demonstrated:**

- **Theme persistence** — Choice survives page reloads
- **System preference** — Respects OS dark mode setting
- **Flash prevention** — Inline script applies theme before render
- **Focus management** — Focus rings use `:focus-visible`
- **ARIA patterns** — Proper roles and labels

Try this:

1. Set theme to dark, reload—no flash of light theme
2. Tab through the page—every interactive element has visible focus
3. Open a modal—focus is trapped inside, Escape closes it

---

## Behavior Across Demos

Some behaviors span all demo pages:

### Breadcrumbs

Every demo page shows breadcrumb navigation. This proves:

- Route hierarchy is understood
- Navigation patterns are consistent
- Deep links work correctly

### Layout Consistency

All demos share the same layout structure:

- Header with navigation
- Content area with consistent padding
- Responsive behavior on narrow viewports

### Error Boundaries

If a demo crashes, the error boundary catches it:

- Graceful error display instead of blank screen
- Clear indication something went wrong
- Recovery path available

---

## What the Demo Proves

When all demos work correctly, you have evidence that:

| Claim                     | Evidence                                        |
| ------------------------- | ----------------------------------------------- |
| Type-safe API contracts   | Data demo fetches typed responses               |
| Consistent app states     | Loading/empty/error/success all handled         |
| SSR-safe auth             | Auth demo renders correctly on first paint      |
| Form validation alignment | Form demo shows client-server validation        |
| Feature management        | Flags demo toggles features dynamically         |
| Observability             | Observability demo captures errors with context |
| Accessibility             | A11y demo passes keyboard navigation            |
| Theming                   | Theme persists without flash                    |

The demo is the proof. The rest of the documentation is the story.

---

## Further Reading

- [Quickstart](quickstart.md) — How to run and explore the demo
- [Architecture](architecture.md) — The system design behind these behaviors
- [Capabilities](capabilities.md) — What these patterns solve in real applications
