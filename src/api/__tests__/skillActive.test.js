import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isSkillActive,
  createSkill,
  updateSkill,
  setSkillActive,
  getSkillById,
  loginAdmin,
} from "../adminApi";
import { getPublishedPrompts } from "../promptApi";
import { skillItemsTable, getParameterName } from "../mocks/mockData";

let mockBackendSkills = [];

vi.mock("../apiClient", () => {
  return {
    apiRequest: vi.fn(async (endpoint, options = {}) => {
      const method = options.method || "GET";
      const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body;

      if (endpoint === "/auth/login" && method === "POST") {
        return { status: "success", token: "mock-admin-token" };
      }

      if (endpoint === "/auth/me" && method === "GET") {
        return { status: "success", user: { id: "admin-id", email: "admin@example.com", name: "James Admin", role: "admin" } };
      }

      if (endpoint === "/admin/skills" && method === "POST") {
        const newSkill = { 
          ...body, 
          id: body.id || `prompt-uuid-mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          isActive: body.isActive ?? true,
          is_active: body.isActive ?? true,
        };
        mockBackendSkills.push(newSkill);
        return { status: "success", data: newSkill };
      }

      if (endpoint.startsWith("/admin/skills/") && method === "PUT") {
        const id = endpoint.split("/").pop();
        const idx = mockBackendSkills.findIndex(s => s.id === id);
        if (idx >= 0) {
          mockBackendSkills[idx] = { 
            ...mockBackendSkills[idx], 
            ...body,
            isActive: body.isActive ?? mockBackendSkills[idx].isActive,
            is_active: body.isActive ?? mockBackendSkills[idx].isActive,
          };
          return { status: "success", data: mockBackendSkills[idx] };
        }
        throw new Error("Skill not found");
      }

      if (endpoint.startsWith("/admin/skills/") && method === "GET") {
        const id = endpoint.split("/").pop();
        const skill = mockBackendSkills.find(s => s.id === id);
        if (skill) {
          return { status: "success", data: skill };
        }
        throw new Error("Skill not found");
      }

      if (endpoint.startsWith("/prompts") && method === "GET") {
        const activePrompts = mockBackendSkills
          .filter(s => s.isActive !== false && s.is_active !== false)
          .map(s => ({
            ...s,
            // Format tags as `{ id, name }` for frontend mapRemoteTag
            tags: (s.tags || []).map(t => {
              if (typeof t === "object") return t;
              return { id: t, name: getParameterName(t) || t };
            }),
          }));
        return { status: "success", data: activePrompts };
      }

      return { status: "success", data: [] };
    }),
  };
});

describe("isSkillActive", () => {
  it("prefers camelCase isActive over snake_case", () => {
    expect(isSkillActive({ isActive: false, is_active: true })).toBe(false);
    expect(isSkillActive({ isActive: true, is_active: false })).toBe(true);
  });

  it("falls back to snake_case is_active for seeded records", () => {
    expect(isSkillActive({ is_active: false })).toBe(false);
    expect(isSkillActive({ is_active: true })).toBe(true);
  });

  it("defaults to true when neither field is present", () => {
    expect(isSkillActive({})).toBe(true);
  });

  it("defaults to true for null and undefined", () => {
    expect(isSkillActive(null)).toBe(true);
    expect(isSkillActive(undefined)).toBe(true);
  });
});

const mockSkillData = (overrides = {}) => ({
  title: "測試",
  slug: `test-slug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  intro: "測試簡介",
  contentTypeId: "62891464-fb7e-4295-b544-a3b78936722b",
  categoryId: "755f3568-2333-4709-b916-582eae69e195",
  promptContent: "You are a helpful assistant.",
  useCase: "日常輔助",
  exampleInput: "你好",
  exampleOutput: "你好！請問有什麼我可以協助您的？",
  ...overrides,
});

describe("skill active field writes", () => {
  beforeEach(async () => {
    localStorage.clear();
    mockBackendSkills = skillItemsTable.map((s) => ({
      ...s,
      isActive: s.is_active ?? true,
    }));
    await loginAdmin({ email: "admin@example.com", password: "Admin1234" });
  });

  it("createSkill writes both isActive and is_active", async () => {
    const skill = await createSkill(mockSkillData({ isActive: false }));

    expect(skill.isActive).toBe(false);
    expect(skill.is_active).toBe(false);
  });

  it("createSkill defaults to active when isActive is omitted", async () => {
    const skill = await createSkill(mockSkillData());

    expect(skill.isActive).toBe(true);
    expect(skill.is_active).toBe(true);
  });

  it("createSkill no longer stores a status field", async () => {
    const skill = await createSkill(mockSkillData());

    expect(skill.status).toBeUndefined();
  });

  it("updateSkill keeps both fields in sync", async () => {
    const created = await createSkill(mockSkillData());
    const updated = await updateSkill(created.id, { isActive: false });

    expect(updated.isActive).toBe(false);
    expect(updated.is_active).toBe(false);
  });

  it("setSkillActive deactivates a skill", async () => {
    const created = await createSkill(mockSkillData());
    await setSkillActive(created.id, false);
    const found = await getSkillById(created.id);

    expect(isSkillActive(found)).toBe(false);
  });

  it("setSkillActive reactivates a deactivated skill", async () => {
    const created = await createSkill(mockSkillData({ isActive: false }));
    await setSkillActive(created.id, true);
    const found = await getSkillById(created.id);

    expect(isSkillActive(found)).toBe(true);
  });
});

describe("deactivating a seeded skill hides it from the public list", () => {
  beforeEach(async () => {
    localStorage.clear();
    mockBackendSkills = skillItemsTable.map((s) => ({
      ...s,
      isActive: s.is_active ?? true,
    }));
    await loginAdmin({ email: "admin@example.com", password: "Admin1234" });
  });

  // 這是本次設計的核心風險：seed 資料只有 snake_case 的 is_active，
  // 前台 getPublishedPrompts 讀的也是它。只寫 camelCase 會讓停用完全失效。
  it("removes the skill from getPublishedPrompts after deactivating", async () => {
    const before = await getPublishedPrompts();
    const target = before[0];
    expect(target).toBeDefined();

    await setSkillActive(target.id, false);

    const after = await getPublishedPrompts();
    expect(after.find((p) => p.id === target.id)).toBeUndefined();
    expect(after.length).toBe(before.length - 1);
  });
});
