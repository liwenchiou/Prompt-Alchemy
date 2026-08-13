# 前端 & 後台全站 API 需求與規格文件 (Prompt Alchemy API Specification)

本文件完整整理前端前台 (`Prompt-Alchemy`) 與後台管理介面 (`/admin`) 所需的所有 API 規格，提供給前後端工程師作為系統設計、開發與對接參考。

---

## 📋 目錄
1. [通用規範 (General Specs)](#1-通用規範-general-specs)
2. [認證與會員模組 (Auth & User Module)](#2-認證與會員模組-auth--user-module)
3. [前台 Prompt 提示詞模組](#3-前台-prompt-提示詞模組)
4. [前台 Agent Skills 技能庫模組](#4-前台-agent-skills-技能庫模組)
5. [前台會員收藏與 Recipe 情境打包模組](#5-前台會員收藏與-recipe-情境打包模組)
6. [新手指引與全站導覽模組 (Onboarding Tour Module)](#6-新手指引與全站導覽模組-onboarding-tour-module)
7. [通用選單、檔案上傳與聯絡模組](#7-通用選單檔案上傳與聯絡模組)
8. [後台 Prompt / Skill 管理模組 (Admin Skills)](#8-後台-prompt--skill-管理模組-admin-skills)
9. [後台分類標籤參數管理模組 (Admin Parameters)](#9-後台分類標籤參數管理模組-admin-parameters)
10. [後台會員管理模組 (Admin Users)](#10-後台會員管理模組-admin-users)
11. [前台常見問題模組 (Public FAQs)](#11-前台常見問題模組-public-faqs)
12. [後台常見問題管理模組 (Admin FAQs)](#12-後台常見問題管理模組-admin-faqs)

---

## 1. 通用規範 (General Specs)

### Base URL
* **開發環境**：`http://localhost:3000` (或可透過 `.env` 的 `VITE_API_BASE_URL` 設定)
* **正式環境**：`https://api.promptalchemy.com`

### HTTP Client & Request Header (Axios)
* 前端使用 Axios 客戶端（`src/api/apiClient.js`），配有 Request 與 Response 攔截器：
  * **Request 攔截器**：若 `localStorage` 存在 `token`，自動注入 Authorization Header。
  * **Response 攔截器**：自動解包 `response.data`，並統一捕獲 4xx/5xx 及網路連線異常。
* 需要驗證的 API Header：
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```

### 統一回應 JSON 結構
* **成功回應 (200 / 201)**:
  ```json
  {
    "status": "success",
    "message": "描述文字",
    "data": { ... }
  }
  ```
* **失敗回應 (400 / 401 / 403 / 404 / 500)**:
  ```json
  {
    "status": "error",
    "message": "錯誤原因說明"
  }
  ```

---

## 2. 認證與會員模組 (Auth & User Module)

### 2.1 會員註冊
* **Endpoint**: `POST /auth/register`
* **Auth**: 無需 Token
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "name": "使用者名稱",
    "password": "Password123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "註冊成功",
    "data": {
      "id": "user-uuid-0001",
      "email": "user@example.com",
      "name": "使用者名稱"
    }
  }
  ```

### 2.2 會員 / 管理者登入
* **Endpoint**: `POST /auth/login`
* **Auth**: 無需 Token
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2.3 取得目前登入者個人資料
* **Endpoint**: `GET /auth/me`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "user": {
      "id": "user-uuid-0001",
      "email": "user@example.com",
      "name": "使用者名稱",
      "role": "member" // 或 "admin"
    }
  }
  ```

### 2.4 會員登出
* **Endpoint**: `POST /auth/logout`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "已登出"
  }
  ```

---

## 3. 前台 Prompt 提示詞模組

### 3.1 取得上架中的 Prompt 列表
* **Endpoint**: `GET /prompts`
* **Auth**: 無需 Token
* **Query Parameters (可選)**: `category`, `tag`, `search`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "prompt-uuid-0001",
        "title": "後端 API 審查",
        "slug": "backend-api-review",
        "intro": "檢查 Express / Next.js API 的錯誤處理與安全性。",
        "modelType": ["GPT-4", "Claude 3.5 Sonnet"],
        "promptContent": "請你扮演資深後端工程師...",
        "copyCount": 15,
        "favoriteCount": 42,
        "isActive": true
      }
    ]
  }
  ```

### 3.2 取得單一 Prompt 詳細內容
* **Endpoint**: `GET /prompts/:id`
* **Auth**: 無需 Token
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "prompt-uuid-0001",
      "title": "後端 API 審查",
      "slug": "backend-api-review",
      "intro": "檢查 Express API 結構",
      "modelType": ["GPT-4", "Claude 3.5"],
      "promptContent": "請你扮演資深後端工程師...",
      "exampleInput": "router.post('/login')",
      "exampleOutput": [
        { "type": "text", "data": { "context": "詳細說明..." }, "seq": 0 }
      ],
      "copyCount": 16,
      "favoriteCount": 43
    }
  }
  ```

### 3.3 累加 Prompt 複製次數
* **Endpoint**: `POST /prompts/:id/copy`
* **Auth**: 無需 Token
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "複製次數已累加"
  }
  ```

---

## 4. 前台 Agent Skills 技能庫模組

### 4.1 取得上架中的 Agent Skills 列表
* **Endpoint**: `GET /agent-skills`
* **Auth**: 無需 Token
* **Query Parameters (可選)**: `keyword`, `categoryId`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "agent-skill-uuid-0001",
        "name": "react-code-reviewer",
        "description": "自動審查 React 組件程式碼品質",
        "intro": "專為 React & TypeScript 開發者設計的模組化 Agent 技能",
        "repoOwner": "prompt-alchemy",
        "repoName": "react-skills",
        "skillSlug": "code-reviewer",
        "creatorName": "Alchemy Dev",
        "installKind": "full_package",
        "supportedAgents": ["claude-code", "codex", "cursor"],
        "stargazersCount": 128,
        "copyCount": 85,
        "favoriteCount": 34
      }
    ]
  }
  ```

### 4.2 取得單一 Agent Skill 詳細內容
* **Endpoint**: `GET /agent-skills/:id`
* **Auth**: 無需 Token
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "agent-skill-uuid-0001",
      "name": "react-code-reviewer",
      "description": "自動審查 React 組件程式碼品質",
      "repoOwner": "prompt-alchemy",
      "repoName": "react-skills",
      "skillSlug": "code-reviewer",
      "readmeExcerpt": "# React Code Reviewer Skill\n...",
      "docUrl": "https://github.com/prompt-alchemy/react-skills",
      "installKind": "full_package",
      "supportedAgents": ["claude-code", "codex", "cursor"]
    }
  }
  ```

---

## 5. 前台會員收藏與 Recipe 情境打包模組

### 5.1 取得會員的收藏 ID 清單
* **Endpoint**: `GET /favorites?itemType=prompt` 或 `GET /favorites?itemType=skill`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      "prompt-uuid-0001-0000-000000000001"
    ]
  }
  ```

### 5.2 取得已收藏 Agent Skill 的完整資料 (含 `favoriteId`)
* **Endpoint**: `GET /favorites?itemType=skill`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "favoriteId": "fav-skill-uuid-0001",
        "id": "agent-skill-uuid-0001",
        "name": "react-code-reviewer",
        "repoOwner": "prompt-alchemy",
        "repoName": "react-skills",
        "installKind": "full_package",
        "supportedAgents": ["claude-code", "codex", "cursor"]
      }
    ]
  }
  ```

### 5.3 切換 Prompt 或 Skill 收藏狀態
* **Endpoint**: `POST /favorites/:id/toggle?itemType=prompt` 或 `POST /favorites/:id/toggle?itemType=skill`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": { "favorited": true }
  }
  ```

### 5.4 取得會員 Recipe 配方清單
* **Endpoint**: `GET /me/recipes`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "id": "recipe-uuid-0001", "name": "Frontend Essentials", "createdAt": "2026-08-01T10:00:00Z" }
    ]
  }
  ```

### 5.5 建立 Recipe
* **Endpoint**: `POST /me/recipes`
* **Auth**: `Authorization: Bearer <token>`
* **Request Body**: `{ "name": "Backend Toolkit" }`

### 5.6 取得 Recipe 與 Skill 綁定關係
* **Endpoint**: `GET /me/recipe-items`
* **Auth**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "recipe_id": "recipe-uuid-0001", "favorite_id": "fav-skill-uuid-0001" }
    ]
  }
  ```

