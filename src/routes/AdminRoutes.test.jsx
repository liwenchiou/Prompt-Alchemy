import { describe, expect, it } from "vitest";
import AdminLayout from "../layouts/AdminLayout";
import AdminFaqs from "../pages/admin/AdminFaqs";
import adminRoutes from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoute";

describe("AdminRoutes", () => {
  it("將 FAQ 管理頁註冊在 ProtectedRoute 與 AdminLayout 之下", () => {
    const protectedRoute = adminRoutes.children.find(
      (route) => route.element?.type === ProtectedRoute
    );
    const layoutRoute = protectedRoute.children.find(
      (route) => route.element?.type === AdminLayout
    );
    const faqRoute = layoutRoute.children.find((route) => route.path === "faqs");

    expect(protectedRoute).toBeDefined();
    expect(layoutRoute).toBeDefined();
    expect(faqRoute).toBeDefined();
    expect(faqRoute.element.type).toBe(AdminFaqs);
  });
});
