import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const ProblemChild = () => {
  throw new Error("測試拋出的崩潰錯誤");
};

describe("ErrorBoundary 元件測試", () => {
  it("當無錯誤時正常渲染子元件", () => {
    render(
      <ErrorBoundary>
        <div>正常內容</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("正常內容")).toBeInTheDocument();
  });

  it("當子元件拋錯時渲染備用 UI 與錯誤訊息", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("系統存取發生異常")).toBeInTheDocument();
    expect(screen.getByText("測試拋出的崩潰錯誤")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新載入頁面" })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
