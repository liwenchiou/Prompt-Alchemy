import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminFaqs from "./AdminFaqs";
import {
  createAdminFaq,
  disableAdminFaq,
  getAdminFaqs,
  restoreAdminFaq,
  updateAdminFaq,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";

vi.mock("../../api/adminApi", () => ({
  getAdminFaqs: vi.fn(),
  createAdminFaq: vi.fn(),
  updateAdminFaq: vi.fn(),
  disableAdminFaq: vi.fn(),
  restoreAdminFaq: vi.fn(),
}));

vi.mock("../../utils/sweetAlert", () => ({
  alertHelper: {
    confirm: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../components/admin/FaqFormModal", () => ({
  default: ({ faq, onClose, onSubmit }) => (
    <div role="dialog" aria-label={faq ? "編輯 FAQ" : "新增 FAQ"}>
      <span>{faq ? `編輯：${faq.question}` : "新增模式"}</span>
      <button
        type="button"
        onClick={() =>
          onSubmit({
            question: faq?.question || "新問題",
            answer: faq?.answer || "新答案",
            sortOrder: faq?.sortOrder ?? 0,
            isActive: faq?.isActive ?? true,
          })
        }
      >
        模擬儲存
      </button>
      <button type="button" onClick={onClose}>
        取消
      </button>
    </div>
  ),
}));

const faqs = [
  {
    id: "faq-active",
    question: "第一題",
    answer: "收藏功能說明",
    sortOrder: 5,
    isActive: true,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-02T00:00:00Z",
  },
  {
    id: "faq-inactive",
    question: "第二題",
    answer: "訪客瀏覽說明",
    sortOrder: 0,
    isActive: false,
    createdAt: "2026-08-03T00:00:00Z",
    updatedAt: "2026-08-04T00:00:00Z",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminFaqs />
    </MemoryRouter>
  );
}

describe("AdminFaqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFaqs).mockResolvedValue(faqs);
    vi.mocked(alertHelper.confirm).mockResolvedValue(true);
    vi.mocked(createAdminFaq).mockResolvedValue(faqs[0]);
    vi.mocked(updateAdminFaq).mockResolvedValue(faqs[0]);
    vi.mocked(disableAdminFaq).mockResolvedValue({ ...faqs[0], isActive: false });
    vi.mocked(restoreAdminFaq).mockResolvedValue({ ...faqs[1], isActive: true });
  });

  it("載入後保留 server 回傳順序與真實發布序號", async () => {
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("FAQ 資料讀取中");
    await screen.findAllByText("第一題");

    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("#05")).toBeInTheDocument();
    expect(within(rows[2]).getByText("#00")).toBeInTheDocument();
  });

  it("可依問題或回答搜尋並套用狀態篩選", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("第一題");

    await user.type(screen.getByRole("searchbox", { name: "搜尋 FAQ" }), "收藏");
    expect(screen.getAllByText("第一題").length).toBeGreaterThan(0);
    expect(screen.queryByText("第二題")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "搜尋 FAQ" }));
    await user.click(screen.getByRole("button", { name: "未啟用" }));
    expect(screen.getAllByText("第二題").length).toBeGreaterThan(0);
    expect(screen.queryByText("第一題")).not.toBeInTheDocument();
  });

  it("可新增與編輯 FAQ，成功後重新取得清單", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("第一題");

    await user.click(screen.getByRole("button", { name: "新增 FAQ" }));
    expect(screen.getByRole("dialog", { name: "新增 FAQ" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "模擬儲存" }));

    await waitFor(() => expect(createAdminFaq).toHaveBeenCalled());
    expect(getAdminFaqs).toHaveBeenCalledTimes(2);

    await user.click(screen.getAllByRole("button", { name: "編輯" })[0]);
    expect(screen.getByText("編輯：第一題")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "模擬儲存" }));

    await waitFor(() =>
      expect(updateAdminFaq).toHaveBeenCalledWith("faq-active", expect.any(Object))
    );
    expect(getAdminFaqs).toHaveBeenCalledTimes(3);
  });

  it("確認後可下架與恢復發布", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("第一題");

    await user.click(screen.getAllByRole("button", { name: "下架" })[0]);
    await waitFor(() => expect(disableAdminFaq).toHaveBeenCalledWith("faq-active"));
    expect(alertHelper.confirm).toHaveBeenCalledWith(
      "確定要下架這則 FAQ 嗎？",
      expect.stringContaining("前台不再顯示")
    );

    await user.click(screen.getAllByRole("button", { name: "恢復發布" })[0]);
    await waitFor(() => expect(restoreAdminFaq).toHaveBeenCalledWith("faq-inactive"));
    expect(alertHelper.confirm).toHaveBeenLastCalledWith(
      "確定要恢復發布這則 FAQ 嗎？",
      expect.stringContaining("重新出現在前台")
    );
  });

  it("取消確認時不呼叫發布狀態 API", async () => {
    const user = userEvent.setup();
    vi.mocked(alertHelper.confirm).mockResolvedValue(false);
    renderPage();
    await screen.findAllByText("第一題");

    await user.click(screen.getAllByRole("button", { name: "下架" })[0]);

    expect(disableAdminFaq).not.toHaveBeenCalled();
    expect(restoreAdminFaq).not.toHaveBeenCalled();
  });

  it("載入錯誤顯示友善訊息並可重試", async () => {
    const user = userEvent.setup();
    const permissionError = new Error("Forbidden");
    permissionError.status = 403;
    vi.mocked(getAdminFaqs)
      .mockRejectedValueOnce(permissionError)
      .mockResolvedValueOnce(faqs);

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "您沒有管理 FAQ 的權限。"
    );
    await user.click(screen.getByRole("button", { name: "重新載入" }));

    expect((await screen.findAllByText("第一題")).length).toBeGreaterThan(0);
    expect(getAdminFaqs).toHaveBeenCalledTimes(2);
  });

  it("區分無資料與篩選結果為空", async () => {
    const user = userEvent.setup();
    vi.mocked(getAdminFaqs).mockResolvedValueOnce([]);
    const { unmount } = renderPage();
    expect(await screen.findByText("尚未建立任何 FAQ")).toBeInTheDocument();

    unmount();
    vi.mocked(getAdminFaqs).mockResolvedValueOnce(faqs);
    renderPage();
    await screen.findAllByText("第一題");
    await user.type(screen.getByRole("searchbox", { name: "搜尋 FAQ" }), "不存在");

    expect(
      screen.getByText("沒有符合目前搜尋或篩選條件的 FAQ")
    ).toBeInTheDocument();
  });
});
