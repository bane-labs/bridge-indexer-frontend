# Dependency Update Automation

This document explains how Atlas manages dependency updates using Renovate.

## Why Renovate?

Renovate automates dependency updates with fine-grained control over scheduling, grouping, and PR
management. Unlike Dependabot, Renovate offers superior monorepo support, pnpm workspace handling,
and advanced grouping strategies that reduce PR noise while keeping dependencies current and secure.

## What Gets Updated

Renovate monitors and updates:

- **npm/pnpm dependencies**: All packages in `package.json` files across the monorepo (root,
  `apps/*`, `packages/*`)
- **GitHub Actions**: Workflow action versions in `.github/workflows/*.yml`
- **Docker images**: Base images in `Dockerfile` and `Dockerfile.devcontainer`
- **Lockfile maintenance**: Weekly `pnpm-lock.yaml` optimization and deduplication

## Update Cadence and PR Limits

To avoid disrupting development while keeping dependencies fresh:

- **Schedule**: Updates run after 10 PM and before 5 AM on weekdays, plus all day on weekends
  (Asia/Kolkata timezone)
- **PR limits**: Maximum of 5 concurrent PRs and 2 PRs per hour
- **Security updates**: Bypass schedule and are created immediately
- **Lockfile maintenance**: Runs Monday mornings before 5 AM

## Grouping Strategy

Renovate groups related dependencies to reduce PR volume and improve reviewability:

| Group                      | Includes                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js ecosystem**      | `next`, `react`, `react-dom`, `@next/*`, `eslint-config-next`                                                                       |
| **TypeScript and types**   | `typescript`, `ts-node`, `ts-jest`, `tsx`, `@types/*`                                                                               |
| **Linting and formatting** | `eslint*`, `prettier*`, `typescript-eslint`, `lint-staged`, `husky`                                                                 |
| **Testing**                | `jest*`, `@testing-library/*`, `@playwright/test`, `vitest`                                                                         |
| **Radix UI components**    | `@radix-ui/*`                                                                                                                       |
| **Tailwind CSS**           | `tailwindcss`, `tailwind-merge`, `tailwindcss-animate`, `@tailwindcss/*`, `class-variance-authority`, `prettier-plugin-tailwindcss` |
| **Tooling and build**      | `turbo`, `@turbo/*`, `postcss`, `autoprefixer`                                                                                      |
| **TanStack Query**         | `@tanstack/react-query*`                                                                                                            |
| **GitHub Actions**         | All action version updates (minor/patch grouped, major separate)                                                                    |
| **Docker base images**     | Docker base image updates (minor/patch grouped, major separate)                                                                     |

## Major Version Updates

Major version updates are handled with extra care:

- **Always separate**: Major updates never group with other changes
- **Clear labeling**: Tagged with `deps:major` and `needs-review`
- **Extra context**: PR descriptions include warnings and review checklists
- **Manual review required**: Major updates require explicit approval and thorough testing

When reviewing a major update PR:

1. Check the release notes and changelog
2. Look for migration guides and breaking changes
3. Verify test coverage for affected functionality
4. Test locally before merging
5. Consider the blast radius across the monorepo

## Security Updates

Security updates are prioritized:

- Bypass scheduling restrictions (created immediately)
- Labeled with `security` and `priority`
- Should be reviewed and merged ASAP
- Follow responsible disclosure practices

## Managing Renovate

### View the Dependency Dashboard

Renovate creates a [Dependency Dashboard](https://github.com/thedanielmark/atlas/issues) issue in
the repository. This dashboard shows:

- Pending updates
- Rate-limited updates
- Ignored dependencies
- Configuration errors

### Pause Updates Temporarily

To pause all updates (e.g., during a feature freeze):

**Option 1: Close the Dependency Dashboard**

- Close the Renovate dashboard issue
- Renovate will pause until you reopen it

**Option 2: Edit renovate.json**

```json
{
  "enabled": false
}
```

### Ignore a Specific Package

To prevent Renovate from updating a specific package, add it to `ignoreDeps`:

```json
{
  "ignoreDeps": ["package-name"]
}
```

### Ignore Specific Versions

To block a problematic version while allowing other updates:

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["next"],
      "allowedVersions": "!15.0.0"
    }
  ]
}
```

### Pin a Dependency to a Version Range

To limit a package to a specific major version:

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["react"],
      "allowedVersions": "<19.0.0"
    }
  ]
}
```

### Change Update Schedule

To adjust the update window, modify the `schedule` array in `renovate.json`:

```json
{
  "schedule": ["after 10pm every weekday", "before 5am every weekday", "every weekend"]
}
```

See [Renovate schedule presets](https://docs.renovatebot.com/presets-schedule/) for options.

## Workflow Integration

Renovate PRs are validated by the same CI pipeline as human-authored PRs:

- Repository policies (lockfile checks)
- Environment variable validation
- Linting and formatting
- TypeScript type checking
- Unit tests
- Build verification
- E2E tests

All checks must pass before a Renovate PR can be merged.

## Enabling Renovate

Renovate is configured but requires activation:

1. Visit the [Renovate GitHub App](https://github.com/apps/renovate)
2. Click "Install" or "Configure"
3. Select `thedanielmark/atlas` from your repositories
4. Grant necessary permissions
5. Renovate will create a Dependency Dashboard issue and begin scanning

Once enabled, Renovate runs:

- On its configured schedule
- When configuration changes are pushed
- When the Dependency Dashboard is updated

## Troubleshooting

### No PRs appearing

- Check the [Dependency Dashboard](https://github.com/thedanielmark/atlas/issues) for errors
- Verify Renovate is enabled for the repository
- Check if you're within the PR rate limits
- Ensure the schedule allows updates at the current time

### Too many PRs

- Reduce `prConcurrentLimit` or `prHourlyLimit`
- Add more aggressive grouping rules
- Adjust the schedule to a narrower window

### PR check failures

Renovate PRs must pass all CI checks. Common issues:

- **Lockfile out of sync**: Renovate should update this automatically; check logs
- **Type errors**: Major updates may introduce breaking types
- **Test failures**: Update may break functionality; investigate and fix

## Resources

- [Renovate Documentation](https://docs.renovatebot.com/)
- [Renovate Configuration Options](https://docs.renovatebot.com/configuration-options/)
- [Renovate GitHub App](https://github.com/apps/renovate)
- [Atlas Dependency Dashboard](https://github.com/thedanielmark/atlas/issues) (created after
  Renovate is enabled)
