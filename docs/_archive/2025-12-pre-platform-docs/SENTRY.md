# Sentry Integration

This document describes the Sentry integration for error monitoring and performance tracing in
Atlas.

## Overview

Sentry is integrated across all runtime environments:

- **Client (Browser)**: React component errors, client-side navigation, unhandled promises
- **Server (Node.js)**: Server components, API routes, server actions
- **Edge (Middleware)**: Middleware and edge runtime functions

The integration is **graceful** - the application works normally without Sentry configuration, and
only enables monitoring when properly configured.

## Quick Start

### 1. Environment Variables

#### Required for Error Tracking

```bash
# Server-side (keep secret, never commit)
SENTRY_DSN=https://YOUR_KEY@oYOUR_ORG.ingest.sentry.io/YOUR_PROJECT

# Client-side (public, will be in browser bundles)
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@oYOUR_ORG.ingest.sentry.io/YOUR_PROJECT

# Optional: defaults to NODE_ENV
SENTRY_ENVIRONMENT=production # or staging, development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Optional: version tracking (recommended in production)
SENTRY_RELEASE=my-app@1.0.0 # or use git SHA
NEXT_PUBLIC_SENTRY_RELEASE=my-app@1.0.0
```

#### Required for Sourcemap Upload (CI/CD only)

```bash
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

#### Optional Development

```bash
# Enable Sentry in development (disabled by default)
SENTRY_ENABLE_IN_DEV=true
NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV=true
```

### 2. Configuration Files

The integration uses Sentry's Next.js setup pattern:

- `sentry.client.config.ts` - Browser/client-side configuration
- `sentry.server.config.ts` - Node.js/server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `next.config.js` - Build plugin for sourcemap upload (gated)

**All configurations are automatically loaded by Next.js** - no manual imports needed.

### 3. Verify Integration

#### Local Verification (Development)

1. Set required environment variables:

   ```bash
   export NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
   export SENTRY_DSN=your_dsn_here
   export NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV=true
   export SENTRY_ENABLE_IN_DEV=true
   ```

2. Start the dev server:

   ```bash
   pnpm dev
   ```

3. Visit the demo page: `http://localhost:3000/demo/sentry`

4. Click the test buttons to verify:

   - Client-side error capture
   - Server-side error capture
   - Unhandled error capture

5. Check your Sentry dashboard for the test events

#### Production/Staging Verification

Events are automatically sampled and sent in production/staging when DSN is configured.

## Architecture

### Error Capture

#### Client-Side

**Automatic capture:**

- React component errors (via `SentryErrorBoundary`)
- Unhandled promise rejections (via `GlobalErrorHandler`)
- Network errors from fetch calls
- Client-side navigation errors

**Manual capture:**

```typescript
import { captureException, captureMessage } from "@/lib/telemetry/sentry.client";

try {
  // risky operation
} catch (error) {
  captureException(error, {
    tags: { feature: "user-settings" },
    extra: { userId: "123" },
  });
}
```

#### Server-Side

**Automatic capture:**

- Unhandled errors in route handlers
- Server component errors
- Server action errors

**Manual capture:**

```typescript
import { captureException, captureApiError } from "@/lib/telemetry/sentry.server";

// For unknown errors
try {
  await dangerousOperation();
} catch (error) {
  captureException(error, {
    route: "/api/users",
    feature: "user-management",
  });
  throw error;
}

// For API errors (smart filtering of known vs unknown)
try {
  await apiCall();
} catch (error) {
  captureApiError(error, {
    route: req.url,
    feature: "api-integration",
  });
  throw error;
}
```

**Route handler wrapper:**

```typescript
import { withSentryRouteHandler } from "@/lib/telemetry/sentry.server";

export const GET = withSentryRouteHandler(
  async (req) => {
    // Your handler logic
    // Errors are automatically captured with context
  },
  { route: "/api/users", feature: "user-api" }
);
```

### Performance Tracing

#### Sampling Rates

Configured by environment in config files:

| Environment | Traces Sample Rate | Session Replay   | Profiles |
| ----------- | ------------------ | ---------------- | -------- |
| Production  | 10%                | 1% / 50% errors  | Disabled |
| Staging     | 30%                | 5% / 100% errors | Disabled |
| Development | 0% (disabled)      | Disabled         | Disabled |

These can be adjusted in:

- `sentry.client.config.ts` for client-side
- `sentry.server.config.ts` for server-side
- `sentry.edge.config.ts` for edge runtime

#### Automatic Instrumentation

- **Client**: Page loads, navigation, interaction to next paint (INP)
- **Server**: HTTP requests, database queries (if configured)
- **Edge**: Middleware execution

#### Manual Instrumentation

```typescript
import { startTransaction } from "@/lib/telemetry/sentry.client";

const span = startTransaction("data-processing", "task");
try {
  await processData();
} finally {
  span?.end();
}
```

### Context & Tagging

All Sentry events include standardized tags:

| Tag             | Description             | Example                    |
| --------------- | ----------------------- | -------------------------- |
| `runtime`       | Where error occurred    | `client`, `server`, `edge` |
| `route`         | Current route/endpoint  | `/api/users`, `/dashboard` |
| `correlationId` | Request correlation ID  | `uuid-v4`                  |
| `feature`       | Feature area (optional) | `user-management`          |
| `errorCode`     | Known error codes       | `VALIDATION_ERROR`         |

**Request context** is automatically captured from:

- `x-request-id` header (set by middleware)
- `AsyncLocalStorage` context (server-side)
- Current pathname (client-side)

### Known Error Filtering

To reduce noise, certain expected errors are handled differently:

**Client-side ignored:**

