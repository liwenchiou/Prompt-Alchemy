import { useState, useEffect, useRef } from "react";
import SkillCard from "../../components/SkillCard/skillCard";
import {
  getAgentSkills,
  getAgentSkillCategories,
} from "../../api/agentSkillApi";
import { usePageLoading } from "../../hooks/usePageLoading";

export default function AgentSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  usePageLoading(!loading);

  useEffect(() => {
    getAgentSkillCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // 分類切換才需要打 API；關鍵字搜尋在下面對已取得的清單做前端過濾，
  // 才能涵蓋後端 keyword 沒有比對的 repoOwner。
  useEffect(() => {
    const currentRequest = ++requestId.current;

    getAgentSkills({ categoryId: selectedCategoryId || undefined })
      .then((list) => {
        if (currentRequest === requestId.current) {
          setAllSkills(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (currentRequest === requestId.current) {
          setAllSkills([]);
          setLoading(false);
        }
      });
  }, [selectedCategoryId]);

  const query = searchQuery.trim().toLowerCase();
  const skills = query
    ? allSkills.filter(
        (skill) =>
          (skill.name || "").toLowerCase().includes(query) ||
          (skill.intro || "").toLowerCase().includes(query) ||
          (skill.repoOwner || "").toLowerCase().includes(query)
      )
    : allSkills;

  return (
    <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="Agent Skill List Content"
        className="box-border w-full max-w-400 flex flex-col lg:flex-row gap-6 justify-start items-start"
      >
        {/* Category Sidebar */}
        <div
          data-pencil-name="Category Sidebar"
          className="box-border w-full lg:w-62.5 shrink-0 flex flex-col gap-3.5 p-4.5 justify-start items-stretch bg-[#111827] border border-[#1A3A2A] rounded-2xl"
        >
          <div className="text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap">
            分類清單
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setSelectedCategoryId("");
            }}
            className={`box-border w-full h-fit flex flex-row gap-2 py-2.5 px-3 justify-start items-center border-0 rounded-lg cursor-pointer transition-all duration-200 ${
              !selectedCategoryId
                ? "bg-[#39FF14] text-[#0A0E1A] font-semibold"
                : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10"
            }`}
          >
            <span className="text-[16px]/[normal] whitespace-nowrap">全部</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setLoading(true);
                  setSelectedCategoryId(cat.id);
                }}
                className={`box-border w-full h-fit flex flex-row gap-2 py-2.5 px-3 justify-start items-center border-0 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[#39FF14] text-[#0A0E1A] font-semibold"
                    : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10"
                }`}
              >
                <span className="text-[16px]/[normal] whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skill List Region */}
        <div
          data-pencil-name="Agent Skill List Region"
          className="box-border flex-1 w-full flex flex-col gap-4.5 justify-start items-start"
        >
          {/* <h1 className="text-[28px] sm:text-[36px] font-bold text-white">
            Agent Skills
          </h1> */}

          <div
            data-pencil-name="List Search Bar"
            className="box-border w-full h-fit flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#111827]/40 p-4 rounded-xl border border-[#1A3A2A]/50"
          >
            <div className="box-border w-full sm:flex-1 sm:min-w-0 h-fit flex flex-row gap-2.5 py-2.5 px-3.5 justify-start items-center bg-[#0F1F18] border border-[#1A3A2A] rounded-[10px] focus-within:border-[#39FF14] transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋 Agent Skill..."
                className="w-full bg-transparent border-0 text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none text-[13px]"
              />
            </div>
          </div>

          <div
            data-pencil-name="Agent Skill List Cards"
            className="box-border w-full h-fit grid grid-cols-1 md:grid-cols-2 gap-4 justify-start items-start mt-4"
          >
            {skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.id} className="w-full">
                  <SkillCard skill={skill} />
                </div>
              ))
            ) : !loading ? (
              <div className="w-full text-center py-12 text-[#7DCEA0]/60 border border-[#1A3A2A] border-dashed rounded-xl">
                沒有找到符合條件的 Agent Skill。
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
