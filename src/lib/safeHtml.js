/*
 * Shared escaping and tiny inline-Markdown rendering for trusted site copy.
 * Raw HTML is always escaped before links/emphasis are reintroduced.
 */

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function safeHref(value, { allowHash = true, allowRelative = true } = {}) {
  const href = String(value ?? "").trim();
  const allowed = [
    /^https?:\/\//i,
    /^mailto:/i,
    ...(allowRelative ? [/^\//] : []),
    ...(allowHash ? [/^#/] : []),
  ].some((pattern) => pattern.test(href));

  return allowed ? href : null;
}

export function renderSafeInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
      const href = safeHref(url);
      if (!href) return match;
      const external = /^https?:\/\//i.test(href);
      const extra = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${extra}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function inlineMarkdownToPlainText(text) {
  return String(text ?? "")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

export function renderParagraphs(markdown) {
  return String(markdown ?? "")
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${renderSafeInlineMarkdown(paragraph.replace(/\s*\n\s*/g, " "))}</p>`)
    .join("");
}
