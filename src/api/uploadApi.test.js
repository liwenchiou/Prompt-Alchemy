import { describe, it, expect, vi, beforeEach } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("./apiClient", () => ({
  default: { post: postMock },
}));

import { uploadFile } from "./uploadApi";

describe("uploadFile", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("以 multipart form-data 帶 file 欄位打 /utility/upload，回傳 data.url", async () => {
    postMock.mockResolvedValue({
      status: "success",
      message: "檔案上傳成功",
      data: { url: "https://storage.googleapis.com/my-bucket/123456789-1234.png" },
    });
    const file = new File(["x"], "abc.png", { type: "image/png" });

    const url = await uploadFile(file);

    expect(url).toBe("https://storage.googleapis.com/my-bucket/123456789-1234.png");
    expect(postMock).toHaveBeenCalledTimes(1);
    const [endpoint, formData] = postMock.mock.calls[0];
    expect(endpoint).toBe("/utility/upload");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
  });

  it("後端回傳缺少 url 時丟出錯誤", async () => {
    postMock.mockResolvedValue({ status: "success", data: {} });
    const file = new File(["x"], "abc.png", { type: "image/png" });

    await expect(uploadFile(file)).rejects.toThrow();
  });
});
