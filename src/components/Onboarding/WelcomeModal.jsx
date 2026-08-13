import { useOnboarding } from "../../context/OnboardingContext";
import { Sparkles, Zap, FolderHeart, X, Compass } from "lucide-react";

export default function WelcomeModal() {
  const { isWelcomeOpen, startTour, closeWelcomeModal } = useOnboarding();

  if (!isWelcomeOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#05080F]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0D1222] text-[#E0F0E8] border border-[#39FF14]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(57,255,20,0.15)] flex flex-col gap-6">
        
        {/* Close icon button */}
        <button
          onClick={closeWelcomeModal}
          className="absolute top-4 right-4 text-[#7DCEA0] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#39FF14]/20 to-[#FFD700]/20 border border-[#39FF14]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)] animate-pulse">
            <Sparkles className="w-8 h-8 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              歡迎來到 <span className="text-[#FFD700] font-kyo">Prompt-Alchemy</span>
            </h2>
            <p className="text-sm sm:text-base text-[#7DCEA0] mt-1">
              專為 AI 創作者與開發者打造的指令與技能鍊金術平台
            </p>
          </div>
        </div>

        {/* Highlight Features */}
        <div className="flex flex-col gap-3.5 bg-[#050810]/60 p-4 rounded-xl border border-white/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#39FF14]/10 text-[#39FF14] shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">10 秒速查與一鍵安裝</h4>
              <p className="text-xs text-[#9CA3AF]">開箱即用的優質 AI 提示詞與 Agent Skills 設定檔。</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] shrink-0 mt-0.5">
              <FolderHeart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">分類、搜尋與我的收藏</h4>
              <p className="text-xs text-[#9CA3AF]">輕鬆管理您的專屬 AI 工具庫，隨時分類儲存常用技能。</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">批量技能模組 (Bulk Install)</h4>
              <p className="text-xs text-[#9CA3AF]">一鍵打包安裝多重 Agent Skills，極速提升 AI 工作流效率。</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <button
            onClick={startTour}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#39FF14] hover:bg-[#32DD10] text-[#0A0E1A] font-bold text-sm sm:text-base transition-all duration-200 shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            開始 10 秒導覽
          </button>
          
          <button
            onClick={closeWelcomeModal}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/10 font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            跳過指引，直接探索
          </button>
        </div>

      </div>
    </div>
  );
}
