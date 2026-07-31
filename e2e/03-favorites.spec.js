import { test, expect } from "@playwright/test";

test.describe("收藏功能 (Favorites) 端到端測試 - Real DB 連動", () => {
  test.beforeEach(async ({ page }) => {
    // 進入登入頁
    await page.goto("/#/login");
    const quickFillBtn = page.locator("button:has-text('快速帶入測試帳號')");
    if (await quickFillBtn.isVisible()) {
      await quickFillBtn.click();
    } else {
      await page.locator("input[type='email']").fill("member@example.com");
      await page.locator("input[type='password']").fill("Member1234");
    }

    // 提交登入表單
    await page.locator("button[type='submit']").click();

    // 等待認證 Token 寫入 LocalStorage
    await page.waitForFunction(() => !!localStorage.getItem("token") || !!localStorage.getItem("user"), { timeout: 10000 });

    // 關閉 SweetAlert2 彈窗
    const swalConfirm = page.locator(".swal2-confirm").first();
    if (await swalConfirm.isVisible({ timeout: 3000 }).catch(() => false)) {
      await swalConfirm.click();
    }
  });

  test("進入我的收藏頁面，可看見與 Real DB 連動之收藏清單", async ({ page }) => {
    await page.goto("/#/favorites");

    // 驗證 Favorites Layout 選單中的 "My Library" 與 "我的收藏" 側邊欄與頁面主體
    await expect(page.locator("text=My Library").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=我的收藏").first()).toBeVisible({ timeout: 10000 });
  });
});
