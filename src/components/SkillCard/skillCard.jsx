import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, GitFork } from "lucide-react";
import { copyToClipboard } from "../../utils/copyToClipboard";
import useAuth from "../../hooks/useAuth";
import { getTagStyles } from "../../utils/tagStyles";
import {
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from "../../utils/categoryIcons";
import gitCloneIcon from "/github.svg?url";
import { getDefaultAgent, getInstallDisplay } from "./installCommands";
import { getAvailableAgentOptions } from "./agentOptions";

function formatStars(count = 0) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

export default function SkillCard({
  skill,
  hideStats = false,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const { user, skillFavorites, skillFavoriteCounts, toggleSkillFavorite } =
    useAuth();
  const [copiedKey, setCopiedKey] = useState(null);

  const [selectedAgent, setSelectedAgent] = useState(() =>
    getDefaultAgent(skill)
  );

  const liked = skillFavorites.includes(skill.id);
  const likesCount = skillFavoriteCounts[skill.id] ?? skill?.favoriteCount ?? 0;

  const handleCopy = async (e, command, key) => {
    e.stopPropagation();
    const success = await copyToClipboard(command);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    if (onToggleFavorite) {
      onToggleFavorite(skill);
      return;
    }
    toggleSkillFavorite(skill.id);
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
  const CategoryIcon = CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
  const repoLabel =
    skill?.repoOwner && skill?.repoName
      ? `${skill.repoOwner}/${skill.repoName}`
      : null;

  const {
    installRows,
    installShape,
    isGitClone,
    selectedRow,
    availableAgents,
  } = getInstallDisplay(skill, selectedAgent);
  const availableAgentOptions = getAvailableAgentOptions(availableAgents);

  return (
    <div
      onClick={handleCardClick}
      data-pencil-name={skill?.name || "skill-card"}
      className="box-border flex-1 min-w-0 h-fit flex flex-col gap-4 p-[28px_16px_24px_16px] justify-start items-start bg-[#111827] border-2 border-[#1A4A2A] rounded-xl hover:border-[#39FF14]/40 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
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
          {skill?.name || "skill-name"}
        </div>

        <div
          data-pencil-name="Card Description"
          className="text-[13px]/[18px] box-border w-full text-[#7DCEA0] font-normal text-left line-clamp-2 overflow-hidden"
        >
          {skill?.description || "尚無描述。"}
        </div>
      </div>

      <div className="box-border w-full flex flex-col gap-3">
        {installRows.length > 0 ? (
          <div className="box-border w-full flex flex-col gap-1.5">
            {installShape && (
              <span
                data-pencil-name="Install Shape Badge"
                className="w-fit text-[10px]/[normal] shrink-0 text-[#7DCEA0] border border-[#1A3A2A] rounded px-1"
              >
                {installShape === "single-kit" ? "Single kit" : "Full package"}
              </span>
            )}

            {availableAgentOptions.length > 0 && (
              <div
                data-pencil-name="Agent Picker"
                className="flex flex-wrap gap-1.5"
              >
                {availableAgentOptions.map((option) => {
                  const isSelected = option.agent === selectedAgent;
                  return (
                    <button
                      key={option.agent}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(option.agent);
                      }}
                      aria-pressed={isSelected}
                      data-pencil-name={`Agent Option ${option.label}`}
                      className={`text-[12px]/[normal] flex items-center gap-1 py-1 px-2 rounded-[4px] border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]"
                          : "bg-transparent border-[#1A3A2A] text-[#7DCEA0] hover:border-[#39FF14]/40"
                      }`}
                    >
                      <img
                        src={option.icon}
                        alt={option.alt}
                        className={`w-3.5 h-3.5 inline-block ${
                          option.invert ? "brightness-0 invert" : ""
                        }`}
                      />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {isGitClone && (
              <div
                data-pencil-name="Install Method Badge Git Clone"
                className="text-[13px]/[normal] w-fit shrink-0 flex items-center gap-1 border border-[#FFFFFF] rounded-[4px] p-1 text-[#FFFFFF]"
              >
                <img
                  src={gitCloneIcon}
                  alt="Git Clone Icon"
                  className="w-4 h-4 inline-block brightness-0 invert"
                />
                <span>Git Clone</span>
              </div>
            )}

            {selectedRow ? (
              <>
                <div
                  data-pencil-name={`Install Command ${selectedRow.label}`}
                  className="text-[13px]/[18px] box-border text-[#d4d9d6] font-mono text-left whitespace-pre-wrap wrap-break-word bg-[rgba(21,70,12,0.7)] rounded-[4px] w-full px-2 py-2 hover:text-[#ffffff]"
                >
                  {selectedRow.command}
                </div>
                <div className="box-border w-full flex justify-end items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleCopy(e, selectedRow.command, selectedRow.key)
                    }
                    data-pencil-name={`Copy Pill ${selectedRow.label}`}
                    className="box-border w-fit shrink-0 h-fit flex gap-0 py-1.25 px-2.5 justify-start items-start bg-[#0F1F18] hover:bg-[#39FF14]/15 active:scale-95 transition-all border border-[#00FFFF] rounded-[999px] cursor-pointer font-normal hover:font-semibold"
                  >
                    <div
                      data-pencil-name={`Copy Label ${selectedRow.label}`}
                      className="text-[14px]/[normal] box-border text-[#00FFFF] text-left whitespace-nowrap"
                    >
                      {copiedKey === selectedRow.key ? "已複製" : "複製"}
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-[12px]/[normal] box-border text-[#7DCEA0]/70 text-left">
                此 Skill 不支援目前選擇的 agent。
              </div>
            )}
          </div>
        ) : (
          <div className="text-[12px]/[normal] box-border text-[#7DCEA0]/70 text-left">
            尚無安裝指令。
          </div>
        )}
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
