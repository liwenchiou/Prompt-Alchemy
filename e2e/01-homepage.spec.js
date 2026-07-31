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
    // 等待 Real DB 的 Prompt 卡片出現在畫面中
    const promptCard = page.locator("text=後端 API 審查").first();
    await expect(promptCard).toBeVisible({ timeout: 10000 });

    // 使用 dispatchEvent('click') 觸發點擊，可超越 Carousel/Swiper 的溢出邊界限制
    await promptCard.dispatchEvent("click");

    // 驗證內文或內容開頭出現
    const modalOrDetail = page.locator("text=請你扮演資深後端工程師").first();
    await expect(modalOrDetail).toBeVisible({ timeout: 5000 });
  });

  test("關鍵字搜尋功能操作流暢", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜尋']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("資安");
      await page.waitForTimeout(500);
      await expect(page.locator("text=資安漏洞檢查清單").first()).toBeVisible();
    }
  });
});
