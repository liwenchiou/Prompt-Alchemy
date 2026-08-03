import { apiRequest } from "./apiClient";
import { storage } from "../utils/storage";
import { skillItemsTable, parametersTable } from "./mockData";
import { toBlocks, toPayload } from "../components/admin/exampleOutputBlocks";
import { IS_ONLINE_MODE } from "../config/runMode";

const SKILLS_KEY = "admin_skills";
const PARAMETERS_KEY = "admin_parameters";

function normalizeTag(tag, getParamName) {
  if (!tag) return null;

  if (typeof tag === "string") {
    return {
      id: tag,
      name: getParamName(tag) || tag,
    };
  }

  if (typeof tag === "object") {
    const id = tag.id || tag.tagId || tag.tag_id || tag.name || "";
    const name = tag.name || (id ? getParamName(id) : "") || "";
    if (!id && !name) return null;
    return {
      id: id || name,
      name: name || id,
    };
  }

  return null;
}

function seedSkills() {
  const existing = storage.get(SKILLS_KEY);
  if (existing && existing.length > 0 && "is_active" in existing[0]) {
    let updated = false;
    const merged = existing.map((storedItem) => {
      const seedItem = skillItemsTable.find((s) => s.id === storedItem.id);
      if (seedItem) {
        if (!Array.isArray(storedItem.example_output) && Array.isArray(seedItem.example_output)) {
          updated = true;
          return { ...storedItem, example_output: seedItem.example_output };
        }
      }
      return storedItem;
    });
    skillItemsTable.forEach((item) => {
      if (!merged.some((s) => s.id === item.id)) {
        merged.push({ ...item });
        updated = true;
      }
    });
    if (updated) {
      storage.set(SKILLS_KEY, merged);
      return merged;
    }
    return existing;
  }
  storage.set(SKILLS_KEY, skillItemsTable);
  return skillItemsTable;
}

function seedParameters() {
  // console.log("SEED PARAMETERS CALLED:\n" + new Error().stack);
  const existing = storage.get(PARAMETERS_KEY);
  if (existing && existing.length > 0 && "is_active" in existing[0]) {
    let updated = false;
    const merged = [...existing];
    parametersTable.forEach((param) => {
      if (!merged.some((p) => p.id === param.id)) {
        merged.push({ ...param });
        updated = true;
      }
    });
    if (updated) {
      storage.set(PARAMETERS_KEY, merged);
      return merged;
    }
    return existing;
  }
  storage.set(PARAMETERS_KEY, parametersTable);
  return parametersTable;
}

export async function syncRemoteParameters() {
  try {
    const res = await apiRequest("/admin/parameters", { method: "GET" });
    if (res && res.status === "success" && Array.isArray(res.data)) {
      const existing = seedParameters();
      const merged = [...existing];
      res.data.forEach((p) => {
        const idx = merged.findIndex((item) => item.id === p.id);
        const pObj = {
          id: p.id,
          type: p.type,
          name: p.name,
          memo: p.memo || p.description || "",
          is_active: p.isActive ?? p.is_active ?? true,
          sort_order: p.sortOrder ?? p.sort_order ?? 0,
        };
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...pObj };
        } else {
          merged.push(pObj);
        }
      });
      storage.set(PARAMETERS_KEY, merged);
      return merged;
    }
  } catch (err) {
    // Ignore error if backend parameters not accessible
  }
  return seedParameters();
}

export function getParameterName(id) {
  const params = seedParameters();
  const p = params.find((item) => item.id === id);
  return p ? p.name : "";
}

export function normalizeExampleOutput(exampleOutput) {
  return toPayload(toBlocks(exampleOutput));
}

function mapRemoteTag(tag) {
  if (!tag || typeof tag !== "object") return null;
  const id = tag.id || tag.tagId || tag.tag_id || "";
  const name = tag.name || "";
  if (!id || !name) return null;
  return { id, name };
}

