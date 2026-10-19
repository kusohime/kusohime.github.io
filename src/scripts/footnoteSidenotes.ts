/**
 * Shared Markdown notes: retain margin notes on desktop and reveal a compact,
 * dismissible note panel when its marker is tapped on a phone. The source list
 * stays in the document for print and for the no-script fallback.
 */

// Keep links and emphasis when flattening a Markdown definition for a sidenote.
function inlineNoteContent(item: HTMLElement): Node[] {
  const clone = item.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("a[data-footnote-backref], .footnote-label")
    .forEach((node) => node.remove());

  const nodes: Node[] = [];
  clone.childNodes.forEach((child) => {
    if (child instanceof HTMLParagraphElement) {
      if (nodes.length > 0) nodes.push(document.createElement("br"));
      nodes.push(...Array.from(child.childNodes));
    } else {
      nodes.push(child);
    }
  });
  return nodes;
}

interface TapNote {
  ref: HTMLAnchorElement;
  sidenote: HTMLElement;
  label: string;
  originalAttributes: Map<string, string | null>;
}

const tapNotes: TapNote[] = [];
let tapFootnotesInitialized = false;

function setupTapFootnotes(): void {
  if (tapFootnotesInitialized || tapNotes.length === 0) return;
  tapFootnotesInitialized = true;

  const phoneQuery = window.matchMedia("(max-width: 40rem)");
  const panel = document.createElement("aside");
  panel.id = "tap-footnote-popover";
  panel.className = "footnote-popover";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-describedby", "tap-footnote-content");
  panel.tabIndex = -1;
  panel.hidden = true;

  const heading = document.createElement("div");
  heading.className = "footnote-popover-header";
  const number = document.createElement("span");
  number.className = "footnote-popover-number";
  number.setAttribute("aria-hidden", "true");
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "footnote-popover-close";
  closeButton.textContent = "×";
  heading.append(number, closeButton);

  const content = document.createElement("div");
  content.id = "tap-footnote-content";
  content.className = "footnote-popover-content prose";
  panel.append(heading, content);
  document.body.append(panel);

  let activeNote: TapNote | null = null;

  const close = (restoreFocus = false): void => {
    const opener = activeNote?.ref;
    activeNote?.ref.setAttribute("aria-expanded", "false");
    activeNote = null;
    panel.hidden = true;
    content.replaceChildren();
    if (restoreFocus) opener?.focus({ preventScroll: true });
  };

  const positionPanel = (): void => {
    if (!activeNote || panel.hidden) return;
    const gutter = 12;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const refRect = activeNote.ref.getBoundingClientRect();
    if (refRect.bottom < 0 || refRect.top > viewportHeight) {
      close();
      return;
    }

    panel.style.maxWidth = `${viewportWidth - gutter * 2}px`;
    panel.style.maxHeight = `${Math.max(100, viewportHeight - gutter * 2)}px`;
    const panelRect = panel.getBoundingClientRect();
    const left = Math.max(gutter, Math.min(
      refRect.left + refRect.width / 2 - panelRect.width / 2,
      viewportWidth - panelRect.width - gutter,
    ));
    const below = refRect.bottom + 8;
    const above = refRect.top - panelRect.height - 8;
    const top = below + panelRect.height <= viewportHeight - gutter
      ? below
      : Math.max(gutter, above);
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.min(top, viewportHeight - panelRect.height - gutter)}px`;
  };

  const open = (note: TapNote): void => {
    if (activeNote === note) {
      close(true);
      return;
    }
    close();
    activeNote = note;
    const isChinese = note.ref.closest('[data-lang="zh"]') !== null
      || document.documentElement.lang.startsWith("zh");
    panel.setAttribute("aria-label", `${isChinese ? "註釋" : "Footnote"} ${note.label}`);
    panel.lang = note.ref.closest<HTMLElement>("[lang]")?.lang
      || document.documentElement.lang;
    closeButton.setAttribute("aria-label", isChinese ? "關閉註釋" : "Close footnote");
    number.textContent = `(${note.label})`;
    // Clone at open time so enhanced CJK/Latin typography and citation links
    // match the visible edition, instead of reducing the note to plain text.
    Array.from(note.sidenote.childNodes).forEach((node) => {
      if (node instanceof Element && node.matches(".sidenote-num")) return;
      const clone = node.cloneNode(true);
      if (clone instanceof Element) {
        clone.removeAttribute("id");
        clone.querySelectorAll("[id]").forEach((child) => child.removeAttribute("id"));
      }
      content.append(clone);
    });
    note.ref.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    positionPanel();
    panel.focus({ preventScroll: true });
  };

  const syncMode = (): void => {
    close();
    tapNotes.forEach((note) => {
      const { ref } = note;
      if (phoneQuery.matches) {
        ref.setAttribute("role", "button");
        ref.setAttribute("tabindex", "0");
        ref.setAttribute("aria-haspopup", "dialog");
        ref.setAttribute("aria-controls", panel.id);
        ref.setAttribute("aria-expanded", "false");
        ref.removeAttribute("aria-describedby");
        const isChinese = ref.closest('[data-lang="zh"]') !== null
          || document.documentElement.lang.startsWith("zh");
        ref.setAttribute("aria-label", `${isChinese ? "註釋" : "Footnote"} ${note.label}`);
      } else {
        ["role", "tabindex", "aria-label", "aria-describedby"].forEach((attribute) => {
          const value = note.originalAttributes.get(attribute);
          if (value === null || value === undefined) ref.removeAttribute(attribute);
          else ref.setAttribute(attribute, value);
        });
        ["aria-haspopup", "aria-controls", "aria-expanded"]
          .forEach((attribute) => ref.removeAttribute(attribute));
      }
    });
  };

  tapNotes.forEach((note) => {
    note.ref.addEventListener("click", (event) => {
      if (!phoneQuery.matches) return;
      event.preventDefault();
      open(note);
    });
    note.ref.addEventListener("keydown", (event) => {
      if (!phoneQuery.matches || (event.key !== " " && event.key !== "Enter")) return;
      event.preventDefault();
      open(note);
    });
  });
  closeButton.addEventListener("click", () => close(true));
  document.addEventListener("pointerdown", (event) => {
    if (!activeNote || !(event.target instanceof Node)) return;
    if (panel.contains(event.target) || activeNote.ref.contains(event.target)) return;
    close();
  });
  document.addEventListener("focusin", (event) => {
    if (!activeNote || !(event.target instanceof Node)) return;
    if (!panel.contains(event.target) && !activeNote.ref.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (!activeNote || event.key !== "Escape") return;
    event.preventDefault();
    close(true);
  });
  document.addEventListener("yc-language-applied", syncMode);
  window.addEventListener("editionchange", () => close());
  window.addEventListener("resize", () => close(), { passive: true });
  window.addEventListener("orientationchange", () => close(), { passive: true });
  window.addEventListener("scroll", positionPanel, { passive: true, capture: true });
  phoneQuery.addEventListener("change", syncMode);
  syncMode();
}

// Resolve definitions across the whole prose: bilingual Markdown can collect
// both language blocks' notes in a shared list after those blocks.
function enhanceScope(scope: HTMLElement, prose: HTMLElement): void {
  const refs = scope.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]");
  const disableJumpLinks = prose.closest(".writing-title-page") !== null;
  let placed = 0;

  refs.forEach((ref) => {
    if (ref.dataset.footnoteEnhanced === "true") return;
    const marker = ref.closest("sup");
    const targetId = decodeURIComponent((ref.getAttribute("href") ?? "").replace(/^#/, ""));
    const item = document.getElementById(targetId);
    const content = item && prose.contains(item) ? inlineNoteContent(item) : null;
    if (!marker || !content) return;

    marker.classList.add("fn-ref");
    ref.dataset.footnoteEnhanced = "true";
    ref.classList.add("fn-tap-trigger");
    if (disableJumpLinks) {
      ref.removeAttribute("href");
      ref.removeAttribute("id");
    }

    const sidenote = document.createElement("span");
    sidenote.className = "sidenote";
    sidenote.setAttribute("role", "note");
    const number = document.createElement("sup");
    number.className = "sidenote-num";
    const label = ref.textContent?.trim() ?? "";
    number.textContent = label;
    sidenote.append(number);
    content.forEach((node) => sidenote.append(node.cloneNode(true)));
    marker.after(sidenote);

    tapNotes.push({
      ref,
      sidenote,
      label,
      originalAttributes: new Map(
        ["role", "tabindex", "aria-label", "aria-describedby"]
          .map((attribute) => [attribute, ref.getAttribute(attribute)]),
      ),
    });
    placed += 1;
  });

  if (placed > 0) prose.classList.add("has-sidenotes", "has-tap-footnotes");
}

function enhanceProse(prose: HTMLElement): void {
  const blocks = prose.querySelectorAll<HTMLElement>(":scope > .lang-block");
  if (blocks.length > 0) blocks.forEach((block) => enhanceScope(block, prose));
  else enhanceScope(prose, prose);
}

export function initializeFootnoteSidenotes(): void {
  document.querySelectorAll<HTMLElement>(".prose").forEach(enhanceProse);
  setupTapFootnotes();
}
