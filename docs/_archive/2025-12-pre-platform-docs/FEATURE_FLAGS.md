# Feature Flags

> Runtime feature flag system with typed keys, kill switch support, and future PostHog integration.

## Quick Start

```tsx
import { useFlag, FeatureFlags } from "@/lib/feature-flags";

function MyComponent() {
  const isNewDashboard = useFlag(FeatureFlags.NEW_DASHBOARD);
  return isNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
}
```

## Architecture

### Sources & Precedence

Feature flags are resolved from multiple sources with the following precedence (highest to lowest):

1. **Kill Switches** - If `kill_<feature>=true`, the feature is **DISABLED** regardless of other
   settings
2. **Query Params** (dev only) - `?ff_new_dashboard=1` for temporary testing
3. **Local Overrides** (dev only) - Stored in localStorage for persistent dev testing
4. **Runtime Config** - Flags from `/api/runtime-config` (set via environment)
5. **Defaults** - All flags default to `false`

### Components

| Module                       | Purpose                            |
| ---------------------------- | ---------------------------------- |
| `flags.ts`                   | Typed flag keys contract           |
| `types.ts`                   | Interfaces and merge logic         |
| `defaultAdapter.ts`          | Runtime + local override resolver  |
| `provider.tsx`               | React context + hooks              |
| `killSwitch.tsx`             | Guard components + server patterns |
| `adapters/posthogAdapter.ts` | Future PostHog integration (stub)  |

## Adding a New Flag

### 1. Add to Flag Contract

```tsx
// lib/feature-flags/flags.ts
export const FeatureFlags = {
  // ... existing flags

  /**
   * My new feature description.
   */
  MY_NEW_FEATURE: "my_new_feature",

  /**
   * Kill switch for my new feature.
   * When true, the feature is forcibly DISABLED.
   */
  KILL_MY_NEW_FEATURE: "kill_my_new_feature",
} as const;
```

### 2. Configure Runtime Default

```tsx
// config/server.ts - in getServerConfig()
features: {
  my_new_feature: process.env.FEATURE_MY_NEW_FEATURE === "true",
  kill_my_new_feature: process.env.KILL_MY_NEW_FEATURE === "true",
},
```

### 3. Use in Components

```tsx
import { useFlag, FeatureFlags } from "@/lib/feature-flags";

function MyComponent() {
  const isEnabled = useFlag(FeatureFlags.MY_NEW_FEATURE);

  if (!isEnabled) {
    return null; // or fallback
  }

  return <MyNewFeature />;
}
```

## Kill Switch Pattern

Kill switches are a **critical safety mechanism** for risky features. They allow instant disabling
of features without code deployment.

### Rule: Two-Boundary Guard

> ⚠️ **Risky features MUST be guarded in TWO places:**
>
> 1. **UI Entry Points** - Hide/disable the feature in the UI
> 2. **Execution Boundary** - Block the action server-side

**UI-only hiding is NOT sufficient!** Users can bypass UI guards via dev tools, direct API calls,
etc.

### Client-Side Guard

```tsx
import { FeatureGuard, FeatureFlags } from "@/lib/feature-flags";

function RiskyUploadSection() {
  return (
    <FeatureGuard
      feature={FeatureFlags.RISKY_UPLOAD_FLOW}
      fallback={<StandardUpload />}
      killedFallback={<Alert variant="warning">Enhanced upload is temporarily unavailable.</Alert>}
    >
      <RiskyUpload />
    </FeatureGuard>
  );
}
```

### Server-Side Guard (Server Action)

```tsx
"use server";

import { getServerConfig } from "@/config/server";
import { FeatureFlags, FeatureDisabledError, checkServerFeature } from "@/lib/feature-flags";

export async function riskyUploadAction(formData: FormData) {
  const config = getServerConfig();
  const { enabled, killed } = checkServerFeature(config.features, FeatureFlags.RISKY_UPLOAD_FLOW);

  if (killed) {
    throw new FeatureDisabledError(FeatureFlags.RISKY_UPLOAD_FLOW, true);
  }

  if (!enabled) {
    throw new FeatureDisabledError(FeatureFlags.RISKY_UPLOAD_FLOW, false);
  }

  // Proceed with risky operation
  return await processRiskyUpload(formData);
}
```

