# ADR-0003: Data Fetching with React Query + OpenAPI

## Status

**Accepted**

## Context

Client-side data fetching in React applications often becomes scattered:

- `fetch()` calls sprinkled throughout components
- Inconsistent error handling
- No caching strategy
- Manual loading/error states
- Duplicated request logic
- Type mismatches with backend

We needed a pattern that:

- Centralizes HTTP logic
- Provides consistent caching
- Enforces type safety with backend
- Prevents direct `fetch()` in UI code

## Decision

We use **React Query** (TanStack Query) for client-side data management with **OpenAPI-generated
types** for API contracts. A central **API client** handles all HTTP requests.

### Implementation

1. **OpenAPI spec as contract** (`openapi/openapi.json`):

```json
{
  "paths": {
    "/users": {
      "get": { "operationId": "listUsers", ... }
    }
  }
}
```

2. **Generated TypeScript types** (`src/lib/api/contracts/schema.ts`):

```bash
pnpm --filter @atlas/web api:gen
```

3. **Central API client** (`src/lib/api/client.ts`):

```typescript
export async function apiGet<T>(path: string): Promise<T> {
  // Auth, retry, error handling, correlation IDs
}
```

4. **Query key factories** (`src/features/*/keys.ts`):

```typescript
export const userKeys = createQueryKeys("users");
```

5. **Feature-based hooks** (`src/features/users/queries.ts`):

```typescript
export function useUserList() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => api.users.list(),
  });
}
```

6. **ESLint blocks direct fetch** in UI code.

### Rules

- No `fetch()` in components or feature code
- All API types from OpenAPI (not hand-written)
- Use query key factories (not inline strings)
- Normalize errors to `ApiError` shape

## Alternatives Considered

### Alternative 1: SWR

**Pros:**

- Simpler API
- Smaller bundle
- Good defaults

**Cons:**

- Less powerful mutations
- No built-in devtools
- Less enterprise features

**Why not chosen:** React Query has better mutation support and more active development.

### Alternative 2: Fetch + useState

**Pros:**

- No dependencies
- Simple for small apps

**Cons:**

- No caching
- Manual everything
- Easy to get wrong

**Why not chosen:** Not suitable for enterprise applications.

### Alternative 3: tRPC

**Pros:**

- End-to-end type safety
- No code generation

**Cons:**

- Requires tRPC backend
- Not compatible with REST APIs
- Different mental model

**Why not chosen:** Atlas must work with standard REST APIs.

## Consequences

### Positive

- Consistent data fetching patterns
- Type safety from OpenAPI
- Automatic caching and deduplication
- Built-in loading/error states
- DevTools for debugging
- ESLint prevents fetch spaghetti

### Negative

- OpenAPI spec must be maintained
- Code generation step required
- React Query learning curve
- More files per feature

### Neutral

- Query keys require discipline

## References

- [TanStack Query Docs](https://tanstack.com/query)
- [OpenAPI TypeScript](https://github.com/openapi-ts/openapi-typescript)
- Implementation: `apps/web/src/lib/api/`, `apps/web/src/lib/react-query/`
