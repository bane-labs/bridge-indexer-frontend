# Web Vitals Reporting

Production-grade Real User Monitoring (RUM) for Core Web Vitals in the Atlas platform.

## Overview

This module collects and reports Core Web Vitals metrics from real users to help monitor and improve
frontend performance. It provides:

- **Client-side collection** of LCP, CLS, INP, FCP, and TTFB
- **Privacy-conscious** data handling (no PII, sanitized routes)
- **Sampling-based** collection to minimize overhead
- **Batched transport** with sendBeacon and fetch keepalive fallback
- **Production-safe** with rate limiting and validation

## What Metrics Are Collected

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: Time to render the largest content element (target: < 2.5s)
- **CLS (Cumulative Layout Shift)**: Visual stability score (target: < 0.1)
- **INP (Interaction to Next Paint)**: Responsiveness to user interactions (target: < 200ms)
- **FCP (First Contentful Paint)**: Time to first visible content (target: < 1.8s)
- **TTFB (Time to First Byte)**: Server response time (target: < 800ms)

### Metadata Collected

For each metric:

- Metric name, value, rating (good/needs-improvement/poor)
- **Sanitized route** (pathname only, no query params or fragments)
- Timestamp
- Environment (dev/staging/production)
- Application name (`atlas-web`)
- Build ID/version (if available)
- Navigation type (navigate, reload, etc.)
- Session ID (generated per browser session, not tied to user identity)
- Minimal user agent hint (browser family only: chrome/firefox/safari/edge)

## Privacy & Security

### What We DON'T Collect

- ❌ No email addresses, usernames, or personal identifiers
- ❌ No query parameters (e.g., `/search?q=sensitive-data` → `/search`)
- ❌ No URL fragments (e.g., `/page#token=secret` → `/page`)
- ❌ No full user agent strings (only browser family: "chrome", "firefox", etc.)
- ❌ No cookies or authentication tokens
- ❌ No form data or input values

### What We DO

- ✅ Sanitize all routes to pathname only
- ✅ Use session-scoped sampling (consistent for each browser session)
- ✅ Apply rate limiting on the backend
- ✅ Validate all payloads strictly
- ✅ Log structured data suitable for aggregation (no raw logs with PII)

## Configuration

### Environment Variables

Add to `.env.local` (development) or `.env.production` (production):

```bash
# Enable/disable Web Vitals reporting
# Default: enabled in production/staging, disabled in development
NEXT_PUBLIC_WEB_VITALS_ENABLED=true

# Sample rate (0-1)
# Default: 0.05 (5%) in production, 0.25 (25%) in staging, 0 in development
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=0.05

# API endpoint override
# Default: /api/telemetry/web-vitals
NEXT_PUBLIC_WEB_VITALS_ENDPOINT=/api/telemetry/web-vitals

# Enable debug logging to console
# Default: false
NEXT_PUBLIC_WEB_VITALS_DEBUG=false

# Environment identifier (affects default sample rate)
# Options: development | staging | production
NEXT_PUBLIC_APP_ENV=production

# Build ID for version tracking (optional)
NEXT_PUBLIC_BUILD_ID=abc123def
```

### Default Behavior by Environment

| Environment | Enabled | Sample Rate |
| ----------- | ------- | ----------- |
| Development | No      | 0%          |
| Staging     | Yes     | 25%         |
| Production  | Yes     | 5%          |

### Sampling Logic

- Sampling decision is made **once per browser session** and stored in `sessionStorage`
- If a user is sampled, **all** their metrics for that session are reported
- If not sampled, **no** metrics are sent (zero overhead)
- This ensures consistent data collection per session

## How to Enable/Disable

### Enable Locally (for testing)

```bash
# In .env.local
NEXT_PUBLIC_WEB_VITALS_ENABLED=true
NEXT_PUBLIC_WEB_VITALS_DEBUG=true
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=1  # 100% sampling for testing
```

Then restart your dev server:

```bash
pnpm dev
```

Open the browser console to see debug logs.

### Disable in Production

