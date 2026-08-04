import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { loginUser } from "../../api/authApi";
import { usePageLoading } from "../../hooks/usePageLoading";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  // 登入頁無需非同步資料，直接關閉 loading
  usePageLoading(true);

  const [email, setEmail] = useState(() => localStorage.getItem("remembered_email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("remembered_email"));
  const [error, setError] = useState("");

  const handleClose = () => {
    navigate("/");
  };

  const handleQuickFill = () => {
    setEmail("member@example.com");
    setPassword("Member1234");
    setRememberMe(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("請填寫 Email 與密碼！");
      return;
    }

    loginUser({ email, password })
      .then((userData) => {
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        login(userData);
        navigate("/");
      })
      .catch((err) => {
        setError(err.message || "登入失敗，請檢查帳密是否正確。");
      });
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#0A0E1A] p-4">
      <form
        onSubmit={handleSubmit}
        data-pencil-name="Login Modal"
        className="box-border w-full max-w-110 shrink-0 h-fit [box-shadow:0px_0px_40px_0px_#39FF1420] flex flex-col gap-5 p-8 justify-start items-start bg-[#111827] border border-[#39FF14] rounded-3xl"
      >
        <div
          data-pencil-name="Modal Header"
          className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
        >
          <div
            data-pencil-name="Modal Title"
            className="text-[28px]/[normal] box-border text-[#FFFFFF] font-bold text-left whitespace-nowrap"
          >
            歡迎回來
          </div>
          <button
            type="button"
            onClick={handleClose}
            data-pencil-name="Modal Close"
            className="text-[18px]/[normal] box-border text-[#7DCEA0] hover:text-[#39FF14] transition-colors font-normal text-left whitespace-nowrap bg-transparent border-none cursor-pointer focus:outline-none"
          >
            ✕
          </button>
        </div>
        <div
          data-pencil-name="Modal Subtitle"
          className="text-[14px]/[21px] box-border w-full text-[#7DCEA0] font-normal text-left flex justify-between items-center"
        >
          <span>登入你的帳號，管理收藏的 Prompt 與 Skill。</span>
        </div>

        {/* Quick Fill Button */}
        <button
          type="button"
          onClick={handleQuickFill}
          className="w-full text-xs py-2 px-3 bg-[#0F281C] hover:bg-[#1A3A2A] text-[#39FF14] border border-[#39FF14]/40 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 font-semibold"
        >
          ⚡ 點擊快速帶入測試帳號 (member@example.com)
        </button>

        {error && (
          <div className="box-border w-full p-[10px_14px] bg-[#FF00FF]/10 border border-[#FF00FF]/40 rounded-[10px] text-[13px] text-[#FF00FF] font-['JetBrains_Mono',system-ui,sans-serif]">
            ⚠️ {error}
          </div>
        )}

        {/* Email Field */}
        <div
          data-pencil-name="Field Email"
          className="box-border w-full h-fit shrink-0 flex flex-col gap-2 justify-start items-start"
        >
          <div
            data-pencil-name="Field Label Email"
            className="text-[13px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
          >
            Email
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="box-border w-full h-fit shrink-0 p-3.5 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none focus:border-[#39FF14] transition-all"
          />
        </div>

        {/* Password Field */}
        <div
          data-pencil-name="Field Password"
          className="box-border w-full h-fit shrink-0 flex flex-col gap-2 justify-start items-start"
        >
          <div
            data-pencil-name="Field Label Password"
            className="text-[13px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
          >
            密碼
          </div>
          <div className="box-border w-full h-fit shrink-0 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="box-border w-full h-fit shrink-0 p-3.5 pr-11 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none focus:border-[#39FF14] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              data-pencil-name="Password Toggle"
              className="absolute right-3.5 top-3.75 text-[16px]/[normal] box-border text-[#7DCEA0] hover:text-[#39FF14] font-normal bg-transparent border-none cursor-pointer focus:outline-none transition-colors"
            >
              👁
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div
          data-pencil-name="Remember Row"
          className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
        >
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            data-pencil-name="Remember Left"
            className="box-border w-fit shrink-0 h-fit flex flex-row gap-2.5 justify-start items-center bg-transparent border-none cursor-pointer focus:outline-none"
          >
            <div
              data-pencil-name="Remember Check"
              className={`box-border w-3.5 shrink-0 h-3.5 rounded-full border transition-all ${
                rememberMe
                  ? "bg-[#39FF14] border-[#39FF14]"
                  : "bg-transparent border-[#3D6B50]"
              }`}
            ></div>
            <div
              data-pencil-name="Remember Label"
              className="text-[13px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
            >
              記住我
            </div>
          </button>
          <div
            onClick={() =>
              alert(
                "此為展示專案，請使用預設帳密 (member@example.com / Member1234) 登入，或直接註冊新帳號。"
              )
            }
            data-pencil-name="Forgot Password"
            className="text-[13px]/[normal] box-border text-[#00FFFF] hover:text-[#39FF14] transition-colors cursor-pointer font-normal text-left whitespace-nowrap"
          >
            忘記密碼？
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          data-pencil-name="Login Button"
          className="box-border w-full h-fit shrink-0 flex flex-row gap-0 p-3.5 justify-center items-center bg-[#39FF14] hover:bg-[#39FF14]/90 active:scale-[0.98] transition-all rounded-xl border-none cursor-pointer"
        >
          <div
            data-pencil-name="Login Button Label"
            className="text-[15px]/[normal] box-border text-[#0A0E1A] font-bold text-left whitespace-nowrap"
          >
            登入
          </div>
        </button>

        <div
          data-pencil-name="Signup Row"
          className="box-border w-full h-fit shrink-0 flex flex-row gap-1.5 justify-center items-start"
        >
          <div
            data-pencil-name="Signup Hint"
            className="text-[13px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
          >
            還沒有帳號？
          </div>
          <Link
            to="/register"
            data-pencil-name="Signup Link"
            className="text-[13px]/[normal] box-border text-[#39FF14] hover:text-[#39FF14]/80 transition-all cursor-pointer font-semibold text-left whitespace-nowrap no-underline"
          >
            立即註冊
          </Link>
        </div>
      </form>
    </div>
  );
}
