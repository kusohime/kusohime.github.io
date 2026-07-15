/**
 * 中文：把 Quine Markdown 中标有版本标题的 blockquote 转为中性的版本面板。
 * English: Turn edition-labelled Markdown blockquotes into neutral edition
 * panels, preserving ordinary quotations elsewhere in the site.
 */

const EDITION_RE = /^(1951|1961) 年版$/;

function classNames(properties) {
  const value = properties?.className;
  if (Array.isArray(value)) return [...value];
  return value ? [value] : [];
}

function textOf(node) {
  if (node?.type === "text") return node.value;
  if (!Array.isArray(node?.children)) return "";
  return node.children.map(textOf).join("");
}

function editionLabel(node) {
  if (node?.type !== "element" || node.tagName !== "blockquote") return null;
  const first = node.children?.find(
    (child) => child.type === "element" && child.tagName === "p",
  );
  const strong = first?.children?.find(
    (child) => child.type === "element" && child.tagName === "strong",
  );
  const match = EDITION_RE.exec(textOf(strong).trim());
  return match?.[1] ?? null;
}

function makeLabel(text, edition, single) {
  return {
    type: "element",
    tagName: "span",
    properties: {
      className: ["edition-source-label"],
      "data-edition-label": edition,
    },
    children: [{ type: "text", value: single ? `${edition} only` : text }],
  };
}

function transformBlockquote(node, edition) {
  const firstParagraphIndex = node.children.findIndex(
    (child) => child.type === "element" && child.tagName === "p",
  );
  const bodyChildren =
    firstParagraphIndex >= 0
      ? node.children.filter((_, index) => index !== firstParagraphIndex)
      : node.children;

  node.tagName = "div";
  node.properties = {
    ...node.properties,
    className: [
      ...classNames(node.properties).filter((name) => name !== "blockquote"),
      "edition-panel",
    ],
    "data-edition-panel": edition,
  };
  node.children = [
    makeLabel(`${edition}`, edition, false),
    {
      type: "element",
      tagName: "div",
      properties: { className: ["edition-panel-content"] },
      children: bodyChildren,
    },
  ];
  return node;
}

function markSingles(children) {
  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    if (node?.type !== "element" || node.tagName !== "div") continue;
    const edition = node.properties?.["data-edition-panel"];
    if (edition !== "1951" && edition !== "1961") continue;

    let nextIndex = index + 1;
    while (
      nextIndex < children.length &&
      children[nextIndex]?.type === "text" &&
      !children[nextIndex].value.trim()
    ) {
      nextIndex += 1;
    }
    const next = children[nextIndex];
    const isPair =
      next?.type === "element" &&
      next.tagName === "div" &&
      next.properties?.["data-edition-panel"] === "1961" &&
      edition === "1951";

    if (isPair) {
      node.properties["data-edition-paired"] = "true";
      next.properties["data-edition-paired"] = "true";
      index = nextIndex;
      continue;
    }

    node.properties["data-edition-single"] = edition;
  }
}

export default function rehypeEditionVariants() {
  return (tree) => {
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;

      for (let index = 0; index < node.children.length; index += 1) {
        const child = node.children[index];
        const edition = editionLabel(child);
        if (edition) node.children[index] = transformBlockquote(child, edition);
      }

      node.children.forEach(walk);
      markSingles(node.children);
    };

    walk(tree);
  };
}
