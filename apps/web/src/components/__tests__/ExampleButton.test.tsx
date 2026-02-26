/**
 * Example Component Test
 *
 * Demonstrates:
 * - Using renderWithProviders
 * - Basic component rendering
 * - Accessibility testing
 * - User interactions
 */

import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test";

import { ExampleButton } from "../ExampleButton";

describe("ExampleButton", () => {
  it("renders with accessible button role", () => {
    renderWithProviders(<ExampleButton>Click Me</ExampleButton>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeVisible();
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();

    const { user } = renderWithProviders(
      <ExampleButton onClick={handleClick}>Click Me</ExampleButton>
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    renderWithProviders(<ExampleButton disabled>Disabled</ExampleButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("applies variant styles", () => {
    renderWithProviders(<ExampleButton variant="primary">Primary</ExampleButton>);

    const button = screen.getByRole("button");
    // This is a simple example - adjust based on your actual implementation
    expect(button).toBeInTheDocument();
  });
});
