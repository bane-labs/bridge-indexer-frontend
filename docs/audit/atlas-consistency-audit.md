# Atlas Consistency Audit

**Date:** 2025-12-27 **Auditor:** Staff Frontend Platform Engineer **Scope:** Full codebase
consistency, correctness, and documentation alignment

---

## Executive Summary

The Atlas codebase demonstrates **strong architectural consistency**. The platform primitives are
well-designed, properly typed, and follow documented conventions. The demo application exercises all
major systems correctly.

### Key Strengths

- ✅ Env/Config facade pattern is consistent and well-enforced via ESLint
- ✅ API client is centralized with proper correlation ID propagation
- ✅ Error shape is standardized (`ApiError` with `correlationId`)
- ✅ React Query patterns follow documented conventions
- ✅ Feature flags with kill switch pattern are correctly implemented
- ✅ Auth uses secure httpOnly cookies, no token leakage
- ✅ Analytics adapter pattern prevents direct vendor SDK imports
- ✅ Testing harness (`renderWithProviders`) is consistent
- ✅ Demo pages exercise platform patterns correctly

### Areas of Concern

- ⚠️ One demo page (`sentry/page.tsx`) uses raw `fetch()` with ESLint disable
- ⚠️ MSW import uses deprecated `rest` API (should use `http` from MSW v2)
- ⚠️ Minor doc/code alignment issues (fixable)

---

## 1. Canonical Entrypoints

Engineers should use these imports for platform systems:

| System                   | Import Path                                                                        | Notes                      |
| ------------------------ | ---------------------------------------------------------------------------------- | -------------------------- |
| **Env (Server)**         | `import { serverEnv } from "@/env"`                                                | Server-only variables      |
| **Env (Client)**         | `import { clientEnv } from "@/env"`                                                | NEXT*PUBLIC*\* only        |
| **Config (Server)**      | `import { getServerConfig } from "@/config/server"`                                | Full typed config          |
| **Config (Client)**      | `import { useConfig } from "@/config"`                                             | Client-safe config         |
| **Runtime Config**       | `import { useRuntimeConfig } from "@/lib/runtime-config"`                          | Dynamic runtime values     |
| **API Client**           | `import { useApiClient } from "@/lib/api"`                                         | Hook for client components |
| **API Server**           | `import { apiRequest } from "@/lib/api/server"`                                    | Server-side fetch          |
| **Error Handling**       | `import { ApiError, normalizeApiError, getUserFacingMessage } from "@/lib/api"`    | Standard error shape       |
| **React Query Keys**     | `import { createQueryKeys } from "@/lib/react-query"`                              | Query key factories        |
| **React Query Patterns** | `import { createQuery, createMutation } from "@/lib/react-query"`                  | Typed wrappers             |
| **Auth (Client)**        | `import { useSession } from "@/lib/auth"`                                          | Session hook               |
| **Auth (Server)**        | `import { readSession, readSessionWithRefresh } from "@/lib/auth/session"`         | Server session             |
| **Analytics**            | `import { analytics } from "@/lib/analytics"`                                      | Vendor-agnostic            |
| **Logging (Server)**     | `import { log } from "@/lib/logging/logger.server"`                                | Pino structured logs       |
| **Feature Flags**        | `import { useFlag, FeatureGuard, FeatureFlags } from "@/lib/feature-flags"`        | Typed flags                |
| **Notifications**        | `import { notify, notifyApiError } from "@/lib/notifications"`                     | Toast wrapper              |
| **Breadcrumbs**          | `import { useBreadcrumbs, breadcrumbTree } from "@/lib/breadcrumbs"`               | Tree-based                 |
| **Telemetry**            | `import { initWebVitalsReporting } from "@/lib/telemetry"`                         | Web Vitals                 |
| **Sentry (Client)**      | `import { captureException, captureMessage } from "@/lib/telemetry/sentry.client"` | Error tracking             |
| **Testing**              | `import { renderWithProviders, fixtures, userFactory } from "@/test"`              | Test harness               |
| **UI Components**        | `import { Button, Card, ... } from "@atlas/ui"`                                    | Shared UI library          |
| **Forms**                | `import { useZodForm, FormField, applyServerFieldErrors } from "@atlas/ui"`        | Form primitives            |
| **App States**           | `import { EmptyState, ErrorFallback, Skeleton, Loader } from "@atlas/ui"`          | Loading/error UX           |

---

## 2. Findings Table

