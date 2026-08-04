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

  const categoryName =
    prompt?.category || "其他";
  const tags = prompt?.tags || [];

  // const getCategoryIcon = (category) => {
  //   switch (category) {
  //     case "前端開發":
  //       return (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           strokeWidth={1.5}
  //           stroke="#00FFFF"
  //           className="w-5 h-5"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
  //           />
  //         </svg>
  //       );
  //     case "後端開發":
  //       return (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           strokeWidth={1.5}
  //           stroke="#39FF14"
  //           className="w-5 h-5"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
  //           />
  //         </svg>
  //       );
  //     case "資安相關":
  //       return (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           strokeWidth={1.5}
  //           stroke="#FF00FF"
  //           className="w-5 h-5"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
  //           />
  //         </svg>
  //       );
  //     case "翻譯助手":
  //       return (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           strokeWidth={1.5}
  //           stroke="#FF8C00"
  //           className="w-5 h-5"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.856.12-1.685.344-2.47"
  //           />
  //         </svg>
  //       );
  //     case "小工具":
  //     default:
  //       return (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           strokeWidth={1.5}
  //           stroke="#FF3366"
  //           className="w-5 h-5"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
  //           />
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
  //           />
  //         </svg>
  //       );
  //   }
  // };

  const iconWrapBg =
    {
      前端開發: "bg-[#0A1520]",
      後端開發: "bg-[#0F1F18]",
      資安相關: "bg-[#1A0A1A]",
      翻譯助手: "bg-[#1A1A0A]",
      小工具: "bg-[#1A0A15]",
    }[categoryName] || "bg-[#0F1F18]";

  return (
    <div
      onClick={handleCardClick}
      data-pencil-name={prompt?.title || "後端 API 審查"}
      className="box-border flex-1 h-fit flex flex-col gap-3.5 p-[28px_16px_24px_16px] justify-start items-start bg-[#111827] border-2 border-[#1A4A2A] rounded-xl hover:border-[#39FF14]/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* <div        data-pencil-name="Card Top"
        className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"      >
        <div
          data-pencil-name="Card Meta"
          className="box-border w-fit shrink-0 h-fit flex flex-row gap-3 justify-start items-center"
        >
          <div
            data-pencil-name="Icon Wrap"
            className={`box-border w-10 shrink-0 h-10 flex flex-row gap-0 justify-center items-center ${iconWrapBg} rounded-[10px]`}
          >
            {getCategoryIcon(categoryName)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLike}
          data-pencil-name="Heart"
          className="text-[14px]/[normal] box-border text-[#fc4c87] hover:text-[#ff1476] active:scale-95 transition-all bg-transparent border-0 cursor-pointer font-normal text-left whitespace-nowrap flex align-middle items-center gap-1"
        >
          {liked ? <Heart size={14} fill="#fc4c87" /> : <Heart size={14} />}
          {likesCount}
        </button>
      </div> */}
      {/* 卡片title + 收藏 + 簡介 */}
      <div
        data-pencil-name="Title Block"
        className="box-border w-full h-fit shrink-0 flex flex-col gap-1.5 justify-start items-start"
      >
        <div className="flex w-full justify-between items-center">
          <div
            data-pencil-name="Card Title"
            className="text-[20px]/[normal] box-border text-[#E0F0E8] font-bold text-left whitespace-nowrap overflow-hidden text-ellipsis w-full"
          >
            {prompt?.title || "後端 API 審查"}
          </div>
          {!hideStats && (
            <button
              type="button"
              onClick={handleLike}
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
      <div className="box-border w-full flex justify-between">
        {/* Tag的編排 */}
        <div
          data-pencil-name="Tags Row"
          className="box-border w-fit h-fit shrink-0 flex flex-row gap-1.5 justify-start items-start overflow-x-auto whitespace-nowrap scrollbar-none"
        >
          {tags.map((tag, idx) => {
            const tagLabel = tag?.name || "";
            const style = getTagStyles(tagLabel);
            // console.log("Tag style:", tag);
            return (
              <div
                key={tag?.id || idx}
                data-pencil-name={`Tag ${tagLabel}`}
                className={`box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-1 px-2 justify-start items-start ${style.bg} border ${style.border} rounded-[999px]`}
              >
                <div
                  data-pencil-name={`Tag Label ${tagLabel}`}
                  className={`text-[14px]/[normal] box-border ${style.text} font-normal text-left whitespace-nowrap`}
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
          data-pencil-name="Copy Pill"
          className="box-border w-fit shrink-0 h-fit flex gap-0 py-1.25 px-2.5 justify-start items-start bg-[#0F1F18] hover:bg-[#39FF14]/15 active:scale-95 transition-all border border-[#00FFFF] rounded-[999px] cursor-pointer font-normal hover:font-semibold"
        >
          <div
            data-pencil-name="Copy Label"
            className="text-[14px]/[normal] box-border text-[#00FFFF]  text-left whitespace-nowrap"
          >
            {copied ? "已複製" : "複製"}
          </div>
        </button>
      </div>
      {/* <div
        data-pencil-name="Card Footer"
        className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center"
      >
        <button
          type="button"
          onClick={handleCopy}
          data-pencil-name="Copy Pill"
          className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-1.25 px-2.5 justify-start items-start bg-[#0F1F18] hover:bg-[#39FF14]/15 active:scale-95 transition-all border-0 rounded-[999px] cursor-pointer"
        >
          <div
            data-pencil-name="Copy Label"
            className="text-[11px]/[normal] box-border text-[#00FFFF] font-normal text-left whitespace-nowrap"
          >
            {copied ? "已複製" : "複製"}
          </div>
        </button> */}
      {/* {!hideStats && (
          <div
            data-pencil-name="Uses"
            className="text-[12px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
          >
            Copied {prompt?.copyCount || 0} 次
          </div>
        )} */}
      {/* </div> */}
    </div>
  );
}