- Browser extension errors
- ResizeObserver loop errors
- Failed fetch (network errors)
- Third-party script errors

**Server-side classified as warnings (not exceptions):**

- `VALIDATION_ERROR` - Zod validation failures
- `AUTHENTICATION_ERROR` - Missing/invalid auth
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT` - Rate limit exceeded

These are sent as messages with `warning` level instead of exceptions.

## Sourcemap Upload

Sourcemaps enable readable stack traces in Sentry by mapping minified production code back to
source.

### How It Works

1. During production builds, the Sentry webpack plugin:

   - Generates sourcemaps
   - Uploads them to Sentry
   - Removes sourcemaps from deployment artifacts

2. When errors occur in production:
   - Sentry receives minified stack traces
   - Sentry uses uploaded sourcemaps to de-minify
   - You see readable file names and line numbers

### Setup (CI/CD)

Sourcemap upload is **optional** and **gated** - builds succeed without it.

#### GitHub Actions Example

```yaml
- name: Build with Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: atlas-web
    SENTRY_RELEASE: ${{ github.sha }}
    NEXT_PUBLIC_SENTRY_RELEASE: ${{ github.sha }}
  run: pnpm build
```

#### Required Secrets

Create these in your CI/CD environment:

1. **SENTRY_AUTH_TOKEN**: Create in Sentry → Settings → Auth Tokens

   - Permissions needed: `project:releases`, `project:write`

2. **SENTRY_ORG**: Your organization slug

3. **SENTRY_PROJECT**: Your project slug

### Local Builds

Sourcemap upload is **automatically disabled** locally unless you set:

```bash
export SENTRY_AUTH_TOKEN=your_token
export SENTRY_ORG=your_org
export SENTRY_PROJECT=your_project
```

Most developers should **not** upload sourcemaps locally.

## Error Boundaries

### SentryErrorBoundary

Wraps components to catch React errors:

```typescript
import { SentryErrorBoundary } from '@/components/SentryErrorBoundary';

export default function MyPage() {
  return (
    <SentryErrorBoundary>
      <MyComponent />
    </SentryErrorBoundary>
  );
}
```

**Custom fallback:**

```typescript
<SentryErrorBoundary
  fallback={<div>Custom error UI</div>}
  showDetails={true} // Show error details in dev
>
  <MyComponent />
</SentryErrorBoundary>
```

### Global Error Handler

Automatically mounted in `app/layout.tsx` to catch:

- Unhandled promise rejections
- Async errors outside React

## User Context

When user authentication is implemented, set user context:

```typescript
// Client-side
import { setUser, clearUser } from "@/lib/telemetry/sentry.client";

// On login
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// On logout
clearUser();
```

```typescript
// Server-side
import { setUser } from "@/lib/telemetry/sentry.server";

setUser({
  id: session.userId,
  email: session.email,
});
```

## Best Practices

### DO ✅

- **Use the helpers**: `captureException`, `captureApiError` from telemetry modules
- **Add context**: Include `feature`, `route`, and relevant `extra` data
- **Filter known errors**: Use `captureApiError` to classify expected errors
- **Set user context**: When users are authenticated
- **Test in staging**: Verify events arrive with correct tags and context
- **Use correlation IDs**: Automatically included via `x-request-id`

### DON'T ❌

- **Don't capture PII**: Be cautious with user data in `extra` fields
- **Don't over-capture**: Not every validation error needs to go to Sentry
- **Don't ignore the helpers**: They provide consistent tagging and context
- **Don't set secrets in tags**: Tags are searchable and visible to all team members
- **Don't enable in dev by default**: Keep noise low during development

## Troubleshooting

### Events Not Appearing in Sentry

1. **Check DSN is set:**

   ```bash
   echo $SENTRY_DSN
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Check environment filtering:**

   - In development, events are blocked unless `SENTRY_ENABLE_IN_DEV=true`
   - Check `beforeSend` logic in config files

3. **Check sampling:**

   - In production, only 10% of traces are captured
   - All errors should be captured (100%)

4. **Check Sentry project settings:**
   - Verify DSN is correct
   - Check inbound filters aren't blocking events
   - Verify project is active

### Build Failures

If builds fail with Sentry errors:

1. **Check Sentry plugin config:**

   - Ensure `next.config.js` properly gates the plugin
   - Plugin only runs when `SENTRY_AUTH_TOKEN` is set

2. **Disable sourcemap upload temporarily:**
   ```bash
   unset SENTRY_AUTH_TOKEN
   pnpm build
   ```

### Sourcemaps Not Working

1. **Verify upload succeeded:**

   - Check build logs for "Uploading sourcemaps"
   - Verify release in Sentry UI (Releases section)

2. **Check release matching:**

   ```bash
   # These must match
   echo $SENTRY_RELEASE
   echo $NEXT_PUBLIC_SENTRY_RELEASE
   ```

3. **Check sourcemap artifacts:**
   - In Sentry: Project Settings → Source Maps
   - Verify your release has artifacts

## Verification Checklist

Use this checklist to verify Sentry is properly configured:

- [ ] Environment variables set (DSN, environment, release)
- [ ] Client-side errors captured with `runtime=client` tag
- [ ] Server-side errors captured with `runtime=server` tag
- [ ] `correlationId` tag present on all events
- [ ] Route/endpoint tagged correctly
- [ ] Known errors (validation, auth) sent as warnings, not exceptions
- [ ] Stack traces are readable (sourcemaps working)
- [ ] User context attached when authenticated
- [ ] Sampling rates appropriate for environment
- [ ] No errors in browser console about Sentry
- [ ] Build succeeds without Sentry env vars

## Additional Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Atlas Logging Documentation](./LOGGING.md) - For structured logging integration
