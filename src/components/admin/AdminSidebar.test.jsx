import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

vi.mock("../../api/adminApi", () => ({
  logoutAdmin: vi.fn(),
}));

vi.mock("../../utils/sweetAlert", () => ({
  alertHelper: { confirm: vi.fn() },
}));

describe("AdminSidebar", () => {
  it("顯示 FAQ 管理連結並指向正確路由", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminSidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "FAQ 管理" })).toHaveAttribute(
      "href",
      "/admin/faqs"
    );
  });

  it("位於 FAQ 管理頁時套用 active 樣式", () => {
    render(
      <MemoryRouter initialEntries={["/admin/faqs"]}>
        <AdminSidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "FAQ 管理" })).toHaveClass(
      "bg-indigo-50",
      "text-indigo-700"
    );
  });
});