### 5.7 新增 / 移除 Recipe 項目
* **新增項目**: `POST /me/recipes/:recipeId/items` (`{ "favoriteId": "fav-skill-uuid-0001" }`)
* **移除項目**: `DELETE /me/recipes/:recipeId/items/:favoriteId`

---

## 6. 新手指引與全站導覽模組 (Onboarding Tour Module)

前端全站提供 13 個跨頁步驟的**互動式導覽教學 (Driver.js)**，輔助新註冊/登入會員快速熟悉 Prompt 與 Agent Skill 的搜尋、收藏、Recipe 打包與批量安裝 (Bulk Install) 功能。

### 6.1 本地狀態與觸發條件規範
* **觸發條件**：僅限**已登入會員**且 `localStorage.getItem('prompt_alchemy_onboarding_v1')` 不存在時，系統延遲 600ms 自動彈出 Welcome Modal。
* **LocalStorage 金鑰規範**：
  * `STORAGE_KEY`: `'prompt_alchemy_onboarding_v1'` — `'true'` 代表已完成或關閉過導覽。
  * `ACTIVE_STEP_KEY`: `'prompt_alchemy_tour_active_step'` — 紀錄跨頁跳轉時目前導覽步驟索引 (`0` ~ `12`)。
* **導覽完成與關閉處理**：
  * 當使用者點擊「**完成導覽 🎉**」、點擊關閉按鈕或完成 Step 13 時，系統自動清除 `ACTIVE_STEP_KEY` 並將 `STORAGE_KEY` 設為 `'true'`。
  * **自動導回首頁**：若導覽結束時畫面不在首頁 (`/`)，系統會自動呼叫 `navigate('/')` 將使用者順暢平滑引導回首頁。

