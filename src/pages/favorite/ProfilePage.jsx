import { useState } from "react";
import useAuth from "../../hooks/useAuth";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [role, setRole] = useState(user?.role || "member");
  const [successMsg, setSuccessMsg] = useState("");

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setName(user?.name || "");
    setRole(user?.role || "member");
  }

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({
      name,
      role,
      theme: "default",
    });
    setSuccessMsg("個人資料已成功更新！");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="box-border w-full flex flex-col gap-6 p-[24px_28px] bg-[#111827] border border-[#1A3A2A] rounded-[14px]">
      <div className="box-border w-full h-fit flex flex-col gap-1.5 border-b border-[#1A3A2A] pb-4">
        <div className="text-[28px]/[normal] text-[#FFFFFF] font-bold">
          個人資料
        </div>
        <div className="text-[14px]/[normal] text-[#7DCEA0]">
          檢視與編輯你的公開帳號資料。
        </div>
      </div>

      {successMsg && (
        <div className="box-border w-full p-[12px_16px] bg-[#39FF14]/10 border border-[#39FF14]/40 rounded-[10px] text-[14px] text-[#39FF14] font-medium flex flex-row items-center gap-2.5 animate-pulse">
          ✨ {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="box-border w-full flex flex-col gap-5"
      >

        {/* Email Read-only */}
        <div className="box-border w-full flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#E0F0E8]">
            電子郵件 Email (不可更改)
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="box-border w-full p-3.5 bg-[#0A0E1A] border border-[#1A3A2A] rounded-xl text-[14px] text-[#7DCEA0] cursor-not-allowed opacity-60"
          />
        </div>

        {/* Name */}
        <div className="box-border w-full flex flex-col gap-2">
          <label
            htmlFor="name-input"
            className="text-[13px] font-semibold text-[#E0F0E8]"
          >
            姓名 Name
          </label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="請輸入姓名"
            className="box-border w-full p-3.5 bg-[#0F1F18] border border-[#1A3A2A] rounded-xl text-[14px] text-[#E0F0E8] focus:outline-none focus:border-[#39FF14] transition-all"
          />
        </div>


        {/* Action Button */}
        <button
          type="submit"
          className="box-border w-full py-3.5 bg-[#39FF14] hover:bg-[#39FF14]/90 active:scale-[0.98] transition-all rounded-xl text-[#0A0E1A] font-bold border-none cursor-pointer mt-2.5"
        >
          儲存修改
        </button>
      </form>
    </div>
  );
}
