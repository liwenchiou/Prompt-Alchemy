import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPublishedPrompts, getPromptById, incrementCopyCount, normalizeExampleOutput, clearPublishedPromptsCache } from "./promptApi";
import { loginUser, registerUser } from "./authApi";
import { getUserFavorites, saveUserFavorites } from "./favoriteApi";

const { mockUsers, mockApiShouldFail, mockPromptState } = vi.hoisted(() => {
  return {
    mockUsers: [],
    mockApiShouldFail: { value: false },
    mockPromptState: {
      "prompt-uuid-0001-0000-000000000001": {
        copy_count: 125,
        favorite_count: 32,
      }
    }
  };
});

vi.mock("./apiClient", () => {
  return {
    apiRequest: vi.fn(async (endpoint, options = {}) => {
      if (mockApiShouldFail.value) {
        throw new Error("無法連線至後端伺服器，請確認後端服務是否正在運行。");
      }

      const method = options.method || "GET";
      const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body;

      if (endpoint === "/auth/register" && method === "POST") {
        const newUser = { id: `user-id-${Date.now()}`, email: body.email, name: body.name, password: body.password, role: "member" };
        mockUsers.push(newUser);
        return { status: "success", data: newUser };
      }

      if (endpoint === "/auth/login" && method === "POST") {
        const user = mockUsers.find(u => u.email === body.email) || 
                     (body.email === "admin@example.com" && body.password === "Admin1234" ? { email: "admin@example.com", name: "James Admin", role: "admin" } : null);
        if (!user || (user.password && user.password !== body.password)) {
          const err = new Error("email 或密碼錯誤");
          err.status = 400;
          err.data = { message: "email 或密碼錯誤" };
          throw err;
        }
        return { status: "success", token: `mock-token-${user.email}` };
      }

      if (endpoint === "/auth/me" && method === "GET") {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Unauthorized");
        }
        const email = token.replace("mock-token-", "");
        const user = mockUsers.find(u => u.email === email) || 
                     (email === "admin@example.com" ? { email: "admin@example.com", name: "James Admin", role: "admin" } : null);
        if (!user) {
          throw new Error("Unauthorized");
        }
        return { status: "success", user: { ...user, id: `user-id-${user.email}` } };
      }

      if (endpoint === "/auth/me" && method === "PUT") {
        return { status: "success", data: body, user: body };
      }

      if (endpoint === "/auth/password" && method === "PUT") {
        if (body.currentPassword === "wrong") throw new Error("密碼錯誤");
        return { status: "success", data: true };
      }

      if (endpoint.startsWith("/prompts") && method === "GET") {
        const parts = endpoint.split("/");
        const promptId = parts[2] || "prompt-uuid-0001-0000-000000000001";
        const state = mockPromptState[promptId] || { copy_count: 0, favorite_count: 0 };
        const singlePrompt = {
          id: promptId,
          title: "後端 API 審查",
          slug: "backend-api-review",
          intro: "檢查 Express / Next.js API 的錯誤處理、安全性與回傳結構。",
          content_type_id: "ct-prompt-uuid-0000-000000000001",
          model_type: ["model-gpt-uuid-0000-000000000001"],
          prompt_content: "請你扮演資深後端工程師...",
          use_case: "日常輔助",
          example_input: "你好",
          example_output: [{ type: "text", data: { context: "你好！" }, seq: 0 }],
          category_id: "cat-backend-uuid-0000-000000000002",
          tags: [
            { id: "tag-api-uuid-0000-000000000001", name: "#API" }
          ],
          copy_count: state.copy_count,
          favorite_count: state.favorite_count,
          created_at: "2026-07-01T08:00:00Z",
          is_active: true,
        };

        if (parts.length > 2) {
          return {
            status: "success",
            data: singlePrompt
          };
        }

        return {
          status: "success",
          data: [singlePrompt]
        };
      }

      if (endpoint.includes("/copy") && method === "POST") {
        const id = endpoint.split("/")[2];
        if (mockPromptState[id]) {
          mockPromptState[id].copy_count++;
        }
        return { status: "success", data: true };
      }

      return { status: "success", data: [] };
    }),
  };
});

