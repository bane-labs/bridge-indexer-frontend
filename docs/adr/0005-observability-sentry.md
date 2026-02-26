# ADR-0005: Observability with Sentry

## Status

**Accepted**

## Context

Production applications need observability:

- Error tracking with stack traces
- Performance monitoring
- Request correlation
- User context
- Session replay (optional)

We evaluated:

1. Sentry
2. Datadog
3. New Relic
4. LogRocket
5. Self-hosted (ELK, Grafana)

### Requirements

- Works with Next.js App Router
- Client, server, and edge runtime support
- Source map upload for readable traces
- Graceful degradation when not configured
- No performance impact when disabled

## Decision

We use **Sentry** for error tracking and performance monitoring across all runtimes.

### Implementation

1. **Configuration files**:

   - `sentry.client.config.ts` — Browser errors, Web Vitals
   - `sentry.server.config.ts` — Server components, API routes
   - `sentry.edge.config.ts` — Middleware

2. **Telemetry helpers** (`lib/telemetry/sentry.*.ts`):

```typescript
// Client
import { captureException } from "@/lib/telemetry/sentry.client";

// Server
import { captureException, captureApiError } from "@/lib/telemetry/sentry.server";
```

3. **Sampling strategy**:

   - Production: 10% traces, 100% errors
   - Staging: 30% traces, 100% errors
   - Development: Disabled by default

4. **Known error filtering**:

   - Validation errors → Warning (not exception)
   - Auth errors → Warning
   - 404s → Warning

5. **Correlation IDs**:
   - Propagated via `x-request-id` header
   - Attached to all Sentry events

### Integration Points

| Runtime | What's Captured                                |
| ------- | ---------------------------------------------- |
| Client  | React errors, unhandled rejections, Web Vitals |
| Server  | Route handler errors, server component errors  |
| Edge    | Middleware errors                              |

## Alternatives Considered

### Alternative 1: Datadog

**Pros:**

- Full observability suite
- Excellent APM
- Infrastructure monitoring

**Cons:**

- Expensive
- Overkill for frontend-first app
- Complex setup

**Why not chosen:** Cost and complexity for current needs.

### Alternative 2: Self-hosted (ELK + Grafana)

**Pros:**

- Full control
- No vendor costs
- Data stays internal

**Cons:**

- Significant ops burden
- No source maps
- DIY everything

**Why not chosen:** Team bandwidth, maintenance burden.

### Alternative 3: LogRocket

**Pros:**

- Session replay
- Good UX debugging

**Cons:**

- Privacy concerns
- Performance overhead
- Less error-focused

**Why not chosen:** Primary need is error tracking, not session replay.

## Consequences

### Positive

- Readable stack traces with source maps
- Cross-runtime error visibility
- Performance insights (Web Vitals)
- Minimal configuration
- Graceful when unconfigured

### Negative

- Third-party data dependency
- Source maps uploaded to Sentry
- Monthly cost (after free tier)

### Neutral

- Team needs Sentry access
- Requires CI secrets for source map upload

## References

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- Implementation: `apps/web/sentry.*.config.ts`, `apps/web/src/lib/telemetry/`