```bash
# In .env.production
NEXT_PUBLIC_WEB_VITALS_ENABLED=false
```

Or remove the `WebVitalsReporter` component from
[src/providers/index.tsx](../apps/web/src/providers/index.tsx).

## Local Testing

### 1. Enable debug mode

```bash
# .env.local
NEXT_PUBLIC_WEB_VITALS_ENABLED=true
NEXT_PUBLIC_WEB_VITALS_DEBUG=true
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=1
```

### 2. Start the app

```bash
pnpm dev
```

### 3. Open browser DevTools

Navigate to any page and check the console. You should see:

```
[Web Vitals] Reporting enabled { environment: 'development', sampleRate: 1, ... }
[Web Vitals] Observers registered
[Web Vitals] Metric queued: { name: 'FCP', value: 1234, ... }
[Web Vitals] Sending batch: { metrics: [...], sessionId: '...' }
[Web Vitals] Sent via sendBeacon
```

### 4. Test the API endpoint

#### Health check:

```bash
curl http://localhost:3000/api/telemetry/web-vitals
```

Expected response:

```json
{
  "status": "ok",
  "service": "web-vitals-telemetry",
  "version": "1.0.0"
}
```

#### Send test metric:

```bash
curl -X POST http://localhost:3000/api/telemetry/web-vitals \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": [{
      "name": "LCP",
      "value": 2500,
      "rating": "good",
      "id": "v1-123",
      "route": "/",
      "timestamp": 1703001234567,
      "environment": "development",
      "appName": "atlas-web"
    }],
    "sessionId": "test-session-123",
    "userAgent": "chrome"
  }'
```

Expected response:

```json
{
  "success": true
}
```

### 5. Check server logs

In your terminal running `pnpm dev`, you should see structured JSON logs:

```json
{
  "type": "web-vitals",
  "timestamp": "2025-12-20T...",
  "sessionId": "test-session-123",
  "userAgent": "chrome",
  "metrics": [
    {
      "name": "LCP",
      "value": 2500,
      "rating": "good",
      "route": "/",
      ...
    }
  ]
}
```

### 6. Test route sanitization

Navigate to a page with query parameters (e.g., `/search?q=test&token=secret`).

In the browser console, the logged route should only show the pathname:

```
route: "/search"  // Query params removed ✓
```

### 7. Test sampling

Set a lower sample rate:

```bash
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=0.5
```

Restart the server and open multiple incognito windows. About 50% should show debug logs, others
should be silent (not sampled).

### 8. Test invalid payload (should fail)

```bash
curl -X POST http://localhost:3000/api/telemetry/web-vitals \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": [{
      "name": "INVALID_METRIC",
      "value": 100
    }],
    "sessionId": "test"
  }'
```

Expected response (400):

```json
{
  "error": "Invalid payload",
  "details": { ... }
}
```

For more comprehensive testing strategies, see
[apps/web/src/lib/telemetry/TESTING.md](../apps/web/src/lib/telemetry/TESTING.md).

## Viewing Results

### Current: Structured Logs

Metrics are currently logged to stdout in structured JSON format. This is suitable for:

- Local development (console output)
- Log aggregators (Loki, CloudWatch, Datadog)
- APM tools (Sentry, New Relic)

To view in production, pipe logs to your aggregation tool.

### Future: Database Persistence

To persist metrics to a database (e.g., PostgreSQL with Prisma):

1. Create migration:

```prisma
model WebVital {
  id            String   @id @default(cuid())
  name          String   // LCP, CLS, etc.
  value         Float
  rating        String?
  route         String
  environment   String
  sessionId     String
  timestamp     DateTime
  appName       String
  buildId       String?
  userAgent     String?
  createdAt     DateTime @default(now())

  @@index([name, timestamp])
  @@index([route, timestamp])
  @@index([sessionId])
}
```

2. Update
   [src/app/api/telemetry/web-vitals/route.ts](../apps/web/src/app/api/telemetry/web-vitals/route.ts):

