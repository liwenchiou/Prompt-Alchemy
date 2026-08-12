import { apiRequest } from "./apiClient";
import { snakeToCamel } from "../utils/snakeToCamel";
import { normalizeFavoritedSkill } from "./normalizeFavoritedSkill";

function normalizeRecipe(item) {
  const camel = snakeToCamel(item);
  return {
    id: camel.id,
    name: camel.name || "",
    createdAt: camel.createdAt || null,
    updatedAt: camel.updatedAt || null,
  };
}

function normalizeRecipeDetail(item) {
  const recipe = normalizeRecipe(item);
  const items = Array.isArray(item?.items) ? item.items : [];
  return {
    ...recipe,
    items: items.map(normalizeFavoritedSkill).filter(Boolean),
  };
}


//  取得目前登入會員的 Recipe 清單（不含底下的 Skill 項目，見 getRecipeByIdAPI）。

export async function getMyRecipesAPI() {
  const res = await apiRequest("/me/recipes", { method: "GET" });
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(normalizeRecipe);
}

// 一次取得所有 Recipe 的 recipeId／favoriteId 

export async function getMyRecipeItemsAPI() {
  const res = await apiRequest("/me/recipe-items", { method: "GET" });
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map((pair) => ({
    recipeId: pair.recipe_id,
    favoriteId: pair.favorite_id,
  }));
}

export async function createRecipeAPI(name) {
  const res = await apiRequest("/me/recipes", {
    method: "POST",
    body: { name },
  });
  return normalizeRecipe(res?.data);
}

 // 取得單一 Recipe 內容，含底下已加入的 Agent Skill 清單。

export async function getRecipeByIdAPI(recipeId) {
  const res = await apiRequest(`/me/recipes/${recipeId}`, { method: "GET" });
  return normalizeRecipeDetail(res?.data);
}

export async function renameRecipeAPI(recipeId, name) {
  const res = await apiRequest(`/me/recipes/${recipeId}`, {
    method: "PATCH",
    body: { name },
  });
  return normalizeRecipe(res?.data);
}

export async function deleteRecipeAPI(recipeId) {
  const res = await apiRequest(`/me/recipes/${recipeId}`, {
    method: "DELETE",
  });
  return res?.data;
}


 // 把已收藏的 Skill 加入 Recipe

export async function addItemToRecipeAPI(recipeId, favoriteId) {
  const res = await apiRequest(`/me/recipes/${recipeId}/items`, {
    method: "POST",
    body: { favoriteId },
  });
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(normalizeFavoritedSkill).filter(Boolean);
}

// 從 Recipe 移除項目，只拿掉這個 Skill 跟這個 Recipe 的關聯，不影響收藏狀態。
export async function removeItemFromRecipeAPI(recipeId, favoriteId) {
  const res = await apiRequest(`/me/recipes/${recipeId}/items/${favoriteId}`, {
    method: "DELETE",
  });
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(normalizeFavoritedSkill).filter(Boolean);
}
