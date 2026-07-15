/** Render semantic emphasis containing Chinese as traditional underdots. */

const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/u;

function textOf(node) {
  if (node?.type === "text") return node.value;
  if (!Array.isArray(node?.children)) return "";
  return node.children.map(textOf).join("");
}

export default function rehypeChineseEmphasis() {
  return (tree) => {
    const visit = (node) => {
      if (node?.type === "raw" && typeof node.value === "string") {
        node.value = node.value.replace(
          /<em>([\s\S]*?)<\/em>/gu,
          (match, content) =>
            CJK_RE.test(content)
              ? `<span class="zh-em">${content}</span>`
              : match,
        );
      }

      if (!Array.isArray(node?.children)) return;

      if (
        node.type === "element" &&
        node.tagName === "em" &&
        CJK_RE.test(textOf(node))
      ) {
        node.tagName = "span";
        node.properties = {
          ...node.properties,
          className: [
            ...(Array.isArray(node.properties?.className)
              ? node.properties.className
              : []),
            "zh-em",
          ],
        };
      }

      node.children.forEach(visit);
    };

    visit(tree);
  };
}
