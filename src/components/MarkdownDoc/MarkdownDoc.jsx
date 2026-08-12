import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

function isAlignAttribute(attribute) {
  return (Array.isArray(attribute) ? attribute[0] : attribute) === "align";
}

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: Object.fromEntries(
    Object.entries(defaultSchema.attributes || {}).map(([tag, attributes]) => [
      tag,
      (attributes || []).filter((attribute) => !isAlignAttribute(attribute)),
    ])
  ),
};

const REMARK_PLUGINS = [remarkFrontmatter, remarkGfm];

const REHYPE_PLUGINS = [rehypeRaw, [rehypeSanitize, SANITIZE_SCHEMA]];

// GitHub 顯示檔案時會拿檔案自己的路徑當基準把相對路徑接成完整網址

function resolveRelativeUrl(url, baseUrl) {
  if (!url || !baseUrl) return url;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function resolveSrcSet(srcSet, baseUrl) {
  if (!srcSet || !baseUrl) return srcSet;
  return srcSet
    .split(",")
    .map((entry) => {
      const [url, descriptor] = entry.trim().split(/\s+/, 2);
      return [resolveRelativeUrl(url, baseUrl), descriptor]
        .filter(Boolean)
        .join(" ");
    })
    .join(", ");
}

// baseUrl 傳這份文件自己的 raw 網址，用來把內文裡的相對路徑圖片／連結接成完整網址。

export default function MarkdownDoc({ content, baseUrl }) {
  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={{
        img: ({ src, ...props }) => (
          <img src={resolveRelativeUrl(src, baseUrl)} {...props} />
        ),
        source: ({ srcSet, ...props }) => (
          <source srcSet={resolveSrcSet(srcSet, baseUrl)} {...props} />
        ),
        a: ({ href, ...props }) => (
          <a href={resolveRelativeUrl(href, baseUrl)} {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
