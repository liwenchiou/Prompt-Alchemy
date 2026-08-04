import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "../storage";

describe("storage utility (localStorage wrapper)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should set and get items from localStorage", () => {
    const data = { user: "test", role: "admin" };
    expect(storage.set("user_info", data)).toBe(true);
    expect(storage.get("user_info")).toEqual(data);
  });

  it("should return default value when key does not exist", () => {
    expect(storage.get("non_existent_key", "default")).toBe("default");
  });

  it("should remove item from localStorage", () => {
    storage.set("temp_key", "temp_value");
    expect(storage.get("temp_key")).toBe("temp_value");
    expect(storage.remove("temp_key")).toBe(true);
    expect(storage.get("temp_key")).toBeNull();
  });

  it("should clear all items in localStorage", () => {
    storage.set("key1", "val1");
    storage.set("key2", "val2");
    expect(storage.clear()).toBe(true);
    expect(storage.get("key1")).toBeNull();
    expect(storage.get("key2")).toBeNull();
  });
});
