import { describe, it, expect, beforeEach, vi } from "vitest";

const mockApiRequest = vi.fn();
vi.mock("../apiClient", () => ({
  apiRequest: (...args) => mockApiRequest(...args),
}));

describe("recipeApi", () => {
  beforeEach(() => {
    vi.resetModules();
    mockApiRequest.mockReset();
  });

  it("getMyRecipesAPI 打 GET /me/recipes 並轉成 camelCase", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [
        {
          id: "recipe-1",
          name: "面試準備",
          created_at: "2026-08-11T09:00:00Z",
          updated_at: "2026-08-11T09:00:00Z",
        },
      ],
    });

    const { getMyRecipesAPI } = await import("../recipeApi");
    const recipes = await getMyRecipesAPI();

    expect(mockApiRequest).toHaveBeenCalledWith("/me/recipes", { method: "GET" });
    expect(recipes).toEqual([
      {
        id: "recipe-1",
        name: "面試準備",
        createdAt: "2026-08-11T09:00:00Z",
        updatedAt: "2026-08-11T09:00:00Z",
      },
    ]);
  });

  it("createRecipeAPI 打 POST /me/recipes 帶 name", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: { id: "recipe-2", name: "週報用", created_at: null, updated_at: null },
    });

    const { createRecipeAPI } = await import("../recipeApi");
    const recipe = await createRecipeAPI("週報用");

    expect(mockApiRequest).toHaveBeenCalledWith("/me/recipes", {
      method: "POST",
      body: { name: "週報用" },
    });
    expect(recipe.id).toBe("recipe-2");
    expect(recipe.name).toBe("週報用");
  });

  it("getRecipeByIdAPI 把 items 底下 snake_case 的 Skill 資料正規化，並帶出 favoriteId", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: {
        id: "recipe-1",
        name: "面試準備",
        created_at: null,
        updated_at: null,
        items: [
          {
            id: "agent-skill-uuid-0001",
            name: "matt",
            repo_owner: "mattpocock",
            repo_name: "skills",
            skill_slug: "*",
            category_name: "小工具",
            stargazers_count: 210731,
            favorite_count: 6,
            install_kind: "full_package",
            supported_agents: ["codex", "claude-code"],
            doc_url: "https://raw.githubusercontent.com/mattpocock/skills/main/README.md",
            favorite_id: 42,
            added_at: "2026-08-11T10:00:00Z",
          },
        ],
      },
    });

    const { getRecipeByIdAPI } = await import("../recipeApi");
    const recipe = await getRecipeByIdAPI("recipe-1");

    expect(mockApiRequest).toHaveBeenCalledWith("/me/recipes/recipe-1", {
      method: "GET",
    });
    expect(recipe.items).toHaveLength(1);
    expect(recipe.items[0]).toMatchObject({
      id: "agent-skill-uuid-0001",
      name: "matt",
      repoOwner: "mattpocock",
      categoryName: "小工具",
      installKind: "full_package",
      supportedAgents: ["codex", "claude-code"],
      favoriteId: 42,
    });
  });

  it("addItemToRecipeAPI 帶 favoriteId 打 POST /me/recipes/:id/items", async () => {
    mockApiRequest.mockResolvedValue({ status: "success", data: [] });

    const { addItemToRecipeAPI } = await import("../recipeApi");
    await addItemToRecipeAPI("recipe-1", 42);

    expect(mockApiRequest).toHaveBeenCalledWith("/me/recipes/recipe-1/items", {
      method: "POST",
      body: { favoriteId: 42 },
    });
  });

  it("getMyRecipeItemsAPI 打 GET /me/recipe-items 並把 recipe_id／favorite_id 轉成 camelCase 配對", async () => {
    mockApiRequest.mockResolvedValue({
      status: "success",
      data: [
        { recipe_id: "recipe-1", favorite_id: 42 },
        { recipe_id: "recipe-1", favorite_id: 43 },
        { recipe_id: "recipe-2", favorite_id: 42 },
      ],
    });

    const { getMyRecipeItemsAPI } = await import("../recipeApi");
    const pairs = await getMyRecipeItemsAPI();

    expect(mockApiRequest).toHaveBeenCalledWith("/me/recipe-items", {
      method: "GET",
    });
    expect(pairs).toEqual([
      { recipeId: "recipe-1", favoriteId: 42 },
      { recipeId: "recipe-1", favoriteId: 43 },
      { recipeId: "recipe-2", favoriteId: 42 },
    ]);
  });

  it("removeItemFromRecipeAPI 打 DELETE /me/recipes/:id/items/:favoriteId", async () => {
    mockApiRequest.mockResolvedValue({ status: "success", data: [] });

    const { removeItemFromRecipeAPI } = await import("../recipeApi");
    await removeItemFromRecipeAPI("recipe-1", 42);

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/me/recipes/recipe-1/items/42",
      { method: "DELETE" }
    );
  });
});