### 6.2 13 步跨頁導覽步驟地圖

| 步驟 (1-based) | 目標 DOM Selector (`data-tour`) | 所屬頁面 Route | 說明與跨頁邏輯 |
| :--- | :--- | :--- | :--- |
| **Step 1** | `[data-tour="navbar-brand"]` | `/` | 歡迎介紹與品牌 Logo 回首頁說明 |
| **Step 2** | `[data-tour="nav-links"]` | `/` | 頂部導覽列功能說明 |
| **Step 3** | `[data-tour="hero-cta"]` | `/` | Hero 區極速安裝與探索入口 |
| **Step 4** | `[data-tour="featured-prompts"]` | `/` | 熱門 Prompt 展示；下一步自動跳轉至 Prompt 詳情頁 |
| **Step 5** | `[data-tour="prompt-detail-content"]` | `/skills/:id` | Prompt 內容說明與模板示範 |
| **Step 6** | `[data-tour="prompt-favorite-btn"]` | `/skills/:id` | Prompt 收藏按鈕；下一步自動跳轉至 Agent Skill 詳情頁 |
| **Step 7** | `[data-tour="skill-detail-content"]` | `/agent-skills/:id` | Agent Skill 詳情與 CLI 安裝指令說明 |
| **Step 8** | `[data-tour="skill-favorite-btn"]` | `/agent-skills/:id` | Skill 收藏按鈕；下一步自動跳轉至「我的收藏-Skills」頁 |
| **Step 9** | `[data-tour="favorites-recipe-tabs"]` | `/favorites/skills` | Recipe 頁籤與情境打包說明 |
| **Step 10**| `[data-tour="favorite-card-add-recipe"]` | `/favorites/skills` | 卡片上的「加入 Recipe」按鈕說明 |
| **Step 11**| `[data-tour="bulk-install-btn"]` | `/favorites/skills` | 一鍵安裝 (Bulk Install) 面板展開按鈕 |
| **Step 12**| `[data-tour="bulk-install-copy-btn"]` | `/favorites/skills` | 批量安裝指令「複製全部」按鈕（自動開展面板並精準高亮） |
| **Step 13**| `[data-tour="tour-replay-btn"]` | `/favorites/skills` | Navbar 「新手指引」重播按鈕；完成後**自動跳轉回首頁 (`/`)** |

