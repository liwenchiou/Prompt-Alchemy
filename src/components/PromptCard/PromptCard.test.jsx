import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PromptCard from "./PromptCard";
import useAuth from "../../hooks/useAuth";
import { copyToClipboard } from "../../utils/copyToClipboard";

vi.mock("../../hooks/useAuth", () => ({
  default: vi.fn(),
}));

vi.mock("../../utils/copyToClipboard", () => ({
  copyToClipboard: vi.fn(),
}));

describe("PromptCard 元件測試", () => {
  const mockPrompt = {
    id: "prompt-uuid-1",
    title: "後端 API 審查助手",
    intro: "自動檢查 Express API 的錯誤處理",
    promptContent: "請你扮演資深後端工程師...",
    category: "後端開發",
    tags: [{ id: "tag-1", name: "#API" }],
    favoriteCount: 10,
  };

  const mockToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-1", email: "test@example.com" },
      favorites: ["prompt-uuid-1"],
      favoriteCounts: { "prompt-uuid-1": 10 },
      toggleFavorite: mockToggleFavorite,
    });
    vi.mocked(copyToClipboard).mockResolvedValue(true);
  });

  it("正確認開卡片標題、簡介與標籤內容", () => {
    render(
      <MemoryRouter>
        <PromptCard prompt={mockPrompt} />
      </MemoryRouter>
    );

    expect(screen.getByText("後端 API 審查助手")).toBeInTheDocument();
    expect(screen.getByText("自動檢查 Express API 的錯誤處理")).toBeInTheDocument();
    expect(screen.getByText("#API")).toBeInTheDocument();
  });

  it("點擊複製按鈕呼叫 copyToClipboard 並切換按鈕文字為『已複製』", async () => {
    render(
      <MemoryRouter>
        <PromptCard prompt={mockPrompt} />
      </MemoryRouter>
    );

    const copyBtn = screen.getByRole("button", { name: /複製/ });
    fireEvent.click(copyBtn);

    expect(copyToClipboard).toHaveBeenCalledWith("請你扮演資深後端工程師...");
    expect(await screen.findByText("已複製")).toBeInTheDocument();
  });

  it("已登入使用者點擊愛心按鈕觸發 toggleFavorite", () => {
    render(
      <MemoryRouter>
        <PromptCard prompt={mockPrompt} />
      </MemoryRouter>
    );

    const heartBtn = screen.getByRole("button", { name: /收藏/ });
    fireEvent.click(heartBtn);

    expect(mockToggleFavorite).toHaveBeenCalledWith("prompt-uuid-1");
  });
});
