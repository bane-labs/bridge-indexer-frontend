import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("loads home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Frontend Platform/i })).toBeVisible();
  });
});
