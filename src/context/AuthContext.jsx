import { createContext, useState, useEffect } from "react";
import { IS_ONLINE_MODE } from "../config/runMode";
import {
  getUserFavoriteAPI,
  toggleFavoriteAPI,
  clearUserFavoritesAPI,
  restoreDefaultFavoritesAPI,
} from "../api/favoriteApi";
import {
  updateUserProfile,
  getCurrentUser,
  logoutUser as apiLogoutUser,
} from "../api/authApi";
import { refreshPublishedPrompts, clearPublishedPromptsCache } from "../api/promptApi";
import { clearAgentSkillsCache } from "../api/agentSkillApi";
import { alertHelper } from "../utils/sweetAlert";
import { eventBus } from "../utils/eventBus";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteCounts, setFavoriteCounts] = useState({});
  const [skillFavorites, setSkillFavorites] = useState([]);
  const [skillFavoriteCounts, setSkillFavoriteCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadSkillFavorites = async () => {
    try {
      const favs = await getUserFavoriteAPI("skill");
      setSkillFavorites(favs);
    } catch (err) {
      console.warn("讀取 Skill 收藏失敗", err.message);
      setSkillFavorites([]);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token) {
        try {
          const fetchedUser = await getCurrentUser();
          const fullUser = { ...fetchedUser, token };
          setUser(fullUser);
          localStorage.setItem("user", JSON.stringify(fullUser));

          const favs = await getUserFavoriteAPI();
          setFavorites(favs);
          await loadSkillFavorites();
        } catch (err) {
          console.warn("Token 即將或已無效，清除本地 Token", err.message);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setFavorites([]);
          setSkillFavorites([]);
          clearPublishedPromptsCache();
          clearAgentSkillsCache();
        }
      } else if (!IS_ONLINE_MODE && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          const favs = await getUserFavoriteAPI();
          setFavorites(favs);
          await loadSkillFavorites();
        } catch (_err) {
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();

    const unsubscribe = eventBus.on("auth:expired", () => {
      setUser(null);
      setFavorites([]);
      setSkillFavorites([]);
      clearPublishedPromptsCache();
      clearAgentSkillsCache();
      alertHelper.error("登入逾期", "您的登入已過期，請重新登入", true);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (userData, options = {}) => {
    const { showSuccessAlert = true } = options;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    clearPublishedPromptsCache();
    clearAgentSkillsCache();
    try {
      const favs = await getUserFavoriteAPI();
      setFavorites(favs);
      refreshPublishedPrompts();
    } catch (err) {
      console.error("讀取收藏失敗", err);
      setFavorites([]);
    }
    await loadSkillFavorites();

    if (showSuccessAlert) {
      alertHelper.success(
        "登入成功",
        `歡迎回來，${userData.name || "成員"}！`,
        true
      );
    }
  };

  const logoutUser = () => {
    apiLogoutUser();
    setUser(null);
    setFavorites([]);
    setSkillFavorites([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    clearPublishedPromptsCache();
    clearAgentSkillsCache();
    alertHelper.success("已登出", "您已安全登出帳號", true);
  };

  const updateUser = (newUserData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...newUserData };
      localStorage.setItem("user", JSON.stringify(updated));
      updateUserProfile(updated.email, newUserData).catch((err) => {
        console.error("Failed to sync profile update to db", err);
      });
      return updated;
    });
  };

  const toggleFavorite = async (promptId) => {
    if (!user) return;

    const isAlreadyFav = favorites.includes(promptId);

    try {
      const result = await toggleFavoriteAPI(promptId);

      setFavorites((prev) =>
        prev.includes(promptId)
          ? prev.filter((id) => id !== promptId)
          : [...prev, promptId]
      );
      if (typeof result?.favoriteCount === "number") {
        setFavoriteCounts((prev) => ({
          ...prev,
          [promptId]: result.favoriteCount,
        }));
      }
      refreshPublishedPrompts();

      if (!isAlreadyFav) {
        alertHelper.success("已收藏", "已加入您的收藏清單", true);
      } else {
        alertHelper.success("已取消收藏", "已從您的收藏清單移除", true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite via API", err);
      alertHelper.error("收藏失敗", "目前無法同步到伺服器", true);
    }
  };

  const toggleSkillFavorite = async (skillId) => {
    if (!user) return;

    const isAlreadyFav = skillFavorites.includes(skillId);

    try {
      const result = await toggleFavoriteAPI(skillId, "skill");

      setSkillFavorites((prev) =>
        prev.includes(skillId)
          ? prev.filter((id) => id !== skillId)
          : [...prev, skillId]
      );
      if (typeof result?.favoriteCount === "number") {
        setSkillFavoriteCounts((prev) => ({
          ...prev,
          [skillId]: result.favoriteCount,
        }));
      }

      if (!isAlreadyFav) {
        alertHelper.success("已收藏", "已加入您的收藏清單", true);
      } else {
        alertHelper.success("已取消收藏", "已從您的收藏清單移除", true);
      }
    } catch (err) {
      console.error("Failed to toggle skill favorite via API", err);
      alertHelper.error("收藏失敗", "目前無法同步到伺服器", true);
    }
  };

  const applyOnlineFavoriteState = (result) => {
    if (!Array.isArray(result?.favoriteIds)) {
      throw new Error("伺服器回傳的收藏資料格式不正確");
    }

    setFavorites(result.favoriteIds);
    if (result.favoriteCounts && typeof result.favoriteCounts === "object") {
      setFavoriteCounts((prev) => ({ ...prev, ...result.favoriteCounts }));
    }
  };

  const clearFavorites = async () => {
    if (!user) return;

    try {
      const result = await clearUserFavoritesAPI();
      applyOnlineFavoriteState(result);
      refreshPublishedPrompts();
      alertHelper.success("已清空收藏", "您的所有收藏已同步更新", true);
    } catch (err) {
      console.error("Failed to clear favorites via API", err);
      alertHelper.error("清空失敗", "目前無法同步到伺服器", true);
    }
  };

  const resetFavorites = async () => {
    if (!user) return;
    try {
      const result = await restoreDefaultFavoritesAPI();
      applyOnlineFavoriteState(result);
      refreshPublishedPrompts();
      alertHelper.success("已恢復預設收藏", "已套用官方預設收藏", true);
    } catch (err) {
      console.error("Failed to restore default favorites via API", err);
      alertHelper.error("恢復失敗", "目前無法同步到伺服器", true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        logout: logoutUser,
        updateUser,
        favorites,
        favoriteCounts,
        toggleFavorite,
        skillFavorites,
        skillFavoriteCounts,
        toggleSkillFavorite,
        clearFavorites,
        resetFavorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
