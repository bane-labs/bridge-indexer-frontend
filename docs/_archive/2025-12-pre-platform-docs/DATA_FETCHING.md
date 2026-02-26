# Data Fetching & API Contracts

**Status**: ✅ Implemented  
**Last Updated**: December 22, 2025

This document describes Atlas's standardized approach to data fetching, API contracts, and the "no
fetch spaghetti" enforcement.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Client-Side Patterns](#client-side-patterns)
- [Server-Side Patterns](#server-side-patterns)
- [API Contracts (OpenAPI)](#api-contracts-openapi)
- [Error Handling](#error-handling)
- [Guardrails](#guardrails)
- [Examples](#examples)

---

## Overview

### Goals

1. **Type Safety**: All API calls are type-safe via OpenAPI-generated contracts
2. **No Fetch Spaghetti**: All HTTP requests go through a central API client
3. **Consistent Errors**: Standard error shape across all API failures
4. **Correlation IDs**: Automatic request tracing for debugging
5. **Smart Caching**: React Query with enterprise-grade defaults
6. **Clear Patterns**: Predictable patterns for queries and mutations

### Key Principles

- ✅ **Client Components**: Use React Query hooks + central API client
- ✅ **Server Components**: Use server-only API helpers (reuses existing `fetchWithContext`)
- ✅ **Route Handlers**: Can use fetch directly (API boundary)
- ❌ **Direct fetch()**: Blocked in UI/feature code by ESLint

---

## Architecture

### Directory Structure

```
apps/web/src/
├── lib/
│   ├── api/
│   │   ├── client.ts           # Central API client (ONLY place to call fetch in client code)
│   │   ├── server.ts           # Server-side API helpers (uses fetchWithContext)
│   │   ├── config.ts           # Base URL + retry config
│   │   ├── errors.ts           # ApiError + normalization
│   │   ├── correlation.ts      # Correlation ID utilities
│   │   ├── contracts/
│   │   │   ├── schema.ts       # Generated OpenAPI types
│   │   │   └── index.ts        # Typed API client (api.users.*, api.system.*)
│   │   └── index.ts            # Public exports
│   └── react-query/
│       ├── provider.tsx        # QueryClient provider with enterprise defaults
│       ├── keys.ts             # Query key factories
│       ├── patterns.ts         # Standard query/mutation patterns
│       └── index.ts            # Public exports
├── features/
│   └── users/                  # Example feature module
│       ├── keys.ts             # User query keys
│       ├── queries.ts          # useUserList(), useUser()
│       ├── mutations.ts        # useCreateUser(), useUpdateUser(), useDeleteUser()
│       ├── components/
│       │   └── UserListExample.tsx
│       └── index.ts
└── app/
    └── api/                    # Route handlers (can use fetch)
```

### Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Client Components                         │
│                                                             │
│  useUserList() ──> api.users.list() ──> apiRequest()       │
│                                            │                │
│                                            ▼                │
│                                        fetch() + auth       │
│                                        + retry + errors     │
│                                        + correlation ID     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Server Components                         │
│                                                             │
│  await serverApiRequest('/users') ──> fetchWithContext()   │
│                                            │                │
│                                            ▼                │
│                                   fetch() + correlation ID  │
│                                   (from request context)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Client-Side Patterns

### 1. Query Hooks

Use custom hooks from feature modules:

```tsx
import { useUserList, useUser } from "@/features/users";
import { getUserFacingMessage } from "@/lib/api";

function UserList() {
  const { data, error, isLoading } = useUserList({ page: 1, pageSize: 20 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {getUserFacingMessage(error)}</div>;

  return (
    <ul>
      {data.data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2. Mutation Hooks

Use mutation hooks with automatic cache invalidation:

```tsx
import { useCreateUser } from "@/features/users";
import { getUserFacingMessage } from "@/lib/api";

function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = (data: CreateUserRequest) => {
    createUser.mutate(data, {
      onSuccess: (user) => {
        toast.success(`Created user: ${user.name}`);
        // Cache is automatically invalidated
      },
      onError: (error) => {
        toast.error(getUserFacingMessage(error));
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Direct API Client (Rare)

For one-off requests outside React Query:

```tsx
import { api, getUserFacingMessage } from "@/lib/api";

async function handleAction() {
  try {
    const user = await api.users.get("user-123");
    console.log(user.name);
  } catch (error) {
    toast.error(getUserFacingMessage(error));
  }
}
```

---

## Server-Side Patterns

### 1. Server Components

Use server-only API helpers:

```tsx
import { serverApiRequest } from "@/lib/api/server";

export default async function UserPage({ params }: { params: { id: string } }) {
  try {
    const user = await serverApiRequest<User>(`/users/${params.id}`);
    return <div>{user.name}</div>;
  } catch (error) {
    return <div>Error loading user</div>;
  }
}
```

### 2. Server Actions

For form submissions and mutations:

```tsx
"use server";

import { serverApiPost } from "@/lib/api/server";
import { revalidatePath } from "next/cache";

export async function createUserAction(formData: FormData) {
  try {
    const user = await serverApiPost("/users", {
      email: formData.get("email"),
      name: formData.get("name"),
    });

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    return { success: false, error: getUserFacingMessage(error) };
  }
}
```

### 3. Route Handlers

Route handlers are API boundaries and CAN use fetch directly:

```ts
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  // This is allowed - route handlers are API boundaries
  const response = await fetch("https://external-api.com/data");
  const data = await response.json();
  return Response.json(data);
}
```

---

## API Contracts (OpenAPI)

### Overview

All API types are generated from an OpenAPI specification:

- **Source**: `openapi/openapi.json`
- **Generated Types**: `apps/web/src/lib/api/contracts/schema.ts`
- **Typed Client**: `apps/web/src/lib/api/contracts/index.ts`

### Regenerating Types

```bash
# From monorepo root
cd apps/web
pnpm api:gen
```

This runs `openapi-typescript` to regenerate types from the spec.

### Updating the API Spec

1. Edit `openapi/openapi.json` to match backend changes
2. Run `pnpm api:gen` to regenerate types
3. Commit both the spec and generated types
4. TypeScript will catch breaking changes at compile time

### Using Generated Types

```tsx
import type { components, paths } from "@/lib/api/contracts";

// Schema types
type User = components["schemas"]["User"];
type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];

// Use in components
const user: User = await api.users.get("user-123");
```

---

## Error Handling

### Standard Error Shape

All API errors are normalized to this shape:

```ts
interface ApiErrorShape {
  code: string; // Machine-readable (e.g., 'VALIDATION_ERROR')
  message: string; // Technical message (logging)
  userMessage?: string; // User-friendly message (UI)
  correlationId?: string; // Request tracing
  details?: unknown; // Additional context
}
```

### ApiError Class

```ts
class ApiError extends Error {
  shape: ApiErrorShape;
  status?: number; // HTTP status code
  cause?: unknown; // Original error
}
```

### Handling Errors

```tsx
import { getUserFacingMessage, ApiError } from "@/lib/api";

try {
  const user = await api.users.get("user-123");
} catch (error) {
  // Always safe to display
  const message = getUserFacingMessage(error);
  toast.error(message);

  // For logging
  if (error instanceof ApiError) {
    console.error("API Error:", {
      code: error.shape.code,
      correlationId: error.shape.correlationId,
      status: error.status,
    });
  }
}
```

### Error Response Format (Backend)

Backends should return errors in this format:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "userMessage": "Please provide a valid email address.",
  "correlationId": "abc-123",
  "details": {
    "fields": {
      "email": ["Must be a valid email address"]
    }
  }
}
```

---

## Guardrails

### ESLint Rules

Direct `fetch()` calls are blocked in UI/feature code:

```js
// ❌ BLOCKED - ESLint will error
function MyComponent() {
  const data = await fetch("/api/users"); // ERROR: Use @/lib/api instead
}

// ✅ ALLOWED - Use central API client
function MyComponent() {
  const { data } = useUserList();
}

// ✅ ALLOWED - Route handlers are API boundaries
export async function GET() {
  const data = await fetch("https://external.com/api");
}
```

### Allowed Locations for `fetch()`

1. `src/lib/api/client.ts` - Central API client
2. `src/lib/http/**` - HTTP utilities (existing `fetchWithContext`)
3. `src/app/api/**/route.ts` - Route handlers

### Enforcement

The ESLint rule is configured in `apps/web/eslint.config.mjs`:

```js
{
  files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
  ignores: ["src/lib/api/**", "src/lib/http/**", "src/app/api/**/route.ts"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "CallExpression[callee.name='fetch']",
        message: "Direct fetch() calls are not allowed. Use @/lib/api instead.",
      },
    ],
  },
}
```

---

## Examples

### Complete Feature Module

See `apps/web/src/features/users/` for a complete example:

- ✅ Query key factories
- ✅ Query hooks (`useUserList`, `useUser`)
- ✅ Mutation hooks (`useCreateUser`, `useUpdateUser`, `useDeleteUser`)
- ✅ Cache invalidation patterns
- ✅ Type-safe API calls
- ✅ Error handling
- ✅ Example component

### Creating a New Feature

1. **Create feature directory**:

```bash
mkdir -p src/features/posts
```

2. **Define query keys** (`keys.ts`):

```ts
import { createQueryKeys } from "@/lib/react-query";

export const postKeys = createQueryKeys("posts");
```

3. **Create queries** (`queries.ts`):

```ts
import { useQuery } from "@tanstack/react-query";
import { api, normalizeApiError } from "@/lib/api";
import { postKeys } from "./keys";

export function usePostList() {
  return useQuery({
    queryKey: postKeys.list(),
    queryFn: async () => {
      try {
        return await api.posts.list();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}
```

4. **Create mutations** (`mutations.ts`):

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, normalizeApiError } from "@/lib/api";
import { postKeys } from "./keys";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        return await api.posts.create(data);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
```

5. **Export from index** (`index.ts`):

```ts
export { postKeys } from "./keys";
export { usePostList } from "./queries";
export { useCreatePost } from "./mutations";
```

---

## React Query Configuration

### Default Settings

```ts
{
  queries: {
    staleTime: 60 * 1000,           // 1 minute
    gcTime: 10 * 60 * 1000,         // 10 minutes
    refetchOnWindowFocus: false,    // Reduces noise
    refetchOnMount: false,          // Reuse fresh cache
    refetchOnReconnect: false,      // Reuse fresh cache
    retry: intelligent (see below),
    retryDelay: exponential backoff,
  },
  mutations: {
    retry: false,  // Don't retry mutations by default
  },
}
```

### Retry Logic

Queries retry ONLY for:

- Network errors (connection failures)
- 408 Request Timeout
- 429 Too Many Requests (with backoff)
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

Do NOT retry for:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Validation Error

### Invalidation Patterns

```ts
import { invalidationPatterns } from "@/lib/react-query";

// After creating a resource
invalidationPatterns.afterCreate(userKeys.all());

// After updating a resource
invalidationPatterns.afterUpdate(userKeys.all(), userId);

// After deleting a resource
invalidationPatterns.afterDelete(userKeys.all(), userId);
```

---

## Decision Rules

### When to use React Query vs Server Components?

| Scenario                      | Use                  | Reason                         |
| ----------------------------- | -------------------- | ------------------------------ |
| Real-time dashboard           | Client (React Query) | Polling, optimistic updates    |
| Static content (blog, docs)   | Server Components    | SEO, no interactivity          |
| Form with instant validation  | Client (React Query) | Debounced queries, UX feedback |
| Initial page load             | Server Components    | Fast FCP, SEO                  |
| User-specific data (settings) | Client (React Query) | Caching, instant navigation    |
| Public pages (marketing)      | Server Components    | SEO, no personalization        |

### Server Actions vs Route Handlers?

| Use Case                 | Use           | Reason                    |
| ------------------------ | ------------- | ------------------------- |
| Form submission          | Server Action | Tight integration w/ form |
| Stable HTTP endpoint     | Route Handler | REST API contract         |
| Webhook receiver         | Route Handler | External system calls it  |
| Internal mutation helper | Server Action | Collocated with UI        |
| Proxy to external API    | Route Handler | API boundary, caching     |

---

## Troubleshooting

### "Direct fetch() calls are not allowed"

**Cause**: You called `fetch()` directly in a component or feature module.

**Fix**: Use the central API client:

```ts
// ❌ Bad
const response = await fetch("/api/users");

// ✅ Good
import { api } from "@/lib/api/contracts";
const users = await api.users.list();
```

### "Module not found: server-only"

**Cause**: You imported a server-only module in a client component.

**Fix**: Don't import `@/lib/api/server` in client components. Use `@/lib/api` instead.

### Query not refetching after mutation

**Cause**: Cache invalidation pattern missing or incorrect query key.

**Fix**:

1. Ensure mutation uses `invalidateQueries` in `onSuccess`
2. Verify query keys match between query and invalidation
3. Use query key factories (`userKeys.lists()`) for consistency

### Types not matching API response

**Cause**: OpenAPI spec is out of sync with backend.

**Fix**:

1. Update `openapi/openapi.json` to match backend
2. Run `pnpm api:gen` to regenerate types
3. Fix TypeScript errors (breaking changes)

---

## Related Docs

- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - API base URL configuration
- [Logging](./LOGGING.md) - Correlation ID integration
- [Code Quality](./CODE_QUALITY.md) - ESLint rules and enforcement

---

## Summary

✅ **All API calls are type-safe** via OpenAPI contracts  
✅ **No fetch spaghetti** - central API client enforced by ESLint  
✅ **Standard error handling** - ApiError with user-safe messages  
✅ **Correlation IDs** - automatic request tracing  
✅ **Smart caching** - React Query with enterprise defaults  
✅ **Clear patterns** - predictable query/mutation hooks
