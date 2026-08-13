import { useState } from "react";
import { Plus } from "lucide-react";
import SkillCard from "../SkillCard/skillCard";
import AddToRecipeDropdown from "./AddToRecipeDropdown";


 // 「我的收藏 - Skills」頁面用的卡片：包住既有的 SkillCard，底下加一列該 Skill

export default function FavoriteSkillCard({
  skill,
  recipes,
  recipeItemsMap,
  onToggleFavorite,
  onToggleRecipeMembership,
  onCreateRecipe,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const memberRecipes = recipes.filter((recipe) =>
    recipeItemsMap[recipe.id]?.has(skill.favoriteId)
  );
  const memberRecipeIds = new Set(memberRecipes.map((recipe) => recipe.id));
  const recipeItemCounts = Object.fromEntries(
    recipes.map((recipe) => [recipe.id, recipeItemsMap[recipe.id]?.size ?? 0])
  );

  return (
    <div
      data-pencil-name="Favorited Skill With Recipes"
      className="w-full flex flex-col gap-2"
    >
      <SkillCard skill={skill} onToggleFavorite={onToggleFavorite} />

      <div
        data-pencil-name="Recipe Tags Row"
        className="relative flex flex-wrap items-center gap-1.5 px-1"
      >
        {memberRecipes.map((recipe) => (
          <span
            key={recipe.id}
            className="flex items-center gap-1 text-[12px] text-[#00FFFF] border border-[#00FFFF]/40 bg-[#00FFFF]/5 rounded-full pl-2.5 pr-1.5 py-0.5"
          >
            {recipe.name}
            <button
              type="button"
              onClick={() => onToggleRecipeMembership(recipe, skill, false)}
              aria-label={`從 ${recipe.name} 移除`}
              className="w-4 h-4 flex items-center justify-center rounded-full bg-transparent border-0 text-[#00FFFF] hover:bg-[#00FFFF]/20 cursor-pointer leading-none"
            >
              ✕
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          data-tour="favorite-card-add-recipe"
          className="flex items-center gap-1 text-[12px] text-[#7DCEA0] border border-dashed border-[#3D6B50] rounded-full px-2.5 py-0.5 bg-transparent cursor-pointer hover:border-[#39FF14] hover:text-[#39FF14] transition-colors"
        >
          <Plus size={12} />
          加入 Recipe
        </button>

        {dropdownOpen && (
          <>
            <button
              type="button"
              aria-label="關閉選單"
              onClick={() => setDropdownOpen(false)}
              className="fixed inset-0 z-10 bg-transparent border-0 cursor-default"
            />
            <AddToRecipeDropdown
              recipes={recipes}
              recipeItemCounts={recipeItemCounts}
              memberRecipeIds={memberRecipeIds}
              onToggleRecipe={(recipe, checked) =>
                onToggleRecipeMembership(recipe, skill, checked)
              }
              onCreateRecipe={() => {
                setDropdownOpen(false);
                onCreateRecipe(skill);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
