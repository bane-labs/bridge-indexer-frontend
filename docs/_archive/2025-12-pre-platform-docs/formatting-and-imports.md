# Formatting and Import Conventions

> **TL;DR**: Use `pnpm lint:fix` to auto-fix imports and code issues. Use `pnpm format:write` to
> format all code. Both run automatically on `git commit`.

## Overview

Atlas enforces **deterministic** formatting and import ordering across all machines, editors, and CI
environments. This means:

- ✅ Two engineers working on the same code produce **identical diffs**
- ✅ No "format wars" or bikeshedding over style
- ✅ Merge conflicts from formatting are eliminated
- ✅ Code reviews focus on logic, not whitespace

## Division of Responsibilities

### Prettier: Code Formatting (Single Source of Truth)

Prettier handles **all** code formatting decisions:

- Indentation (2 spaces)
- Line width (100 characters)
- Quotes (double quotes)
- Semicolons (always)
- Trailing commas (ES5 style)
- Arrow function parentheses (always)

**ESLint does NOT enforce formatting rules** — Prettier is the final authority via
`eslint-config-prettier` which disables all formatting rules in ESLint.

### ESLint: Code Quality & Import Ordering

ESLint handles:

- **Import sorting and grouping** (deterministic, autofixable)
- **Unused imports removal** (autofixable)
- **Type safety** (TypeScript rules)
- **React best practices** (hooks, JSX, accessibility)
- **Security patterns** (detect unsafe code)
- **Code quality** (no-console, prefer-const, etc.)

## Import Ordering Convention

Atlas uses `eslint-plugin-simple-import-sort` for **deterministic, autofixable** import ordering.

### Import Groups (in order, with blank lines between groups)

```typescript
// ========================================
// 1. SIDE-EFFECT IMPORTS
// ========================================
import "./globals.css";
import "server-only";

// ========================================
// 2. NODE BUILT-INS (use node: prefix)
// ========================================
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// ========================================
// 3. EXTERNAL PACKAGES
// ========================================
import { z } from "zod";
import { clsx } from "clsx";
import { type NextRequest, NextResponse } from "next/server";
import React, { useState } from "react";

// ========================================
// 4. INTERNAL PACKAGES (@atlas/*)
// ========================================
import { Button } from "@atlas/ui";
import { Card } from "@atlas/ui/card";

// ========================================
// 5. ABSOLUTE IMPORTS (path aliases: @/, ~/)
// ========================================
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { User } from "@/types";

// ========================================
// 6. RELATIVE IMPORTS (parent: ../)
// ========================================
import { config } from "../config";
import type { ApiResponse } from "../types";

// ========================================
// 7. RELATIVE IMPORTS (same folder: ./)
// ========================================
import { Button } from "./Button";
import { Header } from "./Header";
import styles from "./Component.module.css";
```

### Rules Within Groups

- **Alphabetize** imports within each group (case-insensitive)
- **Separate type imports** using TypeScript's `import type { ... }` syntax
- **No duplicate imports** — merge them into one line
- **Blank line** required between groups

### Examples

❌ **Bad** (not sorted, mixed groups):

```typescript
import { useState } from "react";
import type { User } from "@/types";
import { Button } from "@atlas/ui";
import "./globals.css";
import { z } from "zod";
```

✅ **Good** (properly sorted):

```typescript
import "./globals.css";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@atlas/ui";

import type { User } from "@/types";
```

## How to Auto-Fix Locally

### Fix Imports and Code Quality

```bash
# Fix all linting issues (including imports)
pnpm lint:fix

# Or in a specific workspace
pnpm --filter @atlas/web lint:fix
```

### Fix Formatting

```bash
# Format all files
pnpm format:write

# Check formatting without fixing
pnpm format
```

### Fix Everything

```bash
# Run both in sequence
pnpm lint:fix && pnpm format:write
```

## Pre-Commit Enforcement

Git hooks automatically run on **staged files only** (fast):

1. **Gitleaks** — Scan for secrets (blocks commit if found)
2. **ESLint** — Auto-fix linting issues (including import sorting)
3. **Prettier** — Auto-format code

If pre-commit fails, fix issues and re-commit. Most issues are auto-fixed, so simply re-stage and
commit again.

