# Runtime Configuration Pattern

## Overview

Atlas implements a **runtime configuration pattern** to enable "build once, deploy many" by
separating build-time from runtime environment configuration.

This pattern solves a critical limitation of Next.js's `NEXT_PUBLIC_*` environment variables, which
are **inlined at build time** and cannot change between deployments without rebuilding.

## The Problem with NEXT_PUBLIC

When you use `NEXT_PUBLIC_*` environment variables in Next.js:

```tsx
// ❌ BAD: This value is baked into the bundle at build time
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**What happens:**

1. During `next build`, Next.js **replaces** all `process.env.NEXT_PUBLIC_*` with their literal
   values
2. The resulting JavaScript bundle contains hardcoded strings
3. To change the API URL for different environments, you must rebuild the entire application

**This prevents:**

- Using the same Docker image across dev/staging/prod
- Deploying to different regions with different API endpoints
- A/B testing different backend configurations
- Emergency configuration changes without redeploys

## The Runtime Config Solution

Atlas loads client-safe configuration **at runtime** via an API endpoint:

```
Client loads app → Calls /api/runtime-config → Receives environment-specific config
```

**Benefits:**

- ✅ Build once, deploy to multiple environments
- ✅ Change configuration without rebuilding
- ✅ Same Docker image for dev, staging, production
- ✅ Type-safe runtime config with Zod validation
- ✅ Clear separation between server secrets and client-safe config

## Architecture

### 1. Runtime Config Schema

Defines **client-safe, runtime-varying** configuration:

```typescript
// src/lib/runtime-config/schema.ts
export const runtimeConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  appUrl: z.string().url(),
  environment: z.enum(["development", "staging", "production"]),
  sentryDsn: z.string().url().optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional(),
  // ...
});

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;
```

### 2. API Endpoint

Serves runtime config as JSON:

```typescript
// src/app/api/runtime-config/route.ts
export async function GET() {
  const config = {
    apiBaseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    environment: clientEnv.NEXT_PUBLIC_APP_ENV ?? "development",
    // Read from server env, validate, return to client
  };

  return NextResponse.json(runtimeConfigSchema.parse(config));
}
```

**Runtime:** Node.js (not Edge)  
**Cache:** `s-maxage=60, stale-while-revalidate=30` (configurable)

### 3. Client Loader

Fetches and caches config:

```typescript
// src/lib/runtime-config/client.ts
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // Fetches /api/runtime-config once
  // Validates with schema
  // Memoizes in-module
}
```

### 4. Provider & Hook

Makes config available throughout React tree:

```tsx
// src/lib/runtime-config/provider.tsx
export function RuntimeConfigProvider({ children }) {
  // Loads config on mount
  // Shows loading state
  // Provides via context
}

export function useRuntimeConfig(): RuntimeConfig {
  // Returns typed runtime config
}
```

### 5. Integration

Provider is mounted at the root:

```tsx
// src/providers/index.tsx
export function MainProvider({ children }) {
  return (
    <RuntimeConfigProvider>
      <OtherProviders>{children}</OtherProviders>
    </RuntimeConfigProvider>
  );
}
```

## Usage Guide

### What Belongs in Runtime Config?

**✅ DO use runtime config for:**

- API base URLs (vary per environment)
- App URLs (for OAuth redirects, link generation)
- Public telemetry endpoints (Sentry DSN, analytics)
- Environment identifiers (dev/staging/prod)
- Feature flags (enable/disable features at runtime)
- Build metadata (version, git SHA)

**❌ DON'T use runtime config for:**

- Server secrets (database passwords, API keys)
- Values that never change between environments
- Build-time constants (app name, static asset paths)

### In Client Components

Use the `useRuntimeConfig` hook:

```tsx
import { useRuntimeConfig } from "@/lib/runtime-config";

function MyComponent() {
  const { apiBaseUrl, environment, featureFlags } = useRuntimeConfig();

  return (
    <div>
      <p>Environment: {environment}</p>
      <p>API: {apiBaseUrl}</p>
      {featureFlags?.newDashboard && <NewDashboard />}
    </div>
  );
}
```

### In API Calls (Client)

Use the runtime-aware API client hooks:

```tsx
import { useApiClient } from "@/lib/api";

function UserProfile() {
  const api = useApiClient(); // Automatically uses runtime config

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: () => api.get("/users/me"),
  });

  return <div>{data?.name}</div>;
}
```

### In Server Components / API Routes

Use server env directly (no runtime config needed):

```tsx
import { serverEnv } from "@/env";

export async function GET() {
  const apiUrl = serverEnv.API_BASE_URL;
  const response = await fetch(`${apiUrl}/data`);
  return Response.json(await response.json());
}
```

## Adding a New Runtime Config Value

### Step 1: Add to Schema

```typescript
// src/lib/runtime-config/schema.ts
export const runtimeConfigSchema = z.object({
  // ... existing fields
  newFeatureEnabled: z.boolean().optional(),
});
```

### Step 2: Add to API Endpoint

```typescript
// src/app/api/runtime-config/route.ts
const config = {
  // ... existing fields
  newFeatureEnabled: process.env.NEXT_PUBLIC_NEW_FEATURE === "true",
};
```

### Step 3: Use in Components

```tsx
import { useRuntimeConfig } from "@/lib/runtime-config";

