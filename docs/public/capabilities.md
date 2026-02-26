# Capabilities

> What Atlas solves and why it matters.

---

This document explains Atlas capabilities not as feature lists, but as **problems solved**. Each
section describes a real problem, how Atlas addresses it, and why the approach matters for
production applications.

---

## Developer Experience

### The Problem

Frontend development often means:

- Decisions about patterns on every feature
- Inconsistent approaches across the codebase
- Time spent on infrastructure instead of product
- Tribal knowledge that doesn't scale

Teams end up solving the same problems repeatedly, differently each time.

### Atlas Approach

Atlas provides **opinionated patterns** for common concerns:

- Data fetching follows a single pattern with hooks
- Forms use one validation approach with shared schemas
- Errors normalize to a standard shape
- Components compose in predictable ways

When you join a team using Atlas, you learn the patterns once. Every feature follows the same
structure.

### Why This Matters

Developer velocity comes from **not making decisions**. Every pattern choice costs time and
introduces inconsistency risk. Atlas makes those choices once, correctly, so developers focus on
product logic.

---

## Reliability

### The Problem

Production applications fail in predictable ways:

- API contracts drift between client and server
- Environment variables are missing or misconfigured
- Errors happen silently with no trace
- State management has race conditions

These failures are often discovered in production, after users are affected.

### Atlas Approach

Atlas builds reliability into the platform layer:

- **Typed API contracts** — OpenAPI generates types; mismatches cause compile errors, not runtime
  failures
- **Environment validation** — Missing or invalid configuration fails at build time
- **Error normalization** — All errors become a standard shape with correlation IDs
- **Query caching** — Data fetching has built-in deduplication, retry, and stale handling

Failures surface during development, not deployment.

### Why This Matters

Reliability isn't about never failing—it's about **failing early and traceably**. Atlas moves
failure detection leftward: from production to staging, from staging to CI, from CI to local
development.

---

## Security by Default

### The Problem

Frontend security is often an afterthought:

- Tokens in localStorage are vulnerable to XSS
- Client-side secrets leak to browser
- CSRF protection is inconsistent
- Auth flows have subtle vulnerabilities

Security requires expertise, and mistakes are invisible until exploited.

### Atlas Approach

Atlas makes the secure path the default path:

- **Tokens in httpOnly cookies** — Never accessible to JavaScript
- **PKCE for OAuth** — Protects against authorization code interception
- **Server-side token exchange** — Client never sees raw tokens
- **Environment separation** — Server secrets can't reach the browser
- **Encrypted sessions** — Session data is tamper-proof

The secure implementation isn't opt-in; the insecure implementation isn't possible.

### Why This Matters

Security failures aren't bugs you notice—they're vulnerabilities that get exploited. Atlas removes
entire categories of vulnerabilities by making them architecturally impossible.

---

## Scalability Readiness

### The Problem

Applications that work at small scale fail at larger scale:

- Direct API calls create N+1 problems
- No caching means redundant fetches
- Bundle size grows unboundedly
- Monitoring is added as an afterthought

Retrofitting scalability is expensive and disruptive.

### Atlas Approach

Atlas architecture anticipates scale:

- **Centralized API client** — Single point for caching, batching, optimization
- **Query caching** — Automatic deduplication and stale-while-revalidate
- **Code organization** — Feature modules prevent cross-cutting imports
- **Observability hooks** — Performance tracking built into infrastructure

The patterns that work at small scale also work at large scale.

### Why This Matters

Scale problems are architecture problems. By the time you hit them, changing architecture is costly.
Atlas applies patterns that scale from the start.

---

## Observability

### The Problem

Production debugging is often:

- Searching logs for error messages
- No connection between user reports and system state
- Errors with no context
- Performance issues with no visibility

When something breaks, understanding why takes longer than fixing it.

### Atlas Approach

Atlas provides observability at the platform level:

- **Correlation IDs** — Every request has a traceable identifier
- **Structured errors** — Standard shape with code, message, and context
- **Error tracking integration** — Exceptions flow to Sentry with source maps
- **Performance metrics** — Web Vitals captured automatically
- **Environment-aware** — Development doesn't pollute production dashboards