### Skip Pre-Commit (Emergency Only)

```bash
# NOT RECOMMENDED — CI will fail
git commit --no-verify
```

## CI Enforcement

Pull requests and main branch commits run:

1. **Prettier Check** (`pnpm format`) — Fails if code is not formatted
2. **ESLint** (`pnpm lint`) — Fails if linting errors exist
3. **TypeScript Check** (`pnpm typecheck`) — Fails if type errors exist

**CI will fail if:**

- Imports are not sorted correctly
- Code is not formatted with Prettier
- Unused imports exist
- Any ESLint errors exist

## Editor Integration

### VS Code (Recommended)

Install extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

### WebStorm / IntelliJ

1. Enable Prettier:

   - Settings → Languages & Frameworks → JavaScript → Prettier
   - Check "On save" and "On code reformat"

2. Enable ESLint:
   - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Select "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

## Configuration Files

- **`.prettierrc.json`** — Prettier configuration (formatting rules)
- **`.prettierignore`** — Files to ignore from formatting
- **`packages/config/eslint.config.mjs`** — Shared ESLint configuration (code quality + import
  sorting)
- **`.lintstagedrc.json`** — Pre-commit hooks configuration
- **`.husky/pre-commit`** — Git pre-commit hook script

## FAQ

### Why not use Prettier's import sorting?

Prettier's import sorting is experimental and doesn't support:

- Custom import groups (e.g., separating internal vs external)
- Type import separation
- Path alias-aware sorting

`eslint-plugin-simple-import-sort` is production-ready, deterministic, and fully customizable.

### Why use simple-import-sort instead of eslint-plugin-import?

`eslint-plugin-import`'s `import/order` rule has issues with:

- ESLint Flat Config support (newer API)
- TypeScript path aliases
- Deterministic ordering in monorepos

`simple-import-sort` is simpler, faster, and more reliable.

### Why separate type imports?

TypeScript encourages `import type { ... }` for type-only imports because:

- Clearer intent (this is a type, not a runtime value)
- Better tree-shaking (types are erased at build time)
- Prevents circular dependency issues
- Required for some bundlers (e.g., Vite)

### Can I disable import sorting in a file?

**Not recommended**, but if absolutely necessary:

```typescript
/* eslint-disable simple-import-sort/imports */
import { foo } from "bar";
import { baz } from "qux";
/* eslint-enable simple-import-sort/imports */
```

### What if I disagree with the import order?

The import order is **deterministic by design** and should not be changed without team consensus. If
you believe a different order is better:

1. Open a discussion with the team
2. Update this document with the new convention
3. Update `packages/config/eslint.config.mjs`
4. Run `pnpm lint:fix` across the repo to apply changes

### How do I debug import sorting issues?

```bash
# Run ESLint with debug output
DEBUG=eslint:* pnpm lint

# Or target a specific file
pnpm eslint --debug src/app/page.tsx
```

## Troubleshooting

### "Parsing error: Cannot read file 'tsconfig.json'"

**Cause**: ESLint can't find your TypeScript config.

**Fix**: Ensure `tsconfig.json` exists and is specified in your package's `eslint.config.mjs`.

### "Prettier and ESLint are fighting over formatting"

**Cause**: A formatting rule exists in ESLint that conflicts with Prettier.

**Fix**: Ensure `eslint-config-prettier` is the **last** config in your ESLint config array (it
already is in `packages/config/eslint.config.mjs`).

### "Import sorting is not working in my editor"

**Cause**: Your editor's ESLint plugin might not support flat config or auto-fix.

**Fix**:

1. Update your ESLint extension to the latest version
2. Run `pnpm lint:fix` manually
3. Check that pre-commit hooks are working (they will fix it on commit)

### "I see unused import warnings but they're used"

**Cause**: TypeScript might be importing types that ESLint doesn't recognize as "used."

**Fix**: Use `import type { ... }` for type-only imports:

```typescript
// ❌ Might trigger unused import warning
import { User } from "./types";
const user: User = { ... };

// ✅ Explicit type import
import type { User } from "./types";
const user: User = { ... };
```

## Related Documentation

- [Code Quality Guidelines](./CODE_QUALITY.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Logging Standards](./LOGGING.md)
- [Platform Principles](./platform-principles.md)
