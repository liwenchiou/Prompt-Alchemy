import { apiRequest } from "./apiClient";

// 匯出給 favoriteApi／recipeApi 重用：收藏清單、Recipe 內容回傳的 Skill 物件
export function normalizeAgentSkill(item) {
  if (typeof item?.id !== "string" || !item.id) return null;

  return {
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    intro: item.intro || "",
    repoOwner: item.repoOwner || "",
    repoName: item.repoName || "",
    skillSlug: item.skillSlug || "",
    creatorName: item.creatorName || "",
    creatorAvatarUrl: item.creatorAvatarUrl || "",
    creatorProfileUrl: item.creatorProfileUrl || "",
    license: item.license || "",
    categoryId: item.categoryId || "",
    categoryName: item.category || "",
    stargazersCount: item.stargazersCount || 0,
    copyCount: item.copyCount || 0,
    favoriteCount: item.favoriteCount || 0,
    isHot: item.isHot ?? false,
    isActive: item.isActive ?? true,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    repoDescription: item.repoDescription || "",
    repoOwnerAvatarUrl: item.repoOwnerAvatarUrl || "",
    readmeExcerpt: item.readmeExcerpt || "",
    excerptSource: item.excerptSource || "none",

    docUrl: item.docUrl || "",

    installKind: item.installKind,
    supportedAgents: item.supportedAgents || [],
  };
}

// 無篩選條件（全部上架中）的列表結果快取，避免列表頁與分類清單各自重複打一次相同的 API。
let allAgentSkillsPromise = null;


// 取得上架中的 Agent Skill 列表，支援關鍵字比對與分類篩選

export async function getAgentSkills({ keyword, categoryId } = {}) {
  const isNoFilter = !keyword && !categoryId;
  if (isNoFilter && allAgentSkillsPromise) {
    return allAgentSkillsPromise;
  }

  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (categoryId) params.append("categoryId", categoryId);
  const query = params.toString();

  const fetchPromise = (async () => {
    const res = await apiRequest(`/agent-skills${query ? `?${query}` : ""}`, {
      method: "GET",
    });

    if (res?.status !== "success" || !Array.isArray(res.data)) {
      throw new Error("Agent Skill 列表回應格式錯誤");
    }

    return res.data.map(normalizeAgentSkill).filter(Boolean);
  })().catch((err) => {
    // 失敗時清除快取，避免之後的請求一直重放同一個已失敗的 Promise
    if (isNoFilter) allAgentSkillsPromise = null;
    throw err;
  });

  if (isNoFilter) {
    allAgentSkillsPromise = fetchPromise;
  }

  return fetchPromise;
}


// 從目前上架中的 Agent Skill 列表萃取不重複分類，供列表頁篩選下拉使用。

export async function getAgentSkillCategories() {
  const skills = await getAgentSkills();
  return Array.from(
    new Map(
      skills
        .filter((skill) => skill.categoryId && skill.categoryName)
        .map((skill) => [
          skill.categoryId,
          { id: skill.categoryId, name: skill.categoryName },
        ])
    ).values()
  );
}

// 從目前上架中的 Agent Skill 列表萃取不重複來源 repoOwner（含頭像）
export async function getAgentSkillRepoOwners() {
  const skills = await getAgentSkills();
  return Array.from(
    new Map(
      skills
        .filter((skill) => skill.repoOwner)
        .map((skill) => [
          skill.repoOwner,
          { repoOwner: skill.repoOwner, avatarUrl: skill.creatorAvatarUrl || "" },
        ])
    ).values()
  );
}

// 取得單一 Agent Skill 完整data

export async function getAgentSkillById(id) {
  const res = await apiRequest(`/agent-skills/${id}`, { method: "GET" });

  if (res?.status !== "success" || !res.data) {
    throw new Error("Agent Skill 詳情回應格式錯誤");
  }

  return normalizeAgentSkill(res.data);
}
