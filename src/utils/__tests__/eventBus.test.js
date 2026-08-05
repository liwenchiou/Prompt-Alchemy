import { describe, it, expect, vi } from "vitest";
import { eventBus } from "../eventBus";

describe("EventBus 模組測試", () => {
  it("成功訂閱與發佈事件", () => {
    const callback = vi.fn();
    const unsubscribe = eventBus.on("test-event", callback);

    eventBus.emit("test-event", { payload: 123 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ payload: 123 });

    unsubscribe();
  });

  it("取消訂閱後不再接收事件通知", () => {
    const callback = vi.fn();
    const unsubscribe = eventBus.on("test-event-unsub", callback);

    unsubscribe();
    eventBus.emit("test-event-unsub", "data");

    expect(callback).not.toHaveBeenCalled();
  });

  it("當 Listener 內部拋錯時不影響其他 Listener 執行", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const badCallback = vi.fn().mockImplementation(() => {
      throw new Error("Callback error");
    });
    const goodCallback = vi.fn();

    eventBus.on("error-event", badCallback);
    eventBus.on("error-event", goodCallback);

    eventBus.emit("error-event", "test");

    expect(badCallback).toHaveBeenCalled();
    expect(goodCallback).toHaveBeenCalledWith("test");

    errorSpy.mockRestore();
  });
});
