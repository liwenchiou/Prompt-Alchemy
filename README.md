# Prompt Alchemy

Prompt Alchemy 是一個基於 React 19、Vite 與 Tailwind CSS v4 開發的生成式 AI 提示詞（Prompt）與 Agent 技能（Skill）鍊金術平台。本專案提供直覺豐富的前台介面供使用者瀏覽、搜尋、測試、檢視常見問題（FAQ）、收藏各式精心設計的 AI 提示詞與模組化 Agent Skills，並支援 **Recipe 情境配方打包** 與 **一鍵安裝 (Bulk Install)**；同時內建完整的後台管理系統，便於管理員維護提示詞技能目錄、常見問題（FAQ）、使用者帳號權限、系統參數以及聯絡訊息紀錄。

---

## ⚡ Key Features

* **🔥 提示詞與技能市場 (Prompts & Agent Skills Catalog)**：收錄豐富的 AI 提示詞模板與相容主流 AI Agent（如 Claude Code, Codex, Cursor）的 Agent Skills。
* **🍱 Recipe 情境配方打包 (Recipe Bundling)**：允許使用者將收藏的 Agent Skills 依據開發情境（如前端開發、後端審查、自動測試）分類打包成專屬 Recipe 配方。
* **⚡ 批量一鍵安裝 (Bulk Install)**：點擊「一鍵安裝」即可依照選定的 Recipe 或全部收藏，自動組出可複製的跨平台 CLI 安裝指令。
* **✨ 13 步跨頁互動式新手指引 (Onboarding Tour)**：整合 Driver.js 打造流暢的跨頁互動引導（首頁 ➔ Prompt 詳情 ➔ Skill 詳情 ➔ 我的收藏 ➔ Recipe 打包 ➔ 一鍵安裝 ➔ 自動返航首頁），登入自動提示且支援隨時重新播放。
* **🛡️ 權限與安全防護 (ProtectedRoute & JWT Auth)**：完整整合 JWT 認證機制、Axios 攔截器自動注入與前/後台防護路由Guard。
* **⚙️ 後台管理系統 (Admin Dashboard)**：提供技能 CRUD、多區塊範例輸出編輯（文字/圖片/影片/HTML）、常見問題（FAQ）排序與軟刪除、使用者帳號管理與系統參數設定。

---

## 🚀 Quick Start

1. **複製專案倉庫**：
   ```bash
   git clone https://github.com/vkksa1018/Prompt-Alchemy.git
   cd Prompt-Alchemy
   ```

2. **安裝依賴套件**：
   ```bash
   npm install
   ```

3. **設定環境變數**：
   複製 `.env.example` 並重新命名為 `.env`（或 `.env.development`），填入您的後端 API 位置：
   ```bash
   cp .env.example .env
   ```
   確保配置正確：
   ```env
   # Backend API Base URL
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

---

## 🛠️ Commands

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動本地 Vite 開發伺服器 (`http://localhost:5173`) |
| `npm run build` | 建置用於生產環境的靜態資源（輸出至 `dist/`） |
| `npm run preview` | 在本地預覽生產環境的建置結果 |
| `npm run lint` | 執行 ESLint 語法檢查與排版驗證 |
| `npm test` | 執行 Vitest 進行單元與元件測試（27 隻測試檔，174 個測試案例 100% 通過） |
| `npm run test:e2e` | 執行 Playwright 全套端到端 (E2E) 自動化測試（11 隻測試檔） |
| `npm run test:e2e:ui` | 開啟 Playwright UI 圖像化介面進行 E2E 測試與除錯 |
| `npm run test:e2e:report` | 檢視 Playwright HTML 端到端測試報告 |
| `npm run deploy` | 將建置結果自動發布至 GitHub Pages 託管 |

---

## 📂 Architecture

專案的核心架構與目錄配置如下：

