import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQSection from "./FAQSection";
import { getFaqs } from "../../api/faqApi";

vi.mock("../../api/faqApi", () => ({
  getFaqs: vi.fn(),
}));

const mockFaqs = [
  {
    id: "faq-1",
    question: "Prompt 鍊金坊是什麼？",
    answer: "Prompt 鍊金坊是一個整理與分享 AI Prompt、Skill 的收藏平台。",
  },
  {
    id: "faq-2",
    question: "沒有註冊帳號也可以瀏覽 Prompt 嗎？",
    answer: "可以，未登入訪客可以瀏覽已公開的 Prompt。",
  },
];

describe("FAQSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFaqs).mockResolvedValue(mockFaqs);
  });

  it("載入並顯示 FAQ，初始時所有回答皆收合", async () => {
    render(<FAQSection />);

    expect(screen.getByRole("status", { name: "" })).toHaveTextContent(
      "載入常見問題中"
    );

    const firstQuestion = await screen.findByRole("button", {
      name: "Prompt 鍊金坊是什麼？",
    });
    const firstAnswer = document.getElementById("faq-answer-faq-1");

    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    expect(firstQuestion).toHaveAttribute("aria-controls", "faq-answer-faq-1");
    expect(firstAnswer).toHaveAttribute("role", "region");
    expect(firstAnswer).toHaveAttribute("aria-labelledby", "faq-question-faq-1");
    expect(firstAnswer).toHaveAttribute("hidden");
    expect(firstQuestion.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("支援單一展開、再次點擊收合與題目切換", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const firstQuestion = await screen.findByRole("button", {
      name: "Prompt 鍊金坊是什麼？",
    });
    const secondQuestion = screen.getByRole("button", {
      name: "沒有註冊帳號也可以瀏覽 Prompt 嗎？",
    });
    const firstAnswer = document.getElementById("faq-answer-faq-1");
    const secondAnswer = document.getElementById("faq-answer-faq-2");

    await user.click(firstQuestion);
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    expect(firstAnswer).not.toHaveAttribute("hidden");
    expect(screen.getByText(mockFaqs[0].answer)).toBeVisible();

    await user.click(firstQuestion);
    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    expect(firstAnswer).toHaveAttribute("hidden");

    await user.click(firstQuestion);
    await user.click(secondQuestion);
    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    expect(firstAnswer).toHaveAttribute("hidden");
    expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
    expect(secondAnswer).not.toHaveAttribute("hidden");
  });

  it("可使用 Tab、Enter 與 Space 操作問題按鈕", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const firstQuestion = await screen.findByRole("button", {
      name: "Prompt 鍊金坊是什麼？",
    });

    await user.tab();
    expect(firstQuestion).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");

    await user.keyboard(" ");
    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  });

  it("API 發生錯誤時顯示警示，並可重新載入", async () => {
    const user = userEvent.setup();
    vi.mocked(getFaqs)
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce(mockFaqs);

    render(<FAQSection />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "目前無法載入常見問題，請稍後再試。"
    );

    await user.click(screen.getByRole("button", { name: "重新載入" }));

    expect(
      await screen.findByRole("button", { name: "Prompt 鍊金坊是什麼？" })
    ).toBeInTheDocument();
    expect(getFaqs).toHaveBeenCalledTimes(2);
  });

  it("API 回傳空陣列時顯示空資料狀態", async () => {
    vi.mocked(getFaqs).mockResolvedValue([]);

    render(<FAQSection />);

    expect(
      await screen.findByText("目前沒有可顯示的常見問題。")
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });
});
