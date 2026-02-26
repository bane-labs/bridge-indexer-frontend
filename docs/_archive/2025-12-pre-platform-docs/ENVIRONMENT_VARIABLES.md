# Environment Variables: Complete Guide

> **Last Updated**: December 15, 2025  
> **Maintained by**: @thedanielmark

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [Implementation Guide](#implementation-guide)
6. [Usage Patterns](#usage-patterns)
7. [CI/CD Integration](#cicd-integration)
8. [Security & Best Practices](#security--best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Reference](#reference)

---

## Overview

### What This Is

Atlas implements a **type-safe, validated environment variable system** that prevents configuration
errors and security vulnerabilities. This system ensures that:

- Environment variables are validated **before** runtime
- Client and server variables are strictly separated
- Configuration errors are caught in CI/CD pipelines
- Teams have clear patterns for adding new variables

### Technology Stack

- **[T3 Env](https://env.t3.gg/)** - Type-safe environment variable framework
- **[Zod](https://zod.dev/)** - Runtime validation schema library
- **TypeScript** - Compile-time type safety
- **Custom validation script** - CI/CD integration

### Key Benefits

| Benefit         | Description                                               |
| --------------- | --------------------------------------------------------- |
| **Security**    | Prevents accidental exposure of secrets in client bundles |
| **Fail Fast**   | Catches configuration errors in ~30 seconds during CI     |
| **Type Safety** | Full TypeScript autocomplete and type checking            |
| **Explicit**    | Clear separation between public and private variables     |
| **Validated**   | Three layers of validation (build, runtime, CI)           |

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Client Code     │         │  Server Code     │     │
│  │  (Browser)       │         │  (API/SSR)       │     │
│  └────────┬─────────┘         └────────┬─────────┘     │
│           │                            │                │
│           │ import                     │ import         │
│           ▼                            ▼                │
│  ┌────────────────────┐      ┌────────────────────┐    │
│  │  public-env.ts     │      │  server-env.ts     │    │
│  │  NEXT_PUBLIC_*     │      │  Server Vars       │    │
│  └────────┬───────────┘      └────────┬───────────┘    │
│           │                            │                │
│           │ validates against          │                │
│           ▼                            ▼                │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Zod Schemas                        │   │
│  │  public-runtime-config.ts                       │   │
│  │  server-runtime-config.ts                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ used by
                         ▼
         ┌───────────────────────────────┐
         │   CI/CD Validation Script     │
         │   scripts/validate-env.ts     │
         │                               │
         │   • Validates before build    │
         │   • Fails fast on errors      │
         │   • Clear error messages      │
         └───────────────────────────────┘
```

### File Structure

```
atlas/
├── .github/
│   └── workflows/
│       └── ci.yml                      # CI validation integration
│
├── apps/web/
│   ├── .env.example                    # Local development template
│   ├── .env.ci.example                 # CI/CD reference
│   │
│   ├── scripts/
│   │   └── validate-env.ts             # Validation script for CI
│   │
│   └── src/
│       ├── env/
│       │   ├── public-env.ts           # Client environment exports
│       │   └── server-env.ts           # Server environment exports
│       │
│       └── schemas/
│           └── env/
│               ├── public-runtime-config.ts    # Client schemas
│               └── server-runtime-config.ts    # Server schemas
```

### Variable Types

#### Client Variables (`NEXT_PUBLIC_*`)

**Purpose**: Safe to expose in browser bundles  
**Access**: Available in both client and server code  
**Bundling**: Included in client JavaScript  
**Examples**: API endpoints, feature flags, public keys

```typescript
// Accessible everywhere
env.NEXT_PUBLIC_API_URL;
env.NEXT_PUBLIC_ENABLE_ANALYTICS;
env.NEXT_PUBLIC_SENTRY_DSN;
```

#### Server Variables

**Purpose**: Sensitive data that must stay server-side  
**Access**: Only available in server contexts  
**Bundling**: Never included in client code  
**Examples**: Database URLs, API secrets, encryption keys

```typescript
// Only accessible on server
env.DATABASE_URL;
env.JWT_SECRET;
env.STRIPE_SECRET_KEY;
```

---

## Quick Start

### For Local Development

**Step 1: Copy the example file**

```bash
cp apps/web/.env.example apps/web/.env.local
```

**Step 2: Fill in your values**

```env
# apps/web/.env.local
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/atlas_dev
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Step 3: Validate**

```bash
pnpm --filter @atlas/web validate:env
```

**Expected output**:

```
═══════════════════════════════════════════════════════════
  Environment Variable Validation
═══════════════════════════════════════════════════════════

Environment: development

Validating server environment variables...
✔ Server environment variables are valid

Validating client environment variables...
✔ Client environment variables are valid

═══════════════════════════════════════════════════════════

✔ All environment variables are valid!
```

### For CI/CD

Environment variables are automatically validated before build/test steps. No action required beyond
configuring secrets in your CI platform.

---

## Core Concepts

### 1. Schema-Driven Validation

All environment variables are defined using Zod schemas:

```typescript
// src/schemas/env/public-runtime-config.ts
export const ClientEnvSchema = {
  NEXT_PUBLIC_API_URL: z.string().url(), // Must be valid URL
  NEXT_PUBLIC_MAX_ITEMS: z.coerce.number().min(1).default(10),
};
```

**Benefits**:

- Runtime validation catches misconfigurations
- Type inference provides IDE autocomplete
- Single source of truth for validation rules
- Clear error messages when validation fails

### 2. Three-Layer Validation

Environment variables are validated at three stages:

```
1. Build Time (T3 Env)
   ↓ Validates when app starts
   ↓ Fails if required vars missing

2. Runtime (Zod)
   ↓ Validates variable formats
   ↓ Ensures type safety

3. CI/CD (validate-env.ts)
   ↓ Pre-build validation
   ↓ Fails fast before tests run
```

### 3. Explicit Runtime Bindings

Variables must be explicitly bound to `process.env`:

```typescript
// src/env/public-env.ts
export const env = createEnv({
  client: { ...ClientEnvSchema },

  runtimeEnv: {
    // Explicit binding required
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  emptyStringAsUndefined: true,
});
```

**Why explicit?**

- Prevents accidental variable access
- Makes it clear what's being used
- Enables tree-shaking for unused variables
- Easier to audit and review

### 4. Type Safety End-to-End

```typescript
// Schema defines validation
const schema = { NEXT_PUBLIC_API_URL: z.string().url() };

// TypeScript infers type
type Env = z.infer<typeof schema>;
// → { NEXT_PUBLIC_API_URL: string }

// Usage is type-safe
import { env } from "@/env/public-env";
env.NEXT_PUBLIC_API_URL; // ✅ Type: string
env.NEXT_PUBLIC_UNKNOWN; // ❌ TypeScript error
```

---

## Implementation Guide

### Adding a New Environment Variable

Follow this process for every new environment variable:

#### Step 1: Define the Schema

**For client variables** (edit `src/schemas/env/public-runtime-config.ts`):

```typescript
export const ClientEnvSchema = {
  // Existing variables...
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Add your new variable
  NEXT_PUBLIC_FEATURE_FLAG: z.enum(["enabled", "disabled"]).default("disabled"),
};
```

**For server variables** (edit `src/schemas/env/server-runtime-config.ts`):

```typescript
export const ServerEnvSchema = {
  // Existing variables...
  DATABASE_URL: z.string().url(),

  // Add your new variable
  REDIS_URL: z.string().url().optional(),
  API_SECRET_KEY: z.string().min(32),
};
```

#### Step 2: Add Runtime Binding

**For client variables** (edit `src/env/public-env.ts`):

```typescript
runtimeEnv: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_FEATURE_FLAG: process.env.NEXT_PUBLIC_FEATURE_FLAG, // ← Add
}
```

**For server variables** (edit `src/env/server-env.ts`):

```typescript
runtimeEnv: {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,           // ← Add
  API_SECRET_KEY: process.env.API_SECRET_KEY, // ← Add
}
```

#### Step 3: Update Validation Script

Edit `scripts/validate-env.ts` to include your new variables:

```typescript
// For client variables
function validateClientEnv() {
  const clientSchema = z.object(ClientEnvSchema);
  const envVars = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FEATURE_FLAG: process.env.NEXT_PUBLIC_FEATURE_FLAG, // ← Add
  };
  clientSchema.parse(envVars);
}

// For server variables
function validateServerEnv() {
  const serverSchema = z.object(ServerEnvSchema);
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL, // ← Add
    API_SECRET_KEY: process.env.API_SECRET_KEY, // ← Add
  };
  serverSchema.parse(envVars);
}
```

#### Step 4: Document

Add to `.env.example`:

```env
# Feature flag for new feature
# Options: enabled | disabled
# Default: disabled
NEXT_PUBLIC_FEATURE_FLAG=disabled

# Redis connection URL (optional)
# Example: redis://localhost:6379
REDIS_URL=redis://localhost:6379

# API secret key for authentication
# Must be at least 32 characters
# Generate: openssl rand -base64 32
API_SECRET_KEY=your-secret-key-here
```

Add to `.env.ci.example` if needed for CI/CD.

#### Step 5: Test

```bash
# Set the variable
export NEXT_PUBLIC_FEATURE_FLAG=enabled
export REDIS_URL=redis://localhost:6379
export API_SECRET_KEY=supersecretkey32characterslong

# Validate
pnpm --filter @atlas/web validate:env
```

#### Step 6: Update CI Workflow

If the variable is required in CI, update `.github/workflows/ci.yml`:

```yaml
- name: Validate environment variables
  run: pnpm --filter @atlas/web validate:env
  env:
    NODE_ENV: production
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    REDIS_URL: ${{ secrets.REDIS_URL }} # ← Add
    API_SECRET_KEY: ${{ secrets.API_SECRET_KEY }} # ← Add
    NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
    NEXT_PUBLIC_FEATURE_FLAG: ${{ vars.NEXT_PUBLIC_FEATURE_FLAG }} # ← Add
```

### Common Validation Patterns

#### URLs

```typescript
// Must be valid URL
NEXT_PUBLIC_API_URL: z.string().url();

// Must be HTTPS in production
API_ENDPOINT: z.string()
  .url()
  .refine(
    (url) => process.env.NODE_ENV !== "production" || url.startsWith("https://"),
    "Must use HTTPS in production"
  );
```

#### Enums

```typescript
// Restrict to specific values
NODE_ENV: z.enum(["development", "test", "production"]);
LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info");
```

#### Numbers

```typescript
// Coerce string to number
PORT: z.coerce.number().min(1024).max(65535).default(3000);
MAX_CONNECTIONS: z.coerce.number().positive();
```

#### Booleans

```typescript
// Convert string to boolean
ENABLE_FEATURE: z.enum(["true", "false"]).transform((val) => val === "true");

// Or use coerce
ENABLE_ANALYTICS: z.coerce.boolean().default(false);
```

#### Optional Values

```typescript
// May be undefined
SENTRY_DSN: z.string().url().optional();

// With default fallback
REDIS_URL: z.string().url().default("redis://localhost:6379");
```

#### Complex Validation

```typescript
// Email format
ADMIN_EMAIL: z.string().email();

// Regex pattern
DATABASE_NAME: z.string().regex(/^[a-z_][a-z0-9_]*$/);

// Custom validation
JWT_SECRET: z.string()
  .min(32)
  .refine((secret) => !secret.includes(" "), "Secret must not contain spaces");
```

---

## Usage Patterns

### In Client Components

```typescript
'use client';

import { env } from '@/env/public-env';

export function ApiStatus() {
  // Type-safe access to client variables
  const apiUrl = env.NEXT_PUBLIC_API_URL;

  return (
    <div>
      <p>API Endpoint: {apiUrl}</p>
      <p>Status: {env.NEXT_PUBLIC_FEATURE_FLAG}</p>
    </div>
  );
}
```

### In Server Components

```typescript
import { env as serverEnv } from '@/env/server-env';
import { env as publicEnv } from '@/env/public-env';

export async function DataPage() {
  // Access server-only variables
  const dbUrl = serverEnv.DATABASE_URL;

  // Can also access public variables
  const apiUrl = publicEnv.NEXT_PUBLIC_API_URL;

  const data = await fetchFromDatabase(dbUrl);

  return <div>{/* render data */}</div>;
}
```

### In API Routes

```typescript
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env/server-env";

export async function POST(request: NextRequest) {
  // Server-only variables available
  const secretKey = env.API_SECRET_KEY;

  // Validate request
  const isValid = validateSignature(request, secretKey);

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process request...
  return NextResponse.json({ success: true });
}
```

### In Middleware

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/env/server-env";

export function middleware(request: NextRequest) {
  // Can access server variables in middleware
  const enableAuth = env.ENABLE_AUTHENTICATION;

  if (enableAuth && !request.cookies.has("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

### In Tests

```typescript
import { env } from "@/env/server-env";

// Mock environment variables for testing
jest.mock("@/env/server-env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
    NODE_ENV: "test",
  },
}));

describe("Database Connection", () => {
  it("uses test database", () => {
    expect(env.DATABASE_URL).toContain("test_db");
  });
});
```

---

## CI/CD Integration

### GitHub Actions

The validation job runs **first** in the CI pipeline:

```yaml
# .github/workflows/ci.yml
jobs:
  validate-env:
    name: Validate Environment Variables
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate environment variables
        run: pnpm --filter @atlas/web validate:env
        env:
          NODE_ENV: production
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

  # Other jobs run after validation passes
  lint:
    needs: validate-env
    # ...
```

### Pipeline Flow

```
┌─────────────────────────────────────────────────────┐
│  Push/PR to main                                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  validate-env (~30 seconds)                         │
│  • Validates all environment variables              │
│  • Clear error messages if invalid                  │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │   Valid?      │
         └───────┬───────┘
                 │
         ┌───────┴─────────┐
         │                 │
     ❌ No             ✅ Yes
         │                 │
         ▼                 ▼
   ┌─────────┐      ┌────────────┐
   │ Fail    │      │ Continue   │
   │ Fast    │      │ Pipeline   │
   └─────────┘      └─────┬──────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
          ┌──────────┐        ┌──────────┐
          │  Lint    │        │  Test    │
          └──────────┘        └──────────┘
                │                   │
                └─────────┬─────────┘
                          ▼
                   ┌──────────┐
                   │  Build   │
                   └─────┬────┘
                         │
                         ▼
                   ┌──────────┐
                   │   E2E    │
                   └──────────┘
```

### Configuring Secrets

#### GitHub

1. Go to repository **Settings**
2. Navigate to **Secrets and variables** → **Actions**
3. Add repository secrets:
   - `DATABASE_URL`
   - `API_SECRET_KEY`
   - Any other server-only variables
4. Add repository variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_FEATURE_FLAG`
   - Any other client-safe variables

#### GitLab

```yaml
# .gitlab-ci.yml
variables:
  NEXT_PUBLIC_API_URL: "https://api.staging.example.com"

validate-env:
  script:
    - pnpm --filter @atlas/web validate:env
  variables:
    DATABASE_URL: $DATABASE_URL # From GitLab CI/CD variables
```

### Skip Validation (Not Recommended)

```yaml
- name: Build (skip validation)
  run: pnpm build
  env:
    SKIP_ENV_VALIDATION: "true" # Use sparingly
```

**Only skip validation when**:

- Using dynamic environment variable injection
- Running in environments with runtime-only config
- Temporary debugging (remove after)

---

## Security & Best Practices

### Security Principles

#### 1. Never Expose Secrets in Client Code

```typescript
// ❌ WRONG - Secret exposed to client
export const ClientEnvSchema = {
  NEXT_PUBLIC_API_SECRET: z.string(), // DON'T DO THIS
};

// ✅ CORRECT - Secret stays on server
export const ServerEnvSchema = {
  API_SECRET: z.string(), // Only accessible server-side
};
```

#### 2. Use Appropriate Variable Prefixes

```typescript
// Client-safe (public)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=UA-12345678
NEXT_PUBLIC_FEATURE_FLAGS=true

// Server-only (private)
DATABASE_URL=postgresql://...
JWT_SECRET=supersecret
STRIPE_SECRET_KEY=sk_live_...
```

#### 3. Validate All Variables

```typescript
// ❌ WRONG - No validation
NEXT_PUBLIC_API_URL: z.string();

// ✅ BETTER - Format validation
NEXT_PUBLIC_API_URL: z.string().url();

// ✅ BEST - Comprehensive validation
NEXT_PUBLIC_API_URL: z.string()
  .url()
  .refine(
    (url) => url.startsWith("https://") || process.env.NODE_ENV !== "production",
    "Must use HTTPS in production"
  );
```

#### 4. Use Different Values per Environment

```env
# Development
DATABASE_URL=postgresql://localhost:5432/atlas_dev
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Staging
DATABASE_URL=postgresql://staging.db.example.com:5432/atlas_staging
NEXT_PUBLIC_API_URL=https://api.staging.example.com

# Production
DATABASE_URL=postgresql://prod.db.example.com:5432/atlas_prod
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Best Practices Checklist

✅ **Configuration**

- [ ] Use `.env.local` for local development
- [ ] Never commit `.env.local` to version control
- [ ] Keep `.env.example` updated with all required variables
- [ ] Document each variable with comments
- [ ] Use meaningful variable names

✅ **Validation**

- [ ] Define Zod schema for every variable
- [ ] Add format validation (URL, email, etc.)
- [ ] Set sensible defaults where appropriate
- [ ] Make required variables explicit (no optional for critical vars)
- [ ] Run `validate:env` before committing

✅ **Security**

- [ ] Prefix public variables with `NEXT_PUBLIC_`
- [ ] Keep secrets in server-only variables
- [ ] Use HTTPS URLs in production
- [ ] Rotate secrets regularly
- [ ] Audit variable access patterns

✅ **CI/CD**

- [ ] Validate environment variables before build
- [ ] Use CI platform secrets for sensitive data
- [ ] Test with production-like values
- [ ] Monitor validation failures
- [ ] Document CI setup in `.env.ci.example`

✅ **Documentation**

- [ ] Comment each variable in `.env.example`
- [ ] Explain what each variable controls
- [ ] Provide example values
- [ ] Link to related documentation
- [ ] Keep documentation up to date

---

## Troubleshooting

### Common Issues

#### Issue: Validation Fails in CI

**Symptoms**:

```
✖ Server environment validation failed:
  ✖ DATABASE_URL: Required
```

**Solutions**:

1. Verify variable is set in CI platform secrets
2. Check variable name matches exactly (case-sensitive)
3. Ensure CI workflow includes the variable in `env:` block
4. Run validation locally to see detailed errors

#### Issue: TypeScript Errors After Adding Variable

**Symptoms**:

```
Property 'NEW_VAR' does not exist on type '{ ... }'
```

**Solutions**:

1. Restart TypeScript server: `Cmd+Shift+P` → "Restart TS Server"
2. Verify runtime binding matches schema
3. Check that both schema and binding use same variable name
4. Rebuild: `pnpm build`

#### Issue: Variables Not Updating

**Symptoms**: Old variable values persist after changes

**Solutions**:

1. Restart dev server: `Ctrl+C` then `pnpm dev`
2. Clear Next.js cache: `rm -rf .next`
3. Verify editing `.env.local` (not `.env.example`)
4. Check for typos in variable names

#### Issue: Client Variable Undefined in Browser

**Symptoms**: `env.NEXT_PUBLIC_VAR` is `undefined` in client code

**Solutions**:

1. Verify variable starts with `NEXT_PUBLIC_`
2. Restart dev server (required for new variables)
3. Check that variable is in `.env.local`
4. Verify runtime binding exists in `public-env.ts`

#### Issue: Server Variable Accessible in Client

**Symptoms**: Security warning or unexpected behavior

**Solutions**:

1. **Never** prefix server variables with `NEXT_PUBLIC_`
2. Check you're importing from `@/env/server-env` (not `public-env`)
3. Audit your code for accidental client-side access
4. Run security scan: Search codebase for server variable names

### Debugging Commands

```bash
# Validate environment
pnpm --filter @atlas/web validate:env

# Type check
pnpm --filter @atlas/web typecheck

# Check for errors
pnpm --filter @atlas/web lint

# Clear cache and rebuild
pnpm --filter @atlas/web clean
pnpm --filter @atlas/web build

# View effective environment (dev)
pnpm --filter @atlas/web dev
# Open http://localhost:3000 and check console

# Test with specific environment
NODE_ENV=production \
DATABASE_URL=postgresql://test \
NEXT_PUBLIC_API_URL=https://api.test \
pnpm --filter @atlas/web validate:env
```

### Error Messages Reference

| Error                                 | Meaning                   | Solution                             |
| ------------------------------------- | ------------------------- | ------------------------------------ |
| `Required`                            | Variable not set          | Set the variable in your environment |
| `Invalid url`                         | Not a valid URL format    | Use format: `https://example.com`    |
| `Expected string, received undefined` | Variable is undefined     | Check variable name spelling         |
| `Invalid enum value`                  | Value not in allowed list | Use one of the specified enum values |
| `Number must be greater than 0`       | Invalid number            | Provide positive number              |

---

## Reference

### Commands

| Command             | Description                        | When to Use                |
| ------------------- | ---------------------------------- | -------------------------- |
| `pnpm validate:env` | Validate all environment variables | Before committing, in CI   |
| `pnpm dev`          | Start development server           | Local development          |
| `pnpm build`        | Build for production               | Before deployment          |
| `pnpm typecheck`    | Check TypeScript errors            | Before committing          |
| `pnpm clean`        | Clear build cache                  | When having caching issues |

### File Locations

| File                                       | Purpose                   | Edit Frequency           |
| ------------------------------------------ | ------------------------- | ------------------------ |
| `.env.local`                               | Your local environment    | Daily (not committed)    |
| `.env.example`                             | Template for team         | When adding variables    |
| `.env.ci.example`                          | CI/CD reference           | When adding CI variables |
| `src/schemas/env/public-runtime-config.ts` | Client variable schemas   | When adding public vars  |
| `src/schemas/env/server-runtime-config.ts` | Server variable schemas   | When adding private vars |
| `src/env/public-env.ts`                    | Client environment config | When adding public vars  |
| `src/env/server-env.ts`                    | Server environment config | When adding private vars |
| `scripts/validate-env.ts`                  | CI validation script      | When adding any variable |

### Environment Variable Naming

| Pattern         | Example                     | Usage                 |
| --------------- | --------------------------- | --------------------- |
| `NEXT_PUBLIC_*` | `NEXT_PUBLIC_API_URL`       | Client-safe values    |
| `*_URL`         | `DATABASE_URL`, `API_URL`   | Connection strings    |
| `*_KEY`         | `API_KEY`, `JWT_SECRET_KEY` | Authentication        |
| `*_SECRET`      | `STRIPE_SECRET`             | Sensitive credentials |
| `ENABLE_*`      | `ENABLE_ANALYTICS`          | Feature flags         |
| `*_ENV`         | `NODE_ENV`                  | Environment name      |

### External Resources

- **[T3 Env Documentation](https://env.t3.gg/)** - Official T3 Env guide
- **[Zod Documentation](https://zod.dev/)** - Schema validation library
- **[Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)** -
  Next.js official guide
- **[The Twelve-Factor App: Config](https://12factor.net/config)** - Configuration best practices

### Internal Documentation

- [Platform Principles](platform-principles.md) - Architecture and coding standards
- [Atlas Context](ATLAS_CONTEXT.md) - Platform philosophy and goals
- [Apps/Web ENV.md](../apps/web/ENV.md) - Web app specific env docs

---

## Summary

### Key Takeaways

1. **Type Safety**: Environment variables are fully type-safe from schema to usage
2. **Three-Layer Validation**: Build time, runtime, and CI/CD validation
3. **Security First**: Clear separation between public and private variables
4. **Fail Fast**: CI catches configuration errors in ~30 seconds
5. **Developer Friendly**: Clear errors, good documentation, easy to add variables

### Quick Reference Card

```bash
# Setup
cp apps/web/.env.example apps/web/.env.local
pnpm validate:env

# Add Variable
1. Define schema in schemas/env/[public|server]-runtime-config.ts
2. Add binding in env/[public|server]-env.ts
3. Update scripts/validate-env.ts
4. Document in .env.example
5. Test with: pnpm validate:env

# Usage
import { env } from '@/env/public-env';     // Client
import { env } from '@/env/server-env';     // Server
```

### Getting Help

- **Questions**: Open an issue in the repository
- **Bugs**: Report with error message and steps to reproduce
- **Improvements**: Submit PR with clear description

---

**Document Version**: 1.0  
**Last Reviewed**: December 15, 2025  
**Next Review**: March 15, 2026