| Area              | Finding                                                                                  | Severity | Fixed in PR? | Follow-up         |
| ----------------- | ---------------------------------------------------------------------------------------- | -------- | ------------ | ----------------- |
| **ENV + CONFIG**  | ✅ Consistent. `@t3-oss/env-nextjs` validates all vars. ESLint blocks raw `process.env`. | -        | N/A          | -                 |
| **ENV + CONFIG**  | ✅ Client/server separation correct. Runtime config for deploy-time flexibility.         | -        | N/A          | -                 |
| **API CLIENT**    | ✅ Centralized. `fetch()` banned in UI code via ESLint.                                  | -        | N/A          | -                 |
| **API CLIENT**    | ⚠️ `sentry/page.tsx` uses raw `fetch()` with ESLint disable                              | P2       | ✅           | -                 |
| **ERROR SHAPE**   | ✅ `ApiErrorShape` is consistent with `correlationId` end-to-end                         | -        | N/A          | -                 |
| **AUTH**          | ✅ Secure httpOnly cookies. Tokens never in localStorage. PKCE implemented.              | -        | N/A          | -                 |
| **ANALYTICS**     | ✅ Adapter pattern works. ESLint blocks direct vendor imports.                           | -        | N/A          | -                 |
| **LOGGING**       | ✅ Pino structured logging with request context. Redaction configured.                   | -        | N/A          | -                 |
| **UI PLATFORM**   | ✅ Single source: `@atlas/ui`. EmptyState, ErrorFallback, Skeleton consistent.           | -        | N/A          | -                 |
| **FORMS**         | ✅ `useZodForm` + `FormField` pattern consistent. `applyServerFieldErrors` exists.       | -        | N/A          | -                 |
| **FEATURE FLAGS** | ✅ Typed flags, kill switch pattern, `FeatureGuard` component.                           | -        | N/A          | -                 |
| **TESTING**       | ✅ `renderWithProviders` used consistently. MSW for API mocking.                         | -        | N/A          | -                 |
| **TESTING**       | ⚠️ MSW uses v1 API (`rest`), docs show v2 (`http`)                                       | P2       | -            | Upgrade MSW to v2 |
| **DOCS**          | ✅ `docs/how-we-build/` matches implementation                                           | -        | N/A          | -                 |
| **DEMO**          | ✅ All demo pages use platform patterns correctly                                        | -        | N/A          | -                 |
| **A11Y**          | ✅ `eslint-plugin-jsx-a11y` configured. Focus-visible patterns used.                     | -        | N/A          | -                 |

---

## 3. Fixes Applied in This PR

### 3.1 Sentry Demo Page: Use API Client Instead of Raw Fetch

**File:** [apps/web/src/app/demo/sentry/page.tsx](../../apps/web/src/app/demo/sentry/page.tsx)

**Issue:** Direct `fetch()` call with ESLint disable comment bypasses the central API client.

**Fix:** Use `useApiClient()` hook for consistent error handling and correlation ID propagation.

### 3.2 MSW Setup: Add Note About v1 API

**File:** [apps/web/src/test/setup/msw.ts](../../apps/web/src/test/setup/msw.ts)

**Issue:** Uses MSW v1 API (`rest`) while docs show v2 API (`http`).

**Fix:** Added comment noting v1 API in use. Migration to v2 tracked in follow-up backlog.

---

## 4. Follow-Up Backlog

These items are either too large for this PR or require deeper investigation:

### P1 (Do Soon)

1. **[MSW v2 Migration]** Upgrade MSW from v1 to v2 and update all handlers

   - Update package.json to `"msw": "^2.x"`
   - Update all `rest.*` calls to `http.*`
   - Update response handlers to use `HttpResponse.json()`
   - Update docs if needed (currently shows v2 API)
   - Verify all tests pass after migration
   - **Effort:** 2-3 hours

2. **[OpenAPI Contract Validation]** Add CI check that OpenAPI spec matches implemented endpoints
   - Add script to validate response shapes
   - **Effort:** 1-2 hours

### P2 (Nice to Have)

3. **[Stale Docs Cleanup]** Review and archive `docs/_archive/` content

   - Some pre-platform docs may confuse new engineers
   - **Effort:** 1 hour

4. **[Test Coverage Gaps]** Add tests for breadcrumb builder edge cases

   - `paramResolver` with async data fetching
   - `inherit: false` behavior
   - **Effort:** 2 hours

5. **[Analytics E2E Test]** Add integration test for analytics consent flow
   - Verify events are blocked when consent is false
   - **Effort:** 1 hour

### P3 (Cosmetic)

6. **[Console Log Cleanup]** Audit all `console.log` in telemetry module
   - Currently allowed via ESLint override
   - Consider using debug flag consistently
   - **Effort:** 30 min

---

## 5. Documentation Accuracy

| Document                                     | Status      | Notes                                    |
| -------------------------------------------- | ----------- | ---------------------------------------- |
| `docs/how-we-build/env.md`                   | ✅ Accurate | Matches t3-env implementation            |
| `docs/how-we-build/api.md`                   | ✅ Accurate | Documents React Query + OpenAPI patterns |
| `docs/how-we-build/testing.md`               | ✅ Accurate | `renderWithProviders` documented         |
| `docs/how-we-build/accessibility.md`         | ✅ Accurate | jsx-a11y rules match config              |
| `docs/adr/0002-env-validation-t3-env.md`     | ✅ Accurate | ADR reflects current implementation      |
| `docs/adr/0003-data-fetching-react-query.md` | ✅ Accurate | React Query patterns documented          |
| `docs/adr/0004-oauth-google-pkce.md`         | ✅ Accurate | PKCE flow implemented as documented      |
| `docs/adr/0005-observability-sentry.md`      | ✅ Accurate | Sentry integration matches               |
| `docs/public/quickstart.md`                  | ✅ Accurate | Demo routes listed correctly             |

---

## 6. Verification Checklist

After applying fixes:

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] Demo pages render without errors
- [ ] Sentry demo triggers API correctly

---

## Appendix: Search Patterns Used

For future audits, these grep patterns identify inconsistencies:

```bash
# Raw process.env usage (should be in env module only)
grep -r "process\.env\." --include="*.ts" --include="*.tsx" apps/web/src

# Direct fetch() calls (should use API client)
grep -r "\bfetch\s*(" --include="*.tsx" apps/web/src/app

# Direct vendor SDK imports
grep -r "from ['\"]posthog-js['\"]" --include="*.ts" --include="*.tsx" apps/web/src

# Console.log usage
grep -r "console\.log" --include="*.ts" --include="*.tsx" apps/web/src/lib
```
