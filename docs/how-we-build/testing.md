# Testing

> Use `renderWithProviders`. Mock the network, not the hooks.

## The Rules

| Rule                           | Enforcement                      |
| ------------------------------ | -------------------------------- |
| **Use `renderWithProviders`**  | It includes all providers        |
| **Mock APIs with MSW**         | Not React Query internals        |
| **Use fixtures for responses** | Not inline mock data             |
| **Use factories for entities** | Deterministic test data          |
| **Query by accessibility**     | Role, label, text — not test IDs |

## Setup

```
src/test/
├── helpers/
│   ├── render.tsx          # renderWithProviders
│   ├── reactQuery.ts       # Test query client
│   └── router.ts           # Next.js router mocks
├── fixtures/               # API response shapes
├── factories/              # Entity factories
├── setup/
│   ├── msw.ts              # MSW server
│   └── env.ts              # Test environment
└── index.ts                # Central exports
```

## Basic Component Test

```tsx
import { renderWithProviders } from "@/test";
import { screen } from "@testing-library/react";

test("renders user name", async () => {
  const { user } = renderWithProviders(<UserProfile userId="123" />);

  // Wait for async content
  expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();

  // Interact
  await user.click(screen.getByRole("button", { name: /edit/i }));
});
```

## renderWithProviders

The primary test helper. Wraps component with all necessary providers.

```tsx
import { renderWithProviders } from "@/test";

const { user, queryClient } = renderWithProviders(<MyComponent />, {
  // Optional: initial route
  route: "/users/123",
  searchParams: { tab: "settings" },

  // Optional: feature flags
  featureFlags: { new_dashboard: true },
});

// user — for simulating interactions
await user.click(button);

// queryClient — for cache inspection
const data = queryClient.getQueryData(["users"]);
```

## Fixtures vs Factories

### Fixtures — API Response Shapes

Use for **consistent API responses**:

```typescript
import { fixtures } from "@/test";

// Success response
server.use(
  http.get("*/users/:id", () => {
    return HttpResponse.json(fixtures.api.userDetailSuccess());
  })
);

// Error response
server.use(
  http.get("*/users/:id", () => {
    return HttpResponse.json(fixtures.errors.error404, { status: 404 });
  })
);
```

### Factories — Entity Generation

Use for **generating test data**:

```typescript
import { userFactory, projectFactory } from "@/test";

// Single entity
const user = userFactory.build();

// With overrides
const admin = userFactory.build({ email: "admin@example.com" });

// Multiple entities
const users = userFactory.buildList(5);

// Related entities
const project = projectFactory.build({ ownerId: user.id });
```

## MSW (Mock Service Worker)

Default handlers are already set up. Override per-test when needed:

```typescript
import { server } from '@/test';
import { http, HttpResponse } from 'msw';

test('handles loading error', async () => {
  server.use(
    http.get('*/users', () => {
      return HttpResponse.json({ error: 'Failed' }, { status: 500 });
    })
  );

  renderWithProviders(<UserList />);

  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
```

## Query Priority

Use these queries in order (most to least preferred):

1. **Role** — `getByRole('button', { name: /submit/i })`
2. **Label** — `getByLabelText('Email')`
3. **Placeholder** — `getByPlaceholderText('Search...')`
4. **Text** — `getByText('Welcome')`
5. **Test ID** — `getByTestId('submit-btn')` ← Last resort

## Common Patterns

### Loading State

```typescript
test('shows loading spinner', async () => {
  server.use(
    http.get('*/users', async () => {
      await new Promise(r => setTimeout(r, 100));
      return HttpResponse.json([]);
    })
  );

  renderWithProviders(<UserList />);

  expect(screen.getByRole('status')).toBeInTheDocument();
  await screen.findByText('No users');
});
```

### Form Submission

```typescript
test('submits form', async () => {
  const { user } = renderWithProviders(<CreateUserForm />);

  await user.type(screen.getByLabelText(/name/i), 'John');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText(/created/i)).toBeInTheDocument();
});
```

### Error State

```typescript
test('displays validation error', async () => {
  server.use(
    http.post('*/users', () => {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid email' },
        { status: 400 }
      );
    })
  );

  const { user } = renderWithProviders(<CreateUserForm />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid/i);
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/test";

test("useUser fetches user data", async () => {
  const { result } = renderHook(() => useUser("user-1"), {
    wrapper: createQueryWrapper(),
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toMatchObject({ id: "user-1" });
});
```

## What Not To Do

```typescript
// ❌ Query by test ID first
screen.getByTestId("submit-button");

// ❌ Mock React Query hooks
jest.mock("@tanstack/react-query");

// ❌ Inline mock data
server.use(http.get("*", () => HttpResponse.json({ id: 1, name: "Test" })));

// ❌ Use getBy for async content
screen.getByText("Loading..."); // Use findBy instead

// ❌ Not awaiting user events
user.click(button); // Missing await
```

```typescript
// ✅ Query by role
screen.getByRole("button", { name: /submit/i });

// ✅ Mock the API layer
server.use(http.get("*/users", () => HttpResponse.json(fixtures.users)));

// ✅ Use findBy for async
await screen.findByText("Welcome");

// ✅ Await user events
await user.click(button);
```

## Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# Specific file
pnpm test src/features/users/UserList.test.tsx

# E2E tests
pnpm test:e2e
```

## Troubleshooting

| Problem                 | Solution                                      |
| ----------------------- | --------------------------------------------- |
| "Not wrapped in act"    | Use `await` with user events and `findBy`     |
| Test timeout            | Using `getBy` for async content? Use `findBy` |
| MSW not intercepting    | Check URL pattern matches request             |
| Router mock not working | Call `resetRouterMocks()` in `beforeEach`     |

## Related

- [Jest Config](../../jest.config.js)
- [Jest Setup](../../jest.setup.js)
