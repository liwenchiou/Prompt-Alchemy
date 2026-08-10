import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

const uniqueQuestion = `E2E FAQ ${Date.now()}`;
const updatedAnswer = "E2E 更新後的 FAQ 回答";

test.describe("@requires-chromium @requires-admin-api FAQ 管理", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);
    await page.goto("/#/admin/login");
    await page.getByRole("button", { name: /快速帶入/ }).click();
    await page.getByRole("button", { name: /登入/ }).click();
    await expect(page).toHaveURL(/#\/admin\/skills/);
  });

  test("可新增、搜尋、編輯、下架與恢復 FAQ", async ({ page }) => {
    let created = false;

    try {
      await page.goto("/#/admin/faqs");
      await expect(page.locator("h1:has-text('FAQ 管理'), div:has-text('FAQ 管理')").first()).toBeVisible();

      await page.getByRole("button", { name: "新增 FAQ" }).click();
      const dialog = page.getByRole("dialog", { name: "新增 FAQ" });
      await dialog.getByLabel("問題 *").fill(uniqueQuestion);
      await dialog.getByLabel("回答 *").fill("E2E FAQ 初始回答");
      await dialog.getByLabel("排序序號 *").fill("99");
      await dialog.getByRole("button", { name: "儲存" }).click();

      const search = page.getByRole("searchbox", { name: "搜尋 FAQ" });
      await search.fill(uniqueQuestion);
      await expect(page.getByText(uniqueQuestion).first()).toBeVisible();
      created = true;

      await page.getByRole("button", { name: "編輯" }).first().click();
      const editDialog = page.getByRole("dialog", { name: "編輯 FAQ" });
      await editDialog.getByLabel("回答 *").fill(updatedAnswer);
      await editDialog.getByLabel("排序序號 *").fill("98");
      await editDialog.getByRole("button", { name: "儲存" }).click();
      await expect(page.getByText(updatedAnswer).first()).toBeVisible();

      await page.getByRole("button", { name: "下架" }).first().click();
      await page.getByRole("button", { name: "確定" }).click();
      await expect(page.getByText("未啟用").first()).toBeVisible();

      await page.getByRole("button", { name: "恢復發布" }).first().click();
      await page.getByRole("button", { name: "確定" }).click();
      await expect(page.getByText("啟用").first()).toBeVisible();
    } finally {
      if (created) {
        await page.goto("/#/admin/faqs");
        const search = page.getByRole("searchbox", { name: "搜尋 FAQ" });
        if (await search.isVisible().catch(() => false)) {
          await search.fill(uniqueQuestion);
          const downButton = page.getByRole("button", { name: "下架" }).first();
          if (await downButton.isVisible().catch(() => false)) {
            await downButton.click();
            await page.getByRole("button", { name: "確定" }).click();
          }
        }
      }
    }
  });
});
