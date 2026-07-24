// 後台登入頁（/admin/login）。
// 這頁不套用 AdminLayout（沒有側邊欄），也不受 ProtectedRoute 保護，否則會無限導回自己。
// 登入成功後把管理者資訊存進 localStorage，再導向 /admin/skills。
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  // error 專門放「API 層級」的錯誤（例如帳號不存在）；欄位必填錯誤由 RHF 的 errors 處理。
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const handleQuickFill = () => {
    setValue("email", "admin@example.com");
    setValue("password", "Admin1234");
  };

  // 通過必填驗證後才進到這裡。
  const onSubmit = async ({ email, password }) => {
    setError("");
    try {
      await loginAdmin({ email, password });
      navigate("/admin/skills", { replace: true }); // replace：登入頁不留在上一頁歷史
    } catch (err) {
      setError(err.message || "登入失敗");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-200 bg-white p-8 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="space-y-1 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            管理者登入
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Prompt Alchemy 後台管理
          </p>
        </div>

        {/* 快速填入測試管理者帳號 */}
        <button
          type="button"
          onClick={handleQuickFill}
          className="w-full text-xs py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 font-semibold"
        >
          ⚡ 點擊快速帶入管理者帳號 (admin@example.com)
        </button>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@promptalchemy.com"
            {...register("email", { required: "請輸入 Email" })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            密碼
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password", { required: "請輸入密碼" })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "登入中…" : "登入"}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          測試帳號：admin@example.com（密碼：Admin1234）
        </p>
      </form>
    </div>
  );
}
