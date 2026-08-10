import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("Agent Skills 瀏覽/搜尋/詳情 端到端測試", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
  });

  test("列表頁載入時顯示已上架的 Agent Skill 卡片", async ({ page }) => {
    await page.goto("/#/agent-skills");

    await expect(page.getByText("frontend-design").first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("lazy-senior").first()).toBeVisible();
  });

  test("關鍵字搜尋能正確篩選結果，找不到時顯示提示訊息", async ({ page }) => {
    await page.goto("/#/agent-skills");

    const searchInput = page.locator(
      "input[placeholder*='搜尋 Agent Skill']"
    );
    await expect(searchInput).toBeVisible();

    await searchInput.fill("frontend");
    await expect(page.getByText("frontend-design").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("lazy-senior")).toHaveCount(0);

    await searchInput.fill("不存在的技能關鍵字 XYZ");
    await expect(
      page.getByText("沒有找到符合條件的 Agent Skill").first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("關鍵字搜尋也能比對 repoOwner，不只比對 name/intro", async ({
    page,
  }) => {
    await page.goto("/#/agent-skills");

    const searchInput = page.locator(
      "input[placeholder*='搜尋 Agent Skill']"
    );
    await expect(searchInput).toBeVisible();

    // liwenchiou 是 lazy-senior 的 repoOwner，不是它的 name/intro 內容
    await searchInput.fill("liwenchiou");
    await expect(page.getByText("lazy-senior").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("frontend-design")).toHaveCount(0);
  });

  test("依分類篩選只顯示該分類的 Agent Skill", async ({ page }) => {
    await page.goto("/#/agent-skills");

    await expect(page.getByText("frontend-design").first()).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: "後端開發" }).click();

    await expect(page.getByText("lazy-senior").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("frontend-design")).toHaveCount(0);
  });

  test("點擊卡片可進入詳情頁並顯示完整 metadata", async ({ page }) => {
    await page.goto("/#/agent-skills");

    const card = page.getByText("frontend-design").first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();

    await page.waitForURL(/\/#\/agent-skills\//, { timeout: 8000 });

    // 只驗證不論真實資料庫或 Mock 都一定存在的欄位（name/creator/repo/category），
    // 避免耦合到可能因真實 Seed 資料而變動的 license/intro 內容。
    await expect(
      page.getByRole("heading", { name: "/frontend-design" })
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("anthropics").first()).toBeVisible();
    await expect(page.getByText("anthropics/skills").first()).toBeVisible();
    await expect(page.getByText("前端開發")).toBeVisible();
  });

  test("詳情頁固定路由（Mock 資料）能完整顯示 name/creator/license/來源 repo/分類", async ({
    page,
  }) => {
    await page.goto("/#/agent-skills/agent-skill-uuid-0001-0000-000000000001");

    await expect(
      page.getByRole("heading", { name: "/frontend-design" })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("anthropics").first()).toBeVisible();
    await expect(page.getByText("MIT").first()).toBeVisible();
    await expect(page.getByText("anthropics/skills")).toBeVisible();
    await expect(page.getByText("前端開發")).toBeVisible();
    await expect(page.getByTestId("skill-intro")).toContainText(
      "打造有記憶點的前端視覺設計指引。"
    );
  });

  test("尚未同步 GitHub metadata 時，詳情頁摘要區塊 fallback 顯示 intro", async ({
    page,
  }) => {
    await page.goto("/#/agent-skills/agent-skill-uuid-0002-0000-000000000002");

    const excerptSection = page.getByTestId("skill-excerpt");
    await expect(excerptSection).toBeVisible({ timeout: 10000 });
    await expect(excerptSection).toContainText("極簡主義工程師思維指南。");
  });

  const DOC_URL =
    "https://raw.githubusercontent.com/example-org/doc-url-demo-repo/main/SKILL.md";

  test("docUrl 存在時，詳情頁直接 fetch 並渲染 README/SKILL.md 原始內容", async ({
    page,
  }) => {
    await page.route(DOC_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "# doc-url-demo\n\n這是從 raw.githubusercontent.com 直接抓回來的 SKILL.md 原始內容。",
      });
    });

    await page.goto("/#/agent-skills/agent-skill-uuid-0003-0000-000000000003");

    const docContent = page.getByTestId("skill-doc-content");
    await expect(docContent).toBeVisible({ timeout: 10000 });
    await expect(docContent).toContainText(
      "這是從 raw.githubusercontent.com 直接抓回來的 SKILL.md 原始內容。"
    );
    await expect(page.getByTestId("skill-excerpt-fallback")).toHaveCount(0);
  });

  test("docUrl fetch 失敗時，詳情頁摘要區塊 fallback 顯示 intro", async ({
    page,
  }) => {
    await page.route(DOC_URL, async (route) => {
      await route.fulfill({ status: 404, body: "Not Found" });
    });

    await page.goto("/#/agent-skills/agent-skill-uuid-0003-0000-000000000003");

    const fallback = page.getByTestId("skill-excerpt-fallback");
    await expect(fallback).toBeVisible({ timeout: 10000 });
    await expect(fallback).toContainText(
      "備用摘要（docUrl 抓取失敗時 fallback 顯示）。"
    );
    await expect(page.getByTestId("skill-doc-content")).toHaveCount(0);
  });
});
