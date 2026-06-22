/**
 * 中文：支持行内脚注 `^[注释内容]`——自动编号，收集到页脚，和已有的 `[^id]` 脚注共存。
 * 注释内容里可以放链接和强调：CommonMark 会先把 `[文字](网址)`、`*强调*` 解析成独立
 * 节点，所以本插件在父节点层面扫描，跨兄弟节点收集 `^[` 与配对 `]` 之间的所有行内
 * 节点，整体搬进脚注定义，从而保留已解析的链接／强调。
 *
 * English: Inline footnote support, `^[note text]` — auto-numbered, collected at the
 * page foot, and coexisting with the existing labelled `[^id]` footnotes. The note
 * text may contain links and emphasis: CommonMark parses `[text](url)` / `*em*` into
 * their own nodes first, so this plugin scans at the parent level and gathers every
 * inline node between `^[` and its matching `]` across siblings, moving them whole
 * into the footnote definition — keeping the already-parsed link/emphasis intact.
 */

// 在文本中从 `from` 起找一个深度平衡的 `]`（用于处理注释里嵌套的方括号）。
// Find a depth-balanced `]` in a text value, starting at `from` (handles nested [ ]).
function findCloser(value, from) {
  let depth = 0;
  for (let i = from; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      if (depth === 0) return i;
      depth -= 1;
    }
  }
  return -1;
}

function trimEdgeText(nodes) {
  if (nodes.length && nodes[0].type === "text") {
    nodes[0] = { ...nodes[0], value: nodes[0].value.replace(/^\s+/, "") };
  }
  const last = nodes.length - 1;
  if (last >= 0 && nodes[last].type === "text") {
    nodes[last] = { ...nodes[last], value: nodes[last].value.replace(/\s+$/, "") };
  }
  return nodes.filter((node) => !(node.type === "text" && node.value === ""));
}

export default function remarkInlineFootnotes() {
  return (tree) => {
    let counter = 0;
    const definitions = [];

    const makeReference = (contentNodes) => {
      counter += 1;
      const identifier = `inline-fn-${counter}`;
      definitions.push({
        type: "footnoteDefinition",
        identifier,
        label: identifier,
        children: [{ type: "paragraph", children: trimEdgeText(contentNodes) }],
      });
      return { type: "footnoteReference", identifier, label: identifier };
    };

    const processChildren = (parent) => {
      const children = parent.children;
      for (let i = 0; i < children.length; i += 1) {
        const node = children[i];
        if (node.type !== "text") continue;
        const open = node.value.indexOf("^[");
        if (open < 0) continue;

        const before = node.value.slice(0, open);
        const afterOpen = node.value.slice(open + 2);

        // Case 1: the matching `]` is inside the same text node (no inner markup).
        const sameNodeCloser = findCloser(afterOpen, 0);
        if (sameNodeCloser >= 0) {
          const innerText = afterOpen.slice(0, sameNodeCloser);
          const rest = afterOpen.slice(sameNodeCloser + 1);
          const reference = makeReference(
            innerText ? [{ type: "text", value: innerText }] : [],
          );
          const replacement = [];
          if (before) replacement.push({ type: "text", value: before });
          replacement.push(reference);
          if (rest) replacement.push({ type: "text", value: rest });
          children.splice(i, 1, ...replacement);
          // Don't reposition i: the rest-text (the last inserted node) may hold
          // another `^[`, and the loop's own i++ walks into it next.
          continue;
        }

        // Case 2: the note spans siblings (it contains a link/emphasis/etc.).
        const content = [];
        if (afterOpen) content.push({ type: "text", value: afterOpen });
        let j = i + 1;
        let tail = "";
        let closed = false;
        for (; j < children.length; j += 1) {
          const sib = children[j];
          if (sib.type === "text") {
            const closer = findCloser(sib.value, 0);
            if (closer >= 0) {
              const innerText = sib.value.slice(0, closer);
              tail = sib.value.slice(closer + 1);
              if (innerText) content.push({ type: "text", value: innerText });
              closed = true;
              break;
            }
          }
          content.push(sib);
        }

        if (!closed) continue; // Unbalanced `^[` — leave the source untouched.

        const reference = makeReference(content);
        const replacement = [];
        if (before) replacement.push({ type: "text", value: before });
        replacement.push(reference);
        if (tail) replacement.push({ type: "text", value: tail });
        children.splice(i, j - i + 1, ...replacement);
        // Leave i alone — i++ moves to the reference/tail we just inserted, and
        // the tail may begin the next `^[`.
      }
    };

    // 自己递归遍历：先处理本层 `^[…]`，再深入子节点（脚注可嵌在强调等内部）。
    // Walk manually: process this level's `^[…]`, then recurse (a note can sit
    // inside emphasis, etc.). Skip the definitions appended at the very end.
    const walk = (node) => {
      if (!Array.isArray(node.children) || node.children.length === 0) return;
      processChildren(node);
      for (const child of node.children) walk(child);
    };
    walk(tree);

    if (definitions.length > 0) {
      tree.children.push(...definitions);
    }
  };
}
