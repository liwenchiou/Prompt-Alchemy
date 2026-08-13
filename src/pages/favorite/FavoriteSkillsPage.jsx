import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartCrack,
  Plus,
  CircleChevronDown,
  CircleChevronUp,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getFavoritedSkillsAPI } from "../../api/favoriteApi";
import {
  getMyRecipesAPI,
  getMyRecipeItemsAPI,
  createRecipeAPI,
  addItemToRecipeAPI,
  removeItemFromRecipeAPI,
} from "../../api/recipeApi";
import { alertHelper } from "../../utils/sweetAlert";
import { usePageLoading } from "../../hooks/usePageLoading";
import FavoriteSkillCard from "../../components/FavoriteSkillCard/FavoriteSkillCard";
import BulkInstallPanel from "../../components/BulkInstallPanel/BulkInstallPanel";
import SkillGroupList from "../../components/SkillGroupList/SkillGroupList";
import {
  filterSkillsByQuery,
  groupSkillsByRepo,
} from "../../utils/skillGrouping";

import { getAgentSkills } from "../../api/agentSkillApi";

const ALL_RECIPES_TAB = "all";

export default function FavoriteSkillsPage() {
  const navigate = useNavigate();
  const { toggleSkillFavorite } = useAuth();

  const [skills, setSkills] = useState([]);
  const [recipes, setRecipes] = useState([]);
  // recipeId -> Set(favoriteId)，代表這個 Recipe 底下已加入哪些收藏項目
  const [recipeItemsMap, setRecipeItemsMap] = useState({});
  const [selectedRecipeId, setSelectedRecipeId] = useState(ALL_RECIPES_TAB);
  const [initialized, setInitialized] = useState(false);
  const [bulkInstallOpen, setBulkInstallOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  usePageLoading(initialized);

  useEffect(() => {
    Promise.all([
      getFavoritedSkillsAPI().catch(() => []),
      getAgentSkills().catch(() => []),
    ])
      .then(([favSkills, agentSkills]) => {
        if (Array.isArray(favSkills) && favSkills.length > 0) {
          setSkills(favSkills);
        } else if (Array.isArray(agentSkills) && agentSkills.length > 0) {
          const demoSkills = agentSkills.slice(0, 3).map((s, idx) => ({
            ...s,
            favoriteId: `demo-fav-${s.id || idx}`,
            installKind: s.installKind || "full_package",
            repoOwner: s.repoOwner || "prompt-alchemy",
            repoName: s.repoName || s.name || "demo-skill",
            supportedAgents: s.supportedAgents || ["claude-code", "codex", "cursor"],
          }));
          setSkills(demoSkills);
        } else {
          setSkills([]);
        }
      })
      .finally(() => setInitialized(true));

    Promise.all([getMyRecipesAPI(), getMyRecipeItemsAPI()])
      .then(([myRecipes, pairs]) => {
        const activeRecipes =
          Array.isArray(myRecipes) && myRecipes.length > 0
            ? myRecipes
            : [
                { id: "default", name: "Default" },
                { id: "backend", name: "Backend Work" },
              ];
        const itemsMap = Object.fromEntries(
          activeRecipes.map((recipe) => [recipe.id, new Set()])
        );
        if (Array.isArray(pairs)) {
          pairs.forEach(({ recipeId, favoriteId }) => {
            if (!itemsMap[recipeId]) itemsMap[recipeId] = new Set();
            itemsMap[recipeId].add(favoriteId);
          });
        }
        setRecipes(activeRecipes);
        setRecipeItemsMap(itemsMap);
      })
      .catch((err) => {
        console.warn("讀取 Recipe 清單失敗，使用預設設定", err.message);
        const defaultRecipes = [
          { id: "default", name: "Default" },
          { id: "backend", name: "Backend Work" },
        ];
        setRecipes(defaultRecipes);
        setRecipeItemsMap({
          default: new Set(),
          backend: new Set(),
        });
      });
  }, []);

  const handleToggleFavorite = async (skill) => {
    const memberRecipes = recipes.filter((recipe) =>
      recipeItemsMap[recipe.id]?.has(skill.favoriteId)
    );

    if (memberRecipes.length > 0) {
      const confirmed = await alertHelper.confirm(
        "確定要取消收藏這個 Skill 嗎？",
        `/${skill.name} 目前存在於 ${memberRecipes.length} 個 Recipe（${memberRecipes
          .map((recipe) => recipe.name)
          .join(
            "、"
          )}）中。取消收藏後，會一併從所有 Recipe 中移除，這個動作無法復原。`
      );
      if (!confirmed) return;
    }

    await toggleSkillFavorite(skill.id);

    setSkills((prev) => prev.filter((s) => s.id !== skill.id));
    setRecipeItemsMap((prev) => {
      const next = {};
      for (const [recipeId, favoriteIds] of Object.entries(prev)) {
        const updated = new Set(favoriteIds);
        updated.delete(skill.favoriteId);
        next[recipeId] = updated;
      }
      return next;
    });
  };

  const handleToggleRecipeMembership = async (recipe, skill, shouldAdd) => {
    try {
      if (shouldAdd) {
        await addItemToRecipeAPI(recipe.id, skill.favoriteId);
        setRecipeItemsMap((prev) => ({
          ...prev,
          [recipe.id]: new Set(prev[recipe.id]).add(skill.favoriteId),
        }));
        alertHelper.success("已加入 Recipe", `已加入「${recipe.name}」`, true);
      } else {
        await removeItemFromRecipeAPI(recipe.id, skill.favoriteId);
        setRecipeItemsMap((prev) => {
          const updated = new Set(prev[recipe.id]);
          updated.delete(skill.favoriteId);
          return { ...prev, [recipe.id]: updated };
        });
        alertHelper.success(
          "已從 Recipe 移除",
          `已從「${recipe.name}」移除`,
          true
        );
      }
    } catch (err) {
      alertHelper.error("操作失敗", err.message || "請稍後再試", true);
    }
  };

  const handleCreateRecipe = async (skill = null) => {
    const name = await alertHelper.prompt("建立新 Recipe", {
      inputPlaceholder: "輸入 Recipe 名稱",
    });
    if (!name) return;

    try {
      const recipe = await createRecipeAPI(name);
      setRecipes((prev) => [recipe, ...prev]);
      setRecipeItemsMap((prev) => ({ ...prev, [recipe.id]: new Set() }));
      if (skill) {
        await handleToggleRecipeMembership(recipe, skill, true);
      } else {
        alertHelper.success("已建立 Recipe", `已建立「${recipe.name}」`, true);
      }
    } catch (err) {
      alertHelper.error("建立失敗", err.message || "請稍後再試", true);
    }
  };

  const visibleSkills =
    selectedRecipeId === ALL_RECIPES_TAB
      ? skills
      : skills.filter((skill) =>
          recipeItemsMap[selectedRecipeId]?.has(skill.favoriteId)
        );

  // 搜尋範圍統一為 name／skillSlug／repoOwner／category，跟主列表一致（見
  // skillGrouping.js，13 號票）。搜尋疊在 Recipe tab 篩選之上，不影響
  // BulkInstallPanel 的「一鍵安裝」範圍（那個仍用 visibleSkills，搜尋只是
  // 用來找卡片，不是縮小要安裝的範圍）。
  const searchedSkills = filterSkillsByQuery(visibleSkills, searchQuery);
  const groups = groupSkillsByRepo(searchedSkills);

  // 一鍵安裝跟目前選的 Recipe 篩選 tab 連動：選「全部收藏」清單就是全部，切到
  // 某個 Recipe 就只列該 Recipe 底下的 Skill，直接沿用畫面上已有的篩選狀態。
  const bulkInstallScopeLabel =
    selectedRecipeId === ALL_RECIPES_TAB
      ? "全部收藏"
      : recipes.find((recipe) => recipe.id === selectedRecipeId)?.name ||
        "Recipe";

  return (
    <div
      data-pencil-name="Favorites Main"
      className="box-border w-full h-full flex flex-col gap-4.5 p-[8px_6px] justify-start items-start"
    >
      <div
        data-pencil-name="Favorites Header"
        className="box-border w-full h-fit shrink-0 flex flex-col gap-1.5 justify-start items-start"
      >
        <div className="flex flex-row flex-wrap gap-3 justify-between items-center w-full">
          <div
            data-pencil-name="Favorites Title"
            className="text-[34px]/[normal] box-border text-[#FFFFFF] font-bold text-left whitespace-nowrap"
          >
            我的收藏-Skills
          </div>
          {skills.length > 0 && (
            <button
              type="button"
              onClick={() => setBulkInstallOpen((prev) => !prev)}
              data-pencil-name="Bulk Install Button"
              data-tour="bulk-install-btn"
              aria-expanded={bulkInstallOpen}
              className="text-[13px] font-bold text-[#0A0E1A] bg-[#FFD700] hover:bg-[#FFD700]/85 active:scale-95 border-none py-2 px-4 rounded-[999px] cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,215,0,0.35)]"
            >
              {bulkInstallOpen ? (
                <CircleChevronUp size={16} />
              ) : (
                <CircleChevronDown size={16} />
              )}
              一鍵安裝
            </button>
          )}
          <button
            type="button"
            onClick={() => handleCreateRecipe(null)}
            data-pencil-name="Create Recipe Button"
            className="text-[12px] hover:font-semibold text-[#39FF14] border border-[#39FF14] py-1 px-3 rounded-[999px] hover:bg-[#39FF14]/10 transition-colors cursor-pointer bg-transparent flex items-center gap-1"
          >
            <Plus size={14} />
            新增 Recipe
          </button>
        </div>
        <div
          data-pencil-name="Favorites Subtitle"
          className="text-[16px]/[normal] box-border text-[#7DCEA0] font-normal text-left whitespace-nowrap"
        >
          {skills.length > 0
            ? `你收藏了 ${skills.length} 個 Agent Skill`
            : "你還沒有收藏任何項目"}
        </div>
      </div>

      {bulkInstallOpen && skills.length > 0 && (
        <BulkInstallPanel
          skills={visibleSkills}
          scopeLabel={bulkInstallScopeLabel}
        />
      )}

      {skills.length > 0 && (
        <div
          data-pencil-name="Favorites Search Bar"
          className="box-border w-full h-fit flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#111827]/40 p-4 rounded-xl border border-[#1A3A2A]/50"
        >
          <div className="box-border w-full sm:flex-1 sm:min-w-0 h-fit flex flex-row gap-2.5 py-2.5 px-3.5 justify-start items-center bg-[#0F1F18] border border-[#1A3A2A] rounded-[10px] focus-within:border-[#39FF14] transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋收藏的 Agent Skill..."
              className="w-full bg-transparent border-0 text-[#E0F0E8] placeholder-[#3D6B50] focus:outline-none text-[13px]"
            />
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div
          data-pencil-name="Recipe Filter Tabs"
          data-tour="favorites-recipe-tabs"
          className="box-border w-full h-fit flex flex-wrap gap-2 justify-start items-start"
        >
          <button
            type="button"
            onClick={() => setSelectedRecipeId(ALL_RECIPES_TAB)}
            className={`box-border w-fit h-fit py-1.5 px-3 rounded-[999px] border cursor-pointer transition-all text-[13px]/[normal] whitespace-nowrap ${
              selectedRecipeId === ALL_RECIPES_TAB
                ? "bg-[#39FF14] border-[#39FF14] text-[#0A0E1A] font-semibold"
                : "bg-transparent border-[#1A3A2A] text-[#7DCEA0] hover:bg-[#39FF14]/10"
            }`}
          >
            全部收藏（{skills.length}）
          </button>
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => setSelectedRecipeId(recipe.id)}
              className={`box-border w-fit h-fit py-1.5 px-3 rounded-[999px] border cursor-pointer transition-all text-[13px]/[normal] whitespace-nowrap ${
                selectedRecipeId === recipe.id
                  ? "bg-[#39FF14] border-[#39FF14] text-[#0A0E1A] font-semibold"
                  : "bg-transparent border-[#1A3A2A] text-[#7DCEA0] hover:bg-[#39FF14]/10"
              }`}
            >
              {recipe.name}（{recipeItemsMap[recipe.id]?.size ?? 0}）
            </button>
          ))}
        </div>
      )}

      {skills.length === 0 ? (
        <div
          data-pencil-name="Empty State Wrap"
          className="box-border w-full flex-1 flex flex-col gap-6 justify-center items-center py-12 mx-auto"
        >
          <HeartCrack size={56} className="text-[#3D6B50]" />
          <div
            data-pencil-name="Empty Text"
            className="text-[16px]/[26px] box-border w-90 text-[#7DCEA0] font-normal text-center"
          >
            <h4>你還沒有收藏任何 Agent Skill</h4>
            <h4>去逛逛，找幾個趁手的 AI 幫手，收藏起來再打包成 Recipe 吧！</h4>
          </div>
          <button
            type="button"
            onClick={() => navigate("/agent-skills")}
            data-pencil-name="Browse CTA"
            className="box-border w-fit h-fit shrink-0 flex flex-row gap-0 py-3 px-5 justify-start items-start bg-[#39FF14] rounded-lg border-none cursor-pointer hover:bg-[#39FF14]/90 transition-colors"
          >
            <div className="text-[14px]/[normal] box-border text-[#0A0E1A] font-semibold text-left whitespace-nowrap">
              前往 Skills 列表
            </div>
          </button>
        </div>
      ) : visibleSkills.length === 0 ? (
        <div className="box-border w-full py-10 text-center text-[#7DCEA0] border border-[#1A3A2A] border-dashed rounded-xl">
          這個 Recipe 底下還沒有加入任何 Skill。
        </div>
      ) : searchedSkills.length > 0 ? (
        <div
          data-pencil-name="Favorites Skills Grid"
          className="box-border w-full h-fit shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 justify-start items-start"
        >
          <SkillGroupList
            groups={groups}
            renderCard={(skill) => (
              <FavoriteSkillCard
                skill={skill}
                recipes={recipes}
                recipeItemsMap={recipeItemsMap}
                onToggleFavorite={handleToggleFavorite}
                onToggleRecipeMembership={handleToggleRecipeMembership}
                onCreateRecipe={handleCreateRecipe}
              />
            )}
          />
        </div>
      ) : (
        <div className="box-border w-full text-center py-12 text-[#7DCEA0]/60 border border-[#1A3A2A] border-dashed rounded-xl">
          沒有找到符合條件的 Agent Skill。
        </div>
      )}
    </div>
  );
}
