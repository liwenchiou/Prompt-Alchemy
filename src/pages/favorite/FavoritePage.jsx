import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PromptCard from "../../components/PromptCard/PromptCard";
import {
  getPublishedPrompts,
  getTags,
  getCategories,
} from "../../api/promptApi";
// import { getUserFavorite } from "../../api/favoriteApi";
import useAuth from "../../hooks/useAuth";
import { Search } from "lucide-react";
import { getTagStyles } from "../../utils/tagStyles";
import { usePageLoading } from "../../hooks/usePageLoading";

export default function Favorite() {
  const navigate = useNavigate();
  const { favorites, clearFavorites, resetFavorites } = useAuth();
  const [favoritePrompts, setFavoritePrompts] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // 收藏頁在第一次 fetch 完成後關閉 loading
  usePageLoading(initialized);

  useEffect(() => {
    getPublishedPrompts().then((list) => {
      const filtered = list.filter((prompt) => favorites.includes(prompt.id));
      setFavoritePrompts(filtered);
      setInitialized(true);
    });
  }, [favorites]);

  useEffect(() => {
    getTags().then((list) => {
      setTags(list);
    });
    getCategories().then((list) => {
      setCategories(list);
    });
  }, []);

  const handleClearAll = () => {
    clearFavorites();
  };

  const handleReset = () => {
    resetFavorites();
  };

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategory((prev) =>
      prev === categoryName ? null : categoryName
    );
  };

  const handleTagToggle = (tagLabel) => {
    setSelectedTag((prev) => (prev === tagLabel ? null : tagLabel));
  };

  const filteredFavoritePrompts = favoritePrompts.filter((prompt) => {
    if (selectedCategory && prompt.category !== selectedCategory) {
      return false;
    }
    if (
      selectedTag &&
      !(prompt.tags || []).some((tag) => tag?.name === selectedTag)
    ) {
      return false;
    }
    return true;
  });

  const favoriteCategorySet = new Set(
    favoritePrompts.map((prompt) => prompt.category).filter(Boolean)
  );

  const visibleCategories = categories.filter((category) =>
    favoriteCategorySet.has(category.name)
  );

  const favoriteTagSet = new Set(
    favoritePrompts.flatMap((prompt) =>
      (prompt.tags || []).map((tag) => tag?.name).filter(Boolean)
    )
  );

  const visibleTags = tags.filter((tag) => favoriteTagSet.has(tag.name));

  if (selectedCategory && !favoriteCategorySet.has(selectedCategory)) {
    setSelectedCategory(null);
  }

  if (selectedTag && !favoriteTagSet.has(selectedTag)) {
    setSelectedTag(null);
  }

  return (
    <div
      data-pencil-name="Favorites Main"
      className="box-border w-full h-full flex flex-col gap-4.5 p-[8px_6px] justify-start items-start "
    >
      <div
        data-pencil-name="Favorites Header"
        className="box-border w-full h-fit shrink-0 flex flex-col gap-1.5 justify-start items-start"
      >
        <div className="flex flex-row justify-between items-center w-full">
          <div
            data-pencil-name="Favorites Title"
            className="text-[34px]/[normal] box-border text-[#FFFFFF] font-bold text-left whitespace-nowrap"
          >
            我的收藏-Prompts
          </div>
          <div>
            {favoritePrompts.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[12px] hover:font-semibold text-[#FF00FF] hover:text-[#000000] border border-[#FF00FF] py-1 px-3 rounded-[999px] hover:bg-[#FF00FF] transition-colors cursor-pointer bg-transparent"
              >
                清空收藏
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="text-[12px] hover:font-semibold text-[#39FF14] border border-[#39FF14] py-1 px-3 rounded-[999px] hover:bg-[#39FF14]/10 transition-colors cursor-pointer bg-transparent"
              >
                恢復預設收藏
              </button>
            )}
          </div>
        </div>
        <div
          data-pencil-name="Favorites Subtitle"
          className="text-[16px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
        >
          {favoritePrompts.length > 0
            ? `你收藏了 ${favoritePrompts.length} 個 Prompts`
            : "你還沒有收藏任何項目"}
        </div>
      </div>
      {/* Category 標籤 */}
      <div
        data-pencil-name="Category Row"
        className="box-border w-full h-fit flex flex-wrap gap-4 justify-start items-start mt-2"
      >
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="box-border w-fit h-fit flex flex-row gap-0 py-4 px-2.5 justify-start items-start rounded-sm border border-[#39FF14] text-[rgb(57,255,20)] cursor-pointer transition-all hover:bg-[rgba(57,255,20,0.3)]"
          >
            <span className="text-[16px]/[normal] whitespace-nowrap">
              全部分類
            </span>
          </button>
        )}
        {visibleCategories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <button
              key={category.id || category.name}
              type="button"
              onClick={() => handleCategoryToggle(category.name)}
              className={`box-border w-fit h-fit flex flex-row gap-0 py-4 px-2.5 justify-start items-start rounded-sm border cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#39FF14] border-[#39FF14] text-[#0A0E1A] font-semibold"
                  : "bg-transparent border-[#1A3A2A] text-[#7DCEA0] hover:bg-[rgba(57,255,20,0.3)]"
              }`}
            >
              <span className="text-[16px]/[normal] whitespace-nowrap">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
      {/* Tag 標籤 */}
      <div
        data-pencil-name="Tag Row"
        className="box-border w-full h-fit flex flex-wrap gap-2 justify-start items-start mt-2"
      >
        {selectedTag && (
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className="box-border w-fit h-fit flex flex-row gap-0 py-1.5 px-2.5 justify-start items-start rounded-[999px] border border-[#39FF14] text-[#39FF14] cursor-pointer transition-all hover:bg-[#39FF14]/10"
          >
            <span className="text-[14px]/[normal] whitespace-nowrap">全部</span>
          </button>
        )}
        {visibleTags.map((tag) => {
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

      {favoritePrompts.length > 0 ? (
        filteredFavoritePrompts.length > 0 ? (
          <div
            data-pencil-name="Favorites Grid"
            className="box-border w-full h-fit shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 justify-start items-start"
          >
            {filteredFavoritePrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <div className="box-border w-full py-10 text-center text-[#7DCEA0] border border-[#1A3A2A] border-dashed rounded-xl">
            目前篩選標籤沒有符合的收藏項目。
          </div>
        )
      ) : (
        /* Empty State */
        <div
          data-pencil-name="Empty State Wrap"
          className="box-border w-full flex-1 flex flex-col gap-6 justify-center items-center py-12 mx-auto"
        >
          <div
            data-pencil-name="Empty Icon"
            className="text-[56px]/[normal] box-border text-[#ffae00] font-normal text-left whitespace-nowrap flex gap-2"
          >
            <Search size={36} />
            <Search size={36} />
            <Search size={36} />
          </div>
          <div
            data-pencil-name="Empty Text"
            className="text-[16px]/[26px] box-border w-90 text-[#7DCEA0] font-normal text-center"
          >
            <h4>你還沒有收藏任何 Prompt / Skill</h4>
            <h4>可以在列表搜尋喜歡的prompts並收藏起來喔！</h4>
          </div>
          <button
            type="button"
            onClick={() => navigate("/skills")}
            data-pencil-name="Browse CTA"
            className="box-border w-fit h-fit shrink-0 flex flex-row gap-0 py-3 px-5 justify-start items-start bg-[#39FF14] rounded-lg border-none cursor-pointer hover:bg-[#39FF14]/90 transition-colors"
          >
            <div
              data-pencil-name="Browse CTA Label"
              className="text-[14px]/[normal] box-border text-[#0A0E1A] font-semibold text-left whitespace-nowrap"
            >
              前往Prompts列表
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
