import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FavoriteSkillsPage from "./FavoriteSkillsPage";
import { LoadingProvider } from "../../context/LoadingContext";
import useAuth from "../../hooks/useAuth";
import { getFavoritedSkillsAPI } from "../../api/favoriteApi";
import { getMyRecipesAPI, getMyRecipeItemsAPI } from "../../api/recipeApi";
import { alertHelper } from "../../utils/sweetAlert";

vi.mock("../../hooks/useAuth", () => ({ default: vi.fn() }));
vi.mock("../../api/favoriteApi", () => ({
  getFavoritedSkillsAPI: vi.fn(),
}));
vi.mock("../../api/recipeApi", () => ({
  getMyRecipesAPI: vi.fn(),
  getMyRecipeItemsAPI: vi.fn(),
  createRecipeAPI: vi.fn(),
  addItemToRecipeAPI: vi.fn(),
  removeItemFromRecipeAPI: vi.fn(),
}));
vi.mock("../../utils/sweetAlert", () => ({
  alertHelper: {
    confirm: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    prompt: vi.fn(),
  },
}));

vi.mock("../../components/SkillCard/skillCard", () => ({
  default: ({ skill, onToggleFavorite }) => (
    <button
      type="button"
      data-pencil-name="Heart"
      onClick={() => onToggleFavorite(skill)}
    >
      {skill.name}
    </button>
  ),
}));

const mockToggleSkillFavorite = vi.fn();

const skillA = {
  id: "skill-1",
  name: "frontend-design",
  description: "設計相關 Skill",
  favoriteId: 42,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <LoadingProvider>
        <FavoriteSkillsPage />
      </LoadingProvider>
    </MemoryRouter>
  );
}

describe("FavoriteSkillsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      toggleSkillFavorite: mockToggleSkillFavorite,
    });
    vi.mocked(getMyRecipeItemsAPI).mockResolvedValue([]);
  });

  it("完全沒有收藏任何 Skill 時顯示空狀態", async () => {
    vi.mocked(getFavoritedSkillsAPI).mockResolvedValue([]);
    vi.mocked(getMyRecipesAPI).mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("你還沒有收藏任何 Agent Skill")
    ).toBeInTheDocument();
  });

  it("取消收藏一個存在於某個 Recipe 的 Skill 時，先跳出警告，取消後不會真的取消收藏", async () => {
    vi.mocked(getFavoritedSkillsAPI).mockResolvedValue([skillA]);
    vi.mocked(getMyRecipesAPI).mockResolvedValue([
      { id: "recipe-1", name: "面試準備" },
    ]);
    vi.mocked(getMyRecipeItemsAPI).mockResolvedValue([
      { recipeId: "recipe-1", favoriteId: 42 },
    ]);
    vi.mocked(alertHelper.confirm).mockResolvedValue(false);

    renderPage();

    const heartBtn = await screen.findByText((_, el) =>
      el?.getAttribute("data-pencil-name") === "Heart"
    );

    await userEvent.click(heartBtn.closest("button"));

    await waitFor(() => {
      expect(alertHelper.confirm).toHaveBeenCalledWith(
        "確定要取消收藏這個 Skill 嗎？",
        expect.stringContaining("面試準備")
      );
    });
    expect(mockToggleSkillFavorite).not.toHaveBeenCalled();
  });

  it("確認警告視窗後才會真的呼叫 toggleSkillFavorite 取消收藏", async () => {
    vi.mocked(getFavoritedSkillsAPI).mockResolvedValue([skillA]);
    vi.mocked(getMyRecipesAPI).mockResolvedValue([
      { id: "recipe-1", name: "面試準備" },
    ]);
    vi.mocked(getMyRecipeItemsAPI).mockResolvedValue([
      { recipeId: "recipe-1", favoriteId: 42 },
    ]);
    vi.mocked(alertHelper.confirm).mockResolvedValue(true);

    renderPage();

    const heartBtn = await screen.findByText((_, el) =>
      el?.getAttribute("data-pencil-name") === "Heart"
    );

    await userEvent.click(heartBtn.closest("button"));

    await waitFor(() => {
      expect(mockToggleSkillFavorite).toHaveBeenCalledWith("skill-1");
    });
  });

  it("點擊「一鍵安裝」會展開面板，範圍標籤跟著目前選的 Recipe tab 連動", async () => {
    vi.mocked(getFavoritedSkillsAPI).mockResolvedValue([skillA]);
    vi.mocked(getMyRecipesAPI).mockResolvedValue([
      { id: "recipe-1", name: "面試準備" },
    ]);
    vi.mocked(getMyRecipeItemsAPI).mockResolvedValue([
      { recipeId: "recipe-1", favoriteId: 42 },
    ]);

    renderPage();

    await screen.findByText("面試準備（1）");
    expect(screen.queryByText(/目前範圍：/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("一鍵安裝"));
    const panel = await screen.findByText(/目前範圍：/);
    expect(within(panel.parentElement).getByText("全部收藏")).toBeInTheDocument();

    await userEvent.click(screen.getByText("面試準備（1）"));
    await waitFor(() => {
      expect(
        within(panel.parentElement).getByText("面試準備")
      ).toBeInTheDocument();
    });
  });

  it("取消收藏一個不屬於任何 Recipe 的 Skill 時，不需要跳出警告", async () => {
    vi.mocked(getFavoritedSkillsAPI).mockResolvedValue([skillA]);
    vi.mocked(getMyRecipesAPI).mockResolvedValue([]);

    renderPage();

    const heartBtn = await screen.findByText((_, el) =>
      el?.getAttribute("data-pencil-name") === "Heart"
    );

    await userEvent.click(heartBtn.closest("button"));

    await waitFor(() => {
      expect(mockToggleSkillFavorite).toHaveBeenCalledWith("skill-1");
    });
    expect(alertHelper.confirm).not.toHaveBeenCalled();
  });
});
