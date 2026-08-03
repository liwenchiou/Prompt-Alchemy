import { test, expect } from "@playwright/test";

test.describe("意見回饋 (Feedback / Contact) 端到端測試 - Real DB 連動", () => {
  test("填寫意見回饋並成功提交至後端 DB", async ({ page }) => {
    await page.goto("/#/");

    const feedbackBtn = page.locator("button:has-text('回饋'), button:has-text('聯絡'), a:has-text('回饋'), [data-pencil-name*='Feedback']").first();
    if (await feedbackBtn.isVisible()) {
      await feedbackBtn.click();
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }

    const nameInput = page.locator("input[name='name'], input[placeholder*='姓名']").first();
    const emailInput = page.locator("input[name='email'], input[placeholder*='Email']").first();
    const messageInput = page.locator("textarea[name='message'], textarea[placeholder*='意見'], textarea[placeholder*='內容']").first();
    const submitBtn = page.locator("button[type='submit']:has-text('送出'), button:has-text('送出回饋')").first();

    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });

    await nameInput.fill("E2E 測試員");
    await emailInput.fill("e2e-test@example.com");
    await messageInput.fill("這是一條 Playwright 自動化 E2E 測試意見回饋。");

    await submitBtn.click();

    const successToast = page.locator("text=成功, text=感謝, text=已送出").first();
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });
});
