# Documentation Policy

> Keep docs authoritative. Kill duplication. Require ADRs for major decisions.

## Where Documentation Lives

| Type                        | Location             | Examples                            |
| --------------------------- | -------------------- | ----------------------------------- |
| **Platform conventions**    | `docs/how-we-build/` | folder-structure, env, api, testing |
| **Architecture decisions**  | `docs/adr/`          | Why we chose X over Y               |
| **Component docs**          | Storybook            | UI components with examples         |
| **API contracts**           | `openapi/`           | OpenAPI specification               |
| **Quick start**             | Root `README.md`     | Getting started, links              |
| **Historical/experimental** | `docs/_archive/`     | Superseded documentation            |

## Rules

### 1. Single Source of Truth

- Each topic has **one** canonical document
- `docs/how-we-build/` is the authoritative source for conventions
- Don't create alternate docs that cover the same topic

### 2. ADRs for Major Decisions

Create an ADR when you:

- Choose a library over alternatives
- Establish a pattern the team must follow
- Deprecate or replace an existing pattern
- Make a decision that's hard to reverse

### 3. Keep README Minimal

The root `README.md` is a **map, not the territory**:

- Quick start only
- Links to `docs/how-we-build/`
- Links to common tasks
- No long explanations

### 4. Archive, Don't Delete

When documentation becomes outdated:

1. Move to `docs/_archive/[YYYY-MM]-[description]/`
2. Don't modify the archived content
3. Update links in canonical docs
4. Keep git history intact (use `git mv`)

### 5. No Random Markdown at Root

All documentation lives in `docs/`:

- ❌ `/CONTRIBUTING.md`
- ❌ `/ARCHITECTURE.md`
- ✅ `docs/how-we-build/contributing.md`
- ✅ `docs/adr/0001-architecture-decision.md`

Exception: `README.md` at root (required by GitHub).

### 6. Experimental Docs Go to Archive First

AI-generated or experimental documentation:

1. Start in `docs/_archive/[YYYY-MM]-experimental/`
2. Review and validate against codebase
3. If accurate, promote to canonical docs
4. If not, leave archived with a note

### 7. No Infrastructure Without Features

Do not add infrastructure services (Postgres, Redis, etc.) to the default Docker Compose unless:

- A shipped feature or demo requires it
- It's behind a profile (never starts by default)
- It's documented in [local-dev-composition.md](local-dev-composition.md)

Atlas is a pure frontend platform. Keep `pnpm dev` fast.

## Maintaining Documentation

### When Adding a Feature

1. Update relevant `docs/how-we-build/` doc
2. Create ADR if it's a significant pattern change
3. Update Storybook if it involves UI

### When Reviewing PRs

Check that:

- New patterns are documented
- Existing docs are updated if behavior changes
- No duplicate documentation created

### When Docs Conflict

If you find conflicting information:

1. Determine which is correct (check the code)
2. Update canonical doc in `docs/how-we-build/`
3. Archive the outdated version
4. Note the resolution in PR description

## Quick Reference

```
docs/
├── how-we-build/     ← Conventions go here
├── adr/              ← Architecture decisions go here
└── _archive/         ← Old/experimental docs go here
```

**All platform conventions live in `docs/how-we-build/`.**