function mapRemotePrompt(item, storedSkills) {
  const localItem = IS_ONLINE_MODE
    ? null
    : storedSkills.find((s) => s.id === item.id);
  if (localItem && (localItem.isActive === false || localItem.is_active === false)) {
    return null;
  }

  const seedItem = skillItemsTable.find((s) => s.id === item.id);
  const baseFav = item.favoriteCount ?? item.favorite_count ?? 0;
  const seedFav = seedItem ? seedItem.favorite_count || 0 : 0;
  const localFavDelta = localItem && typeof localItem.favorite_count === "number"
    ? localItem.favorite_count - seedFav
    : 0;
  const favCount = Math.max(0, baseFav + localFavDelta);
  const cpCount = localItem && typeof localItem.copy_count === "number"
    ? Math.max(localItem.copy_count, item.copyCount ?? item.copy_count ?? 0)
    : (item.copyCount ?? item.copy_count ?? 0);
  const tags = (item.tags || []).map(mapRemoteTag).filter(Boolean);
  const createdDate = item.createdAt
    ? item.createdAt.split("T")[0]
    : item.created_at
      ? item.created_at.split("T")[0]
      : "";
  const createdAt = item.createdAt || item.created_at;
  const isNew =
    item.isNew ??
    (createdAt ? new Date(createdAt) >= new Date("2026-06-25T00:00:00Z") : false);
  const isHot = item.isHot ?? (favCount >= 20);

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    intro: item.intro,
    contentTypeId: item.contentTypeId || item.content_type_id,
    modelType: item.modelType || item.model_type,
    promptContent: item.promptContent || item.prompt_content,
    useCase: item.useCase || item.use_case,
    exampleInput: item.exampleInput || item.example_input,
    exampleOutput: normalizeExampleOutput(item.exampleOutput ?? item.example_output),
    categoryId: item.categoryId || item.category_id,
    tags,
    sourceUrl: item.sourceUrl || item.source_url,
    copyCount: cpCount,
    favoriteCount: favCount,
    createdAt,
    updatedAt: item.updatedAt || item.updated_at,
    isActive: item.isActive ?? item.is_active ?? true,
    memo: item.memo || item.categoryMemo || "",
    category: item.category || item.categoryName || "",
    date: createdDate,
    isNew,
    isHot,
    likes: favCount,
    uses: cpCount,
    description: item.intro,
    content: item.promptContent || item.prompt_content,
    exampleContent: item.exampleInput || item.example_input,
  };
}

async function fetchRemotePrompts(queryParams = {}) {
  let url = "/prompts";
  const searchParams = new URLSearchParams();
  if (queryParams.category) searchParams.append("category", queryParams.category);
  if (queryParams.tag) searchParams.append("tag", queryParams.tag);
  if (queryParams.search) searchParams.append("search", queryParams.search);

  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const res = await apiRequest(url, { method: "GET" });
  if (!(res && res.status === "success" && Array.isArray(res.data))) {
    return [];
  }

  const storedSkills = seedSkills();
  return res.data
    .map((item) => mapRemotePrompt(item, storedSkills))
    .filter(Boolean);
}

function getFallbackPrompts() {
  const skills = seedSkills();
  const fallbackParams = seedParameters();

  const getParamName = (id) => {
    const p = fallbackParams.find((item) => item.id === id);
    return p ? p.name : "";
  };

  const list = skills
    .filter((s) => s.is_active)
    .map((item) => {
      const categoryName = getParamName(item.category_id);
      const tags = (item.tags || [])
        .map((tag) => normalizeTag(tag, getParamName))
        .filter(Boolean);
      const createdDate = item.created_at ? item.created_at.split("T")[0] : "";

      const isNew = new Date(item.created_at) >= new Date("2026-06-25T00:00:00Z");
      const isHot = (item.favorite_count || 0) >= 20;

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        intro: item.intro,
        contentTypeId: item.content_type_id,
        modelType: item.model_type,
        promptContent: item.prompt_content,
        useCase: item.use_case,
        exampleInput: item.example_input,
        exampleOutput: normalizeExampleOutput(item.example_output ?? item.exampleOutput),
        categoryId: item.category_id,
        tags,
        sourceUrl: item.source_url,
        copyCount: item.copy_count,
        favoriteCount: item.favorite_count,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isActive: item.is_active,

        category: categoryName,
        date: createdDate,
        isNew,
        isHot,
        likes: item.favorite_count,
        uses: item.copy_count,
        description: item.intro,
        content: item.prompt_content,
        exampleContent: item.example_input,
        memo: "",
      };
    });

  return list;
}

let publishedPromptsPromise = null;

export function clearPublishedPromptsCache() {
  publishedPromptsPromise = null;
}

