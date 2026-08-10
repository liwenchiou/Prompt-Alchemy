import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { copyToClipboard } from "../../utils/copyToClipboard";
import useAuth from "../../hooks/useAuth";
import {
  Heart,
  Star,
  GitFork,
  CodeXml,
  Database,
  Bug,
  PocketKnife,
  Rocket,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { getTagStyles } from "../../utils/tagStyles";

const CATEGORY_ICONS = {
  前端開發: CodeXml,
  後端開發: Database,
  除錯技巧: Bug,
  小工具: PocketKnife,
  "DevOps / 部署維運": Rocket,
  "測試 / 品質保證": ShieldCheck,
  "文件 / 寫作": FileText,
};

function formatStars(count = 0) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

export default function SkillCard({ skill, hideStats = false }) {
  const navigate = useNavigate();
  const { user, favorites, favoriteCounts, toggleFavorite } = useAuth();
  const [copied, setCopied] = useState(false);

  const liked = favorites.includes(skill.id);
  const likesCount = favoriteCounts[skill.id] ?? skill?.favoriteCount ?? 0;

  const handleCopy = async (e) => {
    e.stopPropagation();
    const success = await copyToClipboard(installCommand);
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
    toggleFavorite(skill.id);
  };

  const handleCardClick = () => {
    navigate(`/agent-skills/${skill.id}`);
  };

  const openExternal = (e, url) => {
    e.stopPropagation();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const categoryName = skill?.categoryName || skill?.category || "小工具";
  const categoryStyle = getTagStyles(categoryName);
  const CategoryIcon = CATEGORY_ICONS[categoryName] || PocketKnife;
  const repoLabel =
    skill?.repoOwner && skill?.repoName
      ? `${skill.repoOwner}/${skill.repoName}`
      : null;

  const installCommand = repoLabel
    ? `npx skills add https://github.com/${repoLabel} --skill ${skill?.skillSlug || skill?.name || ""}`
    : "npx skills add https://github.com/owner/repo --skill skill-slug";

  return (
    <div
      onClick={handleCardClick}
      data-pencil-name={skill?.name || "skill-card"}
      className="box-border flex-1 h-fit flex flex-col gap-4 p-[28px_16px_24px_16px] justify-start items-start bg-[#111827] border-2 border-[#1A4A2A] rounded-xl hover:border-[#39FF14]/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div
        data-pencil-name="Title Block"
        className="box-border w-full h-fit shrink-0 flex flex-col gap-2.5 justify-start items-start"
      >
        {/* 作者 / 來源 + 星星／愛心 */}
        <div className="flex w-full justify-between items-center gap-2">
          <div
            data-pencil-name="Source Row"
            className="flex items-center gap-2 min-w-0"
          >
            {skill?.creatorAvatarUrl && (
              <img
                src={skill.creatorAvatarUrl}
                alt={skill?.creatorName || "creator"}
                onClick={(e) => openExternal(e, skill?.creatorProfileUrl)}
                className="w-6 h-6 rounded-full border border-[#1A4A2A] shrink-0 hover:border-[#39FF14]/60 transition-colors"
              />
            )}
            {repoLabel && (
              <button
                type="button"
                onClick={(e) =>
                  openExternal(
                    e,
                    `https://github.com/${skill.repoOwner}/${skill.repoName}`
                  )
                }
                data-pencil-name="Repo Link"
                className="flex items-center gap-1 text-[12px]/[normal] text-[#7DCEA0] hover:text-[#39FF14] transition-colors bg-transparent border-0 cursor-pointer truncate p-0"
              >
                <GitFork size={14} className="shrink-0" />
                <span className="truncate text-[14px]/[normal]">
                  {repoLabel}
                </span>
              </button>
            )}
            {skill?.license && (
              <span
                data-pencil-name="License Badge"
                className="text-[10px]/[normal] shrink-0 text-[#3ebef5] border border-[#2a9ccd] rounded px-1"
              >
                {skill.license}
              </span>
            )}
          </div>

          <div
            data-pencil-name="Stats Col"
            className="flex flex-col items-end gap-1 shrink-0"
          >
            <div
              data-pencil-name="Stars"
              className="text-[13px]/[normal] box-border text-[#FFD700] font-normal text-left whitespace-nowrap flex items-center gap-1"
            >
              <Star size={14} fill="#FFD700" />
              {formatStars(skill?.stargazersCount)}
            </div>
          </div>
        </div>

        <div
          data-pencil-name="Card Title"
          className="text-[18px]/[normal] box-border text-[#E0F0E8] font-bold font-mono text-left whitespace-nowrap overflow-hidden text-ellipsis w-full"
        >
          /{skill?.name || "skill-name"}
        </div>

        <div
          data-pencil-name="Card Description"
          className="text-[13px]/[18px] box-border w-full text-[#7DCEA0] font-normal text-left line-clamp-2 overflow-hidden"
        >
          {skill?.description || "尚無描述。"}
        </div>
      </div>

      {/* 安裝指令 + 複製按鍵 */}
      <div className="box-border w-full flex justify-between items-center gap-2">
        <div
          data-pencil-name="Install Command"
          className="text-[14px]/[normal] box-border text-[#d4d9d6] font-mono text-left truncate bg-[rgba(21,70,12,0.7)] rounded-[4px] w-full px-2 py-2 hover:text-[#ffffff]"
        >
          {installCommand}
        </div>

        <button
          type="button"
          onClick={handleCopy}
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
      <div className="flex w-full justify-between items-center gap-2 mt-1">
        {/* 分類徽章 */}
        <div
          data-pencil-name={`Category ${categoryName}`}
          className={`box-border w-fit shrink-0 flex flex-row items-center gap-1 py-1 px-2 ${categoryStyle.bg} border ${categoryStyle.border} rounded-[999px]`}
        >
          <CategoryIcon size={14} className={categoryStyle.text} />
          <span
            className={`text-[12px]/[normal] font-normal text-left whitespace-nowrap ${categoryStyle.text}`}
          >
            {categoryName}
          </span>
        </div>
        {/* 收藏愛心數 */}
        <div>
          {" "}
          {!hideStats && (
            <button
              type="button"
              onClick={handleLike}
              data-pencil-name="Heart"
              className="text-[14px]/[normal] box-border text-[#fc4c87] hover:text-[#ff1476] active:scale-95 transition-all bg-transparent border-0 cursor-pointer font-normal text-left whitespace-nowrap flex items-center gap-1"
            >
              {liked ? <Heart size={14} fill="#fc4c87" /> : <Heart size={14} />}
              {likesCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
