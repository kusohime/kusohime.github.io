/**
 * 中文：作者—年份引注链接。当文档含「参考文献／參考文獻／References」标题时：
 *   1. 标题后的每个段落视为一条文献，编上 id 并加 .reference-entry 类
 *      （样式：取消首行缩进、改悬挂缩进，见 global.css）；
 *   2. 正文（含脚注）里的全角方括号引注（如 ［山田 2017：22］、图里诺［2015］）
 *      按「姓氏＋年份」匹配文献条目，包成指向该条目的 .citation-link 红色链接。
 * 匹配时做简繁／日文变体折叠（泽→澤 等），并支持少量音译别名（图里诺→トゥリノ）。
 * 没有参考文献标题的文档完全不受影响。
 *
 * English: Author–year citation links. When a document has a References heading
 * (参考文献 / 參考文獻 / References), every following paragraph becomes a
 * reference entry (id + .reference-entry class for hanging-indent styling), and
 * full-width bracketed citations in the body and footnotes — ［山田 2017：22］,
 * narrative 图里诺［2015］ — are matched by surname + year and wrapped in red
 * .citation-link anchors pointing at the entry. Matching folds script variants
 * (泽→澤 …) and knows a few transliteration aliases (图里诺→トゥリノ).
 * Documents without a references heading are left untouched.
 */

const REFS_HEADING = /^(参考文献|參考文獻|references|bibliography|參考書目)$/i;
const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const YEAR = /(1[6-9]\d{2}|20\d{2})[a-z]?/g;
// 连续的破折号开头 ⇒ 与上一条同作者（“———”式条目）。
// Leading dashes ⇒ same author as the previous entry ("———" style).
const DITTO = /^[—―－‐\-–.．\s]+/;

// 简体／异体 → 文献条目所用字形。仅收本站文献实际需要的少量映射。
// Simplified/variant → the form used in reference entries; a small, curated map.
const CHAR_FOLD = {
  泽: "澤", 译: "譯", 岛: "島", 寻: "尋", 丰: "豊", 沢: "澤",
  冈: "岡", 龙: "龍", 泷: "瀧", 边: "邊", 荣: "榮", 儿: "児",
};

// 中文音译 → 文献作者原文（假名等）。用于「图里诺［2015］」式叙述引注。
// Chinese transliterations → the author's original form, for narrative citations.
const ALIASES = {
  图里诺: "トゥリノ", 圖里諾: "トゥリノ",
  斯莫尔: "スモール", 斯莫爾: "スモール",
  契克森米哈赖: "チクセントミハイ", 契克森米哈賴: "チクセントミハイ",
  诺瓦克: "ノヴァック", 諾瓦克: "ノヴァック",
  戈夫曼: "ゴッフマン",
};

