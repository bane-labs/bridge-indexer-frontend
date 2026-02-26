# Config Conventions

> **Platform Principle**: Configuration should be typed, validated, and accessed through a single
> facade.

## Overview

Atlas uses a **config facade pattern** to provide a stable, typed interface for accessing
application configuration. This abstracts away the complexity of environment variables and runtime
config into a clean API that works consistently across server and client code.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Config Facade                         │
│  Single typed interface for all configuration access        │
└─────────────────────────────────────────────────────────────┘
                          ▲         ▲
                          │         │
              ┌───────────┘         └───────────┐
              │                                 │
    ┌─────────────────────┐         ┌─────────────────────┐
    │   Server Config     │         │   Client Config     │
    │  (env variables)    │         │  (runtime config)   │
    └─────────────────────┘         └─────────────────────┘
              ▲                                 ▲
              │                                 │
    ┌─────────────────────┐         ┌─────────────────────┐
    │  @t3-oss/env-nextjs │         │  /api/runtime-config│
    │  (validated env)    │         │  (API endpoint)     │
    └─────────────────────┘         └─────────────────────┘
```

### Key Components

1. **Config Schema** (`src/config/schema.ts`)

   - Single source of truth for config shape
   - Zod schemas for validation
   - TypeScript types for type safety

2. **Server Config** (`src/config/server.ts`)

   - Builds config from validated environment variables
   - Has access to both server-only and public config
   - Used in API routes, server components, middleware

3. **Client Config** (`src/config/client.ts`)

   - Builds config from runtime config endpoint
   - Client-safe subset (no server secrets)
   - Used in client components via React hook

4. **Config Facade** (`src/config/index.ts`)
   - Single entrypoint exporting both server and client APIs
   - Clear separation between server and client usage

## Rules

### 1. Never Read `process.env` Directly

❌ **Bad:**

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

✅ **Good - Server:**

```typescript
import { getServerConfig } from "@/config";

const config = getServerConfig();
const apiUrl = config.api.baseUrl;
```

✅ **Good - Client:**

```tsx
import { useConfig } from "@/config";

function MyComponent() {
  const config = useConfig();
  const apiUrl = config.api.baseUrl;
  // ...
}
```

### 2. Server Code Uses `getServerConfig()`

**When:** API routes, server components, middleware, server utilities

**Why:** Server code has access to all config including server-only values

```typescript
// app/api/users/route.ts
import { getServerConfig } from "@/config";

export async function GET() {
  const config = getServerConfig();

  // Access any config value
  const apiUrl = config.api.baseUrl;
  const logLevel = config.logging.level;
  const sentryEnabled = config.sentry.enabled;

  // ...
}
```

### 3. Client Code Uses `useConfig()`

**When:** Client components, hooks, browser-side code

**Why:** Client needs runtime-loaded config (no build-time inlining)

```tsx
// components/ApiClient.tsx
"use client";

import { useConfig } from "@/config";

export function ApiClient() {
  const config = useConfig();

  // Access client-safe config
  const apiUrl = config.api.baseUrl;
  const environment = config.app.env;

  // ...
}
```

### 4. Add New Config via Schema First

**Process:**

1. Add to schema in `src/config/schema.ts`
2. Wire in `src/config/server.ts` (map from env vars)
3. Wire in `src/config/client.ts` if needed (map from runtime config)
4. Use through config facade

**Example:**

```typescript
// 1. Add to schema
export const configSchema = z.object({
  // ... existing fields
  analytics: z.object({
    enabled: z.boolean(),
    trackingId: z.string().optional(),
  }),
});

// 2. Wire in server config
export function getServerConfig(): Config {
  return {
    // ... existing config
    analytics: {
      enabled: Boolean(serverEnv.ANALYTICS_TRACKING_ID),
      trackingId: serverEnv.ANALYTICS_TRACKING_ID,
    },
  };
}

// 3. Wire in client config (if needed)
export function createClientConfig(runtimeConfig: RuntimeConfig): ClientConfig {
  return {
    // ... existing config
    analytics: {
      enabled: runtimeConfig.analyticsEnabled ?? false,
      trackingId: runtimeConfig.analyticsTrackingId,
    },
  };
}

// 4. Use in your code
const config = getServerConfig();
if (config.analytics.enabled) {
  // ...
}
```

## Config Assembly

### Server-Side

```typescript
Environment Variables (validated by @t3-oss/env-nextjs)
           ↓
    Server Config Module
           ↓
    Typed Config Object
