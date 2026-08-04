// 後台權限守門員：包在需要登入才能看的路由外層。
// 從 localStorage 讀登入狀態，並透過 API 驗證 Token 是否真的是 admin。
import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminAuth, logoutAdmin } from "../api/adminApi";
import { apiRequest } from "../api/apiClient";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

export default function ProtectedRoute() {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const admin = getAdminAuth();
      const token = localStorage.getItem("token");

      if (!admin || !token) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      try {
        // 呼叫 /auth/me 來檢查 role，確認 token 是否有效且是管理者
        const res = await apiRequest("/auth/me");
        if (res.user && res.user.role === "admin") {
          setIsAuthenticated(true);
        } else {
          // Token 有效，但不是 admin
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Token 失效或其他錯誤
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isVerifying) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // 驗證失敗，清除無效的 admin_auth，並導向登入頁
    logoutAdmin();
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // 已登入 → 放行，Outlet 會渲染子路由（AdminLayout 及其頁面）。
  return <Outlet />;
}
