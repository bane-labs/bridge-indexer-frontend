/**
 * MSW (Mock Service Worker) Setup for Tests
 *
 * Provides a configured MSW server for intercepting HTTP requests during tests.
 * This allows testing components and hooks that make API calls without hitting real endpoints.
 *
 * NOTE: Currently uses MSW v1 API. Migration to v2 is tracked in follow-up backlog.
 */

import { rest } from "msw";
import { setupServer } from "msw/node";

import { fixtures } from "../fixtures";

/**
 * Default MSW handlers for common API endpoints.
 *
 * These can be overridden per-test using `server.use(...)`.
 */
export const defaultHandlers = [
  // Health check endpoint
  rest.get("*/health", (_req, res, ctx) => {
    return res(ctx.json(fixtures.api.healthSuccess));
  }),

  // Users list endpoint
  rest.get("*/users", (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get("page") || "1");
    const pageSize = parseInt(req.url.searchParams.get("pageSize") || "20");

    return res(ctx.json(fixtures.api.userListSuccess({ page, pageSize })));
  }),

  // User detail endpoint
  rest.get("*/users/:userId", (req, res, ctx) => {
    const { userId } = req.params;
    return res(ctx.json(fixtures.api.userDetailSuccess({ userId: userId as string })));
  }),

  // User create endpoint
  rest.post("*/users", async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(201), ctx.json(fixtures.api.userCreateSuccess(body)));
  }),

  // User update endpoint
  rest.patch("*/users/:userId", async (req, res, ctx) => {
    const { userId } = req.params;
    const body = await req.json();
    return res(
      ctx.json(
        fixtures.api.userUpdateSuccess({
          userId: userId as string,
          updates: body,
        })
      )
    );
  }),

  // User delete endpoint
  rest.delete("*/users/:userId", (_req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

/**
 * MSW server instance.
 * Use this to override handlers per-test.
 */
export const server = setupServer(...defaultHandlers);

/**
 * Setup MSW lifecycle hooks.
 * Call this in your global test setup file (jest.setup.js).
 */
export function setupMSW() {
  // Start server before all tests
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: "warn",
    });
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}