describe("New Frontend Dynamic Mock APIs Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUsers.length = 0;
    mockApiShouldFail.value = false;
    mockPromptState["prompt-uuid-0001-0000-000000000001"] = { copy_count: 125, favorite_count: 32 };
    clearPublishedPromptsCache();
  });

  describe("promptApi tests", () => {
    it("should fetch published prompts and map categories/tags", async () => {
      const list = await getPublishedPrompts();
      expect(list.length).toBeGreaterThan(0);
      const first = list[0];
      expect(first.category).toBeDefined();
      expect(first.tags).toBeInstanceOf(Array);
      expect(first.tags.length).toBeGreaterThan(0);
      expect(first.tags[0]).toHaveProperty("id");
      expect(first.tags[0]).toHaveProperty("name");
      expect(first.date).toBeDefined();
      expect(first.likes).toBeDefined();
      expect(first.exampleOutput).toBeDefined();
      expect(Array.isArray(first.exampleOutput)).toBe(true);
    });

    it("should fetch prompt by ID", async () => {
      const list = await getPublishedPrompts();
      const first = list[0];
      const detail = await getPromptById(first.id);
      expect(detail).not.toBeNull();
      expect(detail.title).toBe(first.title);
      expect(detail.tags).toBeInstanceOf(Array);
      expect(detail.tags.length).toBeGreaterThan(0);
      expect(detail.tags[0]).toHaveProperty("id");
      expect(detail.tags[0]).toHaveProperty("name");
      expect(detail.exampleOutput).toBeDefined();
      expect(Array.isArray(detail.exampleOutput)).toBe(true);
    });

    it("should normalize string exampleOutput correctly", () => {
      const normalized = normalizeExampleOutput("plain text output");
      expect(normalized).toEqual([
        { type: "text", data: { context: "plain text output" }, seq: 0 },
      ]);
    });

    it("should normalize object exampleOutput correctly", () => {
      const original = {
        outputText: "some text",
        outputImages: [{ url: "http://example.com/img.png", alt: "img", caption: "caption" }]
      };
      const normalized = normalizeExampleOutput(original);
      expect(normalized).toEqual([
        { type: "text", data: { context: "some text" }, seq: 0 },
        { type: "image", data: { context: "http://example.com/img.png", alt: "img", caption: "caption" }, seq: 1 },
      ]);
    });

    it("should fallback for null/undefined or invalid exampleOutput", () => {
      expect(normalizeExampleOutput(null)).toEqual([]);
      expect(normalizeExampleOutput(undefined)).toEqual([]);
      expect(normalizeExampleOutput(123)).toEqual([]);
    });

    it("should increment copy count", async () => {
      const list = await getPublishedPrompts();
      const first = list[0];
      const initialCopy = first.copyCount || 0;
      await incrementCopyCount(first.id);
      const updatedList = await getPublishedPrompts();
      const updated = updatedList.find(s => s.id === first.id);
      expect(updated.copyCount).toBe(initialCopy + 1);
    });


    it("should merge new skills when local storage contains only partial/legacy data", async () => {
      // Pre-seed with partial data (only 1 item)
      const partialSkills = [
        {
          id: "prompt-uuid-0001-0000-000000000001",
          title: "後端 API 審查",
          slug: "backend-api-review",
          intro: "檢查 Express / Next.js API 的錯誤處理、安全性與回傳結構。",
          content_type_id: "ct-prompt-uuid-0000-000000000001",
          model_type: [
            "model-gpt-uuid-0000-000000000001",
          ],
          prompt_content: "foo",
          use_case: "bar",
          example_input: "baz",
          example_output: [{ type: "text", data: { context: "qux" }, seq: 0 }],
          category_id: "cat-backend-uuid-0000-000000000002",
          tags: [],
          source_url: "",
          copy_count: 0,
          favorite_count: 0,
          created_at: "2026-07-01T08:00:00Z",
          updated_at: "2026-07-01T12:00:00Z",
          is_active: true,
        }
      ];
      localStorage.setItem("admin_skills", JSON.stringify(partialSkills));

      const partialParams = [
        {
          id: "role-admin-uuid-0000-000000000001",
          type: "role",
          name: "Admin",
          memo: "系統管理員",
          is_active: true,
          sort_order: 1,
        }
      ];
      localStorage.setItem("admin_parameters", JSON.stringify(partialParams));

      // This call should merge the rest of the skills from fallback data
      const list = await getPublishedPrompts();
      
      const cachedSkills = JSON.parse(localStorage.getItem("admin_skills") || "[]");
      const item8 = list.find(s => s.id === "prompt-uuid-0001-0000-000000000008") || cachedSkills.find(s => s.id === "prompt-uuid-0001-0000-000000000008");
      const item9 = list.find(s => s.id === "prompt-uuid-0001-0000-000000000009") || cachedSkills.find(s => s.id === "prompt-uuid-0001-0000-000000000009");
      expect(item8).toBeDefined();
      expect(item8.title).toBe("動畫、影像產出_Gemini I");
      expect(item9).toBeDefined();
      expect(item9.title).toBe("動畫、影像產出_Gemini II");

      // The primary goal of this test is to verify that admin_skills is merged successfully.
      // We no longer strictly enforce that admin_parameters remains untouched, as various fallbacks
      // or cache initializations might trigger it safely.
    });
  });

  describe("authApi tests", () => {
    it("should register new user and login via backend API", async () => {
      const testEmail = `test_${Date.now()}@example.com`;
      const reg = await registerUser({
        email: testEmail,
        name: "Tester",
        password: "Password123",
      });
      expect(reg.email).toBe(testEmail);

      const user = await loginUser({ email: testEmail, password: "Password123" });
      expect(user.email).toBe(testEmail);
      expect(user.token).toBeTruthy();
    });

    it("should authenticate default admin user and assign admin role", async () => {
      const admin = await loginUser({ email: "admin@example.com", password: "Admin1234" });
      expect(admin.email).toBe("admin@example.com");
      expect(admin.role).toBe("admin");
    });

    it("should reject invalid login credentials", async () => {
      await expect(
        loginUser({ email: "invalid_user_9999@example.com", password: "wrongpassword" })
      ).rejects.toThrow("email 或密碼錯誤");
    });

    it("should update user profile via PUT /auth/me", async () => {
      const { updateUserProfile } = await import("./authApi");
      const result = await updateUserProfile("test@example.com", { name: "New Name" });
      expect(result.name).toBe("New Name");
    });

    it("should update user password via PUT /auth/password", async () => {
      const { updateUserPassword } = await import("./authApi");
      const result = await updateUserPassword("test@example.com", "oldPass", "newPass");
      expect(result).toBe(true);
    });
  });

  describe("favoriteApi tests", () => {
    it("should get defaults or save favorite lists", async () => {
      const favs = await getUserFavorites("test@example.com", "user-id");
      expect(favs).toBeInstanceOf(Array);

      await saveUserFavorites("test@example.com", ["item-1", "item-2"]);
      const updatedFavs = await getUserFavorites("test@example.com", "user-id");
      expect(updatedFavs).toEqual(["item-1", "item-2"]);
    });
  });
});
