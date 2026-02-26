# Sentry Integration - Implementation Summary

## Overview

This PR implements comprehensive Sentry integration for error monitoring and performance tracing
across all Atlas runtime environments (client, server, and edge).

## Discovery Summary

**Atlas Architecture:**

- ✅ Next.js 16.0.10 with App Router (`src/app/` structure)
- ✅ Turbopack acknowledged (empty config) but webpack plugins still functional
- ✅ Request correlation IDs already implemented via `x-request-id` middleware
- ✅ AsyncLocalStorage pattern for request context propagation
- ✅ Environment validation using `@t3-oss/env-nextjs` with Zod schemas
- ✅ Provider pattern in `src/providers/index.tsx`
- ✅ Structured logging with Pino

## Implementation Details

### 1. Core Configuration Files

#### Created:

- `sentry.client.config.ts` - Browser/client-side Sentry initialization
- `sentry.server.config.ts` - Node.js/server-side Sentry initialization
- `sentry.edge.config.ts` - Edge runtime Sentry initialization
- `instrumentation.ts` - Next.js instrumentation hook for Sentry loading

#### Modified:

- `next.config.js` - Added Sentry build plugin (gated by env vars)
  - Only runs when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` are set
  - Builds succeed without these variables
  - Configures sourcemap upload with security features

### 2. Error Capture Implementation

#### Client-Side:

- **Component**: `SentryErrorBoundary.tsx`
  - Reusable error boundary with Sentry integration
  - Customizable fallback UI
  - Automatic error capture with context
- **Global Handler**: `GlobalErrorHandler` component

  - Catches unhandled promise rejections
  - Mounted in root layout

- **Utilities**: `lib/telemetry/sentry.client.ts`
  - `captureException()` - Manual error capture with context
  - `captureMessage()` - Log messages to Sentry
  - `setUser()` / `clearUser()` - User context management
  - `addBreadcrumb()` - Debug trail
  - `startTransaction()` - Manual performance tracking

#### Server-Side:

- **Utilities**: `lib/telemetry/sentry.server.ts`
  - `captureException()` - Server error capture with request context
  - `captureApiError()` - Smart error classification
    - Known errors (validation, auth) → warnings
    - Unknown errors → exceptions
  - `withSentryRouteHandler()` - Route handler wrapper
  - Automatic correlation ID attachment from AsyncLocalStorage

#### Edge Runtime:

- **Middleware**: Updated to set Sentry tags
  - `correlationId` from `x-request-id`
  - `route` from pathname
  - `runtime` tag for filtering

### 3. Performance Tracing

#### Sampling Rates by Environment:

| Environment | Traces | Session Replay   | Profiles |
| ----------- | ------ | ---------------- | -------- |
| Production  | 10%    | 1% / 50% errors  | Disabled |
| Staging     | 30%    | 5% / 100% errors | Disabled |
| Development | 0%     | Disabled         | Disabled |

**Note**: Development is disabled by default to reduce noise. Enable with
`SENTRY_ENABLE_IN_DEV=true`.

#### Integrations:

- **Client**: Browser tracing, INP tracking, session replay
- **Server**: HTTP integration for automatic instrumentation
- **Edge**: Basic tracing for middleware

### 4. Context & Tagging Conventions

All events include standardized tags:

- `runtime`: `client` | `server` | `edge`
- `route`: Current route/endpoint
- `correlationId`: From `x-request-id` header
- `feature`: Optional feature area tag
- `errorCode`: For known error types

Request context automatically captured:

- Request ID (correlation ID)
- Route/endpoint
- HTTP method
- User ID (if available)
- Tenant ID (if available)

### 5. Error Filtering

#### Client-Side Ignored:

- Browser extension errors
- ResizeObserver loop errors
- Network fetch failures
- Third-party script errors

#### Server-Side Known Errors (Warnings, Not Exceptions):

- `VALIDATION_ERROR` - Zod validation failures
- `AUTHENTICATION_ERROR` - Auth failures
- `AUTHORIZATION_ERROR` - Permission issues
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT` - Rate limiting

These are sent as messages with `warning` level instead of exceptions.

### 6. Sourcemap Upload

**Configuration**:

- Gated by environment variables (optional)
- Only runs when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` are set
- Builds succeed without these variables
- Sourcemaps hidden from production bundles
- Logger statements tree-shaken in production

**CI/CD Setup** (documented):

```yaml
env:
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  SENTRY_ORG: your-org
  SENTRY_PROJECT: atlas-web
  SENTRY_RELEASE: ${{ github.sha }}
