# Architecture

> The system design behind Atlas and why it works this way.

---

## Design Philosophy

Atlas is built on three core beliefs:

1. **Frontend is the product** — Users interact with the frontend. Everything else is support
   infrastructure.

2. **Contracts prevent chaos** — When client and server agree on data shapes upfront, entire
   categories of bugs disappear.

3. **Conventions reduce decisions** — Every decision a developer doesn't have to make is cognitive
   load saved for actual problems.

These beliefs shape every architectural choice in the platform.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        APPLICATION SHELL                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │   Theme    │  │  Session   │  │   Query    │  │   Flags    │  │   │
│  │  │  Provider  │  │  Provider  │  │  Provider  │  │  Provider  │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────▼────────────────────────────────┐   │
│  │                         FEATURE MODULES                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Users   │  │  Items   │  │  Forms   │  │   ...    │          │   │
│  │  │  Feature │  │  Feature │  │  Feature │  │          │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────▼────────────────────────────────┐   │
│  │                         INFRASTRUCTURE                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   API    │  │  Query   │  │   Auth   │  │ Telemetry│          │   │
│  │  │  Client  │  │  Keys    │  │  Client  │  │  Client  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                        ═════════════╪═════════════
                              HTTP/HTTPS
                        ═════════════╪═════════════
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│                              SERVER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       API ROUTE HANDLERS                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   Auth   │  │  Proxy   │  │  Health  │  │   ...    │          │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │          │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────▼────────────────────────────────┐   │
│  │                      SERVER INFRASTRUCTURE                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ Session  │  │   Token  │  │  Sentry  │  │  Logging │          │   │
│  │  │  Mgmt    │  │  Refresh │  │  Server  │  │  Server  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layers Explained

### Application Shell

The outermost layer wraps the entire application. Providers here establish global context:

- **Theme Provider** — Manages light/dark/system preference, applies theme class to document
- **Session Provider** — Exposes current user, handles auth state
- **Query Provider** — Configures caching, retry logic, and stale time for data fetching
- **Flags Provider** — Loads feature flags, exposes guard components and hooks

Providers are composed at the root. Features consume them via hooks—they never reach into provider
internals.

### Feature Modules

Business logic lives in feature modules. Each feature is self-contained:

- Components specific to that domain
- Query and mutation hooks for data operations
- Query key factories for cache management

Features don't import from other features. Shared logic lives in infrastructure.

### Infrastructure Layer

Cross-cutting concerns live here:

- **API Client** — Centralized HTTP with auth headers, retry, error normalization
- **Query Keys** — Factory functions for consistent cache invalidation
- **Auth Client** — Session fetching, token refresh triggers
- **Telemetry Client** — Error capture, structured logging, performance tracking

This layer provides capabilities to features. It has no knowledge of business domains.

### API Route Handlers

Server-side logic for authentication, proxying, and platform operations:

- **Auth Routes** — OAuth flow handling, session creation, token exchange
- **Proxy Routes** — Backend API forwarding when needed
- **Health Routes** — Liveness and readiness endpoints

Route handlers are the only place where direct HTTP calls to external services occur.

### Server Infrastructure

Server-only utilities that never run in the browser:

- **Session Management** — Encrypted cookie handling, session validation
- **Token Refresh** — Automatic refresh token rotation
- **Server Telemetry** — Sentry and logging for server context

---

## Data Flow

### Reading Data

```
Component
    │
    ▼
useQuery Hook (feature)
    │
    ▼
Query Function
    │
    ▼
API Client (infrastructure)
    │
    ▼
HTTP Request ────────► API Route Handler ────────► Backend
                                                      │
                        Typed Response ◄──────────────┘
```

1. Component calls a query hook
2. Query hook uses a query key factory for cache identity
3. Query function calls the typed API client
4. API client handles auth headers, correlation IDs, error normalization
5. Response flows back, validated against the contract

The component never knows about HTTP. It receives typed data or typed errors.

### Writing Data

```
Component
    │
    ▼
useMutation Hook (feature)
    │
    ▼
Mutation Function
    │
    ├─────────────► Optimistic Update (optional)
    │
    ▼
API Client (infrastructure)
    │
    ▼
HTTP Request ────────► API Route Handler ────────► Backend
                                                      │
    ◄─── Cache Invalidation ◄──── Success ◄──────────┘
```

1. Component calls a mutation hook
2. Mutation can apply optimistic updates immediately
3. Mutation function calls the typed API client
4. On success, query cache is invalidated using key factories
5. Related queries refetch with fresh data

---

