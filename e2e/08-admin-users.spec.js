import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("後台會員管理 (Admin Users) 端到端測試", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);

    // 管理者登入
    await page.goto("/#/admin/login");
    const quickFillBtn = page.locator("button:has-text('快速帶入管理者帳號')");
    if (await quickFillBtn.isVisible()) {
      await quickFillBtn.click();
    } else {
      await page.locator("input[type='email']").fill("admin@example.com");
      await page.locator("input[type='password']").fill("Admin1234");
    }
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/#\/admin\/skills/, { timeout: 10000 });
  });

  test("順利進入會員管理頁面並載入會員表格與角色篩選選單", async ({ page }) => {
    await page.goto("/#/admin/users");
    await expect(page.locator("text=會員管理").first()).toBeVisible({ timeout: 8000 });

    // 驗證標題與按鈕
    await expect(page.locator("button:has-text('+ 新增會員')").first()).toBeVisible();

    // 驗證表格標題
    await expect(page.locator("th:has-text('名稱')").first()).toBeVisible();
    await expect(page.locator("th:has-text('Email')").first()).toBeVisible();
    await expect(page.locator("th:has-text('角色')").first()).toBeVisible();
  });

  test("點擊『+ 新增會員』開啟 Modal 視窗", async ({ page }) => {
    await page.goto("/#/admin/users");
    const addBtn = page.locator("button:has-text('+ 新增會員')").first();
    await addBtn.click();

    // 驗證出現 Modal
    const modalTitle = page.locator("text=新增會員").first();
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
  });
});
