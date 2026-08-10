import { describe, it, expect } from "vitest";
import { toBlocks, toPayload } from "../exampleOutputBlocks";

describe("toBlocks", () => {
  it("converts a plain string into one text block", () => {
    expect(toBlocks("輸出結果")).toEqual([
      { type: "text", data: { context: "輸出結果", alt: "", caption: "" } },
    ]);
  });

  it("returns empty array for an empty string", () => {
    expect(toBlocks("")).toEqual([]);
  });

  it("returns empty array for a whitespace-only string", () => {
    expect(toBlocks("   ")).toEqual([]);
  });

  it("returns empty array for null and undefined", () => {
    expect(toBlocks(null)).toEqual([]);
    expect(toBlocks(undefined)).toEqual([]);
  });

  it("converts legacy outputText into a text block", () => {
    expect(toBlocks({ outputText: "說明", outputImages: [] })).toEqual([
      { type: "text", data: { context: "說明", alt: "", caption: "" } },
    ]);
  });

  it("converts legacy outputImages into image blocks after the text block", () => {
    const result = toBlocks({
      outputText: "說明",
      outputImages: [
        { url: "https://a.png", alt: "圖A", caption: "說明A" },
        { url: "https://b.png", alt: "", caption: "" },
      ],
    });

    expect(result).toEqual([
      { type: "text", data: { context: "說明", alt: "", caption: "" } },
      { type: "image", data: { context: "https://a.png", alt: "圖A", caption: "說明A" } },
      { type: "image", data: { context: "https://b.png", alt: "", caption: "" } },
    ]);
  });

  it("skips legacy images without a url", () => {
    const result = toBlocks({
      outputText: "",
      outputImages: [{ url: "", alt: "", caption: "" }],
    });

    expect(result).toEqual([]);
  });

  it("omits the text block when legacy outputText is empty", () => {
    const result = toBlocks({
      outputText: "",
      outputImages: [{ url: "https://a.png", alt: "", caption: "" }],
    });

    expect(result).toEqual([
      { type: "image", data: { context: "https://a.png", alt: "", caption: "" } },
    ]);
  });

  it("passes an existing block array through, filling missing optional fields", () => {
    const result = toBlocks([
      { type: "text", data: { context: "文字" }, seq: 0 },
      { type: "video", data: { context: "https://v.mp4", caption: "影片" }, seq: 1 },
    ]);

    expect(result).toEqual([
      { type: "text", data: { context: "文字", alt: "", caption: "" } },
      { type: "video", data: { context: "https://v.mp4", alt: "", caption: "影片" } },
    ]);
  });

  it("converts legacy outputImages with video URLs into video blocks", () => {
    const result = toBlocks({
      outputText: "",
      outputImages: [{ url: "https://example.com/demo.mp4", alt: "影片", caption: "範例" }],
    });

    expect(result).toEqual([
      { type: "video", data: { context: "https://example.com/demo.mp4", alt: "影片", caption: "範例" } },
    ]);
  });

  it("normalizes an existing image block containing a video URL to video type", () => {
    const result = toBlocks([
      { type: "image", data: { context: "https://example.com/demo.mp4", alt: "影片", caption: "範例" }, seq: 0 },
    ]);

    expect(result).toEqual([
      { type: "video", data: { context: "https://example.com/demo.mp4", alt: "影片", caption: "範例" } },
    ]);
  });

  it("returns empty array for unsupported values", () => {
    expect(toBlocks(42)).toEqual([]);
    expect(toBlocks({})).toEqual([]);
  });
});

describe("toPayload", () => {
  it("assigns seq from array order", () => {
    const result = toPayload([
      { type: "text", data: { context: "一", alt: "", caption: "" } },
      { type: "text", data: { context: "二", alt: "", caption: "" } },
    ]);

    expect(result.map((b) => b.seq)).toEqual([0, 1]);
  });

  it("drops alt and caption from text blocks", () => {
    const result = toPayload([
      { type: "text", data: { context: "文字", alt: "殘留", caption: "殘留" } },
    ]);

    expect(result).toEqual([{ type: "text", data: { context: "文字" }, seq: 0 }]);
  });

  it("keeps alt and caption on image and video blocks", () => {
    const result = toPayload([
      { type: "image", data: { context: "https://a.png", alt: "圖", caption: "說明" } },
      { type: "video", data: { context: "https://v.mp4", alt: "影", caption: "片" } },
      { type: "html", data: { context: "https://p.html", alt: "頁", caption: "面" } },
    ]);

    expect(result).toEqual([
      { type: "image", data: { context: "https://a.png", alt: "圖", caption: "說明" }, seq: 0 },
      { type: "video", data: { context: "https://v.mp4", alt: "影", caption: "片" }, seq: 1 },
      { type: "html", data: { context: "https://p.html" }, seq: 2 },
    ]);
  });

  it("keeps empty alt and caption as empty strings", () => {
    const result = toPayload([
      { type: "image", data: { context: "https://a.png", alt: "", caption: "" } },
    ]);

    expect(result).toEqual([
      { type: "image", data: { context: "https://a.png", alt: "", caption: "" }, seq: 0 },
    ]);
  });

  it("trims context", () => {
    const result = toPayload([
      { type: "text", data: { context: "  文字  ", alt: "", caption: "" } },
    ]);

    expect(result[0].data.context).toBe("文字");
  });

  it("returns empty array for an empty block list", () => {
    expect(toPayload([])).toEqual([]);
  });
});
