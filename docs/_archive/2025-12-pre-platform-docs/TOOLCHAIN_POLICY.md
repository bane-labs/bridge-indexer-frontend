# Toolchain Policy

## Overview

Atlas enforces **pnpm** as the only supported package manager. This is a hard requirement—npm, yarn,
and bun are not supported and will be rejected at install time and in CI.

## Why pnpm Only?

This policy exists to ensure:

1. **Deterministic Builds**: A single package manager eliminates lockfile conflicts and ensures
   identical dependency resolution across all environments (local, CI, production).

2. **Efficient Disk Usage**: pnpm's content-addressable storage significantly reduces disk usage in
   monorepos, making local development faster and CI caching more effective.

3. **Reproducibility**: Enforcing one tool prevents subtle bugs caused by different package managers
   resolving dependencies differently.

4. **Team Consistency**: All engineers, contractors, and CI systems use the exact same toolchain,
   eliminating "works on my machine" issues related to package manager differences.

This is not about personal preference—it's about operational discipline for a long-lived,
enterprise-grade platform.

## How to Bootstrap the Repository

### Prerequisites

- **Node.js ≥ 22.0.0** (required)
- **Corepack** (built into Node.js ≥ 20, no separate install needed)

### First-Time Setup

1. **Enable Corepack** (activates pnpm):

   ```bash
   corepack enable
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

Corepack will automatically download and use the exact pnpm version specified in `package.json`
(`packageManager` field). You don't need to install pnpm globally.

### Daily Workflow

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Enforcement Mechanisms

Atlas uses **defense in depth** to ensure compliance:

### 1. Local Guard (Fail Fast)

A `preinstall` script ([scripts/ensure-pnpm.js](../scripts/ensure-pnpm.js)) runs before any package
manager attempts to install dependencies:

- Detects which package manager was invoked via `npm_config_user_agent`
- Exits with a clear error message if not pnpm
- Provides actionable instructions to fix the issue

**Example error output:**

```
╔═════════════════════════════════════════════════════════════════════╗
║                   PACKAGE MANAGER VIOLATION                         ║
╚═════════════════════════════════════════════════════════════════════╝

✗ Detected package manager: npm
✓ Required package manager: pnpm

WHY THIS MATTERS:
Atlas enforces pnpm to ensure consistent dependency resolution,
reproducible builds, and efficient disk usage across all environments.

HOW TO FIX:
1. Enable Corepack:
   corepack enable

2. Install dependencies using pnpm:
   pnpm install
```

### 2. Lockfile Policy

Only `pnpm-lock.yaml` is allowed in the repository:

- **`.gitignore` blocks** `package-lock.json`, `yarn.lock`, and `bun.lockb`
- **CI checks** fail if forbidden lockfiles are detected
- **Git hooks** (via husky) can optionally prevent commits containing forbidden lockfiles

### 3. CI Enforcement (Authoritative)

The [CI workflow](.github/workflows/ci.yml) is the final enforcement layer:

**Forbidden Lockfile Check:**

```yaml
- name: Check for forbidden lockfiles
  run: |
    if [ -f "package-lock.json" ] || [ -f "yarn.lock" ] || [ -f "bun.lockb" ]; then
      echo "❌ Forbidden lockfiles detected"
      exit 1
    fi
```

**Frozen Lockfile Install:**

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

The `--frozen-lockfile` flag ensures:

- CI fails if `pnpm-lock.yaml` is out of sync with `package.json`
- No implicit dependency updates during CI runs
- Builds are 100% reproducible

### 4. Package Manager Pinning

The root `package.json` declares:

```json
{
  "packageManager": "pnpm@10.19.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=10.0.0"
  }
}
```

When Corepack is enabled, it will:

- Download and use **exactly** pnpm 10.19.0
- Warn if running a different version locally
- Ensure all developers and CI use the same pnpm version

## Troubleshooting

### "I accidentally ran `npm install` and now I have a `package-lock.json`"

**Fix:**

```bash
# Remove forbidden lockfile
rm package-lock.json

# Clean node_modules (optional but recommended)
rm -rf node_modules

# Reinstall with pnpm
pnpm install
```

### "Corepack is not enabled and pnpm is not found"

**Fix:**

```bash
corepack enable
pnpm install
```

### "I'm getting a different pnpm version than expected"

**Fix:**

```bash
# Disable any globally installed pnpm
npm uninstall -g pnpm
yarn global remove pnpm

# Let Corepack manage pnpm
corepack enable
corepack prepare pnpm@10.19.0 --activate

# Verify
pnpm --version  # Should output 10.19.0
```

### "CI is failing with lockfile out of sync"

This means your `pnpm-lock.yaml` doesn't match your `package.json` changes.

**Fix:**

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
git push
```

### "Can I use npm/yarn for just one package?"

**No.** This is a monorepo-wide policy. All packages must use pnpm. Mixing package managers creates
lockfile conflicts and defeats the purpose of this policy.

## What If I Really Need Another Package Manager?

You don't. This policy is non-negotiable for Atlas.

If you believe you have a legitimate technical reason to deviate:

1. Document the exact use case and technical justification
2. Propose an alternative solution that maintains reproducibility
3. Escalate to the platform engineering team

In practice, pnpm supports all standard npm/yarn workflows. Most perceived limitations are
unfamiliarity, not actual technical blockers.

## References

- [pnpm Documentation](https://pnpm.io/)
- [Corepack Documentation](https://nodejs.org/api/corepack.html)
- [Why pnpm? (Official Rationale)](https://pnpm.io/motivation)

---

**Policy Version**: 1.0  
**Last Updated**: December 20, 2025  
**Owner**: Platform Engineering Team
