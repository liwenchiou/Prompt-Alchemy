import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FaqFormModal from "./FaqFormModal";

const editFaq = {
  id: "faq-1",
  question: "既有問題",
  answer: "既有答案",
  sortOrder: 3,
  isActive: false,
};

describe("FaqFormModal", () => {
  it("新增模式使用正確預設值與 dialog semantics", () => {
    render(<FaqFormModal onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "新增 FAQ" })).toHaveAttribute(
      "aria-modal",
      "true"
    );
    expect(screen.getByLabelText("排序序號 *")).toHaveValue(0);
    expect(screen.getByRole("switch", { name: "FAQ 發布狀態" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("編輯模式帶入既有資料", () => {
    render(
      <FaqFormModal faq={editFaq} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(screen.getByRole("dialog", { name: "編輯 FAQ" })).toBeInTheDocument();
    expect(screen.getByLabelText("問題 *")).toHaveValue("既有問題");
    expect(screen.getByLabelText("回答 *")).toHaveValue("既有答案");
    expect(screen.getByLabelText("排序序號 *")).toHaveValue(3);
    expect(screen.getByRole("switch", { name: "FAQ 發布狀態" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("阻擋空白問題、空白回答與不合法排序", async () => {
    const user = userEvent.setup();
    render(<FaqFormModal onClose={vi.fn()} onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("問題 *"), "   ");
    await user.type(screen.getByLabelText("回答 *"), "   ");
    const sortOrderInput = screen.getByLabelText("排序序號 *");
    await user.clear(sortOrderInput);
    await user.type(sortOrderInput, "-1");
    await user.click(screen.getByRole("button", { name: "儲存" }));

    expect(await screen.findByText("問題不可只包含空白")).toBeInTheDocument();
    expect(screen.getByText("回答不可只包含空白")).toBeInTheDocument();
    expect(
      screen.getByText("排序序號必須是大於或等於 0 的整數")
    ).toBeInTheDocument();
  });

  it("送出前 trim 文字、轉換排序並保留 boolean 狀態", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FaqFormModal onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("問題 *"), "  新問題  ");
    await user.type(screen.getByLabelText("回答 *"), "  新答案  ");
    const sortOrderInput = screen.getByLabelText("排序序號 *");
    await user.clear(sortOrderInput);
    await user.type(sortOrderInput, "4");
    await user.click(screen.getByRole("switch", { name: "FAQ 發布狀態" }));
    await user.click(screen.getByRole("button", { name: "儲存" }));

    expect(onSubmit).toHaveBeenCalledWith({
      question: "新問題",
      answer: "新答案",
      sortOrder: 4,
      isActive: false,
    });
  });

  it("提交期間停用操作並顯示儲存中", async () => {
    const user = userEvent.setup();
    let resolveSubmit;
    const onSubmit = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );
    render(
      <FaqFormModal faq={editFaq} onClose={vi.fn()} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole("button", { name: "儲存" }));

    expect(await screen.findByRole("button", { name: "儲存中…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "取消" })).toBeDisabled();

    resolveSubmit();
  });

  it("取消與關閉按鈕會呼叫 onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FaqFormModal onClose={onClose} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "關閉 FAQ 表單" }));
    await user.click(screen.getByRole("button", { name: "取消" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
