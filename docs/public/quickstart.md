# Quickstart

> What to expect when you run Atlas for the first time.

---

## Overview

Atlas is a complete frontend platform, not a minimal starter. When you run it, you get:

- A Next.js application with TypeScript strict mode
- A shared UI component library
- Configured tooling (linting, testing, type checking)
- A demo application that exercises every platform pattern

This guide describes the experience of exploring Atlas, not the step-by-step commands for internal
development.

---

## Prerequisites

Atlas requires:

- **Node.js 22+** — For modern JavaScript features and performance
- **pnpm** — Package manager with workspace support

These choices are intentional. Atlas uses a soft monorepo structure, and pnpm's workspace features
are essential for managing shared packages.

---

## First Launch

When Atlas starts for the first time:

1. **Dependencies install** — pnpm resolves the full dependency graph across workspaces
2. **Environment validates** — The platform verifies all required configuration is present
3. **Development server starts** — Next.js App Router serves the application

The application launches at `http://localhost:3000`.

---

## What You'll See

### Home Page

The landing page provides navigation into the application. If authentication is configured, you'll
see sign-in options.

### Demo Section (`/demo`)

This is where Atlas proves itself. Navigate to `/demo` to find:

| Route                 | What It Demonstrates                                  |
| --------------------- | ----------------------------------------------------- |
| `/demo/auth`          | OAuth flow, session management, server-side rendering |
| `/demo/data`          | API contracts, loading states, error handling         |
| `/demo/form`          | Validation with client-server alignment               |
| `/demo/flags`         | Feature toggles and kill switches                     |
| `/demo/observability` | Error tracking with correlation                       |
| `/demo/a11y-theme`    | Theming and accessibility patterns                    |

Each page is interactive. Click through states, trigger errors intentionally, toggle themes—the demo
is designed to be explored.

---

## Demo Mode

The demo section operates in **mock mode**:

- Data is stored in-memory
- No external backend is required
- State resets on server restart

This makes it safe to experiment without affecting anything real.

---

## Exploring App States

The data demo at `/demo/data` is particularly instructive. It shows how Atlas handles the four
fundamental states of any data operation:

| State       | What You See                                    |
| ----------- | ----------------------------------------------- |
| **Loading** | Skeleton placeholders that match content layout |
| **Empty**   | Designed empty state, not just blank space      |
| **Error**   | Structured error display with correlation ID    |
| **Success** | Rendered data with proper styling               |

You can force different states via URL parameters:

- `/demo/data?mode=success` — Returns sample data
- `/demo/data?mode=empty` — Returns empty array
- `/demo/data?mode=error` — Returns a 500 error
- `/demo/data?mode=slow` — Simulates network latency

This lets you verify that every state is handled intentionally.

---

## Authentication Flow

Visit `/demo/auth` to see the authentication pattern in action:

1. **Signed out state** — Sign-in button with provider options
2. **OAuth redirect** — Platform handles the authorization code flow
3. **Session created** — User information available client and server-side
4. **Session display** — SSR-safe rendering without hydration mismatches

Authentication uses secure cookies—tokens never touch the browser's JavaScript context.

---

## Theming

The `/demo/a11y-theme` page demonstrates theming:

1. **Theme toggle** — Switch between light, dark, and system modes
2. **Persistence** — Your choice survives page reloads
3. **No flash** — Theme applies before first paint

Try switching themes and reloading the page. There's no flash of the wrong theme.

---

## Keyboard Navigation

While on any demo page, try navigating with just your keyboard:

- **Tab** moves between interactive elements
- **Enter/Space** activates buttons
- **Escape** closes modals and menus
- **Arrow keys** navigate within menus

Focus indicators are always visible. This isn't a feature—it's a baseline expectation.

---

## Developer Tools

If you're running Atlas in development mode:

- **React Query Devtools** — Inspect cache state, queries, and mutations
- **Storybook** — Component explorer at `http://localhost:6006`
- **TypeScript** — Errors surface in your editor in real-time

These tools are development-only and don't ship to production.

---

## What Comes Next

After exploring the demo, you'll have a mental model of how Atlas applications behave:

- Data operations follow consistent state patterns
- Authentication is handled at the platform level
- Forms validate against shared schemas
- Features can be toggled without deployment
- Errors are tracked with context for debugging
- Accessibility is enforced, not optional

See [Demo](demo.md) for detailed documentation of each demo page.

See [Architecture](architecture.md) for the system design that enables these behaviors.
