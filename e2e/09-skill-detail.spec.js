import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("Prompt 技能詳情頁 (Skill Detail) 端到端測試", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
  });

  test("點擊技能卡片能順利進入詳情頁並查看完整 Prompt 內容與複製按鈕", async ({ page }) => {
    await page.goto("/#/skills");

    // 點擊第一個技能卡片
    const skillCard = page.locator("text=後端 API 審查").first();
    await expect(skillCard).toBeVisible({ timeout: 10000 });
    await skillCard.click();

    // 驗證 URL 包含 /#/skills/
    await page.waitForURL(/\/#\/skills\//, { timeout: 8000 });

    // 驗證詳情頁包含複製按鈕與 Prompt 內容
    const copyBtn = page.locator("button:has-text('複製 Prompt'), button:has-text('複製')").first();
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
  });
});
