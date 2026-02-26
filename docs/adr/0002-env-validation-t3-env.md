# ADR-0002: Environment Validation with t3-env

## Status

**Accepted**

## Context

Environment variables in Next.js applications are error-prone:

- No type safety — `process.env.FOO` returns `string | undefined`
- No validation — missing vars discovered at runtime
- Client/server confusion — easy to expose secrets
- No documentation — what vars are required?

We needed a solution that:

- Validates at build/start time
- Provides TypeScript types
- Separates client and server variables
- Integrates with CI/CD

## Decision

We use **@t3-oss/env-nextjs** (t3-env) with Zod schemas for all environment variables.

### Implementation

1. **Schemas define validation** (`src/schemas/env/*.ts`):

```typescript
export const ServerEnvSchema = {
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
};

export const ClientEnvSchema = {
  NEXT_PUBLIC_API_URL: z.string().url(),
};
```

2. **Env modules export typed variables** (`src/env/*.ts`):

```typescript
export const env = createEnv({
  server: ServerEnvSchema,
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
```

3. **CI validation script** (`scripts/validate-env.ts`):

```bash
pnpm --filter @atlas/web validate:env
```

4. **Usage via typed imports**:

```typescript
import { serverEnv, clientEnv } from "@/env";
```

### Rules

- **Never** use `process.env` directly in application code
- **Always** import from `@/env`
- **Document** every variable in `.env.example`

## Alternatives Considered

### Alternative 1: Raw process.env + TypeScript declarations

**Pros:**

- No dependencies
- Simple

**Cons:**

- No runtime validation
- Easy to miss variables
- No format validation

**Why not chosen:** Doesn't catch errors until runtime.

### Alternative 2: dotenv-safe

**Pros:**

- Validates presence at startup
- Well-known

**Cons:**

- No TypeScript integration
- No format validation
- Doesn't separate client/server

**Why not chosen:** Lacks type safety and format validation.

### Alternative 3: envalid

**Pros:**

- TypeScript support
- Good validation

**Cons:**

- Less Next.js-specific
- Manual client/server separation

**Why not chosen:** t3-env is purpose-built for Next.js.

## Consequences

### Positive

- Build fails on missing/invalid env vars
- Full TypeScript autocomplete
- Clear client/server separation
- CI catches config errors in seconds
- Self-documenting via schemas

### Negative

- Learning curve for team
- Must update multiple files when adding vars
- Build-time validation requires env to be available

### Neutral

- Zod already in the codebase (form validation)

## References

- [t3-env Documentation](https://env.t3.gg/)
- [Zod Documentation](https://zod.dev/)
- Implementation: `apps/web/src/env/`, `apps/web/src/schemas/env/`
