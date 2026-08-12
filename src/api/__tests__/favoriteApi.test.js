import { describe, it, expect, beforeEach, vi } from "vitest";

const mockApiRequest = vi.fn();
vi.mock("../apiClient.js", () => ({
  apiRequest: (...args) => mockApiRequest(...args),
}));

describe("getFavoritedSkillsAPI", () => {
  beforeEach(() => {
    vi.resetModules();
    mockApiRequest.mockReset();
  });

  it("打 GET /favorites?itemType=skill，把 snake_case 資料正規化並帶出 favoriteId", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [
        {
          id: "agent-skill-uuid-0001",
          name: "matt",
          repo_owner: "mattpocock",
          repo_name: "skills",
          skill_slug: "*",
          category_name: "小工具",
          stargazers_count: 210731,
          favorite_count: 6,
          claude_install_method: true,
          codex_install_method: true,
          claude_plugin_name: "mattpocock-skills",
          claude_marketplace_name: "mattpocock",
          git_clone_method: false,
          doc_url: "https://raw.githubusercontent.com/mattpocock/skills/main/README.md",
          favorite_id: 42,
          favorited_at: "2026-08-11T09:00:00Z",
          sort_order: 0,
        },
      ],
    });

    const { getFavoritedSkillsAPI } = await import("../favoriteApi");
    const skills = await getFavoritedSkillsAPI();

    expect(mockApiRequest).toHaveBeenCalledWith("/favorites?itemType=skill", {
      method: "GET",
    });
    expect(skills).toHaveLength(1);
    expect(skills[0]).toMatchObject({
      id: "agent-skill-uuid-0001",
      name: "matt",
      repoOwner: "mattpocock",
      categoryName: "小工具",
      favoriteId: 42,
    });
  });

  it("id 不是字串的資料被過濾掉", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [{ id: null, name: "broken" }],
    });

    const { getFavoritedSkillsAPI } = await import("../favoriteApi");
    const skills = await getFavoritedSkillsAPI();

    expect(skills).toEqual([]);
  });
});