```

**Source:** `serverEnv` and `clientEnv` from `@/env`  
**Output:** Complete `Config` object with all fields  
**Access:** `getServerConfig()` or `serverConfig` (cached)

### Client-Side

```typescript
Runtime Config API (/api/runtime-config)
           ↓
  RuntimeConfigProvider (loads at startup)
           ↓
    Client Config Module
           ↓
  Typed ClientConfig Object (via useConfig hook)
```

**Source:** Runtime config loaded from `/api/runtime-config`  
**Output:** Client-safe `ClientConfig` subset  
**Access:** `useConfig()` hook (must be inside `RuntimeConfigProvider`)

## Common Patterns

### Feature Flags

```tsx
import { useConfig } from "@/config";

function FeatureGate() {
  const config = useConfig();

  if (!config.features.newDashboard) {
    return <LegacyDashboard />;
  }

  return <NewDashboard />;
}
```

### API Base URL

```tsx
// Client component
import { useConfig } from "@/config";

function DataFetcher() {
  const config = useConfig();

  const fetchData = async () => {
    const response = await fetch(`${config.api.baseUrl}/data`);
    return response.json();
  };

  // ...
}
```

```typescript
// Server component or API route
import { getServerConfig } from "@/config";

export async function GET() {
  const config = getServerConfig();
  const response = await fetch(`${config.api.baseUrl}/external-api`);
  // ...
}
```

### Environment-Specific Behavior

```tsx
import { useConfig } from "@/config";

function DebugPanel() {
  const config = useConfig();

  // Only show in development
  if (config.app.env !== "development") {
    return null;
  }

  return <div>Debug info...</div>;
}
```

### Sentry Configuration

```typescript
import { getServerConfig } from "@/config";

const config = getServerConfig();

if (config.sentry.enabled) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    release: config.sentry.release,
  });
}
```

## ESLint Enforcement

The codebase enforces config conventions through ESLint rules:

### 1. No Direct `process.env` Access

**Rule:** `no-restricted-syntax` on `process.env`  
**Allowed Files:**

- `src/env/**` (env module itself)
- `src/config/**` (config module)
- `src/app/api/runtime-config/route.ts` (runtime config endpoint)
- Test files

**Error Message:**

```
Direct access to process.env is not allowed. Use the config facade instead:
  - Server-side: import { getServerConfig } from '@/config'
  - Client-side: import { useConfig } from '@/config'
```

### 2. No Direct Env Module Imports

**Rule:** `no-restricted-imports` on `@/env`  
**Allowed Files:**

- `src/config/**` (needs env to build config)
- `src/lib/runtime-config/**` (legacy support)
- API routes (with warning)

**Error Message:**

```
Direct env imports are discouraged. Use the config facade instead:
  - Server-side: import { getServerConfig } from '@/config'
  - Client-side: import { useConfig } from '@/config'
```

## Migration Guide

### Migrating from Direct Env Usage

**Before:**

```typescript
import { serverEnv, clientEnv } from "@/env";

const apiUrl = serverEnv.API_BASE_URL;
const logLevel = serverEnv.LOG_LEVEL;
```

**After:**

```typescript
import { getServerConfig } from "@/config";

const config = getServerConfig();
const apiUrl = config.api.baseUrl;
const logLevel = config.logging.level;
```

### Migrating from Runtime Config

**Before:**

```tsx
import { useRuntimeConfig } from "@/lib/runtime-config";

function MyComponent() {
  const { apiBaseUrl } = useRuntimeConfig();
  // ...
}
```

**After:**

```tsx
import { useConfig } from "@/config";

function MyComponent() {
  const config = useConfig();
  const apiUrl = config.api.baseUrl;
  // ...
}
```

## Benefits

1. **Type Safety**: All config access is fully typed
2. **Validation**: Config is validated at assembly time
3. **Consistency**: Same interface whether server or client
4. **Testability**: Easy to mock config in tests
5. **Documentation**: Config shape is self-documenting
6. **Maintainability**: Single place to add/modify config
7. **Build Once, Deploy Many**: Client config loaded at runtime

## Exceptions

### When You Can Use Env Directly

1. **In the env module itself** (`src/env/**`)
2. **In the config module** (`src/config/**`)
3. **In test setup** (`src/test/**`)

### When You Can Use Runtime Config Directly

If you need the raw runtime config structure for some reason (rare), you can still import from
`@/lib/runtime-config`. However, prefer the config facade for consistency.

## See Also

- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Detailed env var documentation
- [Runtime Config](./RUNTIME_CONFIG.md) - Runtime config implementation details
- [Platform Principles](./platform-principles.md) - Overall platform conventions
