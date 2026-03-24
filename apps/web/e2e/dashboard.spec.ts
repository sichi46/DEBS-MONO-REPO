import { test, expect } from "@playwright/test";

// Helper to login before each test
async function login(page: any) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("john.mwape@example.com");
  await page.getByLabel(/password/i).fill("User1234!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("displays the dashboard overview", async ({ page }) => {
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    // Click on "My Policies" in sidebar
    await page.getByRole("link", { name: /my policies/i }).click();
    await expect(page).toHaveURL(/policies/);

    // Click on "Claims"
    await page.getByRole("link", { name: /claims/i }).click();
    await expect(page).toHaveURL(/claims/);
  });

  test("logout redirects to login", async ({ page }) => {
    await page.getByText(/logout/i).click();
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });
});