export const PUBLISHED_PROMPTS_UPDATED_EVENT = "prompt-alchemy:prompts-updated";

export function refreshPublishedPrompts() {
  clearPublishedPromptsCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PUBLISHED_PROMPTS_UPDATED_EVENT));
  }
}

export async function getPublishedPrompts(queryParams = {}) {
  const isNoFilter = !queryParams.category && !queryParams.tag && !queryParams.search;

  if (isNoFilter && publishedPromptsPromise) {
    return publishedPromptsPromise;
  }

  const fetchPromise = (async () => {
    try {
      const remoteList = await fetchRemotePrompts(queryParams);
      if (remoteList.length > 0) {
        return remoteList;
      }
    } catch (err) {
      console.warn("Backend /prompts API notice, falling back to mock data:", err.message);
    }
    return getFallbackPrompts();
  })();

  if (isNoFilter) {
    publishedPromptsPromise = fetchPromise;
  }

  return fetchPromise;
}

function buildUniqueCategories(prompts) {
  return Array.from(
    new Map(
      prompts
        .filter((prompt) => prompt?.category)
        .map((prompt) => [
          prompt.category,
          {
            id: prompt.categoryId || prompt.category,
            name: prompt.category,
            memo: prompt.memo || "",
            is_active: prompt.isActive ?? true,
          },
        ])
    ).values()
  );
}

function buildUniqueTags(prompts) {
  return Array.from(
    new Map(
      prompts
        .flatMap((prompt) => prompt.tags || [])
        .filter((tag) => tag?.id && tag?.name)
        .map((tag) => [tag.id, tag])
    ).values()
  );
}

export async function getCategories() {
  const prompts = await getPublishedPrompts();
  return buildUniqueCategories(prompts);
}

export async function getTags() {
  const prompts = await getPublishedPrompts();
  return buildUniqueTags(prompts);
}

export async function getPromptById(id) {
  try {
    const res = await apiRequest(`/prompts/${id}`, { method: "GET" });
    if (res && res.status === "success" && res.data) {
      const storedSkills = seedSkills();
      const detail = mapRemotePrompt(res.data, storedSkills);
      if (detail) {
        return {
          ...detail,
          phoneDesc: detail.intro,
          phoneCode: (detail.promptContent || "").slice(0, 40),
        };
      }
    }
  } catch (err) {
    console.warn(`Backend /prompts/${id} API notice, falling back to mock data:`, err.message);
  }

  // Fallback to local mock data
  const skills = seedSkills();
  const fallbackParams = seedParameters();

  const getParamName = (paramId) => {
    const p = fallbackParams.find((item) => item.id === paramId);
    return p ? p.name : "";
  };

  const item = skills.find(
    (s) => s.id === id && s.is_active
  );
  if (!item) return null;

  const categoryName = getParamName(item.category_id);
  const tags = (item.tags || [])
    .map((tag) => normalizeTag(tag, getParamName))
    .filter(Boolean);

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    intro: item.intro,
    contentTypeId: item.content_type_id,
    modelType: item.model_type,
    promptContent: item.prompt_content,
    useCase: item.use_case,
    exampleInput: item.example_input,
    exampleOutput: normalizeExampleOutput(item.example_output ?? item.exampleOutput),
    categoryId: item.category_id,
    tags,
    sourceUrl: item.source_url,
    copyCount: item.copy_count,
    favoriteCount: item.favorite_count,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isActive: item.is_active,

    category: categoryName,
    description: item.intro,
    content: item.prompt_content,
    exampleContent: item.example_input,
    phoneDesc: item.intro,
    phoneCode: item.prompt_content ? item.prompt_content.slice(0, 40) : "",
  };
}

export async function incrementCopyCount(id) {
  // Update local storage sync as well for fallback / UI state
  const skills = seedSkills();
  const list = skills.map((s) => {
    if (s.id === id) {
      return { ...s, copy_count: (s.copy_count || 0) + 1 };
    }
    return s;
  });
  storage.set(SKILLS_KEY, list);

  clearPublishedPromptsCache();

  try {
    const res = await apiRequest(`/prompts/${id}/copy`, { method: "POST" });
    if (res && res.status === "success") {
      return res.data || true;
    }
  } catch (err) {
    console.warn(`Backend /prompts/${id}/copy API notice:`, err.message);
  }

  return true;
}

