# Atlas Showcase Demo

> A comprehensive demo section that proves all Atlas platform primitives work together.

## Purpose

The demo section at `/demo` serves as:

1. **Living documentation** - Shows exactly how to use Atlas patterns
2. **Integration test surface** - Proves primitives work together in real scenarios
3. **Onboarding resource** - New engineers can explore working examples
4. **Regression canary** - If demo breaks, something fundamental changed

## Demo Pages

| Page              | Route                 | What It Proves                                                                           |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| **Landing**       | `/demo`               | Overview with navigation to all demo pages                                               |
| **Auth**          | `/demo/auth`          | Google OAuth, useSession hook, SignInButton/UserMenu, SSR-safe session display           |
| **Data**          | `/demo/data`          | React Query hooks, app states (skeleton → empty → error → success), mode switching       |
| **Form**          | `/demo/form`          | RHF + Zod validation, server error mapping, optimistic updates, form field binding       |
| **Flags**         | `/demo/flags`         | useFlag, useKillSwitch, FeatureGuard component, flag-driven UI                           |
| **Observability** | `/demo/observability` | Sentry.captureException, correlationId in errors, structured console logging             |
| **A11y & Theme**  | `/demo/a11y-theme`    | ThemeToggle (light/dark/system), keyboard navigation, focus-visible, modal accessibility |

## Running Locally

```bash
# Start the development server
pnpm dev

# Navigate to demo section
open http://localhost:3000/demo
```

## Mode Switching

The data demo supports different API response modes via query param:

| Mode    | URL                       | Behavior                       |
| ------- | ------------------------- | ------------------------------ |
| Success | `/demo/data?mode=success` | Returns sample items           |
| Empty   | `/demo/data?mode=empty`   | Returns empty array            |
| Error   | `/demo/data?mode=error`   | Returns 500 with correlationId |
| Slow    | `/demo/data?mode=slow`    | 1.5s delay before success      |

This lets you test all app states without backend changes.

## API Endpoints

The demo includes in-memory API endpoints that reset on server restart:

- `GET /api/demo/items?mode=success|empty|error|slow` - List items
- `POST /api/demo/items` - Create item (body: `{ title, description? }`)
- `PATCH /api/demo/items/[id]` - Toggle item status

## Feature Flags

Demo-specific flags defined in `lib/feature-flags/flags.ts`:

| Flag                         | Purpose                          |
| ---------------------------- | -------------------------------- |
| `DEMO_NEW_TABLE`             | Toggles experimental table view  |
| `DEMO_DANGEROUS_ACTION`      | Enables a guarded action         |
| `KILL_DEMO_DANGEROUS_ACTION` | Kill switch for dangerous action |

## Architecture Decisions

- **In-memory store**: No database dependency, resets on restart
- **Mode param**: Single endpoint simulates all states
- **Real components**: Uses actual Atlas UI components, not mocks
- **Feature isolation**: Demo code in `features/demo/` and `app/demo/`

## Sentry & Analytics

The observability page demonstrates:

1. **Manual exception capture** - `Sentry.captureException(error)`
2. **API error tracking** - Server returns `correlationId` for error correlation
3. **Structured logging** - Console output with timestamp and context

To verify Sentry integration:

1. Go to `/demo/observability`
2. Click "Trigger Error"
3. Check Sentry dashboard for the captured exception

## Accessibility Testing

The a11y page provides manual testing surfaces:

- **Tab order** - Tab through interactive elements
- **Focus rings** - Verify `:focus-visible` styling
- **Theme contrast** - Toggle themes and check WCAG compliance
- **Screen reader** - Elements have proper ARIA labels

## Related Documentation

- [Folder Structure](./folder-structure.md)
- [Testing Strategy](./testing.md)
- [API Patterns](./api.md)
- [Environment Variables](./env.md)
