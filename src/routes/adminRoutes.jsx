// 後台路由設定（會被掛進 src/routes/index.jsx 的總路由）。
//
// 結構分三塊：
//  1. /admin/login          → 公開，不包 ProtectedRoute、不包 AdminLayout。
//  2. ProtectedRoute 底下    → 先擋登入，再套 AdminLayout（側邊欄 + 內容區），
//                              裡面才是首頁 / 分類管理 / Prompt·Skill 管理 / 表單頁。
//  3. /admin/*              → 其他沒對到的路徑顯示後台 404。
import ProtectedRoute from "./protectedRoute";
import AdminLayout from "../layouts/adminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminParameters from "../pages/admin/AdminParameters";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSkillsView from "../pages/admin/AdminSkillsView";
import AdminSkillFormManager from "../pages/admin/AdminSkillFormManager";
import AdminNotFound from "../pages/admin/notFound";

const adminRoutes = {
  path: "/admin",
  children: [
    {
      // 登入頁不套用 ProtectedRoute 與 AdminLayout
      path: "login",
      element: <AdminLogin />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: <AdminDashboard />,
            },
            {
              path: "parameters",
              element: <AdminParameters />,
            },
            {
              path: "users",
              element: <AdminUsers />,
            },
            {
              path: "skills",
              element: <AdminSkillsView />,
            },
            // 新增與編輯指向同一個元件，靠有沒有 :id 來區分模式。
            {
              path: "skills/new",
              element: <AdminSkillFormManager />,
            },
            {
              path: "skills/:id/edit",
              element: <AdminSkillFormManager />,
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <AdminNotFound />,
    },
  ],
};

export default adminRoutes;
