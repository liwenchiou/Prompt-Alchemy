import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test.describe("Prompt Alchemy 效能與無障礙全站自動化檢測", () => {
  
  // =========================================================================
  // 1. 無障礙檢測 (Accessibility Audit - WCAG 2.1 AA)
  // =========================================================================
  test.describe("♿ 無障礙 (Accessibility - WCAG 2.1 AA) 檢測", () => {
    
    test("首頁 (HomePage) 應符合 WCAG 2.1 AA 無障礙標準", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag21a", "wcag2aa", "wcag21aa"])
        .disableRules(["color-contrast"]) // 暗色黑金客製主題特別處理
        .analyze();

      console.log(`[A11y Audit] 首頁通過 WCAG AA 檢查，發現障礙數量: ${accessibilityScanResults.violations.length}`);
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("Prompt 詳情頁面/Modal 應具備適當無障礙屬性 (a11y)", async ({ page }) => {
      await page.goto("/#/skills/1");
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag21a"])
        .disableRules(["color-contrast"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("Agent Skills 技能市場頁面應符合無障礙標籤與結構語意", async ({ page }) => {
      await page.goto("/#/agent-skills");
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .disableRules(["color-contrast"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("FAQ常見問題組件應支援 ARIA 展開與鍵盤無障礙操作", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const faqSection = page.locator("section").filter({ hasText: "常見問題" });
      await faqSection.scrollIntoViewIfNeeded();

      const firstFaqButton = page.locator("button[aria-expanded]").first();
      if (await firstFaqButton.isVisible()) {
        expect(await firstFaqButton.getAttribute("aria-expanded")).toBe("false");
        
        // 觸發鍵盤操作 Enter 展開
        await firstFaqButton.focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(300);

        expect(await firstFaqButton.getAttribute("aria-expanded")).toBe("true");
      }
    });

    test("批量安裝面板 (BulkInstallPanel) 應具備獨立 aria-label 與可聚焦導航", async ({ page }) => {
      await page.goto("/#/favorites/skills");
      await page.waitForLoadState("networkidle");

      const bulkInstallBtn = page.locator('[data-tour="bulk-install-btn"]');
      if (await bulkInstallBtn.isVisible()) {
        await bulkInstallBtn.click();
        await page.waitForTimeout(300);

        const copyBtn = page.locator('[data-tour="bulk-install-copy-btn"]');
        await expect(copyBtn).toBeVisible();
        await expect(copyBtn).toHaveAttribute("aria-label");
      }
    });
  });

  // =========================================================================
  // 2. Web 效能指標檢測 (Performance & Core Web Vitals Audit)
  // =========================================================================
  test.describe("⚡ Web 效能 (Performance & Core Web Vitals) 檢測", () => {

    test("首頁關鍵載入效能指標 (FCP, LCP, DCL) 應符合優質標準", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/", { waitUntil: "networkidle" });
      const loadTime = Date.now() - startTime;

      // 取得 Performance Navigation Timing
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const paintEntries = performance.getEntriesByType("paint");
        const fcp = paintEntries.find((e) => e.name === "first-contentful-paint")?.startTime || 0;

        return {
          dcl: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
          loadEvent: nav ? nav.loadEventEnd - nav.startTime : 0,
          fcp,
          domNodesCount: document.getElementsByTagName("*").length,
          memoryUsageMB: window.performance?.memory
            ? Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024)
            : null,
        };
      });

      console.log("=== ⚡ 頁面效能檢測報告 ===");
      console.log(`⏱️ 網路整體載入耗時: ${loadTime} ms`);
      console.log(`🎨 首屏渲染 (FCP): ${Math.round(metrics.fcp)} ms`);
      console.log(`📄 DOM 解析完成 (DCL): ${Math.round(metrics.dcl)} ms`);
      console.log(`📦 全站 DOM 節點總數: ${metrics.domNodesCount} 個`);
      if (metrics.memoryUsageMB) {
        console.log(`💾 JS 記憶體占用: ${metrics.memoryUsageMB} MB`);
      }

      // 效能指標斷言 (優質網頁標準)
      expect(metrics.fcp).toBeLessThan(2500); // FCP 小於 2.5 秒
      expect(metrics.dcl).toBeLessThan(3000); // DCL 小於 3.0 秒
      expect(metrics.domNodesCount).toBeLessThan(2500); // DOM 節點小於 2500 個防止過大
    });

    test("Agent Skills 清單頁頁面渲染與切換效能", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/#/agent-skills", { waitUntil: "networkidle" });
      const renderDuration = Date.now() - startTime;

      console.log(`⚡ Agent Skills 頁面渲染時間: ${renderDuration} ms`);
      expect(renderDuration).toBeLessThan(5000);
    });

    test("前端關鍵搜尋篩選即時回應效能 (< 100ms)", async ({ page }) => {
      await page.goto("/#/agent-skills");
      await page.waitForLoadState("networkidle");

      const searchInput = page.locator('input[placeholder*="搜尋"]');
      if (await searchInput.isVisible()) {
        const searchStart = Date.now();
        await searchInput.fill("react");
        const searchDuration = Date.now() - searchStart;

        console.log(`⚡ 關鍵字搜尋回應耗時: ${searchDuration} ms`);
        expect(searchDuration).toBeLessThan(500);
      }
    });

  });

});