When users report issues, correlation IDs connect their experience to system traces.

### Why This Matters

Observability is **how you learn about production**. Without it, you're blind to user experience.
Atlas makes observability automatic, not aspirational.

---

## Accessibility

### The Problem

Accessibility is often treated as:

- A checklist item for compliance
- Something to add at the end
- Someone else's responsibility
- Too expensive to retrofit

This leads to applications that exclude users.

### Atlas Approach

Atlas builds accessibility into the platform:

- **Semantic HTML** — Components use proper elements by default
- **Keyboard navigation** — All interactive elements are keyboard-accessible
- **Focus management** — Focus rings are visible, modals trap focus
- **ARIA patterns** — Components implement proper roles and labels
- **Linting** — Accessibility violations cause build errors

Accessibility isn't a feature; it's a baseline.

### Why This Matters

Accessibility affects more users than you think—including users on slow connections, users with
temporary impairments, and power users who prefer keyboards. Atlas makes the accessible approach the
natural approach.

---

## Feature Management

### The Problem

Deploying features has risks:

- All-or-nothing releases
- Can't disable broken features without redeploy
- No way to test in production safely
- Feature state scattered across conditionals

Teams either ship too fast (and break things) or too slow (and miss opportunities).

### Atlas Approach

Atlas provides first-class feature management:

- **Feature flags** — Enable/disable features dynamically
- **Kill switches** — Emergency disable that overrides flags
- **Guard components** — Declarative feature gating in UI
- **Type-safe flags** — Flag names are typed constants

You can deploy code daily and enable features when ready.

### Why This Matters

Feature flags decouple **deployment from release**. Code can ship continuously; features release
when they're ready. Kill switches provide an escape hatch when features misbehave.

---

## Form Handling

### The Problem

Forms are where users and systems meet, and they often fail:

- Client validation doesn't match server validation
- Errors appear in unhelpful ways
- Accessibility is missing
- Server errors don't map back to fields

Forms feel fragile because they often are.

### Atlas Approach

Atlas provides aligned form handling:

- **Shared schemas** — Same validation logic on client and server
- **Field-level errors** — Errors appear next to relevant inputs
- **Server error mapping** — Backend validation surfaces in the UI
- **Accessible by default** — Labels, ARIA attributes, focus management
- **Optimistic updates** — UI responds immediately, reconciles with server

Validation is defined once and enforced everywhere.

### Why This Matters

Forms are high-friction surfaces. Every form bug is a user who might abandon the action. Atlas makes
forms robust by removing the gap between client and server validation.

---

## Theming

### The Problem

Theme implementation often suffers from:

- Flash of wrong theme on load
- Themes that don't persist
- System preference ignored
- Inconsistent color application

Users notice these issues even if they can't articulate them.

### Atlas Approach

Atlas provides correct theming:

- **Pre-render theme application** — Theme class applied before first paint
- **Persistence** — User preference survives sessions
- **System preference** — Respects OS dark mode setting
- **CSS custom properties** — Consistent tokens throughout the application
- **No flash** — Theme is never wrong, even on hard reload

Theming is solved once at the platform level.

### Why This Matters

Theme flash is a paper cut that erodes quality perception. Atlas eliminates it architecturally, not
through clever hacks.

---

## Summary

| Capability           | Problem Solved                             |
| -------------------- | ------------------------------------------ |
| Developer Experience | Consistency and velocity                   |
| Reliability          | Early failure detection                    |
| Security             | Vulnerabilities eliminated architecturally |
| Scalability          | Patterns that work at any scale            |
| Observability        | Production visibility by default           |
| Accessibility        | Inclusion as a baseline                    |
| Feature Management   | Deploy/release decoupling                  |
| Form Handling        | Client/server alignment                    |
| Theming              | Correct behavior without flash             |

These capabilities aren't features—they're **platform properties**. They emerge from architectural
decisions, not bolt-on additions.

---

## Further Reading

- [Architecture](architecture.md) — The system design that enables these capabilities
- [Decisions](decisions.md) — Why we made specific technical choices
- [Demo](demo.md) — See these capabilities in action