---

## 7. 通用選單、檔案上傳與聯絡模組

### 7.1 分類與標籤選單
* **GET /utility/categories**: 取得全站 Prompt/Skill 分類清單
* **GET /utility/tags**: 取得熱門標籤清單

### 7.2 檔案與圖片上傳
* **Endpoint**: `POST /upload`
* **Auth**: `Authorization: Bearer <token>`
* **Request (multipart/form-data)**:
  * `file`: 圖片、影片或示範檔案
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "url": "https://api.promptalchemy.com/uploads/demo-image-001.png"
    }
  }
  ```

### 7.3 送出聯絡我們 / 意見回饋
* **Endpoint**: `POST /contact`
* **Auth**: 無需 Token
* **Request Body**:
  ```json
  {
    "name": "訪客姓名",
    "email": "visitor@example.com",
    "subject": "功能建議",
    "message": "希望能支援更多 AI Agent 框架..."
  }
  ```
* **Response (200 OK)**: `{ "status": "success", "message": "意見已成功送出" }`

---

## 8. 後台 Prompt / Skill 管理模組 (Admin Skills)

> **狀態說明**：狀態使用布林值 `isActive` (啟用 / 停用)。

* **取得清單**: `GET /admin/skills?keyword=&categoryId=&active=`
* **新增 Skill**: `POST /admin/skills`
* **修改 Skill**: `PUT /admin/skills/:id`
* **切換狀態**: `PATCH /admin/skills/:id/active` (`{ "isActive": true }`)
* **刪除 Skill**: `DELETE /admin/skills/:id`

---

## 9. 後台分類標籤參數管理模組 (Admin Parameters)

* **取得參數**: `GET /admin/parameters`
* **新增參數**: `POST /admin/parameters` (`{ "name": "新分類", "type": "category" }`)
* **修改參數**: `PUT /admin/parameters/:id`
* **切換狀態**: `PATCH /admin/parameters/:id/active`
* **刪除參數**: `DELETE /admin/parameters/:id`

---

## 10. 後台會員管理模組 (Admin Users)

* **取得會員列表**: `GET /admin/users`
* **新增會員**: `POST /admin/users`
* **修改會員**: `PUT /admin/users/:id`
* **切換狀態**: `PATCH /admin/users/:id/active`
* **刪除會員**: `DELETE /admin/users/:id`

---

## 11. 前台常見問題模組 (Public FAQs)

* **Endpoint**: `GET /faqs/`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "60000000-0000-4000-a000-000000000001",
        "question": "Prompt 鍊金坊是什麼？",
        "answer": "Prompt 鍊金坊是一個整理與分享 AI Prompt、Skill 的收藏平台。"
      }
    ]
  }
  ```

---

## 12. 後台常見問題管理模組 (Admin FAQs)

* **取得 FAQ 管理清單**: `GET /admin/faqs/`
* **取得單筆 FAQ**: `GET /admin/faqs/:id`
* **建立 FAQ**: `POST /admin/faqs/`
* **更新 FAQ**: `PUT /admin/faqs/:id`
* **下架 FAQ (軟刪除)**: `DELETE /admin/faqs/:id`
