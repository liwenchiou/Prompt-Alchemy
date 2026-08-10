import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { copyToClipboard } from "../../utils/copyToClipboard";
import useAuth from "../../hooks/useAuth";
import {
  getPromptById,
  getPublishedPrompts,
  incrementCopyCount,
  normalizeExampleOutput,
} from "../../api/promptApi";
import { Heart, Undo2 } from "lucide-react";
import { getTagStyles } from "../../utils/tagStyles";
import { usePageLoading } from "../../hooks/usePageLoading";

export default function SkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, favorites, toggleFavorite } = useAuth();

  const [promptData, setPromptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  // 詳細頁資料就緒後關閉 loading overlay
  usePageLoading(!loading);

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
  }

  useEffect(() => {
    getPromptById(id).then((data) => {
      if (data) {
        setPromptData(data);
        setLoading(false);
      } else {
        // Fallback to first published prompt if ID not found
        getPublishedPrompts().then((list) => {
          if (list.length > 0) {
            setPromptData(list[0]);
          }
          setLoading(false);
        });
      }
    });
  }, [id]);

  const isFavorited = favorites.includes(id);

  const handleCopyPrompt = async () => {
    if (!promptData) return;
    const success = await copyToClipboard(promptData.promptContent);
    if (success) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      // Increment copy counter in dynamic local storage database
      incrementCopyCount(promptData.id).catch((err) => {
        console.error("Failed to increment copy count", err);
      });
    }
  };

  const handleCopyExample = async () => {
    if (!promptData) return;
    const success = await copyToClipboard(promptData.exampleContent);
    if (success) {
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    }
  };

  const handleFavoriteToggle = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(id);
  };

  const exampleOutputBlocks = Array.isArray(promptData?.exampleOutput)
    ? promptData.exampleOutput
    : normalizeExampleOutput(promptData?.exampleOutput);

  // 讓promptContent的內容透過 [...],{...}有不同顏色
  const renderPromptContent = (content) => {
    if (!content) return null;

    const tokenPattern =
      /(\[[^\]\n]+\]|\{[^}\n]+\}|【[^】\n]+】|\([^)\n]+\))/g;
    const parts = content.split(tokenPattern);

    return parts.map((part, index) => {
      if (!part) return null;

      if (/^\[[^\]\n]+\]$/.test(part)) {
        return (
          <span key={index} className="text-[#00FFFF] font-semibold">
            {part}
          </span>
        );
      }

      if (/^\{[^}\n]+\}$/.test(part)) {
        return (
          <span
            key={index}
            className="text-[#00bfff] text-[1.05em] font-semibold"
          >
            {part}
          </span>
        );
      }

      if (/^【[^】\n]+】$/.test(part)) {
        return (
          <span key={index} className="text-[#ffab2e] text-[1.1em] font-bold">
            {part}
          </span>
        );
      }
      if (/^\([^)\n]+\)$/.test(part)) {
        return (
          <span key={index} className="text-[#ffab2e] text-[1.1em] font-bold">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading || !promptData) {
    return (
      <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] font-['JetBrains_Mono',system-ui,sans-serif] py-8 px-6 flex items-center justify-center">
        <div className="text-[18px] text-[#7DCEA0]">載入中...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="Page Content"
        className="box-border w-full max-w-350 flex flex-col lg:flex-row gap-6 justify-start items-start"
      >
        {/* Detail Main */}
        <div
          data-pencil-name="Detail Main"
          className="box-border flex-1 w-full h-full flex flex-col gap-5.5 py-3 justify-start items-start"
        >
          {/* Back Row */}
          <div
            data-pencil-name="Back Row"
            className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
          >
            <Link
              to="/skills"
              data-pencil-name="Back Text Group"
              className="box-border w-fit shrink-0 h-fit flex flex-row gap-2.5 justify-start items-center no-underline hover:opacity-80 transition-opacity"
            >
              <div
                data-pencil-name="Back Arrow"
                className="text-[18px]/[normal] box-border text-[#E0F0E8] font-normal text-left whitespace-nowrap"
              >
                <Undo2 className="w-4 h-4 shrink-0" />
              </div>
              <div
                data-pencil-name="Back Label"
                className="text-[14px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
              >
                返回列表
              </div>
            </Link>
            <button
              type="button"
              onClick={handleFavoriteToggle}
              data-pencil-name="Favorite Toggle"
              className="text-[14px]/[normal] box-border bg-transparent border-0 cursor-pointer text-[#FF00FF] font-normal text-left whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
            >
              {isFavorited ? (
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-4 h-4 shrink-0" fill="#FF00FF" />
                  <span className="text-[16px] font-semibold leading-none">
                    已收藏
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-4 h-4 shrink-0" />
                  <span className="text-[16px] font-semibold leading-none">
                    收藏
                  </span>
                </span>
              )}
            </button>
          </div>

          {/* Detail Article */}
          <div
            data-pencil-name="Detail Article"
            className="box-border w-full flex flex-col gap-5.5 justify-start items-start"
          >
            <div
              data-pencil-name="Detail Head"
              className="box-border w-full h-fit shrink-0 flex flex-col gap-3.5 justify-start items-start"
            >
              <div
                data-pencil-name="Detail Title"
                className="text-[32px] sm:text-[44px]/[normal] box-border text-[#FFFFFF] font-bold text-left whitespace-normal wrap-break-word w-full"
              >
                {promptData.title}
              </div>
              <div
                data-pencil-name="Detail Chips"
                className="box-border w-full h-fit shrink-0 flex flex-wrap gap-2 justify-start items-start"
              >
                {promptData.tags.map((tag, index) => {
                  const tagLabel = tag?.name || "";
                  const style = getTagStyles(tagLabel);
                  return (
                    <div
                      key={tag?.id || index}
                      data-pencil-name={`Detail Chip ${tagLabel}`}
                      className={`box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-1.5 px-2.5 justify-start items-start ${style.bg} border ${style.border} rounded-[999px]`}
                    >
                      <div
                        data-pencil-name={`Detail Chip Label ${tagLabel}`}
                        className={`text-[12px]/[normal] box-border ${style.text} font-normal text-left whitespace-nowrap`}
                      >
                        {tagLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                data-pencil-name="Detail Desc"
                className="text-[16px] sm:text-[18px]/[29px] box-border w-full text-[#7DCEA0] font-normal text-left"
              >
                {promptData.description}
              </div>
            </div>

            {/* Prompt / Skill 內容 */}
            <div
              data-pencil-name="Prompt Section"
              className="box-border w-full h-fit shrink-0 flex flex-col gap-3 justify-start items-start"
            >
              <div
                data-pencil-name="Prompt Section Header"
                className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
              >
                <div
                  data-pencil-name="Prompt Section Title"
                  className="text-[18px] sm:text-[20px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap"
                >
                  Prompt / Skill 內容
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  data-pencil-name="Copy Action"
                  className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-2 px-3.5 justify-start items-start  border border-[#39FF14] hover:bg-[#32dd10] active:scale-95 transition-all rounded-[999px] cursor-pointer  text-[#39FF14] hover:text-[#000000]"
                >
                  <div
                    data-pencil-name="Copy Action Label"
                    className="text-[14px]/[normal] box-border font-semibold text-left whitespace-nowrap"
                  >
                    {copiedPrompt ? "已複製" : "複製內容"}
                  </div>
                </button>
              </div>
              <div
                data-pencil-name="Prompt Box"
                className="box-border w-full h-fit shrink-0 flex flex-col gap-0 p-4.5 justify-start items-start bg-[#080C12] border border-[#39FF14]/50 rounded-[14px]"
              >
                <pre
                  data-pencil-name="Prompt Text"
                  className="text-[14px] sm:text-[14px]/[22px] box-border w-full text-[#E0F0E8] font-normal text-left whitespace-pre-wrap wrap-break-word "
                >
                  {renderPromptContent(promptData.promptContent)}
                </pre>
              </div>
            </div>
            <div className="w-full flex flex-col md:flex-row gap-4">
              {/* 範例輸入 Section */}
              <div
                data-pencil-name="Example Section"
                className="box-border w-full md:w-[calc(50%-0.5rem)] md:max-w-1/2 h-fit shrink-0 flex flex-col gap-3 justify-start items-start"
              >
                <div
                  data-pencil-name="Example Header"
                  className="box-border w-full h-9 shrink-0 flex flex-row gap-0 justify-between items-center"
                >
                  <div
                    data-pencil-name="Example Title"
                    className="text-[18px] sm:text-[20px]/[normal] box-border text-[#00FFFF] font-bold text-left whitespace-nowrap"
                  >
                    範例輸入
                  </div>
                </div>
                <div
                  data-pencil-name="Example Box"
                  className="box-border w-full h-fit shrink-0 flex flex-col gap-0 px-4.5 py-12 justify-start items-start bg-[#080C12] border border-[#00FFFF]/50 rounded-[18px] relative"
                >
                  <button
                    type="button"
                    onClick={handleCopyExample}
                    data-pencil-name="Example Copy"
                    className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-2 px-3.5 justify-start items-start bg-[rgba(10,21,32,0.6)] border border-[rgba(0,255,255,0.6)] hover:bg-[rgba(0,255,255,0.9)] active:scale-95 transition-all rounded-[999px] cursor-pointer text-[#00FFFF] hover:text-[#000000] hover:font-bold absolute top-3 right-3"
                  >
                    <div
                      data-pencil-name="Example Copy Label"
                      className="text-[14px]/[normal] box-border text-left whitespace-nowrap"
                    >
                      {copiedExample ? "已複製" : "複製範例"}
                    </div>
                  </button>
                  <pre
                    data-pencil-name="Example Code"
                    className="text-[14px] sm:text-[14px]/[22px] box-border w-full text-[#E0F0E8] font-normal text-left whitespace-pre-wrap wrap-break-word "
                  >
                    {promptData.exampleContent}
                  </pre>
                </div>
              </div>
              {/* 輸出效果 */}
              <div
                data-pencil-name="Example Section"
                className="box-border w-full md:w-[calc(50%-0.5rem)] md:max-w-1/2 h-fit shrink-0 flex flex-col gap-3 justify-start items-start"
              >
                <div
                  data-pencil-name="Example Header"
                  className="box-border w-full h-9 shrink-0 flex flex-row gap-0 justify-between items-center"
                >
                  <div
                    data-pencil-name="Example Title"
                    className="text-[18px] sm:text-[20px]/[normal] box-border text-[#00FFFF] font-bold text-left whitespace-nowrap"
                  >
                    輸出效果
                  </div>
                </div>
                <div
                  data-pencil-name="Example Box"
                  className="box-border w-full h-fit shrink-0 flex flex-col gap-4  px-4.5 py-12 justify-start items-start bg-[#080C12] border border-[#00FFFF]/50 rounded-[18px]"
                >
                  {exampleOutputBlocks.length > 0 ? (
                    exampleOutputBlocks.map((block, index) => {
                      const rawType = block?.type || "text";
                      const context = block?.data?.context || "";
                      const alt = block?.data?.alt || "";
                      const caption = block?.data?.caption || "";

                      if (!context) return null;

                      // Resolve base path for relative / static assets
                      const resolveAssetUrl = (url = "") => {
                        if (!url) return "";
                        if (/^(https?:|data:|blob:|\/\/)/i.test(url)) return url;
                        const baseUrl = import.meta.env.BASE_URL || "/";
                        if (url.startsWith("/Prompt-Alchemy/")) {
                          const relative = url.replace(/^\/Prompt-Alchemy\//, "");
                          return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${relative}`;
                        }
                        return url;
                      };

                      const resolvedUrl = resolveAssetUrl(context);
                      const isVideo =
                        rawType === "video" ||
                        /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(context);

                      if (rawType === "text") {
                        return (
                          <pre
                            key={index}
                            data-pencil-name={`Example Block Text ${index}`}
                            className="text-[14px] sm:text-[14px]/[22px] box-border w-full text-[#E0F0E8] font-normal text-left whitespace-pre-wrap wrap-break-word"
                          >
                            {context}
                          </pre>
                        );
                      }

                      if (isVideo) {
                        return (
                          <figure
                            key={index}
                            className="box-border w-full flex flex-col gap-2"
                          >
                            <video
                              src={resolvedUrl}
                              controls
                              preload="auto"
                              playsInline
                              className="w-full rounded-xl border border-[#00FFFF]/30 bg-[#05080C] object-contain max-h-[500px]"
                            />
                            {caption ? (
                              <figcaption className="text-[12px]/[18px] text-[#7DCEA0]">
                                {caption}
                              </figcaption>
                            ) : null}
                          </figure>
                        );
                      }

                      if (rawType === "image") {
                        return (
                          <figure
                            key={index}
                            className="box-border w-full flex flex-col gap-2"
                          >
                            <img
                              src={resolvedUrl}
                              alt={alt || `example-output-${index + 1}`}
                              className="w-full rounded-xl border border-[#00FFFF]/30 bg-[#05080C] object-contain max-h-[500px]"
                            />
                            {caption ? (
                              <figcaption className="text-[12px]/[18px] text-[#7DCEA0]">
                                {caption}
                              </figcaption>
                            ) : null}
                          </figure>
                        );
                      }

                      if (rawType === "html") {
                        return (
                          <figure
                            key={index}
                            className="box-border w-full flex flex-col gap-2"
                          >
                            <div className="w-full rounded-xl border border-[#00FFFF]/30 overflow-hidden bg-white">
                              <iframe
                                src={resolvedUrl}
                                title={alt || `example-output-html-${index + 1}`}
                                className="w-full h-80 border-0"
                                sandbox="allow-scripts allow-same-origin"
                              />
                            </div>
                            {caption ? (
                              <figcaption className="text-[12px]/[18px] text-[#7DCEA0]">
                                {caption}
                              </figcaption>
                            ) : null}
                          </figure>
                        );
                      }

                      return null;
                    })
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
