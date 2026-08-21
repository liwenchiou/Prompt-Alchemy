import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventBus } from "../../utils/eventBus";
import apiClient from "../apiClient";

describe("登出與 401 Token 逾期事件測試", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("一般 API 請求遇到 401 應觸發 auth:expired 事件並清除本地狀態", async () => {
    const expiredHandler = vi.fn();
    const unsubscribe = eventBus.on("auth:expired", expiredHandler);

    localStorage.setItem("token", "fake-expired-token");
    localStorage.setItem("user", JSON.stringify({ name: "Test" }));

    // 模擬一般 API 401
    const mockError = {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
      config: {
        url: "/favorites",
      },
    };

    // 觸發 apiClient 攔截器處理 401
    const interceptor = apiClient.interceptors.response.handlers[0].rejected;
    try {
      await interceptor(mockError);
    } catch (_e) {
      // expected error rejection
    }

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(expiredHandler).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("呼叫 /auth/logout API 遇到 401 不應觸發 auth:expired 逾期事件", async () => {
    const expiredHandler = vi.fn();
    const unsubscribe = eventBus.on("auth:expired", expiredHandler);

    localStorage.setItem("token", "fake-token");

    const mockError = {
      response: {
        status: 401,
        data: { message: "Logout status 401" },
      },
      config: {
        url: "/auth/logout",
        skipAuthExpired: true,
      },
    };

    const interceptor = apiClient.interceptors.response.handlers[0].rejected;
    try {
      await interceptor(mockError);
    } catch (_e) {
      // expected
    }

    expect(localStorage.getItem("token")).toBeNull();
    expect(expiredHandler).not.toHaveBeenCalled();

    unsubscribe();
  });
});
