import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
import { Heart, Sparkles, User, Lock, LogOut } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useCollapsible from "../hooks/useCollapsible";
import SidebarCollapseToggle from "../components/SidebarCollapseToggle/SidebarCollapseToggle";
import { alertHelper } from "../utils/sweetAlert";

export default function FavoriteLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, toggleCollapsed] = useCollapsible();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    const confirmed = await alertHelper.confirm(
      "確定要登出嗎？",
      "登出後將返回首頁。"
    );
    if (!confirmed) return;
    logout();
    navigate("/");
  };

  const navLinkClassName = ({ isActive }) =>
    `box-border w-auto md:w-full h-fit shrink-0 flex flex-row gap-0 md:gap-3 py-2 px-2 md:py-2.5 md:px-3 justify-center md:justify-start items-center rounded-lg no-underline transition-all ${
      collapsed ? "md:justify-center" : ""
    } ${
      isActive
        ? "bg-[#39FF14] text-[#0A0E1A] font-bold"
        : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10 hover:text-[#39FF14]"
    }`;

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="Page Content"
        className="box-border w-full max-w-400 flex flex-col md:flex-row gap-5.5 justify-start items-start"
      >
        {/* Favorites Menu Sidebar */}
        <div
          data-pencil-name="Favorites Menu"
          className={`box-border relative w-full ${
            collapsed ? "md:w-fit" : "md:w-60"
          } shrink-0 flex flex-row md:flex-col gap-1 md:gap-4.5 p-3 md:p-4.5 justify-around md:justify-start items-center md:items-start bg-[#111827] border border-[#1A3A2A] rounded-[14px] transition-all duration-300`}
        >
          <div
            data-pencil-name="Sidebar Collapse Toggle Wrapper"
            className="hidden md:block absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10"
          >
            <SidebarCollapseToggle
              collapsed={collapsed}
              onToggle={toggleCollapsed}
            />
          </div>

          {!collapsed && (
            <div
              data-pencil-name="Favorites Brand"
              className="hidden md:flex box-border w-full h-fit shrink-0 flex-row gap-2.5 justify-start items-center"
            >
              <div
                data-pencil-name="Favorites Brand Text"
                className="text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap"
              >
                My Library
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <NavLink
            to="/favorites"
            end
            title="我的收藏-Prompts"
            className={navLinkClassName}
          >
            <Heart size={18} className="shrink-0" />
            {!collapsed && (
              <span className="hidden md:inline text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
                我的收藏-Prompts
              </span>
            )}
          </NavLink>
          <NavLink
            to="/favorites/skills"
            title="我的收藏-Skills"
            className={navLinkClassName}
          >
            <Sparkles size={18} className="shrink-0" />
            {!collapsed && (
              <span className="hidden md:inline text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
                我的收藏-Skills
              </span>
            )}
          </NavLink>
          <NavLink
            to="/favorites/profile"
            title="個人資料"
            className={navLinkClassName}
          >
            <User size={18} className="shrink-0" />
            {!collapsed && (
              <span className="hidden md:inline text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
                個人資料
              </span>
            )}
          </NavLink>

          <NavLink
            to="/favorites/password"
            title="修改密碼"
            className={navLinkClassName}
          >
            <Lock size={18} className="shrink-0" />
            {!collapsed && (
              <span className="hidden md:inline text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
                修改密碼
              </span>
            )}
          </NavLink>

          <div
            onClick={handleLogout}
            title="登出"
            className={`box-border w-auto md:w-full h-fit shrink-0 flex flex-row gap-0 md:gap-3 py-2 px-2 md:py-2.5 md:px-3 justify-center md:justify-start items-center bg-transparent hover:bg-[#FF00FF]/10 text-[#7DCEA0] hover:text-[#FF00FF] rounded-lg cursor-pointer transition-all ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && (
              <span className="hidden md:inline text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
                登出
              </span>
            )}
          </div>
        </div>

        {/* Main Content Layout Outlet */}
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
