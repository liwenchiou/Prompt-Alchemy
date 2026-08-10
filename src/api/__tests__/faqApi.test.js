import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock("../apiClient", () => ({
  apiRequest: apiRequestMock,
}));

import { getFaqs } from "../faqApi";

describe("faqApi", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("透過公開 FAQ endpoint 取得並正規化資料", async () => {
    apiRequestMock.mockResolvedValue({
      status: "success",
      data: [
        {
          id: " faq-1 ",
          question: " Prompt 鍊金坊是什麼？ ",
          answer: " 一個 Prompt 收藏平台。 ",
        },
      ],
    });

    await expect(getFaqs()).resolves.toEqual([
      {
        id: "faq-1",
        question: "Prompt 鍊金坊是什麼？",
        answer: "一個 Prompt 收藏平台。",
      },
    ]);
    expect(apiRequestMock).toHaveBeenCalledWith("/faqs/", { method: "GET" });
  });

  it("過濾缺少必要欄位或空白內容的 FAQ", async () => {
    apiRequestMock.mockResolvedValue({
      status: "success",
      data: [
        { id: "faq-1", question: "有效問題", answer: "有效答案" },
        { id: "", question: "缺少 id", answer: "答案" },
        { id: "faq-2", question: "   ", answer: "答案" },
        { id: "faq-3", question: "問題", answer: null },
      ],
    });

    await expect(getFaqs()).resolves.toEqual([
      { id: "faq-1", question: "有效問題", answer: "有效答案" },
    ]);
  });

  it("後端回應狀態不正確時拋出錯誤", async () => {
    apiRequestMock.mockResolvedValue({ status: "error", data: [] });

    await expect(getFaqs()).rejects.toThrow("FAQ 回應格式錯誤");
  });

  it("後端 data 不是陣列時拋出錯誤", async () => {
    apiRequestMock.mockResolvedValue({ status: "success", data: null });

    await expect(getFaqs()).rejects.toThrow("FAQ 回應格式錯誤");
  });
});
