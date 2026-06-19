/**
 * 中文：支持行内脚注 `^[注释内容]`——自动编号，收集到页脚，和已有的 `[^id]` 脚注共存。
 * English: Inline footnote support, `^[note text]` — auto-numbered, collected at the
 * page foot, and coexisting with the existing labelled `[^id]` footnotes.
 *
 * 注意 / Note: the note text is read as plain inline content. If a note needs a
 * parsed Markdown link or emphasis, use the labelled `[^id]` style instead — the
 * CommonMark parser splits such markup into separate nodes before this runs.
 */
import { visit } from "unist-util-visit";
import { fromMarkdown } from "mdast-util-from-markdown";

// 从 `from` 起在文本中找到一个括号平衡的 `^[...]`。
// Find one bracket-balanced `^[...]` in the text, starting at `from`.
function findInlineFootnote(value, from) {
  const caret = value.indexOf("^[", from);
  if (caret < 0) return null;
  let depth = 0;
  for (let i = caret + 1; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return { start: caret, end: i + 1, inner: value.slice(caret + 2, i) };
      }
    }
  }
  return null;
}

export default function remarkInlineFootnotes() {
  return (tree) => {
    let counter = 0;
    const definitions = [];

    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (!node.value.includes("^[")) return;

      const replacement = [];
      let cursor = 0;
      let found = false;

      for (;;) {
        const hit = findInlineFootnote(node.value, cursor);
        if (!hit) break;
        found = true;
        if (hit.start > cursor) {
          replacement.push({ type: "text", value: node.value.slice(cursor, hit.start) });
        }
        counter += 1;
        const identifier = `inline-fn-${counter}`;
        replacement.push({ type: "footnoteReference", identifier, label: identifier });
        const inner = fromMarkdown(hit.inner.trim());
        definitions.push({
          type: "footnoteDefinition",
          identifier,
          label: identifier,
          children: inner.children,
        });
        cursor = hit.end;
      }

      if (!found) return;
      if (cursor < node.value.length) {
        replacement.push({ type: "text", value: node.value.slice(cursor) });
      }
      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });

    if (definitions.length > 0) {
      tree.children.push(...definitions);
    }
  };
}
