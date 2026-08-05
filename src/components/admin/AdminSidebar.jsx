// 後台側邊欄：導覽連結 + 最下方的登出鈕。
import { NavLink, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";

// 導覽項目集中定義，之後要增減頁面改這裡即可。
// end: true 讓「後台首頁」只有在剛好停在 /admin 時才顯示成選中（避免子頁面也被點亮）。
const NAV_ITEMS = [
  { to: "/admin", label: "後台首頁", icon: "🏠", end: true },
  { to: "/admin/parameters", label: "參數管理", icon: "🗂️" },
  { to: "/admin/users", label: "會員管理", icon: "👥" },
  { to: "/admin/skills", label: "Prompt / Skill 管理", icon: "📝" },
  { to: "/admin/faqs", label: "FAQ 管理", icon: "❓" },
  { to: "/admin/contacts", label: "聯絡表單管理", icon: "📬" },
];


export default function AdminSidebar() {
  const navigate = useNavigate();

  // 登出：先跳確認視窗，確認後清掉 localStorage 的登入狀態並導回登入頁。
  const handleLogout = async () => {
    const confirmed = await alertHelper.confirm("確定要登出嗎？");
    if (!confirmed) return;
    await logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Prompt Alchemy
        </span>
      </div>

      <nav aria-label="後台管理選單" className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="登出後台管理系統"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <span className="text-base">🚪</span>
          <span>登出</span>
        </button>
      </div>
    </aside>
  );
}
