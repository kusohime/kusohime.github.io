/**
 * 中文：恢复 Quine 两版脚注的原始 a/b 标号。
 * English: Restore Quine's source edition sigla on labelled footnotes.
 *
 * Markdown keeps identifiers such as `fn-7a`, but remark-rehype normally
 * renders their visible references as one continuous sequence. This small
 * HAST transform changes only numeric-a/b identifiers and leaves ordinary and
 * generated inline footnotes untouched.
 */

function editionNote(identifier) {
  const match = String(identifier ?? "").match(/(?:^|-)fn-(\d+)([ab])$/i);
  if (!match) return null;
  const suffix = match[2].toLowerCase();
  return {
    label: `${match[1]}${suffix}`,
    edition: suffix === "a" ? "1951" : "1961",
  };
}

function editorialNote(identifier) {
  return /(?:^|-)fn-frege-book$/i.test(String(identifier ?? ""))
    ? { label: "編", edition: "editorial" }
    : null;
}

function classNames(properties) {
  const value = properties?.className;
  if (Array.isArray(value)) return [...value];
  return value ? [value] : [];
}

function hasEditionLabel(node) {
  return (node.children ?? []).some(
    (child) =>
      child.type === "element" &&
      child.tagName === "span" &&
      classNames(child.properties).includes("footnote-label"),
  );
}

export default function rehypeEditionFootnotes() {
  return (tree) => {
    const visit = (node) => {
      if (!Array.isArray(node.children)) return;

      if (node.type === "element") {
        const properties = node.properties ?? {};

        if (node.tagName === "a") {
          const isReference =
            properties.dataFootnoteRef !== undefined ||
            properties["data-footnote-ref"] !== undefined;
          const info = isReference
            ? editionNote(properties.href) ?? editorialNote(properties.href)
            : null;
          if (info) {
            node.children = [{ type: "text", value: info.label }];
            node.properties = {
              ...properties,
              "data-edition-note": info.edition,
            };
          }
        }

        if (node.tagName === "li") {
          const info = editionNote(properties.id) ?? editorialNote(properties.id);
          if (info) {
            node.properties = {
              ...properties,
              className: [
                ...classNames(properties),
                info.edition === "editorial"
                  ? "editorial-footnote"
                  : "edition-footnote",
              ],
              "data-edition-note": info.edition,
              "data-footnote-label": info.label,
            };

            const paragraph = node.children.find(
              (child) => child.type === "element" && child.tagName === "p",
            );
            if (paragraph && !hasEditionLabel(paragraph)) {
              paragraph.children.unshift(
                {
                  type: "element",
                  tagName: "span",
                  properties: {
                    className: ["footnote-label"],
                    "data-footnote-label": info.label,
                  },
                  children: [{ type: "text", value: info.label }],
                },
                { type: "text", value: " " },
              );
            }
          }
        }
      }

      node.children.forEach(visit);
    };

    visit(tree);
  };
}
