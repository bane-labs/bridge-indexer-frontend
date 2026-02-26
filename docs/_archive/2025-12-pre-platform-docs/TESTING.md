# Testing Patterns Guide

This guide documents the standardized testing patterns and utilities for Atlas.

## Overview

Atlas uses a comprehensive test harness with:

- **Test Runner**: Jest with ts-jest
- **React Testing**: React Testing Library (RTL)
- **API Mocking**: MSW (Mock Service Worker)
- **Factories**: Fishery for deterministic test data
- **Fixtures**: Pre-defined API response shapes

All shared test utilities live in `src/test/`.

## Quick Start

```tsx
import { renderWithProviders, userFactory, fixtures } from "@/test";

test("renders user list", async () => {
  const { user } = renderWithProviders(<UserList />);

  // Data is automatically mocked via MSW
  expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();

  // Interact with the component
  await user.click(screen.getByRole("button", { name: /add user/i }));
});
```

## Directory Structure

```
src/test/
├── helpers/
│   ├── render.tsx           # renderWithProviders (THE KEY HELPER)
│   ├── reactQuery.ts        # React Query test utilities
│   ├── router.ts            # Next.js router mocks
│   └── assertions.ts        # Custom assertion helpers
├── fixtures/
│   └── api/                 # API response fixtures
│       └── index.ts
├── factories/
│   ├── user.factory.ts      # User factory
│   ├── project.factory.ts   # Project factory
│   └── index.ts
├── setup/
│   ├── msw.ts              # MSW server setup
│   └── env.ts              # Test environment config
└── index.ts                # Central exports
```

## Core Patterns

### 1. Component Testing with renderWithProviders

**Use this for all component tests.** It wraps your component with all necessary providers.

```tsx
import { renderWithProviders } from "@/test";

test("component renders correctly", async () => {
  const { user, queryClient } = renderWithProviders(<MyComponent />);

  // Assertions
  expect(screen.getByRole("heading")).toHaveTextContent("My Component");

  // User interactions
  await user.click(screen.getByRole("button"));

  // Inspect React Query cache if needed
  const data = queryClient.getQueryData(["my-key"]);
  expect(data).toEqual(expectedData);
});
```

**With router mocks:**

```tsx
renderWithProviders(<MyComponent />, {
  route: "/users/123",
  searchParams: { tab: "settings" },
});
```

### 2. Hook Testing

For testing custom React Query hooks:

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/test";

