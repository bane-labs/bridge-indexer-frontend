# Testing Web Vitals Telemetry

Since the web app doesn't have Jest configured, the Web Vitals module is tested manually and through
integration.

## Manual Testing

### 1. Test Client-Side Collection

```bash
# Create .env.local
cp .env.local.example .env.local

# Ensure debug mode is enabled
# NEXT_PUBLIC_WEB_VITALS_ENABLED=true
# NEXT_PUBLIC_WEB_VITALS_DEBUG=true
# NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=1

# Start dev server
pnpm dev

# Open http://localhost:3000
# Check browser console for:
# - [Web Vitals] Reporting enabled
# - [Web Vitals] Observers registered
# - [Web Vitals] Metric queued
# - [Web Vitals] Sent via sendBeacon
```

### 2. Test API Endpoint

#### Health Check

```bash
curl http://localhost:3000/api/telemetry/web-vitals

# Expected: {"status":"ok","service":"web-vitals-telemetry","version":"1.0.0"}
```

#### Valid Payload

```bash
curl -X POST http://localhost:3000/api/telemetry/web-vitals \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": [{
      "name": "LCP",
      "value": 2500,
      "rating": "good",
      "id": "v1-test-123",
      "route": "/",
      "timestamp": 1703001234567,
      "environment": "development",
      "appName": "atlas-web"
    }],
    "sessionId": "test-123",
    "userAgent": "chrome"
  }'

# Expected: {"success":true}
# Check server logs for structured JSON output
```

#### Invalid Payload (should fail)

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

# Expected: {"error":"Invalid payload","details":{...}}
```

### 3. Test Route Sanitization

Check in browser console that routes are sanitized:

```javascript
// In browser console after Web Vitals are collected
// Routes should be pathname only:
// https://example.com/search?q=secret  →  /search
// https://example.com/page#token=xxx   →  /page
```

### 4. Test Sampling

```bash
# Set sample rate to 0.5 in .env.local
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=0.5

# Restart server
# Open in incognito/private windows multiple times
# About 50% should see "[Web Vitals] Reporting enabled"
# Others should see nothing (not sampled)
```

### 5. Test Rate Limiting

```bash
# Send 25 requests rapidly (limit is 20/min)
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/telemetry/web-vitals \
    -H "Content-Type: application/json" \
    -d '{
      "metrics": [{"name":"LCP","value":100,"id":"x","route":"/","timestamp":1,"environment":"dev","appName":"atlas-web"}],
      "sessionId": "test"
    }'
  echo " - Request $i"
done

# Expected: Last 5 should return {"error":"Rate limit exceeded"}
```

## Integration Testing (Future)

When Jest/Vitest is configured for the web app:

### Test Files to Create

1. **config.test.ts** - Configuration logic

   - Sample rate calculation
   - Environment detection
   - Configuration overrides

2. **types.test.ts** - Utility functions

   - `sanitizeRoute()` removes query params
   - `sanitizeRoute()` removes fragments
   - `getSessionId()` consistency

3. **validation.test.ts** - Zod schemas

   - Valid payloads pass
   - Invalid payloads fail
   - Required fields enforced

4. **route.test.ts** - API endpoint
   - Health check works
   - Valid payload accepted
   - Invalid payload rejected
   - Rate limiting enforced

### Setup Required

Add to `apps/web/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0"
  }
}
```

Create `apps/web/jest.config.js`:

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

## E2E Testing with Playwright

Since Playwright is already configured, you can test the full flow:

```typescript
// apps/web/e2e/web-vitals.spec.ts
import { test, expect } from "@playwright/test";

test("Web Vitals are collected and sent", async ({ page }) => {
  // Listen for API calls
  const apiCalls = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/telemetry/web-vitals")) {
      apiCalls.push(request);
    }
  });

  // Navigate to page
  await page.goto("/");

  // Wait for metrics to be sent
  await page.waitForTimeout(15000); // Batch interval + buffer

  // Check that at least one API call was made
  expect(apiCalls.length).toBeGreaterThan(0);
});
```

## Production Validation

### Logs Monitoring

```bash
# In production, check logs for Web Vitals events
kubectl logs -f <pod-name> | jq 'select(.type == "web-vitals")'

# or with CloudWatch/Datadog/Loki
# Filter for: type="web-vitals"
```

### Health Check

```bash
curl https://your-domain.com/api/telemetry/web-vitals
```

### Metrics Dashboard (Future)

Once database persistence is implemented, create queries:

```sql
-- P75 LCP by route
SELECT
  route,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75_lcp,
  COUNT(*) as samples
FROM web_vitals
WHERE name = 'LCP'
  AND environment = 'production'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY route
ORDER BY p75_lcp DESC;
```