const CJK_RUN = /[\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}ー・＝]+$/u;
const LATIN_RUN = /[A-Za-z][A-Za-z.\s,&＆'’()\-]*$/;
const NOISE_TOKENS = new Set([
  "e.g", "eg", "cf", "via", "et", "al", "als", "ed", "eds", "and", "see", "also",
  "参见", "亦参见", "參見", "亦參見", "等",
]);

function fold(text) {
  let out = "";
  for (const ch of text) out += CHAR_FOLD[ch] ?? ch;
  return out.toLowerCase().replace(/＆/g, "&").replace(/＝/g, "=");
}

function applyAliases(text) {
  let out = text;
  for (const [from, to] of Object.entries(ALIASES)) out = out.replaceAll(from, to);
  return out;
}

function tokenize(author) {
  return applyAliases(author)
    .split(/[,，、;；&=＝]|\s+|・/u)
    .map((t) => t.replace(/[.．()（）'’\-]+$/g, "").replace(/^[.．()（）'’\-]+/g, ""))
    .filter((t) => t.length > 1 || /\p{Script=Han}|\p{Script=Katakana}/u.test(t))
    .filter((t) => !NOISE_TOKENS.has(t.toLowerCase()))
    .filter(Boolean);
}

// CJK token 的宽松包含：全部字符按序出现即算命中（「川瀬編」⊂「川瀬慈編」）。
// Loose CJK containment: all chars appearing in order count as a hit.
function tokenMatches(token, candidate) {
  const t = fold(token);
  const c = fold(candidate);
  if (c.includes(t)) return true;
  if (!/[㐀-鿿぀-ヿ]/u.test(t) || [...t].length < 2) return false;
  let pos = 0;
  for (const ch of t) {
    pos = c.indexOf(ch, pos);
    if (pos < 0) return false;
    pos += 1;
  }
  return true;
}

function textOf(node) {
  if (node.type === "text") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(textOf).join("");
}

export default function rehypeCitationLinks() {
  return (tree) => {
    const rootChildren = tree.children ?? [];

    // 1. 找参考文献标题。 Locate the references heading.
    const headingIndex = rootChildren.findIndex(
      (node) =>
        node.type === "element" &&
        HEADINGS.has(node.tagName) &&
        REFS_HEADING.test(textOf(node).trim()),
    );
    if (headingIndex < 0) return;

    // 2. 收集其后的 <p> 作为条目，直到下一个标题。
    //    Collect following <p> entries until the next heading.
    const entries = [];
    const entryNodes = new Set();
    let lastAuthor = "";
    for (let i = headingIndex + 1; i < rootChildren.length; i += 1) {
      const node = rootChildren[i];
      if (node.type !== "element") continue;
      if (HEADINGS.has(node.tagName)) break;
      if (node.tagName !== "p") continue;
      const text = textOf(node).trim();
      if (!text || text.startsWith("（") || text.startsWith("(")) continue;
      YEAR.lastIndex = 0;
      const yearMatch = YEAR.exec(text);
      if (!yearMatch) continue;
      let author = text.slice(0, yearMatch.index).trim();
      // 空或全为破折号／句点 ⇒ 「———」式条目，沿用上一条作者。
      // Empty or only dashes/dots ⇒ a "———" entry; reuse the previous author.
      if (author.replace(DITTO, "") === "") author = lastAuthor;
      lastAuthor = author;
      const id = node.properties?.id ?? `ref-${entries.length + 1}`;
      node.properties = { ...node.properties, id };
      const className = Array.isArray(node.properties.className)
        ? node.properties.className
        : node.properties.className
          ? [node.properties.className]
          : [];
      if (!className.includes("reference-entry")) className.push("reference-entry");
      node.properties.className = className;
      entries.push({ author, year: yearMatch[0], id });
      entryNodes.add(node);
    }
    if (!entries.length) return;

    // 3. 「姓氏＋年份」匹配：同年候选按 token 命中数取最高；平手时取
    //    作者 token 数最接近引注的一条。
    //    Match surname + year; best token-hit count wins, ties resolved by the
    //    candidate whose author token count is closest to the citation's.
    const matchRef = (authorText, year) => {
      const aliased = applyAliases(authorText);
      const tokens = tokenize(authorText);
      if (!tokens.length) return undefined;
      const foldedCitation = fold(aliased);
      const candidates = entries.filter(
        (entry) => entry.year === year || entry.year.startsWith(year),
      );
      let best;
      let bestScore = 0;
      let bestDistance = Infinity;
      for (const candidate of candidates) {
        const candidateTokens = tokenize(candidate.author);
        // 正向：引注 token 出现在条目作者里；反向：条目作者出现在引注文字里
        // （叙述式引注前的行文会带无关字，如「另一位日译者野泽丰一」）。
        // Forward: citation tokens inside the entry author. Reverse: entry-author
        // tokens inside the citation run (narrative runs carry stray prose chars).
        const forward = tokens.filter((t) =>
          tokenMatches(t, applyAliases(candidate.author)),
        ).length;
        const reverse = candidateTokens.filter((ct) =>
          foldedCitation.includes(fold(ct)),
        ).length;
        const score = Math.max(forward, reverse);
        if (!score) continue;
        const distance = Math.abs(candidateTokens.length - tokens.length);
        if (score > bestScore || (score === bestScore && distance < bestDistance)) {
          best = candidate;
          bestScore = score;
          bestDistance = distance;
        }
      }
      return best;
    };

    // 从一段文字末尾提取「作者名」候选（先中日文，后西文）。
    // Trailing author-name candidate from a text run (CJK first, then Latin).
    const trailingAuthor = (text) => {
      const trimmed = text.replace(/[\s，,。.；;：:（(]+$/u, "");
      const cjk = CJK_RUN.exec(trimmed);
      if (cjk) return cjk[0];
      const latin = LATIN_RUN.exec(trimmed);
      if (!latin) return "";
      // 去掉行首的连接词与页码（via、cf.、罗马数字页码等），只留名字。
      // Drop leading connectors and page numerals (via, cf., roman folios).
      const words = latin[0].split(/[\s,，]+/);
      while (
        words.length &&
        (NOISE_TOKENS.has(words[0].toLowerCase().replace(/\.+$/, "")) ||
          /^[ivxlcdm]+\.?$/i.test(words[0]))
      ) {
        words.shift();
      }
      if (!words.length) return "";
      const start = latin[0].indexOf(words[0]);
      return latin[0].slice(start);
    };

    // 4. 处理一个全角括号内文：返回 hast 子节点数组。
    //    Process one ［…］ body; returns replacement hast nodes.
    const linkBracket = (inner, contextBefore) => {
      const nodes = [];
      let cursor = 0;
      let bracketAuthor = "";
      YEAR.lastIndex = 0;
      let match;
      while ((match = YEAR.exec(inner))) {
        const seg = inner.slice(cursor, match.index);
        let author = trailingAuthor(seg);
        let linkStart = match.index;
        if (author) {
          const at = inner.lastIndexOf(author, match.index);
          if (at >= cursor) linkStart = at;
          bracketAuthor = author;
        } else {
          // 裸年份：先用括号内前一个作者，再退回括号前的正文。
          // Bare year: previous author in this bracket, else the text before it.
          author = bracketAuthor || trailingAuthor(contextBefore);
        }
        const ref = author ? matchRef(author, match[0]) : undefined;
        if (ref) {
          if (linkStart > cursor) {
            nodes.push({ type: "text", value: inner.slice(cursor, linkStart) });
          }
          // 链接连同其后的页码（：22、：33–34、：xii 等）一起包住。
          // The anchor swallows the trailing page locator (：22, ：33–34, ：xii …).
          let linkEnd = match.index + match[0].length;
          const pages = inner
            .slice(linkEnd)
            .match(/^：[0-9ivxlcdm]+(?:[–\-—−][0-9ivxlcdm]+)?/i);
          if (pages) linkEnd += pages[0].length;
          nodes.push({
            type: "element",
            tagName: "a",
            properties: { href: `#${ref.id}`, className: ["citation-link"] },
            children: [{ type: "text", value: inner.slice(linkStart, linkEnd) }],
          });
          cursor = linkEnd;
        }
      }
      if (!nodes.length) return undefined;
      if (cursor < inner.length) {
        nodes.push({ type: "text", value: inner.slice(cursor) });
      }
      return nodes;
    };

    // 5. 全文扫描（跳过文献条目本身、链接与代码）。
    //    Scan the whole tree, skipping entries themselves, links, and code.
    const SKIP_TAGS = new Set(["a", "code", "pre", "script", "style"]);
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;
      if (node.type === "element" && SKIP_TAGS.has(node.tagName)) return;
      if (entryNodes.has(node)) return;
      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        if (child.type !== "text") {
          walk(child);
          continue;
        }
        if (!child.value.includes("［")) continue;
        const parts = child.value.split(/(［[^］]*］)/);
        if (parts.length < 2) continue;
        const replacement = [];
        let changed = false;
        for (let p = 0; p < parts.length; p += 1) {
          const part = parts[p];
          if (part.startsWith("［") && part.endsWith("］")) {
            const inner = part.slice(1, -1);
            const contextBefore = parts.slice(0, p).join("");
            const linked = linkBracket(inner, contextBefore);
            if (linked) {
              // 整个括号（含括号本身与页码）包进 .citation，统一变灰、缩小。
              // The whole bracket, brackets and pages included, wraps in
              // .citation for the gray, slightly smaller rendering.
              replacement.push({
                type: "element",
                tagName: "span",
                properties: { className: ["citation"] },
                children: [
                  { type: "text", value: "［" },
                  ...linked,
                  { type: "text", value: "］" },
                ],
              });
              changed = true;
              continue;
            }
          }
          if (part) replacement.push({ type: "text", value: part });
        }
        if (changed) {
          node.children.splice(i, 1, ...replacement);
          i += replacement.length - 1;
        }
      }
    };
    walk(tree);
  };
}
