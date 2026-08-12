import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { LayoutGrid, Sparkles } from "lucide-react";
import PromptCard from "../../components/PromptCard/PromptCard";
import {
  getPublishedPrompts,
  getCategories,
  getTags,
  PUBLISHED_PROMPTS_UPDATED_EVENT,
} from "../../api/promptApi";
import { getTagStyles } from "../../utils/tagStyles";
import { usePageLoading } from "../../hooks/usePageLoading";
import { eventBus } from "../../utils/eventBus";
import useCollapsible from "../../hooks/useCollapsible";
import SidebarCollapseToggle from "../../components/SidebarCollapseToggle/SidebarCollapseToggle";
import {
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from "../../utils/categoryIcons";

// 「全部」「最新Prompts」不是實際的 Prompt 分類，比照 HomePage.jsx 的分類圖示，
// 額外指定圖示；其餘動態分類則交給 CATEGORY_ICONS 依名稱對應。
const SPECIAL_CATEGORY_ICONS = {
  全部: LayoutGrid,
  最新Prompts: Sparkles,
};

const categoryMemoToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showClass: { popup: "" },
  hideClass: { popup: "" },
});

export default function Skills() {
  const location = useLocation();
  const routeCategory = location.state?.category;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    () => routeCategory || "全部",
  );
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // "date" | "popularity"
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 2400 : false
  );

  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [sidebarCollapsed, toggleSidebarCollapsed] = useCollapsible();
  const promptsRequestId = useRef(0);

  // 資料就緒後關閉 loading
  usePageLoading(prompts.length > 0);

  useEffect(() => {
    setSelectedCategory(routeCategory || "全部");
    setSelectedTag(null);
  }, [location.key, routeCategory]);

  useEffect(() => {
    const loadPrompts = async () => {
      const requestId = ++promptsRequestId.current;
      const list = await getPublishedPrompts();
      if (requestId === promptsRequestId.current) {
        setPrompts(list);
      }
    };

    // Load categories
    getCategories().then((cats) => {
      setCategories([
        { name: "全部", icon: null, memo: "" },
        { name: "最新Prompts", icon: null, memo: "" },
        // { name: "熱門分類", icon: null, memo: "" },
        ...cats.map((c) => ({
          id: c.id,
          name: c.name,
          icon: null,
          memo: c.memo || "",
        })),
      ]);
    });

    // Load tags
    getTags().then((tgList) => {
      setTags(tgList);
    });

    loadPrompts();
    const unsubscribe = eventBus.on(PUBLISHED_PROMPTS_UPDATED_EVENT, loadPrompts);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth < 2400;
      setIsCompactScreen(compact);
      if (!compact) setIsCategoryExpanded(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Filter & Sort logic
  const filteredPrompts = prompts
    .filter((prompt) => {
      // Category filter
      if (selectedCategory === "最新Prompts") return prompt.isNew;
      if (selectedCategory === "熱門分類") return prompt.isHot;
      if (selectedCategory !== "全部" && prompt.category !== selectedCategory)
        return false;

      // Tag filter
      if (
        selectedTag &&
        !(prompt.tags || []).some((tag) => tag?.name === selectedTag)
      ) {
        return false;
      }

      // Search text filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (prompt.title || "").toLowerCase().includes(query) ||
          (prompt.description || "").toLowerCase().includes(query) ||
          (prompt.category || "").toLowerCase().includes(query) ||
          (prompt.tags || []).some((tag) =>
            (tag?.name || "").toLowerCase().includes(query)
          )
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popularity") {
        return b.likes - a.likes;
      }
      return new Date(b.date) - new Date(a.date);
    });

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleCategoryMouseEnter = (cat, event) => {
    if (!cat.memo) return;
    const rect = event.currentTarget.getBoundingClientRect();
    categoryMemoToast.fire({
      text: cat.memo,
      didOpen: (popup) => {
        popup.style.position = "fixed";
        popup.style.margin = "0";
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top - rect.height / 2}px`;
        popup.style.width = "fit-content";
        popup.style.display = "inline-block";
        popup.style.whiteSpace = "nowrap";
        popup.style.fontSize = "12px";
        popup.style.backgroundColor = "rgba(26, 58, 42,0.6)";
        popup.style.color = "#E0F0E8";
        popup.style.padding = "8px 8px";
      },
    });
  };

  const handleCategoryMouseLeave = () => {
    Swal.close();
  };

  const handleTagToggle = (tagLabel) => {
    setSelectedTag((prev) => (prev === tagLabel ? null : tagLabel));
  };

  const visibleCategories =
    isCompactScreen && !isCategoryExpanded
      ? categories.slice(0, 5)
      : categories;

  return (
    <div className="w-full min-h-screen bg-[#0A0E1A] text-[#E0F0E8] py-8 px-6 flex flex-col items-center">
      <div
        data-pencil-name="List Content"
        className="box-border w-full max-w-400 flex flex-col lg:flex-row gap-6 justify-start items-start"
      >
        {/* Filters Sidebar */}
        <div
          data-pencil-name="Filters Sidebar"
          className={`box-border relative self-start h-fit w-full ${
            sidebarCollapsed ? "lg:w-fit" : "lg:w-62.5"
          } shrink-0 flex flex-col gap-3.5 p-4.5 justify-start items-stretch bg-[#111827] border border-[#1A3A2A] rounded-2xl transition-all duration-300`}
        >
          <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10">
            <SidebarCollapseToggle
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebarCollapsed}
            />
          </div>

          {!sidebarCollapsed && (
            <div
              data-pencil-name="Sidebar Heading"
              className="hidden lg:block text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap"
            >
              分類清單
            </div>
          )}

          <div
            data-pencil-name="Category Icon Row"
            className={`box-border w-full flex flex-row lg:flex-col gap-1 lg:gap-3.5 justify-around lg:justify-start items-center ${
              sidebarCollapsed ? "lg:items-center" : "lg:items-stretch"
            }`}
          >
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const CategoryIcon =
                SPECIAL_CATEGORY_ICONS[cat.name] ||
                CATEGORY_ICONS[cat.name] ||
                DEFAULT_CATEGORY_ICON;
              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  onMouseEnter={(e) => handleCategoryMouseEnter(cat, e)}
                  onMouseLeave={handleCategoryMouseLeave}
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

            {isCompactScreen && categories.length > 5 && !sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsCategoryExpanded((prev) => !prev)}
                className="hidden lg:block mt-1 w-full rounded-lg border border-[#1A3A2A] bg-transparent py-2 text-[14px] text-[#7DCEA0] transition-all hover:bg-[#39FF14]/10"
              >
                {isCategoryExpanded ? "收合分類" : "展開更多分類"}
              </button>
            )}
          </div>

          {!sidebarCollapsed && (
            <>
              <div
                data-pencil-name="Tag Heading"
                className="text-[18px]/[normal] box-border text-[#FFD700] font-bold text-left whitespace-nowrap mt-4"
              >
                標籤
              </div>

              <div
                data-pencil-name="Tag Column"
                className="box-border w-full h-fit flex flex-wrap gap-2 justify-start items-start mt-2"
              >
                {tags.map((tag) => {
                  const style = getTagStyles(tag.name);
                  const isSelected = selectedTag === tag.name;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`box-border w-fit h-fit flex flex-row gap-0 py-1.5 px-2.5 justify-start items-start rounded-[999px] border cursor-pointer transition-all ${
                        isSelected
                          ? `bg-transparent ${style.border} ring-2 ring-offset-2 ring-offset-[#111827] ring-[#00FFFF]`
                          : `${style.bg} ${style.border} hover:font-bold hover:opacity-80 `
                      }`}
                    >
                      <span
                        className={`text-[14px]/[normal] ${style.text} whitespace-nowrap`}
                      >
                        {tag.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Skill List Region */}
        <div
          data-pencil-name="Skill List Region"
          className="box-border flex-1 w-full flex flex-col gap-4.5 justify-start items-start"
        >
          {/* List Search Bar */}
          <div
            data-pencil-name="List Search Bar"
            className="box-border w-full h-fit flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#111827]/40 p-4 rounded-xl border border-[#1A3A2A]/50"
          >
            <div
              data-pencil-name="Search Field"
              className="box-border w-full sm:flex-1 sm:min-w-0 h-fit flex flex-row gap-2.5 py-2.5 px-3.5 justify-start items-center bg-[#0F1F18] border border-[#1A3A2A] rounded-[10px] focus-within:border-[#39FF14] transition-all"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋 Prompt / Skill..."
                className="w-full bg-transparent border-0 text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none text-[13px] "
              />
            </div>

            <div
              data-pencil-name="Sort Group"
              className="box-border w-fit shrink-0 h-fit flex flex-row gap-2 justify-start items-center"
            >
              <label
                htmlFor="sortBy"
                data-pencil-name="Sort Label"
                className="text-[13px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
              >
                排序：
              </label>
              <div className="relative">
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="box-border appearance-none h-fit py-2 pl-3.5 pr-9 bg-[rgb(15,31,24)] border border-[rgba(26,58,42,0.1)] rounded-[999px] text-[#7DCEA0] text-[13px]/[normal] cursor-pointer transition-all focus:outline-none focus:border-[rgb(57,255,20,0.3)]"
                >
                  <option value="date">依日期</option>
                  <option value="popularity">依熱門度</option>
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#39FF14] text-[11px]"
                >
                  ▾
                </span>
              </div>
            </div>
          </div>

          {/* List Cards */}
          <div
            data-pencil-name="List Cards"
            className="box-border w-full h-fit grid grid-cols-1 md:grid-cols-2 gap-4 justify-start items-start mt-4"
          >
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((prompt) => (
                <div key={prompt.id} className="w-full">
                  <PromptCard prompt={prompt} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-[#7DCEA0]/60 border border-[#1A3A2A] border-dashed rounded-xl">
                沒有找到符合條件的 Prompt。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
