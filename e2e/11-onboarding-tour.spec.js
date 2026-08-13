import { test, expect } from "@playwright/test";
import path from "path";

const artifactDir = "C:\\Users\\stark\\.gemini\\antigravity-ide\\brain\\de267032-d60b-4317-b5b8-7756223a9780";

test.describe("Onboarding Tour Step-by-Step Screenshot Debug Test", () => {
  test("捕捉每個步驟的畫面與背景內容", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("prompt_alchemy_onboarding_v1");
    });

    await page.goto("http://localhost:5173/#/");
    await page.waitForLoadState("networkidle");

    const startBtn = page.locator("button:has-text('開始 10 秒導覽')");
    await expect(startBtn).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(artifactDir, "step0_welcome.png") });
    await startBtn.click();

    // Step 1
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, "step1_brand.png") });

    // Step 2
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, "step2_links.png") });

    // Step 3
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, "step3_hero.png") });

    // Step 4
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, "step4_featured_prompts.png") });

    // Step 5
    console.log("Clicking Next on Step 4...");
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(2000);
    console.log("Step 5 URL:", page.url());
    await page.screenshot({ path: path.join(artifactDir, "step5_prompt_detail.png") });

    // Step 6
    console.log("Clicking Next on Step 5...");
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(1000);
    console.log("Step 6 URL:", page.url());
    await page.screenshot({ path: path.join(artifactDir, "step6_prompt_favorite.png") });

    // Step 7
    console.log("Clicking Next on Step 6...");
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(2000);
    console.log("Step 7 URL:", page.url());
    await page.screenshot({ path: path.join(artifactDir, "step7_skill_detail.png") });

    // Step 8
    console.log("Clicking Next on Step 7...");
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(1000);
    console.log("Step 8 URL:", page.url());
    await page.screenshot({ path: path.join(artifactDir, "step8_skill_favorite.png") });

    // Step 9
    console.log("Clicking Next on Step 8...");
    await page.locator(".driver-popover-next-btn").click();
    await page.waitForTimeout(2000);
    console.log("Step 9 URL:", page.url());
    await page.screenshot({ path: path.join(artifactDir, "step9_favorites.png") });
  });
});