```
Prompt-Alchemy/
├── docs/                 # 系統架構說明與全站 API 規格文件 (FRONTEND_API_SPEC.md)
├── e2e/                  # Playwright 端到端 (E2E) 自動化測試腳本 (11 隻測試檔)
│   ├── 01-homepage.spec.js   # 首頁列表、搜尋、分類選單、FAQSection 展開與 Modal 視窗
│   ├── 02-auth.spec.js       # 會員登入/登出驗證與錯誤處理
│   ├── 03-favorites.spec.js  # 使用者收藏庫與 Real DB 同步
│   ├── 04-feedback.spec.js   # 意見回饋與聯絡表單提交
│   ├── 05-admin-auth.spec.js # 後台登入與 ProtectedRoute 權限阻擋機制
│   ├── 06-admin-crud.spec.js # 後台技能、系統參數與聯絡紀錄管理
│   ├── 07-admin-faq.spec.js  # 後台 FAQ 管理流程（CRUD、狀態切換、排序與分頁）
│   ├── 08-admin-users.spec.js# 後台使用者帳號與權限資料管理
│   ├── 09-skill-detail.spec.js# 技能詳細資訊頁面與互動測試
│   ├── 10-agent-skills.spec.js# Agent Skills 技能庫清單與詳情頁測試
│   └── 11-onboarding-tour.spec.js# 13 步新手指引 (Onboarding Tour) 跨頁導覽自動化測試
├── src/
│   ├── api/              # Axios 實例與 RESTful API 串接模組
│   │   ├── adminApi.js   # 後台技能、FAQ、使用者、系統參數與聯絡訊息 API
│   │   ├── agentSkillApi.js# Agent Skills 技能庫查詢與使用次數累加 API
│   │   ├── authApi.js    # 會員與管理者身份驗證 API
│   │   ├── contactApi.js # 前台聯絡表單 API
│   │   ├── faqApi.js     # 前台 FAQ 清單取得 API
│   │   ├── favoriteApi.js# 提示詞與技能收藏同步 API
│   │   ├── promptApi.js  # 前台 Prompt 查詢與複製 API
│   │   ├── recipeApi.js  # Recipe 情境配方 CRUD 與項目綁定 API
│   │   ├── uploadApi.js  # 檔案與圖片上傳 API
│   │   ├── mocks/        # 靜態 Mock 資料 (mockData.js)
│   │   └── __tests__/    # API 邏輯與串接單元測試檔
│   ├── components/       # React UI 組件（採 PascalCase 命名）
│   │   ├── BulkInstallPanel/# 批量安裝 CLI 指令打包組件 (BulkInstallPanel.jsx)
│   │   ├── FavoriteSkillCard/# 收藏 Skill 卡片與 Recipe 選單 (FavoriteSkillCard.jsx)
│   │   ├── Onboarding/   # 導覽歡迎 Modal (WelcomeModal.jsx)
│   │   ├── ErrorBoundary/# 全域錯誤邊界組件 (ErrorBoundary.jsx)
│   │   ├── FAQSection/   # 前台常見問題手風琴組件 (FAQSection.jsx)
│   │   ├── PromptCard/   # 提示詞卡片與詳情 Modal (PromptCard.jsx)
│   │   └── admin/        # 後台專屬組件（AdminSidebar, FaqFormModal, UserFormModal, SkillForm 等）
│   ├── config/           # 全站設定與導覽步驟 (tourSteps.js, runMode.js)
│   ├── context/          # React Context 狀態管理（AuthContext, LoadingContext, OnboardingContext）
│   ├── hooks/            # 自定義 React Hooks（useAuth, usePageLoading, useOnboarding 等）
│   ├── layouts/          # 頁面版型佈局（HomeLayout.jsx, FavoriteLayout.jsx, AdminLayout.jsx）
│   ├── pages/            # 主要路由頁面
│   │   ├── admin/        # 後台管理頁面（AdminDashboard, AdminSkillsView, AdminFaqs, AdminUsers 等）
│   │   ├── agent-skill/  # Agent Skills 技能庫清單與詳情頁 (agentSkills.jsx, AgentSkillDetail.jsx)
│   │   ├── favorite/     # 使用者收藏、Recipe 打包與個人資料頁 (FavoriteSkillsPage, ProfilePage 等)
│   │   ├── home/         # 前台首頁（HomePage.jsx）
│   │   ├── member/       # 會員登入與註冊頁面（LoginPage, RegisterPage）
│   │   ├── prompt/       # 提示詞列表與詳細資訊頁面（SkillsPage, SkillDetailPage）
│   │   └── NotFoundPage.jsx
│   ├── routes/           # 路由配置（index.jsx, AdminRoutes.jsx, ProtectedRoute.jsx 權限防護）
│   ├── styles/           # 全域樣式、Driver.js 訂製樣式與 Tailwind CSS v4 配置
│   └── utils/            # 通用工具函式 (storage.js, eventBus.js, skillGrouping.js, copyToClipboard.js 等)
├── eslint.config.js      # ESLint 檢查配置
├── playwright.config.js  # Playwright E2E 測試配置檔
├── vite.config.js        # Vite 構建設定檔
└── vitest.config.js      # Vitest 單元測試配置檔
```

