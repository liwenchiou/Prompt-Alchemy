import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import * as adminApi from "../api/adminApi";
import * as apiClient from "../api/apiClient";

vi.mock("../api/adminApi", () => ({
  getAdminAuth: vi.fn(),
  logoutAdmin: vi.fn(),
}));

vi.mock("../api/apiClient", () => ({
  apiRequest: vi.fn(),
}));

describe("ProtectedRoute 元件測試", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("當無 adminAuth 或 token 時，導向至 /admin/login", async () => {
    vi.mocked(adminApi.getAdminAuth).mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/login" element={<div>管理者登入頁面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<div>後台儀表板</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("管理者登入頁面")).toBeInTheDocument();
    });
    expect(adminApi.logoutAdmin).toHaveBeenCalled();
  });

  it("當 token 有效且 role 為 admin 時放行，渲染 Outlet 子路由", async () => {
    vi.mocked(adminApi.getAdminAuth).mockReturnValue({ email: "admin@example.com" });
    localStorage.setItem("token", "valid-admin-token");
    vi.mocked(apiClient.apiRequest).mockResolvedValue({
      status: "success",
      user: { id: "admin-id", role: "admin" },
    });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/login" element={<div>管理者登入頁面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<div>後台儀表板</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("後台儀表板")).toBeInTheDocument();
    });
    expect(screen.queryByText("管理者登入頁面")).toBeNull();
  });

  it("當 token 有效但 role 非 admin 時，呼叫 logoutAdmin 並導向至 /admin/login", async () => {
    vi.mocked(adminApi.getAdminAuth).mockReturnValue({ email: "user@example.com" });
    localStorage.setItem("token", "user-token");
    vi.mocked(apiClient.apiRequest).mockResolvedValue({
      status: "success",
      user: { id: "user-id", role: "member" },
    });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/login" element={<div>管理者登入頁面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<div>後台儀表板</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("管理者登入頁面")).toBeInTheDocument();
    });
    expect(adminApi.logoutAdmin).toHaveBeenCalled();
  });
});
