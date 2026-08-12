import { describe, it, expect, beforeEach, vi } from "vitest";

const mockApiRequest = vi.fn();
vi.mock("../apiClient", () => ({
  apiRequest: (...args) => mockApiRequest(...args),
}));

// normalizeAgentSkill 是 getAgentSkills／getAgentSkillById 共用的正規化函式，
// 直接測它比透過 API 呼叫間接測更貼近它實際負責的職責（欄位映射）。
// 11 號票：Claude Plugin 專屬欄位（claudeInstallMethod 等）淘汰，改用
// installKind／supportedAgents（見後端 09 號票新契約）。
describe("normalizeAgentSkill — installKind／supportedAgents 欄位映射", () => {
  beforeEach(() => {
    vi.resetModules();
    mockApiRequest.mockReset();
  });

  it("映射 installKind／supportedAgents，不再有 claudeInstallMethod 等舊欄位", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [
        {
          id: "1",
          repoOwner: "mattpocock",
          repoName: "skills",
          skillSlug: "*",
          installKind: "full_package",
          supportedAgents: ["codex", "claude-code"],
        },
      ],
    });

    const { getAgentSkills } = await import("../agentSkillApi");
    const [skill] = await getAgentSkills();

    expect(skill.installKind).toBe("full_package");
    expect(skill.supportedAgents).toEqual(["codex", "claude-code"]);
    expect(skill.claudeInstallMethod).toBeUndefined();
    expect(skill.codexInstallMethod).toBeUndefined();
    expect(skill.claudePluginName).toBeUndefined();
    expect(skill.claudeMarketplaceName).toBeUndefined();
  });

  it("supportedAgents 缺漏時 fallback 成空陣列，不是 undefined", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [{ id: "1", installKind: "git_clone" }],
    });

    const { getAgentSkills } = await import("../agentSkillApi");
    const [skill] = await getAgentSkills();

    expect(skill.supportedAgents).toEqual([]);
  });
});

// repoOwner 篩選清單比照既有 getAgentSkillCategories 的模式：純前端從已抓回來的
// Agent Skill 全部清單去重算出來，後端不用新增 /agent-skills/repo-owners 端點
// （見 CONTEXT.md agent-skill 章節與這次 grilling 的決策）。
describe("getAgentSkillRepoOwners", () => {
  beforeEach(() => {
    vi.resetModules();
    mockApiRequest.mockReset();
  });

  it("從 getAgentSkills 清單去重取出 repoOwner 與對應的 avatarUrl，依第一次出現的順序排列", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [
        {
          id: "1",
          repoOwner: "mattpocock",
          creatorAvatarUrl: "https://avatars.githubusercontent.com/mattpocock",
        },
        {
          id: "2",
          repoOwner: "anthropics",
          creatorAvatarUrl: "https://avatars.githubusercontent.com/anthropics",
        },
        {
          id: "3",
          repoOwner: "mattpocock",
          creatorAvatarUrl: "https://avatars.githubusercontent.com/mattpocock",
        },
      ],
    });

    const { getAgentSkillRepoOwners } = await import("../agentSkillApi");
    const owners = await getAgentSkillRepoOwners();

    expect(owners).toEqual([
      { repoOwner: "mattpocock", avatarUrl: "https://avatars.githubusercontent.com/mattpocock" },
      { repoOwner: "anthropics", avatarUrl: "https://avatars.githubusercontent.com/anthropics" },
    ]);
  });

  it("repoOwner 為空字串的資料不列入清單", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [
        { id: "1", repoOwner: "", creatorAvatarUrl: "" },
        { id: "2", repoOwner: "mattpocock", creatorAvatarUrl: "" },
      ],
    });

    const { getAgentSkillRepoOwners } = await import("../agentSkillApi");
    const owners = await getAgentSkillRepoOwners();

    expect(owners).toEqual([{ repoOwner: "mattpocock", avatarUrl: "" }]);
  });
});
