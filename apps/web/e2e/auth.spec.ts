import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /create your account/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("invalid@test.com");
    await page.getByLabel(/password/i).fill("WrongPassword1");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Should show an error toast or message
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("john.mwape@example.com");
    await page.getByLabel(/password/i).fill("User1234!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test("register link navigates to register page", async ({ page }) => {
    await page.goto("/login");
    await page.getByText(/create an account/i).click();
    await expect(page).toHaveURL(/register/);
  });

  test("login link from register navigates back", async ({ page }) => {
    await page.goto("/register");
    await page.getByText(/login/i).click();
    await expect(page).toHaveURL(/login/);
  });
});
