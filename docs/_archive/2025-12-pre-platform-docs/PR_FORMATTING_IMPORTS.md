# PR: Enforce Deterministic Import Sorting & Formatting

## Summary

This PR implements **deterministic formatting and import ordering** across the entire Atlas
monorepo. All formatting and linting is now autofixable, runs on pre-commit, and enforces
consistency in CI.

## What Was Already in Place

✅ **ESLint** with flat config  
✅ **Prettier** configured with Tailwind plugin  
✅ **Husky + lint-staged** for pre-commit hooks  
✅ **CI checks** for lint and format  
✅ `eslint-plugin-import` with basic import ordering  
✅ `eslint-plugin-unused-imports` for cleanup

## What Changed in This PR

### 1. **Replaced `eslint-plugin-import` with `eslint-plugin-simple-import-sort`**

**Why?**

- `eslint-plugin-import`'s `import/order` has poor flat config support
- Not deterministic across different TypeScript configurations
- Difficult to configure for monorepos with path aliases

**Benefits:**

- ✅ Fully autofixable and deterministic
- ✅ Works perfectly with ESLint flat config
- ✅ Handles TypeScript path aliases (`@/`, `@atlas/*`)
- ✅ Simpler configuration, faster execution

### 2. **Defined Deterministic Import Grouping Convention**

Import groups (with blank lines between):

1. **Side-effect imports** (CSS, polyfills)
2. **Node.js built-ins** (`node:fs`, `node:path`)
3. **External packages** (React, Next.js, Zod, etc.)
4. **Internal packages** (`@atlas/*`)
5. **Absolute imports** (path aliases: `@/`, `~/`)
6. **Parent imports** (`../`)
7. **Same-folder imports** (`./`)
8. **Type imports** (kept separate)

Within each group: alphabetical order, case-insensitive.

### 3. **Updated ESLint Configuration**

**File:** `packages/config/eslint.config.mjs`

- Added `eslint-plugin-simple-import-sort`
- Configured custom import grouping rules
- Ensured compatibility with existing plugins
- Kept all existing code quality rules
- Maintained Prettier integration (no conflicts)

### 4. **Enhanced `.prettierignore`**

Added missing entries:

- Lock files (`package-lock.json`, `yarn.lock`, `bun.lockb`)
- Minified files (`*.min.js`, `*.min.css`)

### 5. **Created Comprehensive Documentation**

**File:** `docs/formatting-and-imports.md`

Includes:

- ESLint vs Prettier responsibilities
- Detailed import ordering convention with examples
- How to auto-fix locally
- Pre-commit and CI enforcement details
- Editor integration instructions (VS Code, WebStorm)
- FAQ and troubleshooting

### 6. **Applied Repo-Wide Normalization**

Ran autofix across all packages:

- `@atlas/web` (Next.js app)
- `@atlas/ui` (UI component library)
- Root-level scripts and tooling

**Changes:**

- 84 files modified (imports reordered, formatting normalized)
- All changes are deterministic and autofixed
- Zero manual intervention required

## Verification

### ✅ All Checks Pass

```bash
# Prettier formatting
$ pnpm format
✓ All matched files use Prettier code style!

# ESLint (no errors)
$ pnpm lint
✓ Tasks: 3 successful, 3 total
```

### ✅ Pre-Commit Works

```bash
# Staged files are auto-fixed
$ git commit
✓ Gitleaks passed
✓ lint-staged passed
```

### ✅ Import Examples

**Before:**

```typescript
import { Button } from "@atlas/ui";
import Link from "next/link";
```

**After:**

```typescript
import Link from "next/link";

import { Button } from "@atlas/ui";
```

**Before:**

```typescript
import "@atlas/ui/globals.css";
import { Toaster } from "@atlas/ui";
import { Geist } from "next/font/google";
import { MainProvider } from "@/providers";
import type { Metadata } from "next";
```

**After:**

```typescript
import "@atlas/ui/globals.css";

import { Geist } from "next/font/google";

import { Toaster } from "@atlas/ui";

import { MainProvider } from "@/providers";

import type { Metadata } from "next";
```

## Breaking Changes

**None.** This PR is purely additive:

- Existing code quality rules unchanged
- Formatting rules unchanged
- Pre-commit hooks enhanced (not replaced)
- CI checks already existed (now more thorough)

## Migration Guide for Developers

### Immediate Actions Required

**None.** Changes were auto-applied in this PR.

### Going Forward

1. **Install ESLint + Prettier extensions** in your editor (see `docs/formatting-and-imports.md`)
2. **Enable format-on-save** (recommended but optional)
3. **Let pre-commit hooks fix issues** (they run automatically)
4. **Run `pnpm lint:fix`** if you see import warnings

### Common Scenarios

**Scenario:** "I added an import and ESLint complains about order"  
**Solution:** `pnpm lint:fix` (autofix) or save the file (if format-on-save is enabled)

**Scenario:** "Pre-commit is fixing my imports automatically"  
**Solution:** This is expected! Just re-stage and commit.

**Scenario:** "CI failed due to import order"  
**Solution:** Run `pnpm lint:fix` locally, commit, and push.

## Files Changed

### New Files

- `docs/formatting-and-imports.md` — Complete documentation

### Modified Files

- `packages/config/eslint.config.mjs` — Added simple-import-sort rules
- `packages/config/package.json` — Added eslint-plugin-simple-import-sort
- `package.json` — Added eslint-plugin-simple-import-sort to workspace root
- `.prettierignore` — Enhanced ignore patterns
- **84 source files** — Import order normalized (autofixed)

### Configuration Files (No Changes)

- `.prettierrc.json` — Already correct
- `.lintstagedrc.json` — Already correct
- `.husky/pre-commit` — Already correct
- `.github/workflows/ci.yml` — Already correct

## Performance Impact

- **Pre-commit:** No noticeable change (staged files only, same as before)
- **CI:** Slightly faster (simple-import-sort is more efficient than import/order)
- **Editor:** Faster linting (fewer rules to evaluate)

## Testing

### Manual Testing

- ✅ Ran `pnpm lint` — passes
- ✅ Ran `pnpm format` — passes
- ✅ Ran `pnpm typecheck` — passes
- ✅ Tested pre-commit hook — works
- ✅ Verified import sorting across multiple file types

### Automated Testing

- ✅ CI workflow (lint job) — passes
- ✅ CI workflow (format job) — passes

## Future Work (Out of Scope)

- ❌ TypeScript type-checked linting (requires project-aware parsing, slower)
- ❌ Auto-import generation (editor feature, not linter concern)
- ❌ Import cost analysis (VS Code extension handles this)

## References

- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Atlas Formatting Documentation](./docs/formatting-and-imports.md)

## Commit Breakdown

1. `chore(format): add eslint-plugin-simple-import-sort for deterministic imports`
2. `chore(format): configure import sorting rules in ESLint`
3. `chore(format): enhance .prettierignore with missing patterns`
4. `docs(format): add comprehensive formatting and import conventions`
5. `fix(format): normalize imports and formatting across entire repo`

---

**Review Checklist:**

- [x] All ESLint rules are autofixable
- [x] Prettier and ESLint do not conflict
- [x] Pre-commit hooks work correctly
- [x] CI enforces lint + format
- [x] Documentation is complete
- [x] Repo-wide normalization applied
- [x] No breaking changes
- [x] All checks pass locally and in CI
