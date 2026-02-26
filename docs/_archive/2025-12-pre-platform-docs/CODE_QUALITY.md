# Code Quality Enforcement

Atlas enforces enterprise-grade code quality standards through automated linting and formatting.

## Philosophy

**Code quality tools serve three purposes:**

1. **Correctness** - Catch bugs and unsafe patterns before they reach production
2. **Consistency** - Maintain uniform code style across the entire codebase
3. **Developer Experience** - Provide fast, actionable feedback without noise

**We optimize for signal, not stylistic micromanagement.**

## Why NO Airbnb ESLint Config?

Atlas **deliberately avoids** the Airbnb ESLint configuration for the following reasons:

### 1. **Outdated for Modern TypeScript**

Airbnb's config predates TypeScript-first development. It includes:

- Redundant rules covered by TypeScript's type system
- Legacy React patterns (prop-types, class components)
- Insufficient type-safety enforcement

### 2. **Noisy and Opinionated**

Airbnb enforces hundreds of stylistic preferences that:

- Conflict with Prettier (causing config complexity)
- Generate low-value warnings requiring constant `eslint-disable` comments
- Slow down development without improving code quality

### 3. **Not Optimized for Next.js App Router**

Next.js App Router requires:

- Server Component awareness
- Client/Server boundary safety
- Modern React patterns (no `React.FC`, auto JSX transform)

Airbnb's config fights these patterns instead of embracing them.

### 4. **Enterprise Maintenance Burden**

Airbnb config brings:

- 200+ dependencies
- Frequent breaking changes
- Complex override requirements for monorepos

**Atlas uses a lean, TypeScript-aware, Next.js-native ruleset instead.**

---

## Tool Responsibilities

| Tool         | Responsibility            | Examples                                                  |
| ------------ | ------------------------- | --------------------------------------------------------- |
| **ESLint**   | Correctness & conventions | Type safety, unused variables, promise handling, security |
| **Prettier** | Formatting ONLY           | Semicolons, quotes, line breaks, indentation              |

**ESLint does NOT handle formatting.** Prettier does.

---

## ESLint Configuration

### Technology Stack

- **ESLint Flat Config** (`eslint.config.mjs`) - Modern, composable configuration
- **typescript-eslint** - Unified TypeScript parser and rules (v8+)
- **Type-Checked Rules** - Leverages TypeScript's type system for deep analysis

### Enabled Plugins

| Plugin                         | Purpose                                  |
| ------------------------------ | ---------------------------------------- |
| `@eslint/js`                   | JavaScript recommended rules             |
| `typescript-eslint`            | TypeScript strict + type-checked rules   |
| `eslint-plugin-react`          | React best practices (JSX runtime aware) |
| `eslint-plugin-react-hooks`    | Hooks rules enforcement                  |
| `eslint-plugin-jsx-a11y`       | Accessibility checks                     |
| `eslint-plugin-import`         | Import ordering and organization         |
| `eslint-plugin-unused-imports` | Auto-remove unused imports               |
| `eslint-plugin-promise`        | Async/await and Promise safety           |
| `eslint-plugin-security`       | Low-noise security checks                |

### Key Rules

#### TypeScript Type Safety

```typescript
// ✅ Good
const user: User = await fetchUser();
const name: string | undefined = user?.name;

// ❌ Bad
const user: any = await fetchUser(); // @typescript-eslint/no-explicit-any
const name = user.name; // @typescript-eslint/no-unsafe-member-access
```

#### Unused Imports (Auto-fixable)

```typescript
// ✅ Good
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Bad
import { useState, useEffect } from "react"; // unused-imports/no-unused-imports

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### Consistent Type Imports

```typescript
// ✅ Good
import type { User } from "./types";
import { fetchUser } from "./api";

// ❌ Bad
import { User, fetchUser } from "./api"; // @typescript-eslint/consistent-type-imports
```

#### Promise Safety

```typescript
// ✅ Good
async function handleClick() {
  await saveData();
}

// ❌ Bad
function handleClick() {
  saveData(); // @typescript-eslint/no-floating-promises
}
```

#### No Console Usage

```typescript
// ✅ Good
import { log } from "@/lib/logging/logger.server";

log.info({ event: "user_login", userId }, "User logged in");

// ❌ Bad
console.log("User logged in:", userId); // no-console
```

**Why?** Structured logging provides:

- Searchable events
- Type-safe log data
- Production observability
- Environment-aware behavior

---

## Prettier Configuration

**Prettier is formatting-only. Zero configuration philosophy.**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Key Choices:**

- **`singleQuote: false`** - Double quotes for consistency with JSON/HTML
- **`printWidth: 100`** - Balances readability and screen space
- **Tailwind Plugin** - Auto-sorts Tailwind classes

---

## Running Locally

### Quick Commands

```bash
# Check for lint errors (CI-safe, no fixes)
pnpm lint

# Fix auto-fixable lint errors
pnpm lint:fix

# Check formatting
pnpm format

# Fix formatting
pnpm format:write

