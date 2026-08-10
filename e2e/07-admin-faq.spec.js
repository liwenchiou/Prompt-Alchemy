import { test, expect } from "@playwright/test";
import { setupMockApiRoutes } from "./helpers/mockApi";

const uniqueQuestion = `E2E FAQ ${Date.now()}`;
const updatedAnswer = "E2E 更新後的 FAQ 回答";

test.describe("@requires-chromium @requires-admin-api FAQ 管理", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApiRoutes(page);

    // 這支測試會跑完整的新增/編輯/下架/恢復流程，若讓 setupMockApiRoutes 預設的
    // 「真實後端可用就直接轉發」邏輯生效，每次執行都會在正式後端留下一筆 FAQ
    // （軟刪除也無法真正清除）。這裡改用完全自包含、跑在記憶體裡的假資料狀態機，
    // 不管真實後端有沒有開都不寫入真實 DB。
    const store = new Map();

    await page.route("**/admin/faqs**", async (route) => {
      const req = route.request();
      const method = req.method();
      const url = new URL(req.url());
      const idMatch = url.pathname.match(/\/admin\/faqs\/([^/]+)\/?$/);

      const fulfillJson = (status, body) =>
        route.fulfill({
          status,
          contentType: "application/json",
          body: JSON.stringify(body),
        });

      if (method === "GET" && !idMatch) {
        await fulfillJson(200, {
          status: "success",
          data: Array.from(store.values()),
        });
        return;
      }

      if (method === "POST") {
        const body = JSON.parse(req.postData() || "{}");
        const id = `e2e-faq-${store.size + 1}`;
        const now = new Date().toISOString();
        const item = {
          id,
          question: body.question,
          answer: body.answer,
          sortOrder: Number(body.sortOrder ?? 0),
          isActive: body.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        };
        store.set(id, item);
        await fulfillJson(201, { status: "success", data: item });
        return;
      }

      if (method === "PUT" && idMatch) {
        const item = store.get(idMatch[1]);
        if (!item) {
          await fulfillJson(404, { status: "error", message: "找不到 FAQ" });
          return;
        }
        const body = JSON.parse(req.postData() || "{}");
        if (body.question !== undefined) item.question = body.question;
        if (body.answer !== undefined) item.answer = body.answer;
        if (body.sortOrder !== undefined)
          item.sortOrder = Number(body.sortOrder);
        if (body.isActive !== undefined) item.isActive = body.isActive;
        item.updatedAt = new Date().toISOString();
        await fulfillJson(200, { status: "success", data: item });
        return;
      }

      if (method === "DELETE" && idMatch) {
        const item = store.get(idMatch[1]);
        if (!item) {
          await fulfillJson(404, { status: "error", message: "找不到 FAQ" });
          return;
        }
        item.isActive = false;
        item.updatedAt = new Date().toISOString();
        await fulfillJson(200, { status: "success", data: item });
        return;
      }

      await route.continue();
    });

    await page.goto("/#/admin/login");
    await page.getByRole("button", { name: /快速帶入/ }).click();
    await page.getByRole("button", { name: /登入/ }).click();
    await expect(page).toHaveURL(/#\/admin\/skills/);
  });

  test("可新增、搜尋、編輯、下架與恢復 FAQ", async ({ page }) => {
    await page.goto("/#/admin/faqs");
    await expect(
      page.locator("h1:has-text('FAQ 管理'), div:has-text('FAQ 管理')").first()
    ).toBeVisible();

    await page.getByRole("button", { name: "新增 FAQ" }).click();
    const dialog = page.getByRole("dialog", { name: "新增 FAQ" });
    await dialog.getByLabel("問題 *").fill(uniqueQuestion);
    await dialog.getByLabel("回答 *").fill("E2E FAQ 初始回答");
    await dialog.getByLabel("排序序號 *").fill("99");
    await dialog.getByRole("button", { name: "儲存" }).click();

    const search = page.getByRole("searchbox", { name: "搜尋 FAQ" });
    await search.fill(uniqueQuestion);
    await expect(page.getByText(uniqueQuestion).first()).toBeVisible();

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
  });
});
