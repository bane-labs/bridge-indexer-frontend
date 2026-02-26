# FAQ

> Common questions answered directly.

---

## General

### Is Atlas open source?

**No.** Atlas is a closed-source internal platform. This documentation describes platform behavior
and patterns for external understanding—onboarding, evaluation, and architectural reference. The
source code is not available.

### Is Atlas a framework or a platform?

**Platform.** A framework gives you tools and lets you decide how to use them. A platform makes
those decisions for you. Atlas is opinionated about patterns, structure, and behavior. You work
within its conventions, not around them.

### Who is Atlas for?

Atlas is for:

- Product teams who want to ship features, not build infrastructure
- Organizations that value consistency over flexibility
- Engineers who believe conventions reduce cognitive load
- Teams building production applications that need to be reliable

Atlas is **not for** teams who want maximum flexibility, minimal opinions, or a thin starting point.

### Can I use Atlas for my project?

Atlas is not a public offering. It's internal tooling that solves specific problems for specific use
cases. This documentation exists to explain what it is and how it works, not to onboard external
users.

---

## Technical

### Why not NextAuth.js?

NextAuth.js is excellent for many use cases. Atlas uses a custom OAuth implementation because:

- **Full control** — Security-critical code benefits from direct ownership
- **Customization** — Specific requirements were easier to meet directly
- **Fewer layers** — Less abstraction means easier debugging
- **PKCE** — Easier to implement correctly without library constraints

The tradeoff is maintenance responsibility. For Atlas, that tradeoff is acceptable.

### Why not tRPC?

tRPC provides end-to-end type safety without code generation—it's a great tool. Atlas doesn't use it
because:

- **REST compatibility** — Atlas must work with existing REST APIs
- **OpenAPI ecosystem** — Many tools understand OpenAPI; fewer understand tRPC
- **Backend independence** — tRPC requires tRPC on the server; Atlas is frontend-first

If the backend were also built from scratch with TypeScript, tRPC would be compelling.

### Why not a CSS-in-JS solution?

CSS-in-JS (styled-components, emotion) offers component-scoped styles with JavaScript. Atlas uses
Tailwind CSS because:

- **Performance** — No runtime style generation
- **Consistency** — Design tokens in one place (CSS custom properties)
- **Tailwind ecosystem** — Widely understood, well-documented
- **v4 direction** — Tailwind v4's CSS-first approach aligns with platform philosophy

The tradeoff is less dynamic styling. For Atlas applications, that's rarely needed.

### Why custom theming instead of next-themes?

next-themes is a solid library. Atlas implements theming directly because:

- **Tailwind v4** — CSS-first configuration doesn't need JavaScript libraries
- **Fewer dependencies** — One less package to maintain
- **Control** — Exact behavior matches platform requirements
- **Understanding** — The team knows exactly how theming works

For most Next.js applications, next-themes is a fine choice.

### Why cookie-based auth instead of tokens in localStorage?

Tokens in localStorage are convenient but vulnerable:

- **XSS exposure** — Any JavaScript can read localStorage
- **No httpOnly** — Can't protect tokens from scripts

Cookies with `httpOnly`, `Secure`, and `SameSite` attributes:

- **Inaccessible to JavaScript** — XSS can't steal tokens
- **Automatic transmission** — Browser handles auth headers

CSRF is a concern, but it's easier to mitigate than XSS.

### Why React Query instead of SWR?

Both are excellent. Atlas uses React Query because:

- **Mutation support** — Better patterns for write operations
- **DevTools** — Helpful for debugging cache behavior
- **Invalidation** — More granular control over cache updates

SWR is simpler and smaller. React Query is more powerful. Atlas needed the power.

---

## Architecture

### Why "frontend-first"?

Traditional architectures treat the frontend as a thin layer that displays what the backend
provides. This model is outdated:

- Frontend complexity has grown enormously
- Most user experience problems manifest in the frontend
- Teams with strong frontend foundations ship faster

"Frontend-first" means the frontend is the primary product surface, and architecture decisions
prioritize that reality.

### Can Atlas work with an existing backend?

Yes. Atlas defines contracts, not implementations. Any backend that conforms to the OpenAPI spec
works. The frontend doesn't care about backend implementation details—only that responses match the
contract.

### Can Atlas be adapted for full-stack applications?

Atlas is designed for frontend applications that consume APIs. It's not a full-stack framework. If
you need server-side business logic beyond authentication and proxying, you'd add a separate backend
service.

### Why a monorepo?

Monorepos simplify code sharing:

- Shared packages without npm publishing
- Consistent tooling across all code
- Atomic changes across packages
- Single source of truth for configuration

The tradeoff is tooling complexity. For Atlas, the benefits outweigh the costs.

---

## Process

### How are decisions made?

Significant technical decisions are documented in Architecture Decision Records (ADRs). Each ADR
captures:

- Context and problem
- Decision made
- Alternatives considered
- Tradeoffs accepted

This creates institutional memory. New team members understand not just what, but why.

### How is documentation maintained?

Documentation is treated as code:

- Changes to patterns require documentation updates
- Pull requests include relevant doc updates
- Documentation is versioned with the codebase

Outdated documentation is worse than no documentation. Atlas invests in keeping it current.

### What's the testing strategy?

Atlas uses a pyramid approach:

- **Unit tests** — Fast, isolated, high coverage for utilities and hooks
- **Component tests** — UI components with rendering tests
- **E2E tests** — Critical paths through Playwright

Tests run in CI. Failing tests block merges.

---

## Philosophy

### Why is accessibility enforced, not suggested?

Accessibility affects more users than you think:

- Users with disabilities (permanent)
- Users with injuries (temporary)
- Users on slow connections (situational)
- Power users who prefer keyboards

Making accessibility a build error means it can't be deferred. The baseline is enforced
automatically; edge cases get manual attention.

### Why are patterns so prescriptive?

Every pattern decision is cognitive load avoided. When the answer to "how should I do X?" is always
the same, developers think about product problems instead of infrastructure choices.

Flexibility has a cost. Consistency has a value. Atlas optimizes for consistency.

### Why is Atlas closed source?

Open source comes with obligations:

- Backward compatibility
- Community management
- Generalization beyond our needs
- Documentation for external consumption

Atlas is built to solve specific problems for specific use cases. Keeping it closed means it can
move fast and stay focused.

### Why document a closed-source platform publicly?

This documentation serves:

- **Onboarding** — New team members understand the platform
- **Evaluation** — Decision-makers can assess fit
- **Architecture reference** — Patterns are documented for recall
- **Interview material** — Technical thinking is demonstrable

The ideas are shareable. The implementation is not.

---

## Miscellaneous

### What does "Atlas" mean?

Atlas is named for the Titan who held up the sky. The platform holds up the application, providing a
stable foundation so the product can focus on what matters.

### How long has Atlas been developed?

Atlas has evolved over time, incorporating lessons from production applications. It's not a
greenfield experiment—it's distilled experience.

### Is Atlas production-ready?

Atlas runs in production. The demo application proves that patterns work. The platform is
battle-tested.

---

## Further Reading

- [Decisions](decisions.md) — Detailed rationale for major choices
- [Architecture](architecture.md) — System design overview
- [Demo](demo.md) — See capabilities in action
