import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Undo2, Star, Heart, GitFork, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { getAgentSkillById } from "../../api/agentSkillApi";
import { getTagStyles } from "../../utils/tagStyles";
import { usePageLoading } from "../../hooks/usePageLoading";
import { copyToClipboard } from "../../utils/copyToClipboard";
import useAuth from "../../hooks/useAuth";
import openaiIcon from "/openail.svg?url";
import claudeIcon from "/claude-color.svg?url";
import gitCloneIcon from "/github.svg?url";

const INSTALL_ROW_BADGE_STYLES = {
  claude: "text-[#d97757] border-[#d97757]",
  codex: "text-[#FFFFFF] border-[#FFFFFF]",
  "git-clone": "text-[#FFFFFF] border-[#FFFFFF]",
};

function isAlignAttribute(attribute) {
  return (Array.isArray(attribute) ? attribute[0] : attribute) === "align";
}

// rehype-sanitize 預設允許 legacy 的 align 屬性（<p align="center"> 這種 README 常見寫法），
// 瀏覽器仍會照做置中；拿掉它讓內容一律吃我們自己的排版樣式，不受來源 repo 影響。
const MARKDOWN_SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: Object.fromEntries(
    Object.entries(defaultSchema.attributes || {}).map(([tag, attributes]) => [
      tag,
      (attributes || []).filter((attribute) => !isAlignAttribute(attribute)),
    ])
  ),
};

// 比照 GitHub 的呈現，讓解析出來的原始 HTML（README 常見的 <picture>/<img> 響應式圖片）
// 也能正常渲染；rehypeSanitize 接在後面過濾掉腳本等危險標籤/屬性，防止第三方 repo 的 XSS。
const MARKDOWN_REHYPE_PLUGINS = [
  rehypeRaw,
  [rehypeSanitize, MARKDOWN_SANITIZE_SCHEMA],
];

// 沒有 Tailwind Typography 外掛，這裡手刻對應暗色主題的 Markdown 排版樣式。
const MARKDOWN_CONTENT_CLASS =
  "text-[14px] text-[#E0F0E8] " +
  "[&_h1]:text-[22px] [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2 " +
  "[&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 " +
  "[&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-1.5 " +
  "[&_p]:my-2 [&_p]:leading-relaxed " +
  "[&_a]:text-[#39FF14] [&_a]:underline [&_a:hover]:text-[#00FFFF] " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 " +
  "[&_code]:bg-[#111827] [&_code]:text-[#00FFFF] [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] " +
  "[&_pre]:bg-[#05080C] [&_pre]:border [&_pre]:border-[#1A3A2A] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto " +
  "[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-[#39FF14]/50 [&_blockquote]:pl-3 [&_blockquote]:text-[#7DCEA0] " +
  "[&_img]:max-w-full [&_img]:rounded-lg " +
  "[&_table]:border-collapse [&_th]:border [&_th]:border-[#1A3A2A] [&_th]:p-2 [&_td]:border [&_td]:border-[#1A3A2A] [&_td]:p-2 " +
  "[&_hr]:border-[#1A3A2A] [&_hr]:my-4";

function formatStars(count = 0) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