### Server-Side Guard (API Route)

```tsx
import { NextResponse } from "next/server";
import { getServerConfig } from "@/config/server";
import { FeatureFlags, FeatureDisabledError, checkServerFeature } from "@/lib/feature-flags";

export async function POST(request: Request) {
  const config = getServerConfig();
  const { enabled, killed } = checkServerFeature(config.features, FeatureFlags.RISKY_UPLOAD_FLOW);

  if (!enabled || killed) {
    return NextResponse.json(
      new FeatureDisabledError(FeatureFlags.RISKY_UPLOAD_FLOW, killed).toResponse(),
      { status: 403 }
    );
  }

  // Process request...
}
```

## Local Development Overrides

### Using the Dev Panel

Visit `/__flags` in development to:

- View all flag states and their sources
- Toggle flags on/off via UI
- Clear all overrides

### Using localStorage

```javascript
// In browser console
localStorage.setItem(
  "ff-overrides",
  JSON.stringify({
    flags: {
      new_dashboard: true,
      beta_features: false,
    },
  })
);

// Then refresh the page
```

### Using Query Params

```
http://localhost:3000/dashboard?ff_new_dashboard=1&ff_beta_features=0
```

Query param format:

- `?ff_<flag_name>=1` → enabled
- `?ff_<flag_name>=0` → disabled

## Environment Configuration

Set flags via environment variables in your deployment:

```bash
# .env.local or deployment config
FEATURE_NEW_DASHBOARD=true
FEATURE_BETA_FEATURES=false
KILL_RISKY_UPLOAD_FLOW=false
```

These are read in `config/server.ts` and exposed via `/api/runtime-config`.

## PostHog Integration (Future)

The system is designed to support PostHog feature flags. To integrate:

1. Install `posthog-js`
2. Initialize PostHog client
3. Use `createPostHogAdapter` instead of default adapter
4. Configure flags in PostHog dashboard

**Important**: Kill switches from runtime config ALWAYS take precedence over PostHog flags. This
ensures operators can disable features instantly without waiting for PostHog propagation.

See `lib/feature-flags/adapters/posthogAdapter.ts` for implementation details.

## API Reference

### Hooks

| Hook                 | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `useFlag(key)`       | Check if a flag is enabled (includes kill switch logic)       |
| `useFlags()`         | Access full context with `isEnabled`, `isKilled`, `getSource` |
| `useKillSwitch(key)` | Check if a kill switch is active                              |

### Components

| Component              | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `FeatureGuard`         | Conditional rendering based on flag state |
| `FeatureFlagsProvider` | Context provider (wired in MainProvider)  |

### Utilities

| Utility                | Purpose                            |
| ---------------------- | ---------------------------------- |
| `FeatureFlags`         | Typed flag key constants           |
| `FeatureDisabledError` | Error class for server-side guards |
| `checkServerFeature()` | Non-throwing server-side check     |
| `createServerGuard()`  | Factory for throwing server guards |

## Testing

### Mock Flags in Tests

```tsx
import { render } from "@testing-library/react";
import { FeatureFlagsProvider, createDefaultAdapter } from "@/lib/feature-flags";

function renderWithFlags(ui: React.ReactElement, flags: Record<string, boolean>) {
  const adapter = createDefaultAdapter({ runtimeFlags: flags });

  return render(<FeatureFlagsProvider adapter={adapter}>{ui}</FeatureFlagsProvider>);
}

test("shows new dashboard when enabled", () => {
  renderWithFlags(<Dashboard />, { new_dashboard: true });
  expect(screen.getByText("New Dashboard")).toBeInTheDocument();
});

test("shows legacy when killed", () => {
  renderWithFlags(<Dashboard />, {
    new_dashboard: true,
    kill_new_dashboard: true,
  });
  expect(screen.getByText("Legacy Dashboard")).toBeInTheDocument();
});
```
