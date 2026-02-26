# Performance Budgets Module

An optional, opt-in performance monitoring system for the Atlas platform using Lighthouse CI and
bundle analysis.

## Overview

This module provides automated performance tracking through:

- **Lighthouse CI**: Performance budgets with assertions for Core Web Vitals
- **Bundle Analysis**: Automated bundle size tracking and visualization

By default, this module is **disabled**. You must explicitly enable it to activate performance
checks in CI.

## Why Opt-in?

Performance budgets are kept optional to:

- Avoid blocking development on early-stage projects
- Allow teams to mature their performance standards over time
- Prevent friction for contributors unfamiliar with performance constraints
- Enable easy removal if requirements change

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

This installs `@lhci/cli` and `@next/bundle-analyzer` (already in package.json).

### 2. Enable the Module

```bash
pnpm perf:enable
```

This copies GitHub Actions workflows from `tools/perf/templates/` to `.github/workflows/`:

- `perf-lighthouse.yml` - Lighthouse CI checks
- `perf-bundle.yml` - Bundle analysis

Commit these workflows to enable performance checks in CI.

### 3. Run Locally

#### Lighthouse CI

```bash
# Build the app first
pnpm build

# Run Lighthouse CI (runs 3 times for stability)
pnpm perf:lhci
```

The server will start automatically, run audits on configured routes, and generate reports.

#### Bundle Analysis

```bash
# Generate bundle analysis reports
pnpm perf:analyze
```

Reports are generated in `apps/web/.next/analyze/`:

- `client.html` - Client bundle analysis
- `server.html` - Server bundle analysis (if applicable)

## CI Workflows

### Lighthouse CI Workflow

**Triggers:**

- Manual: `workflow_dispatch`
- Push to `main` (blocking)

**What it does:**

1. Builds the application
2. Starts Next.js server
3. Runs Lighthouse on configured routes (3 runs each)
4. Asserts performance budgets
5. Uploads reports as artifacts
6. Posts results to temporary public storage

### Bundle Analysis Workflow

**Triggers:**

- Manual: `workflow_dispatch`
- Push to `main`

**What it does:**

1. Builds with bundle analyzer enabled
2. Generates HTML reports
3. Uploads reports as artifacts (retained for 30 days)

## Configuration

### Performance Budgets

Edit `lighthouserc.json` at the repository root:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

**Key metrics:**

- `categories:performance`: Overall Lighthouse performance score (0.8 = 80%)
- `largest-contentful-paint`: LCP should be < 3000ms
- `cumulative-layout-shift`: CLS should be < 0.1
- `total-blocking-time`: TBT should be < 300ms

**Severity levels:**

- `error`: Fails CI if threshold is exceeded
- `warn`: Reports issue but doesn't fail CI

### Routes to Test

Edit the `url` array in `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/login"]
    }
  }
}
```

Add or remove routes as needed. Choose representative pages:

- Landing page
- Critical user flows
- Pages with heavy client-side logic
- Pages with complex layouts

### Adjusting Budgets

Start conservative and tighten over time:

1. **Too strict**: Failing on every PR?

   - Increase `maxNumericValue` thresholds
   - Lower `minScore` values
   - Change `error` to `warn` temporarily

2. **Too loose**: Want better performance?

   - Gradually decrease thresholds
   - Add more granular audits
   - Monitor trends before enforcing

3. **Flaky results**: Inconsistent CI runs?
   - Increase `numberOfRuns` (default: 3)
   - Use `simulate` throttling (already configured)
   - Check for dynamic content causing variance

## Troubleshooting

### "Invalid URL" or MetadataBase Errors

**Problem:** Next.js requires `metadataBase` for absolute URLs.

**Solution:** Add to `apps/web/src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  // ...other metadata
};
```

### LHCI Can't Detect Server Readiness

**Problem:** Lighthouse times out waiting for the server.

**Current pattern:** `"Ready in"` (matches Next.js output)

**Solutions:**

1. Check server output: `pnpm build && pnpm start`
2. Adjust pattern in `lighthouserc.json`:
   ```json
   "startServerReadyPattern": "Local:.*http://localhost:3000"
   ```
3. Increase timeout:
   ```json
   "startServerReadyTimeout": 60000
   ```

### CI is Flaky

**Symptoms:** Performance scores vary wildly between runs.

**Causes & Solutions:**

1. **Dynamic content:**

   - Use static test pages
   - Avoid heavy third-party scripts on test routes
   - Mock or stub external API calls

2. **Insufficient runs:**

   - Increase `numberOfRuns` to 5 or more
   - Lighthouse will use median scores

3. **CI resource constraints:**

   - Scores on CI differ from local (normal)
   - Adjust budgets based on CI environment
   - Consider dedicated performance runners

4. **Layout shifts:**
   - Add explicit dimensions to images
   - Preload fonts
   - Reserve space for dynamic content

### Bundle Analysis Not Generating

**Problem:** No `.next/analyze` directory after `pnpm perf:analyze`.

**Solutions:**

1. Ensure build completes: `ANALYZE=true pnpm build` in `apps/web`
2. Check for build errors
3. Verify `@next/bundle-analyzer` is installed

## Disabling the Module

To remove performance checks from CI:

```bash
pnpm perf:disable
```

This removes the workflow files from `.github/workflows/`.

Configuration and dependencies remain for local use. To fully remove:

1. Run `pnpm perf:disable`
2. Remove dependencies from `apps/web/package.json`:
   - `@lhci/cli`
   - `@next/bundle-analyzer`
3. Remove bundle analyzer config from `apps/web/next.config.js`
4. Delete `lighthouserc.json`
5. Delete `tools/perf/` directory
6. Remove perf scripts from root `package.json`

## Best Practices

### 1. Start Conservative

Use lenient budgets initially:

- Performance score ≥ 0.7 (70%)
- LCP < 4000ms
- CLS < 0.15

Tighten over time as you optimize.

### 2. Monitor Trends

Track performance over time rather than fixating on individual scores:

- View artifacts in GitHub Actions
- Use temporary public storage URLs
- Consider setting up permanent storage (LHCI server)

### 3. Test Representative Pages

Focus on:

- User landing pages
- Conversion-critical flows
- Pages with complex interactions

Avoid testing:

- Admin-only pages
- Rarely-visited pages
- Pages requiring authentication (unless you mock auth)

### 4. Balance Speed and Features

Performance is a feature, but not the only one:

- Don't sacrifice UX for marginal gains
- Consider performance vs. time-to-market tradeoffs
- Use warnings for aspirational targets

### 5. Keep Tests Stable

Minimize variance:

- Use static test content
- Avoid third-party widgets on test pages
- Consider creating dedicated performance test routes

## Advanced: Permanent LHCI Storage

For long-term trend analysis, set up an LHCI server:

1. Deploy LHCI server (Docker, Heroku, etc.)
2. Update `lighthouserc.json`:
   ```json
   "upload": {
     "target": "lhci",
     "serverBaseUrl": "https://your-lhci-server.com",
     "token": "build-token"
   }
   ```
3. Add `LHCI_TOKEN` to GitHub secrets

See
[LHCI documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
for details.

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Core Web Vitals Thresholds](https://web.dev/defining-core-web-vitals-thresholds/)

## Support

If you encounter issues:

1. Check this documentation's troubleshooting section
2. Review Lighthouse CI logs in GitHub Actions artifacts
3. Run locally first to isolate CI-specific problems
4. Adjust budgets to match your project's maturity

Remember: Performance budgets are a tool, not a goal. Use them to maintain standards, not to block
progress unnecessarily.
