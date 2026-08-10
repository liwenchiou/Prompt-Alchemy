// Relational Mock Database and Lookups (Aligned with PostgreSQL Database Schema)

// 1. Parameters Table (Category, Role, contentType, model, tag)
export const parametersTable = [
  // Roles
  {
    id: "role-admin-uuid-0000-000000000001",
    type: "role",
    name: "Admin",
    memo: "系統管理員",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "role-member-uuid-0000-000000000002",
    type: "role",
    name: "Member",
    memo: "一般會員",
    is_active: true,
    sort_order: 2,
  },

  // Content Types
  {
    id: "ct-prompt-uuid-0000-000000000001",
    type: "contentType",
    name: "prompt",
    memo: "Prompt 提示詞",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ct-skill-uuid-0000-000000000002",
    type: "contentType",
    name: "skills",
    memo: "AI 技能",
    is_active: true,
    sort_order: 2,
  },

  // Categories
  {
    id: "cat-frontend-uuid-0000-000000000001",
    type: "category",
    name: "前端開發",
    memo: "React / Vue / CSS / UI 相關",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "cat-backend-uuid-0000-000000000002",
    type: "category",
    name: "後端開發",
    memo: "Node.js / API / 資料庫設計",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "cat-security-uuid-0000-000000000003",
    type: "category",
    name: "資安相關",
    memo: "漏洞檢測、滲透測試、安全審查",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "cat-debug-uuid-0000-000000000004",
    type: "category",
    name: "除錯技巧",
    memo: "	Debug、錯誤訊息分析、Log 分析",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "cat-translate-uuid-0000-000000000005",
    type: "category",
    name: "翻譯助手",
    memo: "多國語言翻譯與文件潤飾技能",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "cat-utility-uuid-0000-000000000006",
    type: "category",
    name: "小工具",
    memo: "Regex 生成, JSON 格式化等輔助小工具",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "cat-utility-uuid-0000-000000000007",
    type: "category",
    name: "DevOps / 部署維運",
    memo: "CI/CD、Docker、雲端服務、監控",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "cat-utility-uuid-0000-000000000008",
    type: "category",
    name: "測試 / 品質保證",
    memo: "單元測試、E2E、Code Review",
    is_active: true,
    sort_order: 8,
  },
  {
    id: "cat-utility-uuid-0000-000000000009",
    type: "category",
    name: "文件 / 寫作",
    memo: "技術文件、README、註解生成",
    is_active: true,
    sort_order: 9,
  },
  {
    id: "cat-utility-uuid-0000-000000000010",
    type: "category",
    name: "教育 / 學習",
    memo: "觀念解釋、教材產生、學習輔助",
    is_active: true,
    sort_order: 10,
  },
  {
    id: "cat-utility-uuid-0000-000000000011",
    type: "category",
    name: "設計 / UX",
    memo: "UI 設計、Wireframe、使用者研究",
    is_active: true,
    sort_order: 11,
  },
  // Models
  {
    id: "model-gpt-uuid-0000-000000000001",
    type: "model",
    name: "gpt-4",
    memo: "OpenAI GPT-4",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "model-claude-uuid-0000-000000000002",
    type: "model",
    name: "claude-3.5",
    memo: "Anthropic Claude 3.5 Sonnet",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "model-codex-uuid-0000-000000000003",
    type: "model",
    name: "codex",
    memo: "GitHub Copilot Codex",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "model-gemini-uuid-0000-000000000004",
    type: "model",
    name: "gemini",
    memo: "Google Gemini",
    is_active: true,
    sort_order: 4,
  },
  // Tags
  {
    id: "tag-api-uuid-0000-000000000001",
    type: "tag",
    name: "#API",
    memo: "API 串接與設計",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "tag-security-uuid-0000-000000000002",
    type: "tag",
    name: "#Security",
    memo: "資訊安全與防禦",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "tag-react-uuid-0000-000000000003",
    type: "tag",
    name: "#React",
    memo: "React 元件開發",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "tag-debug-uuid-0000-000000000004",
    type: "tag",
    name: "#Debug",
    memo: "故障排除與除錯",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "tag-sql-uuid-0000-000000000005",
    type: "tag",
    name: "#SQL",
    memo: "資料庫查詢優化",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "tag-translation-uuid-0000-000000000006",
    type: "tag",
    name: "#Translation",
    memo: "多國語系翻譯",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "tag-node-uuid-0000-000000000007",
    type: "tag",
    name: "#Node.js",
    memo: "Node.js 執行環境",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "tag-express-uuid-0000-000000000008",
    type: "tag",
    name: "#Express",
    memo: "Express.js 框架",
    is_active: true,
    sort_order: 8,
  },
  {
    id: "tag-vite-uuid-0000-000000000009",
    type: "tag",
    name: "#Vite",
    memo: "Vite 建置工具",
    is_active: true,
    sort_order: 9,
  },
  {
    id: "tag-database-uuid-0000-000000000010",
    type: "tag",
    name: "#Database",
    memo: "資料庫儲存",
    is_active: true,
    sort_order: 10,
  },
  {
    id: "tag-mysql-uuid-0000-000000000011",
    type: "tag",
    name: "#MySQL",
    memo: "MySQL 資料庫",
    is_active: true,
    sort_order: 11,
  },
  {
    id: "tag-web-uuid-0000-000000000012",
    type: "tag",
    name: "#Web",
    memo: "網頁應用開發",
    is_active: true,
    sort_order: 12,
  },
  {
    id: "tag-design-uuid-0000-000000000013",
    type: "tag",
    name: "#Design",
    memo: "設計相關",
    is_active: true,
    sort_order: 13,
  },
  {
    id: "tag-education-uuid-0000-000000000014",
    type: "tag",
    name: "#Education",
    memo: "教育相關",
    is_active: true,
    sort_order: 14,
  },
  {
    id: "tag-drawing-uuid-0000-000000000015",
    type: "tag",
    name: "#Drawing",
    memo: "繪圖相關",
    is_active: true,
    sort_order: 15,
  },
];

