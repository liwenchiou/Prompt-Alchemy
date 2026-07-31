# Prompt Alchemy

Prompt Alchemy 是一個基於 React 19、Vite 與 Tailwind CSS v4 開發的 AI 提示詞（Prompt）與技能（Skill）管理平台。本專案提供直覺的前台介面供使用者瀏覽、搜尋、測試並收藏各式精心設計的 AI 提示詞；同時內建完整的後台管理系統，利於管理員維護系統參數、使用者資料以及提示詞目錄。

## Quick Start

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
   複製 `.env.example` 並重新命名為 `.env`（或 `.env.development`），並填入您的後端 API 位置：
   ```bash
   cp .env.example .env
   ```
   確保其中的配置正確：
   ```env
   # Backend API Base URL
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

---

## Commands

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動本地 Vite 開發伺服器 (`http://localhost:5173`) |
| `npm run build` | 建置用於生產環境的靜態資源（輸出至 `dist/`） |
| `npm run preview`| 在本地預覽生產環境的建置結果 |
| `npm run lint` | 執行 ESLint 語法檢查與排版驗證 |
| `npm test` | 執行 Vitest 進行單元測試 |
| `npm run test:e2e` | 執行 Playwright 全套端到端 (E2E) 測試 |
| `npm run test:e2e:ui` | 開啟 Playwright UI 圖像化介面進行 E2E 測試除錯 |
| `npm run test:e2e:report` | 檢視 Playwright HTML 測試報告 |
| `npm run deploy` | 將建置結果發布至 GitHub Pages 託管 |

---

## Architecture

專案的核心架構與目錄配置如下：

```
Prompt-Alchemy/
├── e2e/              # Playwright 端到端 (E2E) 測試腳本
│   ├── 01-homepage.spec.js   # 首頁列表、搜尋與 Prompt Card Modal
│   ├── 02-auth.spec.js       # 會員登入/登出與錯誤處理
│   ├── 03-favorites.spec.js  # 我的收藏頁面與 Real DB 同步
│   ├── 04-feedback.spec.js   # 意見回饋表單提交
│   ├── 05-admin-auth.spec.js # 後台登入與 ProtectedRoute 權限阻擋
│   └── 06-admin-crud.spec.js # 後台技能、系統參數與聯絡紀錄管理
├── src/
│   ├── api/          # Axios 實例與 API 串接邏輯（如 authApi.js, promptApi.js）
│   ├── components/   # 全域可複用 UI 組件
│   ├── context/      # React Context 狀態管理（AuthContext, LoadingContext）
│   ├── hooks/        # 自定義 React Hooks
│   ├── layouts/      # 頁面版型佈局（HomeLayout, FavoriteLayout, AdminLayout）
│   ├── pages/        # 主要路由頁面
│   │   ├── admin/    # 後台管理頁面（儀表板、參數、使用者、提示詞 CRUD）
│   │   ├── favorite/ # 使用者收藏、個人資料、密碼變更頁面
│   │   ├── home/     # 前台首頁
│   │   └── prompt/   # 提示詞技能列表與詳細資訊頁面
│   ├── routes/       # 路由配置（包含 ProtectedRoute 登入防護）
│   ├── styles/       # 全域與元件樣式檔案（整合 Tailwind CSS v4）
│   └── utils/        # 通用工具函式
├── eslint.config.js  # ESLint 檢查配置
├── playwright.config.js # Playwright E2E 測試配置檔
├── vite.config.js    # Vite 設定檔
└── vitest.config.js  # Vitest 單元測試配置檔
```

### 關鍵設計決策
- **路由機制**：使用 React Router v7 的 `createHashRouter` 以利於直接部署在 GitHub Pages 等靜態託管平台。
- **樣式系統**：全面採用最新的 Tailwind CSS v4 進行高效率的樣式開發。
- **防護路由**：使用 `protectedRoute.jsx` 控管後台專屬路由，未授權用戶將自動導回登入頁面。
- **E2E 測試機制**：採用 Playwright 進行前後端真實連線 (Real DB) 測試，自動啟動 WebServer 並驗證真實環境資料庫流轉。

---

## Testing

1. **單元測試 (Unit Test)**：
   - 執行 `npm test` 透過 Vitest 檢查核心邏輯與組件。

2. **端到端測試 (E2E Test)**：
   - 本專案使用 **Playwright** 進行包含前後端直連（Real DB API `http://localhost:3000`）的完整自動化瀏覽器測試。
   - 測試涵蓋前台瀏覽、搜尋、登入、收藏、反饋提交，以及後台權限防護、參數與技能管理。
   - 執行命令：`npm run test:e2e` 或 `npm run test:e2e:ui`。

---

## Contributing

1. **代碼規範**：
   - 專案使用 Prettier 搭配 ESLint 確保代碼風格一致。
   - 提交 PR 前請執行 `npm run lint` 確認無語法警告或錯誤。

2. **測試規範**：
   - 新增功能時，請在相應目錄撰寫測試案例，並執行 `npm test` 及 `npm run test:e2e` 確保所有測試案例皆順利通過。

3. **分支與 PR 流程**：
   - 基於 `main` 建立功能分支（例如 `feature/amazing-feature`）。
   - 完成開發並通過測試後，提交 Pull Request 並指派團隊成員審查。
