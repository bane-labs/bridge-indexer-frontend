# Release Workflow

This document describes how Atlas manages versioning and releases using
[Changesets](https://github.com/changesets/changesets).

## Overview

- **Release Strategy**: Monorepo with independent package versioning
- **Publish Target**: GitHub tags + releases only (packages are private)
- **Automation**: Changesets GitHub Action creates Version PRs and releases

## Packages Under Version Control

| Package         | Path              | Description                                              |
| --------------- | ----------------- | -------------------------------------------------------- |
| `@atlas/ui`     | `packages/ui`     | Shared UI component library                              |
| `@atlas/config` | `packages/config` | Shared linting, formatting, and TypeScript configuration |

> **Note**: `@atlas/web` (the main application) is excluded from versioning as it's a deployment
> target, not a consumable package.

## When to Add a Changeset

### ✅ Required

Add a changeset for any change that:

- Adds a new feature to a package
- Fixes a bug in a package
- Introduces a breaking change
- Updates the public API of a component or utility
- Changes behavior that consumers depend on

### ⏭️ Not Required

Skip changesets for:

- Documentation-only changes
- Internal tooling updates (CI, build scripts)
- Test-only changes
- Changes to `@atlas/web` (excluded from versioning)
- Refactors that don't change public APIs

## How to Create a Changeset

### Step 1: Run the changeset command

```bash
pnpm changeset
```

### Step 2: Select affected packages

Use arrow keys and space to select packages that your PR changes:

```
🦋  Which packages would you like to include?
◯ @atlas/config
◉ @atlas/ui
```

### Step 3: Choose the bump type

```
🦋  Which packages should have a major bump?
🦋  Which packages should have a minor bump?
🦋  Which packages should have a patch bump?
```

| Type      | When to Use                         | Example                                   |
| --------- | ----------------------------------- | ----------------------------------------- |
| **patch** | Bug fixes, small improvements       | "Fixed button hover state"                |
| **minor** | New features (backwards compatible) | "Added new Tooltip component"             |
| **major** | Breaking changes                    | "Renamed Button `size` prop to `variant`" |

### Step 4: Write a summary

```
🦋  Please enter a summary for this change:
```

Write a clear, user-facing description:

```
Added new DatePicker component with full keyboard navigation support
```

### Step 5: Commit the changeset file

A new file will be created in `.changeset/`:

```
.changeset/happy-lions-dance.md
```

Commit this file with your PR.

## Changeset File Format

```markdown
---
"@atlas/ui": minor
---

Added new DatePicker component with full keyboard navigation support
```

Multiple packages can be included:

```markdown
---
"@atlas/ui": minor
"@atlas/config": patch
---

Added ESLint rules for new DatePicker component accessibility
```

## Release Process

### Automatic Version PR

When changesets are merged to `main`:

1. The **Release** workflow detects pending changesets
2. Opens/updates a PR titled "chore(release): version packages"
3. This PR contains:
   - Version bumps in `package.json` files
   - Updated `CHANGELOG.md` files
   - Consumed changeset files

### Creating a Release

When the Version PR is merged:

1. Git tags are created (e.g., `@atlas/ui@1.2.0`)
2. GitHub Releases are published with changelog content
3. Changeset files are removed (already consumed)

## Useful Commands

```bash
# Create a new changeset
pnpm changeset

# Preview what versions would be bumped
pnpm changeset:status

# Apply version bumps locally (CI does this)
pnpm changeset:version
```

## Breaking Changes

For breaking changes, include migration instructions:

````markdown
---
"@atlas/ui": major
---

**BREAKING**: Renamed `Button` component's `size` prop to `variant`

### Migration

Before:

```tsx
<Button size="large">Click me</Button>
```
````

After:

```tsx
<Button variant="large">Click me</Button>
```

````

## FAQ

### My PR doesn't need a changeset, but CI is asking for one?

If your change genuinely doesn't need a changeset (docs, tests, tooling), add `[skip changeset]` to your PR title or ensure no files in `packages/` were modified.

### Can I have multiple changesets in one PR?

Yes! Run `pnpm changeset` multiple times if you have distinct changes worth separate changelog entries.

### What if I forget to add a changeset?

The Version PR won't include your changes. You can add a changeset in a follow-up PR.

### How do I know what version a package is at?

Check the package's `package.json` or run:

```bash
pnpm changeset:status
````