// 2. Users Table
export const usersTable = [
  {
    id: "user-admin-uuid-0000-000000000001",
    name: "James Admin",
    email: "admin@promptalchemy.com",
    password_hash: "bcrypt-hash-placeholder-admin",
    role: "admin",
    isActive: true,
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "user-member-uuid-0000-000000000002",
    name: "member",
    email: "member@example.com",
    password_hash: "bcrypt-hash-placeholder-member",
    role: "member",
    isActive: true,
    created_at: "2026-06-01T08:00:00Z",
  },
];

// 3. SkillItem Table (Prompts / Skills)
export const skillItemsTable = [
  {
    id: "prompt-uuid-0001-0000-000000000001",
    title: "後端 API 審查",
    slug: "backend-api-review",
    intro: "檢查 Express / Next.js API 的錯誤處理、安全性與回傳結構。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: [
      "model-gpt-uuid-0000-000000000001",
      "model-claude-uuid-0000-000000000002",
    ],
    prompt_content: `請你扮演資深後端工程師，檢查以下 API 程式碼。

幫我找出可能的錯誤、安全性風險、效能問題，
並提出改善建議。

輸出請包含：
[程式碼問題]
[改善建議程式碼]
[為什麼這樣改]`,
    use_case:
      "當你接收一支 API，需要 AI 幫你檢查安全性、錯誤處理與資料結構時使用。",
    example_input: `請你扮演資深後端工程師，檢查以下 API 程式碼。

幫我找出可能的錯誤、安全性風險、效能問題，
並提出改善建議。

輸出請包含：
[程式碼問題]
[改善建議程式碼]
[為什麼這樣改] \n app.get('/api/user', async (req, res) => {\n  const id = req.query.id;\n  const user = await db.query(...);\n  res.json(user);\n});`,
    example_output: [
      {
        type: "text",
        data: {
          context:
            "【程式碼問題】\n1. 未進行輸入驗證，可能存在 SQL Injection 安全風險。\n2. 缺乏 try-catch 區塊，若資料庫查詢失敗會導致 server 當機。\n\n【改善建議程式碼】\n```javascript\napp.get('/api/user', async (req, res, next) => {\n  try {\n    const id = parseInt(req.query.id, 10);\n    if (isNaN(id)) {\n      return res.status(400).json({ error: 'Invalid ID format' });\n    }\n\n    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);\n    res.json(user);\n  } catch (error) {\n    next(error);\n  }\n});\n```",
        },
        seq: 0,
      },
    ],
    category_id: "cat-backend-uuid-0000-000000000002", // 後端開發
    tags: [
      "tag-api-uuid-0000-000000000001",
      "tag-security-uuid-0000-000000000002",
      "tag-express-uuid-0000-000000000008",
    ],
    source_url:
      "https://expressjs.com/zh-tw/advanced/best-practice-security.html",
    copy_count: 125,
    favorite_count: 32,
    created_at: "2026-07-01T08:00:00Z",
    updated_at: "2026-07-01T12:00:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000002",
    title: "前端 Debug 助手",
    slug: "frontend-debug-assistant",
    intro: "協助找出 React / Next.js 專案的錯誤原因與除錯線索。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: ["model-claude-uuid-0000-000000000002"],
    prompt_content: `請分析以下 React / Next.js 錯誤訊息，
並給出可能的修復方案及除錯步驟：

[在此輸入錯誤訊息]`,
    use_case:
      "當 React 網頁發生 Runtime Error 或編譯失敗時，用於快速定位問題。",
    example_input: `請分析以下 React / Next.js 錯誤訊息，
並給出可能的修復方案及除錯步驟：
TypeError: Cannot read properties of undefined (reading 'map') at ProductList (ProductList.jsx:12)`,
    example_output: [
      {
        type: "text",
        data: {
          context:
            "【錯誤原因】\nProductList 組件中的資料（如 products）在渲染時尚為 undefined，就直接調用了 .map() 方法。\n\n【解決方案】\n使用 Optional Chaining (`products?.map(...)`) 或短路求值提供預設空陣列 (`(products || []).map(...)`)。",
        },
        seq: 0,
      },
    ],
    category_id: "cat-frontend-uuid-0000-000000000001", // 前端開發
    tags: [
      "tag-react-uuid-0000-000000000003",
      "tag-debug-uuid-0000-000000000004",
      "tag-vite-uuid-0000-000000000009",
    ],
    source_url: "https://react.dev/reference/react",
    copy_count: 98,
    favorite_count: 21,
    created_at: "2026-06-28T09:30:00Z",
    updated_at: "2026-06-28T09:30:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000003",
    title: "玩偶、周邊商品圖形產出",
    slug: "generator-image-prototype",
    intro:
      "用於商品早期創意構思和方案視覺設計。專注於高端產品攝影要素（材質、包裝、印刷清晰度），同時確保設計原創且不侵權。非常適合快速測試多個角色或包裝方案。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: [
      "model-gpt-uuid-0000-000000000001",
      "model-codex-uuid-0000-000000000003",
    ],
    prompt_content: `# ---- Inputs ----
{character_description} = (目標物設定，具體性 + 品質提示)
{short_copy} = (文字設定)

# ---- Prompt ----
prompt = f"""
製作一個以 {character_description} 為主題的[商品名稱，說明想要的視覺設計，以及預期用途]。

概念（Concept）：
[說明概念，構圖要點：背景 / 場景 -> 主題 -> 關鍵細節 -> 限制條件]

包裝上僅能出現以下文字 [完全一致]：
"{short_copy}"
"""

result = client.images.generate(
    model=[使用模型],
    prompt=prompt,
    size=[尺寸大小],
    quality=[圖片品質],
)

save_image(result, [檔案名稱])`,
    use_case: "商品設計, 用於商品早期創意構思和方案視覺設計",
    example_input: `# ---- Inputs ---- 
character_description = 
( 
"一架復古風格的樂高公仔，具有圓潤的外型"、 
"衣服上有兩隻黑貓"、 
"邊緣帶有些微磨損的漆面效果"、 
"經典的童年玩具比例設計"， 
"打造出充滿懷舊感的精緻收藏品" ) 
short_copy = "Classic Memories Edition" 
# ---- Prompt ---- 
prompt = f""" 
製作一個以 {character_description} 為主題的收藏級可動樂高公仔，採用吸塑(blister)包裝。 
概念（Concept）： 
靈感來自孩子們在童年時期曾經玩耍的樂高系列玩具， 是一款充滿懷舊氛圍的精緻收藏品。 

整體應傳達： 
- 溫暖 
- 想像力 
- 童年的美好回憶
 
風格（Style）： 
- 高級玩具商品攝影風格 
- 真實的塑膠與彩繪金屬材質 
- 專業攝影棚燈光 
- 淺景深 
- 清晰精緻的包裝文字印刷 
- 高端零售商品展示效果 

要求： 
- 完全原創設計 
- 不包含任何商標 
- 不包含任何浮水印 
- 不包含任何 Logo 

包裝上僅能出現以下文字（完全一致）： "{short_copy}"
"""

result = client.images.generate(
    model="gpt-image-2",
    prompt=prompt,
    size="1024x1536",
    quality="medium",
)

save_image(result, "LEGO_collectible_toy_gpt-image-2.png")`,
    example_output: [
      {
        type: "image",
        data: {
          context: "/Prompt-Alchemy/LEGO_collectible_toy_gpt-image-2.png",
          alt: "LEGO_collectible_toy_gpt-image-2.png",
          caption: "gpt-image-2",
        },
        seq: 0,
      },
      {
        type: "image",
        data: {
          context: "/Prompt-Alchemy/LEGO_collectible_toy_grok.png",
          alt: "LEGO_collectible_toy_grok.png",
          caption: "grok",
        },
        seq: 1,
      },
      {
        type: "image",
        data: {
          context: "/Prompt-Alchemy/LEGO_collectible_toy_gemini-3-pro-image.png",
          alt: "LEGO_collectible_toy_gemini-3-pro-image.png",
          caption: "gemini-3-pro-image",
        },
        seq: 2,
      },
    ],
    category_id: "cat-utility-uuid-0000-000000000011", // 設計
    tags: [
      "tag-design-uuid-0000-000000000013",
      "tag-drawing-uuid-0000-000000000015",
    ],
    source_url: "",
    copy_count: 99,
    favorite_count: 105,
    created_at: "2026-07-14T14:15:00Z",
    updated_at: "2026-07-14T14:15:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000004",
    title: "資安漏洞檢查清單",
    slug: "security-vulnerabilities-checklist",
    intro: "檢查常見的 Web 與雲端環境風險掃描方式。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: [
      "model-gpt-uuid-0000-000000000001",
      "model-claude-uuid-0000-000000000002",
    ],
    prompt_content: `請提供一份針對以下環境的 Web 應用程式安全檢測清單，
以及常見漏洞的防範建議：

[在此說明技術棧環境]`,
    use_case: "部署前進行安全性弱點自檢，或準備進行滲透測試時。",
    example_input: `請提供一份針對以下環境的 Web 應用程式安全檢測清單，
以及常見漏洞的防範建議：
Web API Node.js environment...`,
    example_output: [
      {
        type: "text",
        data: {
          context:
            "1. 檢查並停用不安全的 HTTP Header (建議使用 helmet 中間件)\n2. 防範 CORS 跨網域資源共享不當設定\n3. 限制 API 請求頻率 (Rate Limiting) 避免 DDoS 攻擊",
        },
        seq: 0,
      },
    ],

    category_id: "cat-security-uuid-0000-000000000003", // 資安相關
    tags: [
      "tag-security-uuid-0000-000000000002",
      "tag-web-uuid-0000-000000000012",
    ],
    source_url: "https://owasp.org/www-project-top-ten/",
    copy_count: 63,
    favorite_count: 15,
    created_at: "2026-06-20T10:00:00Z",
    updated_at: "2026-06-20T10:00:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000005",
    title: "英文翻譯與潤飾",
    slug: "english-translation-polishing",
    intro: "將中文技術文件翻譯為專業流暢的英文，並提供多種口吻潤飾。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: ["model-claude-uuid-0000-000000000002"],
    prompt_content: `請將以下中文技術內容翻譯成專業、自然的英文，
並提供 Academic 與 Professional 兩種口吻：

[在此輸入內容]`,
    use_case: "需要撰寫英文 API 文件、發布 PR 說明或學術發表論文時。",
    example_input: `請將以下中文技術內容翻譯成專業、自然的英文，
並提供 Academic 與 Professional 兩種口吻：
如何使用 React 進行狀態管理...`,
    example_output: [
      {
        type: "text",
        data: {
          context:
            "Academic: How to leverage React for state management within web applications...\nProfessional: Efficient ways to manage state in your React projects...",
        },
        seq: 0,
      },
    ],
    category_id: "cat-translate-uuid-0000-000000000005", // 翻譯助手
    tags: [
      "tag-translation-uuid-0000-000000000006",
      "tag-web-uuid-0000-000000000012",
    ],
    source_url: "",
    copy_count: 180,
    favorite_count: 42,
    created_at: "2026-07-02T11:00:00Z",
    updated_at: "2026-07-02T11:00:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000006",
    title: "Regex 自動生成器",
    slug: "regex-generator",
    intro: "輸入期望匹配與排除的規則，自動產生高效率的正則表達式。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: [
      "model-gpt-uuid-0000-000000000001",
      "model-codex-uuid-0000-000000000003",
    ],
    prompt_content: `請根據以下條件生成一個高效的正則表達式，
並附上測試案例說明：

- 匹配：[條件]
- 排除：[條件]`,
    use_case: "驗證複雜輸入（如密碼複雜度、身分證字號、特定日誌格式）時。",
    example_input:
      "請根據以下條件生成一個高效的正則表達式，並附上測試案例說明：匹配 email 格式，並排除 .com 結尾...",
    example_output: [
      {
        type: "text",
        data: {
          context: "`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(?!com$)[a-zA-Z]{2,}$`",
        },
        seq: 0,
      },
    ],
    category_id: "cat-utility-uuid-0000-000000000006", // 小工具
    tags: [
      "tag-debug-uuid-0000-000000000004",
      "tag-web-uuid-0000-000000000012",
    ],
    source_url: "https://regex101.com/",
    copy_count: 110,
    favorite_count: 29,
    created_at: "2026-06-15T15:45:00Z",
    updated_at: "2026-06-15T15:45:00Z",
    is_active: true,
  },

  {
    id: "prompt-uuid-0001-0000-000000000007",
    title: "SQL 查詢優化",
    slug: "sql-query-optimization",
    intro: "分析 SQL 查詢效能瓶頸與最佳化建議。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: [
      "model-gpt-uuid-0000-000000000001",
      "model-codex-uuid-0000-000000000003",
    ],
    prompt_content: `請分析以下 SQL 查詢的效能瓶頸，
並提供最佳化建議及索引設計：

[在此輸入 SQL 語句]`,
    use_case:
      "資料庫查詢速度過慢，或 Explain 計畫顯示進行全表掃描（Full Table Scan）時。",
    example_input: `請分析以下 SQL 查詢的效能瓶頸，
並提供最佳化建議及索引設計：
"SELECT * FROM orders WHERE user_id = 5 AND status = 'pending' ORDER BY created_at DESC;"`,
    example_output: [
      {
        type: "text",
        data: {
          context:
            "【效能評估】\n如果 user_id 與 status 欄位沒有建立聯合索引（Composite Index），將會導致慢查詢。\n\n【建議索引】\n`CREATE INDEX idx_user_status_created ON orders (user_id, status, created_at DESC);`",
        },
        seq: 0,
      },
    ],
    category_id: "cat-backend-uuid-0000-000000000002", // 後端開發
    tags: [
      "tag-sql-uuid-0000-000000000005",
      "tag-database-uuid-0000-000000000010",
      "tag-mysql-uuid-0000-000000000011",
    ],
    source_url: "",
    copy_count: 77,
    favorite_count: 18,
    created_at: "2026-06-25T14:15:00Z",
    updated_at: "2026-06-25T14:15:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000008",
    title: "動畫、影像產出_Gemini I",
    slug: "generator-video-prototype",
    intro: "用於創意構思和動畫效果。可供快速測試角色或場景的動畫方案。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: ["model-gemini-uuid-0000-000000000004"],
    prompt_content: `製作影片
    Project:
    Title: [影片標題]
    Style: [影像風格描敘,例如: Anime cinematic, Realistic 3D, 好萊塢, Slow-motion]
    Duration: [影片長度,例如: 10 seconds]
    Aspect Ratio: [影片比例,例如: 16:9, 1:1, 9:16]
    FPS: [影片幀率,例如: 24, 30, 60]
    Global Style:
    - [全局風格描述,例如: Soft cinematic lighting, Warm color grading, High detail, Consistent character design, Realistic skateboard physics, Dynamic camera motion]
    Character:
    [角色設定,如果有要求盡量寫多一點]
    Shots:
    - id: [分鏡編號]
    duration: [鏡頭時間長度,例如: 1s, 2s]
    shot: [鏡頭角度類型,例如: Establishing, Low Angle, Wide, Close Up]
    camera: [攝影機運動方式,例如: Dolly Back, Tracking, Side Tracking, Static]
    action: [鏡頭中發生的動作或事件描述]
    `,
    use_case: "影像製作, 用於商業設計或靈感輸出",
    example_input: `製作影片
    Project:
    Title: Skateboard Cat Adventure
    Style: Anime cinematic
    Duration: 10 seconds
    Aspect Ratio: 16:9
    FPS: 24
    Global Style:
    - Soft cinematic lighting
    - Warm color grading
    - High detail
    - Consistent character design
    - Realistic skateboard physics
    - Dynamic camera motion
    Character:
    Girl:
    Age: 17
    Outfit:
    White hoodie
    Beige skirt
    Black backpack
    Skate shoes
    Hair:
    Short black hair
    Cat:
    White short-haired cat
    Shots:
    - id: 1
    duration: 1s
    shot: Establishing
    camera: Dolly Back
    action: Girl crouches on skateboard while cat follows.
    - id: 2
    duration: 1s
    shot: Low Angle
    camera: Tracking
    action: Skateboard accelerates.
    - id: 3
    duration: 1s
    shot: Wide
    camera: Side Tracking
    action: Girl jumps over obstacle.
    - id: 4
    duration: 2s
    shot: Close Up
    camera: Static
    action: Girl pets the white cat while smiling. `,
    example_output: [
      {
        type: "video",
        data: {
          context: "/Prompt-Alchemy/Project___Title_Skateb.mp4",
          alt: "Project___Title_Skateb.mp4",
          caption: "Gemini Veo 3",
        },
        seq: 0,
      },
    ],
    category_id: "cat-utility-uuid-0000-000000000011", // 設計
    tags: [
      "tag-design-uuid-0000-000000000013",
      "tag-drawing-uuid-0000-000000000015",
    ],
    source_url: "",
    copy_count: 112,
    favorite_count: 115,
    created_at: "2026-07-15T18:15:00Z",
    updated_at: "2026-07-15T18:15:00Z",
    is_active: true,
  },
  {
    id: "prompt-uuid-0001-0000-000000000009",
    title: "動畫、影像產出_Gemini II",
    slug: "generator-video-prototype2",
    intro: "用於銜接原先創意構思和動畫效果。可供快速測試角色或場景的動畫方案。",
    content_type_id: "ct-prompt-uuid-0000-000000000001", // prompt
    model_type: ["model-gemini-uuid-0000-000000000004"],
    prompt_content: `製作影片
    Project:
    Title: [影片標題]
    Style: [影像風格描敘,例如: Anime cinematic, Realistic 3D, 好萊塢, Slow-motion]
    Duration: [影片長度,例如: 10 seconds]
    Aspect Ratio: [影片比例,例如: 16:9, 1:1, 9:16]
    FPS: [影片幀率,例如: 24, 30, 60]
    Global Style:
    - [全局風格描述,例如: Soft cinematic lighting, Warm color grading, High detail, Consistent character design, Realistic skateboard physics, Dynamic camera motion]
    Character:
    [角色設定,如果有要求盡量寫多一點]
    The same characters as the video [提供參考影片檔案].
    Shots:
    - id: [分鏡編號]
    duration: [鏡頭時間長度,例如: 1s, 2s]
    shot: [鏡頭角度類型,例如: Establishing, Low Angle, Wide, Close Up]
    camera: [攝影機運動方式,例如: Dolly Back, Tracking, Side Tracking, Static]
    action: [鏡頭中發生的動作或事件描述]
    `,
    use_case: "影像製作, 用於商業設計或靈感輸出",
    example_input: `製作影片
    Project:
    Title: Skateboard Cat Adventure 2
    Style: Anime cinematic
    Duration: 10 seconds
    Aspect Ratio: 16:9
    FPS: 24
    Global Style:
    - Soft cinematic lighting
    - Warm color grading
    - High detail
    - Consistent character design
    - Realistic skateboard physics
    - Dynamic camera motion
    Character:
    Girl:
    Age: 17
    Outfit:
    White hoodie
    Beige skirt
    Black backpack
    Skate shoes
    Hair:
    Short black hair
    Cat:
    White short-haired cat
    The same characters as the video [Project___Title_Skateb.mp4].
    Shots:
    - id: 1
    duration: 2s
    shot: Establishing
    camera: Dolly Back
    action: 女孩用滑板在比賽練習U型場地鍛鍊滑板技巧，貓在旁邊慵懶的睡覺
    - id: 2
    duration: 1s
    shot: Low Angle
    camera: Tracking
    action: Skateboard accelerates and reach the highest point with skateboard rotation.
    - id: 3
    duration: 2s
    shot: Wide
    camera: Front angle
    action: 女孩很開心的跟貓分享完成高難度動作，用日文說‘太好了’.
    - id:4
    duration: 1s
    shot: side
    camera: side tracking
    action: 一隻藍綠色的和尚鸚鵡快速飛過，吸引到貓的注意力.
    - id: 5
    duration: 1s
    shot: single from cat
    camera: narrow
    action: 從貓的視野看到那隻藍綠色和尚鸚鵡在打招呼說’hello’.
    -id:6
    duration: 3s
    shot: Close Up
    camera: Static
    action: 貓到處追著藍綠色和尚鸚鵡，不斷的‘喵喵’叫，女孩表現出無奈受不了的樣子，雙手抱頭。 
    `,
    example_output: [
      {
        type: "video",
        data: {
          context: "/Prompt-Alchemy/Project___Title_Skatebo2.mp4",
          alt: "Project___Title_Skatebo2.mp4",
          caption: "Gemini Veo 3",
        },
        seq: 0,
      },
    ],
    category_id: "cat-utility-uuid-0000-000000000011", // 設計
    tags: [
      "tag-design-uuid-0000-000000000013",
      "tag-drawing-uuid-0000-000000000015",
    ],
    source_url: "",
    copy_count: 52,
    favorite_count: 35,
    created_at: "2026-07-15T18:25:00Z",
    updated_at: "2026-07-15T18:25:00Z",
    is_active: true,
  },
];

// 4. Favorites Table (Composite PK: user_id, skill_item_id)
export const favoritesTable = [
  {
    user_id: "user-member-uuid-0000-000000000002",
    skill_item_id: "prompt-uuid-0001-0000-000000000001",
    created_at: "2026-07-02T10:00:00Z",
    sort_order: 1,
    memo: "API 審查必備",
  },
  {
    user_id: "user-member-uuid-0000-000000000002",
    skill_item_id: "prompt-uuid-0001-0000-000000000002",
    created_at: "2026-07-02T10:15:00Z",
    sort_order: 2,
    memo: "前端 Debug",
  },
];

// Lookup Helpers & Selectors
export function getParameterById(id) {
  return parametersTable.find((p) => p.id === id);
}

export function getParameterName(id) {
  const p = getParameterById(id);
  return p ? p.name : "";
}

export function getParametersByType(type) {
  return parametersTable.filter((p) => p.type === type && p.is_active);
}

export function getPrompts() {
  return skillItemsTable.filter(
    (item) => item.is_active
  );
}

export function getPromptById(id) {
  return skillItemsTable.find((item) => item.id === id);
}
