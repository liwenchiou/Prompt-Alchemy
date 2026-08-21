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

  test("價值區塊捲動到畫面時會觸發 AOS 卡片動畫", async ({ page }) => {
    await page.goto("/#/");

    const valueSection = page.locator("section[data-aos=\"zoom-in-down\"]");
    const leftValueCard = page.locator('[data-aos="fade-down-right"]');
    await leftValueCard.scrollIntoViewIfNeeded();

    await expect(page.locator("body")).toHaveAttribute("data-aos-duration", "1200");
    await expect(valueSection).toHaveClass(/aos-animate/);
    await expect(leftValueCard).toHaveClass(/aos-init/);
    await expect(leftValueCard).toHaveClass(/aos-animate/);
  });

  test("街機背景會顯示一批 20 顆豆子且不攔截操作", async ({ page }) => {
    await page.goto("/#/");

    const background = page.locator(".pacman-background");
    await expect(background).toBeVisible();
    await expect(background).toHaveCSS("pointer-events", "none");
    await expect(background.locator(".pacman-background-dot")).toHaveCount(20);
    await expect(background.locator(".pacman-background-character")).toBeVisible();

    const dotPositions = await background.locator(".pacman-background-dot").evaluateAll((dots) =>
      dots.map((dot) => ({ left: dot.style.left, top: dot.style.top })),
    );
    for (let index = 1; index < dotPositions.length; index += 1) {
      expect(
        dotPositions[index].left === dotPositions[index - 1].left ||
          dotPositions[index].top === dotPositions[index - 1].top,
      ).toBe(true);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(background.locator(".pacman-background-dot")).toHaveCount(20);
  });

  test("真實資料庫 Seed 資料 (Prompt 卡片) 成功載入並可點擊查看明細", async ({ page }) => {
    await page.goto("/#/");

    // 搜尋卡片標題
    const promptCard = page.locator('[data-tour="featured-prompts"] article, article').first();
    await expect(promptCard).toBeVisible({ timeout: 10000 });

    const titleBtn = promptCard.locator('button').first();
    await titleBtn.dispatchEvent("click");

    // 驗證導向詳情頁
    await expect(page).toHaveURL(/.*skills.*/);
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