```typescript
async function processMetrics(batch: WebVitalsBatchDTO): Promise<void> {
  // Persist to database
  await prisma.webVital.createMany({
    data: batch.metrics.map((metric) => ({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      route: metric.route,
      environment: metric.environment,
      sessionId: batch.sessionId,
      timestamp: new Date(metric.timestamp),
      appName: metric.appName,
      buildId: metric.buildId,
      userAgent: batch.userAgent,
    })),
  });
}
```

3. Query metrics:

```typescript
// Get LCP p75 by route
const results = await prisma.webVital.groupBy({
  by: ["route"],
  where: {
    name: "LCP",
    environment: "production",
    timestamp: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    },
  },
  _avg: { value: true },
  _count: true,
});
```

### Future: Analytics Integration

Forward metrics to analytics services:

**Sentry:**

```typescript
import * as Sentry from "@sentry/nextjs";

async function processMetrics(batch: WebVitalsBatchDTO): Promise<void> {
  for (const metric of batch.metrics) {
    Sentry.metrics.distribution(metric.name, metric.value, {
      tags: {
        route: metric.route,
        rating: metric.rating,
        environment: metric.environment,
      },
      unit: "millisecond",
    });
  }
}
```

**OpenTelemetry:**

```typescript
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("web-vitals");
const lcpHistogram = meter.createHistogram("web.vitals.lcp");

async function processMetrics(batch: WebVitalsBatchDTO): Promise<void> {
  for (const metric of batch.metrics) {
    if (metric.name === "LCP") {
      lcpHistogram.record(metric.value, {
        route: metric.route,
        rating: metric.rating,
      });
    }
    // ... other metrics
  }
}
```

## Architecture

### Client-Side Flow

1. **WebVitalsReporter** component mounts (once per app load)
2. **Configuration** is loaded from environment variables
3. **Sampling decision** is made (stored in sessionStorage)
4. If sampled, **observers** are registered for each Core Web Vital
5. When a metric is measured:
   - Route is **sanitized** (pathname only)
   - Metric is **queued** in memory
6. Metrics are **batched** and sent when:
   - Batch size reaches 5 metrics, OR
   - 10 seconds have elapsed, OR
   - Page is hidden/unloaded

### Transport Strategy

1. **sendBeacon** (preferred):
   - Non-blocking
   - Survives page unload
   - No CORS preflight
2. **fetch with keepalive** (fallback):
   - More flexible headers
   - Works when sendBeacon unavailable
   - Survives page unload with keepalive flag

### Backend Flow

1. Request arrives at `/api/telemetry/web-vitals`
2. **Rate limiting** check (20 req/min per IP)
3. **Size validation** (max 100KB payload)
4. **Schema validation** (Zod strict validation)
5. **Processing**:
   - Currently: Structured JSON logging
   - Future: Database persistence, analytics forwarding
6. Response: `{ success: true }`

## Common Pitfalls & Troubleshooting

### Metrics not being sent

**Symptom:** No console logs, no API requests

**Causes:**

1. Not sampled (check sessionStorage: `web-vitals-sampled = "true"`)
2. Disabled in config (check `NEXT_PUBLIC_WEB_VITALS_ENABLED`)
3. Wrong environment (development disabled by default)

**Solutions:**

- Set `NEXT_PUBLIC_WEB_VITALS_DEBUG=true` to see what's happening
- Set `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=1` to force sampling
- Clear sessionStorage and reload

### sendBeacon failing

**Symptom:** Console shows "Sent via fetch" instead of "Sent via sendBeacon"

**Causes:**

1. Large payload (sendBeacon has limits, ~64KB)
2. CORS issues
3. Browser doesn't support sendBeacon

**Solutions:**

- This is expected and not a problem - fetch keepalive is the fallback
- Reduce batch size if payloads are large
- Ensure API endpoint is same-origin or CORS is configured

### Rate limiting errors (429)

**Symptom:** API returns "Rate limit exceeded"

**Causes:**

1. Too many requests from same IP
2. Multiple tabs/windows from same user
3. Misconfigured sample rate (too high)

