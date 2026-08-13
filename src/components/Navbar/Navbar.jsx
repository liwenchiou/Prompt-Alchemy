import { Link } from "react-router-dom";
import { ClipboardList, FolderHeart, HelpCircle } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useOnboarding } from "../../context/OnboardingContext";

export default function Navbar() {
  const { user } = useAuth();
  const { replayTour } = useOnboarding();

  return (
    <nav
      data-pencil-name="Top Nav"
      className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center py-4 px-6 bg-[#0A0E1A] border-b border-[#39FF14]/15"
    >
      <Link
        to="/"
        data-pencil-name="Brand"
        data-tour="navbar-brand"
        className="box-border w-fit shrink-0 h-fit flex flex-row gap-3 justify-start items-center no-underline me-4 sm:me-0"
      >
        <div
          data-pencil-name="Brand Mark Wrap"
          className="box-border w-7.5 shrink-0 h-7.5 relative"
        >
          <div
            data-pencil-name="Brand Mark"
            className="box-border w-7.5 h-7.5 absolute left-0 top-0 bg-[#39FF14] rounded-full z-0"
          ></div>
          <div
            data-pencil-name="Brand Dot"
            className="text-[14px]/[normal] box-border absolute left-2 top-1.5 text-[#262626] font-bold text-left whitespace-nowrap z-10"
          >
            ✦
          </div>
        </div>
        <div
          data-pencil-name="Brand Text"
          className="text-[20px]/[normal] box-border text-[#39FF14] font-bold text-left whitespace-nowrap"
        >
          Prompt 鍊金坊
        </div>
      </Link>

      <div
        data-pencil-name="Nav Links"
        data-tour="nav-links"
        className="box-border flex-1 min-w-0 h-fit flex flex-row gap-2 sm:gap-3 lg:gap-28 justify-evenly lg:justify-start items-center mx-3 sm:mx-6 lg:flex-none lg:w-fit"
      >
        <Link
          to="/"
          data-pencil-name="Nav 首頁"
          className="hidden md:inline-flex flex-1 lg:flex-none justify-center text-[16px]/[normal] box-border text-[#7DCEA0] hover:text-[#39FF14] transition-colors font-bold text-center whitespace-nowrap no-underline"
        >
          首頁
        </Link>
        <Link
          to="/skills"
          data-pencil-name="Nav Prompts列表"
          aria-label="Prompts列表"
          className="inline-flex flex-1 lg:flex-none justify-center items-center text-[16px]/[normal] box-border text-[#7DCEA0] hover:text-[#39FF14] transition-colors font-bold text-center whitespace-nowrap no-underline"
        >
          <span className="hidden sm:inline">Prompts列表</span>
          <span className="sm:hidden" aria-hidden="true">
            <ClipboardList size={20} />
          </span>
        </Link>
        <Link
          to="/agent-skills"
          data-pencil-name="Nav Agent Skills"
          aria-label="Agent Skills"
          className="inline-flex flex-1 lg:flex-none justify-center items-center text-[16px]/[normal] box-border text-[#7DCEA0] hover:text-[#39FF14] transition-colors font-bold text-center whitespace-nowrap no-underline"
        >
          <span className="hidden sm:inline">Skills清單</span>
          <span className="sm:hidden" aria-hidden="true">
            <ClipboardList size={20} />
          </span>
        </Link>
        {user && (
          <Link
            to="/favorites"
            data-pencil-name="Nav 我的收藏"
            aria-label="我的收藏"
            className="inline-flex flex-1 lg:flex-none justify-center items-center text-[16px]/[normal] box-border text-[#7DCEA0] hover:text-[#39FF14] transition-colors font-bold text-center whitespace-nowrap no-underline"
          >
            <span className="hidden sm:inline">我的收藏</span>
            <span className="sm:hidden" aria-hidden="true">
              <FolderHeart size={20} />
            </span>
          </Link>
        )}
      </div>

      <div
        data-pencil-name="Nav Actions"
        className="box-border w-fit shrink-0 h-fit flex flex-row gap-3 sm:gap-4 justify-start items-center"
      >
        {/* 新手指引重播按鈕：僅登入後顯示 */}
        {user && (
          <button
            onClick={replayTour}
            data-tour="tour-replay-btn"
            title="重新觀看新手導覽"
            className="box-border flex items-center gap-1.5 py-2 px-3 text-[14px] text-[#7DCEA0] hover:text-[#39FF14] bg-white/5 hover:bg-[#39FF14]/10 border border-white/10 hover:border-[#39FF14]/40 rounded-lg transition-all cursor-pointer"
          >
            <HelpCircle size={17} className="text-[#FFD700]" />
            <span className="hidden sm:inline font-semibold">新手指引</span>
          </button>
        )}

        {user ? (
          <>
            <Link
              to="/favorites/profile"
              title={`個人資料 (${user.name})`}
              data-pencil-name="Avatar Wrap"
              className="box-border w-8 shrink-0 h-8 relative cursor-pointer group"
            >
              <div
                data-pencil-name="Avatar"
                className="box-border w-8 h-8 absolute left-0 top-0 bg-[#0F1F18] border border-[#1A3A2A] group-hover:border-[#39FF14] rounded-full z-0 transition-all"
              ></div>
              <div
                data-pencil-name="Avatar Text"
                className="text-[14px]/[normal] box-border absolute left-1.75 top-1.5 text-[#7DCEA0] group-hover:text-[#39FF14] font-normal text-left whitespace-nowrap z-10 transition-colors"
              >
                👤
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              data-pencil-name="Login Button"
              className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-2.5 px-4.5 justify-start items-start bg-transparent border border-[#39FF14] hover:bg-[#39FF14]/10 transition-all duration-200 rounded-lg no-underline"
            >
              <div
                data-pencil-name="Login Label"
                className="text-[14px]/[normal] box-border text-[#39FF14] font-normal text-left whitespace-nowrap"
              >
                登入
              </div>
            </Link>
            <Link
              to="/register"
              data-pencil-name="Signup Button"
              className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-2.5 px-4.5 justify-start items-start bg-[#39FF14] hover:bg-[#32dd10] transition-all duration-200 rounded-lg no-underline"
            >
              <div
                data-pencil-name="Signup Label"
                className="text-[14px]/[normal] box-border text-[#0A0E1A] font-bold text-left whitespace-nowrap"
              >
                註冊
              </div>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