test("useUser hook fetches user data", async () => {
  const { result } = renderHook(() => useUser("user-1"), {
    wrapper: createQueryWrapper(),
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toMatchObject({
    id: "user-1",
    email: "alice@example.com",
  });
});
```

### 3. Fixtures vs Factories

**When to use Fixtures:**

- API responses (success and error states)
- Consistent, predictable data across tests
- Error shapes that match your API contract

```tsx
import { fixtures } from "@/test";

// Use in MSW handlers
server.use(
  http.get("*/users/:userId", () => {
    return HttpResponse.json(fixtures.api.userDetailSuccess());
  })
);

// Or directly in assertions
expect(error).toEqual(fixtures.errors.error404);
```

**When to use Factories:**

- Generating multiple test objects
- Customizing data per test
- Building complex object graphs

```tsx
import { userFactory, projectFactory } from "@/test";

// Single object with defaults
const user = userFactory.build();

// Override properties
const admin = userFactory.build({ email: "admin@example.com" });

// Multiple objects
const users = userFactory.buildList(5);

// Use in tests
const project = projectFactory.build({
  name: "Test Project",
  ownerId: user.id,
});
```

### 4. MSW for API Mocking

MSW intercepts HTTP requests at the network level.

**Default handlers are already set up** for common endpoints. Override per-test when needed:

```tsx
import { server, fixtures } from "@/test";
import { http, HttpResponse } from "msw";

test("handles error state", async () => {
  // Override the default handler for this test
  server.use(
    http.get("*/users/:userId", () => {
      return HttpResponse.json(fixtures.errors.error404, { status: 404 });
    })
  );

  renderWithProviders(<UserProfile userId="missing" />);

  expect(await screen.findByText(/not found/i)).toBeInTheDocument();
});
```

**When NOT to use MSW:**

- Simple unit tests of pure functions
- Tests that don't involve API calls
- Tests where you mock the API client directly

### 5. Router Mocking

Router mocks are automatically set up globally. Use helpers to customize:

```tsx
import { setMockPathname, setMockSearchParams, mockRouterState } from "@/test";

test("navigates on button click", async () => {
  setMockPathname("/users");

  const { user } = renderWithProviders(<Navigation />);

  await user.click(screen.getByRole("link", { name: /settings/i }));

  expect(mockRouterState.push).toHaveBeenCalledWith("/settings");
});
```

## Testing Recipes

### Recipe: Component with Loading State

```tsx
import { renderWithProviders, server } from "@/test";
import { http, HttpResponse } from "msw";

test("shows loading state while fetching", async () => {
  // Delay the response
  server.use(
    http.get("*/users", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return HttpResponse.json(fixtures.api.userListSuccess());
    })
  );

  renderWithProviders(<UserList />);

  expect(screen.getByRole("status")).toBeInTheDocument();

  // Wait for data to load
  expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
```

### Recipe: Form Submission

```tsx
test("submits user form", async () => {
  const { user } = renderWithProviders(<UserForm />);

  await user.type(screen.getByLabelText(/name/i), "John Doe");
  await user.type(screen.getByLabelText(/email/i), "john@example.com");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  // Wait for success message
  expect(await screen.findByText(/user created/i)).toBeInTheDocument();
});
```

### Recipe: Error Handling

```tsx
test("displays error message on API failure", async () => {
  server.use(
    http.post("*/users", () => {
      return HttpResponse.json(fixtures.errors.error400, { status: 400 });
    })
  );

  const { user } = renderWithProviders(<UserForm />);

  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Please check your input and try again."
  );
});
```

### Recipe: Mutation with Cache Invalidation

```tsx
test("invalidates query cache after mutation", async () => {
  const { user, queryClient } = renderWithProviders(<UserList />);

  // Wait for initial load
  await screen.findByText("Alice Johnson");

  // Trigger mutation
  await user.click(screen.getByRole("button", { name: /delete/i }));

  // Verify cache was invalidated
  await waitFor(() => {
    const queries = queryClient.getQueryCache().findAll({ queryKey: ["users"] });
    expect(queries[0].state.isInvalidated).toBe(true);
  });
});
```

## Best Practices

### ✅ DO

- Use `renderWithProviders` for all component tests
- Use `screen` queries from RTL (not destructured from render)
- Wait for async changes with `findBy*` or `waitFor`
- Test user-facing behavior, not implementation details
- Use factories for generating test data
- Use MSW for API mocking (not manual fetch mocking)
- Reset mocks in `beforeEach` for test isolation

### ❌ DON'T

- Query by class names or test IDs (prefer accessible queries)
- Use `getBy*` for elements that appear asynchronously (use `findBy*`)
- Mock internal React Query hooks (mock the API layer instead)
- Test internal component state (test the rendered output)
- Create one-off API mocks inline (use fixtures and MSW)
- Share state between tests

## Query Priority

Use RTL queries in this order (most to least preferred):

1. **Accessible queries** (role, label, placeholder, text)

   - `getByRole`
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries**

   - `getByAltText`
   - `getByTitle`

3. **Last resort**
   - `getByTestId` (only when nothing else works)

## Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/components/UserList.test.tsx
```

## Troubleshooting

### Tests timing out

- Check if you're using `getBy*` instead of `findBy*` for async elements
- Verify MSW handlers are set up correctly
- Ensure React Query retry is disabled (it is by default in test client)

### "Not wrapped in act(...)" warnings

- Use `await` with user interactions: `await user.click(...)`
- Use `findBy*` queries instead of `getBy*` for async content
- Wrap state updates in `waitFor`

### MSW handlers not working

- Verify the request URL matches the handler pattern
- Check the MSW server is started in `jest.setup.js`
- Use `server.listen({ onUnhandledRequest: 'warn' })` to see unhandled requests

### Router mocks not working

- Ensure `resetRouterMocks()` is called in `beforeEach`
- Check that `next/navigation` is mocked in `jest.setup.js`
- Verify you're using the correct router import (App Router vs Pages Router)

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Fishery Factory Docs](https://github.com/thoughtbot/fishery)
- [Jest Documentation](https://jestjs.io/)
