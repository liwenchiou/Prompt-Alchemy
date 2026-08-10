import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { registerUser, loginUser } from "../../api/authApi";
import { alertHelper } from "../../utils/sweetAlert";
import { usePageLoading } from "../../hooks/usePageLoading";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  usePageLoading(true); // 註冊頁無需非同步資料，直接關閉 loading

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // 1. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("請輸入有效的電子郵件地址！");
      return;
    }

    // 2. Name validation
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError("姓名長度必須至少為 3 個字元！");
      return;
    }
    const nameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (!nameRegex.test(trimmedName)) {
      setError("姓名只能包含中英文字母、數字與底線！");
      return;
    }

    // 3. Password length check
    if (password.length < 6) {
      setError("密碼長度必須至少為 6 個字元！");
      return;
    }

    // 4. Password strength check (contains both letters and numbers)
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError("密碼必須同時包含英文字母與數字，以提高安全性！");
      return;
    }

    // 5. Confirm password check
    if (password !== confirmPassword) {
      setError("密碼與確認密碼不一致！");
      return;
    }

    registerUser({
      email,
      name: trimmedName,
      password,
      role: "member",
    })
      .then(async (userData) => {
        alertHelper.success(
          "註冊成功",
          `歡迎加入，${userData.name || "新成員"}！`,
          true
        );
        try {
          const loggedInUser = await loginUser({ email, password });
          login(loggedInUser, { showSuccessAlert: false });
        } catch (loginErr) {
          console.warn("Auto login after register failed", loginErr);
        }
        navigate("/favorites/profile");
      })
      .catch((err) => {
        setError(err.message || "註冊失敗，請稍後再試。");
      });
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#0A0E1A] p-4">
      <form
        onSubmit={handleSubmit}
        data-pencil-name="Register Modal"
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
            建立新帳號
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
          className="text-[14px]/[21px] box-border w-full text-[#7DCEA0] font-normal text-left"
        >
          立即註冊以解鎖收藏、管理與自訂 Prompt 技能。
        </div>

        {error && (
          <div className="box-border w-full p-[10px_14px] bg-[#FF00FF]/10 border border-[#FF00FF]/40 rounded-[10px] text-[13px] text-[#FF00FF] ">
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
            電子郵件 Email
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

        {/* Name Field */}
        <div
          data-pencil-name="Field Username"
          className="box-border w-full h-fit shrink-0 flex flex-col gap-2 justify-start items-start"
        >
          <div
            data-pencil-name="Field Label Username"
            className="text-[13px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
          >
            姓名 Name
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 王小明"
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
            密碼 Password
          </div>
          <div className="box-border w-full h-fit shrink-0 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="最少 6 位字元"
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

        {/* Confirm Password Field */}
        <div
          data-pencil-name="Field Confirm Password"
          className="box-border w-full h-fit shrink-0 flex flex-col gap-2 justify-start items-start"
        >
          <div
            data-pencil-name="Field Label Confirm Password"
            className="text-[13px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
          >
            確認密碼 Confirm Password
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="請再次輸入密碼"
            required
            className="box-border w-full h-fit shrink-0 p-3.5 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none focus:border-[#39FF14] transition-all"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          data-pencil-name="Register Button"
          className="box-border w-full h-fit shrink-0 flex flex-row gap-0 p-3.5 justify-center items-center bg-[#39FF14] hover:bg-[#39FF14]/90 active:scale-[0.98] transition-all rounded-xl border-none cursor-pointer mt-2.5"
        >
          <div
            data-pencil-name="Register Button Label"
            className="text-[15px]/[normal] box-border text-[#0A0E1A] font-bold text-left whitespace-nowrap"
          >
            註冊
          </div>
        </button>



        <div
          data-pencil-name="Login Row"
          className="box-border w-full h-fit shrink-0 flex flex-row gap-1.5 justify-center items-start"
        >
          <div
            data-pencil-name="Login Hint"
            className="text-[13px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
          >
            已有帳號？
          </div>
          <Link
            to="/login"
            data-pencil-name="Login Link"
            className="text-[13px]/[normal] box-border text-[#39FF14] hover:text-[#39FF14]/80 transition-all cursor-pointer font-semibold text-left whitespace-nowrap no-underline"
          >
            立即登入
          </Link>
        </div>
      </form>
    </div>
  );
}
