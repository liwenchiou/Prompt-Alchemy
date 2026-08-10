import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { updateUserPassword } from "../../api/authApi";

export default function Password() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("所有欄位均為必填！");
      return;
    }

    if (newPassword.length < 6) {
      setError("新密碼長度最少需 6 位字元！");
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      setError("新密碼必須同時包含英文字母與數字，以提高安全性！");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("新密碼與確認新密碼不一致！");
      return;
    }

    if (currentPassword === newPassword) {
      setError("新密碼不能與目前密碼相同！");
      return;
    }

    updateUserPassword(user?.email || "", currentPassword, newPassword)
      .then(() => {
        setSuccessMsg("密碼已修改成功！下一次登入時請使用新密碼。");
        // Clear fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      })
      .catch((err) => {
        setError(err.message || "密碼修改失敗，請稍後再試。");
      });
  };


  return (
    <div className="box-border w-full flex flex-col gap-6 p-[24px_28px] bg-[#111827] border border-[#1A3A2A] rounded-[14px]">
      <div className="box-border w-full h-fit flex flex-col gap-1.5 border-b border-[#1A3A2A] pb-4">
        <div className="text-[28px]/[normal] text-[#FFFFFF] font-bold">
          修改密碼
        </div>
        <div className="text-[14px]/[normal] text-[#7DCEA0]">
          為保護帳號安全，請使用強度足夠的密碼。
        </div>
      </div>

      {error && (
        <div className="box-border w-full p-[12px_16px] bg-[#FF00FF]/10 border border-[#FF00FF]/40 rounded-[10px] text-[14px] text-[#FF00FF] font-medium">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="box-border w-full p-[12px_16px] bg-[#39FF14]/10 border border-[#39FF14]/40 rounded-[10px] text-[14px] text-[#39FF14] font-medium">
          ✨ {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="box-border w-full flex flex-col gap-5"
      >
        {/* Current Password */}
        <div className="box-border w-full flex flex-col gap-2">
          <label
            htmlFor="current-pwd"
            className="text-[13px] font-semibold text-[#E0F0E8]"
          >
            目前密碼 Current Password
          </label>
          <div className="box-border w-full relative">
            <input
              id="current-pwd"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="請輸入目前密碼"
              className="box-border w-full p-3.5 pr-11 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none focus:border-[#39FF14] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-3.75 text-[16px] text-[#7DCEA0] hover:text-[#39FF14] bg-transparent border-none cursor-pointer focus:outline-none transition-colors"
            >
              {showCurrent ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="box-border w-full flex flex-col gap-2">
          <label
            htmlFor="new-pwd"
            className="text-[13px] font-semibold text-[#E0F0E8]"
          >
            新密碼 New Password
          </label>
          <div className="box-border w-full relative">
            <input
              id="new-pwd"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="最少 6 位字元"
              className="box-border w-full p-3.5 pr-11 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none focus:border-[#39FF14] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-3.75 text-[16px] text-[#7DCEA0] hover:text-[#39FF14] bg-transparent border-none cursor-pointer focus:outline-none transition-colors"
            >
              {showNew ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="box-border w-full flex flex-col gap-2">
          <label
            htmlFor="confirm-new-pwd"
            className="text-[13px] font-semibold text-[#E0F0E8]"
          >
            確認新密碼 Confirm New Password
          </label>
          <div className="box-border w-full relative">
            <input
              id="confirm-new-pwd"
              type={showConfirm ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              placeholder="請再次輸入新密碼"
              className="box-border w-full p-3.5 pr-11 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none focus:border-[#39FF14] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-3.75 text-[16px] text-[#7DCEA0] hover:text-[#39FF14] bg-transparent border-none cursor-pointer focus:outline-none transition-colors"
            >
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="box-border w-full py-3.5 bg-[#39FF14] hover:bg-[#39FF14]/90 active:scale-[0.98] transition-all rounded-xl text-[#0A0E1A] font-bold border-none cursor-pointer mt-2.5"
        >
          修改密碼
        </button>
      </form>
    </div>
  );
}