```

### 7. Environment Variables

#### Added to Schema:

**Server-side** (`server-runtime-config.ts`):

- `SENTRY_DSN` - Server error tracking DSN (optional)
- `SENTRY_ENVIRONMENT` - Environment name (defaults to NODE_ENV)
- `SENTRY_RELEASE` - Release identifier
- `SENTRY_AUTH_TOKEN` - For sourcemap upload (CI/CD only)
- `SENTRY_ORG` - Organization slug (CI/CD only)
- `SENTRY_PROJECT` - Project slug (CI/CD only)
- `SENTRY_ENABLE_IN_DEV` - Enable in development

**Client-side** (`public-runtime-config.ts`):

- `NEXT_PUBLIC_SENTRY_DSN` - Client error tracking DSN (optional)
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Environment name
- `NEXT_PUBLIC_SENTRY_RELEASE` - Release identifier
- `NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV` - Enable in development

#### Updated Files:

- `src/env/server-env.ts` - Added runtimeEnv mappings
- `src/env/public-env.ts` - Added runtimeEnv mappings
- `.env.example` - Documented all Sentry variables

### 8. Verification & Testing

#### Demo Page: `/demo/sentry`

Tests:

- Client-side error capture
- Client-side message logging
- Server-side error capture
- Unhandled error capture

Guards:

- Disabled in production environment
- Shows warning when DSN not set
- Shows expected behavior checklist

#### API Endpoint: `/api/sentry-test-server`

- Server-side error testing
- Disabled in production
- Returns success message

### 9. Documentation

**Created**: `docs/SENTRY.md`

- Quick start guide
- Architecture overview
- Error capture patterns
- Performance tracing configuration
- Sourcemap upload setup
- Best practices
- Troubleshooting guide
- Verification checklist

**Updated**: `docs/README.md`

- Added Sentry documentation link
- Updated table of contents

### 10. Integration Points

**Modified Files**:

- `src/app/layout.tsx` - Added `GlobalErrorHandler`
- `src/middleware.ts` - Added Sentry context setting
- `tsconfig.json` - Included `instrumentation.ts`

**No Breaking Changes**:

- All existing functionality preserved
- Sentry gracefully disabled when not configured
- No required environment variables

## Graceful Degradation

The implementation follows the requirement for graceful operation:

✅ **Works without Sentry env vars**:

- Application runs normally
- No runtime errors
- Sentry simply disabled

✅ **Works in all environments**:

- Development: Disabled by default (configurable)
- Staging: Higher sampling for diagnosis
- Production: Conservative sampling

✅ **Build safety**:

- Builds succeed without `SENTRY_AUTH_TOKEN`
- Sourcemap upload optional and gated
- No impact on build times when disabled

## Testing Checklist

- [x] TypeScript compilation passes
- [x] ESLint passes (no errors)
- [x] Application builds without Sentry env vars
- [x] Sentry configs load without errors
- [x] Error boundary renders fallback UI
- [x] Middleware sets correlation ID tag
- [x] Demo page loads and functions
- [x] Documentation complete and accurate

## Migration Path

**For existing Atlas deployments:**

1. **Optional (Recommended)**: Add Sentry DSN environment variables

   ```bash
   SENTRY_DSN=your_server_dsn
   NEXT_PUBLIC_SENTRY_DSN=your_client_dsn
   SENTRY_ENVIRONMENT=production
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
   ```

2. **Optional**: Add sourcemap upload to CI/CD

   ```yaml
   SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
   SENTRY_ORG: your-org
   SENTRY_PROJECT: atlas-web
   ```

3. **No code changes required** - integration is automatic

## Future Enhancements

Potential additions (not in scope for this PR):

- [ ] User context integration when auth is implemented
- [ ] Custom performance metrics for business logic
- [ ] Alert rules configuration guide
- [ ] Integration with incident management tools
- [ ] Team-specific error assignment rules

## Files Changed

**Created** (12 files):

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`
- `src/components/SentryErrorBoundary.tsx`
- `src/lib/telemetry/sentry.client.ts`
- `src/lib/telemetry/sentry.server.ts`
- `src/app/api/sentry-test-server/route.ts`
- `src/app/demo/sentry/page.tsx`
- `docs/SENTRY.md`

**Modified** (9 files):

- `package.json` (added @sentry/nextjs)
- `next.config.js` (Sentry plugin integration)
- `tsconfig.json` (included instrumentation.ts)
- `src/app/layout.tsx` (GlobalErrorHandler)
- `src/middleware.ts` (Sentry context)
- `src/schemas/env/server-runtime-config.ts` (env schema)
- `src/schemas/env/public-runtime-config.ts` (env schema)
- `src/env/server-env.ts` (runtimeEnv)
- `src/env/public-env.ts` (runtimeEnv)
- `.env.example` (documentation)
- `docs/README.md` (index)

## Commit Strategy

Suggested commits for this PR:

1. `chore(obs): add Sentry SDK and base configs`

   - Install @sentry/nextjs
   - Create sentry.\*.config.ts files
   - Add instrumentation.ts
   - Update next.config.js

2. `feat(obs): error boundary + server/route handler capture`

   - SentryErrorBoundary component
   - GlobalErrorHandler
   - sentry.client.ts utilities
   - sentry.server.ts utilities
   - Update layout.tsx
   - Update middleware.ts

3. `feat(obs): correlation ID integration`

   - Middleware Sentry context
   - AsyncLocalStorage integration
   - Request context propagation

4. `chore(obs): env validation and configuration`

   - Update env schemas
   - Update env files
   - Update .env.example

5. `feat(obs): verification endpoints and demo`

   - /api/sentry-test-server
   - /demo/sentry page

6. `docs(obs): Sentry usage and conventions`
   - docs/SENTRY.md
   - docs/README.md

## Acceptance Criteria Status

✅ Atlas runs normally without any Sentry env vars (gracefully disabled) ✅ When SENTRY_DSN is
provided:

- Client errors captured with tags and context
- Server errors captured with tags and correlationId ✅ Performance tracing enabled with
  environment-based sampling ✅ Sourcemap upload optional, gated by env, doesn't break builds ✅
  Documentation explains conventions, env vars, verification ✅ All deliverables checklist items
  completed

---

**Ready for Review** ✅
