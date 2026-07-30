import React, { useState } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { submitContactForm } from "../../api/contactApi";
import { alertHelper } from "../../utils/sweetAlert";

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alertHelper.error("欄位驗證錯誤", "請輸入您的稱呼");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      alertHelper.error("欄位驗證錯誤", "請輸入有效的 Email 地址");
      return;
    }
    if (!message.trim()) {
      alertHelper.error("欄位驗證錯誤", "請輸入您想告訴我們的內容");
      return;
    }

    try {
      setLoading(true);
      await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      alertHelper.success("傳送成功！", "感謝您的聯繫，我們會儘速回復您。");
      setName("");
      setEmail("");
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      alertHelper.error("傳送失敗", error.message || "伺服器忙碌中，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 展開後的聯絡表單 Modal */}
      {isOpen && (
        <div className="mb-4 w-88 md:w-96 overflow-hidden rounded-2xl border border-[#39FF14]/30 bg-[#0A0E1A]/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#39FF14]/15 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39FF14]/15 text-[#39FF14]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">聯絡我們</h3>
                <p className="text-xs text-[#7DCEA0]">
                  有任何想法或問題？歡迎隨時留言！
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="關閉聯絡表單"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 表單內容 */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7DCEA0] mb-1.5">
                您的名稱 <span className="text-[#39FF14]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入大名"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7DCEA0] mb-1.5">
                Email 信箱 <span className="text-[#39FF14]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7DCEA0] mb-1.5">
                聯絡內容 <span className="text-[#39FF14]">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="請描述您的問題或建議..."
                className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/50"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#39FF14] to-[#2ecc71] px-4 py-2.5 text-sm font-bold text-[#0A0E1A] shadow-lg shadow-[#39FF14]/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span>送出中...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>送出表單</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 右下角固定懸浮按鈕 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#0A0E1A] via-[#1F2937] to-[#39FF14] p-0.5 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[#39FF14]/50 active:scale-95"
        aria-label="打開聯絡我們"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0A0E1A] text-[#39FF14] transition-colors group-hover:bg-[#39FF14] group-hover:text-[#0A0E1A]">
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </div>
      </button>
    </div>
  );
}
