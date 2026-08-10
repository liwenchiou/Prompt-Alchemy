import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("後台驗證 (Admin Auth) 端到端測試 - Real DB & Standalone 連結", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
  });

  test("管理者使用真實/測試帳號成功登入進入後台", async ({ page }) => {
    await page.goto("/#/admin/login");

    // 驗證管理者登入頁元素
    await expect(page.locator("text=管理者登入").first()).toBeVisible();

    // 點擊快速帶入管理者帳號 (admin@example.com / Admin1234)
    const quickFillBtn = page.locator("button:has-text('快速帶入管理者帳號')");
    if (await quickFillBtn.isVisible()) {
      await quickFillBtn.click();
    } else {
      await page.locator("input[type='email']").fill("admin@example.com");
      await page.locator("input[type='password']").fill("Admin1234");
    }

    // 點擊登入
    await page.locator("button[type='submit']").click();

    // 驗證跳轉至後台技能管理頁 /#/admin/skills
    await page.waitForURL(/\/#\/admin\/skills/, { timeout: 10000 });
    await expect(page.locator("text=Prompt / Skill 管理").first()).toBeVisible({ timeout: 8000 });
  });

  test("未登入時直接存取後台受保護路由，會被 ProtectedRoute 阻擋並引導至登入頁", async ({ page }) => {
    // 清除 LocalStorage Token
    await page.goto("/#/");
    await page.evaluate(() => localStorage.clear());

    // 嘗試未登入存取 /#/admin/skills
    await page.goto("/#/admin/skills");

    // 驗證自動被重導向至 /#/admin/login
    await page.waitForURL(/\/#\/admin\/login/, { timeout: 10000 });
    await expect(page.locator("text=管理者登入").first()).toBeVisible();
  });
});
