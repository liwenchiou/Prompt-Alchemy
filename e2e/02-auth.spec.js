import { test, expect } from "@playwright/test";

test.describe("會員驗證 (Auth) 端到端測試 - Real DB 登入與權限驗證", () => {
  test("測試會員使用真實 Seed 帳號成功登入與登出", async ({ page }) => {
    // 進入登入頁面
    await page.goto("/#/login");

    // 驗證登入表單
    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']");
    const quickFillBtn = page.locator("button:has-text('快速帶入測試帳號')");

    // 使用快速帶入功能帶入 member@example.com / Member1234
    if (await quickFillBtn.isVisible()) {
      await quickFillBtn.click();
    } else {
      await emailInput.fill("member@example.com");
      await passwordInput.fill("Member1234");
    }

    // 點擊登入按鈕
    await page.locator("button[type='submit']").click();

    // 登入後自動跳轉回到首頁 /#/
    await page.waitForURL(/\/#\/?$/, { timeout: 10000 });

    // 驗證 LocalStorage 存入真實 JWT Token
    const token = await page.evaluate(() => localStorage.getItem("auth_token") || localStorage.getItem("token"));
    expect(token).toBeTruthy();

    // 登出流程測試（若 Header 有登出按鈕或選單）
    const userMenuOrLogout = page.locator("button:has-text('登出'), a:has-text('登出')").first();
    if (await userMenuOrLogout.isVisible()) {
      await userMenuOrLogout.click();
      await page.waitForTimeout(500);
      const tokenAfterLogout = await page.evaluate(() => localStorage.getItem("auth_token") || localStorage.getItem("token"));
      expect(tokenAfterLogout).toBeFalsy();
    }
  });

  test("輸入錯誤密碼時顯示提示訊息", async ({ page }) => {
    await page.goto("/#/login");

    await page.locator("input[type='email']").fill("member@example.com");
    await page.locator("input[type='password']").fill("WrongPassword123");
    await page.locator("button[type='submit']").click();

    // 驗證錯誤提示出現
    const errorMsg = page.locator("text=email 或密碼錯誤").first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});
