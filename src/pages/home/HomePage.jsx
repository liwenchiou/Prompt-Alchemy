import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import PromptCard from "../../components/PromptCard/PromptCard";
import SkillCard from "../../components/SkillCard/skillCard";
import { getPublishedPrompts } from "../../api/promptApi";
import { getAgentSkills } from "../../api/agentSkillApi";
import HeroDevice from "../../components/HeroDevice/HeroDevice";
import { usePageLoading } from "../../hooks/usePageLoading";
import {
  CodeXml,
  Database,
  ShieldCheck,
  Palette,
  Languages,
  PocketKnife,
} from "lucide-react";
import ContactWidget from "../../components/ContactWidget/ContactWidget";
import FAQSection from "../../components/FAQSection/FAQSection";

export default function Home() {
  const navigate = useNavigate();

  const [prompts, setPrompts] = useState([]);
  const [agentSkills, setAgentSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // 資料就緒後關閉 loading
  usePageLoading(!loading);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPublishedPrompts()
        .then((list) => setPrompts(list))
        .catch(() => setPrompts([])),
      getAgentSkills()
        .then((list) => setAgentSkills(list))
        .catch(() => setAgentSkills([])),
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const featuredPrompts = [...prompts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 9);
  const canLoop = featuredPrompts.length > 3;

  const featuredAgentSkills = [...agentSkills]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 9);
  const canLoopAgentSkills = featuredAgentSkills.length > 3;

  const countByCategory = (categoryName) => {
    return prompts.filter((p) => p.category === categoryName).length;
  };

  const handleCategoryClick = (categoryName) => {
    navigate("/skills", { state: { category: categoryName } });
  };

  return (
    <div className="w-full bg-[#0A0E1A] text-[#E0F0E8] px-6 py-8 flex flex-col items-center">
      {/* Hero Zone */}
      <div
        data-pencil-name="Hero Zone"
        className="relative box-border w-full max-w-350 h-auto shrink-0 flex flex-col md:flex-row gap-4 justify-between items-center py-24 border-b border-[#39FF14]/10 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/bg_01.gif')] bg-cover bg-center opacity-50"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#0A0E1A]/45" />
        <div
          data-pencil-name="Hero Copy"
          className="relative z-10 box-border w-full md:max-w-[50%] shrink-0 h-fit flex flex-col gap-5.5 justify-start items-start px-4"
        >
          <div
            data-pencil-name="Hero Title"
            className="text-[24px]/[28px] sm:text-[36px]/[42px] lg:text-[52px]/[57px] box-border w-full text-[#FFFFFF] font-bold text-left flex md:flex-col"
          >
            <h3>
              <span className="font-kyo text-[#FFD700]">10秒</span> 安裝
            </h3>
            <h3>你的AI Prompt 與 Skill</h3>
          </div>
          <div
            data-pencil-name="Hero Body"
            className="text-[16px]/[24px] lg:text-[18px]/[27px] box-border w-full text-[#7DCEA0] font-normal text-left flex-col"
          >
            <h5>一鍵安裝常用指令，</h5>
            <h5>還能分類、搜尋、收藏。</h5>
          </div>
          <div
            data-pencil-name="Hero Actions"
            className="box-border w-full h-fit shrink-0 flex gap-3.5 justify-center sm:justify-start items-start"
          >
            <Link
              to="/skills"
              data-pencil-name="Primary CTA"
              data-tour="hero-cta"
              className="box-border w-fit shrink-0 h-fit flex gap-0 py-3.5 px-6 justify-center sm:justify-start items-start active:scale-95 transition-all rounded-lg no-underline cursor-pointer bg-[#39FF14] hover:bg-[#32dd10]"
            >
              <div
                data-pencil-name="Primary CTA Label"
                className="text-[16px]/[normal] box-border font-bold text-left text-[#0A0E1A] whitespace-nowrap"
              >
                開始探索
              </div>
            </Link>
            {/* <a
              href="#featured-skills"
              data-pencil-name="Secondary CTA"
              className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 py-3.5 px-6 justify-start items-start bg-transparent border border-[#00FFFF] hover:bg-[#00FFFF]/10 active:scale-95 transition-all rounded-lg no-underline cursor-pointer"
            >
              <div
                data-pencil-name="Secondary CTA Label"
                className="text-[16px]/[normal] box-border text-[#00FFFF] font-normal text-left whitespace-nowrap"
              >
                查看範例
              </div>
            </a> */}
          </div>
        </div>
        <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end px-4 sm:px-8 md:ps-0">
          <HeroDevice />

          <div className="hidden lg:flex flex-col gap-4 absolute right-0 top-8 translate-x-[115%]">
            <span className="px-4 py-1 rounded-full border border-[#00FFFF]/65 bg-[#0A1022]/90 text-[#8CF9FF] text-sm font-semibold">
              #backend
            </span>
            <span className="px-4 py-1 rounded-full border border-[#FF00FF]/65 bg-[#0A1022]/90 text-[#F4A6FF] text-sm font-semibold">
              #debug
            </span>
            <span className="w-11 h-11 rounded-full border border-[#FFD700]/80 bg-[#FFD700]/90 text-[#0A0E1A] text-xl grid place-items-center shadow-[0_0_20px_rgba(255,215,0,0.55)]">
              ★
            </span>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div
        data-pencil-name="Category Section"
        className="box-border w-full max-w-350 h-fit shrink-0 flex flex-col gap-5 justify-start items-start mt-12"
      >
        <div
          data-pencil-name="Category Heading"
          className="text-[24px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap"
        >
          所有分類
        </div>
        <div
          data-pencil-name="Category Row"
          className="box-border w-full h-fit shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 justify-start items-start"
        >
          {/* 前端開發 */}
          <div
            onClick={() => handleCategoryClick("前端開發")}
            data-pencil-name="前端開發"
            className="box-border w-full h-fit flex flex-col gap-2.5 p-[16px_14px] justify-start items-center bg-[#111827] border border-[#00FFFF] rounded-xl cursor-pointer hover:bg-[#111827]/80 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {/* <svg
              data-pencil-name="Category Icon"
              viewBox="0 0 14 14"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="box-border w-7 h-7 shrink-0"
            >
              <path
                d="M4.48096 2.95313q-0.07178 0.01367-0.15039 0.07177-0.0752 0.05469-1.86621 1.84571l-1.42872 1.44238q-0.32129 0.33838-0.39306 0.44775-0.05469 0.08545-0.05469 0.19824l0 0.08204q0 0.11279 0.05469 0.19824 0.08545 0.12305 0.40674 0.46142l1.46972 1.46973q1.31592 1.31592 1.58936 1.58252 0.27344 0.2666 0.34521 0.29395 0.2085 0.06836 0.42383-0.01368 0.21875-0.08545 0.31787-0.28027 0.04102-0.09912 0.04102-0.23926l0-0.05469q0.01367-0.11279-0.04102-0.18457-0.07178-0.10938-0.35205-0.40332l-2.854-2.87109 2.854-2.87109q0.28027-0.29395 0.35205-0.40332 0.05469-0.07178 0.04102-0.18457l0-0.05469q0-0.14014-0.04444-0.22901-0.04102-0.09229-0.1333-0.17431-0.08887-0.08545-0.18115-0.11963-0.08887-0.0376-0.20849-0.0376-0.11963 0-0.18799 0.02735z m4.64843 0q-0.09912 0.04443-0.1914 0.12988-0.08887 0.08203-0.1333 0.17431-0.04102 0.08887-0.04102 0.22901l0 0.05469q-0.01367 0.11279 0.04102 0.18457 0.07178 0.10938 0.35205 0.40332l2.854 2.87109-2.854 2.87109q-0.28027 0.29395-0.35205 0.40332-0.05469 0.07178-0.04102 0.18457l0 0.05469q0 0.14014 0.04102 0.23926 0.09912 0.19482 0.31445 0.28027 0.21875 0.08203 0.42725 0.01367 0.07178-0.02734 0.34521-0.29394 0.27344-0.2666 1.58936-1.58252l1.46972-1.46973q0.32129-0.33838 0.40674-0.46142 0.05469-0.08545 0.05469-0.19824l0-0.08204q0-0.11279-0.05469-0.19824-0.08545-0.12305-0.40674-0.46142l-1.45605-1.45606q-1.10742-1.11768-1.48682-1.47998-0.37598-0.36572-0.43066-0.39648-0.08545-0.04102-0.22559-0.04102-0.14014 0-0.22217 0.02734z"
                fill="#00FFFF"
              />
            </svg> */}
            <CodeXml
              data-pencil-name="Category Icon"
              className="box-border w-7 h-7 shrink-0 text-[#00FFFF]"
            />
            <div
              data-pencil-name="Category Title"
              className="text-[14px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
            >
              前端開發
            </div>
            <div
              data-pencil-name="Category Count"
              className="text-[11px]/[normal] box-border text-[#51d688] font-normal text-left whitespace-nowrap"
            >
              {countByCategory("前端開發")} 個技能
            </div>
          </div>
          {/* 後端開發 */}
          <div
            onClick={() => handleCategoryClick("後端開發")}
            data-pencil-name="後端開發"
            className="box-border w-full h-fit flex flex-col gap-2.5 p-[16px_14px] justify-start items-center bg-[#111827] border border-[#39FF14] rounded-xl cursor-pointer hover:bg-[#111827]/80 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {/* <svg
              data-pencil-name="Category Icon"
              viewBox="0 0 14 14"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="box-border w-7 h-7 shrink-0"
            >
              <path
                d="M2.15674 0.60156q-0.29395 0.02734-0.58789 0.16748-0.29395 0.14014-0.50586 0.36573-0.30762 0.33496-0.43408 0.81005-0.02734 0.12646-0.04102 0.32471l0 2.64551 0.04102 0.16748q0.07178 0.25293 0.18115 0.44092 0.11279 0.18799 0.29394 0.37256 0.18457 0.18115 0.37256 0.29394 0.18799 0.10938 0.44092 0.18115l0.16748 0.04102 9.83008 0 0.16748-0.04102q0.25293-0.07178 0.44092-0.18115 0.18799-0.11279 0.36914-0.29394 0.18457-0.18457 0.29394-0.37256 0.11279-0.18799 0.18457-0.44092l0.04102-0.16748 0-2.83008-0.04102-0.16748q-0.12646-0.46143-0.43408-0.76904-0.44775-0.48877-1.13476-0.56055-0.16748-0.01367-4.81592-0.01367-4.64844 0-4.82959 0.02734z m9.74463 1.20313q0.19482 0.09912 0.29394 0.29394l0.04102 0.09912 0 2.6045-0.02735 0.08545q-0.12646 0.26318-0.37939 0.33496-0.08203 0.02734-4.82959 0.02734-4.74756 0-4.82959-0.02734-0.25293-0.07178-0.37939-0.33496l-0.02735-0.08545 0-2.6045 0.04102-0.09912q0.11279-0.24951 0.37939-0.32129 0.08545-0.02734 4.85694-0.02734l4.76123 0.01367 0.09912 0.04102z m-8.55518 1.13476q-0.25293 0.08545-0.37939 0.30762-0.04102 0.08545-0.04102 0.23926 0 0.15381 0.03418 0.23926 0.0376 0.08203 0.1333 0.18115 0.15381 0.15381 0.3999 0.16748 0.24609 0.01367 0.42041-0.16065 0.17432-0.17432 0.17432-0.41357 0-0.23926-0.16748-0.3999-0.16748-0.16064-0.39307-0.17432-0.14014 0-0.18115 0.01367z m-1.18945 4.66211q-0.29395 0.02734-0.58789 0.16748-0.29395 0.14014-0.50586 0.3794-0.30762 0.32129-0.43408 0.79638-0.02734 0.12646-0.04102 0.32471l0 2.64551 0.04102 0.16748q0.07178 0.25293 0.18115 0.44092 0.11279 0.18799 0.29394 0.37256 0.18457 0.18115 0.37256 0.29394 0.18799 0.10938 0.44092 0.18115l0.16748 0.04102 9.83008 0 0.16748-0.04102q0.25293-0.07178 0.44092-0.18115 0.18799-0.11279 0.36914-0.29394 0.18457-0.18457 0.29394-0.37256 0.11279-0.18799 0.18457-0.44092l0.04102-0.16748 0-2.83008-0.04102-0.16748q-0.12646-0.46143-0.43408-0.78271-0.44775-0.4751-1.13476-0.54688-0.16748-0.01367-4.81592-0.01367-4.64844 0-4.82959 0.02734z m9.74463 1.20313q0.19482 0.09912 0.29394 0.29394l0.04102 0.09912 0 2.6045-0.02735 0.08545q-0.12646 0.26318-0.37939 0.33496-0.08203 0.02734-4.82959 0.02734-4.74756 0-4.82959-0.02734-0.25293-0.07178-0.37939-0.33496l-0.02735-0.08545 0-2.6045 0.04102-0.09912q0.11279-0.24951 0.37939-0.32129 0.08545-0.02734 4.85694-0.02734l4.76123 0.01367 0.09912 0.04102z m-8.55518 1.13476q-0.25293 0.08545-0.37939 0.30762-0.04102 0.08545-0.04102 0.23926 0 0.15381 0.03418 0.23926 0.0376 0.08203 0.1333 0.18115 0.15381 0.15381 0.3999 0.16748 0.24609 0.01367 0.42041-0.16065 0.17432-0.17432 0.17432-0.41357 0-0.23926-0.16748-0.3999-0.16748-0.16064-0.39307-0.17432-0.14014 0-0.18115 0.01367z"
                fill="#39FF14"
              />
            </svg> */}
            <Database
              data-pencil-name="Category Icon"
              className="box-border w-7 h-7 shrink-0 text-[#39FF14]"
            />
            <div
              data-pencil-name="Category Title"
              className="text-[14px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
            >
              後端開發
            </div>
            <div
              data-pencil-name="Category Count"
              className="text-[11px]/[normal] box-border text-[#51d688] font-normal text-left whitespace-nowrap"
            >
              {countByCategory("後端開發")} 個技能
            </div>
          </div>
          {/* 資安相關 */}
          <div
            onClick={() => handleCategoryClick("資安相關")}
            data-pencil-name="資安相關"
            className="box-border w-full h-fit flex flex-col gap-2.5 p-[16px_14px] justify-start items-center bg-[#111827] border border-[#FF00FF] rounded-xl cursor-pointer hover:bg-[#111827]/80 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <ShieldCheck
              data-pencil-name="Category Icon"
              className="box-border w-7 h-7 shrink-0 text-[#FF00FF]"
            />
            {/* <svg
              data-pencil-name="Category Icon"
              viewBox="0 0 14 14"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="box-border w-7 h-7 shrink-0"
            >
              <path
                d="M6.84619 0.60156q-0.34863 0.02734-0.68701 0.30762-0.51611 0.42041-1.00147 0.70068-0.48193 0.28027-1.01513 0.4751-0.30762 0.11279-0.58789 0.1709-0.28027 0.05469-0.66992 0.08203-0.23926 0.01367-0.36573 0.07178-0.19482 0.06836-0.37939 0.22217-0.18115 0.15381-0.26319 0.34863l-0.01367 0.03076q-0.07178 0.12646-0.08545 0.22217-0.01367 0.15381-0.02734 0.60156l0 1.78076q0 2.25244 0.01367 2.46094 0.14014 1.6543 1.10742 2.88477 0.14014 0.16748 0.43409 0.46142 0.29395 0.29394 0.48877 0.44775 0.92285 0.7417 2.2832 1.27491 0.46143 0.18115 0.65625 0.23926 0.23926 0.05469 0.43408 0.01367 0.16748-0.02734 0.5332-0.15381 1.35693-0.51953 2.27979-1.20313 0.37939-0.2666 0.71435-0.60498 1.37402-1.3706 1.54151-3.37353 0.01367-0.23584 0.01367-2.46094 0-2.22852-0.02734-2.35498-0.07178-0.32129-0.31787-0.56396-0.24268-0.24609-0.5503-0.31788-0.09912-0.02734-0.37939-0.04101-0.48877-0.02734-0.96387-0.18115-0.81348-0.2666-1.55518-0.77246-0.2666-0.18115-0.64257-0.48877-0.42041-0.33496-0.96729-0.28028z m0.43408 1.34326q0.64258 0.51953 1.32959 0.86817 1.2168 0.61865 2.25244 0.68701l0.21192 0-0.01367 4.31348q0 0.33496-0.02735 0.50244-0.22559 1.34326-1.1416 2.27637-0.91602 0.92969-2.66601 1.57226l-0.21192 0.08545-0.18115-0.05469q-2.32422-0.85449-3.2334-2.22851-0.47852-0.71436-0.63232-1.63721-0.02734-0.18115-0.02735-0.50244l-0.01367-4.32715 0.19483 0q0.86816-0.05469 1.84912-0.48193 0.98096-0.42725 1.83545-1.12793 0.16748-0.14014 0.19482-0.14014 0.02734 0 0.28027 0.19482z m1.32959 3.31885q-0.06836 0.02734-0.12646 0.05127-0.05469 0.02051-1.06299 1.02539l-0.99463 0.99463-0.40674-0.40332q-0.2666-0.2666-0.3623-0.33838-0.12646-0.11279-0.19824-0.14013-0.06836-0.02734-0.19483-0.02735-0.12646 0-0.16748 0.01367-0.04102 0.01367-0.09912 0.04102-0.18115 0.09912-0.28027 0.2666-0.04102 0.08545-0.04102 0.25293l0 0.01367q0 0.14014 0.03418 0.21192 0.0376 0.06836 0.17774 0.22216 0.0957 0.11279 0.48876 0.50586l0.04102 0.04102q0.42041 0.42041 0.55371 0.54687 0.1333 0.12305 0.20166 0.15381 0.14014 0.06836 0.29395 0.05469 0.15381-0.01367 0.28027-0.09912 0.07178-0.05469 1.28857-1.27149 0.86816-0.86816 1.04932-1.06298 0.18457-0.19824 0.21192-0.27002 0.0957-0.27686-0.05811-0.52295-0.15381-0.24609-0.44775-0.25977-0.12646-0.01367-0.18116 0z"
                fill="#FF00FF"
              />
            </svg> */}
            <div
              data-pencil-name="Category Title"
              className="text-[14px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
            >
              資安相關
            </div>
            <div
              data-pencil-name="Category Count"
              className="text-[11px]/[normal] box-border text-[#51d688] font-normal text-left whitespace-nowrap"
            >
              {countByCategory("資安相關")} 個技能
            </div>
          </div>
          {/* 設計 / UX */}
          <div
            onClick={() => handleCategoryClick("設計 / UX")}
            data-pencil-name="設計 / UX"
            className="box-border w-full h-fit flex flex-col gap-2.5 p-[16px_14px] justify-start items-center bg-[#111827] border border-[#FFD700] rounded-xl cursor-pointer hover:bg-[#111827]/80 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {/* <svg
              data-pencil-name="Category Icon"
              viewBox="0 0 14 14"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="box-border w-7 h-7 shrink-0"
            >
              <path
                d="M4.57666 0.58789q-0.29395 0.04102-0.42725 0.31445-0.12988 0.27344 0.01026 0.54004 0.02734 0.06836 0.43066 0.4751l0.39307 0.40674-0.05469 0.11279q-0.12646 0.23584-0.19824 0.52979-0.04102 0.1709-0.05469 0.47851l-0.01367 0.30762-0.09912 0.04102q-0.40332 0.18115-0.81006 0.58789l-0.19824 0.20849-0.14014-0.05469q-0.26318-0.11279-0.50928-0.34179-0.24609-0.23242-0.38623-0.5127-0.14014-0.28027-0.18115-0.65625-0.01367-0.23926-0.05127-0.32129-0.03418-0.08545-0.11279-0.17431-0.0752-0.09229-0.15723-0.13672-0.11279-0.05469-0.2666-0.05469-0.15381 0-0.2666 0.05469-0.08203 0.04443-0.16065 0.13672-0.0752 0.08887-0.11963 0.17431-0.05469 0.18115-0.01367 0.56055 0.04102 0.37598 0.16748 0.68359 0.42041 1.06299 1.42871 1.58252l0.23926 0.1128-0.01367 0.05468q-0.08545 0.28027-0.08545 0.88184l0 0.42041-1.90381 0.01367-0.09912 0.04102q-0.08203 0.04443-0.16064 0.11621-0.0752 0.06836-0.11963 0.13672-0.12305 0.2666 0 0.5332 0.12646 0.2666 0.42041 0.30762 0.09912 0.02734 0.98096 0.02734l0.86816 0 0.01367 0.22559q0.01367 0.41699 0.14014 0.8374l0.05469 0.21191q0.01709 0.04102-0.05469 0.06836-0.14014 0.04443-0.35889 0.16407-0.21533 0.11621-0.32812 0.20166-0.15381 0.11279-0.35889 0.30761-0.20166 0.19482-0.31104 0.36231-0.25293 0.36572-0.3999 0.82031-0.14697 0.45459-0.1333 0.86133 0 0.15381 0.03418 0.24609 0.0376 0.08887 0.1333 0.18115 0.09912 0.08887 0.18115 0.12647 0.08545 0.03418 0.22559 0.03418 0.14014 0 0.22217-0.03418 0.08545-0.0376 0.18115-0.12647 0.09912-0.09229 0.1333-0.18798 0.0376-0.09912 0.05811-0.33496 0.02051-0.23926 0.04785-0.36573 0.08545-0.28027 0.25976-0.5332 0.17432-0.25293 0.41358-0.42041 0.09912-0.06836 0.2666-0.14356 0.16748-0.07861 0.2666-0.10937 0.05469-0.01367 0.0752-0.01367 0.02051 0 0.05127 0.04443 0.10938 0.16748 0.3247 0.39307 0.21875 0.22217 0.40332 0.37597 0.44775 0.34863 1.01172 0.58106 0.56738 0.23242 1.1416 0.28711 1.02197 0.09912 2.00293-0.32129 0.98096-0.42041 1.60987-1.23389 0.09912-0.12646 0.12646-0.12646 0.02734 0 0.14697 0.04443 0.11963 0.04102 0.21534 0.0957 0.31104 0.15381 0.5332 0.41358 0.22559 0.25977 0.33496 0.58105 0.04443 0.15381 0.09912 0.57422 0.01367 0.14014 0.04785 0.22559 0.0376 0.08203 0.12647 0.17431 0.09229 0.08887 0.17431 0.12647 0.08545 0.03418 0.22559 0.03418 0.14014 0 0.22217-0.03418 0.08545-0.0376 0.18115-0.12647 0.09912-0.09229 0.1333-0.18115 0.0376-0.09229 0.0376-0.24609 0.01367-0.40674-0.1333-0.86133-0.14697-0.45459-0.3999-0.82031-0.10938-0.16748-0.31446-0.36231-0.20166-0.19482-0.35547-0.30761-0.11279-0.08545-0.33154-0.20166-0.21533-0.11963-0.35547-0.16407-0.07178-0.02734-0.05468-0.06836l0.05468-0.21191q0.12646-0.42041 0.14014-0.8374l0.01367-0.22559 0.86816 0q0.88184 0 0.98096-0.02734 0.23584-0.04102 0.36914-0.23584 0.1333-0.19824 0.09229-0.4375-0.01367-0.0957-0.05127-0.16406-0.03418-0.07178-0.1128-0.14014-0.0752-0.07178-0.15722-0.11621l-0.09912-0.04102-1.90381-0.01367 0-0.42041q0-0.60156-0.08545-0.88184l-0.01367-0.05468 0.23925-0.1128q0.42041-0.22559 0.75538-0.56054 0.43408-0.43408 0.65967-0.98096 0.14014-0.34863 0.18798-0.72461 0.04785-0.37939-0.02051-0.56055-0.04443-0.08545-0.12304-0.17431-0.0752-0.09229-0.15723-0.13672-0.11279-0.05469-0.2666-0.05469-0.15381 0-0.2666 0.05469-0.08203 0.04443-0.16065 0.13672-0.07519 0.08887-0.11279 0.17431-0.03418 0.08203-0.04785 0.32129-0.04101 0.37598-0.18115 0.65625-0.14014 0.28027-0.38623 0.5127-0.24609 0.229-0.50928 0.34179l-0.14014 0.05469-0.19824-0.20849q-0.40674-0.40674-0.81006-0.58789l-0.09912-0.04102-0.01367-0.30762q-0.01367-0.30762-0.05469-0.47851-0.07178-0.29395-0.19824-0.52979l-0.05469-0.11279 0.39307-0.40674q0.40332-0.40674 0.43066-0.4751 0.11279-0.21191 0.04102-0.44775-0.06836-0.23926-0.27686-0.33496-0.12646-0.07178-0.28711-0.07178-0.16064 0-0.27343 0.07178-0.06836 0.04102-0.4751 0.43066l-0.39307 0.39307-0.12646-0.06836q-0.25293-0.12646-0.58789-0.19824-0.15381-0.04102-0.46143-0.04102-0.30762 0-0.44775 0.04102-0.34863 0.07178-0.60157 0.19824l-0.12646 0.06836-0.39307-0.39307q-0.40674-0.38965-0.48535-0.43066-0.0752-0.04443-0.24268-0.07178-0.04102 0-0.12646 0z m2.71729 1.77734q0.22559 0.05811 0.42724 0.21875 0.20166 0.16064 0.31445 0.38282 0.09912 0.18457 0.1128 0.40674l0.01367 0.12646-2.32422 0 0.01367-0.12646q0.01367-0.22217 0.1128-0.39307 0.18115-0.34863 0.52978-0.52979 0.35205-0.18115 0.79981-0.08545z m1.32959 2.36524q0.76904 0.22559 1.12109 0.92627 0.12646 0.2666 0.15381 0.56738 0.02734 0.30078 0.01367 1.26465 0 0.75879-0.01367 0.96045-0.01367 0.20166-0.08545 0.45459-0.18115 0.75537-0.75537 1.32275-0.57422 0.56738-1.30225 0.74854l-0.15381 0.04443q-0.01367 0-0.01367-0.33838l-0.01367-4.08789q0-0.32129-0.0376-0.39648-0.03418-0.07861-0.11279-0.16748-0.0752-0.09229-0.15723-0.13672-0.11279-0.05469-0.2666-0.05469-0.15381 0-0.2666 0.05469-0.08203 0.04443-0.16065 0.13672-0.0752 0.08887-0.11279 0.16748-0.03418 0.0752-0.03418 0.39648l-0.01367 4.08789q0 0.33838-0.01367 0.33838l-0.15381-0.04443q-0.72803-0.18115-1.30225-0.74854-0.57422-0.56738-0.75537-1.32275-0.07178-0.25293-0.08545-0.45459-0.01367-0.20166-0.01367-0.96045-0.01367-0.97754 0.01367-1.27148 0.02734-0.29395 0.15381-0.56055 0.15381-0.30762 0.41358-0.53662 0.25977-0.23242 0.56738-0.34522l0.02734 0q0.19482-0.07178 0.40332-0.08545 0.21191-0.01367 1.27832-0.01367l1.51074 0 0.16749 0.05469z"
                fill="#FFD700"
              />
            </svg> */}
            <Palette
              data-pencil-name="Category Icon"
              className="box-border w-7 h-7 shrink-0 text-[#FFD700]"
            />
            <div
              data-pencil-name="Category Title"
              className="text-[14px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
            >
              設計 / UX
            </div>
            <div
              data-pencil-name="Category Count"
              className="text-[11px]/[normal] box-border text-[#51d688] font-normal text-left whitespace-nowrap"
            >
              {countByCategory("設計 / UX")} 個技能
            </div>
          </div>
          {/* 翻譯助手 */}
          <div
            onClick={() => handleCategoryClick("翻譯助手")}
            data-pencil-name="翻譯助手"
            className="box-border w-full h-fit flex flex-col gap-2.5 p-[16px_14px] justify-start items-center bg-[#111827] border border-[#FF8C00] rounded-xl cursor-pointer hover:bg-[#111827]/80 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Languages
              data-pencil-name="Category Icon"
              className="box-border w-7 h-7 shrink-0 text-[#FF8C00]"
            />
            {/* <svg
              data-pencil-name="Category Icon"
              viewBox="0 0 14 14"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="box-border w-7 h-7 shrink-0"
            >
              <path
                d="M3.9751 0.60156q-0.24951 0.04102-0.38281 0.2666-0.1333 0.22217-0.06495 0.46143 0.04102 0.14014 0.14698 0.24609 0.10596 0.10596 0.24609 0.14698 0.08203 0.02734 0.45459 0.02734 0.37256 0 0.45459-0.02734 0.18115-0.05811 0.30762-0.21875 0.12646-0.16064 0.11279-0.36231-0.01367-0.20508-0.14697-0.35889-0.1333-0.15381-0.3418-0.18115-0.09912-0.02734-0.39307-0.02734-0.29395 0-0.39306 0.02734z m-2.89844 1.73633q-0.23584 0.04102-0.38281 0.24609-0.14697 0.20166-0.09229 0.44092 0.01367 0.0957 0.04785 0.16748 0.0376 0.06836 0.1128 0.14014 0.07861 0.06836 0.16064 0.11279l0.09912 0.04102 2.43701 0.01367q2.43359 0 2.4336 0.00684 0 0.00684-0.24951 0.3999l-0.26661 0.38965-0.99462 0.99463-0.56055-0.54346q-0.54688-0.54688-0.61524-0.58789-0.11279-0.07178-0.27343-0.07178-0.16064 0-0.28711 0.07178-0.2085 0.0957-0.28028 0.32812-0.06836 0.229 0.04444 0.45459 0.02734 0.06836 0.58789 0.62891l0.54346 0.54687-0.83741 0.8545q-0.56055 0.56055-0.71435 0.72119-0.15381 0.16064-0.18457 0.229-0.10938 0.23926-0.01367 0.46485 0.09912 0.22217 0.32128 0.32128 0.22559 0.0957 0.46485-0.01367 0.06836-0.03076 0.229-0.18457 0.16064-0.15381 0.72119-0.71435l0.8545-0.83741 0.84082 0.83741q0.56055 0.56055 0.72119 0.71435 0.16064 0.15381 0.229 0.18457 0.23926 0.10938 0.46143 0.01367 0.22559-0.09912 0.32129-0.32128 0.09912-0.22559-0.01026-0.46485-0.03076-0.06836-0.18457-0.229-0.15381-0.16064-0.71435-0.72119l-0.83741-0.8545 1.09034-1.09375 1.0083-1.52441 0.47509 0q0.39307 0 0.49561-0.01367 0.10596-0.01367 0.21875-0.09912 0.21191-0.14014 0.24609-0.36914 0.03418-0.23242-0.09912-0.43409-0.1333-0.20508-0.38281-0.23242-0.09912-0.02734-3.58545-0.02734-3.48633 0-3.59912 0.02734l0-0.01367z m8.6543 4.11524q-0.07178 0.01367-0.15039 0.07177-0.0752 0.05469-0.11621 0.1128-0.04102 0.05469-1.521 3.00781-1.47656 2.95313-1.50391 3.0249-0.02734 0.06836-0.01367 0.19482 0.01367 0.12647 0.04102 0.21192 0.05811 0.12647 0.1914 0.22558 0.1333 0.0957 0.27002 0.10938 0.14014 0.01367 0.28028-0.04102 0.14014-0.05811 0.22558-0.1538 0.05469-0.05811 0.57422-1.09375l0.51611-1.04932 2.77198 0 0.51953 1.03564q0.51953 1.03564 0.57422 1.09375 0.06836 0.10938 0.22217 0.16748 0.15723 0.05469 0.2666 0.04102 0.2666-0.02734 0.42041-0.22901 0.15381-0.20508 0.11279-0.458-0.02734-0.0957-1.52783-3.07959-1.07666-2.17041-1.29541-2.5874-0.21533-0.42041-0.28369-0.47852-0.1709-0.15381-0.39307-0.15381-0.11279 0-0.18115 0.02735z m0.58789 2.6455q0.38965 0.78613 0.38965 0.80664 0 0.02051-0.79981 0.02051-0.79639 0-0.79639-0.01367l0.79981-1.59619q0.01367 0 0.40674 0.78271z"
                fill="#FF8C00"
              />
            </svg> */}
            <div
              data-pencil-name="Category Title"
              className="text-[14px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
            >
              翻譯助手
            </div>
            <div
              data-pencil-name="Category Count"
              className="text-[11px]/[normal] box-border text-[#51d688] font-normal text-left whitespace-nowrap"
            >
              {countByCategory("翻譯助手")} 個技能
            </div>
          </div>
          {/* 小工具 */}
          <div
            onClick={() => handleCategoryClick("小工具")}
            data-pencil-name="小工具"
            className="box-border w-full h-fit flex flex-col gap-2.5 p-[16px_14px] justify-start items-center bg-[#111827] border border-[#FF3366] rounded-xl cursor-pointer hover:bg-[#111827]/80 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <PocketKnife
              data-pencil-name="Category Icon"
              className="box-border w-7 h-7 shrink-0 text-[#FF3366]"
            />
            {/* <svg
              data-pencil-name="Category Icon"
              viewBox="0 0 14 14"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className="box-border w-7 h-7 shrink-0"
            >
              <path
                d="M8.98926 0.58789q-0.71436 0.07178-1.36719 0.37256-0.64941 0.30078-1.15527 0.78955-1.0083 1.0083-1.18946 2.45068-0.05469 0.38965-0.01367 0.86133 0.04102 0.46826 0.16748 0.78955l0.02735 0.1128-2.21143 2.21142q-2.21143 2.21143-2.29346 2.32422-0.25293 0.33496-0.33838 0.74854-0.08203 0.41357 0.02735 0.82031 0.12646 0.46143 0.4751 0.81347 0.35205 0.34863 0.81347 0.4751 0.67334 0.18115 1.28858-0.14013 0.15381-0.07178 0.28027-0.18458 0.18115-0.15381 0.67334-0.64257l3.87598-3.84864 0.07177 0.02735q0.2085 0.06836 0.58789 0.14013 0.18115 0.02734 0.60157 0.02735 0.42041 0 0.61523-0.02735 1.12109-0.18457 1.97559-0.86816 0.92285-0.7417 1.30566-1.87646 0.38623-1.13477 0.09229-2.29688-0.08203-0.29395-0.26661-0.4751-0.2085-0.22559-0.50244-0.25976-0.29394-0.03418-0.58789 0.10595-0.08545 0.04102-0.25293 0.20166-0.16748 0.16064-0.82715 0.82032l-0.95019 0.93652-0.90918-0.90918 0.93652-0.95019q0.93994-0.93994 0.99463-1.02198 0.12646-0.22559 0.14014-0.4751 0.01367-0.25293-0.11279-0.47851-0.05469-0.11279-0.16065-0.2085-0.10596-0.09912-0.21191-0.15381-0.10254-0.05811-0.32813-0.10595-0.22217-0.05127-0.43408-0.07862-0.15381-0.02734-0.42041-0.02734-0.26318 0-0.41699 0.01367l0-0.01367z m0.60156 1.17578q0.02734 0 0 0.04444-0.02734 0.04102-0.18115 0.19482l-0.54688 0.56055q-0.78613 0.78271-0.85449 0.88183-0.16748 0.26318-0.18115 0.57422-0.01367 0.30762 0.12646 0.58789 0.04102 0.0957 0.13672 0.20166 0.09912 0.10596 0.54688 0.56055 0.44775 0.45459 0.54687 0.54687 0.09912 0.08887 0.2085 0.12989 0.29395 0.14014 0.59472 0.12646 0.3042-0.01367 0.56739-0.18115 0.08545-0.06836 0.88183-0.85449l0.79981-0.78272 0 0.08203q0.01367 0.09912 0.00683 0.35205-0.00684 0.25293-0.03418 0.40674-0.02734 0.15381-0.10595 0.38623-0.07861 0.229-0.16065 0.38282-0.21191 0.43408-0.57763 0.79296-0.36231 0.35547-0.78955 0.5503-0.42383 0.19482-0.90918 0.25293-0.48193 0.05469-0.92969-0.04102-0.22559-0.04443-0.62891-0.19824-0.11279-0.04102-0.25293-0.04102l-0.04101 0q-0.09912 0.01367-0.19825 0.08203-0.15381 0.11279-0.58789 0.53321l-3.7666 3.75293q-0.42041 0.42041-0.57422 0.51611-0.0957 0.07178-0.19482 0.08545l-0.04102 0q-0.21191 0.01367-0.37939-0.08887-0.16748-0.10596-0.25293-0.29053-0.04102-0.08203-0.04785-0.12304-0.00684-0.04443-0.00684-0.15723l0-0.05468q-0.01367-0.08203 0.01367-0.14014 0.04102-0.09912 0.2085-0.28028 0.1709-0.18115 0.57764-0.58789l1.67822-1.67822q1.45605-1.46973 1.92432-1.95166 0.47168-0.48535 0.49902-0.54004 0.04102-0.08545 0.05469-0.22558 0-0.09912-0.00684-0.14698-0.00684-0.04785-0.06152-0.18798-0.12646-0.30762-0.17774-0.56055-0.04785-0.25293-0.04785-0.54688 0-0.58789 0.21192-1.12109 0.18115-0.4751 0.55029-0.87842 0.37256-0.40674 0.83398-0.6289 0.46143-0.22559 0.95362-0.29737 0.10938-0.01367 0.33154-0.01367 0.22559 0 0.28369 0.01367z"
                fill="#FF3366"
              />
            </svg> */}
            <div
              data-pencil-name="Category Title"
              className="text-[14px]/[normal] box-border text-[#E0F0E8] font-semibold text-left whitespace-nowrap"
            >
              小工具
            </div>
            <div
              data-pencil-name="Category Count"
              className="text-[11px]/[normal] box-border text-[#51d688] font-normal text-left whitespace-nowrap"
            >
              {countByCategory("小工具")} 個技能
            </div>
          </div>
        </div>
      </div>

      {/* Featured Prompts Section */}
      <section
        id="featured-skills"
        data-tour="featured-prompts"
        className="w-full max-w-350 mt-16 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center border-b border-[#39FF14]/15 pb-3">
          <div className="text-[24px]/[normal] box-border text-[#FFD700] font-bold text-left m-0">
            最新Prompts
          </div>
          <Link
            to="/skills"
            className="text-[14px] text-[#7DCEA0] hover:text-[#39FF14] transition-colors no-underline"
          >
            &lt; 瀏覽全部 &gt;
          </Link>
        </div>

        <Swiper
          className="featured-skills-carousel w-full"
          modules={[A11y, Keyboard, Pagination]}
          centeredSlides={canLoop}
          loop={canLoop}
          pagination={{ clickable: true, dynamicBullets: true }}
          keyboard={{
            enabled: true,
          }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
          }}
          aria-label="最新Prompts輪播"
        >
          {featuredPrompts.map((prompt) => (
            <SwiperSlide key={prompt.id} className="h-auto">
              <PromptCard prompt={prompt} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Featured Skills Section */}
      <section
        id="featured-agent-skills"
        data-tour="featured-agent-skills"
        className="w-full max-w-350 mt-16 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center border-b border-[#39FF14]/15 pb-3">
          <div className="text-[24px]/[normal] box-border text-[#FFD700] font-bold text-left m-0">
            最新Skills
          </div>
          <Link
            to="/agent-skills"
            className="text-[14px] text-[#7DCEA0] hover:text-[#39FF14] transition-colors no-underline"
          >
            &lt; 瀏覽全部 &gt;
          </Link>
        </div>

        <Swiper
          className="featured-skills-carousel w-full"
          modules={[A11y, Keyboard, Pagination]}
          centeredSlides={canLoopAgentSkills}
          loop={canLoopAgentSkills}
          pagination={{ clickable: true, dynamicBullets: true }}
          keyboard={{ enabled: true }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
          }}
          aria-label="最新Skills輪播"
        >
          {featuredAgentSkills.map((skill) => (
            <SwiperSlide key={skill.id} className="h-auto">
              <SkillCard skill={skill} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      <FAQSection />

      {/* 右下角聯絡我們表單 Widget */}
      <ContactWidget />
    </div>
  );
}
