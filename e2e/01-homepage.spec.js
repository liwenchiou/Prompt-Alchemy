import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("首頁 (Homepage) 端到端測試 - Real DB & Standalone 連結", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
  });

  test("頁面標題與 Header 元素載入正常", async ({ page }) => {
    await page.goto("/#/");
    await expect(page).toHaveTitle(/Prompt|Alchemy|鍊金坊/i);
    await expect(page.locator("nav, header, [role='navigation']").first()).toBeVisible();
  });

  test("真實資料庫 Seed 資料 (Prompt 卡片) 成功載入並可點擊查看明細", async ({ page }) => {
    await page.goto("/#/");

    // 搜尋卡片標題
    const promptCard = page.locator("text=後端 API 審查").first();
    await expect(promptCard).toBeVisible({ timeout: 10000 });

    await promptCard.dispatchEvent("click");

    const modalOrDetail = page.locator("text=請你扮演資深後端工程師").first();
    await expect(modalOrDetail).toBeVisible({ timeout: 5000 });
  });

  test("常見問題載入 API 資料並維持單一展開", async ({ page }) => {
    await page.goto("/#/");

    const faqRegion = page.getByRole("region", { name: "常見問題" });
    await faqRegion.scrollIntoViewIfNeeded();

    const firstQuestion = faqRegion.getByRole("button", { name: "Prompt 鍊金坊是什麼？" });
    const secondQuestion = faqRegion.getByRole("button", { name: "沒有註冊帳號也可以瀏覽 Prompt 嗎？" });

    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");

    await secondQuestion.click();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
  });

  test("關鍵字搜尋功能操作流暢 (技能頁面)", async ({ page }) => {
    await page.goto("/#/skills");

    const searchInput = page.locator("input[placeholder*='搜尋']");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("後端");
    await expect(page.locator("text=後端 API 審查").first()).toBeVisible();

    await searchInput.fill("不存在的測試關鍵字 XYZ");
    await expect(page.locator("text=沒有找到符合條件的 Prompt").first()).toBeVisible();
  });
});
