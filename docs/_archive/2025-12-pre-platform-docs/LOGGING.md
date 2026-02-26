# Structured Logging with Correlation IDs

## Overview

Atlas uses a standardized structured logging system based on **Pino** that provides:

- **Structured JSON logs** for server-side operations
- **Correlation IDs** (`x-request-id`) generated and propagated across all requests
- **Request-scoped context** via AsyncLocalStorage (requestId, route, method, and optionally
  userId/tenantId)
- **Type-safe logging** with required `event` field
- **Secret redaction** to prevent leaking sensitive data
- **Hard enforcement** via ESLint and CI to prevent console usage

## Why Structured Logging?

Structured logs are:

- **Queryable**: Filter and search by specific fields (e.g., all errors for a user, all slow
  requests)
- **Machine-readable**: Integrate with log aggregation tools (Datadog, CloudWatch, Splunk)
- **Consistent**: Every log entry has the same structure
- **Traceable**: Correlation IDs connect related operations across services

## Core Principles

1. **"One Blessed Way"**: All server logs go through `log.*` — never use `console.*`
2. **Required `event` field**: Every log call must include a descriptive event name (snake_case)
3. **No secrets in logs**: Tokens, passwords, auth headers, and PII are automatically redacted
4. **Request-scoped context**: Logs automatically include `requestId`, `route`, and `method` when
   available

---

## Request Correlation IDs

### How It Works

Every HTTP request to Atlas receives a unique `x-request-id` header:

1. **Middleware** checks incoming request for `x-request-id`
2. If present, preserves it; otherwise generates a new UUID
3. Returns `x-request-id` in response headers
4. All logs within that request automatically include `requestId`

### Benefits

- **Trace requests** across multiple logs and services
- **Debug issues** by finding all logs for a specific request
- **Correlate errors** with user actions

### Example Flow

```
Client Request → Middleware → Generate/Preserve x-request-id → Handler → Logs (with requestId)
```

---

## Usage Guide

### 1. Basic Logging (Server-Side)

Import the logger:

```typescript
import { log } from "@/lib/logging/logger.server";
```

Log with required `event` field:

```typescript
// Info log
log.info({ event: "user_login", userId: "123" }, "User logged in successfully");

// Warning log
log.warn({ event: "rate_limit_approaching", remaining: 10 }, "Rate limit threshold approaching");

// Error log
log.error({ event: "database_connection_failed", error }, "Failed to connect to database");

// Debug log
log.debug({ event: "cache_hit", key: "user:123" }, "Cache hit");
```

### 2. Route Handlers with Context

Wrap your route handler with `withRequestContext` to automatically capture request metadata:

```typescript
import { NextResponse } from "next/server";
import { withRequestContext } from "@/lib/logging/with-request-context.server";
import { log } from "@/lib/logging/logger.server";
import { getRequestContext } from "@/lib/logging/request-context.server";

export async function GET(req: Request) {
  return withRequestContext(req, async () => {
    // This log will automatically include requestId, route, and method
    log.info({ event: "user_profile_fetch", userId: "123" }, "Fetching user profile");

    // Get the context if needed
    const ctx = getRequestContext();

    return NextResponse.json({
      ok: true,
      requestId: ctx?.requestId,
    });
  });
}
```

**What gets logged:**

```json
{
  "level": "info",
  "time": 1703196800000,
  "event": "user_profile_fetch",
  "userId": "123",
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "route": "/api/users/123",
  "method": "GET",
  "msg": "Fetching user profile"
}
```

### 3. Outbound HTTP Requests

Use `fetchWithContext` for external API calls to propagate correlation IDs:

```typescript
import { fetchWithContext } from "@/lib/http/fetch-with-context.server";

export async function GET(req: Request) {
  return withRequestContext(req, async () => {
    // Automatically forwards x-request-id and logs timing
    const response = await fetchWithContext("https://api.example.com/data", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data);
  });
}
```

**What gets logged (success):**

