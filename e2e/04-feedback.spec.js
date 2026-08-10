import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

test.describe("意見回饋 (Feedback / Contact) 端到端測試 - Real DB & Standalone 連動", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
  });

  test("填寫意見回饋並成功提交至後端 DB / API", async ({ page }) => {
    await page.goto("/#/");

    // 點擊右下角 ContactWidget 按鈕開啟彈窗
    const feedbackBtn = page.getByRole("button", { name: "打開聯絡我們" });
    await expect(feedbackBtn).toBeVisible({ timeout: 10000 });
    await feedbackBtn.click();

    const nameInput = page.locator("input[placeholder*='大名']").first();
    const emailInput = page.locator("input[type='email']").first();
    const messageInput = page.locator("textarea[placeholder*='描述']").first();
    const submitBtn = page.locator("button[type='submit']:has-text('送出表單')").first();

    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });

    await nameInput.fill("E2E 測試員");
    await emailInput.fill("e2e-test@example.com");
    await messageInput.fill("這是一條 Playwright 自動化 E2E 測試意見回饋。");

    await submitBtn.click();

    // 驗證 SweetAlert 成功訊息
    const successToast = page.getByText(/傳送成功|感謝/i).first();
    await expect(successToast).toBeVisible({ timeout: 8000 });
  });
});
