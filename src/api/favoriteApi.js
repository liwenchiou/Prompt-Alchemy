import { storage } from "../utils/storage";
import { favoritesTable } from "./mockData";
import { apiRequest } from "./apiClient.js";

export async function getUserFavoriteAPI() {
  const res = await apiRequest(`/favorites`, {
    method: "GET",
  });
  const list = Array.isArray(res?.data) ? res.data : [];
  // console.log("用GET拿/favorites:", list.map((item) => item.id));
  return list.map((item) => item.id);
}
export async function toggleFavoriteAPI(skillId) {
  const res = await apiRequest(`/favorites/${skillId}/toggle`, {
    method: "POST",
  });
  // console.log("用POST拿/favorites/toggle:", res.data);
  return res.data;
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
