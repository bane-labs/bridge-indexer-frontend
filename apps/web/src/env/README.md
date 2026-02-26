# Environment Variables - Quick Reference

> **For complete documentation, see
> [ENVIRONMENT_VARIABLES.md](../../../docs/ENVIRONMENT_VARIABLES.md)**

## Quick Start

```bash
# Setup
cp .env.example .env.local
# Fill in values, then validate:
pnpm validate:env
```

## Architecture

Atlas uses `@t3-oss/env-nextjs` to provide:

- ✅ **Early validation** - Errors at build/start time, not runtime
- ✅ **Type safety** - Full TypeScript support with autocomplete
- ✅ **Clear separation** - Server-only vs. client-exposed variables
- ✅ **Single source of truth** - Import from `@/env`, never `process.env`

### Import Patterns

```typescript
// ✅ Recommended: Explicit imports
import { serverEnv } from "@/env";
import { clientEnv } from "@/env";

// ⚠️ Avoid: Unified import (use only for isomorphic code)
import { env } from "@/env";

// ❌ Never do this (will trigger lint error)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Adding a New Variable

### For Public Variables (Client-Side)

**1. Define Schema** - `src/schemas/env/public-runtime-config.ts`

```typescript
export const ClientEnvSchema = {
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_YOUR_VAR: z.string().min(1), // ← Add this
};
```

**2. Add Binding** - `src/env/public-env.ts`

```typescript
runtimeEnv: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_YOUR_VAR: process.env.NEXT_PUBLIC_YOUR_VAR, // ← Add this
}
```

**3. Update Validation** - `scripts/validate-env.ts`

```typescript
const envVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_YOUR_VAR: process.env.NEXT_PUBLIC_YOUR_VAR, // ← Add this
};
```

**4. Document** - Add to `.env.example`

```env
# Your variable description
NEXT_PUBLIC_YOUR_VAR=default_value
```

**5. Test**

```bash
export NEXT_PUBLIC_YOUR_VAR=test_value
pnpm validate:env
```

### For Server Variables (Server-Only)

**1. Define Schema** - `src/schemas/env/server-runtime-config.ts`

```typescript
export const ServerEnvSchema = {
  DATABASE_URL: z.string().url(),
  YOUR_SECRET: z.string().min(1), // ← Add this
};
```

**2. Add Binding** - `src/env/server-env.ts`

```typescript
runtimeEnv: {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  YOUR_SECRET: process.env.YOUR_SECRET, // ← Add this
}
```

**3. Update Validation** - `scripts/validate-env.ts`

```typescript
const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  YOUR_SECRET: process.env.YOUR_SECRET, // ← Add this
};
```

**4. Document** - Add to `.env.example`

```env
# Your secret description (NEVER commit actual value)
YOUR_SECRET=your_secret_here
```

**5. Test**

```bash
export YOUR_SECRET=test_secret
pnpm validate:env
```

## Usage

```typescript
// ✅ Server component or API route
import { serverEnv } from "@/env";

export async function GET() {
  const dbUrl = serverEnv.DATABASE_URL;
  const logLevel = serverEnv.LOG_LEVEL;
  // ...
}

// ✅ Client component
import { clientEnv } from "@/env";

function MyComponent() {
  const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;
  // ...
}

// ✅ Isomorphic code (works on both client and server)
import { env } from "@/env";

function getApiUrl() {
  // Safe - NEXT_PUBLIC_ vars work everywhere
  return env.NEXT_PUBLIC_API_URL;
}
```

## ESLint Protection

Atlas enforces env module usage via ESLint. Direct `process.env` access in application code will
fail lint:

```typescript
// ❌ This will fail lint
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// Error: Direct access to process.env is not allowed

// ✅ This is correct
import { clientEnv } from "@/env";
const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;
```

**Exceptions:** Only these files can use `process.env` directly:

- `src/env.ts` and `src/env/**` (env module itself)
- `src/schemas/env/**` (validation schemas)
- Test files (`**/__tests__/**`, `*.test.ts`, `*.spec.ts`)
- Config files (`next.config.js`, `instrumentation.ts`, etc.)

## Common Validation Patterns

```typescript
// URL
z.string().url();

// Enum
z.enum(["development", "production"]);

// Number
z.coerce.number().min(1);

// Boolean
z.coerce.boolean();

// Optional
z.string().optional();

// With default
z.string().default("default_value");
```

## Troubleshooting

| Issue                             | Solution                                  |
| --------------------------------- | ----------------------------------------- |
| Validation fails                  | Check all required vars are set           |
| TypeScript errors                 | Restart TS Server (Cmd+Shift+P)           |
| Vars not updating                 | Restart dev server                        |
| Lint error on `process.env`       | Import from `@/env` instead               |
| "Cannot find module '@/env'"      | Check tsconfig.json paths configuration   |
| Build fails with env errors       | Ensure all required vars are in .env file |
| Optional integrations not working | Set vars or check graceful fallback logic |

## Runtime vs. Build-time Variables

- **Server vars** (`serverEnv.*`): Available at runtime on server
- **Client vars** (`clientEnv.NEXT_PUBLIC_*`): Bundled at build time
- **NODE_ENV**: Set by Next.js, safe to access directly in config files only

## Security Best Practices

1. **Never commit** `.env.local` or files with real secrets
2. **Never expose** server-only vars to client components
3. **Always use** `serverEnv` for sensitive data (API keys, DB URLs)
4. **Validate** optional vars with graceful fallbacks
5. **Document** all env vars in `.env.example`

---

**Need more?** See [Complete Guide](../../../docs/ENVIRONMENT_VARIABLES.md) for architecture, CI/CD,
security, and detailed troubleshooting.
