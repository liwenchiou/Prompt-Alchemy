// Admin API
//
// 集中管理後台的資料存取。第一版使用 localStorage 作為 mock 儲存層，
// 以 mockData 為種子初始化，之後可將這些函式改為呼叫真實後端 API。
//
// 注意：前台頁面仍直接讀取 mockData 的靜態陣列，這裡的變更不會影響前台。

import { storage } from "../utils/storage";
import {
  parametersTable,
  skillItemsTable,
  usersTable,
} from "./mockData";
import { apiRequest } from "./apiClient";
import { clearPublishedPromptsCache } from "./promptApi";

const PARAMETERS_KEY = "admin_parameters";
const SKILLS_KEY = "admin_skills";
const USERS_KEY = "admin_users";
const ADMIN_AUTH_KEY = "admin_auth";

// ---- 種子初始化 -------------------------------------------------------------

function seedParameters() {
  const existing = storage.get(PARAMETERS_KEY);
  if (existing) {
    let updated = false;
    const merged = [...existing];
    parametersTable.forEach((p, index) => {
      if (!merged.some((item) => item.id === p.id)) {
        merged.push({
          id: p.id,
          type: p.type,
          name: p.name,
          description: p.memo || p.description || "",
          isActive: p.isActive ?? p.is_active ?? true,
          sortOrder: p.sortOrder ?? p.sort_order ?? (merged.length + 1),
          createdAt: p.createdAt || p.created_at || `2026-06-0${(index % 9) + 1}T08:00:00Z`,
        });
        updated = true;
      }
    });
    if (updated) {
      storage.set(PARAMETERS_KEY, merged);
      return merged;
    }
    return existing;
  }

  const seed = parametersTable.map((p, index) => ({
    id: p.id,
    type: p.type,
    name: p.name,
    description: p.memo || p.description || "",
    isActive: p.isActive ?? p.is_active ?? true,
    sortOrder: p.sortOrder ?? p.sort_order ?? (index + 1),
    createdAt: p.createdAt || p.created_at || `2026-06-0${(index % 9) + 1}T08:00:00Z`,
  }));

  storage.set(PARAMETERS_KEY, seed);
  return seed;
}

function seedSkills() {
  const existing = storage.get(SKILLS_KEY);
  if (existing) {
    let updated = false;
    const merged = [...existing];
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

  const seed = skillItemsTable.map((item) => ({ ...item }));
  storage.set(SKILLS_KEY, seed);
  return seed;
}

function seedUsers() {
  const existing = storage.get(USERS_KEY);
  if (existing) {
    let modified = false;
    const migrated = existing.map((u) => {
      let updatedUser = { ...u };
      if (updatedUser.isActive === undefined) {
        updatedUser.isActive = true;
        modified = true;
      }
      if (updatedUser.role_id !== undefined) {
        delete updatedUser.role_id;
        modified = true;
      }
      return updatedUser;
    });
    if (modified) {
      storage.set(USERS_KEY, migrated);
      return migrated;
    }
    return existing;
  }

  const seed = usersTable.map((u) => {
    return {
      ...u,
      isActive: true,
      createdAt: `2026-06-01T08:00:00Z`,
    };
  });
  storage.set(USERS_KEY, seed);
  return seed;
}

function readParameters() {
  const cachedAll = Object.values(parametersCache).flat();
  if (cachedAll && cachedAll.length > 0) {
    return cachedAll;
  }
  return seedParameters();
}

function writeParameters(list) {
  storage.set(PARAMETERS_KEY, list);
  return list;
}

function readSkills() {
  return seedSkills();
}

function writeSkills(list) {
  storage.set(SKILLS_KEY, list);
  return list;
}

function readUsers() {
  return seedUsers();
}

function writeUsers(list) {
  storage.set(USERS_KEY, list);
  return list;
}

// ---- 工具 -------------------------------------------------------------------

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

// 模擬非同步 API，方便日後替換成真實請求
function resolve(value) {
  return Promise.resolve(
    typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value)),
  );
}

// ---- 統一參數管理 (Parameters CRUD) -------------------------------------------

const parametersCache = {};
let allParametersLoaded = false;

export function clearParametersCache(type = null) {
  if (type) {
    delete parametersCache[type];
  } else {
    for (const key in parametersCache) {
      delete parametersCache[key];
    }
    allParametersLoaded = false;
  }
}

export async function getParametersByType(type) {
  if (!allParametersLoaded) {
    try {
      const result = await apiRequest(`/admin/parameters`);
      const allList = result.data || [];
      ["category", "contentType", "model", "tag", "role"].forEach((t) => {
        parametersCache[t] = allList.filter((item) => item.type === t);
      });
      allParametersLoaded = true;
    } catch (e) {
      // 發生異常時 fallback 回原本的分次請求
    }
  }
  if (parametersCache[type]) {
    return parametersCache[type];
  }
  const result = await apiRequest(`/admin/parameters?type=${type}`);
  parametersCache[type] = result.data;
  return result.data;
}

// 為了相容舊版呼叫，提供別名
export function getCategories() {
  return getParametersByType("category");
}

export async function createParameter(type, data) {
  clearParametersCache(type);
  const result = await apiRequest(`/admin/parameters`, {
    method: "POST",
    body: {
      type,
      name: data.name,
      description: data.description || "",
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder
    },
  });
  return result.data;
}