**Solutions:**

- Current limit: 20 req/min per IP
- In production, use Redis-based rate limiting or remove limit
- Reduce sample rate
- Increase batch size to send fewer requests

### Invalid payload errors (400)

**Symptom:** API returns "Invalid payload"

**Causes:**

1. Metric name typo
2. Missing required fields
3. Value out of range (negative, NaN, Infinity)

**Solutions:**

- Check validation schema in
  [src/lib/telemetry/validation.ts](../apps/web/src/lib/telemetry/validation.ts)
- Enable debug mode to see exact payload being sent
- Ensure web-vitals library is up to date

### Sensitive data in routes

**Symptom:** Query params or tokens appearing in logged routes

**Causes:**

1. Sanitization bypassed
2. Server-side logging of raw URLs

**Solutions:**

- Verify `sanitizeRoute()` is being called
- Check that route is `pathname` only in logs
- Never log `window.location.href` directly

### Metrics vary wildly

**Symptom:** Same page shows very different LCP/CLS values

**Causes:**

1. Natural variance in real user conditions
2. Dynamic content (ads, lazy loading)
3. Third-party scripts

**Solutions:**

- This is expected in RUM (unlike Lighthouse)
- Use percentiles (p75, p95) not averages
- Collect enough data for statistical significance
- Consider separate metrics for different user segments

## Performance Impact

### Client-Side Overhead

- **Library size**: ~3KB gzipped (web-vitals package)
- **Runtime overhead**: Negligible (PerformanceObserver API)
- **Network**: Batched requests, ~1-2 KB per batch
- **Sampling**: Most users send nothing (5% in production)

### Server-Side Overhead

- **CPU**: Minimal (JSON parsing + validation)
- **Memory**: In-memory rate limiting map (can use Redis)
- **Storage**: Depends on implementation (logs vs DB)

## Adjusting Sample Rates

### Production Guidelines

| Traffic Volume   | Recommended Sample Rate |
| ---------------- | ----------------------- |
| < 10k visits/day | 25-50% (0.25-0.5)       |
| 10k-100k/day     | 5-10% (0.05-0.1)        |
| 100k-1M/day      | 1-5% (0.01-0.05)        |
| > 1M/day         | 0.1-1% (0.001-0.01)     |

### Cost Considerations

- **API requests**: ~1 request per 5 metrics per sampled user
- **Storage**: ~500 bytes per metric
- **Processing**: Minimal CPU/memory

Example at 100k daily visitors, 5% sampling, 10 metrics per session:

- Sampled sessions: 5,000
- Total metrics: 50,000
- API requests: ~10,000
- Storage: ~25 MB/day

## Uninstalling

To completely remove Web Vitals reporting:

1. Remove component from providers:

```diff
// apps/web/src/providers/index.tsx
export function MainProvider({ children }: { children: React.ReactNode }) {
  return (
    <EnvProvider>
      <ThemeProvider>
        <ReactQueryProvider>
          <ToasterProvider>
-           <WebVitalsReporter />
            {children}
          </ToasterProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </EnvProvider>
  );
}
```

2. Remove dependency:

```bash
pnpm remove web-vitals -C apps/web
```

3. Delete files:

```bash
rm -rf apps/web/src/lib/telemetry
rm -rf apps/web/src/components/WebVitalsReporter.tsx
rm -rf apps/web/src/app/api/telemetry
```

4. Remove environment variables from schemas:

- [src/schemas/env/public-runtime-config.ts](../apps/web/src/schemas/env/public-runtime-config.ts)
- [src/env/public-env.ts](../apps/web/src/env/public-env.ts)

## Resources

- [Web Vitals Official Library](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Measuring Performance](https://web.dev/user-centric-performance-metrics/)
- [Navigator.sendBeacon()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
- [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)

## Support

For questions or issues:

1. Check this documentation's troubleshooting section
2. Enable debug mode and inspect console logs
3. Test API endpoint with curl to isolate client vs server issues
4. Review structured logs for validation errors
