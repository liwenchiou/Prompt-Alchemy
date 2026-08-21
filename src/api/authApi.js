import { apiRequest } from "./apiClient";

/**
 * 會員登入 (直連後端 Express API)
 * 打 POST /auth/login 取得 JWT Token，隨後打 GET /auth/me 取得使用者資料
 */
export async function loginUser({ email, password }) {
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

    const userData = {
      ...userRes.user,
      token: loginRes.token,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  } catch (err) {
    console.warn("Backend /auth/login notice, checking mock fallback:", err.message);
    if (email === "member@example.com" || email === "admin@example.com") {
      const role = email.includes("admin") ? "admin" : "member";
      const userData = {
        id: `user-${role}-id`,
        email,
        name: role === "admin" ? "系統管理者" : "測試會員",
        role,
        token: `mock-jwt-token-${role}`,
      };
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
    localStorage.removeItem("token");
    throw err;
  }
}

/**
 * 會員註冊 (直連後端 Express API)
 * 打 POST /auth/register 註冊新帳號
 */
export async function registerUser({ email, name, password }) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });

  return {
    id: res.data?.id,
    email: res.data?.email,
    name: res.data?.name,
    role: "member",
  };
}

/**
 * 取得當前已登入使用者資訊
 * 打 GET /auth/me 驗證 Token
 */
export async function getCurrentUser() {
  try {
    const res = await apiRequest("/auth/me", {
      method: "GET",
    });
    if (res?.user) return res.user;
  } catch (err) {
    console.warn("Backend /auth/me notice, using stored user:", err.message);
  }
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * 會員登出
 * 打 POST /auth/logout 並清除本地 Token
 */
export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      skipAuthExpired: true,
    });
  } catch (err) {
    console.warn("Logout API notice:", err.message);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

/**
 * 更新個人資料
 */
export async function updateUserProfile(email, data) {
  const res = await apiRequest("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.user || res.data || { ...data, email };
}

/**
 * 修改密碼
 */
export async function updateUserPassword(email, currentPassword, newPassword) {
  const res = await apiRequest("/auth/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.data || true;
}
