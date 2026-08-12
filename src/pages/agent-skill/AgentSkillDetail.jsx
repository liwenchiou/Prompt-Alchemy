import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Undo2, Star, Heart, GitFork, ExternalLink } from "lucide-react";
import MarkdownDoc from "../../components/MarkdownDoc/MarkdownDoc";
import { getAgentSkillById } from "../../api/agentSkillApi";
import { getTagStyles } from "../../utils/tagStyles";
import { usePageLoading } from "../../hooks/usePageLoading";
import { copyToClipboard } from "../../utils/copyToClipboard";
import useAuth from "../../hooks/useAuth";
import {
  getDefaultAgent,
  getInstallDisplay,
} from "../../components/SkillCard/installCommands";
import { getAvailableAgentOptions } from "../../components/SkillCard/agentOptions";
import gitCloneIcon from "/github.svg?url";

const MARKDOWN_CONTENT_CLASS =
  "text-[14px]! text-[#E0F0E8]! " +
  "[&_h1]:text-[18px]! [&_h1]:sm:text-[22px]! [&_h1]:leading-snug! [&_h1]:font-bold! [&_h1]:text-white! [&_h1]:mt-4! [&_h1]:mb-2! " +
  "[&_h2]:text-[16px]! [&_h2]:sm:text-[19px]! [&_h2]:leading-snug! [&_h2]:font-bold! [&_h2]:text-white! [&_h2]:mt-4! [&_h2]:mb-2! " +
  "[&_h3]:text-[15px]! [&_h3]:sm:text-[16px]! [&_h3]:leading-snug! [&_h3]:font-bold! [&_h3]:text-white! [&_h3]:mt-3! [&_h3]:mb-1.5! " +
  "[&_h4]:text-[14px]! [&_h4]:leading-snug! [&_h4]:font-bold! [&_h4]:text-white! [&_h4]:mt-3! [&_h4]:mb-1.5! " +
  "[&_h5]:text-[14px]! [&_h5]:leading-snug! [&_h5]:font-semibold! [&_h5]:text-white! [&_h5]:mt-2! [&_h5]:mb-1! " +
  "[&_h6]:text-[13px]! [&_h6]:leading-snug! [&_h6]:font-semibold! [&_h6]:text-[#7DCEA0]! [&_h6]:mt-2! [&_h6]:mb-1! " +
  "[&_p]:my-2! [&_p]:leading-relaxed! " +
  "[&_a]:text-[#39FF14]! [&_a]:underline! [&_a:hover]:text-[#00FFFF]! " +
  "[&_ul]:list-disc! [&_ul]:pl-5! [&_ul]:my-2! [&_ol]:list-decimal! [&_ol]:pl-5! [&_ol]:my-2! [&_li]:my-1! " +
  "[&_code]:bg-[#111827]! [&_code]:text-[#00FFFF]! [&_code]:rounded! [&_code]:px-1! [&_code]:py-0.5! [&_code]:text-[13px]! " +
  "[&_pre]:bg-[#05080C]! [&_pre]:border! [&_pre]:border-[#1A3A2A]! [&_pre]:rounded-lg! [&_pre]:p-3! [&_pre]:overflow-x-auto! " +
  "[&_pre_code]:bg-transparent! [&_pre_code]:px-0! [&_pre_code]:py-0! " +
  "[&_blockquote]:border-l-2! [&_blockquote]:border-[#39FF14]/50! [&_blockquote]:pl-3! [&_blockquote]:text-[#7DCEA0]! " +
  "[&_img]:max-w-full! [&_img]:h-auto! [&_img]:rounded-lg! " +
  "[&_table]:block! [&_table]:w-full! [&_table]:overflow-x-auto! [&_table]:border-collapse! " +
  "[&_th]:border! [&_th]:border-[#1A3A2A]! [&_th]:p-2! [&_td]:border! [&_td]:border-[#1A3A2A]! [&_td]:p-2! " +
  "[&_hr]:border-[#1A3A2A]! [&_hr]:my-4!";

