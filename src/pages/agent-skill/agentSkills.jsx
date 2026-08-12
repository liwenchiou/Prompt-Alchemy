import { useState, useEffect, useRef } from "react";
import { LayoutGrid, GitFork } from "lucide-react";
import SkillCard from "../../components/SkillCard/skillCard";
import SkillGroupList from "../../components/SkillGroupList/SkillGroupList";
import {
  getAgentSkills,
  getAgentSkillCategories,
  getAgentSkillRepoOwners,
} from "../../api/agentSkillApi";
import { usePageLoading } from "../../hooks/usePageLoading";
import useCollapsible from "../../hooks/useCollapsible";
import SidebarCollapseToggle from "../../components/SidebarCollapseToggle/SidebarCollapseToggle";
import {
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from "../../utils/categoryIcons";
import { filterSkillsByQuery, groupSkillsByRepo } from "../../utils/skillGrouping";

export default function AgentSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedRepoOwner, setSelectedRepoOwner] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [repoOwners, setRepoOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, toggleSidebarCollapsed] = useCollapsible();
  const requestId = useRef(0);

  usePageLoading(!loading);

  useEffect(() => {
    getAgentSkillCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    getAgentSkillRepoOwners()
      .then(setRepoOwners)
      .catch(() => setRepoOwners([]));
  }, []);


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

  const keywordFiltered = filterSkillsByQuery(allSkills, searchQuery);

  const skills = selectedRepoOwner
    ? keywordFiltered.filter((skill) => skill.repoOwner === selectedRepoOwner)
    : keywordFiltered;
  const groups = groupSkillsByRepo(skills);

  return (
    <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="Agent Skill List Content"
        className="box-border w-full max-w-400 flex flex-col lg:flex-row gap-6 justify-start items-start"
      >
        {/* Category Sidebar */}
        <div
          data-pencil-name="Category Sidebar"
          className={`box-border relative w-full ${
            sidebarCollapsed ? "lg:w-fit" : "lg:w-62.5"
          } shrink-0 flex flex-row lg:flex-col gap-1 lg:gap-3.5 p-3 lg:p-4.5 justify-around lg:justify-start items-center lg:items-stretch bg-[#111827] border border-[#1A3A2A] rounded-2xl transition-all duration-300`}
        >
          <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10">
            <SidebarCollapseToggle
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebarCollapsed}
            />
          </div>

          {!sidebarCollapsed && (
            <div className="hidden lg:block text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap">
              分類清單
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setSelectedCategoryId("");
            }}
            className={`box-border w-auto lg:w-full h-fit flex flex-row gap-0 lg:gap-2 py-2 px-2 lg:py-2.5 lg:px-3 justify-center lg:justify-start items-center border-0 rounded-lg cursor-pointer transition-all duration-200 ${
              sidebarCollapsed ? "lg:justify-center" : ""
            } ${
              !selectedCategoryId
                ? "bg-[#39FF14] text-[#0A0E1A] font-semibold"
                : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10"
            }`}
          >
            <LayoutGrid size={18} className="shrink-0" />
            {!sidebarCollapsed && (
              <span className="hidden lg:inline text-[16px]/[normal] whitespace-nowrap">
                全部
              </span>
            )}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const CategoryIcon =
              CATEGORY_ICONS[cat.name] || DEFAULT_CATEGORY_ICON;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setLoading(true);
                  setSelectedCategoryId(cat.id);
                }}
                className={`box-border w-auto lg:w-full h-fit flex flex-row gap-0 lg:gap-2 py-2 px-2 lg:py-2.5 lg:px-3 justify-center lg:justify-start items-center border-0 rounded-lg cursor-pointer transition-all duration-200 ${
                  sidebarCollapsed ? "lg:justify-center" : ""
                } ${
                  isSelected
                    ? "bg-[#39FF14] text-[#0A0E1A] font-semibold"
                    : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10"
                }`}
              >
                <CategoryIcon size={18} className="shrink-0" />
                {!sidebarCollapsed && (
                  <span className="hidden lg:inline text-[16px]/[normal] whitespace-nowrap">
                    {cat.name}
                  </span>
                )}
              </button>
            );
          })}


          {repoOwners.length > 0 && (
            <>
              <div className="hidden lg:block w-full border-t border-[#1A3A2A]" />

              {!sidebarCollapsed && (
                <div className="hidden lg:block text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap">
                  來源 Repo
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedRepoOwner("")}
                className={`box-border w-auto lg:w-full h-fit flex flex-row gap-0 lg:gap-2 py-2 px-2 lg:py-2.5 lg:px-3 justify-center lg:justify-start items-center border-0 rounded-lg cursor-pointer transition-all duration-200 ${
                  sidebarCollapsed ? "lg:justify-center" : ""
                } ${
                  !selectedRepoOwner
                    ? "bg-[#39FF14] text-[#0A0E1A] font-semibold"
                    : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10"
                }`}
              >
                <LayoutGrid size={18} className="shrink-0" />
                {!sidebarCollapsed && (
                  <span className="hidden lg:inline text-[16px]/[normal] whitespace-nowrap">
                    全部
                  </span>
                )}
              </button>

              {repoOwners.map(({ repoOwner, avatarUrl }) => {
                const isSelected = selectedRepoOwner === repoOwner;
                return (
                  <button
                    key={repoOwner}
                    type="button"
                    onClick={() => setSelectedRepoOwner(repoOwner)}
                    className={`box-border w-auto lg:w-full h-fit flex flex-row gap-0 lg:gap-2 py-2 px-2 lg:py-2.5 lg:px-3 justify-center lg:justify-start items-center border-0 rounded-lg cursor-pointer transition-all duration-200 ${
                      sidebarCollapsed ? "lg:justify-center" : ""
                    } ${
                      isSelected
                        ? "bg-[#39FF14] text-[#0A0E1A] font-semibold"
                        : "bg-transparent text-[#7DCEA0] hover:bg-[#39FF14]/10"
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={repoOwner}
                        className="w-[18px] h-[18px] rounded-full shrink-0"
                      />
                    ) : (
                      <GitFork size={18} className="shrink-0" />
                    )}
                    {!sidebarCollapsed && (
                      <span className="hidden lg:inline text-[16px]/[normal] whitespace-nowrap truncate">
                        {repoOwner}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Skill List Region */}
        <div
          data-pencil-name="Agent Skill List Region"
          className="box-border flex-1 w-full flex flex-col gap-4.5 justify-start items-start"
        >

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
              <SkillGroupList
                groups={groups}
                renderCard={(skill) => <SkillCard skill={skill} />}
              />
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
