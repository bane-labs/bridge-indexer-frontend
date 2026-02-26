# Web Vitals Telemetry Module

Real User Monitoring (RUM) for Core Web Vitals in Atlas.

## Quick Start

### Enable Locally

```bash
# Create .env.local
cp .env.local.example .env.local

# Start dev server
pnpm dev
```

Open browser console to see Web Vitals being collected.

### Configuration

Set environment variables in `.env.local`, `.env.staging`, or `.env.production`:

```bash
NEXT_PUBLIC_WEB_VITALS_ENABLED=true
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=0.05  # 5%
NEXT_PUBLIC_WEB_VITALS_DEBUG=true
```

## Module Structure

```
src/lib/telemetry/
├── index.ts              # Public API exports
├── config.ts             # Configuration & sampling logic
├── types.ts              # TypeScript types & utilities
├── validation.ts         # Zod schemas for API validation
├── transport.ts          # Batching & network transport
├── webVitals.ts          # Main collection module
└── __tests__/            # Unit tests
```

## API

### Client-Side

```typescript
import { initWebVitalsReporting } from "@/lib/telemetry";

// Initialize (done automatically by WebVitalsReporter component)
initWebVitalsReporting({
  config: {
    debug: true,
    sampleRate: 1,
  },
  onMetric: (metric) => {
    console.log("Metric collected:", metric);
  },
});
```

### Server-Side

```typescript
// POST /api/telemetry/web-vitals
// Accepts batched metrics payload
```

## Documentation

See [docs/web-vitals-reporting.md](../../../../docs/web-vitals-reporting.md) for complete
documentation.

## Tests

```bash
pnpm test src/lib/telemetry
```

## Privacy

- No PII collected
- Routes sanitized (pathname only, no query params)
- Minimal user agent hints
- Session-based sampling
