/**
 * Playwright E2E Mock API Helper
 * 當後端 API 伺服器未開啟或連線失敗時，自動透過 page.route 攔截並回傳標準 JSON 模擬資料，
 * 確保端到端測試能夠獨立且穩定地執行。
 */

export async function setupMockApiRoutes(page) {
  const mockFaqs = [
    {
      id: "faq-admin-1",
      question: "Prompt 鍊金坊是什麼？",
      answer: "Prompt 鍊金坊是一個整理與分享 AI Prompt、Skill 的收藏平台。",
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "faq-admin-2",
      question: "沒有註冊帳號也可以瀏覽 Prompt 嗎？",
      answer: "可以，未登入的訪客依然可以自由搜尋、瀏覽與複製公開 Prompt。",
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockAgentSkills = [
    {
      id: "agent-skill-uuid-0001-0000-000000000001",
      name: "frontend-design",
      description:
        "Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one.",
      intro: "打造有記憶點的前端視覺設計指引。",
      repoOwner: "anthropics",
      repoName: "skills",
      skillSlug: "frontend-design",
      creatorName: "anthropics",
      creatorAvatarUrl: "https://avatars.githubusercontent.com/u/76263028?v=4",
      creatorProfileUrl: "https://github.com/anthropics",
      license: "MIT",
      categoryId: "agent-category-frontend",
      category: "前端開發",
      stargazersCount: 167174,
      copyCount: 12,
      favoriteCount: 3,
      isHot: true,
      isActive: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "agent-skill-uuid-0002-0000-000000000002",
      name: "lazy-senior",
      description:
        "讓 AI 擁有最強的「極簡主義工程師」思維，堅守 YAGNI 原則，寫最少、最安全的程式碼。",
      intro: "極簡主義工程師思維指南。",
      repoOwner: "liwenchiou",
      repoName: "liai",
      skillSlug: "lazy-senior",
      creatorName: "liwenchiou",
      creatorAvatarUrl: "https://avatars.githubusercontent.com/u/30397088?v=4",
      creatorProfileUrl: "https://github.com/liwenchiou",
      license: "MIT",
      categoryId: "agent-category-backend",
      category: "後端開發",
      stargazersCount: 12,
      copyCount: 1,
      favoriteCount: 0,
      isHot: false,
      isActive: true,
      createdAt: "2025-01-02T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    },
    {
      id: "agent-skill-uuid-0003-0000-000000000003",
      name: "doc-url-demo",
      description: "示範透過 docUrl 直接渲染 README/SKILL.md 內容。",
      intro: "備用摘要（docUrl 抓取失敗時 fallback 顯示）。",
      repoOwner: "example-org",
      repoName: "doc-url-demo-repo",
      skillSlug: "doc-url-demo",
      creatorName: "example-org",
      creatorAvatarUrl: "",
      creatorProfileUrl: "https://github.com/example-org",
      license: "MIT",
      categoryId: "agent-category-frontend",
      category: "前端開發",
      stargazersCount: 42,
      copyCount: 0,
      favoriteCount: 0,
      isHot: false,
      isActive: true,
      createdAt: "2025-01-03T00:00:00.000Z",
      updatedAt: "2025-01-03T00:00:00.000Z",
      docUrl:
        "https://raw.githubusercontent.com/example-org/doc-url-demo-repo/main/SKILL.md",
    },
  ];

  const safeFulfill = async (route, fulfillOptions) => {
    try {
      await route.fulfill(fulfillOptions);
    } catch {
      // 避免重複 fulfill 拋出例外
    }
  };

  // 1. FAQ 列表 Mock
  await page.route("**/faqs/", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 後端沒開或連線失敗，自動回傳 Mock
    }
    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        data: mockFaqs.filter((f) => f.isActive),
      }),
    });
  });

  // 2. 會員與管理者登入 /auth/login Mock
  await page.route("**/auth/login", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock 登入
    }
    const postData = JSON.parse(route.request().postData() || "{}");
    const { email, password } = postData;

    if (
      (email === "member@example.com" || email === "admin@example.com") &&
      (password === "Member1234" || password === "Admin1234")
    ) {
      const role = email.includes("admin") ? "admin" : "member";
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          token: `mock-jwt-token-${role}`,
          user: {
            id: `user-${role}-id`,
            email,
            name: role === "admin" ? "系統管理者" : "測試會員",
            role,
          },
        }),
      });
    } else {
      await safeFulfill(route, {
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          message: "email 或密碼錯誤",
        }),
      });
    }
  });

  // 3. 取得個人資訊 /auth/me Mock
  await page.route("**/auth/me", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock /auth/me
    }
    const authHeader = route.request().headers()["authorization"] || "";
    const isAdmin = authHeader.includes("admin");

    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        user: {
          id: isAdmin ? "user-admin-id" : "user-member-id",
          email: isAdmin ? "admin@example.com" : "member@example.com",
          name: isAdmin ? "系統管理者" : "測試會員",
          role: isAdmin ? "admin" : "member",
        },
      }),
    });
  });

  // 4. 個人收藏 /favorites Mock
  await page.route("**/favorites**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock
    }
    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        data: ["prompt-uuid-0001-0000-000000000001"],
      }),
    });
  });

  // 5. 後台會員管理 /admin/users Mock
  await page.route("**/admin/users**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock
    }
    const method = route.request().method();
    if (method === "GET") {
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: [
            {
              id: "u-1",
              name: "測試會員",
              email: "member@example.com",
              role: "member",
              isActive: true,
              createdAt: "2025-01-01T00:00:00.000Z",
            },
            {
              id: "u-2",
              name: "系統管理者",
              email: "admin@example.com",
              role: "admin",
              isActive: true,
              createdAt: "2025-01-01T00:00:00.000Z",
            },
          ],
        }),
      });
    } else if (method === "POST" || method === "PUT") {
      const postData = JSON.parse(route.request().postData() || "{}");
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: {
            id: postData.id || "u-new",
            name: postData.name || "新會員",
            email: postData.email || "newuser@example.com",
            role: postData.role || "member",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        }),
      });
    } else {
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success" }),
      });
    }
  });

  // 6. 後台參數 /admin/parameters Mock
  await page.route("**/admin/parameters**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock
    }
    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        data: [
          { id: "p-1", type: "role", name: "member", label: "一般會員" },
          { id: "p-2", type: "role", name: "admin", label: "管理者" },
        ],
      }),
    });
  });

  // 7. 意見回饋 /contacts Mock
  await page.route("**/contacts**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock
    }
    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        message: "意見回饋已成功送出！",
      }),
    });
  });

  // 8. 後台技能 /admin/skills Mock
  await page.route("**/admin/skills**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock
    }
    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        data: [
          {
            id: "prompt-uuid-0001-0000-000000000001",
            title: "後端 API 審查",
            description: "請你扮演資深後端工程師",
            contentTypeId: "prompt",
            categoryId: "backend",
            isActive: true,
          },
        ],
      }),
    });
  });

  // 9. Agent Skills 前台瀏覽 /agent-skills Mock（列表 + 詳情）
  await page.route("**/agent-skills**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 後端沒開或連線失敗，自動回傳 Mock
    }

    const url = new URL(route.request().url());
    const detailMatch = url.pathname.match(/\/agent-skills\/([^/]+)$/);

    if (detailMatch) {
      const target = mockAgentSkills.find((s) => s.id === detailMatch[1]);
      await safeFulfill(route, {
        status: target ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(
          target
            ? { status: "success", data: target }
            : { status: "error", message: "找不到該 Agent Skill" }
        ),
      });
      return;
    }

    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const categoryId = url.searchParams.get("categoryId") || "";
    const filtered = mockAgentSkills.filter((s) => {
      if (
        keyword &&
        !(
          s.name.toLowerCase().includes(keyword) ||
          s.intro.toLowerCase().includes(keyword)
        )
      ) {
        return false;
      }
      if (categoryId && s.categoryId !== categoryId) return false;
      return true;
    });

    await safeFulfill(route, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", data: filtered }),
    });
  });

  // 10. 後台 FAQ /admin/faqs Mock
  await page.route("**/admin/faqs**", async (route) => {
    try {
      const response = await route.fetch();
      if (response.ok()) {
        await safeFulfill(route, { response });
        return;
      }
    } catch {
      // 降級 Mock
    }
    const method = route.request().method();
    if (method === "GET") {
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: mockFaqs,
        }),
      });
    } else if (method === "POST") {
      const postData = JSON.parse(route.request().postData() || "{}");
      const newItem = {
        id: `faq-new-${Date.now()}`,
        question: postData.question || "Mock Question",
        answer: postData.answer || "Mock Answer",
        sortOrder: postData.sortOrder ? Number(postData.sortOrder) : 99,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockFaqs.push(newItem);
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: newItem,
        }),
      });
    } else if (method === "PUT" || method === "PATCH") {
      const postData = JSON.parse(route.request().postData() || "{}");
      const url = route.request().url();
      const idMatch = url.match(/\/faqs\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;

      let item = mockFaqs.find((f) => f.id === targetId) || mockFaqs[mockFaqs.length - 1];
      if (item) {
        if (postData.question) item.question = postData.question;
        if (postData.answer) item.answer = postData.answer;
        if (postData.sortOrder !== undefined) item.sortOrder = Number(postData.sortOrder);
        if (postData.isActive !== undefined) item.isActive = Boolean(postData.isActive);
        item.updatedAt = new Date().toISOString();
      }
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: item,
        }),
      });
    } else if (method === "DELETE") {
      const url = route.request().url();
      const idMatch = url.match(/\/faqs\/([^/?]+)/);
      const targetId = idMatch ? idMatch[1] : null;

      let item = mockFaqs.find((f) => f.id === targetId) || mockFaqs[mockFaqs.length - 1];
      if (item) {
        item.isActive = false;
        item.updatedAt = new Date().toISOString();
      }
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: item,
        }),
      });
    } else {
      await safeFulfill(route, {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: mockFaqs[0],
        }),
      });
    }
  });
}
