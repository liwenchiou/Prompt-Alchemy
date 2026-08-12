import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownDoc from "./MarkdownDoc";

describe("MarkdownDoc — YAML frontmatter 不應該被誤渲染成內容", () => {
  const content =
    "---\nname: frontend-design\ndescription: 設計相關 Skill\n---\n\n# 真正的標題\n\n內文段落。";

  it("frontmatter 的 name/description 不會出現在渲染內容裡", () => {
    const { container } = render(<MarkdownDoc content={content} />);

    expect(container.textContent).not.toMatch(/name:\s*frontend-design/);
    expect(container.textContent).not.toContain("description: 設計相關 Skill");
    expect(container.textContent).not.toContain("---");
  });

  it("frontmatter 後面的第一個標題正確渲染成 h1，大小不受影響", () => {
    render(<MarkdownDoc content={content} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "真正的標題" })
    ).toBeInTheDocument();
  });

  it("沒有 frontmatter 的一般 Markdown 內容照常渲染", () => {
    render(<MarkdownDoc content={"## 一般標題\n\n一般段落。"} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "一般標題" })
    ).toBeInTheDocument();
    expect(screen.getByText("一般段落。")).toBeInTheDocument();
  });
});

describe("MarkdownDoc — 相對路徑圖片／連結要用 baseUrl 接成完整網址", () => {
  const baseUrl =
    "https://raw.githubusercontent.com/Wcc723/social-image-kit/main/README.md";

  it("markdown 圖片語法的相對路徑，用 baseUrl 接成完整網址", () => {
    const { container } = render(
      <MarkdownDoc
        content={"![Slide 01](examples/slide-01@1x.png)"}
        baseUrl={baseUrl}
      />
    );

    const img = container.querySelector("img");
    expect(img.getAttribute("src")).toBe(
      "https://raw.githubusercontent.com/Wcc723/social-image-kit/main/examples/slide-01@1x.png"
    );
  });

  it("沒有 baseUrl 時，相對路徑原樣通過（不噴錯）", () => {
    const { container } = render(
      <MarkdownDoc content={"![Slide 01](examples/slide-01@1x.png)"} />
    );

    expect(container.querySelector("img").getAttribute("src")).toBe(
      "examples/slide-01@1x.png"
    );
  });

  it("已經是絕對網址的圖片不受影響", () => {
    const { container } = render(
      <MarkdownDoc
        content={"![Slide 01](https://example.com/slide-01.png)"}
        baseUrl={baseUrl}
      />
    );

    expect(container.querySelector("img").getAttribute("src")).toBe(
      "https://example.com/slide-01.png"
    );
  });

  it("raw HTML <picture>/<source srcset> 的相對路徑也一併接成完整網址", () => {
    const { container } = render(
      <MarkdownDoc
        content={
          '<picture><source srcset="examples/slide-01@2x.png 2x, examples/slide-01@1x.png 1x"><img src="examples/slide-01@1x.png" alt="Slide 01"></picture>'
        }
        baseUrl={baseUrl}
      />
    );

    expect(container.querySelector("source").getAttribute("srcset")).toBe(
      "https://raw.githubusercontent.com/Wcc723/social-image-kit/main/examples/slide-01@2x.png 2x, https://raw.githubusercontent.com/Wcc723/social-image-kit/main/examples/slide-01@1x.png 1x"
    );
  });
});
