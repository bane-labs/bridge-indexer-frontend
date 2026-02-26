import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("loads home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Frontend Platform/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /View Demo/i })).toBeVisible();
  });

  test("navigates to demo page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /View Demo/i }).click();
    await expect(page.getByRole("heading", { name: /Atlas Showcase/i })).toBeVisible();
  });

  test("demo page components render", async ({ page }) => {
    await page.goto("/demo");

    // Check if various sections are rendered
    await expect(page.getByRole("heading", { name: /Atlas Showcase/i })).toBeVisible();
    await expect(page.getByText("Demo Mode Active")).toBeVisible();
    await expect(page.getByText("What This Proves")).toBeVisible();
  });

  test("demo page interactions work", async ({ page }) => {
    await page.goto("/demo");

    // Test that navigation links to demo subpages are present
    await expect(page.getByRole("link", { name: /Authentication/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Data Fetching/i })).toBeVisible();

    // Test the Get Started button is present
    await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  });
});
