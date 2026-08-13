import { storage } from "../utils/storage";
import { favoritesTable } from "./mocks/mockData";
import { apiRequest } from "./apiClient.js";
import { normalizeFavoritedSkill } from "./normalizeFavoritedSkill";

export async function getUserFavoriteAPI(itemType = "prompt") {
  try {
    const res = await apiRequest(`/favorites?itemType=${itemType}`, {
      method: "GET",
    });
    const list = Array.isArray(res?.data) ? res.data : [];
    return list.map((item) => item.id);
  } catch (err) {
    console.warn(`Backend /favorites?itemType=${itemType} notice:`, err.message);
    return [];
  }
}

/**
 * 取得已收藏 Agent Skill 的完整資料（非僅 ID），供「我的收藏 - Skills」頁面使用。
 * 每筆額外帶 favoriteId——加入/移除 Recipe（recipeApi）要用這個識別碼，不是
 * Agent Skill 的 id（見 FRONTEND_API_SPEC.md 10 節最上方的提示）。
 */
export async function getFavoritedSkillsAPI() {
  try {
    const res = await apiRequest("/favorites?itemType=skill", {
      method: "GET",
    });
    const list = Array.isArray(res?.data) ? res.data : [];
    return list.map(normalizeFavoritedSkill).filter(Boolean);
  } catch (err) {
    console.warn("Backend /favorites?itemType=skill notice:", err.message);
    return [];
  }
}

export async function toggleFavoriteAPI(skillId, itemType = "prompt") {
  try {
    const res = await apiRequest(
      `/favorites/${skillId}/toggle?itemType=${itemType}`,
      { method: "POST" }
    );
    return res.data;
  } catch (err) {
    console.warn(`Backend /favorites/${skillId}/toggle notice:`, err.message);
    return { favorited: true };
  }
}

export async function clearUserFavoritesAPI() {
  const res = await apiRequest("/favorites", {
    method: "DELETE",
  });
  return res.data;
}

export async function restoreDefaultFavoritesAPI() {
  const res = await apiRequest("/favorites/defaults", {
    method: "POST",
  });
  return res.data;
}

export function getUserFavorites(email, userDbId) {
  const storedFavs = storage.get(`favorites_${email}`);
  if (storedFavs) {
    return Promise.resolve(storedFavs);
  }
  const dbFavs = favoritesTable
    .filter((f) => f.user_id === userDbId)
    .map((f) => f.skill_item_id);
  storage.set(`favorites_${email}`, dbFavs);
  return Promise.resolve(dbFavs);
}

export function saveUserFavorites(email, favorites) {
  storage.set(`favorites_${email}`, favorites);
  return Promise.resolve(favorites);
}
