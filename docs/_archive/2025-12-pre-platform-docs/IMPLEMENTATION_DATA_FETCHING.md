# Atlas Data Fetching Implementation Summary

**Implementation Date**: December 22, 2025  
**Status**: ✅ Complete

---

## Overview

This PR implements a comprehensive data fetching and API contract system for Atlas following
enterprise-grade patterns:

- ✅ Type-safe API contracts via OpenAPI
- ✅ Central API client with "no fetch spaghetti" enforcement
- ✅ React Query with enterprise defaults
- ✅ Standard error handling with user-safe messages
- ✅ Automatic correlation ID propagation
- ✅ Smart caching and invalidation patterns
- ✅ Clear RSC vs Client Component patterns

---

## What Was Implemented

### 1. Central API Layer (`apps/web/src/lib/api/`)

**Core modules:**

- `client.ts` - Central API client (only place to call fetch in client code)
- `server.ts` - Server-only API helpers (uses existing fetchWithContext)
- `config.ts` - Base URL resolution + retry configuration
- `errors.ts` - ApiError class + normalization utilities
- `correlation.ts` - Correlation ID generation and propagation
- `contracts/schema.ts` - Generated OpenAPI types (auto-generated)
- `contracts/index.ts` - Typed API client (`api.users.*`, `api.system.*`)

**Key features:**

- All fetch calls go through central client
- Automatic auth header injection (pluggable provider)
- Correlation IDs on every request
- Retry logic only for transient failures (502/503/504/429/network errors)
- Standard error normalization
- Type-safe using OpenAPI contracts

### 2. OpenAPI Contract Generation

**Location:** `openapi/openapi.json`

**Script:** `pnpm api:gen` (root or web workspace)

**Generated output:** `apps/web/src/lib/api/contracts/schema.ts`

**Example API spec includes:**

- Health check endpoint
- Users CRUD endpoints (list, get, create, update, delete)
- Standard error responses matching ApiError shape
- Pagination patterns

**Usage:**

```bash
# From monorepo root
pnpm api:gen

# From apps/web
cd apps/web && pnpm api:gen
```

### 3. React Query Setup (`apps/web/src/lib/react-query/`)

**Modules:**

- `provider.tsx` - QueryClient provider with enterprise defaults
- `keys.ts` - Query key factories (`createQueryKeys`)
- `patterns.ts` - Standard query/mutation patterns
- `index.ts` - Public exports

**QueryClient defaults:**

```ts
{
  staleTime: 60 * 1000,           // 1 minute
  gcTime: 10 * 60 * 1000,         // 10 minutes
  refetchOnWindowFocus: false,
  retry: intelligent (only transient failures),
  retryDelay: exponential backoff,
}
```

**Retry logic:**

- ✅ Retry: Network errors, 408, 429, 502, 503, 504
- ❌ Don't retry: 400, 401, 403, 404, 422

### 4. Feature Module Pattern (`apps/web/src/features/users/`)

Complete example feature demonstrating all patterns:

- `keys.ts` - Query key factory using `createQueryKeys`
- `queries.ts` - Query hooks (`useUserList`, `useUser`)
- `mutations.ts` - Mutation hooks with cache invalidation
- `components/UserListExample.tsx` - Working demo component
- `index.ts` - Public exports

**Invalidation patterns:**

- Create → invalidate list queries
- Update → invalidate detail + lists
- Delete → remove detail + invalidate lists

### 5. ESLint Guardrails

**Rule:** Direct `fetch()` calls blocked in UI/feature code

**Allowed locations:**

- `src/lib/api/client.ts` - Central API client
- `src/lib/http/**` - HTTP utilities
- `src/app/api/**/route.ts` - Route handlers (API boundaries)

**Blocked locations:**

- `src/app/**` (except route.ts)
- `src/components/**`
- `src/features/**`
- `src/providers/**`

**Error message:**

```
Direct fetch() calls are not allowed. Use the central API client
from @/lib/api instead. This ensures consistent error handling,
correlation ID propagation, and retry logic.
```

### 6. Documentation

**New docs:**

- `docs/DATA_FETCHING.md` - Complete guide to data fetching patterns
- `openapi/README.md` - OpenAPI contract generation guide

**Topics covered:**

- Client vs Server patterns
- Query/mutation hooks
- Error handling
- Cache invalidation
- OpenAPI workflow
- Troubleshooting guide

---

## Directory Structure

