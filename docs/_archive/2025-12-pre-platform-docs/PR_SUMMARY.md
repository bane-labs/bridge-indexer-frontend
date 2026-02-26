# Config Conventions Implementation - PR Summary

## Overview

Implements typed config facade pattern with strict ESLint enforcement to prevent `process.env`
sprawl across the codebase.

## Changes

### New Files Created

**Config Module** (`src/config/`)

- ✅ `schema.ts` - Zod schemas and TypeScript types for config contract
- ✅ `server.ts` - Server-side config builder (env → config)
- ✅ `client.ts` - Client-side config builder (runtime-config → config)
- ✅ `index.ts` - Single entrypoint with clean exports

**Documentation**

- ✅ `docs/CONFIG.md` - Complete config conventions guide
- ✅ Updated `docs/README.md` - Added config conventions reference

### Modified Files

**ESLint Configuration** (`apps/web/eslint.config.mjs`)

- Added rules banning `process.env` usage outside allowlisted files
- Added rules discouraging direct `@/env` imports in favor of config facade
- Allowlist: `src/env/**`, `src/config/**`, `src/app/api/runtime-config/route.ts`, tests

**Code Migrations**

- ✅ `src/lib/api/config.ts` - Uses `getServerConfig()` instead of env
- ✅ `src/lib/api/hooks.ts` - Uses `useConfig()` instead of `useRuntimeConfig()`
- ✅ `src/lib/logging/logger.server.ts` - Uses `serverConfig` instead of `serverEnv`
- ✅ `src/lib/telemetry/config.ts` - Simplified to use defaults (config facade used in components)
- ✅ `src/app/api/runtime-config/route.ts` - Uses `getServerConfig()` to build runtime config
- ✅ `src/app/demo/sentry/page.tsx` - Uses `useConfig()` instead of `clientEnv`
- ✅ `src/components/SentryErrorBoundary.tsx` - Removed `process.env.NODE_ENV` usage
- ✅ `src/providers/env-provider.tsx` - Wraps config facade (backwards compatibility)

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

## Config Contract

```typescript
{
  app: {
    url: string;
    env: "development" | "staging" | "production";
    buildId?: string;
  };
  api: {
    baseUrl: string;
  };
  sentry: {
    enabled: boolean;
    dsn?: string;
    environment?: string;
    release?: string;
  };
  webVitals: {
    enabled: boolean;
    sampleRate: number;
    endpoint: string;
    debug: boolean;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
  };
  features: Record<string, boolean>;
}
```

## Usage Patterns

### Server-side (API routes, server components, middleware)

```typescript
import { getServerConfig } from "@/config";

export async function GET() {
  const config = getServerConfig();
  const apiUrl = config.api.baseUrl;
  const logLevel = config.logging.level;
  // ...
}
```

### Client-side (client components, hooks)

```tsx
import { useConfig } from "@/config";

function MyComponent() {
  const config = useConfig();
  const apiUrl = config.api.baseUrl;
  const environment = config.app.env;
  // ...
}
```

## Benefits

1. ✅ **Type Safety** - All config access is fully typed with Zod validation
2. ✅ **Consistency** - Same interface whether server or client
3. ✅ **Testability** - Easy to mock config in tests
4. ✅ **Maintainability** - Single place to add/modify config
5. ✅ **Build Once, Deploy Many** - Client config loaded at runtime
6. ✅ **Enforced Conventions** - ESLint prevents process.env sprawl
7. ✅ **Clear Boundaries** - Server vs client config separation

## ESLint Enforcement

### Rule 1: No Direct `process.env` Access

- **Files:** All `src/**/*.{ts,tsx}` except allowlist
- **Allowlist:** `src/env/**`, `src/config/**`, `src/app/api/runtime-config/route.ts`, tests
- **Error:** Suggests using config facade instead

### Rule 2: No Direct Env Module Imports

- **Files:** App code, components, features, providers, lib
- **Allowlist:** Config module, runtime-config module, tests
- **Error:** Suggests using config facade instead

## Migration Path

### Before

```typescript
// Scattered env usage
import { serverEnv, clientEnv } from "@/env";

const apiUrl = serverEnv.API_BASE_URL;
const logLevel = serverEnv.LOG_LEVEL;
```

### After

```typescript
// Centralized config access
import { getServerConfig } from "@/config";

const config = getServerConfig();
const apiUrl = config.api.baseUrl;
const logLevel = config.logging.level;
```

## Breaking Changes

None - this is additive. Existing env module still works, but new code should use config facade.

## Future Enhancements

1. Feature flags management
2. Config validation middleware
3. Config hot-reloading for development
4. Config versioning and migration utilities

## Testing

- ✅ TypeScript compilation passes
- ✅ ESLint passes with new rules
- ✅ All config usage migrated to facade
- ✅ Documentation complete

## Acceptance Criteria

- [x] CONFIG_DIR exists with typed config contract
- [x] Server config assembled from env contract module (no process.env)
- [x] Client config assembled from runtime-config (no process.env)
- [x] Codebase uses config facade instead of ad-hoc env reads
- [x] ESLint prevents process.env usage outside allowlisted files
- [x] Docs added and clear
- [x] pnpm lint/build pass

## Deliverables

- [x] `src/config/schema.ts` - Typed config contract
- [x] `src/config/server.ts` - Server config builder
- [x] `src/config/client.ts` - Client config builder
- [x] `src/config/index.ts` - Clean export API
- [x] Migration of key usage sites (API, logging, telemetry, Sentry)
- [x] ESLint guardrails
- [x] Documentation (`docs/CONFIG.md`)

## Suggested Commit Messages

1. `feat(config): add typed config contract with server/client modules`
2. `refactor(config): migrate key usage sites to config facade`
3. `chore(config): add eslint guardrails banning process.env in app code`
4. `docs(config): document config conventions and usage patterns`

---

**Ready to merge** ✅