function formatStars(count = 0) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

export default function AgentSkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, skillFavorites, skillFavoriteCounts, toggleSkillFavorite } =
    useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [prevAgentSkillId, setPrevAgentSkillId] = useState(null);
  if (skill && skill.id !== prevAgentSkillId) {
    setPrevAgentSkillId(skill.id);
    setSelectedAgent(getDefaultAgent(skill));
  }

  usePageLoading(!loading);

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
    setNotFound(false);
  }

  useEffect(() => {
    let active = true;

    getAgentSkillById(id)
      .then((data) => {
        if (!active) return;
        setSkill(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const docUrl = skill?.docUrl || "";
  const [docContent, setDocContent] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(false);

  const [prevDocUrl, setPrevDocUrl] = useState(docUrl);
  if (docUrl !== prevDocUrl) {
    setPrevDocUrl(docUrl);
    setDocContent("");
    setDocError(false);
    setDocLoading(Boolean(docUrl));
  }

  useEffect(() => {
    if (!docUrl) return;

    let active = true;

    fetch(docUrl)
      .then((res) => {
        if (!res.ok) throw new Error("doc fetch failed");
        return res.text();
      })
      .then((text) => {
        if (!active) return;
        setDocContent(text);
        setDocLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setDocError(true);
        setDocLoading(false);
      });

    return () => {
      active = false;
    };
  }, [docUrl]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex items-center justify-center">
        <div className="text-[18px] text-[#7DCEA0]">載入中...</div>
      </div>
    );
  }

  if (notFound || !skill) {
    return (
      <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center justify-center gap-4">
        <div className="text-[18px] text-[#7DCEA0]">
          找不到這個 Agent Skill。
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-[#39FF14] underline text-[12px]"
        >
          返回列表
        </button>
      </div>
    );
  }

  const liked = skillFavorites.includes(skill.id);
  const likesCount = skillFavoriteCounts[skill.id] ?? skill.favoriteCount ?? 0;

  const handleLike = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleSkillFavorite(skill.id);
  };

  const categoryName = skill.categoryName || "小工具";
  const categoryStyle = getTagStyles(categoryName);
  const repoLabel =
    skill.repoOwner && skill.repoName
      ? `${skill.repoOwner}/${skill.repoName}`
      : "";
  const repoUrl = repoLabel ? `https://github.com/${repoLabel}` : "";
  const ownerAvatarUrl = skill.repoOwnerAvatarUrl || skill.creatorAvatarUrl;

  const {
    installRows,
    installShape,
    isGitClone,
    selectedRow,
    availableAgents,
  } = getInstallDisplay(skill, selectedAgent);
  const availableAgentOptions = getAvailableAgentOptions(availableAgents);

  const handleCopyInstallCommand = async (command, key) => {
    const success = await copyToClipboard(command);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    }
  };

  const excerptText =
    (skill.excerptSource !== "none" && skill.readmeExcerpt) ||
    skill.intro ||
    skill.description ||
    "此 Skill 尚無摘要內容。";

  return (
    <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="Agent Skill Detail Content"
        className="box-border w-full max-w-350 flex flex-col gap-5.5 py-3 justify-start items-start text-left"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex flex-row gap-2.5 justify-start items-center bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Undo2 className="w-4 h-4 shrink-0 text-[#7DCEA0]" />
          <span className="text-[16px] text-[#7DCEA0]">返回上一頁</span>
        </button>

        <div className="w-full flex flex-col gap-3.5">
          <div className="flex items-center gap-3 flex-wrap">
            {ownerAvatarUrl && (
              <img
                src={ownerAvatarUrl}
                alt={skill.creatorName || "creator"}
                className="w-10 h-10 rounded-full border border-[#1A4A2A]"
              />
            )}
            {skill.creatorProfileUrl ? (
              <a
                href={skill.creatorProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7DCEA0] hover:text-[#39FF14] text-[18px] flex items-center gap-1"
              >
                {skill.creatorName || "unknown"} <ExternalLink size={16} />
              </a>
            ) : (
              <span className="text-[#7DCEA0] text-[14px]">
                {skill.creatorName || "unknown"}
              </span>
            )}
            <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 text-[#FFD700] text-[16px]">
                <Star size={18} fill="#FFD700" />
                {formatStars(skill.stargazersCount)}
              </div>
              <button
                type="button"
                onClick={handleLike}
                data-pencil-name="Heart"
                className="text-[16px]/[normal] box-border text-[#fc4c87] hover:text-[#ff1476] active:scale-95 transition-all bg-transparent border-0 cursor-pointer font-normal text-left whitespace-nowrap flex items-center gap-1"
              >
                {liked ? (
                  <Heart size={18} fill="#fc4c87" />
                ) : (
                  <Heart size={18} />
                )}
                {likesCount}
              </button>
            </div>
          </div>

          <h1 className="text-[32px] sm:text-[44px] font-bold text-white wrap-break-word">
            /{skill.name}
          </h1>

          <div className="flex flex-wrap gap-2 items-center">
            <div
              className={`flex items-center gap-1 py-1 px-2 ${categoryStyle.bg} border ${categoryStyle.border} rounded-full`}
            >
              <span className={`text-[12px] ${categoryStyle.text}`}>
                {categoryName}
              </span>
            </div>
            {skill.license && (
              <span className="text-[12px] text-[#3ebef5] border border-[#2a9ccd] rounded px-1.5 py-0.5">
                {skill.license}
              </span>
            )}
            {repoLabel && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[18px] text-[#7DCEA0] hover:text-[#39FF14]"
              >
                <GitFork size={18} /> {repoLabel}
              </a>
            )}
          </div>

          {skill.intro && (
            <p
              data-testid="skill-intro"
              className="text-[16px] sm:text-[18px] text-[#7DCEA0]"
            >
              {skill.intro}
            </p>
          )}

          <div className="box-border w-full flex flex-col gap-3 border border-[#f9bc2c] rounded-2xl p-4.5">
            {installRows.length > 0 ? (
              <div className="box-border w-full flex flex-col gap-1.5">
                {installShape && (
                  <span
                    data-pencil-name="Install Shape Badge"
                    className="w-fit text-[10px]/[normal] shrink-0 text-[#7DCEA0] border border-[#1A3A2A] rounded px-1"
                  >
                    {installShape === "single-kit"
                      ? "Single kit"
                      : "Full package"}
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
                          onClick={() => setSelectedAgent(option.agent)}
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
                        onClick={() =>
                          handleCopyInstallCommand(
                            selectedRow.command,
                            selectedRow.key
                          )
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

          {skill.description && (
            <div className="w-full bg-[#080C12] border border-[#39FF14]/50 rounded-2xl p-4.5">
              <div className="text-[18px] font-bold text-[#FFD700] mb-2">
                說明
              </div>
              <pre className="whitespace-pre-wrap wrap-break-word text-[14px] text-[#E0F0E8] font-normal">
                {skill.description}
              </pre>
            </div>
          )}

          <div
            data-testid="skill-excerpt"
            className="w-full bg-[#080C12] border border-[#00FFFF]/50 rounded-2xl p-4.5"
          >
            <div className="text-[18px] font-bold text-[#00FFFF] mb-2">
              README 摘要
            </div>
            {skill.repoDescription && (
              <p className="text-[13px] text-[#7DCEA0] mb-2">
                {skill.repoDescription}
              </p>
            )}
            {docUrl && !docError ? (
              docLoading ? (
                <p className="text-[14px] text-[#7DCEA0]">文件載入中...</p>
              ) : (
                <div
                  data-testid="skill-doc-content"
                  className={MARKDOWN_CONTENT_CLASS}
                >
                  <MarkdownDoc content={docContent} baseUrl={docUrl} />
                </div>
              )
            ) : (
              <p
                data-testid="skill-excerpt-fallback"
                className="text-[14px] text-[#E0F0E8] whitespace-pre-wrap wrap-break-word"
              >
                {excerptText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