### 💡 關鍵設計決策

- **檔案規範與目錄結構**：全站 React 組件（Component / Page / Layout / Route）統一採用首字大寫 PascalCase 命名規範；非 UI 工具邏輯、Mock 資料與測試檔依權責劃分至 `utils/`, `api/` 與相應 `__tests__/` 資料夾中。
- **路由機制**：使用 React Router v7 的 `createHashRouter`，完美相容 GitHub Pages 等靜態託管平台。
- **樣式系統**：全面採用最新的 Tailwind CSS v4 進行高效、響應式的現代化 UI 開發，並客製化 Driver.js 極光黑金風格導覽主題。
- **防護路由與錯誤邊界**：採用 `ProtectedRoute.jsx` 嚴格控管後台專屬路由，並配合全域 `<ErrorBoundary>` 捕捉 UI 渲染異常呈現優雅備用畫面；搭配 API Client Interceptor 於 `401 Unauthorized` 時自動清除 Token 並跳轉登入頁。
- **解耦 Event Bus 機制**：建立獨立輕量級 `eventBus.js` 模組，處理跨組件與 API 的非對稱發佈/訂閱（例如技能更新廣播與登入逾期通知），避免全域 `window` 事件污染。
- **無障礙 (a11y) 與語意化標準**：核心互動組件（如 `PromptCard.jsx`、`FAQSection.jsx`、`BulkInstallPanel.jsx` 與 `FaqFormModal.jsx`）皆完整實作 `aria-expanded`、`aria-controls`、`aria-label`、`role="dialog"` 與鍵盤 (`Tab` / `Enter` / `Space`) 互動支援。
- **單元與元件測試**：採用 **Vitest** 搭配 **React Testing Library** 進行全方位測試，涵蓋 API 串接、Mock 資料、`eventBus` 廣播、`ErrorBoundary` 攔截、路由守衛與 React UI 元件，共 **27 隻測試檔（174 個測試案例 100% 通過）**。
- **E2E 端到端自動化測試**：採用 **Playwright** 進行前後端真實連線 (Real DB API) 自動化測試，共 **11 隻測試檔**，完整驗證前台瀏覽/搜尋/FAQ手風琴/收藏/Recipe打包/一鍵安裝/新手指引，以及後台權限防護、技能 CRUD、FAQ CRUD、帳號管理與參數調整。

---

## 🧪 Testing

1. **單元與元件測試 (Unit & Component Test)**：
   - 執行 `npm test` 透過 **Vitest** 搭配 **React Testing Library** 進行測試。
   - 涵蓋 API 邏輯、Mock 資料、EventBus、ErrorBoundary、核心路由守衛與各大 UI 元件，共 27 隻測試檔（174 個測試案例全數通過）。

2. **端到端測試 (E2E Test)**：
   - 本專案使用 **Playwright** 進行前後端直連 (Real DB API `http://localhost:3000`) 的全自動化瀏覽器測試。
   - 測試涵蓋前台瀏覽、搜尋、分類篩選、FAQ 展開、登入/註冊、個人收藏、Recipe 配方打包、一鍵安裝、13 步跨頁新手指引，以及後台權限防護、技能維護、FAQ CRUD、帳號管理與參數設置。
   - 執行指令：
     - `npm run test:e2e`：無頭模式執行所有 E2E 測試。
     - `npm run test:e2e:ui`：以 GUI 介面進行測試與除錯。
     - `npm run test:e2e:report`：檢視詳細 HTML 測試報告。

---

## 🤝 Contributing

1. **代碼規範**：
   - 專案使用 Prettier 搭配 ESLint 確保代碼風格一致。
   - 提交 PR 前請執行 `npm run lint` 確認無語法警告或錯誤。

2. **測試規範**：
   - 新增功能時，請在相應目錄撰寫測試案例，並執行 `npm test` 及 `npm run test:e2e` 確保所有測試案例皆順利通過。

3. **分支與 PR 流程**：
   - 基於 `main` 建立功能分支（例如 `feature/amazing-feature`）。
   - 完成開發並通過測試後，提交 Pull Request 並指派團隊成員審查。