function MyComponent() {
  const { newFeatureEnabled } = useRuntimeConfig();

  if (!newFeatureEnabled) {
    return <LegacyFeature />;
  }

  return <NewFeature />;
}
```

## Caching Strategy

**Endpoint cache headers:**

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=30
```

**Behavior:**

- CDN/proxy caches for 60 seconds
- Serves stale for 30 seconds while revalidating
- Client memoizes in-memory for session lifetime

**For stricter freshness:** Change to `no-store, must-revalidate` in
[route.ts](../apps/web/src/app/api/runtime-config/route.ts)

## ESLint Guardrails

To prevent accidental regression to build-time env vars, ESLint restricts `NEXT_PUBLIC_*` usage in
client code:

```javascript
// eslint.config.mjs
{
  files: ['src/components/**', 'src/features/**', 'src/hooks/**'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "MemberExpression[object.name='clientEnv'][property.name=/^NEXT_PUBLIC_/]",
        message: 'Use runtime config instead: import { useRuntimeConfig } from "@/lib/runtime-config"'
      }
    ]
  }
}
```

**Allowed locations:**

- `src/env/**` (env module itself)
- `src/app/api/**/route.ts` (API routes are server-side)
- Test files

## Do's and Don'ts

### ✅ DO

- **DO** use runtime config for client-side runtime-varying values
- **DO** use `useRuntimeConfig()` hook in client components
- **DO** use `useApiClient()` for API calls in client components
- **DO** use server env directly in server components/API routes
- **DO** validate runtime config with Zod schema
- **DO** add new runtime-varying values to runtime config

### ❌ DON'T

- **DON'T** read `process.env.NEXT_PUBLIC_*` directly in client components
- **DON'T** import `clientEnv.NEXT_PUBLIC_*` in new client code
- **DON'T** put secrets in runtime config (server env only)
- **DON'T** use runtime config in server-side code (use server env)
- **DON'T** bypass the provider (always use `useRuntimeConfig()`)

## Migration from NEXT_PUBLIC

If you have existing code using `NEXT_PUBLIC_*`:

### Before (Build-Time)

```tsx
import { clientEnv } from "@/env";

function MyComponent() {
  const apiUrl = clientEnv.NEXT_PUBLIC_API_URL; // ❌ Build-time value
  // ...
}
```

### After (Runtime)

```tsx
import { useRuntimeConfig } from "@/lib/runtime-config";

function MyComponent() {
  const { apiBaseUrl } = useRuntimeConfig(); // ✅ Runtime value
  // ...
}
```

### For API Calls

**Before:**

```tsx
import { apiGet } from "@/lib/api";

function MyComponent() {
  const user = await apiGet("/users/me"); // Uses build-time getApiBaseUrl()
}
```

**After:**

```tsx
import { useApiClient } from "@/lib/api";

function MyComponent() {
  const api = useApiClient(); // Uses runtime config
  const user = await api.get("/users/me");
}
```

## Testing

### Unit Tests

Mock the runtime config:

```typescript
import { RuntimeConfigContext } from '@/lib/runtime-config/provider';

const mockConfig = {
  apiBaseUrl: 'https://api.test.com',
  environment: 'development',
  // ...
};

render(
  <RuntimeConfigContext.Provider value={mockConfig}>
    <MyComponent />
  </RuntimeConfigContext.Provider>
);
```

### Integration Tests

Set environment variables before tests:

```bash
NEXT_PUBLIC_API_URL=https://staging-api.example.com pnpm test
```

## Deployment Examples

### Docker

```dockerfile
# Build once
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Runtime env vars (NOT build-time)
ENV NEXT_PUBLIC_API_URL=${API_URL}
ENV NEXT_PUBLIC_APP_ENV=${ENVIRONMENT}

CMD ["pnpm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: atlas-web
spec:
  template:
    spec:
      containers:
        - name: web
          image: atlas:v1.0.0 # Same image for all environments
          env:
            - name: NEXT_PUBLIC_API_URL
              value: "https://api.production.example.com"
            - name: NEXT_PUBLIC_APP_ENV
              value: "production"
```

Same image, different config per environment! 🎉

## Troubleshooting

### Config not loading

**Symptom:** White screen or "useRuntimeConfig must be used within RuntimeConfigProvider"

**Solution:** Ensure `RuntimeConfigProvider` is mounted in
[providers/index.tsx](../apps/web/src/providers/index.tsx)

### Config shows old values

**Symptom:** Changed env vars but client sees old values

**Solutions:**

1. Hard refresh browser (Cmd+Shift+R)
2. Check CDN cache headers
3. Verify env vars are set in deployment

### TypeScript errors

**Symptom:** "Property X does not exist on RuntimeConfig"

**Solution:** Add the property to [schema.ts](../apps/web/src/lib/runtime-config/schema.ts)

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Server env setup
- [API Client](../apps/web/src/lib/api/README.md) - API client usage
- [Testing](./TESTING.md) - Testing with runtime config

## Summary

Runtime config enables **true runtime environment separation**:

- Build once → Deploy many environments
- No rebuild required for config changes
- Type-safe with Zod validation
- Clear separation: server secrets vs. client-safe config
- Enforced via ESLint to prevent regressions

Use `useRuntimeConfig()` for all client-side runtime-varying values. Use server env for secrets.
