import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
    // Navigate to the sign-in page
    await page.goto("/sign-in");

    // Click the mock login button
    const mockLoginButton = page.locator("#mock-login-button");
    await expect(mockLoginButton).toBeVisible();
    await mockLoginButton.click();

    // Wait for redirection to the home page
    await page.waitForURL("/", { timeout: 60000 });

    // Alternatively, check for a specific element that shows the user is logged in
    // await expect(page.locator("text=Sign Out")).toBeVisible();

    // End of authentication steps.

    await page.context().storageState({ path: authFile });
});
