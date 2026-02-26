````markdown
# Local Dev Composition Pattern

> Atlas is a pure frontend platform—no infrastructure required for local development.

## Quick Start

```bash
# This is all you need:
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

**No Docker, no database, no Redis.** Atlas runs entirely in the browser and communicates with
external APIs.

## Why This Document Exists

While Atlas itself requires no infrastructure, teams building **consumer apps** on top of Atlas may
need:

- PostgreSQL for application data
- Redis for caching or sessions
- Other services (message queues, object storage, etc.)

This document explains how to add infrastructure **when you need it**, without polluting the default
developer experience.

## The Scaffold

Atlas includes a Docker Compose scaffold at the repository root:

```
docker-compose.yml          # Base scaffold (no services by default)
examples/compose/infra.yml  # Infrastructure example for consumer apps
```

### Validating the Setup

```bash
# Check compose syntax
pnpm compose:check

# Run sanity test (starts/stops a minimal container)
pnpm compose:sanity
```

## Do / Don't

| ✅ DO                                         | ❌ DON'T                                            |
| --------------------------------------------- | --------------------------------------------------- |
| Keep Atlas dev fast (`pnpm dev` only)         | Add DB/Redis to default compose                     |
| Use profiles to opt-in to infrastructure      | Require Docker for basic frontend work              |
| Document infrastructure in consumer app repos | Commit `.env.local` with real credentials           |
| Put infra behind `--profile infra`            | Make `docker compose up` start services by default  |
| Use the examples as templates                 | Modify `docker-compose.yml` to add default services |

## For Consumer Apps: Adding Infrastructure

### Option A: Copy and Extend

1. Copy `examples/compose/infra.yml` to your consumer app repo
2. Merge the services into your `docker-compose.yml`
3. Add environment variables to `.env.local`:

```bash
# .env.local
DATABASE_URL=postgresql://atlas:atlas_dev_password@localhost:5432/atlas_dev
REDIS_URL=redis://:redis_dev_password@localhost:6379
```

4. Start infrastructure:

```bash
docker compose --profile infra up -d
```

### Option B: Compose File Layering

Use multiple compose files without copying:

```bash
# Start infrastructure from the example
docker compose -f docker-compose.yml -f examples/compose/infra.yml \
  --profile infra up -d

# View combined configuration
docker compose -f docker-compose.yml -f examples/compose/infra.yml config
```

### Option C: Separate Infrastructure Repo

For complex setups, maintain infrastructure in a dedicated repository:

```bash
# In a separate terminal/repo
cd ~/infra/local-dev
docker compose up -d

# Your Atlas-based app connects via localhost ports
```

## Profiles Strategy

We use Docker Compose profiles to keep infrastructure opt-in:

| Profile  | Purpose                                | Command                              |
| -------- | -------------------------------------- | ------------------------------------ |
| `sanity` | Validate compose works                 | `docker compose --profile sanity up` |
| `infra`  | Database + cache (from example)        | `docker compose --profile infra up`  |
| `debug`  | Additional debugging tools (if needed) | `docker compose --profile debug up`  |

**Default behavior:** Running `docker compose up` without a profile starts nothing.

## Environment Variables

When using infrastructure services, add connection strings to `.env.local`:

```bash
# PostgreSQL (from examples/compose/infra.yml)
DATABASE_URL=postgresql://atlas:atlas_dev_password@localhost:5432/atlas_dev

# Redis (from examples/compose/infra.yml)
REDIS_URL=redis://:redis_dev_password@localhost:6379
```

### Credential Security

- **Never commit real credentials** to version control
- Use dev-only passwords in local compose files
- Production credentials should come from secrets management (Vault, AWS Secrets Manager, etc.)
- The example uses obvious dev passwords (`atlas_dev_password`) intentionally

## If Atlas Becomes Full-Stack Later

Should Atlas evolve to include backend functionality, here's how to add infrastructure properly:

### 1. Evaluate the Need

- Is this a platform-level feature (needed by all consumer apps)?
- Or is this consumer-app-specific?

If platform-level, continue. If consumer-specific, document but don't add to Atlas core.

### 2. Add Services Behind Profiles

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    profiles:
      - infra # Never runs by default
      - backend # Alternative profile name
    # ... configuration
```

### 3. Update Environment Validation

If the service is required for certain features, update `apps/web/src/schemas/env/`:

```typescript
// server-runtime-config.ts
export const serverRuntimeConfig = z.object({
  // Only required when running with backend features
  DATABASE_URL: z.string().url().optional(),
});
```

### 4. Document the Change

Create an ADR explaining:

- Why infrastructure is now required
- Which features depend on it
- How to run without it (if possible)

### 5. Keep Default Fast

Even with backend services, `pnpm dev` should:

- Start immediately (within seconds)
- Work without Docker running
- Gracefully degrade if services are unavailable

## Troubleshooting

### "Port already in use"

```bash
# Check what's using the port
lsof -i :5432

# Stop conflicting containers
docker compose --profile infra down

# Or use different ports in your compose override
```

### "Container won't start"

```bash
# Check container logs
docker compose --profile infra logs postgres

# Verify healthcheck status
docker compose --profile infra ps
```

### "Connection refused" from app

1. Verify container is running: `docker compose --profile infra ps`
2. Check you're using `localhost`, not `postgres` (outside compose network)
3. Verify `.env.local` has correct connection string
4. Wait for healthcheck to pass (may take 10-15s on first start)

## Related Documentation

- [Environment Variables](env.md) — How to add and validate env vars
- [Folder Structure](folder-structure.md) — Where code lives
- [examples/compose/infra.yml](../../examples/compose/infra.yml) — Infrastructure template

## Quick Reference

```bash
# Check compose config
pnpm compose:check

# Validate Docker Compose works
pnpm compose:sanity

# Get help on infrastructure
pnpm infra:help

# Start infrastructure (consumer apps)
docker compose -f docker-compose.yml -f examples/compose/infra.yml \
  --profile infra up -d

# Stop infrastructure
docker compose --profile infra down

# Reset infrastructure (delete data)
docker compose --profile infra down -v
```
````