export default function AgentSkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, favorites, favoriteCounts, toggleFavorite } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

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

    // docUrl 指向 raw.githubusercontent.com 的 README.md／SKILL.md 純文字內容，
    // 有開放 CORS，前端直接 fetch 渲染，不透過後端代理。
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
        <Link
          to="/agent-skills"
          className="text-[#39FF14] underline text-[12px]"
        >
          返回列表
        </Link>
      </div>
    );
  }

  const liked = favorites.includes(skill.id);
  const likesCount = favoriteCounts[skill.id] ?? skill.favoriteCount ?? 0;

  const handleLike = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(skill.id);
  };

  const categoryName = skill.categoryName || "小工具";
  const categoryStyle = getTagStyles(categoryName);
  const repoLabel =
    skill.repoOwner && skill.repoName
      ? `${skill.repoOwner}/${skill.repoName}`
      : "";
  const repoUrl = repoLabel ? `https://github.com/${repoLabel}` : "";
  const ownerAvatarUrl = skill.repoOwnerAvatarUrl || skill.creatorAvatarUrl;

  // 安裝機制判斷邏輯比照 FRONTEND_API_SPEC.md 第 9 節：兩個 agent 的安裝機制完全獨立、
  // 各自最多一種、不並存——Claude Code 一律走 Claude Plugin（兩行指令），Codex 一律走
  // npx（一行指令），兩者不會混在一起。gitCloneMethod 為 true 時兩者皆不提供，改用
  // git clone 保底，此時 claudeInstallMethod／codexInstallMethod 一定都是 false。
  const gitCloneOnly = Boolean(skill.gitCloneMethod);

  const claudeCommand =
    !gitCloneOnly && skill.claudeInstallMethod && repoLabel
      ? [
          `claude plugin marketplace add ${repoLabel}`,
          `claude plugin install ${skill.claudePluginName || ""}@${skill.claudeMarketplaceName || ""}`,
        ].join("\n")
      : "";

  const codexCommand =
    !gitCloneOnly && skill.codexInstallMethod && repoLabel
      ? `npx skills add ${repoLabel} --skill ${skill.skillSlug || skill.name || ""} -a codex`
      : "";

  const gitCloneCommand =
    gitCloneOnly && repoLabel
      ? `git clone https://github.com/${repoLabel}.git`
      : "";

  // 任一安裝方式不滿足就不顯示該行；gitCloneMethod 為 true 時只顯示保底的 git clone 一行。
  const installRows = gitCloneCommand
    ? [{ key: "git-clone", label: "Git Clone", command: gitCloneCommand }]
    : [
        claudeCommand && {
          key: "claude",
          label: "Claude",
          command: claudeCommand,
        },
        codexCommand && { key: "codex", label: "Codex", command: codexCommand },
      ].filter(Boolean);

  const handleCopyInstallCommand = async (command, key) => {
    const success = await copyToClipboard(command);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    }
  };
  // 08 號票（GitHub metadata 同步）補上真正的 README 摘要前，excerptSource
  // 一律是 'none'，此時改顯示 Admin 填的 intro；intro 也是空的話再退到
  // description，最後才用固定文字兜底，確保這個區塊永遠不會顯示空白。
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
        <Link
          to="/agent-skills"
          className="flex flex-row gap-2.5 justify-start items-center no-underline hover:opacity-80 transition-opacity"
        >
          <Undo2 className="w-4 h-4 shrink-0 text-[#7DCEA0]" />
          <span className="text-[16px] text-[#7DCEA0]">返回列表</span>
        </Link>

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
              <div className="flex items-center gap-1 text-[#FFD700] text-[13px]">
                <Star size={16} fill="#FFD700" />
                {formatStars(skill.stargazersCount)}
              </div>
              <button
                type="button"
                onClick={handleLike}
                data-pencil-name="Heart"
                className="text-[13px]/[normal] box-border text-[#fc4c87] hover:text-[#ff1476] active:scale-95 transition-all bg-transparent border-0 cursor-pointer font-normal text-left whitespace-nowrap flex items-center gap-1"
              >
                {liked ? (
                  <Heart size={16} fill="#fc4c87" />
                ) : (
                  <Heart size={16} />
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

          {/* 安裝指令：Claude／Codex／Git Clone 各自安裝機制不同，各佔一行，任一方不滿足就不顯示 */}
          <div className="box-border w-full flex flex-col gap-3 border border-[#f9bc2c] rounded-2xl p-4.5">
            {installRows.length > 0 ? (
              installRows.map((row) => (
                <div
                  key={row.key}
                  className="box-border w-full flex flex-col gap-1"
                >
                  <div
                    data-pencil-name={`Install Method Badge ${row.label}`}
                    className={`text-[13px]/[normal] w-fit shrink-0 flex align-middle border rounded-[4px] p-1 ${
                      INSTALL_ROW_BADGE_STYLES[row.key] ||
                      "text-[#7DCEA0] border-[#1A3A2A]"
                    }`}
                  >
                    {openaiIcon && row.key === "codex" && (
                      <img
                        src={openaiIcon}
                        alt="OpenAI Icon"
                        className="w-4 h-4 inline-block mr-1 brightness-0 invert"
                      />
                    )}
                    {claudeIcon && row.key === "claude" && (
                      <img
                        src={claudeIcon}
                        alt="Claude Icon"
                        className="w-4 h-4 inline-block mr-1"
                      />
                    )}
                    {gitCloneIcon && row.key === "git-clone" && (
                      <img
                        src={gitCloneIcon}
                        alt="Git Clone Icon"
                        className="w-4 h-4 inline-block mr-1 brightness-0 invert"
                      />
                    )}
                    <span>{row.label}</span>
                  </div>
                  <div className="box-border w-full flex justify-between items-center gap-2">
                    <div
                      data-pencil-name={`Install Command ${row.label}`}
                      className="text-[13px]/[18px] box-border text-[#d4d9d6] font-mono text-left whitespace-pre-wrap wrap-break-word bg-[rgba(21,70,12,0.7)] rounded-[4px] w-full px-2 py-2 hover:text-[#ffffff]"
                    >
                      {row.command}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyInstallCommand(row.command, row.key)
                      }
                      data-pencil-name={`Copy Pill ${row.label}`}
                      className="box-border w-fit shrink-0 h-fit flex gap-0 py-1.25 px-2.5 justify-start items-start bg-[#0F1F18] hover:bg-[#39FF14]/15 active:scale-95 transition-all border border-[#00FFFF] rounded-[999px] cursor-pointer font-normal hover:font-semibold"
                    >
                      <div
                        data-pencil-name={`Copy Label ${row.label}`}
                        className="text-[14px]/[normal] box-border text-[#00FFFF] text-left whitespace-nowrap"
                      >
                        {copiedKey === row.key ? "已複製" : "複製"}
                      </div>
                    </button>
                  </div>
                </div>
              ))
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={MARKDOWN_REHYPE_PLUGINS}
                  >
                    {docContent}
                  </ReactMarkdown>
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
