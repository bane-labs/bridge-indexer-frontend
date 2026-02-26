# Analytics

Atlas provides a vendor-agnostic analytics adapter that enables consistent event tracking across
your application. This document covers setup, usage patterns, and best practices.

## Overview

The analytics system follows an **adapter pattern**:

- **Application code** imports only from `@/lib/analytics` - never from vendor SDKs
- **Adapters** wrap vendor SDKs (PostHog, GA4) and conform to a common interface
- **Consent gating** is built-in - events are only sent when consent is granted
- **Type-safe events** via a typed event taxonomy

### Why Adapter Style?

1. **Vendor independence**: Switch analytics providers without changing app code
2. **Consistent API**: Same `analytics.track()` call works across all providers
3. **Privacy-first**: Centralized consent management
4. **Type safety**: Typed event names and properties prevent typos
5. **Testability**: Easy to mock analytics in tests

## Quick Start

```typescript
import { analytics } from "@/lib/analytics";

// Track an event (type-safe)
analytics.track("auth.login", { method: "google" });

// Track a page view
analytics.page("Dashboard");

// Identify a user
analytics.identify("user_123", { email: "user@example.com" });

// Set consent state
analytics.setConsent(true);
```

## Setup

### Environment Variables

Configure analytics providers via environment variables:

#### PostHog (Recommended)

```bash
# Required for PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx

# Optional: Custom host (defaults to PostHog cloud)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

#### Google Analytics 4 (Optional)

```bash
# Required for GA4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Debug Mode

```bash
# Enable console logging for analytics events
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

### Provider Configuration

Analytics is automatically initialized by `AnalyticsProvider` in `MainProvider`:

```tsx
// src/providers/index.tsx
import { AnalyticsProvider } from "./analytics-provider";

export function MainProvider({ children }) {
  return (
    <RuntimeConfigProvider>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </RuntimeConfigProvider>
  );
}
```

## Usage

### Tracking Events

Use the type-safe `track()` method:

```typescript
import { analytics } from "@/lib/analytics";

// Auth events
analytics.track("auth.login", { method: "google" });
analytics.track("auth.logout", {});
analytics.track("auth.signup", { method: "email" });

// Feature usage
analytics.track("feature.used", { feature: "dark-mode" });
analytics.track("feature.enabled", { feature: "notifications" });

// UI interactions
analytics.track("ui.button_click", { buttonId: "submit-form", label: "Submit" });
analytics.track("ui.form_submit", { formId: "contact-form", success: true });
analytics.track("ui.modal_open", { modalId: "settings" });

// Search
analytics.track("search.query", { query: "hello", resultsCount: 42 });
analytics.track("search.result_click", { query: "hello", resultIndex: 0, resultId: "doc-1" });

// Custom events (escape hatch)
analytics.track("custom.event", { name: "my-event", data: { foo: "bar" } });
```

### Page Views

Track page views (especially for SPAs):

```typescript
analytics.page("Dashboard");
analytics.page("Settings", { section: "profile" });
```

### User Identification

Identify users after authentication:

```typescript
// On login
analytics.identify("user_123", {
  email: "user@example.com",
  name: "John Doe",
  plan: "pro",
});

// On logout
analytics.reset();
```

### Consent Management

Respect user privacy with consent gating:

```typescript
// User accepts cookies/tracking
analytics.setConsent(true);

// User declines
analytics.setConsent(false);

// Check if tracking is enabled
if (analytics.isEnabled()) {
  // Do something
}
```

> **Note**: When consent is not granted, all tracking calls are no-ops. Events are not queued.

## Event Taxonomy

Atlas uses a typed event taxonomy to ensure consistency. All events must be defined in the
`AnalyticsEventMap`:

```typescript
// src/lib/analytics/types.ts
export interface AnalyticsEventMap {
  // Authentication
  "auth.login": { method: "google" | "email" | "github" | "sso" };
  "auth.logout": Record<string, never>;
  "auth.signup": { method: "google" | "email" | "github" | "sso" };

  // Navigation
  "nav.click": { target: string; location?: string };
  "nav.page_view": { path: string; referrer?: string };

  // Features
  "feature.used": { feature: string; metadata?: Record<string, unknown> };
  "feature.enabled": { feature: string };
  "feature.disabled": { feature: string };

  // UI
  "ui.button_click": { buttonId: string; label?: string };
  "ui.form_submit": { formId: string; success: boolean };
  "ui.modal_open": { modalId: string };
  "ui.modal_close": { modalId: string };