```json
{
  "level": "info",
  "event": "outbound_http",
  "url": "https://api.example.com/data",
  "status": 200,
  "durationMs": 145,
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**What gets logged (failure):**

```json
{
  "level": "error",
  "event": "outbound_http_error",
  "url": "https://api.example.com/data",
  "durationMs": 5032,
  "error": {
    "name": "FetchError",
    "message": "request timeout"
  },
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

---

## Event Naming Convention

Use **snake_case** and be descriptive:

✅ **Good**:

- `user_login`
- `payment_processed`
- `database_connection_failed`
- `outbound_http`
- `cache_invalidated`

❌ **Bad**:

- `userLogin` (camelCase)
- `login` (too generic)
- `error` (not descriptive)

---

## What NOT to Log

The logger automatically **redacts** sensitive fields, but you should still avoid logging:

### Automatically Redacted Paths

- `req.headers.authorization`
- `req.headers.cookie`
- `req.headers['x-api-key']`
- `meta.token`, `meta.password`, `meta.secret`, `meta.apiKey`
- `body.password`, `body.token`, `body.secret`

### Never Log

- **Passwords** or password hashes
- **API keys** or access tokens
- **Session tokens** or JWTs
- **PII** (Personally Identifiable Information) unless required and documented
- **Credit card numbers** or payment details
- **Full request/response bodies** (especially in production)

---

## Enforcement

### ESLint Rule

Console usage is **banned** via ESLint:

```javascript
rules: {
  "no-console": "error"
}
```

Running `pnpm lint` will fail if any `console.*` usage is detected.

### CI Guardrail

The CI pipeline includes a **grep-based guard** that fails PRs if console usage slips through:

```yaml
- name: Verify no console usage (grep guard)
  run: |
    # Searches for console.log, console.error, etc. in source files
    # Fails the build if any matches found
```

This provides **belt + suspenders** protection:

1. ESLint catches it during development
2. CI grep guard catches it even if ESLint is bypassed

---

## Architecture

### Files

- **`src/middleware.ts`**: Generates/preserves `x-request-id` for every request
- **`src/lib/logging/request-context.server.ts`**: AsyncLocalStorage for request-scoped context
- **`src/lib/logging/logger.server.ts`**: Pino logger with redaction and type enforcement
- **`src/lib/logging/with-request-context.server.ts`**: Helper to wrap route handlers
- **`src/lib/http/fetch-with-context.server.ts`**: Fetch wrapper that propagates correlation IDs

### Data Flow

```
Incoming Request
  ↓
Middleware (x-request-id generation)
  ↓
Route Handler (wrapped with withRequestContext)
  ↓
AsyncLocalStorage stores { requestId, route, method }
  ↓
log.info({ event: "..." }) → Automatically includes requestId
  ↓
fetchWithContext → Forwards x-request-id to external API
```

---

## Examples

### Example 1: User Registration

```typescript
export async function POST(req: Request) {
  return withRequestContext(req, async () => {
    const { email, username } = await req.json();

    log.info({ event: "user_registration_attempt", email }, "User registration started");

    try {
      const user = await createUser({ email, username });

      log.info(
        { event: "user_registration_success", userId: user.id },
        "User registered successfully"
      );

      return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
      log.error({ event: "user_registration_failed", email, error }, "User registration failed");

      return NextResponse.json({ success: false }, { status: 500 });
    }
  });
}
```

### Example 2: External API with Retry

```typescript
export async function GET(req: Request) {
  return withRequestContext(req, async () => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        log.debug({ event: "external_api_attempt", attempts }, "Attempting external API call");

        const response = await fetchWithContext("https://api.example.com/data", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        log.info({ event: "external_api_success", attempts }, "External API call succeeded");

        return NextResponse.json(await response.json());
      } catch (error) {
        log.warn({ event: "external_api_retry", attempts, error }, "Retrying external API call");

        if (attempts >= maxAttempts) {
          log.error(
            { event: "external_api_failed", attempts, error },
            "External API call failed after retries"
          );

          return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  });
}
```

### Example 3: Background Job

```typescript
import { log } from "@/lib/logging/logger.server";

export async function processBatchJob(batchId: string) {
  log.info({ event: "batch_job_started", batchId }, "Starting batch job");

  const startTime = performance.now();

  try {
    const items = await fetchItems(batchId);

    log.debug(
      { event: "batch_items_fetched", batchId, count: items.length },
      "Fetched batch items"
    );

    for (const item of items) {
      await processItem(item);
    }

    const durationMs = Math.round(performance.now() - startTime);

    log.info(
      { event: "batch_job_completed", batchId, count: items.length, durationMs },
      "Batch job completed successfully"
    );
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);

    log.error({ event: "batch_job_failed", batchId, durationMs, error }, "Batch job failed");

    throw error;
  }
}
```

---

## FAQ

### Q: Can I use console.log in development?

**No.** The ESLint rule and CI guard are strict. Use `log.debug()` instead — it won't appear in
production logs (based on `LOG_LEVEL` env var).

### Q: How do I view logs in development?

Logs are pretty-printed in development via `pino-pretty`. You'll see colorized, human-readable
output in your terminal.

### Q: How do I filter logs in production?

Production logs are structured JSON. Use your log aggregation tool (Datadog, CloudWatch, etc.) to
query by fields:

- All errors for a specific user: `level=error AND userId=123`
- All slow requests: `event=outbound_http AND durationMs>1000`
- All logs for a request: `requestId=f47ac10b-58cc-4372-a567-0e02b2c3d479`

### Q: What if I need to log something on the client?

Client-side logging is **out of scope** for this system. Consider:

- Browser DevTools console (for debugging only)
- Dedicated client-side error tracking (Sentry, Bugsnag)
- User analytics (PostHog, Mixpanel)

This logging system is **server-only** (`import "server-only"`).

### Q: How do I add custom fields to logs?

Just pass them in the `fields` object:

```typescript
log.info(
  {
    event: "order_placed",
    orderId: "order_123",
    amount: 99.99,
    currency: "USD",
    customerId: "cust_456",
  },
  "Order placed successfully"
);
```

### Q: Can I disable redaction for debugging?

**No.** Redaction is a security feature and should never be disabled. If you need to debug specific
values, log them separately with careful consideration (and remove before committing).

---

## Future Enhancements

The following are **NOT** included in this implementation but may be added later:

- OpenTelemetry integration for distributed tracing
- Log sampling for high-volume endpoints
- Structured error codes with documentation links
- Client-side error aggregation
- Log forwarding to external services (Datadog, CloudWatch)

---

## References

- [Pino Documentation](https://getpino.io/)
- [AsyncLocalStorage (Node.js)](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Atlas Toolchain Policy](./TOOLCHAIN_POLICY.md)
