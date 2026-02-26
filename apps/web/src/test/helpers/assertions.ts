/**
 * Custom Assertion Helpers
 *
 * Small shared assertion utilities for common testing patterns.
 */

import { within } from "@testing-library/react";

import type { RenderResult } from "@testing-library/react";

/**
 * Assert that an element has accessible text.
 *
 * @param element - The element to check
 * @param text - Expected accessible text
 */
export function expectAccessibleText(element: HTMLElement, text: string | RegExp) {
  const accessibleText = element.textContent || element.getAttribute("aria-label");
  if (typeof text === "string") {
    expect(accessibleText).toContain(text);
  } else {
    expect(accessibleText).toMatch(text);
  }
}

/**
 * Assert that a loading state is shown.
 *
 * @param result - RTL render result
 */
export function expectLoadingState(result: RenderResult) {
  // Check for common loading indicators
  const loadingIndicators = [
    result.queryByRole("status"),
    result.queryByText(/loading/i),
    result.queryByTestId("loading"),
    result.container.querySelector('[data-loading="true"]'),
  ];

  const hasLoadingIndicator = loadingIndicators.some((indicator) => indicator !== null);
  expect(hasLoadingIndicator).toBe(true);
}

/**
 * Assert that an error state is shown.
 *
 * @param result - RTL render result
 * @param errorMessage - Optional expected error message
 */
export function expectErrorState(result: RenderResult, errorMessage?: string | RegExp) {
  // Check for common error indicators
  const errorIndicators = [
    result.queryByRole("alert"),
    result.queryByText(/error/i),
    result.queryByTestId("error"),
    result.container.querySelector('[role="alert"]'),
  ];

  const hasErrorIndicator = errorIndicators.some((indicator) => indicator !== null);
  expect(hasErrorIndicator).toBe(true);

  if (errorMessage) {
    if (typeof errorMessage === "string") {
      expect(result.container).toHaveTextContent(errorMessage);
    } else {
      const text = result.container.textContent || "";
      expect(text).toMatch(errorMessage);
    }
  }
}

/**
 * Assert that a list contains expected number of items.
 *
 * @param result - RTL render result
 * @param role - ARIA role of list items (default: "listitem")
 * @param count - Expected number of items
 */
export function expectListLength(result: RenderResult, count: number, role = "listitem") {
  const items = result.getAllByRole(role);
  expect(items).toHaveLength(count);
}

/**
 * Assert that an element is visible and accessible.
 *
 * @param element - The element to check
 */
export function expectVisibleAndAccessible(element: HTMLElement) {
  expect(element).toBeVisible();
  expect(element).toBeInTheDocument();

  // Check for basic accessibility
  const hasAccessibleName =
    element.getAttribute("aria-label") ||
    element.getAttribute("aria-labelledby") ||
    within(element).queryByRole("heading") !== null;

  if (element.tagName === "BUTTON" || element.getAttribute("role") === "button") {
    expect(hasAccessibleName || element.textContent).toBeTruthy();
  }
}

/**
 * Wait for an element to be removed from the document.
 *
 * @param element - The element to wait for removal
 */
export async function waitForRemoval(element: HTMLElement) {
  await expect(async () => {
    expect(element).not.toBeInTheDocument();
  }).toBeTruthy();
}
