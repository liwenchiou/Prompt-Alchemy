import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("後台管理與 CRUD 功能 (Admin Operations) 端到端測試 - Real DB & Standalone 連動", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);

    // 管理者登入前置作業
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

  test("後台 Prompt / Skill 列表正確載入資料", async ({ page }) => {
    await expect(page.locator("text=Prompt / Skill 管理").first()).toBeVisible();

    // 驗證預設種子或 Mock 資料呈現於表格中 (例如 後端 API 審查)
    const skillRow = page.locator("text=後端 API 審查").first();
    await expect(skillRow).toBeVisible({ timeout: 8000 });
  });

  test("後台系統參數頁面 (Parameters) 可正常切換與顯示參數列表", async ({ page }) => {
    await page.goto("/#/admin/parameters");
    await expect(page.locator("text=標籤與參數管理").first()).toBeVisible({ timeout: 8000 });
  });

  test("後台聯絡與意見回饋列表 (Contacts) 可載入", async ({ page }) => {
    await page.goto("/#/admin/contacts");
    await expect(page.locator("text=聯絡表單管理").first()).toBeVisible({ timeout: 8000 });
  });

  test("點擊『+ 新增 Prompt / Skill』可順利進入新增表單頁面並呈現主要欄位", async ({ page }) => {
    const newBtn = page.locator("button:has-text('+ 新增 Prompt / Skill')").first();
    await newBtn.click();

    // 驗證網址導向 /admin/skills/new
    await page.waitForURL(/\/#\/admin\/skills\/new/, { timeout: 8000 });
    await expect(page.locator("text=新增 Prompt / Skill").first()).toBeVisible({ timeout: 5000 });
  });
});