```
atlas/
├── openapi/
│   ├── openapi.json           # API spec (source of truth)
│   └── README.md              # Contract generation guide
├── apps/web/src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── config.ts
│   │   │   ├── errors.ts
│   │   │   ├── correlation.ts
│   │   │   ├── contracts/
│   │   │   │   ├── schema.ts  # Generated
│   │   │   │   └── index.ts   # Typed client
│   │   │   └── index.ts
│   │   └── react-query/
│   │       ├── provider.tsx
│   │       ├── keys.ts
│   │       ├── patterns.ts
│   │       └── index.ts
│   ├── features/
│   │   └── users/
│   │       ├── keys.ts
│   │       ├── queries.ts
│   │       ├── mutations.ts
│   │       ├── components/
│   │       │   └── UserListExample.tsx
│   │       └── index.ts
│   └── app/api/
│       └── example/
│           └── route.ts       # Can use fetch
└── docs/
    └── DATA_FETCHING.md
```

---

## Integration with Existing Atlas Infrastructure

### ✅ Preserved Existing Patterns

1. **Provider structure** - Extended existing `MainProvider` in `src/providers/`
2. **Logging** - Server API client uses existing `fetchWithContext` (correlation IDs)
3. **Environment** - Reuses existing `@t3-oss/env-nextjs` setup
4. **ESLint** - Extends existing flat config in `apps/web/eslint.config.mjs`

### ✅ Backward Compatible

- Existing React Query provider refactored to export from `lib/react-query`
- No breaking changes to existing code
- All new patterns are opt-in

---

## Usage Examples

### Client Component (React Query)

```tsx
import { useUserList, useCreateUser } from "@/features/users";
import { getUserFacingMessage } from "@/lib/api";

function UserList() {
  const { data, error, isLoading } = useUserList({ page: 1 });
  const createUser = useCreateUser();

  if (error) return <div>{getUserFacingMessage(error)}</div>;

  return (
    <div>
      {data?.data.map((user) => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => createUser.mutate({ email: "...", name: "..." })}>Create</button>
    </div>
  );
}
```

### Server Component

```tsx
import { serverApiRequest } from "@/lib/api/server";

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await serverApiRequest<User>(`/users/${params.id}`);
  return <div>{user.name}</div>;
}
```

### Direct API Client

```tsx
import { api, getUserFacingMessage } from "@/lib/api/contracts";

async function handleAction() {
  try {
    const user = await api.users.get("user-123");
  } catch (error) {
    toast.error(getUserFacingMessage(error));
  }
}
```

---

## Testing & Validation

### ✅ All Checks Pass

```bash
# Lint (includes no-fetch-spaghetti enforcement)
pnpm lint
✅ Pass

# Type checking
pnpm typecheck
✅ Pass

# Build
pnpm build
✅ Pass

# Format
pnpm format:write
✅ Pass
```

### ✅ ESLint Guardrail Verified

**Test:** Created file with direct fetch() in `src/features/` **Result:** ESLint correctly blocks
with clear error message **Cleanup:** Test file removed

**Test:** Created route handler with fetch() in `src/app/api/` **Result:** ESLint correctly allows
(API boundary)

---

## Scripts Added

### Monorepo Root

```json
{
  "scripts": {
    "api:gen": "pnpm --filter @atlas/web api:gen"
  }
}
```

### apps/web

```json
{
  "scripts": {
    "api:gen": "openapi-typescript ../../openapi/openapi.json -o src/lib/api/contracts/schema.ts --empty-objects-unknown"
  }
}
```

---

## Dependencies Added

### apps/web

- `openapi-typescript@^7.10.1` (dev) - OpenAPI type generation

All other functionality uses existing dependencies:

- `@tanstack/react-query` (already installed)
- `@t3-oss/env-nextjs` (already installed)
- No new runtime dependencies

---

## Key Decisions

### 1. OpenAPI Source

**Decision:** Commit `openapi/openapi.json` to repo

**Rationale:**

- Deterministic builds without backend
- TypeScript catches breaking changes at compile time
- Generated types are also committed (not gitignored)

### 2. Retry Logic

**Decision:** Retry only transient failures (network errors, 502/503/504, 429)

**Rationale:**

- Client errors (400/401/403/404) should not retry
- Reduces unnecessary API load
- Exponential backoff prevents thundering herd

### 3. Server vs Client API

**Decision:** Separate `client.ts` and `server.ts`

**Rationale:**

- Server can use existing `fetchWithContext` (correlation IDs from request context)
- Client needs standalone correlation ID generation
- Clear separation of concerns

### 4. React Query Defaults

**Decision:** Conservative defaults (no auto-refetch on focus/mount/reconnect)

**Rationale:**

- Reduces noise and unnecessary API calls
- Teams can enable per-query if needed
- 60s stale time is sensible default

---

## Migration Guide

### For New Features

1. Create feature directory under `src/features/`
2. Define query keys using `createQueryKeys`
3. Create query hooks using `useQuery` + typed API client
4. Create mutation hooks using `useMutation` + invalidation patterns
5. Export from `index.ts`

### For Existing Code

**If using direct fetch():**

```tsx
// ❌ Old
const response = await fetch("/api/users");
const data = await response.json();

// ✅ New
import { api } from "@/lib/api/contracts";
const data = await api.users.list();
```

