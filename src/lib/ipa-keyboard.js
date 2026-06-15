/**
 * An on-screen IPA keyboard, modelled on the music keyboard in keyboard.js
 * but caret-aware: it inserts symbols at the cursor of the most recently
 * focused registered field (via setRangeText) instead of only appending,
 * and remembers recently-used symbols in localStorage. Tabbed palettes,
 * live search, and an X-SAMPA ASCII toggle.
 */

import { PALETTES, xsampaToIpa } from "./ipa-data.js";

const STORE_KEY = "igt.ipa.recent";

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveRecent(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 24)));
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * @param {HTMLElement} host    empty container
 * @param {{ fields: Array<HTMLInputElement|HTMLTextAreaElement>,
 *           onInsert?: ()=>void }} opts
 */
export function mountIpaKeyboard(host, { fields, onInsert } = { fields: [] }) {
  if (!host || !fields || !fields.length) return;

  let target = fields[0];
  // Track caret of the last-focused field even after focus moves to a button.
  let savedStart = 0;
  let savedEnd = 0;
  const remember = (field) => {
    target = field;
    savedStart = field.selectionStart ?? field.value.length;
    savedEnd = field.selectionEnd ?? field.value.length;
  };
  fields.forEach((f) => {
    f.addEventListener("focus", () => remember(f));
    f.addEventListener("keyup", () => remember(f));
    f.addEventListener("click", () => remember(f));
  });

  let recent = loadRecent();

  const insert = (sym) => {
    if (!target) return;
    target.focus();
    const start = savedStart;
    const end = savedEnd;
    if (typeof target.setRangeText === "function") {
      target.setRangeText(sym, start, end, "end");
    } else {
      target.value =
        target.value.slice(0, start) + sym + target.value.slice(end);
    }
    savedStart = savedEnd = start + sym.length;
    target.dispatchEvent(new Event("input", { bubbles: true }));
    // record non-combining single symbols only
    if (sym.trim() && ![...recent].includes(sym)) {
      recent = [sym, ...recent.filter((s) => s !== sym)];
      saveRecent(recent);
      renderRecent();
    }
    onInsert?.();
  };

  // ---- structure ----
  const details = document.createElement("details");
  details.className = "ipa-kb";
  const summary = document.createElement("summary");
  summary.textContent = "IPA keyboard";
  details.append(summary);

  const tools = document.createElement("div");
  tools.className = "ipa-tools";
  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "Search by name…";
  search.className = "ipa-search";
  const xsampaWrap = document.createElement("label");
  xsampaWrap.className = "ipa-xsampa";
  const xsampaBox = document.createElement("input");
  xsampaBox.type = "text";
  xsampaBox.placeholder = "X-SAMPA → IPA";
  xsampaBox.size = 12;
  const xsampaBtn = document.createElement("button");
  xsampaBtn.type = "button";
  xsampaBtn.textContent = "Insert";
  xsampaWrap.append(xsampaBox, xsampaBtn);
  tools.append(search, xsampaWrap);

  const tabs = document.createElement("div");
  tabs.className = "ipa-tabs";
  const recentRow = document.createElement("div");
  recentRow.className = "ipa-recent";
  const grid = document.createElement("div");
  grid.className = "ipa-grid";

  details.append(tools, tabs, recentRow, grid);
  host.append(details);

  // ---- key buttons ----
  const keyButton = (sym, name, combining) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ipa-key" + (combining ? " ipa-combining" : "");
    b.textContent = combining ? "◌" + sym : sym;
    b.title = `${sym}  ${name}  (U+${sym
      .codePointAt(0)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0")})`;
    b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.addEventListener("click", () => insert(sym));
    return b;
  };

  let activeId = PALETTES[0].id;

  const renderGrid = (filter) => {
    grid.innerHTML = "";
    const q = (filter || "").trim().toLowerCase();
    const sources = q
      ? PALETTES
      : PALETTES.filter((p) => p.id === activeId);
    sources.forEach((p) => {
      p.keys.forEach(([sym, name]) => {
        if (q && !name.toLowerCase().includes(q) && sym !== q) return;
        grid.append(keyButton(sym, name, p.combining));
      });
    });
  };

  function renderRecent() {
    recentRow.innerHTML = "";
    if (!recent.length) {
      recentRow.hidden = true;
      return;
    }
    recentRow.hidden = false;
    const tag = document.createElement("span");
    tag.className = "ipa-recent-label";
    tag.textContent = "Recent";
    recentRow.append(tag);
    recent.forEach((s) => recentRow.append(keyButton(s, "recent", false)));
  }

  PALETTES.forEach((p) => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "ipa-tab";
    t.textContent = p.label;
    t.setAttribute("aria-pressed", String(p.id === activeId));
    t.addEventListener("pointerdown", (e) => e.preventDefault());
    t.addEventListener("click", () => {
      activeId = p.id;
      search.value = "";
      tabs.querySelectorAll(".ipa-tab").forEach((el) =>
        el.setAttribute("aria-pressed", String(el === t)),
      );
      renderGrid("");
    });
    tabs.append(t);
  });

  search.addEventListener("input", () => renderGrid(search.value));
  xsampaBtn.addEventListener("pointerdown", (e) => e.preventDefault());
  xsampaBtn.addEventListener("click", () => {
    if (xsampaBox.value) insert(xsampaToIpa(xsampaBox.value));
    xsampaBox.value = "";
  });
  xsampaBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (xsampaBox.value) insert(xsampaToIpa(xsampaBox.value));
      xsampaBox.value = "";
    }
  });

  renderRecent();
  renderGrid("");
}
