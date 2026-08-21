import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { copyToClipboard } from "../../utils/copyToClipboard";
import useAuth from "../../hooks/useAuth";
import { Heart } from "lucide-react";
import { getTagStyles } from "../../utils/tagStyles";

export default function PromptCard({ prompt, hideStats = false }) {
  const navigate = useNavigate();
  const { user, favorites, favoriteCounts, toggleFavorite } = useAuth();
  const [copied, setCopied] = useState(false);

  const liked = favorites.includes(prompt.id);
  const likesCount = favoriteCounts[prompt.id] ?? prompt?.favoriteCount ?? 0;

  const handleCopy = async (e) => {
    e.stopPropagation();
    const textToCopy =
      prompt?.promptContent || prompt?.intro || "Default Prompt Content";
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(prompt.id);
  };

  const handleCardClick = () => {
    navigate(`/skills/${prompt.id || 1}`);
  };

  const tags = prompt?.tags || [];



  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      onClick={handleCardClick}
      aria-label={`Prompt：${prompt?.title || "技能詳情"}`}
      data-pencil-name={prompt?.title || "後端 API 審查"}
      className="box-border flex-1 min-w-0 h-fit flex flex-col gap-3.5 p-[28px_16px_24px_16px] justify-start items-start bg-[#111827] border-2 border-[#1A4A2A] rounded-xl hover:border-[#39FF14]/40 hover:shadow-lg transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-[#39FF14] overflow-hidden"
    >
      {/* 卡片title + 收藏 + 簡介 */}
      <div
        data-pencil-name="Title Block"
        className="box-border w-full h-fit shrink-0 flex flex-col gap-1.5 justify-start items-start"
      >
        <div className="flex w-full justify-between items-center">
          <button
            type="button"
            onClick={handleCardClick}
            data-pencil-name="Card Title"
            className="text-[20px]/[normal] box-border text-[#E0F0E8] font-bold text-left whitespace-nowrap overflow-hidden text-ellipsis w-full hover:text-[#39FF14] transition-colors bg-transparent border-0 cursor-pointer p-0 focus:outline-none"
          >
            {prompt?.title || "後端 API 審查"}
          </button>
          {!hideStats && (
            <button
              type="button"
              onClick={handleLike}
              aria-label={liked ? "取消收藏此 Prompt" : "加入收藏此 Prompt"}
              aria-pressed={liked}
              data-pencil-name="Heart"
              className="text-[14px]/[normal] box-border text-[#fc4c87] hover:text-[#ff1476] active:scale-95 transition-all bg-transparent border-0 cursor-pointer font-normal text-left whitespace-nowrap flex align-middle items-center gap-1"
            >
              {liked ? <Heart size={14} fill="#fc4c87" /> : <Heart size={14} />}
              {likesCount}
            </button>
          )}
        </div>

        <div
          data-pencil-name="Card Description"
          className="text-[12px]/[18px] box-border w-full text-[#7DCEA0] font-normal text-left line-clamp-2 h-9 overflow-hidden"
        >
          {prompt?.intro ||
            "檢查 Express / Next.js API 的錯誤處理、安全性與回傳結構。"}
        </div>
      </div>
      {/* Tag + 複製按鍵 */}
      <div className="box-border w-full flex justify-between items-start gap-2">
        {/* Tag的編排：改為可換行排列，避免卡片變窄時把按鍵擠出去 */}
        <div
          data-pencil-name="Tags Row"
          className="box-border min-w-0 flex-1 flex flex-row flex-wrap gap-1 justify-start items-start"
        >
          {tags.map((tag, idx) => {
            const tagLabel = tag?.name || "";
            const style = getTagStyles(tagLabel);
            return (
              <div
                key={tag?.id || idx}
                data-pencil-name={`Tag ${tagLabel}`}
                className={`box-border max-w-full shrink-0 h-fit flex flex-row gap-0 py-0.5 px-1.5 sm:py-1 sm:px-2 justify-start items-start ${style.bg} border ${style.border} rounded-[999px]`}
              >
                <div
                  data-pencil-name={`Tag Label ${tagLabel}`}
                  className={`text-[11px]/[normal] sm:text-[12px]/[normal] box-border ${style.text} font-normal text-left whitespace-nowrap overflow-hidden text-ellipsis`}
                >
                  {tagLabel}
                </div>
              </div>
            );
          })}
        </div>
        {/* 複製按鍵 */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "已複製至剪貼簿" : "複製 Prompt 內容至剪貼簿"}
          data-pencil-name="Copy Pill"
          className="box-border w-fit shrink-0 h-fit flex gap-0 py-1.25 px-2.5 justify-start items-start bg-[#0F1F18] hover:bg-[#39FF14]/15 active:scale-95 transition-all border border-[#00FFFF] rounded-[999px] cursor-pointer font-normal hover:font-semibold"
        >
          <div
            data-pencil-name="Copy Label"
            className="text-[14px]/[normal] box-border text-[#00FFFF] text-left whitespace-nowrap"
          >
            {copied ? "已複製" : "複製"}
          </div>
        </button>
      </div>
    </article>
  );
}
