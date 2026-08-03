import { test, expect } from "@playwright/test";

test.describe("首頁 (Homepage) 端到端測試 - Real DB 連結", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/");
  });

  test("頁面標題與 Header 元素載入正常", async ({ page }) => {
    await expect(page).toHaveTitle(/Prompt/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("真實資料庫 Seed 資料 (Prompt 卡片) 成功載入並可點擊查看明細", async ({ page }) => {
    const promptCard = page.locator("text=後端 API 審查").first();
    await expect(promptCard).toBeVisible({ timeout: 10000 });

    await promptCard.scrollIntoViewIfNeeded();
    await promptCard.click();

    const modalOrDetail = page.locator("text=請你扮演資深後端工程師").first();
    await expect(modalOrDetail).toBeVisible({ timeout: 5000 });
  });

  test("關鍵字搜尋功能操作流暢", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜尋']").first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill("資安");
    await expect(page.locator("text=資安漏洞檢查清單").first()).toBeVisible({ timeout: 5000 });
  });
});
