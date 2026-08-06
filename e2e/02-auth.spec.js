import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("會員驗證 (Auth) 端到端測試 - Real DB & Standalone 連結", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
  });

  test("測試會員使用 Seed 帳號成功登入與登出", async ({ page }) => {
    await page.goto("/#/login");

    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']");
    const quickFillBtn = page.locator("button:has-text('快速帶入測試帳號')");

    if (await quickFillBtn.isVisible()) {
      await quickFillBtn.click();
    } else {
      await emailInput.fill("member@example.com");
      await passwordInput.fill("Member1234");
    }

    await page.locator("button[type='submit']").click();

    await page.waitForURL(/\/#\/?$/, { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem("auth_token") || localStorage.getItem("token"));
    expect(token).toBeTruthy();

    const userMenuOrLogout = page.locator("button:has-text('登出'), a:has-text('登出')").first();
    if (await userMenuOrLogout.isVisible()) {
      await userMenuOrLogout.click();
      await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("auth_token") || localStorage.getItem("token"));
      }, { timeout: 5000 }).toBeFalsy();
    }
  });

  test("輸入錯誤密碼時顯示提示訊息", async ({ page }) => {
    await page.goto("/#/login");

    await page.locator("input[type='email']").fill("member@example.com");
    await page.locator("input[type='password']").fill("WrongPassword123");
    await page.locator("button[type='submit']").click();

    const errorMsg = page.getByText(/email 或密碼錯誤|登入失敗/i).first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});
