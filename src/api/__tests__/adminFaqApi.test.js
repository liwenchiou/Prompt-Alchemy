import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock("../apiClient", () => ({
  apiRequest: apiRequestMock,
}));

import {
  createAdminFaq,
  disableAdminFaq,
  getAdminFaqs,
  restoreAdminFaq,
  updateAdminFaq,
} from "../adminApi";

const adminFaq = {
  id: "60000000-0000-4000-a000-000000000001",
  question: "Prompt 鍊金坊是什麼？",
  answer: "Prompt 鍊金坊是一個 Prompt 收藏平台。",
  sortOrder: 1,
  isActive: true,
  createdAt: "2026-08-03T12:57:01.510Z",
  updatedAt: "2026-08-03T15:17:07.979Z",
};

describe("Admin FAQ API", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("取得完整 FAQ 管理清單並保留後端順序與 metadata", async () => {
    const secondFaq = { ...adminFaq, id: "faq-2", sortOrder: 0, isActive: false };
    apiRequestMock.mockResolvedValue({
      status: "success",
      data: [adminFaq, secondFaq],
    });

    await expect(getAdminFaqs()).resolves.toEqual([adminFaq, secondFaq]);
    expect(apiRequestMock).toHaveBeenCalledWith("/admin/faqs/", {
      method: "GET",
    });
  });

  it("建立 FAQ 時 trim 文字並套用預設排序與啟用狀態", async () => {
    apiRequestMock.mockResolvedValue({ status: "success", data: adminFaq });

    await createAdminFaq({
      question: "  Prompt 鍊金坊是什麼？  ",
      answer: "  Prompt 鍊金坊是一個 Prompt 收藏平台。  ",
    });

    expect(apiRequestMock).toHaveBeenCalledWith("/admin/faqs/", {
      method: "POST",
      body: {
        question: "Prompt 鍊金坊是什麼？",
        answer: "Prompt 鍊金坊是一個 Prompt 收藏平台。",
        sortOrder: 0,
        isActive: true,
      },
    });
  });

  it("建立 FAQ 時將合法數字字串轉為整數", async () => {
    apiRequestMock.mockResolvedValue({ status: "success", data: adminFaq });

    await createAdminFaq({
      question: "問題",
      answer: "答案",
      sortOrder: "3",
      isActive: false,
    });

    expect(apiRequestMock).toHaveBeenCalledWith("/admin/faqs/", {
      method: "POST",
      body: {
        question: "問題",
        answer: "答案",
        sortOrder: 3,
        isActive: false,
      },
    });
  });

  it("更新 FAQ 支援部分欄位", async () => {
    const updated = { ...adminFaq, sortOrder: 4 };
    apiRequestMock.mockResolvedValue({ status: "success", data: updated });

    await expect(updateAdminFaq(adminFaq.id, { sortOrder: "4" })).resolves.toEqual(
      updated
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      `/admin/faqs/${adminFaq.id}`,
      { method: "PUT", body: { sortOrder: 4 } }
    );
  });

  it("下架使用 DELETE，恢復發布使用 PUT isActive true", async () => {
    apiRequestMock
      .mockResolvedValueOnce({
        status: "success",
        data: { ...adminFaq, isActive: false },
      })
      .mockResolvedValueOnce({ status: "success", data: adminFaq });

    await disableAdminFaq(adminFaq.id);
    await restoreAdminFaq(adminFaq.id);

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      1,
      `/admin/faqs/${adminFaq.id}`,
      { method: "DELETE" }
    );
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      `/admin/faqs/${adminFaq.id}`,
      { method: "PUT", body: { isActive: true } }
    );
  });

  it("拒絕空白文字、負數與小數排序", async () => {
    await expect(
      createAdminFaq({ question: "   ", answer: "答案" })
    ).rejects.toThrow("question 為必填且不可為空白");
    await expect(
      createAdminFaq({ question: "問題", answer: "答案", sortOrder: -1 })
    ).rejects.toThrow("sortOrder 必須是大於或等於 0 的整數");
    await expect(
      createAdminFaq({ question: "問題", answer: "答案", sortOrder: 1.5 })
    ).rejects.toThrow("sortOrder 必須是大於或等於 0 的整數");
    await expect(
      createAdminFaq({ question: "問題", answer: "答案", sortOrder: "   " })
    ).rejects.toThrow("sortOrder 必須是大於或等於 0 的整數");
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("無效 response shape 不會被靜默轉成空資料", async () => {
    apiRequestMock.mockResolvedValue({ status: "success", data: null });

    await expect(getAdminFaqs()).rejects.toThrow("FAQ 管理清單回應格式錯誤");
  });

  it("後端錯誤會原樣向上拋出", async () => {
    apiRequestMock.mockRejectedValue(new Error("權限不足，拒絕存取"));

    await expect(getAdminFaqs()).rejects.toThrow("權限不足，拒絕存取");
  });
});
