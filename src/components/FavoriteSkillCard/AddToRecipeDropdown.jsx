import { Plus, Check } from "lucide-react";

// 「加入 Recipe」下拉選單面板

export default function AddToRecipeDropdown({
  recipes,
  recipeItemCounts = {},
  memberRecipeIds,
  onToggleRecipe,
  onCreateRecipe,
}) {
  return (
    <div
      data-pencil-name="Recipe Dropdown Overlay"
      onClick={(e) => e.stopPropagation()}
      className="absolute z-20 top-full left-0 mt-2 w-64 flex flex-col gap-1 p-3 bg-[#111827] border border-[#39FF14]/40 rounded-xl shadow-2xl"
    >
      <div className="text-[13px] text-[#7DCEA0] font-semibold px-1 pb-1">
        加入 Recipe
      </div>

      {recipes.length === 0 ? (
        <div className="text-[12px] text-[#3D6B50] px-1 py-2">
          還沒有任何 Recipe，建立一個吧！
        </div>
      ) : (
        recipes.map((recipe) => {
          const checked = memberRecipeIds.has(recipe.id);
          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onToggleRecipe(recipe, !checked)}
              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left bg-transparent border-0 cursor-pointer hover:bg-[#39FF14]/10 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                    checked
                      ? "bg-[#39FF14] border-[#39FF14]"
                      : "border-[#3D6B50]"
                  }`}
                >
                  {checked && <Check size={12} className="text-[#0A0E1A]" />}
                </span>
                <span className="text-[13px] text-[#E0F0E8] truncate">
                  {recipe.name}
                </span>
              </span>
              <span className="text-[11px] text-[#3D6B50] shrink-0">
                {recipeItemCounts[recipe.id] ?? 0}
              </span>
            </button>
          );
        })
      )}

      <div className="border-t border-[#1A3A2A] my-1" />

      <button
        type="button"
        onClick={onCreateRecipe}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left bg-transparent border-0 cursor-pointer text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors text-[13px]"
      >
        <Plus size={14} />
        建立新 Recipe
      </button>
    </div>
  );
}