  // Errors
  "error.boundary": { componentStack?: string; error: string };
  "error.api": { endpoint: string; statusCode: number; message?: string };

  // Performance
  "perf.web_vital": {
    metric: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
  };

  // Search
  "search.query": { query: string; resultsCount: number };
  "search.result_click": { query: string; resultIndex: number; resultId: string };

  // Escape hatch
  "custom.event": { name: string; data?: Record<string, unknown> };
}
```

### Adding New Events

1. Add the event to `AnalyticsEventMap` in [types.ts](../apps/web/src/lib/analytics/types.ts)
2. TypeScript will enforce the correct properties

```typescript
// 1. Define in types.ts
"checkout.completed": { orderId: string; total: number; currency: string };

// 2. Use with type safety
analytics.track("checkout.completed", {
  orderId: "order_123",
  total: 99.99,
  currency: "USD",
});
```

### Event Naming Conventions

- Use **lowercase** with **dots** as separators: `category.action`
- Categories: `auth`, `nav`, `feature`, `ui`, `error`, `perf`, `search`, `custom`
- Actions: `click`, `view`, `submit`, `open`, `close`, `used`, `enabled`, etc.
- Be specific but concise

## Common Properties

Every event automatically includes these common properties:

| Property        | Type                                         | Description                        |
| --------------- | -------------------------------------------- | ---------------------------------- |
| `app`           | `"atlas"`                                    | Application name                   |
| `env`           | `"development" \| "staging" \| "production"` | Current environment                |
| `correlationId` | `string`                                     | Request correlation ID for tracing |
| `timestamp`     | `number`                                     | Unix timestamp (milliseconds)      |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Code                         │
│         import { analytics } from "@/lib/analytics"         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analytics Core                           │
│   - Singleton API (analytics.track, .page, .identify, etc.) │
│   - Common props injection (app, env, correlationId)        │
│   - Consent gating                                          │
│   - Multi-adapter fan-out                                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│    PostHog Adapter      │     │      GA4 Adapter        │
│    (posthog-js)         │     │      (gtag.js)          │
└─────────────────────────┘     └─────────────────────────┘
```

## Adapters

### PostHog (Default)

The recommended analytics provider. Features:

- Event tracking
- User identification
- Session recording (via PostHog dashboard)
- Feature flags (separate from Atlas feature flags)

Configuration:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # optional
```

### Google Analytics 4 (Optional)

Standard GA4 via gtag.js. Features:

- Event tracking (event names converted: `auth.login` → `auth_login`)
- Page views
- User ID support

Configuration:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Multiple Adapters

When both PostHog and GA are configured, events are sent to **both** providers (fan-out pattern).
This is useful for:

- Migration periods between providers
- Using GA for marketing and PostHog for product analytics

## ESLint Guardrails

Direct imports of analytics vendor SDKs are **blocked by ESLint**:

```typescript
// ❌ This will fail lint
import posthog from "posthog-js";

// ✅ Use the adapter instead
import { analytics } from "@/lib/analytics";
```

The rule is defined in [eslint.config.mjs](../apps/web/eslint.config.mjs).

## Testing

Mock analytics in tests:

```typescript
import { resetAnalytics, initAnalytics } from "@/lib/analytics";
import { NoopAnalytics } from "@/lib/analytics/noop";

beforeEach(() => {
  resetAnalytics();
});

test("tracks login event", () => {
  const mockAdapter = {
    track: jest.fn(),
    page: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    setConsent: jest.fn(),
    isEnabled: () => true,
  };

  initAnalytics([mockAdapter], { consentGranted: true });

  // Trigger action that should track
  // ...

  expect(mockAdapter.track).toHaveBeenCalledWith(
    "auth.login",
    expect.objectContaining({ method: "google" })
  );
});
```

## Troubleshooting

### Events not being tracked

1. **Check consent**: Ensure `analytics.setConsent(true)` was called
2. **Check env vars**: Verify `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
3. **Enable debug mode**: Set `NEXT_PUBLIC_ANALYTICS_DEBUG=true` to see console logs

### PostHog not initializing

1. Check browser console for errors
2. Verify the API key is correct
3. Check if the host URL is accessible

### GA events not appearing

1. GA4 can have a delay of up to 24 hours in reports
2. Use GA4 DebugView for real-time debugging
3. Verify the measurement ID format is `G-XXXXXXXXXX`

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Feature Flags](./FEATURE_FLAGS.md)
- [Logging](./LOGGING.md)
