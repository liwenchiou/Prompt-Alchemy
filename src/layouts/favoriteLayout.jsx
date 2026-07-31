import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { alertHelper } from "../utils/sweetAlert";

export default function FavoriteLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="Page Content"
        className="box-border w-full max-w-400 flex flex-col md:flex-row gap-5.5 justify-start items-start"
      >
        {/* Favorites Menu Sidebar */}
        <div
          data-pencil-name="Favorites Menu"
          className="box-border w-full md:w-60 shrink-0 flex flex-col gap-4.5 p-4.5 justify-start items-start bg-[#111827] border border-[#1A3A2A] rounded-[14px]"
        >
          <div
            data-pencil-name="Favorites Brand"
            className="box-border w-fit h-fit shrink-0 flex flex-row gap-2.5 justify-start items-center"
          >
            {/* <div
              data-pencil-name="Favorites Mark"
              className="box-border w-7 shrink-0 h-7 bg-[#39FF14] rounded-full"
            ></div> */}
            <div
              data-pencil-name="Favorites Brand Text"
              className="text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap"
            >
              My Library
            </div>
          </div>

          {/* Navigation Links */}
          <NavLink
            to="/favorites"
            end
            className={({ isActive }) =>
              `box-border w-full h-fit shrink-0 flex flex-row gap-0 py-2.5 px-3 justify-start items-start rounded-lg no-underline transition-all ${
                isActive
                  ? "bg-[#39FF14] text-[#0A0E1A] font-bold"
                  : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10 hover:text-[#39FF14]"
              }`
            }
          >
            <span className="text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
              我的收藏
            </span>
          </NavLink>

          <NavLink
            to="/favorites/profile"
            className={({ isActive }) =>
              `box-border w-full h-fit shrink-0 flex flex-row gap-0 py-2.5 px-3 justify-start items-start rounded-lg no-underline transition-all ${
                isActive
                  ? "bg-[#39FF14] text-[#0A0E1A] font-bold"
                  : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10 hover:text-[#39FF14]"
              }`
            }
          >
            <span className="text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
              個人資料
            </span>
          </NavLink>

          <NavLink
            to="/favorites/password"
            className={({ isActive }) =>
              `box-border w-full h-fit shrink-0 flex flex-row gap-0 py-2.5 px-3 justify-start items-start rounded-lg no-underline transition-all ${
                isActive
                  ? "bg-[#39FF14] text-[#0A0E1A] font-bold"
                  : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10 hover:text-[#39FF14]"
              }`
            }
          >
            <span className="text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
              修改密碼
            </span>
          </NavLink>

          <div
            onClick={handleLogout}
            className="box-border w-full h-fit shrink-0 flex flex-row gap-0 py-2.5 px-3 justify-start items-start bg-transparent hover:bg-[#FF00FF]/10 text-[#7DCEA0] hover:text-[#FF00FF] rounded-lg cursor-pointer transition-all"
          >
            <span className="text-[16px]/[normal] text-inherit text-left whitespace-nowrap">
              登出
            </span>
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
