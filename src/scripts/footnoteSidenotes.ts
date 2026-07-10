/**
 * 中文：脚注边注实验——把脚注标记改成红色括号 (n)，并把脚注内容复制到段落右侧空白。
 * English: Footnote sidenote experiment — render the in-text marker as a red
 * parenthetical (n) and clone each footnote's content beside its paragraph.
 *
 * 排版：宽屏时内容浮到右栏边空白；窄屏退化为行内红色括注。底部脚注列表在屏幕上
 * 隐藏（内容已搬到正文旁），但打印时保留——具体样式都在 global.css。
 * Layout: on wide screens the note floats into the right margin; on narrow screens
 * it falls back to an inline red parenthetical. The bottom list is hidden on screen
 * (its content now sits beside the text) but kept for print — all styling lives in
 * global.css under the "footnote sidenote experiment" block.
 */

// 把脚注定义的块级内容（通常是一个 <p>）摊平成行内节点，便于放进 <span>。
// Flatten a footnote definition's block content (usually one <p>) into inline
// nodes so it can live inside a phrasing-content <span>.
function inlineNoteContent(item: HTMLElement): Node[] {
  const clone = item.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("a[data-footnote-backref]")
    .forEach((backref) => backref.remove());

  const nodes: Node[] = [];
  clone.childNodes.forEach((child) => {
    if (child instanceof HTMLParagraphElement) {
      nodes.push(...Array.from(child.childNodes));
    } else {
      nodes.push(child);
    }
  });
  return nodes;
}

// 中文：双语正文（.lang-block）时每个语言块各有一份脚注列表，须按块处理，
// 否则第二个块的标记在第一个块的列表里查不到内容。
// English: A bilingual body (.lang-block) carries one footnote list per language
// block, so each block is enhanced in its own scope — otherwise the second
// block's refs never match ids collected from the first block's list.
function enhanceScope(scope: HTMLElement, prose: HTMLElement): void {
  const section = scope.querySelector<HTMLElement>(
    "section.footnotes, [data-footnotes]",
  );
  if (!section) return;

  const contentById = new Map<string, Node[]>();
  section.querySelectorAll<HTMLLIElement>("li[id]").forEach((item) => {
    contentById.set(item.id, inlineNoteContent(item));
  });

  const refs = scope.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]");
  const disableJumpLinks = prose.closest(".writing-title-page") !== null;
  let placed = 0;

  refs.forEach((ref) => {
    const marker = ref.closest("sup");
    const targetId = decodeURIComponent(
      (ref.getAttribute("href") ?? "").replace(/^#/, ""),
    );
    const content = contentById.get(targetId);
    if (!marker || !content) return;

    // 标记：红色括号 (n)，样式在 CSS。Marker becomes a red "(n)" via CSS.
    marker.classList.add("fn-ref");
    if (disableJumpLinks) {
      ref.removeAttribute("href");
      ref.removeAttribute("id");
    }

    // 边注：行内 <span>，宽屏浮到右侧。Inline span; floats right on wide screens.
    const sidenote = document.createElement("span");
    sidenote.className = "sidenote";
    sidenote.setAttribute("role", "note");

    const number = document.createElement("sup");
    number.className = "sidenote-num";
    number.textContent = ref.textContent?.trim() ?? "";
    sidenote.append(number);
    content.forEach((node) => sidenote.append(node.cloneNode(true)));

    marker.after(sidenote);
    placed += 1;
  });

  if (placed > 0) prose.classList.add("has-sidenotes");
}

function enhanceProse(prose: HTMLElement): void {
  const blocks = prose.querySelectorAll<HTMLElement>(":scope > .lang-block");
  if (blocks.length > 0) {
    blocks.forEach((block) => enhanceScope(block, prose));
  } else {
    enhanceScope(prose, prose);
  }
}

export function initializeFootnoteSidenotes(): void {
  document
    .querySelectorAll<HTMLElement>(".prose")
    .forEach((prose) => enhanceProse(prose));
}