**If using custom React Query:**

```tsx
// ❌ Old
useQuery(["users"], () => fetch("/api/users").then((r) => r.json()));

// ✅ New
import { useUserList } from "@/features/users";
useUserList();
```

---

## Next Steps (Optional Enhancements)

### 1. Auth Integration

Current implementation has an auth hook:

```ts
import { setAuthTokenProvider } from "@/lib/api";

setAuthTokenProvider(async () => {
  const session = await getSession();
  return session?.accessToken;
});
```

**TODO:** Wire up actual auth provider when auth is implemented

### 2. React Query DevTools

For development debugging:

```bash
pnpm add @tanstack/react-query-devtools
```

Add to provider in dev mode only.

### 3. API Mocking

Use the OpenAPI spec with tools like:

- [MSW](https://mswjs.io/) for browser mocking
- [Prism](https://stoplight.io/open-source/prism) for mock server

### 4. Real Backend Integration

1. Replace `openapi/openapi.json` with actual backend spec
2. Run `pnpm api:gen`
3. Fix TypeScript errors (breaking changes)
4. Update base URLs in `.env` files

---

## Maintenance

### Updating API Contracts

1. **Backend changes API** → Update `openapi/openapi.json`
2. **Run** `pnpm api:gen`
3. **Fix TypeScript errors** (if breaking changes)
4. **Commit both files** (spec + generated types)

### Adding New Endpoints

1. Add to `openapi/openapi.json`
2. Run `pnpm api:gen`
3. Add typed client methods to `src/lib/api/contracts/index.ts`
4. Create feature module with query/mutation hooks

---

## Troubleshooting

### "Module not found: server-only"

**Cause:** Imported server-only module in client component

**Fix:** Use `@/lib/api` (client) instead of `@/lib/api/server`

### "Direct fetch() calls are not allowed"

**Cause:** Called fetch() in component/feature code

**Fix:** Use central API client: `import { api } from '@/lib/api/contracts'`

### Types don't match API response

**Cause:** OpenAPI spec out of sync

**Fix:**

1. Update `openapi/openapi.json`
2. Run `pnpm api:gen`
3. Fix TypeScript errors

---

## Related Documentation

- [DATA_FETCHING.md](../docs/DATA_FETCHING.md) - Complete data fetching guide
- [ENVIRONMENT_VARIABLES.md](../docs/ENVIRONMENT_VARIABLES.md) - API base URL config
- [LOGGING.md](../docs/LOGGING.md) - Correlation ID integration
- [CODE_QUALITY.md](../docs/CODE_QUALITY.md) - ESLint rules

---

## Files Changed

### Created (New)

**API Layer:**

- `apps/web/src/lib/api/client.ts`
- `apps/web/src/lib/api/server.ts`
- `apps/web/src/lib/api/config.ts`
- `apps/web/src/lib/api/errors.ts`
- `apps/web/src/lib/api/correlation.ts`
- `apps/web/src/lib/api/contracts/index.ts`
- `apps/web/src/lib/api/contracts/schema.ts` (generated)
- `apps/web/src/lib/api/index.ts`

**React Query:**

- `apps/web/src/lib/react-query/provider.tsx`
- `apps/web/src/lib/react-query/keys.ts`
- `apps/web/src/lib/react-query/patterns.ts`
- `apps/web/src/lib/react-query/index.ts`

**Example Feature:**

- `apps/web/src/features/users/keys.ts`
- `apps/web/src/features/users/queries.ts`
- `apps/web/src/features/users/mutations.ts`
- `apps/web/src/features/users/components/UserListExample.tsx`
- `apps/web/src/features/users/index.ts`

**Example Route Handler:**

- `apps/web/src/app/api/example/route.ts`

**OpenAPI:**

- `openapi/openapi.json`
- `openapi/README.md`

**Documentation:**

- `docs/DATA_FETCHING.md`

### Modified

- `apps/web/src/providers/react-query-provider.tsx` - Re-export from lib
- `apps/web/eslint.config.mjs` - Add no-fetch-spaghetti rules
- `apps/web/package.json` - Add api:gen script + openapi-typescript dep
- `package.json` (root) - Add api:gen script

---

## Summary

✅ **Complete implementation** of data fetching & API contracts system  
✅ **Fully integrated** with existing Atlas infrastructure  
✅ **Zero breaking changes** - all new patterns are opt-in  
✅ **Production-ready** - passes all linting, type checking, and builds  
✅ **Well documented** - comprehensive guides and examples  
✅ **Enforced by tooling** - ESLint prevents fetch spaghetti  
✅ **Type-safe** - OpenAPI contracts catch breaking changes  
✅ **Enterprise-grade** - smart retry, error handling, correlation IDs

**Ready to merge!** 🚀