export async function updateParameter(id, data) {
  clearParametersCache(); // 異動參數時清除快取，以防快取過期
  const result = await apiRequest(`/admin/parameters/${id}`, {
    method: "PUT",
    body: data,
  });
  return result.data;
}

export async function disableParameter(id) {
  clearParametersCache(); // 異動參數時清除快取
  const result = await apiRequest(`/admin/parameters/${id}`, {
    method: "DELETE",
  });
  return result.data;
}

// ---- 顯示用名稱解析（同步，供 Table 渲染用）-----------------------------------

export function getContentTypeLabel(id) {
  const opt = readParameters().find((p) => p.id === id);
  // name 為 "prompt" / "skills"，統一顯示為 Prompt / Skill
  if (!opt) return "";
  return opt.name === "prompt" ? "Prompt" : opt.name === "skills" ? "Skill" : opt.name;
}

export function getCategoryName(id) {
  const cat = readParameters().find((c) => c.id === id);
  return cat ? cat.name : "";
}

export function getModelLabels(ids = []) {
  const options = readParameters().filter((p) => p.type === "model");
  return ids
    .map((id) => options.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => o.name);
}

export function getTagLabels(ids = []) {
  const options = readParameters().filter((p) => p.type === "tag");
  return ids
    .map((id) => options.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => o.name);
}

// 狀態顯示。狀態只有啟用 / 未啟用兩種，用 isActive 這個布林表示。
export const ACTIVE_OPTIONS = [
  { value: "active", label: "啟用" },
  { value: "inactive", label: "未啟用" },
];

// 讀取「這筆資料是否啟用」的唯一入口。
//
// 為什麼要 fallback：seed 進來的資料（skillItemsTable）只有 snake_case 的
// is_active，後台新增的則是 camelCase 的 isActive。兩種命名會同時存在，
// 所以一律走這裡判斷，不要在各處自己寫 s.isActive。
// 都沒有時預設為啟用 —舊資料沒這個欄位不代表它被停用。
export function isSkillActive(skill) {
  return skill?.isActive ?? skill?.is_active ?? true;
}

// ---- Auth -------------------------------------------------------------------

export async function loginAdmin({ email, password }) {
  try {
    const loginRes = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (loginRes.token) {
      localStorage.setItem("token", loginRes.token);
    }

    const userRes = await apiRequest("/auth/me", {
      method: "GET",
    });

    if (userRes.user.role !== "admin") {
      throw new Error("帳號不存在或非管理者帳號");
    }

    const authUser = {
      id: userRes.user.id,
      name: userRes.user.name,
      email: userRes.user.email,
      role: "admin",
    };
    storage.set(ADMIN_AUTH_KEY, authUser);
    return authUser;
  } catch (err) {
    localStorage.removeItem("token");
    storage.remove(ADMIN_AUTH_KEY);
    if (err.data && err.data.message) {
      throw new Error(err.data.message);
    }
    throw new Error(err.message || "登入失敗");
  }
}

export async function logoutAdmin() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } catch (err) {
    console.warn("Logout API notice:", err.message);
  } finally {
    storage.remove(ADMIN_AUTH_KEY);
    localStorage.removeItem("token");
  }
}

export function getAdminAuth() {
  return storage.get(ADMIN_AUTH_KEY);
}

// ---- Users ------------------------------------------------------------------

export async function getUsers(role = null) {
  const query = role ? `?role=${role}` : "";
  const result = await apiRequest(`/admin/users${query}`);
  return result.data;
}

export async function createUser(data) {
  const result = await apiRequest(`/admin/users`, {
    method: "POST",
    body: data,
  });
  return result.data;
}

export async function updateUser(id, data) {
  const result = await apiRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: data,
  });
  return result.data;
}

export function disableUser(id) {
  return updateUser(id, { isActive: false });
}

// ---- Skills -----------------------------------------------------------------

export async function getSkills(filters = {}) {
  const params = new URLSearchParams();
  if (filters.keyword) params.append("keyword", filters.keyword);
  if (filters.contentTypeId) params.append("contentTypeId", filters.contentTypeId);
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.active) params.append("active", filters.active);

  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await apiRequest(`/admin/skills${query}`);
  return result.data;
}

export async function getSkillById(id) {
  const result = await apiRequest(`/admin/skills/${id}`);
  const s = result.data;
  if (s && Array.isArray(s.tags)) {
    s.tags = s.tags.map(t => typeof t === "object" && t !== null ? t.id : t);
  }
  return s ? { ...s, is_active: s.isActive ?? s.is_active ?? true } : s;
}

export async function createSkill(data) {
  clearPublishedPromptsCache();
  const result = await apiRequest(`/admin/skills`, {
    method: "POST",
    body: data,
  });
  const s = result.data;
  if (s && Array.isArray(s.tags)) {
    s.tags = s.tags.map(t => typeof t === "object" && t !== null ? t.id : t);
  }
  return s ? { ...s, is_active: s.isActive ?? s.is_active ?? true } : s;
}

export async function updateSkill(id, data) {
  clearPublishedPromptsCache();
  const result = await apiRequest(`/admin/skills/${id}`, {
    method: "PUT",
    body: data,
  });
  const s = result.data;
  if (s && Array.isArray(s.tags)) {
    s.tags = s.tags.map(t => typeof t === "object" && t !== null ? t.id : t);
  }
  return s ? { ...s, is_active: s.isActive ?? s.is_active ?? true } : s;
}

export function setSkillActive(id, isActive) {
  return updateSkill(id, { isActive });
}
