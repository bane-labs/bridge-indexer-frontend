/**
 * Test Utilities Index
 *
 * Central export for all test utilities, helpers, fixtures, and factories.
 * Import from this file in your tests.
 *
 * @example
 * ```ts
 * import { renderWithProviders, userFactory, fixtures } from '@/test';
 * ```
 */

// Helpers
export * from "./helpers/assertions";
export * from "./helpers/reactQuery";
export * from "./helpers/render";
export * from "./helpers/router";

// Fixtures
export * from "./fixtures";

// Factories
export * from "./factories";

// Setup
export * from "./setup/env";
export * from "./setup/msw";