# Type check
pnpm typecheck
```

### Pre-Commit Hooks

**Husky + lint-staged** automatically runs on staged files:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

**Fast and reliable** - Only processes changed files.

---

## CI Enforcement

GitHub Actions enforces code quality on **every PR and push to main**:

```yaml
- name: Run Prettier check
  run: pnpm format

- name: Run ESLint
  run: pnpm lint
```

**CI WILL FAIL if:**

- Any ESLint errors exist
- Code is not formatted with Prettier
- TypeScript type errors exist

---

## Common Issues & Fixes

### Issue: "Error: ESLint couldn't find a configuration file"

**Fix:**

```bash
# Ensure you're in a package directory, not the root
cd apps/web
pnpm lint
```

Each package (`apps/web`, `packages/ui`) has its own ESLint config extending `@atlas/config/eslint`.

---

### Issue: "Type-checked rules require parserOptions.project"

**Fix:** The config uses `projectService: true` for automatic TypeScript project detection. Ensure
`tsconfig.json` exists in the package.

---

### Issue: "Too many false positives from eslint-plugin-security"

**Intentional.** Security rules are low-noise:

- `detect-object-injection` - **OFF** (too many false positives)
- `detect-unsafe-regex` - **ERROR** (real ReDoS risk)
- `detect-eval-with-expression` - **ERROR** (security risk)

We only enable high-signal security rules.

---

### Issue: "ESLint is slow"

**Type-checked rules require TypeScript compilation.** Optimize by:

1. **Use `lint:fix` only on changed files:**

   ```bash
   git diff --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$' | xargs pnpm eslint --fix
   ```

2. **Pre-commit hooks already do this automatically.**

3. **CI caches dependencies** for faster runs.

---

## Rule Tradeoffs

### Downgraded from Error to Warning

| Rule                                      | Reason                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`      | Useful during rapid prototyping; upgraded to error in strict mode later |
| `@typescript-eslint/no-unsafe-assignment` | Too noisy in tests and migration scenarios                              |
| `no-nested-ternary`                       | Complex UI logic sometimes requires it                                  |

### Disabled Entirely

| Rule                               | Reason                                 |
| ---------------------------------- | -------------------------------------- |
| `react/prop-types`                 | TypeScript handles this                |
| `promise/always-return`            | Too strict for modern async/await      |
| `security/detect-object-injection` | 90% false positives in TypeScript code |

**All decisions are intentional and documented.**

---

## Extending the Configuration

### Adding a Custom Rule

1. **For workspace-wide changes:** Edit
   [`packages/config/eslint.config.mjs`](../packages/config/eslint.config.mjs)

2. **For app-specific overrides:** Edit
   [`apps/web/eslint.config.mjs`](../apps/web/eslint.config.mjs)

**Example:**

```javascript
{
  files: ["src/experimental/**/*.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
}
```

### Adding a New Plugin

```bash
# Install in the config package
cd packages/config
pnpm add -D eslint-plugin-example

# Add to eslint.config.mjs
import examplePlugin from "eslint-plugin-example";

export default [
  {
    plugins: {
      example: examplePlugin,
    },
    rules: {
      "example/some-rule": "error",
    },
  },
];
```

---

## Performance Optimization

### Incremental Linting

```bash
# Lint only changed files (compared to main)
git diff --name-only origin/main...HEAD | grep -E '\.(ts|tsx)$' | xargs pnpm eslint
```

### Parallel Execution

Turbo runs lint across all packages in parallel:

```bash
pnpm lint # Runs lint in apps/web, packages/ui, packages/config simultaneously
```

---

## Migration Guide

### From Airbnb Config

If migrating from Airbnb:

1. **Remove Airbnb packages:**

   ```bash
   pnpm remove eslint-config-airbnb eslint-config-airbnb-base eslint-config-airbnb-typescript
   ```

2. **Install Atlas config:**

   ```bash
   pnpm add -D @atlas/config
   ```

3. **Update ESLint config:**

   ```javascript
   import baseConfig from "@atlas/config/eslint";
   export default [...baseConfig];
   ```

4. **Fix violations:**
   ```bash
   pnpm lint:fix
   ```

---

## Governance

### When to Add a Rule

Add a rule if it:

- ✅ Catches real bugs or security issues
- ✅ Enforces type safety
- ✅ Has high signal-to-noise ratio
- ✅ Is auto-fixable OR easy to manually fix

**Do NOT add a rule if it:**

- ❌ Is purely stylistic (use Prettier instead)
- ❌ Generates frequent `eslint-disable` comments
- ❌ Conflicts with team consensus

### When to Disable a Rule

Disable a rule if:

- ✅ It generates >10 false positives per 1 real issue
- ✅ It conflicts with Next.js App Router patterns
- ✅ It's already covered by TypeScript

**Document why in this file.**

---

## Resources

- [ESLint Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint](https://typescript-eslint.io/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Next.js ESLint Config](https://nextjs.org/docs/app/building-your-application/configuring/eslint)

---

## Summary

**Atlas code quality is:**

- ✅ TypeScript-first
- ✅ Next.js App Router native
- ✅ Low noise, high signal
- ✅ Enforced locally and in CI
- ✅ Fast and reliable
- ✅ NO Airbnb config

**Optimize for correctness and developer experience, not stylistic rules.**
