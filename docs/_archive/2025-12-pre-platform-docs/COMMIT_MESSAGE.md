# Commit Message

feat: implement comprehensive code quality enforcement with ESLint flat config

## Summary

Implemented modern code quality enforcement using ESLint 9 flat config format with TypeScript
type-checking, replacing legacy configuration with a monorepo-optimized setup.

## Key Changes

### ESLint Configuration

- Migrated to ESLint 9 flat config format (eslint.config.mjs)
- Configured typescript-eslint v8 with type-checked rules
- Created shared base config in @atlas/config
- Added package-specific overrides for apps/web and packages/ui
- Resolved monorepo parser configuration issues (projectService vs explicit project)

### Rules & Plugins

- typescript-eslint: Type-safe linting with type-checked rules
- eslint-plugin-unused-imports: Auto-remove unused imports
- eslint-plugin-promise: Proper async/Promise handling
- eslint-plugin-security: Security best practices
- eslint-plugin-import: Import order enforcement
- React/Next.js specific rules (hooks, jsx-a11y)

### Code Fixes

- Fixed all lint violations across apps/web and packages/ui
- Removed unused imports
- Fixed nested ternary expressions
- Updated async function signatures
- Applied nullish coalescing operator where appropriate
- Removed unnecessary type assertions

### Pre-commit Hooks

- Updated lint-staged configuration
- Integrated with existing Husky setup
- Auto-lint and format staged files before commit

### CI/CD

- Updated GitHub Actions workflow
- Added ESLint check to CI pipeline
- Maintained existing Prettier and typecheck jobs

### Documentation

- Created comprehensive CODE_QUALITY.md guide (450+ lines)
- Documented all rules and their rationale
- Added troubleshooting section
- Included migration guide
- Created implementation summary

### TypeScript Configuration

- Updated tsconfig.json includes for apps/web
- Created tsconfig.test.json for test files in packages/ui
- Proper parser configuration per package

## Technical Details

**Monorepo Parser Configuration** Resolved typescript-eslint v8 `projectService` conflicts by using
explicit per-package configuration:

```javascript
{
  languageOptions: {
    parserOptions: {
      projectService: false,
      tsconfigRootDir: __dirname,
      project: "./tsconfig.json",
    },
  },
}
```

**Test File Handling** Created separate tsconfig.test.json to properly include test files without
interfering with main compilation.

## Verification

✅ All packages pass ESLint ✅ All packages pass TypeScript compilation ✅ All files properly
formatted ✅ Pre-commit hooks working ✅ CI workflow updated and passing

## Breaking Changes

None - this is net new functionality that enhances existing quality checks.

## Files Changed

- New: eslint.config.mjs (root)
- New: packages/ui/tsconfig.test.json
- New: docs/CODE_QUALITY.md
- New: CODE_QUALITY_IMPLEMENTATION.md
- Modified: packages/config/eslint.config.mjs (flat config migration)
- Modified: apps/web/eslint.config.mjs (flat config migration)
- Modified: packages/ui/eslint.config.mjs (flat config migration)
- Modified: .lintstagedrc.json
- Modified: .prettierrc.json & .prettierignore
- Modified: .github/workflows/ci.yml
- Modified: All source files (lint fixes)
- Modified: package.json files (added lint scripts and dependencies)

Closes: [Related Issue/PR Number if applicable]
