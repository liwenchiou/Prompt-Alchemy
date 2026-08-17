import { apiRequest } from "./apiClient";
import { agentSkillsTable } from "./mocks/mockData";

// 匯出給 favoriteApi／recipeApi 重用：收藏清單、Recipe 內容回傳的 Skill 物件
export function normalizeAgentSkill(item) {
  if (typeof item?.id !== "string" || !item.id) return null;

  const categoryName =
    (typeof item.category === "string" ? item.category : item.category?.name) ||
    item.categoryName ||
    "";

  return {
    id: item.id,
    name: item.name || "",
    description: item.description || "",
    intro: item.intro || "",
    repoOwner: item.repoOwner || item.repo_owner || "",
    repoName: item.repoName || item.repo_name || "",
    skillSlug: item.skillSlug || item.skill_slug || "",
    creatorName: item.creatorName || item.creator_name || "",
    creatorAvatarUrl: item.creatorAvatarUrl || item.creator_avatar_url || "",
    creatorProfileUrl: item.creatorProfileUrl || item.creator_profile_url || "",
    license: item.license || "",
    categoryId: item.categoryId || item.category_id || "",
    categoryName,
    stargazersCount: item.stargazersCount ?? item.stargazers_count ?? 0,
    copyCount: item.copyCount ?? item.copy_count ?? 0,
    favoriteCount: item.favoriteCount ?? item.favorite_count ?? 0,
    isHot: item.isHot ?? item.is_hot ?? false,
    isActive: item.isActive ?? item.is_active ?? true,
    createdAt: item.createdAt || item.created_at || null,
    updatedAt: item.updatedAt || item.updated_at || null,
    repoDescription: item.repoDescription || item.repo_description || "",
    repoOwnerAvatarUrl: item.repoOwnerAvatarUrl || item.repo_owner_avatar_url || "",
    readmeExcerpt: item.readmeExcerpt || item.readme_excerpt || "",
    excerptSource: item.excerptSource || item.excerpt_source || "none",

    docUrl: item.docUrl || item.doc_url || "",

    installKind: item.installKind || item.install_kind,
    supportedAgents: item.supportedAgents || item.supported_agents || [],
  };
}

function getFallbackAgentSkills({ keyword, categoryId } = {}) {
  let list = agentSkillsTable
    .map((item) => normalizeAgentSkill(item))
    .filter(Boolean);

  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(k) || s.intro.toLowerCase().includes(k)
    );
  }
  if (categoryId) {
    list = list.filter((s) => s.categoryId === categoryId);
  }
  return list;
}

// 無篩選條件（全部上架中）的列表結果快取，避免列表頁與分類清單各自重複打一次相同的 API。
let allAgentSkillsPromise = null;

export function clearAgentSkillsCache() {
  allAgentSkillsPromise = null;
}

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
    try {
      const res = await apiRequest(`/agent-skills${query ? `?${query}` : ""}`, {
        method: "GET",
      });

      if (res?.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(normalizeAgentSkill).filter(Boolean);
      }
    } catch (err) {
      console.warn("Backend /agent-skills API notice, falling back to mock data:", err.message);
      if (isNoFilter) allAgentSkillsPromise = null;
    }
    return getFallbackAgentSkills({ keyword, categoryId });
  })();

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
  try {
    const res = await apiRequest(`/agent-skills/${id}`, { method: "GET" });

    if (res?.status === "success" && res.data) {
      return normalizeAgentSkill(res.data);
    }
  } catch (err) {
    console.warn(`Backend /agent-skills/${id} API notice, falling back to mock data:`, err.message);
  }

  const fallbackList = getFallbackAgentSkills();
  const match = fallbackList.find((s) => s.id === id) || fallbackList[0];
  return match || null;
}