## Authentication Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   User     │     │   Client   │     │   Server   │     │  Provider  │
│  Browser   │     │   App      │     │  (Atlas)   │     │  (Google)  │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                  │                  │
      │  Click Sign In   │                  │                  │
      │─────────────────►│                  │                  │
      │                  │                  │                  │
      │                  │  Start OAuth     │                  │
      │                  │─────────────────►│                  │
      │                  │                  │                  │
      │                  │  Generate PKCE   │                  │
      │                  │  Store Verifier  │                  │
      │                  │  (httpOnly)      │                  │
      │                  │                  │                  │
      │◄─────────────────┼──────────────────│                  │
      │            Redirect to Provider     │                  │
      │                  │                  │                  │
      │  Authorize       │                  │                  │
      │─────────────────────────────────────────────────────────►
      │                  │                  │                  │
      │◄─────────────────────────────────────────────────────────
      │      Redirect with Code             │                  │
      │                  │                  │                  │
      │  Callback        │                  │                  │
      │─────────────────►│─────────────────►│                  │
      │                  │                  │                  │
      │                  │                  │  Exchange Code   │
      │                  │                  │  + PKCE Verifier │
      │                  │                  │─────────────────►│
      │                  │                  │                  │
      │                  │                  │◄─────────────────│
      │                  │                  │  Access Token    │
      │                  │                  │  Refresh Token   │
      │                  │                  │                  │
      │                  │  Create Session  │                  │
      │                  │  (Encrypted      │                  │
      │                  │   httpOnly)      │                  │
      │                  │◄─────────────────│                  │
      │◄─────────────────│                  │                  │
      │   Session Ready  │                  │                  │
      │                  │                  │                  │
```

Key security properties:

- **PKCE** prevents authorization code interception
- **Tokens stay server-side** — Never exposed to browser JavaScript
- **Encrypted session cookie** — Tamper-proof session storage
- **Automatic refresh** — Tokens rotate transparently

---

## Contract Boundary

The API contract is the source of truth:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OpenAPI Specification                         │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  {                                                           │  │
│   │    "paths": {                                                │  │
│   │      "/users": { ... },                                      │  │
│   │      "/items": { ... }                                       │  │
│   │    },                                                        │  │
│   │    "components": {                                           │  │
│   │      "schemas": {                                            │  │
│   │        "User": { ... },                                      │  │
│   │        "Item": { ... }                                       │  │
│   │      }                                                       │  │
│   │    }                                                         │  │
│   │  }                                                           │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│              ┌───────────────┴───────────────┐                      │
│              ▼                               ▼                      │
│   ┌──────────────────────┐       ┌──────────────────────┐           │
│   │  Generated Types     │       │  Backend Contract    │           │
│   │  (TypeScript)        │       │  (Server-side)       │           │
│   │                      │       │                      │           │
│   │  - Request types     │       │  - Validation        │           │
│   │  - Response types    │       │  - Response shapes   │           │
│   │  - Error types       │       │  - Error codes       │           │
│   └──────────────────────┘       └──────────────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

When the spec changes:

1. Types regenerate automatically
2. Type errors surface in the IDE
3. Mismatches are caught before runtime

---

## Observability Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          REQUEST LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Request In ──┬──────────────────────────────────────────► Out     │
│                │                                                     │
│                ▼                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    Correlation ID                             │  │
│   │              (Generated at entry point)                       │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                │                                                     │
│    ┌───────────┼───────────┬───────────────┬─────────────────┐      │
│    ▼           ▼           ▼               ▼                 ▼      │
│  ┌─────┐   ┌─────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐   │
│  │Logs │   │Error│    │API Error│    │Structured│    │Response │   │
│  │     │   │Sentry│    │Response │    │  Logging │    │ Headers │   │
│  └─────┘   └─────┘    └─────────┘    └──────────┘    └─────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

Every request carries a correlation ID. That ID appears in:

- Log entries
- Error reports
- API error responses
- Response headers

When something fails, you can trace the entire request path.

---

## Why Frontend-First?

Traditional architectures treat the frontend as a thin client. Atlas inverts this:

| Traditional                   | Atlas                                   |
| ----------------------------- | --------------------------------------- |
| Backend owns business logic   | Frontend owns user experience           |
| Frontend fetches and displays | Frontend orchestrates interactions      |
| Backend defines capabilities  | Contracts define capabilities           |
| Complexity lives server-side  | Complexity is distributed appropriately |

**Frontend-first doesn't mean backend-less.** It means the frontend is the primary product surface,
and architecture decisions optimize for that reality.

---

## Why Conventions Over Flexibility?

Every pattern in Atlas is a decision you don't have to make:

- Query keys follow a factory pattern → no key typos
- Errors have a standard shape → no conditional parsing
- Feature modules have a fixed structure → no "where does this go?"
- Providers compose the same way → no app shell surprises

Flexibility has a cost: every choice is mental overhead. Atlas pays that cost once, in platform
design, so teams don't pay it repeatedly in feature development.

---

## Further Reading

- [Capabilities](capabilities.md) — What Atlas solves and why it matters
- [Decisions](decisions.md) — Key architectural choices explained
- [Demo](demo.md) — See these patterns in action
